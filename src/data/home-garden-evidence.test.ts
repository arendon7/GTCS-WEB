import { describe, expect, it } from "vitest";
import {
  canHomeGardenEvidenceSetCloseGate,
  getHomeGardenEvidenceRule,
  homeGardenEvidenceRules,
  homeGardenGateEvidenceRequirements,
  type HomeGardenEvidenceRecord,
} from "./home-garden-evidence";

const verified = (
  kind: HomeGardenEvidenceRecord["kind"],
  overrides: Partial<HomeGardenEvidenceRecord> = {},
): HomeGardenEvidenceRecord => ({
  kind,
  verified: true,
  sameReference: true,
  samePresentation: true,
  completeForGate: true,
  ...overrides,
});

describe("Casa, Jardín y Vivero launch evidence contract", () => {
  it("keeps laboratory evidence analytically useful but unable to close commercial gates", () => {
    const laboratory = getHomeGardenEvidenceRule("laboratory-report");

    expect(laboratory?.supports.join(" ")).toMatch(/muestra/i);
    expect(laboratory?.doesNotProve.join(" ")).toMatch(/registro de venta/i);
    expect(laboratory?.eligibleToClose).toEqual([]);
    expect(canHomeGardenEvidenceSetCloseGate("regulatory", [verified("laboratory-report")])).toBe(false);
  });

  it("requires regulatory coverage and approved label for the same reference and presentation", () => {
    expect(canHomeGardenEvidenceSetCloseGate("regulatory", [
      verified("regulatory-registration"),
      verified("approved-label"),
    ])).toBe(true);

    expect(canHomeGardenEvidenceSetCloseGate("regulatory", [
      verified("regulatory-registration"),
      verified("approved-label", { samePresentation: false }),
    ])).toBe(false);

    expect(canHomeGardenEvidenceSetCloseGate("regulatory", [verified("regulatory-registration")])).toBe(false);
  });

  it("does not let a partial cost model close the all-in cost gate", () => {
    expect(canHomeGardenEvidenceSetCloseGate("all-in-cost", [
      verified("cost-model", { completeForGate: false }),
    ])).toBe(false);

    expect(canHomeGardenEvidenceSetCloseGate("all-in-cost", [verified("cost-model")])).toBe(true);
  });

  it("requires exact presentation matching for SKU, dosing, fulfillment and public assets", () => {
    expect(canHomeGardenEvidenceSetCloseGate("household-skus", [verified("sku-master")])).toBe(true);
    expect(canHomeGardenEvidenceSetCloseGate("dose-and-dosifier", [verified("dose-validation")])).toBe(true);
    expect(canHomeGardenEvidenceSetCloseGate("fulfillment", [verified("fulfillment-record")])).toBe(true);
    expect(canHomeGardenEvidenceSetCloseGate("public-assets", [
      verified("approved-label"),
      verified("public-asset"),
    ])).toBe(true);

    expect(canHomeGardenEvidenceSetCloseGate("household-skus", [
      verified("sku-master", { samePresentation: false }),
    ])).toBe(false);
  });

  it("defines every evidence kind and gate exactly once", () => {
    const evidenceKinds = homeGardenEvidenceRules.map((rule) => rule.kind);
    const gates = homeGardenGateEvidenceRequirements.map((requirement) => requirement.gate);

    expect(new Set(evidenceKinds).size).toBe(evidenceKinds.length);
    expect(new Set(gates).size).toBe(gates.length);
    expect(gates).toEqual([
      "technical-product-truth",
      "household-skus",
      "regulatory",
      "dose-and-dosifier",
      "all-in-cost",
      "fulfillment",
      "public-assets",
    ]);
  });
});
