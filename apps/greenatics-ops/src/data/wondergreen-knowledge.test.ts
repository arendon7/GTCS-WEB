import { describe, expect, it } from "vitest";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import { deficiencyCrops, deficiencyQuickRules } from "@/data/wondergreen-knowledge";

describe("Wondergreen deficiency knowledge", () => {
  it("keeps four diagnostic questions before product selection", () => {
    expect(deficiencyQuickRules).toHaveLength(4);
    expect(deficiencyQuickRules.map((rule) => rule.title)).toEqual([
      "Hojas viejas",
      "Hojas nuevas",
      "Patrón del lote",
      "Antes de corregir",
    ]);
  });

  it("covers the five initial crops", () => {
    expect(deficiencyCrops).toHaveLength(5);
    expect(new Set(deficiencyCrops.map((crop) => crop.slug)).size).toBe(5);
  });

  it("links every deficiency crop to an existing Wondergreen crop program", () => {
    const cropSlugs = new Set(wondergreenCrops.map((crop) => crop.slug));
    for (const crop of deficiencyCrops) {
      expect(cropSlugs.has(crop.cropSlug), `Missing crop program for ${crop.name}`).toBe(true);
    }
  });

  it("keeps interpretation context instead of symptom-only rows", () => {
    for (const crop of deficiencyCrops) {
      expect(crop.rows.length).toBeGreaterThanOrEqual(5);
      expect(crop.fieldNotes.length).toBeGreaterThanOrEqual(3);
      for (const row of crop.rows) {
        expect(row.interpretation.length).toBeGreaterThan(20);
      }
    }
  });
});
