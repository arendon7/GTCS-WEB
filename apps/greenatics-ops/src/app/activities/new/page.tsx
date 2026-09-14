import { AppShell } from "@/components/app-shell";
import { ActivityEditor } from "@/components/activity-editor";

export default function NewActivityPage() {
  return <AppShell><ActivityEditor createMode /></AppShell>;
}
