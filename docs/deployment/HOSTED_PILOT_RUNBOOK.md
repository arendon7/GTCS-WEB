# GREENATICS · Hosted Pilot Runbook

## Objetivo
Publicar un piloto multiusuario de la plataforma dual GREENATICS sin exponer secretos: la web pública permanece abierta y GREENATICS OPS exige sesión únicamente en sus rutas internas.

## 1. Supabase hospedado
1. Crear un proyecto dedicado para GREENATICS OPS.
2. Vincular el repositorio con Supabase CLI.
3. Aplicar **todas** las migraciones versionadas de `supabase/migrations` sobre una base limpia.
4. Verificar las plantas canónicas que se usarán en el piloto.
5. No crear tablas, políticas ni RPC manualmente por fuera de migraciones.

## 2. Frontera pública / interna
La misma base de producto contiene dos superficies:
- públicas: `/`, `/wondergreen`, `/soluciones`, `/proyectos`, `/impacto`, `/biblioteca`, `/nosotros`, `/contacto` y sus descendientes;
- internas: `/app`, operación, dashboard, importaciones, administración y cuenta.

En modo Supabase, el proxy solo debe exigir sesión para rutas OPS. Una visita anónima a la web pública nunca debe terminar en `/login`.

## 3. Auth URL y plantilla de invitación
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

## 4. Variables del despliegue
Configurar en el proveedor de runtime Next.js:

```text
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
APP_BASE_URL=https://<origen-canonico>
```

`SUPABASE_SECRET_KEY` es exclusivamente server-side. Nunca usar prefijo `NEXT_PUBLIC_`, imprimirla, retornarla por API ni versionarla.

`APP_BASE_URL` debe ser un origen HTTP/HTTPS confiable. La API de invitaciones no usa el header `Host` como sustituto.

## 5. Primer director · bootstrap único
Con variables cargadas en un entorno administrativo:

```bash
npm run bootstrap:director -- \
  --email director@greenatics.com.co \
  --name "Director GREENATICS" \
  --plants tamesis,yarumal
```

El script se niega a operar si ya existe cualquier membresía activa con rol `director`. Después de ese punto, las invitaciones y cambios de rol se hacen desde `/admin/users`.

## 6. Activación del usuario invitado
1. Dirección invita desde `/admin/users`.
2. Supabase envía el correo.
3. El usuario abre `/auth/confirm?...`.
4. El servidor valida `token_hash` y crea la sesión SSR.
5. `/account/setup` exige una contraseña de al menos 12 caracteres con letra y número.
6. Al completar la activación se entra a `/app`.
7. RLS limita lectura y escritura a plantas/membresías autorizadas.

## 7. Readiness
`GET /api/health` es público y no devuelve credenciales.

Estados:
- `200 ready`: modo local, o backend + Auth Admin + origen canónico operativos.
- `503 degraded`: falta configuración o falla el backend remoto.

Antes de habilitar el acceso real a OPS, exigir `200 ready` en el dominio final.

## 8. Smoke multiusuario obligatorio
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

## 9. Gate de promoción
Antes de promover el piloto:
- CI de PR verde (`quality` + `database`);
- `/api/health` en `ready`;
- smoke multiusuario aprobado;
- redirects Auth configurados;
- ningún secreto presente en GitHub, bundle cliente o logs;
- web pública validada sin autenticación.

## 10. Siguiente integración
SharePoint permanece como fuente documental e histórica. GREENATICS OPS es el sistema transaccional. La integración documental debe añadir referencias/lectura sin devolver las transacciones diarias a SharePoint.
