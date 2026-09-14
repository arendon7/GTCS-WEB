import { describe, expect, it } from "vitest";
import { getDowntimeMinutes, type MaintenanceTicket } from "./maintenance-domain";

describe("maintenance calculations", () => {
  it("derives downtime from actual failure time even when reported later", () => {
    const ticket = {
      failedAt: "2026-08-11T09:30:00-05:00",
      openedAt: "2026-08-11T10:00:00-05:00",
    } as MaintenanceTicket;
    expect(getDowntimeMinutes(ticket, "2026-08-11T10:45:00-05:00")).toBe(75);
  });

  it("uses closedAt against failedAt for completed tickets", () => {
    const ticket = {
      failedAt: "2026-08-11T09:45:00-05:00",
      openedAt: "2026-08-11T10:00:00-05:00",
      closedAt: "2026-08-11T11:30:00-05:00",
    } as MaintenanceTicket;
    expect(getDowntimeMinutes(ticket)).toBe(105);
  });

  it("keeps legacy local snapshots readable by falling back to openedAt", () => {
    const ticket = { openedAt: "2026-08-11T10:00:00-05:00" } as MaintenanceTicket;
    expect(getDowntimeMinutes(ticket, "2026-08-11T10:45:00-05:00")).toBe(45);
  });
});
