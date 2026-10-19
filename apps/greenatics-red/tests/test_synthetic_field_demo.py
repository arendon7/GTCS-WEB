from __future__ import annotations

import pytest

from conftest import rendered_decision_data
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.models import (
    AuditEvent, Base, EvidenceFile, EvidenceQuotaLock, PMIRSItem, PMIRSItemRevision, PMIRSSignature, PMIRSVersion,
    Project, ProjectMembership, ProjectVisitAuthorization, User,
)
from app.initial_projects import BELLO_PROJECTS
from app.visit_authorizations import visit_authorization_active
from scripts.run_synthetic_field_demo import (
    DEMO_PROJECT_NAME, DEMO_PROJECT_SLUG, DEMO_ROLES, PROJECT_DIR,
    _local_environment, _require_current_migration, _stop_child,
    seed_demo_workspace, seed_synthetic_progress_history,
)


def test_demo_launcher_waits_for_child_before_cleanup_and_kills_if_needed():
    import subprocess

    class ChildProcess:
        def __init__(self, *, stubborn=False):
            self.stubborn = stubborn
            self.returncode = None
            self.events = []

        def poll(self):
            return self.returncode

        def terminate(self):
            self.events.append("terminate")
            if not self.stubborn:
                self.returncode = 0

        def wait(self, timeout=None):
            self.events.append(("wait", timeout))
            if self.stubborn and self.returncode is None and timeout is not None:
                raise subprocess.TimeoutExpired("uvicorn", timeout)
            return self.returncode

        def kill(self):
            self.events.append("kill")
            self.returncode = -9

    graceful = ChildProcess()
    _stop_child(graceful, timeout=2)
    assert graceful.events == ["terminate", ("wait", 2)]
    assert graceful.returncode == 0

    stubborn = ChildProcess(stubborn=True)
    _stop_child(stubborn, timeout=2)
    assert stubborn.events == ["terminate", ("wait", 2), "kill", ("wait", None)]
    assert stubborn.returncode == -9

    already_stopped = ChildProcess()
    already_stopped.returncode = 0
    _stop_child(already_stopped)
    assert already_stopped.events == []


def test_demo_cli_forwards_open_browser_flag(monkeypatch):
    import sys

    import scripts.run_synthetic_field_demo as demo

    captured = {}

    def run(port, **kwargs):
        captured.update(port=port, **kwargs)
        return 0

    monkeypatch.setattr(sys, "argv", ["run_synthetic_field_demo.py", "--open-browser", "--open-credentials"])
    monkeypatch.setattr(demo, "run", run)
    assert demo.main() == 0
    assert captured == {
        "port": 18797,
        "include_accepted_synthetic_baseline": False,
        "include_synthetic_progress_history": False,
        "open_browser": True,
        "open_credentials": True,
    }


def test_demo_launcher_opens_browser_only_after_health(tmp_path, monkeypatch):
    import sys
    import types
    from pathlib import Path

    import scripts.run_synthetic_field_demo as demo

    events = []
    root = tmp_path / "field-demo-browser"

    class Session:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

    class ChildProcess:
        returncode = None

        def poll(self):
            return self.returncode

        def wait(self, timeout=None):
            events.append(("wait", timeout))
            self.returncode = 0
            return 0

    monkeypatch.setattr(demo, "_port_is_available", lambda _port: True)
    monkeypatch.setattr(demo.tempfile, "mkdtemp", lambda *, prefix: str(root.mkdir() or root))
    def run_command(args, **_kwargs):
        if args[0] == "open":
            events.append(("credentials", Path(args[1]).exists()))
        return types.SimpleNamespace(returncode=0)

    monkeypatch.setattr(demo.subprocess, "run", run_command)
    monkeypatch.setattr(demo, "_require_current_migration", lambda _path: None)
    monkeypatch.setitem(sys.modules, "app.db", types.SimpleNamespace(SessionLocal=Session))
    monkeypatch.setattr(demo, "seed_demo_workspace", lambda *_args, **_kwargs: (
        "synthetic-project", {role: details[0] for role, details in DEMO_ROLES.items()},
    ))
    monkeypatch.setattr(demo.subprocess, "Popen", lambda *_args, **_kwargs: ChildProcess())

    def healthy(_process, _port):
        events.append("healthy")
        return True

    def open_browser(url):
        events.append(("browser", url))
        return True

    monkeypatch.setattr(demo, "_wait_for_health", healthy)
    monkeypatch.setattr(demo.webbrowser, "open", open_browser)

    assert demo.run(18797, open_browser=True, open_credentials=True) == 0
    assert events[:2] == [
        "healthy",
        ("browser", "http://127.0.0.1:18797/login"),
    ]
    assert events[2] == ("credentials", True)
    assert events[3] == ("wait", None)
    assert not root.exists()


