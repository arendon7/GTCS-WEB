import type { OperationalMasterRole, OperationalMasterSnapshot } from "@/lib/operational-master-data";

export type LegacyOperationalFieldKind = "process" | "activity" | "equipment";
export type LegacyResolutionMethod = "exact" | "curated" | "unmapped";

export type LegacyReconciliationRow = {
  fieldKind: LegacyOperationalFieldKind;
  legacyValue: string;
  normalizedValue: string;
  occurrenceCount: number;
  activityRows: number;
  scheduledRows: number;
  resolutionMethod: LegacyResolutionMethod;
  targetId?: string;
  targetCode?: string;
  targetName?: string;
};

export type LegacyReconciliationMetric = {
  fieldKind: LegacyOperationalFieldKind;
  totalRows: number;
  canonicalRows: number;
  pendingRows: number;
  resolvableRows: number;
  unmappedRows: number;
  coveragePercent: number;
};

export type LegacyReconciliationApplyResult = {
  activitiesProcess: number;
  activitiesTemplate: number;
  activitiesEquipment: number;
  scheduledProcess: number;
  scheduledTemplate: number;
  scheduledEquipment: number;
  templateProcessConflicts: number;
};

export type LegacyCanonicalOption = {
  id: string;
  code: string;
  name: string;
  active: boolean;
};

export const legacyFieldLabels: Record<LegacyOperationalFieldKind, string> = {
  process: "Proceso",
  activity: "Actividad",
  equipment: "Equipo",
};

export const legacyResolutionLabels: Record<LegacyResolutionMethod, string> = {
  exact: "Coincidencia exacta",
  curated: "Equivalencia curada",
  unmapped: "Sin equivalencia segura",
};

export function canCurateLegacyOperationalMappings(role?: OperationalMasterRole | string) {
  return role === "admin" || role === "director";
}

export function canonicalOptionsForLegacyKind(
  snapshot: OperationalMasterSnapshot,
  fieldKind: LegacyOperationalFieldKind,
): LegacyCanonicalOption[] {
  if (fieldKind === "process") {
    return snapshot.processes.map(({ id, code, name, active }) => ({ id, code, name, active }));
  }
  if (fieldKind === "activity") {
    return snapshot.activityTemplates.map(({ id, code, name, active }) => ({ id, code, name, active }));
  }
  return snapshot.equipment.map(({ id, code, name }) => ({ id, code, name, active: true }));
}

export function reconciliationApplySummary(result: LegacyReconciliationApplyResult) {
  const updated = result.activitiesProcess
    + result.activitiesTemplate
    + result.activitiesEquipment
    + result.scheduledProcess
    + result.scheduledTemplate
    + result.scheduledEquipment;

  const conflictText = result.templateProcessConflicts > 0
    ? ` Quedaron ${result.templateProcessConflicts} conflicto${result.templateProcessConflicts === 1 ? "" : "s"} plantilla↔proceso para revisión manual.`
    : " No quedaron conflictos plantilla↔proceso.";

  return `Se vincularon ${updated} referencias canónicas sin modificar el texto histórico.${conflictText}`;
}
