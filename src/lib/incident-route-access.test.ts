import { describe, expect, it } from "vitest";
import { isProtectedOpsPath } from "@/lib/ops-access-policy";

describe("incident route access", () => {
  it("keeps incident history inside the protected OPS surface", () => {
    expect(isProtectedOpsPath("/incidents")).toBe(true);
    expect(isProtectedOpsPath("/incidents/incident-1")).toBe(true);
  });
});
