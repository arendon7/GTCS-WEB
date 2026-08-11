import { describe, expect, it } from "vitest";
import { dryRunLegacyImport } from "./importer";
import { historicalQaFixture } from "./import-fixtures";
import { buildCanonicalPromotion } from "./import-promotion";

describe("canonical historical promotion", () => {
  it("promotes only valid/warning receipts and grouped activities", () => {
    const run = dryRunLegacyImport(historicalQaFixture, "fixture-hash");
    const promotion = buildCanonicalPromotion(run);
    expect(promotion.errors).toEqual([]);
    expect(promotion.activities).toHaveLength(3);
    expect(promotion.receptions).toHaveLength(2);
    expect(promotion.receptions.every((row) => row.acceptance === "unknown")).toBe(true);
    expect(promotion.activities.every((row) => row.source === "historical")).toBe(true);
  });

  it("creates stable historical worker masters by plant and name", () => {
    const run = dryRunLegacyImport(historicalQaFixture, "fixture-hash");
    const promotion = buildCanonicalPromotion(run);
    expect(promotion.workers.some((worker) => worker.id === "hist-worker-yarumal-alejandro" && worker.historical)).toBe(true);
    expect(promotion.workers.some((worker) => worker.id === "hist-worker-yarumal-gabriel" && worker.historical)).toBe(true);
    expect(promotion.workers.some((worker) => worker.name === "Jonathan Balbín")).toBe(true);
  });

  it("uses deterministic ids and provenance for idempotent merge", () => {
    const run = dryRunLegacyImport(historicalQaFixture, "fixture-hash");
    const first = buildCanonicalPromotion(run);
    const second = buildCanonicalPromotion(run);
    expect(second.activities.map((item) => item.id)).toEqual(first.activities.map((item) => item.id));
    expect(second.receptions.map((item) => item.id)).toEqual(first.receptions.map((item) => item.id));
    expect(first.activities[0].provenance?.importRunId).toBe(run.id);
    expect(first.receptions[0].lotCode).toMatch(/^HIST-/);
  });
});
