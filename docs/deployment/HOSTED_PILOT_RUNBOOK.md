# GREENATICS · Hosted Pilot Runbook

## Objetivo
Publicar y certificar la plataforma dual GREENATICS sin exponer secretos: la web pública permanece abierta y GREENATICS OPS solo se habilita cuando existe un backend hospedado certificado.

## 1. Dos etapas de preview
La validación hospedada se divide en dos modos explícitos:

### `public-only` · primera etapa y modo predeterminado
- proyecto Vercel canónico: `greenatics-public-preview`;
- no requiere Supabase;
- `NEXT_PUBLIC_DATA_MODE=local`;
- OPS permanece en `configuration-block`;
- sirve para QA visual/editorial, SEO, headers, navegación y frontera público/privado.

### `full-ops` · segunda etapa
- proyecto Vercel canónico: `greenatics-ops`;
- requiere Supabase piloto certificado;
- `NEXT_PUBLIC_DATA_MODE=supabase`;
- OPS usa `supabase-auth` y RLS.

Los proyectos son distintos por diseño. No reutilizar `greenatics-ops` como preview público ni `greenatics-public-preview` para pruebas con credenciales.

## 2. Supabase hospedado para `full-ops`
1. Crear un proyecto dedicado para GREENATICS OPS.
2. Vincular el repositorio con Supabase CLI.
3. Aplicar **todas** las migraciones versionadas de `supabase/migrations` sobre una base limpia.
4. Verificar las plantas canónicas que se usarán en el piloto.
5. No crear tablas, políticas ni RPC manualmente por fuera de migraciones.

Para el piloto actual, los códigos canónicos son `TAM` (Támesis) y `YAR` (Yarumal). Los scripts aceptan alias humanos, pero el runbook y la base deben usar códigos canónicos.

## 3. Frontera pública / interna
La misma base de producto contiene dos superficies:
- públicas: `/`, `/wondergreen`, `/soluciones`, `/proyectos`, `/impacto`, `/biblioteca`, `/nosotros`, `/contacto` y descendientes;
- internas: `/app`, operación, dashboard, importaciones, administración y cuenta.

Una visita anónima a la web pública nunca debe terminar en `/login`.

En `public-only`, `/app` debe redirigir a `/login?reason=configuration&next=/app`. En `full-ops`, `/app` anónimo debe redirigir al login sin `reason=configuration` y una sesión válida debe quedar sujeta a perfil, membresía y RLS.

## 4. Auth URL y plantilla de invitación para `full-ops`
Configurar en Supabase Auth:
- Site URL = origen canónico del deployment Next.js.
- Allowed Redirect URLs = el mismo origen y previews realmente autorizados.

Personalizar **Invite user** para que el token llegue al endpoint SSR:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/account/setup">
  Activar acceso a GREENATICS OPS
</a>
```

No usar el fragmento de sesión del flujo cliente como mecanismo principal del piloto.

## 5. GitHub Actions y secretos
El workflow manual `.github/workflows/hosted-pilot-preview.yml` hace checkout explícito de `develop`, captura su SHA completo, crea o reutiliza el proyecto Vercel canónico del modo seleccionado y despliega **solo Preview**.

Secretos requeridos para ambos modos:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
```

Secretos adicionales requeridos solo por `full-ops`:

```text
PILOT_SUPABASE_URL
PILOT_SUPABASE_PUBLISHABLE_KEY
PILOT_SUPABASE_SECRET_KEY
```

### Contrato `public-only`
El workflow:
1. selecciona `public-only` por defecto;
2. no exige secretos Supabase;
3. no ejecuta `pilot:backend-preflight`;
4. crea o reutiliza `greenatics-public-preview`;
5. hace upsert únicamente de `NEXT_PUBLIC_DATA_MODE=local` con target `preview`;
6. despliega el SHA exacto de `develop` sin `target=production`;
7. espera `READY` y falla cerrado ante estados terminales;
8. ejecuta `pilot:preflight -- --mode public-only`.

El preflight exige que `/api/health` reporte `backend=missing` y `admin=missing`. Si aparecen configurados, el gate falla para detectar contaminación de credenciales.

### Contrato `full-ops`
El workflow:
1. exige los secretos Supabase;
2. corre `pilot:backend-preflight -- --plants TAM,YAR --require-no-director`;
3. crea o reutiliza `greenatics-ops`;
4. configura únicamente en target `preview`:

```text
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<server-only-secret>
```

5. despliega el SHA exacto y espera `READY`;
6. ejecuta `pilot:preflight -- --mode full-ops`.

`SUPABASE_SECRET_KEY` es exclusivamente server-side. Nunca usar prefijo `NEXT_PUBLIC_`, imprimirla, retornarla por API ni versionarla.

