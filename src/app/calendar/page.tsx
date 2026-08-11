import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { calendarItems } from "@/lib/mock-data";

export default function CalendarPage() {
  return <AppShell>
    <header className="page-header"><div><p className="eyebrow">Támesis · Semana 2</p><h1>Calendario operativo</h1><p className="lede">Programación de Dirección Operativa comparada con la ejecución real.</p></div><div className="header-actions"><Link className="button secondary" href="/">Volver a hoy</Link><button className="button primary">Nueva actividad</button></div></header>
    <section className="panel calendar-panel"><div className="calendar-toolbar"><div className="segmented"><button>Mes</button><button>Semana</button><button className="active">Día</button></div><div className="legend"><span><i className="legend-dot done"/>Realizada</span><span><i className="legend-dot running"/>En curso</span><span><i className="legend-dot delayed"/>Retrasada</span><span><i className="legend-dot planned"/>Programada</span></div></div><div className="timeline">{calendarItems.map((item)=><article className={`timeline-item timeline-${item.status}`} key={`${item.time}-${item.activity}`}><time>{item.time}</time><div className="timeline-main"><div className="timeline-title"><strong>{item.activity}</strong><StatusPill status={item.status}/></div><span>{item.process} · {item.workers.join(" + ")}</span>{item.actual && <small>Ejecución: {item.actual}</small>}</div></article>)}</div></section>
  </AppShell>;
}
