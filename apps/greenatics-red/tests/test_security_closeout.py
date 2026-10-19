from __future__ import annotations
import hashlib
import io
import json
import re
import struct
import zipfile
import zlib
import pytest
from sqlalchemy import select
from app import main as m, backups
from app.db import SessionLocal
from app.models import FormRecord, FormSignature, PMIRSItem, Project, EvidenceFile, AuditEvent
from conftest import PASSWORD
from test_readiness import sign_in, csrf_for
from test_action_progress_versions import progress_action
from test_pmirs_review_versions import review_item


@pytest.fixture
def signing_record(workspace):
    with SessionLocal() as s:
        row = FormRecord(project_id=workspace['project_ids'][0], form_code='D-03', title='DEMO',
            status='RAW', payload={}, source_note='Sintético', created_by=workspace['user_ids']['field'],
            updated_by=workspace['user_ids']['field'])
        s.add(row)
        s.commit()
        return row.id


def sign_payload(client, record_id):
    with SessionLocal() as s:
        row = s.get(FormRecord, record_id)
        rows = list(s.scalars(select(EvidenceFile).where(EvidenceFile.record_id == row.id)))
        digest = m.form_record_document_sha256(s.get(Project, row.project_id), row, rows)
        version = row.version
    return {'csrf': csrf_for(client, f'/records/{record_id}'), 'expected_version': str(version),
        'expected_document_sha256': digest, 'password': PASSWORD, 'confirm_signature': 'yes',
        'signature_strokes': json.dumps([[[.1, .2], [.8, .7]]])}


@pytest.mark.parametrize('change', ['version', 'evidence', 'identity'])
def test_sign_rejects_unseen_content_then_accepts_refreshed(client, workspace, signing_record, change):
    sign_in(client, 'field@red.test')
    data = sign_payload(client, signing_record)
    with SessionLocal() as s:
        row = s.get(FormRecord, signing_record)
        if change == 'version':
            row.version += 1
            row.title = 'Contenido posterior'
        elif change == 'identity':
            s.get(Project, row.project_id).name = 'Identidad posterior'
        else:
            s.add(EvidenceFile(project_id=row.project_id, record_id=row.id, original_name='DEMO.txt',
                storage_name='DEMO.txt', media_type='text/plain', size_bytes=1,
                sha256=hashlib.sha256(b'x').hexdigest(), created_by=workspace['user_ids']['field']))
        s.commit()
    response = client.request('POST', f'/records/{signing_record}/sign', data=data, follow_redirects=False)
    assert response.status_code == 409
    with SessionLocal() as s:
        assert s.scalar(select(FormSignature).where(FormSignature.record_id == signing_record)) is None
        assert s.scalar(select(AuditEvent).where(AuditEvent.action == 'form_record_signed')) is None
    response = client.request('POST', f'/records/{signing_record}/sign', data=sign_payload(client, signing_record), follow_redirects=False)
    assert response.status_code == 303, response.text


@pytest.mark.parametrize('missing', ['expected_version', 'expected_document_sha256'])
def test_sign_requires_snapshot_contract(client, signing_record, missing):
    sign_in(client, 'field@red.test')
    data = sign_payload(client, signing_record)
    del data[missing]
    assert client.request('POST', f'/records/{signing_record}/sign', data=data).status_code == 422


def test_signature_form_carries_displayed_hash(client, signing_record):
    sign_in(client, 'field@red.test')
    data = sign_payload(client, signing_record)
    html = client.get(f'/records/{signing_record}').text
    assert f'name="expected_document_sha256" value="{data["expected_document_sha256"]}"' in html


