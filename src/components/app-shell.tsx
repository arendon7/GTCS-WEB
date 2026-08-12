"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useOpsStore } from "@/components/ops-store";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { useCompostStore } from "@/components/compost-store";
import { useInventoryStore } from "@/components/inventory-store";
import { useCommercialStore } from "@/components/commercial-store";
import { useExpenseStore } from "@/components/expense-store";
import { useSupplyStore } from "@/components/supply-store";
import { usePurchaseRequestStore } from "@/components/purchase-request-store";
import { useSettlementStore } from "@/components/settlement-store";

const nav = [["Hoy", "/"], ["Calendario", "/calendar"], ["Recepciones", "/receptions"], ["Compostaje", "/compost"], ["Producción", "/production"], ["Inventario", "/inventory"], ["Insumos", "/supplies"], ["Ventas", "/sales"], ["Solicitudes", "/purchases"], ["Compras/Gastos", "/expenses"], ["Caja", "/cash"], ["Finanzas", "/finance"], ["Equipos", "/equipment"], ["Dashboard", "/dashboard"], ["Importaciones", "/imports"], ["Registrar actividad", "/activities/new"], ["Alertas", "/#alertas"]] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { backend, access, identity, signOut } = useOpsStore();
  const maintenance = useMaintenanceStore();
  const compost = useCompostStore();
  const inventory = useInventoryStore();
  const commercial = useCommercialStore();
  const expenses = useExpenseStore();
  const supplies = useSupplyStore();
  const purchases = usePurchaseRequestStore();
  const settlements = useSettlementStore();
  const [signingOut, setSigningOut] = useState(false);

  const remoteModules = [
    { name: "Mantenimiento", ready: maintenance.ready, error: maintenance.error },
    { name: "Compostaje", ready: compost.ready, error: compost.error },
    { name: "Producción e inventario", ready: inventory.ready, error: inventory.error },
    { name: "Comercial", ready: commercial.ready, error: commercial.error },
    { name: "Compras y gastos", ready: expenses.ready, error: expenses.error },
    { name: "Insumos", ready: supplies.ready, error: supplies.error },
    { name: "Solicitudes", ready: purchases.ready, error: purchases.error },
    { name: "Caja", ready: settlements.ready, error: settlements.error },
  ];
  const modulesReady = remoteModules.every((module) => module.ready);
  const moduleErrors = remoteModules.filter((module) => module.error);
  const remoteLoading = backend.mode === "supabase" && (backend.status === "booting" || (backend.status === "ready" && !modulesReady));
  const remoteError = backend.mode === "supabase" && (backend.status === "error" || moduleErrors.length > 0);
  const canManageUsers = backend.mode === "supabase" && access.some((plant) => plant.role === "admin" || plant.role === "director");
  const sourceLabel = backend.mode === "local"
    ? "Modo local · este navegador"
    : remoteLoading
      ? "Supabase · sincronizando módulos"
      : remoteError
        ? "Supabase · requiere atención"
        : `Supabase · ${access.map((plant) => plant.name).join(" + ") || "sin planta"}`;

  const closeSession = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const result = await signOut();
    if (result.ok) router.replace("/login");
    else setSigningOut(false);
  };

  return <div className="app-shell"><aside className="sidebar" aria-label="Navegación principal"><div className="brand-block"><div className="brand-mark" aria-hidden="true">G</div><div><strong>GREENATICS</strong><span>OPS</span></div></div><nav className="side-nav">{nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}{canManageUsers ? <Link href="/admin/users">Usuarios y accesos</Link> : null}</nav><div className="sidebar-foot" title={backend.error}><div><span className={`status-dot ${backend.status === "ready" && modulesReady && !remoteError ? "status-ok" : ""}`} /> {sourceLabel}</div>{backend.mode === "supabase" && identity ? <div className="mt-2"><strong className="block text-[11px]">{identity.displayName}</strong><button className="mt-1 text-[11px] underline" type="button" disabled={signingOut} onClick={closeSession}>{signingOut ? "Cerrando…" : "Cerrar sesión"}</button></div> : null}{backend.mode === "supabase" && backend.status === "error" ? <Link className="mt-2 block text-[11px] underline" href="/login">Ir a acceso</Link> : null}</div></aside><main className="main-area">
    {backend.mode === "supabase" && remoteLoading ? <section className="panel mx-auto max-w-3xl" aria-live="polite"><p className="eyebrow">Fuente remota</p><h1 className="text-2xl">Sincronizando operación</h1><p className="lede">Cargando plantas, operación, mantenimiento, producción, inventarios, ventas y movimientos económicos. Los indicadores aparecerán cuando el snapshot esté completo.</p></section> : null}
    {backend.mode === "supabase" && remoteError ? <section className="panel mx-auto max-w-3xl" role="alert"><p className="eyebrow">Fuente remota</p><h1 className="text-2xl">No fue posible completar el snapshot</h1><p className="lede">No se muestran datos parciales como si fueran el estado real de la operación.</p>{backend.error ? <p className="mt-4 rounded-xl bg-[var(--red-soft)] p-4 text-sm font-semibold text-[var(--red)]">Operación: {backend.error}</p> : null}{moduleErrors.length ? <div className="mt-4 grid gap-2">{moduleErrors.map((module) => <p className="rounded-xl bg-[var(--red-soft)] p-3 text-sm text-[var(--red)]" key={module.name}><strong>{module.name}:</strong> {module.error}</p>)}</div> : null}<button className="button secondary mt-5" type="button" onClick={() => window.location.reload()}>Reintentar sincronización</button></section> : null}
    {backend.mode !== "supabase" || (!remoteLoading && !remoteError) ? children : null}
  </main></div>;
}
