export type ProductMediaStatus =
  | "APPROVED_PUBLIC"
  | "PENDING_PRODUCT_TRUTH"
  | "REFERENCE_ONLY"
  | "LEGACY_EXCLUDE";

export type ProductMedia = {
  status: ProductMediaStatus;
  src?: string;
  alt?: string;
  source?: string;
  editorial?: {
    src: string;
    alt: string;
    source: string;
    note: string;
  };
  reference?: {
    src: string;
    alt: string;
    source: string;
    note: string;
  };
  candidate?: {
    status: "CANDIDATE_LOCAL";
    src: string;
    alt: string;
    source: string;
    note: string;
    displayNote?: string;
  };
  candidateVariants?: Array<NonNullable<ProductMedia["candidate"]>>;
  note: string;
};

const pending = (note: string): ProductMedia => ({ status: "PENDING_PRODUCT_TRUTH", note });
const editorial = (src: string, alt: string, note: string, source = "Imagen editorial generada con ImageGen el 2026-09-27."): ProductMedia => ({
  ...pending("Packshot vigente por SKU pendiente de validar contra Product Truth."),
  editorial: {
    src,
    alt,
    source,
    note,
  },
});
const cropperReference = (src: string, alt: string): ProductMedia => ({
  ...pending("Imagen Cropper referencial; el arte visible no confirma etiqueta, empaque o presentación final."),
  reference: {
    src,
    alt,
    source: "CROPER GREENATICS · 03_TODAS_LAS_IMAGENES_CROPER_FLAT · Drive, septiembre de 2026.",
    note: "Arte visual Cropper de referencia. La presentación y los textos del empaque no sustituyen la ficha ni confirman el arte comercial vigente.",
  },
});
const cropperReferenceWithEditorial = (
  referenceSrc: string,
  referenceAlt: string,
  editorialSrc: string,
  editorialAlt: string,
  editorialNote: string,
  editorialSource?: string,
): ProductMedia => ({
  ...cropperReference(referenceSrc, referenceAlt),
  editorial: editorial(editorialSrc, editorialAlt, editorialNote, editorialSource).editorial,
});

const ownerApproved40kgPackage = (src: string, alt: string, driveId: string): ProductMedia => ({
  ...pending("El arte de empaque de 40 kg fue aprobado por el usuario para la candidata web local. Los claims impresos, inventario y estado de compra conservan sus revisiones propias."),
  reference: {
    src,
    alt,
    source: `Drive · empaque Wondergreen de 40 kg · ${driveId} · aprobación de uso en candidata local: 2026-11-01.`,
    note: "Empaque Wondergreen de 40 kg aprobado para revisión visual en la candidata local; consulta precio y disponibilidad con el equipo.",
  },
});

const twofruitLiquid1LCandidate = {
  status: "CANDIDATE_LOCAL" as const,
  src: "/products/wondergreen-2fruit-liquid-v2-1l-candidate.jpg",
  alt: "Envase Wondergreen 2FRUIT 30-30-80, fertilizante líquido para aplicación al suelo, formato de 1 L.",
  source: "Drive · V2_2FRUIT_30-30-80_1L.png · 1eouNL3IgiOPJzKPLVrkDFz-wUI0pSI0J · copia fuente local verificada por SHA-256.",
  note: "Packshot de 1 L autorizado para revisión en la candidata local. No confirma las otras presentaciones, registro, precio ni disponibilidad.",
  displayNote: "Formatos comerciales publicados: 1 L, 3,75 L, 20 L, 200 L y 1.000 L. El equipo confirma inventario y condiciones de suministro.",
};

const liquidV2Candidate = (file: string, sourceFile: string, label: string, driveId: string, caveat: string, displayNote: string) => ({
  status: "CANDIDATE_LOCAL" as const,
  src: `/products/${file}`,
  alt: `Envase Wondergreen ${label}, presentación visual de 1 L.`,
  source: `Drive · ${sourceFile} · ${driveId} · original local preservado y derivado JPEG verificado por SHA-256.`,
  note: caveat,
  displayNote,
});

