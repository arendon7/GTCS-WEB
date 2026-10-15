#!/bin/sh
set -eu
python -m alembic upgrade head
# Uvicorn must not trust generic forwarded headers from arbitrary peers.
# RED reads CF-Connecting-IP only when TRUSTED_CLIENT_IP_HEADER is explicitly set;
# verify in staging that the hosting proxy supplies it and clients cannot spoof it.
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}" --no-proxy-headers
