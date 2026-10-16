"""Run the real Huella production startup against disposable PostgreSQL only."""
from __future__ import annotations

import os
import subprocess
import sys
import unittest
import uuid
from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url


DATABASE_URL = os.environ.get("HUELLA_TEST_POSTGRES_URL", "")
PROJECT_DIR = Path(__file__).resolve().parents[1]


@unittest.skipUnless(DATABASE_URL, "PostgreSQL startup fixture not configured")
class StartupSchemaIsolationTests(unittest.TestCase):
    def test_private_startup_does_not_create_operational_tables_in_public(self) -> None:
        url = make_url(DATABASE_URL)
        if url.host not in {"localhost", "127.0.0.1"} or url.database != "huella_startup_ci":
            raise RuntimeError("Use only the local disposable huella_startup_ci database")

        schema = "startup_fixture_" + uuid.uuid4().hex
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        try:
            with engine.begin() as connection:
                public_before = set(inspect(connection).get_table_names(schema="public"))
                connection.execute(text(f'CREATE SCHEMA "{schema}"'))

            env = os.environ.copy()
            env.update({
                "APP_ENV": "staging",
                "DATABASE_SCHEMA": schema,
                "DATABASE_URL": DATABASE_URL,
                "CTH_PYTHON_BIN": sys.executable,
                "SESSION_SECRET": "startup-test-session-secret-only-64-characters",
                "SESSION_HTTPS_ONLY": "true",
                "PUBLIC_BASE_URL": "https://localhost",
                "TRUSTED_HOSTS": "localhost",
                "SEED_DEMO": "false",
                "SCHEDULER_ENABLED": "false",
                "DEPLOYMENT_STRICT": "false",
                "STORAGE_BACKEND": "local",
                "PORT": "18765",
                "WEB_CONCURRENCY": "1",
            })
            process = subprocess.Popen(
                ["bash", "start_prod.sh"],
                cwd=PROJECT_DIR,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
            try:
                output, _ = process.communicate(timeout=60)
                self.fail(f"Startup exited before serving traffic (code {process.returncode}):\n{output[-6000:]}")
            except subprocess.TimeoutExpired:
                process.terminate()
                output, _ = process.communicate(timeout=10)
                self.assertIn("Uvicorn running on", output, output[-6000:])

            with engine.connect() as connection:
                public_after = set(inspect(connection).get_table_names(schema="public"))
                private_tables = set(inspect(connection).get_table_names(schema=schema))

            self.assertEqual(public_after, public_before, "Huella startup changed tables in shared public schema")
            self.assertTrue(
                {"login_security_states", "audit_events", "restore_drills"}.issubset(private_tables),
                f"Operational tables missing from configured schema {schema}: {private_tables}",
            )
        finally:
            with engine.begin() as connection:
                connection.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
            engine.dispose()


if __name__ == "__main__":
    unittest.main()
