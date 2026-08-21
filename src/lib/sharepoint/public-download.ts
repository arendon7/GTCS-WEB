import { parseSharePointGraphRuntimeConfig, type SharePointGraphRuntimeConfig } from "./graph-readonly";

type FetchLike = typeof fetch;
type Clock = () => number;

type TokenCache = {
  accessToken: string;
  refreshAfter: number;
};

const GRAPH_ITEM_ID = /^[A-Za-z0-9!._-]{3,512}$/;
const GRAPH_ORIGIN = "https://graph.microsoft.com";
const TOKEN_SCOPE = "https://graph.microsoft.com/.default";
const TOKEN_REFRESH_SAFETY_MS = 60_000;
const MAX_PUBLIC_PDF_BYTES = 100 * 1024 * 1024;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validItemId(value: string) {
  return GRAPH_ITEM_ID.test(value);
}

export class SharePointPublicDownloadClient {
  private tokenCache: TokenCache | null = null;

  constructor(
    private readonly config: SharePointGraphRuntimeConfig,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly now: Clock = Date.now,
  ) {}

  private async accessToken() {
    const now = this.now();
    if (this.tokenCache && now < this.tokenCache.refreshAfter) return this.tokenCache.accessToken;

    const tokenUrl = `https://login.microsoftonline.com/${this.config.auth.tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: this.config.auth.clientId,
      client_secret: this.config.auth.clientSecret,
      scope: TOKEN_SCOPE,
      grant_type: "client_credentials",
    });
    const response = await this.fetchImpl(tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Microsoft identity token request failed with HTTP ${response.status}.`);

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Microsoft identity token response was not valid JSON.");
    }
    const row = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    const accessToken = clean(row?.access_token);
    const expiresIn = Number(row?.expires_in);
    if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new Error("Microsoft identity token response was incomplete.");
    }

    const lifetimeMs = expiresIn * 1000;
    const safetyMs = Math.min(TOKEN_REFRESH_SAFETY_MS, Math.max(1_000, Math.floor(lifetimeMs / 10)));
    this.tokenCache = { accessToken, refreshAfter: now + Math.max(0, lifetimeMs - safetyMs) };
    return accessToken;
  }

  async fetchPdf(itemId: string) {
    if (!validItemId(itemId)) throw new Error("El itemId público no tiene un formato Graph válido.");
    const accessToken = await this.accessToken();
    const url = `${GRAPH_ORIGIN}/v1.0/drives/${encodeURIComponent(this.config.source.driveId)}/items/${encodeURIComponent(itemId)}/content`;
    const response = await this.fetchImpl(url, {
      method: "GET",
      headers: { authorization: `Bearer ${accessToken}`, accept: "application/pdf,application/octet-stream" },
      cache: "no-store",
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`Microsoft Graph document download failed with HTTP ${response.status}.`);

    const contentType = clean(response.headers.get("content-type")).toLowerCase().split(";")[0];
    if (contentType && contentType !== "application/pdf" && contentType !== "application/octet-stream") {
      throw new Error("Microsoft Graph devolvió un tipo de archivo distinto de PDF.");
    }
    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_PUBLIC_PDF_BYTES) {
      throw new Error("El PDF público excede el tamaño máximo permitido.");
    }
    return response;
  }
}

let runtimeClient: SharePointPublicDownloadClient | null = null;

export function getSharePointPublicDownloadClient() {
  if (!runtimeClient) {
    const parsed = parseSharePointGraphRuntimeConfig(process.env);
    if (!parsed.ok) throw new Error(parsed.error);
    runtimeClient = new SharePointPublicDownloadClient(parsed.value);
  }
  return runtimeClient;
}