def test_demo_launcher_stops_server_before_removing_sandbox_and_restores_environment(tmp_path, monkeypatch):
    import os
    import shutil
    import subprocess
    import sys
    import types
    from pathlib import Path

    import scripts.run_synthetic_field_demo as demo

    root = tmp_path / "field-demo"
    events = []
    parent_database_url = "sqlite:///parent-workspace.sqlite3"
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "parent-client-id")
    monkeypatch.setenv("DATABASE_URL", parent_database_url)

    class Session:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

    class ChildProcess:
        returncode = None

        def poll(self):
            return self.returncode

        def terminate(self):
            events.append("terminate")

        def wait(self, timeout=None):
            events.append(("wait", timeout))
            self.returncode = -15
            return self.returncode

        def kill(self):
            events.append("kill")
            self.returncode = -9

    child = ChildProcess()
    child_environment = {}
    real_rmtree = shutil.rmtree

    def make_sandbox(*, prefix):
        assert prefix == "greenatics-red-field-demo-"
        root.mkdir(mode=0o700)
        return str(root)

    def start_child(_args, *, cwd, env):
        assert cwd == demo.PROJECT_DIR
        child_environment.update(env)
        return child

    def remove_sandbox(path, *, ignore_errors):
        events.append(("cleanup", child.returncode, Path(path).exists()))
        real_rmtree(path, ignore_errors=ignore_errors)

    monkeypatch.setattr(demo, "_port_is_available", lambda _port: True)
    monkeypatch.setattr(demo.tempfile, "mkdtemp", make_sandbox)
    monkeypatch.setattr(demo.subprocess, "run", lambda *_args, **_kwargs: types.SimpleNamespace(returncode=0))
    monkeypatch.setattr(demo, "_require_current_migration", lambda _path: None)
    monkeypatch.setitem(sys.modules, "app.db", types.SimpleNamespace(SessionLocal=Session))
    monkeypatch.setattr(demo, "seed_demo_workspace", lambda *_args, **_kwargs: (
        "synthetic-project", {role: details[0] for role, details in DEMO_ROLES.items()},
    ))
    monkeypatch.setattr(demo.subprocess, "Popen", start_child)
    monkeypatch.setattr(demo, "_wait_for_health", lambda _process, _port: False)
    monkeypatch.setattr(demo.shutil, "rmtree", remove_sandbox)

    assert demo.run(18797) == 2
    assert events == ["terminate", ("wait", 5), ("cleanup", -15, True)]
    assert not root.exists()
    assert "GOOGLE_CLIENT_ID" not in child_environment
    assert child_environment["DATABASE_URL"] == f"sqlite:///{root / 'red-demo.sqlite3'}"
    assert os.environ["GOOGLE_CLIENT_ID"] == "parent-client-id"
    assert os.environ["DATABASE_URL"] == parent_database_url


def test_demo_launcher_stops_child_before_cleanup_when_health_check_raises(tmp_path, monkeypatch):
    import shutil
    import subprocess
    import sys
    import types
    from pathlib import Path

    import scripts.run_synthetic_field_demo as demo

    root = tmp_path / "field-demo-unexpected-error"
    events = []
    child_environment = {}

    class Session:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

    class ChildProcess:
        returncode = None

        def poll(self):
            return self.returncode

        def terminate(self):
            events.append("terminate")
            self.returncode = -15

        def wait(self, timeout=None):
            events.append(("wait", timeout))
            return self.returncode

    child = ChildProcess()
    real_rmtree = shutil.rmtree

    def make_sandbox(*, prefix):
        assert prefix == "greenatics-red-field-demo-"
        root.mkdir(mode=0o700)
        return str(root)

    def start_child(_args, *, cwd, env):
        assert cwd == demo.PROJECT_DIR
        child_environment.update(env)
        return child

    def remove_sandbox(path, *, ignore_errors):
        events.append(("cleanup", child.returncode, Path(path).exists()))
        real_rmtree(path, ignore_errors=ignore_errors)

    def fail_health(_process, _port):
        events.append("health-error")
        raise RuntimeError("synthetic health-check failure")

    monkeypatch.setattr(demo, "_port_is_available", lambda _port: True)
    monkeypatch.setattr(demo.tempfile, "mkdtemp", make_sandbox)
    monkeypatch.setattr(demo.subprocess, "run", lambda *_args, **_kwargs: types.SimpleNamespace(returncode=0))
    monkeypatch.setattr(demo, "_require_current_migration", lambda _path: None)
    monkeypatch.setitem(sys.modules, "app.db", types.SimpleNamespace(SessionLocal=Session))
    monkeypatch.setattr(demo, "seed_demo_workspace", lambda *_args, **_kwargs: (
        "synthetic-project", {role: details[0] for role, details in DEMO_ROLES.items()},
    ))
    monkeypatch.setattr(demo.subprocess, "Popen", start_child)
    monkeypatch.setattr(demo, "_wait_for_health", fail_health)
    monkeypatch.setattr(demo.shutil, "rmtree", remove_sandbox)

    with pytest.raises(RuntimeError, match="synthetic health-check failure"):
        demo.run(18797)
    assert events == ["health-error", "terminate", ("wait", 5), ("cleanup", -15, True)]
    assert not root.exists()


