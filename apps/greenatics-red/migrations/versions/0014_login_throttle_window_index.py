"""Index authentication throttle windows for bounded cleanup.

Revision ID: 0014_login_throttle_window_index
Revises: 0013_idempotent_pmirs_progress
Create Date: 2026-10-11
"""
from alembic import op


revision = "0014_login_throttle_window_index"
down_revision = "0013_idempotent_pmirs_progress"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_red_login_throttles_window_start",
        "red_login_throttles",
        ["window_start"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_red_login_throttles_window_start",
        table_name="red_login_throttles",
    )
