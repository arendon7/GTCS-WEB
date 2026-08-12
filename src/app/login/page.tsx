import { LoginForm } from "@/components/login-form";

function authFeedback(code?: string) {
  if (code === "invalid-or-expired-link") return "El enlace de invitación es inválido o venció. Solicita una nueva invitación.";
  if (code === "inactive-profile") return "Tu perfil está inactivo. Contacta a dirección.";
  return "";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ auth_error?: string }> }) {
  const params = await searchParams;
  return <main className="min-h-screen bg-[var(--canvas)] px-4 py-12"><LoginForm initialFeedback={authFeedback(params.auth_error)} /></main>;
}
