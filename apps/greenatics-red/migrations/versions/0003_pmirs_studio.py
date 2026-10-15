"""Add structured PMIRS Studio objects, snapshots and evidence links.

Revision ID: 0003_pmirs_studio
Revises: 0002_user_recovery_and_membership_status
Create Date: 2026-10-07
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_pmirs_studio"
down_revision = "0002_user_recovery_and_membership_status"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "red_pmirs_items",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("red_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("item_type", sa.String(length=24), nullable=False),
        sa.Column("code", sa.String(length=24), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.Column("review_status", sa.String(length=32), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("updated_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("reviewed_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=True),
        sa.Column("review_note", sa.Text(), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("project_id", "code", name="uq_red_pmirs_project_code"),
    )
    op.create_index("ix_red_pmirs_items_project_id", "red_pmirs_items", ["project_id"])
    op.create_index("ix_red_pmirs_items_item_type", "red_pmirs_items", ["item_type"])

    op.create_table(
        "red_pmirs_item_revisions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("item_id", sa.String(length=36), sa.ForeignKey("red_pmirs_items.id", ondelete="CASCADE"), nullable=False),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("snapshot", sa.JSON(), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("changed_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("item_id", "revision", name="uq_red_pmirs_item_revision"),
    )
    op.create_index("ix_red_pmirs_item_revisions_item_id", "red_pmirs_item_revisions", ["item_id"])

    op.create_table(
        "red_pmirs_versions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("red_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version_label", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("change_summary", sa.Text(), nullable=False),
        sa.Column("change_reason", sa.String(length=80), nullable=False),
        sa.Column("snapshot", sa.JSON(), nullable=False),
        sa.Column("baseline_reference", sa.Text(), nullable=False),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status_changed_by", sa.String(length=36), sa.ForeignKey("red_users.id"), nullable=True),
        sa.Column("status_changed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status_note", sa.Text(), nullable=False),
        sa.UniqueConstraint("project_id", "version_label", name="uq_red_pmirs_project_version"),
    )
    op.create_index("ix_red_pmirs_versions_project_id", "red_pmirs_versions", ["project_id"])
    with op.batch_alter_table("red_evidence_files") as batch:
        batch.add_column(sa.Column("pmirs_item_id", sa.String(length=36), nullable=True))
        batch.create_foreign_key(
            "fk_red_evidence_files_pmirs_item_id_red_pmirs_items",
            "red_pmirs_items", ["pmirs_item_id"], ["id"], ondelete="CASCADE",
        )
    op.create_index("ix_red_evidence_files_pmirs_item_id", "red_evidence_files", ["pmirs_item_id"])


def downgrade() -> None:
    op.drop_index("ix_red_evidence_files_pmirs_item_id", table_name="red_evidence_files")
    with op.batch_alter_table("red_evidence_files") as batch:
        batch.drop_constraint("fk_red_evidence_files_pmirs_item_id_red_pmirs_items", type_="foreignkey")
        batch.drop_column("pmirs_item_id")
    op.drop_index("ix_red_pmirs_versions_project_id", table_name="red_pmirs_versions")
    op.drop_table("red_pmirs_versions")
    op.drop_index("ix_red_pmirs_item_revisions_item_id", table_name="red_pmirs_item_revisions")
    op.drop_table("red_pmirs_item_revisions")
    op.drop_index("ix_red_pmirs_items_item_type", table_name="red_pmirs_items")
    op.drop_index("ix_red_pmirs_items_project_id", table_name="red_pmirs_items")
    op.drop_table("red_pmirs_items")
