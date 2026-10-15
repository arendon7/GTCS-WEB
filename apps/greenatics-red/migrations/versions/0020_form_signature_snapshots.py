"""Retain the exact form document snapshot bound by each new signature.

Revision ID: 0020_form_signature_snapshots
Revises: 0019_evidence_storage_quotas
Create Date: 2026-10-13
"""
from alembic import op
import sqlalchemy as sa


revision = "0020_form_signature_snapshots"
down_revision = "0019_evidence_storage_quotas"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("red_form_signatures", sa.Column("document_snapshot", sa.JSON(), nullable=True))
    op.add_column(
        "red_form_signatures",
        sa.Column("snapshot_status", sa.String(length=32), nullable=False, server_default="legacy_unverifiable"),
    )


def downgrade() -> None:
    op.drop_column("red_form_signatures", "snapshot_status")
    op.drop_column("red_form_signatures", "document_snapshot")
