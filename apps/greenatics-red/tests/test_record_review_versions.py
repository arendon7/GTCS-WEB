from __future__ import annotations
from conftest import rendered_decision_data
import re
import pytest
from sqlalchemy import select, update
from app import main as app_main
from app.db import SessionLocal
from app.models import AuditEvent, FormRecord, FormRevision
from test_readiness import csrf_for, sign_in

@pytest.fixture
def review_record(workspace):
    project_id = workspace['project_ids'][0]
    actor = workspace['user_ids']['consultant']
    with SessionLocal() as session:
        visit = FormRecord(project_id=project_id, form_code='D-03', title='Visita sintética', status='VALIDATED', payload={}, source_note='Solo prueba.', created_by=actor, updated_by=actor)
        session.add(visit)
        session.flush()
        payload = {'D12-001': visit.id, 'D12-002': 'Otro', 'D12-003': 'Incidencia sintética original.', 'D12-004': 'No', 'D12-008': 'Abierta'}
        record = FormRecord(project_id=project_id, form_code='D-12', title='Incidencia sintética', status='PENDING_REVIEW', payload=payload, source_note='Fuente sintética de prueba.', created_by=actor, updated_by=actor, version=1)
        session.add(record)
        session.commit()
        return {'id': record.id, 'project_id': project_id, 'payload': payload}

def review_payload(client, record, **overrides):
    return {'csrf': csrf_for(client, f"/records/{record['id']}"), 'expected_version': '1', 'decision': 'VALIDATED', 'reason': 'Revisión sintética para prueba.', **overrides}

@pytest.mark.parametrize('decision', ['VALIDATED', 'CORRECTION_REQUESTED'])
def test_record_review_rejects_stale_page_then_accepts_fresh_version(client, review_record, decision):
    record = review_record
    path = f"/records/{record['id']}"
    sign_in(client, 'reviewer@red.test')
    page = client.get(path)
    client.cookies.clear()
    sign_in(client, 'consultant@red.test')
    changed = client.post(path + '/edit', data={'csrf': csrf_for(client, path + '/edit'), 'action': 'submit', 'source_note': 'Fuente sintética corregida.', **record['payload'], 'D12-003': 'Contenido nuevo que requiere revisión.'}, follow_redirects=False)
    assert changed.status_code == 303, changed.text
    client.cookies.clear()
    sign_in(client, 'reviewer@red.test')
    response = client.post(path + '/review', data=rendered_decision_data(client, path + '/review', review_payload(client, record, decision=decision)), follow_redirects=False)
    assert response.status_code == 409, response.text
    with SessionLocal() as session:
        row = session.get(FormRecord, record['id'])
        assert row.version == 2 and row.status == 'PENDING_REVIEW' and (row.reviewed_by is None)
        assert row.payload['D12-003'] == 'Contenido nuevo que requiere revisión.'
        assert session.scalar(select(AuditEvent).where(AuditEvent.action == 'qa_decision')) is None
    form = re.search('<form[^>]+action="/records/' + record['id'] + '/review".*?</form>', page.text, re.S)
    assert form and 'name="expected_version" value="1"' in form.group()
    accepted = client.post(path + '/review', data=rendered_decision_data(client, path + '/review', review_payload(client, record, decision=decision, expected_version='2')), follow_redirects=False)
    assert accepted.status_code == 303, accepted.text
    with SessionLocal() as session:
        assert session.get(FormRecord, record['id']).status == decision
        event = session.scalar(select(AuditEvent).where(AuditEvent.action == 'qa_decision'))
        assert event.detail['source_version'] == 2 and event.detail['version'] == 2

