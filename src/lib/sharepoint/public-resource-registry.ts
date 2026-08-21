export type PublicWondergreenPdf = Readonly<{
  slug: string;
  resourceId: string;
  itemId: string;
  fileName: string;
  title: string;
}>;

const documents: readonly PublicWondergreenPdf[] = [
  {
    slug: "catalogo-wondergreen",
    resourceId: "wondergreen-product-master",
    itemId: "01VAJGQOVIQ3U2MLVR5FBZQ5U4LYDFOPLH",
    fileName: "catalogo-wondergreen.pdf",
    title: "Catálogo Wondergreen",
  },
  {
    slug: "guia-cafe",
    resourceId: "wondergreen-guide-cafe",
    itemId: "01VAJGQOUUF5DBWLCEB5D2O5YCVPNTAII2",
    fileName: "guia-wondergreen-cafe.pdf",
    title: "Guía Wondergreen para café",
  },
  {
    slug: "guia-cacao",
    resourceId: "wondergreen-guide-cacao",
    itemId: "01VAJGQOUKZOUUY37G45E3XSYD7DTTFXGI",
    fileName: "guia-wondergreen-cacao.pdf",
    title: "Guía Wondergreen para cacao",
  },
  {
    slug: "guia-aguacate",
    resourceId: "wondergreen-guide-aguacate",
    itemId: "01VAJGQOVWV3JZ72EHIJGIMBZGGDJLIT6E",
    fileName: "guia-wondergreen-aguacate.pdf",
    title: "Guía Wondergreen para aguacate",
  },
  {
    slug: "guia-citricos",
    resourceId: "wondergreen-guide-limon-tahiti",
    itemId: "01VAJGQOXCVGU6PCSU5RF2A74WFEGBHKMB",
    fileName: "guia-wondergreen-citricos.pdf",
    title: "Guía Wondergreen para cítricos",
  },
  {
    slug: "guia-pastos-praderas",
    resourceId: "wondergreen-guide-pastos",
    itemId: "01VAJGQOVR7Q3XBPIMRFAIDSYCGUIQM26F",
    fileName: "guia-wondergreen-pastos-praderas.pdf",
    title: "Guía Wondergreen para pastos y praderas",
  },
] as const;

export const publicWondergreenPdfs = Object.freeze(documents.map((document) => Object.freeze({ ...document })));

export function getPublicWondergreenPdf(slug: string) {
  return publicWondergreenPdfs.find((document) => document.slug === slug);
}
