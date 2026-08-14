# GREENATICS OPS · Wave 2A · Maestros operacionales + Planeación

Fecha: 2026-08-14
Fuente funcional: Reconciliación V0.2 de 50 requisitos
ADR: `docs/architecture/ADR-0008-operational-master-data-and-planning.md`

## Objetivo

Convertir el calendario actual y los campos operacionales libres en una capa de planeación estructurada que permita responder, sin reconstrucción manual:

- qué debía hacerse;
- en qué planta;
- cuándo;
- dentro de qué proceso;
- con qué actividad estándar;
- con qué trabajadores;
- con qué equipo;
- qué se ejecutó realmente;
- qué cambió respecto al plan y por qué.

Wave 2A no rediseña todavía Recepción, Compostaje ni Mantenimiento. Prepara los maestros y contratos que esas olas consumirán.

## Requisitos cubiertos

### PLN-01 · Programación mensual/semanal/día/hora

El planificador deberá soportar navegación por mes, semana y día sin fechas hardcodeadas. Una programación pertenece a una planta y define al menos plantilla, proceso, inicio y fin.

### PLN-02 · Asignaciones y precarga

Una programación puede asignar uno o varios trabajadores y, opcionalmente, un equipo. Al iniciar la actividad, esas asignaciones se ofrecen como precarga; la ejecución real sigue siendo independiente.

### PLN-03 · Plan vs. real

La ejecución enlazada a una programación conserva `scheduled_activity_id`. El dashboard podrá comparar hora planeada vs. real, programadas vs. ejecutadas, retrasadas/omitidas y motivo de desviación.

### PLN-04 · Reprogramación trazable

Una revisión del plan no elimina el registro anterior. Se conserva una cadena `rescheduled_from_id` y un motivo obligatorio cuando cambia una programación vigente.

### ACT-02 · Proceso/lote/equipo estructurados

Wave 2A resuelve proceso, plantilla y equipo. El vínculo de lote específico se completa en Wave 2B/2C según el dominio técnico para evitar una FK polimórfica débil.

### INV-02 · Taxonomía base

Wave 2A establece la unidad y los maestros operacionales base. La taxonomía completa de inventario MP/consumibles/repuestos/producto y mínimos se termina en la ola de inventario técnico posterior.

## Principios de UX

### Director / supervisor

Debe poder:

1. seleccionar planta;
2. administrar maestros autorizados;
3. abrir mes o semana;
4. crear una actividad desde una plantilla;
5. asignar hora, trabajadores y equipo;
6. revisar choques antes de guardar;
7. reprogramar indicando motivo;
8. leer cumplimiento y excepciones.

### Operario

No debe volver a escribir proceso/actividad/equipo si la tarea ya estaba programada. En `Hoy`, inicia la tarea y confirma/ajusta trabajadores ejecutores dentro de sus permisos.

### Administrador

Administra catálogos y puede desactivar valores obsoletos. Desactivar no altera registros históricos.

## Maestros y ownership

### `measurement_units`

Global, pequeño y estable. Inicialmente:

- kg
- t
- L
- unidades
- m3

No se debe crear una unidad nueva desde un formulario operacional.

### `operational_processes`

Por planta.

Campos mínimos:

- `id`
- `plant_id`
- `code`
- `name`
- `active`
- auditoría de creación

Seed inicial por planta:

- RECEPCION
- ACONDICIONAMIENTO
- COMPOSTAJE
- BIODIGESTION
- PRODUCCION
- MANTENIMIENTO
- ASEO
- LOGISTICA
- OTRO

El seed no intenta afirmar que todos estén activos operacionalmente hoy; solo establece una taxonomía inicial editable/desactivable.

### `activity_templates`

Por planta y proceso.

Campos mínimos:

- código y nombre;
- unidad predeterminada opcional;
- si requiere cantidad;
- si requiere lote;
- si requiere equipo;
- si permite ejecución no programada;
- activo.

No se sembrarán automáticamente títulos históricos como plantillas, porque el histórico puede contener variantes o errores.

### `material_sources`

