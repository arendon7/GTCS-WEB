"""Run the real Alembic environment against an isolated transactional fixture."""
from __future__ import annotations

import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch

from alembic import command
from alembic.config import Config
from sqlalchemy import MetaData, create_engine, event, inspect, text


ENV_FILE = Path(__file__).resolve().parents[1] / "migrations" / "env.py"


class MigrationTransactionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="huella-alembic-transaction-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        scripts = self.root / "migrations"
        (scripts / "versions").mkdir(parents=True)
        (scripts / "env.py").write_bytes(ENV_FILE.read_bytes())
        (scripts / "versions" / "probe.py").write_text(
            "from alembic import op\n"
            "revision = 'probe_revision'\n"
            "down_revision = None\n"
            "branch_labels = None\n"
            "depends_on = None\n"
            "def upgrade():\n"
            "    op.execute('CREATE TABLE migration_probe (value INTEGER NOT NULL)')\n"
            "    op.execute('INSERT INTO migration_probe VALUES (1)')\n"
            "    if op.get_context().config.attributes.get('fail_probe'):\n"
            "        raise RuntimeError('intentional migration failure')\n"
            "def downgrade():\n"
            "    op.execute('DROP TABLE migration_probe')\n",
            encoding="utf-8",
        )
        self.config = Config()
        self.config.set_main_option("script_location", str(scripts))
        self.engine = create_engine(f"sqlite:///{self.root / 'fixture.sqlite3'}")
        self.addCleanup(self.engine.dispose)
        self.schema_statements: list[str] = []

        # Make SQLite DDL transactional, matching the rollback property tested
        # here. This does not emulate PostgreSQL schema resolution or locks.
        @event.listens_for(self.engine, "connect")
        def disable_driver_autobegin(dbapi_connection, _record):
            dbapi_connection.isolation_level = None

        @event.listens_for(self.engine, "begin")
        def begin_transaction(connection):
            connection.exec_driver_sql("BEGIN")

        @event.listens_for(self.engine, "before_cursor_execute", retval=True)
        def schema_preamble(_connection, _cursor, statement, parameters, _context, _many):
            if statement.startswith(("CREATE SCHEMA", "SET search_path")):
                self.schema_statements.append(statement)
                return "SELECT 1", ()
            return statement, parameters

    def upgrade(self, schema: str = "", fail: bool = False) -> None:
        app = types.ModuleType("app")
        app.__path__ = []
        config_module = types.ModuleType("app.config")
        config_module.settings = types.SimpleNamespace(
            database_url=str(self.engine.url), database_schema=schema
        )
        database_module = types.ModuleType("app.database")
        database_module.Base = types.SimpleNamespace(metadata=MetaData())
        self.config.attributes["fail_probe"] = fail
        with patch.dict(sys.modules, {
            "app": app, "app.config": config_module, "app.database": database_module,
        }), patch("sqlalchemy.engine_from_config", return_value=self.engine):
            command.upgrade(self.config, "head")

    def assert_persisted_once(self) -> None:
        with self.engine.connect() as connection:
            self.assertEqual(
                connection.execute(text("SELECT version_num FROM alembic_version")).scalars().all(),
                ["probe_revision"],
            )
            self.assertEqual(
                connection.execute(text("SELECT count(*) FROM migration_probe")).scalar_one(), 1
            )

    def test_schema_preamble_commits_and_next_start_skips_revision(self) -> None:
        self.upgrade("huella_staging")
        self.assert_persisted_once()
        self.upgrade("huella_staging")
        self.assert_persisted_once()
        self.assertEqual(len(self.schema_statements), 4)

    def test_no_schema_commits_and_next_start_skips_revision(self) -> None:
        self.upgrade()
        self.assert_persisted_once()
        self.upgrade()
        self.assert_persisted_once()
        self.assertEqual(self.schema_statements, [])

    def test_failed_migration_rolls_back_schema_and_version(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "intentional migration failure"):
            self.upgrade("huella_staging", fail=True)
        self.assertEqual(inspect(self.engine).get_table_names(), [])
        self.upgrade("huella_staging")
        self.assert_persisted_once()


if __name__ == "__main__":
    unittest.main()
