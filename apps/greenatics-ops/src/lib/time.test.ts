import { describe, expect, it } from "vitest";
import { bogotaDateKey, bogotaDatetimeLocalToIso, bogotaDatetimeLocalValue, compactBogotaDate } from "./time";

describe("Bogotá operational time", () => {
  it("keeps operational date in America/Bogota around UTC midnight", () => {
    expect(bogotaDateKey("2026-08-15T02:30:00Z")).toBe("2026-08-14");
    expect(compactBogotaDate("2026-08-15T02:30:00Z")).toBe("260814");
  });

  it("formats UTC instants as datetime-local values in Colombia", () => {
    expect(bogotaDatetimeLocalValue("2026-08-14T18:45:00Z")).toBe("2026-08-14T13:45");
  });

  it("interprets datetime-local values explicitly as Colombia UTC-5", () => {
    expect(bogotaDatetimeLocalToIso("2026-08-14T13:45")).toBe("2026-08-14T18:45:00.000Z");
  });

  it("rejects malformed local values instead of guessing browser timezone", () => {
    expect(() => bogotaDatetimeLocalToIso("2026/08/14 13:45")).toThrow("Fecha y hora de Bogotá inválidas");
  });
});
