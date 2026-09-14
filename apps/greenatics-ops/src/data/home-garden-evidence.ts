export type HomeGardenEvidenceKind =
  | "product-truth"
  | "laboratory-report"
  | "regulatory-registration"
  | "approved-label"
  | "sku-master"
  | "dose-validation"
  | "cost-model"
  | "fulfillment-record"
  | "public-asset";

export type HomeGardenEvidenceGateId =
  | "technical-product-truth"
  | "household-skus"
  | "regulatory"
  | "dose-and-dosifier"
  | "all-in-cost"
  | "fulfillment"
  | "public-assets";

export type HomeGardenEvidenceRule = {
  kind: HomeGardenEvidenceKind;
  label: string;
  supports: readonly string[];
  doesNotProve: readonly string[];
  eligibleToClose: readonly HomeGardenEvidenceGateId[];
};

export type HomeGardenEvidenceRecord = {
  kind: HomeGardenEvidenceKind;
  verified: boolean;
  sameReference: boolean;
  samePresentation: boolean;
  completeForGate: boolean;
};

export type HomeGardenGateEvidenceRequirement = {
  gate: HomeGardenEvidenceGateId;
  requiredEvidence: readonly HomeGardenEvidenceKind[];
  requireSameReference: boolean;
  requireSamePresentation: boolean;
  rule: string;
};

export const homeGardenEvidenceRules: readonly HomeGardenEvidenceRule[] = [
  {
    kind: "product-truth",
    label: "Product Truth",
    supports: ["Nombre técnico", "fórmula", "familia", "formato y condición pública gobernada"],
    doesNotProve: ["Registro de venta", "etiqueta aprobada", "stock", "PVP", "margen"],
    eligibleToClose: ["technical-product-truth"],
  },
  {
    kind: "laboratory-report",
    label: "Reporte de laboratorio",
    supports: ["Resultado analítico de la muestra ensayada bajo el alcance del reporte"],
    doesNotProve: ["Registro de venta del producto", "autorización de una presentación", "etiqueta aprobada", "eficacia comercial", "PVP"],
    eligibleToClose: [],
  },
  {
    kind: "regulatory-registration",
    label: "Registro o cobertura regulatoria aplicable",
    supports: ["Condición regulatoria documentada de la referencia dentro de su alcance"],
    doesNotProve: ["Que cualquier nuevo tamaño o arte esté cubierto", "costo", "stock", "dosificación doméstica"],
    eligibleToClose: ["regulatory"],
  },
  {
    kind: "approved-label",
    label: "Etiqueta o arte regulatoriamente conciliado",
    supports: ["Correspondencia entre referencia, presentación, rotulado y condición regulatoria"],
    doesNotProve: ["Stock", "PVP", "margen", "capacidad logística"],
    eligibleToClose: ["regulatory", "public-assets"],
  },
  {
    kind: "sku-master",
    label: "SKU Master",
    supports: ["Identidad comercial de una presentación reconciliada con producto, empaque y trazabilidad"],
    doesNotProve: ["Disponibilidad física", "precio", "margen", "cobertura regulatoria por sí solo"],
    eligibleToClose: ["household-skus"],
  },
  {
    kind: "dose-validation",
    label: "Validación de dosis doméstica",
    supports: ["Equivalencia de dosis y dosificador para la formulación y contexto validados"],
    doesNotProve: ["Una dosis universal para todas las plantas", "registro de venta", "precio"],
    eligibleToClose: ["dose-and-dosifier"],
  },
  {
    kind: "cost-model",
    label: "Modelo de costo all-in",
    supports: ["Costo puesto a venta cuando incluye todos los componentes exigidos por el checklist vigente"],
    doesNotProve: ["PVP autorizado si el modelo está incompleto", "registro de venta", "stock"],
    eligibleToClose: ["all-in-cost"],
  },
  {
    kind: "fulfillment-record",
    label: "Evidencia operativa de fulfillment",
    supports: ["Stock vendible, armado, embalaje, tiempos, despacho y tratamiento logístico reconciliados"],
    doesNotProve: ["Registro de venta", "dosis", "PVP por sí solo"],
    eligibleToClose: ["fulfillment"],
  },
  {
    kind: "public-asset",
    label: "Activo público auditado",
    supports: ["Packshot, guía o QR reconciliado con la referencia y destino público final"],
    doesNotProve: ["Fórmula distinta a Product Truth", "registro de venta", "precio", "stock"],
    eligibleToClose: ["public-assets"],
  },
] as const;

