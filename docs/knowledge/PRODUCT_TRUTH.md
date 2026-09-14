# Product Truth · Wondergreen · V0.2

## Regla de publicación
La web distingue tres cosas que no deben confundirse:

1. **Portafolio técnico:** una familia o referencia está documentada en Product Master/material técnico.
2. **Referencia comercial reconciliada:** además existe una fuente reciente de precio/presentación utilizable públicamente.
3. **Producto listo para checkout:** requiere adicionalmente etiqueta, registro/condición regulatoria aplicable, packshot, inventario, logística y condiciones de venta confirmadas.

Una referencia puede estar en 1 o 2 sin estar todavía en 3.

## Precedencia
1. Etiqueta/empaque/ficha/registro vigente.
2. Product Master validado por Greenatics/MKTG Studio.
3. Tabla comercial vigente y reconciliada.
4. Documento técnico validado.
5. Manual de identidad.
6. Material histórico únicamente como referencia.

## Precios públicos reconciliados V0.2
Fuente: `Precios_Wondergreen_incremento_uniforme_6_1.xlsx` (agosto de 2026), derivado del catálogo mayo 2026 con incremento uniforme de 6,1%.

### Sólidos / compost
- Compost 40 kg: COP 20.200
- 2GROW 15-3-3 sólido 40 kg: COP 147.400
- 2BALANCE 7-7-7 sólido 40 kg: COP 147.400
- 2BLOOM 3-8-3 sólido 40 kg: COP 115.500
- 2FRUIT 3-3-8 sólido 40 kg: COP 121.900

### Líquidos con precio reconciliado
- 2GROW 100-20-20: 1 L, 3,75 L, 20 L, 200 L y 1000 L.
- 2BALANCE 70-70-70: 1 L, 3,75 L, 20 L, 200 L y 1000 L.
- 2FRUIT 30-30-80: 1 L, 3,75 L, 20 L, 200 L y 1000 L.

`src/data/catalog.ts` conserva los precios por presentación utilizados por el cotizador.

## Portafolio técnico adicional
El Product Master / decisiones aprobadas de MKTG Studio incluyen además:
- sólidos Wondergreen también contemplados en 5 kg;
- 2GROW líquido referencia 200-0-0;
- 2BLOOM líquido 30-80-30;
- bioinsumos: Extracto Ajo + Ají, Extracto de Neem, Beauveria, Metarhizium, Bacillus subtilis y Trichoderma;
- presentaciones de bioinsumos: 1 L, 5 L y 20 L.

Estas referencias se muestran como **PORTAFOLIO_TECNICO** hasta consolidar precio, disponibilidad, etiqueta y condición regulatoria para venta pública.

## Arquitectura agronómica pública
Wondergreen se organiza por objetivo y etapa:
- Compost → suelo / matriz orgánica.
- 2GROW → establecimiento, brotación y crecimiento vegetativo.
- 2BALANCE → nutrición balanceada / mantenimiento.
- 2BLOOM → transición reproductiva / floración.
- 2FRUIT → fase productiva / desarrollo y llenado.
- Bioinsumos → herramientas botánicas y microbiológicas dentro de manejo integrado, sin comunicar blancos ni eficacia específicos mientras falte ficha/registro reconciliado.

La arquitectura orienta; no reemplaza diagnóstico de lote.

## Activos visuales
- Ningún mockup histórico representa automáticamente el empaque 2026.
- Un packshot solo puede pasar a `APPROVED_PUBLIC` si está vinculado inequívocamente al SKU/presentación/etiqueta vigentes.
- Mientras falte esa reconciliación, la web debe usar representación gráfica, fotografía de uso/proceso o estado visual neutral; nunca inventar una etiqueta.

## Guardrails
- Precio no equivale a disponibilidad.
- No inventar dosis, frecuencia, compatibilidades, composición ampliada, cepas, registro ICA ni claim agronómico.
- No prometer rendimiento, floración, calibre, control de plagas/enfermedades o reducción de fertilización sin evidencia específica.
- Checkout solo cuando SKU, etiqueta, condición regulatoria, disponibilidad y logística estén validados.
- Si dos fuentes vigentes parecen contradecir fórmula o presentación, la web debe bloquear el dato antes que escoger una por conveniencia.
