# ADR-0005 · Boundary de persistencia y autorización por planta

**Estado:** ACEPTADO · implementación CORE-003 en curso

## Decisión
GREENATICS OPS admite dos modos explícitos y mutuamente excluyentes:

- `local`: desarrollo, CI, demos aisladas y validación UX. Persiste en este navegador.
- `supabase`: persistencia transaccional multiusuario mediante PostgreSQL + Supabase Auth/RLS.

El modo local es un adapter de desarrollo. No es caché ni fallback del modo remoto.

## Regla de integridad
Cuando `NEXT_PUBLIC_DATA_MODE=supabase`:

- Supabase es la fuente canónica de los verticales ya migrados.
- un fallo remoto se muestra como error; nunca se transforma silenciosamente en una escritura local;
- la UI solo muestra plantas y trabajadores autorizados por la sesión;
- las mutaciones críticas usan funciones transaccionales en PostgreSQL cuando intervienen varias tablas o invariantes concurrentes;
- después de una mutación exitosa se recarga el snapshot remoto; si falla ese refresh se informa que el guardado ocurrió pero la vista no pudo actualizarse.

## Seguridad
- Nunca se usa `service_role` en navegador.
- Solo URL y publishable key pueden ser `NEXT_PUBLIC_*`.
- Las tablas operativas tienen RLS.
- El acceso se concede por `plant_memberships`.
- La autorización vive en PostgreSQL además de la UI.
- No existen políticas DELETE para registros operativos.
- El perfil debe existir y estar activo para operar.

## Roles V0.1
`operator`, `supervisor`, `technical`, `maintenance`, `admin`, `director`.

## Núcleo remoto de CORE-003
El primer corte remoto cubre:

1. identidad de sesión y perfil;
2. membresías y plantas visibles;
3. trabajadores activos;
4. actividades programadas y ejecuciones con participantes;
5. iniciar actividad programada, incluida ejecución tardía de una actividad `missed`;
6. crear actividad no programada;
7. finalizar actividad y, si corresponde, abrir incidencia;
8. recepciones de material con generación atómica de lote.

Una fila `rescheduled` es un antecedente sustituido y no se presenta como actividad ejecutable.

## Concurrencia
- Un trabajador no puede quedar simultáneamente en dos actividades abiertas.
- La comprobación se serializa con advisory locks por trabajador.
- Una programación solo puede tener una ejecución real.
- La numeración de lotes de recepción se serializa por planta y fecha Bogotá.

## Activación
1. Crear proyecto Supabase.
2. Ejecutar migraciones en orden.
3. Crear usuarios en Auth.
4. Insertar `profiles` y `plant_memberships` iniciales desde un entorno administrativo seguro.
5. Copiar `.env.example` a `.env.local`.
6. Configurar URL + publishable key.
7. Cambiar `NEXT_PUBLIC_DATA_MODE=supabase`.
8. Validar sesión y RLS antes de cargar datos reales.

## Expansión siguiente
Aplicar el mismo repository pattern a mantenimiento, compostaje, producción/inventario, ventas, compras/gastos, caja, solicitudes, liquidaciones e insumos físicos. La integración documental SharePoint/Storage se mantiene separada de la fuente transaccional.
