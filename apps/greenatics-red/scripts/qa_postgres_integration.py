#!/usr/bin/env python3
"""Run RED's migrations and backup/restore checks in disposable PostgreSQL schemas.

This command is deliberately opt-in. It creates two random schemas, runs Alembic
and a synthetic backup/restore round trip, then drops only those schemas.
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from uuid import uuid4

from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url


APP_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP_DIR))
from app.initial_projects import BELLO_PROJECTS  # noqa: E402


CONFIRMATION = "DROP_ONLY_TEMP_SCHEMA"
TEST_DATABASE_MARKER = re.compile(r"(?:^|[-_])(qa|test|testing|sandbox|stage|staging|dev|development)(?:$|[-_])", re.IGNORECASE)
REQUIRED_TABLES = {
    "red_projects",
    "red_evidence_files",
    "red_pmirs_signatures",
    "red_form_signatures",
    "red_operational_references",
    "red_privacy_cases",
    "red_project_visit_authorizations",
}

def expected_migration_revision() -> str:
    """Resolve the repository's actual Alembic head instead of pinning stale QA state."""
    head = ScriptDirectory.from_config(Config(str(APP_DIR / "alembic.ini"))).get_current_head()
    if not head:
        raise RuntimeError("RED no tiene una revisión Alembic de cabecera.")
    return head


def _safe_output(result: subprocess.CompletedProcess[str], database_url: str) -> str:
    parsed = make_url(database_url)
    redacted = parsed.render_as_string(hide_password=True)
    variants = {
        database_url,
        parsed.render_as_string(hide_password=False),
        parsed.set(drivername="postgresql+psycopg").render_as_string(hide_password=False),
    }
    output = result.stdout + "\n" + result.stderr
    for variant in sorted(variants, key=len, reverse=True):
        output = output.replace(variant, redacted)
    return "\n".join(output.splitlines())


