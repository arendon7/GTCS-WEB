import { describe, expect, it } from "vitest";
import type { HomeGardenLaunchEvidenceRevision } from "./home-garden-readiness-registry";
import {
  buildHomeGardenReadinessRegistry,
  canAppendHomeGardenEvidence,
  canManageHomeGardenReadiness,
  getNextHomeGardenEvidenceKind,
  homeGardenLaunchEvidenceKinds,
  selectLatestHomeGardenEvidence,
} from "./home-garden-readiness-registry";

const revision = (
  overrides: Partial<HomeGardenLaunchEvidenceRevision> = {},
): HomeGardenLaunchEvidenceRevision => ({
  id: "rev-1",
  revisionNo: 1,
  candidateId: "crece-500-g",
  evidenceKind: "sku-master",
  disposition: "verified",
  title: "SKU Master CRECE 500 g",
  sourceReference: "SharePoint/Wondergreen/SKU Master.xlsx",
  sameReference: true,
  samePresentation: true,
  completeForGate: true,
  note: "Conciliado.",
  effectiveAt: "2026-08-20T12:00:00Z",
  createdAt: "2026-08-20T12:00:00Z",
  createdBy: "user-1",
  ...overrides,
});

describe("home garden readiness registry", () => {
  it("allows only technical, admin and director roles to view company launch readiness", () => {
    expect(canManageHomeGardenReadiness("technical")).toBe(true);
    expect(canManageHomeGardenReadiness("admin")).toBe(true);
    expect(canManageHomeGardenReadiness("director")).toBe(true);
    expect(canManageHomeGardenReadiness("supervisor")).toBe(false);
    expect(canManageHomeGardenReadiness("operator")).toBe(false);
  });

  it("keeps Product Truth outside the operational evidence ledger", () => {
    expect(homeGardenLaunchEvidenceKinds).not.toContain("product-truth");
    expect(homeGardenLaunchEvidenceKinds).toHaveLength(8);
  });

  it("separates technical evidence authorship from commercial and financial evidence", () => {
    expect(canAppendHomeGardenEvidence("technical", "laboratory-report")).toBe(true);
    expect(canAppendHomeGardenEvidence("technical", "regulatory-registration")).toBe(true);
    expect(canAppendHomeGardenEvidence("technical", "approved-label")).toBe(true);
    expect(canAppendHomeGardenEvidence("technical", "dose-validation")).toBe(true);
    expect(canAppendHomeGardenEvidence("technical", "sku-master")).toBe(false);
    expect(canAppendHomeGardenEvidence("technical", "cost-model")).toBe(false);
    expect(canAppendHomeGardenEvidence("technical", "fulfillment-record")).toBe(false);
    expect(canAppendHomeGardenEvidence("technical", "public-asset")).toBe(false);
    expect(canAppendHomeGardenEvidence("admin", "cost-model")).toBe(true);
    expect(canAppendHomeGardenEvidence("director", "public-asset")).toBe(true);
    expect(canAppendHomeGardenEvidence("supervisor", "approved-label")).toBe(false);
  });

  it("uses only the latest revision per candidate and evidence kind", () => {
    const selected = selectLatestHomeGardenEvidence([
      revision({ revisionNo: 1, disposition: "verified" }),
      revision({ id: "rev-2", revisionNo: 2, disposition: "rejected", completeForGate: false }),
      revision({ id: "rev-3", revisionNo: 3, candidateId: "equilibra-1-kg", evidenceKind: "cost-model" }),
    ]);

    expect(selected).toHaveLength(2);
    expect(selected.find((item) => item.candidateId === "crece-500-g")?.revisionNo).toBe(2);
    expect(selected.find((item) => item.candidateId === "crece-500-g")?.disposition).toBe("rejected");
  });

  it("builds all 18 candidates and a seven-front operational blocker summary", () => {
    const registry = buildHomeGardenReadinessRegistry([]);
    expect(registry.summary.total).toBe(18);
    expect(registry.summary.commerceReady).toBe(0);
    expect(registry.summary.pending).toBe(18);
    expect(registry.summary.openGateInstances).toBe(108);
    expect(registry.items.every((item) => item.gates["technical-product-truth"])).toBe(true);
    expect(registry.items.every((item) => item.commerceReady === false)).toBe(true);
    expect(registry.workstreams).toHaveLength(7);

    const productTruth = registry.workstreams.find((item) => item.gate === "technical-product-truth");
    expect(productTruth).toMatchObject({ lane: "canonical", total: 18, closedCount: 18, openCount: 0 });

    const regulatory = registry.workstreams.find((item) => item.gate === "regulatory");
    expect(regulatory).toMatchObject({ lane: "technical", total: 18, closedCount: 0, openCount: 18 });

    const cost = registry.workstreams.find((item) => item.gate === "all-in-cost");
    expect(cost).toMatchObject({ lane: "admin-director", total: 18, closedCount: 0, openCount: 18 });
  });

  it("derives the exact missing evidence for a multi-document regulatory gate", () => {
    const registry = buildHomeGardenReadinessRegistry([]);
    const item = registry.items.find((candidate) => candidate.id === "crece-500-g");
    const regulatory = item?.gateEvidence.regulatory;

    expect(regulatory).toHaveLength(2);
    expect(regulatory?.map((state) => [state.kind, state.status])).toEqual([
      ["regulatory-registration", "missing"],
      ["approved-label", "missing"],
    ]);
    expect(item && getNextHomeGardenEvidenceKind(item, "regulatory")).toBe("regulatory-registration");
  });

  it("advances to the second regulatory requirement when the first is ready", () => {
    const registry = buildHomeGardenReadinessRegistry([
      revision({
        id: "reg-1",
        evidenceKind: "regulatory-registration",
        title: "Cobertura regulatoria CRECE 500 g",
      }),
    ]);
    const item = registry.items.find((candidate) => candidate.id === "crece-500-g");
    const regulatory = item?.gateEvidence.regulatory;

    expect(regulatory?.find((state) => state.kind === "regulatory-registration")?.status).toBe("ready");
    expect(regulatory?.find((state) => state.kind === "approved-label")?.status).toBe("missing");
    expect(item && getNextHomeGardenEvidenceKind(item, "regulatory")).toBe("approved-label");
    expect(item?.gates.regulatory).toBe(false);
  });

  it("marks a non-verified latest revision as needs-review instead of treating it as missing", () => {
    const registry = buildHomeGardenReadinessRegistry([
      revision({
        id: "label-draft",
        evidenceKind: "approved-label",
        disposition: "draft",
        completeForGate: false,
        title: "Etiqueta CRECE 500 g en revisión",
      }),
    ]);
    const item = registry.items.find((candidate) => candidate.id === "crece-500-g");
    const labelState = item?.gateEvidence.regulatory.find((state) => state.kind === "approved-label");

    expect(labelState?.status).toBe("needs-review");
    expect(labelState?.latestRevision?.id).toBe("label-draft");
    expect(labelState?.reason).toMatch(/borrador/i);
  });

  it("has no next regulatory evidence once both required revisions satisfy the gate", () => {
    const registry = buildHomeGardenReadinessRegistry([
      revision({
        id: "reg-1",
        revisionNo: 1,
        evidenceKind: "regulatory-registration",
        title: "Cobertura regulatoria CRECE 500 g",
      }),
      revision({
        id: "label-2",
        revisionNo: 2,
        evidenceKind: "approved-label",
        title: "Etiqueta conciliada CRECE 500 g",
      }),
    ]);
    const item = registry.items.find((candidate) => candidate.id === "crece-500-g");

    expect(item?.gates.regulatory).toBe(true);
    expect(item?.gateEvidence.regulatory.every((state) => state.status === "ready")).toBe(true);
    expect(item && getNextHomeGardenEvidenceKind(item, "regulatory")).toBeUndefined();
  });

  it("reduces a workstream blocker count only for the exact presentation whose gate closes", () => {
    const registry = buildHomeGardenReadinessRegistry([revision()]);
    const skuWorkstream = registry.workstreams.find((item) => item.gate === "household-skus");

    expect(skuWorkstream).toMatchObject({ total: 18, closedCount: 1, openCount: 17 });
    expect(skuWorkstream?.openCandidateIds).not.toContain("crece-500-g");
    expect(skuWorkstream?.openCandidateIds).toHaveLength(17);
    expect(registry.summary.openGateInstances).toBe(107);
  });

  it("reopens a gate when the latest revision supersedes an older verified record", () => {
    const registry = buildHomeGardenReadinessRegistry([
      revision({ revisionNo: 1, disposition: "verified" }),
      revision({ id: "rev-2", revisionNo: 2, disposition: "rejected", completeForGate: false }),
    ]);
    const item = registry.items.find((candidate) => candidate.id === "crece-500-g");
    expect(item?.gates["household-skus"]).toBe(false);
    expect(item?.latestEvidence).toHaveLength(1);
    expect(item?.latestEvidence[0]?.revisionNo).toBe(2);
    expect(item?.gateEvidence["household-skus"][0]?.status).toBe("needs-review");
    expect(registry.workstreams.find((workstream) => workstream.gate === "household-skus")?.openCount).toBe(18);
  });

  it("flags evidence for candidate ids that no longer exist instead of silently applying it", () => {
    const registry = buildHomeGardenReadinessRegistry([
      revision({ candidateId: "legacy-unknown-500-g" }),
    ]);
    expect(registry.summary.orphanEvidence).toBe(1);
    expect(registry.orphanEvidence[0]?.candidateId).toBe("legacy-unknown-500-g");
    expect(registry.items.every((item) => item.latestEvidence.length === 0)).toBe(true);
  });
});
