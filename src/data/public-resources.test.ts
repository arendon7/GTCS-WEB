import { describe, expect, it } from "vitest";
import { publicResources } from "./public-resources";

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
    }
  });

  it("uses the navigable Product Master as the public catalog authority while its PDF master awaits public hosting", () => {
    const catalog = publicResources.find((resource) => resource.id === "wondergreen-product-master");
    expect(catalog?.href).toBe("/wondergreen/productos");
    expect(catalog?.delivery).toBe("web-native-master-pending");
    expect(catalog?.masterLabel).toMatch(/10 páginas/i);
  });

  it("does not expose a private or fake downloadable asset before public hosting exists", () => {
    for (const resource of publicResources.filter((item) => item.delivery !== "web-native")) {
      expect(resource.href).not.toMatch(/\.pdf(?:$|\?)/i);
      expect(resource.href).not.toMatch(/sharepoint|graph\.microsoft/i);
    }
  });
});
