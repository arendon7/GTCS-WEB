import { describe, expect, it } from "vitest";
import { getProjectMedia, publicMediaAssets } from "./public-media";

describe("public media registry", () => {
  it("keeps media identities and paths unique", () => {
    const ids = publicMediaAssets.map((asset) => asset.id);
    const paths = publicMediaAssets.map((asset) => asset.src);
    expect(ids).toHaveLength(new Set(ids).size);
    expect(paths).toHaveLength(new Set(paths).size);
  });

  it("publishes only governed local brand and project assets", () => {
    for (const asset of publicMediaAssets) {
      expect(asset.status).toBe("approved-public");
      expect(asset.src).toMatch(/^\/(brand|projects)\//);
      expect(asset.alt.trim().length).toBeGreaterThan(0);
      expect(asset.source.trim().length).toBeGreaterThan(0);
    }
  });

  it("does not declare product packshots before an approved master exists", () => {
    expect(publicMediaAssets.some((asset) => /packshot|producto|product/i.test(`${asset.id} ${asset.src}`))).toBe(false);
  });

  it("exposes real project evidence only where registered", () => {
    expect(getProjectMedia("yarumal")).toHaveLength(2);
    expect(getProjectMedia("tamesis")).toHaveLength(0);
  });
});
