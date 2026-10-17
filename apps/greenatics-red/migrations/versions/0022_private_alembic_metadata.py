"""Keep Alembic's revision metadata private from the Supabase Data API.

Revision ID: 0022_private_alembic_metadata
Revises: 0021_private_database_api_boundary
Create Date: 2026-10-17
"""
from alembic import op


revision = "0022_private_alembic_metadata"
down_revision = "0021_private_database_api_boundary"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    # Alembic updates this table with the application database owner. It is
    # operational metadata, not a client API, so only the migration owner
    # should retain SQL privileges.
    op.execute("""
        DO $red_alembic_private$
        DECLARE
            target_schema text := current_schema();
            role_record record;
        BEGIN
            EXECUTE format(
                'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
                target_schema, 'alembic_version'
            );
            EXECUTE format(
                'REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM PUBLIC',
                target_schema, 'alembic_version'
            );

            FOR role_record IN
                SELECT rolname
                FROM pg_roles
                WHERE rolname IN ('anon', 'authenticated')
            LOOP
                EXECUTE format(
                    'REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM %I',
                    target_schema, 'alembic_version', role_record.rolname
                );
            END LOOP;
        END
        $red_alembic_private$;
    """)


def downgrade() -> None:
    # Deliberately keep RLS and revoked API privileges when reverting code.
    pass
