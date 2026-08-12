import { describe, expect, it } from "vitest";
import { canonicalPlantId, mapRemoteEmployee, mapRemoteReceipt, type PlantAccess } from "@/lib/ops-data-contract";

const access: PlantAccess[] = [
  { dbId: "db-tam", plantId: "tamesis", code: "TAM", name: "Támesis", role: "operator" },
  { dbId: "db-yar", plantId: "yarumal", code: "YAR", name: "Yarumal", role: "director" },
];

describe("ops remote data contract", () => {
  it("maps database plant identifiers to canonical app plant ids", () => {
    expect(canonicalPlantId("TAM", "Támesis")).toBe("tamesis");
    expect(canonicalPlantId("yarumal", "Yarumal")).toBe("yarumal");
  });

  it("maps visible remote employees without leaking database plant ids into UI state", () => {
    expect(mapRemoteEmployee({ id: "emp-1", plant_id: "db-tam", display_name: "Nelson" }, access)).toEqual({
      id: "emp-1",
      name: "Nelson",
      plantId: "tamesis",
    });
  });

  it("preserves reception uncertainty and historical provenance", () => {
    const receipt = mapRemoteReceipt({
      id: "rec-1",
      plant_id: "db-yar",
      generator: "Ruta histórica",
      route: "Yarumal",
      waste_type: "FORSU",
      net_weight_kg: "1250.5",
      rejection_kg: "0",
      rejection_known: false,
      acceptance_status: "unknown",
      started_at: "2026-06-01T05:00:00.000Z",
      ended_at: "2026-06-01T05:00:00.000Z",
      lot_code: "HIST-YAR-001",
      source_kind: "historical",
      time_precision: "date_only",
      import_run_id: "run-1",
      source_row_ids: ["row-8"],
    }, access);

    expect(receipt.plantId).toBe("yarumal");
    expect(receipt.netWeightKg).toBe(1250.5);
    expect(receipt.rejectionKnown).toBe(false);
    expect(receipt.acceptance).toBe("unknown");
    expect(receipt.source).toBe("historical");
    expect(receipt.provenance?.sourceRowIds).toEqual(["row-8"]);
  });

  it("rejects remote rows from a plant outside the visible membership set", () => {
    expect(() => mapRemoteEmployee({ id: "emp-2", plant_id: "db-other", display_name: "Fuera" }, access)).toThrow(/Sin membresía visible/);
  });
});
