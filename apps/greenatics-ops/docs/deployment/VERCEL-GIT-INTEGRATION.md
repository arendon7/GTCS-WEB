# GREENATICS · Vercel Git Integration

## Objetivo
Vincular `arendon7/GTCS-WEB` a Vercel mediante Git Integration para obtener previews reproducibles del mismo commit que revisa GitHub, sin crear un bundle manual alternativo y sin tocar el dominio productivo durante la validación.

## Estado de release
A 2026-08-12 `main` y `develop` están divergidas. `develop` contiene la plataforma pública + GREENATICS OPS vigente, mientras `main` conserva commits propios no reconciliados.

**Regla:** no definir todavía una rama productiva ni asociar `greenatics.com.co`. La primera integración se usa exclusivamente para Preview Deployments hasta que exista una decisión explícita de release y convergencia.

## Ruta canónica automatizada
El workflow manual `.github/workflows/hosted-pilot-preview.yml` despliega siempre el SHA exacto de `develop` y ofrece dos modos explícitos:

| Modo | Proyecto Vercel canónico | Backend | Uso |
| --- | --- | --- | --- |
| `public-only` | `greenatics-public-preview` | ninguno | QA público, visual, editorial, SEO, headers y frontera OPS |
| `full-ops` | `greenatics-ops` | Supabase piloto | autenticación, perfiles, membresías y operación multiusuario |

`public-only` es el modo predeterminado. Los nombres de proyecto están fijados por código para impedir que un preview público reutilice accidentalmente el proyecto que contiene secretos de OPS.

## Secretos de GitHub Actions
Ambos modos requieren únicamente:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
```

`full-ops` requiere además:

```text
PILOT_SUPABASE_URL
PILOT_SUPABASE_PUBLISHABLE_KEY
PILOT_SUPABASE_SECRET_KEY
```

El workflow público no ejecuta backend preflight y no entrega las credenciales Supabase al proyecto `greenatics-public-preview`.

## Preview `public-only`
El deployer crea o reutiliza exclusivamente `greenatics-public-preview` y configura en target `preview`:

```text
NEXT_PUBLIC_DATA_MODE=local
```

Estado exigido por `/api/health`:
- `status = "ready"`
- `deployment.platform = "vercel"`
- `deployment.environment = "preview"`
- branch y commit coinciden con el SHA desplegado
- `mode = "local"`
- `opsAccess = "configuration-block"`
- `checks.backend = "missing"`
- `checks.admin = "missing"`

El preflight falla si detecta credenciales backend en este proyecto. `/app` debe redirigir a `/login?reason=configuration&next=/app`.

## Preview `full-ops`
El deployer crea o reutiliza exclusivamente `greenatics-ops` y configura en target `preview`:

```text
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<server-only-secret>
```

Antes del deployment, el workflow ejecuta `pilot:backend-preflight`. Estado exigido por `/api/health`:
- `status = "ready"`
- `mode = "supabase"`
- `opsAccess = "supabase-auth"`
- `checks.backend = "ok"`
- `checks.admin = "ok"`
- `checks.appOrigin = "ok"`

`SUPABASE_SECRET_KEY` nunca debe usar prefijo `NEXT_PUBLIC_`.

### Origen de autenticación
- Si `APP_BASE_URL` está definido, sigue siendo la autoridad explícita.
- Si `APP_BASE_URL` no está definido y `VERCEL_ENV=preview`, el servidor puede usar la variable de sistema `VERCEL_BRANCH_URL` como origen HTTPS estable de la rama.
- En producción **no existe ese fallback**: `APP_BASE_URL` debe configurarse explícitamente con el origen canónico aprobado.
- El origen de preview utilizado por Auth debe estar permitido también en la configuración de redirects del proyecto Supabase antes de probar invitaciones/confirmaciones.

## Provenance segura
`/api/health` publica únicamente:
- plataforma (`vercel` o `generic`),
- entorno,
- nombre de branch validado,
- primeros 12 caracteres del SHA Git.

No publica `VERCEL_URL`, IDs de proyecto/team, mensajes de commit, secretos ni valores de configuración.

## Preview Gate
El mismo modo seleccionado para desplegar se entrega a `pilot:preflight`.

Antes de aprobar un preview:
1. confirmar branch y SHA de `/api/health`;
2. validar `/`, `/wondergreen`, `/soluciones`, `/proyectos`, `/impacto`, `/biblioteca`, `/nosotros` y `/contacto`;
3. verificar `sitemap.xml`, `robots.txt` y headers;
4. confirmar el comportamiento OPS correspondiente al modo;
5. en `public-only`, confirmar además ausencia de configuración backend;
6. en `full-ops`, ejecutar login, perfil, membresía y los smokes RLS/funcionales;
7. revisar logs de build/runtime y ausencia de 5xx/bucles de redirect;
8. probar desktop y móvil.

El gate completo continúa definido en `docs/deployment/PREVIEW-GATE.md`.

## Paso posterior
Solo después de un preview aprobado se decide:
- estrategia de convergencia `main` / `develop`,
- rama de producción Vercel,
- variables Production,
- dominio `greenatics.com.co`,
- canonical/sitemap/robots sobre el hostname definitivo.
