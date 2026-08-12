import type { Metadata } from "next";
import Link from "next/link";
import { deficiencyCrops, deficiencyQuickRules } from "@/data/wondergreen-knowledge";
import styles from "../library.module.css";

export const metadata: Metadata = {
  title: "Guía de deficiencias nutricionales | Wondergreen",
  description: "Lectura visual orientativa de deficiencias nutricionales por cultivo, con reglas de campo y advertencias para evitar diagnósticos automáticos.",
};

export default function DeficiencyGuidePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" aria-label="Greenatics">
            <img className={styles.logo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
          </Link>
          <Link className={styles.headerLink} href="/biblioteca">Biblioteca</Link>
          <Link className={styles.headerLink} href="/wondergreen/cultivos">Cultivos</Link>
          <Link className={`${styles.button} ${styles.primary}`} href="/app">Acceder a Greenatics</Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · diagnóstico orientativo</span>
              <h1>Una hoja amarilla no es un diagnóstico.</h1>
              <p className={styles.lead}>La lectura visual sirve para formular hipótesis, no para saltar directamente a un producto. Primero ubicamos el tejido, el patrón del lote y el contexto; después decidimos qué vale la pena comprobar.</p>
            </div>
            <aside className={styles.warning}>
              <strong>Regla de uso</strong>
              <p>La guía no sustituye análisis de suelo, análisis foliar, revisión de raíces ni diagnóstico sanitario. Si las señales son ambiguas, la salida correcta es confirmar antes de corregir.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Cuatro preguntas antes del producto</span>
              <h2>Lee la planta y el lote en contexto.</h2>
            </div>
            <div className={styles.ruleGrid}>
              {deficiencyQuickRules.map((rule, index) => (
                <article className={styles.ruleCard} key={rule.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{rule.title}</h3>
                  <p>{rule.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Lectura por cultivo</span>
              <h2>El mismo nutriente no siempre se ve igual.</h2>
              <p>Estas tablas son una capa de orientación y mantienen visibles los principales confundidores antes de convertir un síntoma en una recomendación.</p>
            </div>
            <div className={styles.deficiencyStack}>
              {deficiencyCrops.map((crop) => (
                <article className={styles.cropBlock} key={crop.slug} id={crop.slug}>
                  <div className={styles.cropHead}>
                    <div>
                      <span className={styles.eyebrow}>Guía · {crop.name}</span>
                      <h2>{crop.name}</h2>
                    </div>
                    <p>{crop.intro}</p>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>Nutriente</th><th>Dónde empieza</th><th>Señal orientativa</th><th>Qué revisar</th></tr></thead>
                      <tbody>
                        {crop.rows.map((row) => (
                          <tr key={`${crop.slug}-${row.nutrient}`}>
                            <td><strong>{row.nutrient}</strong></td>
                            <td>{row.starts}</td>
                            <td>{row.symptom}</td>
                            <td>{row.interpretation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.notes}>{crop.fieldNotes.map((note) => <div className={styles.note} key={note}>{note}</div>)}</div>
                  <div className={styles.cropActions}>
                    <Link className={styles.cropCta} href={`/wondergreen/cultivos/${crop.cropSlug}`}>
                      <span>Ver programa Wondergreen para {crop.name}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={`${styles.container} ${styles.sourceGrid}`}>
            <div>
              <span className={styles.eyebrow}>Cómo usar esta información</span>
              <h2>Hipótesis → comprobación → decisión.</h2>
            </div>
            <div>
              <p>Si la lectura visual apunta a una posible carencia, la siguiente pregunta no es “¿qué producto aplico?”, sino “¿qué otra causa puede producir este patrón y qué evidencia puedo obtener?”. Solo después se conecta la necesidad con una familia Wondergreen y con su versión técnica vigente.</p>
              <Link href="/wondergreen#portafolio">Consultar Product Master →</Link>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Siguiente paso</span><h2>¿Quieres revisar un caso de campo con contexto?</h2></div>
            <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen#contacto">Hablar con equipo técnico</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}><span>© Greenatics S.A.S. · Wondergreen · Guía de deficiencias</span><Link href="/biblioteca">Volver a Biblioteca</Link></div>
      </footer>
    </div>
  );
}
