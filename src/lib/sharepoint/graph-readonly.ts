import {
  parseSharePointSourceConfig,
  validateSharePointDocumentReference,
  type SharePointDocumentReference,
  type SharePointSourceConfig,
} from "@/lib/document-source-contract";

export type SharePointGraphAuthConfig = Readonly<{
  tenantId: string;
  clientId: string;
  clientSecret: string;
}>;

export type SharePointGraphRuntimeConfig = Readonly<{
  source: SharePointSourceConfig;
  auth: SharePointGraphAuthConfig;
}>;

export type SharePointFolderReference = Readonly<{
  title: string;
  relativePath: string;
  childCount?: number;
}>;

export type SharePointDirectoryListing = Readonly<{
  relativeFolder: string;
  folders: readonly SharePointFolderReference[];
  documents: readonly SharePointDocumentReference[];
}>;

type FetchLike = typeof fetch;
type Clock = () => number;

type TokenCache = {
  accessToken: string;
  refreshAfter: number;
};

type DirectoryCacheEntry = {
  expiresAt: number;
  listing: SharePointDirectoryListing;
};

type GraphDriveItem = {
  id?: unknown;
  name?: unknown;
  webUrl?: unknown;
  lastModifiedDateTime?: unknown;
  file?: { mimeType?: unknown } | null;
  folder?: unknown;
};

type GraphChildrenPage = {
  value?: unknown;
  "@odata.nextLink"?: unknown;
};

type MappedDriveItem =
  | { kind: "document"; value: SharePointDocumentReference }
  | { kind: "folder"; value: SharePointFolderReference }
  | null;

export type SharePointListOptions = Readonly<{
  forceRefresh?: boolean;
}>;

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GRAPH_ORIGIN = "https://graph.microsoft.com";
const GRAPH_API_PREFIX = "/v1.0";
const TOKEN_SCOPE = "https://graph.microsoft.com/.default";
const TOKEN_REFRESH_SAFETY_MS = 60_000;
const DEFAULT_DOCUMENT_CACHE_TTL_MS = 60_000;
const MAX_GRAPH_PAGES = 5;
const MAX_DIRECTORY_ITEMS = 200;
const MAX_RELATIVE_PATH_LENGTH = 2048;
const MAX_RELATIVE_SEGMENTS = 32;
const MAX_FOLDER_NAME_LENGTH = 255;
const GRAPH_PAGE_SIZE = 100;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseGuid(value: unknown) {
  const normalized = clean(value).toLowerCase();
  return GUID.test(normalized) ? normalized : null;
}

export function parseSharePointGraphAuthConfig(
  env: Record<string, string | undefined>,
): { ok: true; value: SharePointGraphAuthConfig } | { ok: false; error: string } {
  const tenantId = parseGuid(env.SHAREPOINT_TENANT_ID);
  const clientId = parseGuid(env.SHAREPOINT_CLIENT_ID);
  const clientSecret = clean(env.SHAREPOINT_CLIENT_SECRET);

  if (!tenantId) return { ok: false, error: "SHAREPOINT_TENANT_ID falta o no es un UUID válido." };
  if (!clientId) return { ok: false, error: "SHAREPOINT_CLIENT_ID falta o no es un UUID válido." };
  if (!clientSecret || clientSecret.length > 4096) {
    return { ok: false, error: "SHAREPOINT_CLIENT_SECRET falta o tiene una longitud inválida." };
  }

  return { ok: true, value: { tenantId, clientId, clientSecret } };
}

export function parseSharePointGraphRuntimeConfig(
  env: Record<string, string | undefined>,
): { ok: true; value: SharePointGraphRuntimeConfig } | { ok: false; error: string } {
  const source = parseSharePointSourceConfig(env);
  if (!source.ok) return source;
  const auth = parseSharePointGraphAuthConfig(env);
  if (!auth.ok) return auth;
  return { ok: true, value: { source: source.value, auth: auth.value } };
}

