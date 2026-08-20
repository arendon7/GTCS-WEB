import type {
  HomeGardenEvidenceGateId,
  HomeGardenEvidenceKind,
  HomeGardenEvidenceRecord,
} from "@/data/home-garden-evidence";
import {
  buildHomeGardenSkuLaunchMatrix,
  homeGardenPlannedSkuCandidates,
  type HomeGardenSkuLaunchEvaluation,
} from "@/data/home-garden-sku-launch-matrix";

export type HomeGardenEvidenceDisposition = "draft" | "verified" | "rejected" | "superseded";

export type HomeGardenLaunchEvidenceRevision = {
  id: string;
  revisionNo: number;
  candidateId: string;
  evidenceKind: HomeGardenEvidenceKind;
  disposition: HomeGardenEvidenceDisposition;
  title: string;
  sourceReference: string;
  sourceDate?: string;
  sameReference: boolean;
  samePresentation: boolean;
  completeForGate: boolean;
  note: string;
  effectiveAt: string;
  createdAt: string;
  createdBy: string;
};

export type HomeGardenReadinessRegistryItem = HomeGardenSkuLaunchEvaluation & {
  latestEvidence: readonly HomeGardenLaunchEvidenceRevision[];
  missingGates: readonly HomeGardenEvidenceGateId[];
};

export type HomeGardenReadinessRegistry = {
  items: readonly HomeGardenReadinessRegistryItem[];
  orphanEvidence: readonly HomeGardenLaunchEvidenceRevision[];
  summary: {
    total: number;
    commerceReady: number;
    pending: number;
    orphanEvidence: number;
  };
};

export const homeGardenGateLabels: Record<HomeGardenEvidenceGateId, string> = {
  "technical-product-truth": "Product Truth",
  "household-skus": "SKU Master",
  regulatory: "Regulatorio + etiqueta",
  "dose-and-dosifier": "Dosis + dosificador",
  "all-in-cost": "Costo all-in",
  fulfillment: "Fulfillment",
  "public-assets": "Activos públicos",
};

export function canManageHomeGardenReadiness(role: string) {
  return role === "technical" || role === "admin" || role === "director";
}

function latestRevisionKey(revision: HomeGardenLaunchEvidenceRevision) {
  return `${revision.candidateId}|${revision.evidenceKind}`;
}

export function selectLatestHomeGardenEvidence(
  revisions: readonly HomeGardenLaunchEvidenceRevision[],
): readonly HomeGardenLaunchEvidenceRevision[] {
  const latest = new Map<string, HomeGardenLaunchEvidenceRevision>();
  for (const revision of revisions) {
    const key = latestRevisionKey(revision);
    const current = latest.get(key);
    if (!current || revision.revisionNo > current.revisionNo) latest.set(key, revision);
  }
  return [...latest.values()].sort((a, b) => a.candidateId.localeCompare(b.candidateId)
    || a.evidenceKind.localeCompare(b.evidenceKind));
}

export function toHomeGardenEvidenceRecord(
  revision: HomeGardenLaunchEvidenceRevision,
): HomeGardenEvidenceRecord {
  return {
    kind: revision.evidenceKind,
    verified: revision.disposition === "verified",
    sameReference: revision.sameReference,
    samePresentation: revision.samePresentation,
    completeForGate: revision.completeForGate,
  };
}

export function buildHomeGardenReadinessRegistry(
  revisions: readonly HomeGardenLaunchEvidenceRevision[],
): HomeGardenReadinessRegistry {
  const knownCandidateIds = new Set(homeGardenPlannedSkuCandidates.map((candidate) => candidate.id));
  const latest = selectLatestHomeGardenEvidence(revisions);
  const orphanEvidence = latest.filter((revision) => !knownCandidateIds.has(revision.candidateId));
  const evidenceByCandidate: Record<string, HomeGardenEvidenceRecord[]> = {};
  const latestByCandidate: Record<string, HomeGardenLaunchEvidenceRevision[]> = {};

  for (const revision of latest) {
    if (!knownCandidateIds.has(revision.candidateId)) continue;
    (evidenceByCandidate[revision.candidateId] ??= []).push(toHomeGardenEvidenceRecord(revision));
    (latestByCandidate[revision.candidateId] ??= []).push(revision);
  }

  const items = buildHomeGardenSkuLaunchMatrix(evidenceByCandidate).map((evaluation): HomeGardenReadinessRegistryItem => ({
    ...evaluation,
    latestEvidence: latestByCandidate[evaluation.id] ?? [],
    missingGates: (Object.entries(evaluation.gates) as Array<[HomeGardenEvidenceGateId, boolean]>)
      .filter(([, closed]) => !closed)
      .map(([gate]) => gate),
  }));

  const commerceReady = items.filter((item) => item.commerceReady).length;
  return {
    items,
    orphanEvidence,
    summary: {
      total: items.length,
      commerceReady,
      pending: items.length - commerceReady,
      orphanEvidence: orphanEvidence.length,
    },
  };
}
