"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OpsAccessMode } from "@/lib/ops-access-policy";
import { isSupabaseConfigured } from "@/lib/data-mode";
import { safeOpsNext } from "@/lib/ops-routes";
import { createClient } from "@/lib/supabase/client";

const ACCOUNT_RECOVERY_PATH = "/auth/accept-invite";

type FeedbackKind = "error" | "success";

export function LoginForm({ accessMode, initialFeedback = "" }: { accessMode: OpsAccessMode; initialFeedback?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState(initialFeedback);
  const [feedbackKind, setFeedbackKind] = useState<FeedbackKind>("error");
  const [busyAction, setBusyAction] = useState<"login" | "recovery" | null>(null);
  const localBypass = accessMode === "local-bypass";
  const remoteAuth = accessMode === "supabase-auth";
  const configurationBlocked = accessMode === "configuration-block";
  const configured = remoteAuth && isSupabaseConfigured();

  const showError = (message: string) => {
    setFeedbackKind("error");
    setFeedback(message);
  };

  const submit = async () => {
    if (!remoteAuth || !configured) return showError("El acceso remoto de GREENATICS OPS no está configurado en este entorno.");
    if (!email.trim() || !password) return showError("Ingresa correo y contraseña.");
    setBusyAction("login");
    setFeedback("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return showError("No fue posible iniciar sesión. Verifica las credenciales.");
      const next = safeOpsNext(new URLSearchParams(window.location.search).get("next"));
      router.replace(next);
      router.refresh();
    } finally {
      setBusyAction(null);
    }
  };

  const requestPasswordRecovery = async () => {
    if (!remoteAuth || !configured) return showError("El acceso remoto de GREENATICS OPS no está configurado en este entorno.");
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return showError("Ingresa primero un correo válido.");

    setBusyAction("recovery");
    setFeedback("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}${ACCOUNT_RECOVERY_PATH}`;
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
      if (error) return showError("No fue posible enviar el enlace de recuperación. Intenta nuevamente.");
      setFeedbackKind("success");
      setFeedback("Si el correo está habilitado en GREENATICS OPS, recibirás un enlace para definir una nueva contraseña.");
    } finally {
      setBusyAction(null);
    }
  };

  return <section className="panel mx-auto max-w-md">
    <div className="mb-6"><p className="eyebrow">GREENATICS OPS</p><h1 className="text-3xl">Acceso interno</h1><p className="lede">Ingreso del equipo operativo y administrativo.</p></div>
    {localBypass && <div className="mb-5 rounded-xl bg-[var(--green-soft)] p-4 text-sm text-[var(--green-dark)]"><strong>Modo local de desarrollo.</strong><span className="mt-1 block">El acceso local solo se habilita en desarrollo, CI o demos aisladas autorizadas; no funciona como fallback de producción.</span></div>}
    {configurationBlocked && <div className="mb-5 rounded-xl bg-[var(--amber-soft)] p-4 text-sm text-[var(--amber)]" role="status"><strong>OPS está protegido en este deployment.</strong><span className="mt-1 block">La web pública puede funcionar, pero el acceso interno permanece bloqueado hasta configurar Supabase Auth para este entorno.</span></div>}
    {remoteAuth && !configured && <div className="mb-5 rounded-xl bg-[var(--amber-soft)] p-4 text-sm text-[var(--amber)]"><strong>Acceso remoto pendiente de configuración.</strong><span className="mt-1 block">Faltan URL y publishable key del proyecto Supabase en el cliente.</span></div>}
    <div className="grid gap-4">
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Correo<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-base text-[var(--ink)]" autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Contraseña<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-base text-[var(--ink)]" autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    </div>
    <div className="mt-3 text-right"><button className="text-sm font-semibold text-[var(--green-dark)] underline underline-offset-4 disabled:opacity-50" disabled={busyAction !== null || !remoteAuth || !configured} type="button" onClick={() => void requestPasswordRecovery()}>{busyAction === "recovery" ? "Enviando enlace…" : "Definir o recuperar contraseña"}</button></div>
    {feedback && <p className={`mt-4 rounded-lg p-3 text-sm font-semibold ${feedbackKind === "success" ? "bg-[var(--green-soft)] text-[var(--green-dark)]" : "bg-[var(--red-soft)] text-[var(--red)]"}`} role={feedbackKind === "error" ? "alert" : "status"}>{feedback}</p>}
    <div className="mt-6 flex items-center justify-between gap-3"><Link className="button secondary" href="/">Volver al sitio</Link><button className="button primary" disabled={busyAction !== null || !remoteAuth || !configured} type="button" onClick={submit}>{busyAction === "login" ? "Ingresando…" : "Ingresar"}</button></div>
  </section>;
}
