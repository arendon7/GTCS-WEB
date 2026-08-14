export type OperationalMasterRole = "supervisor" | "technical" | "admin" | "director";
export type MaterialSourceKind = "generator" | "supplier" | "internal" | "other";

export type MeasurementUnit = {
  code: string;
  name: string;
  symbol: string;
  category: "mass" | "volume" | "count";
  active: boolean;
};

export type OperationalProcess = {
  id: string;
  plantId: string;
  code: string;
  name: string;
  active: boolean;
};

export type ActivityTemplate = {
  id: string;
  plantId: string;
  processId: string;
  code: string;
  name: string;
  defaultUnitCode?: string;
  requiresQuantity: boolean;
  requiresLot: boolean;
  requiresEquipment: boolean;
  allowsUnplanned: boolean;
  active: boolean;
};

export type MaterialSource = {
  id: string;
  plantId: string;
  code: string;
  name: string;
  sourceKind: MaterialSourceKind;
  active: boolean;
};

export type CollectionRoute = {
  id: string;
  plantId: string;
  code: string;
  name: string;
  active: boolean;
};

export type MaterialTypeMaster = {
  id: string;
  plantId: string;
  code: string;
  name: string;
  active: boolean;
};

export type EquipmentMasterOption = {
  id: string;
  plantId: string;
  code: string;
  name: string;
  status: "available" | "attention" | "stopped" | "maintenance";
};

export type EquipmentProcessAssignment = {
  equipmentId: string;
  processId: string;
  plantId: string;
  active: boolean;
};

export type OperationalMasterSnapshot = {
  units: MeasurementUnit[];
  processes: OperationalProcess[];
  activityTemplates: ActivityTemplate[];
  sources: MaterialSource[];
  routes: CollectionRoute[];
  materialTypes: MaterialTypeMaster[];
  equipment: EquipmentMasterOption[];
  equipmentProcesses: EquipmentProcessAssignment[];
};

export type SimpleMasterKind = "process" | "route" | "materialType";

const masterRoles = new Set<OperationalMasterRole>(["supervisor", "technical", "admin", "director"]);

export function canManageOperationalMasters(role: string): role is OperationalMasterRole {
  return masterRoles.has(role as OperationalMasterRole);
}

export function normalizeMasterCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function validateMasterIdentity(code: string, name: string) {
  const normalizedCode = normalizeMasterCode(code);
  const normalizedName = name.trim();
  if (!normalizedCode) return { ok: false as const, error: "Define un código operativo." };
  if (!normalizedName) return { ok: false as const, error: "Define un nombre visible." };
  if (normalizedCode.length > 60) return { ok: false as const, error: "El código operativo es demasiado largo." };
  if (normalizedName.length > 160) return { ok: false as const, error: "El nombre visible es demasiado largo." };
  return { ok: true as const, code: normalizedCode, name: normalizedName };
}
