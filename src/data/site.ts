export const site = {
  name: "Greenatics",
  url: "https://greenatics.com.co",
  description:
    "Greenatics transforma residuos orgánicos en recursos mediante gestión, plantas de aprovechamiento, biotecnología, fertilizantes Wondergreen y trazabilidad digital.",
  bookingUrl:
    "https://outlook.office.com/bookwithme/user/661b1e2305fb4f36ac3022c32feba931@greenatics.com.co/meetingtype/e8FmGdFQVkiR3lb6KlHLUA2?anonymous&ep=owaSlotsCopyLink",
};

export type NavChild = {
  href: string;
  label: string;
  note?: string;
};

export type NavItem =
  | {
      type: "group";
      label: string;
      children: NavChild[];
    }
  | {
      type: "direct";
      href: string;
      label: string;
      badge?: string;
    };

export const primaryNav: NavItem[] = [
  {
    type: "group",
    label: "Soluciones",
    children: [
      { href: "/municipios/", label: "Municipios y ESP", note: "Planeación, operación y aprovechamiento territorial." },
      { href: "/empresas/", label: "Empresas y generadores", note: "PMIRS, gestión, tratamiento y trazabilidad." },
      { href: "/tecnologia/", label: "Plantas y tecnología", note: "Prefactibilidad, ingeniería y procesos biológicos." },
      { href: "/parque-ambiental/", label: "Parque Ambiental", note: "Arquitectura territorial modular, evaluada por proyecto." },
      { href: "/servicios/", label: "Todos los servicios", note: "Capacidades Greenatics actualmente publicadas." },
    ],
  },
  {
    type: "group",
    label: "Wondergreen",
    children: [
      { href: "/wondergreen/", label: "Portafolio Wondergreen", note: "Familias, etapas y Product Truth." },
      { href: "/wondergreen/cultivos/", label: "Guías por cultivo", note: "Orientación agronómica por etapa y contexto." },
      { href: "/wondergreen/cotizador/", label: "Cotizador", note: "Estimación con referencias y precios reconciliados." },
    ],
  },
  { type: "direct", href: "/wondergreen/hogar/", label: "Casa y Jardín", badge: "Próximamente" },
  {
    type: "group",
    label: "Recursos",
    children: [
      { href: "/proyectos/", label: "Proyectos", note: "Experiencia con alcance y periodo documentados." },
      { href: "/impacto/", label: "Impacto y datos", note: "Indicadores publicados solo tras conciliación y aprobación." },
      { href: "/biblioteca/", label: "Biblioteca", note: "Guías y recursos técnicos gobernados." },
    ],
  },
  { type: "direct", href: "/nosotros/", label: "Nosotros" },
];
