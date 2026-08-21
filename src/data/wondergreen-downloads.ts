export const wondergreenCatalogDownloadHref = "/descargas/catalogo-wondergreen";

export const wondergreenCropGuideDownloads = {
  cafe: "/descargas/guia-cafe",
  cacao: "/descargas/guia-cacao",
  aguacate: "/descargas/guia-aguacate",
  "limon-tahiti": "/descargas/guia-citricos",
  "pastos-gramineas": "/descargas/guia-pastos-praderas",
} as const;

export function getWondergreenCropGuideDownloadHref(slug: string) {
  return wondergreenCropGuideDownloads[slug as keyof typeof wondergreenCropGuideDownloads];
}
