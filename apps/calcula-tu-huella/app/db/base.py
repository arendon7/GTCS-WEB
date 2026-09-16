from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from ..config import INSTANCE_DIR, settings

UPLOAD_DIR = INSTANCE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = Path(settings.database_url.removeprefix("sqlite:///")) if settings.database_url.startswith("sqlite:///") else None
_engine_options: dict[str, object] = {"pool_pre_ping": True}
if settings.database_url.startswith("sqlite"):
    _engine_options["connect_args"] = {"check_same_thread": False}
elif settings.database_schema:
    # The application never relies on the shared public schema when isolated.
    _engine_options["connect_args"] = {"options": f"-csearch_path={settings.database_schema}"}
ENGINE = create_engine(settings.database_url, **_engine_options)

if settings.database_schema:
    # Keep every pooled connection on the same isolated schema, not just the
    # connection used by Alembic during the deployment step.
    @event.listens_for(ENGINE, "connect")
    def _set_isolated_schema(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{settings.database_schema}"')
        cursor.execute(f'SET search_path TO "{settings.database_schema}"')
        cursor.close()

SessionLocal = sessionmaker(bind=ENGINE, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass
