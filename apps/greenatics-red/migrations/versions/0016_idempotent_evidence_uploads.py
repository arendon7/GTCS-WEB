"""Add idempotency keys to standalone evidence uploads.

Revision ID: 0016_idempotent_evidence_uploads
Revises: 0015_project_visit_authorization
Create Date: 2026-10-12
"""
from alembic import op
import sqlalchemy as sa


revision = "0016_idempotent_evidence_uploads"
down_revision = "0015_project_visit_authorization"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("red_evidence_files", sa.Column("submission_key", sa.String(length=64), nullable=True))
    op.create_index(
        "uq_red_evidence_files_submission_key",
        "red_evidence_files", ["submission_key"], unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_red_evidence_files_submission_key", table_name="red_evidence_files")
    op.drop_column("red_evidence_files", "submission_key")
