# GREENATICS RED

Aplicación independiente para preparar y dar seguimiento a Planes de Manejo Integral de Residuos Sólidos (PMIRS) de propiedades horizontales. Organiza expedientes, formularios, evidencias privadas, revisión QA/QC, versiones y acciones. La aplicación apoya el trabajo técnico; no reemplaza la revisión profesional ni aprueba un PMIRS por sí sola.

## Estado de esta candidata

Esta es una candidata de desarrollo y capacitación. La demostración local usa datos ficticios y temporales. No está conectada a la base de datos ni al Drive del usuario, no habilita acceso público y no está aprobada para capturar información real.

El catálogo incluye 30 formularios y 342 campos. Los expedientes iniciales corresponden a los cuatro conjuntos de Bello solicitados; nombres, direcciones, responsables, caracterización, pesajes, prestadores y demás datos deben confirmarse con cada administración y sus fuentes. Los datos ausentes permanecen pendientes. No se generan resultados, rutas ni obligaciones técnicas por inferencia.

Los cambios de formulario, evidencias, decisiones QA/QC, firmas de constancia, objetos PMIRS y avances se asocian al proyecto, actor y versión que los generó. La firma manuscrita en pantalla es una constancia de la declaración mostrada; no acredita identidad, representación legal, firma digital certificada ni aprobación técnica. Su uso con personas requiere consentimiento y revisión jurídica y de privacidad.

## Perfiles y recorrido

RED admite administración de la plataforma, consultoría, administración de la copropiedad, operario de campo y revisoría QA/QC. El acceso se limita por cuenta, rol y membresía activa de cada expediente. El recorrido de práctica incluye:

1. Crear o confirmar un expediente y revisar qué información falta.
2. Capturar formularios de diagnóstico y operación con fuentes y evidencias.
3. Enviar registros a revisión, recibir una devolución con motivo y corregirlos.
4. Revisar la Línea Base antes de estructurar hallazgos, programas y acciones del PMIRS.
5. Registrar avances y evidencias, pedir revisión QA/QC, y conservar el historial.
6. Consultar versiones y generar exportaciones PDF/DOCX asociadas al contenido versionado.

Un porcentaje de avance no aprueba ni cierra una acción. Los registros sintéticos de la demostración no se transfieren a los expedientes de Bello.

La guía para preparar la jornada, capturar datos y cerrar pendientes está en [Guía rápida de campo RED](GUIA_RAPIDA_DE_CAMPO_RED.md).

## Abrir la demostración en macOS

Si el entorno `.venv` ya está preparado, abre `Abrir_DEMO_RED.command` desde Finder. Levanta un sandbox temporal con seis perfiles ficticios y abre el navegador y una ventana con credenciales efímeras. No requiere Git, Docker ni Command Line Tools. Si macOS bloquea la primera apertura, haz clic derecho sobre el archivo y selecciona **Abrir**.

Al terminar, vuelve a la ventana de Terminal y presiona Ctrl+C. El lanzador detiene el servidor y elimina la base, los archivos y las credenciales de esa práctica. No uses esa demostración para cargar información real.

## Desarrollo local

Requiere Python 3.12. Para preparar un entorno aislado:

```sh
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
cp .env.example .env
```

Configura `SESSION_SECRET` únicamente en `.env` local y no lo agregues al repositorio. Para crear una base de desarrollo y los cuatro expedientes vacíos:

```sh
set -a && . ./.env && set +a
python -m alembic upgrade head
python -m app.cli seed-bello-projects
python -m app.cli bootstrap-admin --email admin@greenatics.local --name "Administrador RED"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8787
```

Abre <http://127.0.0.1:8787>. La CLI solicita la contraseña sin escribirla en el comando. La instancia local utiliza SQLite y almacenamiento local; no conecta servicios de otras aplicaciones. Identifica el origen de cualquier base existente antes de apuntar la configuración a ella.

### PostgreSQL local opcional

`docker-compose.yml` prepara una base y un volumen de evidencias propios para RED. Usa contraseñas locales aleatorias y conserva los volúmenes al detener el servicio. No uses una URL de Huella, OPS ni una base de producción. Para borrar deliberadamente los volúmenes de práctica, revisa primero el efecto de `docker compose down -v`.

## Verificación

El workflow [GREENATICS RED quality](../../.github/workflows/greenatics-red-quality.yml) ejecuta la regresión propia de RED cuando cambian sus archivos. En esta candidata se validó en GitHub Actions sobre el commit del PR; el estado actual debe consultarse en el PR y sus checks.

Desde esta carpeta, ejecuta:

```sh
scripts/verify_local_candidate.sh
```

El script requiere Python 3.12 y Node.js; usa `.venv/bin/python` si existe. Si Node no está en `PATH`, indica su ruta mediante `RED_NODE`. El verificador ejecuta pruebas Python y JavaScript, compilación, sintaxis de inicio y validación del catálogo. Trabaja con datos sintéticos y no verifica hosting, PostgreSQL remoto, Drive, almacenamiento del proveedor ni uso en teléfonos físicos.

Para pruebas de migración PostgreSQL aisladas existe `scripts/qa_postgres_integration.py`. Solo debe usarse con una base de QA dedicada e identificada como tal: puede crear y borrar esquemas temporales. El script requiere confirmaciones explícitas y se detiene si el nombre de la base no coincide. No apunta a una base de operación.

## Datos, archivos y respaldos

RED usa una base de datos y almacenamiento de evidencias propios. Cada archivo se mantiene privado, asociado a un expediente y sujeto a permisos de servidor. Un respaldo Drive es una copia ZIP distinta de las evidencias operativas: OAuth requiere el alcance mínimo de Drive, la cuenta personal conectada conserva la propiedad y RED no comparte archivos automáticamente. La conexión real está pendiente de configuración y autorización explícita.

En staging y producción se requiere una base PostgreSQL dedicada a RED, almacenamiento privado persistente y HTTPS. Los endpoints S3 personalizados exigen HTTPS fuera del entorno local. No uses una instancia gratuita con almacenamiento efímero, una base temporal ni este candidato para datos de campo.

Las escrituras, el acceso público, la aprobación de privacidad y la autorización de piloto permanecen cerrados por defecto. No cambies esas compuertas hasta archivar las aprobaciones correspondientes y completar las verificaciones de hosting, recuperación, privacidad, método/SST y capacitación.

## Estructura

- `app/`: API, autenticación, permisos, formularios, operación, exportaciones y almacenamiento.
- `app/forms.json`: catálogo RED Bello v7-2 y extensiones GREENATICS; 30 formularios y 342 campos.
- `migrations/`: migraciones Alembic.
- `tests/`: regresiones sintéticas de permisos, flujos, formularios y exportaciones.
- `scripts/`: verificadores, herramientas de QA y recuperación.
- `Abrir_DEMO_RED.command`: lanzador del sandbox sintético para macOS.

El seguimiento interno de avance y los documentos de trabajo no forman parte de esta candidata pública. Los checks de CI no autorizan por sí solos la integración, el despliegue ni el uso de datos reales.