export const homeGardenGateEvidenceRequirements: readonly HomeGardenGateEvidenceRequirement[] = [
  {
    gate: "technical-product-truth",
    requiredEvidence: ["product-truth"],
    requireSameReference: true,
    requireSamePresentation: false,
    rule: "La identidad técnica debe provenir de Product Truth vigente; un arte o reporte analítico no puede reemplazarlo.",
  },
  {
    gate: "household-skus",
    requiredEvidence: ["sku-master"],
    requireSameReference: true,
    requireSamePresentation: true,
    rule: "Cada presentación doméstica debe existir como SKU reconciliado con referencia, empaque y trazabilidad.",
  },
  {
    gate: "regulatory",
    requiredEvidence: ["regulatory-registration", "approved-label"],
    requireSameReference: true,
    requireSamePresentation: true,
    rule: "El gate regulatorio exige cobertura documental y etiqueta conciliada para la misma referencia y presentación; un reporte de laboratorio nunca basta.",
  },
  {
    gate: "dose-and-dosifier",
    requiredEvidence: ["dose-validation"],
    requireSameReference: true,
    requireSamePresentation: true,
    rule: "La dosis doméstica debe estar validada para la formulación y presentación que se pretende publicar.",
  },
  {
    gate: "all-in-cost",
    requiredEvidence: ["cost-model"],
    requireSameReference: true,
    requireSamePresentation: true,
    rule: "Un costo parcial de fertilizante o empaque no cierra economía unitaria: el modelo debe estar completo para el checklist all-in vigente.",
  },
  {
    gate: "fulfillment",
    requiredEvidence: ["fulfillment-record"],
    requireSameReference: true,
    requireSamePresentation: true,
    rule: "La promesa comercial requiere evidencia operativa reconciliada de stock, armado, embalaje y despacho.",
  },
  {
    gate: "public-assets",
    requiredEvidence: ["approved-label", "public-asset"],
    requireSameReference: true,
    requireSamePresentation: true,
    rule: "Los activos finales deben coincidir con la referencia, presentación, etiqueta y destino público auditados.",
  },
] as const;

export function getHomeGardenEvidenceRule(kind: HomeGardenEvidenceKind) {
  return homeGardenEvidenceRules.find((rule) => rule.kind === kind);
}

export function getHomeGardenGateEvidenceRequirement(gate: HomeGardenEvidenceGateId) {
  return homeGardenGateEvidenceRequirements.find((requirement) => requirement.gate === gate);
}

export function canHomeGardenEvidenceSetCloseGate(
  gate: HomeGardenEvidenceGateId,
  evidence: readonly HomeGardenEvidenceRecord[],
) {
  const requirement = getHomeGardenGateEvidenceRequirement(gate);
  if (!requirement) return false;

  return requirement.requiredEvidence.every((requiredKind) => {
    const record = evidence.find((candidate) => candidate.kind === requiredKind);
    if (!record || !record.verified || !record.completeForGate) return false;
    if (requirement.requireSameReference && !record.sameReference) return false;
    if (requirement.requireSamePresentation && !record.samePresentation) return false;

    const rule = getHomeGardenEvidenceRule(requiredKind);
    return Boolean(rule?.eligibleToClose.includes(gate));
  });
}
