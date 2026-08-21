import { describe, expect, it } from "vitest";
import { publicResources } from "./public-resources";
import {
  canPublishPublicResourceMaster,
  getPublicResourceMasterAudit,
  publicResourceMasterAudits,
} from "./public-resource-master-audits";

const legacyApprovedIds = [
  "wondergreen-product-master",
  "wondergreen-guide-cafe",
  "wondergreen-guide-cacao",
  "wondergreen-guide-aguacate",
  "wondergreen-guide-limon-tahiti",
  "wondergreen-guide-pastos",
];

const homeGardenApprovedIds = [
  "home-garden-guide-casa-jardin",
  "home-garden-guide-mi-huerta",
  "home-garden-guide-etapas",
  "home-garden-guide-trasplante",
];

const approvedIds = [...legacyApprovedIds, ...homeGardenApprovedIds];

describe("public resource master audits", () => {
  it("covers every resource that references a document master", () => {
    const masterResources = publicResources.filter((resource) => resource.masterLabel);
    expect(publicResourceMasterAudits).toHaveLength(masterResources.length);
    expect(publicResourceMasterAudits.map((audit) => audit.resourceId).sort())
      .toEqual(masterResources.map((resource) => resource.id).sort());
  });

  it("keeps the catalog and five crop guides under their explicit publication approval", () => {
    for (const resourceId of legacyApprovedIds) {
      const audit = getPublicResourceMasterAudit(resourceId);
      expect(audit?.status).toBe("approved");
      expect(audit?.auditedAt).toBe("2026-08-20");
      expect(audit?.blockers).toEqual([]);
      expect(audit?.findings.join(" ")).toMatch(/autorizada|same-origin/i);
    }
  });

  it("approves the four Casa Jardin masters as reconstructed public binaries without claiming historical identity", () => {
    for (const resourceId of homeGardenApprovedIds) {
      const audit = getPublicResourceMasterAudit(resourceId);
      expect(audit?.status).toBe("approved");
      expect(audit?.auditedAt).toBe("2026-08-21");
      expect(audit?.blockers).toEqual([]);
      expect(audit?.authority).toMatch(/reconstruido/i);
      expect(audit?.findings.join(" ")).toMatch(/no se declara recuperado ni idéntico/i);
      expect(audit?.findings.join(" ")).toMatch(/precios, checkout|calculadora pública de dosis/i);
    }
  });

  it("makes all ten approved masters publishable through same-origin download routes", () => {
    for (const resourceId of approvedIds) {
      const resource = publicResources.find((item) => item.id === resourceId);
      expect(resource?.delivery).toBe("public-download");
      expect(resource?.downloadHref).toBe(`/api/public-resources/${resourceId}`);
      expect(resource && canPublishPublicResourceMaster(resource)).toBe(true);
    }
  });
});
