from __future__ import annotations
from conftest import rendered_decision_data

import re

import pytest
from sqlalchemy import select, update

from app import main as app_main
from app.db import SessionLocal
from app.models import AuditEvent, FormRecord, PMIRSItem, Project
from test_readiness import csrf_for, sign_in


@pytest.fixture
def review_item(workspace):
    project_id = workspace["project_ids"][0]
    actor_id = workspace["user_ids"]["consultant"]
    with SessionLocal() as session:
        session.get(Project, project_id).baseline_status = "validada"
        source = FormRecord(
            project_id=project_id, form_code="D-01", title="Fuente sintética",
            status="VALIDATED", payload={}, source_note="Solo prueba local.",
            created_by=actor_id, updated_by=actor_id,
        )
        session.add(source)
        session.flush()
        data = {
            "topic": "Separación", "support_level": "C", "priority": "media",
            "priority_reason": "Criterio sintético de prioridad.",
            "lifecycle_status": "abierto", "source_record_ids": [source.id],
        }
        item = PMIRSItem(
            project_id=project_id, item_type="hallazgo", code="H-QA-001",
            title="Contenido sintético original", description="Criterio sintético original.",
            data=data, review_status="PENDING_REVIEW", version=1,
            created_by=actor_id, updated_by=actor_id,
        )
        session.add(item)
        session.commit()
        return {"id": item.id, "project_id": project_id, "data": data}


def review_payload(client, item, **overrides):
    return {
        "csrf": csrf_for(client, f"/projects/{item['project_id']}/pmirs"),
        "expected_version": "1", "decision": "validar",
        "reason": "Revisado solo como ejercicio sintético.", **overrides,
    }


@pytest.mark.parametrize("decision", ["validar", "corregir"])
def test_pmirs_review_rejects_stale_page_after_consultant_resubmits(client, review_item, decision):
    item = review_item
    path = f"/projects/{item['project_id']}/pmirs"
    sign_in(client, "reviewer@red.test")
    page = client.get(path)
    payload = review_payload(client, item, decision=decision)
    client.cookies.clear()
    sign_in(client, "consultant@red.test")
    changed = client.post(
        f"/pmirs/items/{item['id']}/edit",
        data={"csrf": csrf_for(client, path), "action": "submit",
              "title": "Contenido sintético actualizado", "description": "Otro criterio a revisar.",
              **item["data"]}, follow_redirects=False,
    )
    assert changed.status_code == 303, changed.text
    client.cookies.clear()
    sign_in(client, "reviewer@red.test")
    # The displayed version remains old, even though the session is current.
    payload["csrf"] = csrf_for(client, path)
    response = client.post(f"/pmirs/items/{item['id']}/review", data=rendered_decision_data(client, f"/pmirs/items/{item['id']}/review", payload), follow_redirects=False)
    assert response.status_code == 409, response.text
    with SessionLocal() as session:
        current = session.get(PMIRSItem, item["id"])
        assert current.version == 2 and current.review_status == "PENDING_REVIEW"
        assert current.reviewed_by is None and current.reviewed_at is None
        assert current.title == "Contenido sintético actualizado"
        assert session.scalar(select(AuditEvent).where(AuditEvent.action == "pmirs_item_reviewed")) is None
    form = re.search(r'<form[^>]+action="/pmirs/items/' + item["id"] + r'/review".*?</form>', page.text, re.S)
    assert form and 'name="expected_version" value="1"' in form.group()
    fresh = client.post(
        f"/pmirs/items/{item['id']}/review",
        data=rendered_decision_data(client, f"/pmirs/items/{item['id']}/review", review_payload(client, item, expected_version="2", decision=decision)), follow_redirects=False,
    )
    assert fresh.status_code == 303, fresh.text
    with SessionLocal() as session:
        current = session.get(PMIRSItem, item["id"])
        assert current.review_status == ("VALIDATED" if decision == "validar" else "CORRECTION_REQUESTED")
        assert current.version == 2 and current.title == "Contenido sintético actualizado"
        event = session.scalar(select(AuditEvent).where(AuditEvent.action == "pmirs_item_reviewed"))
        assert event.detail["version"] == 2


