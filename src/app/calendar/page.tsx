import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CalendarBoard } from "@/components/calendar-board";

export default function CalendarPage() {
  return <AppShell><header className="page-header"><div><p className="eyebrow">Planeación operacional · Támesis + Yarumal</p><h1>Calendario operativo</h1><p className="lede">Programa por planta, proceso, actividad, trabajadores y equipo. La ejecución real permanece separada para medir plan vs. real sin sobrescribir la historia.</p></div><div className="header-actions"><Link className="button secondary" href="/app">Volver a hoy</Link><Link className="button primary" href="/activities/new">Actividad no programada</Link></div></header><CalendarBoard /></AppShell>;
}
