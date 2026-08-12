export const publicSite = {
  name: "Greenatics",
  publicDomainTarget: "https://greenatics.com.co",
  legacyIndexedDomain: "https://greenatics.org",
  description:
    "Greenatics conecta aprovechamiento de residuos orgánicos, tecnología, operación, Wondergreen, conocimiento y datos para devolver valor al territorio y al suelo.",
  office: {
    line1: "Cra 43b # 14–51 · Oficina 204",
    line2: "Centro Empresarial Alcalá",
    city: "Medellín, Colombia",
  },
  bookingUrl:
    "https://outlook.office.com/bookwithme/user/661b1e2305fb4f36ac3022c32feba931@greenatics.com.co/meetingtype/e8FmGdFQVkiR3lb6KlHLUA2?anonymous&ep=owaSlotsCopyLink",
} as const;

export const publicNav = [
  { href: "/soluciones", label: "Soluciones" },
  { href: "/wondergreen", label: "Wondergreen" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/impacto", label: "Impacto" },
  { href: "/biblioteca", label: "Conocimiento" },
  { href: "/nosotros", label: "Nosotros" },
] as const;

export const publicFooterNav = [
  {
    title: "Explorar",
    links: [
      { href: "/soluciones", label: "Soluciones" },
      { href: "/proyectos", label: "Proyectos" },
      { href: "/impacto", label: "Impacto" },
      { href: "/#tecnologia", label: "Tecnología" },
    ],
  },
  {
    title: "Agro",
    links: [
      { href: "/wondergreen", label: "Wondergreen" },
      { href: "/wondergreen/cultivos", label: "Cultivos" },
      { href: "/biblioteca", label: "Biblioteca" },
    ],
  },
  {
    title: "Greenatics",
    links: [
      { href: "/nosotros", label: "Nosotros" },
      { href: "/contacto", label: "Contacto" },
      { href: "/app", label: "GREENATICS OPS" },
    ],
  },
] as const;

export const publicStaticRoutes = [
  "/",
  "/soluciones",
  "/wondergreen",
  "/wondergreen/cultivos",
  "/proyectos",
  "/impacto",
  "/biblioteca",
  "/nosotros",
  "/contacto",
] as const;

export const internalRoutePrefixes = [
  "/app",
  "/activities",
  "/calendar",
  "/cash",
  "/compost",
  "/dashboard",
  "/documents",
  "/equipment",
  "/expenses",
  "/finance",
  "/imports",
  "/inventory",
  "/login",
  "/maintenance",
  "/production",
  "/purchase-requests",
  "/purchases",
  "/receptions",
  "/sales",
  "/settlements",
  "/suppliers",
  "/supplies",
] as const;
