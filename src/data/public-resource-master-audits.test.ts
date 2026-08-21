import { describe, expect, it } from "vitest";
import { publicResources } from "./public-resources";
import {
  canPublishPublicResourceMaster,
  getPublicResourceMasterAudit,
  publicResourceMasterAudits,
} from "./public-resource-master-audits";

const approvedIds = [
  "wondergreen-product-master",
  "wondergreen-guide-cafe",
  "wondergreen-guide-cacao",
  "wondergreen-guide-aguacate",
  "wondergreen-guide-limon-tahiti",
  "wondergreen-guide-pastos",
];

describe("public resource master audits", () => {
  it("covers every resource that references a document master", () => {
    const masterResources = publicResources.filter((resource) => resource.masterLabel);
    expect(publicResourceMasterAudits).toHaveLength(masterResources.length);
    expect(publicResourceMasterAudits.map((audit) => audit.resourceId).sort())
      .toEqual(masterResources.map((resource) => resource.id).sort());
  });

  it("records the catalog and five crop guides as explicitly approved for publication", () => {
    for (const resourceId of approvedIds) {
      const audit = getPublicResourceMasterAudit(resourceId);
      expect(audit?.status).toBe("approved");
      expect(audit?.auditedAt).toBe("2026-08-20");
      expect(audit?.blockers).toEqual([]);
      expect(audit?.findings.join(" ")).toMatch(/autorizada|same-origin/i);
    }
  });

  it("makes all six approved masters publishable through their same-origin download routes", () => {
    for (const resourceId of approvedIds) {
      const resource = publicResources.find((item) => item.id === resourceId);
      expect(resource?.delivery).toBe("public-download");
      expect(resource?.downloadHref).toBe(`/api/public-resources/${resourceId}`);
      expect(resource && canPublishPublicResourceMaster(resource)).toBe(true);
    }
  });

  it("leaves Casa Jardin masters pending until their actual binaries are available", () => {
    const homeGardenAudits = publicResourceMasterAudits.filter((item) => item.resourceId.startsWith("home-garden-guide-"));
    expect(homeGardenAudits).toHaveLength(4);
    for (const audit of homeGardenAudits) {
      expect(audit.status).toBe("pending");
      expect(audit.blockers).toEqual([]);
    }
    for (const resource of publicResources.filter((item) => item.id.startsWith("home-garden-guide-"))) {
      expect(canPublishPublicResourceMaster(resource)).toBe(false);
    }
  });
});
