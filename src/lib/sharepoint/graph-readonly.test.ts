import { describe, expect, it, vi } from "vitest";
import {
  SharePointGraphReadonlyClient,
  encodeSharePointGraphPath,
  parseSharePointGraphAuthConfig,
  parseSharePointGraphRuntimeConfig,
} from "./graph-readonly";

const env = {
  SHAREPOINT_SITE_HOSTNAME: "contoso.sharepoint.com",
  SHAREPOINT_SITE_PATH: "/sites/Sanitized",
  SHAREPOINT_DRIVE_ID: "b!sanitizedDrive_123",
  SHAREPOINT_DOCUMENT_ROOT: "Shared Documents/Operations",
  SHAREPOINT_TENANT_ID: "11111111-1111-4111-8111-111111111111",
  SHAREPOINT_CLIENT_ID: "22222222-2222-4222-8222-222222222222",
  SHAREPOINT_CLIENT_SECRET: "sanitized-test-secret",
};

function tokenResponse(token = "test-access-token", expiresIn = 3600) {
  return new Response(JSON.stringify({ access_token: token, token_type: "Bearer", expires_in: expiresIn }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function graphResponse(value: unknown[], nextLink?: string) {
  return new Response(JSON.stringify({ value, ...(nextLink ? { "@odata.nextLink": nextLink } : {}) }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function fileItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "01SANITIZEDFILE123",
    name: "Control de calidad.xlsx",
    webUrl: "https://contoso.sharepoint.com/sites/Sanitized/Shared%20Documents/Operations/Control%20de%20calidad.xlsx",
    lastModifiedDateTime: "2026-08-01T14:30:00Z",
    file: { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    ...overrides,
  };
}

function runtimeConfig() {
  const parsed = parseSharePointGraphRuntimeConfig(env);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.value;
}

describe("SharePoint Graph read-only adapter", () => {
  it("requires sanitized server-only auth identifiers and a secret", () => {
    const parsed = parseSharePointGraphAuthConfig(env);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.tenantId).toBe(env.SHAREPOINT_TENANT_ID);
    expect(parsed.value.clientId).toBe(env.SHAREPOINT_CLIENT_ID);
    expect(parsed.value.clientSecret).toBe(env.SHAREPOINT_CLIENT_SECRET);

    expect(parseSharePointGraphAuthConfig({ ...env, SHAREPOINT_TENANT_ID: "organizations" }).ok).toBe(false);
    expect(parseSharePointGraphAuthConfig({ ...env, SHAREPOINT_CLIENT_SECRET: "" }).ok).toBe(false);
  });

  it("encodes every Graph path segment and blocks traversal", () => {
    expect(encodeSharePointGraphPath("Shared Documents/Operación", "Calidad/Lote #1"))
      .toBe("Shared%20Documents/Operaci%C3%B3n/Calidad/Lote%20%231");
    expect(() => encodeSharePointGraphPath("Shared Documents/Operations", "../Finance"))
      .toThrow(/navegación relativa/);
    expect(() => encodeSharePointGraphPath("Shared Documents/Operations", "/Finance"))
      .toThrow(/no es válida/);
  });

  it("uses client credentials with Graph .default and maps only file driveItems", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes("login.microsoftonline.com")) return tokenResponse();
      return graphResponse([
        fileItem(),
        {
          id: "01SANITIZEDFOLDER123",
          name: "Subcarpeta",
          webUrl: "https://contoso.sharepoint.com/sites/Sanitized/Shared%20Documents/Operations/Subcarpeta",
          folder: { childCount: 2 },
        },
      ]);
    }) as unknown as typeof fetch;

    const client = new SharePointGraphReadonlyClient(runtimeConfig(), fetchImpl);
    const documents = await client.listDocuments("Calidad");

    expect(documents).toHaveLength(1);
    expect(documents[0]).toEqual({
      provider: "sharepoint",
      driveId: env.SHAREPOINT_DRIVE_ID,
      itemId: "01SANITIZEDFILE123",
      title: "Control de calidad.xlsx",
      webUrl: "https://contoso.sharepoint.com/sites/Sanitized/Shared%20Documents/Operations/Control%20de%20calidad.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      modifiedAt: "2026-08-01T14:30:00.000Z",
    });

    const tokenCall = calls[0];
    expect(tokenCall.url).toContain(`/11111111-1111-4111-8111-111111111111/oauth2/v2.0/token`);
    const body = tokenCall.init?.body as URLSearchParams;
    expect(body.get("grant_type")).toBe("client_credentials");
    expect(body.get("scope")).toBe("https://graph.microsoft.com/.default");
    expect(body.get("client_id")).toBe(env.SHAREPOINT_CLIENT_ID);
    expect(body.get("client_secret")).toBe(env.SHAREPOINT_CLIENT_SECRET);

    const graphCall = calls[1];
    expect(graphCall.url).toContain("/v1.0/drives/b!sanitizedDrive_123/root:/Shared%20Documents/Operations/Calidad:/children");
    expect(graphCall.init?.headers).toEqual(expect.objectContaining({ authorization: "Bearer test-access-token" }));
  });

  it("reuses the access token and document cache before their expirations", async () => {
    let now = 1_000_000;
    let tokenRequests = 0;
    let graphRequests = 0;
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("login.microsoftonline.com")) {
        tokenRequests += 1;
        return tokenResponse(`token-${tokenRequests}`, 120);
      }
      graphRequests += 1;
      return graphResponse([fileItem({ id: `01SANITIZEDFILE${graphRequests}` })]);
    }) as unknown as typeof fetch;

    const client = new SharePointGraphReadonlyClient(runtimeConfig(), fetchImpl, () => now, 30_000);
    await client.listDocuments("Calidad");
    await client.listDocuments("Calidad");
    await client.listDocuments("Procesos");

    expect(tokenRequests).toBe(1);
    expect(graphRequests).toBe(2);

    now += 121_000;
    await client.listDocuments("Calidad", { forceRefresh: true });
    expect(tokenRequests).toBe(2);
    expect(graphRequests).toBe(3);
  });

  it("follows only same-drive Graph pagination links and caps untrusted redirects", async () => {
    const safeNext = "https://graph.microsoft.com/v1.0/drives/b!sanitizedDrive_123/root:/Shared%20Documents/Operations:/children?$skiptoken=safe";
    let graphPage = 0;
    const safeFetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("login.microsoftonline.com")) return tokenResponse();
      graphPage += 1;
      return graphPage === 1
        ? graphResponse([fileItem({ id: "01SANITIZEDPAGE1" })], safeNext)
        : graphResponse([fileItem({ id: "01SANITIZEDPAGE2", name: "Segundo.pdf", file: { mimeType: "application/pdf" } })]);
    }) as unknown as typeof fetch;

    const client = new SharePointGraphReadonlyClient(runtimeConfig(), safeFetch);
    const documents = await client.listDocuments();
    expect(documents.map((document) => document.itemId)).toEqual(["01SANITIZEDPAGE1", "01SANITIZEDPAGE2"]);

    const evilFetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("login.microsoftonline.com")) return tokenResponse();
      return graphResponse([fileItem()], "https://evil.example/v1.0/drives/b!sanitizedDrive_123/items?page=2");
    }) as unknown as typeof fetch;

    const evilClient = new SharePointGraphReadonlyClient(runtimeConfig(), evilFetch);
    await expect(evilClient.listDocuments()).rejects.toThrow(/fuera del recurso autorizado/);
  });

  it("fails closed on malformed file references instead of exposing partial Graph data", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("login.microsoftonline.com")) return tokenResponse();
      return graphResponse([fileItem({ webUrl: "https://evil.example/document.xlsx" })]);
    }) as unknown as typeof fetch;

    const client = new SharePointGraphReadonlyClient(runtimeConfig(), fetchImpl);
    await expect(client.listDocuments()).rejects.toThrow(/referencia documental inválida/);
  });
});
