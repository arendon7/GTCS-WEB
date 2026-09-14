# Desarrollo local

## Requisitos

- Python 3.11 o superior.
- Git.
- Docker Desktop opcional.

## Instalación Python

```bash
git clone https://github.com/arendon7/CALCULAHUELLA.git
cd CALCULAHUELLA
./scripts/dev/setup.sh
./scripts/dev/run.sh
```

La aplicación queda disponible por defecto en `http://127.0.0.1:8765`.

## Pruebas

```bash
./scripts/dev/test.sh
```

## Docker y PostgreSQL

```bash
docker compose -f docker-compose.local.yml up --build
```

Los datos locales se guardan en volúmenes Docker y no se confirman en Git.
