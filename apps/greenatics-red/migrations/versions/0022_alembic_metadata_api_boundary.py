"""Keep Alembic's version table private from Supabase API roles.

Revision ID: 0022_alembic_metadata_api_boundary
Revises: 0021_private_database_api_boundary
Create Date: 2026-10-19
"""
from alembic import op


revision = "0022_alembic_metadata_api_boundary"
down_revision = "0021_private_database_api_boundary"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    # Alembic runs as the table owner and keeps its normal migration access.
    # Supabase's REST/GraphQL roles must not read or change migration state.
    op.execute("""
        DO $red_private_alembic$
        DECLARE
            target_schema text := current_schema();
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = target_schema
                  AND table_name = 'alembic_version'
            ) THEN
                EXECUTE format(
                    'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
                    target_schema, 'alembic_version'
                );
                EXECUTE format(
                    'REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM PUBLIC',
                    target_schema, 'alembic_version'
                );
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                    EXECUTE format(
                        'REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM anon',
                        target_schema, 'alembic_version'
                    );
                END IF;
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                    EXECUTE format(
                        'REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM authenticated',
                        target_schema, 'alembic_version'
                    );
                END IF;
            END IF;
        END
        $red_private_alembic$;
    """)


def downgrade() -> None:
    # Deliberately keep RLS and grant revocations when rolling back app code.
    pass