const twoGrowLiquidVariants = [
  {
    status: "CANDIDATE_LOCAL" as const,
    src: "/products/wondergreen-2grow-liquid-100-20-20-1l-cutout-v2.png",
    alt: "Envase Wondergreen 2GROW 100-20-20, presentación visual de 1 L.",
    source: "MKTG Studio · Canva `MAHZyZqd2x0` · recorte transparente de `V2_2GROW_100-20-20_1L.png` · Drive `1nKC6cWmS367BYmkRGNUwpKYedlpuKSnG` · SHA-256 `10b8e69f5ca648ad848bdf2393f4bb73531f1d4208bc692246b46c140fef0358`.",
    note: "Referencia visual 1 L. Las presentaciones comerciales reconciliadas corresponden a 100-20-20; el equipo confirma disponibilidad.",
    displayNote: "Formatos: 1 L, 3,75 L, 20 L, 200 L y 1.000 L. Disponibilidad por confirmar.",
  },
  {
    status: "CANDIDATE_LOCAL" as const,
    src: "/products/wondergreen-2grow-liquid-200-0-0-1l-cutout-v2.png",
    alt: "Envase Wondergreen 2GROW 200-0-0, presentación visual de 1 L.",
    source: "MKTG Studio · Canva `MAHZyQMGC-E` · recorte transparente de `V2_2GROW_200-0-0_1L.png` · Drive `1Cwit-XQkEykYvhTXOamqlTxygn88tyk4` · SHA-256 `7c3d9ad5d09b1bc7feec00fda3d51488ecb8c16a2fa523b371c15105b15925d3`.",
    note: "Referencia visual 1 L. La presentación y suministro de 200-0-0 se consultan por separado; no implica disponibilidad confirmada.",
    displayNote: "El envase mostrado señala 1 L; consulta formato de suministro y disponibilidad.",
  },
];

const compostCropperReference = {
  src: "/products/wondergreen-cropper-ref-compost-40kg.webp",
  alt: "Empaque Wondergreen Compost, acondicionador orgánico del suelo, presentación de 40 kg.",
  source: "Drive · saco_de_compost_orgánico_wondergreen.png · 1PGehR7vuIApe3cyfCNWTl7tn1h6HhWY0 · aprobación de uso en candidata local: 2026-11-01.",
  note: "Empaque Wondergreen Compost de 40 kg aprobado para revisión visual en la candidata local; consulta precio y disponibilidad con el equipo.",
};

