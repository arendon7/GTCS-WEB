# GREENATICS · Web pública

Nueva plataforma pública de Greenatics: sitio institucional, Wondergreen, soluciones para municipios/ESP y acceso a GREENATICS OPS.

## Stack
- Next.js App Router + TypeScript
- CSS nativo con design tokens de marca
- Exportación estática preparada para hosting web/CDN
- CI por producto: web pública, GREENATICS OPS y Calcula tu Huella

## Desarrollo
```bash
npm install
npm run dev
```

## Estructura inicial
- `/` Home
- `/wondergreen` Hub comercial
- `/wondergreen/productos/[slug]` Fichas de producto
- `/municipios` Soluciones para municipios y ESP
- `/contacto` Conversión / agenda
- `/acceso` Puerta a GREENATICS OPS

## Centralización de aplicaciones

- `/plataforma` Centro Greenatics para entrar a las herramientas.
- `/red/app` Prototipo navegable independiente de GREENATICS Red.
- `/huella` Landing oficial, estimador público y puerta de entrada a Calcula tu Huella.
- `apps/calcula-tu-huella` Código ejecutable FastAPI + PostgreSQL incorporado para su futura publicación productiva.
- `apps/greenatics-ops` Runtime Next.js + Supabase completo de OPS, con migraciones y pruebas incorporadas.

La web pública se mantiene estática y separada de los runtimes de las aplicaciones. Consulta `docs/PLATAFORMA_GREENATICS_CENTRALIZACION.md` para la arquitectura, `docs/PLAN_TRABAJO_GREENATICS_APPS.md` para la secuencia por fases y `docs/STAGING_GREENATICS_CONTRACT.md` para las puertas de staging.

La función de cada ruta, su audiencia, mensaje, evidencia y CTA está registrada en `docs/knowledge/WEB_EDITORIAL_MATRIX_V1.md`. Úsala antes de crear nuevas secciones o repetir una promesa existente.

El último corte de publicación y las puertas pendientes de los runtimes están en `docs/RELEASE_READINESS_2026-09-14.md`.

Para trabajar con las aplicaciones locales levantadas, consulta `docs/LOCAL_GREENATICS_ECOSYSTEM.md` y ejecuta `pnpm qa:ecosystem`.

### Enlaces de runtime

El sitio usa fallbacks locales seguros mientras las aplicaciones no tengan un entorno certificado. Para activar un runtime desde el Centro Greenatics, configura en el build público únicamente después de completar autenticación, permisos, health, backups y UAT:

```bash
NEXT_PUBLIC_HUELLA_APP_URL=https://huella-staging.greenatics.com
NEXT_PUBLIC_OPS_APP_URL=https://ops-staging.greenatics.com
NEXT_PUBLIC_RED_APP_URL=https://red-staging.greenatics.com
```

Las variables no contienen secretos. No deben apuntar a dominios provisionales sin control de acceso ni reemplazar las rutas locales antes del preflight documentado.

Antes de compilar un build que active enlaces externos, ejecuta `npm run qa:runtime-config`. El gate permite variables vacías para demos locales y rechaza URLs inválidas, credenciales embebidas, queries, fragmentos y dominios de ejemplo.

## Fuente de verdad
Ver `docs/knowledge/`. No se deben inventar formulaciones, dosis, registros, resultados, claims ni activos de marca.

Rama de trabajo inicial: `feat/public-web-v0.1`.
