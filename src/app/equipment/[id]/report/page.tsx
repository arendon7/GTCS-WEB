import { AppShell } from "@/components/app-shell";
import { EquipmentReportForm } from "@/components/equipment-report-form";

export default async function EquipmentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><EquipmentReportForm equipmentId={id} /></AppShell>;
}
