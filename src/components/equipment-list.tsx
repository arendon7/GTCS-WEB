"use client";

import Link from "next/link";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { EquipmentStatusPill } from "@/components/equipment-status-pill";
import { getDowntimeMinutes } from "@/lib/maintenance-domain";

export function EquipmentList() {
  const { equipment, tickets, ready, resetMaintenanceDemo } = useMaintenanceStore();
  const stopped = equipment.filter((asset) => asset.status === "stopped").length;
  const inRepair = equipment.filter((asset) => asset.status === "maintenance").length;
  const openTickets = tickets.filter((ticket) => ticket.status !== "closed");

  return <>
    <header className="page-header"><div><p className="eyebrow">Activos operativos</p><h1>Equipos y mantenimiento</h1><p className="lede">Estado actual, fallas abiertas y tiempo fuera de servicio por equipo.</p></div><div className="header-actions"><Link className="button secondary" href="/">Volver a hoy</Link></div></header>
    <section className="metrics-grid" aria-label="Indicadores de equipos"><div className="metric-block"><span>Equipos</span><strong>{equipment.length}</strong><small>activos en la demo</small></div><div className="metric-block"><span>Detenidos</span><strong>{stopped}</strong><small>requieren atención</small></div><div className="metric-block"><span>En reparación</span><strong>{inRepair}</strong><small>trabajo iniciado</small></div><div className="metric-block"><span>Tickets abiertos</span><strong>{openTickets.length}</strong><small>falla + reparación</small></div></section>
    <section className="panel plant-panel"><div className="section-head"><div><p className="eyebrow">Estado actual</p><h2>Equipos por planta</h2></div><div className="flex items-center gap-2"><span className="quiet">{ready ? "Persistencia local activa" : "Cargando…"}</span><button className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" type="button" onClick={resetMaintenanceDemo}>Restablecer demo</button></div></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{equipment.map((asset) => { const ticket = openTickets.find((item) => item.equipmentId === asset.id); return <Link className="rounded-xl border border-[var(--line)] p-4 no-underline hover:bg-[var(--surface-soft)]" href={`/equipment/${asset.id}`} key={asset.id}><div className="flex items-start justify-between gap-3"><div><strong className="block text-sm">{asset.code} · {asset.name}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{asset.plant} · {asset.area}</span></div><EquipmentStatusPill status={asset.status}/></div>{ticket && <div className="mt-4 border-t border-[var(--line)] pt-3"><span className="quiet">Falla actual</span><strong className="mt-1 block text-xs">{ticket.title}</strong><span className="mt-1 block text-[11px] text-[var(--muted)]">{Math.round(getDowntimeMinutes(ticket, new Date().toISOString()))} min fuera de servicio</span></div>}</Link>; })}</div></section>
  </>;
}
