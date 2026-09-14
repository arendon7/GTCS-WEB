import type {
  HomeGardenEvidenceGateId,
  HomeGardenEvidenceKind,
  HomeGardenEvidenceRecord,
} from "@/data/home-garden-evidence";
import {
  getHomeGardenEvidenceRule,
  getHomeGardenGateEvidenceRequirement,
} from "@/data/home-garden-evidence";
import {
  buildHomeGardenSkuLaunchMatrix,
  homeGardenPlannedSkuCandidates,
  type HomeGardenSkuLaunchEvaluation,
} from "@/data/home-garden-sku-launch-matrix";

export type HomeGardenEvidenceDisposition = "draft" | "verified" | "rejected" | "superseded";
export type HomeGardenLaunchEvidenceKind = Exclude<HomeGardenEvidenceKind, "product-truth">;
export type HomeGardenReadinessLane = "canonical" | "technical" | "admin-director";
export type HomeGardenRequirementStatus = "ready" | "missing" | "needs-review";

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

export type HomeGardenGateEvidenceState = {
  kind: HomeGardenEvidenceKind;
  label: string;
  status: HomeGardenRequirementStatus;
  registrable: boolean;
  reason: string;
  latestRevision?: HomeGardenLaunchEvidenceRevision;
};

export type HomeGardenReadinessRegistryItem = HomeGardenSkuLaunchEvaluation & {
  latestEvidence: readonly HomeGardenLaunchEvidenceRevision[];
  missingGates: readonly HomeGardenEvidenceGateId[];
  gateEvidence: Readonly<Record<HomeGardenEvidenceGateId, readonly HomeGardenGateEvidenceState[]>>;
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

function evidenceStateReason(
  revision: HomeGardenLaunchEvidenceRevision,
  gate: HomeGardenEvidenceGateId,
) {
  const requirement = getHomeGardenGateEvidenceRequirement(gate);
  if (revision.disposition === "draft") return "La revisión vigente sigue en borrador o pendiente de verificación.";
  if (revision.disposition === "rejected") return "La revisión vigente fue rechazada y mantiene el criterio abierto.";
  if (revision.disposition === "superseded") return "La revisión vigente está superada; se requiere una evidencia sustituta.";
  if (!revision.completeForGate) return "La revisión está verificada, pero no está completa para este criterio.";
  if (requirement?.requireSameReference && !revision.sameReference) return "La evidencia no está conciliada con la misma referencia técnica.";
  if (requirement?.requireSamePresentation && !revision.samePresentation) return "La evidencia no está conciliada con la misma presentación.";
  return "La revisión vigente no satisface todavía todas las condiciones de este criterio.";
}

function buildGateEvidenceState(
  gate: HomeGardenEvidenceGateId,
  gateClosed: boolean,
  latestEvidence: readonly HomeGardenLaunchEvidenceRevision[],
): readonly HomeGardenGateEvidenceState[] {
  const requirement = getHomeGardenGateEvidenceRequirement(gate);
  if (!requirement) return [];

  return requirement.requiredEvidence.map((kind): HomeGardenGateEvidenceState => {
    const rule = getHomeGardenEvidenceRule(kind);
    const label = rule?.label ?? kind;

    if (kind === "product-truth") {
      return {
        kind,
        label,
        registrable: false,
        status: gateClosed ? "ready" : "needs-review",
        reason: gateClosed
          ? "Se resuelve desde Product Truth canónico en código; no requiere ni admite una revisión en este ledger."
          : "Product Truth canónico debe reconciliarse en código antes de continuar.",
      };
    }

    const latestRevision = latestEvidence.find((revision) => revision.evidenceKind === kind);
    if (!latestRevision) {
      return {
        kind,
        label,
        registrable: true,
        status: "missing",
        reason: "No hay una revisión registrada para esta presentación.",
      };
    }

    const eligibleForGate = Boolean(rule?.eligibleToClose.includes(gate));
    const ready = latestRevision.disposition === "verified"
      && latestRevision.completeForGate
      && (!requirement.requireSameReference || latestRevision.sameReference)
      && (!requirement.requireSamePresentation || latestRevision.samePresentation)
      && eligibleForGate;

    return {
      kind,
      label,
      registrable: true,
      status: ready ? "ready" : "needs-review",
      reason: ready
        ? "Revisión vigente verificada, completa y conciliada para este criterio."
        : evidenceStateReason(latestRevision, gate),
      latestRevision,
    };
  });
}

function buildGateEvidenceMap(
  evaluation: HomeGardenSkuLaunchEvaluation,
  latestEvidence: readonly HomeGardenLaunchEvidenceRevision[],
): Readonly<Record<HomeGardenEvidenceGateId, readonly HomeGardenGateEvidenceState[]>> {
  return Object.fromEntries(homeGardenGateOrder.map((gate) => [
    gate,
    buildGateEvidenceState(gate, evaluation.gates[gate], latestEvidence),
  ])) as Record<HomeGardenEvidenceGateId, readonly HomeGardenGateEvidenceState[]>;
}

export function getNextHomeGardenEvidenceKind(
  item: HomeGardenReadinessRegistryItem,
  gate: HomeGardenEvidenceGateId,
): HomeGardenLaunchEvidenceKind | undefined {
  const pending = item.gateEvidence[gate].find((state) => state.status !== "ready" && state.registrable);
  return pending && pending.kind !== "product-truth" ? pending.kind : undefined;
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

  const items = buildHomeGardenSkuLaunchMatrix(evidenceByCandidate).map((evaluation): HomeGardenReadinessRegistryItem => {
    const latestEvidence = latestByCandidate[evaluation.id] ?? [];
    return {
      ...evaluation,
      latestEvidence,
      missingGates: homeGardenGateOrder.filter((gate) => !evaluation.gates[gate]),
      gateEvidence: buildGateEvidenceMap(evaluation, latestEvidence),
    };
  });

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
