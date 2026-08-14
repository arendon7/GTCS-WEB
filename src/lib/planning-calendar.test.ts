import { describe, expect, it } from "vitest";
import {
  addPlannerDays,
  bogotaIsoToLocalInput,
  bogotaLocalInputToIso,
  movePlannerAnchor,
  plannerMonthCells,
  plannerRange,
  plannerWeekKeys,
  startOfPlannerWeek,
} from "@/lib/planning-calendar";

describe("planning calendar", () => {
  it("builds Bogotá day, week and month ranges without browser timezone assumptions", () => {
    expect(plannerRange("day", "2026-08-14")).toEqual({
      startKey: "2026-08-14",
      endKey: "2026-08-15",
      startIso: "2026-08-14T05:00:00.000Z",
      endIso: "2026-08-15T05:00:00.000Z",
    });
    expect(startOfPlannerWeek("2026-08-14")).toBe("2026-08-10");
    expect(plannerRange("week", "2026-08-14").endKey).toBe("2026-08-17");
    expect(plannerRange("month", "2026-08-14").endKey).toBe("2026-09-01");
  });

  it("navigates across month/year boundaries and returns seven-day weeks", () => {
    expect(addPlannerDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(movePlannerAnchor("month", "2026-12-14", 1)).toBe("2027-01-14");
    expect(plannerWeekKeys("2026-08-14")).toEqual([
      "2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15", "2026-08-16",
    ]);
  });

  it("builds a stable six-week month grid", () => {
    const cells = plannerMonthCells("2026-08-14");
    expect(cells).toHaveLength(42);
    expect(cells[0]).toEqual({ key: "2026-07-26", inMonth: false });
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(31);
  });

  it("converts planner inputs explicitly in America/Bogota", () => {
    expect(bogotaLocalInputToIso("2026-08-14T08:30")).toBe("2026-08-14T13:30:00.000Z");
    expect(bogotaIsoToLocalInput("2026-08-14T13:30:00.000Z")).toBe("2026-08-14T08:30");
  });
});
