import { AppShell } from "@/components/app-shell";
import { TodayDashboard } from "@/components/today-dashboard";
import { MaintenanceHome } from "@/components/maintenance-home";
import { CompostHome } from "@/components/compost-home";

export default function InternalAppHome() {
  return (
    <AppShell>
      <TodayDashboard />
      <MaintenanceHome />
      <CompostHome />
    </AppShell>
  );
}
