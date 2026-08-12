"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDataMode, isSupabaseConfigured } from "@/lib/data-mode";
import { safeOpsNext } from "@/lib/ops-routes";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ initialFeedback = "" }: { initialFeedback?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState(initialFeedback);
  const [busy, setBusy] = useState(false);
  const supabaseMode = getDataMode() === "supabase";
  const configured = isSupabaseConfigured();

  const submit = async () => {
    if (!supabaseMode || !configured) return setFeedback("Este entorno está en modo local; no requiere autenticación remota.");
    if (!email.trim() || !password) return setFeedback("Ingresa correo y contraseña.");
    setBusy(true);
    setFeedback("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return setFeedback("No fue posible iniciar sesión. Verifica las credenciales.");
      const next = safeOpsNext(new URLSearchParams(window.location.search).get("next"));
      router.replace(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return <section className="panel mx-auto max-w-md">
    <div className="mb-6"><p className="eyebrow">GREENATICS OPS</p><h1 className="text-3xl">Acceso interno</h1><p className="lede">Ingreso del equipo operativo y administrativo.</p></div>
    {!supabaseMode && <div className="mb-5 rounded-xl bg-[var(--green-soft)] p-4 text-sm text-[var(--green-dark)]"><strong>Modo local activo.</strong><span className="mt-1 block">CI y demos aisladas no envían información fuera del navegador.</span></div>}
    {supabaseMode && !configured && <div className="mb-5 rounded-xl bg-[var(--amber-soft)] p-4 text-sm text-[var(--amber)]"><strong>Supabase pendiente de configuración.</strong><span className="mt-1 block">Faltan URL y publishable key del proyecto.</span></div>}
    <div className="grid gap-4">
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Correo<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-base text-[var(--ink)]" autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Contraseña<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-base text-[var(--ink)]" autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    </div>
    {feedback && <p className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]" role="alert">{feedback}</p>}
    <div className="mt-6 flex items-center justify-between gap-3"><Link className="button secondary" href="/">Volver a la web</Link><button className="button primary" disabled={busy || !supabaseMode || !configured} type="button" onClick={submit}>{busy ? "Ingresando…" : "Ingresar"}</button></div>
  </section>;
}
