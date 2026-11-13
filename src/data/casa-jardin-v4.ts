/**
 * Visual and structured proposal copied from the approved Wondergreen Web V4
 * archive. Matrices and package artwork are proposals until SKU, label,
 * regulatory status, presentation and supply are reconciled.
 */
const v4ProductNames: Record<string, string> = {
  compost: "COMPOST",
  grow: "2GROW 15-3-3",
  balance: "2BALANCE 7-7-7",
  bloom: "2BLOOM 3-8-3",
  fruit: "2FRUIT 3-3-8",
  humic: "Sustancias Húmicas",
  potash: "Jabón Potásico",
  neem: "Neem",
};

const v4KitCopy = {
  "mi-primera-matera": {
    audience: "Personas que empiezan con una planta",
    promise: "Una primera ruta para observar la planta, el recipiente y el sustrato.",
    icon: "icon-primera-matera.webp",
  },
  "plantas-verdes": {
    audience: "Plantas de follaje, interior y exterior",
    promise: "Una propuesta para distinguir crecimiento y mantenimiento.",
    icon: "icon-follaje.webp",
  },
  "plantas-con-flor": {
    audience: "Plantas ornamentales en transición",
    promise: "Una propuesta para acompañar la etapa observable de floración.",
    icon: "icon-flor.webp",
  },
  "aromaticas-y-hojas": {
    audience: "Aromáticas y plantas apreciadas por sus hojas",
    promise: "Una propuesta de cuidado para especies cultivadas por su follaje.",
    icon: "icon-huerta.webp",
  },
  "trasplanta-y-activa": {
    audience: "Plantas que cambian de recipiente o espacio",
    promise: "Una propuesta para revisar sustrato, raíces y adaptación.",
    icon: "icon-raices.webp",
  },
  "mi-huerta": {
    audience: "Aromáticas, hortalizas y cultivos de fruto",
    promise: "Cada especie sigue su propio ciclo.",
    icon: "icon-huerta.webp",
  },
  "casa-completa": {
    audience: "Hogares con plantas en etapas distintas",
    promise: "Una colección propuesta para revisar planta por planta.",
    icon: "icon-cuidado.webp",
  },
  "casa-completa-xl": {
    audience: "Colecciones y jardines pequeños",
    promise: "Una colección ampliada propuesta para cuidar distintas etapas.",
    icon: "icon-cuidado.webp",
  },
  "proteccion-de-hojas": {
    audience: "Personas que observan cambios en el follaje",
    promise: "Una referencia visual para conversar sobre el cuidado de las hojas.",
    icon: "icon-cuidado.webp",
  },
} as const;

const v4KitRows = [
  { slug: "mi-primera-matera", category: "Para empezar", products: { compost: 1, balance: 1, humic: 1, potash: 1 } },
  { slug: "plantas-verdes", category: "Follaje", products: { compost: 1, grow: 1, balance: 1, humic: 1, potash: 1 } },
  { slug: "plantas-con-flor", category: "Flores", products: { compost: 1, balance: 1, bloom: 1, humic: 1, potash: 1 } },
  { slug: "aromaticas-y-hojas", category: "Aromáticas", products: { compost: 1, grow: 1, balance: 1, humic: 1, potash: 1 } },
  { slug: "trasplanta-y-activa", category: "Trasplante", products: { compost: 1, grow: 1, humic: 1, potash: 1 } },
  { slug: "mi-huerta", category: "Huerta", products: { compost: 1, grow: 1, bloom: 1, fruit: 1, humic: 1, potash: 1 } },
  { slug: "casa-completa", category: "Colección completa", products: { compost: 1, grow: 1, balance: 1, bloom: 1, fruit: 1, humic: 1, potash: 1 } },
  { slug: "casa-completa-xl", category: "Colección ampliada", products: { compost: 2, grow: 2, balance: 2, bloom: 2, fruit: 2, humic: 2, potash: 2 } },
  { slug: "proteccion-de-hojas", category: "Cuidado especializado", products: { neem: 1, potash: 1 } },
] as const;

export const casaJardinV4Kits = v4KitRows.map((kit) => {
  const copy = v4KitCopy[kit.slug];
  return {
    ...kit,
    ...copy,
    image: `/wondergreen/v4/kits/${kit.slug}.jpg`,
    imageAlt: `Arte V4 del kit ${kit.slug.replaceAll("-", " ")} con propuestas visuales de productos Wondergreen.`,
    iconImage: `/wondergreen/v4/support/${copy.icon}`,
    composition: Object.entries(kit.products).map(([slug, quantity]) => ({
      slug,
      name: v4ProductNames[slug],
      quantity,
    })),
    proposalLabel: "Configuración propuesta · contenido por confirmar",
    proposalNote: "El arte y esta matriz muestran una propuesta V4. El contenido, cantidades, presentación, etiqueta y disponibilidad se confirmarán SKU por SKU antes de ofrecer el kit.",
    accessoryNote: "Atomizador y bolsa exterior de fique: elementos propuestos, sujetos a prueba física y confirmación de armado.",
    guideNote: "Las guías gratuitas siguen en desarrollo; esta vista no reemplaza un manual final ni la etiqueta vigente.",
  };
});

const v4ProductRows = [
  { slug: "compost", name: "COMPOST", family: "Suelo", focus: "Suelo y sustrato", detailSlug: "compost", review: false },
  { slug: "grow", name: "2GROW 15-3-3", family: "Crecimiento", focus: "Vegetativo", detailSlug: "crece", review: false },
  { slug: "balance", name: "2BALANCE 7-7-7", family: "Equilibrio", focus: "Mantenimiento", detailSlug: "equilibra", review: false },
  { slug: "bloom", name: "2BLOOM 3-8-3", family: "Floración", focus: "Floración", detailSlug: "florece", review: false },
  { slug: "fruit", name: "2FRUIT 3-3-8", family: "Frutos", focus: "Producción", detailSlug: "fructifica", review: false },
  { slug: "humic", name: "Sustancias Húmicas", family: "Entorno suelo–raíz", focus: "Raíces", detailSlug: "humic", review: true },
  { slug: "potash", name: "Jabón Potásico", family: "Cuidado foliar", focus: "Cuidado foliar", detailSlug: "potash", review: true },
  { slug: "neem", name: "Neem", family: "Origen botánico", focus: "Cuidado dirigido", detailSlug: "neem", review: true },
] as const;

export const casaJardinV4Products = v4ProductRows.map((product) => ({
  ...product,
  image: `/wondergreen/v4/products/${product.slug}.jpg`,
  imageAlt: `Arte V4 de ${product.name}, con el envase y el contenido visual propuestos para revisión.`,
  visualNote: "Arte V4 de referencia; no confirma empaque, etiqueta, registro, presentación ni inventario vigentes.",
}));
