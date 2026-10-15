#!/usr/bin/env python3
"""Run RED on an isolated copy of an empty, synthetic Bello preview database."""

from __future__ import annotations

import argparse
import os
import secrets
import shutil
import socket
import sqlite3
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parents[1]
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

from app.initial_projects import BELLO_PROJECTS


EXPECTED_REVISION = "0020_form_signature_snapshots"
MIGRATABLE_REVISIONS = {
    "0015_project_visit_authorization", "0016_idempotent_evidence_uploads",
    "0017_project_identity_confirmation", "0018_project_identity_ph_confirmation",
    "0019_evidence_storage_quotas",
}
EMPTY_TABLES = {
    "red_project_memberships": "membresías",
    "red_invitations": "invitaciones",
    "red_form_records": "registros de formulario",
    "red_form_revisions": "revisiones de formularios",
    "red_form_signatures": "firmas de formularios",
    "red_pmirs_items": "objetos PMIRS",
    "red_pmirs_item_revisions": "revisiones de objetos PMIRS",
    "red_pmirs_versions": "versiones PMIRS",
    "red_pmirs_signatures": "firmas PMIRS",
    "red_project_visit_authorizations": "autorizaciones de visita",
    "red_evidence_files": "evidencias",
    "red_operational_references": "referencias operativas",
    "red_backups": "respaldos registrados",
    "red_drive_connection": "conexiones Drive",
    "red_privacy_cases": "casos de privacidad",
    "red_password_resets": "restablecimientos de contraseña",
    "red_login_throttles": "controles de acceso",
}
SAFE_SOURCE_PREFIXES = ("greenatics-red-preview-", "greenatics-red-updated-preview.")
SAFE_ORIGIN_NOTES = {
    "Nombre suministrado por el usuario; pendiente de validar con la copropiedad. Expediente inicial vacío, sin datos operativos precargados.",
    "Nombre recibido para estructurar uno de los primeros cuatro PMIRS. Dirección, datos y alcance pendientes de validación con la copropiedad.",
}


def _tables(connection: sqlite3.Connection) -> set[str]:
    return {
        row[0]
        for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")
    }


def validate_synthetic_preview(
    connection: sqlite3.Connection,
    *,
    discard_login_throttles: bool = False,
    allow_migratable_revision: bool = False,
) -> dict[str, int]:
    """Reject anything except the deliberately empty, local Bello preview fixture."""
    tables = _tables(connection)
    required = {
        "alembic_version", "red_projects", "red_users", "red_audit_events", *EMPTY_TABLES,
    }
    missing = required - tables
    if missing:
        raise ValueError("La base no tiene el esquema RED esperado; no se copiará.")

    integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
    if integrity != "ok":
        raise ValueError("La base sintética no pasó la verificación de integridad.")
    revisions = [row[0] for row in connection.execute("SELECT version_num FROM alembic_version")]
    valid_revisions = {EXPECTED_REVISION}
    if allow_migratable_revision:
        valid_revisions.update(MIGRATABLE_REVISIONS)
    if len(revisions) != 1 or revisions[0] not in valid_revisions:
        raise ValueError("La base debe estar en la revisión RED 0020 antes de copiarla.")

    project_rows = list(connection.execute(
        "SELECT slug, name, municipality, department, status, baseline_status, "
        "baseline_reference, baseline_note, baseline_reviewed_by, baseline_reviewed_at, "
        "origin, origin_note FROM red_projects"
    ))
    expected_projects = dict(BELLO_PROJECTS)
    if {row[0] for row in project_rows} != set(expected_projects):
        raise ValueError("La copia solo admite los cuatro expedientes sintéticos iniciales de Bello.")
    for row in project_rows:
        (slug, name, municipality, department, status, baseline_status, baseline_reference,
         baseline_note, baseline_reviewed_by, baseline_reviewed_at, origin, origin_note) = row
        if (
            name != expected_projects[slug] or municipality != "Bello" or department != "Antioquia"
            or status != "preparacion" or baseline_status != "no_iniciada"
            or baseline_reference or baseline_note or baseline_reviewed_by or baseline_reviewed_at
            or origin != "instruccion_usuario" or origin_note not in SAFE_ORIGIN_NOTES
        ):
            raise ValueError("Un expediente ya contiene personalización o datos; no se copiará.")
    if revisions[0] == EXPECTED_REVISION:
        identity_rows = list(connection.execute(
            "SELECT address, identity_status, identity_reference, identity_confirmed_by, identity_confirmed_role, identity_confirmed_at "
            "FROM red_projects"
        ))
        if any(row != ("", "pendiente", "", None, None, None) for row in identity_rows):
            raise ValueError("La copia solo admite expedientes con identidad pendiente y sin datos de dirección.")

    users = list(connection.execute(
        "SELECT email, full_name, active, is_platform_admin FROM red_users"
    ))
    if len(users) != 1 or not users[0][2] or not users[0][3]:
        raise ValueError("La copia requiere una sola cuenta administradora sintética activa.")
    email = str(users[0][0]).strip().lower()
    if not (email.endswith(".local") or email.endswith(".test")):
        raise ValueError("La cuenta de la base no tiene un dominio local sintético.")
    normalized_name = "".join(
        char for char in unicodedata.normalize("NFKD", str(users[0][1]).casefold())
        if not unicodedata.combining(char)
    )
    if not any(label in normalized_name for label in ("demo", "practic", "sintetic")):
        raise ValueError("El nombre de la cuenta no está identificado como sintético.")

    counts = {"proyectos": len(project_rows), "cuentas": len(users)}
    nonempty = []
    for table, label in EMPTY_TABLES.items():
        count = int(connection.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0])
        if count and not (discard_login_throttles and table == "red_login_throttles"):
            nonempty.append(label)
        counts[label] = count
    if nonempty:
        raise ValueError(
            "La base ya contiene información de trabajo (" + ", ".join(nonempty)
            + "); no se copiará con esta herramienta de preview vacío."
        )
    if int(connection.execute("SELECT COUNT(*) FROM red_audit_events").fetchone()[0]) > 20:
        raise ValueError("La bitácora supera el límite sintético permitido para esta copia.")
    counts["eventos de auditoría"] = int(
        connection.execute("SELECT COUNT(*) FROM red_audit_events").fetchone()[0]
    )
    return counts


