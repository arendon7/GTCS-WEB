"""Allow verified signatures alongside retained legacy-unverifiable rows.

Revision ID: 0023_verified_form_signature_uniqueness
Revises: 0022_private_alembic_metadata
Create Date: 2026-10-19
"""
import sqlalchemy as sa
from alembic import op


revision = "0023_verified_form_signature_uniqueness"
down_revision = "0022_private_alembic_metadata"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("red_form_signatures") as batch_op:
        batch_op.drop_constraint("uq_red_form_signature_signer_document", type_="unique")
    op.create_index(
        "uq_red_form_signature_verified_document",
        "red_form_signatures",
        ["record_id", "signer_user_id", "document_sha256"],
        unique=True,
        sqlite_where=sa.text("snapshot_status = 'verified'"),
        postgresql_where=sa.text("snapshot_status = 'verified'"),
    )


def downgrade() -> None:
    op.drop_index("uq_red_form_signature_verified_document", table_name="red_form_signatures")
    with op.batch_alter_table("red_form_signatures") as batch_op:
        batch_op.create_unique_constraint(
            "uq_red_form_signature_signer_document",
            ["record_id", "signer_user_id", "document_sha256"],
        )
