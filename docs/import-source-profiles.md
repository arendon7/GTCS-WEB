# Perfiles de fuentes históricas

## Principio

El parser XLSX solo traduce celdas, hojas y metadatos. Las decisiones semánticas de unidad y promoción viven en perfiles explícitos y en el staging de IMPORT-001. Una cabecera no autoriza por sí sola una corrección heurística cuando la evidencia interna de la hoja es contradictoria.

## `BD_Operativa_Greenatics.xlsx`

Validado contra el archivo operativo de SharePoint en agosto de 2026.

### Hojas reconocidas

| Hoja | Tipo | Planta | Perfil |
|---|---|---|---|
| `BITACORA PROCESOS PLANTA TÁMESI` | bitácora | Támesis | Cabeceras operativas canónicas |
| `Ingreso de Material Támesis` | recepción | Támesis | `Masa (Ton)` tratada como toneladas declaradas; conversión a kg queda como warning trazable |
| `BITACORA PROCESOS PLANTA YARUMA` | bitácora | Yarumal | Cabeceras operativas canónicas |
| `Ingreso de Material Yarumal` | recepción | Yarumal | `Masa (Ton)` marcada como unidad ambigua hasta decisión humana |

### Hallazgos de QA del archivo real

- 1.886 filas de bitácora y 183 filas de ingreso: 2.069 filas fuente.
- Dry-run equivalente con las reglas actuales: 1.852 válidas, 58 warnings, 146 cuarentena y 13 duplicados.
- Las bitácoras válidas/warning se agrupan en 1.577 actividades candidatas, evitando duplicar una actividad por cada trabajador participante.
- Se observan duraciones negativas/cero y duraciones superiores a 12 h; permanecen en cuarentena.
- En Yarumal, la misma columna `Masa (Ton)` contiene escalas incompatibles (por ejemplo valores decimales cercanos a 3–5 junto con enteros de cientos y miles). No se aplica ninguna regla de dividir entre 10/100/1000: toda esa hoja de ingresos queda en cuarentena por unidad hasta aprobar un perfil de corrección respaldado por evidencia.
- El rechazo histórico suele aparecer como texto (`bultos`, `costales`) y no como masa en kg. Se conserva como `rejectionKnown=false`; nunca se convierte en `0 kg` observado.
- `Hora de inicio` y `Hora de finalización` en las dos bitácoras contienen serial Excel completos de fecha+hora, no simples fracciones horarias; pueden transformarse de manera determinística a hora local Colombia.

## Reglas de promoción

1. `valid` y `warning` pueden ser candidatos a promoción.
2. `quarantined` y `duplicate` nunca se promueven automáticamente.
3. La promoción conserva `importRunId`, `sourceRowIds`, nombre de fuente y claves determinísticas.
4. La masa recibida puede alimentar el Histórico cuando su unidad sea inequívoca aunque el rechazo no esté cuantificado.
5. El porcentaje de rechazo se calcula solo sobre masa cuyo rechazo sí está cuantificado; el dashboard debe exponer la cobertura de ese dato.
6. Cualquier futura regla de corrección para Yarumal debe documentar evidencia, rango temporal, transformación y reversibilidad antes de habilitar promoción.
