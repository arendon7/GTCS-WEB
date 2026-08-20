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

  it("registers the five governed crop masters already represented by public crop routes", () => {
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
      expect(resource.delivery).toBe("web-native-master-pending");
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
      expect(resource.masterSource).toBe("validated-handoff");
    }
  });

  it("uses the navigable Product Master as the public catalog authority while its PDF master awaits public hosting", () => {
    const catalog = publicResources.find((resource) => resource.id === "wondergreen-product-master");
    expect(catalog?.href).toBe("/wondergreen/productos");
    expect(catalog?.delivery).toBe("web-native-master-pending");
    expect(catalog?.masterLabel).toMatch(/10 páginas/i);
    expect(catalog?.masterSource).toBe("internal-document-library");
  });

  it("does not expose a private or fake downloadable asset before public hosting exists", () => {
    expect(publicResourceHostingGate).toMatchObject({
      privateSourceLinksAllowed: false,
      publicDownloadEnabled: false,
    });

    const serialized = JSON.stringify(publicResources);
    expect(serialized).not.toMatch(/sharepoint|graph\.microsoft/i);

    for (const resource of publicResources.filter((item) => item.delivery !== "web-native")) {
      expect(resource.href).not.toMatch(/\.pdf(?:$|\?)/i);
      expect(resource.href).not.toMatch(/sharepoint|graph\.microsoft/i);
      expect(resource.masterSource).toBeDefined();
    }
  });
});
