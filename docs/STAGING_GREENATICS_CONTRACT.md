# Contrato de staging · Greenatics

Este documento convierte la siguiente fase del plan en una lista ejecutable. No contiene secretos ni crea infraestructura. Su función es que Huella, OPS, Red y el sitio público lleguen a staging con fronteras claras.

## Topología propuesta

| Superficie | Origen | Estado | Regla |
| --- | --- | --- | --- |
| Sitio público | Next.js Greenatics | Disponible en `localhost:3001` | Solo contenido, demos y enlaces públicos |
| Centro Greenatics | `/plataforma/` | Disponible | No autentica ni consulta bases privadas |
| Calcula tu Huella | FastAPI V0.45.5 | Incorporado, pendiente staging | Servicio separado con PostgreSQL y almacenamiento privado |
| GREENATICS OPS | Next.js + Supabase | Incorporado, gates locales aprobados | Runtime separado con RLS y membresías por planta |
| GREENATICS Red | Next.js navegable | Prototipo | Persistencia y permisos antes de operación real |

Dominios objetivo, sujetos a decisión de proveedor:

```text
greenatics.com             sitio público y portal
huella.greenatics.com     FastAPI de Calcula tu Huella
ops.greenatics.com        aplicación autenticada OPS
red.greenatics.com        aplicación Red cuando tenga backend
```

## Reglas de entorno

### Público

- `NEXT_PUBLIC_DATA_MODE=local` cuando aplique.
- Sin claves Supabase, secretos de sesión, bases, evidencias ni datos operativos.
- `/app/` continúa siendo demo editorial o bloqueo de configuración.
- El portal muestra el estado real del producto y no promete acceso activo.

Cuando exista un runtime certificado, el portal puede activarlo mediante URLs públicas de build, sin guardar secretos en el sitio:

```text
NEXT_PUBLIC_HUELLA_APP_URL=https://huella-staging.greenatics.com
NEXT_PUBLIC_OPS_APP_URL=https://ops-staging.greenatics.com
NEXT_PUBLIC_RED_APP_URL=https://red-staging.greenatics.com
```

Una variable vacía conserva el fallback público actual. Estas URLs no deben habilitarse hasta completar los gates de autenticación, permisos, salud, backup y UAT.

Antes del build público, ejecutar `npm run qa:runtime-config`. El gate permite las tres variables vacías durante el desarrollo y rechaza destinos malformados o inseguros. Su aprobación no sustituye el preflight funcional del runtime.

### Huella

Variables mínimas de staging, cargadas solo en el proveedor del servicio:

```text
APP_ENV=staging
SESSION_SECRET=<secreto aleatorio de staging>
SESSION_HTTPS_ONLY=true
DATABASE_URL=<PostgreSQL de staging>
PUBLIC_BASE_URL=https://huella-staging.greenatics.com
TRUSTED_HOSTS=huella-staging.greenatics.com
SEED_DEMO=false
STORAGE_BACKEND=filesystem o s3
CSRF_ENABLED=true
AUDIT_CHAIN_ENABLED=true
DEPLOYMENT_STRICT=true
```

`BOOTSTRAP_ADMIN_EMAIL` y `BOOTSTRAP_ADMIN_PASSWORD` solo pueden existir durante el bootstrap controlado, deben ser únicos para staging y no deben quedar en logs. La operación productiva debe usar el flujo de administración normal y retirar cualquier credencial temporal.

Puertas mínimas:

1. Aplicar migraciones Alembic sobre una base nueva.
2. Confirmar `/api/health` y readiness del almacenamiento.
3. Completar inventario, carga CSV/XLSX, mapeo, validación, corrección, evidencia, cálculo, cierre e informe con una organización de prueba.
4. Intentar lectura cross-organization y confirmar rechazo.
5. Probar backup, restauración y descarga controlada de evidencias.

### OPS

Variables mínimas de staging, cargadas solo en Vercel/Supabase:

```text
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=<proyecto Supabase piloto>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<clave publicable>
SUPABASE_SECRET_KEY=<clave solo servidor>
APP_BASE_URL=https://ops-staging.greenatics.com
```

Puertas mínimas:

1. Aplicar las migraciones versionadas en un proyecto Supabase nuevo.
2. Ejecutar preflight de backend para `TAM` y `YAR`.
3. Crear de forma atómica el Director de prueba y las membresías piloto.
4. Ejecutar smoke RLS con Director, Operario Támesis y Operario Yarumal.
5. Verificar bitácora, recepciones, lotes, compostaje, producción, mantenimiento, inventario, compras, gastos, ventas y reportes.
6. Confirmar que una operación de Támesis no puede leer ni modificar datos de Yarumal y viceversa.

