"""Exercise env.py on a disposable PostgreSQL CI database, never staging."""
from __future__ import annotations

import os
import unittest
import uuid

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.pool import NullPool

import test_migration_transaction as fixture


@unittest.skipUnless(os.environ.get("HUELLA_TEST_POSTGRES_URL"), "PostgreSQL CI fixture not configured")
class PostgreSQLMigrationTransactionTests(fixture.MigrationTransactionTests):
    def setUp(self) -> None:
        url = make_url(os.environ["HUELLA_TEST_POSTGRES_URL"])
        if url.host not in {"localhost", "127.0.0.1"} or url.database != "huella_migration_ci":
            raise RuntimeError("Use only the local disposable huella_migration_ci database")
        super().setUp()
        self.engine.dispose()
        self.engine = create_engine(url, poolclass=NullPool)
        self.addCleanup(self.engine.dispose)
        self.schema = "migration_fixture_" + uuid.uuid4().hex
        with self.engine.begin() as connection:
            connection.exec_driver_sql(f'CREATE SCHEMA "{self.schema}"')
        self.addCleanup(self.drop_fixture_schema)

        @event.listens_for(self.engine, "before_cursor_execute")
        def record_schema_preamble(_connection, _cursor, statement, _parameters, _context, _many):
            if statement.startswith(("CREATE SCHEMA", "SET search_path")):
                self.schema_statements.append(statement)

    def drop_fixture_schema(self) -> None:
        # Only the random schema created by this test is eligible for cleanup.
        with self.engine.begin() as connection:
            connection.exec_driver_sql(f'DROP SCHEMA "{self.schema}" CASCADE')

    def upgrade(self, schema: str = "", fail: bool = False) -> None:
        super().upgrade(schema=self.schema, fail=fail)

    def assert_persisted_once(self) -> None:
        with self.engine.connect() as connection:
            self.assertEqual(
                connection.execute(text(f'SELECT version_num FROM "{self.schema}".alembic_version')).scalars().all(),
                ["probe_revision"],
            )
            self.assertEqual(
                connection.execute(text(f'SELECT count(*) FROM "{self.schema}".migration_probe')).scalar_one(), 1
            )

    @unittest.skip("Public schema mode is covered by SQLite; PostgreSQL fixture stays isolated")
    def test_no_schema_commits_and_next_start_skips_revision(self) -> None:
        pass

    def test_failed_migration_rolls_back_schema_and_version(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "intentional migration failure"):
            self.upgrade(fail=True)
        self.assertEqual(inspect(self.engine).get_table_names(schema=self.schema), [])
        self.upgrade()
        self.assert_persisted_once()

    def test_schema_preamble_does_not_create_public_tables(self) -> None:
        before = inspect(self.engine).get_table_names(schema="public")
        self.upgrade()
        self.assert_persisted_once()
        self.assertEqual(inspect(self.engine).get_table_names(schema="public"), before)


if __name__ == "__main__":
    unittest.main()
