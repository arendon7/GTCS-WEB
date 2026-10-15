from __future__ import annotations

import shutil
import sqlite3

import pytest

from scripts.run_synthetic_preview_copy import (
    EMPTY_TABLES,
    EXPECTED_REVISION,
    create_preview_copy,
    validate_source_path,
    validate_synthetic_preview,
)
from app.initial_projects import BELLO_PROJECTS


def _empty_preview(tmp_path, *, email="admin@red-demo.local", revision=EXPECTED_REVISION):
    root = tmp_path / "greenatics-red-preview-test"
    root.mkdir()
    path = root / "red-preview.sqlite3"
    with sqlite3.connect(path) as connection:
        connection.execute("CREATE TABLE alembic_version (version_num TEXT NOT NULL)")
        connection.execute("INSERT INTO alembic_version VALUES (?)", (revision,))
        connection.execute(
            "CREATE TABLE red_projects (slug TEXT NOT NULL, name TEXT NOT NULL, municipality TEXT NOT NULL, "
            "department TEXT NOT NULL, status TEXT NOT NULL, baseline_status TEXT NOT NULL, "
            "baseline_reference TEXT NOT NULL, baseline_note TEXT NOT NULL, baseline_reviewed_by TEXT, "
            "baseline_reviewed_at TEXT, origin TEXT NOT NULL, origin_note TEXT NOT NULL, "
            "address TEXT NOT NULL DEFAULT '', identity_status TEXT NOT NULL DEFAULT 'pendiente', "
            "identity_reference TEXT NOT NULL DEFAULT '', identity_confirmed_by TEXT, "
            "identity_confirmed_role TEXT, identity_confirmed_at TEXT)"
        )
        connection.executemany(
            "INSERT INTO red_projects (slug,name,municipality,department,status,baseline_status,baseline_reference,baseline_note,baseline_reviewed_by,baseline_reviewed_at,origin,origin_note) VALUES (?, ?, 'Bello', 'Antioquia', 'preparacion', 'no_iniciada', '', '', NULL, NULL, 'instruccion_usuario', ?)",
            [(slug, name, "Nombre suministrado por el usuario; pendiente de validar con la copropiedad. Expediente inicial vacío, sin datos operativos precargados.") for slug, name in BELLO_PROJECTS],
        )
        connection.execute(
            "CREATE TABLE red_users (email TEXT NOT NULL, full_name TEXT NOT NULL, active INTEGER NOT NULL, is_platform_admin INTEGER NOT NULL)"
        )
        connection.execute("INSERT INTO red_users VALUES (?, 'Administrador de práctica RED', 1, 1)", (email,))
        connection.execute("CREATE TABLE red_audit_events (id INTEGER PRIMARY KEY)")
        for table in EMPTY_TABLES:
            connection.execute(f'CREATE TABLE "{table}" (id INTEGER PRIMARY KEY)')
    return path


def test_preview_copy_duplicates_only_empty_synthetic_four_project_fixture(tmp_path):
    source = _empty_preview(tmp_path)
    target_root, counts = create_preview_copy(source)
    try:
        assert counts["proyectos"] == 4
        assert counts["cuentas"] == 1
        assert all(count == 0 for label, count in counts.items() if label not in {"proyectos", "cuentas"})
        with sqlite3.connect(source) as source_db, sqlite3.connect(target_root / "red-preview.sqlite3") as target_db:
            assert source_db.execute("SELECT COUNT(*) FROM red_form_records").fetchone()[0] == 0
            assert target_db.execute("SELECT COUNT(*) FROM red_projects").fetchone()[0] == 4
            assert target_db.execute("SELECT COUNT(*) FROM red_audit_events").fetchone()[0] == 0
            assert target_db.execute("SELECT DISTINCT identity_status FROM red_projects").fetchone()[0] == "pendiente"
    finally:
        shutil.rmtree(target_root, ignore_errors=True)


def test_preview_copy_discards_synthetic_login_throttles_without_mutating_source(tmp_path):
    source = _empty_preview(tmp_path)
    with sqlite3.connect(source) as source_db:
        source_db.execute("INSERT INTO red_login_throttles VALUES (1)")
        with pytest.raises(ValueError, match="ya contiene información de trabajo"):
            validate_synthetic_preview(source_db)

    target_root, counts = create_preview_copy(source)
    try:
        with sqlite3.connect(source) as source_db, sqlite3.connect(target_root / "red-preview.sqlite3") as target_db:
            assert source_db.execute("SELECT COUNT(*) FROM red_login_throttles").fetchone()[0] == 1
            assert target_db.execute("SELECT COUNT(*) FROM red_login_throttles").fetchone()[0] == 0
            assert target_db.execute("SELECT COUNT(*) FROM red_audit_events").fetchone()[0] == 0
        assert counts["controles de acceso"] == 0
    finally:
        shutil.rmtree(target_root, ignore_errors=True)


def test_preview_copy_rejects_nonempty_records_and_real_account_domains(tmp_path):
    source = _empty_preview(tmp_path)
    with sqlite3.connect(source) as connection:
        connection.execute("INSERT INTO red_form_records VALUES (1)")
        with pytest.raises(ValueError, match="ya contiene información de trabajo"):
            validate_synthetic_preview(connection)

    other = tmp_path / "other"
    other.mkdir()
    real_domain = _empty_preview(other, email="operator@example.com")
    with sqlite3.connect(real_domain) as connection:
        with pytest.raises(ValueError, match="dominio local sintético"):
            validate_synthetic_preview(connection)


def test_preview_copy_rejects_unexpected_revision_and_source_location(tmp_path):
    previous_root = tmp_path / "previous"
    previous_root.mkdir()
    previous_revision = _empty_preview(previous_root, revision="0019_evidence_storage_quotas")
    with sqlite3.connect(previous_revision) as connection:
        assert validate_synthetic_preview(connection, allow_migratable_revision=True)["proyectos"] == 4

    old_revision = _empty_preview(tmp_path, revision="0014_login_throttle_window_index")
    with sqlite3.connect(old_revision) as connection:
        with pytest.raises(ValueError, match="revisión RED 0020"):
            validate_synthetic_preview(connection)

    misplaced = tmp_path / "ordinary-folder"
    misplaced.mkdir()
    path = misplaced / "red-preview.sqlite3"
    path.touch()
    with pytest.raises(ValueError, match="prefijo reservado"):
        validate_source_path(path)


def test_preview_copy_rejects_personalized_unit_identity(tmp_path):
    source = _empty_preview(tmp_path)
    with sqlite3.connect(source) as connection:
        connection.execute("UPDATE red_projects SET address='Calle de prueba 123' WHERE slug=(SELECT slug FROM red_projects LIMIT 1)")
        with pytest.raises(ValueError, match="identidad pendiente"):
            validate_synthetic_preview(connection)