def validate_source_path(path: Path) -> Path:
    resolved = path.expanduser().resolve(strict=True)
    if not resolved.is_file() or resolved.name != "red-preview.sqlite3":
        raise ValueError("Indica el archivo red-preview.sqlite3 de una instancia local.")
    if not resolved.parent.name.startswith(SAFE_SOURCE_PREFIXES):
        raise ValueError("La carpeta de origen no tiene el prefijo reservado para previews sintéticos.")
    if resolved.is_relative_to(PROJECT_DIR):
        raise ValueError("No se permite usar una base dentro del checkout RED.")
    safe_roots = (Path(tempfile.gettempdir()).resolve(), Path("/private/tmp").resolve(), Path("/tmp").resolve())
    if not any(resolved.is_relative_to(root) for root in safe_roots):
        raise ValueError("El origen debe estar en una carpeta temporal local.")
    return resolved


def _port_is_available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind(("127.0.0.1", port))
        except OSError:
            return False
    return True


def _upgrade_preview_database(database_path: Path, root: Path) -> None:
    env = os.environ.copy()
    env.update({
        "APP_ENV": "local",
        "INSTANCE_DIR": str(root),
        "DATABASE_URL": f"sqlite:///{database_path}",
        "DATABASE_SCHEMA": "",
        "RED_STORAGE_ROOT": str(root / "storage"),
        "STORAGE_BACKEND": "local",
        "SESSION_SECRET": secrets.token_urlsafe(48),
    })
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=PROJECT_DIR, env=env, check=False, capture_output=True, text=True, timeout=60,
    )
    if result.returncode != 0:
        raise RuntimeError("No se pudo actualizar la copia temporal a RED 0020: " + result.stdout + result.stderr)


