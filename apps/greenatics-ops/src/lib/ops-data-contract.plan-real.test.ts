import { describe, expect, it } from "vitest";
import { mapRemoteActivities, type PlantAccess } from "@/lib/ops-data-contract";

const access: PlantAccess[] = [
  { dbId: "db-tam", plantId: "tamesis", code: "TAM", name: "Támesis", role: "operator" },
];

describe("completed hosted plan-vs-real mapping", () => {
  it("turns a done schedule plus its linked finished activity into one scheduled execution for analytics", () => {
    const rows = mapRemoteActivities([
      {
        id: "schedule-uat",
        plant_id: "db-tam",
        title: "Aseo de herramientas",
        process: "Aseo",
        process_id: "process-aseo",
        activity_template_id: "template-aseo",
        planned_start: "2026-08-19T13:00:00Z",
        planned_end: "2026-08-19T13:30:00Z",
        status: "done",
      },
    ], [
      {
        id: "activity-uat",
        plant_id: "db-tam",
        scheduled_activity_id: "schedule-uat",
        title: "Aseo de herramientas",
        process: "Aseo",
        started_at: "2026-08-19T13:05:00Z",
        ended_at: "2026-08-19T13:20:00Z",
        source_kind: "app",
      },
    ], [
      { activity_id: "activity-uat", employee_id: "worker-uat" },
    ], access);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "activity-uat",
      plantId: "tamesis",
      source: "scheduled",
      status: "done",
      plannedStart: "2026-08-19T13:00:00Z",
      plannedEnd: "2026-08-19T13:30:00Z",
      actualStart: "2026-08-19T13:05:00Z",
      actualEnd: "2026-08-19T13:20:00Z",
      workerIds: ["worker-uat"],
      processId: "process-aseo",
      activityTemplateId: "template-aseo",
    });
  });
});
