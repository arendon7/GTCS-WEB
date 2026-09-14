# Estado de migración

## Completado

- v0.45.5 seleccionada como base canónica.
- Árbol fuente descomprimido preparado para GitHub.
- Configuración local reproducible añadida.
- Docker Compose local con PostgreSQL añadido.
- CI para Alembic, Jinja, regresión v0.45.x y Docker añadido.
- Exclusiones de datos locales, secretos y artefactos configuradas.

## Validación local previa

- Migraciones Alembic completas hasta la revisión v0.45.
- 64 plantillas Jinja compiladas.
- 18 pruebas críticas aprobadas.
- Portada, acceso y diagnóstico respondieron HTTP 200.

## Pendiente de cierre

- CI verde sobre el commit importado.
- Revisión visual de las pantallas esenciales.
- Merge a `main`, etiqueta de línea base y rama `develop`.
