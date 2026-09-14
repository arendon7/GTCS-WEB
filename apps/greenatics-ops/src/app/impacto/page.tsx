import type { Metadata } from "next";
import Link from "next/link";
import { isPublishableMetric, publicImpactMetrics } from "@/data/impact-public";
import styles from "./impact.module.css";

export const metadata: Metadata = {
  title: "Impacto | Greenatics",
  description: "Indicadores públicos Greenatics gobernados por fuente, periodo, validación y metodología antes de publicación.",
};

const steps = [
  ["01", "Registrar", "Recepción, proceso, producto, inventario, rechazo, mantenimiento y evidencias nacen en la operación."],
  ["02", "Conciliar", "Se verifican unidades, balances, duplicados, cobertura, periodo y coherencia entre módulos."],
  ["03", "Aprobar", "Un responsable autorizado valida el corte y la metodología aplicable."],
  ["04", "Publicar", "La web consume únicamente indicadores aprobados para exposición pública."],
];

export default function ImpactPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}><div className={`${styles.container} ${styles.heroGrid}`}><div><span className={styles.eyebrow}>Impacto verificable</span><h1>No basta con decir que aprovechamos residuos. Hay que demostrarlo.</h1><p className={styles.lead}>La capa pública de impacto se alimenta desde GREENATICS OPS bajo un contrato de publicación: cada cifra debe tener fuente, periodo, estado de validación y metodología cuando aplique.</p></div><aside className={styles.rule}><strong>Medido → revisado → aprobado → publicado.</strong><p>Nunca mostramos un KPI operativo en vivo sin control de calidad ni reutilizamos una cifra histórica como si describiera el estado actual.</p></aside></div></section>

        <section className={`${styles.section} ${styles.white}`}><div className={styles.container}><div className={styles.sectionHead}><span className={styles.eyebrow}>Indicadores públicos</span><h2>La estructura existe. Los valores aparecen cuando estén aprobados.</h2><p>Mientras no exista un corte publicable, la ausencia de cifra es deliberada: evita que una estimación, un valor histórico o un dato parcial se conviertan en afirmación corporativa.</p></div><div className={styles.metricGrid}>{publicImpactMetrics.map((metric)=>{const publishable=isPublishableMetric(metric);return <article className={styles.metric} key={metric.id}><span className={styles.status}>{publishable?"Publicado":"En validación"}</span><strong className={styles.value}>{publishable?`${metric.value?.toLocaleString("es-CO")} ${metric.unit}`:"—"}</strong><h3>{metric.label}</h3><p>{metric.note}</p><small>Fuente: {metric.source} · {metric.cutoff?`corte ${metric.cutoff}`:"corte pendiente"}{metric.methodologyRequired?" · metodología requerida":""}</small></article>})}</div></div></section>

        <section className={styles.method}><div className={`${styles.container} ${styles.methodGrid}`}><div><span className={styles.eyebrow}>Contrato de publicación</span><h2>Del registro operativo al dato público.</h2></div><div className={styles.steps}>{steps.map(([number,title,copy])=><article className={styles.step} key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></article>)}</div></div></section>

        <section className={`${styles.section} ${styles.soft}`}><div className={styles.container}><div className={styles.sectionHead}><span className={styles.eyebrow}>Por caso y territorio</span><h2>El impacto conserva su contexto operacional.</h2><p>Las comparaciones por planta o territorio solo tendrán sentido cuando periodo, unidad y cobertura sean compatibles.</p></div><div className={styles.siteGrid}><article className={styles.site}><h3>Yarumal</h3><p>Experiencia documentada en recepción, tratamiento, productos, mantenimiento y trazabilidad. Los indicadores públicos se habilitan únicamente cuando exista un corte validado.</p><Link href="/proyectos/yarumal">Ver caso Yarumal →</Link></article><article className={styles.site}><h3>Támesis</h3><p>Caso documentado de diagnóstico y rehabilitación. Los valores históricos permanecen separados de cualquier estado actual hasta una nueva validación.</p><Link href="/proyectos/tamesis">Ver caso Támesis →</Link></article></div></div></section>

        <section className={styles.guard}><div className={`${styles.container} ${styles.guardGrid}`}><div><span className={styles.eyebrow}>Impacto climático</span><h2>CO₂-eq no es una cifra decorativa.</h2></div><p>Un indicador climático solo podrá publicarse cuando estén definidos el escenario de referencia, los límites del sistema, los factores de emisión, el periodo, las fuentes de actividad y los supuestos. Hasta entonces permanece explícitamente en validación.</p></div></section>

        <section className={styles.closing} aria-labelledby="impact-closing-title">
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div>
              <span className={styles.eyebrow}>De la métrica a la decisión</span>
              <h2 id="impact-closing-title">La evidencia pública debe llevar al caso que la explica y a la capacidad que puede intervenir.</h2>
              <p>Los proyectos conservan el contexto operacional detrás de la evidencia. Las soluciones muestran las capacidades que Greenatics puede estructurar y ejecutar según el alcance de cada proyecto.</p>
            </div>
            <div className={styles.closingActions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/proyectos">Ver proyectos documentados</Link>
              <Link className={styles.button} href="/soluciones">Ver soluciones</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
