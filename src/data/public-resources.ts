import { homeGardenGuides } from "./home-garden";

export type PublicResourceKind = "crop-library" | "manual" | "guide" | "catalog" | "technology" | "finder";
export type PublicResourceDelivery = "web-native" | "web-native-master-pending" | "public-download-pending" | "web-native-public-download";
export type PublicResourceMasterSource = "internal-document-library" | "validated-handoff";

export type PublicResource = {
  id: string;
  kind: PublicResourceKind;
  statusLabel: string;
  title: string;
  copy: string;
  href: string;
  cta: string;
  delivery: PublicResourceDelivery;
  sourceAuthority: string;
  masterLabel?: string;
  masterSource?: PublicResourceMasterSource;
  downloadHref?: string;
  downloadCta?: string;
};

const homeGardenPublicResources: PublicResource[] = homeGardenGuides.map((guide) => ({
  id: `home-garden-guide-${guide.id}`,
  kind: "guide",
  statusLabel: "Casa & Jardín",
  title: guide.title,
  copy: `${guide.summary} La lectura web está disponible dentro de Casa, Jardín y Vivero; el PDF maestro del handoff se conserva como fuente mientras localizamos su binario publicable.`,
  href: `/casa-jardin/guias#${guide.id}`,
  cta: "Abrir guía",
  delivery: "web-native-master-pending",
  sourceAuthority: "Wondergreen Casa & Jardín Truth · handoff validado",
  masterLabel: `${guide.title} · PDF maestro validado`,
  masterSource: "validated-handoff",
}));

