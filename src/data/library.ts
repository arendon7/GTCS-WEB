export type LibraryResource = {
  slug: string;
  category: "Cultivos" | "Tecnología" | "Operación" | "Impacto" | "Comercial";
  title: string;
  summary: string;
  href: string;
  format: "Guía web" | "Caso" | "Metodología" | "Herramienta";
  status: "publicado" | "en-validacion";
};

export const libraryResources: LibraryResource[] = [
  {
    slug: "cacao",
    category: "Cultivos",
    title: "Programa orientativo Wondergreen para cacao",
    summary: "Ruta por establecimiento, formación, floración, llenado y recuperación, con selección por objetivo y etapa.",
    href: "/wondergreen/cultivos/cacao/",
    format: "Guía web",
    status: "publicado",
  },
  {
    slug: "cafe",
    category: "Cultivos",
    title: "Programa orientativo Wondergreen para café",
    summary: "Lectura por levante, mantenimiento, floración, llenado y recuperación del cafetal.",
    href: "/wondergreen/cultivos/cafe/",
    format: "Guía web",
    status: "publicado",
  },
  {
    slug: "aguacate",
    category: "Cultivos",
    title: "Programa orientativo Wondergreen para aguacate",
    summary: "Formación, mantenimiento, prefloración, cuajado, llenado y poscosecha bajo criterio agronómico.",
    href: "/wondergreen/cultivos/aguacate/",
    format: "Guía web",
    status: "publicado",
  },
  {
    slug: "limon-tahiti",
    category: "Cultivos",
    title: "Programa orientativo Wondergreen para limón Tahití",
    summary: "Nutrición organizada según flujos vegetativos y reproductivos del cultivo.",
    href: "/wondergreen/cultivos/limon-tahiti/",
    format: "Guía web",
    status: "publicado",
  },
  {
    slug: "pastos-gramineas",
    category: "Cultivos",
    title: "Programa orientativo para pastos y gramíneas",
    summary: "Ruta enfocada en rebrote, biomasa, recuperación y soporte orgánico del suelo.",
    href: "/wondergreen/cultivos/pastos-gramineas/",
    format: "Guía web",
    status: "publicado",
  },
  {
    slug: "tecnologia-plantas",
    category: "Tecnología",
    title: "Arquitectura de plantas Greenatics",
    summary: "Recepción, compostaje, digestión anaerobia, productos de valor, biogás y trazabilidad como sistema multietapa.",
    href: "/tecnologia/",
    format: "Metodología",
    status: "publicado",
  },
  {
    slug: "yarumal-trazabilidad",
    category: "Operación",
    title: "Caso Yarumal: operación y trazabilidad digital",
    summary: "Caso documentado de recepción, procesos biológicos, evidencia, formularios digitales e históricos auditables.",
    href: "/proyectos/yarumal/",
    format: "Caso",
    status: "publicado",
  },
  {
    slug: "impacto-publico",
    category: "Impacto",
    title: "Cómo Greenatics publica indicadores de impacto",
    summary: "Contrato de publicación que separa datos internos, conciliados y aprobados antes de mostrarlos públicamente.",
    href: "/impacto/",
    format: "Metodología",
    status: "publicado",
  },
  {
    slug: "cotizador-wondergreen",
    category: "Comercial",
    title: "Cotizador de catálogo Wondergreen",
    summary: "Herramienta de estimación con precios de catálogo vigentes, sin confirmar inventario, logística ni prescripción técnica.",
    href: "/wondergreen/cotizador/",
    format: "Herramienta",
    status: "publicado",
  },
];