## Datos de prueba

Los datos de staging deben ser sintéticos o estar anonimizados:

- Organización: `Greenatics Staging`.
- Plantas: `TAM` Támesis y `YAR` Yarumal.
- Usuarios: Director, Operario Támesis, Operario Yarumal, Revisor Huella y Administrador técnico.
- Evidencias: archivos de prueba sin datos personales ni documentos contractuales.
- Inventarios: periodos ficticios claramente marcados como `STAGING`.

Nunca importar a staging un backup productivo sin anonimización, aprobación y registro de procedencia.

## Promoción al portal

El portal Greenatics solo cambia una tarjeta de “incorporado”, “demo” o “prototipo” a “acceso disponible” cuando se cumplen todos estos puntos:

- dominio HTTPS resuelve al runtime correcto;
- autenticación y recuperación funcionan;
- permisos y RLS están probados;
- salud, logs y alertas responden;
- backup y restauración fueron ensayados;
- el smoke browser pasa en escritorio y móvil;
- los datos visibles no son ilustrativos por accidente;
- el responsable de soporte y rollback está definido.

La landing pública puede enlazar antes al flujo de solicitud de acceso, pero no debe enlazar a una URL privada inexistente ni presentar una maqueta como plataforma activa.

## Responsables por tipo de decisión

- Dirección de producto: alcance, claims, nombre del producto y estado público.
- Ingeniería: dominio, runtime, variables, migraciones, backups y rollback.
- Operación: catálogos, plantas, roles, actividades, cierres y UAT.
- Revisión técnica: factores, metodología, evidencias y publicación de resultados.
- Astra: decisiones de arquitectura, priorización y criterios de salida.
- Sol o Terra: ejecución acotada, pruebas, documentación y QA repetible.

## Primera ejecución cuando exista infraestructura

1. Crear proyectos de staging vacíos, nunca sobre producción.
2. Cargar variables desde el gestor de secretos.
3. Aplicar migraciones y ejecutar preflight.
4. Crear usuarios de prueba y correr UAT.
5. Registrar resultados, incidencias y decisión de promoción.
6. Solo después actualizar los enlaces del Centro Greenatics.

## Registro de verificación local · 2026-09-11

La preparación local de las aplicaciones tiene estos resultados reproducibles:

- Sitio público: `pnpm build` genera **91 rutas** y `pnpm audit:static` confirma **89 páginas / 27 rutas**.
- Calcula tu Huella: `PYTHONPATH=. .venv/bin/python -m pytest -q` pasa **252 pruebas**. La advertencia restante proviene de una API deprecada de `anyio` en `starlette` y no produjo fallos.
- GREENATICS OPS: `pnpm typecheck` pasa; `pnpm test` pasa **89 archivos / 392 pruebas**; `pnpm exec next build --webpack` genera **99 rutas**.
- El build de OPS con Turbopack queda pendiente de un entorno que permita el proceso auxiliar que necesita para CSS; Webpack completó compilación, TypeScript, generación estática y trazas sin errores.

Estos resultados son gates locales. No autorizan por sí solos staging ni producción: siguen pendientes PostgreSQL/Supabase nuevos, secretos externos, HTTPS, autenticación, RLS, backups, restauración, smoke browser y UAT con usuarios de prueba.

## Gate de integración del monorepo · 2026-09-11

El workflow `.github/workflows/ci.yml` ahora protege las tres superficies en cada pull request y en cada push a `main` o `develop`, sin mezclar sus dependencias ni sus secretos:

- **Web pública:** `npm ci`, typecheck, configuración segura de runtimes, build, auditoría estática, smoke visual desktop/móvil y accesibilidad.
- **GREENATICS OPS:** `pnpm install --frozen-lockfile`, typecheck, ESLint, suite Vitest y build de producción con `next build --webpack`. Webpack es el fallback reproducible del CI mientras el entorno de ejecución no garantice el proceso auxiliar de Turbopack.
- **Calcula tu Huella:** instalación desde `requirements-dev.txt`, compilación Python, migración sobre SQLite limpia y suite completa de `pytest` con `PYTHONPATH` explícito.

Los gates automáticos comprueban que el artefacto se puede construir y probar; no crean infraestructura, no ejecutan migraciones remotas y no activan enlaces externos en el portal. Los workflows `hosted-pilot-*` siguen siendo la etapa posterior para preflight de Vercel, Supabase, autenticación, RLS y UAT.
