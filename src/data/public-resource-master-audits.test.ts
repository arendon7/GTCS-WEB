import { describe, expect, it } from "vitest";
import { publicResources } from "./public-resources";
import {
  canPublishPublicResourceMaster,
  getPublicResourceMasterAudit,
  publicResourceMasterAudits,
} from "./public-resource-master-audits";

describe("public resource master audits", () => {
  it("covers every resource that references a document master", () => {
    const masterResources = publicResources.filter((resource) => resource.masterLabel);
    expect(publicResourceMasterAudits).toHaveLength(masterResources.length);
    expect(publicResourceMasterAudits.map((audit) => audit.resourceId).sort())
      .toEqual(masterResources.map((resource) => resource.id).sort());
  });

  it("keeps the 10-page Wondergreen catalog blocked after Product Truth audit", () => {
    const audit = getPublicResourceMasterAudit("wondergreen-product-master");
    expect(audit?.status).toBe("blocked");
    expect(audit?.auditedAt).toBe("2026-08-20");
    expect(audit?.blockers).toEqual(expect.arrayContaining(["bioinput-claims", "commercial-publication"]));
    expect(audit?.findings.join(" ")).toMatch(/Neem/i);
    expect(audit?.findings.join(" ")).toMatch(/Beauveria/i);
    expect(audit?.findings.join(" ")).toMatch(/precios|descuentos/i);
  });

  it("records all five governed crop masters as blocked after visual audit", () => {
    const cropIds = [
      "wondergreen-guide-cafe",
      "wondergreen-guide-cacao",
      "wondergreen-guide-aguacate",
      "wondergreen-guide-limon-tahiti",
      "wondergreen-guide-pastos",
    ];

    for (const resourceId of cropIds) {
      const audit = getPublicResourceMasterAudit(resourceId);
      expect(audit?.status).toBe("blocked");
      expect(audit?.auditedAt).toBe("2026-08-20");
      expect(audit?.blockers).toContain("dose-validation");
      expect(audit?.findings.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("preserves the extra claim reconciliation blockers found in audited crop PDFs", () => {
    expect(getPublicResourceMasterAudit("wondergreen-guide-cafe")?.blockers).toContain("bioinput-claims");

    for (const resourceId of ["wondergreen-guide-cacao", "wondergreen-guide-limon-tahiti", "wondergreen-guide-pastos"]) {
      expect(getPublicResourceMasterAudit(resourceId)?.blockers).toContain("crop-content-reconciliation");
    }

    for (const resourceId of ["wondergreen-guide-limon-tahiti", "wondergreen-guide-pastos"]) {
      expect(getPublicResourceMasterAudit(resourceId)?.blockers).toContain("legacy-public-origin");
    }
  });

  it("leaves unaudited Casa Jardin masters pending rather than treating discovery as approval", () => {
    const homeGardenAudits = publicResourceMasterAudits.filter((item) => item.resourceId.startsWith("home-garden-guide-"));
    expect(homeGardenAudits).toHaveLength(4);
    for (const audit of homeGardenAudits) {
      expect(audit.status).toBe("pending");
      expect(audit.blockers).toEqual([]);
      expect(audit.findings.length).toBeGreaterThan(0);
    }
  });

  it("cannot publish any master while content or hosting gates remain open", () => {
    for (const resource of publicResources.filter((item) => item.masterLabel)) {
      expect(canPublishPublicResourceMaster(resource)).toBe(false);
    }
  });
});
