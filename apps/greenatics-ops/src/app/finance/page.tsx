import { AppShell } from "@/components/app-shell";
import { FinanceView } from "@/components/finance-view";
import { bogotaDateKey } from "@/lib/time";

export const dynamic="force-dynamic";

export default function FinancePage(){
  return <AppShell><FinanceView initialDateKey={bogotaDateKey(new Date())}/></AppShell>;
}
