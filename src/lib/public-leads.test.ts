import { describe, expect, it } from "vitest";
import { validatePublicLeadSubmission } from "./public-leads";

const base = {
  requestId: "550e8400-e29b-41d4-a716-446655440000",
  name: "Ana Pérez",
  email: "ana@example.com",
  audience: "planta",
  need: "operacion",
  consent: true,
};

describe("public lead validation", () => {
  it("accepts and normalizes a valid governed submission", () => {
    const result = validatePublicLeadSubmission({
      ...base,
      email: " ANA@EXAMPLE.COM ",
      organization: " ESP Ejemplo ",
      context: " Interés heredado ",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.email).toBe("ana@example.com");
    expect(result.value.organization).toBe("ESP Ejemplo");
    expect(result.value.context).toBe("Interés heredado");
  });

  it("requires at least one valid contact channel", () => {
    expect(validatePublicLeadSubmission({ ...base, email: "", phone: "" })).toEqual({ ok: false, code: "contact_required" });
    expect(validatePublicLeadSubmission({ ...base, email: "", phone: "123" })).toEqual({ ok: false, code: "invalid_phone" });
  });

  it("rejects consent gaps and unknown public taxonomy", () => {
    expect(validatePublicLeadSubmission({ ...base, consent: false })).toEqual({ ok: false, code: "consent_required" });
    expect(validatePublicLeadSubmission({ ...base, audience: "internal-admin" })).toEqual({ ok: false, code: "invalid_audience" });
    expect(validatePublicLeadSubmission({ ...base, need: "secret" })).toEqual({ ok: false, code: "invalid_need" });
  });

  it("rejects malformed ids, email and oversized context", () => {
    expect(validatePublicLeadSubmission({ ...base, requestId: "retry-1" })).toEqual({ ok: false, code: "invalid_request_id" });
    expect(validatePublicLeadSubmission({ ...base, email: "not-an-email" })).toEqual({ ok: false, code: "invalid_email" });
    expect(validatePublicLeadSubmission({ ...base, context: "x".repeat(481) })).toEqual({ ok: false, code: "field_too_long" });
  });
});
