import { AppShell } from "@/components/app-shell";
import { CompostDetail } from "@/components/compost-detail";

export default async function CompostPilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><CompostDetail pileId={id} /></AppShell>;
}
