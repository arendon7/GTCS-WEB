"""Project-scoped operational guide and separation-table library.

Revision ID: 0010_operational_references
Revises: 0009_form_record_signatures
Create Date: 2026-10-09
"""
from alembic import op
import sqlalchemy as sa


revision = "0010_operational_references"
down_revision = "0009_form_record_signatures"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "red_operational_references",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("project_id", sa.String(length=36), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("version_label", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("source_note", sa.Text(), nullable=False),
        sa.Column("review_note", sa.Text(), nullable=False),
        sa.Column("evidence_id", sa.String(length=36), nullable=False),
        sa.Column("created_by", sa.String(length=36), nullable=False),
        sa.Column("reviewed_by", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["project_id"], ["red_projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["evidence_id"], ["red_evidence_files.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["created_by"], ["red_users.id"]),
        sa.ForeignKeyConstraint(["reviewed_by"], ["red_users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("evidence_id"),
        sa.UniqueConstraint("project_id", "category", "version_label", name="uq_red_operational_reference_version"),
    )
    op.create_index("ix_red_operational_references_project_id", "red_operational_references", ["project_id"])
    op.create_index("ix_red_operational_references_category", "red_operational_references", ["category"])
    op.create_index("ix_red_operational_references_status", "red_operational_references", ["status"])
    op.create_index(
        "ix_red_operational_reference_current", "red_operational_references",
        ["project_id", "category", "status", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_red_operational_reference_current", table_name="red_operational_references")
    op.drop_index("ix_red_operational_references_status", table_name="red_operational_references")
    op.drop_index("ix_red_operational_references_category", table_name="red_operational_references")
    op.drop_index("ix_red_operational_references_project_id", table_name="red_operational_references")
    op.drop_table("red_operational_references")