El cliente `scripts/vercel-pilot-deploy.mjs` reduce errores remotos a códigos seguros y no imprime tokens ni claves. Producción no se despliega ni se promueve con este workflow.

## 6. Backend preflight + primer director
Este bloque aplica únicamente a `full-ops`.

Antes de enviar una invitación real:

```bash
npm run pilot:backend-preflight -- \
  --plants TAM,YAR \
  --require-no-director
```

El gate es de solo lectura: valida contrato de esquema, RLS, Supabase Auth Admin, plantas canónicas y estado de bootstrap sin crear usuarios ni cambiar membresías.

Con el backend certificado y `APP_BASE_URL`/origen confiable resuelto:

```bash
npm run bootstrap:director -- \
  --email director@greenatics.com.co \
  --name "Director GREENATICS" \
  --plants TAM,YAR
```

El bootstrap usa una RPC atómica y se niega a operar si ya existe cualquier membresía activa con rol `director`. Después, invitaciones y cambios de rol se realizan desde `/admin/users`.

## 7. Activación del usuario invitado
1. Dirección invita desde `/admin/users`.
2. Supabase envía el correo.
3. El usuario abre `/auth/confirm?...`.
4. El servidor valida `token_hash` y crea la sesión SSR.
5. `/account/setup` exige una contraseña de al menos 12 caracteres con letra y número.
6. Al completar la activación se entra a `/app`.
7. RLS limita lectura y escritura a plantas/membresías autorizadas.

## 8. Readiness ejecutable
`GET /api/health` es público y no devuelve credenciales.

### Certificar `public-only`

```bash
npm run pilot:preflight -- \
  --base-url https://<deployment-publico> \
  --mode public-only \
  --expected-branch develop \
  --expected-commit <sha-desplegado>
```

Debe reportar:
- `status=ready`;
- `mode=local`;
- `opsAccess=configuration-block`;
- `checks.backend=missing`;
- `checks.admin=missing`;
- Vercel + branch + commit esperados;
- `/app` bloqueado con `reason=configuration`;
- sitemap/robots/headers correctos.

### Certificar `full-ops`

```bash
npm run pilot:preflight -- \
  --base-url https://<deployment-ops> \
  --mode full-ops \
  --expected-branch develop \
  --expected-commit <sha-desplegado>
```

Debe reportar `ready`, `supabase`, `supabase-auth`, checks remotos `ok` y `/app` anónimo redirigido al login sin bloqueo de configuración.

## 9. Smoke RLS multiusuario de solo lectura
Aplica a `full-ops` una vez existan director y operario de prueba.

Variables efímeras/secretos de CI:

```text
PILOT_DIRECTOR_EMAIL=...
PILOT_DIRECTOR_PASSWORD=...
PILOT_OPERATOR_EMAIL=...
PILOT_OPERATOR_PASSWORD=...
```

Con URL y publishable key Supabase disponibles:

```bash
npm run pilot:rls-smoke
```

El gate usa dos sesiones independientes y únicamente la clave publicable/anon. Falla si recibe una `sb_secret_` o JWT `service_role`. Por defecto exige Dirección `TAM,YAR`, operario `TAM` y cero filas de `YAR` para ese operario.

## 10. Smoke funcional multiusuario obligatorio
Con dos perfiles de navegador distintos:
1. La web pública abre sin sesión.
2. `/app` redirige a `/login` sin sesión.
3. Director con Támesis + Yarumal ve ambas plantas.
4. Operario de Támesis solo ve Támesis.
5. Operario crea/finaliza actividad y dirección la ve al sincronizar.
6. Intento de leer/escribir Yarumal como operario de Támesis es bloqueado por RLS.
7. Compra registrada no crea stock físico.
8. Recepción física sí crea lote de insumo.
9. Consumo superior al lote es rechazado.
10. Cerrar sesión invalida la navegación protegida y redirige a `/login`.

## 11. Gate de promoción
Antes de asociar dominio o promover a producción:
- CI de PR verde (`quality` + `database`);
- `public-only` Preview en PASS para el SHA exacto de `develop`;
- `full-ops` Preview en PASS cuando se vaya a habilitar OPS remoto;
- backend preflight, smoke RLS y smoke funcional aprobados para `full-ops`;
- redirects Auth configurados;
- ningún secreto presente en GitHub, bundle cliente, proyecto público o logs;
- web pública validada sin autenticación;
- decisión explícita de convergencia `main` / `develop`, rama productiva y dominio.

SharePoint permanece como fuente documental e histórica. GREENATICS OPS es el sistema transaccional; la integración documental debe añadir referencias/lectura sin devolver las transacciones diarias a SharePoint.
