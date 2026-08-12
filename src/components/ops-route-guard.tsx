import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getOpsAccessMode } from "@/lib/ops-access-policy";
import { createClient } from "@/lib/supabase/server";

export async function OpsRouteGuard({ children }: { children: ReactNode }) {
  const mode = getOpsAccessMode();

  if (mode === "local-bypass") return children;
  if (mode === "configuration-block") redirect("/login?reason=configuration");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) redirect("/login");

  return children;
}
