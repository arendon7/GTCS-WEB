import { describe, expect, it } from "vitest";
import { publicResources } from "./public-resources";
import {
  canPublishPublicResourceMaster,
  getPublicResourceMasterAudit,
  publicResourceMasterAudits,
} from "./public-resource-master-audits";

const publishedIds = [
  "wondergreen-product-master",
  "wondergreen-guide-cafe",
  "wondergreen-guide-cacao",
  "wondergreen-guide-aguacate",
  "wondergreen-guide-limon-tahiti",
  "wondergreen-guide-pastos",
] as const;

describe("public resource master audits", () => {
  it("covers every resource that references a document master", () => {
    const masterResources = publicResources.filter((resource) => resource.masterLabel);
    expect(publicResourceMasterAudits).toHaveLength(masterResources.length);
    expect(publicResourceMasterAudits.map((audit) => audit.resourceId).sort())
      .toEqual(masterResources.map((resource) => resource.id).sort());
  });

  it("approves the catalog and five governed crop masters for public PDF delivery", () => {
    for (const resourceId of publishedIds) {
      const audit = getPublicResourceMasterAudit(resourceId);
      expect(audit?.status).toBe("approved");
      expect(audit?.auditedAt).toBe("2026-08-20");
      expect(audit?.findings.join(" ")).toMatch(/same-origin/i);
    }
  });

  it("publishes exactly the approved resources through same-origin download routes", () => {
    const published = publicResources.filter((resource) => publishedIds.includes(resource.id as typeof publishedIds[number]));
    expect(published).toHaveLength(6);
    for (const resource of published) {
      expect(resource.delivery).toBe("web-native-public-download");
      expect(resource.downloadHref).toMatch(/^\/descargas\//);
      expect(resource.downloadHref).not.toMatch(/sharepoint|graph\.microsoft/i);
      expect(canPublishPublicResourceMaster(resource)).toBe(true);
    }
  });

  it("leaves Casa Jardin masters pending only because their public binaries are not yet located", () => {
    const homeGardenAudits = publicResourceMasterAudits.filter((item) => item.resourceId.startsWith("home-garden-guide-"));
    expect(homeGardenAudits).toHaveLength(4);
    for (const audit of homeGardenAudits) {
      expect(audit.status).toBe("pending");
      expect(audit.findings.join(" ")).toMatch(/binario/i);
    }
  });

  it("does not invent download URLs for resources without a localized public binary", () => {
    for (const resource of publicResources.filter((item) => item.masterLabel && !publishedIds.includes(item.id as typeof publishedIds[number]))) {
      expect(resource.downloadHref).toBeUndefined();
      expect(canPublishPublicResourceMaster(resource)).toBe(false);
    }
  });
});
