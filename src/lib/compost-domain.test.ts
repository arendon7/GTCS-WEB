import { describe, expect, it } from "vitest";
import {
  averageTemperature,
  compostAgeDays,
  compostEventDurationHours,
  compostEventProductivity,
  compostYieldPct,
  maturationDays,
  rangeStatusLabel,
  type CompostEvent,
  type CompostPile,
} from "./compost-domain";

describe("compost calculations", () => {
  it("averages multiple temperature points without changing source measurements", () => {
    expect(averageTemperature({ temperaturePointsC: [54, 57, 55, 56] })).toBe(55.5);
    expect(averageTemperature({ temperaturePointsC: [54, 57, 55], temperatureAvgC: 55.2 })).toBe(55.2);
  });

  it("derives process and maturation days from timestamps", () => {
    const pile = { startedAt: "2026-08-01T08:00:00-05:00", maturationStartedAt: "2026-08-10T08:00:00-05:00" } as CompostPile;
    expect(compostAgeDays(pile, "2026-08-11T08:00:00-05:00")).toBe(10);
    expect(maturationDays(pile, "2026-08-11T08:00:00-05:00")).toBe(1);
  });

  it("calculates yield only when final weight exists", () => {
    expect(compostYieldPct({ initialWeightKg: 1800, finalWeightKg: 720 })).toBe(40);
    expect(compostYieldPct({ initialWeightKg: 1800 })).toBe(0);
  });

  it("derives event duration and worker productivity from one operational event", () => {
    const event = {
      startedAt: "2026-08-14T08:00:00-05:00",
      endedAt: "2026-08-14T08:30:00-05:00",
      volumeM3: 8,
      workerIds: ["w1", "w2"],
    } as CompostEvent;
    expect(compostEventDurationHours(event)).toBe(0.5);
    expect(compostEventProductivity(event)).toBe(8);
  });

  it("does not invent productivity when volume, time or workers are missing", () => {
    expect(compostEventProductivity({ startedAt: "2026-08-14T08:00:00-05:00", endedAt: "2026-08-14T08:30:00-05:00", workerIds: [] })).toBe(0);
  });

  it("uses explicit labels for configured and non-configured ranges", () => {
    expect(rangeStatusLabel("not_configured")).toBe("Sin rango configurado");
    expect(rangeStatusLabel("not_recorded")).toBe("No medido");
    expect(rangeStatusLabel("within_range")).toBe("Dentro de rango");
    expect(rangeStatusLabel("out_of_range")).toBe("Fuera de rango");
  });
});
