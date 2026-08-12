import { LoginForm } from "@/components/login-form";
import { getOpsAccessMode } from "@/lib/ops-access-policy";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-12"><LoginForm accessMode={getOpsAccessMode()} /></main>;
}
