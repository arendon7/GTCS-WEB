from __future__ import annotations

import os
import shutil
import tempfile
from datetime import date
from pathlib import Path

import pytest


TEST_ROOT = Path(tempfile.mkdtemp(prefix="greenatics-red-tests-"))
os.environ["APP_ENV"] = "local"
os.environ["RED_OPERATIONAL_WRITES_ENABLED"] = "true"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_ROOT / 'red-tests.sqlite3'}"
os.environ["RED_STORAGE_ROOT"] = str(TEST_ROOT / "private")
os.environ["STORAGE_BACKEND"] = "local"
os.environ["SESSION_SECRET"] = "synthetic-test-session-secret-with-more-than-32-characters"
os.environ["SESSION_HTTPS_ONLY"] = "false"
os.environ["TRUSTED_HOSTS"] = "testserver,localhost,127.0.0.1"
os.environ["PUBLIC_BASE_URL"] = "http://testserver"
os.environ["RED_PUBLIC_ACCESS_ENABLED"] = "false"

from app.db import Base, SessionLocal, engine  # noqa: E402
from app.models import Project, ProjectMembership, ProjectVisitAuthorization, User  # noqa: E402
from app.security import hash_password  # noqa: E402


PASSWORD = "Synthetic-RED-Password-2026"
PASSWORD_HASH = hash_password(PASSWORD)
SYNTHETIC_PROJECTS = tuple(
    (f"qa-synthetic-{letter}", f"Conjunto QA sintético {letter.upper()}")
    for letter in "abcd"
)
PROJECT_NAMES = [name for _slug, name in SYNTHETIC_PROJECTS]
PROJECT_SLUGS = [slug for slug, _name in SYNTHETIC_PROJECTS]


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_root_after_suite():
    try:
        yield
    finally:
        engine.dispose()
        shutil.rmtree(TEST_ROOT, ignore_errors=True)


@pytest.fixture
def workspace():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        projects = [
            Project(slug=slug, name=name, municipality="Bello", department="Antioquia")
            for slug, name in zip(PROJECT_SLUGS, PROJECT_NAMES, strict=True)
        ]
        admin = User(
            email="admin@red.test", full_name="Admin RED", password_hash=PASSWORD_HASH,
            is_platform_admin=True,
        )
        field = User(email="field@red.test", full_name="Operario", password_hash=PASSWORD_HASH)
        reviewer = User(email="reviewer@red.test", full_name="Revisor", password_hash=PASSWORD_HASH)
        consultant = User(email="consultant@red.test", full_name="Consultor", password_hash=PASSWORD_HASH)
        reader = User(email="reader@red.test", full_name="Lector", password_hash=PASSWORD_HASH)
        session.add_all([*projects, admin, field, reviewer, consultant, reader])
        session.flush()
        memberships = [
            ProjectMembership(project_id=projects[0].id, user_id=field.id, role="campo"),
            ProjectMembership(project_id=projects[0].id, user_id=reviewer.id, role="revisor"),
            ProjectMembership(project_id=projects[0].id, user_id=consultant.id, role="consultor"),
            ProjectMembership(project_id=projects[0].id, user_id=reader.id, role="lector"),
        ]
        session.add_all(memberships)
        session.add_all([
            ProjectVisitAuthorization(
                project_id=project.id, status="approved",
                site_access_reference=f"SYNTHACCESS{index:03d}", privacy_reference=f"SYNTHPRIVACY{index:03d}",
                method_reference=f"SYNTHMETHOD{index:03d}", sst_reference=f"SYNTHSST{index:03d}",
                valid_until=date(2099, 12, 31), created_by=admin.id,
            )
            for index, project in enumerate(projects, start=1)
        ])
        session.commit()
        result = {
            "project_ids": [project.id for project in projects],
            "user_ids": {
                "admin": admin.id,
                "field": field.id,
                "reviewer": reviewer.id,
                "consultant": consultant.id,
                "reader": reader.id,
            },
        }
    yield result
    Base.metadata.drop_all(engine)


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
