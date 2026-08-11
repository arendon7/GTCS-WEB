# Wondergreen Product Asset Registry v0.1

Este registro gobierna qué imágenes de producto pueden representarse públicamente como producto Wondergreen vigente.

## Estados

- `APPROVED_PUBLIC`: activo vinculado inequívocamente a un SKU/presentación vigente y aprobado para publicación.
- `PENDING_PRODUCT_TRUTH`: el SKU existe en la capa comercial, pero no hay todavía un packshot actual suficientemente trazable.
- `REFERENCE_ONLY`: activo útil para entender formato, lenguaje visual o historia, pero no para representar el producto actual.
- `LEGACY_EXCLUDE`: activo histórico o conflictivo que no debe entrar a la web pública.

## Estado público actual

| Familia / SKU | Estado visual | Comportamiento web |
| --- | --- | --- |
| Compost 40 kg | `PENDING_PRODUCT_TRUTH` | Representación gráfica del sistema; no fotografía de empaque. |
| 2GROW sólido 40 kg | `PENDING_PRODUCT_TRUTH` | Representación gráfica del sistema; no fotografía de empaque. |
| 2BALANCE sólido 40 kg | `PENDING_PRODUCT_TRUTH` | Representación gráfica del sistema; no fotografía de empaque. |
| 2BLOOM sólido 40 kg | `PENDING_PRODUCT_TRUTH` | Representación gráfica del sistema; no fotografía de empaque. |
| 2FRUIT sólido 40 kg | `PENDING_PRODUCT_TRUTH` | Representación gráfica del sistema; no fotografía de empaque. |
| 2GROW líquido | `PENDING_PRODUCT_TRUTH` | Representación gráfica del sistema; no fotografía de empaque. |
| 2BALANCE líquido | `PENDING_PRODUCT_TRUTH` | Representación gráfica del sistema; no fotografía de empaque. |
| 2FRUIT líquido | `PENDING_PRODUCT_TRUTH` | Representación gráfica del sistema; no fotografía de empaque. |

## Hallazgos SharePoint

### Mockups Productos Wondergreen — marzo de 2022

Se localizaron en:
`4. WONDERGREEN/3. MÓDULO DE MERCADEO Y COMUNICACIONES/Mockups Productos Wondergreen`

Incluye, entre otros:
- `wondergreen 1 lt.jpg`
- `wondergreen 5lt.jpg`
- `wondergreen 20lts.jpg`
- `wondergreen 1kg.jpg`
- `wondergreen 10kg.jpg`
- `wondergreen bulto.jpg`
- `wondergreen gotas.jpg`
- `wondergreen sachet.jpg`

Clasificación: **`LEGACY_EXCLUDE` como packshot actual**.

Razón: fueron creados en marzo de 2022 y no existe evidencia suficiente de que etiqueta, formulación, presentación y arte correspondan al Product Truth público de 2026. Pueden consultarse como referencia histórica de formatos, nunca como sustituto automático de una fotografía vigente.

### Desarrollo de productos — agosto de 2025

Se localizaron carpetas técnicas recientes en:
`4. WONDERGREEN/5. MÓDULO OPERATIVO Y TÉCNICO/Desarrollo de productos`

Carpetas encontradas:
- `10-2-2`
- `3-2-2`
- `7-7-7`

Clasificación: **`REFERENCE_ONLY`**.

Razón: evidencian trabajo técnico relativamente reciente, pero una carpeta de desarrollo no constituye aprobación comercial, etiqueta vigente ni autorización de imagen pública. Además, puede existir conflicto entre fórmulas en desarrollo y referencias comerciales mostradas en otros maestros.

## Requisitos para promover un activo a APPROVED_PUBLIC

Un packshot solo puede publicarse cuando cumpla todos estos puntos:

1. Identifica de forma inequívoca familia, formato y presentación.
2. La etiqueta visible corresponde a la versión vigente aprobada.
3. Fórmula/referencia visible coincide con Product Truth vigente.
4. No contiene claims, registros, dosis o datos regulatorios obsoletos.
5. La fuente del activo está documentada.
6. Existe responsable o evidencia de aprobación comercial/técnica.
7. La imagen tiene calidad suficiente para web y no deforma logos, etiquetas ni proporciones del empaque.
8. Si el empaque cambia, el activo anterior baja inmediatamente a `LEGACY_EXCLUDE` o `REFERENCE_ONLY`.

## Regla de renderizado

La web debe funcionar en modo **fail-closed**:

- `APPROVED_PUBLIC` + archivo disponible → puede mostrarse el packshot.
- cualquier otro estado → se mantiene la representación gráfica neutra del sistema Wondergreen.
- nunca se debe inferir un packshot vigente a partir de una imagen histórica por similitud visual.

## Próxima validación

Buscar y reconciliar, por SKU:
- etiqueta vigente,
- ficha técnica vigente,
- presentación comercial vigente,
- fotografía o render aprobado,
- fecha / responsable de aprobación.

Hasta cerrar esa matriz, los mockups históricos quedan fuera de la tienda pública.
