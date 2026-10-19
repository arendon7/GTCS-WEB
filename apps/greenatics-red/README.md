# GREENATICS RED

GREENATICS RED es una aplicación independiente para preparar y hacer seguimiento a PMIRS de propiedad horizontal. Mantiene separados los expedientes, usuarios, permisos, formularios, revisiones, evidencias, firmas, exportaciones y respaldos.

## Estado actual

- **No es un servicio publicado ni está autorizado para datos reales.** El PR de la candidata sigue en borrador y el runtime RED aún no está conectado a infraestructura.
- El proyecto dedicado `greenatics-red-qa` de Supabase tiene migraciones hasta Alembic 0022 y controles RLS verificados. Está vacío de cuentas, expedientes y evidencias, salvo una fila técnica de control de cuota. No está conectado a la aplicación.
- No hay runtime RED, almacenamiento privado de evidencias, OAuth de RED ni respaldo real al Drive personal configurados.
- Los controles de acceso público y escritura operativa permanecen cerrados por defecto. No activar las compuertas de privacidad, piloto o acceso público sin sus aprobaciones archivadas.
- El sitio institucional todavía no está publicado en `www.greenatics.com.co`.

El estado de revisión de la candidata y su evidencia están en el [PR de GREENATICS RED](https://github.com/arendon7/GTCS-WEB/pull/342). El PR no está integrado ni desplegado.

## Qué incluye el candidato

El catálogo cuenta con **30 formularios y 342 campos** para diagnóstico, caracterización, operación, evidencias y seguimiento. La aplicación incluye cuentas por invitación, perfiles y membresías por expediente, revisión QA/QC, historial y versiones PMIRS, firmas de constancias, exportaciones y funciones de respaldo/restauración.

Las invitaciones se generan en la aplicación y el administrador comparte el enlace manualmente; RED no envía correos. Las firmas y aprobaciones sintéticas de la DEMO solo sirven para practicar. No acreditan identidad, autorización de una copropiedad ni aprobación profesional.

## Recorrer la DEMO local en macOS

Requiere Python 3.12. Desde la raíz del repositorio, prepara una sola vez el entorno aislado de RED:

```sh
cd apps/greenatics-red
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt -r requirements-dev.txt
```

Para abrir la DEMO de capacitación, desde la misma carpeta ejecuta:

```sh
zsh Abrir_DEMO_RED.command
```

El lanzador abre `http://127.0.0.1:18797/login` en el navegador y muestra dónde quedaron las credenciales aleatorias para seis perfiles sintéticos. No copies esas credenciales a chats, repositorios o cuentas reales. Para cerrar y borrar la base temporal, los archivos y las credenciales, pulsa `Ctrl+C` en la ventana de Terminal.

Al ingresar como administración RED verás los cuatro expedientes iniciales vacíos y un quinto expediente claramente rotulado DEMO. Las cuentas sintéticas de campo, revisión, consultoría, administración PH y lectura solo tienen acceso al expediente DEMO; los cuatro expedientes residenciales no reciben membresías, formularios, autorizaciones ni evidencias. Los datos ficticios de práctica viven solo en DEMO.

También puedes iniciar la DEMO manualmente con:

```sh
.venv/bin/python scripts/run_synthetic_field_demo.py --full-training-scenario --with-progress-history
```

La DEMO es local, efímera y aislada. Los cuatro expedientes permanecen vacíos y separados del proyecto de práctica; al detener el proceso se borran la base, los archivos y las credenciales. No requiere Git ni Command Line Tools una vez instalado el entorno Python. No prueba persistencia en hosting, uso en teléfono físico, OAuth/Drive ni operación real.

## Verificar el candidato local

Desde la raíz del repositorio, con Python 3.12, las dependencias instaladas y Node.js:

```sh
apps/greenatics-red/scripts/verify_local_candidate.sh
```

El script valida la regresión Python y JavaScript, compilación, sintaxis de arranque y catálogo de formularios. Esta verificación local no acredita servicios alojados, persistencia en PostgreSQL, almacenamiento remoto, Drive ni UAT.

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

El alistamiento tiene cuatro fichas separadas, con los 27 controles de preparación pendientes para cada unidad. Sirven para solicitar y trazar fuentes antes de diligenciarlas en RED; no sustituyen formularios, validación técnica ni aprobación de la copropiedad.

## Antes de un piloto

Conectar runtime, PostgreSQL dedicado y almacenamiento privado; crear cuentas con roles por expediente; comprobar persistencia tras reinicio, exportación, respaldo y restauración aislada; configurar HTTPS y OAuth de Drive con alcance mínimo; y completar las aprobaciones de privacidad, método técnico, SST y piloto. Después, hacer UAT con operarios y revisores en teléfonos reales y cerrar hallazgos. Hasta entonces, usar únicamente la DEMO local con datos sintéticos.

La guía rápida de perfiles y trabajo de campo está en [GUIA_RAPIDA_DE_CAMPO_RED.md](GUIA_RAPIDA_DE_CAMPO_RED.md).
