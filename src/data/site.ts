export const site = {
  name: "Greenatics",
  url: "https://greenatics.com.co",
  description:
    "Greenatics transforma residuos orgánicos en recursos mediante gestión, plantas de aprovechamiento, biotecnología, fertilizantes Wondergreen y trazabilidad digital.",
  bookingUrl:
    "https://outlook.office.com/bookwithme/user/661b1e2305fb4f36ac3022c32feba931@greenatics.com.co/meetingtype/e8FmGdFQVkiR3lb6KlHLUA2?anonymous&ep=owaSlotsCopyLink",
  address: "Cra 43b # 14–51 · Oficina 204, Centro Empresarial Alcalá, Medellín, Colombia",
};

export interface NavItem {
  href: string;
  label: string;
  subitems?: { href: string; label: string; description?: string }[];
}

export const primaryNav: NavItem[] = [
  {
    href: "/soluciones/",
    label: "Qué hacemos",
    subitems: [
      { href: "/soluciones/", label: "Sistema Greenatics", description: "Del diagnóstico a la operación y la valorización" },
      { href: "/servicios/", label: "Servicios", description: "Estructuración, implementación, acompañamiento y medición" },
      { href: "/sana/", label: "SANA", description: "Ecosistema para estructurar inversión y proyectos productivos" },
      { href: "/tecnologia/", label: "Plantas y tecnología", description: "Infraestructura modular, bioprocesos y trazabilidad" },
      { href: "/diagnostico/", label: "Encontrar mi solución", description: "Orientador según necesidad, escala y territorio" },
    ],
  },
  { href: "/municipios/", label: "Municipios y ESP" },
  { href: "/empresas/", label: "Empresas" },
  { href: "/agroindustria/", label: "Agroindustria" },
  {
    href: "/wondergreen/",
    label: "Wondergreen",
    subitems: [
      { href: "/wondergreen/", label: "Sistema de nutrición", description: "Bioinsumos, fertilizantes organominerales y acompañamiento" },
      { href: "/wondergreen/cultivos/", label: "Cultivos", description: "Protocolos y planes por etapa fisiológica" },
      { href: "/wondergreen/calculadora/", label: "Herramientas agronómicas", description: "Contexto del lote, suelo, aplicación y seguimiento" },
      { href: "/wondergreen/cotizador/", label: "Cotizar Wondergreen", description: "Orientación comercial para productores y distribuidores" },
      { href: "/casa-jardin/", label: "Casa y jardín", description: "Soluciones para huertas, jardines y uso doméstico" },
    ],
  },
  { href: "/proyectos/", label: "Casos" },
  {
    href: "/biblioteca/",
    label: "Conocimiento",
    subitems: [
      { href: "/biblioteca/", label: "Biblioteca técnica", description: "Manuales, guías de cultivo y documentos de consulta" },
      { href: "/herramientas/", label: "Herramientas digitales", description: "OPS, Red Aseo, Calcula tu Huella, AGROWAY y SANA" },
      { href: "/agroway/", label: "AGROWAY", description: "Aplicación de trazabilidad agrícola y datos de campo" },
      { href: "/biblioteca/glosario/", label: "Glosario", description: "Conceptos de economía circular, bioprocesos y suelos" },
      { href: "/impacto/", label: "Impacto y evidencia", description: "Indicadores validados y metodología de medición" },
      { href: "/app/", label: "GREENATICS OPS", description: "Trazabilidad para báscula, lotes, operación y reportes" },
    ],
  },
  { href: "/nosotros/", label: "Nosotros" },
];
