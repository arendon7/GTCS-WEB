# Contrato de producto · GREENATICS Red

Fecha: 2026-09-11. Esta ficha define el alcance de la estación Red y evita reducirla a una pantalla de rutas o a un tablero de indicadores.

## Propósito

GREENATICS Red organiza el trabajo territorial que convierte un diagnóstico en un PMIRS implementable y medible. Sirve para municipios, ESP, equipos de campo, consultores, operadores y responsables de seguimiento.

La secuencia de producto es:

`Proyecto 360 → Territorio → Generadores → Rutas → FIELD → QA/QC → Línea base → PMIRS STUDIO → PMIRS VIVO → Indicadores y evidencias`

## Módulos

| Módulo | Pregunta que resuelve | Objetos principales |
| --- | --- | --- |
| Proyecto 360 | ¿Cuál es el contexto, el alcance y la siguiente decisión? | proyecto, organización, municipio, periodo, hitos |
| Territorio | ¿Dónde ocurre el problema y qué restricciones importan? | capas, actores, infraestructura, preguntas abiertas, fuentes |
| Generadores | ¿Quién entrega qué corriente, cuánto y bajo qué acuerdo? | generador, unidad, contacto, corriente, volumen, acuerdo |
| Rutas | ¿Cómo se conectan generadores, frecuencia, flota, descarga y destino? | microrruta, recorrido, jornada, cobertura, ciclo, novedad |
| FIELD | ¿Cómo se captura el hecho donde ocurre? | visita, formulario, medición, fotografía, ubicación, firma |
| QA/QC | ¿Qué falta, qué se corrige y qué puede validarse? | cola, alerta, revisión, decisión, versión, responsable |
| PMIRS STUDIO | ¿Cómo se convierten hallazgos en intervención? | hallazgo, programa, acción, meta, responsable, recurso |
| PMIRS VIVO | ¿Cómo se ejecuta y ajusta el plan? | tarea, avance, evidencia, fecha, bloqueo, decisión |
| Indicadores | ¿Qué mide el corte y sobre qué universo? | fórmula, fuente, unidad, periodo, denominador, resultado |
| Evidencias | ¿Qué prueba una actividad o una decisión? | archivo, tipo, objeto origen, autor, fecha, estado, acceso |
| Coordinación | ¿Quién debe responder y qué queda pendiente? | solicitud, incidencia, tarea, hilo, decisión, vencimiento |

## Estados y trazabilidad

Un objeto puede avanzar de `RAW` a `VALIDATED`, luego a `INTERPRETED` y finalmente a `DERIVED` cuando corresponde. El cambio de estado debe conservar actor, fecha, motivo, alcance y versión. Un registro RAW no se presenta como dato validado; un indicador interno no se convierte automáticamente en claim público.

## Relación con otras aplicaciones

- **GREENATICS Red** organiza territorio, diagnóstico, campo, calidad, PMIRS y seguimiento.
- **GREENATICS OPS** registra y controla la operación de planta: bitácora, recepción, pesajes, volúmenes, lotes, procesos, activos, mantenimiento, inventario, costos y salidas.
- La integración futura debe usar referencias de `Organization`, `Project`, `Facility`, `Activity` y `Evidence`, o read models autorizados. Red no debe leer directamente tablas privadas de OPS.
- Una recepción, descarga o capacidad de planta puede alimentar una decisión de Red solo cuando la integración, fuente, unidad y permiso estén definidos.

## Modelo demo actual

La ruta `/red/app/` presenta el proyecto ilustrativo `RED-024 · Támesis`, periodo 2026, con métricas, generadores, rutas, jornadas, cola QA/QC, programas, indicadores y evidencias demostrativas. En QA/QC se puede seleccionar un objeto y simular `Aprobada` o `Corrección solicitada`; en PMIRS VIVO se puede seleccionar una acción y registrar avances locales de 10 puntos. Los cambios desaparecen al recargar, están rotulados como estado local y no representan persistencia, identidad o permisos productivos.

En producción, cada decisión debe conservar como mínimo actor, fecha, criterio, versión, comentario, evidencia y objeto origen. Las fichas de Territorio, Rutas, FIELD, Generadores, Hallazgos, Evidencias, Acciones y Coordinación muestran esa relación contextual en la demo. La demo muestra el recorrido esperado sin presentar un dato ilustrativo como resultado validado.

## Gate productivo

Antes de llamar a Red una aplicación operativa se requiere: identidad y organizaciones, roles por proyecto y territorio, persistencia, formularios FIELD, almacenamiento privado de evidencias, auditoría de cambios, exportación, sincronización offline si aplica, autorización equivalente a RLS, backups, observabilidad y UAT con un caso real o anonimizado.