Por planta. Representa generador, proveedor, origen interno u otro origen canónico.

### `collection_routes`

Por planta. Representa la ruta o circuito logístico. En Wave 2B se vincula con recepción.

### `material_types`

Por planta. Seed compatible con el contrato existente:

- FORSU
- PODA
- GALLINAZA
- MATERIA_PRIMA
- OTRO

### `equipment_processes`

Relación muchos-a-muchos entre equipo y proceso. Permite que el planificador filtre equipos pertinentes sin duplicar el maestro `equipment`.

### `scheduled_activity_workers`

Asignación planificada de personas. No sustituye `activity_workers`.

## Compatibilidad con el esquema actual

Durante Wave 2A coexistirán:

- `scheduled_activities.process` + `scheduled_activities.process_id`
- `scheduled_activities.equipment_ref` + `scheduled_activities.equipment_id`
- `activities.process` + `activities.process_id`
- `activities.equipment_ref` + `activities.equipment_id`
- `title` + `activity_template_id`

Regla temporal:

- escritura nueva desde UI Wave 2A: IDs canónicos;
- lectura: primero ID canónico, fallback al texto legacy;
- histórico: el texto original no se reescribe;
- reconciliación: únicamente completa FKs canónicas vacías;
- eliminación de campos legacy: fuera de Wave 2A y solo después de reconciliación completa y auditada.

## Reglas de integridad para planificación

La fase 2A.3 impone mediante RPC/DB:

1. plantilla, proceso y equipo deben pertenecer a la misma planta de la programación;
2. trabajadores asignados deben pertenecer a la planta y estar activos;
3. `planned_end > planned_start`;
4. un trabajador no puede quedar en dos programaciones activas que se solapen;
5. un equipo no puede quedar reservado en dos programaciones activas que se solapen;
6. una programación `done` o con ejecución real no se reescribe como si nunca hubiera ocurrido;
7. toda revisión/reprogramación requiere motivo y autor;
8. el registro anterior queda trazable y no se borra;
9. `scheduled_activities` no admite INSERT/UPDATE autenticado directo: toda mutación de planificación pasa por RPC transaccional.

## RLS objetivo

Lectura de maestros: cualquier usuario con acceso activo a la planta.

Escritura de maestros operacionales:

- supervisor
- technical
- admin
- director

Relación equipo-proceso también puede ser administrada por `maintenance` cuando el contrato de roles correspondiente esté habilitado.

Programación:

- supervisor
- technical
- admin
- director

Operadores consumen el plan y ejecutan; no administran catálogos ni reprograman el calendario.

No se habilitan DELETE policies sobre registros operacionales. Los maestros usan `active=false`.

## 2A.5 · Reconciliación de texto legacy

La reconciliación usa tres estados explícitos:

- `exact`: existe una única coincidencia por código o nombre después de normalizar mayúsculas, acentos, puntuación y espacios;
- `curated`: una persona autorizada aprobó explícitamente el destino canónico;
- `unmapped`: no existe una equivalencia única segura o se decidió conservar el valor sin equivalencia.

### Reglas no negociables

1. **No fuzzy automático.** Una semejanza ortográfica nunca se promueve por sí sola.
2. **Aislamiento por planta.** Un destino de Támesis no puede resolver un valor de Yarumal y viceversa.
3. **Texto histórico inmutable.** `title`, `process` y `equipment_ref` se conservan como evidencia de origen.
4. **Backfill limitado.** Solo se completan FKs canónicas actualmente nulas.
5. **Compatibilidad plantilla↔proceso.** Una plantilla no se asigna si contradice un proceso canónico ya resuelto; el conflicto queda reportado para revisión.
6. **Curaduría append-only.** Las decisiones no se editan ni borran: una nueva versión reemplaza lógicamente a la anterior y ambas quedan auditables.
7. **Veto humano.** Una decisión `unmapped` explícita puede bloquear incluso una coincidencia exacta; una decisión posterior puede supersederla sin borrar historia.
8. **Privilegios separados.** Supervisor/Técnico pueden administrar maestros según su contrato, pero solo `admin` y `director` pueden curar equivalencias o ejecutar el backfill legacy.
9. **Planificación sigue cerrada.** La reconciliación de `scheduled_activities` se ejecuta dentro de una RPC autorizada; no reabre UPDATE directo sobre la tabla.

