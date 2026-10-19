from __future__ import annotations

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import INSTANCE_DIR, settings

if settings.storage_backend in {"local", "filesystem"}:
    settings.storage_root.mkdir(parents=True, exist_ok=True)
    (settings.storage_root / "evidence").mkdir(parents=True, exist_ok=True)

engine_options: dict[str, object] = {"pool_pre_ping": True}
if settings.database_url.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
elif settings.database_schema:
    engine_options["connect_args"] = {"options": f"-csearch_path={settings.database_schema}"}

engine = create_engine(settings.database_url, **engine_options)

if settings.database_schema:
    @event.listens_for(engine, "connect")
    def set_isolated_schema(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{settings.database_schema}"')
        cursor.execute(f'SET search_path TO "{settings.database_schema}"')
        cursor.close()

    @event.listens_for(engine, "begin")
    def set_transaction_schema(connection) -> None:
        connection.exec_driver_sql(f'SET LOCAL search_path TO "{settings.database_schema}", public')


SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    with SessionLocal() as session:
        yield session
