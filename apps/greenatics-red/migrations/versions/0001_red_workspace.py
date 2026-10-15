"""Create isolated RED workspaces and seed the four client leads.

Revision ID: 0001_red_workspace
Revises:
Create Date: 2026-10-07
"""
from uuid import NAMESPACE_URL, uuid5

import sqlalchemy as sa
from alembic import op

revision = "0001_red_workspace"
down_revision = None
branch_labels = None
depends_on = None


PROJECTS = [
    ("bello-parque-alto", "Parque Alto - Apartamaentos"),
    ("bello-tulipanes", "Urbanización Tulipanes"),
    ("bello-majagua", "Majagua - Unidad Residencial"),
    ("bello-trigales", "Unidad Residencial Trigales"),
]


def upgrade() -> None:
    # Keep this schema snapshot immutable. Later migrations must add changes
    # explicitly instead of inheriting whatever app.models looks like today.
    op.create_table(
        "red_users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_platform_admin", sa.Boolean(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_red_users_email", "red_users", ["email"], unique=True)
    op.create_table(
        "red_projects",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=240), nullable=False),
        sa.Column("municipality", sa.String(length=120), nullable=False),
        sa.Column("department", sa.String(length=120), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("baseline_status", sa.String(length=32), nullable=False),
        sa.Column("baseline_reference", sa.Text(), nullable=False),
        sa.Column("baseline_note", sa.Text(), nullable=False),
        sa.Column("baseline_reviewed_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=True),
        sa.Column("baseline_reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("origin", sa.String(length=80), nullable=False),
        sa.Column("origin_note", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_red_projects_slug", "red_projects", ["slug"], unique=True)
    op.create_table(
        "red_project_memberships",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("red_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("red_users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("project_id", "user_id", name="uq_red_project_user"),
    )
    op.create_index("ix_red_project_memberships_project_id", "red_project_memberships", ["project_id"])
    op.create_index("ix_red_project_memberships_user_id", "red_project_memberships", ["user_id"])
    op.create_table(
        "red_invitations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("red_projects.id", ondelete="CASCADE"), nullable=True),
        sa.Column("role", sa.String(length=40), nullable=False),
        sa.Column("platform_admin", sa.Boolean(), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False, unique=True),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_red_invitations_email", "red_invitations", ["email"])
    op.create_table(
        "red_form_records",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("red_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("form_code", sa.String(length=12), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("record_date", sa.String(length=10), nullable=False),
        sa.Column("source_kind", sa.String(length=32), nullable=False),
        sa.Column("source_note", sa.Text(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("updated_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("reviewed_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=True),
        sa.Column("review_note", sa.Text(), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_red_form_records_project_id", "red_form_records", ["project_id"])
    op.create_index("ix_red_form_records_form_code", "red_form_records", ["form_code"])
    op.create_table(
        "red_form_revisions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("record_id", sa.String(length=36), sa.ForeignKey("red_form_records.id", ondelete="CASCADE"), nullable=False),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("changed_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_red_form_revisions_record_id", "red_form_revisions", ["record_id"])
    op.create_table(
        "red_evidence_files",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("red_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("record_id", sa.String(length=36), sa.ForeignKey("red_form_records.id", ondelete="CASCADE"), nullable=True),
        sa.Column("original_name", sa.String(length=255), nullable=False),
        sa.Column("storage_name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("media_type", sa.String(length=120), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_red_evidence_files_project_id", "red_evidence_files", ["project_id"])
    op.create_index("ix_red_evidence_files_record_id", "red_evidence_files", ["record_id"])
    op.create_table(
        "red_audit_events",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("red_projects.id", ondelete="SET NULL"), nullable=True),
        sa.Column("actor_id", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("entity_type", sa.String(length=80), nullable=False),
        sa.Column("entity_id", sa.String(length=36), nullable=False),
        sa.Column("detail", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_red_audit_events_project_id", "red_audit_events", ["project_id"])
    op.create_table(
        "red_drive_connection",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("connected_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("google_email", sa.String(length=320), nullable=False),
        sa.Column("encrypted_refresh_token", sa.Text(), nullable=False),
        sa.Column("backup_folder_id", sa.String(length=160), nullable=False),
        sa.Column("connected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_backup_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_table(
        "red_backups",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("drive_file_id", sa.String(length=160), nullable=False),
        sa.Column("drive_file_name", sa.String(length=255), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("bytes_total", sa.Integer(), nullable=False),
        sa.Column("summary", sa.JSON(), nullable=False),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_table(
        "red_login_throttles",
        sa.Column("key", sa.String(length=128), primary_key=True),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("blocked_until", sa.DateTime(timezone=True), nullable=True),
    )
    project_table = sa.table(
        "red_projects",
        sa.column("id", sa.String(length=36)),
        sa.column("slug", sa.String(length=100)),
        sa.column("name", sa.String(length=240)),
        sa.column("municipality", sa.String(length=120)),
        sa.column("department", sa.String(length=120)),
        sa.column("status", sa.String(length=40)),
        sa.column("baseline_status", sa.String(length=32)),
        sa.column("baseline_reference", sa.Text()),
        sa.column("baseline_note", sa.Text()),
        sa.column("origin", sa.String(length=80)),
        sa.column("origin_note", sa.Text()),
        sa.column("created_at", sa.DateTime(timezone=True)),
    )
    for slug, name in PROJECTS:
        op.execute(sa.insert(project_table).values(
            id=str(uuid5(NAMESPACE_URL, f"greenatics-red:{slug}")),
            slug=slug,
            name=name,
            municipality="Bello",
            department="Antioquia",
            status="preparacion",
            baseline_status="no_iniciada",
            baseline_reference="",
            baseline_note="",
            origin="instruccion_usuario",
            origin_note="Nombre recibido para estructurar uno de los primeros cuatro PMIRS. Dirección, datos y alcance pendientes de validación con la copropiedad.",
            created_at=sa.func.now(),
        ))


def downgrade() -> None:
    op.drop_table("red_login_throttles")
    op.drop_table("red_backups")
    op.drop_table("red_drive_connection")
    op.drop_index("ix_red_audit_events_project_id", table_name="red_audit_events")
    op.drop_table("red_audit_events")
    op.drop_index("ix_red_evidence_files_record_id", table_name="red_evidence_files")
    op.drop_index("ix_red_evidence_files_project_id", table_name="red_evidence_files")
    op.drop_table("red_evidence_files")
    op.drop_index("ix_red_form_revisions_record_id", table_name="red_form_revisions")
    op.drop_table("red_form_revisions")
    op.drop_index("ix_red_form_records_form_code", table_name="red_form_records")
    op.drop_index("ix_red_form_records_project_id", table_name="red_form_records")
    op.drop_table("red_form_records")
    op.drop_index("ix_red_invitations_email", table_name="red_invitations")
    op.drop_table("red_invitations")
    op.drop_index("ix_red_project_memberships_user_id", table_name="red_project_memberships")
    op.drop_index("ix_red_project_memberships_project_id", table_name="red_project_memberships")
    op.drop_table("red_project_memberships")
    op.drop_index("ix_red_projects_slug", table_name="red_projects")
    op.drop_table("red_projects")
    op.drop_index("ix_red_users_email", table_name="red_users")
    op.drop_table("red_users")
