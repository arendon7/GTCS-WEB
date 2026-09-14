import { describe, expect, it } from "vitest";
import {
  getHomeGardenDocumentsForKit,
  getHomeGardenDocumentsForStage,
  getRelatedHomeGardenKitsForStage,
  homeGardenPublicDocuments,
  publicDocumentDownloadHref,
  publicDocumentHref,
} from "./home-garden-public-documents";

describe("homeGardenPublicDocuments", () => {
  it("keeps the four verified public guide endpoints same-origin", () => {
    expect(homeGardenPublicDocuments).toHaveLength(4);
    for (const document of homeGardenPublicDocuments) {
      expect(publicDocumentHref(document)).toBe(`/api/public-resources/${document.resourceId}`);
      expect(publicDocumentDownloadHref(document)).toBe(`/api/public-resources/${document.resourceId}?download=1`);
      expect(publicDocumentHref(document)).not.toMatch(/^https?:/);
      expect(document.status).toBe("public-verified-reconstruction");
    }
  });

  it("links CRECE to governed guides and only visible kits that contain the stage", () => {
    expect(getHomeGardenDocumentsForStage("crece").map((document) => document.id)).toEqual([
      "casa-jardin",
      "mi-huerta",
      "etapas",
      "trasplante",
    ]);
    expect(getRelatedHomeGardenKitsForStage("crece").map((kit) => kit.id)).toEqual([
      "plantas-verdes",
      "mi-huerta",
      "casa-completa",
      "casa-completa-xl",
    ]);
    expect(getRelatedHomeGardenKitsForStage("crece").some((kit) => kit.id === "trasplanta-arranca")).toBe(false);
  });

  it("gives Mi Huerta its specific guide without making every kit inherit it", () => {
    expect(getHomeGardenDocumentsForKit("mi-huerta").map((document) => document.id)).toEqual([
      "casa-jardin",
      "mi-huerta",
      "etapas",
    ]);
    expect(getHomeGardenDocumentsForKit("plantas-verdes").map((document) => document.id)).toEqual([
      "casa-jardin",
      "etapas",
    ]);
  });
});
