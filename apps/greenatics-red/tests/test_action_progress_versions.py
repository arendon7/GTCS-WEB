from __future__ import annotations
from conftest import rendered_decision_data

import hashlib
import re
import secrets
from uuid import uuid4

import pytest
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import AuditEvent, EvidenceFile, PMIRSItem, PMIRSItemRevision, Project
from app.storage import storage
from test_readiness import csrf_for, sign_in


@pytest.fixture
def progress_action(workspace):
    key = f"qa-progress-{uuid4()}.txt"
    content = b"Evidencia exclusivamente sintetica."
    storage.put_bytes(key, content, "text/plain")
    with SessionLocal() as session:
        project_id = workspace["project_ids"][0]
        session.get(Project, project_id).baseline_status = "validada"
        item = PMIRSItem(
            project_id=project_id, item_type="accion", code="A-QA-VERSION",
            title="Acción sintética", description="Solo práctica local.",
            data={"execution_status": "evidencia_cargada", "progress_pct": 100,
                  "assignee_user_ids": [workspace["user_ids"]["field"]]},
            review_status="VALIDATED", version=1,
            created_by=workspace["user_ids"]["consultant"], updated_by=workspace["user_ids"]["consultant"],
        )
        session.add(item)
        session.flush()
        session.add(EvidenceFile(
            project_id=project_id, pmirs_item_id=item.id, original_name="practica.txt",
            storage_name=key, media_type="text/plain", size_bytes=len(content),
            sha256=hashlib.sha256(content).hexdigest(), created_by=workspace["user_ids"]["field"],
        ))
        session.commit()
        result = {"id": item.id, "project_id": project_id}
    yield result
    storage.delete(key)


def payload(client, item, **changes):
    return {"csrf": csrf_for(client, f"/projects/{item['project_id']}/pmirs"),
            "expected_version": "1", "execution_status": "en_validacion", "progress_pct": "100",
            "progress_note": "Seguimiento sintético de prueba.", **changes}


@pytest.mark.parametrize("scenario", ["review", "close", "capture"])
def test_action_progress_rejects_a_stale_capture_review_or_close(client, progress_action, scenario):
    item = progress_action
    if scenario != "review":
        with SessionLocal() as session:
            row = session.get(PMIRSItem, item["id"])
            row.data = {**row.data, "execution_status": "validada" if scenario == "close" else "en_proceso"}
            session.commit()
    actor = "admin@red.test" if scenario == "close" else "field@red.test"
    state = {"review": "en_validacion", "close": "validada", "capture": "en_proceso"}[scenario]
    sign_in(client, actor)
    first = client.post(f"/pmirs/items/{item['id']}/progress", data=rendered_decision_data(client, f"/pmirs/items/{item['id']}/progress", payload(client, item, execution_status=state)), follow_redirects=False)
    assert first.status_code == 303, first.text
    client.cookies.clear()
    sign_in(client, {"review": "reviewer@red.test", "close": "consultant@red.test", "capture": "field@red.test"}[scenario])
    stale = payload(client, item, execution_status={"review": "validada", "close": "cerrada", "capture": "en_proceso"}[scenario],
                    close_reason="Cierre sintético con criterio.", progress_note="Nota obsoleta que no debe guardarse.")
    response = client.post(f"/pmirs/items/{item['id']}/progress", data=rendered_decision_data(client, f"/pmirs/items/{item['id']}/progress", stale), follow_redirects=False)
    assert response.status_code == 409, response.text
    with SessionLocal() as session:
        row = session.get(PMIRSItem, item["id"])
        assert row.version == 2 and row.data["execution_status"] == state
        revisions = list(session.scalars(select(PMIRSItemRevision).where(PMIRSItemRevision.item_id == item["id"])))
        assert len(revisions) == 1


