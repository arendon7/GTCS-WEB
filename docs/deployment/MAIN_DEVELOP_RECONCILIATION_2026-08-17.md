# MAIN / DEVELOP RECONCILIATION · 2026-08-17

## Diagnóstico

Estado observado:

- `develop`: `bad111b729063ba8853b97eb679b05f898eed2f2`
- `main`: `22a0005806a9cbc11523439e37f6bc91d5aa1c57`
- relación: diverged
- `develop` ahead de `main`: 649 commits
- `main` ahead de `develop`: 22 commits
- merge base: `314da8d80c3730d08f372918e41fb01203ce2f5f`

No se recomienda merge directo entre ambas ramas.

## Por qué existe la divergencia

Las ramas evolucionaron como líneas funcionales paralelas desde una base muy temprana:

### Historia de `main`

Incluye principalmente:

1. Web pública V0.1 / V0.2 inicial.
2. soporte GitHub Pages / static export.
3. dispatchers manuales de infraestructura para piloto hosted.
4. workflows de onboarding/bootstrap inicial.
5. workflow de refresh de OPS production.

### Historia de `develop`

Contiene la plataforma actual:

- web pública reestructurada;
- GREENATICS OPS;
- Auth/RLS;
- Supabase y migraciones hasta 0037;
- planeación y maestros;
- Activity Log V2;
- Recepción V2;
- Compost V2;
- Mantenimiento V2;
- producción, inventario, comercial y finanzas;
- pruebas E2E y DB;
- infraestructura hosted actualizada;
- nueva Biblioteca y Wondergreen.

## Clasificación de cambios exclusivos de `main`

### A. NO FUSIONAR COMO CÓDIGO ACTUAL

La antigua Web Pública V0.1/V0.2 y sus componentes.

Razón: `develop` ya contiene una arquitectura pública posterior, integrada con la plataforma actual y con una batería de pruebas nueva.

Acción: conservar únicamente como historia Git; no cherry-pick.

### B. LEGADO DE GITHUB PAGES

- `.github/workflows/pages.yml`
- scripts/static export asociados
- ajustes históricos específicos de base path

Razón: no deben condicionar la arquitectura hosted de la plataforma actual.

Acción: no recuperar salvo decisión explícita de mantener GitHub Pages como mirror estático independiente.

### C. BOOTSTRAP / ONBOARDING DE UNA SOLA VEZ

- `hosted-pilot-onboarding.yml`
- `hosted-pilot-admin-resume.yml`

Estos workflows resuelven alta inicial de Director/Administrador y recuperación del proceso de bootstrap.

Acción: NO reintroducir automáticamente. Antes se debe verificar el estado actual de Auth, perfiles y memberships. Si los propietarios iniciales ya existen, estos flujos pasan a archivo histórico y el alta futura debe usar administración ordinaria.

### D. UAT DISPATCHER

- `hosted-pilot-uat.yml`

Acción: revisar durante Pilot Readiness. Recuperar solo si agrega valor sobre el `hosted-pilot-preview.yml` actual y no duplica mecanismos.

### E. PRODUCCIÓN OPS · RECUPERABLE

- `hosted-pilot-production-refresh.yml`

Este workflow:

- hace checkout de `develop`;
- ejecuta quality gates;
- valida backend;
- genera Preview;
- valida Preview protegido;
- despliega origen OPS estable;
- valida el deployment humano;
- no modifica usuarios ni memberships.

Los scripts requeridos continúan presentes en `develop`:

- `pilot:backend-preflight`
- `pilot:vercel-preview`
- `pilot:vercel-preflight`
- `pilot:preflight`
- `scripts/vercel-ops-production-deploy.mjs`

Acción: recuperar el workflow sobre la línea actual usando gates canónicos:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Estrategia de reconciliación

### Paso 1

Mantener `develop` como fuente funcional canónica.

### Paso 2

Recuperar de `main` únicamente infraestructura todavía necesaria, revalidada contra `develop`.

### Paso 3

No transportar la historia pública legacy hacia `develop`.

### Paso 4

Crear un release candidate desde `develop` una vez superado Pilot Readiness mínimo.

Ejemplo:

```text
release/ops-public-v1
```

### Paso 5

Hacer que `main` adopte el release candidate canónico mediante PR de release controlado.

Si GitHub no permite un merge limpio debido a historias incompatibles, la reconciliación debe realizarse mediante una estrategia explícita de sustitución canónica, preservando previamente un tag/branch histórico de `main`.

No se debe force-push `main` sin backup verificable y decisión documentada.

## Backup requerido antes del cutover

Antes de normalizar `main`, crear referencia inmutable o rama archivada:

```text
archive/main-pre-canonical-2026-08-17
```

Debe apuntar al SHA de `main` vigente antes del cutover.

## Exit criteria

La reconciliación termina cuando:

1. existe backup de la línea histórica de `main`;
2. la infraestructura vigente necesaria está recuperada en la línea canónica;
3. `develop` pasa quality y pilot gates;
4. existe un release candidate validado;
5. `main` representa ese release y no una implementación antigua paralela;
6. el siguiente ciclo puede operar normalmente `feature -> develop -> release -> main`.
