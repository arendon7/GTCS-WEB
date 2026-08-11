import { describe, expect, it } from "vitest";
import { averageTemperature, compostAgeDays, compostYieldPct, maturationDays, type CompostPile } from "./compost-domain";

describe("compost calculations", () => {
  it("averages multiple temperature points without changing source measurements", () => {
    expect(averageTemperature({ temperaturePointsC: [54, 57, 55, 56] })).toBe(55.5);
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
});
