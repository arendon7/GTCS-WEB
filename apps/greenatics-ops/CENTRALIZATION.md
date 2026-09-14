# GREENATICS OPS dentro de Greenatics

Esta carpeta es una copia de trabajo de la aplicación full-stack de OPS tomada del repositorio público `arendon7/GTCS-WEB`, rama `release/current-certified-stack-ops`, commit `67a91fb4ccf991cca07af9be27dfa4cb85c83cca`.

El contrato común para preparar su staging está en `../../docs/STAGING_GREENATICS_CONTRACT.md`.

## Qué contiene

- Next.js + React + TypeScript.
- Login y sesión con Supabase SSR.
- RLS y membresías por planta.
- Operación diaria, calendario y actividades.
- Recepciones, lotes, compostaje y producción.
- Equipos, fallas y mantenimiento.
- Inventario, despachos, compras, gastos, ventas y liquidaciones.
- Importación histórica, analítica, reportes y scripts de preflight.
- Migraciones Supabase versionadas y pruebas unitarias/E2E.

## Verificación local

- Dependencias instaladas con pnpm.
- Typecheck aprobado.
- Lint aprobado.
- Suite OPS aprobada: `89` archivos de prueba y `392` pruebas.
- Build de producción aprobado con `99` rutas.
- Runtime compilado comprobado con `next start`: `/login` y `/api/health` respondieron `200`; `/app` anónimo redirigió a `login?reason=configuration&next=/app`.

## Plantas piloto

- `TAM`: Támesis.
- `YAR`: Yarumal.

## Límite actual

La aplicación se incorpora como runtime separado y no reemplaza la experiencia pública de `/app/`, que seguirá siendo la demo editorial mientras no exista un entorno autenticado conectado. Las dependencias ya fueron instaladas localmente y el runtime pasó typecheck, pruebas y build; todavía no se ha configurado Supabase, ejecutado una migración contra una base real ni creado usuarios productivos desde este proyecto central.

## Puertas antes de publicación

1. Mantener los gates locales verificados: typecheck, 89 archivos de prueba, 392 pruebas y build de 99 rutas.
2. Configurar un proyecto Supabase piloto dedicado y aplicar migraciones únicamente sobre una base nueva.
3. Ejecutar preflight de backend, bootstrap atómico de Dirección y smoke RLS para `TAM` y `YAR` con usuarios de prueba.
4. Configurar el proyecto Vercel `full-ops` separado del preview público, con secretos fuera del repositorio.
5. Verificar que el portal Greenatics enlaza al runtime productivo solo después de que el preflight reporte `ready`.

Nunca colocar `service_role` ni secretos privilegiados en variables `NEXT_PUBLIC_*`.
