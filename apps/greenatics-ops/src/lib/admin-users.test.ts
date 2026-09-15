import { describe, expect, it } from "vitest";
import { validateAppAccess, validateInviteUserInput, validateUpdateUserInput } from "@/lib/admin-users";

const plantId = "11111111-1111-4111-8111-111111111111";

describe("admin user contracts", () => {
  it("normalizes a valid invitation", () => {
    const result = validateInviteUserInput({
      email: " Operario@Greenatics.com.co ",
      displayName: "  Operario   Piloto ",
      assignments: [{ plantId, role: "operator" }],
      appAccess: ["ops", "red"],
    });
    expect(result).toEqual({
      ok: true,
      value: {
        email: "operario@greenatics.com.co",
        displayName: "Operario Piloto",
        assignments: [{ plantId, role: "operator", active: true }],
        appAccess: ["ops", "red"],
      },
    });
  });

  it("rejects duplicate plant assignments", () => {
    const result = validateInviteUserInput({
      email: "a@greenatics.com.co",
      displayName: "Usuario",
      assignments: [{ plantId, role: "operator" }, { plantId, role: "supervisor" }],
      appAccess: ["ops"],
    });
    expect(result).toEqual({ ok: false, error: "Una planta no puede aparecer dos veces." });
  });

  it("rejects invalid role, active flag and update user id", () => {
    expect(validateInviteUserInput({ email: "a@greenatics.com.co", displayName: "Usuario", assignments: [{ plantId, role: "owner" }], appAccess: ["ops"] }).ok).toBe(false);
    expect(validateInviteUserInput({ email: "a@greenatics.com.co", displayName: "Usuario", assignments: [{ plantId, role: "operator", active: "yes" }], appAccess: ["ops"] }).ok).toBe(false);
    expect(validateUpdateUserInput({ userId: "not-uuid", displayName: "Usuario", assignments: [{ plantId, role: "operator" }], appAccess: ["ops"] }).ok).toBe(false);
  });

  it("requires a unique, supported application entitlement", () => {
    expect(validateAppAccess(["ops", "huella", "sana"])).toEqual({ ok: true, value: ["ops", "huella", "sana"] });
    expect(validateAppAccess([]).ok).toBe(false);
    expect(validateAppAccess(["ops", "ops"]).ok).toBe(false);
    expect(validateAppAccess(["unknown"]).ok).toBe(false);
  });
});
