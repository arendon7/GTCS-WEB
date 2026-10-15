from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid4())


class User(Base):
    __tablename__ = "red_users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    password_hash: Mapped[str] = mapped_column(String(255))
    is_platform_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    session_version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Project(Base):
    __tablename__ = "red_projects"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(240))
    municipality: Mapped[str] = mapped_column(String(120), default="Bello")
    department: Mapped[str] = mapped_column(String(120), default="Antioquia")
    address: Mapped[str] = mapped_column(String(500), default="")
    identity_status: Mapped[str] = mapped_column(String(24), default="pendiente")
    identity_reference: Mapped[str] = mapped_column(String(160), default="")
    identity_confirmed_by: Mapped[str | None] = mapped_column(ForeignKey("red_users.id"), nullable=True)
    identity_confirmed_role: Mapped[str | None] = mapped_column(String(32), nullable=True)
    identity_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="preparacion")
    baseline_status: Mapped[str] = mapped_column(String(32), default="no_iniciada")
    baseline_reference: Mapped[str] = mapped_column(Text, default="")
    baseline_note: Mapped[str] = mapped_column(Text, default="")
    baseline_reviewed_by: Mapped[str | None] = mapped_column(ForeignKey("red_users.id"), nullable=True)
    baseline_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    origin: Mapped[str] = mapped_column(String(80), default="instruccion_usuario")
    origin_note: Mapped[str] = mapped_column(Text, default="Nombre suministrado por el usuario; pendiente de validar con la copropiedad.")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class ProjectMembership(Base):
    __tablename__ = "red_project_memberships"
    __table_args__ = (UniqueConstraint("project_id", "user_id", name="uq_red_project_user"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("red_users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(40), default="consultor")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class ProjectVisitAuthorization(Base):
    """Human-reviewed, project-scoped authorization required before field writes."""
    __tablename__ = "red_project_visit_authorizations"
    __table_args__ = (Index("ix_red_visit_authorizations_project_created", "project_id", "created_at"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(20), default="approved")
    site_access_reference: Mapped[str] = mapped_column(String(160))
    privacy_reference: Mapped[str] = mapped_column(String(160))
    method_reference: Mapped[str] = mapped_column(String(160))
    sst_reference: Mapped[str] = mapped_column(String(160))
    valid_until: Mapped[date] = mapped_column(Date)
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    revoked_by: Mapped[str | None] = mapped_column(ForeignKey("red_users.id"), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revocation_reason: Mapped[str] = mapped_column(String(40), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Invitation(Base):
    __tablename__ = "red_invitations"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(320), index=True)
    full_name: Mapped[str] = mapped_column(String(200))
    project_id: Mapped[str | None] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), nullable=True)
    role: Mapped[str] = mapped_column(String(40), default="consultor")
    platform_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class PasswordReset(Base):
    __tablename__ = "red_password_resets"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(ForeignKey("red_users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class FormRecord(Base):
    __tablename__ = "red_form_records"
    __table_args__ = (Index("uq_red_form_records_submission_key", "submission_key", unique=True),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), index=True)
    form_code: Mapped[str] = mapped_column(String(12), index=True)
    title: Mapped[str] = mapped_column(String(300))
    status: Mapped[str] = mapped_column(String(32), default="RAW")
    record_date: Mapped[str] = mapped_column(String(10), default="")
    source_kind: Mapped[str] = mapped_column(String(32), default="declarado")
    source_note: Mapped[str] = mapped_column(Text, default="")
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    submission_key: Mapped[str | None] = mapped_column(String(64), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    updated_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    reviewed_by: Mapped[str | None] = mapped_column(ForeignKey("red_users.id"), nullable=True)
    review_note: Mapped[str] = mapped_column(Text, default="")
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)


class FormRevision(Base):
    __tablename__ = "red_form_revisions"
    __table_args__ = (Index("uq_red_form_revisions_submission_key", "submission_key", unique=True),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    record_id: Mapped[str] = mapped_column(ForeignKey("red_form_records.id", ondelete="CASCADE"), index=True)
    revision: Mapped[int] = mapped_column(Integer)
    payload: Mapped[dict] = mapped_column(JSON)
    note: Mapped[str] = mapped_column(Text, default="")
    submission_key: Mapped[str | None] = mapped_column(String(64), nullable=True)
    changed_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class FormSignature(Base):
    """Authenticated handwritten acknowledgement bound to one exact form-record version."""
    __tablename__ = "red_form_signatures"
    __table_args__ = (UniqueConstraint("record_id", "signer_user_id", "document_sha256", name="uq_red_form_signature_signer_document"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), index=True)
    record_id: Mapped[str] = mapped_column(ForeignKey("red_form_records.id", ondelete="CASCADE"), index=True)
    record_version: Mapped[int] = mapped_column(Integer)
    signer_user_id: Mapped[str] = mapped_column(ForeignKey("red_users.id"), index=True)
    signer_name: Mapped[str] = mapped_column(String(200))
    signer_email: Mapped[str] = mapped_column(String(320))
    signer_role: Mapped[str] = mapped_column(String(40))
    declaration: Mapped[str] = mapped_column(Text)
    signature_path: Mapped[str] = mapped_column(Text)
    document_sha256: Mapped[str] = mapped_column(String(64))
    document_snapshot: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    snapshot_status: Mapped[str] = mapped_column(String(32), default="legacy_unverifiable", nullable=False)
    signed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class PMIRSItem(Base):
    """Structured PMIRS Studio object (finding, program, action or indicator)."""
    __tablename__ = "red_pmirs_items"
    __table_args__ = (UniqueConstraint("project_id", "code", name="uq_red_pmirs_project_code"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), index=True)
    item_type: Mapped[str] = mapped_column(String(24), index=True)
    code: Mapped[str] = mapped_column(String(24))
    title: Mapped[str] = mapped_column(String(240))
    description: Mapped[str] = mapped_column(Text, default="")
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    review_status: Mapped[str] = mapped_column(String(32), default="RAW")
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    updated_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    reviewed_by: Mapped[str | None] = mapped_column(ForeignKey("red_users.id"), nullable=True)
    review_note: Mapped[str] = mapped_column(Text, default="")
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)


class PMIRSItemRevision(Base):
    __tablename__ = "red_pmirs_item_revisions"
    __table_args__ = (
        UniqueConstraint("item_id", "revision", name="uq_red_pmirs_item_revision"),
        Index("uq_red_pmirs_item_revisions_submission_key", "submission_key", unique=True),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    item_id: Mapped[str] = mapped_column(ForeignKey("red_pmirs_items.id", ondelete="CASCADE"), index=True)
    revision: Mapped[int] = mapped_column(Integer)
    snapshot: Mapped[dict] = mapped_column(JSON)
    note: Mapped[str] = mapped_column(Text, default="")
    submission_key: Mapped[str | None] = mapped_column(String(64), nullable=True)
    changed_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class PMIRSVersion(Base):
    """Immutable document snapshot with a separately audited internal state."""
    __tablename__ = "red_pmirs_versions"
    __table_args__ = (UniqueConstraint("project_id", "version_label", name="uq_red_pmirs_project_version"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), index=True)
    previous_version_id: Mapped[str | None] = mapped_column(ForeignKey("red_pmirs_versions.id", ondelete="SET NULL"), nullable=True, index=True)
    version_label: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), default="borrador")
    change_summary: Mapped[str] = mapped_column(Text)
    change_reason: Mapped[str] = mapped_column(String(80))
    snapshot: Mapped[dict] = mapped_column(JSON)
    baseline_reference: Mapped[str] = mapped_column(Text, default="")
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    status_changed_by: Mapped[str | None] = mapped_column(ForeignKey("red_users.id"), nullable=True)
    status_changed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status_note: Mapped[str] = mapped_column(Text, default="")


class PMIRSSignature(Base):
    """Authenticated handwritten electronic-signature capture for one immutable PMIRS version."""
    __tablename__ = "red_pmirs_signatures"
    __table_args__ = (UniqueConstraint("version_id", "signer_user_id", name="uq_red_pmirs_signature_signer_version"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), index=True)
    version_id: Mapped[str] = mapped_column(ForeignKey("red_pmirs_versions.id", ondelete="CASCADE"), index=True)
    signer_user_id: Mapped[str] = mapped_column(ForeignKey("red_users.id"), index=True)
    signer_name: Mapped[str] = mapped_column(String(200))
    signer_email: Mapped[str] = mapped_column(String(320))
    signer_role: Mapped[str] = mapped_column(String(40))
    declaration: Mapped[str] = mapped_column(Text)
    signature_path: Mapped[str] = mapped_column(Text)
    document_sha256: Mapped[str] = mapped_column(String(64))
    signed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class EvidenceFile(Base):
    __tablename__ = "red_evidence_files"
    __table_args__ = (Index("uq_red_evidence_files_submission_key", "submission_key", unique=True),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), index=True)
    record_id: Mapped[str | None] = mapped_column(ForeignKey("red_form_records.id", ondelete="CASCADE"), nullable=True, index=True)
    pmirs_item_id: Mapped[str | None] = mapped_column(ForeignKey("red_pmirs_items.id", ondelete="CASCADE"), nullable=True, index=True)
    field_id: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    original_name: Mapped[str] = mapped_column(String(255))
    storage_name: Mapped[str] = mapped_column(String(255), unique=True)
    media_type: Mapped[str] = mapped_column(String(120), default="application/octet-stream")
    size_bytes: Mapped[int] = mapped_column(Integer)
    sha256: Mapped[str] = mapped_column(String(64))
    submission_key: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class EvidenceQuotaLock(Base):
    """Single transactional mutex for aggregate evidence capacity checks."""
    __tablename__ = "red_evidence_quota_locks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    generation: Mapped[int] = mapped_column(Integer, default=0)


class OperationalReference(Base):
    """Project-scoped operational documents, with approval separate from upload."""
    __tablename__ = "red_operational_references"
    __table_args__ = (
        UniqueConstraint("project_id", "category", "version_label", name="uq_red_operational_reference_version"),
        Index("ix_red_operational_reference_current", "project_id", "category", "status", "created_at"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str] = mapped_column(ForeignKey("red_projects.id", ondelete="CASCADE"), index=True)
    category: Mapped[str] = mapped_column(String(40), index=True)
    title: Mapped[str] = mapped_column(String(240))
    version_label: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(32), default="pendiente_revision", index=True)
    source_note: Mapped[str] = mapped_column(Text, default="")
    review_note: Mapped[str] = mapped_column(Text, default="")
    evidence_id: Mapped[str] = mapped_column(ForeignKey("red_evidence_files.id", ondelete="RESTRICT"), unique=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    reviewed_by: Mapped[str | None] = mapped_column(ForeignKey("red_users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AuditEvent(Base):
    __tablename__ = "red_audit_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    project_id: Mapped[str | None] = mapped_column(ForeignKey("red_projects.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_id: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    action: Mapped[str] = mapped_column(String(80))
    entity_type: Mapped[str] = mapped_column(String(80))
    entity_id: Mapped[str] = mapped_column(String(36))
    detail: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class DriveConnection(Base):
    __tablename__ = "red_drive_connection"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    connected_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    google_email: Mapped[str] = mapped_column(String(320), default="")
    encrypted_refresh_token: Mapped[str] = mapped_column(Text)
    backup_folder_id: Mapped[str] = mapped_column(String(160), default="")
    connected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    last_backup_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Backup(Base):
    __tablename__ = "red_backups"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    status: Mapped[str] = mapped_column(String(24), default="iniciado")
    drive_file_id: Mapped[str] = mapped_column(String(160), default="")
    drive_file_name: Mapped[str] = mapped_column(String(255), default="")
    drive_folder_id: Mapped[str] = mapped_column(String(160), default="")
    sha256: Mapped[str] = mapped_column(String(64), default="")
    bytes_total: Mapped[int] = mapped_column(Integer, default=0)
    summary: Mapped[dict] = mapped_column(JSON, default=dict)
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class PrivacyCase(Base):
    """Minimal administrative log; identifying correspondence stays outside RED."""
    __tablename__ = "red_privacy_cases"
    __table_args__ = (
        Index("ix_red_privacy_case_queue", "status", "created_at"),
        Index("ix_red_privacy_case_project", "project_id", "created_at"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    case_type: Mapped[str] = mapped_column(String(40))
    project_scope: Mapped[str] = mapped_column(String(24))
    project_id: Mapped[str | None] = mapped_column(ForeignKey("red_projects.id", ondelete="SET NULL"), nullable=True, index=True)
    classification: Mapped[str] = mapped_column(String(24), default="pendiente")
    identity_status: Mapped[str] = mapped_column(String(32), default="pendiente")
    status: Mapped[str] = mapped_column(String(32), default="recibida", index=True)
    received_on: Mapped[str] = mapped_column(String(10))
    external_reference: Mapped[str] = mapped_column(String(160), default="")
    target_response_on: Mapped[str] = mapped_column(String(10), default="")
    target_rule_reference: Mapped[str] = mapped_column(String(240), default="")
    response_on: Mapped[str] = mapped_column(String(10), default="")
    response_reference: Mapped[str] = mapped_column(String(160), default="")
    owner_user_id: Mapped[str] = mapped_column(ForeignKey("red_users.id", ondelete="RESTRICT"), index=True)
    created_by: Mapped[str] = mapped_column(ForeignKey("red_users.id", ondelete="RESTRICT"))
    updated_by: Mapped[str] = mapped_column(ForeignKey("red_users.id", ondelete="RESTRICT"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)


class LoginThrottle(Base):
    __tablename__ = "red_login_throttles"
    __table_args__ = (Index("ix_red_login_throttles_window_start", "window_start"),)
    key: Mapped[str] = mapped_column(String(128), primary_key=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    blocked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
