from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from threading import Barrier

import pytest
import re
from sqlalchemy import select

from app import main as app_main
from app.config import settings
from app.evidence_quota import evidence_usage_by_project, lock_and_check_evidence_capacity
from app.models import EvidenceFile, OperationalReference
from app.db import SessionLocal


def test_evidence_quota_enforces_project_and_global_caps_and_tracks_deletes(workspace):
    project_a, project_b = workspace["project_ids"][:2]
    actor_id = workspace["user_ids"]["admin"]

    with SessionLocal() as session:
        lock_and_check_evidence_capacity(
            session, project_id=project_a, incoming_bytes=8,
            total_limit_bytes=20, project_limit_bytes=10,
        )
        session.add(EvidenceFile(
            project_id=project_a, original_name="synthetic.txt", storage_name="quota-a.txt",
            media_type="text/plain", size_bytes=8, sha256="a" * 64, created_by=actor_id,
        ))
        session.commit()

    with SessionLocal() as session:
        with pytest.raises(ValueError, match="límite de evidencia"):
            lock_and_check_evidence_capacity(
                session, project_id=project_a, incoming_bytes=3,
                total_limit_bytes=20, project_limit_bytes=10,
            )
        session.rollback()

    with SessionLocal() as session:
        lock_and_check_evidence_capacity(
            session, project_id=project_b, incoming_bytes=8,
            total_limit_bytes=20, project_limit_bytes=10,
        )
        session.add(EvidenceFile(
            project_id=project_b, original_name="synthetic.txt", storage_name="quota-b.txt",
            media_type="text/plain", size_bytes=8, sha256="b" * 64, created_by=actor_id,
        ))
        session.commit()

    with SessionLocal() as session:
        with pytest.raises(ValueError, match="límite total"):
            lock_and_check_evidence_capacity(
                session, project_id=project_b, incoming_bytes=1,
                total_limit_bytes=16, project_limit_bytes=10,
            )
        session.rollback()

    with SessionLocal() as session:
        evidence = session.scalar(select(EvidenceFile).where(EvidenceFile.storage_name == "quota-a.txt"))
        session.delete(evidence)
        session.commit()

    with SessionLocal() as session:
        lock_and_check_evidence_capacity(
            session, project_id=project_a, incoming_bytes=10,
            total_limit_bytes=20, project_limit_bytes=10,
        )
        session.rollback()


def test_evidence_quota_checks_each_project_in_restore_batch(workspace):
    project_a, project_b = workspace["project_ids"][:2]

    with SessionLocal() as session:
        with pytest.raises(ValueError, match="límite de evidencia"):
            lock_and_check_evidence_capacity(
                session, incoming_by_project={project_a: 4, project_b: 11},
                total_limit_bytes=30, project_limit_bytes=10,
            )


def test_concurrent_evidence_quota_checks_cannot_both_consume_same_capacity(workspace):
    project_id = workspace["project_ids"][0]
    actor_id = workspace["user_ids"]["admin"]
    start = Barrier(2)

    def upload(storage_name: str) -> str:
        with SessionLocal() as session:
            start.wait()
            try:
                lock_and_check_evidence_capacity(
                    session, project_id=project_id, incoming_bytes=6,
                    total_limit_bytes=10, project_limit_bytes=10,
                )
                session.add(EvidenceFile(
                    project_id=project_id, original_name="sintetico.txt", storage_name=storage_name,
                    media_type="text/plain", size_bytes=6, sha256="c" * 64, created_by=actor_id,
                ))
                session.commit()
                return "aceptado"
            except ValueError:
                session.rollback()
                return "rechazado"

    with ThreadPoolExecutor(max_workers=2) as pool:
        outcomes = list(pool.map(upload, ["quota-race-a.txt", "quota-race-b.txt"]))
    assert sorted(outcomes) == ["aceptado", "rechazado"]


