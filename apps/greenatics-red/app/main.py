from __future__ import annotations

import csv
import hashlib
import hmac
import ipaddress
import io
import json
import logging
import math
import re
import secrets
import tempfile
import unicodedata
import zipfile
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP, localcontext
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import quote
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from xml.sax.saxutils import escape

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import case, func, select, update
from sqlalchemy.dialects.postgresql import insert as postgresql_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.background import BackgroundTask
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from . import backups, drive
from .initial_projects import BELLO_PROJECTS, BELLO_PROJECT_SLUGS, project_order_key
from .config import PROJECT_DIR, settings
from .db import get_db
from .evidence_quota import evidence_usage_by_project, lock_and_check_evidence_capacity, lock_evidence_catalog
from .models import (
    AuditEvent, Backup, DriveConnection, EvidenceFile, FormRecord, FormRevision, FormSignature,
    Invitation, LoginThrottle, PasswordReset, PMIRSItem, PMIRSItemRevision, PMIRSVersion, PMIRSSignature,
    OperationalReference, PrivacyCase, Project, ProjectMembership, ProjectVisitAuthorization, User, now_utc, new_id,
)
from .privacy_cases import (
    CASE_STATES, CASE_TRANSITIONS, CASE_TYPES, CLASSIFICATIONS, IDENTITY_STATES,
    PROJECT_SCOPES, case_reference, validate_opaque_reference,
)
from .visit_authorizations import (
    VISIT_AUTHORIZATION_REFERENCE_LIMIT, VISIT_AUTHORIZATION_REVOCATION_REASONS, latest_visit_authorization,
    validate_visit_reference, visit_authorization_active, visit_authorization_status, visit_today,
)
from .docx_exports import build_form_record_docx, build_pmirs_version_docx
from .export_notices import PMIRS_EXPORT_NOTICE, pmirs_project_identity_notice
from .signature_integrity import (
    form_record_document_sha256 as _form_record_document_sha256,
    form_record_document_snapshot,
    form_record_snapshot_sha256,
    pmirs_document_sha256 as _pmirs_document_sha256,
)
from .log_safety import install_uvicorn_access_log_query_redaction
from .pdf_exports import (
    EXPORT_STATUS_LABELS, build_form_record_pdf, build_pmirs_version_pdf,
    pmirs_export_fields,
)
from .request_limits import RequestBodyLimitMiddleware, request_body_limit_bytes
from .uploads import UPLOAD_MEDIA_TYPES, UploadContentError, validate_upload_content
from .security import (
    LOGIN_DUMMY_PASSWORD_HASH, MAX_PASSWORD_CHARACTERS, hash_password, hash_token,
    purge_expired_login_throttles, verify_password,
)
from .audit_privacy import sanitize_audit_detail
from .storage import storage

logger = logging.getLogger(__name__)
install_uvicorn_access_log_query_redaction()

try:
    RED_LOCAL_TIMEZONE = ZoneInfo("America/Bogota")
except ZoneInfoNotFoundError:  # Colombia uses UTC-5; keep calendar deadlines usable in slim images without tzdata.
    RED_LOCAL_TIMEZONE = timezone(timedelta(hours=-5))

with (PROJECT_DIR / "app" / "forms.json").open(encoding="utf-8") as catalog_file:
    FORM_CATALOG = json.load(catalog_file)
FORM_BY_CODE = {item["code"]: item for item in FORM_CATALOG["forms"]}
PROJECT_EXPORT_ROLES = {"admin", "consultor", "administracion_ph", "revisor"}
FIELD_VISIT_FORM_CODES = {f"D-{number:02d}" for number in range(3, 15)} | {"P-14"}
MAX_D04_CONTAINER_ROWS = 50
D04_CONTAINER_FIELD = "D04-004"
MAX_REPEATABLE_FIELD_ROWS = 50
PROJECT_IDENTITY_REFERENCE_LIMIT = 160
MULTI_SELECT_TEXT_PREFIX = "__RED_MULTI_SELECT_TEXT_V1__:"
D02_BASELINE_FACT_FIELD_IDS = frozenset({
    "D02-001", "D02-002", "D02-004", "D02-008", "D02-010", "D02-012",
})
REPEATABLE_FIELD_SPECS = {
    "D02-021": {
        "row_noun": "dato pendiente",
        "row_noun_plural": "datos pendientes",
        "columns": [
            {"id": "field_id", "label": "Dato por confirmar", "type": "text", "max_length": 12,
             "options": ["D02-001", "D02-002", "D02-004", "D02-008", "D02-010", "D02-012"]},
            {"id": "status", "label": "Estado de la consulta", "type": "text", "max_length": 48,
             "options": ["Pendiente de solicitar", "La administración no sabe", "La administración no reporta", "No aplica; justificar"]},
            {"id": "detail", "label": "Responsable, fuente o siguiente paso / justificación", "type": "text", "max_length": 240},
        ],
    },
    "P02-003": {
        "row_noun": "integrante",
        "row_noun_plural": "integrantes",
        "columns": [
            {"id": "name", "label": "Nombre", "type": "text", "max_length": 160},
            {"id": "role", "label": "Rol o participación", "type": "text", "max_length": 160},
            {"id": "contact", "label": "Contacto, si se conoce", "type": "text", "max_length": 200},
        ],
    },
    "P02-005": {
        "row_noun": "gestor o reciclador",
        "row_noun_plural": "gestores o recicladores",
        "columns": [
            {"id": "name", "label": "Nombre", "type": "text", "max_length": 160},
            {"id": "service", "label": "Servicio reportado", "type": "text", "max_length": 200},
            {"id": "stream", "label": "Corriente reportada", "type": "text", "max_length": 160},
            {"id": "contact", "label": "Contacto, si se conoce", "type": "text", "max_length": 200},
        ],
    },
    "P02-009": {
        "row_noun": "capacitación previa",
        "row_noun_plural": "capacitaciones previas",
        "columns": [
            {"id": "date", "label": "Fecha, si se conoce", "type": "date", "max_length": 10},
            {"id": "topic", "label": "Tema", "type": "text", "max_length": 200},
            {"id": "audience", "label": "Público participante", "type": "text", "max_length": 200},
            {"id": "evidence", "label": "Evidencia o referencia, si existe", "type": "text", "max_length": 240},
        ],
    },
}
GPS_FIELD_IDS = {"D03-006", "D11-006"}
GPS_CAPTURE_METHOD = "browser_geolocation"
PUBLIC_BACKUP_MAX_AGE = timedelta(hours=48)
BUILTIN_FIELD_OPTIONS = {
    "D02-004": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
}
AUTOMATIC_TIMESTAMP_FIELDS = {
    "D-03": "D03-003",
    "D-06": "D06-003",
    "D-11": "D11-002",
    "D-13": "D13-010",
    "Q-01": "Q01-012",
    "P-01": "P01-004",
    "P-12": "P12-003",
    "P-13": "P13-002",
    "P-14": "P14-006",
}
AUTOMATIC_TIME_FIELDS = {"D-07": "D07-009"}
PROJECT_CODE_FIELD = {"D-01": "D01-001"}
PROJECT_REFERENCE_FIELDS = {
    "D-03": "D03-001",
    "D-06": "D06-001",
    "D-11": "D11-001",
    "P-01": "P01-002",
}
PROJECT_SEQUENCE_FIELDS = {
    "D-06": "D06-002",
    "D-07": "D07-002",
}
SYSTEM_IDENTIFIER_FIELDS = {
    "D-04": ("D04-001", "PUN"),
    "P-01": ("P01-001", "PMIRS"),
    "P-03": ("P03-001", "HAL"),
    "P-05": ("P05-001", "ACC"),
    "P-06": ("P06-001", "IND"),
    "P-07": ("P07-001", "ROL"),
    "P-08": ("P08-001", "CON"),
    "P-10": ("P10-001", "CAP"),
    "P-11": ("P11-001", "EVI"),
    "P-14": ("P14-005", "NOV"),
    "P-15": ("P15-001", "SEG"),
}
CALCULATED_FIELD_IDS = {
    "D07-007", "D08-008", "D08-009", "D08-010", "D09-004",
    "D14-002", "D14-003", "D14-004", "D14-005", "D14-007", "Q01-002",
}
PENDING_OPERATIONAL_REFERENCE_FIELDS = {
    "P14-001": "Pendiente: la guía operativa aprobada para este expediente aún no está registrada.",
    "P14-002": "Pendiente: la tabla de separación aprobada para este expediente aún no está registrada.",
}
OPERATIONAL_REFERENCE_CATEGORIES = {
    "guia_operativa": {"label": "Guía operativa vigente", "field_id": "P14-001"},
    "tabla_separacion": {"label": "Tabla de separación vigente", "field_id": "P14-002"},
}
OPERATIONAL_REFERENCE_STATUSES = {
    "pendiente_revision": "Pendiente de revisión",
    "requiere_correccion": "Requiere corrección",
    "aprobada": "Aprobada y vigente",
    "reemplazada": "Reemplazada; conservar historial",
    "obsoleta": "Obsoleta; no usar en campo",
}
PENDING_AUTOMATIC_RELATION_FIELDS = {
    "Q01-010": "Pendiente: la entidad C-03 no está configurada en RED; no ingreses identificadores manuales.",
}
SERVER_MANAGED_FIELD_IDS = {
    *CALCULATED_FIELD_IDS, *AUTOMATIC_TIMESTAMP_FIELDS.values(), *AUTOMATIC_TIME_FIELDS.values(),
    *PROJECT_CODE_FIELD.values(), *PROJECT_REFERENCE_FIELDS.values(), *PROJECT_SEQUENCE_FIELDS.values(),
    *(field_id for field_id, _prefix in SYSTEM_IDENTIFIER_FIELDS.values()),
    *PENDING_OPERATIONAL_REFERENCE_FIELDS.keys(), *PENDING_AUTOMATIC_RELATION_FIELDS.keys(),
    "D14-008", "P01-008", "P01-009", "P01-010", "P01-011", "P11-007", "P15-008", "P15-009", "Q01-003", "Q01-011",
}

# Relationship controls are scoped to one project. These are the relations the
# candidate can resolve from its own database today; other source relations stay
# explicit pending fields until their backing object exists.
RELATION_FIELD_SPECS = {
    "D01-017": ("member", ("campo",)),
    "D01-018": ("member", ("consultor",)),
    "D03-004": ("member", ("campo",)),
    "D04-020": ("record", ("D-03",)),
    "D06-009": ("record", ("D-03",)),
    "D05-006": ("record", ("D-04",)),
    "D06-008": ("member", ("campo",)),
    "D07-001": ("record", ("D-06",)),
    "D07-003": ("record", ("D-13",)),
    "D11-007": ("record", ("D-04", "D-07", "D-08")),
    "D12-001": ("record", ("D-03",)),
    "D14-001": ("record", ("D-03",)),
    "Q01-001": ("record", ("D-03", "D-06")),
    "Q01-007": ("record", ("D-12",)),
    "P01-003": ("record", ("Q-01",)),
    "P01-005": ("member", ("consultor",)),
    "P01-006": ("member", ("revisor",)),
    "P01-012": ("record", ("D-12",)),
    "P02-008": ("evidence", ()),
    "P03-005": ("record", tuple([*(f"D-{number:02d}" for number in range(1, 15)), "Q-01"])),
    "P03-006": ("evidence", ()),
    "P03-011": ("item", ("programa",)),
    "P04-001": ("item", ("programa",)),
    "P04-005": ("item", ("hallazgo",)),
    "P05-002": ("item", ("programa",)),
    "P05-003": ("item", ("hallazgo",)),
    "P05-011": ("item", ("accion",)),
    "P05-013": ("item", ("indicador",)),
    "P06-006": ("record", tuple([*(f"D-{number:02d}" for number in range(1, 15)), "Q-01"])),
    "P06-012": ("item", ("accion",)),
    "P07-005": ("item", ("programa",)),
    "P07-006": ("item", ("accion",)),
    "P08-008": ("record", ("P-07",)),
    "P09-002": ("item", ("accion",)),
    "P09-004": ("record", ("P-07",)),
    "P09-006": ("record", ("P-09",)),
    "P09-009": ("record", ("D-12", "P-14")),
    "P10-008": ("evidence", ()),
    "P11-002": ("item", ("hallazgo", "programa", "accion", "indicador")),
    "P11-011": ("evidence", ()),
    "P12-005": ("version", ()),
    "P12-007": ("item", ("hallazgo", "programa", "accion", "indicador")),
    "P13-001": ("version", ()),
    "P13-005": ("item", ("hallazgo", "programa", "accion", "indicador")),
    "P14-003": ("record", ("P-08",)),
    "P14-004": ("record", ("P-07",)),
    "P15-006": ("item", ("indicador",)),
    "P15-010": ("item", ("hallazgo",)),
}
RELATION_REQUIRES_VALIDATED_RECORD = {"P01-003", "P03-005", "P06-006"}
INTEGER_NUMERIC_FIELD_IDS = {
    "D01-010", "D01-011", "D01-012", "D01-013", "D01-014",
    "D02-001", "D02-002", "D02-010", "D06-005", "P02-004", "P10-009",
}
NONNEGATIVE_NUMERIC_FIELD_IDS = {
    "D01-010", "D01-012", "D01-013", "D01-014",
    "D02-001", "D02-002", "D02-010", "D06-005", "P02-004", "P10-009",
}
POSITIVE_NUMERIC_FIELD_IDS = {"D01-011", "D04-003", "D09-002"}


def suggested_options(field: dict) -> list[str]:
    declared_options = field.get("options")
    if isinstance(declared_options, list) and all(isinstance(option, str) for option in declared_options):
        return [option for option in declared_options if option.strip()]
    control = str(field.get("control", "")).casefold()
    validation = str(field.get("validation", "")).strip()
    if field.get("id") in BUILTIN_FIELD_OPTIONS:
        return BUILTIN_FIELD_OPTIONS[field["id"]]
    if control.replace(" ", "") == "alta/media/baja":
        return ["Alta", "Media", "Baja"]
    controlled_choices = re.split(r"\s*/\s*", re.split(r"\s*\+\s*", str(field.get("control", "")), maxsplit=1)[0].strip())
    if len(controlled_choices) > 1 and controlled_choices[0].strip().casefold() in {"sí", "si"} and controlled_choices[1].strip().casefold() == "no":
        return [choice.strip() for choice in controlled_choices if choice.strip()]
    if validation.casefold() in {"siempre", "al resolver", "al cerrar ciclo", "una opción", "una opcion"}:
        validation = str(field.get("help", "")).strip()
    if not any(token in control for token in ("lista", "estado", "selecc", "select")) or not validation:
        return []
    candidate = validation.split(";", 1)[0].strip().rstrip(".")
    candidate = re.sub(r"^inicialmente\s+", "", candidate, flags=re.IGNORECASE)
    if any(term in candidate.casefold() for term in ("según", "segun", "biblioteca", "configurable")):
        return []
    options = [item.strip().rstrip(".") for item in re.split(r"\s*/\s*|\s*,\s*", candidate)]
    if len(options) < 2 or any(not item or len(item) > 80 for item in options):
        return []
    return options


def d06_period_parts(value: object) -> dict[str, str]:
    """Split a stored D-06 period without inferring a missing measurement unit."""
    raw = str(value or "").strip()
    match = re.fullmatch(r"(?P<amount>\d+(?:[.,]\d+)?)\s*(?P<unit>h|hrs?|horas?|d|d[ií]as?)", raw, re.IGNORECASE)
    if match:
        raw_unit = match.group("unit").casefold()
        return {
            "amount": match.group("amount").replace(",", "."),
            "unit": "días" if raw_unit.startswith("d") else "horas",
            "legacy": "",
        }
    if re.fullmatch(r"\d+(?:[.,]\d+)?", raw):
        return {"amount": raw.replace(",", "."), "unit": "", "legacy": ""}
    return {"amount": "", "unit": "", "legacy": raw}


def d13_measurement_parts(value: object) -> dict[str, str]:
    """Split a D-13 number and free-text unit without assuming the instrument unit."""
    raw = str(value or "").strip()
    match = re.fullmatch(r"(?P<amount>\d+(?:[.,]\d+)?)\s+(?P<unit>[^\r\n]{1,50})", raw)
    if match:
        return {
            "amount": match.group("amount").replace(",", "."),
            "unit": match.group("unit").strip(),
            "legacy": "",
        }
    if re.fullmatch(r"\d+(?:[.,]\d+)?", raw):
        return {"amount": raw.replace(",", "."), "unit": "", "legacy": ""}
    return {"amount": "", "unit": "", "legacy": raw}


def p15_period_parts(value: object) -> dict[str, str]:
    """Split a P-15 date range, keeping unrecognized history visible for review."""
    raw = str(value or "").strip()
    match = re.fullmatch(r"(?P<start>\d{4}-\d{2}-\d{2})\s*/\s*(?P<end>\d{4}-\d{2}-\d{2})", raw)
    if not match:
        return {"start": "", "end": "", "legacy": raw}
    try:
        start = date.fromisoformat(match.group("start"))
        end = date.fromisoformat(match.group("end"))
    except ValueError:
        return {"start": "", "end": "", "legacy": raw}
    return {"start": start.isoformat(), "end": end.isoformat(), "legacy": ""}


def cleanup_storage_objects(keys: list[str]) -> None:
    for key in keys:
        try:
            storage.delete(key)
        except Exception:
            logger.exception("No se pudo limpiar el objeto privado %s", key)


def upload_media_type_or_422(source: Path | bytes, extension: str) -> str:
    try:
        return validate_upload_content(source, extension)
    except UploadContentError as exc:
        raise HTTPException(422, str(exc)) from exc


def replay_evidence_submission(
    session: Session,
    submission_key: str,
    *,
    project_id: str,
    actor_id: str,
    original_name: str,
    sha256: str,
    record_id: str | None = None,
    pmirs_item_id: str | None = None,
) -> RedirectResponse | None:
    """Return the original success for an exact replay; reject key reuse with changed content."""
    if not submission_key:
        return None
    prior = session.scalar(select(EvidenceFile).where(EvidenceFile.submission_key == submission_key))
    if prior is None:
        return None
    same_submission = (
        prior.project_id == project_id
        and prior.created_by == actor_id
        and prior.original_name == original_name
        and prior.sha256 == sha256
        and prior.record_id == record_id
        and prior.pmirs_item_id == pmirs_item_id
    )
    if not same_submission:
        raise HTTPException(409, "Esta clave ya corresponde a otra evidencia. Conserva el archivo original o inicia una carga nueva.")
    if record_id:
        return RedirectResponse(f"/records/{record_id}?notice=Esta%20evidencia%20ya%20estaba%20adjuntada", status_code=303)
    return RedirectResponse(f"/projects/{project_id}/pmirs?notice=Esta%20evidencia%20ya%20estaba%20adjuntada", status_code=303)


for form in FORM_CATALOG["forms"]:
    for field in form["fields"]:
        if form["code"] == "D-02" and field["id"] in {"D02-001", "D02-002", "D02-004", "D02-008", "D02-010", "D02-012"}:
            # A missing fact must be tracked explicitly in D02-021; a blank is
            # allowed in the form, but submission validation below requires a
            # corresponding, reasoned pending row.
            field["required"] = False
        if field["id"] in {"P10-009", "P10-010"}:
            field["required"] = False
            field["required_when"] = {"field_id": "P10-013", "equals_any": ["Ejecutada"]}
        field["options"] = suggested_options(field)
        field["multi_select"] = any(token in str(field.get("control", "")).casefold() for token in ("multi-selección", "multi-select", "múltiple"))
        field["multi_select_text"] = field["multi_select"] and "texto" in str(field.get("control", "")).casefold()
        field["file_upload"] = bool(field.get("file_upload")) or any(
            token in str(field.get("control", "")).casefold()
            for token in ("archivo", "imagen", "fotografía", "fotografia", "foto")
        )
        field["file_or_record"] = str(field.get("control", "")).strip().casefold() == "archivo o dato"
        field["server_managed"] = field["id"] in SERVER_MANAGED_FIELD_IDS
        field["calculated"] = field["id"] in CALCULATED_FIELD_IDS
        field["repeatable"] = REPEATABLE_FIELD_SPECS.get(field["id"])
        if field["id"] in PENDING_OPERATIONAL_REFERENCE_FIELDS:
            field["pending_value"] = PENDING_OPERATIONAL_REFERENCE_FIELDS[field["id"]]
            field["application_help"] = "RED todavía no tiene un repositorio de documentos operativos aprobados para esta unidad. Mantén la referencia pendiente; no selecciones una versión PMIRS como sustituto."
        if field["id"] in PENDING_AUTOMATIC_RELATION_FIELDS:
            field["pending_value"] = PENDING_AUTOMATIC_RELATION_FIELDS[field["id"]]
        if field["id"] == "P09-008":
            field["application_help"] = "Cuando el hito esté Bloqueado, describe el impedimento y vincula en P09-009 una incidencia D-12 o novedad P-14 del mismo expediente."
        if field["id"] == "P09-009":
            field["application_help"] = "Vincula la incidencia o novedad que explica el bloqueo. El vínculo debe ser un D-12 o P-14 del mismo expediente; la descripción va en P09-008."
        if field["id"] == "D04-001":
            field["application_help"] = "RED asigna un identificador estable a cada registro D-04 y lo conserva al editar. Crea un registro por cuarto/punto; usa D04-020 para vincularlo a la visita D-03 cuando corresponda."
        if field["id"] == "D04-020":
            field["application_help"] = "Vincula este punto de inspección a una visita D-03 del mismo expediente. El vínculo es opcional para conservar capturas independientes todavía no asociadas a visita."
        if field["id"] == "Q01-011":
            field["help"] = "La persona revisora y su correo se registran automáticamente al emitir la decisión QA/QC; no se diligencia durante la captura."
        if field["id"] == "P11-007":
            field["source_system"] = True
            field["help"] = "RED conserva la cuenta que creó este registro como responsable de cargar la evidencia. La autoría no se puede sustituir al editar; RED guarda también la cuenta técnica del evento."
        if field["id"] == "Q01-003":
            field["help"] = "RED resume los D-08 ligados a la jornada o agrega las jornadas D-06 vinculadas a la visita seleccionada. El resumen no aplica tolerancias ni declara aceptación técnica."
        if field["id"] == "Q01-002":
            field["help"] = "Resume registros, validaciones y evidencias observados en la jornada o visita. No confirma completitud porque la matriz de registros, fotos y excepciones esperados sigue pendiente. La persona revisora documenta su resultado en Q01-008 y Q01-009."
        if field["id"] == "Q01-010":
            field["help"] = "La relación C-03 del maestro fuente no tiene una entidad implementada en RED. El campo permanece de solo lectura hasta que exista un flujo verificable de solicitudes."
        if field["id"] == "D14-008":
            field["help"] = "RED registra la identidad, rol y fecha de quien crea el cierre como responsable de captura. Este sello de auditoría no es una firma digital."
        if field["id"] == "D14-002":
            field["help"] = "Resumen de registros vinculados y campos obligatorios vacíos en esos registros. No determina qué formularios debían levantarse en la visita."
        if field["id"] == "D14-003":
            field["help"] = "Cuenta imágenes disponibles en registros vinculados. El mínimo por tipo de visita requiere un protocolo aprobado."
        if field["id"] == "D14-004":
            field["help"] = "Resume los pesajes D-07 vinculados a jornadas de esta visita. No decide si el tipo de visita requería pesajes."
        if field["id"] == "D14-007":
            field["help"] = "RED impide declarar Completa si hay validaciones de envío pendientes en los registros vinculados. Esto no asigna automáticamente Incompleta justificada ni No válida; la clasificación final sigue pendiente del protocolo aprobado."
        if field["id"] in {"P01-008", "P01-009", "P01-010", "P01-011"}:
            field["help"] = "RED muestra si existen fuentes revisadas disponibles al guardar este P-01; no copia su contenido ni certifica que el diagnóstico esté completo."
        if field["id"] == "P15-007":
            field["application_help"] = "Una medición por línea con el código del indicador seleccionado: IND-01: 42.5. RED usa la unidad y meta guardadas en el indicador; no concluye cumplimiento. Acepta punto o coma decimal, sin separador de miles."
        if field["id"] in AUTOMATIC_TIMESTAMP_FIELDS.values():
            field["help"] = "RED registra la fecha y hora de creación en UTC; el sello se conserva al editar."
        if field["id"] in GPS_FIELD_IDS:
            if field["id"] == "D03-006":
                field["help"] = "La captura RED es opcional. El radio esperado todavía no está configurado, por lo que la aplicación no valida distancias ni identifica si el punto pertenece a esta copropiedad."
            else:
                field["help"] = "La captura RED es opcional. Confirma que el dispositivo esté en el punto que quieres documentar y explica el método en la nota de fuente."
            field["application_help"] = "Captura opcional y puntual desde este dispositivo. RED solicita permiso solo al pulsar el botón; no sigue ni almacena ubicación en segundo plano. La precisión y hora son las que informa el dispositivo."
        condition = field.get("required_when")
        if condition:
            dependency = next((item for item in form["fields"] if item["id"] == condition.get("field_id")), None)
            if dependency:
                if condition.get("equals_any"):
                    field["required_when_label"] = f"Obligatorio cuando «{dependency['label']}» sea: {', '.join(condition['equals_any'])}."
                elif condition.get("not_equals_any"):
                    field["required_when_label"] = f"Obligatorio cuando «{dependency['label']}» no sea: {', '.join(condition['not_equals_any'])}."

app = FastAPI(title="GREENATICS RED", version=backups.APP_VERSION)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    session_cookie=settings.session_cookie_name,
    max_age=8 * 60 * 60,
    same_site="lax",
    https_only=settings.session_https_only,
)
if settings.trusted_hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=list(settings.trusted_hosts))
app.mount("/static", StaticFiles(directory=PROJECT_DIR / "app" / "static"), name="static")
templates = Jinja2Templates(directory=PROJECT_DIR / "app" / "templates")
templates.env.globals["red_operational_writes_enabled"] = lambda: settings.operational_writes_enabled
templates.env.globals["red_operational_write_message"] = lambda: operational_write_block_message()
templates.env.globals["d06_period_parts"] = d06_period_parts
templates.env.globals["d13_measurement_parts"] = d13_measurement_parts
templates.env.globals["p15_period_parts"] = p15_period_parts
templates.env.globals["integer_numeric_field_ids"] = INTEGER_NUMERIC_FIELD_IDS
templates.env.globals["nonnegative_numeric_field_ids"] = NONNEGATIVE_NUMERIC_FIELD_IDS
templates.env.globals["positive_numeric_field_ids"] = POSITIVE_NUMERIC_FIELD_IDS


def operational_write_block_message() -> str:
    requested = getattr(settings, "operational_writes_requested", False)
    issue_check = getattr(settings, "operational_write_issues", None)
    issues = issue_check() if callable(issue_check) else []
    if issues:
        return "no se guardarán datos hasta completar la configuración y las aprobaciones del entorno: " + " ".join(issues)
    return "las escrituras operativas están desactivadas hasta habilitar el gate supervisado."


def drive_external_action_block_message() -> str:
    return (
        "La conexión con Drive personal y la carga de respaldos solo se habilitan desde un entorno "
        "staging/producción con runtime persistente y gates de privacidad y piloto aprobados. "
        "El entorno local se limita a pruebas sintéticas."
    )


@app.middleware("http")
async def operational_write_gate(request: Request, call_next):
    recovery_routes = {"/login", "/logout"}
    is_password_reset = request.url.path.startswith("/password-reset/")
    is_oauth_callback = request.url.path == "/drive/callback"
    is_drive_external_action = request.url.path in {"/drive/connect", "/drive/callback", "/backups/create"}
    is_backup_recovery = bool(
        request.method == "POST"
        and re.fullmatch(r"/drive/backups/[0-9a-fA-F-]{36}/download", request.url.path)
    )
    if (
        (
            request.method in {"POST", "PUT", "PATCH", "DELETE"}
            and request.url.path not in recovery_routes
            and not is_password_reset
            and not is_backup_recovery
        )
        or is_oauth_callback
    ):
        if not settings.operational_writes_enabled:
            return JSONResponse(
                status_code=503,
                content={"detail": "RED está en modo de solo lectura; " + operational_write_block_message()},
            )
    if is_drive_external_action and not getattr(settings, "drive_external_actions_enabled", False):
        return JSONResponse(status_code=503, content={"detail": drive_external_action_block_message()})
    return await call_next(request)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; "
        "object-src 'none'; img-src 'self' data:; style-src 'self'; font-src 'self'; connect-src 'self'",
    )
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    if request.url.path.startswith(("/password-reset/", "/invitations/accept/")) or request.url.path == "/drive/callback":
        response.headers["Referrer-Policy"] = "no-referrer"
    else:
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)")
    if not request.url.path.startswith("/static/"):
        response.headers.setdefault("Cache-Control", "private, no-store")
    if settings.is_production and settings.session_https_only:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response


# Install after the HTTP decorators so the pure ASGI limiter wraps form parsing
# and rejects oversized multipart bodies before Starlette spools uploads.
app.add_middleware(
    RequestBodyLimitMiddleware,
    max_bytes=request_body_limit_bytes(settings.max_upload_mb),
)

ALLOWED_ROLES = {"consultor", "campo", "administracion_ph", "revisor", "lector"}
ALLOWED_UPLOAD_EXTENSIONS = set(UPLOAD_MEDIA_TYPES)
ALLOWED_SOURCE_KINDS = {"declarado", "observado", "medido", "documental", "interpretado", "derivado"}
PMIRS_ITEM_TYPES = {
    "hallazgo": {"label": "Hallazgo", "plural": "hallazgos", "prefix": "H", "padding": 3},
    "programa": {"label": "Programa", "plural": "programas", "prefix": "PR", "padding": 2},
    "accion": {"label": "Acción", "plural": "acciones", "prefix": "A", "padding": 3},
    "indicador": {"label": "Indicador", "plural": "indicadores", "prefix": "IND", "padding": 2},
}
PMIRS_REVIEW_STATUSES = {"RAW", "PENDING_REVIEW", "VALIDATED", "CORRECTION_REQUESTED"}
PMIRS_REVIEW_LABELS = {
    "RAW": "Borrador",
    "PENDING_REVIEW": "Pendiente de revisión",
    "VALIDATED": "Revisado · válido",
    "CORRECTION_REQUESTED": "Requiere corrección",
}
PMIRS_TOPICS = ["Separación", "Orgánicos", "Aprovechables", "Infraestructura", "Operación", "Información", "Educación", "Contingencias", "Otro"]
PMIRS_PRIORITY = {"alta": "Alta", "media": "Media", "baja": "Baja"}
PMIRS_ACTION_STATES = {
    "pendiente": "Pendiente",
    "en_proceso": "En proceso",
    "pendiente_tercero": "Pendiente de tercero",
    "evidencia_cargada": "Evidencia cargada",
    "en_validacion": "En validación",
    "requiere_correccion": "Requiere corrección",
    "validada": "Validada",
    "cerrada": "Cerrada",
    "reabierta": "Reabierta",
}
PMIRS_ACTION_TRANSITIONS = {
    "pendiente": {"en_proceso", "pendiente_tercero", "evidencia_cargada"},
    "en_proceso": {"pendiente_tercero", "evidencia_cargada"},
    "pendiente_tercero": {"en_proceso", "evidencia_cargada"},
    "evidencia_cargada": {"en_proceso", "en_validacion", "requiere_correccion", "validada"},
    "en_validacion": {"en_proceso", "evidencia_cargada", "requiere_correccion", "validada"},
    "requiere_correccion": {"en_proceso", "evidencia_cargada"},
    "validada": {"cerrada", "reabierta"},
    "cerrada": {"reabierta"},
    "reabierta": {"en_proceso", "pendiente_tercero", "evidencia_cargada"},
}
PMIRS_VERSION_STATUSES = {
    "borrador": "Borrador",
    "revision_interna": "Revisión interna",
    "aprobada_interna": "Aprobada internamente",
    "compartida_ph": "Entrega a PH registrada",
    "implementacion": "En implementación",
    "obsoleta": "Obsoleta",
}
PMIRS_VERSION_REASONS = {
    "inicial": "Primera versión",
    "revision_interna": "Revisión interna",
    "comentario_ph": "Comentario de administración PH",
    "evidencia_nueva": "Nueva evidencia",
    "seguimiento": "Seguimiento",
    "requerimiento": "Requerimiento documentado",
    "otro": "Otro",
}


def utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def gps_capture_data(value: object) -> dict | None:
    """Parse an explicitly captured browser location while preserving legacy text values."""
    if not isinstance(value, str) or len(value) > 4000:
        return None
    try:
        parsed = json.loads(value)
    except (TypeError, ValueError):
        return None
    if not isinstance(parsed, dict) or parsed.get("method") != GPS_CAPTURE_METHOD:
        return None
    return parsed


def gps_capture_errors(value: object) -> list[str]:
    """Validate location metadata before a GPS response enters review."""
    if not isinstance(value, str) or not value.strip():
        return []
    if not value.lstrip().startswith("{"):
        return []  # Older/manual RAW coordinates remain usable with an explicit source note.
    try:
        parsed = json.loads(value)
    except (TypeError, ValueError):
        return ["La ubicación GPS tiene un formato inválido; vuelve a capturarla o conserva una referencia manual."]
    if not isinstance(parsed, dict) or parsed.get("method") != GPS_CAPTURE_METHOD:
        return ["La ubicación GPS no tiene el formato de captura RED esperado."]
    errors = []
    for key, low, high, label in (
        ("latitude", -90, 90, "latitud"), ("longitude", -180, 180, "longitud"),
    ):
        item = parsed.get(key)
        try:
            numeric = float(item) if not isinstance(item, bool) and isinstance(item, (int, float)) else math.nan
        except (OverflowError, ValueError):
            numeric = math.nan
        if not math.isfinite(numeric) or not low <= numeric <= high:
            errors.append(f"La {label} GPS debe ser un número válido dentro de su rango geográfico.")
    accuracy = parsed.get("accuracy_m")
    try:
        numeric_accuracy = float(accuracy) if not isinstance(accuracy, bool) and isinstance(accuracy, (int, float)) else math.nan
    except (OverflowError, ValueError):
        numeric_accuracy = math.nan
    if not math.isfinite(numeric_accuracy) or numeric_accuracy < 0:
        errors.append("La precisión GPS debe ser un número igual o mayor que cero metros.")
    timestamp = parsed.get("captured_at")
    try:
        parsed_time = datetime.fromisoformat(str(timestamp).replace("Z", "+00:00"))
        if parsed_time.tzinfo is None:
            raise ValueError
    except (TypeError, ValueError):
        errors.append("La fecha y hora informadas por el dispositivo deben incluir zona horaria.")
    return errors


def gps_capture_display(value: object) -> str:
    """Render a captured location as coordinates and device-reported accuracy/time."""
    data = gps_capture_data(value)
    if not data:
        return str(value or "")
    if gps_capture_errors(value):
        return "Captura GPS pendiente de verificación; vuelve a capturar o solicita revisión."
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    accuracy = data.get("accuracy_m")
    timestamp = str(data.get("captured_at", "")).replace("T", " ").replace("Z", " UTC")
    return f"Latitud {latitude}, longitud {longitude} · precisión informada ±{accuracy} m · hora del dispositivo {timestamp}"


templates.env.filters["gps_capture_display"] = gps_capture_display


def csrf_token(request: Request) -> str:
    token = request.session.get("csrf_token")
    if not isinstance(token, str) or len(token) < 32:
        token = secrets.token_urlsafe(32)
        request.session["csrf_token"] = token
    return token


def check_csrf(request: Request, submitted: str) -> None:
    expected = str(request.session.get("csrf_token", ""))
    if not expected or not submitted or not hmac.compare_digest(expected, submitted):
        raise HTTPException(
            status_code=403,
            detail="La sesión del formulario venció. Recupera la seguridad del formulario e inténtalo otra vez.",
            headers={"X-RED-Error-Code": "csrf-expired"},
        )


def page_context(request: Request, **extra) -> dict:
    return {
        "request": request, "csrf": csrf_token(request), "user": request.state.red_user,
        "max_upload_mb": settings.max_upload_mb, "operational_reference_values": {}, **extra,
    }


def current_user(request: Request, session: Session) -> User:
    user_id = request.session.get("user_id")
    user = session.get(User, str(user_id)) if user_id else None
    try:
        session_version = int(request.session.get("session_version", 0))
    except (TypeError, ValueError):
        session_version = 0
    if not user or not user.active or session_version != user.session_version:
        request.session.clear()
        raise HTTPException(status_code=303, headers={"Location": "/login"})
    request.state.red_user = user
    return user


def platform_admin(user: User) -> None:
    if not user.is_platform_admin:
        raise HTTPException(status_code=403, detail="Esta acción requiere rol de administración de GREENATICS RED.")


def authorize_project(session: Session, project_id: str, user: User, *, write: bool = False) -> tuple[Project, str]:
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")
    if write and not settings.operational_writes_enabled:
        raise HTTPException(status_code=503, detail="RED está en modo de solo lectura; " + operational_write_block_message())
    if user.is_platform_admin:
        return project, "admin"
    membership = session.scalar(select(ProjectMembership).where(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == user.id,
        ProjectMembership.active.is_(True),
    ))
    if not membership:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")
    if write and membership.role == "lector":
        raise HTTPException(status_code=403, detail="Tu rol permite consultar, pero no modificar este proyecto.")
    if write and membership.role == "campo":
        authorization = latest_visit_authorization(session, project.id)
        if not visit_authorization_active(authorization):
            raise HTTPException(
                status_code=403,
                detail="La captura de campo está bloqueada hasta que administración RED registre una autorización vigente para esta copropiedad.",
                headers={"X-RED-Error-Code": "field-visit-authorization-required"},
            )
    return project, membership.role


def authorize_form_write(role: str, form_code: str) -> None:
    if can_write_form(role, form_code):
        return
    raise HTTPException(status_code=403, detail="Tu rol no permite editar este formulario en este proyecto.")


def require_project_visit_authorization_for_form(session: Session, project: Project, form_code: str) -> None:
    if form_code not in FIELD_VISIT_FORM_CODES:
        return
    authorization = latest_visit_authorization(session, project.id)
    if not visit_authorization_active(authorization):
        raise HTTPException(
            status_code=403,
            detail="Este formulario de campo requiere una autorización vigente registrada para la copropiedad.",
            headers={"X-RED-Error-Code": "field-visit-authorization-required"},
        )


def can_write_form(role: str, form_code: str) -> bool:
    if form_code == "P-12":
        return False
    if role in {"admin", "consultor"}:
        return True
    if role == "campo" and form_code in {"D-03", "D-04", "D-05", "D-06", "D-07", "D-08", "D-09", "D-10", "D-11", "D-12", "D-13", "D-14"}:
        return True
    if role == "campo" and form_code == "P-14":
        return True
    if role == "administracion_ph" and form_code in {"D-01", "D-02", "P-02", "P-07", "P-08", "P-09", "P-10", "P-11", "P-13", "P-14", "P-15"}:
        return True
    return False


def form_read_only_field_ids(role: str, form_code: str) -> set[str]:
    if role == "campo" and form_code == "P-14":
        return {f"P14-{number:03d}" for number in range(1, 7)}
    return set()


def form_editable_field_ids(role: str, form_code: str) -> set[str] | None:
    if role == "campo" and form_code == "P-14":
        return {f"P14-{number:03d}" for number in range(7, 13)}
    return None


def can_add_evidence(role: str, form_code: str) -> bool:
    return role == "revisor" or can_write_form(role, form_code)


def can_remove_record_evidence(evidence: EvidenceFile, record: FormRecord, actor: User, role: str) -> bool:
    """Allow cleanup while a record is still under preparation, preserving validated evidence."""
    if evidence.record_id != record.id or record.status == "VALIDATED" or record.form_code == "P-12":
        return False
    if role in {"admin", "consultor", "revisor"}:
        return True
    return evidence.created_by == actor.id and can_write_form(role, record.form_code)


def audit(session: Session, *, project_id: str | None, actor_id: str, action: str, entity_type: str, entity_id: str, detail: dict | None = None) -> None:
    session.add(AuditEvent(
        project_id=project_id,
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        detail=sanitize_audit_detail(action, detail),
    ))


def audit_pmirs_version_export(session: Session, *, user: User, project: Project, version: PMIRSVersion, format_name: str, signatures_valid: bool, signature_count: int) -> None:
    audit(
        session,
        project_id=project.id,
        actor_id=user.id,
        action="pmirs_version_exported",
        entity_type="pmirs_version",
        entity_id=version.id,
        detail={
            "format": format_name,
            "signatures_valid": signatures_valid,
            "signature_count": signature_count,
        },
    )
    session.commit()


def invalidate_project_baseline(session: Session, project: Project, *, actor_id: str, reason: str, detail: dict | None = None) -> None:
    """Invalidate dependent PMIRS approvals while preserving their audit history."""
    if project.baseline_status != "validada":
        return
    project.baseline_status = "no_iniciada"
    project.baseline_reference = ""
    project.baseline_note = reason[:2000]
    project.baseline_reviewed_by = None
    project.baseline_reviewed_at = None
    audit(
        session, project_id=project.id, actor_id=actor_id, action="baseline_invalidated",
        entity_type="project_baseline", entity_id=project.id,
        detail={"reason": reason, **(detail or {})},
    )
    for item in session.scalars(select(PMIRSItem).where(
        PMIRSItem.project_id == project.id,
        PMIRSItem.review_status.in_(["PENDING_REVIEW", "VALIDATED"]),
    )):
        old_status = item.review_status
        item.review_status = "CORRECTION_REQUESTED"
        item.review_note = "La Línea Base cambió; vuelve a revisar las fuentes antes de enviar este objeto."
        item.reviewed_by = None
        item.reviewed_at = None
        item.version += 1
        item.updated_by = actor_id
        item.updated_at = now_utc()
        session.add(PMIRSItemRevision(
            item_id=item.id, revision=item.version, snapshot=pmirs_item_snapshot(item),
            note="Aprobación invalidada por cambio de Línea Base", changed_by=actor_id,
        ))
        audit(
            session, project_id=project.id, actor_id=actor_id, action="pmirs_item_baseline_invalidated",
            entity_type="pmirs_item", entity_id=item.id,
            detail={"from_status": old_status, "to_status": item.review_status},
        )
    for version in session.scalars(select(PMIRSVersion).where(
        PMIRSVersion.project_id == project.id,
        PMIRSVersion.status != "obsoleta",
    )):
        previous = version.status
        version.status = "obsoleta"
        version.status_note = "La Línea Base cambió; esta captura conserva el historial y requiere una nueva versión."
        version.status_changed_by = actor_id
        version.status_changed_at = now_utc()
        audit(
            session, project_id=project.id, actor_id=actor_id, action="pmirs_version_obsoleted",
            entity_type="pmirs_version", entity_id=version.id,
            detail={"from_status": previous, "to_status": "obsoleta", "reason": reason},
        )


def safe_notice(request: Request) -> str:
    return str(request.query_params.get("notice", ""))[:300]


def safe_error(request: Request) -> str:
    return str(request.query_params.get("error", ""))[:500]


def verify_signature_password(session: Session, user: User, password: str) -> None:
    """Throttle failed signature reauthentication without blocking normal login."""
    key = hashlib.sha256(f"signature-reauth:{user.id}".encode("utf-8")).hexdigest()
    now = now_utc()
    throttle = session.get(LoginThrottle, key)
    if throttle and throttle.blocked_until and utc(throttle.blocked_until) > now:
        raise HTTPException(429, "Se pausó temporalmente la confirmación de firma para esta cuenta. Espera diez minutos y vuelve a intentarlo.")
    if not verify_password(password, user.password_hash):
        # Use the same atomic upsert as login: concurrent signature attempts
        # must not overwrite one another and bypass the account lockout.
        increment_login_throttle(session, key, limit=6, now=now)
        session.commit()
        session.expire_all()
        updated_throttle = session.get(LoginThrottle, key)
        if updated_throttle and updated_throttle.blocked_until and utc(updated_throttle.blocked_until) > now:
            raise HTTPException(429, "Se pausó temporalmente la confirmación de firma para esta cuenta. Espera diez minutos y vuelve a intentarlo.")
        raise HTTPException(403, "La contraseña no coincide. No se guardó la firma.")
    if throttle:
        session.delete(throttle)


def status_label(status: str) -> str:
    return {
        "RAW": "Borrador · sin revisar",
        "PENDING_REVIEW": "Pendiente de revisión",
        "VALIDATED": "Revisado · válido",
        "CORRECTION_REQUESTED": "Requiere corrección",
    }.get(status, status.replace("_", " ").title())


def baseline_missing_forms(session: Session, project_id: str) -> list[str]:
    required_codes = ["D-01", "D-02", "D-06", "D-07", "D-08", "Q-01"]
    missing = []
    for code in required_codes:
        record = latest_project_form_record(session, project_id, code)
        payload = (record.payload or {}) if record else {}
        has_substantive_answer = any(value is not None and str(value).strip() for value in payload.values())
        if code == "D-02":
            # A reviewed intake with a pending-inventory table is useful for
            # follow-up, but it is not a complete factual source for baseline.
            # Every required administrative fact must be answered, and none
            # may remain listed as pending in the same record.
            pending_field_ids = {
                row.get("field_id", "")
                for row in repeatable_field_rows(payload.get("D02-021", ""), "D02-021", include_legacy=False)
            }
            has_substantive_answer = all(
                str(payload.get(field_id, "")).strip()
                for field_id in D02_BASELINE_FACT_FIELD_IDS
            ) and not pending_field_ids.intersection(D02_BASELINE_FACT_FIELD_IDS)
        has_supported_record = bool(
            record
            and record.status == "VALIDATED"
            and record_source_review_current(session, record)
            and has_substantive_answer
            and len(record.source_note.strip()) >= 8
        )
        if not has_supported_record:
            missing.append(code)
    return missing


def latest_project_form_record(session: Session, project_id: str, form_code: str) -> FormRecord | None:
    return session.scalar(
        select(FormRecord)
        .where(FormRecord.project_id == project_id, FormRecord.form_code == form_code)
        .order_by(FormRecord.updated_at.desc(), FormRecord.created_at.desc(), FormRecord.id.desc())
        .limit(1)
    )


def _startup_form_status(record: FormRecord | None) -> tuple[str, str]:
    if not record:
        return "Sin registro", "status-attention"
    return {
        "RAW": ("Borrador", "status-raw"),
        "PENDING_REVIEW": ("En revisión", "status-attention"),
        "VALIDATED": ("Validado", "status-ok"),
        "CORRECTION_REQUESTED": ("Corregir", "status-attention"),
    }.get(record.status, (status_label(record.status), "status-raw"))


def project_startup_form_statuses(session: Session, project_ids: list[str]) -> dict[tuple[str, str], FormRecord]:
    """Read the latest D-01/D-02 records for all visible projects in one query."""
    if not project_ids:
        return {}
    records_by_key: dict[tuple[str, str], FormRecord] = {}
    records = session.scalars(
        select(FormRecord)
        .where(FormRecord.project_id.in_(project_ids), FormRecord.form_code.in_({"D-01", "D-02"}))
        .order_by(FormRecord.updated_at.desc(), FormRecord.created_at.desc(), FormRecord.id.desc())
    )
    for record in records:
        key = (record.project_id, record.form_code)
        if key not in records_by_key:
            records_by_key[key] = record
    return records_by_key


def project_dashboard_setup_actions(
    project: Project,
    role: str,
    latest_records: dict[tuple[str, str], FormRecord],
) -> list[dict[str, str]]:
    """Offer role-aware links to start or resume the two first setup forms."""
    actions = []
    for code in ("D-01", "D-02"):
        record = latest_records.get((project.id, code))
        can_edit = can_write_form(role, code)
        if record is None:
            if not can_edit:
                continue
            actions.append({
                "code": code,
                "label": f"Iniciar {code}",
                "href": f"/projects/{project.id}/records/new?form_code={code}",
            })
            continue
        if record.status == "RAW" and can_edit:
            label = f"Continuar {code}"
        elif record.status == "CORRECTION_REQUESTED" and can_edit:
            label = f"Corregir {code}"
        else:
            label = f"Consultar {code}"
        actions.append({"code": code, "label": label, "href": f"/records/{record.id}"})
    return actions


def project_startup_checklist(session: Session, project: Project, role: str) -> list[dict]:
    """Show the first per-project onboarding actions without implying external approvals."""
    labels = {
        "RAW": ("Borrador · falta revisión QA/QC", "status-raw"),
        "PENDING_REVIEW": ("En revisión QA/QC", "status-attention"),
        "VALIDATED": ("Validado por QA/QC", "status-ok"),
        "CORRECTION_REQUESTED": ("Requiere corrección", "status-attention"),
    }
    if project.identity_status == "confirmada":
        identity_status = "Identidad confirmada"
        identity_detail = (
            "El nombre y la dirección tienen una constancia de cotejo en RED. Si llega una corrección de la administración, "
            "actualiza esta ficha; las versiones PMIRS previas conservarán su captura original."
        )
        identity_class = "status-ok"
    else:
        identity_status = "Pendiente de confirmación"
        identity_detail = (
            "Confirma nombre, dirección, municipio y departamento con la administración de esta unidad antes de usarlos "
            "como identificación oficial en documentos."
        )
        identity_class = "status-attention"
    steps = [{
        "title": "Identificación oficial de la copropiedad",
        "detail": identity_detail,
        "status": identity_status,
        "status_class": identity_class,
        "href": "#project-identity" if role in {"admin", "administracion_ph"} else "",
        "cta": "Revisar ficha" if role in {"admin", "administracion_ph"} else "",
    }]
    for code, title, initial_description in (
        (
            "D-01", "Confirma la identidad del expediente",
            "Captura la información maestra y las responsabilidades con sus fuentes. La confirmación oficial del nombre y la dirección se registra en la ficha de identificación del expediente.",
        ),
        (
            "D-02", "Recopila la información previa de administración",
            "Solicita únicamente fuentes autorizadas; registra periodo, procedencia y vacíos sin convertir lo ausente en cero.",
        ),
    ):
        record = latest_project_form_record(session, project.id, code)
        label, css_class = labels.get(record.status, (status_label(record.status), "status-raw")) if record else ("Sin registro", "status-attention")
        if not record:
            description = initial_description
            href = f"/projects/{project.id}/records/new?form_code={code}" if can_write_form(role, code) else ""
            cta = f"Abrir {code}"
        elif record.status == "VALIDATED":
            description = (
                f"La versión más reciente está validada por QA/QC. Consulta sus fuentes y datos para esta unidad; "
                "si la administración reporta un cambio, registra la corrección con su soporte."
            )
            href, cta = f"/records/{record.id}", f"Consultar {code}"
        elif record.status == "CORRECTION_REQUESTED":
            description = "QA/QC solicitó correcciones. Revisa el criterio y la fuente en el registro antes de reenviar."
            href, cta = f"/records/{record.id}", f"Corregir {code}" if can_write_form(role, code) else f"Consultar {code}"
        elif record.status == "PENDING_REVIEW":
            description = "El registro espera revisión QA/QC. Consulta la captura y sus fuentes; no crees otro registro para reemplazarlo."
            href, cta = f"/records/{record.id}", f"Consultar {code}"
        else:
            description = "Hay un borrador sin revisión. Abre el registro para completar o corregir sus datos y fuentes."
            href, cta = f"/records/{record.id}", f"Editar {code}" if can_write_form(role, code) else f"Consultar {code}"
        steps.append({
            "title": f"{code} · {title}", "detail": description,
            "status": label, "status_class": css_class,
            "href": href, "cta": cta,
        })
    authorization = latest_visit_authorization(session, project.id)
    authorization_state = visit_authorization_status(authorization)
    if visit_authorization_active(authorization):
        auth_status = f"Vigente hasta {authorization.valid_until.isoformat()}"
        auth_detail = (
            "RED registra referencias externas y una revisión administrativa. La vigencia del permiso y el cumplimiento de los requisitos de acceso, privacidad, método y SST siguen dependiendo de los soportes y responsables externos."
        )
        auth_class = "status-ok"
    elif authorization_state == "vencida":
        auth_status = "Autorización vencida"
        auth_detail = "La vigencia registrada terminó. Administración RED debe revisar soportes actuales y registrar una nueva autorización antes de habilitar capturas de campo."
        auth_class = "status-attention"
    elif authorization_state == "revocada":
        auth_status = "Autorización revocada"
        auth_detail = "La autorización anterior fue revocada. La captura de campo permanece bloqueada hasta una nueva revisión administrativa de los soportes aplicables."
        auth_class = "status-attention"
    else:
        auth_status = "Pendiente de aprobación"
        auth_detail = "Pendiente de confirmación externa: alcance y acceso de la copropiedad, privacidad, método técnico y SST. No iniciar mediciones ni capturar datos reales hasta completar las aprobaciones aplicables."
        auth_class = "status-attention"
    steps.append({
        "title": "Autoriza y prepara la primera visita",
        "detail": auth_detail,
        "status": auth_status, "status_class": auth_class,
        "href": "#visit-authorization" if role == "admin" else "", "cta": "Revisar autorización" if role == "admin" else "",
    })
    return steps


def form_answer_sections(form_spec: dict) -> list[dict]:
    """Group displayed answers by optional UI headings while preserving catalog order."""
    sections: list[dict] = []
    current: dict | None = None
    for field in form_spec.get("fields", []):
        heading = str(field.get("ui_section_heading", "")).strip()
        if heading:
            if current:
                sections.append(current)
            current = {"heading": heading, "fields": []}
        elif current is None:
            current = {"heading": "", "fields": []}
        current["fields"].append(field)
    if current:
        sections.append(current)
    return sections


def pending_pmirs_action_reviews(session: Session, project_id: str) -> list[PMIRSItem]:
    """Return execution actions that have evidence and are awaiting QA/QC."""
    return list(session.scalars(select(PMIRSItem).join(
        EvidenceFile, EvidenceFile.pmirs_item_id == PMIRSItem.id,
    ).where(
        PMIRSItem.project_id == project_id,
        PMIRSItem.item_type == "accion",
        EvidenceFile.project_id == project_id,
        PMIRSItem.data["execution_status"].as_string().in_({"evidencia_cargada", "en_validacion"}),
    ).distinct().order_by(PMIRSItem.updated_at, PMIRSItem.code)))


def project_work_route(session: Session, project: Project, role: str, baseline_missing: list[str]) -> dict:
    """Offer a role-specific next-step guide without treating it as a compliance decision."""
    form_titles = {item["code"]: item["title"].split("—")[-1].strip() for item in FORM_CATALOG["forms"]}

    def form_step(code: str, detail: str) -> dict:
        return {
            "title": f"{code} · {form_titles.get(code, 'Formulario RED')}",
            "detail": detail,
            "href": f"/projects/{project.id}/records/new?form_code={code}",
            "cta": "Abrir formulario",
        }

    if role == "admin":
        if not getattr(settings, "drive_external_actions_enabled", False):
            return {
                "title": "Revisa perfiles y requisitos del entorno",
                "description": (
                    "Las acciones externas a Drive permanecen cerradas en este entorno. "
                    "Usa solo cuentas y datos sintéticos en localhost; las conexiones y cargas se habilitan "
                    "cuando staging/producción persistentes tengan aprobados los gates de privacidad y piloto."
                ),
                "steps": [
                    {"title": "Consultar perfiles y alcance de acceso", "detail": "Verifica qué funciones corresponden a cada perfil; las invitaciones de personas reales requieren aprobación y un canal seguro.", "href": "/admin/users", "cta": "Consultar perfiles"},
                    {"title": "Revisar estado de Drive y respaldos", "detail": "Consulta requisitos y copias existentes. Esta instancia no inicia OAuth ni carga respaldos a Drive.", "href": "/drive", "cta": "Ver estado"},
                ],
            }
        return {
            "title": "Prepara el equipo y los respaldos",
            "description": "Crea accesos por copropiedad y conecta el Drive personal antes de cargar información de cliente.",
            "steps": [
                {"title": "Invitar operarios y asignar perfiles", "detail": "Cada persona debe recibir solo el acceso al conjunto que le corresponde.", "href": "/admin/users", "cta": "Administrar accesos"},
                {"title": "Conectar Drive y crear el primer respaldo", "detail": "No se comparte nada automáticamente; la programación del backup depende del hosting.", "href": "/drive", "cta": "Abrir respaldos"},
            ],
        }

    if role == "consultor":
        if baseline_missing:
            authorization = latest_visit_authorization(session, project.id)
            authorization_active = visit_authorization_active(authorization)
            codes = [
                code for code in baseline_missing
                if authorization_active or code not in FIELD_VISIT_FORM_CODES
            ][:4]
            steps = [form_step(code, "Captura el dato disponible y su fuente; si falta, deja la brecha documentada.") for code in codes]
            field_codes_pending = [code for code in baseline_missing if code in FIELD_VISIT_FORM_CODES]
            if field_codes_pending and not authorization_active:
                authorization_state = visit_authorization_status(authorization)
                waiting_detail = {
                    "vencida": "La autorización registrada está vencida.",
                    "revocada": "La autorización registrada fue revocada.",
                    "pendiente": "No hay una autorización registrada.",
                }.get(authorization_state, "No hay una autorización vigente.")
                steps.append({
                    "title": "En espera · autorización para formularios de campo",
                    "detail": (
                        f"{waiting_detail} Los formularios {', '.join(field_codes_pending)} requieren una visita autorizada. "
                        "Pide a Administración RED revisar acceso, privacidad, método técnico y SST; no captures datos reales mientras falte esa autorización."
                    ),
                    "href": "#visit-authorization",
                    "cta": "Ver estado",
                })
            return {
                "title": "Construye la Línea Base con fuentes",
                "description": (
                    "Completa las fuentes administrativas disponibles y conserva vacíos. Los formularios que dependen de una visita solo se habilitan después de registrar su autorización vigente."
                    if field_codes_pending and not authorization_active
                    else "Completa los formularios que aún no tienen un registro validado. La aplicación no inventa datos ausentes."
                ),
                "steps": steps,
            }
        if project.baseline_status != "validada":
            return {
                "title": "Entrega la Línea Base para revisión",
                "description": "Los formularios requeridos ya cuentan con registros válidos; un perfil revisor debe registrar la decisión y su fundamento.",
                "steps": [{"title": "Consultar Línea Base", "detail": "La decisión se registra en el expediente por un perfil revisor.", "href": f"/projects/{project.id}#baseline-panel", "cta": "Ver expediente"}],
            }
        return {
            "title": "Diseña y versiona el PMIRS",
            "description": "Usa los hallazgos soportados para construir programas, acciones, responsables e indicadores.",
            "steps": [{"title": "Abrir PMIRS Studio", "detail": "Conserva fuentes, revisiones y versiones documentales del expediente.", "href": f"/projects/{project.id}/pmirs", "cta": "Abrir PMIRS Studio"}],
        }

    if role == "campo":
        authorization = latest_visit_authorization(session, project.id)
        if not visit_authorization_active(authorization):
            state = visit_authorization_status(authorization)
            status_text = {
                "pendiente": "No hay una autorización registrada.",
                "vencida": "La autorización registrada está vencida.",
                "revocada": "La autorización registrada fue revocada.",
            }.get(state, "No hay una autorización vigente.")
            return {
                "title": "Captura de campo bloqueada",
                "description": f"{status_text} No inicies visitas, mediciones ni registros reales. Administración RED debe revisar los soportes externos y registrar una autorización vigente para esta copropiedad.",
                "steps": [{
                    "title": "Esperar autorización de primera visita",
                    "detail": "El expediente se puede consultar. Las escrituras de este perfil se rechazan en el servidor mientras falte una aprobación vigente.",
                    "href": "", "cta": "",
                }],
            }
        return {
            "title": "Captura la visita con evidencia",
            "description": "Sigue el orden de la visita. Registra si el dato es observado, medido o declarado; no completes valores estimados y espera las validaciones requeridas antes de continuar con pesajes.",
            "steps": [
                form_step("D-03", "Abre la visita, confirma el expediente y registra participantes/condiciones de acceso."),
                form_step("D-04", "Inspecciona cada cuarto o punto; registra recipientes y cantidades observadas."),
                form_step("D-05", "Describe el flujo interno observado sin inferir cantidades que no mediste."),
                form_step("D-10", "Registra acceso, presentación y logística que observaste."),
                form_step("D-06", "Crea la jornada ligada a la visita y registra el periodo de generación."),
                form_step("D-13", "Registra equipo, método y criterio. Espera que QA/QC lo valide antes de enviar pesajes; detente si indica No usar."),
                form_step("D-07", "Registra el peso inicial del lote con equipo D-13 válido y la jornada D-06 correcta."),
                form_step("D-08", "Captura fracciones del mismo lote, ligadas a un D-07 válido; no mezcles grupos."),
                form_step("D-09", "Documenta calidad de separación e impropios que observaste."),
                form_step("D-11", "Adjunta evidencia visual solo cuando esté autorizada; evita rostros y datos de residentes."),
                form_step("D-12", "Registra incidentes o anomalías; protege a las personas y escala de inmediato por riesgo."),
                form_step("D-14", "Registra el cierre de la visita. La clasificación puede quedar pendiente hasta que exista protocolo aprobado."),
                form_step("P-14", "Registra novedades operativas; las referencias de la guía son de solo consulta."),
            ],
        }

    if role == "administracion_ph":
        return {
            "title": "Aporta los datos y soportes de la copropiedad",
            "description": "Completa la información que administra la PH y carga documentos autorizados; marca como pendiente lo que no tengas.",
            "steps": [
                form_step("D-01", "Confirmar identidad, ubicación y datos generales de la unidad."),
                form_step("D-02", "Aportar soportes administrativos disponibles."),
            ],
        }

    if role == "revisor":
        pending_records = list(session.scalars(select(FormRecord).where(
            FormRecord.project_id == project.id, FormRecord.status == "PENDING_REVIEW",
        ).order_by(FormRecord.updated_at).limit(5)))
        pending_items = session.scalar(select(func.count(PMIRSItem.id)).where(
            PMIRSItem.project_id == project.id, PMIRSItem.review_status == "PENDING_REVIEW",
        )) or 0
        pending_action_reviews = pending_pmirs_action_reviews(session, project.id)
        pending_action_review_count = len(pending_action_reviews)
        steps = [
            {"title": f"{record.form_code} · {record.title}", "detail": f"Registro de {record.record_date or 'fecha pendiente'} pendiente de QA/QC.", "href": f"/records/{record.id}", "cta": "Revisar"}
            for record in pending_records
        ]
        steps.extend({
            "title": f"{item.code} · {item.title}",
            "detail": f"Acción con evidencia pendiente de QA/QC · {(item.data or {}).get('progress_pct', 0)} % reportado. Valida o devuelve con un criterio observable.",
            "href": f"/projects/{project.id}/pmirs#action-{item.id}",
            "cta": "Revisar evidencia",
        } for item in pending_action_reviews[:5])
        steps.append({
            "title": "Revisar PMIRS Studio",
            "detail": f"{pending_items} objeto(s) PMIRS pendiente(s) de revisión · Evidencia pendiente de QA/QC: {pending_action_review_count} {'acción' if pending_action_review_count == 1 else 'acciones'}.",
            "href": f"/projects/{project.id}/pmirs", "cta": "Abrir PMIRS",
        })
        if not pending_records and not pending_items and not pending_action_reviews and project.baseline_status != "validada" and not baseline_missing:
            steps.append({"title": "Revisar la Línea Base", "detail": "Hay formularios requeridos completos para decisión QA/QC.", "href": f"/projects/{project.id}#baseline-panel", "cta": "Ver Línea Base"})
        if not pending_records and not pending_items and not pending_action_reviews and (baseline_missing or project.baseline_status == "validada"):
            steps.append({"title": "Sin registros pendientes de revisión", "detail": "Consulta el expediente o revisa nuevas capturas cuando se envíen.", "href": f"/projects/{project.id}", "cta": "Ver expediente"})
        return {
            "title": "Revisa respuestas y evidencia",
            "description": "Acepta únicamente lo que tenga fuente suficiente; solicita corrección con un criterio observable.",
            "steps": steps,
        }

    return {
        "title": "Consulta el expediente asignado",
        "description": "Este perfil consulta los registros existentes, sus evidencias y versiones; no dispone de formularios de captura en blanco.",
        "steps": [{"title": "Consultar registros y versiones", "detail": "Revisa respuestas y evidencias del expediente autorizado.", "href": f"/projects/{project.id}", "cta": "Ver expediente"}],
    }


def can_manage_pmirs(role: str) -> bool:
    return role in {"admin", "consultor"}


def can_upload_pmirs_evidence(item: PMIRSItem, role: str, user_id: str) -> bool:
    """Keep the field role scoped to evidence for actions assigned to that user."""
    if role == "campo":
        return item.item_type == "accion" and field_user_assigned_to_action(item, user_id)
    return role in {"admin", "consultor", "administracion_ph", "revisor"}


def pmirs_progress_options(role: str, current_status: str, *, evidence_count: int = 0) -> list[tuple[str, str]]:
    if role == "admin":
        role_states = set(PMIRS_ACTION_STATES)
    elif role == "consultor":
        role_states = set(PMIRS_ACTION_STATES) - {"validada", "requiere_correccion"}
    elif role in {"campo", "administracion_ph"}:
        role_states = {"pendiente", "en_proceso", "pendiente_tercero", "evidencia_cargada", "en_validacion"}
    elif role == "revisor":
        role_states = {"validada", "requiere_correccion"} if evidence_count else set()
    else:
        role_states = set()
    available = set(PMIRS_ACTION_TRANSITIONS.get(current_status, set())) | {current_status}
    available &= role_states
    if not evidence_count:
        available -= {"evidencia_cargada", "en_validacion", "validada", "cerrada"}
    return [(code, PMIRS_ACTION_STATES[code]) for code in PMIRS_ACTION_STATES if code in available]


def lock_document_context(session: Session, project: Project) -> None:
    lock_evidence_catalog(session)
    session.execute(update(Project).where(Project.id == project.id).values(id=Project.id).execution_options(synchronize_session=False))
    session.refresh(project)


def pmirs_item_document_hash(project: Project, item: PMIRSItem, evidence: list[EvidenceFile]) -> str:
    material = {"project": {"id": project.id, "name": project.name, "municipality": project.municipality, "department": project.department},
                "item": pmirs_item_snapshot(item),
                "evidence": [{"id": e.id, "sha256": e.sha256, "size_bytes": e.size_bytes, "original_name": e.original_name}
                             for e in sorted(evidence, key=lambda e: e.id)]}
    return hashlib.sha256(json.dumps(material, sort_keys=True, ensure_ascii=False, separators=(",", ":"), default=str).encode()).hexdigest()


def check_current_document_baseline(session: Session, project: Project) -> None:
    fraction = latest_project_form_record(session, project.id, "D-08")
    if project.baseline_status != "validada" or (fraction and
        (fraction.status != "VALIDATED" or not record_source_review_current(session, fraction))):
        raise HTTPException(409, "La Línea Base o su pesaje fuente cambiaron. Revisa los soportes vigentes antes de decidir.")


def check_document_hash(expected: str, actual: str) -> None:
    if not re.fullmatch(r"[0-9a-f]{64}", expected) or not secrets.compare_digest(expected, actual):
        raise HTTPException(409, "El contenido o la evidencia cambiaron. Actualiza la pantalla y revisa antes de decidir o firmar.")


def pmirs_item_snapshot(item: PMIRSItem) -> dict:
    return {
        "id": item.id,
        "code": item.code,
        "item_type": item.item_type,
        "item_type_label": PMIRS_ITEM_TYPES.get(item.item_type, {}).get("label", item.item_type),
        "title": item.title,
        "description": item.description,
        "data": dict(item.data or {}),
        "review_status": item.review_status,
        "version": item.version,
        "review_note": item.review_note,
        "reviewed_at": utc(item.reviewed_at).isoformat() if item.reviewed_at else None,
    }


def pmirs_version_object_changes(previous: PMIRSVersion | None, current: PMIRSVersion) -> list[dict[str, str]]:
    """Compare immutable snapshots for P-12 without implying why an item is absent."""
    current_items = (current.snapshot or {}).get("items", [])
    if not previous:
        return [{"kind": "Primera captura", "code": "", "title": f"{len(current_items)} objeto(s) incluidos; no hay versión anterior para comparar."}]

    previous_items = (previous.snapshot or {}).get("items", [])
    previous_by_id = {str(item.get("id")): item for item in previous_items if item.get("id")}
    current_by_id = {str(item.get("id")): item for item in current_items if item.get("id")}
    changes = []
    for item_id, item in current_by_id.items():
        old_item = previous_by_id.get(item_id)
        if old_item is None:
            changes.append({"kind": "Agregado", "code": str(item.get("code", "")), "title": str(item.get("title", "Objeto sin título"))})
        elif old_item != item:
            changes.append({"kind": "Modificado", "code": str(item.get("code", "")), "title": str(item.get("title", "Objeto sin título"))})
    for item_id, item in previous_by_id.items():
        if item_id not in current_by_id:
            changes.append({"kind": "No aparece en esta captura", "code": str(item.get("code", "")), "title": str(item.get("title", "Objeto sin título"))})
    return changes or [{"kind": "Sin diferencias detectadas", "code": "", "title": "Los objetos de ambas capturas coinciden."}]


def pmirs_version_currentness(version: PMIRSVersion, project: Project, current_items: list[PMIRSItem]) -> dict[str, int | bool]:
    """Compare a version's immutable capture with this project's present PMIRS state."""
    snapshot = version.snapshot if isinstance(version.snapshot, dict) else {}
    snapshot_items = snapshot.get("items", [])
    if not isinstance(snapshot_items, list):
        snapshot_items = []
    captured_by_id = {
        str(item.get("id")): item for item in snapshot_items
        if isinstance(item, dict) and item.get("id")
    }
    current_by_id = {item.id: pmirs_item_snapshot(item) for item in current_items}
    changed = sum(
        1 for item_id, captured in captured_by_id.items()
        if item_id in current_by_id and captured != current_by_id[item_id]
    )
    no_longer_present = sum(1 for item_id in captured_by_id if item_id not in current_by_id)
    not_in_capture = sum(1 for item_id in current_by_id if item_id not in captured_by_id)

    baseline_snapshot = snapshot.get("baseline")
    baseline_comparable = isinstance(baseline_snapshot, dict) and {
        "reference", "review_note", "reviewed_at",
    }.issubset(baseline_snapshot)
    current_reviewed_at = utc(project.baseline_reviewed_at).isoformat() if project.baseline_reviewed_at else None
    baseline_changed = baseline_comparable and any((
        baseline_snapshot["reference"] != project.baseline_reference,
        baseline_snapshot["review_note"] != project.baseline_note,
        baseline_snapshot["reviewed_at"] != current_reviewed_at,
    ))

    project_snapshot = snapshot.get("project")
    project_comparable = isinstance(project_snapshot, dict) and {
        "id", "name", "municipality", "department", "address", "identity_status",
        "identity_reference", "identity_confirmed_by", "identity_confirmed_role", "identity_confirmed_at",
    }.issubset(project_snapshot)
    project_changed = project_comparable and any((
        project_snapshot["id"] != project.id,
        project_snapshot["name"] != project.name,
        project_snapshot["municipality"] != project.municipality,
        project_snapshot["department"] != project.department,
        project_snapshot["address"] != project.address,
        project_snapshot["identity_status"] != project.identity_status,
        project_snapshot["identity_reference"] != project.identity_reference,
        project_snapshot["identity_confirmed_by"] != project.identity_confirmed_by,
        project_snapshot["identity_confirmed_role"] != project.identity_confirmed_role,
        project_snapshot["identity_confirmed_at"] != (utc(project.identity_confirmed_at).isoformat() if project.identity_confirmed_at else None),
    ))
    baseline_not_accepted = project.baseline_status != "validada"
    comparison_available = baseline_comparable and project_comparable and len(captured_by_id) == len(snapshot_items)
    return {
        "comparison_available": comparison_available,
        "matches": comparison_available and not any((changed, no_longer_present, not_in_capture, baseline_changed, project_changed, baseline_not_accepted)),
        "changed_items": changed,
        "items_not_in_capture": not_in_capture,
        "captured_items_not_current": no_longer_present,
        "baseline_changed": baseline_changed,
        "baseline_not_accepted": baseline_not_accepted,
        "project_changed": project_changed,
    }


def pmirs_version_currentness_notice(currentness: dict[str, int | bool]) -> str:
    if not currentness.get("comparison_available"):
        return "No se puede comparar con certeza esta captura con el estado actual: el snapshot no contiene todos los metadatos necesarios. Esto no confirma coincidencia ni alteración del documento."
    if currentness.get("matches"):
        return "Esta captura coincide con los objetos y la Línea Base que actualmente muestra este expediente en PMIRS Studio. La comparación no representa una nueva aprobación técnica."
    differences = []
    if currentness.get("changed_items"):
        count = int(currentness["changed_items"])
        noun = "objeto incluido" if count == 1 else "objetos incluidos"
        verb = "cambió" if count == 1 else "cambiaron"
        differences.append(f"{count} {noun} {verb} después de la captura")
    if currentness.get("items_not_in_capture"):
        count = int(currentness["items_not_in_capture"])
        noun = "objeto actual" if count == 1 else "objetos actuales"
        verb = "no está incluido" if count == 1 else "no están incluidos"
        differences.append(f"{count} {noun} {verb} en la captura")
    if currentness.get("captured_items_not_current"):
        count = int(currentness["captured_items_not_current"])
        noun = "objeto de la captura" if count == 1 else "objetos de la captura"
        verb = "ya no aparece" if count == 1 else "ya no aparecen"
        differences.append(f"{count} {noun} {verb} en el estado actual")
    if currentness.get("baseline_changed"):
        differences.append("cambió la referencia o revisión de la Línea Base")
    if currentness.get("baseline_not_accepted"):
        differences.append("la Línea Base actual ya no figura como aceptada")
    if currentness.get("project_changed"):
        differences.append("cambió la identificación territorial del expediente")
    detail = "; ".join(differences) or "cambió el estado del expediente"
    return (
        f"Esta captura difiere del expediente actual: {detail}. "
        "Si la versión se firmó, la huella comprueba el contenido de esa captura, no que siga coincidiendo con el estado actual."
    )


def pmirs_version_currentness_for_project(session: Session, version: PMIRSVersion, project: Project) -> dict[str, int | bool]:
    items = list(session.scalars(select(PMIRSItem).where(PMIRSItem.project_id == project.id)))
    return pmirs_version_currentness(version, project, items)


def pmirs_document_sha256(version: PMIRSVersion) -> str:
    """Fingerprint the exact immutable content and identifying document metadata."""
    return _pmirs_document_sha256(version)


def form_record_document_sha256(project: Project, record: FormRecord, evidence: list[EvidenceFile] | None = None) -> str:
    """Fingerprint one exact form-record revision and its project context."""
    return _form_record_document_sha256(project, record, evidence)


def signature_svg_path(raw: str) -> str:
    """Validate normalized pointer strokes and serialize them as safe SVG path commands."""
    try:
        strokes = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        raise HTTPException(422, "No se pudo leer el trazo. Firma de nuevo en el recuadro.")
    if not isinstance(strokes, list) or not 1 <= len(strokes) <= 12:
        raise HTTPException(422, "La firma debe contener entre 1 y 12 trazos.")
    paths: list[str] = []
    point_count = 0
    for stroke in strokes:
        if not isinstance(stroke, list) or not 1 <= len(stroke) <= 120:
            raise HTTPException(422, "Uno de los trazos de la firma no es válido.")
        commands = []
        for index, point in enumerate(stroke):
            if not isinstance(point, list) or len(point) != 2:
                raise HTTPException(422, "Uno de los puntos de la firma no es válido.")
            try:
                x, y = float(point[0]), float(point[1])
            except (TypeError, ValueError):
                raise HTTPException(422, "Uno de los puntos de la firma no es numérico.")
            if not math.isfinite(x) or not math.isfinite(y) or not (0 <= x <= 1 and 0 <= y <= 1):
                raise HTTPException(422, "La firma contiene un punto fuera del recuadro.")
            commands.append(f"{'M' if index == 0 else 'L'}{x * 600:.2f},{y * 180:.2f}")
            point_count += 1
        paths.append(" ".join(commands))
    if point_count < 2:
        raise HTTPException(422, "Dibuja una firma completa antes de guardarla.")
    return " ".join(paths)


def next_pmirs_code(session: Session, project_id: str, item_type: str) -> str:
    spec = PMIRS_ITEM_TYPES[item_type]
    count = session.scalar(select(func.count(PMIRSItem.id)).where(
        PMIRSItem.project_id == project_id,
        PMIRSItem.item_type == item_type,
    )) or 0
    return f"{spec['prefix']}-{count + 1:0{spec['padding']}d}"


def _form_list(form, key: str, *, limit: int = 40) -> list[str]:
    values = form.getlist(key) if hasattr(form, "getlist") else []
    return list(dict.fromkeys(str(value).strip()[:80] for value in values if str(value).strip()))[:limit]


def _pmirs_values(form, item_type: str) -> tuple[str, str, dict]:
    title = str(form.get("title", "")).strip()[:240]
    description = str(form.get("description", "")).strip()[:8000]
    data: dict = {}
    list_fields = {
        "hallazgo": {"source_record_ids", "evidence_ids"},
        "programa": {"finding_ids"},
        "accion": {"finding_ids", "assignee_user_ids"},
        "indicador": set(),
    }.get(item_type, set())
    scalar_fields = {
        "hallazgo": {"topic", "support_level", "limitations", "priority", "priority_reason", "recommended_program_id", "lifecycle_status", "discard_reason"},
        "programa": {"applies", "applicability_reason", "objective", "scope", "owner_role", "program_status"},
        "accion": {"program_id", "completion_criteria", "owner", "support", "priority", "start_date", "due_date", "resources", "indicator_id", "expected_evidence", "expected_evidence_detail"},
        "indicador": {"definition", "formula", "unit", "source_description", "frequency", "report_owner", "target", "baseline_value", "baseline_date", "baseline_support", "data_available", "capture_method", "capture_action_id", "indicator_status"},
    }.get(item_type, set())
    for key in list_fields:
        data[key] = _form_list(form, key)
    for key in scalar_fields:
        value = str(form.get(key, "")).strip()
        if key == "progress_pct":
            try:
                value = max(0, min(100, int(value or "0")))
            except ValueError:
                value = -1
        else:
            value = value[:4000]
        data[key] = value
    return title, description, data


def pmirs_action_assignees(session: Session, project_id: str) -> list[dict]:
    """Return active field members who can receive an action in this project."""
    rows = session.execute(
        select(ProjectMembership, User)
        .join(User, User.id == ProjectMembership.user_id)
        .where(
            ProjectMembership.project_id == project_id,
            ProjectMembership.role == "campo",
            ProjectMembership.active.is_(True),
            User.active.is_(True),
        )
        .order_by(User.full_name, User.email)
    ).all()
    return [{"id": membership.user_id, "name": member.full_name, "email": member.email} for membership, member in rows]


def validate_pmirs_action_assignees(session: Session, project_id: str, user_ids: list[str]) -> list[str]:
    """Reject stale, cross-project, inactive, or non-field assignee ids."""
    if not user_ids:
        return []
    valid_ids = set(session.scalars(select(ProjectMembership.user_id).join(
        User, User.id == ProjectMembership.user_id,
    ).where(
        ProjectMembership.project_id == project_id,
        ProjectMembership.role == "campo",
        ProjectMembership.active.is_(True),
        User.active.is_(True),
        ProjectMembership.user_id.in_(user_ids),
    )))
    invalid = [user_id for user_id in user_ids if user_id not in valid_ids]
    if invalid:
        return ["La asignación solo admite operarios activos con perfil de campo en este expediente."]
    return []


def field_user_assigned_to_action(item: PMIRSItem, user_id: str) -> bool:
    return user_id in (item.data or {}).get("assignee_user_ids", [])


def is_iso_calendar_date(value: object) -> bool:
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return False
    try:
        return date.fromisoformat(value).isoformat() == value
    except ValueError:
        return False


def pmirs_submission_errors(session: Session, project_id: str, item_type: str, title: str, description: str, data: dict) -> list[str]:
    errors: list[str] = []
    if not 3 <= len(title) <= 240:
        errors.append("Escribe un título de al menos 3 caracteres.")
    if not description.strip():
        errors.append("Agrega la descripción técnica o el criterio del objeto.")

    def project_records(ids: list[str], *, must_be_validated: bool = False) -> list[FormRecord]:
        rows = list(session.scalars(select(FormRecord).where(
            FormRecord.project_id == project_id,
            FormRecord.id.in_(ids or ["__none__"]),
        )))
        if len(rows) != len(ids):
            errors.append("Una o más fuentes seleccionadas no pertenecen a este expediente.")
        if must_be_validated and any(row.status != "VALIDATED" or not record_source_review_current(session, row) for row in rows):
            errors.append("Un hallazgo en revisión solo puede basarse en formularios revisados como válidos.")
        return rows

    def project_items(ids: list[str], expected_type: str | None = None) -> list[PMIRSItem]:
        rows = list(session.scalars(select(PMIRSItem).where(
            PMIRSItem.project_id == project_id,
            PMIRSItem.id.in_(ids or ["__none__"]),
        )))
        if len(rows) != len(ids) or (expected_type and any(row.item_type != expected_type for row in rows)):
            errors.append("Una o más relaciones no pertenecen a este expediente o tienen otro tipo.")
        return rows

    if item_type == "hallazgo":
        if data.get("topic") not in PMIRS_TOPICS:
            errors.append("Selecciona un tema del hallazgo.")
        if data.get("support_level") not in {"A", "B", "C", "D", "Mixto"}:
            errors.append("Indica el nivel de soporte usado por GREENATICS.")
        if data.get("priority") not in PMIRS_PRIORITY:
            errors.append("Selecciona la prioridad interna.")
        if len(str(data.get("priority_reason", "")).strip()) < 8:
            errors.append("Explica por qué se prioriza este hallazgo.")
        if data.get("lifecycle_status") not in {"abierto", "tratado", "descartado", "monitoreo"}:
            errors.append("Selecciona el estado del hallazgo.")
        if data.get("lifecycle_status") == "descartado" and len(str(data.get("discard_reason", "")).strip()) < 8:
            errors.append("Un hallazgo descartado requiere un motivo.")
        source_ids = data.get("source_record_ids", [])
        if not source_ids:
            errors.append("Vincula al menos un registro de diagnóstico como fuente.")
        project_records(source_ids, must_be_validated=True)
        for evidence_id in data.get("evidence_ids", []):
            if not session.scalar(select(EvidenceFile.id).where(
                EvidenceFile.id == evidence_id, EvidenceFile.project_id == project_id,
            )):
                errors.append("Una evidencia seleccionada no pertenece a este expediente.")
        if data.get("recommended_program_id"):
            project_items([data["recommended_program_id"]], "programa")
    elif item_type == "programa":
        if data.get("applies") not in {"si", "no"}:
            errors.append("Indica si el programa aplica a esta copropiedad.")
        if len(str(data.get("applicability_reason", "")).strip()) < 8:
            errors.append("Justifica la decisión de aplicabilidad.")
        if data.get("applies") == "si":
            if len(str(data.get("objective", "")).strip()) < 8:
                errors.append("Define el objetivo específico del programa.")
            if len(str(data.get("scope", "")).strip()) < 8:
                errors.append("Describe el alcance del programa.")
            if len(str(data.get("owner_role", "")).strip()) < 2:
                errors.append("Indica el rol responsable principal.")
        if data.get("program_status") not in {"borrador", "en_revision", "aprobado_interno", "implementacion", "activo", "no_aplica"}:
            errors.append("Selecciona el estado de formulación del programa.")
        project_items(data.get("finding_ids", []), "hallazgo")
    elif item_type == "accion":
        if not data.get("program_id"):
            errors.append("Cada acción debe pertenecer a un programa.")
        else:
            program = session.scalar(select(PMIRSItem).where(
                PMIRSItem.id == data["program_id"], PMIRSItem.project_id == project_id,
                PMIRSItem.item_type == "programa",
            ))
            if not program:
                errors.append("Selecciona un programa de este expediente.")
            elif data.get("_require_valid_relations") and (program.review_status != "VALIDATED" or (program.data or {}).get("applies") != "si"):
                errors.append("La acción requiere un programa aplicable y revisado como válido.")
        project_items(data.get("finding_ids", []), "hallazgo")
        if len(str(data.get("owner", "")).strip()) < 2:
            errors.append("Indica el rol o persona responsable de la acción.")
        if data.get("priority") not in PMIRS_PRIORITY:
            errors.append("Selecciona la prioridad interna de la acción.")
        due_date = data.get("due_date")
        start_date = data.get("start_date")
        valid_due_date = is_iso_calendar_date(due_date)
        valid_start_date = not start_date or is_iso_calendar_date(start_date)
        if not due_date:
            errors.append("Define una fecha objetivo para la acción.")
        elif not valid_due_date:
            errors.append("La fecha objetivo debe ser una fecha real en formato AAAA-MM-DD.")
        if start_date and not valid_start_date:
            errors.append("La fecha de inicio debe ser una fecha real en formato AAAA-MM-DD.")
        if valid_start_date and valid_due_date and start_date and due_date < start_date:
            errors.append("La fecha objetivo debe ser igual o posterior a la fecha de inicio.")
        if not data.get("indicator_id"):
            errors.append("Vincula un indicador para poder hacer seguimiento.")
        else:
            indicator = session.scalar(select(PMIRSItem).where(
                PMIRSItem.id == data["indicator_id"], PMIRSItem.project_id == project_id,
                PMIRSItem.item_type == "indicador",
            ))
            if not indicator:
                errors.append("Selecciona un indicador de este expediente.")
            elif data.get("_require_valid_relations") and indicator.review_status != "VALIDATED":
                errors.append("La acción requiere un indicador revisado como válido.")
        if len(str(data.get("completion_criteria", "")).strip()) < 8:
            errors.append("Define el criterio para dar la acción por terminada.")
        if data.get("expected_evidence") not in {"foto", "acta", "documento", "registro", "medicion", "otro"}:
            errors.append("Selecciona la evidencia esperada.")
        if data.get("execution_status") not in PMIRS_ACTION_STATES:
            errors.append("Selecciona el estado de ejecución.")
        if not isinstance(data.get("progress_pct"), int) or data["progress_pct"] < 0:
            errors.append("El avance debe ser un número entre 0 y 100.")
    elif item_type == "indicador":
        for key, label in [("definition", "la definición"), ("formula", "la fórmula"), ("unit", "la unidad"), ("source_description", "la fuente de datos"), ("frequency", "la frecuencia"), ("report_owner", "el responsable de reporte")]:
            if len(str(data.get(key, "")).strip()) < 2:
                errors.append(f"Completa {label} del indicador.")
        if data.get("data_available") not in {"si", "no", "parcial"}:
            errors.append("Indica si el dato está disponible actualmente.")
        if data.get("data_available") in {"no", "parcial"} and len(str(data.get("capture_method", "")).strip()) < 8:
            errors.append("Describe el método o actividad para capturar el dato que falta.")
        if data.get("capture_action_id"):
            project_items([data["capture_action_id"]], "accion")
    return errors


def pmirs_form_context(session: Session, request: Request, project: Project, item_type: str, *, item: PMIRSItem | None = None, values: dict | None = None, error: str = "") -> dict:
    values = values or {}
    data = dict(item.data or {}) if item else {}
    data.update(values)
    field_assignees = pmirs_action_assignees(session, project.id) if item_type == "accion" else []
    active_field_ids = {member["id"] for member in field_assignees}
    return page_context(
        request,
        project=project,
        item=item,
        item_type=item_type,
        type_label=PMIRS_ITEM_TYPES[item_type]["label"],
        new_prefix="Nueva" if item_type == "accion" else "Nuevo",
        values=data,
        form_title=item.title if item else str(values.get("title", "")),
        form_description=item.description if item else str(values.get("description", "")),
        error=error,
        records=list(session.scalars(select(FormRecord).where(FormRecord.project_id == project.id).order_by(FormRecord.form_code, FormRecord.record_date.desc()))),
        evidence=list(session.scalars(select(EvidenceFile).where(EvidenceFile.project_id == project.id).order_by(EvidenceFile.created_at.desc()))),
        items=list(session.scalars(select(PMIRSItem).where(PMIRSItem.project_id == project.id).order_by(PMIRSItem.item_type, PMIRSItem.code))),
        topics=PMIRS_TOPICS,
        priorities=PMIRS_PRIORITY,
        action_states=PMIRS_ACTION_STATES,
        project_record_status_labels={row.id: record_status_label(session, row) for row in session.scalars(select(FormRecord).where(FormRecord.project_id == project.id))},
        item_review_labels=PMIRS_REVIEW_LABELS,
        field_assignees=field_assignees,
        stale_field_assignees=bool(set(data.get("assignee_user_ids", [])) - active_field_ids),
    )


@app.get("/api/health")
def health(session: Session = Depends(get_db)):
    try:
        session.execute(select(func.count(Project.id))).scalar_one()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="La base de datos RED no responde.") from exc
    try:
        storage.health_check()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="El almacenamiento privado de RED no responde.") from exc
    return {"status": "ok", "application": "GREENATICS RED", "version": backups.APP_VERSION}


PUBLIC_ACCESS_PROJECT_SLUGS = BELLO_PROJECT_SLUGS
LOGIN_THROTTLE_WINDOW = timedelta(minutes=10)
LOGIN_ACCOUNT_ATTEMPT_LIMIT = 6
LOGIN_CLIENT_IP_ATTEMPT_LIMIT = 30


def trusted_login_client_ip(request: Request) -> str | None:
    header_name = getattr(settings, "trusted_client_ip_header", "")
    if not header_name:
        return None
    raw_value = request.headers.get(header_name)
    if not raw_value:
        return None
    try:
        return ipaddress.ip_address(raw_value.strip()).compressed
    except ValueError:
        return None


def login_throttle_key(scope: str, identity: str) -> str:
    message = f"red-login-throttle:{scope}:{identity}".encode("utf-8")
    return hmac.new(settings.session_secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def increment_login_throttle(session: Session, key: str, limit: int, now: datetime) -> None:
    statement = login_throttle_upsert_statement(
        session.get_bind().dialect.name, key=key, limit=limit, now=now,
    )
    session.execute(statement)


def login_throttle_upsert_statement(dialect_name: str, *, key: str, limit: int, now: datetime):
    if dialect_name == "sqlite":
        insert = sqlite_insert
    elif dialect_name == "postgresql":
        insert = postgresql_insert
    else:
        raise RuntimeError(f"El throttling de login no soporta el motor SQL {dialect_name!r}.")

    cutoff = now - LOGIN_THROTTLE_WINDOW
    window_expired = LoginThrottle.window_start <= cutoff
    blocked_until = now + LOGIN_THROTTLE_WINDOW
    statement = insert(LoginThrottle).values(
        key=key,
        attempts=1,
        window_start=now,
        blocked_until=blocked_until if limit <= 1 else None,
    )
    return statement.on_conflict_do_update(
        index_elements=[LoginThrottle.key],
        set_={
            "attempts": case(
                (window_expired, 1),
                else_=LoginThrottle.attempts + 1,
            ),
            "window_start": case(
                (window_expired, now),
                else_=LoginThrottle.window_start,
            ),
            "blocked_until": case(
                (window_expired, blocked_until if limit <= 1 else None),
                (LoginThrottle.attempts + 1 >= limit, blocked_until),
                else_=LoginThrottle.blocked_until,
            ),
        },
    )


def login_throttle_blocked(session: Session, key: str | None, now: datetime) -> bool:
    throttle = session.get(LoginThrottle, key) if key else None
    return bool(throttle and throttle.blocked_until and utc(throttle.blocked_until) > now)


@app.get("/api/ready")
def public_readiness(request: Request, response: Response, session: Session = Depends(get_db)):
    """Fail closed until the production runtime passes its explicit public-access gates."""
    try:
        if not settings.is_production or not settings.red_public_access_enabled:
            raise RuntimeError("public access gate is disabled")
        if settings.production_issues():
            raise RuntimeError("production configuration is incomplete")
        session.execute(select(func.count(Project.id))).scalar_one()
        storage.health_check()
        active_admin = session.scalar(select(User.id).where(
            User.active.is_(True), User.is_platform_admin.is_(True),
        ).limit(1))
        if not active_admin:
            raise RuntimeError("active RED administrator is missing")
        expected_projects = dict(BELLO_PROJECTS)
        project_rows = list(session.execute(select(
            Project.slug, Project.name, Project.municipality, Project.department,
        ).where(
            Project.slug.in_(PUBLIC_ACCESS_PROJECT_SLUGS),
        )))
        projects_match = (
            {row.slug for row in project_rows} == PUBLIC_ACCESS_PROJECT_SLUGS
            and len(project_rows) == len(PUBLIC_ACCESS_PROJECT_SLUGS)
            and all(
                row.name == expected_projects.get(row.slug)
                and row.municipality == "Bello"
                and row.department == "Antioquia"
                for row in project_rows
            )
        )
        if not projects_match:
            raise RuntimeError("initial Bello project workspaces are incomplete")
        connection = session.scalar(select(DriveConnection).limit(1))
        if not connection or not connection.backup_folder_id:
            raise RuntimeError("personal Drive backup connection is missing")
        if not drive.decrypt_refresh_token(connection.encrypted_refresh_token):
            raise RuntimeError("personal Drive token cannot be decrypted")
        backup_now = now_utc()
        backup_cutoff = backup_now - PUBLIC_BACKUP_MAX_AGE
        verified_backup = session.scalar(select(Backup.id).where(
            Backup.status == "completado",
            Backup.drive_folder_id == connection.backup_folder_id,
            Backup.drive_file_id != "",
            Backup.sha256 != "",
            Backup.bytes_total > 0,
            Backup.completed_at.is_not(None),
            Backup.completed_at >= backup_cutoff,
            Backup.completed_at <= backup_now,
        ).order_by(Backup.created_at.desc()).limit(1))
        if not verified_backup:
            raise RuntimeError("no recent successful Drive backup is recorded")
    except Exception as exc:
        logger.warning("RED public readiness check failed (%s).", type(exc).__name__)
        raise HTTPException(
            status_code=503,
            detail="GREENATICS RED no está habilitado para acceso público.",
        ) from None
    origin = request.headers.get("origin", "")
    response.headers["Cache-Control"] = "no-store"
    response.headers["Vary"] = "Origin"
    allows_origin = getattr(settings, "allows_public_site_origin", None)
    if origin and callable(allows_origin) and allows_origin(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
    return {
        "status": "ready",
        "application": "GREENATICS RED",
        "version": backups.APP_VERSION,
        "project_workspaces": len(PUBLIC_ACCESS_PROJECT_SLUGS),
        "drive_backup_verified": True,
    }


@app.get("/api/forms")
def api_forms():
    return JSONResponse(FORM_CATALOG)


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request, session: Session = Depends(get_db)):
    purge_expired_login_throttles(session, now=now_utc())
    return templates.TemplateResponse(request=request, name="login.html", context={
        "request": request,
        "csrf": csrf_token(request),
        "error": "",
        "notice": safe_notice(request),
    })


@app.post("/login")
def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    csrf: str = Form(...),
    session: Session = Depends(get_db),
):
    check_csrf(request, csrf)
    normalized_email = email.strip().lower()[:320]
    now = now_utc()
    purge_expired_login_throttles(session, now=now)
    client_ip = trusted_login_client_ip(request)
    if getattr(settings, "app_env", "local") in {"staging", "production"} and not client_ip:
        return templates.TemplateResponse(request=request, name="login.html", status_code=503, context={
            "request": request,
            "csrf": csrf_token(request),
            "error": "No se puede verificar el origen de la conexión. Intenta de nuevo más tarde.",
            "notice": "",
        })
    if client_ip:
        account_throttle_key = login_throttle_key("account-ip", f"{normalized_email}\x00{client_ip}")
        ip_throttle_key = login_throttle_key("client-ip", client_ip)
    else:
        account_throttle_key = hashlib.sha256(normalized_email.encode("utf-8")).hexdigest()
        ip_throttle_key = None
    if (
        login_throttle_blocked(session, account_throttle_key, now)
        or login_throttle_blocked(session, ip_throttle_key, now)
    ):
        return templates.TemplateResponse(request=request, name="login.html", status_code=429, context={
            "request": request, "csrf": csrf_token(request),
            "error": "Se pausaron los intentos de acceso por seguridad. Espera unos minutos y vuelve a intentar.",
            "notice": "",
        })
    user = session.scalar(select(User).where(User.email == normalized_email))
    stored_password_hash = (
        user.password_hash if user and user.active else LOGIN_DUMMY_PASSWORD_HASH
    )
    password_valid = verify_password(password, stored_password_hash)
    if not user or not user.active or not password_valid:
        increment_login_throttle(session, account_throttle_key, LOGIN_ACCOUNT_ATTEMPT_LIMIT, now)
        if ip_throttle_key:
            increment_login_throttle(session, ip_throttle_key, LOGIN_CLIENT_IP_ATTEMPT_LIMIT, now)
        session.commit()
        return templates.TemplateResponse(request=request, name="login.html", status_code=401, context={
            "request": request, "csrf": csrf_token(request),
            "error": "Correo o contraseña no válidos.", "notice": "",
        })
    account_throttle = session.get(LoginThrottle, account_throttle_key)
    if account_throttle:
        session.delete(account_throttle)
    user.last_login_at = now
    audit(session, project_id=None, actor_id=user.id, action="login", entity_type="user", entity_id=user.id)
    session.commit()
    request.session.clear()
    request.session["user_id"] = user.id
    request.session["session_version"] = user.session_version
    csrf_token(request)
    return RedirectResponse("/", status_code=303)


@app.post("/logout")
def logout(request: Request, csrf: str = Form(...), session: Session = Depends(get_db)):
    check_csrf(request, csrf)
    user = current_user(request, session)
    user.session_version += 1
    audit(
        session, project_id=None, actor_id=user.id, action="logout", entity_type="user", entity_id=user.id,
        detail={"all_sessions_invalidated": True},
    )
    session.commit()
    request.session.clear()
    return RedirectResponse("/login", status_code=303)


@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    storage_capacity = None
    if user.is_platform_admin:
        projects = sorted(session.scalars(select(Project)), key=project_order_key)
        roles_by_project = {project.id: "admin" for project in projects}
        usage_by_project = evidence_usage_by_project(session)
        total_limit_bytes = settings.max_evidence_total_mb * 1024 * 1024
        project_limit_bytes = settings.max_evidence_project_mb * 1024 * 1024
        total_used_bytes = sum(usage_by_project.values())
        storage_capacity = {
            "total_used_mb": round(total_used_bytes / (1024 * 1024), 1),
            "total_limit_mb": settings.max_evidence_total_mb,
            "total_remaining_mb": round(max(0, total_limit_bytes - total_used_bytes) / (1024 * 1024), 1),
            "total_percent": min(100, round(total_used_bytes / total_limit_bytes * 100, 1)),
            "total_over_limit": total_used_bytes > total_limit_bytes,
            "projects": [{
                "id": project.id,
                "name": project.name,
                "used_mb": round(usage_by_project.get(project.id, 0) / (1024 * 1024), 1),
                "limit_mb": settings.max_evidence_project_mb,
                "remaining_mb": round(max(0, project_limit_bytes - usage_by_project.get(project.id, 0)) / (1024 * 1024), 1),
                "percent": min(100, round(usage_by_project.get(project.id, 0) / project_limit_bytes * 100, 1)),
                "over_limit": usage_by_project.get(project.id, 0) > project_limit_bytes,
            } for project in projects],
        }
    else:
        memberships = list(session.scalars(select(ProjectMembership).where(
            ProjectMembership.user_id == user.id,
            ProjectMembership.active.is_(True),
        )))
        project_ids = [membership.project_id for membership in memberships]
        roles_by_project = {membership.project_id: membership.role for membership in memberships}
        projects = sorted(
            session.scalars(select(Project).where(Project.id.in_(project_ids))), key=project_order_key,
        ) if project_ids else []
    startup_statuses = project_startup_form_statuses(session, [project.id for project in projects])
    rows = []
    for project in projects:
        role = roles_by_project.get(project.id, "lector")
        missing_baseline_forms = baseline_missing_forms(session, project.id)
        if project.baseline_status == "validada" and not missing_baseline_forms:
            baseline_summary = "Aceptada"
        elif missing_baseline_forms:
            baseline_summary = f"Pendiente · faltan {', '.join(missing_baseline_forms)}"
            if "D-02" in missing_baseline_forms:
                baseline_summary += " · D-02 requiere respuesta en sus 6 datos factuales"
        else:
            baseline_summary = "Pendiente de revisión QA/QC"
        visit_authorization = latest_visit_authorization(session, project.id)
        if visit_authorization_active(visit_authorization):
            visit_summary = f"Control RED registrado hasta {visit_authorization.valid_until.isoformat()}"
        elif visit_authorization is None:
            visit_summary = "Sin registro RED"
        elif visit_authorization.revoked_at is not None or visit_authorization.status == "revoked":
            visit_summary = "Revocado"
        elif visit_authorization.valid_until < visit_today():
            visit_summary = "Vencido"
        else:
            visit_summary = "Pendiente de revisión RED"
        row = {
            "project": project,
            "records": session.scalar(select(func.count(FormRecord.id)).where(FormRecord.project_id == project.id)) or 0,
            "can_review": user.is_platform_admin or role == "revisor",
            "startup_identity": _startup_form_status(startup_statuses.get((project.id, "D-01")))[0],
            "startup_admin_info": _startup_form_status(startup_statuses.get((project.id, "D-02")))[0],
            "setup_actions": project_dashboard_setup_actions(project, role, startup_statuses),
            "baseline_summary": baseline_summary,
            "visit_summary": visit_summary,
        }
        if row["can_review"]:
            row["pending_forms"] = session.scalar(select(func.count(FormRecord.id)).where(
                FormRecord.project_id == project.id,
                FormRecord.status == "PENDING_REVIEW",
                FormRecord.form_code != "P-12",
            )) or 0
            row["pending_pmirs"] = session.scalar(select(func.count(PMIRSItem.id)).where(
                PMIRSItem.project_id == project.id,
                PMIRSItem.review_status == "PENDING_REVIEW",
            )) or 0
            row["pending_action_reviews"] = len(pending_pmirs_action_reviews(session, project.id))
        rows.append(row)
    return templates.TemplateResponse(request=request, name="dashboard.html", context=page_context(
        request, projects=rows, notice=safe_notice(request), production_issues=settings.production_issues(),
        storage_capacity=storage_capacity,
    ))


@app.get("/projects/{project_id}", response_class=HTMLResponse)
def project_page(project_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user)
    records = list(session.scalars(
        select(FormRecord).where(FormRecord.project_id == project.id).order_by(FormRecord.updated_at.desc()).limit(40)
    ))
    missing = baseline_missing_forms(session, project.id)
    assigned_actions = []
    if role == "campo":
        all_actions = list(session.scalars(select(PMIRSItem).where(
            PMIRSItem.project_id == project.id,
            PMIRSItem.item_type == "accion",
            PMIRSItem.review_status == "VALIDATED",
        ).order_by(PMIRSItem.code)))
        assigned_actions = [item for item in all_actions if field_user_assigned_to_action(item, user.id)]
        priority_order = {"alta": 0, "media": 1, "baja": 2}
        assigned_actions.sort(key=lambda item: (
            priority_order.get((item.data or {}).get("priority", ""), 3),
            (item.data or {}).get("due_date") or "9999-12-31",
            item.code,
        ))
    visit_authorization = latest_visit_authorization(session, project.id)
    visit_authorization_is_active = visit_authorization_active(visit_authorization)
    record_rows = [{"record": record, "status_label": record_status_label(session, record), "form_title": FORM_BY_CODE.get(record.form_code, {}).get("title", record.form_code)} for record in records]
    return templates.TemplateResponse(request=request, name="project.html", context=page_context(
        request, project=project, role=role, records=record_rows, assigned_actions=assigned_actions,
        startup_checklist=project_startup_checklist(session, project, role),
        work_route=project_work_route(session, project, role, missing),
        action_states=PMIRS_ACTION_STATES,
        forms=FORM_CATALOG["forms"], can_write=role != "lector",
        can_export_records=role in PROJECT_EXPORT_ROLES,
        writable_form_codes={form["code"] for form in FORM_CATALOG["forms"] if can_write_form(role, form["code"])},
        can_review_baseline=user.is_platform_admin or role == "revisor",
        visit_authorization=visit_authorization,
        visit_authorization_status=visit_authorization_status(visit_authorization),
        visit_authorization_is_active=visit_authorization_is_active,
        visit_authorization_reviewer=(session.get(User, visit_authorization.created_by).full_name if visit_authorization and session.get(User, visit_authorization.created_by) else "Cuenta de RED"),
        current_date=visit_today().isoformat(),
        can_manage_visit_authorization=user.is_platform_admin,
        can_manage_project_identity=user.is_platform_admin or role == "administracion_ph",
        project_identity_reviewer=(session.get(User, project.identity_confirmed_by).full_name if project.identity_confirmed_by and session.get(User, project.identity_confirmed_by) else "Cuenta de RED"),
        project_identity_role_label={"admin": "Administración RED", "administracion_ph": "Administración PH"}.get(project.identity_confirmed_role, "Perfil administrativo"),
        project_identity_reference_limit=PROJECT_IDENTITY_REFERENCE_LIMIT,
        visit_authorization_revocation_reasons=VISIT_AUTHORIZATION_REVOCATION_REASONS,
        visit_authorization_reference_limit=VISIT_AUTHORIZATION_REFERENCE_LIMIT,
        baseline_missing=missing, notice=safe_notice(request),
        operational_references_url=f"/projects/{project.id}/operational-references",
        pmirs_item_count=session.scalar(select(func.count(PMIRSItem.id)).where(PMIRSItem.project_id == project.id)) or 0,
        pmirs_version_count=session.scalar(select(func.count(PMIRSVersion.id)).where(PMIRSVersion.project_id == project.id)) or 0,
    ))


@app.post("/projects/{project_id}/identity")
async def update_project_identity(project_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user, write=True)
    if role not in {"admin", "administracion_ph"}:
        raise HTTPException(status_code=403, detail="Solo administración RED o Administración PH de esta copropiedad puede administrar su identificación.")
    form = await request.form()
    check_csrf(request, str(form.get("csrf", "")))
    action = str(form.get("action", ""))
    allowed_actions = {"save_pending", "confirm", "reset"}
    if action not in allowed_actions:
        raise HTTPException(status_code=422, detail="Selecciona guardar como pendiente, confirmar o restablecer la identificación.")

    before = {
        "name": project.name, "municipality": project.municipality, "department": project.department,
        "address": project.address, "identity_status": project.identity_status,
        "identity_reference": project.identity_reference,
        "identity_confirmed_role": project.identity_confirmed_role,
        "identity_confirmed_at": utc(project.identity_confirmed_at).isoformat() if project.identity_confirmed_at else None,
    }
    if action == "reset":
        if project.identity_status == "pendiente" and not project.identity_reference and not project.identity_confirmed_at and not project.identity_confirmed_role:
            return RedirectResponse(f"/projects/{project.id}?notice=La%20identificaci%C3%B3n%20ya%20estaba%20pendiente#project-identity", status_code=303)
        project.identity_status = "pendiente"
        project.identity_reference = ""
        project.identity_confirmed_by = None
        project.identity_confirmed_role = None
        project.identity_confirmed_at = None
    else:
        name = str(form.get("name", "")).strip()
        municipality = str(form.get("municipality", "")).strip()
        department = str(form.get("department", "")).strip()
        address = str(form.get("address", "")).strip()
        if not 2 <= len(name) <= 240 or not 2 <= len(municipality) <= 120 or not 2 <= len(department) <= 120:
            raise HTTPException(status_code=422, detail="Completa nombre, municipio y departamento dentro de los límites indicados.")
        if len(address) > 500:
            raise HTTPException(status_code=422, detail="La dirección supera el máximo permitido de 500 caracteres.")
        existing = list(session.scalars(select(Project).where(Project.id != project.id)))
        if any(other.name.casefold() == name.casefold() for other in existing):
            raise HTTPException(status_code=409, detail="Ese nombre ya se usa en otro expediente. Verifica que no estés modificando la unidad equivocada.")
        if action == "confirm":
            reference = str(form.get("identity_reference", "")).strip()
            if str(form.get("confirmation_checked", "")) != "yes":
                raise HTTPException(status_code=422, detail="Confirma que cotejaste los datos con la administración o fuente identificada.")
            if len(address) < 5 or not validate_visit_reference(reference, maximum=PROJECT_IDENTITY_REFERENCE_LIMIT):
                raise HTTPException(status_code=422, detail="Para confirmar, registra la dirección completa y un folio alfanumérico con letras y números.")
            project.identity_status = "confirmada"
            project.identity_reference = reference
            project.identity_confirmed_by = user.id
            project.identity_confirmed_role = role
            project.identity_confirmed_at = now_utc()
        else:
            project.identity_status = "pendiente"
            project.identity_reference = ""
            project.identity_confirmed_by = None
            project.identity_confirmed_role = None
            project.identity_confirmed_at = None
        project.name = name
        project.municipality = municipality
        project.department = department
        project.address = address

    after = {
        "name": project.name, "municipality": project.municipality, "department": project.department,
        "address": project.address, "identity_status": project.identity_status,
        "identity_reference": project.identity_reference,
        "identity_confirmed_role": project.identity_confirmed_role,
        "identity_confirmed_at": utc(project.identity_confirmed_at).isoformat() if project.identity_confirmed_at else None,
    }
    if before == after:
        return RedirectResponse(f"/projects/{project.id}?notice=No%20hubo%20cambios%20en%20la%20identificaci%C3%B3n#project-identity", status_code=303)
    audit(
        session, project_id=project.id, actor_id=user.id,
        action="project_identity_updated", entity_type="project", entity_id=project.id,
        detail={"before": before, "after": after},
    )
    session.commit()
    message = "Identificaci%C3%B3n%20confirmada" if project.identity_status == "confirmada" else "Identificaci%C3%B3n%20guardada%20como%20pendiente"
    return RedirectResponse(f"/projects/{project.id}?notice={message}#project-identity", status_code=303)


@app.post("/projects/{project_id}/visit-authorization")
async def update_project_visit_authorization(project_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user, write=True)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Solo administración GREENATICS RED puede registrar o revocar esta autorización.")
    form = await request.form()
    check_csrf(request, str(form.get("csrf", "")))
    action = str(form.get("action", ""))
    authorization = latest_visit_authorization(session, project.id)
    if action == "approve":
        if visit_authorization_active(authorization):
            raise HTTPException(status_code=409, detail="Ya existe una autorización vigente. Revócala antes de registrar una nueva.")
        references = {
            "site_access_reference": str(form.get("site_access_reference", "")).strip(),
            "privacy_reference": str(form.get("privacy_reference", "")).strip(),
            "method_reference": str(form.get("method_reference", "")).strip(),
            "sst_reference": str(form.get("sst_reference", "")).strip(),
        }
        if any(not validate_visit_reference(value) for value in references.values()):
            raise HTTPException(status_code=422, detail="Completa cada referencia con un folio o identificador alfanumérico. No pegues nombres, correos, datos personales ni el contenido de los soportes.")
        if form.get("reviewed_external_supports") != "on":
            raise HTTPException(status_code=422, detail="Confirma que revisaste fuera de RED los soportes aplicables antes de habilitar campo.")
        try:
            valid_until = date.fromisoformat(str(form.get("valid_until", "")))
        except ValueError:
            raise HTTPException(status_code=422, detail="Indica una fecha de vencimiento válida para esta autorización.") from None
        if valid_until < visit_today():
            raise HTTPException(status_code=422, detail="La fecha de vencimiento debe ser hoy o posterior.")
        authorization = ProjectVisitAuthorization(
            project_id=project.id, status="approved", **references,
            valid_until=valid_until, created_by=user.id, approved_at=now_utc(),
        )
        session.add(authorization)
        session.flush()
        audit(
            session, project_id=project.id, actor_id=user.id,
            action="project_visit_authorization_approved",
            entity_type="project_visit_authorization", entity_id=authorization.id,
            detail={"valid_until": valid_until.isoformat(), "reference_fields_reviewed": 4},
        )
        session.commit()
        return RedirectResponse(f"/projects/{project.id}?notice=Autorizaci%C3%B3n%20de%20visita%20registrada#visit-authorization", status_code=303)

    if action == "revoke":
        if not visit_authorization_active(authorization):
            raise HTTPException(status_code=409, detail="No existe una autorización vigente para revocar.")
        reason = str(form.get("revocation_reason", "")).strip()
        if reason not in VISIT_AUTHORIZATION_REVOCATION_REASONS:
            raise HTTPException(status_code=422, detail="Selecciona un motivo de revocación de la lista.")
        authorization.status = "revoked"
        authorization.revoked_by = user.id
        authorization.revoked_at = now_utc()
        authorization.revocation_reason = reason
        audit(
            session, project_id=project.id, actor_id=user.id,
            action="project_visit_authorization_revoked",
            entity_type="project_visit_authorization", entity_id=authorization.id,
            detail={"reason_code": reason},
        )
        session.commit()
        return RedirectResponse(f"/projects/{project.id}?notice=Autorizaci%C3%B3n%20de%20visita%20revocada#visit-authorization", status_code=303)
    raise HTTPException(status_code=422, detail="Selecciona registrar o revocar la autorización de visita.")


PROJECT_ACTIVITY_ACTION_LABELS = {
    "project_identity_updated": "Identificación de la copropiedad actualizada",
    "project_visit_authorization_approved": "Autorización de visita registrada",
    "project_visit_authorization_revoked": "Autorización de visita revocada",
    "baseline_decision": "Revisión de Línea Base",
    "baseline_invalidated": "Línea Base devuelta a revisión",
    "pmirs_item_baseline_invalidated": "Objeto PMIRS devuelto por cambio de Línea Base",
    "pmirs_version_obsoleted": "Versión PMIRS marcada como obsoleta",
    "operational_reference_uploaded": "Documento de campo enviado a revisión",
    "operational_reference_reviewed": "Documento de campo revisado",
    "operational_reference_downloaded": "Documento de campo consultado",
    "project_records_exported": "Registros del expediente exportados",
    "pmirs_item_created": "Objeto PMIRS creado",
    "pmirs_item_updated": "Objeto PMIRS actualizado",
    "pmirs_item_reviewed": "Objeto PMIRS revisado",
    "pmirs_action_progress": "Avance de acción PMIRS registrado",
    "pmirs_evidence_uploaded": "Evidencia PMIRS incorporada",
    "pmirs_version_created": "Versión PMIRS creada",
    "pmirs_version_status_changed": "Estado de versión PMIRS actualizado",
    "pmirs_version_signed": "Constancia de versión PMIRS registrada",
    "pmirs_version_exported": "Documento PMIRS exportado",
    "record_d14_summary_recalculated": "Resumen de cierre D-14 actualizado",
    "record_p15_actions_recalculated": "Seguimiento P-15 actualizado",
    "record_d08_balance_recalculated": "Balance D-08 actualizado",
    "record_created": "Registro de formulario creado",
    "record_updated": "Registro de formulario actualizado",
    "record_reviewed": "Registro de formulario revisado",
    "qa_decision": "Decisión de revisión QA/QC registrada",
    "form_record_signed": "Constancia de formulario registrada",
    "form_record_exported": "Formulario exportado",
    "evidence_uploaded": "Evidencia incorporada",
    "evidence_removed": "Evidencia retirada antes de validación",
    "evidence_download_authorized": "Evidencia consultada",
    "membership_updated": "Membresía del expediente actualizada",
    "user_invited": "Invitación para este expediente creada",
    "invitation_revoked": "Invitación pendiente revocada",
    "invitation_accepted": "Invitación para este expediente aceptada",
}
PROJECT_ACTIVITY_ENTITY_LABELS = {
    "project": "Expediente",
    "project_baseline": "Línea Base",
    "operational_reference": "Documento de campo",
    "project_records": "Registros del expediente",
    "pmirs_item": "Objeto PMIRS",
    "pmirs_version": "Versión PMIRS",
    "form_record": "Formulario",
    "evidence_file": "Evidencia",
    "project_membership": "Acceso al expediente",
    "invitation": "Acceso al expediente",
}
PROJECT_MEMBERSHIP_ROLE_LABELS = {
    "consultor": "Consultor RED",
    "campo": "Equipo de campo",
    "administracion_ph": "Administración PH",
    "revisor": "Revisor QA/QC",
    "lector": "Consulta",
}
PROJECT_MEMBERSHIP_ROLE_DESCRIPTIONS = {
    "consultor": "Prepara y edita registros, hallazgos, programas, acciones y versiones PMIRS.",
    "campo": "Completa visitas autorizadas, evidencia y avances de acciones asignadas; no valida ni cierra.",
    "administracion_ph": "Aporta información del conjunto, confirma su identificación y participa en el seguimiento.",
    "revisor": "Revisa registros, evidencia y versiones PMIRS; toma decisiones de QA/QC y Línea Base.",
    "lector": "Consulta el expediente, sus evidencias y versiones; no puede editar.",
}


def project_activity_detail_label(event: AuditEvent) -> str:
    """Render only controlled membership transitions in the project activity feed."""
    if event.action != "membership_updated" or not isinstance(event.detail, dict):
        return ""
    detail = event.detail
    change = detail.get("action")
    if not isinstance(change, str):
        return ""
    if change == "change_role":
        previous_role = detail.get("previous_role")
        current_role = detail.get("role")
        previous = PROJECT_MEMBERSHIP_ROLE_LABELS.get(previous_role) if isinstance(previous_role, str) else None
        current = PROJECT_MEMBERSHIP_ROLE_LABELS.get(current_role) if isinstance(current_role, str) else None
        if previous and current and previous != current:
            return f"Rol del proyecto: {previous} → {current}"
    if change in {"activate", "deactivate"}:
        previous_active = detail.get("previous_active")
        active = detail.get("active")
        if isinstance(previous_active, bool) and isinstance(active, bool) and previous_active != active:
            return "Acceso reactivado" if active else "Acceso revocado"
    return ""


PROJECT_ACTIVITY_CATEGORIES = {
    "all": {"label": "Todas las actividades", "actions": None},
    "project_identity": {"label": "Identificación del expediente", "actions": {"project_identity_updated"}},
    "forms": {"label": "Formularios y evidencias", "actions": {
        "record_d14_summary_recalculated", "record_p15_actions_recalculated", "record_d08_balance_recalculated",
        "record_created", "record_updated", "record_reviewed", "qa_decision", "form_record_signed",
        "form_record_exported", "evidence_uploaded", "evidence_removed", "evidence_download_authorized",
        "project_records_exported",
    }},
    "pmirs": {"label": "PMIRS", "actions": {
        action for action in PROJECT_ACTIVITY_ACTION_LABELS if action.startswith("pmirs_")
    }},
    "documents": {"label": "Documentos de campo", "actions": {
        action for action in PROJECT_ACTIVITY_ACTION_LABELS if action.startswith("operational_reference_")
    }},
    "access": {"label": "Usuarios y accesos", "actions": {
        "membership_updated", "user_invited", "invitation_revoked", "invitation_accepted",
    }},
    "baseline": {"label": "Línea Base", "actions": {
        "baseline_decision", "baseline_invalidated", "pmirs_item_baseline_invalidated",
    }},
}


@app.get("/projects/{project_id}/activity", response_class=HTMLResponse)
def project_activity_page(
    project_id: str,
    request: Request,
    page: int = Query(1, ge=1, le=100000),
    category: str = Query("all", pattern="^(all|forms|pmirs|documents|access|baseline)$"),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    project, _role = authorize_project(session, project_id, user)
    page_size = 50
    category_spec = PROJECT_ACTIVITY_CATEGORIES[category]
    filters = [AuditEvent.project_id == project.id]
    if category_spec["actions"] is not None:
        filters.append(AuditEvent.action.in_(category_spec["actions"] or ["__no_matching_activity__"]))
    total_events = session.scalar(select(func.count(AuditEvent.id)).where(*filters)) or 0
    page_count = max(1, math.ceil(total_events / page_size))
    page = min(page, page_count)
    events = session.execute(
        select(AuditEvent, User.full_name)
        .join(User, User.id == AuditEvent.actor_id)
        .where(*filters)
        .order_by(AuditEvent.created_at.desc(), AuditEvent.id.desc())
        .limit(page_size)
        .offset((page - 1) * page_size)
    ).all()
    activity_rows = [{
        "id": event.id,
        "actor_name": actor_name,
        "action_label": PROJECT_ACTIVITY_ACTION_LABELS.get(event.action, "Actividad registrada"),
        "entity_label": PROJECT_ACTIVITY_ENTITY_LABELS.get(event.entity_type, "Expediente"),
        "detail_label": project_activity_detail_label(event),
        "created_at": event.created_at,
    } for event, actor_name in events]
    return templates.TemplateResponse(request=request, name="project_activity.html", context=page_context(
        request,
        project=project,
        activity_rows=activity_rows,
        total_events=total_events,
        selected_category=category,
        category_label=category_spec["label"],
        activity_categories=PROJECT_ACTIVITY_CATEGORIES,
        page=page,
        page_count=page_count,
        previous_page=page - 1 if page > 1 else None,
        next_page=page + 1 if page < page_count else None,
    ))


def current_operational_reference(session: Session, project_id: str, category: str) -> OperationalReference | None:
    return session.scalar(select(OperationalReference).where(
        OperationalReference.project_id == project_id,
        OperationalReference.category == category,
        OperationalReference.status == "aprobada",
    ).order_by(OperationalReference.reviewed_at.desc(), OperationalReference.created_at.desc()).limit(1))


def operational_reference_values(session: Session, project_id: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for category, spec in OPERATIONAL_REFERENCE_CATEGORIES.items():
        reference = current_operational_reference(session, project_id, category)
        if reference:
            values[spec["field_id"]] = f"{reference.title} · versión {reference.version_label} · Aprobada"
        else:
            values[spec["field_id"]] = PENDING_OPERATIONAL_REFERENCE_FIELDS[spec["field_id"]]
    return values


@app.get("/projects/{project_id}/operational-references", response_class=HTMLResponse)
def operational_references_page(project_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user)
    can_manage = role in {"admin", "consultor", "administracion_ph"}
    can_review = user.is_platform_admin or role == "revisor"
    query = select(OperationalReference).where(OperationalReference.project_id == project.id)
    if not (can_manage or can_review):
        query = query.where(OperationalReference.status == "aprobada")
    references = list(session.scalars(query.order_by(
        OperationalReference.category, OperationalReference.created_at.desc(),
    )))
    current = {
        category: current_operational_reference(session, project.id, category)
        for category in OPERATIONAL_REFERENCE_CATEGORIES
    }
    evidence_ids = [reference.evidence_id for reference in references]
    evidence_by_id = {
        item.id: item for item in session.scalars(select(EvidenceFile).where(EvidenceFile.id.in_(evidence_ids)))
    } if evidence_ids else {}
    return templates.TemplateResponse(request=request, name="operational_references.html", context=page_context(
        request, project=project, role=role, references=references, current=current,
        evidence_by_id=evidence_by_id, can_manage=can_manage, can_review=can_review,
        categories=OPERATIONAL_REFERENCE_CATEGORIES, statuses=OPERATIONAL_REFERENCE_STATUSES,
        notice=safe_notice(request),
    ))


@app.post("/projects/{project_id}/operational-references")
async def upload_operational_reference(
    project_id: str, request: Request, csrf: str = Form(...), category: str = Form(...),
    title: str = Form(...), version_label: str = Form(...), source_note: str = Form(...),
    file: UploadFile = File(...), session: Session = Depends(get_db),
):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user, write=True)
    if role not in {"admin", "consultor", "administracion_ph"}:
        raise HTTPException(403, "Tu rol no puede proponer documentos operativos para este expediente.")
    check_csrf(request, csrf)
    if category not in OPERATIONAL_REFERENCE_CATEGORIES:
        raise HTTPException(422, "Selecciona una categoría documental permitida.")
    title = " ".join(str(title).split())[:240]
    version_label = " ".join(str(version_label).split())[:80]
    source_note = str(source_note).strip()[:2000]
    if len(title) < 3 or not version_label or len(source_note) < 8:
        raise HTTPException(422, "Completa título, versión y origen del documento con información suficiente.")
    original = str(file.filename or "documento").replace("\\", "/").rsplit("/", 1)[-1]
    original = "".join(character for character in original if character.isprintable() and character not in "\r\n\t")
    original = original.strip(" .")[:255] or "documento"
    extension = Path(original).suffix.lower()
    if extension not in {".pdf", ".docx", ".xlsx"}:
        raise HTTPException(415, "Para guías y tablas operativas usa PDF, DOCX o XLSX.")
    duplicate = session.scalar(select(OperationalReference.id).where(
        OperationalReference.project_id == project.id,
        OperationalReference.category == category,
        OperationalReference.version_label == version_label,
    ))
    if duplicate:
        raise HTTPException(409, "Esa versión ya está registrada para esta categoría y expediente.")

    reference_id = new_id()
    storage_name = f"{new_id()}{extension}"
    storage_key = f"evidence/{storage_name}"
    digest = hashlib.sha256()
    size = 0
    limit = settings.max_upload_mb * 1024 * 1024
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(prefix="greenatics-red-reference-", suffix=extension, delete=False) as output:
            temporary_path = Path(output.name)
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > limit:
                    raise HTTPException(413, f"El archivo supera el límite de {settings.max_upload_mb} MB.")
                digest.update(chunk)
                output.write(chunk)
        if size == 0:
            raise HTTPException(422, "El archivo está vacío.")
        media_type = upload_media_type_or_422(temporary_path, extension)
        try:
            lock_and_check_evidence_capacity(
                session, project_id=project.id, incoming_bytes=size,
                total_limit_bytes=settings.max_evidence_total_mb * 1024 * 1024,
                project_limit_bytes=settings.max_evidence_project_mb * 1024 * 1024,
            )
        except ValueError as exc:
            raise HTTPException(413, str(exc)) from exc
        storage.put_file(storage_key, temporary_path, media_type)
    except Exception:
        cleanup_storage_objects([storage_key])
        raise
    finally:
        if temporary_path:
            temporary_path.unlink(missing_ok=True)
        await file.close()

    evidence = EvidenceFile(
        project_id=project.id, field_id=f"operational-reference:{reference_id}",
        original_name=original, storage_name=storage_name, media_type=media_type,
        size_bytes=size, sha256=digest.hexdigest(), created_by=user.id,
    )
    try:
        session.add(evidence)
        session.flush()
        reference = OperationalReference(
            id=reference_id, project_id=project.id, category=category, title=title,
            version_label=version_label, status="pendiente_revision", source_note=source_note,
            evidence_id=evidence.id, created_by=user.id,
        )
        session.add(reference)
        audit(session, project_id=project.id, actor_id=user.id, action="operational_reference_uploaded",
              entity_type="operational_reference", entity_id=reference.id,
              detail={"category": category, "version": version_label, "evidence_id": evidence.id, "sha256": evidence.sha256})
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        cleanup_storage_objects([storage_key])
        raise HTTPException(409, "Esa versión ya está registrada para esta categoría y expediente.") from exc
    except Exception:
        session.rollback()
        cleanup_storage_objects([storage_key])
        raise
    return RedirectResponse(f"/projects/{project.id}/operational-references?notice=Documento%20enviado%20a%20revisi%C3%B3n", status_code=303)


@app.post("/operational-references/{reference_id}/review")
def review_operational_reference(
    reference_id: str, request: Request, csrf: str = Form(...), decision: str = Form(...),
    reason: str = Form(...), session: Session = Depends(get_db),
):
    user = current_user(request, session)
    reference = session.get(OperationalReference, reference_id)
    if not reference:
        raise HTTPException(404, "Documento operativo no encontrado.")
    project, role = authorize_project(session, reference.project_id, user, write=True)
    if not (user.is_platform_admin or role == "revisor"):
        raise HTTPException(403, "Solo revisoría QA/QC puede aprobar o retirar un documento operativo.")
    check_csrf(request, csrf)
    reason = str(reason).strip()[:2000]
    if len(reason) < 4:
        raise HTTPException(422, "Registra el criterio de revisión o motivo de obsolescencia.")
    if decision == "aprobar" and reference.status in {"pendiente_revision", "requiere_correccion"}:
        review_time = now_utc()
        for prior in session.scalars(select(OperationalReference).where(
            OperationalReference.project_id == project.id,
            OperationalReference.category == reference.category,
            OperationalReference.status == "aprobada",
            OperationalReference.id != reference.id,
        )):
            prior.status = "reemplazada"
            prior.review_note = f"Reemplazada por versión {reference.version_label}. {reason}"[:2000]
            prior.reviewed_by = user.id
            prior.reviewed_at = review_time
        reference.status = "aprobada"
    elif decision == "corregir" and reference.status in {"pendiente_revision", "requiere_correccion"}:
        reference.status = "requiere_correccion"
    elif decision == "obsoleta" and reference.status == "aprobada":
        reference.status = "obsoleta"
    else:
        raise HTTPException(409, "La decisión no corresponde al estado actual del documento.")
    reference.review_note = reason
    reference.reviewed_by = user.id
    reference.reviewed_at = now_utc()
    audit(session, project_id=project.id, actor_id=user.id, action="operational_reference_reviewed",
          entity_type="operational_reference", entity_id=reference.id,
          detail={"decision": decision, "category": reference.category, "version": reference.version_label})
    session.commit()
    return RedirectResponse(f"/projects/{project.id}/operational-references?notice=Revisi%C3%B3n%20registrada", status_code=303)


def safe_csv_cell(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list, tuple)):
        text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    else:
        text = str(value)
    candidate = text.lstrip()
    if candidate.startswith(("=", "+", "-", "@", "\t", "\r")) and not re.fullmatch(
        r"[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?", candidate
    ):
        return "'" + text
    return text


def project_record_export_rows(session: Session, project: Project) -> tuple[list[list[object]], int]:
    records = list(session.scalars(select(FormRecord).where(
        FormRecord.project_id == project.id,
    ).order_by(FormRecord.form_code, FormRecord.created_at, FormRecord.id)))
    evidence_counts = dict(session.execute(
        select(EvidenceFile.record_id, func.count(EvidenceFile.id))
        .where(EvidenceFile.project_id == project.id)
        .group_by(EvidenceFile.record_id)
    ).all())
    field_evidence_counts = {
        (record_id, field_id): count for record_id, field_id, count in session.execute(
        select(EvidenceFile.record_id, EvidenceFile.field_id, func.count(EvidenceFile.id))
        .where(EvidenceFile.project_id == project.id)
        .group_by(EvidenceFile.record_id, EvidenceFile.field_id)
        ).all()
    }

    rows: list[list[object]] = [[
        "Proyecto", "Municipio", "Departamento", "ID de registro", "Formulario", "Nombre del formulario",
        "Fecha del registro", "Estado", "Versión", "Tipo de fuente", "Nota de fuente",
        "Creado (UTC)", "Actualizado (UTC)", "Adjuntos del registro", "ID de campo", "Campo",
        "Control", "Valor", "Adjuntos del campo", "Nombre de la copropiedad", "Dirección registrada",
        "Estado de confirmación", "Referencia de confirmación", "Perfil que confirmó",
    ]]
    field_rows = 0
    for record in records:
        form = FORM_BY_CODE.get(record.form_code, {})
        fields = form.get("fields", [])
        known_ids = {field["id"] for field in fields}
        payload = record.payload if isinstance(record.payload, dict) else {}
        for field in fields:
            value = payload.get(field["id"], "")
            if field["id"] == D04_CONTAINER_FIELD:
                export_value = d04_container_display(value)
            elif field["id"] in REPEATABLE_FIELD_SPECS:
                export_value = repeatable_field_display(value, field["id"])
            elif field.get("multi_select_text"):
                export_value = multi_select_display(value)
            elif field["id"] in GPS_FIELD_IDS:
                export_value = gps_capture_display(value)
            else:
                export_value = value
            rows.append([
                safe_csv_cell(project.slug), safe_csv_cell(project.municipality), safe_csv_cell(project.department),
                record.id, record.form_code, safe_csv_cell(form.get("title", record.form_code)),
                safe_csv_cell(record.record_date), record_status_label(session, record), record.version,
                safe_csv_cell(record.source_kind), safe_csv_cell(record.source_note),
                utc(record.created_at).isoformat(), utc(record.updated_at).isoformat(),
                evidence_counts.get(record.id, 0), field["id"], safe_csv_cell(field.get("label", field["id"])),
                safe_csv_cell(field.get("control", "")), safe_csv_cell(export_value),
                field_evidence_counts.get((record.id, field["id"]), 0),
                safe_csv_cell(project.name), safe_csv_cell(project.address),
                "Confirmada" if project.identity_status == "confirmada" else "Pendiente de confirmar",
                safe_csv_cell(project.identity_reference if project.identity_status == "confirmada" else ""),
                {"admin": "Administración RED", "administracion_ph": "Administración PH"}.get(project.identity_confirmed_role, ""),
            ])
            field_rows += 1
        for field_id, value in payload.items():
            if field_id in known_ids:
                continue
            rows.append([
                safe_csv_cell(project.slug), safe_csv_cell(project.municipality), safe_csv_cell(project.department),
                record.id, record.form_code, safe_csv_cell(form.get("title", record.form_code)),
                safe_csv_cell(record.record_date), record_status_label(session, record), record.version,
                safe_csv_cell(record.source_kind), safe_csv_cell(record.source_note),
                utc(record.created_at).isoformat(), utc(record.updated_at).isoformat(),
                evidence_counts.get(record.id, 0), safe_csv_cell(field_id), safe_csv_cell(field_id),
                "Campo fuera del catálogo", safe_csv_cell(value),
                field_evidence_counts.get((record.id, field_id), 0),
                safe_csv_cell(project.name), safe_csv_cell(project.address),
                "Confirmada" if project.identity_status == "confirmada" else "Pendiente de confirmar",
                safe_csv_cell(project.identity_reference if project.identity_status == "confirmada" else ""),
                {"admin": "Administración RED", "administracion_ph": "Administración PH"}.get(project.identity_confirmed_role, ""),
            ])
            field_rows += 1
    return rows, len(records)


def spreadsheet_column_name(number: int) -> str:
    result = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(65 + remainder) + result
    return result


def xlsx_text(value: object) -> str:
    text = safe_csv_cell(value)
    valid = []
    for char in text:
        code = ord(char)
        if code in {0x9, 0xA, 0xD} or 0x20 <= code <= 0xD7FF or 0xE000 <= code <= 0xFFFD or 0x10000 <= code <= 0x10FFFF:
            valid.append(char)
    return "".join(valid)


def build_project_records_xlsx(rows: list[list[object]]) -> bytes:
    if len(rows) > 1_048_576:
        raise HTTPException(status_code=413, detail="El expediente excede el límite de filas de Excel; exporta por periodos.")
    buffer = io.BytesIO()
    namespace = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    rel_namespace = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    package_namespace = "http://schemas.openxmlformats.org/package/2006/relationships"
    content_namespace = "http://schemas.openxmlformats.org/package/2006/content-types"
    column_widths = [22, 18, 18, 38, 14, 42, 14, 24, 10, 18, 42, 24, 24, 20, 14, 42, 22, 48, 18]
    last_column = spreadsheet_column_name(len(rows[0]))
    last_row = max(1, len(rows))
    worksheet_parts = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        f'<worksheet xmlns="{namespace}">',
        f'<dimension ref="A1:{last_column}{last_row}"/>',
        '<sheetViews><sheetView showGridLines="1" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>',
        '<sheetFormatPr defaultRowHeight="15"/>',
        '<cols>',
    ]
    worksheet_parts.extend(
        f'<col min="{index}" max="{index}" width="{width}" customWidth="1"/>'
        for index, width in enumerate(column_widths, start=1)
    )
    worksheet_parts.append('</cols><sheetData>')
    for row_number, row in enumerate(rows, start=1):
        height = ' ht="24" customHeight="1"' if row_number == 1 else ""
        worksheet_parts.append(f'<row r="{row_number}"{height}>')
        for column_number, value in enumerate(row, start=1):
            cell_ref = f"{spreadsheet_column_name(column_number)}{row_number}"
            if isinstance(value, int) and not isinstance(value, bool):
                worksheet_parts.append(f'<c r="{cell_ref}" t="n"><v>{value}</v></c>')
            elif isinstance(value, float) and value == value and abs(value) != float("inf"):
                worksheet_parts.append(f'<c r="{cell_ref}" t="n"><v>{value}</v></c>')
            else:
                style = ' s="1"' if row_number == 1 else ""
                text_value = escape(xlsx_text(value))
                worksheet_parts.append(
                    f'<c r="{cell_ref}" t="inlineStr"{style}><is><t xml:space="preserve">{text_value}</t></is></c>'
                )
        worksheet_parts.append('</row>')
    worksheet_parts.extend([
        '</sheetData>',
        f'<autoFilter ref="A1:{last_column}{last_row}"/>',
        '<pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>',
        '</worksheet>',
    ])
    worksheet_xml = "".join(worksheet_parts)
    workbook_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<workbook xmlns="{namespace}" xmlns:r="{rel_namespace}">'
        '<bookViews><workbookView/></bookViews>'
        '<sheets><sheet name="Registros" sheetId="1" r:id="rId1"/></sheets>'
        '</workbook>'
    )
    workbook_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<Relationships xmlns="{package_namespace}">'
        f'<Relationship Id="rId1" Type="{rel_namespace}/worksheet" Target="worksheets/sheet1.xml"/>'
        f'<Relationship Id="rId2" Type="{rel_namespace}/styles" Target="styles.xml"/>'
        '</Relationships>'
    )
    root_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<Relationships xmlns="{package_namespace}">'
        f'<Relationship Id="rId1" Type="{rel_namespace}/officeDocument" Target="xl/workbook.xml"/>'
        '</Relationships>'
    )
    styles_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<styleSheet xmlns="{namespace}">'
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>'
        '<font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>'
        '<fills count="3"><fill><patternFill patternType="none"/></fill>'
        '<fill><patternFill patternType="gray125"/></fill>'
        '<fill><patternFill patternType="solid"><fgColor rgb="FF176B52"/><bgColor indexed="64"/></patternFill></fill></fills>'
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>'
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
        '</styleSheet>'
    )
    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<Types xmlns="{content_namespace}">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        '</Types>'
    )
    with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as package:
        package.writestr("[Content_Types].xml", content_types)
        package.writestr("_rels/.rels", root_rels)
        package.writestr("xl/workbook.xml", workbook_xml)
        package.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        package.writestr("xl/worksheets/sheet1.xml", worksheet_xml)
        package.writestr("xl/styles.xml", styles_xml)
    return buffer.getvalue()


def authorize_project_export(request: Request, session: Session, project_id: str) -> tuple[User, Project]:
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user)
    if role not in PROJECT_EXPORT_ROLES:
        raise HTTPException(status_code=403, detail="Tu rol no permite exportar registros de este proyecto.")
    return user, project


def record_export_response(session: Session, user: User, project: Project, rows: list[list[object]], record_count: int, format_name: str) -> None:
    audit(session, project_id=project.id, actor_id=user.id, action="project_records_exported", entity_type="project_records", entity_id=project.id, detail={
        "format": format_name,
        "record_count": record_count,
        "field_rows": len(rows) - 1,
        "attachment_contents_included": False,
    })
    session.commit()


@app.get("/projects/{project_id}/records/export.csv")
def export_project_records_csv(project_id: str, request: Request, session: Session = Depends(get_db)):
    user, project = authorize_project_export(request, session, project_id)
    rows, record_count = project_record_export_rows(session, project)
    output = io.StringIO(newline="")
    writer = csv.writer(output, lineterminator="\r\n")
    writer.writerows(rows)
    record_export_response(session, user, project, rows, record_count, "csv_long")
    safe_slug = re.sub(r"[^a-z0-9-]+", "-", project.slug.lower()).strip("-") or "proyecto"
    filename = f"greenatics-red-{safe_slug}-registros.csv"
    return Response(
        content="\ufeff" + output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store, max-age=0",
            "Pragma": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    )


@app.get("/projects/{project_id}/records/export.xlsx")
def export_project_records_xlsx(project_id: str, request: Request, session: Session = Depends(get_db)):
    user, project = authorize_project_export(request, session, project_id)
    rows, record_count = project_record_export_rows(session, project)
    content = build_project_records_xlsx(rows)
    record_export_response(session, user, project, rows, record_count, "xlsx_long")
    safe_slug = re.sub(r"[^a-z0-9-]+", "-", project.slug.lower()).strip("-") or "proyecto"
    filename = f"greenatics-red-{safe_slug}-registros.xlsx"
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store, max-age=0",
            "Pragma": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    )


@app.get("/projects/{project_id}/pmirs", response_class=HTMLResponse)
def pmirs_studio(project_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user)
    items = list(session.scalars(select(PMIRSItem).where(
        PMIRSItem.project_id == project.id,
    ).order_by(PMIRSItem.item_type, PMIRSItem.code)))
    versions = list(session.scalars(select(PMIRSVersion).where(
        PMIRSVersion.project_id == project.id,
    ).order_by(PMIRSVersion.created_at.desc())))
    signatures = list(session.scalars(select(PMIRSSignature).where(
        PMIRSSignature.project_id == project.id,
    ).order_by(PMIRSSignature.signed_at)))
    signatures_by_version: dict[str, list[PMIRSSignature]] = {row.id: [] for row in versions}
    signed_by_current_user: set[str] = set()
    for signature in signatures:
        signatures_by_version.setdefault(signature.version_id, []).append(signature)
        if signature.signer_user_id == user.id:
            signed_by_current_user.add(signature.version_id)
    signatures_valid_by_version = {
        version.id: all(
            signature.document_sha256 == pmirs_document_sha256(version)
            for signature in signatures_by_version.get(version.id, [])
        )
        for version in versions
    }
    versions_by_id = {version.id: version for version in versions}
    version_currentness = {
        version.id: pmirs_version_currentness(version, project, items)
        for version in versions
    }
    version_currentness_notices = {
        version.id: pmirs_version_currentness_notice(version_currentness[version.id])
        for version in versions
    }
    author_ids = {version.created_by for version in versions}
    authors = {user.id: user.full_name for user in session.scalars(select(User).where(User.id.in_(author_ids or {"__none__"})))}
    version_details = {}
    for version in versions:
        previous = versions_by_id.get(version.previous_version_id or "")
        if previous and previous.project_id != project.id:
            previous = None
        version_details[version.id] = {
            "previous_label": previous.version_label if previous else "Primera captura",
            "author": authors.get(version.created_by, "Usuario no disponible"),
            "reason": PMIRS_VERSION_REASONS.get(version.change_reason, version.change_reason),
            "object_changes": pmirs_version_object_changes(previous, version),
        }
    grouped_items = {
        kind: [
            item for item in items
            if item.item_type == kind
            and (role != "campo" or kind != "accion" or field_user_assigned_to_action(item, user.id))
        ]
        for kind in PMIRS_ITEM_TYPES
    }
    form_records = list(session.scalars(select(FormRecord).where(FormRecord.project_id == project.id).order_by(FormRecord.form_code)))
    item_label_by_id = {item.id: f"{item.code} · {item.title}" for item in items}
    record_label_by_id = {row.id: f"{row.form_code} · {row.title}" for row in form_records}
    item_ids = [item.id for item in items]
    evidence_rows = list(session.scalars(select(EvidenceFile).where(
        EvidenceFile.project_id == project.id,
        EvidenceFile.pmirs_item_id.in_(item_ids or ["__none__"]),
    ).order_by(EvidenceFile.created_at.desc())))
    evidence_by_item: dict[str, list[EvidenceFile]] = {item.id: [] for item in items}
    for evidence_row in evidence_rows:
        if evidence_row.pmirs_item_id in evidence_by_item:
            evidence_by_item[evidence_row.pmirs_item_id].append(evidence_row)
    evidence_count_by_item = {item_id: len(rows) for item_id, rows in evidence_by_item.items()}
    action_ids = [item.id for item in grouped_items["accion"]]
    ranked_progress_revisions = select(
        PMIRSItemRevision.id.label("revision_id"),
        func.row_number().over(
            partition_by=PMIRSItemRevision.item_id,
            order_by=(PMIRSItemRevision.changed_at.desc(), PMIRSItemRevision.revision.desc()),
        ).label("position"),
    ).where(
        PMIRSItemRevision.item_id.in_(action_ids or ["__none__"]),
        PMIRSItemRevision.note == "Seguimiento operativo de la acción",
    ).subquery()
    progress_revisions = list(session.scalars(
        select(PMIRSItemRevision)
        .join(ranked_progress_revisions, ranked_progress_revisions.c.revision_id == PMIRSItemRevision.id)
        .where(ranked_progress_revisions.c.position <= 10)
        .order_by(PMIRSItemRevision.item_id, PMIRSItemRevision.changed_at, PMIRSItemRevision.revision)
    ))
    progress_actor_ids = {row.changed_by for row in progress_revisions}
    progress_actors = {
        actor.id: actor.full_name
        for actor in session.scalars(select(User).where(User.id.in_(progress_actor_ids or {"__none__"})))
    }
    action_progress_history: dict[str, list[dict[str, Any]]] = {item_id: [] for item_id in action_ids}
    for revision in progress_revisions:
        snapshot_data = (revision.snapshot or {}).get("data") or {}
        action_progress_history.setdefault(revision.item_id, []).append({
            "revision": revision.revision,
            "changed_at": revision.changed_at,
            "actor": progress_actors.get(revision.changed_by, "Usuario no disponible"),
            "status": PMIRS_ACTION_STATES.get(snapshot_data.get("execution_status"), "Estado pendiente"),
            "progress_pct": snapshot_data.get("progress_pct", 0),
            "note": snapshot_data.get("progress_note", ""),
            "close_reason": snapshot_data.get("close_reason", ""),
        })
    action_progress_options = {
        item.id: pmirs_progress_options(role, (item.data or {}).get("execution_status", "pendiente"), evidence_count=evidence_count_by_item[item.id])
        for item in grouped_items["accion"]
        if role != "campo" or field_user_assigned_to_action(item, user.id)
    }
    pending_action_reviews = [
        item for item in grouped_items["accion"]
        if role == "revisor"
        and (item.data or {}).get("execution_status") in {"evidencia_cargada", "en_validacion"}
        and evidence_count_by_item.get(item.id, 0) > 0
    ]
    field_assignees = pmirs_action_assignees(session, project.id)
    return templates.TemplateResponse(request=request, name="pmirs.html", context=page_context(
        request,
        project=project,
        role=role,
        items=items,
        item_document_hashes={item.id: pmirs_item_document_hash(project, item, evidence_by_item[item.id]) for item in items},
        grouped_items=grouped_items,
        versions=versions,
        version_currentness=version_currentness,
        version_currentness_notices=version_currentness_notices,
        signatures_by_version=signatures_by_version,
        signatures_valid_by_version=signatures_valid_by_version,
        signed_by_current_user=signed_by_current_user,
        can_sign=role != "lector",
        version_details=version_details,
        item_types=PMIRS_ITEM_TYPES,
        review_labels=PMIRS_REVIEW_LABELS,
        version_statuses=PMIRS_VERSION_STATUSES,
        version_reasons=PMIRS_VERSION_REASONS,
        action_states=PMIRS_ACTION_STATES,
        can_manage=can_manage_pmirs(role),
        can_review=user.is_platform_admin or role == "revisor",
        can_progress=role in {"admin", "consultor", "campo", "administracion_ph", "revisor"},
        pending_action_reviews=pending_action_reviews,
        action_progress_options=action_progress_options,
        action_progress_history=action_progress_history,
        action_submission_keys={item_id: secrets.token_urlsafe(32) for item_id in action_progress_options},
        evidence_submission_keys={item.id: secrets.token_urlsafe(32) for item in items},
        baseline_ok=project.baseline_status == "validada",
        notice=safe_notice(request),
        form_records=form_records,
        item_label_by_id=item_label_by_id,
        record_label_by_id=record_label_by_id,
        evidence_count_by_item=evidence_count_by_item,
        evidence_by_item=evidence_by_item,
        item_evidence_upload_allowed={
            item.id: can_upload_pmirs_evidence(item, role, user.id)
            for item in items
        },
        item_review_labels=PMIRS_REVIEW_LABELS,
        field_assignee_labels={
            member["id"]: (f'{member["name"]} · {member["email"]}' if can_manage_pmirs(role) else member["name"])
            for member in field_assignees
        },
    ))


@app.get("/projects/{project_id}/pmirs/new", response_class=HTMLResponse)
def new_pmirs_item_page(project_id: str, request: Request, item_type: str, session: Session = Depends(get_db)):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user, write=True)
    if not can_manage_pmirs(role):
        raise HTTPException(403, "Solo consultoría RED o administración RED puede diseñar objetos del PMIRS.")
    if item_type not in PMIRS_ITEM_TYPES:
        raise HTTPException(404, "Tipo de objeto PMIRS no encontrado.")
    return templates.TemplateResponse(request=request, name="pmirs_item_form.html", context=pmirs_form_context(
        session, request, project, item_type,
    ))


def _render_pmirs_item_form(request: Request, session: Session, project: Project, item_type: str, *, item: PMIRSItem | None = None, values: dict | None = None, error: str = "", status_code: int = 200):
    return templates.TemplateResponse(
        request=request,
        name="pmirs_item_form.html",
        status_code=status_code,
        context=pmirs_form_context(session, request, project, item_type, item=item, values=values, error=error),
    )


@app.post("/projects/{project_id}/pmirs/items/new")
async def create_pmirs_item(project_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user, write=True)
    if not can_manage_pmirs(role):
        raise HTTPException(403, "Solo consultoría RED o administración RED puede diseñar objetos del PMIRS.")
    form = await request.form()
    check_csrf(request, str(form.get("csrf", "")))
    item_type = str(form.get("item_type", ""))
    if item_type not in PMIRS_ITEM_TYPES:
        raise HTTPException(400, "Tipo de objeto PMIRS no disponible.")
    title, description, data = _pmirs_values(form, item_type)
    if item_type == "accion":
        data.update(execution_status="pendiente", progress_pct=0, progress_note="", close_reason="")
    errors = validate_pmirs_action_assignees(session, project.id, data.get("assignee_user_ids", [])) if item_type == "accion" else []
    action = str(form.get("action", "draft"))
    if action not in {"draft", "submit"}:
        raise HTTPException(422, "Selecciona si guardar como borrador o enviar a revisión.")
    if action == "submit":
        data["_require_valid_relations"] = True
        errors.extend(pmirs_submission_errors(session, project.id, item_type, title, description, data))
        if project.baseline_status != "validada":
            errors.insert(0, "Primero se debe aceptar una Línea Base trazable para enviar objetos PMIRS a revisión.")
    data.pop("_require_valid_relations", None)
    values = {**data, "title": title, "description": description}
    if errors:
        prefix = "No se puede enviar a revisión todavía: " if action == "submit" else "No se puede guardar todavía: "
        return _render_pmirs_item_form(request, session, project, item_type, values=values, error=prefix + "; ".join(errors[:8]), status_code=422)
    timestamp = now_utc()
    item = PMIRSItem(
        id=new_id(), project_id=project.id, item_type=item_type,
        code=next_pmirs_code(session, project.id, item_type), title=title or PMIRS_ITEM_TYPES[item_type]["label"],
        description=description, data=data, review_status="PENDING_REVIEW" if action == "submit" else "RAW",
        version=1, created_by=user.id, updated_by=user.id, created_at=timestamp, updated_at=timestamp,
    )
    session.add(item)
    session.flush()
    session.add(PMIRSItemRevision(
        item_id=item.id, revision=1, snapshot=pmirs_item_snapshot(item),
        note="Creación del objeto PMIRS", changed_by=user.id,
    ))
    audit(session, project_id=project.id, actor_id=user.id, action="pmirs_item_created", entity_type="pmirs_item", entity_id=item.id, detail={"item_type": item_type, "code": item.code, "review_status": item.review_status, "assignee_count": len(data.get("assignee_user_ids", []))})
    if item_type == "accion":
        recalculate_p15_for_project(session, project.id, actor_id=user.id)
    session.commit()
    return RedirectResponse(f"/projects/{project.id}/pmirs?notice=Objeto%20PMIRS%20guardado", status_code=303)


@app.get("/pmirs/items/{item_id}/edit", response_class=HTMLResponse)
def edit_pmirs_item_page(item_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    item = session.get(PMIRSItem, item_id)
    if not item:
        raise HTTPException(404, "Objeto PMIRS no encontrado.")
    project, role = authorize_project(session, item.project_id, user, write=True)
    if not can_manage_pmirs(role):
        raise HTTPException(403, "Tu rol permite ejecutar acciones, pero no editar el diseño del PMIRS.")
    return _render_pmirs_item_form(request, session, project, item.item_type, item=item)


@app.post("/pmirs/items/{item_id}/edit")
async def update_pmirs_item(item_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    item = session.get(PMIRSItem, item_id)
    if not item:
        raise HTTPException(404, "Objeto PMIRS no encontrado.")
    project, role = authorize_project(session, item.project_id, user, write=True)
    if not can_manage_pmirs(role):
        raise HTTPException(403, "Tu rol permite ejecutar acciones, pero no editar el diseño del PMIRS.")
    form = await request.form()
    check_csrf(request, str(form.get("csrf", "")))
    title, description, data = _pmirs_values(form, item.item_type)
    errors = validate_pmirs_action_assignees(session, project.id, data.get("assignee_user_ids", [])) if item.item_type == "accion" else []
    if item.item_type == "accion":
        previous_data = item.data or {}
        for key in ("execution_status", "progress_pct", "progress_note", "close_reason"):
            data[key] = previous_data.get(key, 0 if key == "progress_pct" else "pendiente" if key == "execution_status" else "")
        if data["execution_status"] in {"validada", "cerrada"}:
            data["execution_status"] = "requiere_correccion"
            data["close_reason"] = ""
    action = str(form.get("action", "draft"))
    if action not in {"draft", "submit"}:
        raise HTTPException(422, "Selecciona si guardar como borrador o enviar a revisión.")
    if action == "submit":
        data["_require_valid_relations"] = True
        errors.extend(pmirs_submission_errors(session, project.id, item.item_type, title, description, data))
        if project.baseline_status != "validada":
            errors.insert(0, "Primero se debe aceptar una Línea Base trazable para enviar objetos PMIRS a revisión.")
    data.pop("_require_valid_relations", None)
    values = {**data, "title": title, "description": description}
    if errors:
        prefix = "No se puede enviar a revisión todavía: " if action == "submit" else "No se puede guardar todavía: "
        return _render_pmirs_item_form(request, session, project, item.item_type, item=item, values=values, error=prefix + "; ".join(errors[:8]), status_code=422)
    old_review_status = item.review_status
    item.title = title or PMIRS_ITEM_TYPES[item.item_type]["label"]
    item.description = description
    item.data = data
    item.review_status = "PENDING_REVIEW" if action == "submit" else "RAW"
    item.reviewed_by = None
    item.reviewed_at = None
    item.review_note = ""
    item.version += 1
    item.updated_by = user.id
    item.updated_at = now_utc()
    session.add(PMIRSItemRevision(
        item_id=item.id, revision=item.version, snapshot=pmirs_item_snapshot(item),
        note="Edición del objeto PMIRS", changed_by=user.id,
    ))
    audit(session, project_id=project.id, actor_id=user.id, action="pmirs_item_updated", entity_type="pmirs_item", entity_id=item.id, detail={"version": item.version, "previous_review_status": old_review_status, "review_status": item.review_status})
    if item.item_type == "accion":
        recalculate_p15_for_project(session, project.id, actor_id=user.id)
    session.commit()
    return RedirectResponse(f"/projects/{project.id}/pmirs?notice=Versi%C3%B3n%20del%20objeto%20guardada", status_code=303)


@app.post("/pmirs/items/{item_id}/review")
def review_pmirs_item(
    item_id: str,
    request: Request,
    csrf: str = Form(...),
    expected_version: int = Form(..., ge=1),
    expected_document_sha256: str = Form(...),
    decision: str = Form(...),
    reason: str = Form(...),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    item = session.get(PMIRSItem, item_id)
    if not item:
        raise HTTPException(404, "Objeto PMIRS no encontrado.")
    project, role = authorize_project(session, item.project_id, user, write=True)
    if not user.is_platform_admin and role != "revisor":
        raise HTTPException(403, "Esta decisión requiere revisión QA/QC o administración RED.")
    check_csrf(request, csrf)
    reason = reason.strip()[:2000]
    if item.version != expected_version:
        raise HTTPException(409, "El objeto PMIRS cambió desde que abriste esta página. Actualiza PMIRS Studio y revisa la versión vigente antes de decidir.")
    if item.review_status not in {"PENDING_REVIEW", "CORRECTION_REQUESTED"}:
        raise HTTPException(409, "Solo se revisan objetos enviados a revisión o con corrección solicitada.")
    if decision not in {"validar", "corregir"} or len(reason) < 4:
        raise HTTPException(422, "Selecciona una decisión y escribe el criterio de revisión.")
    if decision == "validar":
        errors = pmirs_submission_errors(session, project.id, item.item_type, item.title, item.description, {**(item.data or {}), "_require_valid_relations": True})
        if project.baseline_status != "validada":
            errors.insert(0, "La Línea Base no está aceptada.")
        if errors:
            raise HTTPException(422, "El objeto no supera las reglas de revisión: " + "; ".join(errors[:8]))
    old_status = item.review_status
    review_status = "VALIDATED" if decision == "validar" else "CORRECTION_REQUESTED"
    # A version check at load time does not cover an edit during validation.
    # Persist the decision only while both the reviewed version and state match.
    lock_document_context(session, project)
    session.refresh(item)
    if decision == "validar":
        check_current_document_baseline(session, project)
    inspected_evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.pmirs_item_id == item.id)))
    check_document_hash(expected_document_sha256, pmirs_item_document_hash(project, item, inspected_evidence))
    result = session.execute(
        update(PMIRSItem).where(
            PMIRSItem.id == item.id,
            PMIRSItem.project_id == project.id,
            PMIRSItem.version == expected_version,
            PMIRSItem.review_status == old_status,
        ).values(
            review_status=review_status, reviewed_by=user.id,
            reviewed_at=now_utc(), review_note=reason,
        ).execution_options(synchronize_session=False)
    )
    if result.rowcount != 1:
        session.rollback()
        raise HTTPException(409, "El objeto PMIRS cambió durante la revisión. Actualiza PMIRS Studio y revisa la versión vigente antes de decidir.")
    audit(session, project_id=project.id, actor_id=user.id, action="pmirs_item_reviewed", entity_type="pmirs_item", entity_id=item.id, detail={"from_status": old_status, "to_status": review_status, "reason": reason, "version": expected_version})
    session.commit()
    return RedirectResponse(f"/projects/{project.id}/pmirs?notice=Revisi%C3%B3n%20QA%2FQC%20registrada", status_code=303)


@app.post("/pmirs/items/{item_id}/progress")
def update_pmirs_action_progress(
    item_id: str,
    request: Request,
    csrf: str = Form(...),
    expected_version: int = Form(..., ge=1),
    expected_document_sha256: str = Form(...),
    submission_key: str = Form(""),
    execution_status: str = Form(...),
    progress_pct: int = Form(...),
    progress_note: str = Form(...),
    close_reason: str = Form(""),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    item = session.get(PMIRSItem, item_id)
    if not item or item.item_type != "accion":
        raise HTTPException(404, "Acción PMIRS no encontrada.")
    project, role = authorize_project(session, item.project_id, user, write=True)
    if role not in {"admin", "consultor", "campo", "administracion_ph", "revisor"}:
        raise HTTPException(403, "Tu rol no puede registrar avance de acciones en este expediente.")
    if role == "campo" and not field_user_assigned_to_action(item, user.id):
        raise HTTPException(403, "Esta acción no está asignada a tu usuario dentro de este expediente.")
    check_csrf(request, csrf)
    submission_key = submission_key.strip()
    if submission_key and not re.fullmatch(r"[A-Za-z0-9_-]{32,64}", submission_key):
        raise HTTPException(422, "La clave de envío del avance no tiene un formato válido.")
    progress_note = progress_note.strip()[:2000]
    close_reason = close_reason.strip()[:2000]
    def same_progress_submission(revision: PMIRSItemRevision) -> bool:
        saved = (revision.snapshot or {}).get("data", {})
        return (
            revision.item_id == item.id and revision.changed_by == user.id
            and saved.get("execution_status") == execution_status
            and saved.get("progress_pct") == progress_pct
            and saved.get("progress_note") == progress_note
            and saved.get("close_reason", "") == close_reason
        )

    if submission_key:
        prior_revision = session.scalar(select(PMIRSItemRevision).where(
            PMIRSItemRevision.submission_key == submission_key,
        ))
        if prior_revision:
            same_submission = same_progress_submission(prior_revision)
            if not same_submission:
                raise HTTPException(409, "Esta clave de envío ya corresponde a otro avance. Actualiza el formulario antes de continuar.")
            return RedirectResponse(
                f"/projects/{project.id}/pmirs?notice=Este%20avance%20ya%20estaba%20guardado",
                status_code=303,
            )
    if item.version != expected_version:
        raise HTTPException(409, "La acción cambió desde que abriste esta página. Actualiza PMIRS Studio y revisa el avance vigente antes de enviar.")
    if item.review_status != "VALIDATED":
        raise HTTPException(409, "La acción debe estar revisada como válida antes de registrar ejecución.")
    if project.baseline_status != "validada":
        raise HTTPException(409, "La Línea Base debe estar vigente para registrar o validar la ejecución.")
    if execution_status not in PMIRS_ACTION_STATES or not 0 <= progress_pct <= 100 or len(progress_note) < 8:
        raise HTTPException(422, "Indica un estado y avance válidos, con una nota de seguimiento.")
    previous_status = (item.data or {}).get("execution_status", "pendiente")
    evidence_count = session.scalar(select(func.count(EvidenceFile.id)).where(
        EvidenceFile.pmirs_item_id == item.id, EvidenceFile.project_id == project.id,
    )) or 0
    if role in {"campo", "administracion_ph"} and execution_status not in {
        "pendiente", "en_proceso", "pendiente_tercero", "evidencia_cargada", "en_validacion",
    }:
        raise HTTPException(403, "Este perfil registra novedades y avances; la validación y el cierre requieren revisión RED.")
    if execution_status != previous_status and execution_status not in PMIRS_ACTION_TRANSITIONS.get(previous_status, set()):
        raise HTTPException(409, "La transición de estado solicitada no corresponde al flujo de esta acción.")
    if role == "revisor":
        reviewable_status = previous_status in {"evidencia_cargada", "en_validacion"}
        if execution_status == "validada" and (not reviewable_status or progress_pct != 100):
            raise HTTPException(403, "QA/QC solo puede validar al 100 % una acción en revisión con evidencia cargada.")
        if execution_status == "requiere_correccion" and not reviewable_status:
            raise HTTPException(403, "QA/QC solo puede devolver a corrección una acción en revisión con evidencia cargada.")
        if execution_status not in {"validada", "requiere_correccion"}:
            raise HTTPException(403, "QA/QC debe validar la acción o devolverla con las correcciones requeridas.")
    if execution_status == "requiere_correccion" and role not in {"admin", "revisor"}:
        raise HTTPException(403, "La devolución por corrección requiere QA/QC o administración RED.")
    if execution_status == "cerrada" and (role not in {"admin", "consultor"} or previous_status != "validada" or progress_pct != 100):
        raise HTTPException(409, "Consultoría RED puede cerrar una acción validada al 100 %.")
    if execution_status == "reabierta" and (role not in {"admin", "consultor"} or previous_status not in {"cerrada", "validada"}):
        raise HTTPException(409, "Solo consultoría RED puede reabrir una acción validada o cerrada.")
    if execution_status == "validada" and role not in {"admin", "revisor"}:
        raise HTTPException(403, "La validación de ejecución requiere QA/QC o administración RED.")
    if execution_status in {"evidencia_cargada", "en_validacion", "requiere_correccion", "validada", "cerrada"} and evidence_count == 0:
        raise HTTPException(422, "Adjunta evidencia privada antes de enviar a validación o cerrar la acción.")
    if execution_status in {"cerrada", "reabierta"} and len(close_reason) < 8:
        raise HTTPException(422, "Cerrar o reabrir una acción requiere explicar la decisión.")
    data = dict(item.data or {})
    data.update({"execution_status": execution_status, "progress_pct": progress_pct, "progress_note": progress_note, "close_reason": close_reason})
    lock_document_context(session, project)
    if submission_key:
        prior_revision = session.scalar(select(PMIRSItemRevision).where(PMIRSItemRevision.submission_key == submission_key))
        if prior_revision:
            if not same_progress_submission(prior_revision):
                raise HTTPException(409, "Esta clave corresponde a otro avance.")
            return RedirectResponse(f"/projects/{project.id}/pmirs?notice=Este%20avance%20ya%20estaba%20guardado", status_code=303)
    session.refresh(item)
    check_current_document_baseline(session, project)
    inspected_evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.pmirs_item_id == item.id)))
    check_document_hash(expected_document_sha256, pmirs_item_document_hash(project, item, inspected_evidence))
    result = session.execute(
        update(PMIRSItem).where(
            PMIRSItem.id == item.id, PMIRSItem.project_id == project.id,
            PMIRSItem.version == expected_version, PMIRSItem.review_status == "VALIDATED",
        ).values(
            data=data, version=expected_version + 1,
            updated_by=user.id, updated_at=now_utc(),
        ).execution_options(synchronize_session=False)
    )
    if result.rowcount != 1:
        session.rollback()
        if submission_key:
            prior_revision = session.scalar(select(PMIRSItemRevision).where(
                PMIRSItemRevision.submission_key == submission_key,
            ))
            if prior_revision and same_progress_submission(prior_revision):
                return RedirectResponse(
                    f"/projects/{project.id}/pmirs?notice=Este%20avance%20ya%20estaba%20guardado",
                    status_code=303,
                )
        raise HTTPException(409, "La acción cambió durante el envío. Actualiza PMIRS Studio y revisa el avance vigente antes de enviar.")
    session.refresh(item)
    session.add(PMIRSItemRevision(
        item_id=item.id, revision=item.version, snapshot=pmirs_item_snapshot(item),
        note="Seguimiento operativo de la acción", submission_key=submission_key or None,
        changed_by=user.id,
    ))
    audit(session, project_id=project.id, actor_id=user.id, action="pmirs_action_progress", entity_type="pmirs_item", entity_id=item.id, detail={"from_status": previous_status, "to_status": execution_status, "progress_pct": progress_pct, "note": progress_note, "source_version": expected_version, "version": item.version})
    recalculate_p15_for_project(session, project.id, actor_id=user.id)
    try:
        session.commit()
    except IntegrityError:
        if not submission_key:
            raise
        session.rollback()
        prior_revision = session.scalar(select(PMIRSItemRevision).where(
            PMIRSItemRevision.submission_key == submission_key,
        ))
        if not prior_revision:
            raise
        same_submission = same_progress_submission(prior_revision)
        if not same_submission:
            raise HTTPException(409, "Esta clave de envío ya corresponde a otro avance.") from None
        return RedirectResponse(
            f"/projects/{project.id}/pmirs?notice=Este%20avance%20ya%20estaba%20guardado",
            status_code=303,
        )
    return RedirectResponse(f"/projects/{project.id}/pmirs?notice=Avance%20de%20acci%C3%B3n%20registrado", status_code=303)


@app.post("/pmirs/items/{item_id}/evidence")
async def upload_pmirs_evidence(
    item_id: str,
    request: Request,
    csrf: str = Form(...),
    file: UploadFile = File(...),
    submission_key: str = Form(""),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    item = session.get(PMIRSItem, item_id)
    if not item:
        raise HTTPException(404, "Objeto PMIRS no encontrado.")
    project, role = authorize_project(session, item.project_id, user, write=True)
    if not can_upload_pmirs_evidence(item, role, user.id):
        if role == "campo" and item.item_type == "accion":
            raise HTTPException(403, "Esta acción no está asignada a tu usuario dentro de este expediente.")
        raise HTTPException(403, "Tu rol no puede adjuntar evidencia a este objeto PMIRS.")
    check_csrf(request, csrf)
    submission_key = submission_key.strip()
    if submission_key and not re.fullmatch(r"[A-Za-z0-9_-]{32,64}", submission_key):
        raise HTTPException(422, "La clave de envío de evidencia no es válida.")
    filename = str(file.filename or "evidencia").replace("\\", "/").rsplit("/", 1)[-1].strip(" .")[:255] or "evidencia"
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(415, "Tipo de archivo no permitido.")
    max_upload_bytes = settings.max_upload_mb * 1024 * 1024
    try:
        contents = await file.read(max_upload_bytes + 1)
    finally:
        await file.close()
    if not contents or len(contents) > max_upload_bytes:
        raise HTTPException(413, f"El archivo debe tener contenido y pesar máximo {settings.max_upload_mb} MB.")
    media_type = upload_media_type_or_422(contents, suffix)
    digest = hashlib.sha256(contents).hexdigest()
    replay = replay_evidence_submission(
        session, submission_key, project_id=project.id, actor_id=user.id,
        original_name=filename, sha256=digest, pmirs_item_id=item.id,
    )
    if replay:
        return replay
    try:
        lock_and_check_evidence_capacity(
            session, project_id=project.id, incoming_bytes=len(contents),
            total_limit_bytes=settings.max_evidence_total_mb * 1024 * 1024,
            project_limit_bytes=settings.max_evidence_project_mb * 1024 * 1024,
        )
    except ValueError as exc:
        raise HTTPException(413, str(exc)) from exc
    storage_name = f"{new_id()}{suffix}"
    storage_key = f"evidence/{storage_name}"
    evidence = EvidenceFile(
        project_id=project.id, pmirs_item_id=item.id, record_id=None,
        original_name=filename, storage_name=storage_name,
        media_type=media_type, size_bytes=len(contents),
        sha256=digest, submission_key=submission_key or None, created_by=user.id,
    )
    try:
        storage.put_bytes(storage_key, contents, evidence.media_type)
    except Exception:
        cleanup_storage_objects([storage_key])
        raise
    try:
        session.add(evidence)
        session.flush()
        audit(session, project_id=project.id, actor_id=user.id, action="pmirs_evidence_uploaded", entity_type="evidence_file", entity_id=evidence.id, detail={"pmirs_item_id": item.id, "size_bytes": len(contents), "sha256": digest})
        session.commit()
    except IntegrityError:
        session.rollback()
        cleanup_storage_objects([storage_key])
        replay = replay_evidence_submission(
            session, submission_key, project_id=project.id, actor_id=user.id,
            original_name=filename, sha256=digest, pmirs_item_id=item.id,
        )
        if replay:
            return replay
        raise
    except Exception:
        session.rollback()
        cleanup_storage_objects([storage_key])
        raise
    return RedirectResponse(f"/projects/{project.id}/pmirs?notice=Evidencia%20privada%20adjuntada", status_code=303)


@app.post("/projects/{project_id}/pmirs/versions")
def create_pmirs_version(project_id: str, request: Request, csrf: str = Form(...), change_summary: str = Form(...), change_reason: str = Form(...), session: Session = Depends(get_db)):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user, write=True)
    if not can_manage_pmirs(role):
        raise HTTPException(403, "Solo consultoría RED o administración RED puede crear una versión documental.")
    check_csrf(request, csrf)
    summary = change_summary.strip()[:4000]
    if project.baseline_status != "validada":
        raise HTTPException(409, "No se puede crear una versión PMIRS antes de aceptar la Línea Base.")
    if len(summary) < 8 or change_reason not in PMIRS_VERSION_REASONS:
        raise HTTPException(422, "Registra un resumen y motivo de cambio para la versión.")
    items = list(session.scalars(select(PMIRSItem).where(PMIRSItem.project_id == project.id).order_by(PMIRSItem.item_type, PMIRSItem.code)))
    if not items:
        raise HTTPException(409, "Agrega al menos un objeto al PMIRS antes de crear una versión.")
    previous_version = session.scalar(select(PMIRSVersion).where(
        PMIRSVersion.project_id == project.id,
    ).order_by(PMIRSVersion.created_at.desc(), PMIRSVersion.version_label.desc()).limit(1))
    count = session.scalar(select(func.count(PMIRSVersion.id)).where(PMIRSVersion.project_id == project.id)) or 0
    label = f"v0.{count + 1}"
    source_record_ids = sorted({
        str(record_id)
        for item in items
        for record_id in ((item.data or {}).get("source_record_ids") or [])
        if isinstance(record_id, str) and record_id
    })
    source_records = list(session.scalars(
        select(FormRecord).where(
            FormRecord.project_id == project.id,
            FormRecord.id.in_(source_record_ids),
        ).order_by(FormRecord.form_code, FormRecord.record_date, FormRecord.id)
    )) if source_record_ids else []
    linked_evidence_ids = sorted({
        str(evidence_id)
        for item in items
        for evidence_id in ((item.data or {}).get("evidence_ids") or [])
        if isinstance(evidence_id, str) and evidence_id
    })
    supporting_evidence = list(session.scalars(
        select(EvidenceFile).where(
            EvidenceFile.project_id == project.id,
            EvidenceFile.id.in_(linked_evidence_ids),
        ).order_by(EvidenceFile.created_at, EvidenceFile.id)
    )) if linked_evidence_ids else []
    snapshot = {
        "project": {
            "id": project.id, "name": project.name, "municipality": project.municipality,
            "department": project.department, "address": project.address,
            "identity_status": project.identity_status,
            "identity_reference": project.identity_reference,
            "identity_confirmed_by": project.identity_confirmed_by,
            "identity_confirmed_role": project.identity_confirmed_role,
            "identity_confirmed_at": utc(project.identity_confirmed_at).isoformat() if project.identity_confirmed_at else None,
        },
        "baseline": {"reference": project.baseline_reference, "review_note": project.baseline_note, "reviewed_at": utc(project.baseline_reviewed_at).isoformat() if project.baseline_reviewed_at else None},
        "items": [pmirs_item_snapshot(item) for item in items],
        "source_records": [{
            "id": record.id, "form_code": record.form_code, "record_date": record.record_date,
            "version": record.version, "status": record.status,
        } for record in source_records],
        "evidence_files": [{
            "id": evidence.id,
            "field_id": evidence.field_id,
            "size_bytes": evidence.size_bytes,
            "sha256": evidence.sha256,
        } for evidence in supporting_evidence],
        "counts": {kind: sum(1 for item in items if item.item_type == kind) for kind in PMIRS_ITEM_TYPES},
    }
    version = PMIRSVersion(
        project_id=project.id, previous_version_id=previous_version.id if previous_version else None,
        version_label=label, status="borrador",
        change_summary=summary, change_reason=change_reason, snapshot=snapshot,
        baseline_reference=project.baseline_reference, created_by=user.id,
    )
    session.add(version)
    session.flush()
    audit(session, project_id=project.id, actor_id=user.id, action="pmirs_version_created", entity_type="pmirs_version", entity_id=version.id, detail={"version": label, "reason": change_reason, "item_count": len(items)})
    session.commit()
    return RedirectResponse(f"/projects/{project.id}/pmirs?notice=Versi%C3%B3n%20{label}%20creada%20como%20borrador", status_code=303)


@app.post("/pmirs/versions/{version_id}/status")
def change_pmirs_version_status(version_id: str, request: Request, csrf: str = Form(...), status: str = Form(...), status_note: str = Form(...), session: Session = Depends(get_db)):
    user = current_user(request, session)
    version = session.get(PMIRSVersion, version_id)
    if not version:
        raise HTTPException(404, "Versión PMIRS no encontrada.")
    project, role = authorize_project(session, version.project_id, user, write=True)
    check_csrf(request, csrf)
    status_note = status_note.strip()[:2000]
    allowed = False
    if status == "revision_interna":
        allowed = can_manage_pmirs(role) and version.status == "borrador"
        if allowed and any(row.get("review_status") != "VALIDATED" for row in (version.snapshot or {}).get("items", [])):
            raise HTTPException(409, "La revisión interna requiere que todos los objetos de esta versión estén revisados como válidos.")
    elif status == "aprobada_interna":
        allowed = (user.is_platform_admin or role == "revisor") and version.status == "revision_interna"
    elif status == "compartida_ph":
        allowed = can_manage_pmirs(role) and version.status == "aprobada_interna"
        if allowed and len(status_note) < 8:
            raise HTTPException(422, "Deja la fecha y el medio de entrega manual a la administración PH.")
    elif status == "implementacion":
        allowed = can_manage_pmirs(role) and version.status in {"aprobada_interna", "compartida_ph"}
    elif status == "obsoleta":
        allowed = can_manage_pmirs(role) and version.status != "obsoleta"
    elif status == "borrador":
        allowed = can_manage_pmirs(role) and version.status == "revision_interna"
    if not allowed or status not in PMIRS_VERSION_STATUSES or len(status_note) < 4:
        raise HTTPException(403, "La transición solicitada no está permitida para tu rol o el estado actual.")
    previous = version.status
    version.status = status
    version.status_note = status_note
    version.status_changed_by = user.id
    version.status_changed_at = now_utc()
    audit(session, project_id=project.id, actor_id=user.id, action="pmirs_version_status_changed", entity_type="pmirs_version", entity_id=version.id, detail={"from_status": previous, "to_status": status, "note": status_note})
    session.commit()
    return RedirectResponse(f"/projects/{project.id}/pmirs?notice=Estado%20de%20versi%C3%B3n%20actualizado", status_code=303)


@app.get("/pmirs/versions/{version_id}/export", response_class=HTMLResponse)
def export_pmirs_version(version_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    version = session.get(PMIRSVersion, version_id)
    if not version:
        raise HTTPException(404, "Versión PMIRS no encontrada.")
    project, _ = authorize_project(session, version.project_id, user)
    signatures = list(session.scalars(select(PMIRSSignature).where(
        PMIRSSignature.version_id == version.id,
    ).order_by(PMIRSSignature.signed_at)))
    currentness = pmirs_version_currentness_for_project(session, version, project)
    current_document_hash = pmirs_document_sha256(version)
    snapshot = version.snapshot if isinstance(version.snapshot, dict) else {}
    item_export_fields = {
        str(item["id"]): pmirs_export_fields(item, snapshot)
        for item in snapshot.get("items", [])
        if isinstance(item, dict) and item.get("id")
    }
    signatures_valid = all(row.document_sha256 == current_document_hash for row in signatures)
    audit_pmirs_version_export(session, user=user, project=project, version=version, format_name="html", signatures_valid=signatures_valid, signature_count=len(signatures))
    filename = f"GREENATICS_RED_{project.slug}_{version.version_label}.html"
    return templates.TemplateResponse(
        request=request,
        name="pmirs_version_print.html",
        context={"request": request, "project": project, "version": version, "snapshot": snapshot, "status_label": PMIRS_VERSION_STATUSES.get(version.status, version.status), "review_status_labels": EXPORT_STATUS_LABELS, "item_export_fields": item_export_fields, "signatures": signatures if signatures_valid else [], "signatures_valid": signatures_valid, "scope_notice": PMIRS_EXPORT_NOTICE, "identity_notice": pmirs_project_identity_notice(snapshot.get("project")), "currentness_notice": pmirs_version_currentness_notice(currentness)},
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/pmirs/versions/{version_id}/export.pdf")
def export_pmirs_version_pdf(version_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    version = session.get(PMIRSVersion, version_id)
    if not version:
        raise HTTPException(404, "Versión PMIRS no encontrada.")
    project, _ = authorize_project(session, version.project_id, user)
    signatures = list(session.scalars(select(PMIRSSignature).where(
        PMIRSSignature.version_id == version.id,
    ).order_by(PMIRSSignature.signed_at)))
    currentness = pmirs_version_currentness_for_project(session, version, project)
    current_document_hash = pmirs_document_sha256(version)
    signatures_valid = all(row.document_sha256 == current_document_hash for row in signatures)
    audit_pmirs_version_export(session, user=user, project=project, version=version, format_name="pdf", signatures_valid=signatures_valid, signature_count=len(signatures))
    pdf = build_pmirs_version_pdf(
        project=project,
        version=version,
        status_label=PMIRS_VERSION_STATUSES.get(version.status, version.status),
        signatures=signatures if signatures_valid else [],
        signature_hash=current_document_hash,
        signatures_valid=signatures_valid,
        currentness_notice=pmirs_version_currentness_notice(currentness),
    )
    filename = f"GREENATICS_RED_{project.slug}_{version.version_label}.pdf"
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store, max-age=0",
            "Pragma": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    )


@app.get("/pmirs/versions/{version_id}/export.docx")
def export_pmirs_version_docx(version_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    version = session.get(PMIRSVersion, version_id)
    if not version:
        raise HTTPException(404, "Versión PMIRS no encontrada.")
    project, _ = authorize_project(session, version.project_id, user)
    signatures = list(session.scalars(select(PMIRSSignature).where(
        PMIRSSignature.version_id == version.id,
    ).order_by(PMIRSSignature.signed_at)))
    currentness = pmirs_version_currentness_for_project(session, version, project)
    current_document_hash = pmirs_document_sha256(version)
    signatures_valid = all(row.document_sha256 == current_document_hash for row in signatures)
    audit_pmirs_version_export(session, user=user, project=project, version=version, format_name="docx", signatures_valid=signatures_valid, signature_count=len(signatures))
    docx = build_pmirs_version_docx(
        project=project,
        version=version,
        status_label=PMIRS_VERSION_STATUSES.get(version.status, version.status),
        signatures=signatures if signatures_valid else [],
        signature_hash=current_document_hash,
        signatures_valid=signatures_valid,
        currentness_notice=pmirs_version_currentness_notice(currentness),
    )
    filename = f"GREENATICS_RED_{project.slug}_{version.version_label}.docx"
    return Response(
        content=docx,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store, max-age=0",
            "Pragma": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    )


@app.post("/pmirs/versions/{version_id}/sign")
def sign_pmirs_version(
    version_id: str, request: Request, csrf: str = Form(...),
    signature_strokes: str = Form(...), confirm_signature: str = Form(...), password: str = Form(...),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    version = session.get(PMIRSVersion, version_id)
    if not version:
        raise HTTPException(404, "Versión PMIRS no encontrada.")
    project, role = authorize_project(session, version.project_id, user, write=True)
    check_csrf(request, csrf)
    if role == "lector":
        raise HTTPException(403, "Tu rol permite consultar, pero no firmar documentos.")
    if version.status not in {"aprobada_interna", "compartida_ph", "implementacion"}:
        raise HTTPException(409, "Solo se puede firmar una versión aprobada internamente y lista para entrega o implementación.")
    if confirm_signature != "yes":
        raise HTTPException(422, "Confirma la constancia antes de guardar la firma.")
    verify_signature_password(session, user, password)
    if len(signature_strokes) > 30000:
        raise HTTPException(413, "La firma excede el tamaño permitido. Vuelve a dibujarla en el recuadro.")
    existing = session.scalar(select(PMIRSSignature).where(
        PMIRSSignature.version_id == version.id,
        PMIRSSignature.signer_user_id == user.id,
    ))
    if existing:
        raise HTTPException(409, "Ya existe tu firma para esta versión PMIRS.")
    path_data = signature_svg_path(signature_strokes)
    signature = PMIRSSignature(
        id=new_id(), project_id=project.id, version_id=version.id, signer_user_id=user.id,
        signer_name=user.full_name, signer_email=user.email, signer_role=role,
        declaration="Confirmo mi identidad y autorizo guardar este trazo, mi nombre, correo y fecha en el expediente RED como constancia personal de lectura y recepción de esta versión PMIRS. No implica aprobación de autoridad ni acredita representación legal de la copropiedad.",
        signature_path=path_data, document_sha256=pmirs_document_sha256(version),
    )
    session.add(signature)
    audit(session, project_id=project.id, actor_id=user.id, action="pmirs_version_signed", entity_type="pmirs_version", entity_id=version.id, detail={"signature_id": signature.id, "version": version.version_label, "document_sha256": signature.document_sha256, "signer_role": role})
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, "Ya existe una firma para tu usuario y esta versión PMIRS.")
    return RedirectResponse(f"/projects/{project.id}/pmirs?notice=Constancia%20firmada%20y%20asociada%20a%20{version.version_label}#versions-heading", status_code=303)


@app.post("/projects/{project_id}/baseline")
def set_project_baseline(
    project_id: str,
    request: Request,
    csrf: str = Form(...),
    decision: str = Form(...),
    reference: str = Form(""),
    reason: str = Form(...),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user, write=True)
    if not user.is_platform_admin and role != "revisor":
        raise HTTPException(403, "Solo administración o revisión QA/QC puede aceptar la Línea Base.")
    check_csrf(request, csrf)
    reference = reference.strip()[:1000]
    reason = reason.strip()[:2000]
    if decision not in {"validada", "no_iniciada"} or len(reason) < 8:
        raise HTTPException(422, "Indica una decisión y registra el fundamento de revisión.")
    if decision == "validada":
        missing = baseline_missing_forms(session, project.id)
        if missing:
            detail = "La Línea Base no puede aceptarse aún. Falta revisar como válido: " + ", ".join(missing)
            if "D-02" in missing:
                detail += ". En D-02 responde D02-001, D02-002, D02-004, D02-008, D02-010 y D02-012; D02-021 documenta el seguimiento, pero no reemplaza esos datos."
            raise HTTPException(422, detail)
        if len(reference) < 5:
            raise HTTPException(422, "Registra un enlace o identificador de la Línea Base revisada.")
    previous = project.baseline_status
    if decision == "no_iniciada" and previous == "validada":
        invalidate_project_baseline(
            session, project, actor_id=user.id, reason=reason,
            detail={"source": "decisión manual de revisión"},
        )
    else:
        project.baseline_status = decision
        project.baseline_reference = reference if decision == "validada" else ""
        project.baseline_note = reason
        project.baseline_reviewed_by = user.id
        project.baseline_reviewed_at = now_utc()
    audit(session, project_id=project.id, actor_id=user.id, action="baseline_decision", entity_type="project_baseline", entity_id=project.id, detail={"from_status": previous, "to_status": decision, "reference": project.baseline_reference, "reason": reason})
    session.commit()
    return RedirectResponse(f"/projects/{project.id}?notice=Estado%20de%20L%C3%ADnea%20Base%20actualizado", status_code=303)


@app.get("/admin/projects/new", response_class=HTMLResponse)
def new_project_page(request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    platform_admin(user)
    return templates.TemplateResponse(request=request, name="project_new.html", context=page_context(request, error=""))


@app.post("/projects/new")
def create_project(
    request: Request,
    csrf: str = Form(...),
    name: str = Form(...),
    municipality: str = Form("Bello"),
    department: str = Form("Antioquia"),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    platform_admin(user)
    check_csrf(request, csrf)
    cleaned_name = name.strip()[:240]
    if len(cleaned_name) < 2:
        raise HTTPException(422, "Escribe el nombre del proyecto.")
    slug_root = unicodedata.normalize("NFKD", cleaned_name).encode("ascii", "ignore").decode("ascii").lower()
    slug_root = re.sub(r"[^a-z0-9]+", "-", slug_root).strip("-")[:80] or "proyecto"
    slug = f"{slug_root}-{secrets.token_hex(3)}"
    project = Project(slug=slug, name=cleaned_name, municipality=municipality.strip()[:120], department=department.strip()[:120], status="preparacion", origin="registro_administrativo", origin_note="Proyecto agregado desde GREENATICS RED.")
    session.add(project)
    session.flush()
    audit(session, project_id=project.id, actor_id=user.id, action="project_created", entity_type="project", entity_id=project.id)
    session.commit()
    return RedirectResponse(f"/projects/{project.id}?notice=Proyecto%20creado", status_code=303)


@app.get("/projects/{project_id}/records/new", response_class=HTMLResponse)
def new_record_page(project_id: str, request: Request, form_code: str, session: Session = Depends(get_db)):
    user = current_user(request, session)
    if form_code == "P-12":
        project, _role = authorize_project(session, project_id, user)
        return RedirectResponse(f"/projects/{project.id}/pmirs#versions-heading", status_code=303)
    project, role = authorize_project(session, project_id, user)
    form_spec = FORM_BY_CODE.get(form_code)
    if not form_spec:
        raise HTTPException(404, "Formulario no encontrado.")
    if not can_write_form(role, form_code):
        raise HTTPException(403, "Tu perfil no tiene acceso a este formulario en este proyecto.")
    visit_authorization = latest_visit_authorization(session, project.id)
    field_authorization_required = (
        form_code in FIELD_VISIT_FORM_CODES and not visit_authorization_active(visit_authorization)
    )
    view_only = (
        not settings.operational_writes_enabled
        or (role == "campo" and not visit_authorization_active(visit_authorization))
        or field_authorization_required
    )
    resume_record = session.scalar(
        select(FormRecord)
        .where(
            FormRecord.project_id == project.id,
            FormRecord.form_code == form_code,
            FormRecord.created_by == user.id,
            FormRecord.status.in_({"RAW", "CORRECTION_REQUESTED", "PENDING_REVIEW"}),
        )
        .order_by(FormRecord.updated_at.desc(), FormRecord.created_at.desc(), FormRecord.id.desc())
        .limit(1)
    )
    resume_record_message = ""
    resume_record_href = ""
    resume_record_cta = ""
    if resume_record:
        if resume_record.status == "RAW":
            resume_record_message = "Ya tienes un borrador de este formulario sin enviar."
        elif resume_record.status == "CORRECTION_REQUESTED":
            resume_record_message = "QA/QC devolvió tu último registro de este formulario para corrección."
        else:
            resume_record_message = "Tu último registro de este formulario está pendiente de revisión."
        can_resume = (
            resume_record.status in {"RAW", "CORRECTION_REQUESTED"}
            and can_write_form(role, form_code)
            and not view_only
        )
        resume_record_href = (
            f"/records/{resume_record.id}/edit" if can_resume else f"/records/{resume_record.id}"
        )
        if can_resume and resume_record.status == "RAW":
            resume_record_cta = "Continuar borrador"
        elif can_resume:
            resume_record_cta = "Corregir registro"
        else:
            resume_record_cta = "Consultar registro"
    return templates.TemplateResponse(request=request, name="record_form.html", context=page_context(
        request, project=project, form_spec=form_spec, record=None, error="", notice="",
        view_only=view_only, field_authorization_required=field_authorization_required,
        resume_record=resume_record, resume_record_message=resume_record_message,
        resume_record_href=resume_record_href, resume_record_cta=resume_record_cta,
        submission_key=secrets.token_urlsafe(32),
        operational_reference_values=operational_reference_values(session, project.id) if form_code == "P-14" else {},
        relation_options=d08_relation_options(session, project.id) if form_code == "D-08" else [],
        relation_options_by_field=relation_options_by_field(session, project.id, form_code),
        evidence_by_field={},
        read_only_field_ids=form_read_only_field_ids(role, form_code),
        subtable_rows=[], subtable_legacy=False,
        repeatable_rows_by_field={},
        **multi_select_context_by_form({}, form_spec),
    ))


@app.get("/records/{record_id}/edit", response_class=HTMLResponse)
def edit_record_page(record_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    record = session.get(FormRecord, record_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, role = authorize_project(session, record.project_id, user, write=True)
    if record.form_code == "P-12":
        raise HTTPException(409, "P-12 es un control de solo lectura alimentado por PMIRS Studio.")
    authorize_form_write(role, record.form_code)
    form_spec = FORM_BY_CODE.get(record.form_code)
    field_authorization_required = (
        record.form_code in FIELD_VISIT_FORM_CODES
        and not visit_authorization_active(latest_visit_authorization(session, project.id))
    )
    return templates.TemplateResponse(request=request, name="record_form.html", context=page_context(
        request, project=project, form_spec=form_spec, record=record, error="", notice="",
        view_only=not settings.operational_writes_enabled or field_authorization_required,
        field_authorization_required=field_authorization_required,
        submission_key=secrets.token_urlsafe(32),
        operational_reference_values=operational_reference_values(session, project.id) if record.form_code == "P-14" else {},
        relation_options=d08_relation_options(session, project.id, record.id) if record.form_code == "D-08" else [],
        relation_options_by_field=relation_options_by_field(session, project.id, record.form_code, record.id),
        evidence_by_field=evidence_by_field(list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record.id)))),
        read_only_field_ids=form_read_only_field_ids(role, record.form_code),
        subtable_rows=d04_container_rows((record.payload or {}).get(D04_CONTAINER_FIELD)),
        subtable_legacy=d04_container_is_legacy((record.payload or {}).get(D04_CONTAINER_FIELD)),
        repeatable_rows_by_field=repeatable_field_rows_by_form(record.payload or {}, form_spec),
        **multi_select_context_by_form(record.payload or {}, form_spec),
    ))


def _record_payload(
    form, form_spec: dict, *, editable_field_ids: set[str] | None = None,
    existing_payload: dict | None = None,
) -> dict:
    result = {}
    existing_payload = existing_payload or {}
    for field in form_spec["fields"]:
        key = field["id"]
        if editable_field_ids is not None and key not in editable_field_ids:
            limit = 300_000 if key == D04_CONTAINER_FIELD else 4000
            result[key] = str(existing_payload.get(key, "")).strip()[:limit]
            continue
        if field.get("source_system") and not field.get("server_managed"):
            result[key] = str(existing_payload.get(key, "")).strip()[:4000]
            continue
        if field.get("file_upload") and not field.get("file_or_record"):
            result[key] = ""
            continue
        if key == "P15-002":
            start = str(form.get("P15-002__start", "")).strip()[:10]
            end = str(form.get("P15-002__end", "")).strip()[:10]
            clear = str(form.get("P15-002__clear", "")).strip() == "1"
            if clear:
                result[key] = ""
            elif start or end:
                result[key] = f"{start} / {end}".strip(" /")
            else:
                result[key] = str(existing_payload.get(key, "")).strip()[:4000]
            continue
        if key == "D06-004" or key in {"D13-004", "D13-005"}:
            suffix = "__value"
            amount = str(form.get(f"{key}{suffix}", "")).strip()[:80]
            unit = str(form.get(f"{key}__unit", "")).strip()[:50]
            clear = str(form.get(f"{key}__clear", "")).strip() == "1"
            if clear:
                result[key] = ""
            elif key == "D06-004" and amount and unit.casefold() in {"horas", "días"}:
                result[key] = f"{amount} {unit.casefold()}"
            elif amount and unit:
                result[key] = f"{amount} {unit}"
            elif amount or unit:
                result[key] = f"{amount} {unit}".strip()
            else:
                result[key] = str(existing_payload.get(key, "")).strip()[:4000]
            continue
        if key in REPEATABLE_FIELD_SPECS:
            columns = REPEATABLE_FIELD_SPECS[key]["columns"]
            getlist = getattr(form, "getlist", None)
            if callable(getlist):
                values_by_column = {column["id"]: getlist(f"{key}__{column['id']}") for column in columns}
                legacy_values = getlist(f"{key}__legacy")
                if any(values_by_column.values()) or legacy_values:
                    count = min(max([len(values) for values in values_by_column.values()] + [len(legacy_values)]), MAX_REPEATABLE_FIELD_ROWS + 1)
                    rows = []
                    for index in range(count):
                        row = {
                            column["id"]: str(values_by_column[column["id"]][index] if index < len(values_by_column[column["id"]]) else "").strip()[:column["max_length"]]
                            for column in columns
                        }
                        legacy = str(legacy_values[index] if index < len(legacy_values) else "").strip()[:4000]
                        if legacy:
                            row["legacy_text"] = legacy
                        if any(row.values()):
                            rows.append(row)
                    value = json.dumps(rows, ensure_ascii=False, separators=(",", ":"))
                else:
                    value = form.get(key, "")
                    rows = repeatable_field_rows(value, key)
                    value = json.dumps(rows[:MAX_REPEATABLE_FIELD_ROWS + 1], ensure_ascii=False, separators=(",", ":"))
            else:
                rows = repeatable_field_rows(form.get(key, ""), key)
                value = json.dumps(rows[:MAX_REPEATABLE_FIELD_ROWS + 1], ensure_ascii=False, separators=(",", ":"))
            result[key] = value
            continue
        if key == D04_CONTAINER_FIELD and str(field.get("control", "")).strip().casefold() == "subtabla":
            getlist = getattr(form, "getlist", None)
            if callable(getlist):
                types = getlist(f"{key}__type")
                quantities = getlist(f"{key}__quantity")
                capacities = getlist(f"{key}__capacity")
                if types or quantities or capacities:
                    row_count = min(max(len(types), len(quantities), len(capacities)), MAX_D04_CONTAINER_ROWS + 1)
                    rows = []
                    for index in range(row_count):
                        row = {
                            "container_type": str(types[index] if index < len(types) else "").strip()[:4000],
                            "quantity": str(quantities[index] if index < len(quantities) else "").strip()[:24],
                            "capacity": str(capacities[index] if index < len(capacities) else "").strip()[:60],
                        }
                        if any(row.values()):
                            rows.append(row)
                else:
                    rows = d04_container_rows(form.get(key, ""))
                value = json.dumps(rows, ensure_ascii=False, separators=(",", ":"))
            else:
                value = form.get(key, "")
                rows = d04_container_rows(value)
                value = json.dumps(rows[:MAX_D04_CONTAINER_ROWS + 1], ensure_ascii=False, separators=(",", ":"))
            result[key] = value
            continue
        if field.get("multi_select") and callable(getattr(form, "getlist", None)):
            value = form.getlist(key)
            if field.get("multi_select_text"):
                detail = str(form.get(f"{key}__detail", "")).strip()[:2000]
                result[key] = encode_multi_select_text(value, detail)
                continue
        else:
            value = form.get(key, "")
        if isinstance(value, list):
            value = "\n".join(str(item) for item in value)
        result[key] = str(value).strip()[:4000]
    return result


def d04_container_rows(value: object, *, include_legacy: bool = True) -> list[dict[str, str]]:
    """Return bounded, display-safe D-04 receptacle rows without inventing measurements."""
    parsed = None
    if isinstance(value, list):
        parsed = value
    elif isinstance(value, str) and value.strip():
        try:
            candidate = json.loads(value)
        except (TypeError, ValueError):
            candidate = None
        if isinstance(candidate, list):
            parsed = candidate
        elif include_legacy:
            return [{"container_type": value.strip()[:4000], "quantity": "", "capacity": ""}]
    if not isinstance(parsed, list):
        return []
    rows = []
    for item in parsed[:MAX_D04_CONTAINER_ROWS + 1]:
        if not isinstance(item, dict):
            continue
        row = {
            "container_type": str(item.get("container_type", "")).strip()[:4000],
            "quantity": str(item.get("quantity", "")).strip()[:24],
            "capacity": str(item.get("capacity", "")).strip()[:60],
        }
        if any(row.values()):
            rows.append(row)
    return rows


def d04_container_is_legacy(value: object) -> bool:
    if not isinstance(value, str) or not value.strip():
        return False
    try:
        parsed = json.loads(value)
    except (TypeError, ValueError):
        return True
    return not isinstance(parsed, list)


def d04_container_display(value: object) -> str:
    if d04_container_is_legacy(value):
        return "Valor anterior (texto libre): " + str(value).strip()
    rows = d04_container_rows(value, include_legacy=False)
    if not rows:
        return ""
    lines = []
    for row in rows:
        parts = []
        if row["quantity"]:
            parts.append(f"{row['quantity']} ×")
        if row["container_type"]:
            parts.append(row["container_type"])
        if row["capacity"]:
            parts.append(f"· capacidad: {row['capacity']}")
        lines.append(" ".join(parts))
    return "\n".join(lines)


def d04_container_limit_error(value: object) -> str | None:
    if len(d04_container_rows(value, include_legacy=False)) > MAX_D04_CONTAINER_ROWS:
        return f"D-04-004 admite hasta {MAX_D04_CONTAINER_ROWS} filas de recipientes por registro."
    return None


def repeatable_field_rows(value: object, field_id: str, *, include_legacy: bool = True) -> list[dict[str, str]]:
    """Parse a bounded repeatable P-02 subrecord while retaining old free-text values."""
    config = REPEATABLE_FIELD_SPECS.get(field_id)
    if not config:
        return []
    parsed = value if isinstance(value, list) else None
    if isinstance(value, str) and value.strip():
        try:
            candidate = json.loads(value)
        except (TypeError, ValueError):
            candidate = None
        if isinstance(candidate, list):
            parsed = candidate
        elif include_legacy:
            return [{"legacy_text": value.strip()[:4000]}]
    if not isinstance(parsed, list):
        return []
    columns = config["columns"]
    rows = []
    for item in parsed[:MAX_REPEATABLE_FIELD_ROWS + 1]:
        if not isinstance(item, dict):
            continue
        row = {
            column["id"]: str(item.get(column["id"], "")).strip()[:column["max_length"]]
            for column in columns
        }
        if include_legacy:
            row["legacy_text"] = str(item.get("legacy_text", "")).strip()[:4000]
        if any(row.values()):
            rows.append(row)
    return rows


def repeatable_field_rows_by_form(payload: dict, form_spec: dict) -> dict[str, list[dict[str, str]]]:
    return {
        field["id"]: repeatable_field_rows(payload.get(field["id"]), field["id"])
        for field in form_spec.get("fields", []) if field["id"] in REPEATABLE_FIELD_SPECS
    }


def repeatable_field_display(value: object, field_id: str) -> str:
    config = REPEATABLE_FIELD_SPECS.get(field_id)
    if not config:
        return str(value or "")
    rows = repeatable_field_rows(value, field_id)
    lines = []
    for row in rows:
        if row.get("legacy_text"):
            lines.append("Dato anterior sin desglose (revisar): " + row["legacy_text"])
            continue
        parts = [f"{column['label']}: {row[column['id']]}" for column in config["columns"] if row.get(column["id"])]
        if parts:
            lines.append(" · ".join(parts))
    return "\n".join(lines)


def repeatable_field_limit_error(value: object, field_id: str) -> str | None:
    if len(repeatable_field_rows(value, field_id, include_legacy=False)) > MAX_REPEATABLE_FIELD_ROWS:
        return f"{field_id} admite hasta {MAX_REPEATABLE_FIELD_ROWS} filas por registro."
    return None


def encode_multi_select_text(selected: object, detail: object) -> str:
    values = [str(value).strip()[:200] for value in selected] if isinstance(selected, list) else []
    normalized_detail = " ".join(str(detail or "").split())[:2000]
    if not values and not normalized_detail:
        return ""
    return MULTI_SELECT_TEXT_PREFIX + json.dumps(
        {"selected": values, "detail": normalized_detail}, ensure_ascii=False, separators=(",", ":"),
    )


def multi_select_selected_values(value: object) -> list[str]:
    raw = str(value or "")
    if raw.startswith(MULTI_SELECT_TEXT_PREFIX):
        try:
            parsed = json.loads(raw[len(MULTI_SELECT_TEXT_PREFIX):])
        except (TypeError, ValueError):
            parsed = None
        if isinstance(parsed, dict) and isinstance(parsed.get("selected"), list):
            return [str(item).strip() for item in parsed["selected"] if str(item).strip()]
        return []
    return [item.strip() for item in raw.splitlines() if item.strip()]


def multi_select_text_detail(value: object) -> str:
    raw = str(value or "")
    if not raw.startswith(MULTI_SELECT_TEXT_PREFIX):
        return ""
    try:
        parsed = json.loads(raw[len(MULTI_SELECT_TEXT_PREFIX):])
    except (TypeError, ValueError):
        return ""
    return str(parsed.get("detail", "")).strip() if isinstance(parsed, dict) else ""


def multi_select_display(value: object) -> str:
    parts = multi_select_selected_values(value)
    detail = multi_select_text_detail(value)
    if detail:
        parts.append("Detalle: " + detail)
    return " · ".join(parts)


def multi_select_context_by_form(payload: dict, form_spec: dict) -> dict[str, dict]:
    selected = {}
    details = {}
    displays = {}
    for field in form_spec.get("fields", []):
        if not field.get("multi_select"):
            continue
        value = payload.get(field["id"], "")
        selected[field["id"]] = multi_select_selected_values(value)
        displays[field["id"]] = multi_select_display(value)
        if field.get("multi_select_text"):
            details[field["id"]] = multi_select_text_detail(value)
    return {
        "multi_select_selected_by_field": selected,
        "multi_select_detail_by_field": details,
        "multi_select_displays_by_field": displays,
    }


def form_field_uploads(
    form, form_spec: dict, *, include_general: bool = False,
) -> list[tuple[str | None, UploadFile]]:
    uploads = []
    for field in form_spec["fields"]:
        if not field.get("file_upload"):
            continue
        for upload in form.getlist(f"evidence__{field['id']}"):
            if hasattr(upload, "filename") and callable(getattr(upload, "read", None)) and str(upload.filename or "").strip():
                uploads.append((field["id"], upload))
    if include_general:
        for upload in form.getlist("evidence__general"):
            if hasattr(upload, "filename") and callable(getattr(upload, "read", None)) and str(upload.filename or "").strip():
                uploads.append((None, upload))
    return uploads


def evidence_field_ids(session: Session, record_id: str | None) -> set[str]:
    if not record_id:
        return set()
    return {
        value for value in session.scalars(select(EvidenceFile.field_id).where(
            EvidenceFile.record_id == record_id, EvidenceFile.field_id.is_not(None),
        )) if value
    }


def evidence_by_field(evidence: list[EvidenceFile]) -> dict[str, list[EvidenceFile]]:
    grouped: dict[str, list[EvidenceFile]] = {}
    for item in evidence:
        if item.field_id:
            grouped.setdefault(item.field_id, []).append(item)
    return grouped


async def persist_field_uploads(
    uploads: list[tuple[str | None, UploadFile]], *, project_id: str, record_id: str,
    actor_id: str, session: Session,
) -> tuple[list[EvidenceFile], list[str]]:
    """Persist selected form files and return DB rows plus cleanup storage keys."""
    max_file_bytes = settings.max_upload_mb * 1024 * 1024
    max_total_bytes = max_file_bytes * 4
    total_bytes = 0
    created_rows: list[EvidenceFile] = []
    written_keys: list[str] = []
    staged: list[tuple[str | None, str, str, Path, str, int, str]] = []
    try:
        if len(uploads) > 12:
            raise HTTPException(413, "Adjunta máximo 12 archivos por guardado.")
        for field_id, upload in uploads:
            original = str(upload.filename or "evidencia").replace("\\", "/").rsplit("/", 1)[-1]
            original = "".join(character for character in original if character.isprintable() and character not in "\r\n\t")
            original = original.strip(" .")[:255] or "evidencia"
            extension = Path(original).suffix.lower()
            if extension not in ALLOWED_UPLOAD_EXTENSIONS:
                raise HTTPException(415, "Formato no permitido. Usa PDF, JPG/JPEG, PNG, HEIC/HEIF, DOCX, XLSX, CSV o TXT.")
            storage_name = f"{new_id()}{extension}"
            storage_key = f"evidence/{storage_name}"
            digest = hashlib.sha256()
            size = 0
            temporary_path: Path | None = None
            try:
                with tempfile.NamedTemporaryFile(prefix="greenatics-red-evidence-", suffix=extension, delete=False) as output:
                    temporary_path = Path(output.name)
                    while chunk := await upload.read(1024 * 1024):
                        size += len(chunk)
                        total_bytes += len(chunk)
                        if size > max_file_bytes:
                            raise HTTPException(413, f"Cada archivo puede pesar máximo {settings.max_upload_mb} MB.")
                        if total_bytes > max_total_bytes:
                            raise HTTPException(413, f"El conjunto de archivos puede pesar máximo {settings.max_upload_mb * 4} MB.")
                        digest.update(chunk)
                        output.write(chunk)
                if size == 0:
                    raise HTTPException(422, "El archivo seleccionado está vacío.")
                assert temporary_path is not None
                media_type = upload_media_type_or_422(temporary_path, extension)
                staged.append((field_id, original, storage_name, temporary_path, media_type, size, digest.hexdigest()))
                temporary_path = None
            finally:
                await upload.close()
                if temporary_path:
                    temporary_path.unlink(missing_ok=True)
        try:
            lock_and_check_evidence_capacity(
                session, project_id=project_id, incoming_bytes=total_bytes,
                total_limit_bytes=settings.max_evidence_total_mb * 1024 * 1024,
                project_limit_bytes=settings.max_evidence_project_mb * 1024 * 1024,
            )
        except ValueError as exc:
            raise HTTPException(413, str(exc)) from exc
        for field_id, original, storage_name, temporary_path, media_type, size, sha256 in staged:
            storage_key = f"evidence/{storage_name}"
            try:
                storage.put_file(storage_key, temporary_path, media_type)
            except Exception:
                cleanup_storage_objects([storage_key])
                raise
            written_keys.append(storage_key)
            created_rows.append(EvidenceFile(
                id=new_id(), project_id=project_id, record_id=record_id, field_id=field_id,
                original_name=original, storage_name=storage_name, media_type=media_type,
                size_bytes=size, sha256=sha256, created_by=actor_id,
            ))
    except Exception:
        cleanup_storage_objects(written_keys)
        for _field_id, upload in uploads:
            try:
                await upload.close()
            except Exception:
                pass
        raise
    finally:
        for _field_id, _original, _storage_name, temporary_path, _media_type, _size, _sha256 in staged:
            temporary_path.unlink(missing_ok=True)
    return created_rows, written_keys


def _measurement_decimal(value: object) -> Decimal | None:
    raw = str(value or "").strip()
    if not raw or len(raw) > 80:
        return None
    try:
        parsed = Decimal(raw)
    except InvalidOperation:
        return None
    if not parsed.is_finite() or abs(parsed.adjusted()) > 30:
        return None
    return parsed


def valid_phone_number(value: object) -> bool:
    raw = str(value or "").strip()
    digits = re.sub(r"\D", "", raw)
    return bool(
        re.fullmatch(r"\+?[0-9][0-9\s().-]{5,24}", raw)
        and 7 <= len(digits) <= 15
    )


def _decimal_text(value: Decimal) -> str:
    if value == 0:
        return "0"
    return format(value.normalize(), "f")


def apply_supported_calculations(form_code: str, payload: dict) -> dict:
    """Recompute implemented derived fields from source measurements on the server."""
    result = dict(payload)
    if form_code == "D-07":
        result["D07-007"] = ""
        tare = _measurement_decimal(result.get("D07-005"))
        gross = _measurement_decimal(result.get("D07-006"))
        if tare is not None and gross is not None and tare >= 0 and gross >= tare:
            result["D07-007"] = _decimal_text(gross - tare)
    elif form_code == "D-08":
        result["D08-008"] = ""
        result["D08-009"] = ""
        result["D08-010"] = "Pendiente: enlaza un pesaje D-07 válido."
    elif form_code == "D-09":
        result["D09-004"] = ""
        total = _measurement_decimal(result.get("D09-002"))
        improper = _measurement_decimal(result.get("D09-003"))
        if total is not None and improper is not None and total > 0 and 0 <= improper <= total:
            with localcontext() as context:
                context.prec = 64
                percentage = (improper / total * Decimal("100")).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP,
                )
            result["D09-004"] = format(percentage, "f")
    elif form_code == "D-14":
        result["D14-002"] = ""
        result["D14-003"] = ""
        result["D14-004"] = ""
        result["D14-005"] = ""
        result["D14-007"] = ""
    elif form_code == "Q-01":
        result["Q01-002"] = "Pendiente de protocolo: criterios de completitud y confirmación no configurados."
    return result


def d14_open_incident_summary(session: Session, project_id: str, visit_id: str) -> str:
    if not visit_id:
        return ""
    incidents = list(session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-12",
    )))
    linked = [row for row in incidents if str((row.payload or {}).get("D12-001", "")).strip() == visit_id]
    open_count = 0
    without_state = 0
    unvalidated_closures = 0
    for row in linked:
        state = str((row.payload or {}).get("D12-008", "")).strip().casefold()
        if state in {"abierta", "en revisión", "en revision"}:
            open_count += 1
        elif state == "cerrada" and row.status != "VALIDATED":
            unvalidated_closures += 1
        elif state != "cerrada":
            without_state += 1
    summary = [
        f"{open_count} incidencia abierta" if open_count == 1 else f"{open_count} incidencias abiertas",
    ]
    if unvalidated_closures:
        summary.append(
            f"{unvalidated_closures} cierre sin validar" if unvalidated_closures == 1
            else f"{unvalidated_closures} cierres sin validar"
        )
    if without_state:
        summary.append(f"{without_state} incidencia(s) sin estado")
    return "; ".join(summary)


def d14_visit_records(session: Session, project_id: str, visit_id: str) -> list[FormRecord]:
    """Return only form records with an explicit link to this D-03 visit."""
    visit = session.scalar(select(FormRecord).where(
        FormRecord.id == visit_id,
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-03",
    ))
    if not visit:
        return []

    shifts = [row for row in session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-06",
    )) if str((row.payload or {}).get("D06-009", "")).strip() == visit_id]
    shift_ids = {row.id for row in shifts}
    pesajes = [row for row in session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-07",
    )) if str((row.payload or {}).get("D07-001", "")).strip() in shift_ids]
    pesaje_ids = {row.id for row in pesajes}
    fracciones = [row for row in session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-08",
    )) if str((row.payload or {}).get("D08-001", "")).strip() in pesaje_ids]
    incidents = [row for row in session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-12",
    )) if str((row.payload or {}).get("D12-001", "")).strip() == visit_id]
    unique = {row.id: row for row in [visit, *shifts, *pesajes, *fracciones, *incidents]}
    return list(unique.values())


def d14_visit_summary_fields(session: Session, project_id: str, visit_id: str) -> dict[str, str]:
    """Summarize observed records without inferring the visit's expected protocol."""
    if not visit_id:
        pending = "Pendiente: selecciona una visita D-03."
        return {
            "D14-002": pending,
            "D14-003": pending,
            "D14-004": pending,
            "D14-005": "",
            "D14-007": pending,
        }
    visit = session.scalar(select(FormRecord).where(
        FormRecord.id == visit_id,
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-03",
    ))
    if not visit:
        unavailable = "La visita seleccionada no existe en este expediente."
        return {
            "D14-002": unavailable,
            "D14-003": unavailable,
            "D14-004": unavailable,
            "D14-005": "",
            "D14-007": unavailable,
        }

    records = d14_visit_records(session, project_id, visit_id)
    grouped: dict[str, list[FormRecord]] = {}
    for record in records:
        grouped.setdefault(record.form_code, []).append(record)

    code_order = ("D-03", "D-06", "D-07", "D-08", "D-12")
    counts = []
    missing_by_code: dict[str, int] = {}
    blocked_records = 0
    for code in code_order:
        code_records = grouped.get(code, [])
        validated = sum(1 for row in code_records if row.status == "VALIDATED" and record_source_review_current(session, row))
        counts.append(f"{code}: {len(code_records)} localizado(s), {validated} validado(s)")
        form_spec = FORM_BY_CODE.get(code)
        for row in code_records:
            errors = submission_errors(
                form_spec, row.payload or {}, row.source_note or "", evidence_field_ids(session, row.id),
            ) if form_spec else []
            if code == "D-08":
                errors.extend(d08_submission_errors(session, project_id, row.payload or {}, record_id=row.id))
            errors.extend(relation_selection_errors(session, project_id, form_spec, row.payload or {}) if form_spec else [])
            missing = sum(1 for error in errors if error.startswith("Campo requerido:"))
            if missing:
                missing_by_code[code] = missing_by_code.get(code, 0) + missing
            if errors:
                blocked_records += 1

    missing_total = sum(missing_by_code.values())
    missing_detail = ", ".join(f"{code}: {count}" for code, count in missing_by_code.items()) or "ninguno detectado"
    record_summary = (
        "Registros con vínculo explícito: " + "; ".join(counts) +
        f". Campos obligatorios vacíos detectados: {missing_total} ({missing_detail}); "
        f"registros con alguna validación de envío pendiente: {blocked_records}. "
        "Solo se inspeccionan D-03/D-06/D-07/D-08/D-12 vinculados; RED no identifica formularios esperados ni ausencia de registros sin protocolo."
    )

    record_ids = [row.id for row in records]
    evidence_rows = list(session.scalars(select(EvidenceFile).where(
        EvidenceFile.project_id == project_id,
        EvidenceFile.record_id.in_(record_ids),
    ))) if record_ids else []
    image_extensions = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"}
    image_count = sum(
        1 for item in evidence_rows
        if str(item.media_type or "").casefold().startswith("image/")
        or Path(item.original_name or "").suffix.casefold() in image_extensions
    )
    visit_type = str((visit.payload or {}).get("D03-002", "")).strip() or "sin tipo declarado"
    photo_summary = (
        f"Imágenes en registros vinculados: {image_count}. Tipo de visita: {visit_type}. "
        "El mínimo fotográfico por tipo no está configurado; este conteo no confirma cumplimiento."
    )

    pesajes = grouped.get("D-07", [])
    valid_pesajes = sum(1 for row in pesajes if row.status == "VALIDATED")
    weight_summary = (
        f"Visita tipo {visit_type}: {len(pesajes)} pesaje(s) D-07 vinculado(s), "
        f"{valid_pesajes} validado(s). La regla de pesajes requeridos por tipo de visita no está configurada; "
        "este conteo no confirma suficiencia."
    )
    return {
        "D14-002": record_summary[:3900],
        "D14-003": photo_summary,
        "D14-004": weight_summary,
        "D14-005": d14_open_incident_summary(session, project_id, visit_id),
        "D14-007": (
            (
                f"Completa no permitido: {blocked_records} registro(s) vinculado(s) tienen validaciones "
                "de envío pendientes. La visita puede remitirse a QA con esta bandera, pero RED "
                "no la clasifica automáticamente como Incompleta justificada ni No válida. "
            )
            if blocked_records
            else ""
        ) + (
            "Pendiente de protocolo técnico: formularios esperados, mínimos de fotos y pesajes por tipo "
            "de visita no están configurados; RED no declara el cierre completo ni incompleto."
        ),
    }


def d14_visit_ids_for_record(
    session: Session, project_id: str, record: FormRecord, payload: dict | None = None,
) -> set[str]:
    values = payload if payload is not None else (record.payload or {})
    if record.form_code == "D-03":
        return {record.id}
    if record.form_code == "D-06":
        visit_id = str(values.get("D06-009", "")).strip()
        return {visit_id} if visit_id else set()
    if record.form_code == "D-12":
        visit_id = str(values.get("D12-001", "")).strip()
        return {visit_id} if visit_id else set()
    if record.form_code == "D-14":
        visit_id = str(values.get("D14-001", "")).strip()
        return {visit_id} if visit_id else set()
    if record.form_code == "D-07":
        shift_id = str(values.get("D07-001", "")).strip()
    elif record.form_code == "D-08":
        source_id = str(values.get("D08-001", "")).strip()
        source = session.scalar(select(FormRecord).where(
            FormRecord.id == source_id,
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-07",
        )) if source_id else None
        shift_id = str((source.payload or {}).get("D07-001", "")).strip() if source else ""
    else:
        return set()
    shift = session.scalar(select(FormRecord).where(
        FormRecord.id == shift_id,
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-06",
    )) if shift_id else None
    visit_id = str((shift.payload or {}).get("D06-009", "")).strip() if shift else ""
    return {visit_id} if visit_id else set()


def q01_context_ids_for_visit(session: Session, project_id: str, visit_id: str) -> set[str]:
    if not visit_id:
        return set()
    shift_ids = {
        row.id for row in session.scalars(select(FormRecord).where(
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-06",
        )) if str((row.payload or {}).get("D06-009", "")).strip() == visit_id
    }
    return {visit_id, *shift_ids}


def q01_context_ids_for_record(
    session: Session, project_id: str, record: FormRecord, payload: dict | None = None,
) -> set[str]:
    values = payload if payload is not None else (record.payload or {})
    if record.form_code == "D-03":
        return q01_context_ids_for_visit(session, project_id, record.id)
    if record.form_code == "D-06":
        visit_id = str(values.get("D06-009", "")).strip()
        return {value for value in (record.id, visit_id) if value}
    if record.form_code == "D-12":
        visit_id = str(values.get("D12-001", "")).strip()
        return q01_context_ids_for_visit(session, project_id, visit_id)
    if record.form_code == "D-07":
        source_id = str(values.get("D07-001", "")).strip()
    elif record.form_code == "D-08":
        fraction_source_id = str(values.get("D08-001", "")).strip()
        source = session.scalar(select(FormRecord).where(
            FormRecord.id == fraction_source_id,
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-07",
        )) if fraction_source_id else None
        source_id = str((source.payload or {}).get("D07-001", "")).strip() if source else ""
    else:
        return set()
    shift = session.scalar(select(FormRecord).where(
        FormRecord.id == source_id,
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-06",
    )) if source_id else None
    visit_id = str((shift.payload or {}).get("D06-009", "")).strip() if shift else ""
    return {value for value in (source_id, visit_id) if value}


def recalculate_q01_for_context_ids(
    session: Session, context_ids: set[str], *, project_id: str, actor_id: str,
) -> None:
    for context_id in sorted(context_ids):
        shift = session.scalar(select(FormRecord).where(
            FormRecord.id == context_id,
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-06",
        ))
        if shift:
            recalculate_q01_for_shift(session, context_id, project_id=project_id, actor_id=actor_id)
        else:
            recalculate_q01_for_shift(
                session, "", project_id=project_id, actor_id=actor_id,
                additional_context_ids={context_id},
            )


def recalculate_d14_for_visit(
    session: Session, visit_id: str, *, project_id: str, actor_id: str,
) -> None:
    if not visit_id:
        return
    session.flush()
    summary = d14_visit_summary_fields(session, project_id, visit_id)
    rows = [row for row in session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-14",
    )) if str((row.payload or {}).get("D14-001", "")).strip() == visit_id]
    for row in rows:
        old_payload = dict(row.payload or {})
        new_payload = {**old_payload, **summary}
        changed_fields = [field_id for field_id in summary if old_payload.get(field_id, "") != new_payload.get(field_id, "")]
        if not changed_fields:
            continue
        row.payload = new_payload
        previous_status = row.status
        if previous_status in {"VALIDATED", "PENDING_REVIEW"}:
            row.status = "CORRECTION_REQUESTED"
        row.reviewed_by = None
        row.reviewed_at = None
        row.review_note = "Cambió un resumen de registros/evidencias de la visita; revisa el cierre nuevamente."
        row.version += 1
        row.updated_by = actor_id
        row.updated_at = now_utc()
        session.add(FormRevision(
            record_id=row.id, revision=row.version, payload=dict(row.payload),
            note=f"Recálculo del resumen de visita ({', '.join(changed_fields)}); estado anterior: {previous_status}",
            changed_by=actor_id,
        ))
        audit(
            session, project_id=project_id, actor_id=actor_id, action="record_d14_summary_recalculated",
            entity_type="form_record", entity_id=row.id,
            detail={"visit_id": visit_id, "changed_fields": changed_fields, "from_status": previous_status, "to_status": row.status},
        )


def p15_open_action_summary(session: Session, project_id: str) -> str:
    today = now_utc().astimezone(RED_LOCAL_TIMEZONE).date().isoformat()
    active_states = {"pendiente", "en_proceso", "pendiente_tercero", "evidencia_cargada", "en_validacion", "requiere_correccion", "reabierta"}
    actions = list(session.scalars(select(PMIRSItem).where(
        PMIRSItem.project_id == project_id,
        PMIRSItem.item_type == "accion",
    )))
    outstanding = [item for item in actions if str((item.data or {}).get("execution_status", "")) in active_states]

    def action_due_sort_key(item: PMIRSItem) -> tuple[str, str]:
        value = str((item.data or {}).get("due_date", "")).strip()
        return (value if is_iso_calendar_date(value) else "9999-12-31", item.code)

    outstanding.sort(key=action_due_sort_key)
    if not outstanding:
        return "Sin acciones abiertas registradas en PMIRS Studio."
    details = []
    for item in outstanding:
        data = item.data or {}
        raw_due = str(data.get("due_date", "")).strip()
        if not raw_due:
            due, overdue = "sin fecha objetivo", ""
        elif not is_iso_calendar_date(raw_due):
            due, overdue = f"fecha objetivo inválida ({raw_due[:40]})", ""
        else:
            due = raw_due
            overdue = " · vencida" if due < today else (" · vence hoy" if due == today else "")
        state = PMIRS_ACTION_STATES.get(str(data.get("execution_status", "")), "estado pendiente")
        details.append(f"{item.code} · {item.title} · {state} · {due}{overdue}")
    return ("Acciones abiertas registradas en PMIRS Studio: " + "; ".join(details))[:3900]


def p15_measurement_entries(raw_value: object) -> tuple[dict[str, Decimal], list[str]]:
    """Parse the explicit one-line-per-indicator measurements in P15-007."""
    entries: dict[str, Decimal] = {}
    errors: list[str] = []
    for line_number, line in enumerate(str(raw_value or "").splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        if ":" not in line:
            errors.append(f"Línea {line_number}: usa el formato CÓDIGO: valor.")
            continue
        code, raw_number = (part.strip() for part in line.split(":", 1))
        code = code.upper()
        if not re.fullmatch(r"[A-Z0-9][A-Z0-9_-]{1,23}", code):
            errors.append(f"Línea {line_number}: el código de indicador no es válido.")
            continue
        if code in entries:
            errors.append(f"El indicador {code} aparece más de una vez.")
            continue
        if "," in raw_number and "." in raw_number:
            errors.append(f"Línea {line_number}: usa un solo separador decimal y no uses separadores de miles.")
            continue
        value = _measurement_decimal(raw_number.replace(",", "."))
        if value is None:
            errors.append(f"Línea {line_number}: registra un valor numérico finito para {code}.")
            continue
        entries[code] = value
    return entries, errors


def p15_measurement_errors(session: Session, project_id: str, payload: dict) -> list[str]:
    entries, errors = p15_measurement_entries(payload.get("P15-007", ""))
    if not entries and not errors:
        return []
    selected_ids = {
        value.strip() for value in str(payload.get("P15-006", "")).split("\n") if value.strip()
    }
    indicators = list(session.scalars(select(PMIRSItem).where(
        PMIRSItem.project_id == project_id,
        PMIRSItem.item_type == "indicador",
        PMIRSItem.id.in_(selected_ids) if selected_ids else PMIRSItem.id == "",
    )))
    selected_codes = {item.code for item in indicators}
    if not selected_ids:
        errors.append("Selecciona los indicadores antes de registrar sus valores del periodo.")
    for code in entries:
        if code not in selected_codes:
            errors.append(f"El indicador {code} debe estar seleccionado en P15-006 y pertenecer a este expediente.")
    return errors


def _indicator_target_decimal(raw_value: object, expected_unit: str) -> Decimal | None:
    raw = str(raw_value or "").strip()
    match = re.fullmatch(r"([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*(.*?)", raw)
    if not match:
        return None
    number, supplied_unit = match.groups()
    if "," in number and "." in number:
        return None
    supplied_unit = supplied_unit.casefold().replace(" ", "")
    expected = expected_unit.casefold().replace(" ", "")
    if supplied_unit:
        percent_units = {"%", "porcentaje", "porcentual"}
        same_unit = supplied_unit == expected or (supplied_unit in percent_units and expected in percent_units)
        if not same_unit:
            return None
    return _measurement_decimal(number.replace(",", "."))


def p15_result_vs_target_summary(session: Session, project_id: str, payload: dict) -> str:
    entries, parse_errors = p15_measurement_entries(payload.get("P15-007", ""))
    if parse_errors:
        return "Pendiente: corrige los valores de P15-007 antes de calcular la comparación."
    selected_ids = {
        value.strip() for value in str(payload.get("P15-006", "")).split("\n") if value.strip()
    }
    if not selected_ids:
        return "Pendiente: selecciona indicadores en P15-006 y registra los valores disponibles del periodo."
    indicators = list(session.scalars(select(PMIRSItem).where(
        PMIRSItem.project_id == project_id,
        PMIRSItem.item_type == "indicador",
        PMIRSItem.id.in_(selected_ids),
    ).order_by(PMIRSItem.code)))
    if not indicators:
        return "Pendiente: los indicadores seleccionados no están disponibles en este expediente."
    summaries = []
    for indicator in indicators:
        data = indicator.data or {}
        unit = str(data.get("unit", "")).strip()
        period_value = entries.get(indicator.code)
        if period_value is None:
            summaries.append(f"{indicator.code}: falta valor del periodo.")
            continue
        target_raw = str(data.get("target", "")).strip()
        target = _indicator_target_decimal(target_raw, unit)
        period_text = f"{_decimal_text(period_value)} {unit}".strip()
        if target is None:
            summaries.append(f"{indicator.code}: periodo {period_text}; no hay meta numérica comparable.")
            continue
        difference = period_value - target
        difference_unit = "p.p." if unit == "%" else unit
        difference_text = f"{_decimal_text(difference)} {difference_unit}".strip()
        target_text = f"{_decimal_text(target)} {unit}".strip()
        status_note = "" if indicator.review_status == "VALIDATED" else " · indicador pendiente de QA/QC"
        summaries.append(
            f"{indicator.code}: periodo {period_text} vs meta {target_text}; "
            f"diferencia matemática {difference_text}{status_note}. "
            "No determina cumplimiento; valida fórmula, sentido y soporte del indicador."
        )
    return ("; ".join(summaries) or "Pendiente de valores del periodo.")[:3900]


def recalculate_p15_for_project(session: Session, project_id: str, *, actor_id: str) -> None:
    summary = p15_open_action_summary(session, project_id)
    rows = list(session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "P-15",
    )))
    for row in rows:
        old_payload = dict(row.payload or {})
        if str(old_payload.get("P15-009", "")) == summary:
            continue
        row.payload = {**old_payload, "P15-009": summary}
        previous_status = row.status
        if previous_status in {"VALIDATED", "PENDING_REVIEW"}:
            row.status = "CORRECTION_REQUESTED"
        row.reviewed_by = None
        row.reviewed_at = None
        row.review_note = "Cambió la lista de acciones abiertas del PMIRS Studio; revisa el ciclo de seguimiento nuevamente."
        row.version += 1
        row.updated_by = actor_id
        row.updated_at = now_utc()
        session.add(FormRevision(
            record_id=row.id, revision=row.version, payload=dict(row.payload),
            note=f"Recálculo de acciones PMIRS abiertas; estado anterior: {previous_status}",
            changed_by=actor_id,
        ))
        audit(
            session, project_id=project_id, actor_id=actor_id, action="record_p15_actions_recalculated",
            entity_type="form_record", entity_id=row.id,
            detail={"from_status": previous_status, "to_status": row.status},
        )


def p01_source_checklist(session: Session, project_id: str, qa_record_id: str) -> dict[str, str]:
    """Snapshot whether approved source records are available to start a PMIRS."""
    valid_counts = {
        code: session.scalar(select(func.count(FormRecord.id)).where(
            FormRecord.project_id == project_id,
            FormRecord.form_code == code,
            FormRecord.status == "VALIDATED",
        )) or 0
        for code in ("D-01", "D-02", "D-04")
    }
    missing_identity = [
        code for code in ("D-01", "D-02") if not valid_counts[code]
    ]
    identity_status = (
        "Completa · hay fuentes D-01 y D-02 revisadas como válidas."
        if not missing_identity else
        "Pendiente · falta(n) fuente(s) revisada(s): " + ", ".join(missing_identity) + "."
    )

    qa_record = session.scalar(select(FormRecord).where(
        FormRecord.id == qa_record_id,
        FormRecord.project_id == project_id,
        FormRecord.form_code == "Q-01",
        FormRecord.status == "VALIDATED",
    )) if qa_record_id else None
    quantitative_status = (
        f"Completa · Q-01 «{qa_record.title}» está revisado como válido."
        if qa_record else
        "Pendiente · selecciona en P01-003 una revisión Q-01 aceptada."
    )

    infrastructure_count = valid_counts["D-04"]
    infrastructure_status = (
        f"Disponible · {infrastructure_count} registro(s) D-04 revisado(s) como válido(s); confirma vigencia y pertinencia."
        if infrastructure_count else
        "Pendiente · no hay registros D-04 revisados como válidos."
    )

    evidence_count = session.scalar(
        select(func.count(EvidenceFile.id))
        .join(FormRecord, FormRecord.id == EvidenceFile.record_id)
        .where(
            EvidenceFile.project_id == project_id,
            FormRecord.project_id == project_id,
            FormRecord.status == "VALIDATED",
        )
    ) or 0
    evidence_status = (
        f"Disponible · {evidence_count} evidencia(s) ligada(s) a registros válidos del expediente; confirma pertinencia y permiso de uso."
        if evidence_count else
        "Pendiente · no hay evidencias ligadas a registros revisados como válidos."
    )
    return {
        "P01-008": identity_status,
        "P01-009": quantitative_status,
        "P01-010": infrastructure_status,
        "P01-011": evidence_status,
    }


def d08_source_record(session: Session, project_id: str, source_id: str) -> FormRecord | None:
    source = session.get(FormRecord, source_id)
    if not source or source.project_id != project_id or source.form_code != "D-07":
        return None
    return source


def q01_completeness_summary(session: Session, project_id: str, payload: dict) -> str:
    """Report linked observations without claiming protocol completeness."""
    context_id = str(payload.get("Q01-001", "")).strip()
    context = session.scalar(select(FormRecord).where(
        FormRecord.id == context_id,
        FormRecord.project_id == project_id,
    )) if context_id else None
    if not context:
        return "Pendiente: selecciona una jornada D-06 o visita D-03 para resumir registros y evidencias."

    if context.form_code == "D-06":
        visit_id = str((context.payload or {}).get("D06-009", "")).strip()
        shifts = [context]
        context_label = f"jornada D-06 «{context.title}»"
        records_by_code: dict[str, list[FormRecord]] = {"D-06": shifts}
        visit = session.scalar(select(FormRecord).where(
            FormRecord.id == visit_id,
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-03",
        )) if visit_id else None
        if visit:
            records_by_code["D-03"] = [visit]
    elif context.form_code == "D-03":
        visit_id = context.id
        shifts = [row for row in session.scalars(select(FormRecord).where(
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-06",
        ).order_by(FormRecord.created_at, FormRecord.id))
            if str((row.payload or {}).get("D06-009", "")).strip() == visit_id]
        context_label = f"visita D-03 «{context.title}»"
        records_by_code = {"D-03": [context], "D-06": shifts}
    else:
        return "Pendiente: el contexto debe ser una jornada D-06 o visita D-03 del expediente."

    shift_ids = {row.id for row in shifts}
    pesajes = [row for row in session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-07",
    )) if str((row.payload or {}).get("D07-001", "")).strip() in shift_ids]
    pesaje_ids = {row.id for row in pesajes}
    fracciones = [row for row in session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-08",
    )) if str((row.payload or {}).get("D08-001", "")).strip() in pesaje_ids]
    records_by_code["D-07"] = pesajes
    records_by_code["D-08"] = fracciones
    if visit_id:
        incidents = [row for row in session.scalars(select(FormRecord).where(
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-12",
        )) if str((row.payload or {}).get("D12-001", "")).strip() == visit_id]
        records_by_code["D-12"] = incidents

    all_records = [row for code in ("D-03", "D-06", "D-07", "D-08", "D-12")
                   for row in records_by_code.get(code, [])]
    lines = [f"Observaciones calculadas para {context_label}:"]
    blocked_total = 0
    missing_required_total = 0
    for code in ("D-03", "D-06", "D-07", "D-08", "D-12"):
        rows = records_by_code.get(code, [])
        if not rows:
            continue
        validated = sum(1 for row in rows if row.status == "VALIDATED" and record_source_review_current(session, row))
        lines.append(f"{code}: {len(rows)} registro(s); {validated} validado(s).")
        form_spec = FORM_BY_CODE.get(code)
        for row in rows:
            errors = submission_errors(
                form_spec, row.payload or {}, row.source_note or "", evidence_field_ids(session, row.id),
            ) if form_spec else []
            if code == "D-08":
                errors.extend(d08_submission_errors(session, project_id, row.payload or {}, record_id=row.id))
            errors.extend(relation_selection_errors(session, project_id, form_spec, row.payload or {}) if form_spec else [])
            blocked_total += bool(errors)
            missing_required_total += sum(1 for error in errors if error.startswith("Campo requerido:"))

    record_ids = [row.id for row in all_records]
    evidence_rows = list(session.scalars(select(EvidenceFile).where(
        EvidenceFile.project_id == project_id,
        EvidenceFile.record_id.in_(record_ids),
    ))) if record_ids else []
    image_extensions = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"}
    image_count = sum(
        1 for item in evidence_rows
        if str(item.media_type or "").casefold().startswith("image/")
        or Path(item.original_name or "").suffix.casefold() in image_extensions
    )
    lines.append(
        f"Validaciones de envío pendientes: {blocked_total} registro(s); "
        f"campos obligatorios vacíos detectados: {missing_required_total}. "
        f"Evidencias vinculadas: {len(evidence_rows)} archivo(s), {image_count} imagen(es)."
    )
    lines.append(
        "Pendiente de confirmar completitud: no se ha configurado la matriz de registros, fotos ni "
        "excepciones esperados. Este resumen observa D-03/D-06/D-07/D-08/D-12 y no demuestra suficiencia; "
        "la persona revisora registra su resultado en Q01-008 y su explicación en Q01-009."
    )
    return " ".join(lines)[:3900]


def q01_mass_balance_summary(session: Session, project_id: str, payload: dict) -> str:
    """Show a neutral D-08 summary for a Q-01 linked to a shift or visit."""
    context_id = str(payload.get("Q01-001", "")).strip()
    if not context_id:
        return "Pendiente: selecciona una jornada D-06 para resumir sus resultados D-08."
    context = session.scalar(select(FormRecord).where(
        FormRecord.id == context_id,
        FormRecord.project_id == project_id,
    ))
    if not context:
        return "Pendiente: el contexto seleccionado no existe en este expediente."
    if context.form_code == "D-03":
        shifts = [row for row in session.scalars(select(FormRecord).where(
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-06",
        ).order_by(FormRecord.created_at, FormRecord.id))
            if str((row.payload or {}).get("D06-009", "")).strip() == context.id]
        if not shifts:
            return (
                f"Pendiente: la visita «{context.title}» no tiene jornadas D-06 vinculadas. "
                "Asocia D06-009 para resumir sus pesajes; este estado no evalúa completitud."
            )
        context_label = f"visita «{context.title}»"
    elif context.form_code == "D-06":
        shifts = [context]
        jornada = str((context.payload or {}).get("D06-002", "")).strip()
        context_label = f"Jornada {jornada}" if jornada else (context.title or "Jornada seleccionada")
    else:
        return "Pendiente: el resumen D-08 requiere una jornada D-06 de este expediente."

    pesajes = list(session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-07",
    ).order_by(FormRecord.created_at, FormRecord.id)))
    pesajes_by_shift: dict[str, list[FormRecord]] = {shift.id: [] for shift in shifts}
    for source in pesajes:
        shift_id = str((source.payload or {}).get("D07-001", "")).strip()
        if shift_id in pesajes_by_shift:
            pesajes_by_shift[shift_id].append(source)
    pesaje_ids = {item.id for rows in pesajes_by_shift.values() for item in rows}
    fracciones = list(session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-08",
    )))
    fracciones_by_source: dict[str, list[FormRecord]] = {source_id: [] for source_id in pesaje_ids}
    for item in fracciones:
        source_id = str((item.payload or {}).get("D08-001", "")).strip()
        if source_id in fracciones_by_source:
            fracciones_by_source[source_id].append(item)

    lines = [f"Resumen informativo D-08 · {context_label}."]
    for shift in shifts:
        jornada = str((shift.payload or {}).get("D06-002", "")).strip()
        label = f"jornada D-06 {jornada}" if jornada else f"jornada D-06 «{shift.title}»"
        shift_pesajes = pesajes_by_shift.get(shift.id, [])
        if not shift_pesajes:
            lines.append(f"{label}: sin pesajes D-07 vinculados.")
            continue

        for source in shift_pesajes:
            source_payload = source.payload or {}
            source_number = str(source_payload.get("D07-002", "")).strip()
            source_label = f"lote D-07 {source_number}" if source_number else "lote D-07"
            rows = fracciones_by_source.get(source.id, [])
            if not rows:
                lines.append(f"{label}, {source_label}: sin fracciones D-08 vinculadas; D-07 {status_label(source.status).casefold()}.")
                continue
            result_payload = rows[0].payload or {}
            initial = _measurement_decimal(source_payload.get("D07-007"))
            total = _measurement_decimal(result_payload.get("D08-008"))
            difference = str(result_payload.get("D08-009", "")).strip()
            measure = f"peso inicial {_decimal_text(initial)} kg" if initial is not None else "peso inicial pendiente"
            measure += f"; total caracterizado {_decimal_text(total)} kg" if total is not None else "; total caracterizado pendiente"
            if difference:
                measure += f"; diferencia {difference}"
            validated_rows = sum(1 for row in rows if row.status == "VALIDATED" and record_source_review_current(session, row))
            qa_text = f"D-08 QA/QC: {validated_rows}/{len(rows)} filas válidas"
            if source.status != "VALIDATED":
                qa_text += f"; D-07: {status_label(source.status).casefold()}"
            lines.append(f"{label}, {source_label}: {measure}; {qa_text}.")
    lines.append("Este resumen no aplica una tolerancia ni declara el balance aceptable; requiere revisión técnica.")
    return "\n".join(lines)[:3900]


def recalculate_q01_for_shift(
    session: Session, shift_id: str, *, project_id: str, actor_id: str,
    additional_context_ids: set[str] | None = None,
) -> None:
    """Refresh Q-01 observation and D-08 summaries for an affected shift or visit."""
    context_ids = {item for item in {shift_id, *(additional_context_ids or set())} if item}
    if not context_ids:
        return
    shift = session.scalar(select(FormRecord).where(
        FormRecord.id == shift_id,
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-06",
    )) if shift_id else None
    if shift:
        visit_id = str((shift.payload or {}).get("D06-009", "")).strip()
        if visit_id:
            context_ids.add(visit_id)
    rows = [row for row in session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "Q-01",
    )) if str((row.payload or {}).get("Q01-001", "")).strip() in context_ids]
    for row in rows:
        old_payload = dict(row.payload or {})
        completeness = q01_completeness_summary(session, project_id, old_payload)
        balance = q01_mass_balance_summary(session, project_id, old_payload)
        changed_fields = []
        if str(old_payload.get("Q01-002", "")) != completeness:
            changed_fields.append("Q01-002")
        if str(old_payload.get("Q01-003", "")) != balance:
            changed_fields.append("Q01-003")
        if not changed_fields:
            continue
        row.payload = {**old_payload, "Q01-002": completeness, "Q01-003": balance}
        previous_status = row.status
        if previous_status in {"VALIDATED", "PENDING_REVIEW"}:
            row.status = "CORRECTION_REQUESTED"
        row.reviewed_by = None
        row.reviewed_at = None
        row.review_note = "Cambió la información vinculada de la jornada o visita; revisa nuevamente los resúmenes de Q-01."
        row.version += 1
        row.updated_by = actor_id
        row.updated_at = now_utc()
        session.add(FormRevision(
            record_id=row.id, revision=row.version, payload=dict(row.payload),
            note=f"Recálculo de {', '.join(changed_fields)}; estado anterior: {previous_status}",
            changed_by=actor_id,
        ))
        for field_id in changed_fields:
            audit(
                session, project_id=project_id, actor_id=actor_id,
                action=(
                    "record_q01_completeness_recalculated"
                    if field_id == "Q01-002" else "record_q01_balance_recalculated"
                ),
                entity_type="form_record", entity_id=row.id,
                detail={"shift_id": shift_id, "field_id": field_id, "from_status": previous_status, "to_status": row.status},
            )


def d08_fraction_weight(record: FormRecord) -> Decimal | None:
    value = _measurement_decimal((record.payload or {}).get("D08-005"))
    return value if value is not None and value >= 0 else None


def d08_relation_options(session: Session, project_id: str, current_record_id: str | None = None) -> list[dict]:
    options = []
    sources = session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-07",
    ).order_by(FormRecord.created_at.desc()))
    for source in sources:
        initial = _measurement_decimal((source.payload or {}).get("D07-007"))
        if initial is None or initial < 0:
            continue
        peers = [item for item in session.scalars(select(FormRecord).where(
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-08",
        )) if (item.payload or {}).get("D08-001") == source.id and item.id != current_record_id]
        weights = [d08_fraction_weight(item) for item in peers]
        peer_incomplete = any(weight is None for weight in weights)
        peer_total = sum((weight for weight in weights if weight is not None), Decimal("0"))
        date_label = source.record_date or "sin fecha"
        short_status = {
            "RAW": "Borrador",
            "PENDING_REVIEW": "Pendiente",
            "VALIDATED": "Válido",
            "CORRECTION_REQUESTED": "Corregir",
        }.get(source.status, status_label(source.status))
        options.append({
            "id": source.id,
            "label": f"{_decimal_text(initial)} kg · {date_label} · {short_status} · {source.title}",
            "initial_weight": _decimal_text(initial),
            "peer_total": "" if peer_incomplete else _decimal_text(peer_total),
            "peer_incomplete": "true" if peer_incomplete else "false",
        })
    return options


def relation_options_by_field(
    session: Session, project_id: str, form_code: str, current_record_id: str | None = None,
) -> dict[str, list[dict]]:
    result: dict[str, list[dict]] = {}
    form_spec = FORM_BY_CODE.get(form_code, {})
    for field in form_spec.get("fields", []):
        field_id = field["id"]
        relation = RELATION_FIELD_SPECS.get(field_id)
        if not relation:
            continue
        entity, allowed_types = relation
        options: list[dict] = []
        if entity == "record":
            query = select(FormRecord).where(FormRecord.project_id == project_id)
            if allowed_types:
                query = query.where(FormRecord.form_code.in_(allowed_types))
            if field_id in RELATION_REQUIRES_VALIDATED_RECORD:
                query = query.where(FormRecord.status == "VALIDATED")
            if current_record_id:
                query = query.where(FormRecord.id != current_record_id)
            rows = session.scalars(query.order_by(FormRecord.created_at.desc()))
            for row in rows:
                label = f"{row.form_code} · {row.title} · {row.record_date or 'sin fecha'} · {record_status_label(session, row)}"
                options.append({"id": row.id, "label": label})
        elif entity == "item":
            query = select(PMIRSItem).where(PMIRSItem.project_id == project_id)
            if allowed_types:
                query = query.where(PMIRSItem.item_type.in_(allowed_types))
            rows = session.scalars(query.order_by(PMIRSItem.item_type, PMIRSItem.code))
            options = [{
                "id": row.id,
                "label": f"{row.code} · {row.title} · {PMIRS_ITEM_TYPES.get(row.item_type, {}).get('label', row.item_type)} · {status_label(row.review_status)}",
            } for row in rows]
        elif entity == "evidence":
            rows = session.scalars(select(EvidenceFile).where(
                EvidenceFile.project_id == project_id,
            ).order_by(EvidenceFile.created_at.desc()))
            options = [{
                "id": row.id,
                "label": f"{row.original_name} · {row.size_bytes} bytes · {utc(row.created_at).date().isoformat() if row.created_at else 'sin fecha'}",
            } for row in rows]
        elif entity == "version":
            rows = session.scalars(select(PMIRSVersion).where(
                PMIRSVersion.project_id == project_id,
            ).order_by(PMIRSVersion.created_at.desc()))
            options = [{
                "id": row.id,
                "label": f"{row.version_label} · {status_label(row.status)} · {utc(row.created_at).date().isoformat() if row.created_at else 'sin fecha'}",
            } for row in rows]
        elif entity == "member":
            role_labels = {
                "campo": "Operario/a de campo",
                "consultor": "Consultoría GREENATICS",
                "revisor": "Revisor/a QA/QC",
            }
            rows = session.execute(
                select(ProjectMembership, User)
                .join(User, User.id == ProjectMembership.user_id)
                .where(
                    ProjectMembership.project_id == project_id,
                    ProjectMembership.active.is_(True),
                    User.active.is_(True),
                    ProjectMembership.role.in_(allowed_types),
                )
                .order_by(User.full_name, User.email)
            )
            options = [{
                "id": membership.user_id,
                "label": f"{member.full_name} · {member.email} · {role_labels.get(membership.role, membership.role)}",
            } for membership, member in rows]
            if current_record_id:
                current_record = session.get(FormRecord, current_record_id)
                legacy_value = str((current_record.payload or {}).get(field_id, "")).strip() if current_record else ""
                if current_record and current_record.project_id == project_id and legacy_value and all(
                    str(option["id"]) != legacy_value for option in options
                ):
                    legacy_user = session.get(User, legacy_value)
                    legacy_description = (
                        f"{legacy_user.full_name} · {legacy_user.email} · membresía o perfil sin vigencia"
                        if legacy_user else f"valor anterior sin vincular a una cuenta RED · {legacy_value}"
                    )
                    options.insert(0, {"id": legacy_value, "label": legacy_description, "legacy": True})
        result[field_id] = options
    return result


def relation_selection_errors(
    session: Session, project_id: str, form_spec: dict, payload: dict,
) -> list[str]:
    errors: list[str] = []
    for field in form_spec["fields"]:
        field_id = field["id"]
        relation = RELATION_FIELD_SPECS.get(field_id)
        if not relation:
            continue
        raw_value = str(payload.get(field_id, "")).strip()
        selected = list(dict.fromkeys(value.strip() for value in raw_value.split("\n") if value.strip()))
        if not selected:
            continue
        entity, allowed_types = relation
        if entity == "record":
            query = select(FormRecord).where(
                FormRecord.project_id == project_id,
                FormRecord.id.in_(selected),
            )
            if allowed_types:
                query = query.where(FormRecord.form_code.in_(allowed_types))
            rows = list(session.scalars(query))
            valid_ids = {row.id for row in rows}
            if valid_ids != set(selected):
                errors.append(f"El vínculo de «{field['label']}» debe existir en este expediente y corresponder al tipo permitido.")
            if field_id in RELATION_REQUIRES_VALIDATED_RECORD and any(row.status != "VALIDATED" or not record_source_review_current(session, row) for row in rows):
                errors.append(f"El vínculo de «{field['label']}» requiere registros revisados como válidos.")
            if not field.get("multi_select") and len(selected) > 1:
                errors.append(f"Selecciona un solo elemento para «{field['label']}».")
            continue
        elif entity == "item":
            query = select(PMIRSItem.id).where(
                PMIRSItem.project_id == project_id,
                PMIRSItem.id.in_(selected),
            )
            if allowed_types:
                query = query.where(PMIRSItem.item_type.in_(allowed_types))
        elif entity == "evidence":
            query = select(EvidenceFile.id).where(
                EvidenceFile.project_id == project_id,
                EvidenceFile.id.in_(selected),
            )
        elif entity == "member":
            query = select(ProjectMembership.user_id).where(
                ProjectMembership.project_id == project_id,
                ProjectMembership.user_id.in_(selected),
                ProjectMembership.active.is_(True),
                ProjectMembership.role.in_(allowed_types),
            ).join(User, User.id == ProjectMembership.user_id).where(User.active.is_(True))
        else:
            query = select(PMIRSVersion.id).where(
                PMIRSVersion.project_id == project_id,
                PMIRSVersion.id.in_(selected),
            )
        valid_ids = set(session.scalars(query))
        if valid_ids != set(selected):
            errors.append(f"El vínculo de «{field['label']}» debe existir en este expediente y corresponder al tipo permitido.")
        if not field.get("multi_select") and len(selected) > 1:
            errors.append(f"Selecciona un solo elemento para «{field['label']}».")
    return errors


def d08_submission_errors(
    session: Session, project_id: str, payload: dict, *, record_id: str | None = None,
) -> list[str]:
    errors = []
    source_id = str(payload.get("D08-001", "")).strip()
    source = d08_source_record(session, project_id, source_id) if source_id else None
    if not source:
        errors.append("Selecciona un pesaje D-07 existente en este expediente.")
    else:
        initial = _measurement_decimal((source.payload or {}).get("D07-007"))
        if initial is None or initial < 0:
            errors.append("El D-07 vinculado debe tener un peso neto válido.")
        if source.status != "VALIDATED":
            errors.append("El pesaje D-07 debe estar revisado como válido antes de enviar fracciones a revisión.")
    weight = _measurement_decimal(payload.get("D08-005"))
    if weight is None or weight < 0:
        errors.append("Registra un peso de fracción numérico igual o mayor que cero.")
    if not str(payload.get("D08-003", "")).strip():
        errors.append("Selecciona o registra la categoría principal de la fracción.")
    if source:
        peers = [item for item in session.scalars(select(FormRecord).where(
            FormRecord.project_id == project_id,
            FormRecord.form_code == "D-08",
        )) if (item.payload or {}).get("D08-001") == source.id]
        weights = []
        for item in peers:
            if item.id == record_id:
                continue
            weights.append(d08_fraction_weight(item))
        weights.append(weight)
        if any(value is None for value in weights):
            errors.append("Completa el peso de todas las fracciones del mismo lote antes de enviar una a revisión.")
    return errors


def d07_submission_errors(session: Session, project_id: str, payload: dict) -> list[str]:
    """Require a reviewed, usable D-13 equipment record before a measured lot enters QA."""
    equipment_id = str(payload.get("D07-003", "")).strip()
    if not equipment_id:
        return ["Selecciona el equipo D-13 del pesaje antes de enviarlo a revisión."]
    equipment = session.scalar(select(FormRecord).where(
        FormRecord.id == equipment_id,
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-13",
    ))
    if not equipment:
        return ["El equipo D-13 debe existir en este expediente."]
    errors = []
    if equipment.status != "VALIDATED":
        errors.append("El D-13 del equipo debe estar revisado y validado antes de enviar este pesaje a revisión.")
    if str((equipment.payload or {}).get("D13-006", "")).strip() == "No usar":
        errors.append("El D-13 indica «No usar»; no se puede enviar un pesaje asociado a ese equipo.")
    return errors


def invalidate_equipment_measurements(
    session: Session, project_id: str, equipment_id: str, actor_id: str, reason: str,
) -> None:
    """Reopen QA for measurements whenever their linked D-13 record loses approval."""
    lots = list(session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-07",
    )))
    fractions = list(session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-08",
    )))
    affected_shifts: set[str] = set()
    affected_visits: set[str] = set()
    baseline_source_changed = False
    timestamp = now_utc()
    for lot in lots:
        if str((lot.payload or {}).get("D07-003", "")).strip() != equipment_id:
            continue
        if lot.status == "VALIDATED":
            baseline_source_changed = True
        shift_id = str((lot.payload or {}).get("D07-001", "")).strip()
        if shift_id:
            affected_shifts.add(shift_id)
        if lot.status in {"VALIDATED", "PENDING_REVIEW"}:
            lot.status = "CORRECTION_REQUESTED"
            lot.reviewed_by = None
            lot.reviewed_at = None
            lot.review_note = reason[:2000]
            lot.version += 1
            lot.updated_by = actor_id
            lot.updated_at = timestamp
            session.add(FormRevision(
                record_id=lot.id, revision=lot.version, payload=dict(lot.payload or {}),
                note="Se reabre QA/QC porque cambió la revisión del equipo D-13 vinculado.",
                changed_by=actor_id,
            ))
        affected_visits.update(d14_visit_ids_for_record(session, project_id, lot))
        for fraction in fractions:
            if str((fraction.payload or {}).get("D08-001", "")).strip() != lot.id:
                continue
            if fraction.status not in {"VALIDATED", "PENDING_REVIEW"}:
                continue
            if fraction.status == "VALIDATED":
                baseline_source_changed = True
            fraction.status = "CORRECTION_REQUESTED"
            fraction.reviewed_by = None
            fraction.reviewed_at = None
            fraction.review_note = reason[:2000]
            fraction.version += 1
            fraction.updated_by = actor_id
            fraction.updated_at = timestamp
            session.add(FormRevision(
                record_id=fraction.id, revision=fraction.version, payload=dict(fraction.payload or {}),
                note="Se reabre QA/QC porque cambió la revisión del equipo D-13 del pesaje vinculado.",
                changed_by=actor_id,
            ))
    for visit_id in affected_visits:
        recalculate_d14_for_visit(session, visit_id, project_id=project_id, actor_id=actor_id)
    for shift_id in affected_shifts:
        recalculate_q01_for_shift(session, shift_id, project_id=project_id, actor_id=actor_id)
    if baseline_source_changed:
        project = session.get(Project, project_id)
        if project and project.baseline_status == "validada":
            invalidate_project_baseline(
                session, project, actor_id=actor_id,
                reason="El equipo D-13 cambió y una medición validada vinculada dejó de ser vigente; se requiere reevaluar la Línea Base.",
                detail={"source": "cambio de equipo D-13", "equipment_record_id": equipment_id},
            )


def recalculate_d08_group(
    session: Session, source_id: str, *, project_id: str, actor_id: str,
    skip_record_id: str | None = None,
) -> None:
    """Keep every D-08 row for one D-07 lot consistent and auditable."""
    source = session.scalar(select(FormRecord).where(
        FormRecord.id == source_id,
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-07",
    ).with_for_update())
    if not source:
        return
    source_weight = _measurement_decimal((source.payload or {}).get("D07-007"))
    if source_weight is not None and source_weight < 0:
        source_weight = None
    rows = [item for item in session.scalars(select(FormRecord).where(
        FormRecord.project_id == project_id,
        FormRecord.form_code == "D-08",
    )) if (item.payload or {}).get("D08-001") == source.id]
    if not rows:
        return
    row_weights = [d08_fraction_weight(item) for item in rows]
    complete = source_weight is not None and all(value is not None for value in row_weights)
    if complete:
        total = sum((value for value in row_weights if value is not None), Decimal("0"))
        difference = abs(total - source_weight)
        if source_weight > 0:
            with localcontext() as context:
                context.prec = 64
                percentage = (difference / source_weight * Decimal("100")).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP,
                )
            difference_text = f"{_decimal_text(difference)} kg; {format(percentage, 'f')}%"
        else:
            difference_text = f"{_decimal_text(difference)} kg; porcentaje no calculable (peso inicial 0 kg)"
        calculated = {
            "D08-008": _decimal_text(total),
            "D08-009": difference_text,
            "D08-010": "Pendiente de revisar completitud, evidencia y tolerancia técnica interna.",
        }
    else:
        calculated = {
            "D08-008": "",
            "D08-009": "",
            "D08-010": (
                "Pendiente: validar el peso inicial D-07."
                if source_weight is None else
                "Pendiente: completa el peso de todas las fracciones vinculadas."
            ),
        }
    for row in rows:
        old_payload = dict(row.payload or {})
        new_payload = {**old_payload, **calculated, "_red_d07_source_version": source.version, "_red_d07_source_status": source.status}
        if new_payload == old_payload:
            continue
        row.payload = new_payload
        if row.id == skip_record_id:
            continue
        previous_status = row.status
        if previous_status in {"VALIDATED", "PENDING_REVIEW"}:
            row.status = "CORRECTION_REQUESTED"
        row.reviewed_by = None
        row.reviewed_at = None
        row.review_note = "El balance agregado del lote cambió; vuelve a revisar el conjunto de fracciones."
        row.version += 1
        row.updated_by = actor_id
        row.updated_at = now_utc()
        session.add(FormRevision(
            record_id=row.id, revision=row.version, payload=new_payload,
            note=f"Recálculo de balance del lote D-07; estado anterior: {previous_status}",
            changed_by=actor_id,
        ))
        audit(
            session, project_id=project_id, actor_id=actor_id, action="record_d08_balance_recalculated",
            entity_type="form_record", entity_id=row.id,
            detail={"source_record_id": source.id, "from_status": previous_status, "to_status": row.status},
        )


def project_human_code(session: Session, project_id: str) -> str:
    project = session.get(Project, project_id)
    if not project:
        return ""
    seeded_codes = {
        "bello-parque-alto": "BEL-001",
        "bello-tulipanes": "BEL-002",
        "bello-majagua": "BEL-003",
        "bello-trigales": "BEL-004",
    }
    if project.slug in seeded_codes:
        return seeded_codes[project.slug]
    additional_count = session.scalar(select(func.count(Project.id)).where(
        ~Project.slug.in_(seeded_codes.keys()),
    )) or 0
    return f"BEL-{4 + additional_count:03d}"


def apply_server_managed_fields(
    form_code: str, payload: dict, *, timestamp: datetime | None = None,
    session: Session | None = None, project_id: str | None = None,
    existing_payload: dict | None = None, record_id: str | None = None,
    actor_id: str | None = None,
) -> dict:
    result = apply_supported_calculations(form_code, payload)
    created_at = utc(timestamp) or now_utc()
    timestamp_field = AUTOMATIC_TIMESTAMP_FIELDS.get(form_code)
    if timestamp_field:
        result[timestamp_field] = created_at.isoformat()
    time_field = AUTOMATIC_TIME_FIELDS.get(form_code)
    if time_field:
        result[time_field] = created_at.strftime("%H:%M")
    existing_payload = existing_payload or {}
    if form_code == "P-14":
        for field_id, pending_value in PENDING_OPERATIONAL_REFERENCE_FIELDS.items():
            category = next((name for name, spec in OPERATIONAL_REFERENCE_CATEGORIES.items() if spec["field_id"] == field_id), "")
            reference = current_operational_reference(session, project_id, category) if session and project_id and category else None
            if reference:
                result[field_id] = f"{reference.title} · versión {reference.version_label} · Aprobada"
            else:
                result[field_id] = pending_value
    if form_code == "Q-01":
        result["Q01-010"] = PENDING_AUTOMATIC_RELATION_FIELDS["Q01-010"]
    if session and project_id:
        code = project_human_code(session, project_id)
        if form_code == "Q-01":
            result["Q01-002"] = q01_completeness_summary(session, project_id, result)
            result["Q01-011"] = str(existing_payload.get("Q01-011", "")).strip()
        identifier = SYSTEM_IDENTIFIER_FIELDS.get(form_code)
        if identifier:
            field_id, prefix = identifier
            prior_identifier = str(existing_payload.get(field_id, "")).strip()
            if prior_identifier:
                result[field_id] = prior_identifier
            elif record_id:
                compact_id = record_id.replace("-", "")[:10].upper()
                result[field_id] = f"{prefix}-{code}-{compact_id}"
        project_field = PROJECT_CODE_FIELD.get(form_code)
        if project_field:
            result[project_field] = code
        reference_field = PROJECT_REFERENCE_FIELDS.get(form_code)
        if reference_field:
            result[reference_field] = code
        if form_code == "D-14":
            result.update(d14_visit_summary_fields(
                session, project_id, str(result.get("D14-001", "")).strip(),
            ))
            previous_responsible = str(existing_payload.get("D14-008", "")).strip()
            if previous_responsible:
                result["D14-008"] = previous_responsible
            elif actor_id:
                actor = session.get(User, actor_id)
                membership = session.scalar(select(ProjectMembership).where(
                    ProjectMembership.project_id == project_id,
                    ProjectMembership.user_id == actor_id,
                    ProjectMembership.active.is_(True),
                ))
                if actor and membership:
                    role_labels = {
                        "campo": "Operario/a de campo",
                        "consultor": "Consultoría GREENATICS",
                        "administracion_ph": "Administración PH",
                        "revisor": "Revisor/a QA/QC",
                        "lector": "Lector/a",
                    }
                    stamp = created_at.strftime("%Y-%m-%d %H:%M UTC")
                    result["D14-008"] = (
                        f"{actor.full_name} · {actor.email} · "
                        f"{role_labels.get(membership.role, membership.role)} · {stamp}"
                    )
        if form_code == "P-11":
            prior_uploader = str(existing_payload.get("P11-007", "")).strip()
            if prior_uploader:
                result["P11-007"] = prior_uploader
            elif actor_id:
                actor = session.get(User, actor_id)
                membership = session.scalar(select(ProjectMembership).where(
                    ProjectMembership.project_id == project_id,
                    ProjectMembership.user_id == actor_id,
                    ProjectMembership.active.is_(True),
                ))
                if actor:
                    role_labels = {
                        "campo": "Operario/a de campo",
                        "consultor": "Consultoría GREENATICS",
                        "administracion_ph": "Administración PH",
                        "revisor": "Revisor/a QA/QC",
                        "lector": "Lector/a",
                    }
                    role_label = role_labels.get(membership.role, membership.role) if membership else "Administración RED"
                    result["P11-007"] = f"{actor.full_name} · {role_label}"
        if form_code == "Q-01":
            result["Q01-003"] = q01_mass_balance_summary(session, project_id, result)
        if form_code == "P-15":
            result["P15-009"] = p15_open_action_summary(session, project_id)
            result["P15-008"] = p15_result_vs_target_summary(session, project_id, result)
        elif form_code == "P-01":
            result.update(p01_source_checklist(
                session, project_id, str(result.get("P01-003", "")).strip(),
            ))
        sequence_field = PROJECT_SEQUENCE_FIELDS.get(form_code)
        if sequence_field:
            prior = str(existing_payload.get(sequence_field, "")).strip()
            if prior:
                result[sequence_field] = prior
            else:
                query = select(func.count(FormRecord.id)).where(
                    FormRecord.project_id == project_id,
                    FormRecord.form_code == form_code,
                )
                if record_id:
                    query = query.where(FormRecord.id != record_id)
                result[sequence_field] = str((session.scalar(query) or 0) + 1)
    return result


def record_form_error_targets(form_spec: dict, errors: list[str]) -> list[str]:
    """Return safe in-form focus targets only when one field is unambiguously named."""
    targets = []
    for error in errors:
        matches = []
        for field in form_spec["fields"]:
            field_id = str(field.get("id", ""))
            source_code = re.sub(r"^([A-Z]+)(\d{2})-", r"\1-\2-", field_id)
            label = str(field.get("label", "")).strip()
            identifier_match = bool(field_id and re.search(
                rf"(?<![A-Z0-9])(?:{re.escape(field_id)}|{re.escape(source_code)})(?![A-Z0-9])",
                error, re.IGNORECASE,
            ))
            label_match = bool(label and (
                f"«{label}»" in error or error.startswith(f"Campo requerido: {label}")
            ))
            if identifier_match or label_match:
                matches.append(field)
        if form_spec.get("code") == "D-08" and "D-07 seleccionado" in error:
            matches = [field for field in form_spec["fields"] if field.get("id") == "D08-001"]
        if len(matches) != 1:
            targets.append("")
            continue
        field = matches[0]
        if field.get("server_managed"):
            targets.append("")
        elif field.get("id") == "P15-002" or str(field.get("control", "")).strip().casefold() == "subtabla" or field.get("repeatable") or str(field.get("control", "")).strip().casefold() == "gps":
            targets.append(f'{field["id"]}-group')
        else:
            targets.append(str(field["id"]))
    return targets


def submission_errors(
    form_spec: dict, payload: dict, source_note: str,
    uploaded_field_ids: set[str] | None = None,
) -> list[str]:
    uploaded_field_ids = uploaded_field_ids or set()
    errors = []
    if form_spec.get("code") == "D-02":
        pending_rows = repeatable_field_rows(payload.get("D02-021", ""), "D02-021", include_legacy=False)
        pending_field_ids = [row.get("field_id", "") for row in pending_rows]
        allowed_pending_fields = {"D02-001", "D02-002", "D02-004", "D02-008", "D02-010", "D02-012"}
        allowed_statuses = {"Pendiente de solicitar", "La administración no sabe", "La administración no reporta", "No aplica; justificar"}
        if len(pending_field_ids) != len(set(pending_field_ids)):
            errors.append("D-02-021 no puede repetir el mismo dato pendiente.")
        for row in pending_rows:
            field_id = row.get("field_id", "")
            status = row.get("status", "")
            detail = row.get("detail", "")
            if field_id not in allowed_pending_fields:
                errors.append("Selecciona un dato requerido disponible en D-02-021.")
                continue
            if status not in allowed_statuses:
                errors.append("Selecciona un estado de consulta disponible en D-02-021.")
            if len(detail.strip()) < 8:
                errors.append("D-02-021 requiere responsable, siguiente paso o justificación (mínimo 8 caracteres).")
            if status == "No aplica; justificar" and len(detail.strip()) < 20:
                errors.append("Justifica con más detalle por qué el dato no aplica (mínimo 20 caracteres).")
            if str(payload.get(field_id, "")).strip():
                errors.append(f"{field_id} tiene un valor y no debe figurar también como pendiente.")
        for field_id in allowed_pending_fields:
            if not str(payload.get(field_id, "")).strip() and field_id not in pending_field_ids:
                errors.append(f"Completa {field_id} o regístralo con su motivo y siguiente paso en D-02-021.")
    for field in form_spec["fields"]:
        condition = field.get("required_when") or {}
        dependent_value = str(payload.get(condition.get("field_id", ""), "")).strip().casefold()
        equals_any = {str(value).strip().casefold() for value in condition.get("equals_any", [])}
        not_equals_any = {str(value).strip().casefold() for value in condition.get("not_equals_any", [])}
        required_by_condition = bool(
            (equals_any and dependent_value in equals_any)
            or (not_equals_any and dependent_value and dependent_value not in not_equals_any)
        )
        if field["id"] in SERVER_MANAGED_FIELD_IDS:
            continue
        raw_value = str(payload.get(field["id"], "")).strip()
        control = str(field.get("control", "")).strip().casefold()
        if field["id"] == "P15-002" and raw_value:
            period = re.fullmatch(
                r"(?P<start>\d{4}-\d{2}-\d{2})\s*/\s*(?P<end>\d{4}-\d{2}-\d{2})", raw_value,
            )
            try:
                start = date.fromisoformat(period.group("start")) if period else None
                end = date.fromisoformat(period.group("end")) if period else None
            except ValueError:
                start = end = None
            if start is None or end is None or end < start:
                errors.append("Registra un periodo válido en formato fecha inicial y fecha final; la fecha final debe ser igual o posterior para «Periodo».")
        elif field["id"] == "D06-004" and raw_value:
            period = re.fullmatch(
                r"(?P<amount>\d+(?:\.\d+)?)\s+(?P<unit>horas|días)", raw_value, re.IGNORECASE,
            )
            period_amount = _measurement_decimal(period.group("amount")) if period else None
            if period_amount is None or period_amount < 0:
                errors.append("Registra un número igual o mayor que cero y selecciona si el periodo está en horas o días para «Periodo desde última recolección».")
        elif field["id"] in {"D13-004", "D13-005"} and raw_value:
            measurement = re.fullmatch(r"(?P<amount>\d+(?:\.\d+)?)\s+(?P<unit>[^\r\n]{1,50})", raw_value)
            amount = _measurement_decimal(measurement.group("amount")) if measurement else None
            if amount is None or amount <= 0 or not measurement.group("unit").strip():
                errors.append(f"Registra un valor numérico positivo y su unidad técnica para «{field['label']}».")
        elif field["id"] not in {"D07-005", "D07-006", "D08-005", "D09-002", "D09-003"} and raw_value and any(
            token in control for token in ("número", "numero", "decimal", "peso", "cantidad")
        ):
            numeric_value = _measurement_decimal(raw_value)
            if numeric_value is None:
                errors.append(f"«{field['label']}» debe contener un número válido.")
            elif field["id"] in INTEGER_NUMERIC_FIELD_IDS and numeric_value != numeric_value.to_integral_value():
                errors.append(f"«{field['label']}» debe ser un número entero.")
            elif field["id"] in NONNEGATIVE_NUMERIC_FIELD_IDS and numeric_value < 0:
                errors.append(f"«{field['label']}» debe ser igual o mayor que cero.")
            elif field["id"] in POSITIVE_NUMERIC_FIELD_IDS and numeric_value <= 0:
                errors.append(f"«{field['label']}» debe ser mayor que cero.")
        if raw_value and control == "email" and not re.fullmatch(r"[^@\s]+@[^@\s]+", raw_value):
            errors.append(f"Ingresa un correo válido para «{field['label']}».")
        elif raw_value and field["id"] == "D01-009" and not valid_phone_number(raw_value):
            errors.append(f"Ingresa un teléfono local o internacional válido para «{field['label']}».")
        elif raw_value and control == "email/teléfono":
            valid_email = bool(re.fullmatch(r"[^@\s]+@[^@\s]+", raw_value))
            valid_phone = valid_phone_number(raw_value)
            if not (valid_email or valid_phone):
                errors.append(f"Ingresa un correo válido o un teléfono de 7 a 15 dígitos para «{field['label']}».")
        elif raw_value and control == "duración":
            duration_minutes = _measurement_decimal(raw_value)
            if duration_minutes is None or duration_minutes < 0:
                errors.append(f"«{field['label']}» debe ser un número válido de minutos igual o mayor que cero.")
        if field["id"] in GPS_FIELD_IDS:
            errors.extend(gps_capture_errors(raw_value))
        if field.get("multi_select") and field.get("options"):
            selected_values = set(multi_select_selected_values(raw_value))
            invalid_values = selected_values.difference(field["options"])
            if invalid_values:
                errors.append(f"Selecciona solo opciones disponibles para «{field['label']}».")
        elif str(field.get("control", "")).strip().casefold() in {"lista", "estado"} and field.get("options") and raw_value:
            if raw_value not in field["options"]:
                errors.append(f"Selecciona una opción disponible para «{field['label']}».")
        if field["id"] == D04_CONTAINER_FIELD:
            continue
        if not (field.get("required") or required_by_condition):
            continue
        if field.get("file_upload"):
            present = field["id"] in uploaded_field_ids or (
                bool(str(payload.get(field["id"], "")).strip()) if field.get("file_or_record") else False
            )
        elif field.get("multi_select_text"):
            present = bool(multi_select_selected_values(payload.get(field["id"], "")))
        else:
            present = bool(str(payload.get(field["id"], "")).strip())
        if not present:
            errors.append("Campo requerido: " + field["label"])
    has_substantive_answer = any(
        str(payload.get(field["id"], "")).strip()
        for field in form_spec["fields"]
        if not str(field.get("data_state", "")).upper().startswith(("SYSTEM", "DERIVED"))
    )
    if not has_substantive_answer:
        errors.append("Registra al menos una respuesta antes de enviar a revisión.")
    if len(source_note.strip()) < 8:
        errors.append("Describe la fuente o el método de captura (mínimo 8 caracteres).")
    if form_spec.get("code") == "D-02" and str(payload.get("D02-020", "")).strip().startswith("Bello confirma"):
        if len(str(payload.get("D02-016", "")).strip()) < 8:
            errors.append("Registra en D-02-016 el acto, versión y periodo PGIRS oficial que confirma la transición.")
        if "D02-013" not in uploaded_field_ids:
            errors.append("Adjunta en D-02-013 la respuesta o acto oficial de Bello que soporta el estado de transición confirmado.")
    if form_spec.get("code") == "D-01":
        total = _measurement_decimal(payload.get("D01-011"))
        delivered = _measurement_decimal(payload.get("D01-012"))
        occupied = _measurement_decimal(payload.get("D01-013"))
        if total is not None and delivered is not None and delivered > total:
            errors.append("Las unidades entregadas no pueden superar el total de unidades privadas.")
        occupancy_limit = delivered if delivered is not None else total
        if occupancy_limit is not None and occupied is not None and occupied > occupancy_limit:
            errors.append("Las unidades ocupadas no pueden superar las unidades entregadas o el total informado.")
    if form_spec.get("code") == "P-10" and str(payload.get("P10-013", "")).strip().casefold() == "ejecutada":
        attendee_count = str(payload.get("P10-009", "")).strip()
        if attendee_count and (not re.fullmatch(r"[0-9]+", attendee_count) or int(attendee_count) < 1):
            errors.append("El número de asistentes de una sesión ejecutada debe ser un entero mayor que cero.")
    if form_spec.get("code") == "D-04":
        rows = d04_container_rows(payload.get(D04_CONTAINER_FIELD), include_legacy=False)
        if not any(any(row.values()) for row in rows):
            errors.append("Registra al menos un recipiente con tipo y cantidad observados en D-04-004.")
        limit_error = d04_container_limit_error(payload.get(D04_CONTAINER_FIELD))
        if limit_error:
            errors.append(limit_error)
        for index, row in enumerate(rows, start=1):
            if not any(row.values()):
                continue
            if not row["container_type"]:
                errors.append(f"Indica el tipo observado del recipiente en la fila {index} de D-04-004.")
            quantity = row["quantity"]
            if not re.fullmatch(r"[0-9]+", quantity) or int(quantity) <= 0:
                errors.append(f"La cantidad de la fila {index} de D-04-004 debe ser un entero mayor que cero.")
    elif form_spec.get("code") == "D-07":
        tare = _measurement_decimal(payload.get("D07-005"))
        gross = _measurement_decimal(payload.get("D07-006"))
        if str(payload.get("D07-005", "")).strip() and tare is None:
            errors.append("La tara D-07 debe ser un valor numérico válido en kg.")
        if str(payload.get("D07-006", "")).strip() and gross is None:
            errors.append("El peso bruto D-07 debe ser un valor numérico válido en kg.")
        if tare is not None and tare < 0:
            errors.append("La tara D-07 debe ser igual o mayor que cero kg.")
        if tare is not None and gross is not None and gross < tare:
            errors.append("El peso bruto D-07 no puede ser menor que la tara.")
    elif form_spec.get("code") == "D-09":
        total = _measurement_decimal(payload.get("D09-002"))
        improper = _measurement_decimal(payload.get("D09-003"))
        if str(payload.get("D09-002", "")).strip() and total is None:
            errors.append("El peso total D-09 debe ser un valor numérico válido en kg.")
        if str(payload.get("D09-003", "")).strip() and improper is None:
            errors.append("El peso de impropios D-09 debe ser un valor numérico válido en kg.")
        if total is not None and total <= 0:
            errors.append("El peso total D-09 debe ser mayor que cero kg.")
        if improper is not None and improper < 0:
            errors.append("El peso de impropios D-09 debe ser igual o mayor que cero kg.")
        if total is not None and improper is not None and improper > total:
            errors.append("El peso de impropios D-09 no puede superar el peso total de la corriente.")
    for field_id in REPEATABLE_FIELD_SPECS:
        limit_error = repeatable_field_limit_error(payload.get(field_id), field_id)
        if limit_error:
            errors.append(limit_error)
    return errors


@app.post("/projects/{project_id}/records/new")
async def create_record(project_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    project, role = authorize_project(session, project_id, user, write=True)
    form = await request.form()
    check_csrf(request, str(form.get("csrf", "")))
    form_code = str(form.get("form_code", ""))
    form_spec = FORM_BY_CODE.get(form_code)
    if not form_spec:
        raise HTTPException(400, "Formulario no disponible.")
    if form_code == "P-12":
        raise HTTPException(409, "P-12 se alimenta desde las versiones de PMIRS Studio para conservar una sola secuencia documental.")
    authorize_form_write(role, form_code)
    require_project_visit_authorization_for_form(session, project, form_code)
    submission_key = str(form.get("submission_key", "")).strip()
    if submission_key and not re.fullmatch(r"[A-Za-z0-9_-]{32,64}", submission_key):
        raise HTTPException(422, "La clave de envío no es válida. Recarga el formulario e inténtalo otra vez.")
    if submission_key:
        prior = session.scalar(select(FormRecord).where(FormRecord.submission_key == submission_key))
        if prior:
            if prior.project_id != project.id or prior.form_code != form_code or prior.created_by != user.id:
                raise HTTPException(409, "La clave de envío ya se usó para otro registro. Recarga el formulario.")
            return RedirectResponse(f"/records/{prior.id}?notice=Este%20env%C3%ADo%20ya%20se%20guard%C3%B3", status_code=303)
    created_at = now_utc()
    record_id = new_id()
    uploads = form_field_uploads(form, form_spec)
    uploaded_field_ids = {field_id for field_id, _upload in uploads if field_id is not None}
    payload = apply_server_managed_fields(
        form_code,
        _record_payload(form, form_spec, editable_field_ids=form_editable_field_ids(role, form_code)),
        timestamp=created_at,
        session=session,
        project_id=project.id,
        record_id=record_id,
        actor_id=user.id,
    )
    action = str(form.get("action", "draft"))
    if action not in {"draft", "submit"}:
        raise HTTPException(422, "Selecciona si quieres guardar borrador o enviar a revisión.")
    source_note = str(form.get("source_note", "")).strip()[:2000]
    errors = submission_errors(form_spec, payload, source_note, uploaded_field_ids) if action == "submit" else []
    if action == "draft" and form_code == "D-04":
        limit_error = d04_container_limit_error(payload.get(D04_CONTAINER_FIELD))
        if limit_error:
            errors.append(limit_error)
    if action == "draft":
        errors.extend(
            error for field_id in REPEATABLE_FIELD_SPECS
            if (error := repeatable_field_limit_error(payload.get(field_id), field_id))
        )
    if form_code == "D-08":
        source_id = str(payload.get("D08-001", "")).strip()
        if source_id and not d08_source_record(session, project.id, source_id):
            errors.append("El D-07 seleccionado no existe o pertenece a otro expediente; vuelve a elegir el pesaje.")
        if action == "submit":
            errors.extend(d08_submission_errors(session, project.id, payload))
    if form_code == "D-07" and action == "submit":
        errors.extend(d07_submission_errors(session, project.id, payload))
    errors.extend(relation_selection_errors(session, project.id, form_spec, payload))
    if form_code == "P-15":
        errors.extend(p15_measurement_errors(session, project.id, payload))
    if errors:
        error_heading = "No se puede guardar este vínculo:" if action == "draft" else "No se puede enviar a revisión todavía:"
        error_items = errors[:8]
        error_note = "Los archivos no se guardaron; selecciónalos de nuevo." if uploads else ""
        draft_view = SimpleNamespace(
            payload=payload,
            title=str(form.get("record_title", form_spec["title"]))[:300],
            record_date=str(form.get("record_date", ""))[:10],
            source_kind=str(form.get("source_kind", "declarado")),
            source_note=source_note,
        )
        return templates.TemplateResponse(request=request, name="record_form.html", status_code=422, context=page_context(
            request, project=project, form_spec=form_spec, record=draft_view,
            submission_key=submission_key,
            error=error_heading + " " + "; ".join(error_items) + (" " + error_note if error_note else ""),
            error_heading=error_heading,
            error_items=error_items,
            error_targets=record_form_error_targets(form_spec, error_items),
            error_note=error_note,
            notice="",
            relation_options=d08_relation_options(session, project.id) if form_code == "D-08" else [],
            relation_options_by_field=relation_options_by_field(session, project.id, form_code),
            evidence_by_field={},
            read_only_field_ids=form_read_only_field_ids(role, form_code),
            subtable_rows=d04_container_rows(payload.get(D04_CONTAINER_FIELD)),
            subtable_legacy=d04_container_is_legacy(payload.get(D04_CONTAINER_FIELD)),
            repeatable_rows_by_field=repeatable_field_rows_by_form(payload, form_spec),
            **multi_select_context_by_form(payload, form_spec),
        ))
    if action == "submit" and form_code.startswith("P-") and project.baseline_status != "validada":
        draft_view = SimpleNamespace(payload=payload, title=str(form.get("record_title", form_spec["title"]))[:300], record_date=str(form.get("record_date", ""))[:10], source_kind=str(form.get("source_kind", "declarado")), source_note=str(form.get("source_note", ""))[:2000])
        return templates.TemplateResponse(request=request, name="record_form.html", status_code=422, context=page_context(
            request, project=project, form_spec=form_spec, record=draft_view,
            submission_key=submission_key,
            error="Los formularios PMIRS pueden guardarse como borrador; para enviarlos a revisión primero debe aprobarse una Línea Base trazable.", notice="",
            relation_options=[],
            relation_options_by_field=relation_options_by_field(session, project.id, form_code),
            evidence_by_field={},
            read_only_field_ids=form_read_only_field_ids(role, form_code),
            subtable_rows=d04_container_rows(payload.get(D04_CONTAINER_FIELD)),
            subtable_legacy=d04_container_is_legacy(payload.get(D04_CONTAINER_FIELD)),
            repeatable_rows_by_field=repeatable_field_rows_by_form(payload, form_spec),
            **multi_select_context_by_form(payload, form_spec),
        ))
    source_kind = str(form.get("source_kind", "declarado"))
    if source_kind not in ALLOWED_SOURCE_KINDS:
        source_kind = "declarado"
    title = str(form.get("record_title", "")).strip()[:300] or form_spec["title"]
    record_date = str(form.get("record_date", "")).strip()[:10]
    record = FormRecord(
        id=record_id, project_id=project.id, form_code=form_code, title=title,
        status="PENDING_REVIEW" if action == "submit" else "RAW",
        record_date=record_date, source_kind=source_kind, source_note=source_note,
        payload=payload, submission_key=submission_key or None, version=1, created_by=user.id, updated_by=user.id,
        created_at=created_at, updated_at=created_at,
    )
    session.add(record)
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        if submission_key:
            prior = session.scalar(select(FormRecord).where(FormRecord.submission_key == submission_key))
            if prior and prior.project_id == project.id and prior.form_code == form_code and prior.created_by == user.id:
                return RedirectResponse(f"/records/{prior.id}?notice=Este%20env%C3%ADo%20ya%20se%20guard%C3%B3", status_code=303)
        raise
    written_keys: list[str] = []
    try:
        file_rows, written_keys = await persist_field_uploads(
            uploads, project_id=project.id, record_id=record.id, actor_id=user.id, session=session,
        )
        session.add_all(file_rows)
        for evidence in file_rows:
            audit(session, project_id=project.id, actor_id=user.id, action="evidence_uploaded", entity_type="evidence_file", entity_id=evidence.id, detail={"record_id": record.id, "field_id": evidence.field_id, "name": evidence.original_name, "size_bytes": evidence.size_bytes, "sha256": evidence.sha256})
    except Exception:
        session.rollback()
        cleanup_storage_objects(written_keys)
        raise
    if form_code in {"D-01", "D-02", "D-06", "D-07", "D-08", "Q-01"} and project.baseline_status == "validada":
        invalidate_project_baseline(
            session, project, actor_id=user.id,
            reason="Se agregó un nuevo registro de soporte; la Línea Base requiere revisión nuevamente.",
            detail={"source": "creación de registro de soporte", "form_code": form_code},
        )
    if form_code == "D-08":
        source_id = str(payload.get("D08-001", "")).strip()
        if source_id:
            recalculate_d08_group(session, source_id, project_id=project.id, actor_id=user.id, skip_record_id=record.id)
            source = d08_source_record(session, project.id, source_id)
            if source:
                recalculate_q01_for_shift(
                    session, str((source.payload or {}).get("D07-001", "")).strip(),
                    project_id=project.id, actor_id=user.id,
                )
            payload = record.payload
    elif form_code == "D-07":
        recalculate_d08_group(session, record.id, project_id=project.id, actor_id=user.id)
        recalculate_q01_for_shift(
            session, str((record.payload or {}).get("D07-001", "")).strip(),
            project_id=project.id, actor_id=user.id,
        )
    elif form_code == "D-06":
        recalculate_q01_for_shift(
            session, record.id, project_id=project.id, actor_id=user.id,
        )
    if form_code in {"D-03", "D-06", "D-07", "D-08", "D-12"}:
        for visit_id in d14_visit_ids_for_record(session, project.id, record):
            recalculate_d14_for_visit(session, visit_id, project_id=project.id, actor_id=user.id)
        recalculate_q01_for_context_ids(
            session, q01_context_ids_for_record(session, project.id, record),
            project_id=project.id, actor_id=user.id,
        )
    session.add(FormRevision(record_id=record.id, revision=1, payload=payload, note="Creación del registro", changed_by=user.id))
    audit(session, project_id=project.id, actor_id=user.id, action="record_created", entity_type="form_record", entity_id=record.id, detail={"form_code": form_code, "status": record.status})
    try:
        session.commit()
    except Exception:
        session.rollback()
        cleanup_storage_objects(written_keys)
        raise
    return RedirectResponse(f"/records/{record.id}?notice=Registro%20guardado", status_code=303)


@app.get("/records/{record_id}", response_class=HTMLResponse)
def record_page(record_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    record = session.get(FormRecord, record_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, role = authorize_project(session, record.project_id, user)
    form_spec = FORM_BY_CODE.get(record.form_code)
    relation_labels = {}
    if record.form_code == "D-08":
        source_id = str((record.payload or {}).get("D08-001", "")).strip()
        source = d08_source_record(session, project.id, source_id) if source_id else None
        if source:
            relation_labels[source.id] = f"{source.title} · {source.record_date or 'sin fecha'}"
    related_record_types: dict[str, set[str]] = {}
    for field in form_spec.get("fields", []):
        relation = RELATION_FIELD_SPECS.get(field["id"])
        if not relation or relation[0] != "record":
            continue
        raw_value = str((record.payload or {}).get(field["id"], ""))
        for related_id in (value.strip() for value in raw_value.split("\n") if value.strip()):
            related_record_types.setdefault(related_id, set()).update(relation[1])
    if related_record_types:
        related_query = select(FormRecord).where(
            FormRecord.project_id == project.id,
            FormRecord.id.in_(related_record_types),
        )
        for source in session.scalars(related_query):
            if related_record_types[source.id] and source.form_code not in related_record_types[source.id]:
                continue
            relation_labels[source.id] = (
                f"{source.form_code} · {source.title} · {source.record_date or 'sin fecha'} · {status_label(source.status)}"
            )
    for field_id in ("D01-017", "D01-018", "D03-004", "D06-008", "P01-005", "P01-006"):
        user_ids = str((record.payload or {}).get(field_id, "")).split("\n")
        for user_id in dict.fromkeys(value.strip() for value in user_ids if value.strip()):
            member = session.scalar(
                select(User)
                .join(ProjectMembership, ProjectMembership.user_id == User.id)
                .where(
                    User.id == user_id,
                    ProjectMembership.project_id == project.id,
                )
            )
            if member:
                relation_labels[user_id] = f"{member.full_name} · {member.email}"
    revisions = list(session.scalars(select(FormRevision).where(FormRevision.record_id == record.id).order_by(FormRevision.revision.desc())))
    evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record.id).order_by(EvidenceFile.created_at.desc())))
    all_record_signatures = list(session.scalars(select(FormSignature).where(
        FormSignature.record_id == record.id,
    ).order_by(FormSignature.signed_at)))
    record_hash = form_record_document_sha256(project, record, evidence)
    record_signatures = [row for row in all_record_signatures if row.record_version == record.version and row.document_sha256 == record_hash and record_source_review_current(session, record)]
    record_signatures_valid = record_source_review_current(session, record)
    field_labels = {field["id"]: field["label"] for field in form_spec["fields"]}
    can_review = record.form_code != "P-12" and (user.is_platform_admin or role == "revisor")
    removable_evidence_ids = {
        item.id for item in evidence if can_remove_record_evidence(item, record, user, role)
    }
    return templates.TemplateResponse(request=request, name="record.html", context=page_context(
        request, project=project, record=record, form_spec=form_spec,
        answer_sections=form_answer_sections(form_spec),
        record_signatures=record_signatures,
        record_document_hash=record_hash,
        record_signatures_valid=record_signatures_valid,
        record_has_stale_signatures=len(all_record_signatures) > len(record_signatures),
        current_user_signed_record=any(row.signer_user_id == user.id for row in record_signatures),
        can_sign_record=role != "lector" and record.form_code != "P-12" and record_source_review_current(session, record),
        relation_labels=relation_labels,
        evidence_by_field=evidence_by_field(evidence), field_labels=field_labels,
        revisions=revisions, evidence=evidence, can_review=can_review,
        evidence_submission_key=secrets.token_urlsafe(32),
        can_write=can_write_form(role, record.form_code),
        can_attach_evidence=can_add_evidence(role, record.form_code),
        removable_evidence_ids=removable_evidence_ids,
        status_label=record_status_label(session, record), notice=safe_notice(request), error=safe_error(request),
        d04_container_rows=d04_container_rows((record.payload or {}).get(D04_CONTAINER_FIELD), include_legacy=False),
        d04_container_legacy=d04_container_is_legacy((record.payload or {}).get(D04_CONTAINER_FIELD)),
        repeatable_field_displays={
            field_id: repeatable_field_display((record.payload or {}).get(field_id), field_id)
            for field_id in REPEATABLE_FIELD_SPECS
        },
        **multi_select_context_by_form(record.payload or {}, form_spec),
    ))


def record_source_review_current(session: Session, record: FormRecord) -> bool:
    """Legacy approved fractions must not assert approval of an unbound source."""
    if record.form_code != "D-08" or record.status != "VALIDATED":
        return True
    payload = record.payload or {}
    source = d08_source_record(session, record.project_id, str(payload.get("D08-001", "")).strip())
    return bool(source and source.status == "VALIDATED"
        and payload.get("_red_d07_source_version") == source.version
        and payload.get("_red_d07_source_status") == source.status)


def record_status_label(session: Session, record: FormRecord) -> str:
    return status_label(record.status) if record_source_review_current(session, record) else "Revisión no vigente: verificar el pesaje fuente y reenviar las fracciones a QA/QC."


def record_export_fields(session: Session, project: Project, record: FormRecord,
                         form_spec: dict, evidence: list[EvidenceFile]) -> list[dict[str, str]]:
    files_by_field = evidence_by_field(evidence)
    options_by_field = relation_options_by_field(session, project.id, record.form_code, record.id)
    relation_labels = {
        field_id: {str(option["id"]): str(option["label"]) for option in options}
        for field_id, options in options_by_field.items()
    }
    rows = []
    for field in form_spec.get("fields", []):
        value = (record.payload or {}).get(field["id"])
        if field.get("file_upload"):
            attached = files_by_field.get(field["id"], [])
            display = ", ".join(item.original_name for item in attached) if attached else "Sin archivos"
            if field.get("file_or_record") and value:
                display = f"{display}\n{value}"
        elif field["id"] in REPEATABLE_FIELD_SPECS and value:
            display = repeatable_field_display(value, field["id"]) or "Sin respuesta"
        elif field["id"] == D04_CONTAINER_FIELD and value:
            display = d04_container_display(value) or "Sin respuesta"
        elif field["id"] in GPS_FIELD_IDS and value:
            display = gps_capture_display(value)
        elif field.get("multi_select") and value:
            labels = relation_labels.get(field["id"], {})
            selected = multi_select_selected_values(value)
            detail = multi_select_text_detail(value)
            display = " · ".join(labels.get(item, item) for item in selected)
            if detail:
                display = f"{display} · Detalle: {detail}" if display else f"Detalle: {detail}"
        elif field["id"] in relation_labels and value:
            labels = relation_labels[field["id"]]
            selected_ids = [item.strip() for item in str(value).splitlines() if item.strip()]
            display = "\n".join(labels.get(item, item) for item in selected_ids)
        elif isinstance(value, (dict, list, tuple)):
            display = json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2)
        else:
            display = str(value).strip() if value not in (None, "") else "Sin respuesta"
        rows.append({"id": field["id"], "label": field["label"], "value": display})
    return rows


def audit_form_record_export(session: Session, *, user: User, project: Project, record: FormRecord,
                             format_name: str, signatures_valid: bool, signature_count: int, document_hash: str) -> None:
    audit(session, project_id=project.id, actor_id=user.id, action="form_record_exported",
          entity_type="form_record", entity_id=record.id,
          detail={"format": format_name, "version": record.version,
                  "signatures_valid": signatures_valid, "signature_count": signature_count,
                  "document_sha256": document_hash})
    session.commit()


@app.get("/records/{record_id}/export", response_class=HTMLResponse)
def export_form_record(record_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    record = session.get(FormRecord, record_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, _role = authorize_project(session, record.project_id, user)
    form_spec = FORM_BY_CODE.get(record.form_code)
    if not form_spec:
        raise HTTPException(409, "No se encuentra el formato fuente asociado a este registro.")
    all_signatures = list(session.scalars(select(FormSignature).where(FormSignature.record_id == record.id).order_by(FormSignature.signed_at)))
    evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record.id).order_by(EvidenceFile.created_at)))
    document_hash = form_record_document_sha256(project, record, evidence)
    current_signatures = [row for row in all_signatures if row.record_version == record.version and row.document_sha256 == document_hash and record_source_review_current(session, record)]
    signatures_valid = record_source_review_current(session, record)
    signatures = current_signatures
    audit_form_record_export(session, user=user, project=project, record=record, format_name="html",
                             signatures_valid=signatures_valid, signature_count=len(signatures), document_hash=document_hash)
    filename = f"GREENATICS_RED_{project.slug}_{record.form_code.lower()}_v{record.version}.html"
    return templates.TemplateResponse(request=request, name="record_print.html", context={
        "request": request, "project": project, "record": record, "form_spec": form_spec,
        "fields": record_export_fields(session, project, record, form_spec, evidence), "signatures": signatures,
        "signatures_valid": signatures_valid,
        "has_prior_signatures": len(all_signatures) > len(current_signatures),
        "status_label": record_status_label(session, record), "document_hash": document_hash,
    }, headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@app.get("/records/{record_id}/export.pdf")
def export_form_record_pdf(record_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    record = session.get(FormRecord, record_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, _role = authorize_project(session, record.project_id, user)
    form_spec = FORM_BY_CODE.get(record.form_code)
    if not form_spec:
        raise HTTPException(409, "No se encuentra el formato fuente asociado a este registro.")
    all_signatures = list(session.scalars(select(FormSignature).where(FormSignature.record_id == record.id).order_by(FormSignature.signed_at)))
    evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record.id).order_by(EvidenceFile.created_at)))
    document_hash = form_record_document_sha256(project, record, evidence)
    current_signatures = [row for row in all_signatures if row.record_version == record.version and row.document_sha256 == document_hash and record_source_review_current(session, record)]
    signatures_valid = record_source_review_current(session, record)
    signatures = current_signatures
    audit_form_record_export(session, user=user, project=project, record=record, format_name="pdf",
                             signatures_valid=signatures_valid, signature_count=len(signatures), document_hash=document_hash)
    pdf = build_form_record_pdf(project=project, record=record, form_spec=form_spec,
                                fields=[(row["label"], row["value"]) for row in record_export_fields(session, project, record, form_spec, evidence)],
                                signatures=signatures, signature_hash=document_hash, signatures_valid=signatures_valid,
                                has_prior_signatures=len(all_signatures) > len(current_signatures),
                                status_label=record_status_label(session, record))
    filename = f"GREENATICS_RED_{project.slug}_{record.form_code.lower()}_v{record.version}.pdf"
    return Response(content=pdf, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Cache-Control": "no-store, max-age=0", "Pragma": "no-cache", "X-Content-Type-Options": "nosniff",
    })


@app.get("/records/{record_id}/export.docx")
def export_form_record_docx(record_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    record = session.get(FormRecord, record_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, _role = authorize_project(session, record.project_id, user)
    form_spec = FORM_BY_CODE.get(record.form_code)
    if not form_spec:
        raise HTTPException(409, "No se encuentra el formato fuente asociado a este registro.")
    all_signatures = list(session.scalars(select(FormSignature).where(
        FormSignature.record_id == record.id,
    ).order_by(FormSignature.signed_at)))
    evidence = list(session.scalars(select(EvidenceFile).where(
        EvidenceFile.record_id == record.id,
    ).order_by(EvidenceFile.created_at)))
    document_hash = form_record_document_sha256(project, record, evidence)
    current_signatures = [
        row for row in all_signatures
        if row.record_version == record.version and row.document_sha256 == document_hash and record_source_review_current(session, record)
    ]
    signatures_valid = record_source_review_current(session, record)
    audit_form_record_export(
        session, user=user, project=project, record=record, format_name="docx",
        signatures_valid=signatures_valid, signature_count=len(current_signatures),
        document_hash=document_hash,
    )
    docx = build_form_record_docx(
        project=project, record=record, form_spec=form_spec,
        fields=record_export_fields(session, project, record, form_spec, evidence),
        signatures=current_signatures, signature_hash=document_hash,
        signatures_valid=signatures_valid,
        has_prior_signatures=len(all_signatures) > len(current_signatures),
        status_label=record_status_label(session, record),
    )
    filename = f"GREENATICS_RED_{project.slug}_{record.form_code.lower()}_v{record.version}.docx"
    return Response(content=docx, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Cache-Control": "no-store, max-age=0", "Pragma": "no-cache", "X-Content-Type-Options": "nosniff",
    })


@app.post("/records/{record_id}/sign")
def sign_form_record(
    record_id: str, request: Request, csrf: str = Form(...), signature_strokes: str = Form(...),
    expected_version: int = Form(..., ge=1), expected_document_sha256: str = Form(...),
    confirm_signature: str = Form(...), password: str = Form(...), session: Session = Depends(get_db),
):
    user = current_user(request, session)
    record = session.get(FormRecord, record_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, role = authorize_project(session, record.project_id, user, write=True)
    if role == "lector" or (not can_write_form(role, record.form_code) and role != "revisor"):
        raise HTTPException(403, "Tu perfil no permite firmar constancias para este formulario.")
    if record.form_code == "P-12":
        raise HTTPException(409, "El control documental P-12 se firma desde la versión PMIRS correspondiente.")
    require_project_visit_authorization_for_form(session, project, record.form_code)
    check_csrf(request, csrf)
    if confirm_signature != "yes":
        raise HTTPException(422, "Confirma la constancia antes de guardar la firma.")
    verify_signature_password(session, user, password)
    if len(signature_strokes) > 30000:
        raise HTTPException(413, "La firma excede el tamaño permitido. Vuelve a dibujarla en el recuadro.")
    lock_document_context(session, project)
    claimed = session.execute(update(FormRecord).where(FormRecord.id == record.id, FormRecord.project_id == project.id,
        FormRecord.version == expected_version).values(version=FormRecord.version).execution_options(synchronize_session=False))
    if claimed.rowcount != 1:
        session.rollback()
        raise HTTPException(409, "El registro cambió; actualiza la pantalla antes de firmar.")
    session.refresh(record)
    if not record_source_review_current(session, record):
        raise HTTPException(409, "La revisión de las fracciones no está vinculada a la versión vigente del pesaje fuente. Edita y reenvía a QA/QC antes de firmar.")
    current_evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record.id)))
    document_snapshot = form_record_document_snapshot(project, record, current_evidence)
    current_document_hash = form_record_snapshot_sha256(document_snapshot)
    check_document_hash(expected_document_sha256, current_document_hash)
    existing = session.scalar(select(FormSignature).where(
        FormSignature.record_id == record.id, FormSignature.signer_user_id == user.id,
        FormSignature.document_sha256 == current_document_hash,
    ))
    if existing:
        raise HTTPException(409, "Ya existe tu constancia para esta versión del registro.")
    signature = FormSignature(
        id=new_id(), project_id=project.id, record_id=record.id, record_version=record.version,
        signer_user_id=user.id, signer_name=user.full_name, signer_email=user.email, signer_role=role,
        declaration="Confirmo mi identidad y autorizo guardar este trazo, mi nombre, correo y fecha como constancia personal de participación en la captura o revisión de esta versión del registro. No certifica por sí sola la exactitud técnica, no acredita representación legal ni equivale a aprobación de autoridad.",
        signature_path=signature_svg_path(signature_strokes), document_sha256=current_document_hash,
        document_snapshot=document_snapshot, snapshot_status="verified",
    )
    session.add(signature)
    audit(session, project_id=project.id, actor_id=user.id, action="form_record_signed", entity_type="form_record", entity_id=record.id,
          detail={"signature_id": signature.id, "record_version": record.version, "document_sha256": signature.document_sha256, "signer_role": role})
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, "Ya existe una constancia para tu usuario y esta versión del registro.")
    return RedirectResponse(f"/records/{record.id}?notice=Constancia%20guardada%20para%20la%20versi%C3%B3n%20{record.version}", status_code=303)


@app.post("/records/{record_id}/edit")
async def update_record(record_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    record = session.get(FormRecord, record_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, role = authorize_project(session, record.project_id, user, write=True)
    if record.form_code == "P-12":
        raise HTTPException(409, "P-12 es un control de solo lectura alimentado por PMIRS Studio.")
    authorize_form_write(role, record.form_code)
    require_project_visit_authorization_for_form(session, project, record.form_code)
    form = await request.form()
    check_csrf(request, str(form.get("csrf", "")))
    submission_key = str(form.get("submission_key", "")).strip()
    if submission_key and not re.fullmatch(r"[A-Za-z0-9_-]{32,64}", submission_key):
        raise HTTPException(422, "La clave de esta edición no es válida. Abre el formulario de nuevo.")
    if submission_key:
        prior_revision = session.scalar(select(FormRevision).where(FormRevision.submission_key == submission_key))
        if prior_revision:
            if prior_revision.record_id != record.id or prior_revision.changed_by != user.id:
                raise HTTPException(409, "La clave de esta edición ya se usó para otro cambio.")
            return RedirectResponse(
                f"/records/{record.id}?notice=Este%20cambio%20ya%20se%20guard%C3%B3",
                status_code=303,
            )
    form_spec = FORM_BY_CODE[record.form_code]
    uploads = form_field_uploads(form, form_spec, include_general=True)
    uploaded_field_ids = evidence_field_ids(session, record.id) | {
        field_id for field_id, _upload in uploads if field_id is not None
    }
    payload = apply_server_managed_fields(
        record.form_code,
        _record_payload(
            form, form_spec,
            editable_field_ids=form_editable_field_ids(role, record.form_code),
            existing_payload=record.payload or {},
        ),
        timestamp=record.created_at,
        session=session,
        project_id=project.id,
        existing_payload=record.payload or {},
        record_id=record.id,
        actor_id=user.id,
    )
    action = str(form.get("action", "draft"))
    if action not in {"draft", "submit"}:
        raise HTTPException(422, "Selecciona si quieres guardar borrador o enviar a revisión.")
    source_note = str(form.get("source_note", record.source_note)).strip()[:2000]
    errors = submission_errors(form_spec, payload, source_note, uploaded_field_ids) if action == "submit" else []
    if action == "draft" and record.form_code == "D-04":
        limit_error = d04_container_limit_error(payload.get(D04_CONTAINER_FIELD))
        if limit_error:
            errors.append(limit_error)
    if action == "draft":
        errors.extend(
            error for field_id in REPEATABLE_FIELD_SPECS
            if (error := repeatable_field_limit_error(payload.get(field_id), field_id))
        )
    if record.form_code == "D-08":
        source_id = str(payload.get("D08-001", "")).strip()
        if source_id and not d08_source_record(session, project.id, source_id):
            errors.append("El D-07 seleccionado no existe o pertenece a otro expediente; vuelve a elegir el pesaje.")
        if action == "submit":
            errors.extend(d08_submission_errors(session, project.id, payload, record_id=record.id))
    if record.form_code == "D-07" and action == "submit":
        errors.extend(d07_submission_errors(session, project.id, payload))
    errors.extend(relation_selection_errors(session, project.id, form_spec, payload))
    if record.form_code == "P-15":
        errors.extend(p15_measurement_errors(session, project.id, payload))
    if errors:
        error_heading = "No se puede guardar este vínculo:" if action == "draft" else "No se puede enviar a revisión todavía:"
        error_items = errors[:8]
        error_note = "Los archivos no se guardaron; selecciónalos de nuevo." if uploads else ""
        record.payload = payload
        record.title = str(form.get("record_title", record.title)).strip()[:300] or form_spec["title"]
        record.record_date = str(form.get("record_date", record.record_date)).strip()[:10]
        record.source_kind = str(form.get("source_kind", record.source_kind))
        record.source_note = source_note
        return templates.TemplateResponse(request=request, name="record_form.html", status_code=422, context=page_context(
            request, project=project, form_spec=form_spec, record=record, submission_key=submission_key,
            error=error_heading + " " + "; ".join(error_items) + (" " + error_note if error_note else ""),
            error_heading=error_heading,
            error_items=error_items,
            error_targets=record_form_error_targets(form_spec, error_items),
            error_note=error_note,
            notice="",
            relation_options=d08_relation_options(session, project.id, record.id) if record.form_code == "D-08" else [],
            relation_options_by_field=relation_options_by_field(session, project.id, record.form_code, record.id),
            evidence_by_field=evidence_by_field(list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record.id)))),
            read_only_field_ids=form_read_only_field_ids(role, record.form_code),
            subtable_rows=d04_container_rows(payload.get(D04_CONTAINER_FIELD)),
            subtable_legacy=d04_container_is_legacy(payload.get(D04_CONTAINER_FIELD)),
            repeatable_rows_by_field=repeatable_field_rows_by_form(payload, form_spec),
            **multi_select_context_by_form(payload, form_spec),
        ))
    if action == "submit" and record.form_code.startswith("P-") and project.baseline_status != "validada":
        record.payload = payload
        record.title = str(form.get("record_title", record.title)).strip()[:300] or form_spec["title"]
        record.record_date = str(form.get("record_date", record.record_date)).strip()[:10]
        record.source_kind = str(form.get("source_kind", record.source_kind))
        record.source_note = str(form.get("source_note", record.source_note)).strip()[:2000]
        return templates.TemplateResponse(request=request, name="record_form.html", status_code=422, context=page_context(
            request, project=project, form_spec=form_spec, record=record, submission_key=submission_key,
            error="Los formularios PMIRS pueden guardarse como borrador; para enviarlos a revisión primero debe aprobarse una Línea Base trazable.", notice="",
            relation_options=[],
            relation_options_by_field=relation_options_by_field(session, project.id, record.form_code, record.id),
            evidence_by_field=evidence_by_field(list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record.id)))),
            read_only_field_ids=form_read_only_field_ids(role, record.form_code),
            subtable_rows=d04_container_rows(payload.get(D04_CONTAINER_FIELD)),
            subtable_legacy=d04_container_is_legacy(payload.get(D04_CONTAINER_FIELD)),
            repeatable_rows_by_field=repeatable_field_rows_by_form(payload, form_spec),
            **multi_select_context_by_form(payload, form_spec),
        ))
    previous_status = record.status
    previous_source_id = str((record.payload or {}).get("D08-001", "")).strip() if record.form_code == "D-08" else ""
    previous_shift_id = str((record.payload or {}).get("D07-001", "")).strip() if record.form_code == "D-07" else ""
    previous_d06_visit_id = str((record.payload or {}).get("D06-009", "")).strip() if record.form_code == "D-06" else ""
    previous_shift_ids = {previous_shift_id} if previous_shift_id else set()
    if previous_source_id:
        previous_source = d08_source_record(session, project.id, previous_source_id)
        previous_source_shift_id = str((previous_source.payload or {}).get("D07-001", "")).strip() if previous_source else ""
        if previous_source_shift_id:
            previous_shift_ids.add(previous_source_shift_id)
    lock_document_context(session, project)
    session.refresh(record)
    previous_d14_visit_ids = d14_visit_ids_for_record(session, project.id, record)
    if record.form_code in {"D-01", "D-02", "D-06", "D-07", "D-08", "Q-01"} and project.baseline_status == "validada":
        invalidate_project_baseline(
            session, project, actor_id=user.id,
            reason="Se abrió una nueva versión de un registro de soporte; la Línea Base requiere revisión nuevamente.",
            detail={"source": "edición de registro de soporte", "form_code": record.form_code},
        )
    record.payload = payload
    record.title = str(form.get("record_title", record.title)).strip()[:300] or form_spec["title"]
    record.record_date = str(form.get("record_date", record.record_date)).strip()[:10]
    source_kind = str(form.get("source_kind", record.source_kind))
    record.source_kind = source_kind if source_kind in ALLOWED_SOURCE_KINDS else "declarado"
    record.source_note = str(form.get("source_note", record.source_note)).strip()[:2000]
    record.version += 1
    record.updated_by = user.id
    record.updated_at = now_utc()
    record.reviewed_by = None
    record.reviewed_at = None
    record.review_note = ""
    record.status = "PENDING_REVIEW" if action == "submit" else "RAW"
    session.flush()
    if record.form_code == "D-13":
        invalidate_equipment_measurements(
            session, project.id, record.id, user.id,
            "El registro de equipo D-13 cambió; vuelve a revisar el pesaje y sus fracciones asociadas.",
        )
    written_keys: list[str] = []
    try:
        file_rows, written_keys = await persist_field_uploads(
            uploads, project_id=project.id, record_id=record.id, actor_id=user.id, session=session,
        )
        session.add_all(file_rows)
        for evidence in file_rows:
            audit(session, project_id=project.id, actor_id=user.id, action="evidence_uploaded", entity_type="evidence_file", entity_id=evidence.id, detail={"record_id": record.id, "field_id": evidence.field_id, "name": evidence.original_name, "size_bytes": evidence.size_bytes, "sha256": evidence.sha256})
    except Exception:
        session.rollback()
        cleanup_storage_objects(written_keys)
        raise
    if record.form_code == "D-08":
        source_ids = {source_id for source_id in (previous_source_id, str(payload.get("D08-001", "")).strip()) if source_id}
        for source_id in source_ids:
            recalculate_d08_group(session, source_id, project_id=project.id, actor_id=user.id, skip_record_id=record.id)
            source = d08_source_record(session, project.id, source_id)
            if source:
                recalculate_q01_for_shift(
                    session, str((source.payload or {}).get("D07-001", "")).strip(),
                    project_id=project.id, actor_id=user.id,
                )
        payload = record.payload
    elif record.form_code == "D-07":
        recalculate_d08_group(session, record.id, project_id=project.id, actor_id=user.id)
        shift_ids = {previous_shift_id, str(payload.get("D07-001", "")).strip()}
        for shift_id in shift_ids:
            recalculate_q01_for_shift(session, shift_id, project_id=project.id, actor_id=user.id)
    elif record.form_code == "D-06":
        recalculate_q01_for_shift(
            session, record.id, project_id=project.id, actor_id=user.id,
            additional_context_ids={previous_d06_visit_id} if previous_d06_visit_id else set(),
        )
    if record.form_code in {"D-03", "D-06", "D-07", "D-08", "D-12"}:
        current_d14_visit_ids = d14_visit_ids_for_record(session, project.id, record)
        for visit_id in previous_d14_visit_ids | current_d14_visit_ids:
            recalculate_d14_for_visit(session, visit_id, project_id=project.id, actor_id=user.id)
        q01_context_ids = q01_context_ids_for_record(session, project.id, record)
        if record.form_code == "D-06" and previous_d06_visit_id:
            q01_context_ids.add(previous_d06_visit_id)
        if record.form_code in {"D-07", "D-08"}:
            q01_context_ids.update(previous_shift_ids)
        for visit_id in previous_d14_visit_ids:
            q01_context_ids.update(q01_context_ids_for_visit(session, project.id, visit_id))
        recalculate_q01_for_context_ids(
            session, q01_context_ids, project_id=project.id, actor_id=user.id,
        )
    session.add(FormRevision(
        record_id=record.id, revision=record.version, payload=payload,
        note=f"Edición; estado anterior: {previous_status}", submission_key=submission_key or None,
        changed_by=user.id,
    ))
    audit(session, project_id=project.id, actor_id=user.id, action="record_updated", entity_type="form_record", entity_id=record.id, detail={"version": record.version, "from_status": previous_status, "to_status": record.status})
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        cleanup_storage_objects(written_keys)
        if submission_key:
            prior_revision = session.scalar(select(FormRevision).where(FormRevision.submission_key == submission_key))
            if prior_revision and prior_revision.record_id == record_id and prior_revision.changed_by == user.id:
                return RedirectResponse(
                    f"/records/{record_id}?notice=Este%20cambio%20ya%20se%20guard%C3%B3",
                    status_code=303,
                )
        raise
    except Exception:
        session.rollback()
        cleanup_storage_objects(written_keys)
        raise
    return RedirectResponse(f"/records/{record.id}?notice=Versi%C3%B3n%20guardada", status_code=303)


@app.post("/records/{record_id}/review")
def review_record(
    record_id: str,
    request: Request,
    csrf: str = Form(...),
    expected_version: int = Form(..., ge=1),
    expected_document_sha256: str = Form(...),
    decision: str = Form(...),
    reason: str = Form(...),
    equipment_review_confirmed: str = Form(""),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    record = session.get(FormRecord, record_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, role = authorize_project(session, record.project_id, user, write=True)
    if record.form_code == "P-12":
        raise HTTPException(409, "El control P-12 se revisa desde los estados de versión de PMIRS Studio.")
    if not user.is_platform_admin and role != "revisor":
        raise HTTPException(403, "La decisión QA/QC requiere rol revisor.")
    check_csrf(request, csrf)
    if record.version != expected_version:
        raise HTTPException(409, "El registro cambió desde que abriste esta página. Actualiza el registro y revisa la versión vigente antes de decidir.")
    if decision not in {"VALIDATED", "CORRECTION_REQUESTED"} or len(reason.strip()) < 4:
        raise HTTPException(422, "Selecciona una decisión y registra el criterio de revisión.")
    if record.status not in {"PENDING_REVIEW", "CORRECTION_REQUESTED"}:
        raise HTTPException(409, "Solo se pueden revisar registros enviados a revisión o con correcciones solicitadas.")
    if record.form_code == "D-13" and decision == "VALIDATED" and equipment_review_confirmed != "yes":
        message = "Confirma la revisión del método, el estado y el soporte de aplicabilidad antes de validar D-13."
        return RedirectResponse(f"/records/{record.id}?error={quote(message, safe='')}", status_code=303)
    if record.form_code == "D-13" and decision == "VALIDATED":
        metrology_note = str((record.payload or {}).get("D13-009", "")).strip()
        if len(metrology_note) < 20:
            message = "D13-009 debe registrar la decisión de aplicabilidad metrológica, su fuente/fecha y la referencia del soporte (mínimo 20 caracteres). Si falta, solicita la corrección antes de aceptar el equipo."
            return RedirectResponse(f"/records/{record.id}?error={quote(message, safe='')}", status_code=303)
    if decision == "VALIDATED":
        errors = submission_errors(
            FORM_BY_CODE[record.form_code], record.payload or {}, record.source_note,
            evidence_field_ids(session, record.id),
        )
        if record.form_code == "D-08":
            errors.extend(d08_submission_errors(session, project.id, record.payload or {}, record_id=record.id))
        if record.form_code == "D-07":
            errors.extend(d07_submission_errors(session, project.id, record.payload or {}))
        if errors:
            message = "No se puede validar este registro: " + "; ".join(errors[:8])
            return RedirectResponse(f"/records/{record.id}?error={quote(message, safe='')}", status_code=303)
    if record.form_code.startswith("P-") and decision == "VALIDATED" and project.baseline_status != "validada":
        raise HTTPException(422, "No se puede validar un objeto PMIRS mientras su Línea Base no esté aceptada.")
    old_status = record.status
    # Claim the reviewed revision before Q-01 attribution or dependent updates.
    # Concurrent content changes and other decisions must not be overwritten.
    lock_document_context(session, project)
    session.refresh(record)
    if record.form_code.startswith("P-") and decision == "VALIDATED":
        check_current_document_baseline(session, project)
    inspected_evidence = list(session.scalars(select(EvidenceFile).where(EvidenceFile.record_id == record.id)))
    check_document_hash(expected_document_sha256, form_record_document_sha256(project, record, inspected_evidence))
    result = session.execute(
        update(FormRecord).where(
            FormRecord.id == record.id,
            FormRecord.project_id == project.id,
            FormRecord.version == expected_version,
            FormRecord.status == old_status,
        ).values(
            status=decision, review_note=reason.strip()[:2000],
            reviewed_by=user.id, reviewed_at=now_utc(),
        ).execution_options(synchronize_session=False)
    )
    if result.rowcount != 1:
        session.rollback()
        raise HTTPException(409, "El registro cambió durante la revisión. Actualiza el registro y revisa la versión vigente antes de decidir.")
    session.refresh(record)
    if record.form_code == "Q-01":
        reviewer_value = f"{user.full_name} ({user.email})"[:400]
        old_payload = dict(record.payload or {})
        if str(old_payload.get("Q01-011", "")) != reviewer_value:
            record.payload = {**old_payload, "Q01-011": reviewer_value}
            record.version += 1
            record.updated_by = user.id
            record.updated_at = now_utc()
            session.add(FormRevision(
                record_id=record.id, revision=record.version, payload=dict(record.payload),
                note="RED registró el revisor responsable de la decisión QA/QC.", changed_by=user.id,
            ))
    if record.form_code == "D-13" and decision != "VALIDATED":
        invalidate_equipment_measurements(
            session, project.id, record.id, user.id,
            "El D-13 fue devuelto para corrección; el pesaje y sus fracciones vinculadas requieren nueva revisión.",
        )
    if record.form_code in {"D-03", "D-06", "D-07", "D-08", "D-12"}:
        for visit_id in d14_visit_ids_for_record(session, project.id, record):
            recalculate_d14_for_visit(session, visit_id, project_id=project.id, actor_id=user.id)
        recalculate_q01_for_context_ids(
            session, q01_context_ids_for_record(session, project.id, record),
            project_id=project.id, actor_id=user.id,
        )
    if record.form_code == "D-07":
        session.flush()
        recalculate_d08_group(session, record.id, project_id=project.id, actor_id=user.id)
        recalculate_q01_for_shift(
            session, str((record.payload or {}).get("D07-001", "")).strip(),
            project_id=project.id, actor_id=user.id,
        )
    elif record.form_code == "D-08":
        source = d08_source_record(session, project.id, str((record.payload or {}).get("D08-001", "")).strip())
        if source:
            recalculate_q01_for_shift(
                session, str((source.payload or {}).get("D07-001", "")).strip(),
                project_id=project.id, actor_id=user.id,
            )
    audit(session, project_id=project.id, actor_id=user.id, action="qa_decision", entity_type="form_record", entity_id=record.id, detail={"from_status": old_status, "to_status": decision, "reason": record.review_note, "version": record.version, "source_version": expected_version})
    if old_status == "VALIDATED" and decision != "VALIDATED" and record.form_code in {"D-01", "D-02", "D-06", "D-07", "D-08", "Q-01"} and project.baseline_status == "validada":
        invalidate_project_baseline(
            session, project, actor_id=user.id,
            reason="La revisión de un registro de soporte cambió; se requiere reevaluar la Línea Base.",
            detail={"source": "cambio de revisión QA/QC", "form_code": record.form_code},
        )
    session.commit()
    return RedirectResponse(f"/records/{record.id}?notice=Decisi%C3%B3n%20de%20revisi%C3%B3n%20guardada", status_code=303)


@app.post("/records/{record_id}/evidence")
async def upload_evidence(
    record_id: str,
    request: Request,
    csrf: str = Form(...),
    file: UploadFile = File(...),
    submission_key: str = Form(""),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    record = session.scalar(
        select(FormRecord).where(FormRecord.id == record_id).with_for_update()
    )
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, role = authorize_project(session, record.project_id, user, write=True)
    require_project_visit_authorization_for_form(session, project, record.form_code)
    if not can_add_evidence(role, record.form_code):
        raise HTTPException(status_code=403, detail="Tu rol no permite adjuntar evidencia a este formulario.")
    check_csrf(request, csrf)
    submission_key = submission_key.strip()
    if submission_key and not re.fullmatch(r"[A-Za-z0-9_-]{32,64}", submission_key):
        raise HTTPException(422, "La clave de envío de evidencia no es válida.")
    if record.status != "RAW":
        raise HTTPException(
            status_code=409,
            detail="La evidencia solo se adjunta directamente a un borrador. Para cambiar el soporte de un registro revisado, edita una nueva versión y envíala a QA/QC.",
        )
    original = str(file.filename or "evidencia").replace("\\", "/").rsplit("/", 1)[-1]
    original = "".join(character for character in original if character.isprintable() and character not in "\r\n\t")
    original = original.strip(" .")[:255] or "evidencia"
    extension = Path(original).suffix.lower()
    if extension not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(415, "Formato no permitido. Usa PDF, JPG/JPEG, PNG, HEIC/HEIF, DOCX, XLSX, CSV o TXT.")
    storage_name = f"{new_id()}{extension}"
    storage_key = f"evidence/{storage_name}"
    digest = hashlib.sha256()
    size = 0
    limit = settings.max_upload_mb * 1024 * 1024
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(prefix="greenatics-red-evidence-", suffix=extension, delete=False) as output:
            temporary_path = Path(output.name)
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > limit:
                    raise HTTPException(413, f"El archivo supera el límite de {settings.max_upload_mb} MB.")
                digest.update(chunk)
                output.write(chunk)
        if size == 0:
            raise HTTPException(422, "El archivo está vacío.")
        media_type = upload_media_type_or_422(temporary_path, extension)
        content_sha256 = digest.hexdigest()
        replay = replay_evidence_submission(
            session, submission_key, project_id=project.id, actor_id=user.id,
            original_name=original, sha256=content_sha256, record_id=record.id,
        )
        if replay:
            return replay
        try:
            lock_and_check_evidence_capacity(
                session, project_id=project.id, incoming_bytes=size,
                total_limit_bytes=settings.max_evidence_total_mb * 1024 * 1024,
                project_limit_bytes=settings.max_evidence_project_mb * 1024 * 1024,
            )
        except ValueError as exc:
            raise HTTPException(413, str(exc)) from exc
        storage.put_file(storage_key, temporary_path, media_type)
    except Exception:
        cleanup_storage_objects([storage_key])
        raise
    finally:
        if temporary_path:
            temporary_path.unlink(missing_ok=True)
        await file.close()
    evidence = EvidenceFile(
        project_id=project.id, record_id=record.id, original_name=original[:255],
        storage_name=storage_name, media_type=media_type,
        size_bytes=size, sha256=content_sha256, submission_key=submission_key or None,
        created_by=user.id,
    )
    try:
        session.add(evidence)
        session.flush()
        audit(session, project_id=project.id, actor_id=user.id, action="evidence_uploaded", entity_type="evidence_file", entity_id=evidence.id, detail={"record_id": record.id, "name": evidence.original_name, "size_bytes": size, "sha256": evidence.sha256})
        for visit_id in d14_visit_ids_for_record(session, project.id, record):
            recalculate_d14_for_visit(session, visit_id, project_id=project.id, actor_id=user.id)
        recalculate_q01_for_context_ids(
            session, q01_context_ids_for_record(session, project.id, record),
            project_id=project.id, actor_id=user.id,
        )
        session.commit()
    except IntegrityError:
        session.rollback()
        cleanup_storage_objects([storage_key])
        replay = replay_evidence_submission(
            session, submission_key, project_id=project.id, actor_id=user.id,
            original_name=original[:255], sha256=content_sha256, record_id=record.id,
        )
        if replay:
            return replay
        raise
    except Exception:
        session.rollback()
        cleanup_storage_objects([storage_key])
        raise
    return RedirectResponse(f"/records/{record.id}?notice=Evidencia%20adjuntada", status_code=303)


@app.get("/evidence/{evidence_id}")
def download_evidence(evidence_id: str, request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    evidence = session.get(EvidenceFile, evidence_id)
    if not evidence:
        raise HTTPException(404, "Evidencia no encontrada.")
    _project, role = authorize_project(session, evidence.project_id, user)
    if evidence.record_id and evidence.pmirs_item_id:
        raise HTTPException(404, "Evidencia no encontrada.")
    if evidence.record_id:
        record = session.get(FormRecord, evidence.record_id)
        if not record or record.project_id != evidence.project_id:
            raise HTTPException(404, "Evidencia no encontrada.")
    if evidence.pmirs_item_id:
        pmirs_item = session.get(PMIRSItem, evidence.pmirs_item_id)
        if not pmirs_item or pmirs_item.project_id != evidence.project_id:
            raise HTTPException(404, "Evidencia no encontrada.")
        if role == "campo" and not can_upload_pmirs_evidence(pmirs_item, role, user.id):
            raise HTTPException(404, "Evidencia no encontrada.")
    reference = session.scalar(select(OperationalReference).where(OperationalReference.evidence_id == evidence.id))
    if reference and reference.project_id != evidence.project_id:
        raise HTTPException(404, "Evidencia no encontrada.")
    if reference and reference.status != "aprobada" and not (
        user.is_platform_admin or role in {"admin", "consultor", "revisor"} or reference.created_by == user.id
    ):
        raise HTTPException(404, "El documento operativo no está disponible para este perfil.")
    storage_key = f"evidence/{evidence.storage_name}"
    if not storage.exists(storage_key):
        raise HTTPException(404, "El archivo no está disponible en el almacenamiento configurado.")
    audit(
        session, project_id=evidence.project_id, actor_id=user.id,
        action="operational_reference_downloaded" if reference else "evidence_download_authorized",
        entity_type="operational_reference" if reference else "evidence_file",
        entity_id=reference.id if reference else evidence.id,
        detail={"name": evidence.original_name, "size_bytes": evidence.size_bytes, "sha256": evidence.sha256},
    )
    session.commit()
    if storage.remote:
        response = RedirectResponse(
            storage.presigned_download_url(storage_key, evidence.original_name),
            status_code=302,
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Cache-Control"] = "private, no-store"
        response.headers["Referrer-Policy"] = "no-referrer"
        return response
    path = storage.local_path(storage_key)
    if not path or not path.is_file():
        raise HTTPException(404, "El archivo no está disponible en el almacenamiento configurado.")
    response = FileResponse(path, media_type="application/octet-stream", filename=evidence.original_name)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "private, no-store"
    return response


@app.post("/evidence/{evidence_id}/delete")
def delete_record_evidence(
    evidence_id: str,
    request: Request,
    csrf: str = Form(...),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    evidence = session.get(EvidenceFile, evidence_id)
    if not evidence or not evidence.record_id:
        raise HTTPException(404, "Evidencia de formulario no encontrada.")
    record = session.get(FormRecord, evidence.record_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado.")
    project, role = authorize_project(session, record.project_id, user, write=True)
    check_csrf(request, csrf)
    lock_document_context(session, project)
    session.refresh(record)
    session.refresh(evidence)
    if evidence.project_id != project.id:
        raise HTTPException(404, "Evidencia de formulario no encontrada.")
    if not can_remove_record_evidence(evidence, record, user, role):
        if record.status == "VALIDATED":
            raise HTTPException(409, "El registro ya está validado. Crea una nueva versión y envíala a revisión antes de retirar evidencia.")
        raise HTTPException(403, "Tu rol no permite retirar esta evidencia.")

    storage_key = f"evidence/{evidence.storage_name}"
    quarantined_key = storage.quarantine(storage_key)
    session.delete(evidence)
    audit(
        session, project_id=project.id, actor_id=user.id,
        action="evidence_removed", entity_type="evidence_file", entity_id=evidence.id,
        detail={
            "record_id": record.id, "field_id": evidence.field_id,
            "name": evidence.original_name, "size_bytes": evidence.size_bytes,
            "sha256": evidence.sha256, "reason": "Retiro manual desde la ficha del registro.",
        },
    )
    for visit_id in d14_visit_ids_for_record(session, project.id, record):
        recalculate_d14_for_visit(session, visit_id, project_id=project.id, actor_id=user.id)
    recalculate_q01_for_context_ids(
        session, q01_context_ids_for_record(session, project.id, record),
        project_id=project.id, actor_id=user.id,
    )
    try:
        session.commit()
    except Exception:
        session.rollback()
        try:
            storage.restore_quarantined(quarantined_key, storage_key)
        except Exception:
            logger.exception("No se pudo restaurar la evidencia %s tras fallar su retiro", evidence.id)
        raise
    if quarantined_key:
        try:
            storage.delete(quarantined_key)
        except Exception:
            logger.exception("No se pudo purgar la evidencia retirada %s", evidence.id)
    return RedirectResponse(f"/records/{record.id}?notice=Evidencia%20retirada", status_code=303)


@app.get("/admin/users", response_class=HTMLResponse)
def admin_users_page(request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    platform_admin(user)
    return admin_users_response(request, session, notice=safe_notice(request))


def admin_users_response(
    request: Request,
    session: Session,
    *,
    invite_link: str = "",
    reset_link: str = "",
    notice: str = "",
    error: str = "",
    status_code: int = 200,
):
    users = list(session.scalars(select(User).order_by(User.full_name)))
    projects = sorted(session.scalars(select(Project)), key=project_order_key)
    memberships = list(session.scalars(select(ProjectMembership)))
    invitations = list(session.scalars(select(Invitation).where(
        Invitation.accepted_at.is_(None), Invitation.expires_at > now_utc(),
    ).order_by(Invitation.created_at.desc())))
    return templates.TemplateResponse(request=request, name="admin_users.html", status_code=status_code, context=page_context(
        request, users=users, projects=projects, memberships=memberships, invitations=invitations,
        drive_connection=drive.get_connection(session), invite_link=invite_link, reset_link=reset_link,
        notice=notice, error=error,
        project_roles=[
            {"value": role, "label": label, "description": PROJECT_MEMBERSHIP_ROLE_DESCRIPTIONS[role]}
            for role, label in PROJECT_MEMBERSHIP_ROLE_LABELS.items()
        ],
    ))


def privacy_cases_response(
    request: Request,
    session: Session,
    *,
    notice: str = "",
    error: str = "",
    status_code: int = 200,
    page: int = 1,
):
    page_size = 25
    total_cases = session.scalar(select(func.count(PrivacyCase.id))) or 0
    page_count = max(1, math.ceil(total_cases / page_size))
    page = min(page, page_count)
    cases = list(session.scalars(
        select(PrivacyCase)
        .order_by(PrivacyCase.created_at.desc(), PrivacyCase.id.desc())
        .limit(page_size)
        .offset((page - 1) * page_size)
    ))
    projects = sorted(session.scalars(select(Project)), key=project_order_key)
    admins = list(session.scalars(select(User).where(
        User.active.is_(True), User.is_platform_admin.is_(True),
    ).order_by(User.full_name)))
    case_ids = [case.id for case in cases]
    history_rows = list(session.scalars(select(AuditEvent).where(
        AuditEvent.entity_type == "privacy_case", AuditEvent.entity_id.in_(case_ids),
    ).order_by(AuditEvent.created_at.desc(), AuditEvent.id.desc()))) if case_ids else []
    history_actor_ids = {event.actor_id for event in history_rows}
    history_actor_names = dict(session.execute(select(User.id, User.full_name).where(
        User.id.in_(history_actor_ids),
    )).all()) if history_actor_ids else {}
    history_by_case: dict[str, list] = {}
    for event in history_rows:
        history_by_case.setdefault(event.entity_id, []).append(event)
    return templates.TemplateResponse(request=request, name="privacy_cases.html", status_code=status_code, context=page_context(
        request, cases=cases, projects=projects, admins=admins, case_types=CASE_TYPES,
        project_scopes=PROJECT_SCOPES, classifications=CLASSIFICATIONS,
        identity_states=IDENTITY_STATES, case_states=CASE_STATES,
        project_by_id={project.id: project for project in projects},
        admin_by_id={admin.id: admin for admin in admins},
        case_history_by_id=history_by_case, history_actor_names=history_actor_names,
        total_cases=total_cases, page=page, page_count=page_count,
        previous_page=page - 1 if page > 1 else None,
        next_page=page + 1 if page < page_count else None,
        notice=notice, error=error,
    ))


@app.get("/admin/privacy", response_class=HTMLResponse)
def admin_privacy_page(
    request: Request,
    page: int = Query(1, ge=1, le=100000),
    session: Session = Depends(get_db),
):
    actor = current_user(request, session)
    platform_admin(actor)
    return privacy_cases_response(request, session, notice=safe_notice(request), page=page)


@app.post("/admin/privacy")
def create_privacy_case(
    request: Request,
    csrf: str = Form(...),
    case_type: str = Form(...),
    project_scope: str = Form(...),
    project_id: str = Form(""),
    received_on: str = Form(...),
    external_reference: str = Form(""),
    owner_user_id: str = Form(""),
    session: Session = Depends(get_db),
):
    actor = current_user(request, session)
    platform_admin(actor)
    check_csrf(request, csrf)
    if not settings.operational_writes_enabled:
        raise HTTPException(503, "RED está en modo de solo lectura; no se guardó la solicitud.")
    try:
        received_date = date.fromisoformat(received_on)
    except ValueError:
        return privacy_cases_response(request, session, error="Indica una fecha válida de recepción.", status_code=422)
    selected_project = project_id.strip()
    if (
        case_type not in CASE_TYPES or project_scope not in PROJECT_SCOPES
        or not validate_opaque_reference(external_reference, maximum=160)
        or (project_scope == "un_proyecto" and not session.get(Project, selected_project))
        or (project_scope != "un_proyecto" and selected_project)
    ):
        return privacy_cases_response(request, session, error="Revisa el tipo, alcance, proyecto y referencia externa. Usa solo un código opaco; no ingreses nombres, correos, teléfonos ni el contenido de la solicitud.", status_code=422)
    selected_owner = owner_user_id.strip() or actor.id
    owner = session.scalar(select(User).where(
        User.id == selected_owner, User.active.is_(True), User.is_platform_admin.is_(True),
    ))
    if not owner:
        return privacy_cases_response(request, session, error="Asigna el caso a una cuenta activa de administración RED.", status_code=422)
    record = PrivacyCase(
        id=new_id(), case_type=case_type, project_scope=project_scope,
        project_id=selected_project if project_scope == "un_proyecto" else None,
        classification="pendiente", identity_status="pendiente", status="recibida",
        received_on=received_date.isoformat(), external_reference=external_reference.strip(),
        owner_user_id=owner.id, created_by=actor.id, updated_by=actor.id,
    )
    session.add(record)
    audit(session, project_id=record.project_id, actor_id=actor.id, action="privacy_case_created",
          entity_type="privacy_case", entity_id=record.id,
          detail={"case_type": case_type, "project_scope": project_scope})
    session.commit()
    return RedirectResponse("/admin/privacy?notice=Solicitud%20registrada%20sin%20datos%20de%20identidad", status_code=303)


@app.post("/admin/privacy/{case_id}")
def update_privacy_case(
    case_id: str,
    request: Request,
    csrf: str = Form(...),
    classification: str = Form(...),
    identity_status: str = Form(...),
    status: str = Form(...),
    owner_user_id: str = Form(...),
    target_response_on: str = Form(""),
    target_rule_reference: str = Form(""),
    response_on: str = Form(""),
    response_reference: str = Form(""),
    session: Session = Depends(get_db),
):
    actor = current_user(request, session)
    platform_admin(actor)
    check_csrf(request, csrf)
    if not settings.operational_writes_enabled:
        raise HTTPException(503, "RED está en modo de solo lectura; no se guardaron cambios.")
    record = session.get(PrivacyCase, case_id)
    if not record:
        raise HTTPException(404, "Solicitud de privacidad no encontrada.")
    owner = session.scalar(select(User).where(
        User.id == owner_user_id.strip(), User.active.is_(True), User.is_platform_admin.is_(True),
    ))
    if (
        classification not in CLASSIFICATIONS or identity_status not in IDENTITY_STATES
        or status not in CASE_STATES or not owner
        or not validate_opaque_reference(target_rule_reference, maximum=240)
        or not validate_opaque_reference(response_reference, maximum=160)
    ):
        return privacy_cases_response(request, session, error="Revisa clasificación, verificación, estado, responsable y referencias externas. No ingreses datos personales ni contenido de la respuesta.", status_code=422)
    if status != record.status and status not in CASE_TRANSITIONS.get(record.status, set()):
        return privacy_cases_response(request, session, error="Ese cambio de estado no está permitido desde el estado actual.", status_code=422)
    def optional_day(value: str) -> str | None:
        if not value:
            return ""
        try:
            return date.fromisoformat(value).isoformat()
        except ValueError:
            return None
    target_date = optional_day(target_response_on)
    response_date = optional_day(response_on)
    if target_date is None or response_date is None:
        return privacy_cases_response(request, session, error="Las fechas objetivo y de respuesta deben ser válidas.", status_code=422)
    target_reference = target_rule_reference.strip()
    response_ref = response_reference.strip()
    if bool(target_date) != bool(target_reference) or (target_date and classification == "pendiente"):
        return privacy_cases_response(request, session, error="Una fecha objetivo requiere clasificación humana y referencia de la regla o decisión que la sustenta. RED no calcula plazos legales.", status_code=422)
    if bool(response_date) != bool(response_ref):
        return privacy_cases_response(request, session, error="Registra conjuntamente la fecha y la referencia externa de la respuesta, o deja ambas vacías.", status_code=422)
    if status in {"respuesta_enviada", "cerrada"} and (
        identity_status not in {"verificada", "no_aplica"} or not response_date or not response_ref
    ):
        return privacy_cases_response(request, session, error="Para marcar una respuesta enviada o cerrar el caso, documenta fuera de RED la verificación (o su no aplicabilidad) y registra fecha y referencia externa de respuesta.", status_code=422)
    previous = {
        "status": record.status,
        "classification": record.classification,
        "identity_status": record.identity_status,
        "owner_user_id": record.owner_user_id,
        "target_response_on": record.target_response_on,
        "target_rule_reference": record.target_rule_reference,
        "response_on": record.response_on,
        "response_reference": record.response_reference,
    }
    proposed = {
        "status": status,
        "classification": classification,
        "identity_status": identity_status,
        "owner_user_id": owner.id,
        "target_response_on": target_date or "",
        "target_rule_reference": target_reference,
        "response_on": response_date or "",
        "response_reference": response_ref,
    }
    if proposed == previous:
        return RedirectResponse("/admin/privacy?notice=El%20seguimiento%20ya%20estaba%20actualizado", status_code=303)
    record.classification = classification
    record.identity_status = identity_status
    record.status = status
    record.owner_user_id = owner.id
    record.target_response_on = target_date or ""
    record.target_rule_reference = target_reference
    record.response_on = response_date or ""
    record.response_reference = response_ref
    record.updated_by = actor.id
    record.updated_at = now_utc()
    audit(session, project_id=record.project_id, actor_id=actor.id, action="privacy_case_updated",
          entity_type="privacy_case", entity_id=record.id,
          detail={
              "from_status": previous["status"], "to_status": status,
              "from_classification": previous["classification"], "to_classification": classification,
              "from_identity_status": previous["identity_status"], "to_identity_status": identity_status,
              "owner_changed": previous["owner_user_id"] != owner.id,
              "target_date_changed": previous["target_response_on"] != (target_date or ""),
              "target_reference_changed": previous["target_rule_reference"] != target_reference,
              "response_date_changed": previous["response_on"] != (response_date or ""),
              "response_reference_changed": previous["response_reference"] != response_ref,
          })
    session.commit()
    return RedirectResponse("/admin/privacy?notice=Seguimiento%20actualizado", status_code=303)


@app.post("/admin/users/{user_id}/status")
def update_user_status(
    user_id: str,
    request: Request,
    csrf: str = Form(...),
    action: str = Form(...),
    session: Session = Depends(get_db),
):
    actor = current_user(request, session)
    platform_admin(actor)
    check_csrf(request, csrf)
    # Serialize deactivation with reset issuance/completion for this account.
    target = session.scalar(select(User).where(User.id == user_id).with_for_update().execution_options(populate_existing=True))
    if not target:
        raise HTTPException(404, "La cuenta no existe.")
    if action not in {"activate", "deactivate"}:
        raise HTTPException(422, "Selecciona activar o desactivar la cuenta.")
    activating = action == "activate"
    if not activating and target.id == actor.id:
        raise HTTPException(409, "No puedes desactivar tu propia cuenta.")
    if not activating and target.is_platform_admin:
        active_admins = session.scalar(select(func.count(User.id)).where(
            User.is_platform_admin.is_(True), User.active.is_(True),
        )) or 0
        if active_admins <= 1:
            raise HTTPException(409, "Debe quedar al menos una cuenta administradora activa.")
    previous = target.active
    target.active = activating
    target.session_version += 1
    invalidated_resets = 0
    invalidated_invitations = 0
    revoked_memberships = 0
    if not activating:
        deactivated_at = now_utc()
        for membership in session.scalars(select(ProjectMembership).where(
            ProjectMembership.user_id == target.id,
            ProjectMembership.active.is_(True),
        )):
            membership.active = False
            revoked_memberships += 1
        for pending in session.scalars(select(PasswordReset).where(
            PasswordReset.user_id == target.id,
            PasswordReset.consumed_at.is_(None),
            PasswordReset.expires_at > deactivated_at,
        )):
            pending.consumed_at = deactivated_at
            invalidated_resets += 1
        for pending in session.scalars(select(Invitation).where(
            Invitation.email == target.email,
            Invitation.accepted_at.is_(None),
            Invitation.expires_at > deactivated_at,
        )):
            pending.expires_at = deactivated_at
            pending.token_hash = hash_token(secrets.token_urlsafe(40))
            invalidated_invitations += 1
    action_name = "user_activated" if activating else "user_deactivated"
    audit(
        session, project_id=None, actor_id=actor.id, action=action_name, entity_type="user", entity_id=target.id,
        detail={
            "from_active": previous, "to_active": activating,
            "pending_password_resets_invalidated": invalidated_resets,
            "pending_invitations_invalidated": invalidated_invitations,
            "active_memberships_revoked": revoked_memberships,
        },
    )
    session.commit()
    return RedirectResponse("/admin/users?notice=Estado%20de%20la%20cuenta%20actualizado", status_code=303)


@app.post("/admin/memberships/{membership_id}")
def update_membership(
    membership_id: str,
    request: Request,
    csrf: str = Form(...),
    action: str = Form(...),
    role: str = Form(""),
    session: Session = Depends(get_db),
):
    actor = current_user(request, session)
    platform_admin(actor)
    check_csrf(request, csrf)
    membership = session.get(ProjectMembership, membership_id)
    if not membership:
        raise HTTPException(404, "El acceso al proyecto no existe.")
    previous_role = membership.role
    previous_active = membership.active
    if action in {"activate", "deactivate"}:
        if action == "activate":
            target = session.get(User, membership.user_id)
            if not target or not target.active:
                raise HTTPException(409, "Primero debes activar la cuenta antes de reactivar su acceso a un proyecto.")
        membership.active = action == "activate"
    elif action == "change_role" and role in ALLOWED_ROLES:
        membership.role = role
    else:
        raise HTTPException(422, "Selecciona un rol o estado válido para esta membresía.")
    audit(
        session, project_id=membership.project_id, actor_id=actor.id,
        action="membership_updated", entity_type="project_membership", entity_id=membership.id,
        detail={
            "action": action,
            "previous_role": previous_role,
            "role": membership.role,
            "previous_active": previous_active,
            "active": membership.active,
        },
    )
    session.commit()
    return RedirectResponse("/admin/users?notice=Acceso%20al%20proyecto%20actualizado", status_code=303)


@app.post("/admin/users/{user_id}/password-reset")
def create_password_reset(
    user_id: str,
    request: Request,
    csrf: str = Form(...),
    session: Session = Depends(get_db),
):
    actor = current_user(request, session)
    platform_admin(actor)
    check_csrf(request, csrf)
    # Serialize concurrent reset requests so only the newest link stays active.
    target = session.scalar(select(User).where(User.id == user_id).with_for_update().execution_options(populate_existing=True))
    if not target or not target.active:
        raise HTTPException(404, "La cuenta activa no existe.")
    now = now_utc()
    for pending in session.scalars(select(PasswordReset).where(
        PasswordReset.user_id == target.id,
        PasswordReset.consumed_at.is_(None),
    )):
        pending.consumed_at = now
    token = secrets.token_urlsafe(40)
    reset = PasswordReset(
        user_id=target.id, token_hash=hash_token(token), created_by=actor.id,
        expires_at=now + timedelta(hours=1),
    )
    session.add(reset)
    audit(session, project_id=None, actor_id=actor.id, action="password_reset_issued", entity_type="user", entity_id=target.id, detail={"expires_at": reset.expires_at.isoformat()})
    session.commit()
    return admin_users_response(
        request, session, reset_link=f"{settings.public_base_url}/password-reset/{token}",
        error=f"Enlace de recuperación de un solo uso para {target.email}. Entrégalo por el canal autorizado; vence en una hora.",
    )


def valid_password_reset(session: Session, token: str) -> PasswordReset:
    reset = session.scalar(select(PasswordReset).where(PasswordReset.token_hash == hash_token(token)))
    if not reset or reset.consumed_at or utc(reset.expires_at) < now_utc():
        raise HTTPException(410, "El enlace de recuperación ya se usó o venció. Solicita uno nuevo al administrador RED.")
    return reset


@app.get("/password-reset/{token}", response_class=HTMLResponse)
def password_reset_page(token: str, request: Request, session: Session = Depends(get_db)):
    reset = valid_password_reset(session, token)
    return templates.TemplateResponse(request=request, name="password_reset.html", context={
        "request": request, "csrf": csrf_token(request), "token": token,
        "account": session.get(User, reset.user_id), "error": "",
    })


@app.post("/password-reset/{token}")
def complete_password_reset(
    token: str,
    request: Request,
    csrf: str = Form(...),
    password: str = Form(...),
    confirmation: str = Form(...),
    session: Session = Depends(get_db),
):
    check_csrf(request, csrf)
    reset = valid_password_reset(session, token)
    # Share the account lock with reset issuance/deactivation before claiming the token.
    user = session.scalar(select(User).where(User.id == reset.user_id).with_for_update().execution_options(populate_existing=True))
    if not user or not user.active:
        raise HTTPException(410, "La cuenta no está activa. Solicita ayuda al administrador RED.")
    if len(password) < 12 or len(password) > MAX_PASSWORD_CHARACTERS or password != confirmation:
        return templates.TemplateResponse(request=request, name="password_reset.html", status_code=422, context={
            "request": request, "csrf": csrf_token(request), "token": token, "account": user,
            "error": "Las contraseñas deben coincidir y tener entre 12 y 1.024 caracteres.",
        })
    consumed_at = now_utc()
    claimed = session.execute(update(PasswordReset).where(
        PasswordReset.id == reset.id,
        PasswordReset.consumed_at.is_(None),
        PasswordReset.expires_at >= consumed_at,
    ).values(consumed_at=consumed_at).execution_options(synchronize_session=False))
    if claimed.rowcount != 1:
        raise HTTPException(410, "El enlace de recuperación ya se usó o venció. Solicita uno nuevo al administrador RED.")
    user.password_hash = hash_password(password)
    user.session_version += 1
    reset.consumed_at = consumed_at
    audit(session, project_id=None, actor_id=user.id, action="password_reset_completed", entity_type="user", entity_id=user.id)
    session.commit()
    request.session.clear()
    return RedirectResponse("/login?notice=Contrase%C3%B1a%20actualizada", status_code=303)


@app.post("/admin/invitations")
def create_invitation(
    request: Request,
    csrf: str = Form(...),
    email: str = Form(...),
    full_name: str = Form(...),
    project_id: str = Form(""),
    role: str = Form("consultor"),
    platform_admin_invite: str = Form(""),
    platform_admin_confirmation: str = Form(""),
    session: Session = Depends(get_db),
):
    user = current_user(request, session)
    platform_admin(user)
    check_csrf(request, csrf)
    normalized = email.strip().lower()[:320]
    name = full_name.strip()[:200]
    project_id = project_id.strip() or None
    admin_invite = platform_admin_invite == "on"
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", normalized):
        raise HTTPException(422, "Escribe un correo válido.")
    if len(name) < 2 or (not admin_invite and role not in ALLOWED_ROLES):
        raise HTTPException(422, "Completa el nombre y selecciona un rol válido.")
    if admin_invite and platform_admin_confirmation != "confirmed":
        return admin_users_response(
            request, session, status_code=422,
            error="Confirma que la persona necesita acceso global de administración RED para emitir esta invitación.",
        )
    if not admin_invite and not project_id:
        raise HTTPException(422, "Selecciona el proyecto que tendrá acceso esta persona.")
    if project_id and not session.get(Project, project_id):
        raise HTTPException(404, "Proyecto no encontrado.")
    if admin_invite:
        project_id = None
        role = "admin"
    invitation_scope = Invitation.project_id.is_(None) if project_id is None else Invitation.project_id == project_id
    pending_duplicate = session.scalar(select(Invitation.id).where(
        Invitation.email == normalized,
        invitation_scope,
        Invitation.platform_admin.is_(admin_invite),
        Invitation.accepted_at.is_(None),
        Invitation.expires_at > now_utc(),
    ).limit(1))
    if pending_duplicate:
        return admin_users_response(
            request, session, status_code=409,
            error="Ya existe una invitación pendiente para ese correo y alcance. Revócala antes de generar otra.",
        )
    existing = session.scalar(select(User).where(User.email == normalized))
    if existing and not existing.active:
        raise HTTPException(409, "La cuenta está desactivada. Reactívala desde Usuarios antes de asignarle un nuevo acceso.")
    if existing and project_id:
        existing_membership = session.scalar(select(ProjectMembership).where(
            ProjectMembership.user_id == existing.id,
            ProjectMembership.project_id == project_id,
        ))
        if existing_membership:
            return admin_users_response(
                request, session, status_code=409,
                error="Esta cuenta ya tiene una membresía para ese conjunto. Usa «Editar acceso» para cambiar el rol o reactivar el acceso.",
            )
    if existing and existing.active and not project_id and not admin_invite:
        raise HTTPException(409, "Esta cuenta ya existe. Asigna acceso desde la gestión de miembros después de confirmar su proyecto.")
    token = secrets.token_urlsafe(40)
    invitation = Invitation(
        id=new_id(), email=normalized, full_name=name, project_id=project_id,
        role=role, platform_admin=admin_invite, token_hash=hash_token(token),
        created_by=user.id, expires_at=now_utc() + timedelta(days=7),
    )
    session.add(invitation)
    audit(session, project_id=project_id, actor_id=user.id, action="user_invited", entity_type="invitation", entity_id=invitation.id, detail={"email": normalized, "role": role, "platform_admin": admin_invite})
    session.commit()
    link = f"{settings.public_base_url}/invitations/accept/{token}"
    return admin_users_response(
        request, session, invite_link=link,
        error="Copia el enlace y envíalo a la persona por el canal acordado. No se envió correo.",
    )


@app.post("/admin/invitations/{invitation_id}/revoke")
def revoke_invitation(
    invitation_id: str,
    request: Request,
    csrf: str = Form(...),
    session: Session = Depends(get_db),
):
    actor = current_user(request, session)
    platform_admin(actor)
    check_csrf(request, csrf)
    invitation = session.get(Invitation, invitation_id)
    if not invitation:
        raise HTTPException(404, "La invitación no existe.")
    if invitation.accepted_at:
        raise HTTPException(409, "La invitación ya fue aceptada y no puede revocarse.")
    now = now_utc()
    if utc(invitation.expires_at) <= now:
        raise HTTPException(409, "La invitación ya venció o fue revocada.")
    previous_expiration = utc(invitation.expires_at).isoformat()
    invitation.expires_at = now
    invitation.token_hash = hash_token(secrets.token_urlsafe(40))
    audit(
        session, project_id=invitation.project_id, actor_id=actor.id,
        action="invitation_revoked", entity_type="invitation", entity_id=invitation.id,
        detail={"previous_expires_at": previous_expiration},
    )
    session.commit()
    return RedirectResponse("/admin/users?notice=Invitaci%C3%B3n%20revocada", status_code=303)


def valid_invitation(session: Session, token: str) -> Invitation:
    invitation = session.scalar(select(Invitation).where(Invitation.token_hash == hash_token(token)))
    if not invitation or invitation.accepted_at or utc(invitation.expires_at) < now_utc():
        raise HTTPException(410, "La invitación ya fue usada o venció. Solicita una nueva al administrador.")
    return invitation


def invitation_scope_description(session: Session, invitation: Invitation) -> str:
    if invitation.platform_admin:
        return "Administración RED · acceso global a los cuatro expedientes y a la gestión de cuentas."
    project = session.get(Project, invitation.project_id) if invitation.project_id else None
    if not project:
        return "El expediente asignado no está disponible. Contacta a administración RED antes de activar el acceso."
    role = PROJECT_MEMBERSHIP_ROLE_LABELS.get(invitation.role, "Rol no identificado")
    description = PROJECT_MEMBERSHIP_ROLE_DESCRIPTIONS.get(
        invitation.role, "Las capacidades de este rol no están disponibles. Consulta a administración RED antes de continuar."
    )
    return f"Proyecto: {project.name} · Perfil: {role}. {description} Acceso limitado a este expediente."


@app.get("/invitations/accept/{token}", response_class=HTMLResponse)
def accept_invitation_page(token: str, request: Request, session: Session = Depends(get_db)):
    invitation = valid_invitation(session, token)
    existing = session.scalar(select(User).where(User.email == invitation.email))
    return templates.TemplateResponse(request=request, name="accept_invitation.html", context={
        "request": request, "csrf": csrf_token(request), "token": token,
        "invitation": invitation, "invitation_scope": invitation_scope_description(session, invitation),
        "existing": bool(existing), "error": "",
    })


@app.post("/invitations/accept/{token}")
def accept_invitation(
    token: str,
    request: Request,
    csrf: str = Form(...),
    password: str = Form(""),
    password_confirm: str = Form(""),
    existing_password: str = Form(""),
    session: Session = Depends(get_db),
):
    check_csrf(request, csrf)
    invitation = valid_invitation(session, token)
    invitation_scope = invitation_scope_description(session, invitation)
    user = session.scalar(select(User).where(User.email == invitation.email))
    if user and not user.active:
        raise HTTPException(410, "La cuenta está desactivada. Solicita al administrador RED que la reactive antes de aceptar un nuevo acceso.")
    if user:
        now = now_utc()
        purge_expired_login_throttles(session, now=now)
        client_ip = trusted_login_client_ip(request)
        if getattr(settings, "app_env", "local") in {"staging", "production"} and not client_ip:
            return templates.TemplateResponse(request=request, name="accept_invitation.html", status_code=503, context={
                "request": request, "csrf": csrf_token(request), "token": token,
                "invitation": invitation, "invitation_scope": invitation_scope, "existing": True,
                "error": "No se puede verificar el origen de la conexión. Intenta de nuevo más tarde.",
            })
        user_throttle_key = login_throttle_key("invitation-user", user.id)
        ip_throttle_key = login_throttle_key("invitation-client-ip", client_ip) if client_ip else None
        if (
            login_throttle_blocked(session, user_throttle_key, now)
            or login_throttle_blocked(session, ip_throttle_key, now)
        ):
            return templates.TemplateResponse(request=request, name="accept_invitation.html", status_code=429, context={
                "request": request, "csrf": csrf_token(request), "token": token,
                "invitation": invitation, "invitation_scope": invitation_scope, "existing": True,
                "error": "Se pausó temporalmente la aceptación por seguridad. Espera unos minutos y vuelve a intentarlo.",
            })
        if not verify_password(existing_password, user.password_hash):
            increment_login_throttle(session, user_throttle_key, LOGIN_ACCOUNT_ATTEMPT_LIMIT, now)
            if ip_throttle_key:
                increment_login_throttle(session, ip_throttle_key, LOGIN_CLIENT_IP_ATTEMPT_LIMIT, now)
            session.commit()
            return templates.TemplateResponse(request=request, name="accept_invitation.html", status_code=401, context={
                "request": request, "csrf": csrf_token(request), "token": token,
                "invitation": invitation, "invitation_scope": invitation_scope, "existing": True,
                "error": "La cuenta ya existe. Escribe su contraseña actual para aceptar este acceso.",
            })
        user_throttle = session.get(LoginThrottle, user_throttle_key)
        if user_throttle:
            session.delete(user_throttle)
    else:
        if len(password) < 12 or len(password) > MAX_PASSWORD_CHARACTERS:
            return templates.TemplateResponse(request=request, name="accept_invitation.html", status_code=422, context={
                "request": request, "csrf": csrf_token(request), "token": token,
                "invitation": invitation, "invitation_scope": invitation_scope, "existing": False,
                "error": "La contraseña debe tener entre 12 y 1.024 caracteres.",
            })
        if password != password_confirm:
            return templates.TemplateResponse(request=request, name="accept_invitation.html", status_code=422, context={
                "request": request, "csrf": csrf_token(request), "token": token,
                "invitation": invitation, "invitation_scope": invitation_scope, "existing": False,
                "error": "Las contraseñas no coinciden. Vuelve a escribir ambas.",
            })
    accepted_at = now_utc()
    claimed = session.execute(update(Invitation).where(
        Invitation.id == invitation.id,
        Invitation.accepted_at.is_(None),
        Invitation.expires_at >= accepted_at,
    ).values(accepted_at=accepted_at).execution_options(synchronize_session=False))
    if claimed.rowcount != 1:
        raise HTTPException(410, "La invitación ya fue usada o venció. Solicita una nueva al administrador.")
    invitation.accepted_at = accepted_at
    if not user:
        password_hash = hash_password(password)
        user = User(email=invitation.email, full_name=invitation.full_name, password_hash=password_hash)
        session.add(user)
        session.flush()
        user.active = True
        user.full_name = invitation.full_name
    if invitation.platform_admin:
        user.is_platform_admin = True
    if invitation.project_id:
        membership = session.scalar(select(ProjectMembership).where(
            ProjectMembership.project_id == invitation.project_id,
            ProjectMembership.user_id == user.id,
        ))
        if membership:
            membership.role = invitation.role
            membership.active = True
        else:
            session.add(ProjectMembership(project_id=invitation.project_id, user_id=user.id, role=invitation.role))
    audit(session, project_id=invitation.project_id, actor_id=user.id, action="invitation_accepted", entity_type="invitation", entity_id=invitation.id, detail={"role": invitation.role})
    session.commit()
    request.session.clear()
    request.session["user_id"] = user.id
    request.session["session_version"] = user.session_version
    csrf_token(request)
    return RedirectResponse("/?notice=Acceso%20activado", status_code=303)


@app.get("/drive", response_class=HTMLResponse)
def drive_page(request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    platform_admin(user)
    return templates.TemplateResponse(request=request, name="drive.html", context=page_context(
        request, connection=drive.get_connection(session), oauth_ready=settings.google_oauth_ready,
        drive_external_actions_enabled=getattr(settings, "drive_external_actions_enabled", False),
        notice=safe_notice(request), error="", backups=list(session.scalars(select(Backup).order_by(Backup.created_at.desc()).limit(20))),
    ))


@app.post("/drive/connect")
def connect_drive(request: Request, csrf: str = Form(...), session: Session = Depends(get_db)):
    user = current_user(request, session)
    platform_admin(user)
    check_csrf(request, csrf)
    if not getattr(settings, "drive_external_actions_enabled", False):
        raise HTTPException(503, drive_external_action_block_message())
    if not settings.google_oauth_ready:
        return RedirectResponse("/drive?notice=Faltan%20credenciales%20OAuth%20en%20el%20entorno", status_code=303)
    state = secrets.token_urlsafe(32)
    request.session["drive_oauth_state"] = state
    return RedirectResponse(drive.authorization_url(state), status_code=303)


@app.get("/drive/callback")
def drive_callback(request: Request, code: str = "", state: str = "", error: str = "", session: Session = Depends(get_db)):
    user = current_user(request, session)
    platform_admin(user)
    if not getattr(settings, "drive_external_actions_enabled", False):
        raise HTTPException(503, drive_external_action_block_message())
    expected = str(request.session.get("drive_oauth_state", ""))
    if not expected or not state or not hmac.compare_digest(expected, state):
        raise HTTPException(400, "La verificación de seguridad de Google Drive no coincide.")
    request.session.pop("drive_oauth_state", None)
    if error or not code:
        notice = quote("Autorización de Drive cancelada. Puedes volver a intentarlo desde esta pantalla.", safe="")
        return RedirectResponse(f"/drive?notice={notice}", status_code=303)
    try:
        tokens = drive.exchange_code(code)
        drive.require_expected_scopes(tokens.get("scope"))
        access_token = str(tokens.get("access_token", ""))
        refresh_token = str(tokens.get("refresh_token", ""))
        if not access_token:
            raise drive.DriveSetupError("Google no entregó token de acceso.")
        email = drive.current_account_email(access_token)
        if not email or "@" not in email:
            raise drive.DriveSetupError("Google no confirmó la cuenta personal autorizada.")
        existing = drive.get_connection(session)
        same_account = bool(existing and existing.google_email.casefold() == email.casefold())
        if not refresh_token and not same_account:
            raise drive.DriveSetupError("Google no entregó token de renovación. Revisa el consentimiento OAuth para obtener acceso sin conexión.")
        if not refresh_token and same_account:
            # A stored token from an older authorization may have broader Drive
            # permissions. Validate its actual grant before keeping it active.
            drive.refresh_access_token(existing)
        folder_id = existing.backup_folder_id if same_account else drive.create_backup_folder(access_token)
        if existing:
            existing.connected_by = user.id
            existing.google_email = email
            if refresh_token:
                existing.encrypted_refresh_token = drive.encrypt_refresh_token(refresh_token)
            existing.backup_folder_id = folder_id
        else:
            session.add(DriveConnection(
                connected_by=user.id, google_email=email,
                encrypted_refresh_token=drive.encrypt_refresh_token(refresh_token),
                backup_folder_id=folder_id,
            ))
        audit(session, project_id=None, actor_id=user.id, action="drive_connected", entity_type="drive_connection", entity_id=existing.id if existing else "new", detail={"email": email, "folder_id": folder_id})
        session.commit()
    except drive.DriveSetupError as exc:
        session.rollback()
        logger.warning("RED Drive OAuth failed (%s).", type(exc).__name__)
        notice = quote(
            "No se completó la autorización. Revisa la configuración OAuth o inténtalo de nuevo desde Drive y respaldos.",
            safe="",
        )
        return RedirectResponse(f"/drive?notice={notice}", status_code=303)
    return RedirectResponse("/drive?notice=Drive%20personal%20conectado", status_code=303)


@app.post("/backups/create")
def create_backup(request: Request, csrf: str = Form(...), session: Session = Depends(get_db)):
    user = current_user(request, session)
    platform_admin(user)
    check_csrf(request, csrf)
    if not getattr(settings, "drive_external_actions_enabled", False):
        raise HTTPException(503, drive_external_action_block_message())
    connection = drive.get_connection(session)
    if not connection:
        return RedirectResponse("/drive?notice=Conecta%20primero%20tu%20Drive%20personal", status_code=303)
    try:
        backups.create_drive_backup(session, user.id)
    except Exception as exc:
        logger.warning("RED Drive backup failed (%s).", type(exc).__name__)
        notice = quote(
            "El respaldo no se completó. Revisa el historial; si Google rechazó el acceso, vuelve a autorizar Drive.",
            safe="",
        )
        return RedirectResponse(f"/drive?notice={notice}", status_code=303)
    return RedirectResponse("/drive?notice=Respaldo%20creado%20y%20verificado%20antes%20de%20subir", status_code=303)


@app.post("/drive/backups/{backup_id}/download")
def download_verified_drive_backup(
    backup_id: str, request: Request, csrf: str = Form(...), session: Session = Depends(get_db),
):
    user = current_user(request, session)
    platform_admin(user)
    check_csrf(request, csrf)
    backup = session.get(Backup, backup_id)
    if not backup:
        raise HTTPException(404, "Respaldo RED no encontrado.")
    if backup.status != "completado":
        raise HTTPException(409, "Solo se pueden descargar respaldos completados.")

    temporary_directory = tempfile.TemporaryDirectory(prefix="greenatics-red-drive-recovery-")
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", Path(backup.drive_file_name or "red-backup.zip").name)
    if not safe_name.lower().endswith(".zip"):
        safe_name += ".zip"
    destination = Path(temporary_directory.name) / safe_name
    try:
        backups.download_drive_backup(session, backup, user.id, destination)
    except Exception as exc:
        temporary_directory.cleanup()
        logger.warning("RED Drive backup download failed (%s).", type(exc).__name__)
        raise HTTPException(502, "No se pudo verificar y descargar el respaldo desde Drive.") from exc
    return FileResponse(
        destination,
        media_type="application/zip",
        filename=safe_name,
        headers={"Cache-Control": "no-store, max-age=0", "Pragma": "no-cache", "X-Content-Type-Options": "nosniff"},
        background=BackgroundTask(temporary_directory.cleanup),
    )


@app.get("/api/me")
def api_me(request: Request, session: Session = Depends(get_db)):
    user = current_user(request, session)
    return JSONResponse(
        content={
            "id": user.id, "email": user.email, "full_name": user.full_name,
            "platform_admin": user.is_platform_admin, "csrf_token": csrf_token(request),
        },
        headers={"Cache-Control": "no-store"},
    )
