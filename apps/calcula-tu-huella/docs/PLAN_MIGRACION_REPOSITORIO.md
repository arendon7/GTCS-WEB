# Plan canónico de migración a GitHub

## Objetivo

Convertir `arendon7/CALCULAHUELLA` en la fuente única de código, ejecución local, pruebas, versiones y despliegues de **Calcula tu Huella**, sin almacenar los ZIP como aplicación ni perder archivos funcionales, recursos visuales, migraciones, pruebas o documentación validada.

## Línea base

La línea base es **v0.45.5**. La comparación con v0.45.2, v0.45.3 y v0.45.4 confirmó que esas versiones no contienen archivos funcionales ausentes en v0.45.5. No se combinarán carpetas de versiones.

## Principios

1. GitHub almacena el código fuente descomprimido y navegable.
2. Los datos locales y secretos no se confirman en Git.
3. Un `git clone` limpio debe poder instalar y ejecutar la plataforma.
4. Alembic es la autoridad del esquema de base de datos.
5. Factores, catálogos y fixtures demo controlados sí se versionan.
6. Los instalables se generan como GitHub Releases.

## Ejecución local

```bash
git clone https://github.com/arendon7/CALCULAHUELLA.git
cd CALCULAHUELLA
./scripts/dev/setup.sh
./scripts/dev/run.sh
```

Alternativa con Docker:

```bash
docker compose -f docker-compose.local.yml up --build
```

## Criterios de cierre

- Árbol v0.45.5 completo y verificable.
- Recursos visuales intactos.
- Migraciones, plantillas y pruebas aprobadas.
- Ejecución local y Docker reproducibles.
- Ningún secreto, base operativa, evidencia o reporte real publicado.
- `main` representa una línea estable y desplegable.
