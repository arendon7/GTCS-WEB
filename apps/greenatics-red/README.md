# GREENATICS RED

GREENATICS RED es una aplicación independiente para preparar y hacer seguimiento a PMIRS de propiedad horizontal. Mantiene separados los expedientes, usuarios, permisos, formularios, revisiones, evidencias, firmas, exportaciones y respaldos.

## Estado actual

- **No es un servicio publicado ni está autorizado para datos reales.** El PR de la candidata sigue en borrador y el runtime RED aún no está conectado a infraestructura.
- El proyecto dedicado `greenatics-red-qa` de Supabase tiene migraciones hasta Alembic 0022 y controles RLS verificados. Está vacío de cuentas, expedientes y evidencias, salvo una fila técnica de control de cuota. No está conectado a la aplicación.
- No hay runtime RED, almacenamiento privado de evidencias, OAuth de RED ni respaldo real al Drive personal configurados.
- Los controles de acceso público y escritura operativa permanecen cerrados por defecto. No activar las compuertas de privacidad, piloto o acceso público sin sus aprobaciones archivadas.
- El sitio institucional todavía no está publicado en `www.greenatics.com.co`.

El avance por gates y las dependencias vigentes están en [`progress.json`](progress.json). La ejecución y el handoff vigentes se registran en [RED_ESTADO_ACTUAL_Y_SIGUIENTE_PAQUETE.md](../../docs/knowledge/RED_ESTADO_ACTUAL_Y_SIGUIENTE_PAQUETE.md).

## Qué incluye el candidato

El catálogo cuenta con **30 formularios y 342 campos** para diagnóstico, caracterización, operación, evidencias y seguimiento. La aplicación incluye cuentas por invitación, perfiles y membresías por expediente, revisión QA/QC, historial y versiones PMIRS, firmas de constancias, exportaciones y funciones de respaldo/restauración.

Las invitaciones se generan en la aplicación y el administrador comparte el enlace manualmente; RED no envía correos. Las firmas y aprobaciones sintéticas de la DEMO solo sirven para practicar. No acreditan identidad, autorización de una copropiedad ni aprobación profesional.

## Recorrer la DEMO local

Requiere Python 3.12, Node.js y las dependencias locales del proyecto. Desde esta carpeta inicia un sandbox de capacitación con una base y archivos temporales:

```sh
.venv/bin/python scripts/run_synthetic_field_demo.py --full-training-scenario --with-progress-history
```

Abre `http://127.0.0.1:18797/login`. La terminal indica dónde quedó el archivo privado con las credenciales aleatorias para los seis perfiles sintéticos. No copies esas credenciales a chats, repositorios o cuentas reales. Para cerrar y eliminar el sandbox, pulsa `Ctrl+C` en la terminal.

La DEMO es local, efímera y aislada. Conserva datos mientras ese proceso está activo; al detenerlo se borran la base, los archivos y las credenciales. No prueba persistencia en un hosting, uso en teléfono físico, OAuth/Drive ni operación real.

## Verificar el candidato local

Desde la raíz del repositorio:

```sh
apps/greenatics-red/scripts/verify_local_candidate.sh
```

El script valida la regresión Python y JavaScript, compilación, sintaxis de arranque y catálogo de formularios. Para consultar porcentajes y bloqueos registrados:

```sh
python3 apps/greenatics-red/scripts/report_progress.py
```

Una verificación local no acredita servicios alojados, persistencia en PostgreSQL, almacenamiento remoto, Drive ni UAT.

## Arquitectura y preparación de QA

- RED usa PostgreSQL y almacenamiento privados propios. No reutilizar bases, buckets, credenciales ni datos de Calcula tu Huella u OPS.
- `render.yaml` es una plantilla, no prueba que exista un servicio. El contenedor ejecuta `start.sh`, que aplica migraciones antes de iniciar FastAPI. La URL de base debe apuntar a una instancia dedicada a RED y `DATABASE_SCHEMA` debe permanecer vacío en hosting.
- Render Free puede usarse solo para una vista previa sintética: el servicio duerme por inactividad y su sistema de archivos es efímero. No alojar allí evidencia operativa ni tratarlo como entorno de piloto. Revisar las [limitaciones oficiales de Render Free](https://render.com/docs/free).
- Las evidencias requieren almacenamiento privado S3 compatible dedicado a RED. Google Drive es un destino separado para copias ZIP, no para los archivos operativos. El titular autoriza la conexión a su Drive personal; RED no comparte los respaldos automáticamente.
- Las variables secretas se configuran en el gestor de secretos del hosting. Nunca poner `DATABASE_URL`, claves S3, secretos de sesión, tokens OAuth o contraseñas en Git, este archivo o el chat.
- Las compuertas `RED_PUBLIC_ACCESS_ENABLED`, `RED_OPERATIONAL_WRITES_ENABLED`, `RED_PRIVACY_APPROVED` y `RED_SUPERVISED_PILOT_APPROVED` permanecen `false` hasta cerrar sus criterios y archivar las aprobaciones correspondientes.

Cuando la plataforma QA esté conectada y aislada, el alta inicial prevista es:

```sh
python -m app.cli seed-bello-projects
python -m app.cli bootstrap-admin --email admin@greenatics.local --name "Administrador RED"
```

El primer comando crea únicamente los cuatro expedientes vacíos indicados por el usuario; no crea registros, asigna personas ni confirma identidad, dirección o alcance. Antes de datos de trabajo, cada administración debe validar esos datos y autorizar el acceso. El segundo comando solicita la contraseña de forma interactiva; usa una cuenta y correo aprobados para el entorno, no el ejemplo literal.

## Antes de un piloto

Conectar runtime, PostgreSQL dedicado y almacenamiento privado; crear cuentas con roles por expediente; comprobar persistencia tras reinicio, exportación, respaldo y restauración aislada; configurar HTTPS y OAuth de Drive con alcance mínimo; y completar las aprobaciones de privacidad, método técnico, SST y piloto. Después, hacer UAT con operarios y revisores en teléfonos reales y cerrar hallazgos. Hasta entonces, usar únicamente la DEMO local con datos sintéticos.

La guía de roles, capacitación y kit de campo está en [RED_OPERACION_CAPACITACION_Y_KIT_CAMPO_BELLO_2026-10-07.md](../../docs/knowledge/RED_OPERACION_CAPACITACION_Y_KIT_CAMPO_BELLO_2026-10-07.md).
