"""Capture authenticated signatures for individual form-record versions.

Revision ID: 0009_form_record_signatures
Revises: 0008_pmirs_handwritten_signatures
Create Date: 2026-10-09
"""
from alembic import op
import sqlalchemy as sa


revision = "0009_form_record_signatures"
down_revision = "0008_pmirs_handwritten_signatures"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "red_form_signatures",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("project_id", sa.String(length=36), nullable=False),
        sa.Column("record_id", sa.String(length=36), nullable=False),
        sa.Column("record_version", sa.Integer(), nullable=False),
        sa.Column("signer_user_id", sa.String(length=36), nullable=False),
        sa.Column("signer_name", sa.String(length=200), nullable=False),
        sa.Column("signer_email", sa.String(length=320), nullable=False),
        sa.Column("signer_role", sa.String(length=40), nullable=False),
        sa.Column("declaration", sa.Text(), nullable=False),
        sa.Column("signature_path", sa.Text(), nullable=False),
        sa.Column("document_sha256", sa.String(length=64), nullable=False),
        sa.Column("signed_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["red_projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["record_id"], ["red_form_records.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["signer_user_id"], ["red_users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("record_id", "signer_user_id", "document_sha256", name="uq_red_form_signature_signer_document"),
    )
    op.create_index("ix_red_form_signatures_project_id", "red_form_signatures", ["project_id"])
    op.create_index("ix_red_form_signatures_record_id", "red_form_signatures", ["record_id"])
    op.create_index("ix_red_form_signatures_signer_user_id", "red_form_signatures", ["signer_user_id"])


def downgrade() -> None:
    op.drop_index("ix_red_form_signatures_signer_user_id", table_name="red_form_signatures")
    op.drop_index("ix_red_form_signatures_record_id", table_name="red_form_signatures")
    op.drop_index("ix_red_form_signatures_project_id", table_name="red_form_signatures")
    op.drop_table("red_form_signatures")
