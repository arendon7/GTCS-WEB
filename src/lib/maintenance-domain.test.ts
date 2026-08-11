import { describe, expect, it } from "vitest";
import { getDowntimeMinutes, type MaintenanceTicket } from "./maintenance-domain";

describe("maintenance calculations", () => {
  it("derives downtime while a ticket is open", () => {
    const ticket = { openedAt: "2026-08-11T10:00:00-05:00" } as MaintenanceTicket;
    expect(getDowntimeMinutes(ticket, "2026-08-11T10:45:00-05:00")).toBe(45);
  });

  it("uses closedAt for completed tickets", () => {
    const ticket = { openedAt: "2026-08-11T10:00:00-05:00", closedAt: "2026-08-11T11:30:00-05:00" } as MaintenanceTicket;
    expect(getDowntimeMinutes(ticket)).toBe(90);
  });
});
