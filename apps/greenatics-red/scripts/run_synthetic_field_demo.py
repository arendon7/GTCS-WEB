#!/usr/bin/env python3
"""Run a disposable, local-only RED training workspace for field workflows.

The database contains only a prominently labeled DEMO project. Its synthetic
visit approval is intentionally scoped to that disposable workspace and is not
evidence of access, privacy, method, or SST approval for any real copropiedad.
"""

from __future__ import annotations

import argparse
import errno
import os
import secrets
import shutil
import socket
import sqlite3
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import webbrowser
from datetime import timedelta
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parents[1]
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

DEMO_PROJECT_SLUG = "demo-captura-campo"
DEMO_PROJECT_NAME = "DEMO · CAPTURA DE CAMPO · NO ES UNA AUTORIZACIÓN REAL"
DEMO_ROLES = {
    "admin": ("demo-admin@red-demo.local", "Administración RED · DEMO"),
    "consultor": ("demo-consultoria@red-demo.local", "Consultoría · DEMO"),
    "campo": ("demo-operario@red-demo.local", "Operario de campo · DEMO"),
    "revisor": ("demo-revision@red-demo.local", "Revisoría QA/QC · DEMO"),
    "administracion_ph": ("demo-ph@red-demo.local", "Administración PH · DEMO"),
    "lector": ("demo-lector@red-demo.local", "Lectoría · DEMO"),
}


def _port_is_available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind(("127.0.0.1", port))
        except OSError as exc:
            if exc.errno == errno.EADDRINUSE:
                return False
            raise
    return True


