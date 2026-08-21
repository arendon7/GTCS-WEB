import { describe, expect, it } from "vitest";
import { publicResourceHostingGate, publicResources } from "./public-resources";

describe("public knowledge resource registry", () => {
  it("keeps resource ids unique and every resource routable", () => {
    const ids = publicResources.map((resource) => resource.id);
    expect(ids).toHaveLength(new Set(ids).size);
    for (const resource of publicResources) {
      expect(resource.href).toMatch(/^\//);
      expect(resource.title.trim().length).toBeGreaterThan(0);
      expect(resource.sourceAuthority.trim().length).toBeGreaterThan(0);
    }
  });

  it("publishes the five crop masters already represented by public crop routes", () => {
    const cropMasters = publicResources.filter((resource) => resource.id.startsWith("wondergreen-guide-"));
    expect(cropMasters).toHaveLength(5);
    expect(cropMasters.map((resource) => resource.href).sort()).toEqual([
      "/wondergreen/cultivos/aguacate",
      "/wondergreen/cultivos/cacao",
      "/wondergreen/cultivos/cafe",
      "/wondergreen/cultivos/limon-tahiti",
      "/wondergreen/cultivos/pastos-gramineas",
    ]);
    for (const resource of cropMasters) {
      expect(resource.delivery).toBe("public-download");
      expect(resource.downloadHref).toBe(`/api/public-resources/${resource.id}`);
      expect(resource.coverImage).toMatch(/^\/api\/public-media\//);
      expect(resource.masterLabel?.trim().length).toBeGreaterThan(0);
      expect(resource.masterSource).toBe("internal-document-library");
    }
  });

  it("publishes the four governed Casa Jardin guide masters through same-origin downloads", () => {
    const homeGarden = publicResources.filter((resource) => resource.id.startsWith("home-garden-guide-"));
    expect(homeGarden).toHaveLength(4);
    expect(homeGarden.map((resource) => resource.href).sort()).toEqual([
      "/casa-jardin/guias#casa-jardin",
      "/casa-jardin/guias#etapas",
      "/casa-jardin/guias#mi-huerta",
      "/casa-jardin/guias#trasplante",
    ]);
    for (const resource of homeGarden) {
      expect(resource.delivery).toBe("public-download");
      expect(resource.downloadHref).toBe(`/api/public-resources/${resource.id}`);
      expect(resource.masterSource).toBe("internal-document-library");
      expect(resource.sourceAuthority).toMatch(/reconstruido 2026-08-21/i);
    }
  });

  it("publishes the catalog while retaining the navigable Product Master", () => {
    const catalog = publicResources.find((resource) => resource.id === "wondergreen-product-master");
    expect(catalog?.href).toBe("/wondergreen/productos");
    expect(catalog?.delivery).toBe("public-download");
    expect(catalog?.downloadHref).toBe("/api/public-resources/wondergreen-product-master");
    expect(catalog?.coverImage).toBe("/api/public-media/catalogo-cover");
    expect(catalog?.masterLabel).toMatch(/10 páginas/i);
    expect(catalog?.masterSource).toBe("internal-document-library");
  });

  it("enables only same-origin downloads while private source links remain forbidden", () => {
    expect(publicResourceHostingGate).toMatchObject({
      privateSourceLinksAllowed: false,
      publicDownloadEnabled: true,
      requiredPublicHost: "same-origin-server-proxy",
    });

    const serialized = JSON.stringify(publicResources);
    expect(serialized).not.toMatch(/sharepoint|graph\.microsoft/i);

    const downloadable = publicResources.filter((item) => item.delivery === "public-download");
    expect(downloadable).toHaveLength(10);
    for (const resource of downloadable) {
      expect(resource.downloadHref).toMatch(/^\/api\/public-resources\//);
      expect(resource.downloadHref).not.toMatch(/sharepoint|graph\.microsoft/i);
      expect(resource.masterSource).toBe("internal-document-library");
    }
  });
});
