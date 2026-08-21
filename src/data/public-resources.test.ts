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

  it("registers the five governed crop masters with public same-origin PDF downloads", () => {
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
      expect(resource.delivery).toBe("web-native-public-download");
      expect(resource.downloadHref).toMatch(/^\/descargas\//);
      expect(resource.masterLabel?.trim().length).toBeGreaterThan(0);
      expect(resource.masterSource).toBe("internal-document-library");
    }
  });

  it("integrates the four governed Casa Jardin guide masters into the central library", () => {
    const homeGarden = publicResources.filter((resource) => resource.id.startsWith("home-garden-guide-"));
    expect(homeGarden).toHaveLength(4);
    expect(homeGarden.map((resource) => resource.href).sort()).toEqual([
      "/casa-jardin/guias#casa-jardin",
      "/casa-jardin/guias#etapas",
      "/casa-jardin/guias#mi-huerta",
      "/casa-jardin/guias#trasplante",
    ]);
    for (const resource of homeGarden) {
      expect(resource.delivery).toBe("web-native-master-pending");
      expect(resource.downloadHref).toBeUndefined();
      expect(resource.masterSource).toBe("validated-handoff");
    }
  });

  it("keeps the navigable Product Master and publishes its catalog PDF", () => {
    const catalog = publicResources.find((resource) => resource.id === "wondergreen-product-master");
    expect(catalog?.href).toBe("/wondergreen/productos");
    expect(catalog?.delivery).toBe("web-native-public-download");
    expect(catalog?.downloadHref).toBe("/descargas/catalogo-wondergreen");
    expect(catalog?.masterLabel).toMatch(/10 páginas/i);
    expect(catalog?.masterSource).toBe("internal-document-library");
  });

  it("publishes only same-origin routes and never exposes private SharePoint or Graph URLs", () => {
    expect(publicResourceHostingGate).toMatchObject({
      privateSourceLinksAllowed: false,
      publicDownloadEnabled: true,
      requiredPublicHost: "same-origin-or-approved-public-cdn",
    });

    const serialized = JSON.stringify(publicResources);
    expect(serialized).not.toMatch(/sharepoint|graph\.microsoft/i);

    for (const resource of publicResources) {
      expect(resource.href).not.toMatch(/sharepoint|graph\.microsoft/i);
      if (resource.downloadHref) {
        expect(resource.downloadHref).toMatch(/^\/descargas\//);
        expect(resource.downloadHref).not.toMatch(/sharepoint|graph\.microsoft/i);
      }
    }
  });
});
