# Decision Log

## D-001 · Arquitectura de marca
Greenatics es la plataforma madre; Wondergreen es el motor comercial de producto; GREENATICS OPS es la capa autenticada de operación y datos.

## D-002 · Narrativa
Residuo orgánico → transformación → producto → suelo/cultivo → impacto medible.

## D-003 · Wondergreen primero
La navegación comercial se organiza por objetivo/etapa antes que por SKU.

## D-004 · No inventar verdad técnica
Toda dosis, formulación ampliada, claim, registro y resultado requiere fuente validada.

## D-005 · Datos públicos controlados
OPS podrá alimentar impacto público, pero solamente mediante indicadores aprobados. La V0.1 usa estados vacíos deliberados en lugar de publicar datos internos sin autorización.

## D-006 · Knowledge Ops
Git es verdad ejecutable; `docs/knowledge` conserva decisiones, fuentes y guardrails; futuros mapas Graphify deben ser regenerables desde código y documentos, no convertirse en una segunda fuente de verdad.

## D-007 · Biblioteca pública gobernada
La biblioteca técnica es una capa editorial web. No es un espejo de SharePoint ni un listado de archivos internos. Cada recurso publicado debe tener función para el usuario, procedencia clara y alcance controlado.

## D-008 · SEO sin claims adicionales
Structured data, canonical URLs y breadcrumbs describen únicamente contenido ya visible y validado. El SEO no se utiliza para introducir beneficios, disponibilidad, certificaciones o capacidades que la página no pueda sostener.

## D-009 · Evidencia visual antes que stock
Para proyectos y productos se prioriza fotografía real con procedencia. Cuando solo existe archivo histórico debe etiquetarse como archivo; cuando no existe un activo aprobado se conserva una representación neutral antes que inventar una fotografía.

## D-010 · QA visual como contrato
Desktop y móvil se verifican automáticamente sobre la exportación estática: rutas críticas, overflow horizontal, errores JavaScript/consola y screenshots de referencia. El QA visual pasa a formar parte del CI y no depende únicamente de revisión manual.
