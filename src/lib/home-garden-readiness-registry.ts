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
export type HomeGardenLaunchEvidenceKind = Exclude<HomeGardenEvidenceKind, "product-truth">;
export type HomeGardenReadinessLane = "canonical" | "technical" | "admin-director";

export const homeGardenLaunchEvidenceKinds = [
  "laboratory-report",
  "regulatory-registration",
  "approved-label",
  "sku-master",
  "dose-validation",
  "cost-model",
  "fulfillment-record",
  "public-asset",
] as const satisfies readonly HomeGardenLaunchEvidenceKind[];

const technicalEvidenceKinds = new Set<HomeGardenLaunchEvidenceKind>([
  "laboratory-report",
  "regulatory-registration",
  "approved-label",
  "dose-validation",
]);

export const homeGardenGateOrder = [
  "technical-product-truth",
  "household-skus",
  "regulatory",
  "dose-and-dosifier",
  "all-in-cost",
  "fulfillment",
  "public-assets",
] as const satisfies readonly HomeGardenEvidenceGateId[];

export type HomeGardenLaunchEvidenceRevision = {
  id: string;
  revisionNo: number;
  candidateId: string;
  evidenceKind: HomeGardenLaunchEvidenceKind;
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

export type HomeGardenGateWorkstream = {
  gate: HomeGardenEvidenceGateId;
  label: string;
  lane: HomeGardenReadinessLane;
  total: number;
  closedCount: number;
  openCount: number;
  openCandidateIds: readonly string[];
};

export type HomeGardenReadinessRegistry = {
  items: readonly HomeGardenReadinessRegistryItem[];
  workstreams: readonly HomeGardenGateWorkstream[];
  orphanEvidence: readonly HomeGardenLaunchEvidenceRevision[];
  summary: {
    total: number;
    commerceReady: number;
    pending: number;
    openGateInstances: number;
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

export const homeGardenGateLanes: Record<HomeGardenEvidenceGateId, HomeGardenReadinessLane> = {
  "technical-product-truth": "canonical",
  "household-skus": "admin-director",
  regulatory: "technical",
  "dose-and-dosifier": "technical",
  "all-in-cost": "admin-director",
  fulfillment: "admin-director",
  "public-assets": "admin-director",
};

export const homeGardenLaneLabels: Record<HomeGardenReadinessLane, string> = {
  canonical: "Canónico · código",
  technical: "Técnico",
  "admin-director": "Admin / Dirección",
};

export function canManageHomeGardenReadiness(role: string) {
  return role === "technical" || role === "admin" || role === "director";
}

export function canAppendHomeGardenEvidence(role: string, kind: HomeGardenLaunchEvidenceKind) {
  if (role === "admin" || role === "director") return true;
  return role === "technical" && technicalEvidenceKinds.has(kind);
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

function buildGateWorkstreams(items: readonly HomeGardenReadinessRegistryItem[]): readonly HomeGardenGateWorkstream[] {
  return homeGardenGateOrder.map((gate) => {
    const openCandidateIds = items.filter((item) => !item.gates[gate]).map((item) => item.id);
    return {
      gate,
      label: homeGardenGateLabels[gate],
      lane: homeGardenGateLanes[gate],
      total: items.length,
      closedCount: items.length - openCandidateIds.length,
      openCount: openCandidateIds.length,
      openCandidateIds,
    };
  });
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
    missingGates: homeGardenGateOrder.filter((gate) => !evaluation.gates[gate]),
  }));

  const workstreams = buildGateWorkstreams(items);
  const commerceReady = items.filter((item) => item.commerceReady).length;
  return {
    items,
    workstreams,
    orphanEvidence,
    summary: {
      total: items.length,
      commerceReady,
      pending: items.length - commerceReady,
      openGateInstances: workstreams.reduce((total, workstream) => total + workstream.openCount, 0),
      orphanEvidence: orphanEvidence.length,
    },
  };
}
