import { describe, expect, it } from "vitest";
import { canResolveIncident, validateIncidentResolutionNote } from "@/lib/incident-resolution";
import type { PlantAccess } from "@/lib/ops-data-contract";

const baseAccess: PlantAccess[] = [
  { dbId: "db-tam", plantId: "tamesis", code: "TAM", name: "Támesis", role: "operator" },
  { dbId: "db-yar", plantId: "yarumal", code: "YAR", name: "Yarumal", role: "director" },
];

describe("incident resolution", () => {
  it("allows incident resolution in local demo mode", () => {
    expect(canResolveIncident({ mode: "local", status: "ready" }, [], "tamesis")).toBe(true);
  });

  it("requires an authorized role for the exact remote plant", () => {
    expect(canResolveIncident({ mode: "supabase", status: "ready" }, baseAccess, "tamesis")).toBe(false);
    expect(canResolveIncident({ mode: "supabase", status: "ready" }, baseAccess, "yarumal")).toBe(true);
  });

  it("normalizes a valid resolution note", () => {
    expect(validateIncidentResolutionNote("  Se corrigió   la causa raíz.  ")).toEqual({ ok: true, value: "Se corrigió la causa raíz." });
  });

  it("rejects empty/short and oversized resolution notes", () => {
    expect(validateIncidentResolutionNote(" x ")).toEqual({ ok: false, error: "Describe brevemente cómo se resolvió el incidente." });
    expect(validateIncidentResolutionNote("a".repeat(501))).toEqual({ ok: false, error: "La resolución no puede superar 500 caracteres." });
  });
});
