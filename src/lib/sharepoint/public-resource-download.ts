import { parseSharePointGraphRuntimeConfig, type SharePointGraphRuntimeConfig } from "./graph-readonly";

export type PublicWondergreenPdfId =
  | "wondergreen-product-master"
  | "wondergreen-guide-cafe"
  | "wondergreen-guide-cacao"
  | "wondergreen-guide-aguacate"
  | "wondergreen-guide-limon-tahiti"
  | "wondergreen-guide-pastos";

export type PublicWondergreenMediaId =
  | "catalogo-cover"
  | "guia-cafe-cover"
  | "guia-cacao-cover"
  | "guia-aguacate-cover"
  | "guia-citricos-cover"
  | "guia-pastos-cover"
  | "wondergreen-2bloom"
  | "wondergreen-bioinsumos";

type PublicGraphAsset<TId extends string> = Readonly<{
  id: TId;
  itemId: string;
  filename: string;
  contentType: string;
}>;

const GRAPH_ORIGIN = "https://graph.microsoft.com";
const TOKEN_SCOPE = "https://graph.microsoft.com/.default";
const GRAPH_ID = /^[A-Za-z0-9!._-]{3,512}$/;

export const publicWondergreenPdfs: readonly PublicGraphAsset<PublicWondergreenPdfId>[] = Object.freeze([
  { id: "wondergreen-product-master", itemId: "01VAJGQOVIQ3U2MLVR5FBZQ5U4LYDFOPLH", filename: "catalogo-wondergreen.pdf", contentType: "application/pdf" },
  { id: "wondergreen-guide-cafe", itemId: "01VAJGQOUUF5DBWLCEB5D2O5YCVPNTAII2", filename: "guia-wondergreen-cafe.pdf", contentType: "application/pdf" },
  { id: "wondergreen-guide-cacao", itemId: "01VAJGQOUKZOUUY37G45E3XSYD7DTTFXGI", filename: "guia-wondergreen-cacao.pdf", contentType: "application/pdf" },
  { id: "wondergreen-guide-aguacate", itemId: "01VAJGQOVFGMMQPE7Q65EIUBBM4JGFUNK2", filename: "guia-wondergreen-aguacate.pdf", contentType: "application/pdf" },
  { id: "wondergreen-guide-limon-tahiti", itemId: "01VAJGQOXZBLJD7F62J5G2SURIXBMWM7MW", filename: "guia-wondergreen-citricos.pdf", contentType: "application/pdf" },
  { id: "wondergreen-guide-pastos", itemId: "01VAJGQOVR7Q3XBPIMRFAIDSYCGUIQM26F", filename: "guia-wondergreen-pastos-y-praderas.pdf", contentType: "application/pdf" },
]);

export const publicWondergreenMedia: readonly PublicGraphAsset<PublicWondergreenMediaId>[] = Object.freeze([
  { id: "catalogo-cover", itemId: "01VAJGQOTUKW5ABSKD5FDKW3KXQ2UYYJG5", filename: "catalogo-cover.webp", contentType: "image/webp" },
  { id: "guia-cafe-cover", itemId: "01VAJGQOWTVFFRPJ43R5EKGPFECG6F57FX", filename: "guia-cafe-cover.webp", contentType: "image/webp" },
  { id: "guia-cacao-cover", itemId: "01VAJGQOUO66U2N5TGHBEZNUNMIC6366MG", filename: "guia-cacao-cover.webp", contentType: "image/webp" },
  { id: "guia-aguacate-cover", itemId: "01VAJGQORJQCA46SIRKJBIXBDBFNVU3L4T", filename: "guia-aguacate-cover.webp", contentType: "image/webp" },
  { id: "guia-citricos-cover", itemId: "01VAJGQOSTVLT43UZJZNHJZ4NTLSIL24SG", filename: "guia-citricos-cover.webp", contentType: "image/webp" },
  { id: "guia-pastos-cover", itemId: "01VAJGQOQRG24OXXNDEZB2WQVPBUZYIX25", filename: "guia-pastos-cover.webp", contentType: "image/webp" },
  { id: "wondergreen-2bloom", itemId: "01VAJGQOTFHK6KH3Y7C5DJKBA5OULRMGHO", filename: "wondergreen-2bloom.webp", contentType: "image/webp" },
  { id: "wondergreen-bioinsumos", itemId: "01VAJGQOUNL6KJ5VX3MBAYA3BP74SWZRQ2", filename: "wondergreen-bioinsumos.webp", contentType: "image/webp" },
]);

export function getPublicWondergreenPdf(resourceId: string) {
  return publicWondergreenPdfs.find((resource) => resource.id === resourceId) ?? null;
}

export function getPublicWondergreenMedia(assetId: string) {
  return publicWondergreenMedia.find((asset) => asset.id === assetId) ?? null;
}

async function getAccessToken(runtime: SharePointGraphRuntimeConfig, fetchImpl: typeof fetch) {
  const tokenUrl = `https://login.microsoftonline.com/${runtime.auth.tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: runtime.auth.clientId,
    client_secret: runtime.auth.clientSecret,
    scope: TOKEN_SCOPE,
    grant_type: "client_credentials",
  });
  const response = await fetchImpl(tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Microsoft identity token request failed with HTTP ${response.status}.`);
  const payload = await response.json() as { access_token?: unknown };
  const accessToken = typeof payload.access_token === "string" ? payload.access_token.trim() : "";
  if (!accessToken) throw new Error("Microsoft identity token response was incomplete.");
  return accessToken;
}

async function downloadGraphAsset<TId extends string>(
  asset: PublicGraphAsset<TId>,
  env: Record<string, string | undefined>,
  fetchImpl: typeof fetch,
) {
  if (!GRAPH_ID.test(asset.itemId)) throw new Error("La referencia pública del recurso no es válida.");
  const runtime = parseSharePointGraphRuntimeConfig(env);
  if (!runtime.ok) throw new Error(runtime.error);
  const accessToken = await getAccessToken(runtime.value, fetchImpl);
  const url = `${GRAPH_ORIGIN}/v1.0/drives/${encodeURIComponent(runtime.value.source.driveId)}/items/${encodeURIComponent(asset.itemId)}/content`;
  const response = await fetchImpl(url, {
    method: "GET",
    headers: { authorization: `Bearer ${accessToken}`, accept: asset.contentType },
    cache: "no-store",
    redirect: "follow",
  });
  if (!response.ok || !response.body) throw new Error(`Microsoft Graph document download failed with HTTP ${response.status}.`);
  return {
    asset,
    body: response.body,
    contentLength: response.headers.get("content-length"),
    etag: response.headers.get("etag"),
  } as const;
}

export async function downloadPublicWondergreenPdf(
  resourceId: string,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  const resource = getPublicWondergreenPdf(resourceId);
  return resource ? downloadGraphAsset(resource, env, fetchImpl) : null;
}

export async function downloadPublicWondergreenMedia(
  assetId: string,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  const asset = getPublicWondergreenMedia(assetId);
  return asset ? downloadGraphAsset(asset, env, fetchImpl) : null;
}
