export type PublicWondergreenPdfId =
  | "wondergreen-product-master"
  | "wondergreen-guide-cafe"
  | "wondergreen-guide-cacao"
  | "wondergreen-guide-aguacate"
  | "wondergreen-guide-limon-tahiti"
  | "wondergreen-guide-pastos"
  | "home-garden-guide-casa-jardin"
  | "home-garden-guide-mi-huerta"
  | "home-garden-guide-etapas"
  | "home-garden-guide-trasplante";

export type PublicWondergreenMediaId =
  | "catalogo-cover"
  | "guia-cafe-cover"
  | "guia-cacao-cover"
  | "guia-aguacate-cover"
  | "guia-citricos-cover"
  | "guia-pastos-cover"
  | "home-garden-casa-jardin-cover"
  | "home-garden-mi-huerta-cover"
  | "home-garden-etapas-cover"
  | "home-garden-trasplante-cover"
  | "wondergreen-system-stages"
  | "wondergreen-2grow"
  | "wondergreen-2balance"
  | "wondergreen-2bloom"
  | "wondergreen-2fruit"
  | "wondergreen-bioinsumos";

type PublicHostedAsset<TId extends string> = Readonly<{
  id: TId;
  filename: string;
  contentType: string;
  downloadUrl: string;
}>;

const PUBLIC_ONEDRIVE_HOST = "https://grupopineal-my.sharepoint.com";

function publicDownloadUrl(sharePath: string) {
  const url = `${PUBLIC_ONEDRIVE_HOST}${sharePath}?download=1`;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "grupopineal-my.sharepoint.com") {
    throw new Error("El host público del recurso Wondergreen no es válido.");
  }
  if (parsed.searchParams.get("download") !== "1") {
    throw new Error("El recurso Wondergreen debe usar descarga binaria directa.");
  }
  return parsed.toString();
}

export const publicWondergreenPdfs: readonly PublicHostedAsset<PublicWondergreenPdfId>[] = Object.freeze([
  { id: "wondergreen-product-master", filename: "catalogo-wondergreen.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQDcgWu7j3izTKvOjrT8kjLEAWD-K4YFHC3WyJ906ESswp4") },
  { id: "wondergreen-guide-cafe", filename: "guia-wondergreen-cafe.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQBO8IqLVbYUTI8ucVoT0UxAAYcla_Pi3Cw5m_g65JCBl0U") },
  { id: "wondergreen-guide-cacao", filename: "guia-wondergreen-cacao.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQDARDgN7SAVTbRpWBh8C_5xAV6apLUuoYIoHZw4DzDwLHQ") },
  { id: "wondergreen-guide-aguacate", filename: "guia-wondergreen-aguacate.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQD5xaF3W5lXQbzHdJzlLN6kAURwx3LLlWpYtl3oXX33pvs") },
  { id: "wondergreen-guide-limon-tahiti", filename: "guia-wondergreen-citricos.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQAjljZmsVgPTof_vOtSyN9_AaO2dVDm6F8DrSuzD-OUuGg") },
  { id: "wondergreen-guide-pastos", filename: "guia-wondergreen-pastos-y-praderas.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQBQJxECHjkBSo6ZJ66_Cm7mAQmtGjQSA3s9t5x-zLXHLKM") },
  { id: "home-garden-guide-casa-jardin", filename: "guia-casa-jardin.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQASfZ8Pzy8GSIQ4wXS0XcJuAeQOI7xlmg4mp9w_PHLCRxY") },
  { id: "home-garden-guide-mi-huerta", filename: "guia-mi-huerta.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQD2xJ1vPVbSTJKRhNY1xIWHAbeK08PJxlM6Ng1OEt3b_xQ") },
  { id: "home-garden-guide-etapas", filename: "guia-rapida-etapas.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQDPTSliVwbYRYkD1LOY0LVyAZwVvTe_5EdfZhus1RTJ49g") },
  { id: "home-garden-guide-trasplante", filename: "guia-trasplante.pdf", contentType: "application/pdf", downloadUrl: publicDownloadUrl("/:b:/g/personal/arendon_greenatics_com_co/IQBHpW-XGyh0T7QretbKRDqEAZxcCStEseVyT41tMRFdkw8") },
]);

