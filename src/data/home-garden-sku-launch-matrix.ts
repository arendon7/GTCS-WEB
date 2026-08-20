import {
  canHomeGardenEvidenceSetCloseGate,
  type HomeGardenEvidenceGateId,
  type HomeGardenEvidenceRecord,
} from "./home-garden-evidence";
import { homeGardenProducts, type HomeGardenStage } from "./home-garden";

export const homeGardenCommerceEvidenceGates = [
  "household-skus",
  "regulatory",
  "dose-and-dosifier",
  "all-in-cost",
  "fulfillment",
  "public-assets",
] as const satisfies readonly HomeGardenEvidenceGateId[];

export type HomeGardenSkuCandidate = {
  id: string;
  productId: HomeGardenStage;
  consumerName: string;
  technicalName: string;
  technicalSlug: string;
  formula?: string;
  plannedVariant: string;
  sourceStatus: "planned-b2c";
  productTruthReady: boolean;
};

export type HomeGardenSkuEvidenceMap = Readonly<
  Record<string, readonly HomeGardenEvidenceRecord[]>
>;

export type HomeGardenSkuLaunchEvaluation = HomeGardenSkuCandidate & {
  gates: Record<HomeGardenEvidenceGateId, boolean>;
  commerceReady: boolean;
};

function toSkuFragment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const homeGardenPlannedSkuCandidates: readonly HomeGardenSkuCandidate[] = homeGardenProducts.flatMap((product) =>
  product.plannedHouseholdVariants.map((plannedVariant) => ({
    id: `${product.id}-${toSkuFragment(plannedVariant)}`,
    productId: product.id,
    consumerName: product.consumerName,
    technicalName: product.technicalName,
    technicalSlug: product.technicalSlug,
    formula: product.formula,
    plannedVariant,
    sourceStatus: "planned-b2c" as const,
    productTruthReady: product.availability === "technical-truth",
  })),
);

export function evaluateHomeGardenSkuCandidate(
  candidate: HomeGardenSkuCandidate,
  evidence: readonly HomeGardenEvidenceRecord[] = [],
): HomeGardenSkuLaunchEvaluation {
  const productTruthEvidence: HomeGardenEvidenceRecord = {
    kind: "product-truth",
    verified: candidate.productTruthReady,
    sameReference: true,
    samePresentation: true,
    completeForGate: candidate.productTruthReady,
  };

  const gates = {
    "technical-product-truth": canHomeGardenEvidenceSetCloseGate(
      "technical-product-truth",
      [productTruthEvidence],
    ),
    "household-skus": canHomeGardenEvidenceSetCloseGate("household-skus", evidence),
    regulatory: canHomeGardenEvidenceSetCloseGate("regulatory", evidence),
    "dose-and-dosifier": canHomeGardenEvidenceSetCloseGate("dose-and-dosifier", evidence),
    "all-in-cost": canHomeGardenEvidenceSetCloseGate("all-in-cost", evidence),
    fulfillment: canHomeGardenEvidenceSetCloseGate("fulfillment", evidence),
    "public-assets": canHomeGardenEvidenceSetCloseGate("public-assets", evidence),
  } satisfies Record<HomeGardenEvidenceGateId, boolean>;

  const commerceReady = gates["technical-product-truth"]
    && homeGardenCommerceEvidenceGates.every((gate) => gates[gate]);

  return { ...candidate, gates, commerceReady };
}

export function buildHomeGardenSkuLaunchMatrix(
  evidenceByCandidate: HomeGardenSkuEvidenceMap = {},
): readonly HomeGardenSkuLaunchEvaluation[] {
  return homeGardenPlannedSkuCandidates.map((candidate) =>
    evaluateHomeGardenSkuCandidate(candidate, evidenceByCandidate[candidate.id] ?? []),
  );
}

export const homeGardenSkuLaunchMatrix = buildHomeGardenSkuLaunchMatrix();
