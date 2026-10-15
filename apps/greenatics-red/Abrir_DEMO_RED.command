#!/bin/zsh
set -uo pipefail

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

if [[ ! -x ".venv/bin/python" ]]; then
  echo "No encuentro el entorno Python de RED en: $APP_DIR/.venv"
  echo "Abre una terminal en apps/greenatics-red y prepara el entorno siguiendo la sección Desarrollo local del README."
  echo "Esta demo no requiere Git ni Command Line Tools una vez que .venv está instalado."
  read -r "?Presiona Enter para cerrar esta ventana..."
  exit 1
fi

echo "GREENATICS RED · DEMO local de capacitación"
echo "Solo datos ficticios. No uses información de los cuatro conjuntos."
echo "Al presionar Ctrl+C se eliminarán la base temporal, archivos y contraseñas DEMO."
echo

"$APP_DIR/.venv/bin/python" scripts/run_synthetic_field_demo.py \
  --port 18797 \
  --full-training-scenario \
  --with-progress-history \
  --open-browser \
  --open-credentials
DEMO_STATUS=$?

echo
if [[ "$DEMO_STATUS" -eq 0 ]]; then
  echo "La demo terminó y sus datos temporales se borraron."
else
  echo "La demo terminó con código $DEMO_STATUS. Si el puerto está ocupado, cierra esa instancia y vuelve a abrir este archivo."
fi
read -r "?Presiona Enter para cerrar esta ventana..."
exit "$DEMO_STATUS"
