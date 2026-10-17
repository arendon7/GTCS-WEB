"""Capture authenticated handwritten signatures against exact PMIRS versions.

Revision ID: 0008_pmirs_handwritten_signatures
Revises: 0007_backup_drive_folder
Create Date: 2026-10-08
"""
from alembic import op
import sqlalchemy as sa

revision = "0008_pmirs_handwritten_signatures"
down_revision = "0007_backup_drive_folder"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "red_pmirs_signatures",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("project_id", sa.String(length=36), nullable=False),
        sa.Column("version_id", sa.String(length=36), nullable=False),
        sa.Column("signer_user_id", sa.String(length=36), nullable=False),
        sa.Column("signer_name", sa.String(length=200), nullable=False),
        sa.Column("signer_email", sa.String(length=320), nullable=False),
        sa.Column("signer_role", sa.String(length=40), nullable=False),
        sa.Column("declaration", sa.Text(), nullable=False),
        sa.Column("signature_path", sa.Text(), nullable=False),
        sa.Column("document_sha256", sa.String(length=64), nullable=False),
        sa.Column("signed_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["red_projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["version_id"], ["red_pmirs_versions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["signer_user_id"], ["red_users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("version_id", "signer_user_id", name="uq_red_pmirs_signature_signer_version"),
    )
    op.create_index("ix_red_pmirs_signatures_project_id", "red_pmirs_signatures", ["project_id"])
    op.create_index("ix_red_pmirs_signatures_version_id", "red_pmirs_signatures", ["version_id"])
    op.create_index("ix_red_pmirs_signatures_signer_user_id", "red_pmirs_signatures", ["signer_user_id"])


def downgrade() -> None:
    op.drop_index("ix_red_pmirs_signatures_signer_user_id", table_name="red_pmirs_signatures")
    op.drop_index("ix_red_pmirs_signatures_version_id", table_name="red_pmirs_signatures")
    op.drop_index("ix_red_pmirs_signatures_project_id", table_name="red_pmirs_signatures")
    op.drop_table("red_pmirs_signatures")