def test_operational_reference_route_rejects_when_evidence_quota_is_full(client, workspace, monkeypatch):
    project_id = workspace["project_ids"][0]
    actor_id = workspace["user_ids"]["admin"]
    monkeypatch.setattr(app_main, "settings", replace(
        settings, max_evidence_total_mb=1, max_evidence_project_mb=1,
    ))
    with SessionLocal() as session:
        session.add(EvidenceFile(
            project_id=project_id, original_name="lleno.txt", storage_name="quota-full.txt",
            media_type="text/plain", size_bytes=1024 * 1024, sha256="d" * 64, created_by=actor_id,
        ))
        session.commit()

    csrf = client.get("/login")
    token = re.search(r'name="csrf" value="([^\"]+)"', csrf.text).group(1)
    assert client.post("/login", data={
        "email": "admin@red.test", "password": "Synthetic-RED-Password-2026", "csrf": token,
    }, follow_redirects=False).status_code == 303
    page_path = f"/projects/{project_id}/operational-references"
    page = client.get(page_path)
    route_csrf = re.search(r'name="csrf" value="([^\"]+)"', page.text).group(1)
    response = client.post(page_path, data={
        "csrf": route_csrf, "category": "guia_operativa", "title": "Guía sintética",
        "version_label": "v1", "source_note": "Documento sintético de prueba de la cuota de almacenamiento.",
    }, files={"file": ("guia.pdf", b"%PDF-1.7\nsynthetic quota proof", "application/pdf")})
    assert response.status_code == 413
    assert "límite total" in response.json()["detail"]
    with SessionLocal() as session:
        assert session.scalar(select(OperationalReference.id)) is None


def test_storage_usage_is_shown_to_platform_admin_but_not_project_profiles(client, workspace, monkeypatch):
    project_a, project_b, project_c = workspace["project_ids"][:3]
    actor_id = workspace["user_ids"]["admin"]
    monkeypatch.setattr(app_main, "settings", replace(
        settings, max_evidence_total_mb=10, max_evidence_project_mb=4,
    ))
    with SessionLocal() as session:
        session.add_all([
            EvidenceFile(
                project_id=project_a, original_name="sintetico-a.txt", storage_name="usage-a.txt",
                media_type="text/plain", size_bytes=1_572_864, sha256="e" * 64, created_by=actor_id,
            ),
            EvidenceFile(
                project_id=project_b, original_name="sintetico-b.txt", storage_name="usage-b.txt",
                media_type="text/plain", size_bytes=524_288, sha256="f" * 64, created_by=actor_id,
            ),
        ])
        session.commit()
        usage = evidence_usage_by_project(session)
        assert usage == {project_a: 1_572_864, project_b: 524_288}

    def authenticate(email: str) -> None:
        login_page = client.get("/login")
        token = re.search(r'name="csrf" value="([^\"]+)"', login_page.text).group(1)
        response = client.post("/login", data={
            "email": email, "password": "Synthetic-RED-Password-2026", "csrf": token,
        }, follow_redirects=False)
        assert response.status_code == 303

    authenticate("admin@red.test")
    admin_dashboard = client.get("/")
    assert admin_dashboard.status_code == 200
    assert 'aria-labelledby="storage-capacity-heading"' in admin_dashboard.text
    assert "1.5 MB usados de 4 MB" in admin_dashboard.text
    assert "2.5 MB disponibles" in admin_dashboard.text
    assert "2.0 MB usados de 10 MB" in admin_dashboard.text
    assert "8.0 MB disponibles" in admin_dashboard.text
    assert "no confirman la capacidad contratada del proveedor" in admin_dashboard.text
    assert "RED_MAX_EVIDENCE_TOTAL_MB" in admin_dashboard.text
    assert workspace["project_ids"][2] in admin_dashboard.text

    authenticate("field@red.test")
    field_dashboard = client.get("/")
    assert field_dashboard.status_code == 200
    assert "storage-capacity-panel" not in field_dashboard.text
    assert workspace["project_ids"][2] not in field_dashboard.text
