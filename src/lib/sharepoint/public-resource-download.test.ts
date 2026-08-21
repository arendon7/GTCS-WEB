import { describe, expect, it, vi } from "vitest";
import {
  downloadPublicWondergreenPdf,
  getPublicWondergreenMedia,
  getPublicWondergreenPdf,
  publicWondergreenMedia,
  publicWondergreenPdfs,
} from "./public-resource-download";

const env = {
  SHAREPOINT_SITE_HOSTNAME: "example.sharepoint.com",
  SHAREPOINT_SITE_PATH: "/sites/Greenatics",
  SHAREPOINT_DRIVE_ID: "drive-123",
  SHAREPOINT_DOCUMENT_ROOT: "Documentos compartidos",
  SHAREPOINT_TENANT_ID: "11111111-1111-4111-8111-111111111111",
  SHAREPOINT_CLIENT_ID: "22222222-2222-4222-8222-222222222222",
  SHAREPOINT_CLIENT_SECRET: "secret",
};

describe("public Wondergreen resource proxy", () => {
  it("exposes exactly the ten explicitly approved PDFs", () => {
    expect(publicWondergreenPdfs.map((item) => item.id)).toEqual([
      "wondergreen-product-master",
      "wondergreen-guide-cafe",
      "wondergreen-guide-cacao",
      "wondergreen-guide-aguacate",
      "wondergreen-guide-limon-tahiti",
      "wondergreen-guide-pastos",
      "home-garden-guide-casa-jardin",
      "home-garden-guide-mi-huerta",
      "home-garden-guide-etapas",
      "home-garden-guide-trasplante",
    ]);
    expect(getPublicWondergreenPdf("home-garden-guide-green-plants")).toBeNull();
    expect(getPublicWondergreenPdf("home-garden-guide-casa-jardin")?.filename).toBe("guia-casa-jardin.pdf");
  });

  it("registers the real Wondergreen visuals reused by Casa Jardin", () => {
    for (const assetId of [
      "wondergreen-system-stages",
      "wondergreen-2grow",
      "wondergreen-2balance",
      "wondergreen-2bloom",
      "wondergreen-2fruit",
      "wondergreen-bioinsumos",
    ]) {
      const asset = getPublicWondergreenMedia(assetId);
      expect(asset).not.toBeNull();
      expect(asset?.contentType).toBe("image/webp");
      expect(asset?.filename).toMatch(/\.webp$/);
    }

    expect(publicWondergreenMedia.map((item) => item.id)).toEqual(expect.arrayContaining([
      "wondergreen-system-stages",
      "wondergreen-2grow",
      "wondergreen-2balance",
      "wondergreen-2bloom",
      "wondergreen-2fruit",
      "wondergreen-bioinsumos",
    ]));
    expect(getPublicWondergreenMedia("unknown-home-garden-visual")).toBeNull();
  });

  it("returns null before auth for resources outside the PDF allowlist", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    await expect(downloadPublicWondergreenPdf("unknown", env, fetchImpl)).resolves.toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("downloads an approved PDF server-side without exposing SharePoint web URLs", async () => {
    const pdf = new Uint8Array([37, 80, 68, 70]);
    const fetchImpl = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token-123", expires_in: 3600 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }))
      .mockResolvedValueOnce(new Response(pdf, {
        status: 200,
        headers: { "content-type": "application/pdf", "content-length": String(pdf.byteLength), etag: "pdf-etag" },
      }));

    const result = await downloadPublicWondergreenPdf("wondergreen-guide-cafe", env, fetchImpl);
    expect(result?.asset.filename).toBe("guia-wondergreen-cafe.pdf");
    expect(result?.contentLength).toBe("4");
    expect(result?.etag).toBe("pdf-etag");

    const graphCall = String(fetchImpl.mock.calls[1]?.[0]);
    expect(graphCall).toContain("graph.microsoft.com/v1.0/drives/drive-123/items/");
    expect(graphCall).toContain("/content");
    expect(graphCall).not.toMatch(/sharepoint\.com/i);
  });

  it("fails closed when Graph cannot return the binary", async () => {
    const fetchImpl = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token-123", expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response("missing", { status: 404 }));

    await expect(downloadPublicWondergreenPdf("wondergreen-product-master", env, fetchImpl))
      .rejects.toThrow(/download failed with HTTP 404/i);
  });
});
