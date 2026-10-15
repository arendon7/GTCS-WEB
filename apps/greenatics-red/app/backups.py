from __future__ import annotations

import hashlib
import io
import json
import logging
import re
import secrets
import struct
import tempfile
import zipfile
from contextlib import ExitStack
from datetime import date, datetime, timezone
from pathlib import Path
from typing import BinaryIO, Callable

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .backup_metadata import read_metadata
from .config import settings
from .evidence_quota import lock_and_check_evidence_capacity
from .initial_projects import BELLO_PROJECTS
from .models import (
    AuditEvent, Backup, DriveConnection, EvidenceFile, FormRecord, FormRevision, FormSignature,
    Invitation, LoginThrottle, OperationalReference, PasswordReset, PMIRSItem, PMIRSItemRevision, PrivacyCase,
    PMIRSVersion, PMIRSSignature, Project, ProjectMembership, ProjectVisitAuthorization, User, new_id, now_utc,
)
from .privacy_cases import validate_opaque_reference
from .signature_integrity import form_record_snapshot_sha256, pmirs_document_sha256
from .visit_authorizations import VISIT_AUTHORIZATION_REVOCATION_REASONS, validate_visit_reference
from .audit_privacy import sanitize_audit_detail, sanitize_invitation_snapshot
from .security import MAX_PASSWORD_CHARACTERS, hash_password, hash_token
from .storage import StorageService, storage as default_storage

APP_VERSION = "0.2.1"
SUPPORTED_BACKUP_SCHEMA_VERSIONS = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15}
# The JSON snapshot is kept comfortably above expected four-project pilot data,
# while preventing a crafted ZIP from expanding into an unbounded allocation.
MAX_BACKUP_METADATA_BYTES = 256 * 1024 * 1024
MAX_BACKUP_ARCHIVE_ENTRIES = 50_002  # manifest, database and up to 50,000 evidence files
MAX_BACKUP_CENTRAL_DIRECTORY_BYTES = 16 * 1024 * 1024
MAX_BACKUP_ARCHIVE_OVERHEAD_BYTES = 32 * 1024 * 1024
BACKUP_ARCHIVE_SPOOL_MEMORY_BYTES = 8 * 1024 * 1024
BACKUP_STREAM_CHUNK_BYTES = 1024 * 1024
BACKUP_COUNT_FIELDS = {
    "projects": "projects",
    "users": "users",
    "records": "form_records",
    "revisions": "form_revisions",
    "evidence_files": "evidence",
    "audit_events": "audit_events",
    "pmirs_items": "pmirs_items",
    "pmirs_revisions": "pmirs_item_revisions",
    "pmirs_versions": "pmirs_versions",
    "pmirs_signatures": "pmirs_signatures",
    "form_signatures": "form_signatures",
    "operational_references": "operational_references",
    "privacy_cases": "privacy_cases",
    "visit_authorizations": "visit_authorizations",
}
logger = logging.getLogger(__name__)


def max_backup_archive_bytes() -> int:
    """Allow the configured raw-data ceilings plus bounded ZIP metadata overhead."""
    return (
        MAX_BACKUP_METADATA_BYTES
        + settings.max_evidence_total_mb * 1024 * 1024
        + MAX_BACKUP_ARCHIVE_OVERHEAD_BYTES
    )


def _zip_directory_preflight(source: BinaryIO) -> None:
    """Bound the ZIP directory before ZipFile materializes a ZipInfo per member."""
    source.seek(0, 2)
    archive_size = source.tell()
    if archive_size > max_backup_archive_bytes():
        raise ValueError("El respaldo comprimido supera el tamaño máximo configurado para RED.")

    tail_size = min(archive_size, 22 + 65_535)
    source.seek(archive_size - tail_size)
    tail = source.read(tail_size)
    end_signature = b"PK\x05\x06"
    end_record_size = 22
    candidates = []
    offset = tail.rfind(end_signature)
    while offset >= 0:
        if offset + end_record_size <= len(tail):
            fields = struct.unpack_from("<4s4H2LH", tail, offset)
            comment_size = fields[-1]
            if offset + end_record_size + comment_size == len(tail):
                candidates.append((offset, fields))
        offset = tail.rfind(end_signature, 0, offset)
    if len(candidates) != 1:
        raise ValueError("El directorio ZIP del respaldo está ausente o es ambiguo.")

    eocd_offset, fields = candidates[0]
    _signature, disk_number, directory_disk, disk_entries, total_entries, directory_size, directory_offset, _comment_size = fields
    eocd_absolute_offset = archive_size - tail_size + eocd_offset
    zip64 = (
        disk_entries == 0xFFFF or total_entries == 0xFFFF
        or directory_size == 0xFFFFFFFF or directory_offset == 0xFFFFFFFF
    )
    directory_end_offset = eocd_absolute_offset
    if zip64:
        locator_offset = eocd_absolute_offset - 20
        if locator_offset < 0:
            raise ValueError("El directorio ZIP64 del respaldo está incompleto.")
        source.seek(locator_offset)
        locator = source.read(20)
        if len(locator) != 20:
            raise ValueError("El directorio ZIP64 del respaldo está incompleto.")
        locator_signature, locator_disk, zip64_offset, disk_count = struct.unpack("<4sLQL", locator)
        if locator_signature != b"PK\x06\x07" or locator_disk != 0 or disk_count != 1:
            raise ValueError("El respaldo ZIP multidisco o ZIP64 no es válido.")
        source.seek(zip64_offset)
        zip64_record = source.read(56)
        if len(zip64_record) != 56:
            raise ValueError("El directorio ZIP64 del respaldo está incompleto.")
        zip64_fields = struct.unpack("<4sQ2H2L4Q", zip64_record)
        (
            zip64_signature, zip64_record_size, _made_by, _needed, zip64_disk,
            zip64_directory_disk, disk_entries, total_entries, directory_size, directory_offset,
        ) = zip64_fields
        if (
            zip64_signature != b"PK\x06\x06" or zip64_record_size < 44
            or zip64_offset + 12 + zip64_record_size != locator_offset
            or zip64_disk != 0 or zip64_directory_disk != 0
        ):
            raise ValueError("El directorio ZIP64 del respaldo no es válido.")
        directory_end_offset = zip64_offset
    elif disk_number != 0 or directory_disk != 0:
        raise ValueError("No se admiten respaldos ZIP divididos en varios discos.")

    if disk_entries != total_entries:
        raise ValueError("El directorio ZIP del respaldo contiene segmentos incompletos.")
    if total_entries > MAX_BACKUP_ARCHIVE_ENTRIES:
        raise ValueError("El respaldo contiene demasiadas entradas ZIP para verificarse con seguridad.")
    if directory_size > MAX_BACKUP_CENTRAL_DIRECTORY_BYTES:
        raise ValueError("El directorio ZIP del respaldo supera el tamaño máximo permitido.")
    if directory_offset + directory_size != directory_end_offset:
        raise ValueError("Las posiciones del directorio ZIP del respaldo no son válidas.")


def _iso(value) -> str | None:
    return value.isoformat() if value else None


def _rows(session: Session, model):
    return list(session.scalars(select(model)))


def _reject_duplicate_json_keys(pairs: list[tuple[str, object]]) -> dict[str, object]:
    """Reject ambiguous JSON objects instead of silently keeping the last value."""
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"El respaldo contiene una clave JSON repetida: {key}.")
        result[key] = value
    return result


def build_backup_archive(
    session: Session, *, storage_service: StorageService | None = None,
) -> tuple[bytes, dict]:
    target = io.BytesIO()
    counts = _write_backup_archive(session, target, storage_service=storage_service)
    return target.getvalue(), counts


def build_backup_archive_spooled(
    session: Session, *, storage_service: StorageService | None = None,
) -> tuple[BinaryIO, dict]:
    """Build a verified-upload candidate with bounded RAM and a private temp-file spill."""
    target = tempfile.SpooledTemporaryFile(max_size=BACKUP_ARCHIVE_SPOOL_MEMORY_BYTES, mode="w+b")
    try:
        counts = _write_backup_archive(session, target, storage_service=storage_service)
        target.seek(0)
        return target, counts
    except Exception:
        target.close()
        raise


