"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { useOpsStore } from "@/components/ops-store";

const fmtTime = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Bogota" });
const fmtDayKey = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "America/Bogota" });
const weekDays = [
  ["Lun 10", "2026-08-10"], ["Mar 11", "2026-08-11"], ["Mié 12", "2026-08-12"], ["Jue 13", "2026-08-13"], ["Vie 14", "2026-08-14"], ["Sáb 15", "2026-08-15"],
] as const;

export function CalendarBoard() {
  const { activities } = useOpsStore();
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const ordered = [...activities].sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());
  const todayItems = ordered.filter((activity) => fmtDayKey.format(new Date(activity.plannedStart)) === "2026-08-11");
  const firstOffset = new Date("2026-08-01T12:00:00-05:00").getDay();

  return <section className="panel calendar-panel">
    <div className="calendar-toolbar">
      <div className="segmented" aria-label="Vista de calendario"><button className={view === "month" ? "active" : ""} onClick={() => setView("month")}>Mes</button><button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>Semana</button><button className={view === "day" ? "active" : ""} onClick={() => setView("day")}>Día</button></div>
      <div className="legend"><span><i className="legend-dot done"/>Realizada</span><span><i className="legend-dot running"/>En curso</span><span><i className="legend-dot delayed"/>Retrasada</span><span><i className="legend-dot planned"/>Programada</span></div>
    </div>

    {view === "day" && <div className="timeline">{todayItems.map((item)=><Link className={`timeline-item timeline-${item.status} no-underline`} href={`/activities/${item.id}`} key={item.id}><time>{fmtTime.format(new Date(item.plannedStart))}</time><div className="timeline-main"><div className="timeline-title"><strong>{item.title}</strong><StatusPill status={item.status}/></div><span>{item.process} · {item.plant}</span>{item.actualStart && <small>Ejecución: {fmtTime.format(new Date(item.actualStart))}{item.actualEnd ? `–${fmtTime.format(new Date(item.actualEnd))}` : " → ahora"}</small>}</div></Link>)}</div>}

    {view === "week" && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{weekDays.map(([label, day]) => { const dayItems = ordered.filter((activity) => fmtDayKey.format(new Date(activity.plannedStart)) === day); return <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4" key={day}><div className="mb-3 flex items-center justify-between"><strong className="text-sm">{label}</strong><span className="quiet">{dayItems.length} actividades</span></div><div className="grid gap-2">{dayItems.length ? dayItems.map((activity) => <Link className="rounded-lg bg-white p-3 no-underline" href={`/activities/${activity.id}`} key={activity.id}><div className="mb-1 flex items-center justify-between gap-2"><strong className="text-xs">{fmtTime.format(new Date(activity.plannedStart))} · {activity.title}</strong><StatusPill status={activity.status}/></div><span className="text-[11px] text-[var(--muted)]">{activity.plant} · {activity.process}</span></Link>) : <span className="text-xs text-[var(--muted)]">Sin programación cargada.</span>}</div></div>; })}</div>}

    {view === "month" && <div><div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">{["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map((day)=><span key={day}>{day}</span>)}</div><div className="grid grid-cols-7 gap-1">{Array.from({ length: firstOffset }).map((_, index)=><span key={`blank-${index}`} />)}{Array.from({ length: 31 }, (_, index) => index + 1).map((day) => { const key = `2026-08-${String(day).padStart(2,"0")}`; const count = ordered.filter((activity) => fmtDayKey.format(new Date(activity.plannedStart)) === key).length; return <div className={`min-h-20 rounded-lg border p-2 ${day === 11 ? "border-[var(--green)] bg-[var(--green-soft)]" : "border-[var(--line)] bg-white"}`} key={day}><strong className="text-xs">{day}</strong>{count > 0 && <span className="mt-3 block text-[11px] text-[var(--green-dark)]">{count} actividades</span>}</div>; })}</div></div>}
  </section>;
}