def create_preview_copy(source: Path) -> tuple[Path, dict[str, int]]:
    source_path = validate_source_path(source)

    source_uri = source_path.as_uri() + "?mode=ro"
    with sqlite3.connect(source_uri, uri=True) as source_connection:
        source_connection.execute("PRAGMA query_only=ON")
        counts = validate_synthetic_preview(
            source_connection, discard_login_throttles=True, allow_migratable_revision=True,
        )
        source_revision = source_connection.execute("SELECT version_num FROM alembic_version").fetchone()[0]
        root = Path(tempfile.mkdtemp(prefix="greenatics-red-preview-copy-"))
        root.chmod(0o700)
        destination = root / "red-preview.sqlite3"
        try:
            with sqlite3.connect(destination) as target_connection:
                source_connection.backup(target_connection)
                # Keep the source intact; start the disposable copy with fresh security/audit metadata.
                target_connection.execute("DELETE FROM red_audit_events")
                # Login throttle keys are ephemeral security metadata; never carry them into a preview copy.
                target_connection.execute("DELETE FROM red_login_throttles")
                target_connection.execute("PRAGMA journal_mode=DELETE")
                target_connection.commit()
            (root / "storage").mkdir(mode=0o700)
            if source_revision in MIGRATABLE_REVISIONS:
                _upgrade_preview_database(destination, root)
            destination.chmod(0o600)
            with sqlite3.connect(f"file:{destination}?mode=ro", uri=True) as copied:
                copied.execute("PRAGMA query_only=ON")
                copied_counts = validate_synthetic_preview(copied)
                source_counts_without_history = {
                    key: value for key, value in counts.items()
                    if key not in {"eventos de auditoría", "controles de acceso"}
                }
                copied_counts_without_history = {
                    key: value for key, value in copied_counts.items()
                    if key not in {"eventos de auditoría", "controles de acceso"}
                }
                if (
                    copied_counts_without_history != source_counts_without_history
                    or copied_counts["eventos de auditoría"] != 0
                    or copied_counts["controles de acceso"] != 0
                ):
                    raise ValueError("La copia no coincide con el origen validado.")
            return root, copied_counts
        except Exception:
            shutil.rmtree(root, ignore_errors=True)
            raise


def run_preview(root: Path, port: int) -> int:
    env = os.environ.copy()
    for name in (
        "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI",
        "TOKEN_ENCRYPTION_KEY", "S3_ACCESS_KEY", "S3_SECRET_KEY", "S3_BUCKET",
        "S3_ENDPOINT_URL", "S3_REGION",
        "RED_PRIVACY_APPROVED", "RED_PRIVACY_APPROVAL_REFERENCE",
        "RED_SUPERVISED_PILOT_APPROVED", "RED_SUPERVISED_PILOT_APPROVAL_REFERENCE",
        "RENDER", "RED_DATABASE_ISOLATION_REFERENCE",
    ):
        env.pop(name, None)
    env.update({
        "APP_ENV": "local",
        "INSTANCE_DIR": str(root),
        "DATABASE_URL": f"sqlite:///{root / 'red-preview.sqlite3'}",
        "RED_STORAGE_ROOT": str(root / "storage"),
        "STORAGE_BACKEND": "local",
        "RED_OPERATIONAL_WRITES_ENABLED": "true",
        "RED_PUBLIC_ACCESS_ENABLED": "false",
        "RED_PUBLIC_SITE_ORIGINS": "",
        "DATABASE_SCHEMA": "",
        "SESSION_SECRET": secrets.token_urlsafe(48),
        "SESSION_COOKIE_NAME": "greenatics_red_preview_" + secrets.token_hex(6),
        "SESSION_HTTPS_ONLY": "false",
        "TRUSTED_HOSTS": "127.0.0.1,localhost",
        "PUBLIC_BASE_URL": f"http://127.0.0.1:{port}",
    })
    print(f"Preview local sintético: http://127.0.0.1:{port}/login", flush=True)
    print(f"Base y archivos aislados: {root}", flush=True)
    print("Acceso público y OAuth/Drive: desactivados. No uses datos reales.", flush=True)
    return subprocess.run(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1",
         "--port", str(port), "--no-proxy-headers"],
        cwd=PROJECT_DIR, env=env, check=False,
    ).returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Clona y ejecuta una base RED vacía de capacitación; no admite expedientes con registros."
    )
    parser.add_argument("--source-db", required=True, type=Path, help="red-preview.sqlite3 sintético en /private/tmp")
    parser.add_argument("--port", type=int, default=18796, help="puerto local loopback (predeterminado: 18796)")
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535 or not _port_is_available(args.port):
        print(f"No se creó el preview: el puerto local {args.port} no está disponible.", file=sys.stderr)
        return 2
    try:
        root, counts = create_preview_copy(args.source_db)
    except (OSError, sqlite3.Error, ValueError) as exc:
        print(f"No se creó el preview: {exc}", file=sys.stderr)
        return 2
    print(f"Fixture validado: {counts['proyectos']} proyectos; {counts['cuentas']} cuenta sintética; sin datos de trabajo.", flush=True)
    return run_preview(root, args.port)


if __name__ == "__main__":
    raise SystemExit(main())
