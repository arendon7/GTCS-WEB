"""Internal helper for qa_postgres_integration.py; never run against live data."""
from __future__ import annotations

import hashlib
import os
import re
import sys
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
    new_id,
)
from app.security import hash_password  # noqa: E402
from app.storage import StorageService  # noqa: E402


def main() -> int:
    source_storage = StorageService(
        backend="filesystem",
        local_root=Path(os.environ["RED_STORAGE_ROOT"]),
    )
    evidence_bytes = b"GREENATICS RED PostgreSQL backup QA synthetic evidence."
    storage_name = f"qa-{new_id()}.txt"
    evidence_key = f"evidence/{storage_name}"
    source_storage.put_bytes(evidence_key, evidence_bytes, "text/plain")

    try:
        with SessionLocal() as session:
            project = session.scalar(select(Project).where(Project.slug == "bello-parque-alto"))
            if project is None:
                raise RuntimeError("No existe el expediente sintético esperado en el esquema de origen.")
            admin = User(
                email="qa-postgres-admin@red.test",
                full_name="Administrador QA sintético",
                password_hash=hash_password("Synthetic-RED-Postgres-QA-Password"),
                is_platform_admin=True,
            )
            session.add(admin)
            session.flush()
            session.add(ProjectMembership(project_id=project.id, user_id=admin.id, role="campo"))
            record = FormRecord(
                project_id=project.id,
                form_code="D-11",
                title="Evidencia sintética para probar respaldo PostgreSQL",
                status="RAW",
                source_kind="observado",
                source_note="Ejercicio técnico aislado; no representa una unidad real.",
                payload={"synthetic": True, "purpose": "postgres-backup-restore-qa"},
                created_by=admin.id,
                updated_by=admin.id,
            )
            session.add(record)
            session.flush()
            session.add(EvidenceFile(
                project_id=project.id,
                record_id=record.id,
                field_id="D11-008",
                original_name="evidencia-sintetica-qa.txt",
                storage_name=storage_name,
                media_type="text/plain",
                size_bytes=len(evidence_bytes),
                sha256=hashlib.sha256(evidence_bytes).hexdigest(),
                created_by=admin.id,
            ))
            session.commit()
            expected_record_id = record.id

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
                membership = session.scalar(select(ProjectMembership).where(ProjectMembership.user_id == admin.id)) if admin else None
                if project_count != 4 or restored_record is None or evidence is None or not admin or not admin.active:
                    raise RuntimeError("La recuperación no restauró los cuatro proyectos, el registro, la evidencia y el administrador.")
                if not membership or membership.project_id != restored_record.project_id:
                    raise RuntimeError("La recuperación no restauró la membresía del administrador QA.")
                restored_bytes = restore_storage.get_bytes(f"evidence/{evidence.storage_name}")
                if restored_bytes != evidence_bytes or restored.get("counts", {}).get("evidence_files") != 1:
                    raise RuntimeError("La recuperación no conservó el contenido verificado de la evidencia.")
        finally:
            target_engine.dispose()

        from fastapi.testclient import TestClient
        from app.main import app

        with TestClient(app) as client:
            health = client.get("/api/health")
            if health.status_code != 200 or health.json().get("status") != "ok":
                raise RuntimeError("El runtime RED no pasó /api/health contra PostgreSQL.")

        print("PostgreSQL QA: backup ZIP verificado, restore en segundo esquema, cuatro proyectos, usuario/membresía y evidencia OK; /api/health OK.")
        return 0
    finally:
        source_storage.delete(evidence_key)


if __name__ == "__main__":
    raise SystemExit(main())
