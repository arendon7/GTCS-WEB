# Impact Publication Contract · GREENATICS OPS → Web pública

## Objetivo
Permitir que la web pública muestre impacto operativo sin exponer información incompleta, no conciliada o fuera de contexto.

## Principio
Ningún indicador llega a `greenatics.com.co/impacto` por estar disponible en OPS. Debe estar explícitamente marcado como publicable.

## Flujo
1. `MEASURED`: dato registrado en operación.
2. `RECONCILED`: unidades, duplicados, balances y periodo revisados.
3. `APPROVED`: responsable autorizado aprueba el corte y la metodología.
4. `PUBLISHED`: el dato entra al payload público.

## Campos mínimos por indicador
- `metric_id`
- `site_id`
- `period_start`
- `period_end`
- `value`
- `unit`
- `source_module`
- `calculation_version`
- `validation_status`
- `approved_by`
- `approved_at`
- `public=true|false`
- `methodology_url` cuando el valor sea calculado/estimado

## Indicadores V1
- residuos orgánicos recibidos
- material orgánico aprovechado
- rechazo / impropios
- producto sólido terminado
- producto líquido terminado
- inventario de producto terminado
- impacto climático estimado, solo con metodología aprobada

## Guardrails
- No publicar datos de jornadas o cargas individuales.
- No publicar datos personales de proveedores, conductores, operarios o clientes.
- No usar un acumulado histórico sin fecha de corte visible.
- No publicar balances de masa si las fuentes del periodo no están conciliadas.
- No recalcular CO2-eq en frontend; el valor debe provenir de un cálculo versionado y aprobado.
- Si un indicador pierde vigencia o cambia la metodología, debe poder retirarse o versionarse.

## Implementación V0.1
La web usa `src/data/impact.ts` con valores `null` y estado `pending_publication`. Esto evita datos simulados que puedan confundirse con resultados reales.
