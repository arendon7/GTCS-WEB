# GREENATICS · Preview Gate

## Propósito
Definir el mínimo verificable antes de asociar `greenatics.com.co` a un deployment de `GTCS-WEB`.

## Estado de partida
- La web pública y GREENATICS OPS comparten artefacto Next.js.
- La web pública no monta stores OPS.
- OPS está protegido por proxy de request, guard server-side y RLS.
- Un deployment sin Supabase puede servir la web pública, pero debe bloquear las rutas OPS y llevarlas a `/login?reason=configuration`.
- `robots.txt` y `X-Robots-Tag` complementan la seguridad; no sustituyen autenticación.
- `/api/health` expone provenance mínima para comprobar que el preview corresponde al branch/SHA esperado.

## Variables de entorno
### Preview público sin OPS remoto
No activar un bypass local. En Vercel, el gate de v0.11 bloquea OPS si no existe configuración Supabase completa.

### Preview con OPS remoto
Configurar:
- `NEXT_PUBLIC_DATA_MODE=supabase`
- `NEXT_PUBLIC_SUPABASE_URL=<project-url>`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>`
- `SUPABASE_SECRET_KEY=<server-only-secret>` cuando se prueben administración, invitaciones o health completo.

Para redirects de autenticación:
- `APP_BASE_URL` es la autoridad explícita cuando está definido.
- En Vercel Preview, si falta, el servidor puede usar la variable de sistema `VERCEL_BRANCH_URL` sobre HTTPS.
- En Production, `APP_BASE_URL` es obligatorio; no existe fallback de branch URL.

Nunca configurar `GREENATICS_OPS_LOCAL_BYPASS` en Vercel.
Nunca exponer `SUPABASE_SECRET_KEY` ni ninguna credencial administrativa mediante variables `NEXT_PUBLIC_*`.

## Gate funcional del preview
1. `/api/health` identifica `deployment.platform=vercel`, `deployment.environment=preview` y branch/SHA correspondientes al commit GitHub que se está auditando.
2. `/` responde y muestra HOME pública.
3. `/wondergreen`, `/soluciones`, `/proyectos`, `/impacto`, `/biblioteca`, `/nosotros` y `/contacto` responden sin inicializar stores OPS.
4. `/sitemap.xml` contiene exclusivamente rutas públicas gobernadas.
5. `/robots.txt` bloquea rutas internas y `/api/`.
6. Respuestas públicas incluyen `nosniff`, `DENY` para framing, política de referrer y permisos restringidos.
7. `/app` y demás familias OPS incluyen `private, no-store` y `X-Robots-Tag: noindex, nofollow, noarchive`.
8. Preview sin Supabase: `/app` redirige a `/login?reason=configuration` y no muestra datos OPS; `/api/health` reporta `opsAccess=configuration-block`.
9. Preview con Supabase: usuario sin sesión va a login; usuario válido necesita perfil activo y membresía activa de planta; `/api/health` reporta `opsAccess=supabase-auth`.
10. Un usuario autorizado entra a `/app`; RLS conserva aislamiento por planta/rol.
11. Salir de OPS hacia la web pública y entrar desde la web pública a OPS cruza una frontera documental, no depende de preservar el árbol de providers del cliente.

## Gate de observabilidad
- Revisar build logs sin errores.
- Revisar runtime errors del preview.
- Probar desktop y móvil.
- No asociar el dominio si existen 5xx inesperados, bucles de redirect, datos OPS visibles sin sesión, provenance incorrecta o headers internos ausentes.

## Dominio
`greenatics.com.co` se asocia únicamente después de aprobar el preview. El cambio de DNS/dominio no debe utilizarse como mecanismo de prueba.

## Después del dominio
- Verificar canonical, sitemap y robots en el hostname definitivo.
- Verificar login/redirects desde el dominio definitivo.
- Revisar Search Console/analítica solo cuando la capa pública esté estable.
