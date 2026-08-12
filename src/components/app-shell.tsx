"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useOpsStore } from "@/components/ops-store";

const nav = [["Hoy", "/"], ["Calendario", "/calendar"], ["Recepciones", "/receptions"], ["Compostaje", "/compost"], ["Producción", "/production"], ["Inventario", "/inventory"], ["Ventas", "/sales"], ["Solicitudes", "/purchases"], ["Compras/Gastos", "/expenses"], ["Caja", "/cash"], ["Finanzas", "/finance"], ["Equipos", "/equipment"], ["Dashboard", "/dashboard"], ["Importaciones", "/imports"], ["Registrar actividad", "/activities/new"], ["Alertas", "/#alertas"]] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { backend, access, identity, signOut } = useOpsStore();
  const [signingOut, setSigningOut] = useState(false);
  const sourceLabel = backend.mode === "local"
    ? "Modo local · este navegador"
    : backend.status === "booting"
      ? "Supabase · cargando"
      : backend.status === "error"
        ? "Supabase · requiere atención"
        : `Supabase · ${access.map((plant) => plant.name).join(" + ") || "sin planta"}`;

  const closeSession = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const result = await signOut();
    if (result.ok) router.replace("/login");
    else setSigningOut(false);
  };

  return <div className="app-shell"><aside className="sidebar" aria-label="Navegación principal"><div className="brand-block"><div className="brand-mark" aria-hidden="true">G</div><div><strong>GREENATICS</strong><span>OPS</span></div></div><nav className="side-nav">{nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav><div className="sidebar-foot" title={backend.error}><div><span className={`status-dot ${backend.status === "ready" ? "status-ok" : ""}`} /> {sourceLabel}</div>{backend.mode === "supabase" && identity ? <div className="mt-2"><strong className="block text-[11px]">{identity.displayName}</strong><button className="mt-1 text-[11px] underline" type="button" disabled={signingOut} onClick={closeSession}>{signingOut ? "Cerrando…" : "Cerrar sesión"}</button></div> : null}{backend.mode === "supabase" && backend.status === "error" ? <Link className="mt-2 block text-[11px] underline" href="/login">Ir a acceso</Link> : null}</div></aside><main className="main-area">{backend.mode === "supabase" && backend.status === "error" ? <div className="mb-4 rounded-xl bg-[var(--red-soft)] p-4 text-sm font-semibold text-[var(--red)]" role="alert">{backend.error}</div> : null}{children}</main></div>;
}
