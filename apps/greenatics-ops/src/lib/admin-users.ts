import type { OpsAccessRole } from "@/lib/ops-data-contract";

export type GreenaticsAppCode = "ops" | "huella" | "red" | "agroway" | "sana";

export type UserMembershipAssignment = {
  plantId: string;
  role: OpsAccessRole;
  active?: boolean;
};

export type InviteUserInput = {
  email: string;
  displayName: string;
  assignments: UserMembershipAssignment[];
  appAccess: GreenaticsAppCode[];
};

export type UpdateUserMembershipInput = {
  userId: string;
  displayName: string;
  assignments: UserMembershipAssignment[];
  appAccess: GreenaticsAppCode[];
};

const roles = new Set<OpsAccessRole>(["operator", "supervisor", "technical", "maintenance", "admin", "director"]);
const applications = new Set<GreenaticsAppCode>(["ops", "huella", "red", "agroway", "sana"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateAssignments(value: unknown): ValidationResult<UserMembershipAssignment[]> {
  if (!Array.isArray(value) || value.length === 0) return { ok: false, error: "Selecciona al menos una planta y un rol." };
  if (value.length > 20) return { ok: false, error: "Demasiadas membresías en una sola operación." };

  const seen = new Set<string>();
  const assignments: UserMembershipAssignment[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return { ok: false, error: "Asignación de planta inválida." };
    const candidate = item as Record<string, unknown>;
    if (typeof candidate.plantId !== "string" || !uuidPattern.test(candidate.plantId)) return { ok: false, error: "Plant ID inválido." };
    if (typeof candidate.role !== "string" || !roles.has(candidate.role as OpsAccessRole)) return { ok: false, error: "Rol de planta inválido." };
    if (candidate.active !== undefined && typeof candidate.active !== "boolean") return { ok: false, error: "Estado de membresía inválido." };
    if (seen.has(candidate.plantId)) return { ok: false, error: "Una planta no puede aparecer dos veces." };
    seen.add(candidate.plantId);
    assignments.push({ plantId: candidate.plantId, role: candidate.role as OpsAccessRole, active: candidate.active ?? true });
  }
  return { ok: true, value: assignments };
}

export function validateInviteUserInput(value: unknown): ValidationResult<InviteUserInput> {
  if (!value || typeof value !== "object") return { ok: false, error: "Solicitud inválida." };
  const candidate = value as Record<string, unknown>;
  const email = typeof candidate.email === "string" ? candidate.email.trim().toLowerCase() : "";
  const displayName = typeof candidate.displayName === "string" ? candidate.displayName.trim().replace(/\s+/g, " ") : "";
  if (!emailPattern.test(email)) return { ok: false, error: "Correo inválido." };
  if (displayName.length < 2 || displayName.length > 120) return { ok: false, error: "Nombre visible inválido." };
  const assignments = validateAssignments(candidate.assignments);
  if (!assignments.ok) return assignments;
  const appAccess = validateAppAccess(candidate.appAccess);
  if (!appAccess.ok) return appAccess;
  return { ok: true, value: { email, displayName, assignments: assignments.value, appAccess: appAccess.value } };
}

export function validateUpdateUserInput(value: unknown): ValidationResult<UpdateUserMembershipInput> {
  if (!value || typeof value !== "object") return { ok: false, error: "Solicitud inválida." };
  const candidate = value as Record<string, unknown>;
  const userId = typeof candidate.userId === "string" ? candidate.userId.trim() : "";
  const displayName = typeof candidate.displayName === "string" ? candidate.displayName.trim().replace(/\s+/g, " ") : "";
  if (!uuidPattern.test(userId)) return { ok: false, error: "Usuario inválido." };
  if (displayName.length < 2 || displayName.length > 120) return { ok: false, error: "Nombre visible inválido." };
  const assignments = validateAssignments(candidate.assignments);
  if (!assignments.ok) return assignments;
  const appAccess = validateAppAccess(candidate.appAccess);
  if (!appAccess.ok) return appAccess;
  return { ok: true, value: { userId, displayName, assignments: assignments.value, appAccess: appAccess.value } };
}

export function validateAppAccess(value: unknown): ValidationResult<GreenaticsAppCode[]> {
  if (!Array.isArray(value) || value.length < 1 || value.length > applications.size) return { ok: false, error: "Selecciona al menos una aplicación." };
  const seen = new Set<GreenaticsAppCode>();
  for (const item of value) {
    if (typeof item !== "string" || !applications.has(item as GreenaticsAppCode)) return { ok: false, error: "Aplicación inválida." };
    if (seen.has(item as GreenaticsAppCode)) return { ok: false, error: "Una aplicación no puede aparecer dos veces." };
    seen.add(item as GreenaticsAppCode);
  }
  return { ok: true, value: [...seen] };
}
