import { describe, expect, it } from "vitest";
import {
  canonicalPlantId,
  mapRemoteActivities,
  mapRemoteEmployee,
  mapRemoteReceipt,
  type PlantAccess,
} from "@/lib/ops-data-contract";

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

  it("joins scheduled execution and workers without duplicating the planned row", () => {
    const rows = mapRemoteActivities(
      [{
        id: "sched-1",
        plant_id: "db-tam",
        title: "Volteo programado",
        process: "Compostaje",
        planned_start: "2026-08-12T13:00:00.000Z",
        planned_end: "2026-08-12T14:00:00.000Z",
        status: "running",
        equipment_ref: "Volteadora",
      }],
      [{
        id: "act-1",
        plant_id: "db-tam",
        scheduled_activity_id: "sched-1",
        title: "Volteo programado",
        process: "Compostaje",
        started_at: "2026-08-12T13:08:00.000Z",
        source_kind: "app",
      }],
      [
        { activity_id: "act-1", employee_id: "emp-1" },
        { activity_id: "act-1", employee_id: "emp-2" },
      ],
      access,
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "act-1",
      plantId: "tamesis",
      plannedStart: "2026-08-12T13:00:00.000Z",
      actualStart: "2026-08-12T13:08:00.000Z",
      workerIds: ["emp-1", "emp-2"],
      equipment: "Volteadora",
      status: "running",
      source: "scheduled",
    });
  });

  it("keeps a not-yet-executed scheduled activity as planned", () => {
    const rows = mapRemoteActivities(
      [{
        id: "sched-2",
        plant_id: "db-yar",
        title: "Preparar digestor",
        process: "Biodigestión",
        planned_start: "2026-08-13T12:00:00.000Z",
        status: "planned",
      }],
      [],
      [],
      access,
    );

    expect(rows[0]).toMatchObject({ id: "sched-2", plantId: "yarumal", status: "planned", source: "scheduled", workerIds: [] });
  });

  it("preserves finished unplanned activity result and novelty", () => {
    const rows = mapRemoteActivities(
      [],
      [{
        id: "act-2",
        plant_id: "db-yar",
        title: "Limpieza extraordinaria",
        process: "Aseo",
        started_at: "2026-08-12T14:00:00.000Z",
        ended_at: "2026-08-12T15:00:00.000Z",
        quantity: "120",
        unit: "kg",
        novelty_type: "delay",
        notes: "Lluvia intensa",
        source_kind: "app",
      }],
      [{ activity_id: "act-2", employee_id: "emp-3" }],
      access,
    );

    expect(rows[0]).toMatchObject({
      status: "done",
      source: "unplanned",
      quantity: 120,
      unit: "kg",
      noveltyType: "delay",
      novelty: "Lluvia intensa",
      workerIds: ["emp-3"],
    });
  });

  it("rejects an impossible running schedule without a linked execution", () => {
    expect(() => mapRemoteActivities([{
      id: "sched-bad",
      plant_id: "db-tam",
      title: "Inconsistente",
      process: "QA",
      planned_start: "2026-08-12T13:00:00.000Z",
      status: "running",
    }], [], [], access)).toThrow(/no tiene ejecución enlazada/);
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
