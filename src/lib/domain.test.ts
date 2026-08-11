import { describe, expect, it } from "vitest";
import { getDurationMinutes, getLaborHours, getReceptionDurationMinutes, getRejectionPct, type ActivityRecord, type ReceptionRecord } from "./domain";

describe("operational calculations", () => {
  it("separates activity duration from labor hours", () => {
    const activity: ActivityRecord = {
      id: "a1", plantId: "tamesis", plant: "Támesis", title: "Molienda", process: "Pretratamiento",
      plannedStart: "2026-08-11T08:00:00-05:00", actualStart: "2026-08-11T08:00:00-05:00", actualEnd: "2026-08-11T10:00:00-05:00",
      workerIds: ["w1", "w2"], status: "done", source: "scheduled",
    };
    expect(getDurationMinutes(activity)).toBe(120);
    expect(getLaborHours(activity)).toBe(4);
  });

  it("calculates weighted reception quality inputs without rounding the source", () => {
    const reception = { netWeightKg: 1840, rejectionKg: 85 } as ReceptionRecord;
    expect(getRejectionPct(reception)).toBeCloseTo(4.619565, 5);
  });

  it("derives reception duration from timestamps", () => {
    const reception = { startedAt: "2026-08-11T09:48:00-05:00", endedAt: "2026-08-11T10:11:00-05:00" } as ReceptionRecord;
    expect(getReceptionDurationMinutes(reception)).toBe(23);
  });
});
