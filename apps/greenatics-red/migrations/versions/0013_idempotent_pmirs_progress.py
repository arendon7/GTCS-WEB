"""Make PMIRS action progress submissions idempotent.

Revision ID: 0013_idempotent_pmirs_progress
Revises: 0012_privacy_case_log
Create Date: 2026-10-10
"""
from alembic import op
import sqlalchemy as sa


revision = "0013_idempotent_pmirs_progress"
down_revision = "0012_privacy_case_log"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "red_pmirs_item_revisions",
        sa.Column("submission_key", sa.String(length=64), nullable=True),
    )
    op.create_index(
        "uq_red_pmirs_item_revisions_submission_key",
        "red_pmirs_item_revisions",
        ["submission_key"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "uq_red_pmirs_item_revisions_submission_key",
        table_name="red_pmirs_item_revisions",
    )
    op.drop_column("red_pmirs_item_revisions", "submission_key")