def test_demo_launcher_accepts_fresh_migrations_and_rejects_stale_revision(tmp_path):
    import sqlite3
    import subprocess
    import sys

    migrated = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=PROJECT_DIR, env=_local_environment(tmp_path, 18797),
        capture_output=True, text=True, timeout=60, check=False,
    )
    assert migrated.returncode == 0, migrated.stdout + migrated.stderr
    database_path = tmp_path / "red-demo.sqlite3"
    _require_current_migration(database_path)

    with sqlite3.connect(database_path) as connection:
        current = connection.execute("SELECT version_num FROM alembic_version").fetchone()[0]
        connection.execute("UPDATE alembic_version SET version_num = ?", ("stale-training-revision",))
    assert current != "stale-training-revision"
    with pytest.raises(RuntimeError, match="última migración RED"):
        _require_current_migration(database_path)
    with sqlite3.connect(database_path) as connection:
        assert connection.execute("SELECT version_num FROM alembic_version").fetchone()[0] == "stale-training-revision"
        assert connection.execute("SELECT COUNT(*) FROM red_projects").fetchone()[0] == 0
        connection.execute("UPDATE alembic_version SET version_num = ?", (current,))

    # Exercise the real migrated seed, including the infrastructure row that
    # metadata.create_all-only tests do not create.
    engine = create_engine(f"sqlite:///{database_path}")
    try:
        with Session(engine) as session:
            project_id, emails = seed_demo_workspace(
                session, {role: f"synthetic-{role}-password" for role in DEMO_ROLES},
            )
            assert session.get(Project, project_id).slug == DEMO_PROJECT_SLUG
            seeded_projects = list(session.scalars(select(Project)))
            assert len(seeded_projects) == 5
            assert {project.slug for project in seeded_projects} == {
                *(slug for slug, _name in BELLO_PROJECTS),
                DEMO_PROJECT_SLUG,
            }
            assert set(emails) == set(DEMO_ROLES)
            assert session.execute(select(EvidenceQuotaLock.id, EvidenceQuotaLock.generation)).all() == [(1, 0)]
    finally:
        engine.dispose()


def test_demo_migration_check_does_not_create_a_missing_database(tmp_path):
    missing = tmp_path / "missing.sqlite3"
    with pytest.raises(RuntimeError, match="verificar la migración"):
        _require_current_migration(missing)
    assert not missing.exists()


def test_demo_platform_admin_sees_four_empty_units_and_separate_training_project(client):
    import re

    from app.db import SessionLocal, engine as app_engine

    Base.metadata.drop_all(app_engine)
    Base.metadata.create_all(app_engine)
    passwords = {role: f"synthetic-{role}-password" for role in DEMO_ROLES}
    try:
        with SessionLocal() as session:
            seed_demo_workspace(session, passwords)

        login = client.get("/login")
        csrf = re.search(r'name="csrf" value="([^\"]+)"', login.text)
        assert login.status_code == 200 and csrf
        response = client.post(
            "/login",
            data={"email": DEMO_ROLES["admin"][0], "password": passwords["admin"], "csrf": csrf.group(1)},
            follow_redirects=False,
        )
        assert response.status_code == 303
        dashboard = client.get("/")
        assert dashboard.status_code == 200
        assert "Mis expedientes" in dashboard.text
        assert "Copropiedades" in dashboard.text
        assert "Bello, Antioquia" not in dashboard.text
        assert DEMO_PROJECT_NAME in dashboard.text
        for _slug, name in BELLO_PROJECTS:
            assert name in dashboard.text
        assert dashboard.text.count("Sin registro") >= 4
    finally:
        Base.metadata.drop_all(app_engine)


def test_demo_seed_preserves_existing_pristine_unit_workspaces():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    passwords = {role: f"synthetic-{role}-password" for role in DEMO_ROLES}
    try:
        with Session(engine) as session:
            for slug, name in BELLO_PROJECTS:
                session.add(Project(
                    slug=slug,
                    name=name,
                    municipality="Bello",
                    department="Antioquia",
                    status="preparacion",
                    baseline_status="no_iniciada",
                    origin="instruccion_usuario",
                    origin_note=(
                        "Nombre suministrado por el usuario; pendiente de validar con la copropiedad. "
                        "Expediente inicial vacío, sin datos operativos precargados."
                    ),
                ))
            session.commit()
            before = {project.slug: project.id for project in session.scalars(select(Project))}

            demo_id, _emails = seed_demo_workspace(session, passwords)

            after = {project.slug: project.id for project in session.scalars(select(Project))}
            assert after[DEMO_PROJECT_SLUG] == demo_id
            assert len(after) == 5
            assert all(after[slug] == before[slug] for slug, _name in BELLO_PROJECTS)
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()

