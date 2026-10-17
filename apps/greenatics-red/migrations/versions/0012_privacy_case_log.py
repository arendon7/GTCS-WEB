"""Add a minimal, auditable privacy-request case log.

Revision ID: 0012_privacy_case_log
Revises: 0011_idempotent_record_edits
Create Date: 2026-10-10
"""
from alembic import op
import sqlalchemy as sa


revision = "0012_privacy_case_log"
down_revision = "0011_idempotent_record_edits"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "red_privacy_cases",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("case_type", sa.String(length=40), nullable=False),
        sa.Column("project_scope", sa.String(length=24), nullable=False),
        sa.Column("project_id", sa.String(length=36), nullable=True),
        sa.Column("classification", sa.String(length=24), nullable=False),
        sa.Column("identity_status", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("received_on", sa.String(length=10), nullable=False),
        sa.Column("external_reference", sa.String(length=160), nullable=False),
        sa.Column("target_response_on", sa.String(length=10), nullable=False),
        sa.Column("target_rule_reference", sa.String(length=240), nullable=False),
        sa.Column("response_on", sa.String(length=10), nullable=False),
        sa.Column("response_reference", sa.String(length=160), nullable=False),
        sa.Column("owner_user_id", sa.String(length=36), nullable=False),
        sa.Column("created_by", sa.String(length=36), nullable=False),
        sa.Column("updated_by", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["red_projects.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["owner_user_id"], ["red_users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["created_by"], ["red_users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["updated_by"], ["red_users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_red_privacy_cases_project_id", "red_privacy_cases", ["project_id"])
    op.create_index("ix_red_privacy_cases_status", "red_privacy_cases", ["status"])
    op.create_index("ix_red_privacy_cases_owner_user_id", "red_privacy_cases", ["owner_user_id"])
    op.create_index("ix_red_privacy_case_queue", "red_privacy_cases", ["status", "created_at"])
    op.create_index("ix_red_privacy_case_project", "red_privacy_cases", ["project_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_red_privacy_case_project", table_name="red_privacy_cases")
    op.drop_index("ix_red_privacy_case_queue", table_name="red_privacy_cases")
    op.drop_index("ix_red_privacy_cases_owner_user_id", table_name="red_privacy_cases")
    op.drop_index("ix_red_privacy_cases_status", table_name="red_privacy_cases")
    op.drop_index("ix_red_privacy_cases_project_id", table_name="red_privacy_cases")
    op.drop_table("red_privacy_cases")
