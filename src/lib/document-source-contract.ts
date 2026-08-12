export type DocumentProvider = "sharepoint";

export type SharePointSourceConfig = Readonly<{
  provider: "sharepoint";
  hostname: string;
  sitePath: string;
  driveId: string;
  documentRoot: string;
}>;

export type SharePointDocumentReference = Readonly<{
  provider: "sharepoint";
  driveId: string;
  itemId: string;
  title: string;
  webUrl: string;
  mimeType?: string;
  modifiedAt?: string;
}>;

export type ContractResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

const GRAPH_ID = /^[A-Za-z0-9!._-]{3,512}$/;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validGraphId(value: string) {
  return GRAPH_ID.test(value);
}

function normalizeSharePointHostname(value: string) {
  const hostname = value.toLowerCase();
  if (!hostname || hostname.includes("://") || hostname.includes("/") || hostname.includes("?") || hostname.includes("#")) {
    return null;
  }
  return hostname.endsWith(".sharepoint.com") ? hostname : null;
}

function normalizeSitePath(value: string) {
  if (!value || value.includes("?") || value.includes("#") || value.includes("..")) return null;
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  const normalized = withLeadingSlash.replace(/\/+$/g, "");
  return normalized.startsWith("/sites/") || normalized.startsWith("/teams/") ? normalized : null;
}

function normalizeDocumentRoot(value: string) {
  if (!value || value.startsWith("/") || value.includes("?") || value.includes("#")) return null;
  const segments = value.split("/").map((segment) => segment.trim());
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return null;
  return segments.join("/");
}

function normalizeSharePointWebUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.toLowerCase().endsWith(".sharepoint.com")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function parseSharePointSourceConfig(env: Record<string, string | undefined>): ContractResult<SharePointSourceConfig> {
  const hostname = normalizeSharePointHostname(clean(env.SHAREPOINT_SITE_HOSTNAME));
  const sitePath = normalizeSitePath(clean(env.SHAREPOINT_SITE_PATH));
  const driveId = clean(env.SHAREPOINT_DRIVE_ID);
  const documentRoot = normalizeDocumentRoot(clean(env.SHAREPOINT_DOCUMENT_ROOT));

  if (!hostname) return { ok: false, error: "SHAREPOINT_SITE_HOSTNAME debe ser un hostname *.sharepoint.com sin protocolo ni ruta." };
  if (!sitePath) return { ok: false, error: "SHAREPOINT_SITE_PATH debe ser una ruta /sites/... o /teams/... válida." };
  if (!validGraphId(driveId)) return { ok: false, error: "SHAREPOINT_DRIVE_ID falta o no tiene un formato Graph válido." };
  if (!documentRoot) return { ok: false, error: "SHAREPOINT_DOCUMENT_ROOT debe ser una ruta relativa válida dentro de la biblioteca." };

  return {
    ok: true,
    value: { provider: "sharepoint", hostname, sitePath, driveId, documentRoot },
  };
}

export function validateSharePointDocumentReference(input: unknown): ContractResult<SharePointDocumentReference> {
  if (!input || typeof input !== "object") return { ok: false, error: "La referencia documental debe ser un objeto." };
  const row = input as Record<string, unknown>;
  if (row.provider !== "sharepoint") return { ok: false, error: "Proveedor documental no soportado." };

  const driveId = clean(row.driveId);
  const itemId = clean(row.itemId);
  const title = clean(row.title);
  const webUrl = normalizeSharePointWebUrl(clean(row.webUrl));
  const mimeType = clean(row.mimeType);
  const modifiedAt = clean(row.modifiedAt);

  if (!validGraphId(driveId) || !validGraphId(itemId)) return { ok: false, error: "driveId/itemId no tienen un formato Graph válido." };
  if (!title || title.length > 300) return { ok: false, error: "El título documental es obligatorio y debe tener máximo 300 caracteres." };
  if (!webUrl) return { ok: false, error: "webUrl debe ser una URL HTTPS de SharePoint." };
  if (mimeType && mimeType.length > 200) return { ok: false, error: "mimeType excede la longitud permitida." };
  if (modifiedAt && Number.isNaN(Date.parse(modifiedAt))) return { ok: false, error: "modifiedAt debe ser una fecha válida." };

  return {
    ok: true,
    value: {
      provider: "sharepoint",
      driveId,
      itemId,
      title,
      webUrl,
      ...(mimeType ? { mimeType } : {}),
      ...(modifiedAt ? { modifiedAt: new Date(modifiedAt).toISOString() } : {}),
    },
  };
}

export function documentReferenceKey(reference: Pick<SharePointDocumentReference, "provider" | "driveId" | "itemId">) {
  if (reference.provider !== "sharepoint" || !validGraphId(reference.driveId) || !validGraphId(reference.itemId)) {
    throw new Error("No se puede construir una clave para una referencia documental inválida.");
  }
  return `${reference.provider}:${reference.driveId}:${reference.itemId}`;
}
