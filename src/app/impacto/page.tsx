import type { Metadata } from "next";
import Link from "next/link";
import { publicImpactMetrics } from "@/data/impact";

export const metadata: Metadata = {
  title: "Impacto",
  description: "Capa pública de indicadores Greenatics con trazabilidad, fuente, fecha de corte y validación antes de publicación.",
};

export default function ImpactPage() {
  return (
    <>
      <section className="impact-hero-page">
        <div className="container impact-page-grid">
          <div>
            <span className="eyebrow">Impacto verificable</span>
            <h1>No basta con decir que aprovechamos residuos. Hay que demostrarlo.</h1>
            <p className="lead">La capa pública de impacto se alimentará desde GREENATICS OPS bajo un contrato de publicación: cada cifra debe tener fuente, periodo, estado de validación y metodología cuando aplique.</p>
          </div>
          <aside className="impact-publication-rule">
            <span>Regla de publicación</span>
            <strong>Medido → revisado → aprobado → publicado</strong>
            <p>Nunca se mostrará un KPI operativo en vivo sin control de calidad ni se reutilizará una cifra histórica como si describiera el estado actual.</p>
          </aside>
        </div>
      </section>

      <section className="impact-metrics-page">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Indicadores públicos</span><h2>La estructura ya existe. Los valores aparecen cuando estén aprobados.</h2></div>
          <div className="public-metric-grid">
            {publicImpactMetrics.map((metric) => (
              <article key={metric.id}>
                <span className="metric-status">En validación</span>
                <strong className="metric-value">—</strong>
                <h3>{metric.label}</h3>
                <p>{metric.note}</p>
                <small>Fuente: {metric.source} · corte pendiente</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="impact-method">
        <div className="container impact-method-grid">
          <div><span className="eyebrow eyebrow--light">Cómo se construye</span><h2>Del registro operativo al dato público.</h2></div>
          <ol>
            <li><span>01</span><div><strong>Registrar</strong><p>Recepción, proceso, producto, inventario, rechazo, mantenimiento y evidencias.</p></div></li>
            <li><span>02</span><div><strong>Conciliar</strong><p>Verificar unidades, balances, duplicados, periodos y coherencia entre módulos.</p></div></li>
            <li><span>03</span><div><strong>Aprobar</strong><p>Responsable autorizado confirma el corte y la metodología aplicable.</p></div></li>
            <li><span>04</span><div><strong>Publicar</strong><p>La web consume solamente el conjunto de indicadores marcados como públicos.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="impact-sites">
        <div className="container"><div className="section-heading"><span className="eyebrow">Por planta</span><h2>La misma lógica podrá compararse por territorio y periodo.</h2></div><div className="impact-site-grid"><article><strong>Yarumal</strong><p>Recepción, compostaje, digestión, productos, inventarios y trazabilidad digital documentada.</p><Link href="/proyectos/yarumal/">Ver caso →</Link></article><article><strong>Támesis</strong><p>Aprovechamiento orgánico y experiencia territorial con rutas de valorización.</p><Link href="/proyectos/tamesis/">Ver caso →</Link></article></div></div>
      </section>
    </>
  );
}
