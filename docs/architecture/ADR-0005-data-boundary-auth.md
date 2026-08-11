# ADR-0005 · Boundary de persistencia y autorización por planta

**Estado:** ACEPTADO

## Decisión
GREENATICS OPS admite dos modos explícitos:

- `local`: desarrollo, CI, demos aisladas y validación UX.
- `supabase`: persistencia multiusuario mediante PostgreSQL + Supabase Auth/RLS.

El modo local es un adapter temporal; no define la arquitectura de dominio.

## Seguridad
- Nunca se usa `service_role` en navegador.
- Solo URL y publishable key pueden ser `NEXT_PUBLIC_*`.
- Las tablas públicas operativas tienen RLS antes de activar Supabase.
- El acceso se concede por membresía de planta.
- La autorización vive también en PostgreSQL, no solo en componentes React.
- No existen políticas DELETE para registros operativos en esta fase.

## Roles V0.1
`operator`, `supervisor`, `technical`, `maintenance`, `admin`, `director`.

La matriz de permisos podrá refinarse sin cambiar las entidades principales.

## Activación
1. Crear proyecto Supabase.
2. Ejecutar migraciones en orden.
3. Crear usuarios en Auth.
4. Insertar `profiles` y primera `plant_memberships` administrativa mediante entorno seguro/SQL.
5. Configurar `.env.local` desde `.env.example`.
6. Cambiar `NEXT_PUBLIC_DATA_MODE=supabase`.
7. Validar Auth/RLS antes de importar históricos.

## Pendiente
Los stores actuales continúan con el adapter local hasta conectar y certificar un proyecto Supabase real. No se simulan escrituras remotas.
