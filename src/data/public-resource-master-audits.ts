import { publicResourceHostingGate, publicResources, type PublicResource } from "./public-resources";

export type PublicResourceMasterAuditStatus = "pending" | "approved";

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
  authority: "Binario público pendiente de localización",
  findings: [
    "El maestro está identificado en el handoff, pero todavía no se dispone de un binario localizado para servirlo desde una ruta pública estable.",
  ],
});

const approvedResourceIds = new Set([
  "wondergreen-product-master",
  "wondergreen-guide-cafe",
  "wondergreen-guide-cacao",
  "wondergreen-guide-aguacate",
  "wondergreen-guide-limon-tahiti",
  "wondergreen-guide-pastos",
]);

function approvedAudit(resource: PublicResource): PublicResourceMasterAudit {
  return {
    resourceId: resource.id,
    status: "approved",
    authority: "Aprobación editorial de publicación Wondergreen",
    auditedAt: "2026-08-20",
    findings: [
      "El PDF maestro se publica como pieza editorial completa mediante una ruta pública same-origin; su contenido se conserva sin reescritura.",
      "La versión web continúa funcionando como experiencia navegable independiente y puede evolucionar sin alterar el PDF publicado.",
      "La URL privada de SharePoint no se entrega al navegador; el acceso público pasa por una whitelist server-side de documentos seleccionados.",
    ],
  };
}

export const publicResourceMasterAudits: readonly PublicResourceMasterAudit[] = publicResources
  .filter((resource) => Boolean(resource.masterLabel))
  .map((resource) => approvedResourceIds.has(resource.id) ? approvedAudit(resource) : defaultPendingAudit(resource));

export function getPublicResourceMasterAudit(resourceId: string) {
  return publicResourceMasterAudits.find((audit) => audit.resourceId === resourceId);
}

export function canPublishPublicResourceMaster(resource: PublicResource) {
  if (!resource.masterLabel || !resource.downloadHref) return false;
  const audit = getPublicResourceMasterAudit(resource.id);
  return Boolean(
    audit?.status === "approved"
    && resource.delivery === "web-native-public-download"
    && publicResourceHostingGate.publicDownloadEnabled
    && !publicResourceHostingGate.privateSourceLinksAllowed,
  );
}