def test_demo_seed_keeps_four_empty_unit_workspaces_separate_from_synthetic_training():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    passwords = {role: f"synthetic-{role}-password" for role in DEMO_ROLES}
    try:
        with Session(engine) as session:
            project_id, emails = seed_demo_workspace(session, passwords)
            projects = list(session.scalars(select(Project)))
            by_slug = {project.slug: project for project in projects}
            assert len(projects) == 5
            assert (by_slug[DEMO_PROJECT_SLUG].name, by_slug[DEMO_PROJECT_SLUG].origin) == (
                DEMO_PROJECT_NAME, "synthetic_demo",
            )
            assert "no representa una copropiedad" in by_slug[DEMO_PROJECT_SLUG].origin_note.casefold()
            assert by_slug[DEMO_PROJECT_SLUG].baseline_status == "no_iniciada"
            for slug, name in BELLO_PROJECTS:
                workspace = by_slug[slug]
                assert workspace.name == name
                assert workspace.municipality == "Bello" and workspace.department == "Antioquia"
                assert workspace.status == "preparacion"
                assert workspace.baseline_status == "no_iniciada"
                assert workspace.baseline_reference == "" and workspace.baseline_note == ""
                assert workspace.identity_status == "pendiente" and workspace.address == ""
                assert workspace.origin == "instruccion_usuario"
                assert "expediente inicial vacío" in workspace.origin_note.casefold()

            users = list(session.scalars(select(User)))
            assert len(users) == len(DEMO_ROLES)
            assert {user.email for user in users} == set(emails.values())
            assert sum(user.is_platform_admin for user in users) == 1

            memberships = list(session.scalars(select(ProjectMembership)))
            assert len(memberships) == 5
            assert {membership.role for membership in memberships} == {
                "consultor", "campo", "revisor", "administracion_ph", "lector",
            }
            assert {membership.project_id for membership in memberships} == {project_id}
            assert session.scalar(select(ProjectVisitAuthorization.project_id)) == project_id
            assert not list(session.scalars(select(PMIRSItem.project_id).where(PMIRSItem.project_id != project_id)))

            authorization = session.scalar(select(ProjectVisitAuthorization))
            assert authorization is not None
            assert authorization.status == "approved"
            assert all(reference.startswith("DEMO-") for reference in (
                authorization.site_access_reference, authorization.privacy_reference,
                authorization.method_reference, authorization.sst_reference,
            ))
            assert visit_authorization_active(authorization)

            items = list(session.scalars(select(PMIRSItem).where(PMIRSItem.project_id == project_id)))
            assert {item.item_type for item in items} == {"programa", "indicador", "accion"}
            by_code = {item.code: item for item in items}
            program = by_code["DEMO-PR-001"]
            indicator = by_code["DEMO-IN-001"]
            action = by_code["DEMO-A-001"]
            assert program.review_status == indicator.review_status == action.review_status == "VALIDATED"
            assert all(item.reviewed_by == next(user.id for user in users if user.email == emails["revisor"])
                       and item.reviewed_at is not None and "DEMO" in item.review_note for item in items)
            assert program.data["applies"] == "si"
            assert indicator.data["data_available"] == "no"
            assert action.data["program_id"] == program.id
            assert action.data["indicator_id"] == indicator.id
            assert action.data["priority"] == "media"
            assert action.data["due_date"]
            assert len(action.data["completion_criteria"]) >= 8
            assert action.data["expected_evidence"] == "acta"
            assert action.data["assignee_user_ids"] == [
                next(user.id for user in users if user.email == emails["campo"]),
            ]
            from app.main import pmirs_submission_errors
            assert pmirs_submission_errors(
                session, project_id, action.item_type, action.title, action.description,
                {**action.data, "_require_valid_relations": True},
            ) == []
            assert session.scalar(select(AuditEvent).where(
                AuditEvent.action == "pmirs_item_reviewed", AuditEvent.entity_id == action.id,
                AuditEvent.actor_id == next(user.id for user in users if user.email == emails["revisor"]),
            )) is not None
            for item in items:
                revision = session.scalar(select(PMIRSItemRevision).where(PMIRSItemRevision.item_id == item.id))
                assert revision is not None and revision.revision == 1
                assert revision.snapshot["review_status"] == "PENDING_REVIEW"
                assert revision.changed_by == next(user.id for user in users if user.email == emails["consultor"])
                assert session.scalar(select(AuditEvent).where(
                    AuditEvent.action == "pmirs_item_created", AuditEvent.entity_id == item.id,
                )) is not None

            with pytest.raises(ValueError, match="no acepta ni conserva cuentas"):
                seed_demo_workspace(session, passwords)
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()