def _write_backup_archive(
    session: Session, target: BinaryIO, *, storage_service: StorageService | None = None,
) -> dict:
    """Create a private, integrity-checked snapshot. Passwords and OAuth secrets are never exported."""
    evidence_storage = storage_service or default_storage
    projects = _rows(session, Project)
    users = _rows(session, User)
    memberships = _rows(session, ProjectMembership)
    invitations = _rows(session, Invitation)
    records = _rows(session, FormRecord)
    revisions = _rows(session, FormRevision)
    form_signatures = _rows(session, FormSignature)
    pmirs_items = _rows(session, PMIRSItem)
    pmirs_revisions = _rows(session, PMIRSItemRevision)
    pmirs_versions = _rows(session, PMIRSVersion)
    pmirs_signatures = _rows(session, PMIRSSignature)
    evidence = _rows(session, EvidenceFile)
    if len(evidence) + 2 > MAX_BACKUP_ARCHIVE_ENTRIES:
        raise ValueError("El respaldo contiene demasiados archivos de evidencia para verificarse con seguridad.")
    operational_references = _rows(session, OperationalReference)
    privacy_cases = _rows(session, PrivacyCase)
    visit_authorizations = _rows(session, ProjectVisitAuthorization)
    audit = _rows(session, AuditEvent)

    data = {
        "schema_version": 15,
        "app_version": APP_VERSION,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "projects": [{
            "id": x.id, "slug": x.slug, "name": x.name, "municipality": x.municipality,
            "department": x.department, "status": x.status, "origin": x.origin,
            "baseline_status": x.baseline_status, "baseline_reference": x.baseline_reference,
            "baseline_note": x.baseline_note, "baseline_reviewed_by": x.baseline_reviewed_by,
            "baseline_reviewed_at": _iso(x.baseline_reviewed_at),
            "origin_note": x.origin_note, "created_at": _iso(x.created_at),
            "address": x.address, "identity_status": x.identity_status,
            "identity_reference": x.identity_reference,
            "identity_confirmed_by": x.identity_confirmed_by,
            "identity_confirmed_role": x.identity_confirmed_role,
            "identity_confirmed_at": _iso(x.identity_confirmed_at),
        } for x in projects],
        "users": [{
            "id": x.id, "email": x.email, "full_name": x.full_name,
            "is_platform_admin": x.is_platform_admin, "active": x.active,
            "session_version": x.session_version,
            "created_at": _iso(x.created_at), "last_login_at": _iso(x.last_login_at),
        } for x in users],
        "memberships": [{
            "id": x.id, "project_id": x.project_id, "user_id": x.user_id,
            "role": x.role, "active": x.active, "created_at": _iso(x.created_at),
        } for x in memberships],
        "invitations": [sanitize_invitation_snapshot({
            "id": x.id, "email": x.email, "full_name": x.full_name,
            "project_id": x.project_id, "role": x.role, "platform_admin": x.platform_admin,
            "created_by": x.created_by, "expires_at": _iso(x.expires_at),
            "accepted_at": _iso(x.accepted_at), "created_at": _iso(x.created_at),
        }) for x in invitations],
        "form_records": [{
            "id": x.id, "project_id": x.project_id, "form_code": x.form_code,
            "title": x.title, "status": x.status, "record_date": x.record_date,
            "source_kind": x.source_kind, "source_note": x.source_note,
            "payload": x.payload, "version": x.version, "created_by": x.created_by,
            "updated_by": x.updated_by, "reviewed_by": x.reviewed_by,
            "review_note": x.review_note, "reviewed_at": _iso(x.reviewed_at),
            "created_at": _iso(x.created_at), "updated_at": _iso(x.updated_at),
        } for x in records],
        "form_revisions": [{
            "id": x.id, "record_id": x.record_id, "revision": x.revision,
            "payload": x.payload, "note": x.note, "submission_key": x.submission_key,
            "changed_by": x.changed_by,
            "changed_at": _iso(x.changed_at),
        } for x in revisions],
        "form_signatures": [{
            "id": x.id, "project_id": x.project_id, "record_id": x.record_id,
            "record_version": x.record_version, "signer_user_id": x.signer_user_id,
            "signer_name": x.signer_name, "signer_email": x.signer_email,
            "signer_role": x.signer_role, "declaration": x.declaration,
            "signature_path": x.signature_path, "document_sha256": x.document_sha256,
            "document_snapshot": x.document_snapshot, "snapshot_status": x.snapshot_status,
            "signed_at": _iso(x.signed_at),
        } for x in form_signatures],
        "pmirs_items": [{
            "id": x.id, "project_id": x.project_id, "item_type": x.item_type,
            "code": x.code, "title": x.title, "description": x.description,
            "data": x.data, "review_status": x.review_status, "version": x.version,
            "created_by": x.created_by, "updated_by": x.updated_by,
            "reviewed_by": x.reviewed_by, "review_note": x.review_note,
            "reviewed_at": _iso(x.reviewed_at), "created_at": _iso(x.created_at),
            "updated_at": _iso(x.updated_at),
        } for x in pmirs_items],
        "pmirs_item_revisions": [{
            "id": x.id, "item_id": x.item_id, "revision": x.revision,
            "snapshot": x.snapshot, "note": x.note, "submission_key": x.submission_key,
            "changed_by": x.changed_by,
            "changed_at": _iso(x.changed_at),
        } for x in pmirs_revisions],
        "pmirs_versions": [{
            "id": x.id, "project_id": x.project_id, "version_label": x.version_label,
            "previous_version_id": x.previous_version_id,
            "status": x.status, "change_summary": x.change_summary,
            "change_reason": x.change_reason, "snapshot": x.snapshot,
            "baseline_reference": x.baseline_reference, "created_by": x.created_by,
            "created_at": _iso(x.created_at), "status_changed_by": x.status_changed_by,
            "status_changed_at": _iso(x.status_changed_at), "status_note": x.status_note,
        } for x in pmirs_versions],
        "pmirs_signatures": [{
            "id": x.id, "project_id": x.project_id, "version_id": x.version_id,
            "signer_user_id": x.signer_user_id, "signer_name": x.signer_name, "signer_email": x.signer_email,
            "signer_role": x.signer_role, "declaration": x.declaration,
            "signature_path": x.signature_path, "document_sha256": x.document_sha256,
            "signed_at": _iso(x.signed_at),
        } for x in pmirs_signatures],
        "evidence": [{
            "id": x.id, "project_id": x.project_id, "record_id": x.record_id,
            "pmirs_item_id": x.pmirs_item_id,
            "field_id": x.field_id,
            "original_name": x.original_name, "storage_name": x.storage_name,
            "media_type": x.media_type, "size_bytes": x.size_bytes,
            "sha256": x.sha256, "submission_key": x.submission_key,
            "created_by": x.created_by, "created_at": _iso(x.created_at),
        } for x in evidence],
        "operational_references": [{
            "id": x.id, "project_id": x.project_id, "category": x.category,
            "title": x.title, "version_label": x.version_label, "status": x.status,
            "source_note": x.source_note, "review_note": x.review_note,
            "evidence_id": x.evidence_id, "created_by": x.created_by,
            "reviewed_by": x.reviewed_by, "created_at": _iso(x.created_at),
            "reviewed_at": _iso(x.reviewed_at),
        } for x in operational_references],
        "privacy_cases": [{
            "id": x.id, "case_type": x.case_type, "project_scope": x.project_scope,
            "project_id": x.project_id, "classification": x.classification,
            "identity_status": x.identity_status, "status": x.status,
            "received_on": x.received_on, "external_reference": x.external_reference,
            "target_response_on": x.target_response_on,
            "target_rule_reference": x.target_rule_reference,
            "response_on": x.response_on, "response_reference": x.response_reference,
            "owner_user_id": x.owner_user_id, "created_by": x.created_by,
            "updated_by": x.updated_by, "created_at": _iso(x.created_at),
            "updated_at": _iso(x.updated_at),
        } for x in privacy_cases],
        "visit_authorizations": [{
            "id": x.id, "project_id": x.project_id, "status": x.status,
            "site_access_reference": x.site_access_reference,
            "privacy_reference": x.privacy_reference, "method_reference": x.method_reference,
            "sst_reference": x.sst_reference, "valid_until": x.valid_until.isoformat(),
            "created_by": x.created_by, "approved_at": _iso(x.approved_at),
            "revoked_by": x.revoked_by, "revoked_at": _iso(x.revoked_at),
            "revocation_reason": x.revocation_reason, "created_at": _iso(x.created_at),
        } for x in visit_authorizations],
        "audit_events": [{
            "id": x.id, "project_id": x.project_id, "actor_id": x.actor_id,
            "action": x.action, "entity_type": x.entity_type, "entity_id": x.entity_id,
            "detail": sanitize_audit_detail(x.action, x.detail), "created_at": _iso(x.created_at),
        } for x in audit],
    }
    data_bytes = json.dumps(data, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
    if len(data_bytes) > MAX_BACKUP_METADATA_BYTES:
        raise ValueError("La base RED excede el tamaño máximo permitido para un respaldo verificable.")
    evidence_total_bytes = sum(item.size_bytes for item in evidence)
    max_evidence_bytes = settings.max_evidence_total_mb * 1024 * 1024
    if evidence_total_bytes > max_evidence_bytes:
        raise ValueError("La evidencia registrada supera el límite total configurado en RED; no se creó el respaldo.")
    data_hash = hashlib.sha256(data_bytes).hexdigest()
    manifest = {
        "format": "greenatics-red-backup",
        "schema_version": 15,
        "app_version": APP_VERSION,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "data_file": "database.json",
        "data_sha256": data_hash,
        "evidence": [],
        "counts": {
            "projects": len(projects), "users": len(users), "records": len(records),
            "revisions": len(revisions), "evidence_files": len(evidence), "audit_events": len(audit),
            "pmirs_items": len(pmirs_items), "pmirs_revisions": len(pmirs_revisions),
            "pmirs_versions": len(pmirs_versions),
            "pmirs_signatures": len(pmirs_signatures),
            "form_signatures": len(form_signatures),
            "operational_references": len(operational_references),
            "privacy_cases": len(privacy_cases),
            "visit_authorizations": len(visit_authorizations),
        },
        "security_note": "Las contraseñas, tokens OAuth y secretos de infraestructura no se incluyen.",
    }
    with zipfile.ZipFile(target, mode="w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("database.json", data_bytes)
        evidence_manifest = []
        for item in evidence:
            archive_path = f"evidence/{item.storage_name}"
            if not evidence_storage.exists(archive_path):
                raise FileNotFoundError(f"No se encontró el archivo de evidencia {item.original_name}.")
            blob = evidence_storage.get_bytes(archive_path)
            actual_hash = hashlib.sha256(blob).hexdigest()
            if len(blob) != item.size_bytes or actual_hash != item.sha256:
                raise ValueError(f"La evidencia {item.original_name} no coincide con su huella almacenada.")
            archive.writestr(archive_path, blob)
            evidence_manifest.append({"path": archive_path, "sha256": actual_hash, "size_bytes": len(blob)})
        manifest["evidence"] = evidence_manifest
        manifest_bytes = json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8")
        if len(data_bytes) + len(manifest_bytes) > MAX_BACKUP_METADATA_BYTES:
            raise ValueError("El manifiesto y la base RED superan el tamaño máximo permitido para un respaldo verificable.")
        archive.writestr("manifest.json", manifest_bytes)
    return manifest["counts"]


def verify_backup_archive(path_or_bytes: str | Path | bytes) -> dict:
    if isinstance(path_or_bytes, bytes):
        source = io.BytesIO(path_or_bytes)
        return _verify_backup_archive_source(source)
    with Path(path_or_bytes).open("rb") as source:
        return _verify_backup_archive_source(source)


def _verify_backup_archive_source(source: BinaryIO) -> dict:
    _zip_directory_preflight(source)
    with zipfile.ZipFile(source, "r") as archive:
        archive_infos = archive.infolist()
        if any(info.compress_type not in {zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED} or info.flag_bits & 1 for info in archive_infos):
            raise ValueError("La compresión o cifrado del respaldo no está permitido.")
        archive_names = [info.filename for info in archive_infos]
        names = set(archive_names)
        if len(names) != len(archive_names):
            raise ValueError("El respaldo contiene rutas ZIP duplicadas.")
        if not {"manifest.json", "database.json"}.issubset(names):
            raise ValueError("El archivo no tiene manifiesto y base de datos RED.")
        metadata_size = sum(
            info.file_size for info in archive_infos
            if info.filename in {"manifest.json", "database.json"}
        )
        max_evidence_bytes = settings.max_evidence_total_mb * 1024 * 1024
        evidence_size = sum(
            info.file_size for info in archive_infos
            if info.filename.startswith("evidence/")
        )
        if metadata_size > MAX_BACKUP_METADATA_BYTES:
            raise ValueError("Los metadatos del respaldo exceden el tamaño máximo permitido para su verificación.")
        if evidence_size > max_evidence_bytes:
            raise ValueError("La evidencia expandida del respaldo supera el límite total configurado en RED.")
        if any(
            info.filename not in {"manifest.json", "database.json"}
            and not info.filename.startswith("evidence/")
            for info in archive_infos
        ):
            raise ValueError("El respaldo contiene archivos no reconocidos.")
        manifest = json.loads(read_metadata(archive, "manifest.json", MAX_BACKUP_METADATA_BYTES), object_pairs_hook=_reject_duplicate_json_keys)
        if not isinstance(manifest, dict):
            raise ValueError("El manifiesto del respaldo debe ser un objeto JSON.")
        manifest_schema_version = manifest.get("schema_version")
        if (
            manifest.get("format") != "greenatics-red-backup"
            or type(manifest_schema_version) is not int
            or manifest_schema_version not in SUPPORTED_BACKUP_SCHEMA_VERSIONS
        ):
            raise ValueError("El formato o versión del respaldo no se reconoce.")
        if manifest.get("data_file") != "database.json":
            raise ValueError("El manifiesto no identifica database.json como archivo de datos.")
        data_bytes = read_metadata(archive, "database.json", MAX_BACKUP_METADATA_BYTES - archive.getinfo("manifest.json").file_size)
        data_hash = hashlib.sha256(data_bytes).hexdigest()
        if data_hash != manifest.get("data_sha256"):
            raise ValueError("La huella de database.json no coincide con el manifiesto.")
        database = json.loads(data_bytes, object_pairs_hook=_reject_duplicate_json_keys)
        if not isinstance(database, dict):
            raise ValueError("La base del respaldo debe ser un objeto JSON.")
        database_schema_version = database.get("schema_version")
        if (
            type(database_schema_version) is not int
            or database_schema_version not in SUPPORTED_BACKUP_SCHEMA_VERSIONS
            or database_schema_version != manifest_schema_version
        ):
            raise ValueError("La versión de database.json no coincide con la del manifiesto.")
        declared_counts = manifest.get("counts")
        if manifest_schema_version >= 7 and not isinstance(declared_counts, dict):
            raise ValueError("El manifiesto v7+ no contiene un resumen de cantidades válido.")
        if declared_counts is not None:
            if not isinstance(declared_counts, dict):
                raise ValueError("El manifiesto no contiene un resumen de cantidades válido.")
            expected_count_fields = set(BACKUP_COUNT_FIELDS)
            if manifest_schema_version < 9:
                expected_count_fields.discard("privacy_cases")
            if manifest_schema_version < 11:
                expected_count_fields.discard("visit_authorizations")
            if manifest_schema_version >= 7 and set(declared_counts) != expected_count_fields:
                raise ValueError("El resumen de cantidades del manifiesto está incompleto o contiene claves desconocidas.")
            for count_name, database_key in BACKUP_COUNT_FIELDS.items():
                if count_name not in declared_counts:
                    continue
                rows = database.get(database_key, [])
                declared = declared_counts[count_name]
                if (
                    not isinstance(rows, list)
                    or type(declared) is not int
                    or declared < 0
                    or declared != len(rows)
                ):
                    raise ValueError(f"La cantidad {count_name} del manifiesto no coincide con database.json.")
        evidence_rows = database.get("evidence")
        # Older RED backup schemas may omit this key when no evidence was stored.
        manifest_evidence = manifest.get("evidence", [])
        if not isinstance(evidence_rows, list) or not isinstance(manifest_evidence, list):
            raise ValueError("El respaldo no contiene un índice de evidencias válido.")

        database_evidence = {}
        evidence_submission_keys: set[str] = set()
        for row in evidence_rows:
            if not isinstance(row, dict):
                raise ValueError("La base del respaldo contiene una fila de evidencia no válida.")
            storage_name = str(row.get("storage_name", ""))
            expected_path = f"evidence/{storage_name}"
            if not storage_name or Path(storage_name).name != storage_name or expected_path in database_evidence:
                raise ValueError("La base del respaldo contiene una ruta de evidencia no válida o repetida.")
            submission_key = row.get("submission_key")
            if manifest_schema_version >= 12:
                if "submission_key" not in row or (
                    submission_key is not None
                    and (not isinstance(submission_key, str) or not re.fullmatch(r"[A-Za-z0-9_-]{32,64}", submission_key))
                ):
                    raise ValueError("El respaldo contiene una clave de envío de evidencia no válida.")
            if submission_key is not None:
                if not isinstance(submission_key, str) or not re.fullmatch(r"[A-Za-z0-9_-]{32,64}", submission_key) or submission_key in evidence_submission_keys:
                    raise ValueError("El respaldo contiene claves de envío de evidencia inválidas o repetidas.")
                evidence_submission_keys.add(submission_key)
            database_evidence[expected_path] = {
                "sha256": row.get("sha256"), "size_bytes": row.get("size_bytes"),
            }

        manifest_by_path = {}
        for entry in manifest_evidence:
            if not isinstance(entry, dict) or not isinstance(entry.get("path"), str):
                raise ValueError("El manifiesto contiene una referencia de evidencia no válida.")
            safe_path = Path(entry["path"])
            path = entry["path"]
            if safe_path.is_absolute() or ".." in safe_path.parts or path not in names or path in manifest_by_path:
                raise ValueError("El manifiesto contiene una ruta de evidencia no válida.")
            manifest_by_path[path] = entry

        zip_evidence = {name for name in names if name.startswith("evidence/")}
        if set(manifest_by_path) != set(database_evidence) or zip_evidence != set(database_evidence):
            raise ValueError("Las evidencias del ZIP, manifiesto y database.json no coinciden.")
        if names != {"manifest.json", "database.json"} | set(database_evidence):
            raise ValueError("El respaldo contiene archivos no reconocidos.")

        operational_references = database.get("operational_references", [])
        if not isinstance(operational_references, list):
            raise ValueError("La biblioteca documental del respaldo no es válida.")
        evidence_by_id = {str(row.get("id")): row for row in evidence_rows if isinstance(row, dict)}
        project_ids = {str(row.get("id")) for row in database.get("projects", []) if isinstance(row, dict)}
        user_ids = {str(row.get("id")) for row in database.get("users", []) if isinstance(row, dict)}
        form_records = database.get("form_records", [])
        pmirs_items = database.get("pmirs_items", [])
        if not isinstance(form_records, list) or not isinstance(pmirs_items, list):
            raise ValueError("Los expedientes y objetos PMIRS del respaldo deben ser listas válidas.")
        records_by_id = {
            str(row.get("id")): row for row in form_records
            if isinstance(row, dict) and isinstance(row.get("id"), str)
        }
        items_by_id = {
            str(row.get("id")): row for row in pmirs_items
            if isinstance(row, dict) and isinstance(row.get("id"), str)
        }
        if len(records_by_id) != len(form_records) or len(items_by_id) != len(pmirs_items):
            raise ValueError("El respaldo contiene registros u objetos PMIRS duplicados o no válidos.")
        evidence_ids: set[str] = set()
        for row in evidence_rows:
            evidence_id = row.get("id")
            evidence_project_id = row.get("project_id")
            record_id = row.get("record_id")
            pmirs_item_id = row.get("pmirs_item_id")
            if (
                not isinstance(evidence_id, str) or not evidence_id or evidence_id in evidence_ids
                or not isinstance(evidence_project_id, str) or evidence_project_id not in project_ids
                or not isinstance(row.get("created_by"), str) or row.get("created_by") not in user_ids
                or (record_id is not None and not isinstance(record_id, str))
                or (pmirs_item_id is not None and not isinstance(pmirs_item_id, str))
                or (record_id is not None and pmirs_item_id is not None)
            ):
                raise ValueError("El respaldo contiene evidencia con identidad, proyecto o destino no válidos.")
            if record_id is not None:
                record = records_by_id.get(record_id)
                if not record or record.get("project_id") != evidence_project_id:
                    raise ValueError("La evidencia del respaldo apunta a un registro de otro expediente.")
            if pmirs_item_id is not None:
                item = items_by_id.get(pmirs_item_id)
                if not item or item.get("project_id") != evidence_project_id:
                    raise ValueError("La evidencia del respaldo apunta a un objeto PMIRS de otro expediente.")
            evidence_ids.add(evidence_id)
        form_signatures = database.get("form_signatures", [])
        if not isinstance(form_signatures, list):
            raise ValueError("Las constancias de formularios del respaldo deben ser una lista válida.")
        projects_by_id = {
            str(row.get("id")): row for row in database.get("projects", [])
            if isinstance(row, dict) and isinstance(row.get("id"), str)
        }
        form_signature_ids: set[str] = set()
        form_signature_actors: set[tuple[str, str, str]] = set()
        legacy_unverifiable_form_signatures = 0
        for row in form_signatures:
            if not isinstance(row, dict):
                raise ValueError("El respaldo contiene una constancia de formulario no válida.")
            signature_id = row.get("id")
            record_id = row.get("record_id")
            project_id = row.get("project_id")
            signer_id = row.get("signer_user_id")
            signature_path = row.get("signature_path")
            document_hash = row.get("document_sha256")
            record = records_by_id.get(record_id) if isinstance(record_id, str) else None
            project = projects_by_id.get(project_id) if isinstance(project_id, str) else None
            record_version = row.get("record_version")
            current_record_version = record.get("version") if record else None
            actor_key = (record_id, signer_id, document_hash) if (
                isinstance(record_id, str) and isinstance(signer_id, str) and isinstance(document_hash, str)
            ) else None
            if (
                not isinstance(signature_id, str) or not signature_id or signature_id in form_signature_ids
                or not isinstance(record_id, str) or not record or not project
                or not isinstance(project_id, str) or record.get("project_id") != project_id
                or not isinstance(signer_id, str) or signer_id not in user_ids
                or not isinstance(current_record_version, int) or isinstance(current_record_version, bool)
                or current_record_version < 1
                or not isinstance(record_version, int) or isinstance(record_version, bool)
                or record_version < 1 or record_version > current_record_version
                or actor_key is None or actor_key in form_signature_actors
                or not isinstance(signature_path, str) or len(signature_path) > 30000
                or not re.fullmatch(r"[ML0-9., -]+", signature_path)
                or not isinstance(document_hash, str) or not re.fullmatch(r"[a-f0-9]{64}", document_hash)
            ):
                raise ValueError("El respaldo contiene una constancia de formulario con vínculos o huella no válidos.")
            if manifest_schema_version >= 15:
                if (
                    "document_snapshot" not in row
                    or row.get("snapshot_status") not in {"verified", "legacy_unverifiable"}
                ):
                    raise ValueError("El respaldo v15 omite el estado de integridad de una constancia de formulario.")
                snapshot = row.get("document_snapshot")
                if row.get("snapshot_status") == "legacy_unverifiable" and snapshot is None:
                    legacy_unverifiable_form_signatures += 1
                elif row.get("snapshot_status") != "verified" or snapshot is None:
                    raise ValueError("El estado de integridad de la constancia no coincide con su captura inmutable.")
                elif not isinstance(snapshot, dict) or set(snapshot) != {"project", "record", "evidence"}:
                    raise ValueError("La captura inmutable de una constancia de formulario no tiene una estructura válida.")
                else:
                    snapshot_project = snapshot.get("project")
                    snapshot_record = snapshot.get("record")
                    snapshot_evidence = snapshot.get("evidence")
                    if (
                        not isinstance(snapshot_project, dict)
                        or set(snapshot_project) != {"id", "name", "municipality", "department"}
                        or snapshot_project.get("id") != project_id
                        or not isinstance(snapshot_record, dict)
                        or set(snapshot_record) != {
                            "id", "form_code", "title", "record_date", "source_kind", "source_note",
                            "payload", "version", "status", "review_note",
                        }
                        or snapshot_record.get("id") != record_id
                        or snapshot_record.get("version") != record_version
                        or not isinstance(snapshot_evidence, list)
                    ):
                        raise ValueError("La captura inmutable de una constancia no coincide con su proyecto o registro.")
                    snapshot_evidence_ids: set[str] = set()
                    for evidence_snapshot in snapshot_evidence:
                        if (
                            not isinstance(evidence_snapshot, dict)
                            or set(evidence_snapshot) != {"id", "field_id", "original_name", "sha256", "size_bytes"}
                            or not isinstance(evidence_snapshot.get("id"), str)
                            or not evidence_snapshot["id"]
                            or evidence_snapshot["id"] in snapshot_evidence_ids
                        ):
                            raise ValueError("La captura inmutable contiene una referencia de evidencia no válida.")
                        snapshot_evidence_ids.add(evidence_snapshot["id"])
                        archived_evidence = evidence_by_id.get(evidence_snapshot["id"])
                        if archived_evidence is not None:
                            archived_metadata = {
                                "id": archived_evidence.get("id"),
                                "field_id": archived_evidence.get("field_id"),
                                "original_name": archived_evidence.get("original_name"),
                                "sha256": archived_evidence.get("sha256"),
                                "size_bytes": archived_evidence.get("size_bytes"),
                            }
                            if archived_evidence.get("record_id") != record_id or archived_metadata != evidence_snapshot:
                                raise ValueError("La captura firmada apunta a evidencia ajena o alterada.")
                    try:
                        expected_hash = form_record_snapshot_sha256(snapshot)
                    except (TypeError, ValueError):
                        raise ValueError("La captura inmutable de la constancia no se puede verificar.") from None
                    if document_hash != expected_hash:
                        raise ValueError("La firma del formulario no coincide con la huella de su captura inmutable.")
            else:
                # Older schemas stored only the digest, not the signed document snapshot.
                legacy_unverifiable_form_signatures += 1
            form_signature_ids.add(signature_id)
            form_signature_actors.add(actor_key)
        pmirs_versions = database.get("pmirs_versions", [])
        pmirs_signatures = database.get("pmirs_signatures", [])
        if not isinstance(pmirs_versions, list) or not isinstance(pmirs_signatures, list):
            raise ValueError("Las versiones y firmas PMIRS del respaldo deben ser listas válidas.")
        _pmirs_versions_restore_order(pmirs_versions)
        version_by_id = {
            str(row.get("id")): row for row in pmirs_versions
            if isinstance(row, dict) and isinstance(row.get("id"), str)
        }
        if len(version_by_id) != len(pmirs_versions):
            raise ValueError("El respaldo contiene versiones PMIRS repetidas o no válidas.")
        signature_ids: set[str] = set()
        signature_actors: set[tuple[str, str]] = set()
        for row in pmirs_signatures:
            if not isinstance(row, dict):
                raise ValueError("El respaldo contiene una firma PMIRS no válida.")
            signature_id = row.get("id")
            version_id = row.get("version_id")
            project_id = row.get("project_id")
            signer_id = row.get("signer_user_id")
            signature_path = row.get("signature_path")
            document_hash = row.get("document_sha256")
            version_row = version_by_id.get(str(version_id))
            actor_key = (str(version_id), str(signer_id))
            if (
                not isinstance(signature_id, str) or not signature_id or signature_id in signature_ids
                or not isinstance(version_id, str) or not isinstance(project_id, str) or not isinstance(signer_id, str)
                or project_id not in project_ids or signer_id not in user_ids
                or not version_row or version_row.get("project_id") != project_id
                or actor_key in signature_actors
                or not isinstance(signature_path, str)
                or len(signature_path) > 30000
                or not re.fullmatch(r"[ML0-9., -]+", signature_path)
                or not isinstance(document_hash, str)
                or not re.fullmatch(r"[a-f0-9]{64}", document_hash)
            ):
                raise ValueError("El respaldo contiene una firma PMIRS con vínculos o huella no válidos.")
            try:
                expected_hash = pmirs_document_sha256(version_row)
            except (TypeError, ValueError):
                raise ValueError("La versión asociada a una firma PMIRS no tiene una captura válida.") from None
            if document_hash != expected_hash:
                raise ValueError("La firma PMIRS no corresponde a la huella de su versión inmutable.")
            signature_ids.add(signature_id)
            signature_actors.add(actor_key)
        project_rows = database.get("projects", [])
        if manifest_schema_version >= 13:
            if not isinstance(project_rows, list):
                raise ValueError("El respaldo no contiene una lista válida de expedientes.")
            for row in project_rows:
                if not isinstance(row, dict) or not all(key in row for key in (
                    "address", "identity_status", "identity_reference",
                    "identity_confirmed_by", "identity_confirmed_at",
                )) or (manifest_schema_version >= 14 and "identity_confirmed_role" not in row):
                    raise ValueError("El respaldo omite campos de confirmación de identidad del expediente.")
                address = row.get("address")
                identity_status = row.get("identity_status")
                identity_reference = row.get("identity_reference")
                confirmed_by = row.get("identity_confirmed_by")
                confirmed_at = row.get("identity_confirmed_at")
                if (
                    not isinstance(address, str) or len(address) > 500
                    or not isinstance(identity_status, str) or identity_status not in {"pendiente", "confirmada"}
                    or not isinstance(identity_reference, str) or len(identity_reference) > 160
                ):
                    raise ValueError("El respaldo contiene datos de identidad de expediente no válidos.")
                if identity_status == "confirmada":
                    if (
                        not address.strip()
                        or not validate_visit_reference(identity_reference)
                        or not isinstance(confirmed_by, str)
                        or confirmed_by not in user_ids
                        or not isinstance(confirmed_at, str)
                    ):
                        raise ValueError("La identidad confirmada del expediente carece de soporte verificable.")
                    try:
                        parsed_confirmed_at = datetime.fromisoformat(confirmed_at.replace("Z", "+00:00"))
                        if parsed_confirmed_at.tzinfo is None:
                            raise ValueError("naive timestamp")
                    except ValueError as exc:
                        raise ValueError("La fecha de confirmación de identidad del expediente no es válida.") from exc
                    if manifest_schema_version >= 14 and row.get("identity_confirmed_role") not in {"admin", "administracion_ph"}:
                        raise ValueError("El perfil que confirmó la identidad del expediente no es válido.")
                elif any((identity_reference, confirmed_by, confirmed_at)):
                    raise ValueError("Un expediente pendiente no puede conservar constancia de confirmación vigente.")
                elif manifest_schema_version >= 14 and row.get("identity_confirmed_role") is not None:
                    raise ValueError("Un expediente pendiente no puede conservar el perfil de una confirmación vigente.")
        reference_ids: set[str] = set()
        reference_evidence_ids: set[str] = set()
        reference_versions: set[tuple[str, str, str]] = set()
        for row in operational_references:
            if not isinstance(row, dict):
                raise ValueError("El respaldo contiene una referencia operativa no válida.")
            if not all(isinstance(row.get(key), str) for key in (
                "id", "project_id", "evidence_id", "created_by", "title", "version_label", "source_note", "review_note", "created_at",
            )):
                raise ValueError("El respaldo contiene una referencia operativa con campos obligatorios no válidos.")
            reference_id = str(row.get("id", ""))
            evidence_id = str(row.get("evidence_id", ""))
            project_id = str(row.get("project_id", ""))
            category = row.get("category")
            version_label = row.get("version_label")
            reference_version = (project_id, str(category), str(version_label))
            evidence_row = evidence_by_id.get(evidence_id)
            try:
                datetime.fromisoformat(row["created_at"].replace("Z", "+00:00"))
                if row.get("reviewed_at") is not None:
                    if not isinstance(row["reviewed_at"], str):
                        raise ValueError
                    datetime.fromisoformat(row["reviewed_at"].replace("Z", "+00:00"))
            except (AttributeError, TypeError, ValueError):
                raise ValueError("El respaldo contiene fechas de revisión operativa no válidas.") from None
            if (
                not reference_id
                or reference_id in reference_ids
                or not evidence_id
                or evidence_id in reference_evidence_ids
                or reference_version in reference_versions
                or not project_id
                or not isinstance(row.get("title"), str)
                or not row["title"].strip()
                or not isinstance(version_label, str)
                or not version_label.strip()
                or not isinstance(row.get("source_note"), str)
                or not row["source_note"].strip()
                or not isinstance(row.get("review_note"), str)
                or not evidence_row
                or project_id not in project_ids
                or evidence_row.get("project_id") != project_id
                or evidence_row.get("field_id") != f"operational-reference:{reference_id}"
                or evidence_row.get("record_id") is not None
                or evidence_row.get("pmirs_item_id") is not None
                or category not in {"guia_operativa", "tabla_separacion"}
                or row.get("status") not in {"pendiente_revision", "requiere_correccion", "aprobada", "reemplazada", "obsoleta"}
                or row.get("created_by") not in user_ids
                or (row.get("reviewed_by") is not None and row.get("reviewed_by") not in user_ids)
                or (
                    row.get("status") in {"requiere_correccion", "aprobada", "reemplazada", "obsoleta"}
                    and (not row.get("reviewed_by") or not row.get("reviewed_at"))
                )
            ):
                raise ValueError("El respaldo contiene una referencia operativa con vínculos o estado no válidos.")
            reference_ids.add(reference_id)
            reference_evidence_ids.add(evidence_id)
            reference_versions.add(reference_version)

        privacy_cases = database.get("privacy_cases", [])
        if not isinstance(privacy_cases, list) or (manifest_schema_version >= 9 and "privacy_cases" not in database):
            raise ValueError("El registro de solicitudes de privacidad del respaldo no es válido.")
        case_ids: set[str] = set()
        case_types = {"consulta", "actualizacion_rectificacion", "supresion_revocatoria", "reclamo", "otro"}
        project_scopes = {"red_global", "un_proyecto", "varios_proyectos"}
        classifications = {"pendiente", "consulta", "reclamo", "otra"}
        identity_states = {"pendiente", "verificada", "requiere_informacion", "no_aplica"}
        case_states = {
            "recibida", "verificacion", "analisis", "respuesta_preparacion", "pendiente_informacion",
            "pendiente_tercero", "respuesta_enviada", "cerrada", "trasladada",
        }
        expected_case_fields = {
            "id", "case_type", "project_scope", "project_id", "classification", "identity_status", "status",
            "received_on", "external_reference", "target_response_on", "target_rule_reference", "response_on",
            "response_reference", "owner_user_id", "created_by", "updated_by", "created_at", "updated_at",
        }
        def valid_day(value: object) -> bool:
            if not isinstance(value, str) or not value:
                return False
            try:
                return date.fromisoformat(value).isoformat() == value
            except ValueError:
                return False
        for row in privacy_cases:
            if not isinstance(row, dict) or set(row) != expected_case_fields:
                raise ValueError("El respaldo contiene una solicitud de privacidad con campos inesperados o incompletos.")
            case_id = row.get("id")
            project_scope = row.get("project_scope")
            project_id = row.get("project_id")
            target_date = row.get("target_response_on", "")
            target_reference = row.get("target_rule_reference", "")
            response_date = row.get("response_on", "")
            response_reference = row.get("response_reference", "")
            try:
                datetime.fromisoformat(str(row["created_at"]).replace("Z", "+00:00"))
                datetime.fromisoformat(str(row["updated_at"]).replace("Z", "+00:00"))
            except (AttributeError, TypeError, ValueError):
                raise ValueError("El respaldo contiene fechas de registro de privacidad no válidas.") from None
            if (
                not isinstance(case_id, str) or not case_id or case_id in case_ids
                or row.get("case_type") not in case_types
                or project_scope not in project_scopes
                or row.get("classification") not in classifications
                or row.get("identity_status") not in identity_states
                or row.get("status") not in case_states
                or not valid_day(row.get("received_on"))
                or (project_scope == "un_proyecto" and project_id not in project_ids)
                or (project_scope != "un_proyecto" and project_id is not None)
                or row.get("owner_user_id") not in user_ids
                or row.get("created_by") not in user_ids
                or row.get("updated_by") not in user_ids
                or not isinstance(row.get("external_reference"), str)
                or not validate_opaque_reference(row["external_reference"], maximum=160)
                or (target_date and (not valid_day(target_date) or not target_reference or row.get("classification") == "pendiente"))
                or (not target_date and target_reference)
                or not isinstance(target_reference, str)
                or not validate_opaque_reference(target_reference, maximum=240)
                or (response_date and not valid_day(response_date))
                or not isinstance(response_reference, str)
                or not validate_opaque_reference(response_reference, maximum=160)
                or (row.get("status") in {"respuesta_enviada", "cerrada"} and (not response_date or not response_reference))
                or (row.get("status") in {"respuesta_enviada", "cerrada"} and row.get("identity_status") not in {"verificada", "no_aplica"})
            ):
                raise ValueError("El respaldo contiene una solicitud de privacidad con referencias, fechas o estados no válidos.")
            case_ids.add(case_id)

        visit_authorizations = database.get("visit_authorizations", [])
        if not isinstance(visit_authorizations, list) or (manifest_schema_version >= 11 and "visit_authorizations" not in database):
            raise ValueError("Las autorizaciones de visita del respaldo no tienen un formato válido.")
        authorization_ids: set[str] = set()
        expected_authorization_fields = {
            "id", "project_id", "status", "site_access_reference", "privacy_reference",
            "method_reference", "sst_reference", "valid_until", "created_by", "approved_at",
            "revoked_by", "revoked_at", "revocation_reason", "created_at",
        }
        for row in visit_authorizations:
            if not isinstance(row, dict) or set(row) != expected_authorization_fields:
                raise ValueError("El respaldo contiene una autorización de visita con campos incompletos o desconocidos.")
            refs = [row.get(key) for key in (
                "site_access_reference", "privacy_reference", "method_reference", "sst_reference",
            )]
            try:
                datetime.fromisoformat(str(row["approved_at"]).replace("Z", "+00:00"))
                datetime.fromisoformat(str(row["created_at"]).replace("Z", "+00:00"))
                valid_until = date.fromisoformat(row["valid_until"])
                if valid_until.isoformat() != row["valid_until"]:
                    raise ValueError
                if row.get("revoked_at") is not None:
                    datetime.fromisoformat(str(row["revoked_at"]).replace("Z", "+00:00"))
            except (AttributeError, TypeError, ValueError):
                raise ValueError("El respaldo contiene fechas de autorización de visita no válidas.") from None
            authorization_id = row.get("id")
            revoked = row.get("status") == "revoked"
            if (
                not isinstance(authorization_id, str) or not authorization_id or authorization_id in authorization_ids
                or row.get("project_id") not in project_ids
                or row.get("status") not in {"approved", "revoked"}
                or row.get("created_by") not in user_ids
                or any(not isinstance(value, str) or not validate_visit_reference(value) for value in refs)
                or not isinstance(row.get("revocation_reason"), str)
                or (revoked and (row.get("revoked_by") not in user_ids or not row.get("revoked_at") or row["revocation_reason"] not in VISIT_AUTHORIZATION_REVOCATION_REASONS))
                or (not revoked and (row.get("revoked_by") is not None or row.get("revoked_at") is not None or row["revocation_reason"]))
            ):
                raise ValueError("El respaldo contiene una autorización de visita con referencias, responsables o estado no válidos.")
            authorization_ids.add(authorization_id)

        verified_evidence_bytes = 0
        for path, entry in manifest_by_path.items():
            database_entry = database_evidence[path]
            if entry.get("sha256") != database_entry["sha256"] or entry.get("size_bytes") != database_entry["size_bytes"]:
                raise ValueError(f"Los metadatos de evidencia {path} no coinciden con database.json.")
            size_bytes, digest = _stream_zip_member(archive, path, max_bytes=max_evidence_bytes - verified_evidence_bytes)
            verified_evidence_bytes += size_bytes
            if digest != entry.get("sha256") or size_bytes != entry.get("size_bytes"):
                raise ValueError(f"La evidencia {path} no supera la verificación de integridad.")
        manifest["legacy_unverifiable_form_signatures"] = legacy_unverifiable_form_signatures
        return manifest


def _stream_zip_member(archive, member: str, *, max_bytes: int, output=None) -> tuple[int, str]:
    """Hash a ZIP member in bounded memory and optionally copy it to a file-like object."""
    digest = hashlib.sha256()
    size_bytes = 0
    with archive.open(member, "r") as source:
        while chunk := source.read(BACKUP_STREAM_CHUNK_BYTES):
            size_bytes += len(chunk)
            if size_bytes > max_bytes:
                raise ValueError(f"El archivo {member} supera el tamaño máximo permitido durante su lectura.")
            digest.update(chunk)
            if output is not None:
                output.write(chunk)
    return size_bytes, digest.hexdigest()


def _datetime_from_backup(value: str | None) -> datetime | None:
    if not value:
        return None
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _pmirs_versions_restore_order(rows: list[dict]) -> list[dict]:
    """Validate and order self-referencing version rows before restoring them."""
    if any(
        not isinstance(row, dict)
        or not isinstance(row.get("id"), str) or not row["id"]
        or not isinstance(row.get("project_id"), str) or not row["project_id"]
        or (row.get("previous_version_id") is not None and not isinstance(row.get("previous_version_id"), str))
        for row in rows
    ):
        raise ValueError("El respaldo contiene una versión PMIRS con referencias no válidas.")
    by_id = {str(row["id"]): row for row in rows}
    if len(by_id) != len(rows):
        raise ValueError("El respaldo contiene IDs PMIRS repetidos.")
    for row in rows:
        previous_id = row.get("previous_version_id")
        if not previous_id:
            continue
        previous = by_id.get(str(previous_id))
        if not previous or previous.get("project_id") != row.get("project_id"):
            raise ValueError("El respaldo contiene un vínculo P-12 a una versión ausente o de otro proyecto.")
        if str(previous_id) == str(row["id"]):
            raise ValueError("El respaldo contiene una versión P-12 enlazada consigo misma.")

    ordered = []
    restored_ids: set[str] = set()
    pending = list(rows)
    while pending:
        ready = [row for row in pending if not row.get("previous_version_id") or str(row["previous_version_id"]) in restored_ids]
        if not ready:
            raise ValueError("El respaldo contiene un ciclo en la cadena P-12.")
        ready.sort(key=lambda row: (row.get("created_at") or "", row.get("version_label", ""), str(row["id"])))
        for row in ready:
            ordered.append(row)
            restored_ids.add(str(row["id"]))
            pending.remove(row)
    return ordered


def _validate_pristine_seed_projects(projects: list[Project]) -> None:
    """Allow only the untouched Bello seed rows in an otherwise empty target."""
    if not projects:
        return
    expected_names = dict(BELLO_PROJECTS)
    expected_slugs = set(expected_names)
    if {project.slug for project in projects} != expected_slugs:
        raise ValueError("La base destino no está vacía ni contiene únicamente los cuatro proyectos semilla RED.")

    allowed_origin_notes = {
        "Nombre recibido para estructurar uno de los primeros cuatro PMIRS. Dirección, datos y alcance pendientes de validación con la copropiedad.",
        "Nombre suministrado por el usuario; pendiente de validar con la copropiedad.",
        "Nombre suministrado por el usuario; pendiente de validar con la copropiedad. Expediente inicial vacío, sin datos operativos precargados.",
    }
    altered: list[str] = []
    for project in projects:
        if (
            project.name != expected_names.get(project.slug)
            or project.municipality != "Bello"
            or project.department != "Antioquia"
            or project.status != "preparacion"
            or project.baseline_status != "no_iniciada"
            or project.baseline_reference != ""
            or project.baseline_note != ""
            or project.baseline_reviewed_by is not None
            or project.baseline_reviewed_at is not None
            or project.origin != "instruccion_usuario"
            or project.origin_note not in allowed_origin_notes
            or project.address != ""
            or project.identity_status != "pendiente"
            or project.identity_reference != ""
            or project.identity_confirmed_by is not None
            or project.identity_confirmed_role is not None
            or project.identity_confirmed_at is not None
        ):
            altered.append(project.slug)
    if altered:
        raise ValueError(
            "La base destino contiene expedientes semilla alterados; no se sobrescribió: "
            + ", ".join(sorted(altered))
        )


def _acquire_restore_lock(session: Session) -> None:
    """Serialize restores per target database before checking emptiness or writing files."""
    connection = session.connection()
    dialect_name = connection.dialect.name
    if dialect_name == "sqlite":
        # SQLite's write reservation prevents two restore transactions from
        # both passing the empty-target check and racing over the same objects.
        connection.exec_driver_sql("BEGIN IMMEDIATE")
    elif dialect_name == "postgresql":
        # Use READ COMMITTED so the empty-target check sees the restore that
        # held this lock immediately before us, even if the engine is configured
        # with a stricter default isolation level.
        connection.exec_driver_sql("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        connection.exec_driver_sql("SELECT pg_advisory_xact_lock(5139246288751121481)")
    else:
        raise ValueError(
            f"La restauración RED no soporta el motor SQL {dialect_name!r}; usa SQLite o PostgreSQL."
        )


def restore_backup_archive(
    path_or_bytes: str | Path | bytes,
    *,
    admin_email: str,
    admin_name: str,
    admin_password: str,
    session_factory: Callable[[], Session] | None = None,
    target_engine=None,
    storage_root: Path | None = None,
    storage_service: StorageService | None = None,
) -> dict:
    """Restore a verified snapshot to an empty RED workspace.

    Existing data is never overwritten. Restored users are disabled and receive
    unusable password values; only the newly established bootstrap admin can log
    in until accounts are reset and reactivated.
    """
    from .db import SessionLocal, engine

    email = admin_email.strip().lower()
    name = admin_name.strip()[:200]
    if not email or "@" not in email or len(name) < 2:
        raise ValueError("Indica el correo y nombre de la cuenta administradora que recuperará RED.")
    if len(admin_password) < 12 or len(admin_password) > MAX_PASSWORD_CHARACTERS:
        raise ValueError("La contraseña inicial debe tener entre 12 y 1.024 caracteres.")

    with ExitStack() as stack:
        if isinstance(path_or_bytes, bytes):
            archive_source = stack.enter_context(io.BytesIO(path_or_bytes))
        else:
            archive_source = stack.enter_context(Path(path_or_bytes).open("rb"))
        manifest = _verify_backup_archive_source(archive_source)
        archive = stack.enter_context(zipfile.ZipFile(archive_source, "r"))
        data = json.loads(read_metadata(archive, "database.json", MAX_BACKUP_METADATA_BYTES - archive.getinfo("manifest.json").file_size))
        required_lists = (
            "projects", "users", "memberships", "invitations", "form_records",
            "form_revisions", "evidence", "audit_events",
        )
        if data.get("schema_version") not in SUPPORTED_BACKUP_SCHEMA_VERSIONS or any(not isinstance(data.get(key), list) for key in required_lists):
            raise ValueError("La estructura de datos del respaldo no corresponde al formato RED esperado.")
        for optional_list in (
            "pmirs_items", "pmirs_item_revisions", "pmirs_versions", "pmirs_signatures", "form_signatures",
            "operational_references", "privacy_cases", "visit_authorizations",
        ):
            data.setdefault(optional_list, [])
        for row in data["evidence"]:
            row.setdefault("pmirs_item_id", None)
            row.setdefault("field_id", None)

        evidence_manifest = {item.get("path"): item for item in manifest.get("evidence", [])}
        for row in data["evidence"]:
            storage_name = str(row.get("storage_name", ""))
            expected_path = f"evidence/{storage_name}"
            if not storage_name or Path(storage_name).name != storage_name or expected_path not in evidence_manifest:
                raise ValueError("El respaldo contiene una referencia de evidencia no permitida.")

        if storage_root is not None and storage_service is not None:
            raise ValueError("Indica storage_root o storage_service, no ambos.")
        if storage_root is not None:
            resolved_storage = storage_root.resolve()
            if resolved_storage.exists() and any(path.is_file() for path in resolved_storage.rglob("*")):
                raise ValueError("La carpeta de destino de evidencias no está vacía; no se sobrescribió ningún archivo.")
            evidence_storage = StorageService(backend="filesystem", local_root=resolved_storage)
        else:
            evidence_storage = storage_service or default_storage
        evidence_keys = [f"evidence/{row['storage_name']}" for row in data["evidence"]]
        if any(evidence_storage.exists(key) for key in evidence_keys):
            raise ValueError("El almacenamiento de destino ya contiene evidencia del respaldo; no se sobrescribió ningún archivo.")
        written_keys: list[str] = []
        db_engine = target_engine or engine
        if session_factory is not None:
            factory = session_factory
        elif target_engine is not None:
            from sqlalchemy.orm import sessionmaker

            factory = sessionmaker(bind=db_engine, autoflush=False, expire_on_commit=False)
        else:
            factory = SessionLocal
        now = now_utc()
        expired_at = datetime.fromtimestamp(now.timestamp() - 1, tz=timezone.utc)
        admin_password_hash = hash_password(admin_password)

        try:
            with factory() as session:
                with session.begin():
                    _acquire_restore_lock(session)
                    incoming_evidence_by_project: dict[str, int] = {}
                    for evidence_row in data["evidence"]:
                        project_id = str(evidence_row.get("project_id", ""))
                        size_bytes = evidence_row.get("size_bytes")
                        if not project_id or not isinstance(size_bytes, int) or size_bytes < 0:
                            raise ValueError("El respaldo contiene un tamaño de evidencia no válido.")
                        incoming_evidence_by_project[project_id] = (
                            incoming_evidence_by_project.get(project_id, 0) + size_bytes
                        )
                    if incoming_evidence_by_project:
                        lock_and_check_evidence_capacity(
                            session, incoming_by_project=incoming_evidence_by_project,
                            total_limit_bytes=settings.max_evidence_total_mb * 1024 * 1024,
                            project_limit_bytes=settings.max_evidence_project_mb * 1024 * 1024,
                        )
                    protected_models = (
                        User, ProjectMembership, Invitation, FormRecord, FormRevision,
                        EvidenceFile, AuditEvent, DriveConnection, Backup, LoginThrottle,
                        PasswordReset, PMIRSItem, PMIRSItemRevision, PMIRSVersion, PMIRSSignature, FormSignature,
                        OperationalReference, PrivacyCase, ProjectVisitAuthorization,
                    )
                    nonempty = [
                        model.__tablename__ for model in protected_models
                        if (session.scalar(select(func.count()).select_from(model)) or 0) > 0
                    ]
                    if nonempty:
                        raise ValueError("La base de destino contiene datos RED y no se puede sobrescribir: " + ", ".join(nonempty))

                    seed_projects = list(session.scalars(select(Project)))
                    _validate_pristine_seed_projects(seed_projects)
                    for project in seed_projects:
                        session.delete(project)

                    restored_users: dict[str, User] = {}
                    for row in data["users"]:
                        restored = User(
                            id=row["id"], email=row["email"], full_name=row["full_name"],
                            password_hash="disabled$restore$" + secrets.token_urlsafe(32),
                            is_platform_admin=False, active=False,
                            session_version=int(row.get("session_version", 1)) + 1,
                            created_at=_datetime_from_backup(row.get("created_at")) or now,
                            last_login_at=_datetime_from_backup(row.get("last_login_at")),
                        )
                        restored_users[restored.email.casefold()] = restored
                        session.add(restored)
                    session.flush()

                    bootstrap = restored_users.get(email)
                    if bootstrap:
                        bootstrap.full_name = name
                        bootstrap.password_hash = admin_password_hash
                        bootstrap.is_platform_admin = True
                        bootstrap.active = True
                    else:
                        bootstrap = User(
                            email=email, full_name=name, password_hash=admin_password_hash,
                            is_platform_admin=True, active=True, session_version=1,
                        )
                        session.add(bootstrap)
                        session.flush()

                    for row in data["projects"]:
                        session.add(Project(
                            id=row["id"], slug=row["slug"], name=row["name"],
                            municipality=row["municipality"], department=row["department"],
                            address=row.get("address", ""),
                            identity_status=row.get("identity_status", "pendiente"),
                            identity_reference=row.get("identity_reference", ""),
                            identity_confirmed_by=row.get("identity_confirmed_by"),
                            identity_confirmed_role=row.get(
                                "identity_confirmed_role",
                                "admin" if row.get("identity_status") == "confirmada" else None,
                            ),
                            identity_confirmed_at=_datetime_from_backup(row.get("identity_confirmed_at")),
                            status=row["status"], origin=row["origin"],
                            baseline_status=row["baseline_status"],
                            baseline_reference=row["baseline_reference"], baseline_note=row["baseline_note"],
                            baseline_reviewed_by=row.get("baseline_reviewed_by"),
                            baseline_reviewed_at=_datetime_from_backup(row.get("baseline_reviewed_at")),
                            origin_note=row["origin_note"], created_at=_datetime_from_backup(row.get("created_at")) or now,
                        ))
                    session.flush()

                    for row in data["memberships"]:
                        session.add(ProjectMembership(
                            id=row["id"], project_id=row["project_id"], user_id=row["user_id"],
                            role=row["role"], active=bool(row.get("active", True)),
                            created_at=_datetime_from_backup(row.get("created_at")) or now,
                        ))
                    for row in data["invitations"]:
                        archived_invitation = sanitize_invitation_snapshot(row)
                        was_pending = row.get("accepted_at") is None
                        session.add(Invitation(
                            id=row["id"], email=archived_invitation["email"], full_name=archived_invitation["full_name"],
                            project_id=row.get("project_id"), role=row["role"],
                            platform_admin=bool(row["platform_admin"]),
                            token_hash=hash_token(secrets.token_urlsafe(40)), created_by=row["created_by"],
                            expires_at=expired_at if was_pending else (_datetime_from_backup(row.get("expires_at")) or expired_at),
                            accepted_at=_datetime_from_backup(row.get("accepted_at")),
                            created_at=_datetime_from_backup(row.get("created_at")) or now,
                        ))
                    for row in data["form_records"]:
                        session.add(FormRecord(
                            id=row["id"], project_id=row["project_id"], form_code=row["form_code"],
                            title=row["title"], status=row["status"], record_date=row["record_date"],
                            source_kind=row["source_kind"], source_note=row["source_note"],
                            payload=row["payload"], version=row["version"], created_by=row["created_by"],
                            updated_by=row["updated_by"], reviewed_by=row.get("reviewed_by"),
                            review_note=row["review_note"], reviewed_at=_datetime_from_backup(row.get("reviewed_at")),
                            created_at=_datetime_from_backup(row.get("created_at")) or now,
                            updated_at=_datetime_from_backup(row.get("updated_at")) or now,
                        ))
                    for row in data["form_revisions"]:
                        session.add(FormRevision(
                            id=row["id"], record_id=row["record_id"], revision=row["revision"],
                            payload=row["payload"], note=row["note"], changed_by=row["changed_by"],
                            submission_key=row.get("submission_key"),
                            changed_at=_datetime_from_backup(row.get("changed_at")) or now,
                        ))
                    record_rows = {row["id"]: row for row in data["form_records"]}
                    for row in data["form_signatures"]:
                        record_row = record_rows.get(row.get("record_id"))
                        if (not record_row or record_row.get("project_id") != row.get("project_id")
                                or int(record_row.get("version", 1)) < int(row.get("record_version", 0))):
                            raise ValueError("El respaldo contiene una firma vinculada a un registro o versión ausente.")
                        if (not re.fullmatch(r"[ML0-9., -]+", str(row.get("signature_path", "")))
                                or len(str(row.get("signature_path", ""))) > 30000
                                or not re.fullmatch(r"[a-f0-9]{64}", str(row.get("document_sha256", "")))):
                            raise ValueError("El respaldo contiene una firma manuscrita o huella de registro no válida.")
                        session.add(FormSignature(
                            id=row["id"], project_id=row["project_id"], record_id=row["record_id"],
                            record_version=int(row["record_version"]), signer_user_id=row["signer_user_id"],
                            signer_name=row["signer_name"], signer_email=row["signer_email"], signer_role=row["signer_role"],
                            declaration=row["declaration"], signature_path=row["signature_path"],
                            document_sha256=row["document_sha256"], document_snapshot=row.get("document_snapshot"),
                            snapshot_status=row.get("snapshot_status", "legacy_unverifiable"),
                            signed_at=_datetime_from_backup(row.get("signed_at")) or now,
                        ))
                    for row in data["pmirs_items"]:
                        session.add(PMIRSItem(
                            id=row["id"], project_id=row["project_id"], item_type=row["item_type"],
                            code=row["code"], title=row["title"], description=row.get("description", ""),
                            data=row.get("data", {}), review_status=row.get("review_status", "RAW"),
                            version=int(row.get("version", 1)), created_by=row["created_by"],
                            updated_by=row["updated_by"], reviewed_by=row.get("reviewed_by"),
                            review_note=row.get("review_note", ""),
                            reviewed_at=_datetime_from_backup(row.get("reviewed_at")),
                            created_at=_datetime_from_backup(row.get("created_at")) or now,
                            updated_at=_datetime_from_backup(row.get("updated_at")) or now,
                        ))
                    for row in data["pmirs_item_revisions"]:
                        session.add(PMIRSItemRevision(
                            id=row["id"], item_id=row["item_id"], revision=row["revision"],
                            snapshot=row["snapshot"], note=row.get("note", ""),
                            submission_key=row.get("submission_key"),
                            changed_by=row["changed_by"],
                            changed_at=_datetime_from_backup(row.get("changed_at")) or now,
                        ))
                    for row in _pmirs_versions_restore_order(data["pmirs_versions"]):
                        session.add(PMIRSVersion(
                            id=row["id"], project_id=row["project_id"],
                            previous_version_id=row.get("previous_version_id"),
                            version_label=row["version_label"], status=row["status"],
                            change_summary=row["change_summary"], change_reason=row["change_reason"],
                            snapshot=row["snapshot"], baseline_reference=row.get("baseline_reference", ""),
                            created_by=row["created_by"], created_at=_datetime_from_backup(row.get("created_at")) or now,
                            status_changed_by=row.get("status_changed_by"),
                            status_changed_at=_datetime_from_backup(row.get("status_changed_at")),
                            status_note=row.get("status_note", ""),
                        ))
                    version_rows = {row["id"]: row for row in data["pmirs_versions"]}
                    for row in data["pmirs_signatures"]:
                        version_row = version_rows.get(row.get("version_id"))
                        if not version_row or version_row.get("project_id") != row.get("project_id"):
                            raise ValueError("El respaldo contiene una firma vinculada a una versión PMIRS ausente o de otro proyecto.")
                        if not re.fullmatch(r"[ML0-9., -]+", str(row.get("signature_path", ""))) or len(str(row.get("signature_path", ""))) > 30000:
                            raise ValueError("El respaldo contiene una ruta de firma manuscrita no válida.")
                        session.add(PMIRSSignature(
                            id=row["id"], project_id=row["project_id"], version_id=row["version_id"],
                            signer_user_id=row["signer_user_id"], signer_name=row["signer_name"], signer_email=row["signer_email"],
                            signer_role=row["signer_role"], declaration=row["declaration"],
                            signature_path=row["signature_path"], document_sha256=row["document_sha256"],
                            signed_at=_datetime_from_backup(row.get("signed_at")) or now,
                        ))
                    for row in data["evidence"]:
                        archive_path = f"evidence/{row['storage_name']}"
                        try:
                            with tempfile.TemporaryDirectory(prefix="greenatics-red-restore-") as temporary_directory:
                                temporary_path = Path(temporary_directory) / row["storage_name"]
                                with temporary_path.open("wb") as temporary_file:
                                    restored_size, restored_hash = _stream_zip_member(
                                        archive, archive_path, max_bytes=row["size_bytes"], output=temporary_file,
                                    )
                                if restored_size != row["size_bytes"] or restored_hash != row["sha256"]:
                                    raise ValueError(
                                        f"La evidencia {row['original_name']} no conserva su integridad en el respaldo."
                                    )
                                evidence_storage.put_file(archive_path, temporary_path, row["media_type"])
                            stored_size, stored_hash = evidence_storage.checksum(archive_path)
                            if (
                                stored_size != row["size_bytes"]
                                or stored_hash != row["sha256"]
                            ):
                                raise ValueError(
                                    f"La evidencia {row['original_name']} no conserva su integridad en el almacenamiento de destino."
                                )
                        except Exception:
                            try:
                                evidence_storage.delete(archive_path)
                            except Exception:
                                logger.exception("No se pudo limpiar una escritura incompleta de evidencia %s", archive_path)
                            raise
                        written_keys.append(archive_path)
                        session.add(EvidenceFile(
                            id=row["id"], project_id=row["project_id"], record_id=row.get("record_id"),
                            pmirs_item_id=row.get("pmirs_item_id"),
                            field_id=row.get("field_id"),
                            original_name=row["original_name"], storage_name=row["storage_name"],
                            media_type=row["media_type"], size_bytes=row["size_bytes"], sha256=row["sha256"],
                            submission_key=row.get("submission_key"),
                            created_by=row["created_by"], created_at=_datetime_from_backup(row.get("created_at")) or now,
                        ))
                    session.flush()
                    for row in data["operational_references"]:
                        session.add(OperationalReference(
                            id=row["id"], project_id=row["project_id"], category=row["category"],
                            title=row["title"], version_label=row["version_label"], status=row["status"],
                            source_note=row.get("source_note", ""), review_note=row.get("review_note", ""),
                            evidence_id=row["evidence_id"], created_by=row["created_by"],
                            reviewed_by=row.get("reviewed_by"),
                            created_at=_datetime_from_backup(row.get("created_at")) or now,
                            reviewed_at=_datetime_from_backup(row.get("reviewed_at")),
                        ))
                    for row in data["privacy_cases"]:
                        session.add(PrivacyCase(
                            id=row["id"], case_type=row["case_type"], project_scope=row["project_scope"],
                            project_id=row.get("project_id"), classification=row["classification"],
                            identity_status=row["identity_status"], status=row["status"],
                            received_on=row["received_on"], external_reference=row.get("external_reference", ""),
                            target_response_on=row.get("target_response_on", ""),
                            target_rule_reference=row.get("target_rule_reference", ""),
                            response_on=row.get("response_on", ""), response_reference=row.get("response_reference", ""),
                            owner_user_id=row["owner_user_id"], created_by=row["created_by"], updated_by=row["updated_by"],
                            created_at=_datetime_from_backup(row.get("created_at")) or now,
                            updated_at=_datetime_from_backup(row.get("updated_at")) or now,
                        ))
                    for row in data["visit_authorizations"]:
                        session.add(ProjectVisitAuthorization(
                            id=row["id"], project_id=row["project_id"], status=row["status"],
                            site_access_reference=row["site_access_reference"],
                            privacy_reference=row["privacy_reference"], method_reference=row["method_reference"],
                            sst_reference=row["sst_reference"], valid_until=date.fromisoformat(row["valid_until"]),
                            created_by=row["created_by"], approved_at=_datetime_from_backup(row.get("approved_at")) or now,
                            revoked_by=row.get("revoked_by"), revoked_at=_datetime_from_backup(row.get("revoked_at")),
                            revocation_reason=row.get("revocation_reason", ""),
                            created_at=_datetime_from_backup(row.get("created_at")) or now,
                        ))
                    for row in data["audit_events"]:
                        session.add(AuditEvent(
                            id=row["id"], project_id=row.get("project_id"), actor_id=row["actor_id"],
                            action=row["action"], entity_type=row["entity_type"], entity_id=row["entity_id"],
                            detail=sanitize_audit_detail(row["action"], row["detail"]),
                            created_at=_datetime_from_backup(row.get("created_at")) or now,
                        ))
                    session.flush()
                    session.add(AuditEvent(
                        project_id=None, actor_id=bootstrap.id, action="backup_restored",
                        entity_type="workspace", entity_id=bootstrap.id,
                        detail={
                            "source_created_at": manifest.get("created_at"),
                            "counts": manifest.get("counts", {}),
                            "legacy_unverifiable_form_signatures": manifest.get("legacy_unverifiable_form_signatures", 0),
                        },
                    ))
        except Exception:
            for key in written_keys:
                try:
                    evidence_storage.delete(key)
                except Exception:
                    logger.exception("No se pudo limpiar la evidencia restaurada %s", key)
            raise

    return {
        "admin_email": email,
        "counts": manifest.get("counts", {}),
        "legacy_unverifiable_form_signatures": manifest.get("legacy_unverifiable_form_signatures", 0),
        "expired_pending_invitations": sum(1 for row in data["invitations"] if row.get("accepted_at") is None),
    }


def create_drive_backup(session: Session, actor_id: str) -> Backup:
    """Build, verify, and upload a backup to the connected personal Drive."""
    from .drive import DriveSetupError, get_connection, upload_backup

    if not getattr(settings, "drive_external_actions_enabled", False):
        raise DriveSetupError(
            "La carga a Drive solo se habilita desde staging/producción persistentes con los gates aprobados."
        )
    connection = get_connection(session)
    if not connection:
        raise DriveSetupError("Primero conecta tu Drive personal desde GREENATICS RED.")
    backup = Backup(id=new_id(), status="iniciado", created_by=actor_id)
    session.add(backup)
    session.commit()
    filename = ""
    digest = ""
    archive_size = 0
    archive_file: BinaryIO | None = None
    try:
        archive_file, counts = build_backup_archive_spooled(session)
        with archive_file:
            verified_manifest = _verify_backup_archive_source(archive_file)
            counts = {
                **counts,
                "legacy_unverifiable_form_signatures": verified_manifest.get("legacy_unverifiable_form_signatures", 0),
            }
            archive_file.seek(0, 2)
            archive_size = archive_file.tell()
            archive_file.seek(0)
            digest_builder = hashlib.sha256()
            for chunk in iter(lambda: archive_file.read(1024 * 1024), b""):
                digest_builder.update(chunk)
            digest = digest_builder.hexdigest()
            archive_file.seek(0)
            filename = f"GREENATICS_RED_respaldo_{now_utc().strftime('%Y%m%d_%H%M%S_UTC')}.zip"
            result = upload_backup(connection, filename, archive_file)
        backup.status = "completado"
        backup.drive_file_id = str(result["id"])
        backup.drive_file_name = filename
        backup.drive_folder_id = connection.backup_folder_id
        backup.sha256 = digest
        backup.bytes_total = archive_size
        backup.summary = counts
        backup.completed_at = now_utc()
        connection.last_backup_at = backup.completed_at
        session.add(AuditEvent(
            project_id=None, actor_id=actor_id, action="backup_uploaded",
            entity_type="backup", entity_id=backup.id,
            detail={"drive_file_id": backup.drive_file_id, "sha256": digest, "counts": counts},
        ))
        session.commit()
        return backup
    except Exception as exc:
        uploaded_file_id = str(getattr(exc, "uploaded_file_id", ""))
        session.rollback()
        backup = session.get(Backup, backup.id)
        if backup:
            backup.status = "fallido"
            backup.summary = {"error": str(exc)[:500]}
            backup.completed_at = now_utc()
            if uploaded_file_id:
                # Keep a reference to the unverified Drive object so an admin
                # can inspect it; it must never satisfy /api/ready.
                backup.drive_file_id = uploaded_file_id
                backup.drive_file_name = filename
                backup.drive_folder_id = connection.backup_folder_id
                backup.sha256 = digest
                backup.bytes_total = archive_size
            session.add(AuditEvent(
                project_id=None, actor_id=actor_id, action="backup_failed",
                entity_type="backup", entity_id=backup.id,
                detail={"error": str(exc)[:200], "uploaded_file_id": uploaded_file_id},
            ))
            session.commit()
        raise


def download_drive_backup(session: Session, backup: Backup, actor_id: str, destination: str | Path) -> dict:
    """Retrieve a completed backup from the connected private Drive and verify it before use."""
    from .drive import DriveSetupError, download_backup_archive, get_connection

    connection = get_connection(session)
    if not connection:
        raise DriveSetupError("No hay un Drive personal conectado a GREENATICS RED.")
    if (
        backup.status != "completado"
        or backup.drive_folder_id != connection.backup_folder_id
    ):
        raise DriveSetupError("El respaldo no está completo o pertenece a otra carpeta Drive.")
    result = download_backup_archive(connection, backup, destination)
    try:
        manifest = verify_backup_archive(destination)
    except (OSError, ValueError, KeyError, zipfile.BadZipFile) as exc:
        try:
            Path(destination).unlink()
        except FileNotFoundError:
            pass
        raise ValueError("El archivo descargado no supera la verificación interna del ZIP RED.") from exc
    session.add(AuditEvent(
        project_id=None,
        actor_id=actor_id,
        action="backup_downloaded",
        entity_type="backup",
        entity_id=backup.id,
        detail={
            "drive_file_id": backup.drive_file_id,
            "sha256": result["sha256"],
            "bytes_total": result["bytes_total"],
            "output_name": Path(destination).name,
        },
    ))
    session.commit()
    return {**result, "manifest": manifest}
