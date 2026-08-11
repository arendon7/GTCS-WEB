import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { alerts, plants, todayMetrics, workers } from "@/lib/mock-data";

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="metric-block"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

export default function Home() {
  return <AppShell>
    <header className="page-header">
      <div><p className="eyebrow">Martes · 11 agosto 2026</p><h1>Operación de hoy</h1><p className="lede">Qué se debía hacer, qué está ocurriendo y qué necesita atención.</p></div>
      <div className="header-actions"><Link className="button secondary" href="/calendar">Ver calendario</Link><button className="button primary" type="button">Registrar actividad</button></div>
    </header>

    <section className="metrics-grid" aria-label="Indicadores de hoy">
      <Metric label="Recibido" value={`${todayMetrics.receivedT.toFixed(2)} t`} note="Yarumal + Támesis" />
      <Metric label="Procesado" value={`${todayMetrics.processedT.toFixed(2)} t`} note="77,6 % de lo recibido" />
      <Metric label="Horas-hombre" value={`${todayMetrics.workedHours.toFixed(1)} h`} note="Actividad registrada" />
      <Metric label="Cumplimiento" value={`${todayMetrics.compliancePct} %`} note="Programación del día" />
    </section>

    <div className="content-grid">
      <section className="panel" id="operacion"><div className="section-head"><div><p className="eyebrow">Ahora</p><h2>Qué está haciendo el equipo</h2></div><span className="quiet">{workers.length} actividades en curso</span></div><div className="worker-list">{workers.map((item) => <div className="worker-row" key={`${item.worker}-${item.activity}`}><div className="avatar" aria-hidden="true">{item.worker.slice(0,1)}</div><div className="grow"><strong>{item.worker}</strong><span>{item.activity} · {item.plant}</span></div><div className="right"><StatusPill status={item.status}/><small>desde {item.since}</small></div></div>)}</div></section>
      <section className="panel" id="alertas"><div className="section-head"><div><p className="eyebrow">Atención</p><h2>Excepciones</h2></div><strong className="alert-count">{alerts.length}</strong></div><div className="alert-list">{alerts.map((alert) => <div className="alert-row" key={alert.id}><StatusPill status={alert.severity}/><strong>{alert.title}</strong><span>{alert.detail} · {alert.plant}</span></div>)}</div></section>
    </div>

    <section className="panel plant-panel" id="dashboard"><div className="section-head"><div><p className="eyebrow">Plantas</p><h2>Estado operativo</h2></div><div className="segmented"><button className="active">Hoy</button><button>Semana</button><button>Mes</button><button>Histórico</button></div></div><div className="plant-table"><div className="plant-row plant-head"><span>Planta</span><span>Recibido</span><span>Procesado</span><span>Cumplimiento</span><span>Estado</span></div>{plants.map((plant)=><div className="plant-row" key={plant.id}><strong>{plant.name}</strong><span>{plant.receivedT.toFixed(2)} t</span><span>{plant.processedT.toFixed(2)} t</span><span>{plant.planCompliancePct} %</span><span><StatusPill status={plant.status}/></span></div>)}</div></section>
  </AppShell>;
}