def test_demo_progress_history_seeds_only_two_synthetic_updates_on_the_training_action():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    passwords = {role: f"synthetic-{role}-password" for role in DEMO_ROLES}
    try:
        with Session(engine) as session:
            project_id, _emails = seed_demo_workspace(
                session, passwords, include_accepted_synthetic_baseline=True,
            )
            action_id = seed_synthetic_progress_history(session, project_id)
            action = session.get(PMIRSItem, action_id)
            revisions = list(session.scalars(select(PMIRSItemRevision).where(
                PMIRSItemRevision.item_id == action_id,
                PMIRSItemRevision.note == "Seguimiento operativo de la acción",
            ).order_by(PMIRSItemRevision.revision)))
            events = list(session.scalars(select(AuditEvent).where(
                AuditEvent.action == "pmirs_action_progress",
                AuditEvent.entity_id == action_id,
            )))
            assert action.data["execution_status"] == "en_proceso"
            assert action.data["progress_pct"] == 65
            assert action.version == 3
            assert [row.revision for row in revisions] == [2, 3]
            assert all("DEMO:" in row.snapshot["data"]["progress_note"] for row in revisions)
            assert len(events) == 2 and all(event.detail["synthetic_demo"] for event in events)
            with pytest.raises(ValueError, match="acción DEMO nueva"):
                seed_synthetic_progress_history(session, project_id)
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()


def test_demo_action_renders_complete_field_and_pmirs_views_without_opening_baseline_gate(client):
    import re

    from app.db import SessionLocal, engine as app_engine

    Base.metadata.drop_all(app_engine)
    Base.metadata.create_all(app_engine)
    passwords = {role: f"synthetic-{role}-password" for role in DEMO_ROLES}
    try:
        with SessionLocal() as session:
            project_id, emails = seed_demo_workspace(session, passwords)
            action = session.scalar(select(PMIRSItem).where(PMIRSItem.code == "DEMO-A-001"))
            assert action is not None
            target_date = action.data["due_date"]

        login = client.get("/login")
        csrf = re.search(r'name="csrf" value="([^"]+)"', login.text)
        assert login.status_code == 200 and csrf
        signed_in = client.post(
            "/login",
            data={"email": emails["campo"], "password": passwords["campo"], "csrf": csrf.group(1)},
            follow_redirects=False,
        )
        assert signed_in.status_code == 303

        field_home = client.get(f"/projects/{project_id}")
        studio = client.get(f"/projects/{project_id}/pmirs")
        assert field_home.status_code == studio.status_code == 200
        assert "Mis acciones asignadas" in field_home.text
        assert "DEMO-A-001" in field_home.text and target_date in field_home.text
        assert "Línea Base" in field_home.text and "No aceptada" in field_home.text
        assert "DEMO · Separación y registro de jornadas" in studio.text
        assert "DEMO · Jornadas con acta registrada" in studio.text
        assert "DEMO · practicar captura y revisión de evidencia" in studio.text
        assert "Registrar avance o novedad" not in studio.text
        assert "El seguimiento de acciones se habilita cuando la Línea Base" in studio.text
    finally:
        Base.metadata.drop_all(app_engine)


def test_pmirs_studio_distinguishes_100_percent_execution_from_validation_and_closure(client):
    import re

    from app.db import SessionLocal, engine as app_engine

    Base.metadata.drop_all(app_engine)
    Base.metadata.create_all(app_engine)
    passwords = {role: f"synthetic-{role}-password" for role in DEMO_ROLES}
    try:
        with SessionLocal() as session:
            project_id, emails = seed_demo_workspace(
                session, passwords, include_accepted_synthetic_baseline=True,
            )
            action_id = seed_synthetic_progress_history(session, project_id)
            action = session.get(PMIRSItem, action_id)
            assert action is not None
            action.data = {**action.data, "execution_status": "en_proceso", "progress_pct": 100}
            session.commit()

        login = client.get("/login")
        csrf = re.search(r'name="csrf" value="([^"]+)"', login.text)
        assert login.status_code == 200 and csrf
        signed_in = client.post(
            "/login",
            data={"email": emails["campo"], "password": passwords["campo"], "csrf": csrf.group(1)},
            follow_redirects=False,
        )
        assert signed_in.status_code == 303

        studio = client.get(f"/projects/{project_id}/pmirs")
        assert studio.status_code == 200
        assert 'data-action-progress-guidance' in studio.text
        assert "Trabajo reportado al 100 %; la acción sigue En proceso." in studio.text
        assert "Adjunta la evidencia esperada" in studio.text
        assert "QA/QC debe validar la evidencia y consultoría registrar el cierre" in studio.text
        assert "100 % no valida ni cierra la acción" in studio.text
    finally:
        Base.metadata.drop_all(app_engine)


