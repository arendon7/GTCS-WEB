import type {
  ActivityTemplate,
  CollectionRoute,
  EquipmentMasterOption,
  EquipmentProcessAssignment,
  MaterialSource,
  MaterialSourceKind,
  MaterialTypeMaster,
  MeasurementUnit,
  OperationalMasterSnapshot,
  OperationalProcess,
  SimpleMasterKind,
} from "@/lib/operational-master-data";
import { createClient } from "@/lib/supabase/client";

type DbProcess = { id: string; plant_id: string; code: string; name: string; active: boolean };
type DbActivityTemplate = {
  id: string;
  plant_id: string;
  process_id: string;
  code: string;
  name: string;
  default_unit_code?: string | null;
  requires_quantity: boolean;
  requires_lot: boolean;
  requires_equipment: boolean;
  allows_unplanned: boolean;
  active: boolean;
};
type DbMaterialSource = DbProcess & { source_kind: MaterialSourceKind };
type DbEquipment = { id: string; plant_id: string; code: string; name: string; status: EquipmentMasterOption["status"] };
type DbEquipmentProcess = { equipment_id: string; process_id: string; plant_id: string; active: boolean };
type DbUnit = { code: string; name: string; symbol: string; category: MeasurementUnit["category"]; active: boolean };

function mapProcess(row: DbProcess): OperationalProcess {
  return { id: row.id, plantId: row.plant_id, code: row.code, name: row.name, active: row.active };
}

function mapRoute(row: DbProcess): CollectionRoute {
  return { id: row.id, plantId: row.plant_id, code: row.code, name: row.name, active: row.active };
}

function mapMaterialType(row: DbProcess): MaterialTypeMaster {
  return { id: row.id, plantId: row.plant_id, code: row.code, name: row.name, active: row.active };
}

function mapSource(row: DbMaterialSource): MaterialSource {
  return {
    id: row.id,
    plantId: row.plant_id,
    code: row.code,
    name: row.name,
    sourceKind: row.source_kind,
    active: row.active,
  };
}

function mapTemplate(row: DbActivityTemplate): ActivityTemplate {
  return {
    id: row.id,
    plantId: row.plant_id,
    processId: row.process_id,
    code: row.code,
    name: row.name,
    defaultUnitCode: row.default_unit_code || undefined,
    requiresQuantity: row.requires_quantity,
    requiresLot: row.requires_lot,
    requiresEquipment: row.requires_equipment,
    allowsUnplanned: row.allows_unplanned,
    active: row.active,
  };
}

function tableFor(kind: SimpleMasterKind) {
  if (kind === "process") return "operational_processes" as const;
  if (kind === "route") return "collection_routes" as const;
  return "material_types" as const;
}

function friendlyError(error: { message?: string; code?: string } | null, fallback: string) {
  if (!error) return fallback;
  if (error.code === "23505") return "Ya existe un registro con ese código en la planta.";
  if (error.code === "42501") return "Tu rol no permite administrar este maestro.";
  return error.message || fallback;
}

export async function loadOperationalMasterSnapshot(plantId: string): Promise<OperationalMasterSnapshot> {
  const supabase = createClient();
  const [units, processes, templates, sources, routes, materialTypes, equipment, assignments] = await Promise.all([
    supabase.from("measurement_units").select("code,name,symbol,category,active").eq("active", true).order("code"),
    supabase.from("operational_processes").select("id,plant_id,code,name,active").eq("plant_id", plantId).order("name"),
    supabase.from("activity_templates").select("id,plant_id,process_id,code,name,default_unit_code,requires_quantity,requires_lot,requires_equipment,allows_unplanned,active").eq("plant_id", plantId).order("name"),
    supabase.from("material_sources").select("id,plant_id,code,name,source_kind,active").eq("plant_id", plantId).order("name"),
    supabase.from("collection_routes").select("id,plant_id,code,name,active").eq("plant_id", plantId).order("name"),
    supabase.from("material_types").select("id,plant_id,code,name,active").eq("plant_id", plantId).order("name"),
    supabase.from("equipment").select("id,plant_id,code,name,status").eq("plant_id", plantId).order("code"),
    supabase.from("equipment_processes").select("equipment_id,process_id,plant_id,active").eq("plant_id", plantId),
  ]);

  const firstError = [units.error, processes.error, templates.error, sources.error, routes.error, materialTypes.error, equipment.error, assignments.error].find(Boolean);
  if (firstError) throw new Error(friendlyError(firstError, "No fue posible cargar los maestros operacionales."));

  return {
    units: ((units.data ?? []) as DbUnit[]).map((row) => ({ ...row })),
    processes: ((processes.data ?? []) as DbProcess[]).map(mapProcess),
    activityTemplates: ((templates.data ?? []) as DbActivityTemplate[]).map(mapTemplate),
    sources: ((sources.data ?? []) as DbMaterialSource[]).map(mapSource),
    routes: ((routes.data ?? []) as DbProcess[]).map(mapRoute),
    materialTypes: ((materialTypes.data ?? []) as DbProcess[]).map(mapMaterialType),
    equipment: ((equipment.data ?? []) as DbEquipment[]).map((row) => ({ id: row.id, plantId: row.plant_id, code: row.code, name: row.name, status: row.status })),
    equipmentProcesses: ((assignments.data ?? []) as DbEquipmentProcess[]).map((row): EquipmentProcessAssignment => ({ equipmentId: row.equipment_id, processId: row.process_id, plantId: row.plant_id, active: row.active })),
  };
}

