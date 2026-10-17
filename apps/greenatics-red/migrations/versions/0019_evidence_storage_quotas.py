"""Serialize evidence writes and cap aggregate private evidence storage.

Revision ID: 0019_evidence_storage_quotas
Revises: 0018_project_identity_ph_confirmation
Create Date: 2026-10-13
"""
from alembic import op
import sqlalchemy as sa


revision = "0019_evidence_storage_quotas"
down_revision = "0018_project_identity_ph_confirmation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "red_evidence_quota_locks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("generation", sa.Integer(), nullable=False, server_default="0"),
    )
    op.execute("INSERT INTO red_evidence_quota_locks (id, generation) VALUES (1, 0)")


def downgrade() -> None:
    op.drop_table("red_evidence_quota_locks")
