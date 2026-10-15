"""Link each PMIRS snapshot to its predecessor for P-12 traceability.

Revision ID: 0005_pmirs_version_chain
Revises: 0004_field_scoped_evidence
Create Date: 2026-10-08
"""
import re

from alembic import context, op
import sqlalchemy as sa

revision = "0005_pmirs_version_chain"
down_revision = "0004_field_scoped_evidence"
branch_labels = None
depends_on = None


def _label_order(label: str) -> tuple[int, int, str]:
    match = re.search(r"(\d+)\.(\d+)", label or "")
    if match:
        return (int(match.group(1)), int(match.group(2)), label)
    return (10**9, 10**9, label or "")


def upgrade() -> None:
    op.add_column(
        "red_pmirs_versions",
        sa.Column("previous_version_id", sa.String(length=36), nullable=True),
    )
    with op.batch_alter_table("red_pmirs_versions") as batch:
        batch.create_foreign_key(
            "fk_red_pmirs_versions_previous_version_id_red_pmirs_versions",
            "red_pmirs_versions", ["previous_version_id"], ["id"], ondelete="SET NULL",
        )
    op.create_index(
        "ix_red_pmirs_versions_previous_version_id",
        "red_pmirs_versions", ["previous_version_id"],
    )

    versions = sa.table(
        "red_pmirs_versions",
        sa.column("id", sa.String),
        sa.column("project_id", sa.String),
        sa.column("version_label", sa.String),
        sa.column("created_at", sa.DateTime),
        sa.column("previous_version_id", sa.String),
    )
    if context.is_offline_mode():
        if op.get_context().dialect.name != "postgresql":
            raise RuntimeError("La generación offline del backfill de versiones requiere PostgreSQL.")
        op.execute(sa.text("""
            WITH ordered_versions AS (
                SELECT
                    id,
                    lag(id) OVER (
                        PARTITION BY project_id
                        ORDER BY
                            created_at,
                            coalesce((regexp_match(version_label, '([0-9]+)\\.([0-9]+)'))[1]::integer, 1000000000),
                            coalesce((regexp_match(version_label, '([0-9]+)\\.([0-9]+)'))[2]::integer, 1000000000),
                            version_label,
                            id
                    ) AS predecessor_id
                FROM red_pmirs_versions
            )
            UPDATE red_pmirs_versions AS current_version
            SET previous_version_id = ordered_versions.predecessor_id
            FROM ordered_versions
            WHERE current_version.id = ordered_versions.id;
        """))
    else:
        connection = op.get_bind()
        rows = connection.execute(sa.select(
            versions.c.id, versions.c.project_id, versions.c.version_label, versions.c.created_at,
        )).mappings().all()
        by_project: dict[str, list[dict]] = {}
        for row in rows:
            by_project.setdefault(row["project_id"], []).append(dict(row))
        for project_rows in by_project.values():
            project_rows.sort(key=lambda row: (row["created_at"], _label_order(row["version_label"]), row["id"]))
            previous_id = None
            for row in project_rows:
                connection.execute(
                    versions.update().where(versions.c.id == row["id"]).values(previous_version_id=previous_id)
                )
                previous_id = row["id"]


def downgrade() -> None:
    op.drop_index("ix_red_pmirs_versions_previous_version_id", table_name="red_pmirs_versions")
    with op.batch_alter_table("red_pmirs_versions") as batch:
        batch.drop_constraint(
            "fk_red_pmirs_versions_previous_version_id_red_pmirs_versions", type_="foreignkey",
        )
        batch.drop_column("previous_version_id")
