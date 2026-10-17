"""Keep RED's server-owned tables private from the Supabase Data API.

Revision ID: 0021_private_database_api_boundary
Revises: 0020_form_signature_snapshots
Create Date: 2026-10-16
"""
from alembic import op


revision = "0021_private_database_api_boundary"
down_revision = "0020_form_signature_snapshots"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    # RED authenticates and authorizes in its FastAPI server. Do not expose its
    # public-schema tables through Supabase's REST/GraphQL roles. The connected
    # application owner retains normal server-side access; API roles get no
    # grants and RLS remains enabled as a second boundary.
    op.execute("""
        DO $red_private$
        DECLARE
            target_schema text := current_schema();
            item record;
        BEGIN
            FOR item IN
                SELECT c.relname
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = target_schema
                  AND c.relkind IN ('r', 'p')
                  AND left(c.relname, 4) = 'red_'
            LOOP
                EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', target_schema, item.relname);
                EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM PUBLIC', target_schema, item.relname);
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM anon', target_schema, item.relname);
                END IF;
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM authenticated', target_schema, item.relname);
                END IF;
            END LOOP;

            FOR item IN
                SELECT c.relname
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = target_schema
                  AND c.relkind = 'S'
                  AND left(c.relname, 4) = 'red_'
            LOOP
                EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %I.%I FROM PUBLIC', target_schema, item.relname);
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                    EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %I.%I FROM anon', target_schema, item.relname);
                END IF;
                IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                    EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %I.%I FROM authenticated', target_schema, item.relname);
                END IF;
            END LOOP;

            EXECUTE format(
                'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I REVOKE ALL ON TABLES FROM PUBLIC',
                current_user, target_schema
            );
            EXECUTE format(
                'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I REVOKE ALL ON SEQUENCES FROM PUBLIC',
                current_user, target_schema
            );
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                EXECUTE format(
                    'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I REVOKE ALL ON TABLES FROM anon',
                    current_user, target_schema
                );
                EXECUTE format(
                    'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I REVOKE ALL ON SEQUENCES FROM anon',
                    current_user, target_schema
                );
            END IF;
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                EXECUTE format(
                    'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I REVOKE ALL ON TABLES FROM authenticated',
                    current_user, target_schema
                );
                EXECUTE format(
                    'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA %I REVOKE ALL ON SEQUENCES FROM authenticated',
                    current_user, target_schema
                );
            END IF;
        END
        $red_private$;
    """)


def downgrade() -> None:
    # Deliberately do not restore public grants. Reopening database access is
    # not a safe automatic consequence of rolling back an application release.
    pass
