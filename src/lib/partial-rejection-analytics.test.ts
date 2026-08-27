import { describe, expect, it } from "vitest";
import type { ReceptionRecord } from "./domain";
import { buildOperationalAnalytics } from "./analytics";

function reception(id: string, plantId: string, plant: string, acceptance: ReceptionRecord["acceptance"], rejectionKg: number): ReceptionRecord {
  return {
    id,
    plantId,
    plant,
    generator: `Generador ${id}`,
    route: `Ruta ${id}`,
    wasteType: "FORSU",
    netWeightKg: 1000,
    rejectionKg,
    rejectionKnown: true,
    acceptance,
    startedAt: "2026-08-11T08:00:00-05:00",
    endedAt: "2026-08-11T08:20:00-05:00",
    lotCode: `LOT-${id}`,
    source: "local",
  };
}

function analytics(receptions: ReceptionRecord[], plantId = "all") {
  return buildOperationalAnalytics({
    activities: [],
    receptions,
    incidents: [],
    tickets: [],
    equipment: [],
    piles: [],
    measurements: [],
    workers: [],
    preset: "day",
    anchorKey: "2026-08-11",
    plantId,
    nowIso: "2026-08-11T16:00:00-05:00",
  });
}

describe("partial rejection exception semantics", () => {
  it("counts partial rejection as non-conformity and plant attention", () => {
    const partial = reception("partial", "tamesis", "Támesis", "partial_rejection", 120);
    const accepted = reception("accepted", "tamesis", "Támesis", "accepted", 0);
    const result = analytics([partial, accepted]);

    expect(result.nonConformingReceipts).toBe(1);
    expect(result.exceptionsCount).toBe(1);
    expect(result.plantComparison.find((row) => row.plantId === "tamesis")?.attention).toBe(1);
    expect(result.rejectionKg).toBe(120);
    expect(result.rejectionPct).toBe(6);
  });

  it("keeps unknown acceptance outside exceptions and inside data-quality", () => {
    const unknown = reception("unknown", "yarumal", "Yarumal", "unknown", 0);
    const result = analytics([unknown]);

    expect(result.nonConformingReceipts).toBe(0);
    expect(result.exceptionsCount).toBe(0);
    expect(result.plantComparison.find((row) => row.plantId === "yarumal")?.attention).toBe(0);
    expect(result.dataQualityAlerts.find((alert) => alert.id === "acceptance-unknown")?.count).toBe(1);
  });

  it("preserves plant filtering for partial rejection", () => {
    const partial = reception("partial", "tamesis", "Támesis", "partial_rejection", 80);
    const result = analytics([partial], "yarumal");

    expect(result.nonConformingReceipts).toBe(0);
    expect(result.exceptionsCount).toBe(0);
    expect(result.receivedKg).toBe(0);
  });
});
