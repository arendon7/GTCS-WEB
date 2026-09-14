# Aplicaciones Greenatics

Esta carpeta contiene aplicaciones ejecutables que forman parte del ecosistema Greenatics, pero que no deben mezclarse con la exportación estática de la web institucional.

## Aplicaciones

- `calcula-tu-huella/`: backend FastAPI + PostgreSQL de Calcula tu Huella V0.45.5. Incluye autenticación, inventarios, importación CSV/XLSX, validación, evidencia, historial, reportes y configuración Docker.
- `greenatics-ops/`: aplicación Next.js + Supabase de GREENATICS OPS, incorporada desde `release/current-certified-stack-ops`. Incluye operación, actividades, recepciones, mantenimiento, producción, inventario, comercial, analítica, RLS y pruebas.

## Regla de integración

La web pública enlaza a las aplicaciones y explica sus capacidades. La aplicación productiva se despliega como servicio separado bajo Greenatics, con secretos externos, almacenamiento privado, base de datos, backups y controles de acceso propios. La integración futura usará identidad, organizaciones y contratos de contexto; no consultas directas entre tablas privadas.

## Datos excluidos

Los directorios `instance/`, bases locales, archivos de evidencia, credenciales, certificados y secretos no se versionan aquí. El archivo `instance/.gitkeep` de cada aplicación puede reservar la carpeta para el entorno local sin transportar datos reales.
