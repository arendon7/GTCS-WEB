"""Prevent duplicate record revisions after a lost edit response.

Revision ID: 0011_idempotent_record_edits
Revises: 0010_operational_references
Create Date: 2026-10-09
"""
from alembic import op
import sqlalchemy as sa


revision = "0011_idempotent_record_edits"
down_revision = "0010_operational_references"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("red_form_revisions", sa.Column("submission_key", sa.String(length=64), nullable=True))
    op.create_index(
        "uq_red_form_revisions_submission_key", "red_form_revisions", ["submission_key"], unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_red_form_revisions_submission_key", table_name="red_form_revisions")
    op.drop_column("red_form_revisions", "submission_key")
