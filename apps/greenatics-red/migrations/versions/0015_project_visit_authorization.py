"""Add project-scoped, expiring field-visit authorization records.

Revision ID: 0015_project_visit_authorization
Revises: 0014_login_throttle_window_index
Create Date: 2026-10-11
"""
from alembic import op
import sqlalchemy as sa


revision = "0015_project_visit_authorization"
down_revision = "0014_login_throttle_window_index"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "red_project_visit_authorizations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("project_id", sa.String(length=36), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("site_access_reference", sa.String(length=160), nullable=False),
        sa.Column("privacy_reference", sa.String(length=160), nullable=False),
        sa.Column("method_reference", sa.String(length=160), nullable=False),
        sa.Column("sst_reference", sa.String(length=160), nullable=False),
        sa.Column("valid_until", sa.Date(), nullable=False),
        sa.Column("created_by", sa.String(length=36), nullable=False),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_by", sa.String(length=36), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revocation_reason", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["red_users.id"]),
        sa.ForeignKeyConstraint(["project_id"], ["red_projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["revoked_by"], ["red_users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_red_project_visit_authorizations_project_id",
        "red_project_visit_authorizations", ["project_id"], unique=False,
    )
    op.create_index(
        "ix_red_visit_authorizations_project_created",
        "red_project_visit_authorizations", ["project_id", "created_at"], unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_red_visit_authorizations_project_created", table_name="red_project_visit_authorizations")
    op.drop_index("ix_red_project_visit_authorizations_project_id", table_name="red_project_visit_authorizations")
    op.drop_table("red_project_visit_authorizations")