function relativeSegments(value: string) {
  if (!value) return [];
  if (value.length > MAX_RELATIVE_PATH_LENGTH || value.startsWith("/") || value.endsWith("/") || value.includes("\\")) {
    throw new Error("La ruta documental relativa no es válida.");
  }

  const segments = value.split("/").map((segment) => segment.trim());
  if (
    segments.length > MAX_RELATIVE_SEGMENTS ||
    segments.some((segment) => !segment || segment === "." || segment === ".." || segment.length > MAX_FOLDER_NAME_LENGTH)
  ) {
    throw new Error("La ruta documental relativa no puede contener segmentos vacíos ni navegación relativa.");
  }
  return segments;
}

export function normalizeSharePointRelativeFolder(value = "") {
  return relativeSegments(value).join("/");
}

function sourceRootSegments(documentRoot: string) {
  const segments = documentRoot.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("SHAREPOINT_DOCUMENT_ROOT no es una raíz documental válida.");
  }
  return segments;
}

export function encodeSharePointGraphPath(documentRoot: string, relativeFolder = "") {
  const segments = [...sourceRootSegments(documentRoot), ...relativeSegments(relativeFolder)];
  return segments.map((segment) => encodeURIComponent(segment)).join("/");
}

function cacheKey(relativeFolder: string) {
  return normalizeSharePointRelativeFolder(relativeFolder);
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function safeFolderName(value: unknown) {
  if (typeof value !== "string") throw new Error("Microsoft Graph devolvió una carpeta sin nombre válido.");
  const name = value;
  if (
    !name ||
    name !== name.trim() ||
    name === "." ||
    name === ".." ||
    name.length > MAX_FOLDER_NAME_LENGTH ||
    name.includes("/") ||
    name.includes("\\") ||
    /[\u0000-\u001f]/.test(name)
  ) {
    throw new Error("Microsoft Graph devolvió una carpeta con nombre no navegable.");
  }
  return name;
}

function safeGraphNextLink(value: unknown, driveId: string) {
  if (value === undefined) return null;
  if (typeof value !== "string") throw new Error("Microsoft Graph devolvió un nextLink inválido.");

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Microsoft Graph devolvió un nextLink inválido.");
  }

  const expectedPrefix = `${GRAPH_API_PREFIX}/drives/${encodeURIComponent(driveId)}/`;
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.origin !== GRAPH_ORIGIN ||
    !url.pathname.startsWith(expectedPrefix)
  ) {
    throw new Error("Microsoft Graph devolvió un nextLink fuera del recurso autorizado.");
  }

  return url.toString();
}

function mapDriveItem(item: unknown, driveId: string, relativeFolder: string): MappedDriveItem {
  const row = asObject(item) as GraphDriveItem | null;
  if (!row) throw new Error("Microsoft Graph devolvió un driveItem inválido.");

  if (row.folder !== undefined && row.folder !== null) {
    const folderMetadata = asObject(row.folder);
    if (!folderMetadata) throw new Error("Microsoft Graph devolvió metadata de carpeta inválida.");
    const title = safeFolderName(row.name);
    const relativePath = normalizeSharePointRelativeFolder(relativeFolder ? `${relativeFolder}/${title}` : title);
    const rawChildCount = folderMetadata.childCount;
    let childCount: number | undefined;
    if (rawChildCount !== undefined) {
      const parsed = Number(rawChildCount);
      if (!Number.isSafeInteger(parsed) || parsed < 0) {
        throw new Error("Microsoft Graph devolvió un childCount de carpeta inválido.");
      }
      childCount = parsed;
    }
    return { kind: "folder", value: Object.freeze({ title, relativePath, ...(childCount === undefined ? {} : { childCount }) }) };
  }

  if (!row.file || typeof row.file !== "object") return null;

  const reference = validateSharePointDocumentReference({
    provider: "sharepoint",
    driveId,
    itemId: clean(row.id),
    title: clean(row.name),
    webUrl: clean(row.webUrl),
    mimeType: clean(row.file.mimeType),
    modifiedAt: clean(row.lastModifiedDateTime),
  });

  if (!reference.ok) throw new Error(`Microsoft Graph devolvió una referencia documental inválida: ${reference.error}`);
  return { kind: "document", value: reference.value };
}

function graphChildrenUrl(source: SharePointSourceConfig, relativeFolder: string) {
  const path = encodeSharePointGraphPath(source.documentRoot, relativeFolder);
  const url = new URL(`${GRAPH_ORIGIN}${GRAPH_API_PREFIX}/drives/${encodeURIComponent(source.driveId)}/root:/${path}:/children`);
  url.searchParams.set("$select", "id,name,webUrl,lastModifiedDateTime,file,folder");
  url.searchParams.set("$top", String(GRAPH_PAGE_SIZE));
  return url.toString();
}

