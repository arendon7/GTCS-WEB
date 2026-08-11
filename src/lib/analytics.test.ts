import { describe, expect, it } from "vitest";
import type { ActivityRecord, ReceptionRecord, Worker } from "./domain";
import type { EquipmentRecord, MaintenanceTicket } from "./maintenance-domain";
import type { CompostPile } from "./compost-domain";
import { buildOperationalAnalytics, overlapMinutes, resolveDashboardPeriod } from "./analytics";

const workers: Worker[] = [{ id: "w1", name: "Ana", plantId: "tamesis" }, { id: "w2", name: "Luis", plantId: "tamesis" }];
const activities: ActivityRecord[] = [
  { id: "a1", plantId: "tamesis", plant: "Támesis", title: "Molienda", process: "Pretratamiento", plannedStart: "2026-08-11T08:00:00-05:00", actualStart: "2026-08-11T08:00:00-05:00", actualEnd: "2026-08-11T10:00:00-05:00", workerIds: ["w1","w2"], status: "done", source: "scheduled" },
  { id: "a2", plantId: "tamesis", plant: "Támesis", title: "Aseo", process: "Aseo", plannedStart: "2026-08-11T11:00:00-05:00", workerIds: [], status: "delayed", source: "scheduled" },
];
const receptions: ReceptionRecord[] = [
  { id: "r1", plantId: "tamesis", plant: "Támesis", generator: "G1", route: "R1", wasteType: "FORSU", netWeightKg: 1000, rejectionKg: 50, acceptance: "accepted", startedAt: "2026-08-11T07:00:00-05:00", endedAt: "2026-08-11T07:20:00-05:00", lotCode: "L1", source: "demo" },
  { id: "r2", plantId: "tamesis", plant: "Támesis", generator: "G2", route: "R2", wasteType: "FORSU", netWeightKg: 500, rejectionKg: 100, acceptance: "conditioned", startedAt: "2026-08-11T12:00:00-05:00", endedAt: "2026-08-11T12:20:00-05:00", lotCode: "L2", source: "demo" },
];
const equipment: EquipmentRecord[] = [{ id: "e1", plantId: "tamesis", plant: "Támesis", code: "M-01", name: "Molino", area: "Pretratamiento", status: "stopped" }];
const tickets: MaintenanceTicket[] = [{ id: "m1", equipmentId: "e1", plantId: "tamesis", plant: "Támesis", severity: "high", title: "Falla", description: "Falla QA", openedAt: "2026-08-11T09:30:00-05:00", closedAt: "2026-08-11T10:30:00-05:00", repairStartedAt: "2026-08-11T09:45:00-05:00", status: "closed" }];
const piles: CompostPile[] = [{ id: "p1", plantId: "tamesis", plant: "Támesis", code: "P1", location: "A", sourceReceiptIds: ["r1"], initialWeightKg: 900, startedAt: "2026-08-10T08:00:00-05:00", maturationStartedAt: "2026-08-11T10:00:00-05:00", closedAt: "2026-08-11T15:00:00-05:00", finalWeightKg: 360, status: "closed" }];

describe("dashboard analytics", () => {
  it("clips downtime to the selected period", () => {
    const period = resolveDashboardPeriod("day", "2026-08-11");
    expect(overlapMinutes("2026-08-10T23:30:00-05:00", "2026-08-11T00:30:00-05:00", period, "2026-08-11T12:00:00-05:00")).toBe(30);
  });

  it("derives weighted reception, labor, plan, downtime and compost metrics", () => {
    const result = buildOperationalAnalytics({ activities, receptions, incidents: [], tickets, equipment, piles, measurements: [], workers, preset: "day", anchorKey: "2026-08-11", plantId: "all", nowIso: "2026-08-11T16:00:00-05:00" });
    expect(result.receivedKg).toBe(1500);
    expect(result.rejectionPct).toBeCloseTo(10, 5);
    expect(result.rejectionCoveragePct).toBe(100);
    expect(result.laborHours).toBe(4);
    expect(result.scheduledCount).toBe(2);
    expect(result.executedScheduledCount).toBe(1);
    expect(result.compliancePct).toBe(50);
    expect(result.downtimeMinutes).toBe(60);
    expect(result.closedPilesInPeriod).toBe(1);
    expect(result.averageClosedYieldPct).toBe(40);
    expect(result.exceptionsCount).toBe(2);
  });

  it("does not turn unknown historical acceptance into a non-conformity", () => {
    const historical: ReceptionRecord = { id: "rh", plantId: "tamesis", plant: "Támesis", generator: "Histórico", route: "Histórica", wasteType: "FORSU", netWeightKg: 700, rejectionKg: 20, acceptance: "unknown", startedAt: "2026-08-11T13:00:00-05:00", endedAt: "2026-08-11T13:00:00-05:00", lotCode: "HIST-1", source: "historical" };
    const result = buildOperationalAnalytics({ activities: [], receptions: [historical], incidents: [], tickets: [], equipment: [], piles: [], measurements: [], workers: [], preset: "day", anchorKey: "2026-08-11", plantId: "all", nowIso: "2026-08-11T16:00:00-05:00" });
    expect(result.receivedKg).toBe(700);
    expect(result.rejectionKg).toBe(20);
    expect(result.nonConformingReceipts).toBe(0);
    expect(result.exceptionsCount).toBe(0);
  });

  it("calculates rejection percentage only on mass with quantified rejection", () => {
    const quantified: ReceptionRecord = { id: "rq", plantId: "tamesis", plant: "Támesis", generator: "Q", route: "Q", wasteType: "FORSU", netWeightKg: 1000, rejectionKg: 50, rejectionKnown: true, acceptance: "unknown", startedAt: "2026-08-11T10:00:00-05:00", endedAt: "2026-08-11T10:00:00-05:00", lotCode: "HQ", source: "historical" };
    const unquantified: ReceptionRecord = { id: "ru", plantId: "tamesis", plant: "Támesis", generator: "U", route: "U", wasteType: "FORSU", netWeightKg: 500, rejectionKg: 0, rejectionKnown: false, acceptance: "unknown", startedAt: "2026-08-11T11:00:00-05:00", endedAt: "2026-08-11T11:00:00-05:00", lotCode: "HU", source: "historical" };
    const result = buildOperationalAnalytics({ activities: [], receptions: [quantified, unquantified], incidents: [], tickets: [], equipment: [], piles: [], measurements: [], workers: [], preset: "day", anchorKey: "2026-08-11", plantId: "all", nowIso: "2026-08-11T16:00:00-05:00" });
    expect(result.receivedKg).toBe(1500);
    expect(result.rejectionKg).toBe(50);
    expect(result.rejectionPct).toBe(5);
    expect(result.rejectionCoveragePct).toBeCloseTo(66.6667, 3);
  });

  it("filters the same semantic metrics by plant", () => {
    const result = buildOperationalAnalytics({ activities, receptions, incidents: [], tickets, equipment, piles, measurements: [], workers, preset: "day", anchorKey: "2026-08-11", plantId: "yarumal", nowIso: "2026-08-11T16:00:00-05:00" });
    expect(result.receivedKg).toBe(0);
    expect(result.laborHours).toBe(0);
    expect(result.events).toHaveLength(0);
  });
});