def test_action_progress_replays_saved_key_but_rejects_a_new_stale_submission(client, progress_action):
    item = progress_action
    sign_in(client, "field@red.test")
    page = client.get(f"/projects/{item['project_id']}/pmirs")
    form = re.search(r'<form[^>]+action="/pmirs/items/' + item["id"] + r'/progress".*?</form>', page.text, re.S)
    assert form and 'name="expected_version" value="1"' in form.group()
    original = payload(client, item, submission_key=secrets.token_urlsafe(32))
    endpoint = f"/pmirs/items/{item['id']}/progress"
    assert client.post(endpoint, data=rendered_decision_data(client, endpoint, original), follow_redirects=False).status_code == 303
    replay = client.post(endpoint, data=rendered_decision_data(client, endpoint, original), follow_redirects=False)
    assert replay.status_code == 303 and "ya%20estaba%20guardado" in replay.headers["location"]
    changed = {**original, "submission_key": secrets.token_urlsafe(32), "progress_note": "Nuevo envío desde una página obsoleta."}
    assert client.post(endpoint, data=rendered_decision_data(client, endpoint, changed), follow_redirects=False).status_code == 409
    changed["expected_version"] = "2"
    assert client.post(endpoint, data=rendered_decision_data(client, endpoint, changed), follow_redirects=False).status_code == 303
    assert client.post(endpoint, data=rendered_decision_data(client, endpoint, original), follow_redirects=False).status_code == 303
    with SessionLocal() as session:
        assert session.get(PMIRSItem, item["id"]).version == 3
        events = list(session.scalars(select(AuditEvent).where(AuditEvent.action == "pmirs_action_progress")))
        assert len(events) == 2
        assert {event.detail["source_version"]: event.detail["version"] for event in events} == {1: 2, 2: 3}


def test_action_progress_rejects_a_change_after_read_before_persisting(client, progress_action, monkeypatch):
    item = progress_action
    sign_in(client, "reviewer@red.test")
    request_payload = payload(client, item, execution_status="validada")
    original_scalar = Session.scalar
    triggered = False

    def edit_before_evidence_count(session, statement, *args, **kwargs):
        nonlocal triggered
        if not triggered and "count(red_evidence_files.id)" in str(statement):
            triggered = True
            with SessionLocal() as other:
                row = other.get(PMIRSItem, item["id"])
                other.execute(update(PMIRSItem).where(PMIRSItem.id == item["id"]).values(
                    version=2, data={**row.data, "progress_note": "Cambio concurrente sintético."},
                ))
                other.commit()
        return original_scalar(session, statement, *args, **kwargs)

    monkeypatch.setattr(Session, "scalar", edit_before_evidence_count)
    response = client.post(f"/pmirs/items/{item['id']}/progress", data=rendered_decision_data(client, f"/pmirs/items/{item['id']}/progress", request_payload), follow_redirects=False)
    assert triggered and response.status_code == 409, response.text
    with SessionLocal() as session:
        row = session.get(PMIRSItem, item["id"])
        assert row.version == 2 and row.data["execution_status"] == "evidencia_cargada"
        assert row.data["progress_note"] == "Cambio concurrente sintético."
        assert session.scalar(select(PMIRSItemRevision).where(PMIRSItemRevision.item_id == item["id"])) is None


@pytest.mark.parametrize("version", [None, "0"])
def test_action_progress_requires_a_positive_displayed_version(client, progress_action, version):
    sign_in(client, "field@red.test")
    values = payload(client, progress_action)
    if version is None:
        values.pop("expected_version")
    else:
        values["expected_version"] = version
    endpoint = f"/pmirs/items/{progress_action['id']}/progress"
    submitted = rendered_decision_data(client, endpoint, values)
    if version is None:
        # The helper restores hidden fields from the rendered form; remove this
        # one again to exercise a genuinely missing version in the POST body.
        submitted.pop("expected_version", None)
    response = client.post(endpoint, data=submitted, follow_redirects=False)
    assert response.status_code == 422, response.text

    with SessionLocal() as session:
        current = session.get(PMIRSItem, progress_action["id"])
        assert current.version == 1
        assert current.data["execution_status"] == "evidencia_cargada"
        assert session.scalar(
            select(PMIRSItemRevision).where(PMIRSItemRevision.item_id == current.id)
        ) is None


def test_action_progress_version_does_not_grant_an_unassigned_field_user_access(client, progress_action):
    with SessionLocal() as session:
        row = session.get(PMIRSItem, progress_action["id"])
        row.data = {**row.data, "assignee_user_ids": []}
        session.commit()
    sign_in(client, "field@red.test")
    response = client.post(f"/pmirs/items/{progress_action['id']}/progress", data=rendered_decision_data(client, f"/pmirs/items/{progress_action['id']}/progress", payload(client, progress_action)), follow_redirects=False)
    assert response.status_code == 403
