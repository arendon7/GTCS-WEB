import { publicResources, type PublicResource } from "./public-resources";

const cropGuideResourceIds = {
  cafe: "wondergreen-guide-cafe",
  cacao: "wondergreen-guide-cacao",
  aguacate: "wondergreen-guide-aguacate",
  "limon-tahiti": "wondergreen-guide-limon-tahiti",
  "pastos-gramineas": "wondergreen-guide-pastos",
} as const;

export type WondergreenDocumentedCropSlug = keyof typeof cropGuideResourceIds;

export type WondergreenCropDocument = PublicResource & {
  resourceId: string;
  openHref: string;
  attachmentHref: string;
  coverImage: string;
  masterLabel: string;
};

export const wondergreenDocumentedCropSlugs = Object.keys(cropGuideResourceIds) as WondergreenDocumentedCropSlug[];

export function getWondergreenCropDocument(slug: string): WondergreenCropDocument | undefined {
  if (!(slug in cropGuideResourceIds)) return undefined;
  const resourceId = cropGuideResourceIds[slug as WondergreenDocumentedCropSlug];
  const resource = publicResources.find((item) => item.id === resourceId);

  if (
    !resource ||
    resource.kind !== "guide" ||
    resource.delivery !== "public-download" ||
    !resource.downloadHref ||
    !resource.coverImage ||
    !resource.masterLabel
  ) {
    return undefined;
  }

  return {
    ...resource,
    resourceId,
    openHref: resource.downloadHref,
    attachmentHref: `${resource.downloadHref}?download=1`,
    coverImage: resource.coverImage,
    masterLabel: resource.masterLabel,
  };
}
