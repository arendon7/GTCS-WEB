import { describe, expect, it } from "vitest";
import { formatDowntime, getDowntimeMinutes, prioritizeActiveMaintenanceTickets, type MaintenanceTicket } from "./maintenance-domain";

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
  it("prioritizes active maintenance by severity and then longest downtime without reordering source data", () => {
    const tickets = [
      { id: "low", severity: "low", status: "open", failedAt: "2026-08-11T09:00:00Z", openedAt: "2026-08-11T09:00:00Z" },
      { id: "high-new", severity: "high", status: "open", failedAt: "2026-08-11T10:00:00Z", openedAt: "2026-08-11T10:00:00Z" },
      { id: "high-old", severity: "high", status: "repairing", failedAt: "2026-08-11T08:00:00Z", openedAt: "2026-08-11T08:00:00Z" },
      { id: "closed", severity: "high", status: "closed", failedAt: "2026-08-11T07:00:00Z", openedAt: "2026-08-11T07:00:00Z" },
    ] as MaintenanceTicket[];

    expect(prioritizeActiveMaintenanceTickets(tickets, "2026-08-11T11:00:00Z").map((ticket) => ticket.id))
      .toEqual(["high-old", "high-new", "low"]);
    expect(tickets.map((ticket) => ticket.id)).toEqual(["low", "high-new", "high-old", "closed"]);
  });

  it("formats short and multi-day downtime for compact attention rows", () => {
    expect(formatDowntime(45)).toBe("45 min");
    expect(formatDowntime(65)).toBe("1 h 5 min");
    expect(formatDowntime(3_060)).toBe("2 d 3 h");
  });

});
