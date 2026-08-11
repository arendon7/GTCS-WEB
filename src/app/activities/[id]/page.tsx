import { AppShell } from "@/components/app-shell";
import { ActivityEditor } from "@/components/activity-editor";

export default async function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><ActivityEditor activityId={id} /></AppShell>;
}
