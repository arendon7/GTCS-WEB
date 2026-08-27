import { describe, expect, it } from "vitest";
import { buildOperationalAnalytics } from "@/lib/analytics";
import type { IncidentRecord } from "@/lib/domain";

function analyticsFor(incident: IncidentRecord, preset: "day" | "history", anchorKey: string, nowIso = "2026-08-13T12:00:00-05:00") {
  return buildOperationalAnalytics({
    activities: [],
    receptions: [],
    incidents: [incident],
    tickets: [],
    equipment: [],
    piles: [],
    measurements: [],
    workers: [],
    preset,
    anchorKey,
    plantId: "all",
    nowIso,
  });
}

describe("incident history analytics", () => {
  it("reconstructs whether a resolved incident was still open at a historical period end", () => {
    const incident: IncidentRecord = {
      id: "incident-history",
      plantId: "tamesis",
      plant: "Támesis",
      title: "Desviación de proceso",
      detail: "La novedad requirió intervención.",
      severity: "medium",
      openedAt: "2026-08-10T08:00:00-05:00",
      closedAt: "2026-08-12T09:00:00-05:00",
      resolutionNote: "Se ajustó el proceso y se verificó estabilidad.",
      status: "closed",
    };

    const beforeResolution = analyticsFor(incident, "day", "2026-08-11");
    expect(beforeResolution.openIncidents).toBe(1);
    expect(beforeResolution.exceptionsCount).toBe(1);
    expect(beforeResolution.plantComparison.find((row) => row.plantId === "tamesis")?.attention).toBe(1);

    const resolutionDay = analyticsFor(incident, "day", "2026-08-12");
    expect(resolutionDay.openIncidents).toBe(0);
    expect(resolutionDay.exceptionsCount).toBe(0);
    expect(resolutionDay.events.map((event) => event.id)).toContain("incident-close-incident-history");
  });

  it("uses incident opening and closure to delimit history and emits both audit events", () => {
    const incident: IncidentRecord = {
      id: "incident-audit",
      plantId: "yarumal",
      plant: "Yarumal",
      title: "Obstrucción",
      detail: "Se detectó restricción de flujo.",
      severity: "high",
      openedAt: "2026-08-10T08:00:00-05:00",
      closedAt: "2026-08-12T09:00:00-05:00",
      resolutionNote: "Se retiró la obstrucción.",
      status: "closed",
    };

    const result = analyticsFor(incident, "history", "2026-08-11");
    expect(result.period.startKey).toBe("2026-08-10");
    expect(result.period.endKey).toBe("2026-08-12");
    expect(result.openIncidents).toBe(0);
    expect(result.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "incident-open-incident-audit", kind: "incident", title: "Incidente: Obstrucción" }),
      expect.objectContaining({ id: "incident-close-incident-audit", kind: "incident", title: "Incidente resuelto: Obstrucción", detail: "Resuelto · Se retiró la obstrucción." }),
    ]));
  });

  it("extends historical horizon to now while an incident remains open", () => {
    const incident: IncidentRecord = {
      id: "incident-open",
      plantId: "tamesis",
      plant: "Támesis",
      title: "Pendiente",
      detail: "Aún requiere atención.",
      severity: "low",
      openedAt: "2026-08-10T08:00:00-05:00",
      status: "open",
    };

    const result = analyticsFor(incident, "history", "2026-08-11");
    expect(result.period.startKey).toBe("2026-08-10");
    expect(result.period.endKey).toBe("2026-08-13");
    expect(result.openIncidents).toBe(1);
    expect(result.exceptionsCount).toBe(1);
  });
});