def _require_current_migration(database_path: Path) -> None:
    """Check the disposable database against the repository's migration heads."""
    from alembic.config import Config
    from alembic.script import ScriptDirectory

    config = Config(str(PROJECT_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(PROJECT_DIR / "migrations"))
    config.set_main_option("path_separator", "os")
    expected = set(ScriptDirectory.from_config(config).get_heads())
    try:
        with sqlite3.connect(database_path.resolve().as_uri() + "?mode=ro", uri=True) as connection:
            applied = {row[0] for row in connection.execute("SELECT version_num FROM alembic_version")}
    except sqlite3.Error as exc:
        raise RuntimeError("No se pudo verificar la migración de la base temporal DEMO.") from exc
    if not expected or applied != expected:
        raise RuntimeError("La base temporal no alcanzó la última migración RED.")


def _seed_accepted_synthetic_baseline(session, project, users) -> None:
    """Seed a deliberately synthetic, auditable baseline for the optional training path."""
    from app.main import FORM_BY_CODE, baseline_missing_forms, d07_submission_errors, d08_submission_errors, submission_errors
    from app.models import AuditEvent, FormRecord, FormRevision, now_utc
    from app.visit_authorizations import visit_today

    date_value = visit_today().isoformat()
    source_note = (
        "DEMO sintético para practicar el flujo RED; no corresponde a una visita, medición, contrato "
        "ni unidad residencial real."
    )
    reviewer = users["revisor"]
    rows = [
        ("D-01", "DEMO · Identidad de expediente sintético", "declarado", users["administracion_ph"], {
            "D01-002": "Conjunto de práctica DEMO", "D01-003": "Dirección ficticia DEMO",
            "D01-004": "Bello (dato ilustrativo DEMO)", "D01-007": "Administración sintética DEMO",
            "D01-008": "administracion@example.invalid", "D01-011": "100",
            "D01-013": "90", "D01-016": "Prospecto", "D01-017": users["campo"].id,
            "D01-018": users["consultor"].id, "D01-019": "Declarado",
        }),
        ("D-02", "DEMO · Condiciones de servicio sintéticas", "declarado", users["administracion_ph"], {
            "D02-001": "90", "D02-002": "3", "D02-004": "Lunes\nMiércoles",
            "D02-008": "Sin aprovechamiento reportado en este ejemplo ficticio",
            "D02-010": "1", "D02-012": "No", "D02-014": "Sí — Administración PH sintética",
        }),
        ("D-06", "DEMO · Jornada de caracterización sintética", "observado", users["campo"], {
            "D06-004": "24 horas", "D06-006": "No", "D06-008": users["campo"].id,
        }),
    ]
    records: dict[str, FormRecord] = {}
    for code, title, source_kind, author, payload in rows:
        record = FormRecord(
            project_id=project.id, form_code=code, title=title, status="VALIDATED",
            record_date=date_value, source_kind=source_kind, source_note=source_note,
            payload=payload, version=1, created_by=author.id, updated_by=reviewer.id,
            reviewed_by=reviewer.id,
            review_note="Revisión QA/QC sintética para capacitación; no es aprobación de datos reales.",
            reviewed_at=now_utc(),
        )
        session.add(record)
        session.flush()
        records[code] = record
        session.add(FormRevision(
            record_id=record.id, revision=1, payload=dict(payload),
            note="Versión inicial sintética de capacitación DEMO.", changed_by=author.id,
        ))
        session.add_all([
            AuditEvent(
                project_id=project.id, actor_id=author.id, action="record_created",
                entity_type="form_record", entity_id=record.id,
                detail={"form_code": code, "status": "PENDING_REVIEW", "synthetic_demo": True},
            ),
            AuditEvent(
                project_id=project.id, actor_id=reviewer.id, action="qa_decision",
                entity_type="form_record", entity_id=record.id,
                detail={"from_status": "PENDING_REVIEW", "to_status": "VALIDATED", "synthetic_demo": True},
            ),
        ])

    equipment = FormRecord(
        project_id=project.id, form_code="D-13", title="DEMO · Equipo de práctica no metrológico",
        status="VALIDATED", record_date=date_value, source_kind="observado", source_note=source_note,
        payload={
            "D13-001": "EQUIPO-DEMO-01", "D13-002": "Instrumento de práctica ficticio",
            "D13-004": "50 kg", "D13-006": "Operativo",
            "D13-007": "Verificación visual sintética; no acredita calibración ni aptitud real.",
            "D13-009": "DEMO: sin evaluación de aplicabilidad metrológica ni certificado real.",
        },
        version=1, created_by=users["campo"].id, updated_by=reviewer.id,
        reviewed_by=reviewer.id,
        review_note="Revisión sintética de interfaz; no acredita método, metrología ni equipo real.",
        reviewed_at=now_utc(),
    )
    session.add(equipment)
    session.flush()
    records["D-13"] = equipment
    session.add(FormRevision(
        record_id=equipment.id, revision=1, payload=dict(equipment.payload),
        note="Versión inicial sintética de equipo DEMO.", changed_by=users["campo"].id,
    ))
    session.add_all([
        AuditEvent(
            project_id=project.id, actor_id=users["campo"].id, action="record_created",
            entity_type="form_record", entity_id=equipment.id,
            detail={"form_code": "D-13", "status": "PENDING_REVIEW", "synthetic_demo": True},
        ),
        AuditEvent(
            project_id=project.id, actor_id=reviewer.id, action="qa_decision",
            entity_type="form_record", entity_id=equipment.id,
            detail={"from_status": "PENDING_REVIEW", "to_status": "VALIDATED", "synthetic_demo": True},
        ),
    ])
    session.flush()

    dependent_rows = [
        ("D-07", "DEMO · Pesaje ficticio", "medido", users["campo"], {
            "D07-001": records["D-06"].id, "D07-003": records["D-13"].id,
            "D07-004": "Recipiente DEMO 60 L", "D07-005": "0.375",
            "D07-006": "2.125", "D07-007": "1.75", "D07-008": "Aprovechable",
        }),
        ("D-08", "DEMO · Fracción de caracterización ficticia", "medido", users["campo"], {
            "D08-001": "", "D08-002": "Caracterización inicial DEMO",
            "D08-003": "Orgánicos", "D08-005": "1",
        }),
        ("Q-01", "DEMO · Revisión QA/QC sintética", "observado", users["consultor"], {
            "Q01-001": records["D-06"].id, "Q01-004": "Sí",
            "Q01-005": "Sin alerta", "Q01-008": "Aprobada",
        }),
    ]
    for code, title, source_kind, author, payload in dependent_rows:
        if code == "D-08":
            payload["D08-001"] = records["D-07"].id
            payload["_red_d07_source_version"] = records["D-07"].version
            payload["_red_d07_source_status"] = records["D-07"].status
        record = FormRecord(
            project_id=project.id, form_code=code, title=title, status="VALIDATED",
            record_date=date_value, source_kind=source_kind, source_note=source_note,
            payload=payload, version=1, created_by=author.id, updated_by=reviewer.id,
            reviewed_by=reviewer.id,
            review_note="Revisión QA/QC sintética para capacitación; no es aprobación de datos reales.",
            reviewed_at=now_utc(),
        )
        session.add(record)
        session.flush()
        records[code] = record
        session.add(FormRevision(
            record_id=record.id, revision=1, payload=dict(payload),
            note="Versión inicial sintética de capacitación DEMO.", changed_by=author.id,
        ))
        session.add_all([
            AuditEvent(
                project_id=project.id, actor_id=author.id, action="record_created",
                entity_type="form_record", entity_id=record.id,
                detail={"form_code": code, "status": "PENDING_REVIEW", "synthetic_demo": True},
            ),
            AuditEvent(
                project_id=project.id, actor_id=reviewer.id, action="qa_decision",
                entity_type="form_record", entity_id=record.id,
                detail={"from_status": "PENDING_REVIEW", "to_status": "VALIDATED", "synthetic_demo": True},
            ),
        ])

    for code in ("D-01", "D-02", "D-06", "D-07", "D-08", "Q-01"):
        errors = submission_errors(FORM_BY_CODE[code], records[code].payload, source_note, set())
        if code == "D-07":
            errors.extend(d07_submission_errors(session, project.id, records[code].payload))
        elif code == "D-08":
            errors.extend(d08_submission_errors(session, project.id, records[code].payload))
        if errors:
            raise ValueError(f"La fuente sintética DEMO {code} no cumple la validación actual: {'; '.join(errors)}")
    if baseline_missing_forms(session, project.id):
        raise ValueError("La línea base sintética DEMO no conserva todos los registros de soporte revisados.")

    reviewed_at = now_utc()
    project.baseline_status = "validada"
    project.baseline_reference = "DEMO-LB-001 · solo escenario de capacitación"
    project.baseline_note = (
        "Aceptación QA/QC sintética para practicar el flujo de RED. Los registros son ficticios; "
        "no representan mediciones, fuentes ni una Línea Base de una copropiedad real."
    )
    project.baseline_reviewed_by = reviewer.id
    project.baseline_reviewed_at = reviewed_at
    session.add(AuditEvent(
        project_id=project.id, actor_id=reviewer.id, action="baseline_decision",
        entity_type="project_baseline", entity_id=project.id,
        detail={"from_status": "no_iniciada", "to_status": "validada", "reference": project.baseline_reference,
                "reason": project.baseline_note, "synthetic_demo": True},
    ))


def seed_demo_workspace(
    session, passwords: dict[str, str], *, include_accepted_synthetic_baseline: bool = False,
) -> tuple[str, dict[str, str]]:
    """Seed only an empty database; refuse to mix the demo with any workspace."""
    from sqlalchemy import func, select

    from app.models import (
        AuditEvent, Base, EvidenceQuotaLock, PMIRSItem, PMIRSItemRevision, Project, ProjectMembership,
        ProjectVisitAuthorization, User, now_utc,
    )
    from app.backups import _validate_pristine_seed_projects
    from app.initial_projects import BELLO_PROJECTS
    from app.security import hash_password
    from app.visit_authorizations import visit_today

    required_roles = set(DEMO_ROLES)
    if set(passwords) != required_roles:
        raise ValueError("Faltan credenciales sintéticas para uno o más perfiles DEMO.")
    if session.scalar(select(func.count()).select_from(User)):
        raise ValueError("El entorno DEMO no acepta ni conserva cuentas de otro espacio RED.")
    quota_rows = session.execute(select(EvidenceQuotaLock.id, EvidenceQuotaLock.generation)).all()
    if quota_rows and quota_rows != [(1, 0)]:
        raise ValueError("El control de cuotas ya fue usado o alterado; el sandbox DEMO requiere una base nueva.")

    existing_projects = list(session.scalars(select(Project)))
    if existing_projects:
        expected_projects = dict(BELLO_PROJECTS)
        if {project.slug for project in existing_projects} != set(expected_projects):
            raise ValueError("El entorno DEMO solo puede reemplazar los cuatro expedientes iniciales vacíos.")
        try:
            _validate_pristine_seed_projects(existing_projects)
        except ValueError as exc:
            raise ValueError("Un expediente inicial ya fue personalizado; no se reemplazará por DEMO.") from exc
        for table in Base.metadata.sorted_tables:
            # The pristine mutex is infrastructure seeded by migrations, not
            # operational content. Preserve it after checking its exact state.
            if table.name in {Project.__tablename__, EvidenceQuotaLock.__tablename__, "alembic_version"}:
                continue
            if session.scalar(select(func.count()).select_from(table)):
                raise ValueError("La base contiene información RED; el sandbox DEMO no la reemplazará.")
        for project in existing_projects:
            session.delete(project)
        session.flush()

    project = Project(
        slug=DEMO_PROJECT_SLUG,
        name=DEMO_PROJECT_NAME,
        municipality="Bello (dato ilustrativo DEMO)",
        department="Antioquia (dato ilustrativo DEMO)",
        status="preparacion",
        baseline_status="no_iniciada",
        origin="synthetic_demo",
        origin_note=(
            "Expediente local de capacitación con datos ficticios. No representa una copropiedad, "
            "una visita, una autorización, permisos de privacidad, método o SST reales."
        ),
    )
    session.add(project)
    session.flush()

    users: dict[str, User] = {}
    for role, (email, full_name) in DEMO_ROLES.items():
        user = User(
            email=email,
            full_name=full_name,
            password_hash=hash_password(passwords[role]),
            is_platform_admin=(role == "admin"),
        )
        session.add(user)
        users[role] = user
    session.flush()

    for role in ("consultor", "campo", "revisor", "administracion_ph", "lector"):
        session.add(ProjectMembership(project_id=project.id, user_id=users[role].id, role=role))

    # These clearly marked fixture values unlock forms only in this isolated demo.
    # They must never be copied to a real project or used to infer human approval.
    session.add(ProjectVisitAuthorization(
        project_id=project.id,
        status="approved",
        site_access_reference="DEMO-ACCESS-001",
        privacy_reference="DEMO-PRIVACY-001",
        method_reference="DEMO-METHOD-001",
        sst_reference="DEMO-SST-001",
        valid_until=visit_today() + timedelta(days=14),
        created_by=users["admin"].id,
    ))
    if include_accepted_synthetic_baseline:
        _seed_accepted_synthetic_baseline(session, project, users)
    demo_reviewed_at = now_utc()
    demo_review_note = (
        "Revisión sintética DEMO: relación, criterio y evidencia esperada completos para practicar. "
        "No acredita una Línea Base ni una aceptación real."
    )
    program = PMIRSItem(
        project_id=project.id,
        item_type="programa",
        code="DEMO-PR-001",
        title="DEMO · Separación y registro de jornadas",
        description="Programa ficticio para practicar el vínculo entre programa, indicador y acción.",
        data={
            "applies": "si",
            "applicability_reason": "Objeto pedagógico creado solo para la práctica DEMO.",
            "objective": "Practicar el registro de una jornada con evidencia sintética.",
            "scope": "Solo el expediente aislado de capacitación RED.",
            "owner_role": "Equipo operativo DEMO",
            "program_status": "aprobado_interno",
            "finding_ids": [],
        },
        review_status="VALIDATED",
        version=1,
        created_by=users["consultor"].id,
        updated_by=users["consultor"].id,
        reviewed_by=users["revisor"].id,
        review_note=demo_review_note,
        reviewed_at=demo_reviewed_at,
    )
    indicator = PMIRSItem(
        project_id=project.id,
        item_type="indicador",
        code="DEMO-IN-001",
        title="DEMO · Jornadas con acta registrada",
        description="Indicador ficticio para recorrer el seguimiento de la acción.",
        data={
            "definition": "Cuenta las jornadas de capacitación registradas en este DEMO.",
            "formula": "Número de jornadas DEMO con acta adjunta.",
            "unit": "jornadas",
            "source_description": "Registros sintéticos de este sandbox local.",
            "frequency": "Por jornada de práctica",
            "report_owner": "Equipo operativo DEMO",
            "data_available": "no",
            "capture_method": "Adjuntar el acta ficticia al cierre de la práctica.",
        },
        review_status="VALIDATED",
        version=1,
        created_by=users["consultor"].id,
        updated_by=users["consultor"].id,
        reviewed_by=users["revisor"].id,
        review_note=demo_review_note,
        reviewed_at=demo_reviewed_at,
    )
    session.add_all([program, indicator])
    session.flush()

    action = PMIRSItem(
        project_id=project.id,
        item_type="accion",
        code="DEMO-A-001",
        title="DEMO · practicar captura y revisión de evidencia",
        description="Actividad ficticia para recorrer el flujo de campo, QA/QC y seguimiento.",
        data={
            "program_id": program.id,
            "owner": "Equipo operativo DEMO",
            "support": "Revisoría QA/QC DEMO",
            "priority": "media",
            "start_date": visit_today().isoformat(),
            "due_date": (visit_today() + timedelta(days=7)).isoformat(),
            "completion_criteria": "Adjuntar el acta sintética de la jornada y solicitar revisión QA/QC.",
            "indicator_id": indicator.id,
            "expected_evidence": "acta",
            "expected_evidence_detail": "Acta ficticia de la práctica DEMO.",
            "execution_status": "pendiente",
            "progress_pct": 0,
            "assignee_user_ids": [users["campo"].id],
            "finding_ids": [],
        },
        review_status="VALIDATED",
        version=1,
        created_by=users["consultor"].id,
        updated_by=users["consultor"].id,
        reviewed_by=users["revisor"].id,
        review_note=demo_review_note,
        reviewed_at=demo_reviewed_at,
    )
    session.add(action)
    session.flush()

    for item in (program, indicator, action):
        session.add(PMIRSItemRevision(
            item_id=item.id,
            revision=1,
            snapshot={
                "id": item.id,
                "code": item.code,
                "item_type": item.item_type,
                "item_type_label": {
                    "programa": "Programa",
                    "indicador": "Indicador",
                    "accion": "Acción",
                }[item.item_type],
                "title": item.title,
                "description": item.description,
                "data": dict(item.data or {}),
                "review_status": "PENDING_REVIEW",
                "version": item.version,
                "review_note": "",
                "reviewed_at": None,
            },
            note="Creación del objeto PMIRS DEMO",
            changed_by=users["consultor"].id,
        ))
        session.add(AuditEvent(
            project_id=project.id,
            actor_id=users["consultor"].id,
            action="pmirs_item_created",
            entity_type="pmirs_item",
            entity_id=item.id,
            detail={
                "item_type": item.item_type,
                "code": item.code,
                "review_status": "PENDING_REVIEW",
                "assignee_count": len((item.data or {}).get("assignee_user_ids", [])),
            },
        ))
        session.add(AuditEvent(
            project_id=project.id,
            actor_id=users["revisor"].id,
            action="pmirs_item_reviewed",
            entity_type="pmirs_item",
            entity_id=item.id,
            detail={
                "from_status": "PENDING_REVIEW",
                "to_status": "VALIDATED",
                "reason": demo_review_note,
            },
            created_at=demo_reviewed_at,
        ))
    session.commit()
    return project.id, {role: user.email for role, user in users.items()}


def seed_synthetic_progress_history(session, project_id: str) -> str:
    """Add two clearly synthetic field updates to an accepted training action."""
    from sqlalchemy import select

    from app.main import pmirs_item_snapshot
    from app.models import AuditEvent, PMIRSItem, PMIRSItemRevision, Project, ProjectMembership, User, now_utc

    project = session.get(Project, project_id)
    if not project or project.origin != "synthetic_demo" or project.baseline_status != "validada":
        raise ValueError("El historial de práctica requiere una Línea Base sintética DEMO ya preparada.")
    action = session.scalar(select(PMIRSItem).where(
        PMIRSItem.project_id == project_id, PMIRSItem.code == "DEMO-A-001",
    ))
    if not action or action.version != 1:
        raise ValueError("El historial de práctica requiere una acción DEMO nueva y sin avances.")
    users = {
        membership.role: session.get(User, membership.user_id)
        for membership in session.scalars(select(ProjectMembership).where(
            ProjectMembership.project_id == project_id,
        ))
    }
    field_user, consultant = users.get("campo"), users.get("consultor")
    if not field_user or not consultant:
        raise ValueError("El historial de práctica requiere cuentas DEMO de campo y consultoría.")

    updates = [
        {
            "status": "en_proceso", "progress_pct": 35,
            "progress_note": "DEMO: se practicó la separación en el punto común ficticio.",
            "close_reason": "", "actor": field_user,
            "from_status": "pendiente",
        },
        {
            "status": "en_proceso", "progress_pct": 65,
            "progress_note": "DEMO: se repitió la observación para confirmar el registro ficticio.",
            "close_reason": "", "actor": field_user,
            "from_status": "en_proceso",
        },
    ]
    for offset, update in enumerate(updates, start=2):
        action.data = {
            **(action.data or {}),
            "execution_status": update["status"],
            "progress_pct": update["progress_pct"],
            "progress_note": update["progress_note"],
            "close_reason": update["close_reason"],
        }
        action.version = offset
        action.updated_by = update["actor"].id
        action.updated_at = now_utc()
        session.add(PMIRSItemRevision(
            item_id=action.id,
            revision=offset,
            snapshot=pmirs_item_snapshot(action),
            note="Seguimiento operativo de la acción",
            changed_by=update["actor"].id,
        ))
        session.add(AuditEvent(
            project_id=project_id,
            actor_id=update["actor"].id,
            action="pmirs_action_progress",
            entity_type="pmirs_item",
            entity_id=action.id,
            detail={
                "from_status": update["from_status"],
                "to_status": update["status"],
                "progress_pct": update["progress_pct"],
                "synthetic_demo": True,
            },
        ))
    session.commit()
    return action.id


def _local_environment(root: Path, port: int) -> dict[str, str]:
    env = os.environ.copy()
    for name in (
        "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI",
        "TOKEN_ENCRYPTION_KEY", "S3_ACCESS_KEY", "S3_SECRET_KEY", "S3_BUCKET",
        "S3_ENDPOINT_URL", "S3_REGION", "TRUSTED_CLIENT_IP_HEADER",
        "RED_DATABASE_ISOLATION_REFERENCE", "DATABASE_SCHEMA",
        "RED_PRIVACY_APPROVAL_REFERENCE", "RED_SUPERVISED_PILOT_APPROVAL_REFERENCE", "RENDER",
    ):
        env.pop(name, None)
    env.update({
        "APP_ENV": "local",
        "INSTANCE_DIR": str(root),
        "DATABASE_URL": f"sqlite:///{root / 'red-demo.sqlite3'}",
        "RED_STORAGE_ROOT": str(root / "storage"),
        "STORAGE_BACKEND": "local",
        "RED_OPERATIONAL_WRITES_ENABLED": "true",
        "RED_PUBLIC_ACCESS_ENABLED": "false",
        "RED_PUBLIC_SITE_ORIGINS": "",
        "RED_MAX_UPLOAD_MB": "20",
        "RED_PRIVACY_APPROVED": "false",
        "RED_SUPERVISED_PILOT_APPROVED": "false",
        "SESSION_SECRET": secrets.token_urlsafe(48),
        "SESSION_COOKIE_NAME": "red_demo_training",
        "SESSION_HTTPS_ONLY": "false",
        "TRUSTED_HOSTS": "127.0.0.1,localhost",
        "PUBLIC_BASE_URL": f"http://127.0.0.1:{port}",
    })
    return env


def _wait_for_health(process: subprocess.Popen, port: int) -> bool:
    url = f"http://127.0.0.1:{port}/api/health"
    deadline = time.monotonic() + 12
    while time.monotonic() < deadline and process.poll() is None:
        try:
            with urllib.request.urlopen(url, timeout=0.5) as response:
                if response.status == 200:
                    return True
        except (OSError, urllib.error.URLError):
            time.sleep(0.2)
    return False


def _stop_child(process: subprocess.Popen, timeout: float = 5) -> None:
    """Stop the temporary server before its database and credentials are removed."""
    if process.poll() is not None:
        return
    try:
        process.terminate()
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        try:
            process.kill()
        except ProcessLookupError:
            pass
        process.wait()


def run(
    port: int, *, include_accepted_synthetic_baseline: bool = False,
    include_synthetic_progress_history: bool = False,
    open_browser: bool = False,
    open_credentials: bool = False,
) -> int:
    if include_synthetic_progress_history and not include_accepted_synthetic_baseline:
        print("El historial DEMO requiere --full-training-scenario.", file=sys.stderr)
        return 2
    try:
        port_available = _port_is_available(port)
    except OSError as exc:
        print(f"No se pudo comprobar el puerto loopback {port}: {exc}", file=sys.stderr)
        return 2
    if not port_available:
        print(f"El puerto {port} ya está ocupado; no se creó el sandbox.", file=sys.stderr)
        return 2

    root = Path(tempfile.mkdtemp(prefix="greenatics-red-field-demo-"))
    root.chmod(0o700)
    (root / "storage").mkdir(mode=0o700)
    credentials_path = root / "demo-access.txt"
    passwords = {role: secrets.token_urlsafe(18) for role in DEMO_ROLES}
    env = _local_environment(root, port)
    process = None

    try:
        migration = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=PROJECT_DIR,
            env=env,
            check=False,
        )
        if migration.returncode:
            print("No se pudo preparar la base DEMO; se eliminará el sandbox.", file=sys.stderr)
            return migration.returncode

        database_path = root / "red-demo.sqlite3"
        _require_current_migration(database_path)

        # The migration subprocess already received this environment. Apply it
        # only while importing the local database engine and seeding, then
        # restore the caller's environment before starting or returning.
        previous_environment = os.environ.copy()
        try:
            os.environ.clear()
            os.environ.update(env)
            from app.db import SessionLocal

            with SessionLocal() as session:
                project_id, emails = seed_demo_workspace(
                    session, passwords,
                    include_accepted_synthetic_baseline=include_accepted_synthetic_baseline,
                )
                action_id = None
                if include_synthetic_progress_history:
                    action_id = seed_synthetic_progress_history(session, project_id)
        finally:
            os.environ.clear()
            os.environ.update(previous_environment)

        lines = [
            "GREENATICS RED · credenciales efímeras de capacitación DEMO",
            "Solo para el sandbox local rotulado DEMO; no reutilizar ni compartir fuera de este equipo.",
            f"Proyecto: {DEMO_PROJECT_NAME} ({project_id})",
            f"URL: http://127.0.0.1:{port}/login",
            "",
        ]
        for role, email in emails.items():
            lines.extend((f"{role}: {email}", f"contraseña: {passwords[role]}", ""))
        credentials_path.write_text("\n".join(lines), encoding="utf-8")
        credentials_path.chmod(0o600)

        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(port), "--no-proxy-headers"],
            cwd=PROJECT_DIR,
            env=env,
        )
        if not _wait_for_health(process, port):
            _stop_child(process)
            print("El servidor DEMO no pasó health; se descartará el sandbox.", file=sys.stderr)
            return 2

        demo_url = f"http://127.0.0.1:{port}/login"
        if open_browser:
            try:
                if not webbrowser.open(demo_url):
                    print("No se pudo abrir el navegador automáticamente; usa la URL que aparece abajo.", flush=True)
            except webbrowser.Error as exc:
                print(f"No se pudo abrir el navegador automáticamente: {exc}", flush=True)
        if open_credentials:
            try:
                opened = subprocess.run(["open", str(credentials_path)], check=False)
                if opened.returncode:
                    print(f"Abre las credenciales privadas de DEMO en: {credentials_path}", flush=True)
            except OSError as exc:
                print(f"Abre las credenciales privadas de DEMO en: {credentials_path} ({exc})", flush=True)

        print("Sandbox DEMO de campo listo (datos ficticios, solo loopback).", flush=True)
        print(f"URL: {demo_url}", flush=True)
        print(f"Proyecto independiente: {DEMO_PROJECT_NAME}", flush=True)
        if include_accepted_synthetic_baseline:
            print("Escenario: Línea Base sintética rotulada DEMO; permite practicar el seguimiento de acciones.", flush=True)
        else:
            print("Escenario: Línea Base no aceptada; el avance de acciones permanece bloqueado.", flush=True)
        if include_synthetic_progress_history:
            print(f"Historial de avance ficticio disponible en la acción DEMO {action_id}.", flush=True)
        print(f"Credenciales efímeras, archivo privado: {credentials_path}", flush=True)
        print("La autorización DEMO solo habilita la práctica; no acredita permisos reales.", flush=True)
        print("Detén con Ctrl+C; la base y credenciales temporales se borrarán al salir.", flush=True)
        try:
            return process.wait()
        except KeyboardInterrupt:
            _stop_child(process)
            return 0
    finally:
        # Never remove a database or its credentials while the temporary web
        # process could still be using them. This also covers unexpected errors
        # in health checks, console output, or process waiting.
        if process is not None and process.poll() is None:
            _stop_child(process)
        if process is None or process.poll() is not None:
            shutil.rmtree(root, ignore_errors=True)
        else:
            print(
                f"No se pudo confirmar la detención del servidor DEMO; se conserva el sandbox privado en {root}.",
                file=sys.stderr,
            )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=18797)
    parser.add_argument(
        "--full-training-scenario", action="store_true",
        help="Incluye fuentes y Línea Base sintéticas aceptadas para practicar avance de acciones.",
    )
    parser.add_argument(
        "--with-progress-history", action="store_true",
        help="Añade dos avances de campo ficticios para previsualizar el historial PMIRS.",
    )
    parser.add_argument(
        "--open-browser", action="store_true",
        help="Abre el navegador predeterminado cuando el sandbox ya responde.",
    )
    parser.add_argument(
        "--open-credentials", action="store_true",
        help="Abre en macOS el archivo privado con las credenciales efímeras DEMO.",
    )
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        parser.error("El puerto debe estar entre 1024 y 65535.")
    return run(
        args.port,
        include_accepted_synthetic_baseline=args.full_training_scenario,
        include_synthetic_progress_history=args.with_progress_history,
        open_browser=args.open_browser,
        open_credentials=args.open_credentials,
    )


if __name__ == "__main__":
    raise SystemExit(main())