### Componentes implementados

Base de datos:

- `private.normalize_operational_label(text)`;
- `legacy_operational_mapping_decisions`;
- resolver exacto/curado/unmapped;
- `ops_list_legacy_operational_reconciliation`;
- `ops_legacy_operational_reconciliation_metrics`;
- `ops_curate_legacy_operational_mapping`;
- `ops_apply_legacy_operational_reconciliation`.

Interfaz `/admin/operations`:

- cobertura por proceso, actividad y equipo;
- conteo canónico, pendiente, resoluble y sin mapa;
- frecuencia del texto legacy separada entre bitácora y programación;
- destino canónico por planta;
- acción para guardar equivalencia versionada;
- acción para marcar explícitamente `unmapped`;
- aplicación de referencias seguras con resultado y número de conflictos.

Pruebas:

- coincidencia exacta;
- ambigüedad;
- prohibición de fuzzy automático;
- aislamiento entre plantas;
- permisos de curaduría;
- historial de versiones;
- veto `unmapped`;
- backfill de actividad y programación;
- preservación del texto legacy;
- conflictos plantilla↔proceso;
- métricas de cobertura;
- permisos equivalentes en la capa TypeScript.

## Entregables técnicos

### 2A.1 · Foundation

- migración SQL con maestros y FKs nullable;
- RLS;
- seeds mínimos;
- tests de integridad/aislamiento;
- sin cambios visibles en formularios.

### 2A.2 · Master data administration

- `/admin/operations`;
- CRUD lógico create/update/active;
- filtros por planta;
- procesos, plantillas, rutas, orígenes, materiales;
- asociación equipo ↔ proceso.

### 2A.3 · Planning service

- RPC crear programación;
- RPC revisar/reprogramar;
- asignación de trabajadores;
- validación de solapamientos;
- lectura de cadena de revisión;
- frontera RPC-only para mutaciones autenticadas.

### 2A.4 · Planner UI

- mes/semana/día;
- filtros planta/proceso/trabajador/equipo;
- crear/editar mediante revisión;
- estados y excepciones;
- acceso desde `Hoy`.

### 2A.5 · Legacy reconciliation

- detectar textos actuales;
- resolver solo coincidencias exactas únicas;
- curar equivalencias de forma versionada;
- permitir veto `unmapped` explícito;
- aplicar backfill seguro de FKs;
- preservar evidencia textual;
- exponer métricas de cobertura;
- reportar conflictos plantilla↔proceso.

## Estado de despliegue

Las migraciones de Wave 2A en código son:

- `0027_operational_master_data_planning.sql`
- `0028_planning_service.sql`
- `0029_planning_write_boundary.sql`
- `0030_legacy_operational_reconciliation.sql`

Antes del rollout hospedado, el proyecto Supabase `greenatics-ops` continúa intencionalmente en `0026_hosted_schema_contract`. El rollout 0027–0030 solo se ejecuta después de que el `develop` que contiene UI, pruebas y documentación complete todos los gates de CI.

No se crean mapeos ficticios para validar producción. Si no existen filas históricas promovidas, la reconciliación debe mostrar cero pendientes hasta que se cargue histórico real.

## Criterio de cierre de Wave 2A

Wave 2A se considera cerrada cuando:

- no existe fecha hardcodeada en el calendario;
- un director puede programar una semana real de Támesis o Yarumal desde maestros;
- la tarea llega a `Hoy` con proceso/trabajadores/equipo precargados;
- reprogramar deja historial y motivo;
- plan vs. real sigue funcionando;
- RLS impide leer o administrar maestros de una planta no autorizada;
- registros legacy continúan legibles sin mutación destructiva;
- la cobertura de reconciliación es observable y toda equivalencia no exacta exige decisión humana;
- ninguna reconciliación reabre escritura directa sobre planificación.
