# Calcula tu Huella dentro de Greenatics

Esta carpeta es la copia canónica de trabajo de `CALCULAHUELLA_MIGRACION_CANONICA/repository` incorporada al proyecto central Greenatics.

El contrato común para preparar su staging está en `../../docs/STAGING_GREENATICS_CONTRACT.md`.

## Versión incorporada

- V0.45.5.
- FastAPI + SQLAlchemy + PostgreSQL.
- Docker y Docker Compose disponibles.
- Importación configurable CSV/XLSX, mapeo, validación por lote, corrección guiada, evidencias, historial y reportes.

## Verificación local

- Entorno virtual local instalado con Python 3.12.
- Migraciones Alembic aplicadas sobre SQLite aislada de demostración.
- `251` pruebas aprobadas.
- Runtime Uvicorn comprobado en `127.0.0.1:8765`: `/api/health` respondió `status=ok`, versión `0.45.5`, y `/login` respondió `200`.
- El instalador macOS genera un bundle `.app` válido cuando la entrega no incluye uno precompilado.

## Límite actual

La aplicación está almacenada junto al sitio, pero aún no está conectada a la exportación estática ni publicada en un entorno productivo Greenatics. La ruta pública `/huella/` continúa siendo el estimador y la explicación de producto; el backend se debe ejecutar como servicio independiente.

## Puerta antes de producción

1. Crear entorno `staging` con PostgreSQL y almacenamiento privado.
2. Definir dominio Greenatics, `TRUSTED_HOSTS`, `SESSION_SECRET` y credenciales únicas.
3. Mantener `SEED_DEMO=false` y retirar usuarios demo.
4. Ejecutar migraciones, pruebas, diagnóstico de seguridad y restauración.
5. Verificar aislamiento por organización, cookies seguras, CSRF, uploads, auditoría y backups.
6. Publicar el enlace desde el Centro Greenatics solo cuando el servicio supere esos gates.

No se deben modificar factores, fórmulas o metodología como parte de esta incorporación.
