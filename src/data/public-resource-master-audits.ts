import { publicResourceHostingGate, publicResources, type PublicResource } from "./public-resources";

export type PublicResourceMasterAuditStatus = "pending" | "blocked" | "approved";
export type PublicResourceMasterAuditBlocker =
  | "dose-validation"
  | "bioinput-claims"
  | "crop-content-reconciliation"
  | "commercial-publication"
  | "legacy-public-origin";

export type PublicResourceMasterAudit = {
  resourceId: string;
  status: PublicResourceMasterAuditStatus;
  authority: string;
  auditedAt?: string;
  blockers: readonly PublicResourceMasterAuditBlocker[];
  findings: readonly string[];
};

const explicitlyApprovedWondergreenMasters = new Set([
  "wondergreen-product-master",
  "wondergreen-guide-cafe",
  "wondergreen-guide-cacao",
  "wondergreen-guide-aguacate",
  "wondergreen-guide-limon-tahiti",
  "wondergreen-guide-pastos",
]);

const reconstructedHomeGardenMasters = new Set([
  "home-garden-guide-casa-jardin",
  "home-garden-guide-mi-huerta",
  "home-garden-guide-etapas",
  "home-garden-guide-trasplante",
]);

const defaultPendingAudit = (resource: PublicResource): PublicResourceMasterAudit => ({
  resourceId: resource.id,
  status: "pending",
  authority: "Auditoría pública pendiente",
  blockers: [],
  findings: [
    "El maestro está identificado, pero todavía debe existir un binario público explícitamente aprobado antes de habilitar su descarga.",
  ],
});

const approvedAudit = (resource: PublicResource): PublicResourceMasterAudit => ({
  resourceId: resource.id,
  status: "approved",
  authority: "Aprobación explícita de publicación del contenido Wondergreen",
  auditedAt: "2026-08-20",
  blockers: [],
  findings: [
    "La publicación integral de este PDF fue autorizada de forma explícita; sus tablas, imágenes, textos y claims pueden permanecer visibles en el documento descargable.",
    "La entrega pública se realiza mediante una ruta same-origin de Greenatics sin exponer enlaces privados de SharePoint.",
  ],
});

const approvedReconstructedHomeGardenAudit = (resource: PublicResource): PublicResourceMasterAudit => ({
  resourceId: resource.id,
  status: "approved",
  authority: "Wondergreen Casa & Jardín Truth · master público reconstruido y revisado",
  auditedAt: "2026-08-21",
  blockers: [],
  findings: [
    "El binario histórico del handoff no se declara recuperado ni idéntico: este es un master público reconstruido desde el contenido web gobernado y los activos Wondergreen aprobados.",
    "El master reconstruido fue renderizado y revisado visualmente antes de publicación; conserva los guardrails vigentes de Casa & Jardín y no introduce precios, checkout ni una calculadora pública de dosis.",
    "La entrega pública se realiza mediante una ruta same-origin de Greenatics sin exponer enlaces privados de SharePoint.",
  ],
});

export const publicResourceMasterAudits: readonly PublicResourceMasterAudit[] = publicResources
  .filter((resource) => Boolean(resource.masterLabel))
  .map((resource) => {
    if (explicitlyApprovedWondergreenMasters.has(resource.id)) return approvedAudit(resource);
    if (reconstructedHomeGardenMasters.has(resource.id)) return approvedReconstructedHomeGardenAudit(resource);
    return defaultPendingAudit(resource);
  });

export function getPublicResourceMasterAudit(resourceId: string) {
  return publicResourceMasterAudits.find((audit) => audit.resourceId === resourceId);
}

export function canPublishPublicResourceMaster(resource: PublicResource) {
  if (!resource.masterLabel || !resource.downloadHref) return false;
  const audit = getPublicResourceMasterAudit(resource.id);
  return Boolean(
    audit?.status === "approved"
    && audit.blockers.length === 0
    && publicResourceHostingGate.publicDownloadEnabled
    && !publicResourceHostingGate.privateSourceLinksAllowed,
  );
}
