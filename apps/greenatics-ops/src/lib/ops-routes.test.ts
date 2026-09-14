import { describe, expect, it } from "vitest";
import { isProtectedOpsPath, safeOpsNext } from "@/lib/ops-routes";

describe("OPS route boundary", () => {
  it("keeps public Greenatics routes outside the authentication wall", () => {
    expect(isProtectedOpsPath("/")).toBe(false);
    expect(isProtectedOpsPath("/wondergreen")).toBe(false);
    expect(isProtectedOpsPath("/soluciones/prefactibilidad")).toBe(false);
    expect(isProtectedOpsPath("/contacto")).toBe(false);
  });

  it("recognizes internal operational and administration routes", () => {
    expect(isProtectedOpsPath("/app")).toBe(true);
    expect(isProtectedOpsPath("/activities/123")).toBe(true);
    expect(isProtectedOpsPath("/dashboard")).toBe(true);
    expect(isProtectedOpsPath("/admin/users")).toBe(true);
    expect(isProtectedOpsPath("/account/setup")).toBe(true);
  });

  it("only accepts local internal return paths", () => {
    expect(safeOpsNext("/dashboard?plant=tamesis")).toBe("/dashboard?plant=tamesis");
    expect(safeOpsNext("//evil.example/app")).toBe("/app");
    expect(safeOpsNext("https://evil.example/app")).toBe("/app");
    expect(safeOpsNext("/wondergreen")).toBe("/app");
  });
});
