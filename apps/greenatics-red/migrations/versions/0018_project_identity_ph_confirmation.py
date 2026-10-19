"""Allow each PH administrator to confirm only their own project identity.

Revision ID: 0018_project_identity_ph_confirmation
Revises: 0017_project_identity_confirmation
Create Date: 2026-10-12
"""
from alembic import op
import sqlalchemy as sa


revision = "0018_project_identity_ph_confirmation"
down_revision = "0017_project_identity_confirmation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("red_projects", sa.Column("identity_confirmed_role", sa.String(length=32), nullable=True))
    # Before this revision, only the platform administrator could confirm identity.
    op.execute(
        "UPDATE red_projects SET identity_confirmed_role = 'admin' "
        "WHERE identity_status = 'confirmada' AND identity_confirmed_role IS NULL"
    )


def downgrade() -> None:
    op.drop_column("red_projects", "identity_confirmed_role")
