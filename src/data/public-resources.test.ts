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

  it("uses the navigable Product Master as the public catalog authority", () => {
    const catalog = publicResources.find((resource) => resource.id === "wondergreen-product-master");
    expect(catalog?.href).toBe("/wondergreen/productos");
    expect(catalog?.delivery).toBe("public-download-pending");
  });

  it("does not expose a fake downloadable asset before public hosting exists", () => {
    for (const resource of publicResources.filter((item) => item.delivery === "public-download-pending")) {
      expect(resource.href).not.toMatch(/\.pdf(?:$|\?)/i);
    }
  });
});
