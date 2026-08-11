import { AppShell } from "@/components/app-shell";
import { IntegratedDashboardView } from "@/components/integrated-dashboard-view";

export const dynamic="force-dynamic";

export default function DashboardPage() {
  const initialNowIso=new Date().toISOString();
  return <AppShell><IntegratedDashboardView initialNowIso={initialNowIso} /></AppShell>;
}
