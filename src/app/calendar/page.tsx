import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CalendarBoard } from "@/components/calendar-board";

export default function CalendarPage() {
  return <AppShell><header className="page-header"><div><p className="eyebrow">Támesis + Yarumal · agosto 2026</p><h1>Calendario operativo</h1><p className="lede">Programación de Dirección Operativa comparada con la ejecución real.</p></div><div className="header-actions"><Link className="button secondary" href="/">Volver a hoy</Link><Link className="button primary" href="/activities/new">Actividad no programada</Link></div></header><CalendarBoard /></AppShell>;
}
