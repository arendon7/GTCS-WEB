from __future__ import annotations

from alembic import context
from alembic.ddl.postgresql import PostgresqlImpl
from sqlalchemy import String, engine_from_config, inspect, pool

from app.config import settings


class RedPostgresqlImpl(PostgresqlImpl):
    """Keep descriptive RED revision IDs intact in PostgreSQL and offline SQL."""

    __dialect__ = "postgresql"

    def version_table_impl(self, **kwargs):
        table = super().version_table_impl(**kwargs)
        table.c.version_num.type = String(128)
        return table


def widen_existing_revision_table(connection) -> None:
    if connection.dialect.name != "postgresql":
        return
    schema = settings.database_schema or None
    inspector = inspect(connection)
    if not inspector.has_table("alembic_version", schema=schema):
        return
    version_column = next(
        column for column in inspector.get_columns("alembic_version", schema=schema)
        if column["name"] == "version_num"
    )
    length = getattr(version_column["type"], "length", None)
    if length is not None and length < 128:
        quote = connection.dialect.identifier_preparer.quote
        table_name = quote("alembic_version")
        if schema:
            table_name = f"{quote(schema)}.{table_name}"
        connection.exec_driver_sql(
            f"ALTER TABLE {table_name} ALTER COLUMN version_num TYPE VARCHAR(128)"
        )

migration_issues = settings.database_migration_issues()
if migration_issues:
    raise SystemExit("Migraciones RED detenidas: " + " ".join(migration_issues))

from app.db import Base
from app import models  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url.replace("%", "%%"))
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=False,
    )
    with context.begin_transaction():
        if settings.database_schema:
            context.execute(f'CREATE SCHEMA IF NOT EXISTS "{settings.database_schema}";')
            context.execute(f'SET search_path TO "{settings.database_schema}";')
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.begin() as connection:
        if settings.database_schema:
            connection.exec_driver_sql(f'CREATE SCHEMA IF NOT EXISTS "{settings.database_schema}"')
            connection.exec_driver_sql(f'SET search_path TO "{settings.database_schema}"')
        widen_existing_revision_table(connection)
        context.configure(connection=connection, target_metadata=target_metadata, include_schemas=False)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
