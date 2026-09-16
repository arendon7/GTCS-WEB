#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
PY="${CTH_PYTHON_BIN:-/usr/local/bin/python}"
if [ ! -x "$PY" ]; then
  PY="$(command -v python)"
fi
export PYTHONPATH="$ROOT${PYTHONPATH:+:$PYTHONPATH}"
export APP_ENV="${APP_ENV:-production}"
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-10000}"
export OPEN_BROWSER=0
# Complete schema setup before serving traffic. This prevents a healthy
# container from exposing a half-initialized application to real users.
echo "Inicialización de base de datos iniciada." >&2
"$PY" -m alembic upgrade head
"$PY" - <<'PYCODE'
from sqlalchemy import text

from app.db.base import ENGINE
from app.database import init_db

# Keep startup safe for staging databases that were created by an earlier
# revision before the password hash migration existed.
if ENGINE.dialect.name == "postgresql":
    with ENGINE.begin() as connection:
        connection.execute(text("ALTER TABLE app_users ALTER COLUMN password_hash TYPE VARCHAR(255)"))
        # Older staging schemas used narrower VARCHAR limits for methodology
        # metadata. Preserve complete citations, URLs and notes during seeding.
        connection.execute(text("""
            DO $$
            BEGIN
                IF to_regclass(current_schema() || '.methodology_source_documents') IS NOT NULL THEN
                    ALTER TABLE methodology_source_documents ALTER COLUMN title TYPE TEXT;
                    ALTER TABLE methodology_source_documents ALTER COLUMN issuing_body TYPE TEXT;
                    ALTER TABLE methodology_source_documents ALTER COLUMN document_type TYPE TEXT;
                    ALTER TABLE methodology_source_documents ALTER COLUMN jurisdiction TYPE TEXT;
                    ALTER TABLE methodology_source_documents ALTER COLUMN source_url TYPE TEXT;
                    ALTER TABLE methodology_source_documents ALTER COLUMN status TYPE TEXT;
                END IF;
            END $$;
        """))

init_db()
print("Esquema e inicialización verificados.")
PYCODE
if [ "${DEPLOYMENT_STRICT:-false}" = "true" ]; then
  "$PY" scripts/check_ready.py
else
  echo "Certificación externa diferida: DEPLOYMENT_STRICT=false; consultar /api/ready." >&2
fi

exec "$PY" -m uvicorn app.main:app \
  --host "$HOST" \
  --port "$PORT" \
  --workers "${WEB_CONCURRENCY:-1}" \
  --proxy-headers \
  --forwarded-allow-ips "${FORWARDED_ALLOW_IPS:-*}" \
  --no-access-log
