import { describe, expect, it, vi } from "vitest";
import {
  SharePointGraphReadonlyClient,
  normalizeSharePointRelativeFolder,
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

function runtimeConfig() {
  const parsed = parseSharePointGraphRuntimeConfig(env);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.value;
}

function tokenResponse() {
  return new Response(JSON.stringify({ access_token: "directory-token", expires_in: 3600 }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function graphResponse(value: unknown[]) {
  return new Response(JSON.stringify({ value }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("SharePoint directory navigation", () => {
  it("normalizes only confined relative folders", () => {
    expect(normalizeSharePointRelativeFolder("Calidad/Lote #1")).toBe("Calidad/Lote #1");
    expect(normalizeSharePointRelativeFolder("")).toBe("");
    expect(() => normalizeSharePointRelativeFolder("../Finanzas")).toThrow(/navegación relativa/);
    expect(() => normalizeSharePointRelativeFolder("/Finanzas")).toThrow(/no es válida/);
    expect(() => normalizeSharePointRelativeFolder("Finanzas\\2026")).toThrow(/no es válida/);
  });

  it("returns direct folders and documents without recursive reads", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      calls.push(url);
      if (url.includes("login.microsoftonline.com")) return tokenResponse();
      return graphResponse([
        {
          id: "01SANITIZEDFOLDER123",
          name: "Lote #1",
          folder: { childCount: 4 },
        },
        {
          id: "01SANITIZEDFILE123",
          name: "Control.xlsx",
          webUrl: "https://contoso.sharepoint.com/sites/Sanitized/Shared%20Documents/Operations/Calidad/Control.xlsx",
          lastModifiedDateTime: "2026-08-01T14:30:00Z",
          file: { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        },
      ]);
    }) as unknown as typeof fetch;

    const client = new SharePointGraphReadonlyClient(runtimeConfig(), fetchImpl);
    const listing = await client.listDirectory("Calidad");

    expect(listing.relativeFolder).toBe("Calidad");
    expect(listing.folders).toEqual([{ title: "Lote #1", relativePath: "Calidad/Lote #1", childCount: 4 }]);
    expect(listing.documents).toHaveLength(1);
    expect(calls).toHaveLength(2);
    expect(calls[1]).toContain("/root:/Shared%20Documents/Operations/Calidad:/children");
    expect(calls.some((url) => url.includes("Lote%20%231:/children"))).toBe(false);
  });

  it("fails closed when Graph returns a non-navigable folder name", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("login.microsoftonline.com")) return tokenResponse();
      return graphResponse([{ id: "01SANITIZEDFOLDER123", name: "../Finance", folder: { childCount: 1 } }]);
    }) as unknown as typeof fetch;

    const client = new SharePointGraphReadonlyClient(runtimeConfig(), fetchImpl);
    await expect(client.listDirectory()).rejects.toThrow(/nombre no navegable/);
  });
});