@pytest.mark.parametrize('state', ['validada', 'cerrada'])
@pytest.mark.parametrize('new', [True, False])
def test_design_cannot_inject_execution_approval(client, workspace, state, new):
    project_id = workspace['project_ids'][0]
    with SessionLocal() as s:
        row = PMIRSItem(project_id=project_id, item_type='accion', code='A-DEMO', title='Acción',
            description='Sintética', data={'execution_status':'en_proceso', 'progress_pct':20},
            created_by=workspace['user_ids']['consultant'], updated_by=workspace['user_ids']['consultant'])
        s.add(row)
        s.commit()
        item_id = row.id
    sign_in(client, 'consultant@red.test')
    path = f'/projects/{project_id}/pmirs/items/new' if new else f'/pmirs/items/{item_id}/edit'
    response = client.post(path, data={'csrf':csrf_for(client, f'/projects/{project_id}/pmirs'),
        'item_type':'accion', 'title':'Acción nueva', 'description':'Práctica', 'action':'draft',
        'execution_status':state, 'progress_pct':'100', 'close_reason':'Manipulado'}, follow_redirects=False)
    assert response.status_code == 303, response.text
    with SessionLocal() as s:
        row = s.scalar(select(PMIRSItem).where(PMIRSItem.title == 'Acción nueva'))
        assert row.data['execution_status'] == ('pendiente' if new else 'en_proceso')
        assert row.data['progress_pct'] == (0 if new else 20)


def test_source_edit_same_weight_invalidates_derived_approval(client, workspace):
    project_id = workspace['project_ids'][0]
    actor = workspace['user_ids']['consultant']
    with SessionLocal() as s:
        source = FormRecord(project_id=project_id, form_code='D-07', title='Pesaje DEMO', status='VALIDATED',
            payload={'D07-005':'0', 'D07-006':'10', 'D07-007':'10'}, created_by=actor, updated_by=actor)
        s.add(source)
        s.flush()
        fraction = FormRecord(project_id=project_id, form_code='D-08', title='Fracción DEMO', status='RAW',
            payload={'D08-001':source.id, 'D08-003':'Orgánicos', 'D08-005':'10'}, created_by=actor, updated_by=actor)
        s.add(fraction)
        s.flush()
        m.recalculate_d08_group(s, source.id, project_id=project_id, actor_id=actor)
        fraction.status = 'VALIDATED'
        fraction.reviewed_by = workspace['user_ids']['reviewer']
        s.commit()
        source_id, fraction_id, version = source.id, fraction.id, fraction.version
        old_hash = m.form_record_document_sha256(s.get(Project, project_id), fraction, [])
    sign_in(client, 'consultant@red.test')
    response = client.post(f'/records/{source_id}/edit', data={'csrf':csrf_for(client, f'/records/{source_id}/edit'),
        'action':'draft', 'source_note':'Fuente corregida sintética', 'D07-005':'0', 'D07-006':'10',
        'D07-011':'Nuevo soporte, mismo peso'}, follow_redirects=False)
    assert response.status_code == 303, response.text
    with SessionLocal() as s:
        source, fraction = s.get(FormRecord, source_id), s.get(FormRecord, fraction_id)
        assert source.payload['D07-007'] == '10'
        assert fraction.status == 'CORRECTION_REQUESTED' and fraction.reviewed_by is None
        assert fraction.version > version
        assert m.form_record_document_sha256(s.get(Project, project_id), fraction, []) != old_hash
        assert fraction.payload['_red_d07_source_version'] == source.version


@pytest.mark.parametrize('method', [zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED])
def test_metadata_real_expansion_is_bounded(method, monkeypatch):
    raw = io.BytesIO()
    with zipfile.ZipFile(raw, 'w', compression=method) as archive:
        archive.writestr('manifest.json', b'A' * (3 * 1024 * 1024))
        archive.writestr('database.json', b'{}')
    blob = bytearray(raw.getvalue())
    struct.pack_into('<L', blob, blob.index(b'PK\x03\x04') + 22, 8)
    struct.pack_into('<L', blob, blob.index(b'PK\x01\x02') + 24, 8)
    if method == zipfile.ZIP_DEFLATED:
        original = zlib.decompressobj
        class Decoder:
            def __init__(self, *args): self.real = original(*args)
            def decompress(self, data, max_length=0):
                assert 0 < max_length <= 64 * 1024
                return self.real.decompress(data, max_length)
            def __getattr__(self, name): return getattr(self.real, name)
        monkeypatch.setattr(zlib, 'decompressobj', Decoder)
    with pytest.raises(ValueError, match='tamaño real'):
        backups.verify_backup_archive(bytes(blob))


