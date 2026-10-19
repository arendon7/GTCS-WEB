import hashlib
from pathlib import Path

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app import backups, cli, drive
from app.db import Base
from app.initial_projects import BELLO_PROJECTS
from app.models import AuditEvent, Backup, DriveConnection, Project, User
from app.security import hash_password


def project_session_factory(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'cli.sqlite3'}")
    Base.metadata.create_all(engine)
    return engine, sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def test_seed_bello_projects_is_idempotent_and_keeps_workspaces_empty(monkeypatch, tmp_path, capsys):
    engine, sessions = project_session_factory(tmp_path)
    monkeypatch.setattr(cli, "SessionLocal", sessions)

    assert cli.seed_bello_projects() == 0
    first_output = capsys.readouterr().out
    assert "creados: 4" in first_output
    assert cli.seed_bello_projects() == 0
    second_output = capsys.readouterr().out
    assert "creados: 0" in second_output
    assert "ya existentes: 4" in second_output

    with sessions() as session:
        projects = list(session.scalars(select(Project).order_by(Project.slug)))
        assert [(project.slug, project.name) for project in projects] == sorted(BELLO_PROJECTS)
        assert all(project.status == "preparacion" for project in projects)
        assert all(project.baseline_status == "no_iniciada" for project in projects)
    engine.dispose()


def test_seed_bello_projects_stops_before_creating_when_name_conflicts(monkeypatch, tmp_path, capsys):
    engine, sessions = project_session_factory(tmp_path)
    with sessions() as session:
        session.add(Project(slug="parque-alto-random", name="Parque Alto - Apartamaentos"))
        session.commit()
    monkeypatch.setattr(cli, "SessionLocal", sessions)

    assert cli.seed_bello_projects() == 2
    captured = capsys.readouterr()
    assert "No se crearon expedientes" in captured.err
    with sessions() as session:
        assert session.scalar(select(Project.id).where(Project.slug == "bello-tulipanes")) is None
        assert session.scalar(select(Project.id).where(Project.slug == "parque-alto-random")) is not None
    engine.dispose()


def test_download_drive_backup_requires_active_admin_password_and_uses_latest_completed(monkeypatch, tmp_path, capsys):
    engine, sessions = project_session_factory(tmp_path)
    with sessions() as session:
        admin = User(
            email="admin@red.test", full_name="Admin RED", password_hash=hash_password("synthetic-admin-password"),
            is_platform_admin=True, active=True,
        )
        session.add(admin)
        session.flush()
        admin_id = admin.id
        older = Backup(
            id="backup-old", status="completado", drive_file_id="drive-old", drive_file_name="older.zip",
            drive_folder_id="folder", sha256="a" * 64, bytes_total=100, created_by=admin_id,
        )
        latest = Backup(
            id="backup-latest", status="completado", drive_file_id="drive-latest", drive_file_name="latest.zip",
            drive_folder_id="folder", sha256="b" * 64, bytes_total=200, created_by=admin_id,
        )
        from datetime import datetime, timedelta, timezone
        latest.created_at = datetime.now(timezone.utc)
        older.created_at = latest.created_at - timedelta(seconds=10)
        session.add_all([admin, older, latest])
        session.commit()
    monkeypatch.setattr(cli, "SessionLocal", sessions)
    monkeypatch.setattr(cli.getpass, "getpass", lambda _prompt: "synthetic-admin-password")
    calls = []

    def fake_download(session, backup, actor_id, output_path):
        calls.append((backup.id, actor_id, output_path))
        return {
            "path": output_path, "sha256": backup.sha256, "bytes_total": backup.bytes_total,
            "manifest": {"counts": {"projects": 4}},
        }

    monkeypatch.setattr(cli, "download_registered_backup", fake_download)

    assert cli.download_backup_from_drive("ADMIN@RED.TEST", str(tmp_path / "recovery.zip")) == 0

    output = capsys.readouterr().out
    assert "descargado y verificado" in output
    assert "projects'" in output
    assert calls == [("backup-latest", admin_id, str(tmp_path / "recovery.zip"))]
    engine.dispose()


def test_download_drive_backup_wrapper_verifies_archive_and_records_audit(monkeypatch, tmp_path):
    engine, sessions = project_session_factory(tmp_path)
    with sessions() as session:
        admin = User(
            email="admin@red.test", full_name="Admin RED", password_hash=hash_password("synthetic-admin-password"),
            is_platform_admin=True, active=True,
        )
        session.add(admin)
        session.flush()
        backup = Backup(
            id="backup-latest", status="completado", drive_file_id="drive-file", drive_file_name="latest.zip",
            drive_folder_id="private-folder", sha256="b" * 64, bytes_total=200, created_by=admin.id,
        )
        connection = DriveConnection(
            id="drive-connection", connected_by=admin.id, google_email="owner@example.test",
            encrypted_refresh_token="synthetic-encrypted-token", backup_folder_id="private-folder",
        )
        session.add_all([backup, connection])
        session.flush()
        archive_bytes, _counts = backups.build_backup_archive(session)

        def fake_download(_connection, _backup, destination):
            Path(destination).write_bytes(archive_bytes)
            return {
                "path": str(destination), "bytes_total": len(archive_bytes),
                "sha256": hashlib.sha256(archive_bytes).hexdigest(), "metadata": {"id": "drive-file"},
            }

        monkeypatch.setattr(drive, "download_backup_archive", fake_download)
        destination = tmp_path / "verified.zip"
        result = backups.download_drive_backup(session, backup, admin.id, destination)

        assert result["manifest"]["format"] == "greenatics-red-backup"
        assert destination.exists()
        event = session.scalar(select(AuditEvent).where(AuditEvent.action == "backup_downloaded"))
        assert event.entity_id == backup.id
        assert event.actor_id == admin.id
        assert event.detail["sha256"] == result["sha256"]
    engine.dispose()


def test_download_drive_backup_wrapper_removes_archive_that_fails_internal_verification(monkeypatch, tmp_path):
    engine, sessions = project_session_factory(tmp_path)
    with sessions() as session:
        admin = User(
            email="admin@red.test", full_name="Admin RED", password_hash=hash_password("synthetic-admin-password"),
            is_platform_admin=True, active=True,
        )
        session.add(admin)
        session.flush()
        backup = Backup(
            id="backup-latest", status="completado", drive_file_id="drive-file", drive_file_name="latest.zip",
            drive_folder_id="private-folder", sha256="b" * 64, bytes_total=200, created_by=admin.id,
        )
        connection = DriveConnection(
            id="drive-connection", connected_by=admin.id, google_email="owner@example.test",
            encrypted_refresh_token="synthetic-encrypted-token", backup_folder_id="private-folder",
        )
        session.add_all([backup, connection])
        session.flush()

        def fake_download(_connection, _backup, destination):
            Path(destination).write_bytes(b"not a RED backup")
            return {"path": str(destination), "bytes_total": 16, "sha256": "c" * 64}

        monkeypatch.setattr(drive, "download_backup_archive", fake_download)
        destination = tmp_path / "invalid.zip"
        with pytest.raises(ValueError, match="verificación interna"):
            backups.download_drive_backup(session, backup, admin.id, destination)

        assert not destination.exists()
        assert session.scalar(select(AuditEvent).where(AuditEvent.action == "backup_downloaded")) is None
    engine.dispose()
