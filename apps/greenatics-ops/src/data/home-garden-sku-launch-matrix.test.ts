import { describe, expect, it } from "vitest";
import type { HomeGardenEvidenceRecord } from "./home-garden-evidence";
import {
  buildHomeGardenSkuLaunchMatrix,
  homeGardenPlannedSkuCandidates,
  homeGardenSkuLaunchMatrix,
} from "./home-garden-sku-launch-matrix";

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

describe("Casa, Jardín y Vivero SKU launch matrix", () => {
  it("derives all planned B2C presentations from the governed product model", () => {
    expect(homeGardenPlannedSkuCandidates).toHaveLength(18);
    expect(new Set(homeGardenPlannedSkuCandidates.map((candidate) => candidate.id)).size).toBe(18);

    expect(homeGardenPlannedSkuCandidates.filter((candidate) => candidate.productId === "prepara")).toHaveLength(2);
    for (const productId of ["crece", "equilibra", "florece", "fructifica"] as const) {
      expect(homeGardenPlannedSkuCandidates.filter((candidate) => candidate.productId === productId)).toHaveLength(4);
    }
  });

  it("keeps every planned presentation fail-closed by default", () => {
    expect(homeGardenSkuLaunchMatrix).toHaveLength(18);
    expect(homeGardenSkuLaunchMatrix.every((candidate) => candidate.gates["technical-product-truth"])).toBe(true);
    expect(homeGardenSkuLaunchMatrix.every((candidate) => candidate.commerceReady === false)).toBe(true);
    expect(homeGardenSkuLaunchMatrix.every((candidate) => candidate.gates.regulatory === false)).toBe(true);
    expect(homeGardenSkuLaunchMatrix.every((candidate) => candidate.gates["all-in-cost"] === false)).toBe(true);
  });

  it("can close one exact presentation only when every commercial gate has valid evidence", () => {
    const target = homeGardenPlannedSkuCandidates.find((candidate) => candidate.id === "crece-500-g");
    expect(target).toBeDefined();
    if (!target) return;

    const fullEvidence: HomeGardenEvidenceRecord[] = [
      verified("sku-master"),
      verified("regulatory-registration"),
      verified("approved-label"),
      verified("dose-validation"),
      verified("cost-model"),
      verified("fulfillment-record"),
      verified("public-asset"),
    ];

    const matrix = buildHomeGardenSkuLaunchMatrix({ [target.id]: fullEvidence });
    const evaluated = matrix.find((candidate) => candidate.id === target.id);

    expect(evaluated?.commerceReady).toBe(true);
    expect(Object.values(evaluated?.gates ?? {}).every(Boolean)).toBe(true);
    expect(matrix.filter((candidate) => candidate.commerceReady)).toHaveLength(1);
  });

  it("does not accept laboratory reports or partial cost evidence as shortcuts", () => {
    const target = homeGardenPlannedSkuCandidates.find((candidate) => candidate.id === "equilibra-1-kg");
    expect(target).toBeDefined();
    if (!target) return;

    const incompleteEvidence: HomeGardenEvidenceRecord[] = [
      verified("laboratory-report"),
      verified("cost-model", { completeForGate: false }),
      verified("approved-label"),
    ];

    const evaluated = buildHomeGardenSkuLaunchMatrix({ [target.id]: incompleteEvidence })
      .find((candidate) => candidate.id === target.id);

    expect(evaluated?.gates.regulatory).toBe(false);
    expect(evaluated?.gates["all-in-cost"]).toBe(false);
    expect(evaluated?.commerceReady).toBe(false);
  });

  it("rejects evidence that belongs to a different presentation", () => {
    const target = homeGardenPlannedSkuCandidates.find((candidate) => candidate.id === "florece-2-kg");
    expect(target).toBeDefined();
    if (!target) return;

    const mismatched: HomeGardenEvidenceRecord[] = [
      verified("sku-master", { samePresentation: false }),
      verified("regulatory-registration", { samePresentation: false }),
      verified("approved-label", { samePresentation: false }),
      verified("dose-validation", { samePresentation: false }),
      verified("cost-model", { samePresentation: false }),
      verified("fulfillment-record", { samePresentation: false }),
      verified("public-asset", { samePresentation: false }),
    ];

    const evaluated = buildHomeGardenSkuLaunchMatrix({ [target.id]: mismatched })
      .find((candidate) => candidate.id === target.id);

    expect(evaluated?.commerceReady).toBe(false);
    expect(evaluated?.gates["household-skus"]).toBe(false);
    expect(evaluated?.gates.regulatory).toBe(false);
  });
});
