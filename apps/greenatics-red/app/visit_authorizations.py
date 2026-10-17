"""Project-scoped field-visit gate, requiring an unexpired human approval."""

import re
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import ProjectVisitAuthorization


VISIT_AUTHORIZATION_REFERENCE_LIMIT = 160
VISIT_AUTHORIZATION_REVOCATION_REASONS = {
    "alcance_modificado": "Cambió el alcance autorizado",
    "soporte_vencido": "Un soporte dejó de estar vigente",
    "solicitud_administracion": "La administración de la copropiedad suspendió el acceso",
    "riesgo_sst": "Se identificó un riesgo de seguridad y salud en el trabajo",
    "metodo_actualizado": "Debe revisarse el método técnico",
    "otra_revision": "Otra condición requiere nueva revisión",
}

try:
    VISIT_TIMEZONE = ZoneInfo("America/Bogota")
except ZoneInfoNotFoundError:
    VISIT_TIMEZONE = timezone(timedelta(hours=-5))


def visit_today() -> date:
    return datetime.now(VISIT_TIMEZONE).date()


def validate_visit_reference(value: str, *, maximum: int = VISIT_AUTHORIZATION_REFERENCE_LIMIT) -> bool:
    """Keep references opaque: accept short codes, never URLs, emails, or free-form text."""
    return bool(
        value
        and len(value) <= maximum
        and re.fullmatch(r"[A-Za-z0-9-]+", value)
        and any(character.isalpha() for character in value)
        and any(character.isdigit() for character in value)
    )


def latest_visit_authorization(session: Session, project_id: str) -> ProjectVisitAuthorization | None:
    return session.scalar(
        select(ProjectVisitAuthorization)
        .where(ProjectVisitAuthorization.project_id == project_id)
        .order_by(ProjectVisitAuthorization.created_at.desc(), ProjectVisitAuthorization.id.desc())
        .limit(1)
    )


def visit_authorization_active(
    authorization: ProjectVisitAuthorization | None, *, today: date | None = None,
) -> bool:
    current_day = today or visit_today()
    return bool(
        authorization
        and authorization.status == "approved"
        and authorization.revoked_at is None
        and authorization.valid_until >= current_day
    )


def visit_authorization_status(
    authorization: ProjectVisitAuthorization | None, *, today: date | None = None,
) -> str:
    if authorization is None:
        return "pendiente"
    if authorization.revoked_at is not None or authorization.status == "revoked":
        return "revocada"
    if authorization.valid_until < (today or visit_today()):
        return "vencida"
    return "vigente"
