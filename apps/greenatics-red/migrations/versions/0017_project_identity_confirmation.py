"""Add source-backed confirmation to residential project identity.

Revision ID: 0017_project_identity_confirmation
Revises: 0016_idempotent_evidence_uploads
Create Date: 2026-10-12
"""
from alembic import op
import sqlalchemy as sa


revision = "0017_project_identity_confirmation"
down_revision = "0016_idempotent_evidence_uploads"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("red_projects") as batch_op:
        batch_op.add_column(sa.Column("address", sa.String(length=500), nullable=False, server_default=""))
        batch_op.add_column(sa.Column("identity_status", sa.String(length=24), nullable=False, server_default="pendiente"))
        batch_op.add_column(sa.Column("identity_reference", sa.String(length=160), nullable=False, server_default=""))
        batch_op.add_column(sa.Column("identity_confirmed_by", sa.String(length=36), nullable=True))
        batch_op.add_column(sa.Column("identity_confirmed_at", sa.DateTime(timezone=True), nullable=True))
        batch_op.create_foreign_key(
            "fk_red_projects_identity_confirmed_by_red_users",
            "red_users", ["identity_confirmed_by"], ["id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("red_projects") as batch_op:
        batch_op.drop_constraint("fk_red_projects_identity_confirmed_by_red_users", type_="foreignkey")
        batch_op.drop_column("identity_confirmed_at")
        batch_op.drop_column("identity_confirmed_by")
        batch_op.drop_column("identity_reference")
        batch_op.drop_column("identity_status")
        batch_op.drop_column("address")
