"""Associate uploaded evidence with a specific RED form field.

Revision ID: 0004_field_scoped_evidence
Revises: 0003_pmirs_studio
Create Date: 2026-10-08
"""
from alembic import op
import sqlalchemy as sa

revision = "0004_field_scoped_evidence"
down_revision = "0003_pmirs_studio"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("red_evidence_files", sa.Column("field_id", sa.String(length=80), nullable=True))
    op.create_index("ix_red_evidence_files_field_id", "red_evidence_files", ["field_id"])


def downgrade() -> None:
    op.drop_index("ix_red_evidence_files_field_id", table_name="red_evidence_files")
    op.drop_column("red_evidence_files", "field_id")
