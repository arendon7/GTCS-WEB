import type { OpsBackendState, PlantAccess } from "@/lib/ops-data-contract";

const resolverRoles = new Set<PlantAccess["role"]>(["maintenance", "supervisor", "technical", "admin", "director"]);

export function canResolveIncident(backend: OpsBackendState, access: PlantAccess[], plantId: string) {
  if (backend.mode === "local") return true;
  return access.some((plant) => plant.plantId === plantId && resolverRoles.has(plant.role));
}

export function validateIncidentResolutionNote(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (clean.length < 3) return { ok: false as const, error: "Describe brevemente cómo se resolvió el incidente." };
  if (clean.length > 500) return { ok: false as const, error: "La resolución no puede superar 500 caracteres." };
  return { ok: true as const, value: clean };
}
