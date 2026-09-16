# Publicar Huella en staging con Render

El blueprint [`render.ops-staging.yaml`](../render.ops-staging.yaml) crea exclusivamente un servicio Docker. No crea una base Render ni guarda secretos en Git: Calcula tu Huella persiste en el esquema privado `huella` del proyecto Supabase `greenatics-ops`.

## Crear el servicio

1. En Render, cree un Blueprint desde `arendon7/GTCS-WEB` y seleccione `apps/calcula-tu-huella/render.ops-staging.yaml`.
2. Mantenga el despliegue automático apagado hasta terminar las variables privadas.
3. Configure en Render los valores marcados como `sync: false` usando `.env.ops-staging.example` como lista, no como archivo para subir.
4. Obtenga la contraseña PostgreSQL desde Supabase y constrúyala sólo en Render. No la envíe por correo, chat ni GitHub.
5. Use el pooler de sesión de Supabase con `DATABASE_SCHEMA=huella` y defina el dominio entregado por Render en `PUBLIC_BASE_URL` y `TRUSTED_HOSTS`.
6. Configure un bucket S3 privado para las evidencias antes de aceptar cargas de usuarios externos.

## Verificación de staging

- Compruebe `GET /api/health`.
- Inicie sesión con una cuenta de staging y cree un inventario de prueba.
- Cargue un archivo no sensible, valide un lote, adjunte una evidencia y descargue un reporte.
- Verifique que las tablas creadas aparecen únicamente en el esquema `huella` y que `public` no cambia.
- Cuando la URL HTTPS esté validada, publíquela como `NEXT_PUBLIC_HUELLA_APP_URL` al reconstruir el portal Greenatics.

## Límites claros

El plan gratuito es apropiado para una demostración controlada y puede suspenderse por inactividad. No habilite el scheduler ni declare el servicio como producción hasta contar con cómputo persistente, S3, correo, alertas, respaldos y una prueba de restauración exitosa.
