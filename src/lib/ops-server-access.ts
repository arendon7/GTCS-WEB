import { getOpsAccessMode } from "@/lib/ops-access-policy";
import { createClient } from "@/lib/supabase/server";

export type OpsServerAccess =
  | { ok: true; mode: "local-bypass"; userId: null }
  | { ok: true; mode: "supabase-auth"; userId: string }
  | { ok: false; reason: "configuration" | "session" | "membership" | "backend" };

type JoinedPlant = { active?: boolean };
type MembershipRow = { plant_id?: string; plants?: JoinedPlant | JoinedPlant[] | null };

function onePlant(value: MembershipRow["plants"]) {
  return Array.isArray(value) ? value[0] : value;
}

export function hasActivePlantMembership(rows: readonly MembershipRow[]) {
  return rows.some((row) => Boolean(row.plant_id) && onePlant(row.plants)?.active === true);
}

export async function getOpsServerAccess(): Promise<OpsServerAccess> {
  const mode = getOpsAccessMode();
  if (mode === "local-bypass") return { ok: true, mode, userId: null };
  if (mode === "configuration-block") return { ok: false, reason: "configuration" };

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false, reason: "session" };

  const { data, error } = await supabase
    .from("plant_memberships")
    .select("plant_id,plants!inner(active)")
    .eq("user_id", user.id)
    .eq("active", true);

  if (error) return { ok: false, reason: "backend" };
  if (!hasActivePlantMembership((data ?? []) as unknown as MembershipRow[])) {
    return { ok: false, reason: "membership" };
  }

  return { ok: true, mode, userId: user.id };
}
