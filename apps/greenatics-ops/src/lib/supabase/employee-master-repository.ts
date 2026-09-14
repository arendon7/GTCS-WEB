import type { SupabaseClient } from "@supabase/supabase-js";
import type { EmployeeMaster } from "@/lib/employee-master";
import { createClient } from "@/lib/supabase/client";

type EmployeeRow = {
  id: string;
  plant_id: string;
  code?: string | null;
  display_name: string;
  active: boolean;
  historical: boolean;
  provisional?: boolean | null;
};

type Result = { ok: true } | { ok: false; error: string };

function errorMessage(scope: string, error: { message?: string; code?: string } | null) {
  if (error?.code === "23505") return `${scope}: ya existe un trabajador con ese código en la planta.`;
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}

function mapEmployee(row: EmployeeRow): EmployeeMaster {
  return {
    id: row.id,
    plantId: row.plant_id,
    code: row.code?.trim() || undefined,
    name: row.display_name,
    active: row.active,
    historical: row.historical,
    provisional: Boolean(row.provisional),
  };
}

export async function loadEmployeeMasters(plantId: string, client: SupabaseClient = createClient()): Promise<EmployeeMaster[]> {
  const { data, error } = await client
    .from("employees")
    .select("id,plant_id,code,display_name,active,historical,provisional")
    .eq("plant_id", plantId)
    .eq("historical", false)
    .order("active", { ascending: false })
    .order("display_name");
  if (error) throw new Error(errorMessage("No fue posible cargar los trabajadores", error));
  return ((data ?? []) as unknown as EmployeeRow[]).map(mapEmployee);
}

export async function createEmployeeMaster(
  input: { plantId: string; code: string; name: string },
  client: SupabaseClient = createClient(),
): Promise<Result> {
  const { error } = await client.rpc("ops_admin_create_employee", {
    target_plant: input.plantId,
    employee_code: input.code,
    employee_name: input.name,
  });
  return error ? { ok: false, error: errorMessage("No fue posible crear el trabajador", error) } : { ok: true };
}

export async function updateEmployeeMaster(
  input: { id: string; code: string; name: string; active: boolean },
  client: SupabaseClient = createClient(),
): Promise<Result> {
  const { error } = await client.rpc("ops_admin_update_employee", {
    target_employee: input.id,
    employee_code: input.code,
    employee_name: input.name,
    employee_active: input.active,
  });
  return error ? { ok: false, error: errorMessage("No fue posible actualizar el trabajador", error) } : { ok: true };
}
