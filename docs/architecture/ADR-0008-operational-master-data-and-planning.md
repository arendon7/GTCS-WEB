# ADR-0008 · Maestros operacionales y planeación trazable

- Estado: Accepted
- Fecha: 2026-08-14
- Alcance: GREENATICS OPS · Wave 2A
- Requisitos: PLN-01, PLN-02, PLN-03, PLN-04, ACT-02, INV-02

## Contexto

La reconciliación funcional V0.2 mostró que el CORE transaccional ya resuelve buena parte de autenticación, RLS, actividades, trabajadores, equipos, recepciones, lotes y analítica. La principal deuda de producto está antes de la analítica: proceso, actividad, equipo, ruta, material y otros datos críticos todavía pueden nacer como texto libre, y `scheduled_activities` no tiene asignaciones ni trazabilidad suficiente para convertirse en el programador mensual/semanal de planta.

El esquema actual ya contiene las entidades que deben preservarse: `plants`, `employees`, `equipment`, `scheduled_activities`, `activities` y `activity_workers`. Wave 2A debe evolucionarlas sin una reescritura destructiva.

## Decisión

### 1. Evolución aditiva, no reemplazo

Se mantienen las tablas operacionales existentes. Se añaden maestros canónicos y FKs nuevas. Durante la transición se conservan `title`, `process` y `equipment_ref` como campos legacy/fallback; no se eliminan ni se reinterpretan automáticamente.

### 2. Un dato consultable no vuelve a nacer como texto libre

Los siguientes conceptos pasan a maestro/relación cuando la UI Wave 2A los active:

- proceso operacional;
- plantilla de actividad;
- trabajador;
- equipo;
- ruta;
- origen/generador/proveedor;
- tipo de material;
- unidad de medida.

Observaciones, notas y motivos narrativos continúan como texto libre.

### 3. Catálogos por planta

Procesos, plantillas de actividad, rutas, orígenes y tipos de material pertenecen a una planta. La separación por planta se aplica tanto en FK/constraints como mediante RLS. Un usuario solo puede consultar maestros de plantas donde tenga membresía activa.

### 4. `employees` y `equipment` siguen siendo maestros canónicos

No se crean tablas paralelas de trabajadores ni equipos. Se amplían sus relaciones con los nuevos maestros cuando sea necesario.

### 5. Planeación y ejecución permanecen separadas

`scheduled_activities` representa el plan. `activities` representa lo ejecutado. Una ejecución puede enlazarse a una programación, pero el registro real conserva su propia hora, cantidad, novedades y trabajadores ejecutores.

### 6. Reprogramar no destruye el plan anterior

La implementación del planificador no sobrescribirá silenciosamente una programación ejecutable. Una reprogramación/revisión debe conservar el registro anterior, el motivo, autor y vínculo con su sucesor. La cadena de revisiones será auditable y permitirá explicar plan vs. real.

### 7. Asignaciones planificadas son distintas de ejecutores reales

Se introduce una relación de trabajadores programados por actividad. Al iniciar una actividad, esos trabajadores se precargan, pero la ejecución mantiene `activity_workers` como fuente canónica de quién realmente trabajó.

### 8. Compatibilidad histórica

No se hará fuzzy matching automático de textos históricos a maestros. Los campos legacy continúan visibles para lectura y se reconciliarán mediante reglas exactas/curadas. La promoción histórica debe conservar procedencia y no contaminar los catálogos con valores ambiguos.

### 9. Sin DELETE operativo directo

Los maestros se desactivan mediante `active=false`. Las programaciones se revisan/versionan. No se añaden políticas DELETE directas para corregir historia operacional.

## Modelo objetivo de Wave 2A

Nuevos maestros base:

- `measurement_units`
- `operational_processes`
- `activity_templates`
- `material_sources`
- `collection_routes`
- `material_types`
- `equipment_processes`
- `scheduled_activity_workers`

Extensiones compatibles:

- `scheduled_activities.process_id`
- `scheduled_activities.activity_template_id`
- `scheduled_activities.equipment_id`
- `scheduled_activities.rescheduled_from_id`
- `scheduled_activities.reschedule_reason`
- `activities.process_id`
- `activities.activity_template_id`
- `activities.equipment_id`

## Orden de entrega

1. **2A.1 · Foundation**: tablas, constraints, RLS, seeds mínimos y FKs nullable.
2. **2A.2 · Administración**: interfaz de maestros por planta y activación/desactivación.
3. **2A.3 · Planning contract**: RPCs para crear/revisar programación, validar solapamientos y copiar asignaciones.
4. **2A.4 · Calendar UI**: mes/semana/día editable, sin fechas hardcodeadas.
5. **2A.5 · Legacy reconciliation**: mapeo curado de `process`/`equipment_ref` y otros textos a IDs canónicos.

## Consecuencias

- La UI puede migrar gradualmente sin romper registros actuales.
- Plan vs. real gana trazabilidad causal.
- Los dashboards futuros pueden agrupar por IDs estables, no por variantes ortográficas.
- Se evita crear un segundo modelo de trabajadores/equipos.
- La primera migración Wave 2A no obliga a cambiar formularios existentes; su objetivo es preparar el contrato persistente.
