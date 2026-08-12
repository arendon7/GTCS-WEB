# GREENATICS · Vercel Git Integration

## Objetivo
Vincular `arendon7/GTCS-WEB` a Vercel mediante Git Integration para obtener previews reproducibles del mismo commit que revisa GitHub, sin crear un bundle manual alternativo y sin tocar el dominio productivo durante la validación.

## Estado de release
A 2026-08-12 `main` y `develop` están divergidas. `develop` contiene la plataforma pública + GREENATICS OPS vigente, mientras `main` conserva commits propios no reconciliados.

**Regla:** no definir todavía una rama productiva ni asociar `greenatics.com.co`. La primera integración se usa exclusivamente para Preview Deployments de branches/PRs hasta que exista una decisión explícita de release y convergencia.

## Configuración única en Vercel
1. Importar el repositorio GitHub `arendon7/GTCS-WEB` en el team autorizado.
2. Mantener Framework Preset `Next.js` y Root Directory en la raíz del repositorio.
3. No sobrescribir Build Command, Output Directory ni Install Command salvo que un gate posterior demuestre que es necesario.
4. Mantener Git Integration activa para que cada branch/PR genere su Preview Deployment.
5. No asociar dominio productivo durante esta fase.
6. No configurar `GREENATICS_OPS_LOCAL_BYPASS` en Vercel.

No se requiere `vercel.json` para este contrato inicial.

## Preview público sin OPS remoto
Puede desplegarse sin credenciales Supabase para validar la superficie pública.

Estado esperado en `/api/health`:
- `deployment.platform = "vercel"`
- `deployment.environment = "preview"`
- `deployment.branch` = branch desplegada
- `deployment.commit` = SHA abreviado del commit desplegado
- `mode = "local"`
- `opsAccess = "configuration-block"`

Esto significa: la web pública puede validarse, pero las rutas OPS permanecen cerradas por el gate de producción. `mode=local` no implica bypass en Vercel.

## Preview con OPS remoto
Configurar en el entorno Preview únicamente lo necesario:

```text
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<server-only-secret>
```

`SUPABASE_SECRET_KEY` nunca debe usar prefijo `NEXT_PUBLIC_`.

### Origen de autenticación
- Si `APP_BASE_URL` está definido, sigue siendo la autoridad explícita.
- Si `APP_BASE_URL` no está definido y `VERCEL_ENV=preview`, el servidor puede usar la variable de sistema `VERCEL_BRANCH_URL` como origen HTTPS estable de la rama.
- En producción **no existe ese fallback**: `APP_BASE_URL` debe configurarse explícitamente con el origen canónico aprobado.
- El origen de preview utilizado por Auth debe estar permitido también en la configuración de redirects del proyecto Supabase antes de probar invitaciones/confirmaciones.

Estado esperado en `/api/health` con backend completo:
- `status = "ready"`
- `opsAccess = "supabase-auth"`
- `checks.backend = "ok"`
- `checks.admin = "ok"`
- `checks.appOrigin = "ok"`

## Provenance segura
`/api/health` publica únicamente:
- plataforma (`vercel` o `generic`),
- entorno,
- nombre de branch validado,
- primeros 12 caracteres del SHA Git.

No publica `VERCEL_URL`, IDs de proyecto/team, mensajes de commit, secretos ni valores de configuración.

## Preview Gate
Antes de aprobar un preview:
1. Confirmar que branch y SHA de `/api/health` coinciden con el commit GitHub esperado.
2. Validar `/`, `/wondergreen`, `/soluciones`, `/proyectos`, `/impacto`, `/biblioteca`, `/nosotros` y `/contacto`.
3. Verificar `sitemap.xml` y `robots.txt`.
4. Verificar headers públicos e internos.
5. Confirmar que `/app` está bloqueado sin Supabase o exige sesión válida con Supabase.
6. Ejecutar login, perfil y membresía si el preview usa OPS remoto.
7. Revisar logs de build/runtime y ausencia de 5xx/bucles de redirect.
8. Probar desktop y móvil.

El gate completo continúa definido en `docs/deployment/PREVIEW-GATE.md`.

## Paso posterior
Solo después de un preview aprobado se decide:
- estrategia de convergencia `main` / `develop`,
- rama de producción Vercel,
- variables Production,
- dominio `greenatics.com.co`,
- canonical/sitemap/robots sobre el hostname definitivo.
