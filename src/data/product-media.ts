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
  note: string;
};

const pending = (note: string): ProductMedia => ({ status: "PENDING_PRODUCT_TRUTH", note });

export const productMediaRegistry: Record<string, ProductMedia> = {
  "compost-40kg": pending("Falta packshot 2026 vinculado inequívocamente a Compost y a la presentación vigente. Usar representación gráfica hasta reconciliarlo."),
  "2grow-solido-40kg": pending("No usar mockups 2022 como representación vigente. Requerimos arte/packshot actual 2GROW sólido con presentación reconciliada."),
  "2balance-solido-40kg": pending("No usar mockups 2022 como representación vigente. Requerimos arte/packshot actual 2BALANCE sólido con presentación reconciliada."),
  "2bloom-solido-40kg": pending("No usar mockups 2022 como representación vigente. Requerimos arte/packshot actual 2BLOOM sólido con presentación reconciliada."),
  "2fruit-solido-40kg": pending("No usar mockups 2022 como representación vigente. Requerimos arte/packshot actual 2FRUIT sólido con presentación reconciliada."),
  "2grow-liquido-1l": pending("Fotografía o render vigente de 2GROW 100-20-20 pendiente de validar contra etiqueta y presentación actuales."),
  "2grow-liquido-200-0-0": pending("Referencia técnica 2GROW 200-0-0 pendiente de reconciliación comercial y activo visual vigente."),
  "2balance-liquido-1l": pending("Fotografía o render vigente de 2BALANCE 70-70-70 pendiente de validar contra etiqueta y presentación actuales."),
  "2bloom-liquido": pending("Referencia técnica 2BLOOM 30-80-30 pendiente de reconciliación comercial y activo visual vigente."),
  "2fruit-liquido-1l": pending("Fotografía o render vigente de 2FRUIT 30-30-80 pendiente de validar contra etiqueta y presentación actuales."),
  "bioinsumo-ajo-aji": pending("Packshot y etiqueta vigentes pendientes de reconciliar; no representar usos o blancos biológicos desde piezas históricas."),
  "bioinsumo-neem": pending("Packshot y etiqueta vigentes pendientes de reconciliar; no representar usos o blancos biológicos desde piezas históricas."),
  "bioinsumo-beauveria": pending("Packshot, especie/cepa, concentración y etiqueta vigentes pendientes de reconciliar antes de representación comercial."),
  "bioinsumo-metarhizium": pending("Packshot, especie/cepa, concentración y etiqueta vigentes pendientes de reconciliar antes de representación comercial."),
  "bioinsumo-bacillus-subtilis": pending("Packshot, cepa, concentración y etiqueta vigentes pendientes de reconciliar antes de representación comercial."),
  "bioinsumo-trichoderma": pending("Packshot, especie/cepa, concentración y etiqueta vigentes pendientes de reconciliar antes de representación comercial."),
};

export function getProductMedia(slug: string): ProductMedia {
  return productMediaRegistry[slug] ?? pending("SKU sin activo público aprobado registrado.");
}

export function canRenderPublicPackshot(media: ProductMedia) {
  return media.status === "APPROVED_PUBLIC" && Boolean(media.src && media.alt && media.source);
}
