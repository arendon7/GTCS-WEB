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

const pending = (note: string): ProductMedia => ({
  status: "PENDING_PRODUCT_TRUTH",
  note,
});

export const productMediaRegistry: Record<string, ProductMedia> = {
  "compost-40kg": pending("Packshot actual pendiente de reconciliar con etiqueta, presentación y fuente aprobada."),
  "2grow-solido-40kg": pending("No usar mockups 2022 como representación vigente del SKU."),
  "2balance-solido-40kg": pending("No usar mockups 2022 como representación vigente del SKU."),
  "2bloom-solido-40kg": pending("No usar mockups 2022 como representación vigente del SKU."),
  "2fruit-solido-40kg": pending("No usar mockups 2022 como representación vigente del SKU."),
  "2grow-liquido-1l": pending("Fotografía o render vigente pendiente de Product Truth."),
  "2balance-liquido-1l": pending("Fotografía o render vigente pendiente de Product Truth."),
  "2fruit-liquido-1l": pending("Fotografía o render vigente pendiente de Product Truth."),
};

export function getProductMedia(slug: string): ProductMedia {
  return productMediaRegistry[slug] ?? pending("SKU sin activo público aprobado registrado.");
}

export function canRenderPublicPackshot(media: ProductMedia) {
  return media.status === "APPROVED_PUBLIC" && Boolean(media.src && media.alt && media.source);
}
