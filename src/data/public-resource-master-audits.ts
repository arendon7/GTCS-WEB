import { publicResourceHostingGate, publicResources, type PublicResource } from "./public-resources";

export type PublicResourceMasterAuditStatus = "pending" | "blocked" | "approved";

export type PublicResourceMasterAudit = {
  resourceId: string;
  status: PublicResourceMasterAuditStatus;
  authority: string;
  auditedAt?: string;
  findings: readonly string[];
};

const defaultPendingAudit = (resource: PublicResource): PublicResourceMasterAudit => ({
  resourceId: resource.id,
  status: "pending",
  authority: "Auditoría pública pendiente",
  findings: [
    "El maestro está identificado, pero todavía debe conciliar contenido, presentación y destino público antes de habilitar descarga.",
  ],
});

const catalogAudit: PublicResourceMasterAudit = {
  resourceId: "wondergreen-product-master",
  status: "blocked",
  authority: "Auditoría visual del PDF vs. Wondergreen Product Truth",
  auditedAt: "2026-08-20",
  findings: [
    "La página 9 publica usos y blancos concretos para Extracto de Neem, Extracto Ajo-Ají y Beauveria bassiana, mientras Product Truth exige no publicar blancos, uso o eficacia de esos bioinsumos hasta reconciliar ficha y condición regulatoria.",
    "La página 10 incorpora precios por presentación y una política de descuentos; antes de publicar el PDF completo, esos valores y reglas deben tener aprobación comercial de publicación para la versión vigente.",
    "El PDF permanece como maestro interno de trabajo; no se crea enlace público mientras exista cualquiera de estos bloqueos.",
  ],
};

export const publicResourceMasterAudits: readonly PublicResourceMasterAudit[] = publicResources
  .filter((resource) => Boolean(resource.masterLabel))
  .map((resource) => resource.id === catalogAudit.resourceId ? catalogAudit : defaultPendingAudit(resource));

export function getPublicResourceMasterAudit(resourceId: string) {
  return publicResourceMasterAudits.find((audit) => audit.resourceId === resourceId);
}

export function canPublishPublicResourceMaster(resource: PublicResource) {
  if (!resource.masterLabel) return false;
  const audit = getPublicResourceMasterAudit(resource.id);
  return Boolean(
    audit?.status === "approved"
    && publicResourceHostingGate.publicDownloadEnabled
    && !publicResourceHostingGate.privateSourceLinksAllowed,
  );
}