def test_pmirs_review_rejects_change_between_validation_and_commit(client, review_item, monkeypatch):
    item = review_item
    original = app_main.pmirs_submission_errors

    def edit_after_validation(*args, **kwargs):
        errors = original(*args, **kwargs)
        assert not errors
        with SessionLocal() as other:
            other.execute(update(PMIRSItem).where(PMIRSItem.id == item["id"]).values(
                version=2, title="Versión concurrente sintética", review_status="PENDING_REVIEW",
            ))
            other.commit()
        return errors

    monkeypatch.setattr(app_main, "pmirs_submission_errors", edit_after_validation)
    sign_in(client, "reviewer@red.test")
    response = client.post(
        f"/pmirs/items/{item['id']}/review", data=rendered_decision_data(client, f"/pmirs/items/{item['id']}/review", review_payload(client, item)), follow_redirects=False,
    )
    assert response.status_code == 409, response.text
    with SessionLocal() as session:
        current = session.get(PMIRSItem, item["id"])
        assert current.version == 2 and current.review_status == "PENDING_REVIEW"
        assert current.title == "Versión concurrente sintética" and current.reviewed_by is None
        assert session.scalar(select(AuditEvent).where(AuditEvent.action == "pmirs_item_reviewed")) is None


@pytest.mark.parametrize("version", [None, "0", "-1", "texto"])
def test_pmirs_review_requires_a_positive_displayed_version(client, review_item, version):
    sign_in(client, "reviewer@red.test")
    payload = review_payload(client, review_item)
    if version is None:
        payload.pop("expected_version")
    else:
        payload["expected_version"] = version
    response = client.post(f"/pmirs/items/{review_item['id']}/review", data=rendered_decision_data(client, f"/pmirs/items/{review_item['id']}/review", payload), follow_redirects=False)
    assert response.status_code == 422, response.text
    with SessionLocal() as session:
        current = session.get(PMIRSItem, review_item["id"])
        assert current.review_status == "PENDING_REVIEW" and current.reviewed_by is None


def test_pmirs_review_does_not_overwrite_another_review_during_validation(client, review_item, monkeypatch):
    item = review_item
    original = app_main.pmirs_submission_errors

    def other_review_after_validation(*args, **kwargs):
        errors = original(*args, **kwargs)
        assert not errors
        with SessionLocal() as other:
            other.execute(update(PMIRSItem).where(PMIRSItem.id == item["id"]).values(
                review_status="CORRECTION_REQUESTED", review_note="Otra revisión sintética vigente.",
            ))
            other.commit()
        return errors

    monkeypatch.setattr(app_main, "pmirs_submission_errors", other_review_after_validation)
    sign_in(client, "reviewer@red.test")
    response = client.post(
        f"/pmirs/items/{item['id']}/review", data=rendered_decision_data(client, f"/pmirs/items/{item['id']}/review", review_payload(client, item)), follow_redirects=False,
    )
    assert response.status_code == 409, response.text
    with SessionLocal() as session:
        current = session.get(PMIRSItem, item["id"])
        assert current.version == 1 and current.review_status == "CORRECTION_REQUESTED"
        assert current.review_note == "Otra revisión sintética vigente."
        assert session.scalar(select(AuditEvent).where(AuditEvent.action == "pmirs_item_reviewed")) is None


@pytest.mark.parametrize("email", ["consultant@red.test", "field@red.test", "reader@red.test"])
def test_pmirs_review_version_does_not_grant_review_permission(client, review_item, email):
    sign_in(client, email)
    response = client.post(
        f"/pmirs/items/{review_item['id']}/review", data=rendered_decision_data(client, f"/pmirs/items/{review_item['id']}/review", review_payload(client, review_item)), follow_redirects=False,
    )
    assert response.status_code == 403
    with SessionLocal() as session:
        assert session.get(PMIRSItem, review_item["id"]).review_status == "PENDING_REVIEW"
