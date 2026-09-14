import { describe, expect, it } from "vitest";
import { publicResources } from "./public-resources";
import {
  getWondergreenProductArtwork,
  getWondergreenProductDocuments,
  wondergreenProductAssetRegistry,
} from "./wondergreen-product-assets";
import { wondergreenReferences } from "./wondergreen-public";

const governedFamilies = ["2Grow", "2Balance", "2Bloom", "2Fruit"] as const;

describe("Wondergreen product asset registry", () => {
  it("binds approved line artwork only to governed product families", () => {
    for (const family of governedFamilies) {
      const reference = wondergreenReferences.find((item) => item.family === family);
      expect(reference, `missing reference for ${family}`).toBeTruthy();
      const artwork = getWondergreenProductArtwork(reference!);
      expect(artwork?.href).toMatch(/^\/api\/public-media\/wondergreen-/);
      expect(artwork?.scope).toBe("approved-line-artwork");
    }

    const compost = wondergreenReferences.find((item) => item.family === "Compost");
    expect(compost).toBeTruthy();
    expect(getWondergreenProductArtwork(compost!)).toBeNull();
  });

  it("links only existing public resources into product documentation", () => {
    const ids = new Set(publicResources.map((resource) => resource.id));
    expect(ids.has("wondergreen-product-master")).toBe(true);

    for (const reference of wondergreenReferences) {
      const docs = getWondergreenProductDocuments(reference);
      expect(docs.catalog?.id).toBe("wondergreen-product-master");
      expect(docs.technicalSheet.status).toBe("public-master-pending");
      for (const resource of [...docs.guides, ...docs.webResources]) {
        expect(ids.has(resource.id), `${reference.slug} points to unknown ${resource.id}`).toBe(true);
      }
    }
  });

  it("keeps crop guides tied to same-origin public downloads", () => {
    for (const resourceId of Object.values(wondergreenProductAssetRegistry.guideResourceByCropSlug)) {
      const resource = publicResources.find((item) => item.id === resourceId);
      expect(resource?.delivery).toBe("public-download");
      expect(resource?.downloadHref).toMatch(/^\/api\/public-resources\//);
    }
  });
});
