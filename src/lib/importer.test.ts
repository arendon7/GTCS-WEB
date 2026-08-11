import { describe, expect, it } from "vitest";
import { dryRunLegacyImport } from "./importer";
import { historicalQaFixture } from "./import-fixtures";

describe("historical importer", () => {
  it("produces deterministic contractual staging counts", () => {
    const run = dryRunLegacyImport(historicalQaFixture, "fixture-hash");
    expect(run.counts).toEqual({ totalRows: 12, valid: 3, warning: 3, quarantined: 4, duplicate: 2, activities: 3 });
  });

  it("groups worker participation into one canonical activity", () => {
    const run = dryRunLegacyImport(historicalQaFixture, "fixture-hash");
    const milling = run.activities.find((activity) => activity.activity === "Molienda" && activity.startedAt.startsWith("2026-06-13"));
    expect(milling?.workers.sort()).toEqual(["Alejandro", "Gabriel"]);
    expect(milling?.durationHours).toBe(3);
    expect(milling?.sourceRowIds).toHaveLength(2);
  });

  it("converts explicit tonnes to kg but keeps a warning trail", () => {
    const run = dryRunLegacyImport(historicalQaFixture, "fixture-hash");
    const receipt = run.receipts.find((row) => row.rowId === "R-001");
    expect(receipt?.netWeightKg).toBe(1840);
    expect(receipt?.status).toBe("warning");
    expect(run.issues.some((item) => item.rowId === "R-001" && item.code === "UNIT_CONVERTED_TON_TO_KG")).toBe(true);
  });

  it("quarantines excessive/zero durations, missing workers and non-positive mass", () => {
    const run = dryRunLegacyImport(historicalQaFixture, "fixture-hash");
    expect(run.logs.find((row) => row.rowId === "L-004")?.status).toBe("quarantined");
    expect(run.logs.find((row) => row.rowId === "L-005")?.status).toBe("quarantined");
    expect(run.logs.find((row) => row.rowId === "L-006")?.status).toBe("quarantined");
    expect(run.receipts.find((row) => row.rowId === "R-004")?.status).toBe("quarantined");
  });

  it("preserves original worker value while resolving known aliases", () => {
    const run = dryRunLegacyImport(historicalQaFixture, "fixture-hash");
    const row = run.logs.find((item) => item.rowId === "L-003");
    expect(row?.workerOriginal).toBe("Jonathan Valbin");
    expect(row?.workerCanonical).toBe("Jonathan Balbín");
    expect(run.issues.some((item) => item.rowId === "L-003" && item.code === "WORKER_ALIAS_RESOLVED")).toBe(true);
  });

  it("marks exact duplicate rows without promoting them into grouped activity", () => {
    const run = dryRunLegacyImport(historicalQaFixture, "fixture-hash");
    expect(run.logs.find((row) => row.rowId === "L-008")?.status).toBe("duplicate");
    const activity = run.activities.find((item) => item.activity === "Molienda" && item.startedAt.startsWith("2026-06-20"));
    expect(activity?.sourceRowIds).toEqual(["L-007"]);
  });
});
