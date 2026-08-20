import { describe, expect, it } from "vitest";
import type { HomeGardenLaunchEvidenceRevision } from "./home-garden-readiness-registry";
import {
  buildHomeGardenReadinessRegistry,
  canManageHomeGardenReadiness,
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
  it("allows only technical, admin and director roles to manage company launch evidence", () => {
    expect(canManageHomeGardenReadiness("technical")).toBe(true);
    expect(canManageHomeGardenReadiness("admin")).toBe(true);
    expect(canManageHomeGardenReadiness("director")).toBe(true);
    expect(canManageHomeGardenReadiness("supervisor")).toBe(false);
    expect(canManageHomeGardenReadiness("operator")).toBe(false);
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

  it("builds all 18 candidates and keeps them pending without full evidence", () => {
    const registry = buildHomeGardenReadinessRegistry([]);
    expect(registry.summary.total).toBe(18);
    expect(registry.summary.commerceReady).toBe(0);
    expect(registry.summary.pending).toBe(18);
    expect(registry.items.every((item) => item.gates["technical-product-truth"])).toBe(true);
    expect(registry.items.every((item) => item.commerceReady === false)).toBe(true);
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
