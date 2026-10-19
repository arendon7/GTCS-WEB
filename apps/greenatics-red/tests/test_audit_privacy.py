import hashlib
import io
import json
import zipfile
from datetime import timedelta

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app import backups
from app.db import Base, SessionLocal
from app.main import audit
from app.models import AuditEvent, Invitation, now_utc


def add_sensitive_invitation(session, workspace):
    invitation = Invitation(
        email="invited.person@example.test", full_name="Persona invitada sintética",
        project_id=workspace["project_ids"][0], role="campo", platform_admin=False,
        token_hash=hashlib.sha256(b"legacy-synthetic-invitation-token").hexdigest(),
        created_by=workspace["user_ids"]["admin"], expires_at=now_utc() + timedelta(days=7),
    )
    session.add(invitation)
    session.flush()
    return invitation


@pytest.mark.parametrize(
    ("action", "detail", "private_fields"),
    [
        ("baseline_decision", {"from_status": "no_iniciada", "to_status": "validada", "reference": "LB-RESIDENTES-01", "reason": "Residentes identificados: nombre y apartamento"}, {"reference", "reason"}),
        ("baseline_invalidated", {"source": "cambio de revisión", "reason": "Contacto: persona@example.test"}, {"reason"}),
        ("drive_connected", {"email": "persona@example.test", "folder_id": "drive-folder-id", "connected": True}, {"email", "folder_id"}),
        ("evidence_removed", {"field_id": "D07-010", "name": "residente-apt-301.jpg", "reason": "Documento visible"}, {"name", "reason"}),
        ("evidence_uploaded", {"field_id": "D07-010", "name": "residente-apt-301.jpg", "size_bytes": 128}, {"name"}),
        ("pmirs_action_progress", {"to_status": "en_proceso", "progress_pct": 30, "note": "Llamar a residente al 3001234567"}, {"note"}),
        ("pmirs_item_reviewed", {"to_status": "CORRECTION_REQUESTED", "reason": "Revisar el dato de la persona"}, {"reason"}),
        ("pmirs_version_created", {"version": "v2", "reason": "Cambios con nombres de residentes"}, {"reason"}),
        ("pmirs_version_obsoleted", {"to_status": "obsoleta", "reason": "Contacto persona@example.test"}, {"reason"}),
        ("pmirs_version_status_changed", {"to_status": "compartida_ph", "note": "Entregado a nombre de la residente"}, {"note"}),
        ("qa_decision", {"to_status": "CORRECTION_REQUESTED", "reason": "Eliminar foto con rostro"}, {"reason"}),
        ("user_invited", {"role": "campo", "email": "operario@example.test"}, {"email"}),
    ],
)
def test_audit_drops_duplicate_free_text_and_identifiers(action, detail, private_fields):
    original = dict(detail)
    with Session() as session:
        audit(
            session,
            project_id="synthetic-project",
            actor_id="synthetic-user",
            action=action,
            entity_type="synthetic",
            entity_id="synthetic-entity",
            detail=detail,
        )
        event = next(iter(session.new))

        assert event.detail == {key: value for key, value in detail.items() if key not in private_fields}
        assert detail == original


def test_audit_preserves_structured_review_metadata():
    detail = {"from_status": "PENDING_REVIEW", "to_status": "VALIDATED", "version": 3}
    with Session() as session:
        audit(
            session,
            project_id="synthetic-project",
            actor_id="synthetic-reviewer",
            action="qa_decision",
            entity_type="form_record",
            entity_id="synthetic-record",
            detail=detail,
        )
        event = next(iter(session.new))

        assert event.detail == detail


def test_backup_redacts_legacy_audit_details_without_mutating_source(workspace):
    with SessionLocal() as session:
        invitation = add_sensitive_invitation(session, workspace)
        event = AuditEvent(
            project_id=workspace["project_ids"][0], actor_id=workspace["user_ids"]["reviewer"],
            action="qa_decision", entity_type="form_record", entity_id="synthetic-record",
            detail={"from_status": "PENDING_REVIEW", "to_status": "CORRECTION_REQUESTED", "reason": "Persona residente en apartamento 301"},
        )
        session.add(event)
        session.commit()
        event_id = event.id
        invitation_id = invitation.id

        archive_bytes, _counts = backups.build_backup_archive(session)

        assert session.get(AuditEvent, event_id).detail["reason"] == "Persona residente en apartamento 301"
        assert session.get(Invitation, invitation_id).email == "invited.person@example.test"
        assert session.get(Invitation, invitation_id).full_name == "Persona invitada sintética"

    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        database = json.loads(archive.read("database.json"))
    exported_event = next(row for row in database["audit_events"] if row["id"] == event_id)
    assert exported_event["detail"] == {
        "from_status": "PENDING_REVIEW", "to_status": "CORRECTION_REQUESTED",
    }
    archived_invitation = next(row for row in database["invitations"] if row["id"] == invitation_id)
    assert archived_invitation["email"] == "archived-invitation@red.invalid"
    assert archived_invitation["full_name"] == "Invitación archivada"


def test_restore_redacts_sensitive_details_in_legacy_backup(workspace, tmp_path):
    with SessionLocal() as session:
        invitation = add_sensitive_invitation(session, workspace)
        event = AuditEvent(
            project_id=workspace["project_ids"][0], actor_id=workspace["user_ids"]["reviewer"],
            action="qa_decision", entity_type="form_record", entity_id="synthetic-record",
            detail={"from_status": "PENDING_REVIEW", "to_status": "CORRECTION_REQUESTED"},
        )
        session.add(event)
        session.commit()
        event_id = event.id
        invitation_id = invitation.id
        archive_bytes, _counts = backups.build_backup_archive(session)

    entries = {}
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        entries = {name: archive.read(name) for name in archive.namelist()}
    database = json.loads(entries["database.json"])
    event_row = next(row for row in database["audit_events"] if row["id"] == event_id)
    event_row["detail"]["reason"] = "Persona residente en apartamento 301"
    invitation_row = next(row for row in database["invitations"] if row["id"] == invitation_id)
    invitation_row["email"] = "invited.person@example.test"
    invitation_row["full_name"] = "Persona invitada sintética"
    database_bytes = json.dumps(database, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
    manifest = json.loads(entries["manifest.json"])
    manifest["data_sha256"] = hashlib.sha256(database_bytes).hexdigest()
    entries["database.json"] = database_bytes
    entries["manifest.json"] = json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
    legacy_archive = io.BytesIO()
    with zipfile.ZipFile(legacy_archive, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name, contents in entries.items():
            archive.writestr(name, contents)

    target_engine = create_engine(f"sqlite:///{tmp_path / 'legacy-audit-restore.sqlite3'}")
    Base.metadata.create_all(target_engine)
    target_sessions = sessionmaker(bind=target_engine, autoflush=False, expire_on_commit=False)
    backups.restore_backup_archive(
        legacy_archive.getvalue(),
        admin_email="recovery@red.test",
        admin_name="Administración RED sintética",
        admin_password="Long-Synthetic-Recovery-Password-2026",
        session_factory=target_sessions,
        target_engine=target_engine,
        storage_root=tmp_path / "legacy-audit-files",
    )
    with target_sessions() as session:
        restored_event = session.get(AuditEvent, event_id)
        restored_invitation = session.get(Invitation, invitation_id)
        assert restored_event.detail == {
            "from_status": "PENDING_REVIEW", "to_status": "CORRECTION_REQUESTED",
        }
        assert restored_invitation.email == "archived-invitation@red.invalid"
        assert restored_invitation.full_name == "Invitación archivada"
    target_engine.dispose()
