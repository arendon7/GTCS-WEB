import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { createScheduledActivity, recordScheduleDeviation, reviseScheduledActivity } from "@/lib/supabase/planning-repository";

function rpcClient(result: { data: unknown; error: { message?: string } | null }) {
  const rpc = vi.fn().mockResolvedValue(result);
  return { client: { rpc } as unknown as SupabaseClient, rpc };
}

describe("planning repository RPC contracts", () => {
  it("maps canonical schedule creation to the transactional RPC", async () => {
    const { client, rpc } = rpcClient({ data: "schedule-1", error: null });
    await expect(createScheduledActivity({
      plantId: "plant-1",
      templateId: "template-1",
      plannedStart: "2026-08-14T13:00:00Z",
      plannedEnd: "2026-08-14T14:00:00Z",
      workerIds: ["worker-1"],
      equipmentId: "equipment-1",
      planningNote: "Plan base",
    }, client)).resolves.toBe("schedule-1");

    expect(rpc).toHaveBeenCalledWith("ops_create_scheduled_activity", {
      target_plant: "plant-1",
      target_template: "template-1",
      starts_at: "2026-08-14T13:00:00Z",
      ends_at: "2026-08-14T14:00:00Z",
      employee_ids: ["worker-1"],
      target_equipment: "equipment-1",
      planning_note: "Plan base",
    });
  });

  it("maps revision without mutating the predecessor from the client", async () => {
    const { client, rpc } = rpcClient({ data: "schedule-2", error: null });
    await expect(reviseScheduledActivity({
      scheduleId: "schedule-1",
      templateId: "template-1",
      plannedStart: "2026-08-14T15:00:00Z",
      plannedEnd: "2026-08-14T16:00:00Z",
      workerIds: ["worker-2"],
      reason: "Cambio de turno",
    }, client)).resolves.toBe("schedule-2");

    expect(rpc).toHaveBeenCalledWith("ops_revise_scheduled_activity", {
      target_schedule: "schedule-1",
      target_template: "template-1",
      starts_at: "2026-08-14T15:00:00Z",
      ends_at: "2026-08-14T16:00:00Z",
      employee_ids: ["worker-2"],
      target_equipment: null,
      reason: "Cambio de turno",
      planning_note: null,
    });
  });

  it("requires the RPC to confirm the requested deviation state", async () => {
    const { client, rpc } = rpcClient({ data: "delayed", error: null });
    await expect(recordScheduleDeviation({ scheduleId: "schedule-1", status: "delayed", reason: "Vehículo tardío" }, client)).resolves.toBe("delayed");
    expect(rpc).toHaveBeenCalledWith("ops_record_schedule_deviation", {
      target_schedule: "schedule-1",
      deviation_status: "delayed",
      reason: "Vehículo tardío",
    });
  });

  it("surfaces database validation messages without inventing fallback behavior", async () => {
    const { client } = rpcClient({ data: null, error: { message: "El equipo ya está asignado a otra actividad programada en ese horario." } });
    await expect(createScheduledActivity({
      plantId: "plant-1",
      templateId: "template-1",
      plannedStart: "2026-08-14T13:00:00Z",
      plannedEnd: "2026-08-14T14:00:00Z",
      workerIds: ["worker-1"],
    }, client)).rejects.toThrow("El equipo ya está asignado a otra actividad programada en ese horario.");
  });
});
