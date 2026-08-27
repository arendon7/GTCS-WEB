import { describe, expect, it } from "vitest";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { mapRemoteIncidentHistory } from "@/lib/supabase/ops-repository";

const access: PlantAccess[] = [{ dbId: "plant-db-tam", plantId: "tamesis", code: "TAM", name: "Támesis", role: "supervisor" }];

describe("remote incident history mapping", () => {
  it("preserves closure timestamp and resolution note after Supabase hydration", () => {
    const result = mapRemoteIncidentHistory({
      id: "incident-remote-1",
      activity_id: "activity-remote-1",
      plant_id: "plant-db-tam",
      severity: "high",
      title: "Falla de proceso",
      description: "Se detectó una desviación.",
      opened_at: "2026-08-26T08:00:00-05:00",
      closed_at: "2026-08-26T09:15:00-05:00",
      resolution_note: "Se corrigió la condición y se verificó operación estable.  ",
    }, access);

    expect(result).toMatchObject({
      id: "incident-remote-1",
      activityId: "activity-remote-1",
      plantId: "tamesis",
      plant: "Támesis",
      status: "closed",
      closedAt: "2026-08-26T09:15:00-05:00",
      resolutionNote: "Se corrigió la condición y se verificó operación estable.",
    });
  });

  it("does not fabricate closure metadata for an open incident", () => {
    const result = mapRemoteIncidentHistory({
      id: "incident-remote-open",
      plant_id: "plant-db-tam",
      severity: "medium",
      title: "Novedad abierta",
      description: null,
      opened_at: "2026-08-26T10:00:00-05:00",
      closed_at: null,
      resolution_note: null,
    }, access);

    expect(result.status).toBe("open");
    expect(result.closedAt).toBeUndefined();
    expect(result.resolutionNote).toBeUndefined();
  });
});
