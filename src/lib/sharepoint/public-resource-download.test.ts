import { describe, expect, it } from "vitest";
import {
  getPublicWondergreenMedia,
  getPublicWondergreenPdf,
  publicWondergreenMedia,
  publicWondergreenPdfs,
} from "./public-resource-download";

function expectPublicAnonymousDownload(url: string, expectedKind: ":b:" | ":u:") {
  const parsed = new URL(url);
  expect(parsed.protocol).toBe("https:");
  expect(parsed.hostname).toBe("grupopineal-my.sharepoint.com");
  expect(parsed.pathname).toContain(`/${expectedKind}/g/personal/arendon_greenatics_com_co/`);
  expect(parsed.searchParams.get("download")).toBe("1");
  expect(url).not.toMatch(/graph\.microsoft|client_secret|tenant_id|itemId=/i);
}

describe("public Wondergreen anonymous resource registry", () => {
  it("exposes exactly the ten explicitly approved PDFs through anonymous direct downloads", () => {
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

    for (const resource of publicWondergreenPdfs) {
      expect(resource.contentType).toBe("application/pdf");
      expect(resource.filename).toMatch(/\.pdf$/);
      expectPublicAnonymousDownload(resource.downloadUrl, ":b:");
    }

    expect(getPublicWondergreenPdf("home-garden-guide-green-plants")).toBeNull();
    expect(getPublicWondergreenPdf("home-garden-guide-casa-jardin")?.filename).toBe("guia-casa-jardin.pdf");
  });

  it("exposes all 16 real Wondergreen visuals through anonymous direct downloads", () => {
    const expectedAssets = [
      "catalogo-cover",
      "guia-cafe-cover",
      "guia-cacao-cover",
      "guia-aguacate-cover",
      "guia-citricos-cover",
      "guia-pastos-cover",
      "home-garden-casa-jardin-cover",
      "home-garden-mi-huerta-cover",
      "home-garden-etapas-cover",
      "home-garden-trasplante-cover",
      "wondergreen-system-stages",
      "wondergreen-2grow",
      "wondergreen-2balance",
      "wondergreen-2bloom",
      "wondergreen-2fruit",
      "wondergreen-bioinsumos",
    ];

    expect(publicWondergreenMedia.map((item) => item.id)).toEqual(expectedAssets);
    for (const asset of publicWondergreenMedia) {
      expect(asset.contentType).toBe("image/webp");
      expect(asset.filename).toMatch(/\.webp$/);
      expectPublicAnonymousDownload(asset.downloadUrl, ":u:");
    }
    expect(getPublicWondergreenMedia("unknown-home-garden-visual")).toBeNull();
  });

  it("contains no runtime Graph credential contract in the public resource registry", () => {
    const serialized = JSON.stringify({ publicWondergreenPdfs, publicWondergreenMedia });
    expect(serialized).not.toMatch(/graph\.microsoft\.com/i);
    expect(serialized).not.toMatch(/SHAREPOINT_(TENANT|CLIENT|DRIVE|SITE|DOCUMENT)/i);
    expect(serialized).not.toMatch(/itemId/i);
  });
});
