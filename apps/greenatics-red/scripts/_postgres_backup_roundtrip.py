"""Internal helper for qa_postgres_integration.py; never run against live data."""
from __future__ import annotations

import hashlib
import os
import re
import sys
from datetime import timedelta
from pathlib import Path

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session


APP_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP_DIR))

source_schema = os.environ.get("DATABASE_SCHEMA", "")
restore_schema = os.environ.get("RED_QA_RESTORE_SCHEMA", "")
if not all(re.fullmatch(r"red_qa_[0-9a-f]{32}", value) for value in (source_schema, restore_schema)):
    raise SystemExit("El ayudante solo opera en los dos esquemas aleatorios red_qa creados por el verificador.")
if source_schema == restore_schema:
    raise SystemExit("Los esquemas PostgreSQL de captura y recuperación deben ser distintos.")

from app.backups import build_backup_archive, restore_backup_archive, verify_backup_archive  # noqa: E402
from app.config import settings  # noqa: E402
from app.db import SessionLocal  # noqa: E402
from app.models import (  # noqa: E402
    EvidenceFile,
    FormRecord,
    Project,
    ProjectMembership,
    User,
)
from app.security import hash_password  # noqa: E402
from app.storage import StorageService  # noqa: E402


def main() -> int:
    source_storage = StorageService(
        backend="filesystem",
        local_root=Path(os.environ["RED_STORAGE_ROOT"]),
    )
    evidence_bytes = b"GREENATICS RED PostgreSQL backup QA synthetic evidence."
    evidence_key = ""

    try:
        with SessionLocal() as session:
            project = session.scalar(select(Project).where(Project.slug == "qa-synthetic-a"))
            if project is None:
                raise RuntimeError("No existe el expediente sintético esperado en el esquema de origen.")
            admin = User(
                email="qa-postgres-admin@red.test",
                full_name="Administrador QA sintético",
                password_hash=hash_password("Synthetic-RED-Postgres-QA-Password"),
                is_platform_admin=True,
            )
            session.add(admin)
            session.commit()

        from fastapi.testclient import TestClient
        from app.main import app
        from app.visit_authorizations import visit_today

        field_email = "qa-postgres-field@red.test"
        field_password = "Synthetic-RED-Postgres-Field-QA-Password"
        field_full_name = "Operario QA sintético"
        invite_token = ""
        expected_record_id = ""
        with TestClient(app) as admin_client:
            login_page = admin_client.get("/login")
            login_csrf = re.search(r'name="csrf" value="([^"]+)"', login_page.text)
            if login_page.status_code != 200 or not login_csrf:
                raise RuntimeError("No se pudo abrir el acceso del administrador sintético.")
            login = admin_client.post("/login", data={
                "email": "qa-postgres-admin@red.test",
                "password": "Synthetic-RED-Postgres-QA-Password",
                "csrf": login_csrf.group(1),
            }, follow_redirects=False)
            if login.status_code != 303:
                raise RuntimeError("No se pudo iniciar sesión como administración sintética en PostgreSQL.")

            users_page = admin_client.get("/admin/users")
            users_csrf = re.search(r'name="csrf" value="([^"]+)"', users_page.text)
            if users_page.status_code != 200 or not users_csrf:
                raise RuntimeError("La administración de usuarios no abrió en PostgreSQL.")
            invitation_response = admin_client.post("/admin/invitations", data={
                "csrf": users_csrf.group(1),
                "email": field_email,
                "full_name": field_full_name,
                "project_id": project.id,
                "role": "campo",
            })
            invitation_link = re.search(
                r'id="invite-link" readonly value="([^"]+)"', invitation_response.text,
            )
            if invitation_response.status_code != 200 or not invitation_link:
                raise RuntimeError("No se pudo crear la invitación sintética de perfil campo.")
            invite_token = invitation_link.group(1).rsplit("/", 1)[-1]

            project_page = admin_client.get(f"/projects/{project.id}")
            project_csrf = re.search(r'name="csrf" value="([^"]+)"', project_page.text)
            if project_page.status_code != 200 or not project_csrf:
                raise RuntimeError("No se pudo abrir el expediente para autorizar la visita de prueba.")

            with TestClient(app) as field_client:
                invite_path = f"/invitations/accept/{invite_token}"
                invitation_page = field_client.get(invite_path)
                invitation_csrf = re.search(r'name="csrf" value="([^"]+)"', invitation_page.text)
                if invitation_page.status_code != 200 or not invitation_csrf:
                    raise RuntimeError("El enlace de invitación sintético no abrió.")
                accepted = field_client.post(invite_path, data={
                    "csrf": invitation_csrf.group(1),
                    "password": field_password,
                    "password_confirm": field_password,
                }, follow_redirects=False)
                if accepted.status_code != 303:
                    raise RuntimeError("El operario sintético no pudo aceptar la invitación.")
                if field_client.get(f"/projects/{project.id}").status_code != 200:
                    raise RuntimeError("El operario no recibió acceso al expediente asignado.")
                other_project = field_client.get("/projects/qa-synthetic-b")
                if other_project.status_code != 404:
                    raise RuntimeError("El operario recibió acceso fuera del expediente invitado.")
                if field_client.get(invite_path).status_code != 410:
                    raise RuntimeError("El enlace de invitación se pudo reutilizar.")

                form_path = f"/projects/{project.id}/records/new?form_code=D-11"
                locked_form = field_client.get(form_path)
                if locked_form.status_code != 200 or "Vista de consulta" not in locked_form.text:
                    raise RuntimeError("El formulario de campo no se bloqueó antes de autorizar la visita.")
                authorization = admin_client.post(f"/projects/{project.id}/visit-authorization", data={
                    "csrf": project_csrf.group(1),
                    "action": "approve",
                    "site_access_reference": "QA-SITE-2026-01",
                    "privacy_reference": "QA-PRIVACY-2026-01",
                    "method_reference": "QA-METHOD-2026-01",
                    "sst_reference": "QA-SST-2026-01",
                    "reviewed_external_supports": "on",
                    "valid_until": (visit_today() + timedelta(days=30)).isoformat(),
                }, follow_redirects=False)
                if authorization.status_code != 303:
                    raise RuntimeError("No se pudo guardar la autorización de visita exclusivamente sintética.")
                writable_form = field_client.get(form_path)
                if writable_form.status_code != 200 or "Vista de consulta" in writable_form.text:
                    raise RuntimeError("El formulario siguió bloqueado después de la autorización sintética.")
                field_csrf = re.search(r'name="csrf" value="([^"]+)"', writable_form.text)
                submission_key = re.search(r'name="submission_key" value="([^"]+)"', writable_form.text)
                if not field_csrf or not submission_key:
                    raise RuntimeError("El formulario de captura no entregó CSRF o clave de envío.")
                saved = field_client.post(
                    f"/projects/{project.id}/records/new",
                    data={
                        "csrf": field_csrf.group(1),
                        "submission_key": submission_key.group(1),
                        "form_code": "D-11",
                        "record_title": "Evidencia sintética de captura PostgreSQL",
                        "source_note": "Ejercicio técnico aislado; no representa una unidad real.",
                        "action": "draft",
                    },
                    files={"evidence__D11-004": ("evidencia-sintetica-qa.txt", evidence_bytes, "text/plain")},
                    follow_redirects=False,
                )
                if saved.status_code != 303 or not saved.headers.get("location", "").startswith("/records/"):
                    raise RuntimeError("El operario no pudo guardar la captura sintética con evidencia.")
                expected_record_id = saved.headers["location"].split("/records/", 1)[1].split("?", 1)[0]
                if field_client.get(saved.headers["location"]).status_code != 200:
                    raise RuntimeError("El registro capturado no pudo consultarse desde la cuenta de campo.")

        with SessionLocal() as session:
            field_user = session.scalar(select(User).where(User.email == field_email))
            membership = session.scalar(select(ProjectMembership).where(
                ProjectMembership.user_id == field_user.id if field_user else False,
                ProjectMembership.project_id == project.id,
            ))
            record = session.get(FormRecord, expected_record_id)
            evidence = session.scalar(select(EvidenceFile).where(EvidenceFile.record_id == expected_record_id))
            if not field_user or not field_user.active or not membership or membership.role != "campo":
                raise RuntimeError("La aceptación de invitación no creó una cuenta activa con rol campo.")
            if not record or record.created_by != field_user.id or not evidence:
                raise RuntimeError("La captura PostgreSQL no quedó asociada al operario y a la evidencia.")
            evidence_key = f"evidence/{evidence.storage_name}"
            stored_bytes = source_storage.get_bytes(f"evidence/{evidence.storage_name}")
            if stored_bytes != evidence_bytes or evidence.sha256 != hashlib.sha256(evidence_bytes).hexdigest():
                raise RuntimeError("La evidencia capturada no conserva sus bytes/hash de origen.")

        with SessionLocal() as session:
            record = session.get(FormRecord, expected_record_id)
            archive_bytes, counts = build_backup_archive(session, storage_service=source_storage)
            if counts.get("records") != 1 or counts.get("evidence_files") != 1:
                raise RuntimeError("El respaldo sintético no incluyó el registro y archivo esperados.")
            manifest = verify_backup_archive(archive_bytes)
            if manifest.get("counts") != counts:
                raise RuntimeError("El manifiesto del respaldo no coincide con los conteos capturados.")

        restore_storage_root = Path(os.environ["RED_QA_RESTORE_STORAGE_ROOT"])
        restore_storage = StorageService(backend="filesystem", local_root=restore_storage_root)
        target_engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            connect_args={"options": f"-csearch_path={restore_schema}"},
        )
        try:
            restored = restore_backup_archive(
                archive_bytes,
                admin_email="qa-postgres-admin@red.test",
                admin_name="Administrador QA restaurado",
                admin_password="Synthetic-RED-Restored-QA-Password",
                target_engine=target_engine,
                storage_service=restore_storage,
            )
            with Session(target_engine) as session:
                project_count = session.scalar(select(func.count()).select_from(Project))
                restored_record = session.get(FormRecord, expected_record_id)
                evidence = session.scalar(select(EvidenceFile).where(EvidenceFile.record_id == expected_record_id))
                admin = session.scalar(select(User).where(User.email == "qa-postgres-admin@red.test"))
                field_user = session.scalar(select(User).where(User.email == "qa-postgres-field@red.test"))
                membership = session.scalar(select(ProjectMembership).where(ProjectMembership.user_id == field_user.id)) if field_user else None
                if project_count != 2 or restored_record is None or evidence is None or not admin or not admin.active:
                    raise RuntimeError("La recuperación no restauró los dos proyectos sintéticos, el registro, la evidencia y el administrador.")
                if not field_user or field_user.active or not membership or membership.project_id != restored_record.project_id or membership.role != "campo":
                    raise RuntimeError("La recuperación no conservó inactiva la cuenta previa y la membresía de campo.")
                restored_bytes = restore_storage.get_bytes(f"evidence/{evidence.storage_name}")
                if restored_bytes != evidence_bytes or restored.get("counts", {}).get("evidence_files") != 1:
                    raise RuntimeError("La recuperación no conservó el contenido verificado de la evidencia.")
        finally:
            target_engine.dispose()

        with TestClient(app) as client:
            health = client.get("/api/health")
            if health.status_code != 200 or health.json().get("status") != "ok":
                raise RuntimeError("El runtime RED no pasó /api/health contra PostgreSQL.")

        print("PostgreSQL QA: admin invitó y activó operario; rol/proyecto aislados; captura D-11 y evidencia íntegra; backup y restore aislado OK; /api/health OK.")
        return 0
    finally:
        if evidence_key:
            source_storage.delete(evidence_key)


if __name__ == "__main__":
    raise SystemExit(main())
