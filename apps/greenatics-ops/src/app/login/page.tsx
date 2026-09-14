import { LoginForm } from "@/components/login-form";
import { getOpsAccessMode } from "@/lib/ops-access-policy";

export const dynamic = "force-dynamic";

function authFeedback(authError?: string, reason?: string) {
  if (authError === "invalid-or-expired-link") return "El enlace de invitación es inválido o venció. Solicita una nueva invitación.";
  const code = authError || reason;
  if (code === "inactive-profile") return "Tu perfil está inactivo. Contacta a dirección.";
  if (code === "no-plant-access") return "Tu cuenta no tiene acceso activo a una planta. Contacta a dirección.";
  return "";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ auth_error?: string; reason?: string }> }) {
  const params = await searchParams;
  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-12"><LoginForm accessMode={getOpsAccessMode()} initialFeedback={authFeedback(params.auth_error, params.reason)} /></main>;
}
