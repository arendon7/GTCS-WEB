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

## Dos previews, dos fronteras
El workflow manual `hosted-pilot-preview` ofrece dos modos explícitos y no comparte el mismo proyecto Vercel entre ellos:

### `public-only` · predeterminado
- proyecto canónico: `greenatics-public-preview`;
- única variable funcional creada por el deployer: `NEXT_PUBLIC_DATA_MODE=local` con target `preview`;
- no requiere ni inyecta credenciales Supabase;
- no ejecuta backend preflight;
- `/api/health` debe reportar `mode=local`, `opsAccess=configuration-block`, `checks.backend=missing` y `checks.admin=missing`;
- `/app` debe redirigir a `/login?reason=configuration&next=/app`.

El gate falla si detecta backend/admin configurados: un preview público contaminado con credenciales no es aceptable aunque `NEXT_PUBLIC_DATA_MODE=local` pudiera impedir su uso.

### `full-ops`
- proyecto canónico: `greenatics-ops`;
- requiere `NEXT_PUBLIC_DATA_MODE=supabase`, URL Supabase, publishable key y secret key server-side;
- ejecuta backend preflight antes del deployment;
- `/api/health` debe reportar `mode=supabase`, `opsAccess=supabase-auth` y los checks remotos en `ok`;
- `/app` anónimo debe redirigir al login sin `reason=configuration`.

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
8. `public-only`: `/app` queda bloqueado por configuración y el health demuestra ausencia de credenciales backend.
9. `full-ops`: usuario sin sesión va a login; usuario válido necesita perfil activo y membresía activa de planta.
10. Un usuario autorizado entra a `/app`; RLS conserva aislamiento por planta/rol.
11. Salir de OPS hacia la web pública y entrar desde la web pública a OPS cruza una frontera documental, no depende de preservar el árbol de providers del cliente.

## Ejecución reproducible
Desde GitHub Actions, ejecutar `hosted-pilot-preview` y elegir el modo. `public-only` es la opción segura inicial para QA visual y editorial. `full-ops` se usa únicamente cuando el backend piloto esté listo y sus secretos existan en GitHub Actions.

El preflight desplegado recibe el mismo modo:

```bash
npm run pilot:preflight -- \
  --base-url https://<deployment> \
  --mode public-only \
  --expected-branch develop \
  --expected-commit <sha>
```

Cambiar a `--mode full-ops` únicamente para el proyecto OPS completo.

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
