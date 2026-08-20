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

const defaultPendingAudit = (resource: PublicResource): PublicResourceMasterAudit => ({
  resourceId: resource.id,
  status: "pending",
  authority: "Auditoría pública pendiente",
  blockers: [],
  findings: [
    "El maestro está identificado, pero todavía debe conciliar contenido, presentación y destino público antes de habilitar descarga.",
  ],
});

const reviewedAudits: Readonly<Record<string, PublicResourceMasterAudit>> = {
  "wondergreen-product-master": {
    resourceId: "wondergreen-product-master",
    status: "blocked",
    authority: "Auditoría visual del PDF vs. Wondergreen Product Truth",
    auditedAt: "2026-08-20",
    blockers: ["bioinput-claims", "commercial-publication"],
    findings: [
      "La página 9 publica usos y blancos concretos para Extracto de Neem, Extracto Ajo-Ají y Beauveria bassiana, mientras Product Truth exige no publicar blancos, uso o eficacia de esos bioinsumos hasta reconciliar ficha y condición regulatoria.",
      "La página 10 incorpora precios por presentación y una política de descuentos; antes de publicar el PDF completo, esos valores y reglas deben tener aprobación comercial de publicación para la versión vigente.",
      "El PDF permanece como maestro interno de trabajo; no se crea enlace público mientras exista cualquiera de estos bloqueos.",
    ],
  },
  "wondergreen-guide-cafe": {
    resourceId: "wondergreen-guide-cafe",
    status: "blocked",
    authority: "Auditoría visual de Guía Wondergreen Café · 20 páginas vs. Product/Crop Truth",
    auditedAt: "2026-08-20",
    blockers: ["dose-validation", "bioinput-claims"],
    findings: [
      "La página 8 publica dosis preliminares por planta —incluyendo Compost 0,5–1,5 kg/planta y 2Grow sólido 20–50 g/planta— mientras Product Truth mantiene la dosis pública cerrada hasta contar con ficha vigente y validación aplicable.",
      "La página 19 atribuye funciones concretas de manejo a Beauveria, Metarhizium y Extracto Ajo-Ají; esas afirmaciones no pueden sustituir la conciliación de ficha, concentración, blancos y condición regulatoria exigida por Product Truth.",
      "La ruta web de café permanece como autoridad pública; el PDF continúa como maestro interno hasta cerrar ambos bloqueos.",
    ],
  },
  "wondergreen-guide-cacao": {
    resourceId: "wondergreen-guide-cacao",
    status: "blocked",
    authority: "Auditoría visual de Guía Wondergreen Cacao · 20 páginas vs. Product/Crop Truth",
    auditedAt: "2026-08-20",
    blockers: ["dose-validation", "crop-content-reconciliation"],
    findings: [
      "La página 9 publica rangos preliminares de 100–250 g/planta para 0–12 meses y 250–500 g/planta para 1–3 años; la publicación de dosis sigue cerrada mientras no exista soporte técnico vigente reconciliado con la referencia aplicable.",
      "La página 17 desarrolla manejo fitosanitario específico para monilia, Phytophthora, escoba de bruja y barrenadores. Ese nivel de prescripción debe conciliarse con Crop Truth antes de convertirse en contenido descargable público.",
      "La guía puede seguir sirviendo como fuente interna, pero la versión web gobernada conserva la autoridad pública mientras se resuelve la conciliación.",
    ],
  },
  "wondergreen-guide-aguacate": {
    resourceId: "wondergreen-guide-aguacate",
    status: "blocked",
    authority: "Auditoría visual de Guía Wondergreen Aguacate V2 · 20 páginas vs. Product/Crop Truth",
    auditedAt: "2026-08-20",
    blockers: ["dose-validation"],
    findings: [
      "El maestro publica tablas y rangos numéricos de dosis para establecimiento, incluyendo Compost y 2Grow, mientras Product Truth mantiene la publicación de dosis cerrada hasta contar con ficha vigente y validación de aplicación.",
      "La existencia de una dosis en material editorial no convierte esa dosis en verdad pública ni sustituye la ficha técnica vigente.",
      "El PDF permanece retenido; la ruta web de aguacate sigue siendo la versión pública gobernada.",
    ],
  },
  "wondergreen-guide-limon-tahiti": {
    resourceId: "wondergreen-guide-limon-tahiti",
    status: "blocked",
    authority: "Auditoría visual de Guía Wondergreen Cítricos · 20 páginas vs. Product/Crop Truth",
    auditedAt: "2026-08-20",
    blockers: ["dose-validation", "crop-content-reconciliation", "legacy-public-origin"],
    findings: [
      "La página 9 publica dosis preliminares de 100–250 g/planta para 0–12 meses y 250–700 g/planta para 1–3 años; esas tablas no pueden publicarse hasta reconciliar ficha, referencia y validación de dosis.",
      "La página 17 desarrolla manejo específico para HLB/Diaphorina citri, gomosis/Phytophthora, minadores, ácaros, cochinillas y fumagina; ese nivel de detalle debe conciliarse con la ruta pública de limón Tahití antes de liberarse.",
      "El maestro todavía muestra www.greenatics.org en piezas auditadas; el origen público canónico vigente del producto web es greenatics.com.co y debe corregirse antes de una eventual publicación del PDF.",
    ],
  },
  "wondergreen-guide-pastos": {
    resourceId: "wondergreen-guide-pastos",
    status: "blocked",
    authority: "Auditoría visual de Guía Wondergreen Pastos y Praderas · 20 páginas vs. Product/Crop Truth",
    auditedAt: "2026-08-20",
    blockers: ["dose-validation", "crop-content-reconciliation", "legacy-public-origin"],
    findings: [
      "La página 9 publica 2Grow a 80–180 kg/ha y su equivalencia de 0,8–1,8 kg/100 m²; esas dosis no pueden convertirse en recomendación pública hasta quedar respaldadas por la ficha técnica vigente y la validación aplicable.",
      "La guía incorpora recomendaciones operativas sobre plagas, enfermedades, malezas, descanso, humedad y manejo del potrero que deben reconciliarse con el alcance del Crop Truth público antes de liberar el documento completo.",
      "El maestro todavía muestra www.greenatics.org en piezas auditadas; debe actualizarse al origen público canónico vigente antes de una eventual descarga pública.",
    ],
  },
};

export const publicResourceMasterAudits: readonly PublicResourceMasterAudit[] = publicResources
  .filter((resource) => Boolean(resource.masterLabel))
  .map((resource) => reviewedAudits[resource.id] ?? defaultPendingAudit(resource));

export function getPublicResourceMasterAudit(resourceId: string) {
  return publicResourceMasterAudits.find((audit) => audit.resourceId === resourceId);
}

export function canPublishPublicResourceMaster(resource: PublicResource) {
  if (!resource.masterLabel) return false;
  const audit = getPublicResourceMasterAudit(resource.id);
  return Boolean(
    audit?.status === "approved"
    && audit.blockers.length === 0
    && publicResourceHostingGate.publicDownloadEnabled
    && !publicResourceHostingGate.privateSourceLinksAllowed,
  );
}
