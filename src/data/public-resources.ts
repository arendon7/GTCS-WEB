export type PublicResourceKind = "crop-library" | "manual" | "guide" | "catalog" | "technology" | "finder";
export type PublicResourceDelivery = "web-native" | "public-download-pending";

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
};

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
    statusLabel: "Product Master público",
    title: "Catálogo técnico gobernado",
    copy: "Familias, fórmulas, formatos y estado público de cada referencia conectados con el sistema Wondergreen y su versión técnica.",
    href: "/wondergreen/productos",
    cta: "Ver productos",
    delivery: "public-download-pending",
    sourceAuthority: "Wondergreen Product Truth",
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
