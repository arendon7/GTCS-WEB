from __future__ import annotations

import importlib.util
import os
import subprocess
import sys
from pathlib import Path
from subprocess import CompletedProcess

from alembic.config import Config
from alembic.script import ScriptDirectory


APP_DIR = Path(__file__).resolve().parents[1]
SCRIPT_PATH = APP_DIR / "scripts" / "qa_postgres_integration.py"


def run_preflight(values: dict[str, str]) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env.pop("RED_TEST_POSTGRES_URL", None)
    env.pop("RED_TEST_POSTGRES_ALLOW_SCHEMA_CREATE", None)
    env.pop("RED_TEST_POSTGRES_EXPECTED_DATABASE", None)
    env.update(values)
    return subprocess.run(
        [sys.executable, str(SCRIPT_PATH)],
        cwd=APP_DIR,
        env=env,
        capture_output=True,
        text=True,
        timeout=20,
        check=False,
    )


def test_postgres_qa_resolves_the_current_alembic_head():
    spec = importlib.util.spec_from_file_location("red_postgres_qa_head", SCRIPT_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    current_head = ScriptDirectory.from_config(Config(str(APP_DIR / "alembic.ini"))).get_current_head()
    assert module.expected_migration_revision() == current_head
    assert current_head == "0022_private_alembic_metadata"


def test_postgres_qa_requires_a_url_before_any_connection_attempt():
    result = run_preflight({})
    assert result.returncode == 2
    assert "RED_TEST_POSTGRES_URL" in result.stderr
    assert "No se modificó ninguna base" in result.stderr


def test_postgres_qa_requires_explicit_schema_creation_confirmation():
    result = run_preflight({
        "RED_TEST_POSTGRES_URL": "postgresql+psycopg://qa:synthetic-secret@127.0.0.1/red_test",
    })
    assert result.returncode == 2
    assert "RED_TEST_POSTGRES_ALLOW_SCHEMA_CREATE" in result.stderr
    assert "synthetic-secret" not in result.stdout + result.stderr


def test_postgres_qa_rejects_non_postgres_urls_before_connecting():
    result = run_preflight({
        "RED_TEST_POSTGRES_URL": "sqlite:///should-not-be-opened.db",
        "RED_TEST_POSTGRES_ALLOW_SCHEMA_CREATE": "DROP_ONLY_TEMP_SCHEMA",
    })
    assert result.returncode == 2
    assert "debe apuntar a PostgreSQL" in result.stderr


def test_postgres_qa_requires_explicit_expected_database_before_connecting():
    result = run_preflight({
        "RED_TEST_POSTGRES_URL": "postgresql+psycopg://qa:synthetic-secret@127.0.0.1/red_test",
        "RED_TEST_POSTGRES_ALLOW_SCHEMA_CREATE": "DROP_ONLY_TEMP_SCHEMA",
    })
    assert result.returncode == 2
    assert "RED_TEST_POSTGRES_EXPECTED_DATABASE" in result.stderr
    assert "synthetic-secret" not in result.stdout + result.stderr


def test_postgres_qa_rejects_mismatched_expected_database_before_connecting():
    result = run_preflight({
        "RED_TEST_POSTGRES_URL": "postgresql+psycopg://qa:synthetic-secret@127.0.0.1/red_test",
        "RED_TEST_POSTGRES_ALLOW_SCHEMA_CREATE": "DROP_ONLY_TEMP_SCHEMA",
        "RED_TEST_POSTGRES_EXPECTED_DATABASE": "greenatics_red_test",
    })
    assert result.returncode == 2
    assert "no coincide" in result.stderr
    assert "synthetic-secret" not in result.stdout + result.stderr


def test_postgres_qa_rejects_production_named_database_even_when_confirmed():
    result = run_preflight({
        "RED_TEST_POSTGRES_URL": "postgresql+psycopg://qa:synthetic-secret@127.0.0.1/greenatics_red",
        "RED_TEST_POSTGRES_ALLOW_SCHEMA_CREATE": "DROP_ONLY_TEMP_SCHEMA",
        "RED_TEST_POSTGRES_EXPECTED_DATABASE": "greenatics_red",
    })
    assert result.returncode == 2
    assert "entorno no productivo" in result.stderr
    assert "synthetic-secret" not in result.stdout + result.stderr


def test_postgres_qa_redacts_password_in_raw_and_normalized_urls():
    spec = importlib.util.spec_from_file_location("red_postgres_qa", SCRIPT_PATH)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    raw_url = "postgresql://qa_user:sensitive-pass@localhost/red_test"
    normalized_url = "postgresql+psycopg://qa_user:sensitive-pass@localhost/red_test"

    for exposed in (raw_url, normalized_url):
        safe = module._safe_output(CompletedProcess([], 1, exposed, ""), raw_url)
        assert "sensitive-pass" not in safe
        assert "qa_user:***@localhost" in safe
