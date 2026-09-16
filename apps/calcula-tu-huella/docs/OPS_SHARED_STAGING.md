# Huella en la infraestructura compartida de Greenatics OPS

Calcula tu Huella usa el proyecto Supabase `greenatics-ops` para no abrir un tercer proyecto gratuito. La frontera de datos es el esquema privado `huella`; no se usa el esquema `public` de OPS.

## Garantías aplicadas

- `huella` no tiene permisos de uso para `anon` ni `authenticated`.
- La Data API no es una ruta de acceso para Huella.
- La aplicación FastAPI se conecta desde su backend mediante PostgreSQL y `DATABASE_SCHEMA=huella`.
- Alembic configura el mismo `search_path`, por lo que sus tablas y `alembic_version` quedan dentro de `huella`.
- OPS continúa usando únicamente sus tablas y RLS del esquema `public`.

## Preparar el runtime

1. Cree un entorno de variables privado desde `.env.ops-staging.example`; nunca copie el archivo al repositorio.
2. Obtenga la contraseña de base de datos desde Supabase y use el pooler de sesión para un backend persistente.
3. Provisione almacenamiento S3 privado, HTTPS y un contenedor persistente antes de declarar producción.
4. Ejecute `python -m alembic upgrade head` con `DATABASE_SCHEMA=huella` antes de iniciar la aplicación.
5. Verifique `/api/health`, el inicio de sesión, carga de evidencia, una estimación y una restauración de respaldo en staging.

## Límites de esta etapa

El esquema ya existe y está aislado, pero Huella no se declara productiva hasta que un host de contenedores, almacenamiento externo, correo, monitoreo y respaldo estén configurados con secretos reales. No use credenciales demo ni inventarios de ejemplo como datos oficiales.
