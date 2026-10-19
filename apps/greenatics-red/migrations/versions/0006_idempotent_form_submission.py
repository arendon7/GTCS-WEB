"""Prevent duplicate form records when a field submission is retried.

Revision ID: 0006_idempotent_form_submission
Revises: 0005_pmirs_version_chain
Create Date: 2026-10-08
"""
from alembic import op
import sqlalchemy as sa

revision = "0006_idempotent_form_submission"
down_revision = "0005_pmirs_version_chain"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("red_form_records", sa.Column("submission_key", sa.String(length=64), nullable=True))
    op.create_index("uq_red_form_records_submission_key", "red_form_records", ["submission_key"], unique=True)


def downgrade() -> None:
    op.drop_index("uq_red_form_records_submission_key", table_name="red_form_records")
    op.drop_column("red_form_records", "submission_key")
