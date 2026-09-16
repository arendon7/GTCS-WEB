#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
source scripts/runtime_python.sh
cth_runtime_python "$ROOT"
PY="$CTH_RUNTIME_PYTHON"
export APP_ENV="${APP_ENV:-production}"
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8765}"
export OPEN_BROWSER=0
# Render's health check must be able to reach the process while a new PostgreSQL
# schema is migrated and seeded. Keep that boot work out of the critical path.
(
  set -euo pipefail
  echo "Inicialización de base de datos iniciada en segundo plano." >&2
  "$PY" -m alembic upgrade head
  "$PY" - <<'PYCODE'
from app.database import init_db
init_db()
print("Esquema e inicialización verificados.")
PYCODE
  if [ "${DEPLOYMENT_STRICT:-false}" = "true" ]; then
    "$PY" scripts/check_ready.py
  else
    echo "Certificación externa diferida: DEPLOYMENT_STRICT=false; consultar /api/ready." >&2
  fi
) > >(sed 's/^/[bootstrap] /' >&2) 2>&1 &
exec "$PY" -m uvicorn app.main:app \
  --host "$HOST" \
  --port "$PORT" \
  --workers "${WEB_CONCURRENCY:-1}" \
  --proxy-headers \
  --forwarded-allow-ips "${FORWARDED_ALLOW_IPS:-*}" \
  --no-access-log

