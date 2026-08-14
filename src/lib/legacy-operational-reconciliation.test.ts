import { describe, expect, it } from "vitest";
import {
  canCurateLegacyOperationalMappings,
  canonicalOptionsForLegacyKind,
  reconciliationApplySummary,
} from "@/lib/legacy-operational-reconciliation";
import type { OperationalMasterSnapshot } from "@/lib/operational-master-data";

const snapshot: OperationalMasterSnapshot = {
  units: [],
  processes: [
    { id: "process-1", plantId: "plant-1", code: "ASEO", name: "Aseo", active: true },
  ],
  activityTemplates: [
    {
      id: "template-1",
      plantId: "plant-1",
      processId: "process-1",
      code: "ASEO_GENERAL",
      name: "Aseo general",
      requiresQuantity: false,
      requiresLot: false,
      requiresEquipment: false,
      allowsUnplanned: true,
      active: true,
    },
  ],
  sources: [],
  routes: [],
  materialTypes: [],
  equipment: [
    { id: "equipment-1", plantId: "plant-1", code: "MOLINO_1", name: "Molino 1", status: "available" },
  ],
  equipmentProcesses: [],
};

describe("legacy operational reconciliation", () => {
  it("restricts curation to administration and direction", () => {
    expect(canCurateLegacyOperationalMappings("admin")).toBe(true);
    expect(canCurateLegacyOperationalMappings("director")).toBe(true);
    expect(canCurateLegacyOperationalMappings("supervisor")).toBe(false);
    expect(canCurateLegacyOperationalMappings("technical")).toBe(false);
    expect(canCurateLegacyOperationalMappings("operator")).toBe(false);
    expect(canCurateLegacyOperationalMappings(undefined)).toBe(false);
  });

  it("uses the canonical pool that matches each legacy field", () => {
    expect(canonicalOptionsForLegacyKind(snapshot, "process")).toEqual([
      { id: "process-1", code: "ASEO", name: "Aseo", active: true },
    ]);
    expect(canonicalOptionsForLegacyKind(snapshot, "activity")).toEqual([
      { id: "template-1", code: "ASEO_GENERAL", name: "Aseo general", active: true },
    ]);
    expect(canonicalOptionsForLegacyKind(snapshot, "equipment")).toEqual([
      { id: "equipment-1", code: "MOLINO_1", name: "Molino 1", active: true },
    ]);
  });

  it("summarizes only FK backfills and reports unresolved template-process conflicts", () => {
    expect(reconciliationApplySummary({
      activitiesProcess: 3,
      activitiesTemplate: 2,
      activitiesEquipment: 1,
      scheduledProcess: 4,
      scheduledTemplate: 2,
      scheduledEquipment: 0,
      templateProcessConflicts: 1,
    })).toBe("Se vincularon 12 referencias canónicas sin modificar el texto histórico. Quedaron 1 conflicto plantilla↔proceso para revisión manual.");

    expect(reconciliationApplySummary({
      activitiesProcess: 0,
      activitiesTemplate: 0,
      activitiesEquipment: 0,
      scheduledProcess: 0,
      scheduledTemplate: 0,
      scheduledEquipment: 0,
      templateProcessConflicts: 0,
    })).toBe("Se vincularon 0 referencias canónicas sin modificar el texto histórico. No quedaron conflictos plantilla↔proceso.");
  });
});
