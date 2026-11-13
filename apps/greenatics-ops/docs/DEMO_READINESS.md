# OPS · demo sintética revisable

Corte de alcance: 19 de octubre de 2026. Esta ficha se evalúa sobre el SHA del PR que la contiene. No expresa un porcentaje global ni acredita piloto o producción.

| Dimensión | Criterio y evidencia | Límite / siguiente cierre |
|---|---|---|
| Contenido | Unidades visibles; informe distingue producción del periodo de stock actual y declara planta/modo. `src/lib/dashboard-report.test.ts` y descarga real en E2E. | Datos sintéticos del navegador. No son cifras operativas de GREENATICS. |
| Módulos | Recepción → lote → actividad/mantenimiento → compostaje → producción → inventario → informe: `e2e/pilot-day-cycle.spec.ts`. | Programación remota y otros módulos fuera de este recorrido no se certifican por este gate. |
| UX e identidad | Se conserva el formulario operativo y los activos existentes. La conciliación acepta coma o punto decimal. `e2e/inventory-correction-persistence.spec.ts` guarda capturas por producto y dispositivo. | Revisar las capturas del candidato; no se introducen logos, gráficos ni colores nuevos. |
| Calidad y accesibilidad | Typecheck, lint, unitarias, build y Chromium escritorio/móvil. El nuevo recorrido prueba errores anunciados con `role=alert`, conservación de entrada, guardado por teclado y desbordamiento del dashboard. | No equivale a auditoría WCAG de toda OPS. Checks de otro SHA no validan este candidato. |
| Persistencia y corrección | El nuevo E2E comprueba kg/L: producción 250, despacho inválido 300 rechazado, despacho válido 60, conteo 185,5 con motivo, ajuste −4,5; recarga y segundo conteo sin ajuste adicional. Conserva producción original y lote, y descarga CSV con producción 250 y stock 185,50. | Solo `localStorage` en el mismo navegador/origen. Sin garantía multiusuario, respaldo o recuperación ante cuota/borrado. No modifica recepciones históricas. |
| Permisos e integración | Tests de política de acceso y membresías; filtros de planta en E2E. Base funcional: PR #347, `b9244b2fd58b9b0d949420e6828d064811f504e1`. | RLS/RPC reales requieren instancia local limpia y pgTAP antes de piloto; no se han alterado ni probado bases remotas. Coordinación integra y publica. |

## Unidad independiente y coordinación

El bloque cambia únicamente el parser del conteo, añade un recorrido E2E y amplía el workflow OPS. No cambia rutas públicas, Huella o RED. La ruta `apps/greenatics-ops/pnpm-workspace.yaml` coincide entre #347 y los candidatos #350/#341: queda sin editar y requiere resolución coordinada. Los arreglos Web #351 y Huella #349 no se incorporan aquí. PR #332 toca controles físicos bajo `src/components/`, fuera del diff de este bloque en `apps/greenatics-ops/`.

## Reproducir sin datos remotos

Desde `apps/greenatics-ops`, con Node 24 y las dependencias del lockfile:

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm exec eslint .
pnpm exec vitest run
NEXT_PUBLIC_DATA_MODE=local pnpm exec next build --webpack
OPS_E2E_PRODUCTION=1 OPS_E2E_PORT=4317 pnpm exec playwright test e2e/pilot-day-cycle.spec.ts e2e/inventory-correction-persistence.spec.ts --workers=1
```

Son seis ejecuciones de navegador: tres escenarios en dos dispositivos. El workflow conserva `test-results` y `playwright-report` como `ops-demo-evidence`, incluso cuando pasa. Sus capturas contienen únicamente datos ficticios.

## Gates de entrega

Demo revisable: resultados del SHA exacto, capturas inspeccionadas, flujo completo, corrección sin sobrescribir origen y errores recuperables. Integrable: además, revisión de dependencias/solapamientos y gates aplicables del candidato compuesto. Piloto: permisos y persistencia remota, respaldo/restauración, usuarios y validación técnica autorizados; pendientes y fuera de esta demo. Producción: no habilitada por este cambio.

Handoff y estado final se registran con SHA, PR, comandos, resultados y enlaces de Actions al cerrar el bloque. Reversa: revertir el commit del bloque. Sin merge/deploy, servicios nuevos, costos, usuarios reales o cambios de audiencia.
