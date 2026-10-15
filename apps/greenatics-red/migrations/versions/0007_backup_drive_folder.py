"""Record the Drive backup destination for readiness verification.

Revision ID: 0007_backup_drive_folder
Revises: 0006_idempotent_form_submission
Create Date: 2026-10-08
"""
from alembic import op
import sqlalchemy as sa

revision = "0007_backup_drive_folder"
down_revision = "0006_idempotent_form_submission"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "red_backups",
        sa.Column("drive_folder_id", sa.String(length=160), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("red_backups", "drive_folder_id")