export const publicWondergreenMedia: readonly PublicHostedAsset<PublicWondergreenMediaId>[] = Object.freeze([
  { id: "catalogo-cover", filename: "catalogo-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQCI3ajyCrgnRawDdBcPqlVbAZsyaWH3iw_8U1NwXvlPBV8") },
  { id: "guia-cafe-cover", filename: "guia-cafe-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQDvQrei1O77QKWuINBoJuVsASQh3WrfGsH4cMeFCUV7lwk") },
  { id: "guia-cacao-cover", filename: "guia-cacao-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQCQm0Oc7miBSJO_AlHBavOgAVikqKpIskCMfgLz2R3dmwg") },
  { id: "guia-aguacate-cover", filename: "guia-aguacate-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQABSbMd2IwrSajBXjvdOlnUARXIFX8_mr3O_6On_SUq23A") },
  { id: "guia-citricos-cover", filename: "guia-citricos-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQB41MDxtNPmT6s9Kqha9U8aAZ_H_ouqvhOiC-nF-iHG8fU") },
  { id: "guia-pastos-cover", filename: "guia-pastos-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQB0mMSAJJTQRa3ZarUROyZgAflzlj-RTURQ7V0bu_SksaI") },
  { id: "home-garden-casa-jardin-cover", filename: "home-garden-casa-jardin-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQBOIZ_vtgN2RLQoy0TtiOHSAe8byjN1L1f6jJpVC75IQIk") },
  { id: "home-garden-mi-huerta-cover", filename: "home-garden-mi-huerta-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQDbeD5lq9x3Rb-306BJAHHWAc7yjoJwEFAdRZlr2lacXY8") },
  { id: "home-garden-etapas-cover", filename: "home-garden-etapas-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQCxKy3wSSh6Q6BHjvNuGNpWAX8B1cykojKNjwAEXeQICKo") },
  { id: "home-garden-trasplante-cover", filename: "home-garden-trasplante-cover.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQCNIRs8EEKnSKJ0eIwgnNknAWibtUs0UaLgJduv1mceXgY") },
  { id: "wondergreen-system-stages", filename: "wondergreen-system-stages.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQC6TKqflhX5S5h59TMNCd77AUMCOA_SMh_fJQrs9X-QSdw") },
  { id: "wondergreen-2grow", filename: "wondergreen-2grow.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQCqrTUPMFPNS56f8saQplOkAbzR7K-BHLSDApstzbdwHR0") },
  { id: "wondergreen-2balance", filename: "wondergreen-2balance.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQCvT_T5AX6GQbkvEvcplOI7ASjgDg6YtfsFbjawtHfSP6Q") },
  { id: "wondergreen-2bloom", filename: "wondergreen-2bloom.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQB31j0dbReqRoDAb8BFM1KYAQKtnTWh8SEoRZzLAYyDiDI") },
  { id: "wondergreen-2fruit", filename: "wondergreen-2fruit.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQBtj_lxYNy6QbDKjE4_TP4kAaN9Vzo9hqw5lkqdHlei2Lg") },
  { id: "wondergreen-bioinsumos", filename: "wondergreen-bioinsumos.webp", contentType: "image/webp", downloadUrl: publicDownloadUrl("/:u:/g/personal/arendon_greenatics_com_co/IQAioGSAn8F1R6XzPBo_Hop5AebpRx5OVbk_Vm7zQUOiDqs") },
]);

export function getPublicWondergreenPdf(resourceId: string) {
  return publicWondergreenPdfs.find((resource) => resource.id === resourceId) ?? null;
}

export function getPublicWondergreenMedia(assetId: string) {
  return publicWondergreenMedia.find((asset) => asset.id === assetId) ?? null;
}
