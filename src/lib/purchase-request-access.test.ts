import { describe, expect, it } from "vitest";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { canManagePurchaseRequest } from "@/lib/purchase-request-domain";

function membership(plantId: string, role: PlantAccess["role"]): PlantAccess {
  return {
    dbId: `db-${plantId}-${role}`,
    plantId,
    code: plantId.toUpperCase(),
    name: plantId,
    role,
  };
}

describe("purchase request authorization visibility", () => {
  it.each(["supervisor", "admin", "director"] as const)(
    "%s can decide and fulfill requests for its own plant",
    (role) => {
      expect(canManagePurchaseRequest([membership("tamesis", role)], "tamesis")).toBe(true);
    },
  );

  it.each(["operator", "technical", "maintenance"] as const)(
    "%s cannot decide or fulfill requests",
    (role) => {
      expect(canManagePurchaseRequest([membership("tamesis", role)], "tamesis")).toBe(false);
    },
  );

  it("does not borrow an authorized role from another plant", () => {
    expect(canManagePurchaseRequest([
      membership("tamesis", "operator"),
      membership("yarumal", "director"),
    ], "tamesis")).toBe(false);
  });

  it("uses the matching plant membership when multiple plants are visible", () => {
    expect(canManagePurchaseRequest([
      membership("tamesis", "director"),
      membership("yarumal", "operator"),
    ], "tamesis")).toBe(true);
    expect(canManagePurchaseRequest([
      membership("tamesis", "director"),
      membership("yarumal", "operator"),
    ], "yarumal")).toBe(false);
  });
});