export class SharePointGraphReadonlyClient {
  private tokenCache: TokenCache | null = null;
  private readonly directoryCache = new Map<string, DirectoryCacheEntry>();

  constructor(
    private readonly config: SharePointGraphRuntimeConfig,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly now: Clock = Date.now,
    private readonly documentCacheTtlMs = DEFAULT_DOCUMENT_CACHE_TTL_MS,
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

    const row = asObject(payload);
    const accessToken = clean(row?.access_token);
    const expiresIn = Number(row?.expires_in);
    if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new Error("Microsoft identity token response was incomplete.");
    }

    const lifetimeMs = expiresIn * 1000;
    const safetyMs = Math.min(TOKEN_REFRESH_SAFETY_MS, Math.max(1_000, Math.floor(lifetimeMs / 10)));
    this.tokenCache = {
      accessToken,
      refreshAfter: now + Math.max(0, lifetimeMs - safetyMs),
    };
    return accessToken;
  }

  private async graphPage(url: string, accessToken: string): Promise<GraphChildrenPage> {
    const response = await this.fetchImpl(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Microsoft Graph read failed with HTTP ${response.status}.`);
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Microsoft Graph response was not valid JSON.");
    }

    const row = asObject(payload);
    if (!row || !Array.isArray(row.value)) throw new Error("Microsoft Graph response did not contain a valid value array.");
    return row as GraphChildrenPage;
  }

  async listDirectory(relativeFolder = "", options: SharePointListOptions = {}): Promise<SharePointDirectoryListing> {
    const key = cacheKey(relativeFolder);
    const now = this.now();
    const cached = this.directoryCache.get(key);
    if (!options.forceRefresh && cached && now < cached.expiresAt) return cached.listing;

    const token = await this.accessToken();
    const documents: SharePointDocumentReference[] = [];
    const folders: SharePointFolderReference[] = [];
    let pageUrl: string | null = graphChildrenUrl(this.config.source, key);
    let pageCount = 0;

    while (pageUrl) {
      pageCount += 1;
      if (pageCount > MAX_GRAPH_PAGES) throw new Error("Microsoft Graph excedió el límite de paginación permitido.");

      const page = await this.graphPage(pageUrl, token);
      for (const item of page.value as unknown[]) {
        const mapped = mapDriveItem(item, this.config.source.driveId, key);
        if (!mapped) continue;
        if (mapped.kind === "folder") folders.push(mapped.value);
        else documents.push(mapped.value);
        if (folders.length + documents.length > MAX_DIRECTORY_ITEMS) {
          throw new Error("Microsoft Graph excedió el límite de elementos documentales permitido.");
        }
      }

      pageUrl = safeGraphNextLink(page["@odata.nextLink"], this.config.source.driveId);
    }

    const immutableFolders = Object.freeze(folders.map((folder) => Object.freeze({ ...folder })));
    const immutableDocuments = Object.freeze(documents.map((document) => Object.freeze({ ...document })));
    const listing = Object.freeze({ relativeFolder: key, folders: immutableFolders, documents: immutableDocuments });
    this.directoryCache.set(key, {
      listing,
      expiresAt: now + Math.max(0, this.documentCacheTtlMs),
    });
    return listing;
  }

  async listDocuments(relativeFolder = "", options: SharePointListOptions = {}) {
    return (await this.listDirectory(relativeFolder, options)).documents;
  }

  clearDocumentCache() {
    this.directoryCache.clear();
  }
}

export function createSharePointGraphReadonlyClient(
  env: Record<string, string | undefined> = process.env,
  options: {
    fetchImpl?: FetchLike;
    now?: Clock;
    documentCacheTtlMs?: number;
  } = {},
) {
  const config = parseSharePointGraphRuntimeConfig(env);
  if (!config.ok) throw new Error(config.error);
  return new SharePointGraphReadonlyClient(
    config.value,
    options.fetchImpl,
    options.now,
    options.documentCacheTtlMs,
  );
}
