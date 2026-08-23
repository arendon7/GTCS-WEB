import { describe, expect, it } from "vitest";
import { getWondergreenCropDocument, wondergreenDocumentedCropSlugs } from "./wondergreen-crop-documents";

describe("Wondergreen crop documents", () => {
  it("keeps the five published crop programs attached to governed public PDF masters", () => {
    expect(wondergreenDocumentedCropSlugs).toEqual([
      "cafe",
      "cacao",
      "aguacate",
      "limon-tahiti",
      "pastos-gramineas",
    ]);

    for (const slug of wondergreenDocumentedCropSlugs) {
      const document = getWondergreenCropDocument(slug);
      expect(document).toBeDefined();
      expect(document?.delivery).toBe("public-download");
      expect(document?.openHref).toMatch(/^\/api\/public-resources\/wondergreen-guide-/);
      expect(document?.attachmentHref).toBe(`${document?.openHref}?download=1`);
      expect(document?.coverImage).toMatch(/^\/api\/public-media\//);
      expect(document?.masterLabel).toMatch(/20 páginas/);
      expect(document?.sourceAuthority).toContain("guía editorial publicada");
      expect(JSON.stringify(document)).not.toMatch(/sharepoint|graph\.microsoft|https?:\/\//i);
    }
  });

  it("fails closed when a crop has no published guide relationship", () => {
    expect(getWondergreenCropDocument("banano")).toBeUndefined();
  });
});
