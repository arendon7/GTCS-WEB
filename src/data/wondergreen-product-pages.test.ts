import { describe, expect, it } from "vitest";
import { wondergreenReferences } from "./wondergreen-public";

describe("Wondergreen public product page invariants", () => {
  it("keeps every public product slug unique and routable", () => {
    const slugs = wondergreenReferences.map((reference) => reference.slug);
    expect(slugs).toHaveLength(new Set(slugs).size);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("publishes prices only for commercially reconciled references", () => {
    for (const reference of wondergreenReferences) {
      if (reference.priceCop !== undefined) {
        expect(reference.truthStatus).toBe("commercial-reconciled");
        expect(reference.priceCop).toBeGreaterThan(0);
      }
    }
  });

  it("keeps non-commercial references visibly qualified", () => {
    for (const reference of wondergreenReferences.filter((item) => item.truthStatus !== "commercial-reconciled")) {
      expect(reference.priceCop).toBeUndefined();
      expect(reference.publicStatus.toLowerCase()).toMatch(/técnico|desarrollo|validación|confirmar|reconciliar/);
    }
  });
});
