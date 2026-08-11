import { AppShell } from "@/components/app-shell";
import { EquipmentDetail } from "@/components/equipment-detail";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><EquipmentDetail equipmentId={id} /></AppShell>;
}