@pytest.mark.parametrize('method', [zipfile.ZIP_BZIP2, zipfile.ZIP_LZMA])
def test_backup_rejects_unbounded_compression(method):
    raw = io.BytesIO()
    with zipfile.ZipFile(raw, 'w', compression=method) as archive:
        archive.writestr('manifest.json', b'{}')
        archive.writestr('database.json', b'{}')
    with pytest.raises(ValueError, match='compresión'):
        backups.verify_backup_archive(raw.getvalue())


@pytest.mark.parametrize('change', ['evidence', 'identity'])
def test_action_decision_rejects_same_version_changed_context(client, workspace, progress_action, change):
    item_id = progress_action['id']
    project_id = progress_action['project_id']
    sign_in(client, 'reviewer@red.test')
    page = client.get(f'/projects/{project_id}/pmirs')
    form = re.search(r'<form[^>]+action="/pmirs/items/' + item_id + r'/progress".*?</form>', page.text, re.S)
    assert form
    digest = re.search(r'name="expected_document_sha256" value="([^"]+)"', form.group()).group(1)
    data = {'csrf':csrf_for(client, f'/projects/{project_id}/pmirs'), 'expected_version':'1',
        'expected_document_sha256':digest, 'execution_status':'validada', 'progress_pct':'100',
        'progress_note':'Criterio de revisión sintético.'}
    with SessionLocal() as s:
        if change == 'identity':
            s.get(Project, project_id).name = 'Identidad actualizada'
        else:
            evidence = s.scalar(select(EvidenceFile).where(EvidenceFile.pmirs_item_id == item_id))
            evidence.sha256 = '0' * 64
        s.commit()
    response = client.request('POST', f'/pmirs/items/{item_id}/progress', data=data, follow_redirects=False)
    assert response.status_code == 409
    with SessionLocal() as s:
        assert s.get(PMIRSItem, item_id).version == 1
        assert s.get(PMIRSItem, item_id).data['execution_status'] == 'evidencia_cargada'
        assert s.scalar(select(AuditEvent).where(AuditEvent.action == 'pmirs_action_progress')) is None


def test_design_edit_reopens_historical_execution(client, workspace):
    project_id = workspace['project_ids'][0]
    with SessionLocal() as s:
        row = PMIRSItem(project_id=project_id, item_type='accion', code='A-OLD', title='Cierre anterior',
            description='DEMO', data={'execution_status':'cerrada', 'progress_pct':100}, review_status='VALIDATED',
            created_by=workspace['user_ids']['consultant'], updated_by=workspace['user_ids']['consultant'])
        s.add(row)
        s.commit()
        item_id = row.id
    sign_in(client, 'consultant@red.test')
    response = client.post(f'/pmirs/items/{item_id}/edit', data={'csrf':csrf_for(client, f'/projects/{project_id}/pmirs'),
        'title':'Diseño corregido', 'action':'draft'}, follow_redirects=False)
    assert response.status_code == 303
    with SessionLocal() as s:
        row = s.get(PMIRSItem, item_id)
        assert row.data['execution_status'] == 'requiere_correccion' and row.review_status == 'RAW'


