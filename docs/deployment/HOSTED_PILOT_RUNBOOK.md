# GREENATICS OPS · Hosted Pilot Runbook

## Objetivo
Publicar un piloto multiusuario de GREENATICS OPS sin exponer secretos y conservando `develop` como rama operacional integrada.

## 1. Proyecto Supabase hospedado
1. Crear un proyecto dedicado para GREENATICS OPS.
2. Vincular el repo con Supabase CLI.
3. Aplicar todas las migraciones versionadas `supabase/migrations/0001...0021` sobre una base limpia.
4. Verificar que existan las plantas canónicas `tamesis` y `yarumal`.
5. No crear tablas manuales por fuera de migraciones.

## 2. Auth URL y plantilla de invitación
Configurar en Supabase Auth:
- Site URL = origen canónico de la app interna, por ejemplo `https://ops.greenatics.com.co`.
- Allowed Redirect URLs = el mismo origen y los previews autorizados que realmente se usen.

Para flujo SSR, personalizar **Invite user** para que el enlace llegue directamente al endpoint que intercambia el token hash por una sesión de cookies:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/account/setup">
  Activar acceso a GREENATICS OPS
</a>
```

No usar el fragmento de sesión del flujo cliente como mecanismo principal del piloto.

## 3. Variables del despliegue
Configurar en Vercel para Production/Preview según corresponda:

```text
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
APP_BASE_URL=https://ops.greenatics.com.co
```

`SUPABASE_SECRET_KEY` es exclusivamente server-side. Nunca usar prefijo `NEXT_PUBLIC_`, imprimirla, retornarla por API ni versionarla.

Después de cambiar variables, crear un nuevo deployment; una implementación anterior no recibe variables agregadas después.

## 4. Primer director · bootstrap de una sola vez
Antes de usar la pantalla `/admin/users`, debe existir un director inicial.

Con variables cargadas en el entorno administrativo:

```bash
npm run bootstrap:director -- \
  --email director@greenatics.com.co \
  --name "Director GREENATICS" \
  --plants tamesis,yarumal
```

Guardrail: el script se niega a operar si ya existe cualquier membresía activa con rol `director`. A partir de ese momento, las nuevas invitaciones y cambios de rol se hacen desde **Usuarios y accesos**.

## 5. Activación del usuario invitado
1. Dirección invita desde `/admin/users`.
2. Supabase envía el correo.
3. El usuario abre `/auth/confirm?...`.
4. El servidor valida `token_hash` y crea la sesión SSR.
5. `/account/setup` exige una contraseña de al menos 12 caracteres con letra y número.
6. El usuario entra a OPS y RLS limita los datos a sus plantas/membresías.

## 6. Readiness
`GET /api/health` no requiere autenticación y no devuelve claves.

Estados:
- `200 ready`: modo local o backend + Auth Admin disponibles.
- `503 degraded`: falta configuración o el backend remoto no responde correctamente.

Antes de habilitar el enlace público **Acceso interno**, exigir `200 ready` en el dominio final.

## 7. Smoke multiusuario obligatorio
Con dos navegadores/perfiles distintos:
1. Director con Támesis + Yarumal ve ambas plantas.
2. Operario de Támesis solo ve Támesis.
3. Operario crea/finaliza actividad y el director la ve tras recargar.
4. Intento de leer/escribir Yarumal como operario de Támesis es bloqueado por RLS.
5. Compra registrada no crea stock físico.
6. Recepción física sí crea lote de insumo.
7. Consumo superior al lote es rechazado.
8. Cerrar sesión invalida la navegación protegida y redirige a `/login`.

## 8. Vercel
Crear un proyecto separado para la app interna usando este repositorio y la rama operacional aprobada. La web pública de `main` no debe ser sustituida por este deployment.

Antes de promover a producción:
- CI de PR verde (quality + database);
- `/api/health` ready;
- smoke multiusuario aprobado;
- dominio interno/redirects Auth configurados;
- ningún secreto presente en GitHub, bundle cliente o logs.

## 9. Siguiente integración
SharePoint sigue como fuente documental e histórica. GREENATICS OPS seguirá siendo el sistema transaccional. La integración documental debe añadir referencias/lectura de documentos sin convertir SharePoint nuevamente en el origen de las transacciones diarias.
