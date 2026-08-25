import { AppShell } from "@/components/app-shell";
import { EquipmentDetail } from "@/components/equipment-detail";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialNowIso = new Date().toISOString();
  return <AppShell><EquipmentDetail equipmentId={id} initialNowIso={initialNowIso} /></AppShell>;
}
