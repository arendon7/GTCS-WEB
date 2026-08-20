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
    expect(audit?.findings.join(" ")).toMatch(/Neem/i);
    expect(audit?.findings.join(" ")).toMatch(/Beauveria/i);
    expect(audit?.findings.join(" ")).toMatch(/precios|descuentos/i);
  });

  it("keeps crop and Casa Jardin masters pending until each PDF is audited", () => {
    for (const audit of publicResourceMasterAudits.filter((item) => item.resourceId !== "wondergreen-product-master")) {
      expect(audit.status).toBe("pending");
      expect(audit.findings.length).toBeGreaterThan(0);
    }
  });

  it("cannot publish any master while content or hosting gates remain open", () => {
    for (const resource of publicResources.filter((item) => item.masterLabel)) {
      expect(canPublishPublicResourceMaster(resource)).toBe(false);
    }
  });
});
