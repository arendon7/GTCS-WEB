# DESIGN · GREENATICS WEB PLATFORM

## Dos registros, una sola plataforma
`GTCS-WEB` contiene dos experiencias que comparten infraestructura pero no deben confundirse visual ni funcionalmente.

### Registro A · Web pública
**Marca, contenido, ciencia aplicada y conversión.**

Debe sentirse contemporánea, natural, técnica y premium sin caer en clichés “eco”. La fotografía, los activos oficiales, la tipografía, el ritmo editorial y los diagramas explican el sistema Greenatics. Wondergreen tiene protagonismo comercial y técnico.

### Registro B · GREENATICS OPS
**Product UI**, no landing page ni pieza publicitaria.

Operacional, clara, sobria, moderna y confiable. Debe sentirse más cerca de software industrial contemporáneo que de un dashboard genérico de plantilla.

## Dirección visual pública
- Priorizar fotografía agrícola, suelo, raíces, plantas, procesos, infraestructura y personas reales.
- Usar logos, empaques y etiquetas oficiales desde fuentes autorizadas; nunca redibujarlos ni inventarlos con IA.
- Evitar hojas verdes decorativas, moléculas falsas, renders genéricos de bolsas, gradientes SaaS y greenwashing visual.
- Construir jerarquía editorial: titulares amplios, contenido respirado, bloques técnicos de alta legibilidad y CTAs claros.
- Wondergreen debe explicar **suelo + nutrición + biología + conocimiento + acompañamiento**.
- La tecnología de sólidos organominerales puede visualizar matriz orgánica → formulación/oclusión → peletizado → suelo → disponibilidad gradual cuando la afirmación esté soportada.
- Los estados regulatorios/comerciales de bioinsumos deben ser visibles cuando condicionen compra, cotización o uso.

## Dirección visual GREENATICS OPS
- Operación móvil: velocidad, botones grandes, lectura inmediata.
- Dirección desktop/tablet: densidad media-alta, jerarquía clara, comparación rápida.
- Menos tarjetas decorativas; más estructura, listas, timeline, estados y tablas cuando correspondan.
- El color comunica estado, no decora.

## Navegación y separación
- `/` y las rutas corporativas usan header/footer públicos.
- `/app` es la entrada explícita a GREENATICS OPS.
- La web pública puede mostrar “Acceder a Greenatics” como puente, pero no debe reutilizar la navegación operacional.
- La app interna no necesita cargar navegación, hero, footer ni ornamentación de marketing.
- En la fase inicial se permite compartir el root layout/proveedores para minimizar riesgo; la separación de providers y bundles se hará posteriormente sin alterar el comportamiento funcional.

## Responsive público
- Mobile-first para navegación, lectura y CTA.
- Hero y bloques editoriales deben reorganizarse sin esconder contenido esencial.
- Finder, cards de producto, guías y tablas técnicas deben funcionar con targets táctiles >= 44 px.
- Evitar carruseles obligatorios cuando una lista/grid adaptable sea más accesible.

## Taste dials por defecto
### Público
- DESIGN_VARIANCE: 6/10
- MOTION_INTENSITY: 4/10
- VISUAL_DENSITY: 4/10

### OPS
- DESIGN_VARIANCE: 4/10
- MOTION_INTENSITY: 3/10
- VISUAL_DENSITY: 6/10

## Motion
Usar movimiento solo para feedback, continuidad espacial y explicación funcional. En público puede apoyar ciclos, oclusión/liberación y navegación; en OPS se limita a estados y feedback. Nunca usar movimiento ornamental que ralentice la tarea.

## Accesibilidad
- Teclado y foco visible.
- Objetivos táctiles móviles >= 44 px.
- Inputs >= 16 px en móvil.
- `prefers-reduced-motion`.
- No depender solo del color.
- Contraste y semántica verificables en ambas superficies.

## Anti-patrones globales
- Card dentro de card dentro de card.
- Gradientes SaaS decorativos.
- Exceso de sombras.
- Bounce/elástico.
- Claims sin soporte.
- Logos o empaques reinterpretados.
- Métricas públicas sin fecha/fuente/aprobación.

## Anti-patrones OPS
- Gráficas sin pregunta operacional concreta.
- Home con decenas de KPI.
- Formularios largos cuando el contexto puede precargarse.

## Marca
Usar activos oficiales de GREENATICS y Wondergreen desde su fuente documental o registry aprobado. La marca pública puede tener mayor riqueza editorial; la app interna mantiene sobriedad funcional. Compartir repositorio no autoriza a igualar sus registros visuales.
