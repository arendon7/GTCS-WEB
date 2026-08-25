import { connection } from "next/server";
import { AppShell } from "@/components/app-shell";
import { TodayDashboard } from "@/components/today-dashboard";
import { MaintenanceHome } from "@/components/maintenance-home";
import { CompostHome } from "@/components/compost-home";

export default async function InternalAppHome() {
  await connection();
  const initialNowIso = new Date().toISOString();

  return (
    <AppShell>
      <TodayDashboard initialNowIso={initialNowIso} />
      <MaintenanceHome initialNowIso={initialNowIso} />
      <CompostHome />
    </AppShell>
  );
}
