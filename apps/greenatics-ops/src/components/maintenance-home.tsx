"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { EquipmentStatusPill, MaintenanceStatusPill } from "@/components/equipment-status-pill";
import { getDowntimeMinutes } from "@/lib/maintenance-domain";

export function MaintenanceHome({ initialNowIso }: { initialNowIso: string }) {
  const { equipment, tickets } = useMaintenanceStore();
  const [nowIso, setNowIso] = useState(initialNowIso);

  useEffect(() => {
    const update = () => setNowIso(new Date().toISOString());
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const activeTickets = tickets.filter((ticket) => ticket.status !== "closed");
  const affected = equipment.filter((asset) => asset.status === "stopped" || asset.status === "maintenance");
  if (!affected.length && !activeTickets.length) return null;

  return <section className="panel plant-panel mt-4"><div className="section-head"><div><p className="eyebrow">Equipos</p><h2>Mantenimiento que requiere atención</h2></div><Link className="button secondary" href="/equipment">Ver equipos</Link></div><div className="grid gap-3 md:grid-cols-2">{affected.map((asset)=>{ const ticket = activeTickets.find((item)=>item.equipmentId===asset.id); return <Link className="rounded-xl border border-[var(--line)] p-4 no-underline" href={`/equipment/${asset.id}`} key={asset.id}><div className="flex items-start justify-between gap-3"><div><strong className="block text-sm">{asset.code} · {asset.name}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{asset.plant} · {asset.area}</span></div><EquipmentStatusPill status={asset.status}/></div>{ticket && <div className="mt-3 border-t border-[var(--line)] pt-3"><div className="flex items-center justify-between gap-2"><strong className="text-xs">{ticket.title}</strong><MaintenanceStatusPill status={ticket.status}/></div><span className="mt-2 block text-[11px] text-[var(--muted)]">{Math.round(getDowntimeMinutes(ticket, nowIso))} min fuera de servicio</span></div>}</Link>;})}</div></section>;
}