def main() -> int:
    raw_url = os.environ.get("RED_TEST_POSTGRES_URL", "").strip()
    if not raw_url:
        print("No se modificó ninguna base. Define RED_TEST_POSTGRES_URL con una base PostgreSQL dedicada a pruebas.", file=sys.stderr)
        return 2
    if os.environ.get("RED_TEST_POSTGRES_ALLOW_SCHEMA_CREATE", "") != CONFIRMATION:
        print(
            "No se modificó ninguna base. Para autorizar la creación y eliminación de un esquema temporal, "
            f"define RED_TEST_POSTGRES_ALLOW_SCHEMA_CREATE={CONFIRMATION}.",
            file=sys.stderr,
        )
        return 2

    try:
        database_url = make_url(raw_url)
    except Exception:
        print("RED_TEST_POSTGRES_URL no es una URL válida; no se modificó ninguna base.", file=sys.stderr)
        return 2
    if database_url.get_backend_name() != "postgresql":
        print("RED_TEST_POSTGRES_URL debe apuntar a PostgreSQL; no se modificó ninguna base.", file=sys.stderr)
        return 2
    if database_url.drivername == "postgresql":
        database_url = database_url.set(drivername="postgresql+psycopg")

    expected_database = os.environ.get("RED_TEST_POSTGRES_EXPECTED_DATABASE", "").strip()
    if not expected_database:
        print(
            "No se modificó ninguna base. Define RED_TEST_POSTGRES_EXPECTED_DATABASE con el nombre exacto de la base de QA.",
            file=sys.stderr,
        )
        return 2
    if not database_url.database or database_url.database != expected_database:
        print(
            "No se modificó ninguna base. El nombre de base de RED_TEST_POSTGRES_URL no coincide con RED_TEST_POSTGRES_EXPECTED_DATABASE.",
            file=sys.stderr,
        )
        return 2
    if not TEST_DATABASE_MARKER.search(database_url.database):
        print(
            "No se modificó ninguna base. El nombre de la base debe identificar un entorno no productivo (qa/test/stage/dev/sandbox).",
            file=sys.stderr,
        )
        return 2

    source_schema = f"red_qa_{uuid4().hex}"
    restore_schema = f"red_qa_{uuid4().hex}"
    expected_revision = expected_migration_revision()
    schemas: list[str] = []
    maintenance_engine = create_engine(database_url, pool_pre_ping=True)
    try:
        for schema in (source_schema, restore_schema):
            with maintenance_engine.begin() as connection:
                connection.exec_driver_sql(f'CREATE SCHEMA "{schema}"')
            schemas.append(schema)

        with tempfile.TemporaryDirectory(prefix="greenatics-red-postgres-qa-") as temporary:
            temp = Path(temporary)
            env = {
                **os.environ,
                "APP_ENV": "local",
                "DATABASE_URL": database_url.render_as_string(hide_password=False),
                "DATABASE_SCHEMA": source_schema,
                "INSTANCE_DIR": str(temp / "instance"),
                "RED_STORAGE_ROOT": str(temp / "private"),
                "STORAGE_BACKEND": "filesystem",
                "SESSION_SECRET": "synthetic-postgres-qa-secret-32-chars-minimum",
                "SESSION_HTTPS_ONLY": "false",
                "RED_OPERATIONAL_WRITES_ENABLED": "false",
                "RED_PUBLIC_ACCESS_ENABLED": "false",
                "RED_PRIVACY_APPROVED": "false",
                "RED_SUPERVISED_PILOT_APPROVED": "false",
            }
            for schema in schemas:
                migration_env = {**env, "DATABASE_SCHEMA": schema}
                targets = ["head", "head"] if schema == source_schema else [
                    "0001_red_workspace", "head", "head",
                ]
                for target in targets:
                    migration = subprocess.run(
                        [sys.executable, "-m", "alembic", "upgrade", target],
                        cwd=APP_DIR,
                        env=migration_env,
                        capture_output=True,
                        text=True,
                        timeout=180,
                        check=False,
                    )
                    if migration.returncode:
                        print("Falló Alembic en el esquema temporal de QA:\n" + _safe_output(migration, raw_url), file=sys.stderr)
                        return 1
                    if target == "0001_red_workspace":
                        # Reproduce the default 32-character Alembic table from an older install.
                        with maintenance_engine.begin() as connection:
                            connection.exec_driver_sql(
                                f'ALTER TABLE "{schema}".alembic_version ALTER COLUMN version_num TYPE VARCHAR(32)'
                            )
                with maintenance_engine.connect() as connection:
                    revision_length = connection.execute(text(
                        "SELECT character_maximum_length FROM information_schema.columns "
                        "WHERE table_schema = :schema AND table_name = 'alembic_version' "
                        "AND column_name = 'version_num'"
                    ), {"schema": schema}).scalar_one()
                    if revision_length != 128:
                        raise RuntimeError("El registro de revisiones PostgreSQL no admite los IDs descriptivos de RED.")
            print("PostgreSQL QA: instalación nueva, actualización desde tabla de revisión de 32 caracteres e idempotencia OK.")

            scoped_engine = create_engine(
                database_url,
                pool_pre_ping=True,
                connect_args={"options": f"-csearch_path={source_schema}"},
            )
            try:
                with scoped_engine.connect() as connection:
                    tables = set(connection.execute(text(
                        "SELECT table_name FROM information_schema.tables WHERE table_schema = :schema"
                    ), {"schema": source_schema}).scalars())
                    missing = REQUIRED_TABLES - tables
                    if missing:
                        print("Faltan tablas tras las migraciones: " + ", ".join(sorted(missing)), file=sys.stderr)
                        return 1
                    revision = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one()
                    projects = connection.execute(text(
                        "SELECT slug, name FROM red_projects ORDER BY slug"
                    )).all()
                    if revision != expected_revision:
                        print(f"Revisión inesperada: {revision}", file=sys.stderr)
                        return 1
                    if [(row.slug, row.name) for row in projects] != sorted(BELLO_PROJECTS):
                        print("La siembra de los cuatro expedientes iniciales no coincide con el catálogo aprobado.", file=sys.stderr)
                        return 1
            finally:
                scoped_engine.dispose()

            roundtrip_env = {
                **env,
                "DATABASE_SCHEMA": source_schema,
                # The helper uses write routes only inside disposable synthetic schemas.
                "RED_OPERATIONAL_WRITES_ENABLED": "true",
                "RED_QA_RESTORE_SCHEMA": restore_schema,
                "RED_QA_RESTORE_STORAGE_ROOT": str(temp / "restored-private"),
            }
            roundtrip = subprocess.run(
                [sys.executable, "scripts/_postgres_backup_roundtrip.py"],
                cwd=APP_DIR,
                env=roundtrip_env,
                capture_output=True,
                text=True,
                timeout=180,
                check=False,
            )
            if roundtrip.returncode:
                print("Falló el respaldo/restauración sintética PostgreSQL:\n" + _safe_output(roundtrip, raw_url), file=sys.stderr)
                return 1
            print(f"PostgreSQL OK: Alembic {expected_revision}, cuatro expedientes y ciclo de respaldo/restauración en {len(schemas)} esquemas.")
        return 0
    except Exception as exc:
        print(f"Falló la verificación PostgreSQL ({type(exc).__name__}); revisa la conectividad y los permisos del esquema.", file=sys.stderr)
        return 1
    finally:
        for schema in reversed(schemas):
            try:
                with maintenance_engine.begin() as connection:
                    connection.exec_driver_sql(f'DROP SCHEMA "{schema}" CASCADE')
                print(f"Esquema temporal eliminado: {schema}.")
            except Exception as exc:
                print(
                    f"No se pudo eliminar el esquema temporal {schema} ({type(exc).__name__}); "
                    "elimínalo manualmente después de revisar que sea el esquema red_qa_ creado por esta ejecución.",
                    file=sys.stderr,
                )
        maintenance_engine.dispose()


if __name__ == "__main__":
    raise SystemExit(main())