export async function createSimpleOperationalMaster(input: {
  kind: SimpleMasterKind;
  plantId: string;
  code: string;
  name: string;
}) {
  const supabase = createClient();
  const table = tableFor(input.kind);
  const { error } = await supabase.from(table).insert({ plant_id: input.plantId, code: input.code, name: input.name });
  if (error) return { ok: false as const, error: friendlyError(error, "No fue posible crear el registro.") };
  return { ok: true as const };
}

export async function updateSimpleOperationalMaster(input: {
  kind: SimpleMasterKind;
  id: string;
  name: string;
  active: boolean;
}) {
  const supabase = createClient();
  const table = tableFor(input.kind);
  const { error } = await supabase.from(table).update({ name: input.name, active: input.active }).eq("id", input.id);
  if (error) return { ok: false as const, error: friendlyError(error, "No fue posible actualizar el registro.") };
  return { ok: true as const };
}

export async function createMaterialSource(input: {
  plantId: string;
  code: string;
  name: string;
  sourceKind: MaterialSourceKind;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("material_sources").insert({
    plant_id: input.plantId,
    code: input.code,
    name: input.name,
    source_kind: input.sourceKind,
  });
  if (error) return { ok: false as const, error: friendlyError(error, "No fue posible crear el origen.") };
  return { ok: true as const };
}

export async function updateMaterialSource(input: { id: string; name: string; sourceKind: MaterialSourceKind; active: boolean }) {
  const supabase = createClient();
  const { error } = await supabase.from("material_sources").update({
    name: input.name,
    source_kind: input.sourceKind,
    active: input.active,
  }).eq("id", input.id);
  if (error) return { ok: false as const, error: friendlyError(error, "No fue posible actualizar el origen.") };
  return { ok: true as const };
}

export async function createActivityTemplate(input: {
  plantId: string;
  processId: string;
  code: string;
  name: string;
  defaultUnitCode?: string;
  requiresQuantity: boolean;
  requiresLot: boolean;
  requiresEquipment: boolean;
  allowsUnplanned: boolean;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("activity_templates").insert({
    plant_id: input.plantId,
    process_id: input.processId,
    code: input.code,
    name: input.name,
    default_unit_code: input.defaultUnitCode || null,
    requires_quantity: input.requiresQuantity,
    requires_lot: input.requiresLot,
    requires_equipment: input.requiresEquipment,
    allows_unplanned: input.allowsUnplanned,
  });
  if (error) return { ok: false as const, error: friendlyError(error, "No fue posible crear la plantilla de actividad.") };
  return { ok: true as const };
}

export async function updateActivityTemplate(input: {
  id: string;
  processId: string;
  name: string;
  defaultUnitCode?: string;
  requiresQuantity: boolean;
  requiresLot: boolean;
  requiresEquipment: boolean;
  allowsUnplanned: boolean;
  active: boolean;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("activity_templates").update({
    process_id: input.processId,
    name: input.name,
    default_unit_code: input.defaultUnitCode || null,
    requires_quantity: input.requiresQuantity,
    requires_lot: input.requiresLot,
    requires_equipment: input.requiresEquipment,
    allows_unplanned: input.allowsUnplanned,
    active: input.active,
  }).eq("id", input.id);
  if (error) return { ok: false as const, error: friendlyError(error, "No fue posible actualizar la plantilla de actividad.") };
  return { ok: true as const };
}

export async function setEquipmentProcessAssignment(input: {
  plantId: string;
  equipmentId: string;
  processId: string;
  active: boolean;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("equipment_processes").upsert({
    plant_id: input.plantId,
    equipment_id: input.equipmentId,
    process_id: input.processId,
    active: input.active,
  }, { onConflict: "equipment_id,process_id" });
  if (error) return { ok: false as const, error: friendlyError(error, "No fue posible actualizar la asociación equipo-proceso.") };
  return { ok: true as const };
}
