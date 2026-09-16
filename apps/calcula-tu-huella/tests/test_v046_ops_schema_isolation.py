from __future__ import annotations

import pytest

from app.config import Settings


def test_v046_accepts_a_safe_private_postgres_schema():
    settings = Settings(database_url="postgresql+psycopg://localhost/huella", database_schema="huella")
    assert settings.database_schema == "huella"


@pytest.mark.parametrize("schema", ["huella;drop", "huella-public", "public, huella", "1huella"])
def test_v046_rejects_unsafe_postgres_schema_names(schema: str):
    with pytest.raises(ValueError, match="DATABASE_SCHEMA"):
        Settings(database_schema=schema)
