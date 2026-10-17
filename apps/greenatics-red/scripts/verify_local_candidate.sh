#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
APP_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$APP_DIR"

if [ -n "${RED_PYTHON:-}" ]; then
  PYTHON_BIN=$RED_PYTHON
elif [ -x "$APP_DIR/.venv/bin/python" ]; then
  PYTHON_BIN=$APP_DIR/.venv/bin/python
else
  PYTHON_BIN=python3
fi
NODE_BIN=${RED_NODE:-node}

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  printf '%s\n' "No encuentro Python: $PYTHON_BIN" >&2
  exit 2
fi
if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  printf '%s\n' "No encuentro Node.js: $NODE_BIN (puedes indicar RED_NODE=/ruta/a/node)" >&2
  exit 2
fi

"$PYTHON_BIN" - <<'PY'
import sys

if sys.version_info[:2] != (3, 12):
    raise SystemExit(
        f"RED requiere Python 3.12; se encontró {sys.version_info.major}.{sys.version_info.minor}."
    )
print(f"Runtime Python: {sys.version.split()[0]}")
PY

printf '\n%s\n' '1/5 · Regresión Python'
"$PYTHON_BIN" -m pytest -q

printf '\n%s\n' '2/5 · Regresión JavaScript'
"$NODE_BIN" --test tests/*.test.cjs

printf '\n%s\n' '3/5 · Compilación Python'
"$PYTHON_BIN" -m compileall -q app migrations scripts tests

printf '\n%s\n' '4/5 · Sintaxis del arranque'
sh -n start.sh

printf '\n%s\n' '5/5 · Catálogo de formularios'
"$PYTHON_BIN" - <<'PY'
import json
from pathlib import Path

catalog = json.loads(Path("app/forms.json").read_text(encoding="utf-8"))
forms = catalog.get("forms")
if not isinstance(forms, list) or not forms:
    raise SystemExit("El catálogo debe incluir una lista de formularios no vacía.")
codes = [form.get("code") for form in forms]
if any(not code for code in codes) or len(codes) != len(set(codes)):
    raise SystemExit("Cada formulario debe tener un código único.")
field_count = 0
for form in forms:
    fields = form.get("fields", [])
    ids = [field.get("id") for field in fields]
    if any(not field_id for field_id in ids) or len(ids) != len(set(ids)):
        raise SystemExit(f"Identificadores de campo ausentes o duplicados en {form['code']}.")
    field_count += len(fields)
print(f"Catálogo válido: {len(forms)} formularios, {field_count} campos.")
PY

printf '\n%s\n' 'Candidato local verificado. Esto no acredita PostgreSQL, Drive, staging, móvil físico ni UAT.'
