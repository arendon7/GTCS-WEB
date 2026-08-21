import { describe, expect, it, vi } from "vitest";
import { parseSharePointGraphRuntimeConfig } from "./graph-readonly";
import { SharePointPublicDownloadClient } from "./public-download";

const env = {
  SHAREPOINT_SITE_HOSTNAME: "contoso.sharepoint.com",
  SHAREPOINT_SITE_PATH: "/sites/Sanitized",
  SHAREPOINT_DRIVE_ID: "b!sanitizedDrive_123",
  SHAREPOINT_DOCUMENT_ROOT: "Shared Documents/Operations",
  SHAREPOINT_TENANT_ID: "11111111-1111-4111-8111-111111111111",
  SHAREPOINT_CLIENT_ID: "22222222-2222-4222-8222-222222222222",
  SHAREPOINT_CLIENT_SECRET: "sanitized-test-secret",
};

function runtimeConfig() {
  const parsed = parseSharePointGraphRuntimeConfig(env);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.value;
}

function tokenResponse() {
  return new Response(JSON.stringify({ access_token: "public-test-token", expires_in: 3600 }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("SharePoint public PDF download client", () => {
  it("downloads only a validated item from the configured drive and reuses the token", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes("login.microsoftonline.com")) return tokenResponse();
      return new Response(new Uint8Array([37, 80, 68, 70]), {
        status: 200,
        headers: { "content-type": "application/pdf", "content-length": "4" },
      });
    }) as unknown as typeof fetch;

    const client = new SharePointPublicDownloadClient(runtimeConfig(), fetchImpl);
    await client.fetchPdf("01SANITIZEDPUBLICPDF");
    await client.fetchPdf("01SANITIZEDPUBLICPDF");

    expect(calls.filter((call) => call.url.includes("login.microsoftonline.com"))).toHaveLength(1);
    const graphCalls = calls.filter((call) => call.url.includes("graph.microsoft.com"));
    expect(graphCalls).toHaveLength(2);
    expect(graphCalls[0].url).toBe("https://graph.microsoft.com/v1.0/drives/b!sanitizedDrive_123/items/01SANITIZEDPUBLICPDF/content");
    expect(graphCalls[0].init?.headers).toEqual(expect.objectContaining({ authorization: "Bearer public-test-token" }));
  });

  it("rejects malformed item IDs before requesting Microsoft identity", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const client = new SharePointPublicDownloadClient(runtimeConfig(), fetchImpl);
    await expect(client.fetchPdf("../secret")).rejects.toThrow(/itemId público/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails closed when the upstream item is not a PDF or is too large", async () => {
    const wrongTypeFetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("login.microsoftonline.com")) return tokenResponse();
      return new Response("not a pdf", { status: 200, headers: { "content-type": "text/plain" } });
    }) as unknown as typeof fetch;
    const wrongTypeClient = new SharePointPublicDownloadClient(runtimeConfig(), wrongTypeFetch);
    await expect(wrongTypeClient.fetchPdf("01SANITIZEDPUBLICPDF")).rejects.toThrow(/distinto de PDF/);

    const largeFetch = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("login.microsoftonline.com")) return tokenResponse();
      return new Response(new Uint8Array([37, 80, 68, 70]), {
        status: 200,
        headers: { "content-type": "application/pdf", "content-length": String(101 * 1024 * 1024) },
      });
    }) as unknown as typeof fetch;
    const largeClient = new SharePointPublicDownloadClient(runtimeConfig(), largeFetch);
    await expect(largeClient.fetchPdf("01SANITIZEDPUBLICPDF")).rejects.toThrow(/tamaño máximo/);
  });
});
