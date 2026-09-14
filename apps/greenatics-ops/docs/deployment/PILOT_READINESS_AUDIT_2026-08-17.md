# GREENATICS OPS · PILOT READINESS AUDIT

Fecha de corte: 2026-08-17
Baseline de código auditado: `develop@7c7225a6e87cb58c6f8866e76e4a77fe5e5f2f3b`

## 1. Propósito

Determinar si el entorno hospedado está listo para iniciar el piloto real Director + Támesis + Yarumal sin volver a ejecutar bootstrap de usuarios innecesariamente ni confundir fallas de infraestructura con fallas de aplicación.

## 2. Estado del código

R0 quedó consolidado con:

- roadmap maestro;
- estrategia de reconciliación `main`/`develop`;
- backup histórico de `main`;
- refresh seguro de OPS production recuperado;
- gates de quality, backend, RLS TAM/YAR, Preview y Production.

El PR de consolidación pasó quality, database y Playwright desktop/mobile antes de integrarse a `develop`.

## 3. Proyecto Supabase identificado

Proyecto canónico del piloto:

```text
name: greenatics-ops
ref: dokxiyyypqbpilfivxse
region: ca-central-1
postgres: 17
```

La API de administración reportó `ACTIVE_HEALTHY`, pero durante la auditoría aparecieron señales incompatibles con una disponibilidad estable:

1. el endpoint de advisors respondió que el proyecto estaba `hibernated`;
2. un intento de `restore_project` respondió que ya no estaba pausado y que estaba `ACTIVE_HEALTHY` pero podía tardar en restaurarse completamente;
3. el canal SQL administrativo falló con `28P01 password authentication failed for user postgres`;
4. logs Postgres registraron un `fast shutdown request` alrededor de `2026-08-17T16:44:21Z`;
5. logs Auth posteriores registraron varios intentos fallidos de conectar `supabase_auth_admin` contra Postgres local mientras el servicio reiniciaba.

## 4. Interpretación

No se debe concluir todavía que exista pérdida de datos o una regresión de esquema.

La evidencia es consistente con un ciclo de hibernación/restauración o reinicio incompleto del proyecto hospedado, combinado con un canal administrativo SQL que aún no consigue autenticarse.

Hasta que backend preflight responda correctamente, el estado hosted se clasifica:

```text
R1 / BACKEND HOSTED: BLOCKED-INFRA
```

## 5. Guardrails

Mientras `BLOCKED-INFRA`:

- NO ejecutar bootstrap de Director;
- NO recrear usuarios;
- NO alterar memberships;
- NO reaplicar migraciones a ciegas;
- NO cambiar RLS para intentar solucionar conectividad;
- NO desplegar Production OPS;
- NO interpretar errores de login como evidencia de credenciales inválidas sin confirmar primero salud del backend.

## 6. Cambios de R1 preparados

### Preview con estado explícito

`hosted-pilot-preview.yml` distingue:

- `prebootstrap`: exige que no exista Director;
- `steady-state`: valida backend sin esa precondición y es el modo normal del piloto.

### UAT autenticado

`hosted-pilot-uat.yml` certifica sin mutaciones:

1. backend steady-state;
2. Director con `TAM,YAR`;
3. Operario Támesis con `TAM` y denegación `YAR`;
4. Operario Yarumal con `YAR` y denegación `TAM`;
5. deployment Preview exacto;
6. preflight protegido.

## 7. Secuencia para desbloquear el piloto

Cuando el backend hospedado vuelva a responder normalmente:

1. ejecutar `pilot:backend-preflight -- --plants TAM,YAR`;
2. ejecutar UAT autenticado;
3. confirmar que los tres usuarios de prueba pueden autenticarse;
4. confirmar memberships y aislamiento RLS;
5. ejecutar smoke funcional multiusuario;
6. registrar hallazgos de UX/datos por rol;
7. corregir únicamente hallazgos reproducibles;
8. crear release candidate después del piloto mínimo verde.

## 8. Exit criteria de R1

R1 puede marcarse READY cuando:

- backend preflight PASS;
- Director PASS (`TAM,YAR`);
- Operario Támesis PASS (`TAM`, no `YAR`);
- Operario Yarumal PASS (`YAR`, no `TAM`);
- Preview full-ops PASS;
- flujo funcional básico de actividad/recepción visible entre operario y Dirección;
- no existen errores de infraestructura que obliguen a usar Excel o mocks para completar el flujo.