export const productMediaRegistry: Record<string, ProductMedia> = {
  compost: {
    ...editorial("/products/wondergreen-line-compost.jpg", "Compost oscuro y materia orgánica junto a una planta joven.", "Escena conceptual de suelo y compost; no representa un empaque, una presentación ni un lote real."),
    reference: compostCropperReference,
  },
  "compost-40kg": {
    ...editorial("/products/wondergreen-line-compost.jpg", "Materia orgánica en el suelo junto a una planta joven.", "Imagen de familia compartida. No representa un empaque ni confirma la presentación de 40 kg."),
    reference: compostCropperReference,
  },
  bioinsumos: editorial("/products/wondergreen-line-bioinsumos-v2.jpg", "Una persona observa las raíces de una plántula de café en un vivero andino.", "Escena editorial generada para ilustrar observación de raíces y suelo. No representa un caso documentado, ensayo, cepa, blanco biológico ni efecto de producto.", "Imagen editorial generada con ImageGen el 2026-09-28; original en docs/knowledge/generated-visuals/wondergreen-bioinsumos-editorial-source.png."),
  "2grow": editorial("/products/wondergreen-line-2grow.jpg", "Plántula en suelo con gránulos.", "Escena conceptual de crecimiento vegetativo. No es fotografía del producto, empaque, ensayo ni resultado garantizado."),
  "2balance": editorial("/products/wondergreen-line-2balance.jpg", "Follaje de cultivo establecido sobre suelo con gránulos.", "Escena conceptual de mantenimiento. No es fotografía del producto, empaque, ensayo ni resultado garantizado."),
  "2bloom": editorial("/products/wondergreen-line-2bloom.jpg", "Flores de cafeto junto a suelo con gránulos.", "Escena conceptual de floración. No es fotografía del producto, empaque, ensayo ni resultado garantizado."),
  "2fruit": editorial("/products/wondergreen-line-2fruit.jpg", "Cerezas de café en desarrollo junto a suelo con gránulos.", "Escena conceptual de desarrollo del fruto. No es fotografía del producto, empaque, ensayo ni resultado garantizado."),
  "2grow-solido-40kg": ownerApproved40kgPackage("/products/wondergreen-cropper-ref-2grow-solid-40kg.webp", "Empaque Wondergreen 2GROW 15-3-3, presentación de 40 kg.", "1Od13Xf79dKx_K6RJpLC6WL-XoD8Ykhrj"),
  "2balance-solido-40kg": ownerApproved40kgPackage("/products/wondergreen-cropper-ref-2balance-solid-40kg.webp", "Empaque Wondergreen 2BALANCE 7-7-7, presentación de 40 kg.", "1aQprZlgFQkas9JwORKVXFYpiY1guj5NF"),
  "2bloom-solido-40kg": ownerApproved40kgPackage("/products/wondergreen-cropper-ref-2bloom-solid-40kg.webp", "Empaque Wondergreen 2BLOOM 3-8-3, presentación de 40 kg.", "1Oh4nhXZNn-kVDHwXO5WWwG8TZNCKA0MQ"),
  "2fruit-solido-40kg": ownerApproved40kgPackage("/products/wondergreen-cropper-ref-2fruit-solid-40kg.webp", "Empaque Wondergreen 2FRUIT 3-3-8, presentación de 40 kg.", "1TRzvObp62kB8rnv32Rqu50zCci4Cd_25"),
  "2grow-liquido-1l": { ...cropperReferenceWithEditorial("/products/wondergreen-cropper-ref-2grow-liquid-100-20-20.jpg", "Envase de fertilizante líquido Wondergreen 2GROW 100-20-20.", "/products/wondergreen-line-liquidos.jpg", "Vaso con líquido oscuro junto a una planta joven en suelo agrícola.", "Escena de la familia líquida; no representa concentración, etiqueta ni presentación."), candidate: twoGrowLiquidVariants[0] },
  "2grow-liquido-200-0-0": { ...cropperReferenceWithEditorial("/products/wondergreen-cropper-ref-2grow-liquid-200-0-0.jpg", "Envase de fertilizante líquido Wondergreen 2GROW 200-0-0.", "/products/wondergreen-line-liquidos.jpg", "Vaso con líquido oscuro junto a una planta joven en suelo agrícola.", "Escena de la familia líquida; no representa concentración, etiqueta ni presentación."), candidate: twoGrowLiquidVariants[1] },
  "2balance-liquido-1l": { ...cropperReferenceWithEditorial("/products/wondergreen-cropper-ref-2balance-liquid.jpg", "Envase de fertilizante líquido Wondergreen 2BALANCE 70-70-70.", "/products/wondergreen-liquid-2balance-editorial.jpg", "Cafeto en producción con frutos verdes y maduros en una ladera de cultivo.", "Escena contextual de etapa del cafeto; no documenta aplicación, cliente, ensayo, respuesta ni eficacia del producto.", "docs/knowledge/VISUAL_ASSET_SOURCES.md · escena de cultivo 2BALANCE · autoría y derechos pendientes; uso en candidata local."), candidate: liquidV2Candidate("wondergreen-2balance-liquid-v2-1l-candidate.jpg", "V2_2BALANCE_70-70-70_1L.png", "2BALANCE 70-70-70", "1CKmeXl_eUps-nqp6Hnj-IRSuHeDCwV1m", "Referencia visual de 1 L. La ficha comercial contempla cinco formatos; el equipo confirma presentación y disponibilidad.", "Formatos comerciales publicados: 1 L, 3,75 L, 20 L, 200 L y 1.000 L. El equipo confirma inventario y condiciones de suministro.") },
  "2fruit-liquido-1l": {
    ...cropperReferenceWithEditorial("/products/wondergreen-cropper-ref-2fruit-liquid.jpg", "Envase de fertilizante líquido Wondergreen 2FRUIT 30-30-80.", "/products/wondergreen-liquid-2fruit-editorial.jpg", "Cafeto con cerezas maduras y frutos verdes en desarrollo.", "Escena contextual de etapa del cafeto; no documenta aplicación, cliente, ensayo, respuesta ni eficacia del producto.", "docs/knowledge/VISUAL_ASSET_SOURCES.md · escena de cultivo 2FRUIT · autoría y derechos pendientes; uso en candidata local."),
    candidate: twofruitLiquid1LCandidate,
  },
  "2grow-liquido": { ...cropperReferenceWithEditorial("/products/wondergreen-cropper-ref-2grow-liquid-100-20-20.jpg", "Envase de fertilizante líquido Wondergreen 2GROW 100-20-20.", "/products/wondergreen-line-liquidos.jpg", "Vaso con líquido oscuro junto a una planta joven en suelo agrícola.", "Escena de la familia líquida; no representa concentración, etiqueta ni presentación."), candidateVariants: twoGrowLiquidVariants },
  "2balance-liquido": { ...cropperReferenceWithEditorial("/products/wondergreen-cropper-ref-2balance-liquid.jpg", "Envase de fertilizante líquido Wondergreen 2BALANCE 70-70-70.", "/products/wondergreen-liquid-2balance-editorial.jpg", "Cafeto en producción con frutos verdes y maduros en una ladera de cultivo.", "Escena contextual de etapa del cafeto; no documenta aplicación, cliente, ensayo, respuesta ni eficacia del producto.", "docs/knowledge/VISUAL_ASSET_SOURCES.md · escena de cultivo 2BALANCE · autoría y derechos pendientes; uso en candidata local."), candidate: liquidV2Candidate("wondergreen-2balance-liquid-v2-1l-candidate.jpg", "V2_2BALANCE_70-70-70_1L.png", "2BALANCE 70-70-70", "1CKmeXl_eUps-nqp6Hnj-IRSuHeDCwV1m", "Referencia visual de 1 L. La ficha comercial contempla cinco formatos; el equipo confirma presentación y disponibilidad.", "Formatos comerciales publicados: 1 L, 3,75 L, 20 L, 200 L y 1.000 L. El equipo confirma inventario y condiciones de suministro.") },
  "2bloom-liquido": { ...cropperReferenceWithEditorial("/products/wondergreen-cropper-ref-2bloom-liquid.jpg", "Envase de fertilizante líquido Wondergreen 2BLOOM 30-80-30.", "/products/wondergreen-liquid-2bloom-editorial.jpg", "Cafeto con flores blancas y frutos pequeños en desarrollo.", "Escena contextual de etapa del cafeto; no documenta aplicación, cliente, ensayo, respuesta ni eficacia del producto.", "docs/knowledge/VISUAL_ASSET_SOURCES.md · escena de cultivo 2BLOOM · autoría y derechos pendientes; uso en candidata local."), candidate: liquidV2Candidate("wondergreen-2bloom-liquid-v2-1l-candidate.jpg", "V2_2BLOOM_30-80-30_1L.png", "2BLOOM 30-80-30", "1Ba1_1Sl6Qx_76ux0ti5YcS-YAVb5XwGB", "Referencia visual de portafolio técnico de 1 L; no confirma presentación comercial ni disponibilidad.", "Parte del portafolio técnico Wondergreen; formato y condiciones de suministro por consultar.") },
  "2fruit-liquido": {
    ...cropperReferenceWithEditorial("/products/wondergreen-cropper-ref-2fruit-liquid.jpg", "Envase de fertilizante líquido Wondergreen 2FRUIT 30-30-80.", "/products/wondergreen-liquid-2fruit-editorial.jpg", "Cafeto con cerezas maduras y frutos verdes en desarrollo.", "Escena contextual de etapa del cafeto; no documenta aplicación, cliente, ensayo, respuesta ni eficacia del producto.", "docs/knowledge/VISUAL_ASSET_SOURCES.md · escena de cultivo 2FRUIT · autoría y derechos pendientes; uso en candidata local."),
    candidate: twofruitLiquid1LCandidate,
  },
  "bioinsumo-ajo-aji": {
    ...cropperReference("/products/wondergreen-cropper-ref-bioinput-ajo-aji.jpg", "Envase de bioinsumo botánico Wondergreen Extracto Ajo-Ají."),
    editorial: { src: "/products/wondergreen-bioinsumo-ajo-aji-editorial.jpg", alt: "Ajo y ají dispuestos en una mesa de trabajo agrícola.", source: "Imagen editorial generada con ImageGen el 2026-09-27.", note: "Escena contextual de ingredientes botánicos; no representa composición, ensayo ni efecto del producto." },
  },
  "bioinsumo-neem": {
    ...cropperReference("/products/wondergreen-cropper-ref-bioinput-neem.jpg", "Envase de bioinsumo botánico Wondergreen Neem."),
    editorial: { src: "/products/wondergreen-bioinsumo-neem-editorial.jpg", alt: "Hojas y semillas de neem observadas en un contexto de campo.", source: "Imagen editorial generada con ImageGen el 2026-09-27.", note: "Escena contextual; no representa composición, ensayo ni efecto del producto." },
  },
  "bioinsumo-beauveria": {
    ...cropperReference("/products/wondergreen-cropper-ref-bioinput-beauveria.jpg", "Envase de bioinsumo microbiológico Wondergreen Beauveria bassiana."),
    editorial: { src: "/products/wondergreen-bioinsumo-beauveria-editorial.jpg", alt: "Observación agronómica de una hoja de café.", source: "Imagen editorial generada con ImageGen el 2026-09-27.", note: "Escena contextual; no identifica cepa, blanco biológico, ensayo ni efecto del producto." },
  },
  "bioinsumo-metarhizium": {
    ...cropperReference("/products/wondergreen-cropper-ref-bioinput-metarhizium.jpg", "Envase de bioinsumo microbiológico Wondergreen Metarhizium anisopliae."),
    editorial: { src: "/products/wondergreen-bioinsumo-metarhizium-editorial.jpg", alt: "Revisión de suelo junto a un cultivo joven.", source: "Imagen editorial generada con ImageGen el 2026-09-27.", note: "Escena contextual; no identifica cepa, blanco biológico, ensayo ni efecto del producto." },
  },
  "bioinsumo-bacillus-subtilis": {
    ...cropperReference("/products/wondergreen-cropper-ref-bioinput-bacillus-subtilis.jpg", "Envase de bioinsumo microbiológico Wondergreen Bacillus subtilis."),
    editorial: { src: "/products/wondergreen-bioinsumo-bacillus-subtilis-editorial.jpg", alt: "Registro de observaciones en un cultivo bajo cubierta.", source: "Imagen editorial generada con ImageGen el 2026-09-27.", note: "Escena contextual; no identifica cepa, ensayo ni efecto del producto." },
  },
  "bioinsumo-trichoderma": {
    ...pending("La etiqueta del activo visual especifica una especie aún no reconciliada con la ficha y el registro vigentes; mantener el original fuera de páginas y export público."),
    editorial: { src: "/products/wondergreen-bioinsumo-trichoderma-editorial.jpg", alt: "Inspección de un cepellón en vivero.", source: "Imagen editorial generada con ImageGen el 2026-09-27.", note: "Escena contextual; no identifica especie o cepa, ensayo ni efecto del producto." },
  },
  "bioinsumo-trichoderma-bacillus": pending("La referencia visual reúne dos etiquetas; packshots individuales, concentración y condición comercial pendientes de reconciliar."),
  "bioinsumo-beauveria-metarhizium": pending("La referencia visual reúne dos etiquetas; packshots individuales, concentración y condición comercial pendientes de reconciliar."),
};

export function getProductMedia(slug: string): ProductMedia {
  return productMediaRegistry[slug] ?? pending("SKU sin activo público aprobado registrado.");
}

export function hasExplicitProductMedia(slug: string): boolean {
  return Object.hasOwn(productMediaRegistry, slug);
}

export function canRenderPublicPackshot(media: ProductMedia) {
  return media.status === "APPROVED_PUBLIC" && Boolean(media.src && media.alt && media.source);
}

export function getPublicProductImage(slug: string) {
  const media = getProductMedia(slug);
  return canRenderPublicPackshot(media) ? media.src : undefined;
}
