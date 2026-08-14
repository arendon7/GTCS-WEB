import { describe, expect, it } from "vitest";
import { canManageOperationalMasters, normalizeMasterCode, validateMasterIdentity } from "@/lib/operational-master-data";

describe("operational master-data helpers", () => {
  it("normalizes stable master codes without accents or free spacing", () => {
    expect(normalizeMasterCode("  Recepción orgánica / Támesis  ")).toBe("RECEPCION_ORGANICA_TAMESIS");
  });

  it("allows only planning/master administration roles", () => {
    expect(canManageOperationalMasters("supervisor")).toBe(true);
    expect(canManageOperationalMasters("technical")).toBe(true);
    expect(canManageOperationalMasters("admin")).toBe(true);
    expect(canManageOperationalMasters("director")).toBe(true);
    expect(canManageOperationalMasters("maintenance")).toBe(false);
    expect(canManageOperationalMasters("operator")).toBe(false);
  });

  it("validates and canonicalizes a new master identity", () => {
    expect(validateMasterIdentity("volteo pila", " Volteo de pila ")).toEqual({
      ok: true,
      code: "VOLTEO_PILA",
      name: "Volteo de pila",
    });
    expect(validateMasterIdentity("", "")).toEqual({ ok: false, error: "Define un código operativo." });
  });
});
