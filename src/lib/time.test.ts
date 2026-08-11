import { describe, expect, it } from "vitest";
import { bogotaDateKey, compactBogotaDate } from "./time";

describe("Bogota operational date", () => {
  it("keeps late UTC events on the correct Bogota day", () => {
    const instant = "2026-08-12T04:30:00.000Z";
    expect(bogotaDateKey(instant)).toBe("2026-08-11");
    expect(compactBogotaDate(instant)).toBe("260811");
  });
});