@pytest.mark.parametrize('source_status', ['RAW', 'VALIDATED'])
@pytest.mark.parametrize('format_name', ['html', 'pdf', 'docx'])
def test_legacy_unbound_fraction_does_not_export_current_approval(client, workspace, source_status, format_name):
    project_id = workspace['project_ids'][0]
    actor = workspace['user_ids']['reviewer']
    with SessionLocal() as s:
        source = FormRecord(project_id=project_id, form_code='D-07', title='Fuente histórica', status=source_status,
            version=2, payload={'D07-007':'10'}, created_by=actor, updated_by=actor)
        s.add(source)
        s.flush()
        row = FormRecord(project_id=project_id, form_code='D-08', title='Fracción histórica', status='VALIDATED',
            payload={'D08-001':source.id, 'D08-005':'10'}, source_note='Fuente sintética de prueba histórica.', created_by=actor, updated_by=actor)
        s.add(row)
        s.flush()
        snapshot = m.form_record_document_snapshot(s.get(Project, project_id), row, [])
        s.add(FormSignature(project_id=project_id, record_id=row.id, record_version=row.version,
            signer_user_id=actor, signer_name='Firmante legado DEMO', signer_email='legacy@red.test', signer_role='revisor',
            declaration='Constancia de prueba', signature_path='M48.00,126.00 L192.00,63.00',
            document_sha256=m.form_record_snapshot_sha256(snapshot), document_snapshot=snapshot, snapshot_status='verified'))
        s.commit()
        record_id = row.id
        assert 'D-08' in m.baseline_missing_forms(s, project_id)
        errors = m.pmirs_submission_errors(s, project_id, 'hallazgo', 'Hallazgo DEMO', 'Descripción sintética', {
            'topic':'Separación', 'support_level':'C', 'priority':'media', 'priority_reason':'Criterio sintético.',
            'lifecycle_status':'abierto', 'source_record_ids':[row.id], '_require_valid_relations':True})
        assert any('formularios revisados como válidos' in error for error in errors)
    sign_in(client, 'reviewer@red.test')
    page = client.get(f'/records/{record_id}')
    assert 'Revisión no vigente' in page.text
    suffix = '' if format_name == 'html' else '.' + format_name
    response = client.get(f'/records/{record_id}/export{suffix}')
    assert response.status_code == 200
    if format_name == 'html':
        text = response.text
    elif format_name == 'pdf':
        from pypdf import PdfReader
        text = '\n'.join(page.extract_text() or '' for page in PdfReader(io.BytesIO(response.content)).pages)
    else:
        with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
            text = archive.read('word/document.xml').decode()
    assert 'Revisión no vigente' in text
    assert 'Firmante legado DEMO' not in text
    with SessionLocal() as s:
        event = s.scalar(select(AuditEvent).where(AuditEvent.action == 'form_record_exported'))
        assert event.detail['signature_count'] == 0 and event.detail['signatures_valid'] is False


def test_review_rechecks_baseline_changed_during_validation(client, review_item, monkeypatch):
    sign_in(client, 'reviewer@red.test')
    item_id, project_id = review_item['id'], review_item['project_id']
    page = client.get(f'/projects/{project_id}/pmirs')
    form = re.search(r'<form[^>]+action="/pmirs/items/' + item_id + r'/review".*?</form>', page.text, re.S)
    assert form
    token = re.search(r'name="expected_document_sha256" value="([^"]+)"', form.group())
    assert token
    data = {'csrf':csrf_for(client, f'/projects/{project_id}/pmirs'), 'expected_version':'1',
        'expected_document_sha256':token.group(1), 'decision':'validar', 'reason':'Criterio DEMO.'}
    original = m.pmirs_submission_errors
    def change_baseline(*args, **kwargs):
        errors = original(*args, **kwargs)
        with SessionLocal() as s:
            s.get(Project, project_id).baseline_status = 'requiere_revision'
            s.commit()
        return errors
    monkeypatch.setattr(m, 'pmirs_submission_errors', change_baseline)
    response = client.request('POST', f'/pmirs/items/{item_id}/review', data=data, follow_redirects=False)
    assert response.status_code == 409
    with SessionLocal() as s:
        assert s.get(PMIRSItem, item_id).review_status == 'PENDING_REVIEW'
        assert s.scalar(select(AuditEvent).where(AuditEvent.action == 'pmirs_item_reviewed')) is None
    # Returning to correction remains legitimate even with the baseline blocked.
    data.update(decision='corregir', reason='Corregir tras cambio de Línea Base.')
    response = client.request('POST', f'/pmirs/items/{item_id}/review', data=data, follow_redirects=False)
    assert response.status_code == 303


@pytest.mark.parametrize('method', [zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED])
@pytest.mark.parametrize('size', [0, 65536, 65537, 1024 * 1024])
def test_bounded_metadata_preserves_legitimate_chunk_boundaries(method, size):
    from app.backup_metadata import read_metadata
    contents = b'A' * size
    raw = io.BytesIO()
    with zipfile.ZipFile(raw, 'w', compression=method) as archive:
        archive.writestr('manifest.json', contents)
    with zipfile.ZipFile(io.BytesIO(raw.getvalue())) as archive:
        assert read_metadata(archive, 'manifest.json', size) == contents
