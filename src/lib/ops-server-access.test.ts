import { describe, expect, it } from "vitest";
import { hasActivePlantMembership } from "./ops-server-access";

describe("OPS server access membership semantics", () => {
  it("requires at least one active joined plant", () => {
    expect(hasActivePlantMembership([])).toBe(false);
    expect(hasActivePlantMembership([{ plant_id: "plant-1", plants: { active: false } }])).toBe(false);
    expect(hasActivePlantMembership([{ plant_id: "plant-1", plants: null }])).toBe(false);
    expect(hasActivePlantMembership([{ plant_id: "plant-1", plants: { active: true } }])).toBe(true);
  });

  it("supports Supabase joins represented as arrays without accepting missing plant ids", () => {
    expect(hasActivePlantMembership([{ plant_id: "plant-1", plants: [{ active: true }] }])).toBe(true);
    expect(hasActivePlantMembership([{ plants: [{ active: true }] }])).toBe(false);
  });
});
