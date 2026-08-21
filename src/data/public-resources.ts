import { homeGardenGuides } from "./home-garden";

export type PublicResourceKind = "crop-library" | "manual" | "guide" | "catalog" | "technology" | "finder";
export type PublicResourceDelivery = "web-native" | "web-native-master-pending" | "public-download" | "public-download-pending";
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
  downloadLabel?: string;
  coverImage?: string;
};

const publicDownload = (resourceId: string) => `/api/public-resources/${resourceId}`;

const homeGardenPublicResources: PublicResource[] = homeGardenGuides.map((guide) => ({
  id: `home-garden-guide-${guide.id}`,
  kind: "guide",
  statusLabel: "Casa & Jardín",
  title: guide.title,
  copy: `${guide.summary} La lectura web está disponible dentro de Casa, Jardín y Vivero; el PDF maestro del handoff se conserva como fuente y todavía no se expone como descarga pública.`,
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
    statusLabel: "Guía + PDF",
    title: "Guía Wondergreen para café",
    copy: "Programa navegable para café conectado con etapa, contexto de lote, familias Wondergreen y seguimiento, acompañado por su guía editorial completa de 20 páginas.",
    href: "/wondergreen/cultivos/cafe",
    cta: "Abrir guía de café",
    delivery: "public-download",
    sourceAuthority: "Wondergreen Crop Truth · guía editorial publicada",
    masterLabel: "Guía Wondergreen Café · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: publicDownload("wondergreen-guide-cafe"),
    downloadLabel: "Descargar guía PDF",
    coverImage: "/media/wondergreen/guia-cafe-cover.webp",
  },
  {
    id: "wondergreen-guide-cacao",
    kind: "guide",
    statusLabel: "Guía + PDF",
    title: "Guía Wondergreen para cacao",
    copy: "Programa navegable para cacao con establecimiento, formación, transición reproductiva, llenado, recuperación y seguimiento, más su guía editorial completa de 20 páginas.",
    href: "/wondergreen/cultivos/cacao",
    cta: "Abrir guía de cacao",
    delivery: "public-download",
    sourceAuthority: "Wondergreen Crop Truth · guía editorial publicada",
    masterLabel: "Guía Wondergreen Cacao · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: publicDownload("wondergreen-guide-cacao"),
    downloadLabel: "Descargar guía PDF",
    coverImage: "/media/wondergreen/guia-cacao-cover.webp",
  },
  {
    id: "wondergreen-guide-aguacate",
    kind: "guide",
    statusLabel: "Guía + PDF",
    title: "Guía Wondergreen para aguacate",
    copy: "Programa navegable para aguacate con formación, mantenimiento, prefloración, cuajado, llenado y recuperación, acompañado por la guía editorial V2 de 20 páginas.",
    href: "/wondergreen/cultivos/aguacate",
    cta: "Abrir guía de aguacate",
    delivery: "public-download",
    sourceAuthority: "Wondergreen Crop Truth · guía editorial publicada",
    masterLabel: "Guía Wondergreen Aguacate V2 · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: publicDownload("wondergreen-guide-aguacate"),
    downloadLabel: "Descargar guía PDF",
    coverImage: "/media/wondergreen/guia-aguacate-cover.webp",
  },
  {
    id: "wondergreen-guide-limon-tahiti",
    kind: "guide",
    statusLabel: "Guía + PDF",
    title: "Guía Wondergreen para limón Tahití",
    copy: "Programa navegable para limón Tahití organizado alrededor de flujos vegetativos y reproductivos, contexto radicular y seguimiento, junto con la guía editorial de cítricos de 20 páginas.",
    href: "/wondergreen/cultivos/limon-tahiti",
    cta: "Abrir guía de limón Tahití",
    delivery: "public-download",
    sourceAuthority: "Wondergreen Crop Truth · guía editorial publicada",
    masterLabel: "Guía Wondergreen Cítricos · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: publicDownload("wondergreen-guide-limon-tahiti"),
    downloadLabel: "Descargar guía PDF",
    coverImage: "/media/wondergreen/guia-citricos-cover.webp",
  },
  {
    id: "wondergreen-guide-pastos",
    kind: "guide",
    statusLabel: "Guía + PDF",
    title: "Guía Wondergreen para pastos y gramíneas",
    copy: "Programa navegable para suelo, crecimiento activo, sostenimiento y rebrote por hectárea y manejo del potrero, acompañado por la guía editorial de pastos y praderas de 20 páginas.",
    href: "/wondergreen/cultivos/pastos-gramineas",
    cta: "Abrir guía de pastos",
    delivery: "public-download",
    sourceAuthority: "Wondergreen Crop Truth · guía editorial publicada",
    masterLabel: "Guía Wondergreen Pastos y Praderas · 20 páginas",
    masterSource: "internal-document-library",
    downloadHref: publicDownload("wondergreen-guide-pastos"),
    downloadLabel: "Descargar guía PDF",
    coverImage: "/media/wondergreen/guia-pastos-cover.webp",
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
    statusLabel: "Catálogo + Product Master",
    title: "Catálogo técnico-comercial Wondergreen",
    copy: "Portafolio comercial Wondergreen en PDF, acompañado por el Product Master navegable para consultar referencias, familias, formulaciones, formatos y estado público.",
    href: "/wondergreen/productos",
    cta: "Ver productos",
    delivery: "public-download",
    sourceAuthority: "Wondergreen Product Truth · catálogo comercial publicado",
    masterLabel: "Catálogo Wondergreen optimizado · 10 páginas",
    masterSource: "internal-document-library",
    downloadHref: publicDownload("wondergreen-product-master"),
    downloadLabel: "Descargar catálogo PDF",
    coverImage: "/media/wondergreen/catalogo-cover.webp",
  },
  {
    id: "wondergreen-more-than-npk",
    kind: "technology",
    statusLabel: "Tecnología",
    title: "Más que NPK",
    copy: "Matriz orgánica, formulación, oclusión y peletizado explicados desde la arquitectura técnica del sistema Wondergreen.",
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
  requiredPublicHost: "same-origin-server-proxy",
  rule: "Los recursos explícitamente aprobados se entregan desde una ruta pública same-origin; las credenciales, URLs y permisos privados de SharePoint permanecen exclusivamente en servidor.",
} as const;
