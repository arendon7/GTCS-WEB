"""Add account recovery and revocable project memberships.

Revision ID: 0002_user_recovery_and_membership_status
Revises: 0001_red_workspace
Create Date: 2026-10-07
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_user_recovery_and_membership_status"
down_revision = "0001_red_workspace"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("red_users", sa.Column("session_version", sa.Integer(), nullable=False, server_default="1"))
    op.add_column("red_project_memberships", sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.create_table(
        "red_password_resets",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("red_users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False, unique=True),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_red_password_resets_user_id", "red_password_resets", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_red_password_resets_user_id", table_name="red_password_resets")
    op.drop_table("red_password_resets")
    op.drop_column("red_project_memberships", "active")
    op.drop_column("red_users", "session_version")
