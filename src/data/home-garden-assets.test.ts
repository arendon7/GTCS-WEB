import { describe, expect, it } from "vitest";
import { blockedHomeGardenAssets, homeGardenAssets, publishableHomeGardenAssets } from "./home-garden-assets";

describe("Casa and Garden handoff asset governance", () => {
  it("blocks the conflicting hero, transplant kit and unfinished QR card", () => {
    expect(blockedHomeGardenAssets.map((asset) => asset.id)).toEqual([
      "hero-source",
      "kit-transplant-source",
      "kit-card-qr",
    ]);
  });

  it("keeps five packshots and five kit concepts as prelaunch candidates only", () => {
    expect(homeGardenAssets.filter((asset) => asset.kind === "packshot" && asset.status === "candidate-web")).toHaveLength(5);
    expect(homeGardenAssets.filter((asset) => asset.kind === "kit" && asset.status === "candidate-web")).toHaveLength(5);
    for (const asset of publishableHomeGardenAssets.filter((item) => item.kind === "packshot" || item.kind === "kit")) {
      expect(asset.guardrail).toMatch(/prelaunch|pre-lanzamiento|reconciled|reconciliado|price|precio/i);
    }
  });

  it("keeps four validated source guides without treating image text as Product Truth", () => {
    const guides = homeGardenAssets.filter((asset) => asset.kind === "pdf" && asset.status === "source-guide");
    expect(guides).toHaveLength(4);
    for (const guide of guides) expect(guide.guardrail).toMatch(/Product Truth override/i);
  });
});
