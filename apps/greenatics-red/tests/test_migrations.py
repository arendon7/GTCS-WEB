from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, text



def test_local_defaults_isolate_new_database_and_private_storage(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    instance_dir = app_dir / "instance" / "local-dev"
    env = {**os.environ, "APP_ENV": "local"}
    env.pop("INSTANCE_DIR", None)
    env.pop("DATABASE_URL", None)
    env.pop("RED_STORAGE_ROOT", None)

    result = subprocess.run(
        [
            sys.executable,
            "-c",
            "from app.config import INSTANCE_DIR, settings; "
            "print(INSTANCE_DIR); print(settings.database_url); print(settings.storage_root)",
        ],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    actual_instance, database_url, storage_root = result.stdout.strip().splitlines()
    assert Path(actual_instance) == instance_dir
    assert database_url == f"sqlite:///{instance_dir / 'greenatics_red.sqlite3'}"
    assert Path(storage_root) == instance_dir / "private"


def test_fresh_alembic_install_keeps_customer_projects_empty_and_rerunnable(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    database_path = tmp_path / "fresh-red.sqlite3"
    instance_dir = tmp_path / "instance"
    env = {
        **os.environ,
        "APP_ENV": "local",
        "DATABASE_URL": f"sqlite:///{database_path}",
        "DATABASE_SCHEMA": "",
        "INSTANCE_DIR": str(instance_dir),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
    }

    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, result.stdout + result.stderr

    with create_engine(f"sqlite:///{database_path}").begin() as connection:
        connection.execute(text(
            "INSERT INTO red_projects "
            "(id, slug, name, municipality, department, status, baseline_status, baseline_reference, baseline_note, "
            "origin, origin_note, created_at) VALUES "
            "('synthetic-project', 'qa-synthetic-project', 'Conjunto QA sintético', 'Bello (dato sintético)', "
            "'Antioquia (dato sintético)', 'preparacion', 'no_iniciada', '', '', 'qa_sintetico', "
            "'Fixture sintético de migración; no representa una copropiedad real.', CURRENT_TIMESTAMP)"
        ))

    rerun = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=app_dir, env=env, check=False, capture_output=True, text=True, timeout=60,
    )
    assert rerun.returncode == 0, rerun.stdout + rerun.stderr

    engine = create_engine(f"sqlite:///{database_path}")
    with engine.connect() as connection:
        rows = connection.execute(
            text("SELECT slug, name FROM red_projects ORDER BY slug")
        ).all()
        applied_revisions = connection.execute(
            text("SELECT version_num FROM alembic_version")
        ).scalars().all()
    engine.dispose()

    assert [(row.slug, row.name) for row in rows] == [("qa-synthetic-project", "Conjunto QA sintético")]
    assert applied_revisions[-1] == "0022_private_alembic_metadata"
    with create_engine(f"sqlite:///{database_path}").connect() as connection:
        assert connection.execute(text("PRAGMA table_info(red_pmirs_signatures)")).all()
        assert connection.execute(text("PRAGMA table_info(red_form_signatures)")).all()
        assert "document_snapshot" in {
            row[1] for row in connection.execute(text("PRAGMA table_info(red_form_signatures)"))
        }
        assert "submission_key" in {
            row[1] for row in connection.execute(text("PRAGMA table_info(red_form_revisions)"))
        }
        assert "submission_key" in {
            row[1] for row in connection.execute(text("PRAGMA table_info(red_pmirs_item_revisions)"))
        }
        assert "submission_key" in {
            row[1] for row in connection.execute(text("PRAGMA table_info(red_evidence_files)"))
        }
        project_columns = {row[1] for row in connection.execute(text("PRAGMA table_info(red_projects)"))}
        assert {"address", "identity_status", "identity_reference", "identity_confirmed_by", "identity_confirmed_role", "identity_confirmed_at"} <= project_columns
        quota_lock = connection.execute(text("SELECT id, generation FROM red_evidence_quota_locks")).one()
        assert quota_lock == (1, 0)


def test_fresh_postgres_migrations_render_offline_sql(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    env = {
        **os.environ,
        "APP_ENV": "local",
        "DATABASE_URL": "postgresql+psycopg://red_test:red_test@localhost:5432/red_test",
        "DATABASE_SCHEMA": "",
        "INSTANCE_DIR": str(tmp_path / "instance"),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
    }

    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head", "--sql"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert "CREATE TABLE red_projects" in result.stdout
    assert "INSERT INTO red_projects" not in result.stdout
    assert "Parque Alto - Apartamaentos" not in result.stdout
    assert "Urbanización Tulipanes" not in result.stdout
    assert "Majagua - Unidad Residencial" not in result.stdout
    assert "Unidad Residencial Trigales" not in result.stdout
    assert "WITH ordered_versions AS" in result.stdout
    assert "regexp_match(version_label" in result.stdout
    assert "CREATE TABLE red_pmirs_signatures" in result.stdout
    assert "CREATE TABLE red_form_signatures" in result.stdout
    assert "CREATE TABLE red_operational_references" in result.stdout
    assert "CREATE TABLE red_privacy_cases" in result.stdout
    assert "CREATE TABLE red_project_visit_authorizations" in result.stdout
    assert "0008_pmirs_handwritten_signatures" in result.stdout
    assert "0009_form_record_signatures" in result.stdout
    assert "0010_operational_references" in result.stdout
    assert "0011_idempotent_record_edits" in result.stdout
    assert "0012_privacy_case_log" in result.stdout
    assert "0013_idempotent_pmirs_progress" in result.stdout
    assert "0014_login_throttle_window_index" in result.stdout
    assert "0016_idempotent_evidence_uploads" in result.stdout
    assert "0017_project_identity_confirmation" in result.stdout
    assert "0018_project_identity_ph_confirmation" in result.stdout
    assert "0019_evidence_storage_quotas" in result.stdout
    assert "0020_form_signature_snapshots" in result.stdout
    assert "ALTER TABLE red_form_signatures ADD document_snapshot JSON" in result.stdout or "ADD COLUMN document_snapshot JSON" in result.stdout
    assert "CREATE TABLE red_evidence_quota_locks" in result.stdout
    assert "ix_red_login_throttles_window_start" in result.stdout
    assert "ENABLE ROW LEVEL SECURITY" in result.stdout
    assert "target_schema, 'alembic_version'" in result.stdout
    assert "WHERE rolname IN ('anon', 'authenticated')" in result.stdout
    assert "REVOKE ALL PRIVILEGES ON TABLE" in result.stdout
    assert "ALTER DEFAULT PRIVILEGES" in result.stdout


def test_fresh_postgres_migrations_render_inside_configured_schema(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    schema_name = "greenatics_red"
    env = {
        **os.environ,
        "APP_ENV": "local",
        "DATABASE_URL": "postgresql+psycopg://red_test:red_test@localhost:5432/red_test",
        "DATABASE_SCHEMA": schema_name,
        "INSTANCE_DIR": str(tmp_path / "instance"),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
    }

    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head", "--sql"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    schema_creation = f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'
    schema_search_path = f'SET search_path TO "{schema_name}"'
    assert schema_creation in result.stdout
    assert schema_search_path in result.stdout
    assert result.stdout.index(schema_creation) < result.stdout.index(schema_search_path)
    assert result.stdout.index(schema_search_path) < result.stdout.index("CREATE TABLE red_projects")
    assert "CREATE TABLE alembic_version" in result.stdout


def test_hosted_shared_schema_fails_before_startup_migrations(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    env = {
        **os.environ,
        "APP_ENV": "staging",
        "DATABASE_URL": "postgresql+psycopg://red_test:red_test@localhost:5432/red_test",
        "DATABASE_SCHEMA": "greenatics_red",
        "INSTANCE_DIR": str(tmp_path / "instance"),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
        "PATH": f"{app_dir / '.venv' / 'bin'}:{os.environ.get('PATH', '')}",
    }

    result = subprocess.run(
        ["/bin/sh", "./start.sh"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode != 0
    assert "base PostgreSQL exclusiva" in result.stderr
    assert "DATABASE_SCHEMA debe permanecer vacío" in result.stderr
    assert "Running upgrade" not in result.stdout
    assert "CREATE TABLE red_projects" not in result.stdout


def test_unknown_app_env_fails_before_startup_migrations(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    env = {
        **os.environ,
        "APP_ENV": "preproduction",
        "DATABASE_URL": "postgresql+psycopg://red_test:red_test@localhost:5432/red_test",
        "DATABASE_SCHEMA": "",
        "RED_OPERATIONAL_WRITES_ENABLED": "true",
        "INSTANCE_DIR": str(tmp_path / "instance"),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
        "PATH": f"{app_dir / '.venv' / 'bin'}:{os.environ.get('PATH', '')}",
    }

    result = subprocess.run(
        ["/bin/sh", "./start.sh"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode != 0
    assert "APP_ENV debe ser exactamente local, staging o production" in result.stderr
    assert "Running upgrade" not in result.stdout
    assert "CREATE TABLE red_projects" not in result.stdout


def test_render_local_env_fails_before_startup_migrations(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    env = {
        **os.environ,
        "RENDER": "true",
        "APP_ENV": "local",
        "DATABASE_URL": "postgresql+psycopg://red_test:red_test@localhost:5432/red_test",
        "DATABASE_SCHEMA": "",
        "RED_OPERATIONAL_WRITES_ENABLED": "true",
        "INSTANCE_DIR": str(tmp_path / "instance"),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
        "PATH": f"{app_dir / '.venv' / 'bin'}:{os.environ.get('PATH', '')}",
    }

    result = subprocess.run(
        ["/bin/sh", "./start.sh"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode != 0
    assert "APP_ENV=local no está permitido en Render" in result.stderr
    assert "Running upgrade" not in result.stdout
    assert "CREATE TABLE red_projects" not in result.stdout


def test_hosted_migrations_require_database_isolation_reference_before_connecting(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    env = {
        **os.environ,
        "APP_ENV": "staging",
        "DATABASE_URL": "postgresql+psycopg://red_test:red_test@localhost:5432/red_test",
        "DATABASE_SCHEMA": "",
        "RED_DATABASE_ISOLATION_REFERENCE": "",
        "INSTANCE_DIR": str(tmp_path / "instance"),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
        "PATH": f"{app_dir / '.venv' / 'bin'}:{os.environ.get('PATH', '')}",
    }

    result = subprocess.run(
        ["/bin/sh", "./start.sh"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode != 0
    assert "RED_DATABASE_ISOLATION_REFERENCE" in result.stderr
    assert "Traceback" not in result.stderr
    assert "Running upgrade" not in result.stdout
    assert "CREATE TABLE red_projects" not in result.stdout


def test_hosted_offline_migrations_allow_documented_isolation_reference(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    env = {
        **os.environ,
        "APP_ENV": "staging",
        "DATABASE_URL": "postgresql+psycopg://red_test:red_test@localhost:5432/red_test",
        "DATABASE_SCHEMA": "",
        "RED_DATABASE_ISOLATION_REFERENCE": "DB-ISOLATION-2026-01",
        "INSTANCE_DIR": str(tmp_path / "instance"),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
    }

    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head", "--sql"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert "CREATE TABLE red_projects" in result.stdout


def test_backup_drive_folder_migration_preserves_existing_rows(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    database_path = tmp_path / "upgrade-red.sqlite3"
    instance_dir = tmp_path / "instance"
    env = {
        **os.environ,
        "APP_ENV": "local",
        "DATABASE_URL": f"sqlite:///{database_path}",
        "DATABASE_SCHEMA": "",
        "INSTANCE_DIR": str(instance_dir),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
    }
    for revision in ("0006_idempotent_form_submission", "head"):
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", revision],
            cwd=app_dir,
            env=env,
            check=False,
            capture_output=True,
            text=True,
            timeout=60,
        )
        assert result.returncode == 0, result.stdout + result.stderr
        if revision == "0006_idempotent_form_submission":
            with create_engine(f"sqlite:///{database_path}").begin() as connection:
                connection.execute(text(
                    "INSERT INTO red_users (id, email, full_name, password_hash, is_platform_admin, active, session_version, created_at) "
                    "VALUES ('synthetic-user', 'admin@red.test', 'Synthetic Admin', 'hash', 1, 1, 0, CURRENT_TIMESTAMP)"
                ))
                connection.execute(text(
                    "INSERT INTO red_backups (id, status, drive_file_id, drive_file_name, sha256, bytes_total, summary, created_by, created_at) "
                    "VALUES ('synthetic-backup', 'completado', 'file-id', 'backup.zip', 'abc', 5, '{}', 'synthetic-user', CURRENT_TIMESTAMP)"
                ))

    engine = create_engine(f"sqlite:///{database_path}")
    with engine.connect() as connection:
        columns = {row[1] for row in connection.execute(text("PRAGMA table_info(red_backups)"))}
        backup = connection.execute(text(
            "SELECT id, drive_folder_id FROM red_backups WHERE id='synthetic-backup'"
        )).one()
    engine.dispose()
    assert "drive_folder_id" in columns
    assert backup == ("synthetic-backup", "")


def test_upgrade_from_legacy_0008_preserves_form_and_pmirs_history(tmp_path):
    app_dir = Path(__file__).resolve().parents[1]
    database_path = tmp_path / "legacy-red.sqlite3"
    instance_dir = tmp_path / "instance"
    env = {
        **os.environ,
        "APP_ENV": "local",
        "DATABASE_URL": f"sqlite:///{database_path}",
        "DATABASE_SCHEMA": "",
        "INSTANCE_DIR": str(instance_dir),
        "RED_STORAGE_ROOT": str(tmp_path / "private"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": "synthetic-alembic-test-secret-at-least-32-chars",
    }

    legacy = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "0008_pmirs_handwritten_signatures"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert legacy.returncode == 0, legacy.stdout + legacy.stderr

    engine = create_engine(f"sqlite:///{database_path}")
    with engine.begin() as connection:
        connection.execute(text(
            "INSERT INTO red_projects "
            "(id, slug, name, municipality, department, status, baseline_status, baseline_reference, baseline_note, "
            "origin, origin_note, created_at) VALUES "
            "('synthetic-project', 'qa-synthetic-project', 'Conjunto QA sintético', 'Bello (dato sintético)', "
            "'Antioquia (dato sintético)', 'preparacion', 'no_iniciada', '', '', 'qa_sintetico', "
            "'Fixture sintético para upgrade histórico.', CURRENT_TIMESTAMP)"
        ))
        project_id = connection.execute(
            text("SELECT id FROM red_projects WHERE slug='qa-synthetic-project'")
        ).scalar_one()
        connection.execute(text(
            "INSERT INTO red_users "
            "(id, email, full_name, password_hash, is_platform_admin, active, created_at) "
            "VALUES ('synthetic-user', 'migracion@red.test', 'Cuenta sintética QA', 'hash', 1, 1, CURRENT_TIMESTAMP)"
        ))
        connection.execute(text(
            "INSERT INTO red_form_records "
            "(id, project_id, form_code, title, status, record_date, source_kind, source_note, payload, version, "
            "created_by, updated_by, review_note, created_at, updated_at) "
            "VALUES ('synthetic-record', :project_id, 'D-01', 'D-01 sintético de migración', 'RAW', '2026-10-01', "
            "'declarado', 'fixture sintético de migración', '{}', 1, 'synthetic-user', 'synthetic-user', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        ), {"project_id": project_id})
        connection.execute(text(
            "INSERT INTO red_form_revisions "
            "(id, record_id, revision, payload, note, changed_by, changed_at) "
            "VALUES ('synthetic-record-revision', 'synthetic-record', 1, '{}', 'revisión sintética', 'synthetic-user', CURRENT_TIMESTAMP)"
        ))
        connection.execute(text(
            "INSERT INTO red_pmirs_items "
            "(id, project_id, item_type, code, title, description, data, review_status, version, created_by, updated_by, "
            "review_note, created_at, updated_at) "
            "VALUES ('synthetic-item', :project_id, 'hallazgo', 'H-TEST-001', 'Hallazgo sintético', 'Fixture QA', '{}', "
            "'borrador', 1, 'synthetic-user', 'synthetic-user', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        ), {"project_id": project_id})
        connection.execute(text(
            "INSERT INTO red_pmirs_item_revisions "
            "(id, item_id, revision, snapshot, note, changed_by, changed_at) "
            "VALUES ('synthetic-item-revision', 'synthetic-item', 1, '{}', 'revisión sintética', 'synthetic-user', CURRENT_TIMESTAMP)"
        ))
    engine.dispose()

    identity_revision = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "0017_project_identity_confirmation"],
        cwd=app_dir,
        env=env,
        check=False,
        capture_output=True,
        text=True,
        timeout=90,
    )
    assert identity_revision.returncode == 0, identity_revision.stdout + identity_revision.stderr
    with create_engine(f"sqlite:///{database_path}").begin() as connection:
        connection.execute(text(
            "UPDATE red_projects SET address='Calle sintética 10', identity_status='confirmada', "
            "identity_reference='ACTAADMIN20261012', identity_confirmed_by='synthetic-user', "
            "identity_confirmed_at=CURRENT_TIMESTAMP WHERE id=:project_id"
        ), {"project_id": project_id})
    pre_snapshot_revision = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "0019_evidence_storage_quotas"],
        cwd=app_dir, env=env, check=False, capture_output=True, text=True, timeout=90,
    )
    assert pre_snapshot_revision.returncode == 0, pre_snapshot_revision.stdout + pre_snapshot_revision.stderr
    with create_engine(f"sqlite:///{database_path}").begin() as connection:
        connection.execute(text(
            "INSERT INTO red_form_signatures "
            "(id, project_id, record_id, record_version, signer_user_id, signer_name, signer_email, signer_role, "
            "declaration, signature_path, document_sha256, signed_at) VALUES "
            "('synthetic-legacy-signature', :project_id, 'synthetic-record', 1, 'synthetic-user', "
            "'Cuenta sintética QA', 'migracion@red.test', 'campo', 'Constancia de migración sintética', "
            "'M48.00,126.00 L192.00,63.00', :digest, CURRENT_TIMESTAMP)"
        ), {"project_id": project_id, "digest": "a" * 64})
    upgraded = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=app_dir, env=env, check=False, capture_output=True, text=True, timeout=90,
    )
    assert upgraded.returncode == 0, upgraded.stdout + upgraded.stderr

    engine = create_engine(f"sqlite:///{database_path}")
    with engine.connect() as connection:
        revision = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
        record = connection.execute(text(
            "SELECT id, form_code, title, version FROM red_form_records WHERE id='synthetic-record'"
        )).one()
        form_revision_count = connection.execute(text(
            "SELECT COUNT(*) FROM red_form_revisions WHERE record_id='synthetic-record'"
        )).scalar_one()
        item = connection.execute(text(
            "SELECT id, item_type, code, title, version FROM red_pmirs_items WHERE id='synthetic-item'"
        )).one()
        item_revision_count = connection.execute(text(
            "SELECT COUNT(*) FROM red_pmirs_item_revisions WHERE item_id='synthetic-item'"
        )).scalar_one()
        integrity = connection.exec_driver_sql("PRAGMA integrity_check").scalar_one()
        identity_role = connection.execute(text(
            "SELECT identity_confirmed_role FROM red_projects WHERE id=:project_id"
        ), {"project_id": project_id}).scalar_one()
        legacy_signature = connection.execute(text(
            "SELECT document_snapshot, snapshot_status FROM red_form_signatures "
            "WHERE id='synthetic-legacy-signature'"
        )).one()
    engine.dispose()

    assert revision == "0022_private_alembic_metadata"
    assert record == ("synthetic-record", "D-01", "D-01 sintético de migración", 1)
    assert form_revision_count == 1
    assert item == ("synthetic-item", "hallazgo", "H-TEST-001", "Hallazgo sintético", 1)
    assert item_revision_count == 1
    assert identity_role == "admin"
    assert legacy_signature == (None, "legacy_unverifiable")
    assert integrity == "ok"