export const publicResources: PublicResource[] = [
  {
    id: "wondergreen-crops",
    kind: "crop-library",
    statusLabel: "Disponible",
    title: "Programas Wondergreen por cultivo",
    copy: "Café, cacao, aguacate, limón Tahití y pastos con lectura por etapa, cautelas, alertas, producto relacionado y seguimiento.",
    href: "/wondergreen/cultivos",
    cta: "Explorar cultivos",
    delivery: "web-native",
    sourceAuthority: "Wondergreen Crop Truth",
  },
  {
    id: "wondergreen-guide-cafe",
    kind: "guide",
    statusLabel: "PDF disponible",
    title: "Guía Wondergreen para café",
    copy: "Programa navegable para café y guía editorial completa de 20 páginas disponibles desde una misma ruta pública.",
    href: "/wondergreen/cultivos/cafe",
    cta: "Abrir guía web",
    delivery: "web-native-public-download",
    sourceAuthority: "Wondergreen Crop Truth · maestro comercial localizado",
    masterLabel: "Guía Wondergreen Café · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: "/api/public-resources/guia-cafe",
    downloadCta: "Descargar PDF",
  },
  {
    id: "wondergreen-guide-cacao",
    kind: "guide",
    statusLabel: "PDF disponible",
    title: "Guía Wondergreen para cacao",
    copy: "Programa navegable para cacao y guía editorial completa de 20 páginas disponibles para consulta y descarga.",
    href: "/wondergreen/cultivos/cacao",
    cta: "Abrir guía web",
    delivery: "web-native-public-download",
    sourceAuthority: "Wondergreen Crop Truth · maestro comercial localizado",
    masterLabel: "Guía Wondergreen Cacao · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: "/api/public-resources/guia-cacao",
    downloadCta: "Descargar PDF",
  },
  {
    id: "wondergreen-guide-aguacate",
    kind: "guide",
    statusLabel: "PDF disponible",
    title: "Guía Wondergreen para aguacate",
    copy: "Programa navegable para aguacate y guía editorial completa de 20 páginas disponibles desde la Biblioteca Greenatics.",
    href: "/wondergreen/cultivos/aguacate",
    cta: "Abrir guía web",
    delivery: "web-native-public-download",
    sourceAuthority: "Wondergreen Crop Truth · maestro comercial localizado",
    masterLabel: "Guía Wondergreen Aguacate · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: "/api/public-resources/guia-aguacate",
    downloadCta: "Descargar PDF",
  },
  {
    id: "wondergreen-guide-limon-tahiti",
    kind: "guide",
    statusLabel: "PDF disponible",
    title: "Guía Wondergreen para limón Tahití",
    copy: "Programa web para limón Tahití y guía editorial de cítricos de 20 páginas disponibles para consulta y descarga.",
    href: "/wondergreen/cultivos/limon-tahiti",
    cta: "Abrir guía web",
    delivery: "web-native-public-download",
    sourceAuthority: "Wondergreen Crop Truth · maestro comercial localizado",
    masterLabel: "Guía Wondergreen Cítricos · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: "/api/public-resources/guia-citricos",
    downloadCta: "Descargar PDF",
  },
  {
    id: "wondergreen-guide-pastos",
    kind: "guide",
    statusLabel: "PDF disponible",
    title: "Guía Wondergreen para pastos y gramíneas",
    copy: "Programa web para pastos y guía editorial de Pastos y Praderas de 20 páginas disponibles para consulta y descarga.",
    href: "/wondergreen/cultivos/pastos-gramineas",
    cta: "Abrir guía web",
    delivery: "web-native-public-download",
    sourceAuthority: "Wondergreen Crop Truth · maestro comercial localizado",
    masterLabel: "Guía Wondergreen Pastos y Praderas · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: "/api/public-resources/guia-pastos-praderas",
    downloadCta: "Descargar PDF",
  },
  ...homeGardenPublicResources,
  {
    id: "wondergreen-use-manual",
    kind: "manual",
    statusLabel: "Disponible",
    title: "Manual de uso Wondergreen",
    copy: "Ruta común para revisar contexto, confirmar referencia, preparar, aplicar, registrar y hacer seguimiento sin convertir la guía en receta universal.",
    href: "/biblioteca/manual-uso-wondergreen",
    cta: "Abrir manual",
    delivery: "web-native",
    sourceAuthority: "Biblioteca técnica Greenatics/Wondergreen",
  },
  {
    id: "nutritional-review-criteria",
    kind: "guide",
    statusLabel: "Disponible",
    title: "Criterios de revisión nutricional",
    copy: "Suelo, etapa, densidad, historial de fertilización y objetivo productivo como cinco comprobaciones antes de cerrar una recomendación.",
    href: "/biblioteca/criterios-nutricionales",
    cta: "Revisar criterios",
    delivery: "web-native",
    sourceAuthority: "Biblioteca técnica Greenatics/Wondergreen",
  },
  {
    id: "nutritional-deficiencies",
    kind: "guide",
    statusLabel: "Disponible",
    title: "Guía práctica de deficiencias nutricionales",
    copy: "Lectura visual inicial de síntomas y confundidores que obliga a revisar tejido, patrón del lote y contexto antes de recomendar.",
    href: "/biblioteca/guia-deficiencias",
    cta: "Abrir guía",
    delivery: "web-native",
    sourceAuthority: "Biblioteca técnica Greenatics/Wondergreen",
  },
  {
    id: "wondergreen-product-master",
    kind: "catalog",
    statusLabel: "PDF disponible",
    title: "Catálogo técnico-comercial Wondergreen",
    copy: "Catálogo comercial Wondergreen de 10 páginas disponible como PDF, complementado por el Product Master navegable de la web.",
    href: "/wondergreen/productos",
    cta: "Ver productos",
    delivery: "web-native-public-download",
    sourceAuthority: "Wondergreen Product Truth · maestro comercial localizado",
    masterLabel: "Catálogo Wondergreen optimizado · 10 páginas",
    masterSource: "internal-document-library",
    downloadHref: "/api/public-resources/catalogo-wondergreen",
    downloadCta: "Descargar catálogo PDF",
  },
  {
    id: "wondergreen-more-than-npk",
    kind: "technology",
    statusLabel: "Tecnología",
    title: "Más que NPK",
    copy: "Matriz orgánica, formulación, oclusión y peletizado explicados separando característica técnica de promesa agronómica.",
    href: "/wondergreen#tecnologia",
    cta: "Entender la tecnología",
    delivery: "web-native",
    sourceAuthority: "Wondergreen Product Truth",
  },
  {
    id: "wondergreen-finder",
    kind: "finder",
    statusLabel: "Ruta orientativa",
    title: "Wondergreen Finder",
    copy: "Cultivo + etapa + necesidad + problema + contexto. El resultado orienta una ruta y deriva a asesoría cuando falta información.",
    href: "/wondergreen#finder",
    cta: "Conocer el Finder",
    delivery: "web-native",
    sourceAuthority: "Wondergreen Crop Truth",
  },
];

export const publicResourceHostingGate = {
  privateSourceLinksAllowed: false,
  publicDownloadEnabled: true,
  requiredPublicHost: "same-origin-or-approved-public-cdn",
  rule: "Los PDFs Wondergreen aprobados para publicación se sirven por una ruta pública same-origin con whitelist server-side; las URLs privadas de SharePoint nunca se exponen al navegador.",
} as const;
