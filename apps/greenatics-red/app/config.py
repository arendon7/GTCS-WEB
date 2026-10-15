from __future__ import annotations

import os
import re
import secrets
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlsplit

from cryptography.fernet import Fernet

PROJECT_DIR = Path(__file__).resolve().parents[1]
INSTANCE_DIR = Path(
    os.environ.get("INSTANCE_DIR", PROJECT_DIR / "instance" / "local-dev")
).resolve()
INSTANCE_DIR.mkdir(parents=True, exist_ok=True)


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "si", "sí", "on"}


def normalize_database_url(value: str) -> str:
    value = value.strip()
    for prefix in ("postgresql://", "postgres://"):
        if value.startswith(prefix):
            return "postgresql+psycopg://" + value[len(prefix):]
    return value


@dataclass(frozen=True)
class Settings:
    app_env: str = os.environ.get("APP_ENV", "local").strip().lower()
    database_url: str = normalize_database_url(os.environ.get(
        "DATABASE_URL", f"sqlite:///{INSTANCE_DIR / 'greenatics_red.sqlite3'}"
    ))
    # Hosted RED must use its own PostgreSQL database. Keep DATABASE_SCHEMA
    # empty there; local isolated migration tests may use a dedicated schema.
    database_schema: str = os.environ.get("DATABASE_SCHEMA", "").strip()
    database_isolation_reference: str = field(
        default_factory=lambda: os.environ.get("RED_DATABASE_ISOLATION_REFERENCE", "").strip()
    )
    session_secret: str = os.environ.get("SESSION_SECRET", secrets.token_urlsafe(48))
    session_cookie_name: str = os.environ.get("SESSION_COOKIE_NAME", "greenatics_red_session").strip()
    session_https_only: bool = env_bool("SESSION_HTTPS_ONLY", False)
    trusted_hosts: tuple[str, ...] = tuple(
        item.strip() for item in os.environ.get("TRUSTED_HOSTS", "localhost,127.0.0.1,testserver").split(",")
        if item.strip()
    )
    trusted_client_ip_header: str = os.environ.get("TRUSTED_CLIENT_IP_HEADER", "").strip()
    public_base_url: str = os.environ.get("PUBLIC_BASE_URL", "http://127.0.0.1:8787").rstrip("/")
    storage_root: Path = Path(os.environ.get("RED_STORAGE_ROOT", INSTANCE_DIR / "private")).resolve()
    storage_backend: str = os.environ.get("STORAGE_BACKEND", "local").strip().lower()
    s3_bucket: str = os.environ.get("S3_BUCKET", "").strip()
    s3_endpoint_url: str = os.environ.get("S3_ENDPOINT_URL", "").strip()
    s3_region: str = os.environ.get("S3_REGION", "us-east-1").strip()
    s3_access_key: str = os.environ.get("S3_ACCESS_KEY", "").strip()
    s3_secret_key: str = os.environ.get("S3_SECRET_KEY", "")
    max_upload_mb: int = int(os.environ.get("RED_MAX_UPLOAD_MB", "20"))
    max_evidence_total_mb: int = int(os.environ.get("RED_MAX_EVIDENCE_TOTAL_MB", "1024"))
    max_evidence_project_mb: int = int(os.environ.get("RED_MAX_EVIDENCE_PROJECT_MB", "256"))
    google_client_id: str = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
    google_client_secret: str = os.environ.get("GOOGLE_CLIENT_SECRET", "").strip()
    google_redirect_uri: str = os.environ.get("GOOGLE_REDIRECT_URI", "").strip()
    token_encryption_key: str = os.environ.get("TOKEN_ENCRYPTION_KEY", "").strip()
    red_public_access_enabled: bool = env_bool("RED_PUBLIC_ACCESS_ENABLED", False)
    red_privacy_approved: bool = field(default_factory=lambda: env_bool("RED_PRIVACY_APPROVED", False))
    red_supervised_pilot_approved: bool = field(default_factory=lambda: env_bool("RED_SUPERVISED_PILOT_APPROVED", False))
    red_privacy_approval_reference: str = field(default_factory=lambda: os.environ.get("RED_PRIVACY_APPROVAL_REFERENCE", "").strip())
    red_supervised_pilot_approval_reference: str = field(default_factory=lambda: os.environ.get("RED_SUPERVISED_PILOT_APPROVAL_REFERENCE", "").strip())
    public_site_origins: tuple[str, ...] = tuple(
        item.strip() for item in os.environ.get("RED_PUBLIC_SITE_ORIGINS", "").split(",") if item.strip()
    )
    schema_name_pattern: str = r"[A-Za-z_][A-Za-z0-9_]*"

    def __post_init__(self) -> None:
        if self.app_env not in {"local", "staging", "production"}:
            raise ValueError("APP_ENV debe ser exactamente local, staging o production.")
        if os.environ.get("RENDER", "").strip().lower() == "true" and self.app_env == "local":
            raise ValueError("APP_ENV=local no está permitido en Render; configura staging o production.")
        if self.database_schema and not re.fullmatch(self.schema_name_pattern, self.database_schema):
            raise ValueError("DATABASE_SCHEMA debe ser un identificador PostgreSQL simple y seguro.")
        if self.database_schema and not self.database_url.startswith("postgresql"):
            raise ValueError("DATABASE_SCHEMA requiere PostgreSQL.")
        if self.app_env in {"staging", "production"} and self.database_schema:
            raise ValueError(
                "GREENATICS RED requiere una base PostgreSQL exclusiva; "
                "DATABASE_SCHEMA debe permanecer vacío en staging y producción."
            )
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", self.session_cookie_name):
            raise ValueError("SESSION_COOKIE_NAME solo puede contener letras, números, guion y guion bajo (máximo 64 caracteres).")
        if self.trusted_client_ip_header and self.trusted_client_ip_header.lower() != "cf-connecting-ip":
            raise ValueError("TRUSTED_CLIENT_IP_HEADER solo admite CF-Connecting-IP verificado por el proxy de Render.")
        if self.max_upload_mb < 1 or self.max_evidence_total_mb < 1 or self.max_evidence_project_mb < 1:
            raise ValueError("Los límites de carga y almacenamiento de evidencia deben ser enteros positivos.")
        if self.max_evidence_project_mb > self.max_evidence_total_mb:
            raise ValueError("RED_MAX_EVIDENCE_PROJECT_MB no puede superar RED_MAX_EVIDENCE_TOTAL_MB.")

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def operational_writes_requested(self) -> bool:
        return env_bool("RED_OPERATIONAL_WRITES_ENABLED", default=False)

    @property
    def operational_writes_enabled(self) -> bool:
        """Fail closed on deployed environments with an incomplete data runtime."""
        if not self.operational_writes_requested:
            return False
        return not self.operational_write_issues()

    @property
    def drive_external_actions_enabled(self) -> bool:
        """Allow OAuth and upload only from an approved, persistent hosted runtime."""
        return self.app_env in {"staging", "production"} and self.operational_writes_enabled

    def operational_write_issues(self) -> list[str]:
        if self.app_env not in {"staging", "production"}:
            return []
        issues = self._deployment_configuration_issues()
        issues.extend(self.operational_approval_issues())
        return issues

    def operational_approval_issues(self) -> list[str]:
        if self.app_env not in {"staging", "production"}:
            return []
        issues: list[str] = []
        if not self.red_privacy_approved:
            issues.append(
                "RED_PRIVACY_APPROVED debe aprobarse después de validar el aviso, las finalidades, la retención y los controles de datos de campo."
            )
        elif not self._valid_approval_reference(self.red_privacy_approval_reference):
            issues.append(
                "RED_PRIVACY_APPROVAL_REFERENCE debe identificar evidencia archivada con un código opaco (sin URL ni datos personales)."
            )
        if not self.red_supervised_pilot_approved:
            issues.append(
                "RED_SUPERVISED_PILOT_APPROVED requiere autorización escrita del piloto, alcance, unidades, fechas y responsables."
            )
        elif not self._valid_approval_reference(self.red_supervised_pilot_approval_reference):
            issues.append(
                "RED_SUPERVISED_PILOT_APPROVAL_REFERENCE debe identificar la autorización archivada con un código opaco (sin URL ni datos personales)."
            )
        return issues

    def database_migration_issues(self) -> list[str]:
        """Require a recorded isolation review before hosted Alembic changes a database."""
        if self.app_env not in {"staging", "production"}:
            return []
        if not self._valid_approval_reference(self.database_isolation_reference):
            return [
                "RED_DATABASE_ISOLATION_REFERENCE debe identificar la revisión archivada que confirma que DATABASE_URL apunta a una base dedicada a RED."
            ]
        return []

    @staticmethod
    def _valid_approval_reference(value: str) -> bool:
        return bool(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:-]{2,199}", value.strip()))

    @property
    def session_secret_configured(self) -> bool:
        return bool(os.environ.get("SESSION_SECRET", "").strip())

    @property
    def trusted_hosts_configured(self) -> bool:
        return bool(os.environ.get("TRUSTED_HOSTS", "").strip())

    @property
    def persistent_storage_configured(self) -> bool:
        return bool(os.environ.get("RED_STORAGE_ROOT", "").strip())

    @property
    def google_oauth_ready(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret and self.google_redirect_uri and self.token_encryption_key_valid)

    @property
    def token_encryption_key_valid(self) -> bool:
        try:
            Fernet(self.token_encryption_key.encode("ascii"))
        except (ValueError, UnicodeEncodeError):
            return False
        return True

    def production_issues(self) -> list[str]:
        issues = self._deployment_configuration_issues()
        issues.extend(self.operational_approval_issues())
        if not self.operational_writes_requested:
            issues.append("RED_OPERATIONAL_WRITES_ENABLED debe habilitarse solo después de completar las aprobaciones de privacidad y piloto supervisado.")
        elif self.operational_write_issues():
            issues.append("RED_OPERATIONAL_WRITES_ENABLED=true se ignora hasta completar la configuración segura del runtime.")
        if not self.red_public_access_enabled:
            issues.append("RED_PUBLIC_ACCESS_ENABLED sigue desactivado hasta aprobar el gate de acceso público.")
        elif not self.public_site_origins or any(
            self._normalize_site_origin(origin) is None for origin in self.public_site_origins
        ):
            issues.append("RED_PUBLIC_SITE_ORIGINS debe listar los orígenes HTTPS autorizados del sitio GREENATICS.")
        return issues

    def allows_public_site_origin(self, origin: str) -> bool:
        normalized = self._normalize_site_origin(origin)
        return bool(normalized and normalized in {
            allowed for item in self.public_site_origins
            if (allowed := self._normalize_site_origin(item)) is not None
        })

    @staticmethod
    def _normalize_site_origin(value: str) -> str | None:
        try:
            parsed = urlsplit(value.strip())
            if (
                parsed.scheme.lower() != "https"
                or not parsed.hostname
                or parsed.username
                or parsed.password
                or parsed.path not in {"", "/"}
                or parsed.query
                or parsed.fragment
            ):
                return None
            hostname = parsed.hostname.lower()
            if ":" in hostname:
                hostname = f"[{hostname}]"
            port = parsed.port
            return f"https://{hostname}" + (f":{port}" if port and port != 443 else "")
        except ValueError:
            return None

    def _deployment_configuration_issues(self) -> list[str]:
        issues: list[str] = []
        issues.extend(self.database_migration_issues())
        if self.database_schema:
            issues.append(
                "GREENATICS RED requiere una base PostgreSQL exclusiva; DATABASE_SCHEMA debe permanecer vacío en staging y producción."
            )
        if len(self.session_secret) < 32 or not self.session_secret_configured:
            issues.append("SESSION_SECRET debe tener al menos 32 caracteres aleatorios.")
        if not self.session_https_only:
            issues.append("SESSION_HTTPS_ONLY debe estar activo detrás de HTTPS.")
        if not self.public_base_url.startswith("https://"):
            issues.append("PUBLIC_BASE_URL debe usar HTTPS.")
        if not self.trusted_hosts_configured or not self.trusted_hosts or "*" in self.trusted_hosts:
            issues.append("TRUSTED_HOSTS debe limitarse a los dominios autorizados.")
        if self.app_env in {"staging", "production"} and self.trusted_client_ip_header.lower() != "cf-connecting-ip":
            issues.append("TRUSTED_CLIENT_IP_HEADER debe ser CF-Connecting-IP para aplicar límites de acceso por IP detrás de Render.")
        if self.storage_backend not in {"local", "filesystem", "s3"}:
            issues.append("STORAGE_BACKEND debe ser local, filesystem o s3.")
        elif self.storage_backend == "local":
            issues.append("Producción requiere almacenamiento persistente filesystem o s3-compatible.")
        elif self.storage_backend == "filesystem" and not self.persistent_storage_configured:
            issues.append("RED_STORAGE_ROOT debe apuntar al volumen persistente para evidencias.")
        elif self.storage_backend == "s3":
            if not self.s3_bucket:
                issues.append("S3_BUCKET debe identificar el bucket privado exclusivo de RED.")
            if bool(self.s3_access_key) != bool(self.s3_secret_key):
                issues.append("S3_ACCESS_KEY y S3_SECRET_KEY deben configurarse juntos.")
            if self.s3_endpoint_url and not (self.s3_access_key and self.s3_secret_key):
                issues.append("El endpoint S3 compatible requiere credenciales de acceso configuradas.")
            if self.s3_endpoint_url:
                try:
                    endpoint = urlsplit(self.s3_endpoint_url)
                    hostname = endpoint.hostname
                except ValueError:
                    endpoint = None
                    hostname = None
                local_http = (
                    self.app_env == "local"
                    and endpoint is not None
                    and endpoint.scheme == "http"
                    and hostname in {"localhost", "127.0.0.1", "::1"}
                )
                if (
                    endpoint is None
                    or not hostname
                    or endpoint.username is not None
                    or endpoint.password is not None
                    or endpoint.scheme not in {"https", "http"}
                    or (self.app_env in {"staging", "production"} and endpoint.scheme != "https")
                    or (self.app_env == "local" and endpoint.scheme == "http" and not local_http)
                ):
                    issues.append(
                        "S3_ENDPOINT_URL debe usar HTTPS en staging/production; HTTP solo se permite en localhost para desarrollo local."
                    )
        if not self.database_url.startswith("postgresql"):
            issues.append("Producción requiere PostgreSQL.")
        if not self.google_oauth_ready:
            issues.append("Falta configurar OAuth de Google para respaldos en el Drive personal.")
        elif self.app_env in {"staging", "production"}:
            redirect_is_https_same_origin = False
            try:
                public = urlsplit(self.public_base_url)
                redirect = urlsplit(self.google_redirect_uri)
                public_origin = (public.scheme, public.hostname, public.port or (443 if public.scheme == "https" else 80))
                redirect_origin = (redirect.scheme, redirect.hostname, redirect.port or (443 if redirect.scheme == "https" else 80))
                redirect_is_https_same_origin = (
                    redirect.scheme == "https"
                    and public_origin == redirect_origin
                    and redirect.path == "/drive/callback"
                    and not redirect.query
                    and not redirect.fragment
                )
            except ValueError:
                pass
            if not redirect_is_https_same_origin:
                issues.append("GOOGLE_REDIRECT_URI debe usar HTTPS y compartir el origen de PUBLIC_BASE_URL.")
        return issues


settings = Settings()
