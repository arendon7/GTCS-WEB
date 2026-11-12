export const site = {
  name: "Greenatics",
  url: "https://greenatics.com.co",
  description:
    "Greenatics conecta biomasa, operación, productos agrícolas, territorio y datos para transformar corrientes orgánicas en valor que puede sostenerse.",
  bookingUrl:
    "https://outlook.office.com/bookwithme/user/661b1e2305fb4f36ac3022c32feba931@greenatics.com.co/meetingtype/e8FmGdFQVkiR3lb6KlHLUA2?anonymous&ep=owaSlotsCopyLink",
  croperStoreUrl: "https://croper.com/provider/1231-greenatics",
  address: "Cra 43b # 14–51 · Oficina 204, Centro Empresarial Alcalá, Medellín, Colombia",
};

export interface NavItem {
  href: string;
  label: string;
  subitems?: { href: string; label: string; description?: string }[];
}

export const primaryNav: NavItem[] = [
  {
    href: "/servicios/",
    label: "Servicios",
    subitems: [
      { href: "/municipios/", label: "Municipios y ESP", description: "PGIRS, rutas, plantas y capacidad territorial" },
      { href: "/empresas/", label: "Organizaciones y grandes generadores", description: "PMIRS y corrientes orgánicas para grandes generadores" },
      { href: "/agroindustria/", label: "Agroindustria", description: "Subproductos, energía, biofábrica y producto" },
      { href: "/diagnostico/", label: "Encontrar mi solución", description: "Orientador según necesidad y escala" },
    ],
  },
  {
    href: "/wondergreen/",
    label: "Productos",
    subitems: [
      { href: "/biblioteca/catalogo-wondergreen/", label: "Catálogo", description: "Fórmulas, presentaciones y fichas de producto" },
      { href: "/wondergreen/cultivos/", label: "Cultivos", description: "Protocolos y planes por etapa fisiológica" },
      { href: "/casa-jardin/", label: "Casa y jardín", description: "Soluciones para huertas, jardines y uso doméstico" },
    ],
  },
  {
    href: "/herramientas/",
    label: "Herramientas",
    subitems: [
      { href: "/app/", label: "GREENATICS OPS", description: "Muestra de operación con datos ficticios: lotes, procesos y bitácoras" },
      { href: "/red/", label: "GREENATICS Red", description: "Muestra para territorios, organizaciones, PMIRS y seguimiento" },
      { href: "/huella/", label: "Back 2 Green", description: "Inventario GEI autogestionado con acompañamiento" },
      { href: "/herramientas/estimador-organicos/", label: "Estimador de orgánicos", description: "Proyección de flujo y desvío; no calcula emisiones" },
      { href: "/agroway/", label: "AGROWAY", description: "Modelo histórico de trazabilidad agrícola" },
      { href: "/sana/", label: "SANA", description: "Estructuración de proyectos agrícolas" },
    ],
  },
  { href: "/proyectos/", label: "Casos" },
  {
    href: "/recursos/",
    label: "Conocimiento",
    subitems: [
      { href: "/biblioteca/", label: "Biblioteca técnica", description: "Programas por cultivo, fichas y documentos descargables" },
      { href: "/biblioteca/ideas/", label: "Ideas y análisis", description: "Lecturas técnicas para evaluar biomasa y proyectos" },
      { href: "/casa-jardin/guias/", label: "Guías Casa & Jardín", description: "Orientación para plantas, trasplantes y huertas" },
      { href: "/impacto/", label: "Impacto y evidencia", description: "Resultados publicados y metodología de medición" },
    ],
  },
  {
    href: "/nosotros/",
    label: "Greenatics",
    subitems: [
      { href: "/portafolio/", label: "Portafolio", description: "Servicios, productos, herramientas y líneas de trabajo" },
    ],
  },
];
