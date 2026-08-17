# GREENATICS · Hosted Pilot Runbook

## Objetivo
Publicar y certificar la plataforma dual GREENATICS sin exponer secretos: la web pública permanece abierta y GREENATICS OPS solo se habilita cuando existe un backend hospedado certificado.

## 1. Dos superficies de preview

### `public-only` · modo público
- proyecto Vercel canónico: `greenatics-public-preview`;
- no requiere Supabase;
- `NEXT_PUBLIC_DATA_MODE=local`;
- OPS permanece en `configuration-block`;
- sirve para QA visual/editorial, SEO, headers, navegación y frontera público/privado.

### `full-ops` · modo autenticado
- proyecto Vercel canónico: `greenatics-ops`;
- requiere Supabase piloto certificado;
- `NEXT_PUBLIC_DATA_MODE=supabase`;
- OPS usa `supabase-auth` y RLS.

Los proyectos son distintos por diseño. No reutilizar `greenatics-ops` como preview público ni `greenatics-public-preview` para pruebas con credenciales.

## 2. Estados del backend `full-ops`

El workflow `hosted-pilot-preview.yml` distingue explícitamente dos estados:

### `prebootstrap`
Usar únicamente antes de crear el primer Director.

El gate exige:

```bash
npm run pilot:backend-preflight -- --plants TAM,YAR --require-no-director
```

### `steady-state` · predeterminado
Usar para el piloto normal después del bootstrap.

El gate exige:

```bash
npm run pilot:backend-preflight -- --plants TAM,YAR
```

No volver a usar `--require-no-director` para previews rutinarios una vez exista Dirección.

## 3. Supabase hospedado para `full-ops`
1. Usar el proyecto dedicado GREENATICS OPS.
2. Mantener el repositorio vinculado con el esquema versionado.
3. Aplicar cambios de esquema únicamente mediante `supabase/migrations`.
4. Verificar las plantas canónicas del piloto.
5. No crear tablas, políticas ni RPC manualmente fuera de migraciones.

Códigos canónicos actuales:

- `TAM` · Támesis
- `YAR` · Yarumal

Los scripts pueden aceptar alias humanos, pero runbooks, RLS y base usan códigos canónicos.

## 4. Frontera pública / interna
La misma base de producto contiene dos superficies:

- públicas: `/`, `/wondergreen`, `/soluciones`, `/proyectos`, `/impacto`, `/biblioteca`, `/nosotros`, `/contacto` y descendientes;
- internas: `/app`, operación, dashboard, importaciones, administración y cuenta.

Una visita anónima a la web pública nunca debe terminar en `/login`.

En `public-only`, `/app` debe redirigir a `/login?reason=configuration&next=/app`.

En `full-ops`, `/app` anónimo debe redirigir al login sin `reason=configuration`; una sesión válida queda sujeta a perfil, membresía y RLS.

## 5. Auth URL e invitaciones
Configurar en Supabase Auth:

- Site URL = origen canónico del deployment Next.js.
- Allowed Redirect URLs = origen canónico y previews expresamente autorizados.

Plantilla **Invite user**:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/account/setup">
  Activar acceso a GREENATICS OPS
</a>
```

No usar el fragmento de sesión del flujo cliente como mecanismo principal del piloto.

## 6. GitHub Actions y secretos

### Preview público / OPS
`.github/workflows/hosted-pilot-preview.yml` hace checkout explícito de `develop`, captura su SHA completo y despliega solo Preview.

Secretos base:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
```

Para `full-ops`:

```text
PILOT_SUPABASE_URL
PILOT_SUPABASE_PUBLISHABLE_KEY
PILOT_SUPABASE_SECRET_KEY
```

### Contrato `public-only`
El workflow:

1. no exige secretos Supabase;
2. no ejecuta backend preflight;
3. usa `greenatics-public-preview`;
4. configura `NEXT_PUBLIC_DATA_MODE=local` para Preview;
5. despliega el SHA exacto de `develop` sin Production;
6. espera `READY` y falla cerrado ante estado terminal;
7. ejecuta el preflight público.

El preflight exige que `/api/health` reporte backend/admin ausentes y que OPS permanezca bloqueado por configuración.

### Contrato `full-ops`
El workflow:

1. exige secretos Supabase;
2. ejecuta backend preflight según `ops_backend_state`;
3. usa `greenatics-ops`;
4. configura para Preview:

```text
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<server-only-secret>
```

5. despliega el SHA exacto;
6. espera `READY`;
7. ejecuta `pilot:preflight -- --mode full-ops`.

`SUPABASE_SECRET_KEY` es exclusivamente server-side. Nunca usar prefijo `NEXT_PUBLIC_`, imprimirla, retornarla por API ni versionarla.

## 7. Primer Director · solo bootstrap
Antes de enviar la primera invitación real:

```bash
npm run pilot:backend-preflight -- \
  --plants TAM,YAR \
  --require-no-director
```

Con backend certificado:

```bash
npm run bootstrap:director -- \
  --email <correo-director> \
  --name "Director GREENATICS" \
  --plants TAM,YAR
```

El bootstrap usa una RPC atómica y se niega a operar si ya existe una membresía activa con rol `director`.

Después del primer Director:

- cambiar el preview a `steady-state`;
- altas y cambios de rol se realizan desde `/admin/users`;
- no reejecutar workflows de bootstrap como mecanismo ordinario de administración.

## 8. Activación del usuario invitado
1. Dirección invita desde `/admin/users`.
2. Supabase envía el correo.
3. El usuario abre `/auth/confirm?...`.
4. El servidor valida `token_hash` y crea sesión SSR.
5. `/account/setup` exige contraseña de al menos 12 caracteres con letra y número.
6. Al completar activación se entra a `/app`.
7. RLS limita lectura/escritura a membresías autorizadas.

## 9. Readiness ejecutable
`GET /api/health` es público y no devuelve credenciales.

### `public-only`

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
- backend/admin ausentes;
- branch + commit esperados;
- `/app` bloqueado con `reason=configuration`;
- sitemap/robots/headers correctos.

### `full-ops`

```bash
npm run pilot:preflight -- \
  --base-url https://<deployment-ops> \
  --mode full-ops \
  --expected-branch develop \
  --expected-commit <sha-desplegado>
```

Debe reportar `ready`, `supabase`, `supabase-auth`, checks remotos `ok` y `/app` anónimo redirigido al login sin bloqueo de configuración.

## 10. UAT autenticado steady-state
`.github/workflows/hosted-pilot-uat.yml` es el gate hospedado de preproducción después del bootstrap.

No crea ni modifica usuarios, perfiles o memberships y no despliega Production.

Secretos adicionales:

```text
PILOT_DIRECTOR_EMAIL
PILOT_DIRECTOR_PASSWORD
PILOT_OPERATOR_TAM_EMAIL
PILOT_OPERATOR_TAM_PASSWORD
PILOT_OPERATOR_YAR_EMAIL
PILOT_OPERATOR_YAR_PASSWORD
```

Secuencia:

1. backend preflight `TAM,YAR` en steady-state;
2. Director vs Operario Támesis mediante `pilot:rls-smoke`;
3. Director vs Operario Yarumal mediante `pilot:rls-smoke`;
4. deployment full-ops Preview del SHA exacto de `develop`;
5. protected Preview preflight.

Contrato esperado:

- Director: `TAM,YAR`;
- Operario Támesis: `TAM`, lectura `YAR` denegada;
- Operario Yarumal: `YAR`, lectura `TAM` denegada.

Las credenciales se reciben únicamente como secretos y no se imprimen.

## 11. Smoke funcional multiusuario obligatorio
Además del smoke RLS de solo lectura, el piloto funcional debe comprobar con sesiones separadas:

1. la web pública abre sin sesión;
2. `/app` redirige a `/login` sin sesión;
3. Director ve Támesis + Yarumal;
4. Operario Támesis solo ve Támesis;
5. Operario Yarumal solo ve Yarumal;
6. operario crea/finaliza actividad y Dirección la ve al sincronizar;
7. lectura/escritura cross-plant es bloqueada por RLS;
8. compra registrada no crea stock físico;
9. recepción física sí crea lote de insumo;
10. consumo superior al lote es rechazado;
11. cerrar sesión invalida navegación protegida.

## 12. Producción OPS
`.github/workflows/hosted-pilot-production-refresh.yml` es el único dispatcher recuperado para refresh estable de OPS.

Antes de Production exige:

1. typecheck;
2. lint;
3. unit tests;
4. build;
5. backend preflight steady-state;
6. RLS Director/Támesis;
7. RLS Director/Yarumal;
8. Preview exacto;
9. protected Preview preflight;
10. deployment estable;
11. preflight humano del origen resultante.

No crea, modifica ni elimina usuarios o memberships.

## 13. Gate de promoción
Antes de asociar dominio o promover un release:

- CI de PR verde (`quality`, `database`, desktop y mobile);
- `public-only` Preview PASS para el SHA exacto cuando se modifica superficie pública;
- `full-ops` Preview PASS para cambios internos;
- UAT autenticado PASS en steady-state;
- smoke funcional aprobado;
- redirects Auth configurados;
- ningún secreto presente en Git, bundle cliente, proyecto público o logs;
- web pública validada anónimamente;
- release candidate explícito desde `develop`.

SharePoint permanece como fuente documental e histórica durante la transición. GREENATICS OPS es el sistema transaccional; la integración documental añade referencias/lectura sin devolver las transacciones diarias a SharePoint.
