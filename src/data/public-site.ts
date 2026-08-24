import { protectedOpsRoutePrefixes } from "@/lib/ops-access-policy";

export { publicPrimaryNav as publicNav } from "./public-navigation";

export const publicSite = {
  name: "Greenatics",
  publicDomainTarget: "https://greenatics.com.co",
  legacyIndexedDomain: "https://greenatics.org",
  description:
    "Greenatics conecta gestión de residuos, ingeniería, operación, Wondergreen, conocimiento y datos para devolver valor al territorio y al suelo.",
  office: {
    line1: "Cra 43b # 14–51 · Oficina 204",
    line2: "Centro Empresarial Alcalá",
    city: "Medellín, Colombia",
  },
  bookingUrl:
    "https://outlook.office.com/bookwithme/user/661b1e2305fb4f36ac3022c32feba931@greenatics.com.co/meetingtype/e8FmGdFQVkiR3lb6KlHLUA2?anonymous&ep=owaSlotsCopyLink",
} as const;

export const publicFooterNav = [
  {
    title: "Explorar",
    links: [
      { href: "/soluciones", label: "Soluciones" },
      { href: "/recursos", label: "Recursos" },
      { href: "/proyectos", label: "Proyectos / casos" },
      { href: "/impacto", label: "Impacto" },
    ],
  },
  {
    title: "Wondergreen",
    links: [
      { href: "/wondergreen", label: "Wondergreen" },
      { href: "/casa-jardin", label: "Casa & Jardín" },
      { href: "/wondergreen/productos", label: "Productos" },
      { href: "/wondergreen/tecnologia", label: "Tecnología" },
      { href: "/wondergreen/cultivos", label: "Cultivos" },
      { href: "/biblioteca", label: "Guías y biblioteca" },
    ],
  },
  {
    title: "Greenatics",
    links: [
      { href: "/nosotros", label: "Nosotros" },
      { href: "/contacto", label: "Hablar con nosotros" },
      { href: "/app", label: "Ingresar" },
    ],
  },
] as const;

export const publicStaticRoutes = [
  "/",
  "/soluciones",
  "/soluciones/diagnostico-inicial",
  "/soluciones/gestion-juridica-regulatoria",
  "/soluciones/valorizacion-productos",
  "/wondergreen",
  "/wondergreen/productos",
  "/wondergreen/tecnologia",
  "/wondergreen/cultivos",
  "/recursos",
  "/proyectos",
  "/impacto",
  "/biblioteca",
  "/biblioteca/guia-deficiencias",
  "/biblioteca/manual-uso-wondergreen",
  "/biblioteca/criterios-nutricionales",
  "/nosotros",
  "/contacto",
] as const;

export const publicReservedRoutes = [
  "/casa-jardin",
] as const;

export const internalRoutePrefixes = [
  ...protectedOpsRoutePrefixes,
  "/login",
  "/auth",
  "/api",
] as const;
