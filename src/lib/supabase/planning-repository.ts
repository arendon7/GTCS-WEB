import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateScheduleInput,
  PlannedActivity,
  PlanningEquipment,
  PlanningProcess,
  PlanningSnapshot,
  PlanningTemplate,
  PlanningWorker,
  ReviseScheduleInput,
  ScheduleDeviationInput,
} from "@/lib/planning-domain";
import { createClient } from "@/lib/supabase/client";

type ProcessRow = { id: string; plant_id: string; code: string; name: string; active: boolean };
type TemplateRow = { id: string; plant_id: string; process_id: string; code: string; name: string; requires_equipment: boolean; active: boolean };
type WorkerRow = { id: string; plant_id: string; display_name: string; active: boolean };
type EquipmentRow = { id: string; plant_id: string; code: string; name: string; status: PlanningEquipment["status"] };
type EquipmentProcessRow = { equipment_id: string; process_id: string; active: boolean };
type ScheduleRow = {
  id: string;
  plant_id: string;
  title: string;
  process_id?: string | null;
  process?: string | null;
  activity_template_id?: string | null;
  equipment_id?: string | null;
  equipment_ref?: string | null;
  planned_start: string;
  planned_end?: string | null;
  status: PlannedActivity["status"];
  planning_note?: string | null;
  deviation_reason?: string | null;
  rescheduled_from_id?: string | null;
  reschedule_reason?: string | null;
};
type ScheduledWorkerRow = { scheduled_activity_id: string; employee_id: string };

function message(scope: string, error: { message?: string } | null) {
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}

export async function loadPlanningSnapshot(
  plantId: string,
  rangeStart: string,
  rangeEnd: string,
  client: SupabaseClient = createClient(),
): Promise<PlanningSnapshot> {
  const [processesResult, templatesResult, workersResult, equipmentResult, equipmentProcessesResult, schedulesResult] = await Promise.all([
    client.from("operational_processes").select("id,plant_id,code,name,active").eq("plant_id", plantId).order("name"),
    client.from("activity_templates").select("id,plant_id,process_id,code,name,requires_equipment,active").eq("plant_id", plantId).order("name"),
    client.from("employees").select("id,plant_id,display_name,active").eq("plant_id", plantId).order("display_name"),
    client.from("equipment").select("id,plant_id,code,name,status").eq("plant_id", plantId).order("code"),
    client.from("equipment_processes").select("equipment_id,process_id,active").eq("plant_id", plantId),
    client.from("scheduled_activities")
      .select("id,plant_id,title,process_id,process,activity_template_id,equipment_id,equipment_ref,planned_start,planned_end,status,planning_note,deviation_reason,rescheduled_from_id,reschedule_reason")
      .eq("plant_id", plantId)
      .gte("planned_start", rangeStart)
      .lt("planned_start", rangeEnd)
      .order("planned_start"),
  ]);

  const firstError = [processesResult.error, templatesResult.error, workersResult.error, equipmentResult.error, equipmentProcessesResult.error, schedulesResult.error].find(Boolean);
  if (firstError) throw new Error(message("No fue posible cargar la planeación", firstError));

  const scheduleRows = (schedulesResult.data ?? []) as unknown as ScheduleRow[];
  const scheduleIds = scheduleRows.map((row) => row.id);
  const scheduledWorkersResult = scheduleIds.length
    ? await client.from("scheduled_activity_workers").select("scheduled_activity_id,employee_id").in("scheduled_activity_id", scheduleIds)
    : { data: [], error: null };
  if (scheduledWorkersResult.error) throw new Error(message("No fue posible cargar trabajadores programados", scheduledWorkersResult.error));

  const processes = ((processesResult.data ?? []) as unknown as ProcessRow[]).map((row): PlanningProcess => ({
    id: row.id, plantId: row.plant_id, code: row.code, name: row.name, active: row.active,
  }));
  const templates = ((templatesResult.data ?? []) as unknown as TemplateRow[]).map((row): PlanningTemplate => ({
    id: row.id, plantId: row.plant_id, processId: row.process_id, code: row.code, name: row.name, requiresEquipment: row.requires_equipment, active: row.active,
  }));
  const workers = ((workersResult.data ?? []) as unknown as WorkerRow[]).map((row): PlanningWorker => ({
    id: row.id, plantId: row.plant_id, name: row.display_name, active: row.active,
  }));
  const equipmentProcesses = (equipmentProcessesResult.data ?? []) as unknown as EquipmentProcessRow[];
  const equipment = ((equipmentResult.data ?? []) as unknown as EquipmentRow[]).map((row): PlanningEquipment => ({
    id: row.id,
    plantId: row.plant_id,
    code: row.code,
    name: row.name,
    status: row.status,
    processIds: equipmentProcesses.filter((item) => item.equipment_id === row.id && item.active).map((item) => item.process_id),
  }));
  const scheduledWorkers = (scheduledWorkersResult.data ?? []) as unknown as ScheduledWorkerRow[];
  const schedules = scheduleRows.map((row): PlannedActivity => ({
    id: row.id,
    plantId: row.plant_id,
    title: row.title,
    processId: row.process_id || undefined,
    processName: row.process || undefined,
    templateId: row.activity_template_id || undefined,
    equipmentId: row.equipment_id || undefined,
    equipmentLabel: row.equipment_ref || undefined,
    plannedStart: row.planned_start,
    plannedEnd: row.planned_end || undefined,
    status: row.status,
    planningNote: row.planning_note || undefined,
    deviationReason: row.deviation_reason || undefined,
    rescheduledFromId: row.rescheduled_from_id || undefined,
    rescheduleReason: row.reschedule_reason || undefined,
    workerIds: scheduledWorkers.filter((item) => item.scheduled_activity_id === row.id).map((item) => item.employee_id),
  }));

  return { processes, templates, workers, equipment, schedules };
}

export async function createScheduledActivity(input: CreateScheduleInput, client: SupabaseClient = createClient()) {
  const { data, error } = await client.rpc("ops_create_scheduled_activity", {
    target_plant: input.plantId,
    target_template: input.templateId,
    starts_at: input.plannedStart,
    ends_at: input.plannedEnd,
    employee_ids: input.workerIds,
    target_equipment: input.equipmentId || null,
    planning_note: input.planningNote || null,
  });
  if (error) throw new Error(message("No fue posible crear la programación", error));
  if (typeof data !== "string") throw new Error("La programación se procesó pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function reviseScheduledActivity(input: ReviseScheduleInput, client: SupabaseClient = createClient()) {
  const { data, error } = await client.rpc("ops_revise_scheduled_activity", {
    target_schedule: input.scheduleId,
    target_template: input.templateId,
    starts_at: input.plannedStart,
    ends_at: input.plannedEnd,
    employee_ids: input.workerIds,
    target_equipment: input.equipmentId || null,
    reason: input.reason,
    planning_note: input.planningNote || null,
  });
  if (error) throw new Error(message("No fue posible reprogramar la actividad", error));
  if (typeof data !== "string") throw new Error("La reprogramación se procesó pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function recordScheduleDeviation(input: ScheduleDeviationInput, client: SupabaseClient = createClient()) {
  const { data, error } = await client.rpc("ops_record_schedule_deviation", {
    target_schedule: input.scheduleId,
    deviation_status: input.status,
    reason: input.reason,
  });
  if (error) throw new Error(message("No fue posible registrar la desviación", error));
  if (data !== input.status) throw new Error("La desviación se procesó pero el servidor no confirmó el estado esperado.");
  return data;
}