@pytest.mark.parametrize('change', ['content', 'review'])
def test_record_review_rejects_change_during_validation(client, review_record, monkeypatch, change):
    record = review_record
    original = app_main.submission_errors

    def change_after_validation(*args, **kwargs):
        errors = original(*args, **kwargs)
        assert not errors
        values = {'version': 2, 'payload': {**record['payload'], 'D12-003': 'Nueva versión sintética.'}} if change == 'content' else {'status': 'CORRECTION_REQUESTED', 'review_note': 'Otro criterio vigente.'}
        with SessionLocal() as other:
            other.execute(update(FormRecord).where(FormRecord.id == record['id']).values(**values))
            other.commit()
        return errors
    sign_in(client, 'reviewer@red.test')
    payload = review_payload(client, record)
    monkeypatch.setattr(app_main, 'submission_errors', change_after_validation)
    response = client.post(f"/records/{record['id']}/review", data=rendered_decision_data(client, f"/records/{record['id']}/review", payload), follow_redirects=False)
    assert response.status_code == 409, response.text
    with SessionLocal() as session:
        row = session.get(FormRecord, record['id'])
        if change == 'content':
            assert row.version == 2 and row.status == 'PENDING_REVIEW'
            assert row.payload['D12-003'] == 'Nueva versión sintética.'
        else:
            assert row.status == 'CORRECTION_REQUESTED' and row.review_note == 'Otro criterio vigente.'
        assert session.scalar(select(AuditEvent).where(AuditEvent.action == 'qa_decision')) is None

@pytest.mark.parametrize('stale', [True, False])
def test_q01_review_attribution_is_atomic_with_the_source_version(client, review_record, stale):
    record = review_record
    with SessionLocal() as session:
        row = session.get(FormRecord, record['id'])
        row.form_code = 'Q-01'
        row.payload = {'Q01-011': 'Valor sintético previo'}
        row.version = 2 if stale else 1
        session.commit()
    sign_in(client, 'reviewer@red.test')
    response = client.post(f"/records/{record['id']}/review", data=rendered_decision_data(client, f"/records/{record['id']}/review", review_payload(client, record, decision='CORRECTION_REQUESTED')), follow_redirects=False)
    assert response.status_code == (409 if stale else 303), response.text
    with SessionLocal() as session:
        row = session.get(FormRecord, record['id'])
        revisions = list(session.scalars(select(FormRevision).where(FormRevision.record_id == record['id'])))
        event = session.scalar(select(AuditEvent).where(AuditEvent.action == 'qa_decision'))
        if stale:
            assert row.payload['Q01-011'] == 'Valor sintético previo' and row.status == 'PENDING_REVIEW'
            assert row.reviewed_by is None and (not revisions) and (event is None)
        else:
            assert row.payload['Q01-011'] == 'Revisor (reviewer@red.test)' and row.version == 2
            assert len(revisions) == 1 and revisions[0].revision == 2
            assert event.detail['source_version'] == 1 and event.detail['version'] == 2

@pytest.mark.parametrize('version', [None, '0'])
def test_record_review_requires_a_displayed_version(client, review_record, version):
    sign_in(client, 'reviewer@red.test')
    payload = review_payload(client, review_record, decision='CORRECTION_REQUESTED')
    if version is None:
        payload.pop('expected_version')
    else:
        payload['expected_version'] = version
    response = client.post(f"/records/{review_record['id']}/review", data=rendered_decision_data(client, f"/records/{review_record['id']}/review", payload), follow_redirects=False)
    assert response.status_code == 422, response.text
    with SessionLocal() as session:
        assert session.get(FormRecord, review_record['id']).status == 'PENDING_REVIEW'

def test_record_review_version_does_not_grant_another_project(client, review_record, workspace):
    sign_in(client, 'reviewer@red.test')
    payload = review_payload(client, review_record)
    with SessionLocal() as session:
        session.get(FormRecord, review_record['id']).project_id = workspace['project_ids'][1]
        session.commit()
    response = client.post(f"/records/{review_record['id']}/review", data=rendered_decision_data(client, f"/records/{review_record['id']}/review", payload), follow_redirects=False)
    assert response.status_code == 404
    with SessionLocal() as session:
        row = session.get(FormRecord, review_record["id"])
        assert row.status == "PENDING_REVIEW" and row.reviewed_by is None

def test_record_review_version_does_not_grant_a_consultant_qa_permission(client, review_record):
    sign_in(client, 'consultant@red.test')
    response = client.post(f"/records/{review_record['id']}/review", data=rendered_decision_data(client, f"/records/{review_record['id']}/review", review_payload(client, review_record)), follow_redirects=False)
    assert response.status_code == 403
