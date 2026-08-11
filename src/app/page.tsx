import { AppShell } from "@/components/app-shell";
import { TodayDashboard } from "@/components/today-dashboard";
import { MaintenanceHome } from "@/components/maintenance-home";

export default function Home() {
  return <AppShell><TodayDashboard /><MaintenanceHome /></AppShell>;
}
