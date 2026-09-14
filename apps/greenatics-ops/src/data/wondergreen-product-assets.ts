import { publicResources, type PublicResource } from "./public-resources";
import { wondergreenCrops, type WondergreenCrop } from "./wondergreen-crops";
import type { WondergreenReference } from "./wondergreen-public";

export type WondergreenArtwork = Readonly<{
  mediaId: string;
  href: string;
  alt: string;
  label: string;
  scope: "approved-line-artwork";
}>;

export type WondergreenProductDocumentSet = Readonly<{
  catalog: PublicResource | null;
  guides: PublicResource[];
  webResources: PublicResource[];
  technicalSheet: Readonly<{
    status: "public-master-pending";
    label: string;
    note: string;
  }>;
}>;

const publicMedia = (assetId: string) => `/api/public-media/${assetId}`;

const artworkByFamily = {
  "2Grow": {
    mediaId: "wondergreen-2grow",
    href: publicMedia("wondergreen-2grow"),
    alt: "Identidad visual aprobada de la línea Wondergreen 2Grow",
    label: "Arte aprobado de línea 2Grow",
    scope: "approved-line-artwork",
  },
  "2Balance": {
    mediaId: "wondergreen-2balance",
    href: publicMedia("wondergreen-2balance"),
    alt: "Identidad visual aprobada de la línea Wondergreen 2Balance",
    label: "Arte aprobado de línea 2Balance",
    scope: "approved-line-artwork",
  },
  "2Bloom": {
    mediaId: "wondergreen-2bloom",
    href: publicMedia("wondergreen-2bloom"),
    alt: "Identidad visual aprobada de la línea Wondergreen 2Bloom",
    label: "Arte aprobado de línea 2Bloom",
    scope: "approved-line-artwork",
  },
  "2Fruit": {
    mediaId: "wondergreen-2fruit",
    href: publicMedia("wondergreen-2fruit"),
    alt: "Identidad visual aprobada de la línea Wondergreen 2Fruit",
    label: "Arte aprobado de línea 2Fruit",
    scope: "approved-line-artwork",
  },
} as const satisfies Record<string, WondergreenArtwork>;

const guideResourceByCropSlug: Record<string, string> = {
  cafe: "wondergreen-guide-cafe",
  cacao: "wondergreen-guide-cacao",
  aguacate: "wondergreen-guide-aguacate",
  "limon-tahiti": "wondergreen-guide-limon-tahiti",
  "pastos-gramineas": "wondergreen-guide-pastos",
};

const webResourceIds = [
  "wondergreen-use-manual",
  "nutritional-review-criteria",
  "nutritional-deficiencies",
] as const;

function resourceById(resourceId: string) {
  return publicResources.find((resource) => resource.id === resourceId) ?? null;
}

export function getWondergreenProductArtwork(reference: Pick<WondergreenReference, "family">): WondergreenArtwork | null {
  return artworkByFamily[reference.family as keyof typeof artworkByFamily] ?? null;
}

export function getWondergreenProductCrops(reference: Pick<WondergreenReference, "family">): WondergreenCrop[] {
  const family = reference.family.toLowerCase();
  return wondergreenCrops.filter((crop) => crop.stages.some((stage) => stage.lines.some((line) => line.toLowerCase() === family)));
}

export function getWondergreenProductDocuments(reference: Pick<WondergreenReference, "family">): WondergreenProductDocumentSet {
  const cropGuides = getWondergreenProductCrops(reference)
    .map((crop) => guideResourceByCropSlug[crop.slug])
    .filter((resourceId): resourceId is string => Boolean(resourceId))
    .map(resourceById)
    .filter((resource): resource is PublicResource => Boolean(resource && resource.delivery === "public-download"));

  const webResources = webResourceIds
    .map(resourceById)
    .filter((resource): resource is PublicResource => Boolean(resource));

  return {
    catalog: resourceById("wondergreen-product-master"),
    guides: cropGuides,
    webResources,
    technicalSheet: {
      status: "public-master-pending",
      label: "Ficha técnica específica",
      note: "No existe todavía un master público individual vinculado a esta referencia. La web no inventa ni reconstruye una ficha técnica a partir de extractos.",
    },
  };
}

export const wondergreenProductAssetRegistry = Object.freeze({
  artworkByFamily,
  guideResourceByCropSlug,
  webResourceIds,
});
