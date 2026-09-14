import { describe, expect, it } from "vitest";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import { wondergreenReferences } from "@/data/wondergreen-public";

describe("Wondergreen crop programs", () => {
  it("keeps the five initial crop programs with unique slugs", () => {
    expect(wondergreenCrops).toHaveLength(5);
    expect(new Set(wondergreenCrops.map((crop) => crop.slug)).size).toBe(wondergreenCrops.length);
  });

  it("keeps pastures focused on soil, growth and balance rather than reproductive lines", () => {
    const pasture = wondergreenCrops.find((crop) => crop.slug === "pastos-gramineas");
    expect(pasture).toBeDefined();
    const lines = pasture!.stages.flatMap((stage) => stage.lines);
    expect(lines).not.toContain("2Bloom");
    expect(lines).not.toContain("2Fruit");
    expect(lines).toContain("Compost");
    expect(lines).toContain("2Grow");
    expect(lines).toContain("2Balance");
  });

  it("only references families that exist in the public product master", () => {
    const productFamilies = new Set(wondergreenReferences.map((reference) => reference.family));
    const cropFamilies = new Set(wondergreenCrops.flatMap((crop) => crop.stages.flatMap((stage) => stage.lines)));

    for (const family of cropFamilies) {
      expect(productFamilies.has(family), `Missing Product Master family: ${family}`).toBe(true);
    }
  });

  it("gives every crop a contextual warning and follow-up path", () => {
    for (const crop of wondergreenCrops) {
      expect(crop.context.length).toBeGreaterThan(40);
      expect(crop.cautions.length).toBeGreaterThanOrEqual(3);
      expect(crop.alerts.length).toBeGreaterThanOrEqual(3);
      expect(crop.followUp.length).toBeGreaterThanOrEqual(3);
    }
  });
});
