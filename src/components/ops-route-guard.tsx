import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getOpsAccessMode } from "@/lib/ops-access-policy";
import { createClient } from "@/lib/supabase/server";

export async function OpsRouteGuard({ children }: { children: ReactNode }) {
  const mode = getOpsAccessMode();

  if (mode === "local-bypass") return children;
  if (mode === "configuration-block") redirect("/login?reason=configuration");

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) redirect("/login");

  const [{ data: profile, error: profileError }, { data: membership, error: membershipError }] = await Promise.all([
    supabase.from("profiles").select("active").eq("id", userId).maybeSingle(),
    supabase.from("plant_memberships").select("plant_id").eq("user_id", userId).eq("active", true).limit(1).maybeSingle(),
  ]);

  if (profileError || !profile?.active) redirect("/login?reason=inactive-profile");
  if (membershipError || !membership) redirect("/login?reason=no-plant-access");

  return children;
}