def test_full_demo_training_scenario_accepts_only_synthetic_baseline_and_unlocks_field_progress(client):
    import io
    import json
    import re
    import zipfile

    from PIL import Image, ImageChops
    from app.db import SessionLocal, engine as app_engine
    from app.main import baseline_missing_forms, pmirs_document_sha256
    from app.models import FormRecord, FormRevision
    from pypdf import PdfReader

    def sign_in_synthetic(email: str, password: str) -> None:
        login_page = client.get("/login")
        token = re.search(r'name="csrf" value="([^"]+)"', login_page.text)
        assert login_page.status_code == 200 and token
        response = client.post(
            "/login", data={"email": email, "password": password, "csrf": token.group(1)},
            follow_redirects=False,
        )
        assert response.status_code == 303

    Base.metadata.drop_all(app_engine)
    Base.metadata.create_all(app_engine)
    passwords = {role: f"synthetic-{role}-password" for role in DEMO_ROLES}
    try:
        with SessionLocal() as session:
            project_id, emails = seed_demo_workspace(
                session, passwords, include_accepted_synthetic_baseline=True,
            )
            project = session.get(Project, project_id)
            assert project is not None
            assert project.baseline_status == "validada"
            assert project.baseline_reference.startswith("DEMO-")
            assert "una Línea Base de una copropiedad real" in project.baseline_note
            assert project.baseline_reviewed_by == next(
                user.id for user in session.scalars(select(User)) if user.email == emails["revisor"]
            )
            assert baseline_missing_forms(session, project_id) == []
            baseline_records = list(session.scalars(select(FormRecord).where(
                FormRecord.project_id == project_id,
                FormRecord.form_code.in_({"D-01", "D-02", "D-06", "D-07", "D-08", "Q-01"}),
            )))
            assert len(baseline_records) == 6
            assert all(record.status == "VALIDATED" and "DEMO" in record.source_note for record in baseline_records)
            assert all(record.reviewed_by == project.baseline_reviewed_by for record in baseline_records)
            for record in baseline_records:
                revision = session.scalar(select(FormRevision).where(
                    FormRevision.record_id == record.id, FormRevision.revision == 1,
                ))
                qa_event = session.scalar(select(AuditEvent).where(
                    AuditEvent.action == "qa_decision", AuditEvent.entity_id == record.id,
                    AuditEvent.actor_id == project.baseline_reviewed_by,
                ))
                assert revision is not None and "DEMO" in revision.note
                assert qa_event is not None and qa_event.detail["synthetic_demo"] is True

        login = client.get("/login")
        csrf = re.search(r'name="csrf" value="([^"]+)"', login.text)
        assert login.status_code == 200 and csrf
        signed_in = client.post(
            "/login",
            data={"email": emails["campo"], "password": passwords["campo"], "csrf": csrf.group(1)},
            follow_redirects=False,
        )
        assert signed_in.status_code == 303

        field_home = client.get(f"/projects/{project_id}")
        studio = client.get(f"/projects/{project_id}/pmirs")
        assert field_home.status_code == studio.status_code == 200
        assert "sandbox aislado con contenido ficticio" in field_home.text
        assert "Los cuatro expedientes residenciales siguen vacíos y separados." in field_home.text
        assert "Este expediente parte sin fuentes ni caracterización." not in field_home.text
        assert "Aceptada · DEMO" in field_home.text
        assert "Esta aceptación es sintética y existe solo para practicar el flujo" in field_home.text
        assert "DEMO-LB-001" in field_home.text
        assert "Registrar avance o novedad" in studio.text
        assert "Guardar avance" in studio.text
        assert "DEMO · practicar captura y revisión de evidencia" in studio.text
        csrf_form = re.search(r'name="csrf" value="([^"]+)"', studio.text)
        submission_key = re.search(r'name="submission_key" value="([^"]+)"', studio.text)
        with SessionLocal() as session:
            action = session.scalar(select(PMIRSItem).where(
                PMIRSItem.project_id == project_id, PMIRSItem.item_type == "accion",
            ))
            assert action is not None
            action_id = action.id
        assert csrf_form and submission_key
        evidence_form_match = re.search(
            rf'<form\b[^>]*action="/pmirs/items/{re.escape(action_id)}/evidence"[^>]*>.*?</form>',
            studio.text,
            re.DOTALL,
        )
        assert evidence_form_match
        assert 'accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.docx,.xlsx,.csv,.txt"' in evidence_form_match.group(0)
        assert "Fotos de celular: JPG, PNG o HEIC/HEIF." in evidence_form_match.group(0)
        heic_payload = (16).to_bytes(4, "big") + b"ftypheic\x00\x00\x00\x00"
        evidence_csrf = re.search(r'name="csrf" value="([^"]+)"', evidence_form_match.group(0))
        evidence_key = re.search(r'name="submission_key" value="([^"]+)"', evidence_form_match.group(0))
        assert evidence_csrf and evidence_key
        uploaded_evidence = client.post(
            f"/pmirs/items/{action_id}/evidence",
            data={"csrf": evidence_csrf.group(1), "submission_key": evidence_key.group(1)},
            files={"file": ("foto-sintetica-heic.heic", heic_payload, "image/heic")},
            follow_redirects=False,
        )
        assert uploaded_evidence.status_code == 303
        with SessionLocal() as session:
            saved_evidence = session.scalar(select(EvidenceFile).where(
                EvidenceFile.pmirs_item_id == action_id,
                EvidenceFile.project_id == project_id,
            ))
            assert saved_evidence is not None
            assert saved_evidence.media_type == "image/heic"
            assert saved_evidence.original_name == "foto-sintetica-heic.heic"
        progress_url = f"/pmirs/items/{action_id}/progress"
        progress_data = rendered_decision_data(client, progress_url, {
            "csrf": csrf_form.group(1), "submission_key": submission_key.group(1),
            "execution_status": "en_proceso", "progress_pct": "25",
            "progress_note": "Avance de práctica sintético.",
        })
        progress = client.post(
            progress_url,
            data=progress_data,
            follow_redirects=False,
        )
        assert progress.status_code == 303
        with SessionLocal() as session:
            saved_action = session.get(PMIRSItem, action_id)
            assert saved_action.data["execution_status"] == "en_proceso"
            assert saved_action.data["progress_pct"] == 25

        client.cookies.clear()
        sign_in_synthetic(emails["consultor"], passwords["consultor"])
        studio_path = f"/projects/{project_id}/pmirs"
        version_draft = client.post(
            f"/projects/{project_id}/pmirs/versions",
            data={
                "csrf": re.search(r'name="csrf" value="([^"]+)"', client.get(studio_path).text).group(1),
                "change_reason": "inicial",
                "change_summary": "Versión documental sintética para practicar revisión y firma.",
            },
            follow_redirects=False,
        )
        assert version_draft.status_code == 303
        with SessionLocal() as session:
            version = session.scalar(select(PMIRSVersion).where(PMIRSVersion.project_id == project_id))
            assert version is not None and version.status == "borrador"
            assert len(version.snapshot["items"]) == 3
            snapshot_items = version.snapshot["items"]
            internal_ids = {
                str(value)
                for item in snapshot_items
                for key, value in (item.get("data") or {}).items()
                if key in {"program_id", "indicator_id", "assignee_user_ids"}
                for value in (value if isinstance(value, list) else [value])
                if value
            }
            version_id = version.id

        internal_review = client.post(
            f"/pmirs/versions/{version_id}/status",
            data={
                "csrf": re.search(r'name="csrf" value="([^"]+)"', client.get(studio_path).text).group(1),
                "status": "revision_interna", "status_note": "Escenario sintético enviado a revisión interna.",
            },
            follow_redirects=False,
        )
        assert internal_review.status_code == 303

        client.cookies.clear()
        sign_in_synthetic(emails["revisor"], passwords["revisor"])
        approved_version = client.post(
            f"/pmirs/versions/{version_id}/status",
            data={
                "csrf": re.search(r'name="csrf" value="([^"]+)"', client.get(studio_path).text).group(1),
                "status": "aprobada_interna", "status_note": "QA/QC sintético completado para capacitación.",
            },
            follow_redirects=False,
        )
        assert approved_version.status_code == 303
        signature = client.post(
            f"/pmirs/versions/{version_id}/sign",
            data={
                "csrf": re.search(r'name="csrf" value="([^"]+)"', client.get(studio_path).text).group(1),
                "confirm_signature": "yes", "password": passwords["revisor"],
                "signature_strokes": json.dumps([[[0.08, 0.7], [0.32, 0.35], [0.58, 0.68], [0.9, 0.28]]]),
            },
            follow_redirects=False,
        )
        assert signature.status_code == 303

        signed_html = client.get(f"/pmirs/versions/{version_id}/export")
        assert signed_html.status_code == 200
        assert "Constancias de lectura y recepción" in signed_html.text
        assert "Revisoría QA/QC · DEMO" in signed_html.text
        assert "SHA-256 del contenido canónico de esta versión PMIRS" in signed_html.text
        assert "DEMO-PR-001 · DEMO · Separación y registro de jornadas" in signed_html.text
        assert "DEMO-IN-001 · DEMO · Jornadas con acta registrada" in signed_html.text
        assert "Novedad registrada" in signed_html.text
        assert "Avance de práctica sintético." in signed_html.text
        assert "Motivo de cierre" in signed_html.text
        assert "Estado del programa" in signed_html.text
        assert "aprobado_interno" not in signed_html.text and "VALIDATED" not in signed_html.text
        assert all(value not in signed_html.text for value in internal_ids)
        signed_pdf = client.get(f"/pmirs/versions/{version_id}/export.pdf")
        assert signed_pdf.status_code == 200 and signed_pdf.headers["content-type"] == "application/pdf"
        pdf_text = " ".join(" ".join(
            page.extract_text() or "" for page in PdfReader(io.BytesIO(signed_pdf.content)).pages
        ).split())
        assert "DEMO" in pdf_text and "Constancias de lectura y recepción" in pdf_text
        assert "Revisoría QA/QC · DEMO" in pdf_text
        assert "DEMO-PR-001 · DEMO · Separación y registro de jornadas" in pdf_text
        assert "DEMO-IN-001 · DEMO · Jornadas con acta registrada" in pdf_text
        assert "Aprobado internamente" in pdf_text and "En proceso" in pdf_text
        assert "1 persona asignada; consulta la identidad y membresía en RED" in pdf_text
        assert "Disponibilidad del dato No" in pdf_text
        assert "Novedad registrada" in pdf_text
        assert "Avance de práctica sintético." in pdf_text
        assert "SHA-256 del contenido canónico de esta versión PMIRS:" not in pdf_text
        assert "VALIDATED" not in pdf_text and "aprobado_interno" not in pdf_text
        assert all(value not in pdf_text for value in internal_ids)
        signed_docx = client.get(f"/pmirs/versions/{version_id}/export.docx")
        assert signed_docx.status_code == 200
        with zipfile.ZipFile(io.BytesIO(signed_docx.content)) as archive:
            assert "word/media/image1.png" in archive.namelist()
            signature_image = Image.open(io.BytesIO(archive.read("word/media/image1.png"))).convert("RGB")
            blank_signature_canvas = Image.new("RGB", signature_image.size, "white")
            assert ImageChops.difference(signature_image, blank_signature_canvas).getbbox() is not None
            document_text = archive.read("word/document.xml").decode("utf-8")
            assert "Constancias de lectura y recepción" in document_text
            assert "Revisoría QA/QC · DEMO" in document_text
            assert "DEMO-PR-001 · DEMO · Separación y registro de jornadas" in document_text
            assert "DEMO-IN-001 · DEMO · Jornadas con acta registrada" in document_text
            assert "Novedad registrada" in document_text
            assert "Avance de práctica sintético." in document_text
            assert "Huella SHA-256 del contenido canónico de esta versión PMIRS" not in document_text
            assert "aprobado_interno" not in document_text and "VALIDATED" not in document_text
            assert all(value not in document_text for value in internal_ids)
        with SessionLocal() as session:
            saved_version = session.get(PMIRSVersion, version_id)
            saved_signature = session.scalar(select(PMIRSSignature).where(
                PMIRSSignature.version_id == version_id,
            ))
            assert saved_version.status == "aprobada_interna"
            assert saved_signature is not None
            assert saved_signature.signer_user_id == next(
                user.id for user in session.scalars(select(User)) if user.email == emails["revisor"]
            )
            assert saved_signature.document_sha256 == pmirs_document_sha256(saved_version)
            assert session.scalar(select(AuditEvent).where(
                AuditEvent.action == "pmirs_version_signed", AuditEvent.entity_id == version_id,
            )) is not None
    finally:
        Base.metadata.drop_all(app_engine)


