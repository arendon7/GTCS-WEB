import { parseSharePointGraphRuntimeConfig, type SharePointGraphRuntimeConfig } from "./graph-readonly";

export type PublicWondergreenPdfId =
  | "wondergreen-product-master"
  | "wondergreen-guide-cafe"
  | "wondergreen-guide-cacao"
  | "wondergreen-guide-aguacate"
  | "wondergreen-guide-limon-tahiti"
  | "wondergreen-guide-pastos";

type PublicWondergreenPdf = Readonly<{
  id: PublicWondergreenPdfId;
  itemId: string;
  filename: string;
}>;

const GRAPH_ORIGIN = "https://graph.microsoft.com";
const TOKEN_SCOPE = "https://graph.microsoft.com/.default";
const GRAPH_ID = /^[A-Za-z0-9!._-]{3,512}$/;

export const publicWondergreenPdfs: readonly PublicWondergreenPdf[] = Object.freeze([
  { id: "wondergreen-product-master", itemId: "01VAJGQOVIQ3U2MLVR5FBZQ5U4LYDFOPLH", filename: "catalogo-wondergreen.pdf" },
  { id: "wondergreen-guide-cafe", itemId: "01VAJGQOUUF5DBWLCEB5D2O5YCVPNTAII2", filename: "guia-wondergreen-cafe.pdf" },
  { id: "wondergreen-guide-cacao", itemId: "01VAJGQOUKZOUUY37G45E3XSYD7DTTFXGI", filename: "guia-wondergreen-cacao.pdf" },
  { id: "wondergreen-guide-aguacate", itemId: "01VAJGQOVFGMMQPE7Q65EIUBBM4JGFUNK2", filename: "guia-wondergreen-aguacate.pdf" },
  { id: "wondergreen-guide-limon-tahiti", itemId: "01VAJGQOXZBLJD7F62J5G2SURIXBMWM7MW", filename: "guia-wondergreen-citricos.pdf" },
  { id: "wondergreen-guide-pastos", itemId: "01VAJGQOVR7Q3XBPIMRFAIDSYCGUIQM26F", filename: "guia-wondergreen-pastos-y-praderas.pdf" },
]);

export function getPublicWondergreenPdf(resourceId: string) {
  return publicWondergreenPdfs.find((resource) => resource.id === resourceId) ?? null;
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

export async function downloadPublicWondergreenPdf(
  resourceId: string,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  const resource = getPublicWondergreenPdf(resourceId);
  if (!resource) return null;
  if (!GRAPH_ID.test(resource.itemId)) throw new Error("La referencia pública del PDF no es válida.");

  const runtime = parseSharePointGraphRuntimeConfig(env);
  if (!runtime.ok) throw new Error(runtime.error);
  const accessToken = await getAccessToken(runtime.value, fetchImpl);
  const url = `${GRAPH_ORIGIN}/v1.0/drives/${encodeURIComponent(runtime.value.source.driveId)}/items/${encodeURIComponent(resource.itemId)}/content`;
  const response = await fetchImpl(url, {
    method: "GET",
    headers: { authorization: `Bearer ${accessToken}`, accept: "application/pdf" },
    cache: "no-store",
    redirect: "follow",
  });
  if (!response.ok || !response.body) throw new Error(`Microsoft Graph document download failed with HTTP ${response.status}.`);

  return {
    resource,
    body: response.body,
    contentLength: response.headers.get("content-length"),
    etag: response.headers.get("etag"),
  } as const;
}