def test_demo_seed_requires_a_complete_disposable_credential_set():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session, pytest.raises(ValueError, match="perfiles DEMO"):
            seed_demo_workspace(session, {"admin": "not-enough"})
        with Session(engine) as session:
            assert list(session.scalars(select(Project))) == []
            assert list(session.scalars(select(User))) == []
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.mark.parametrize("field,value", [
    ("municipality", "Municipio personalizado"),
    ("address", "Dirección personalizada"),
    ("baseline_reference", "REFERENCIA-PERSONALIZADA"),
    ("identity_status", "confirmada"),
    ("origin_note", "Nota personalizada"),
])
def test_demo_seed_refuses_to_replace_an_existing_qa_project(field, value):
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    passwords = {role: f"synthetic-{role}-password" for role in DEMO_ROLES}
    try:
        with Session(engine) as session:
            project = Project(
                slug="qa-synthetic-custom", name="Conjunto QA sintético personalizado",
                municipality="Municipio sintético", department="Departamento sintético",
            )
            session.add(project)
            session.commit()
            setattr(project, field, value)
            session.commit()

            with pytest.raises(ValueError, match="solo puede conservar"):
                seed_demo_workspace(session, passwords)
            assert getattr(session.get(Project, project.id), field) == value
            assert len(list(session.scalars(select(Project)))) == 1
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.mark.parametrize("quota_rows", [[(1, 1)], [(2, 0)], [(1, 0), (2, 0)]])
def test_demo_seed_rejects_used_or_altered_quota_control(quota_rows):
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    try:
        with Session(engine) as session:
            session.add_all(EvidenceQuotaLock(id=key, generation=generation) for key, generation in quota_rows)
            session.commit()
            with pytest.raises(ValueError, match="control de cuotas"):
                seed_demo_workspace(session, {role: f"synthetic-{role}-password" for role in DEMO_ROLES})
            assert session.execute(select(EvidenceQuotaLock.id, EvidenceQuotaLock.generation)).all() == quota_rows
            assert list(session.scalars(select(User))) == []
            assert list(session.scalars(select(Project))) == []
    finally:
        engine.dispose()


def test_demo_runtime_overrides_hosted_and_external_service_environment(tmp_path, monkeypatch):
    monkeypatch.setenv("RENDER", "true")
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "must-not-inherit")
    monkeypatch.setenv("S3_BUCKET", "must-not-inherit")
    monkeypatch.setenv("RED_SUPERVISED_PILOT_APPROVED", "true")
    env = _local_environment(tmp_path, 18798)

    assert env["APP_ENV"] == "local"
    assert "RENDER" not in env
    assert "GOOGLE_CLIENT_ID" not in env
    assert "S3_BUCKET" not in env
    assert env["RED_SUPERVISED_PILOT_APPROVED"] == "false"
    assert env["RED_PRIVACY_APPROVED"] == "false"
    assert env["RED_OPERATIONAL_WRITES_ENABLED"] == "true"
    assert env["RED_PUBLIC_ACCESS_ENABLED"] == "false"
