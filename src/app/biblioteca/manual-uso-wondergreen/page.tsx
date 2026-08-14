import type { Metadata } from "next";
import Link from "next/link";
import { fieldApplicationRules, fieldChecklist } from "@/data/wondergreen-crops";
import styles from "../library.module.css";

export const metadata: Metadata = {
  title: "Manual de uso Wondergreen | Greenatics",
  description:
    "Ruta práctica para preparar, aplicar, registrar y hacer seguimiento al uso de Wondergreen sin convertir una guía general en una receta universal.",
  alternates: { canonical: "/biblioteca/manual-uso-wondergreen" },
};

const route = [
  ["01", "Leer el contexto", "Cultivo, etapa, objetivo, condición del suelo, agua, manejo previo y análisis disponibles."],
  ["02", "Confirmar la referencia", "Producto, formato, versión técnica, vía permitida y condición comercial vigente."],
  ["03", "Preparar la aplicación", "Equipo limpio, agua adecuada, mezcla homogénea y cantidad que realmente se aplicará."],
  ["04", "Aplicar con criterio", "Evitar estrés severo, lluvia inminente y condiciones que reduzcan la consistencia del evento."],
  ["05", "Registrar", "Fecha, lote, producto, vía, condición climática, observaciones y responsable."],
  ["06", "Revisar y ajustar", "Observar respuesta, comparar con el objetivo y decidir el siguiente paso con evidencia."],
] as const;

const avoid = [
  "Elegir una referencia únicamente por el número de su fórmula.",
  "Convertir una guía general en una dosis automática para cualquier lote.",
  "Mezclar productos sin revisar compatibilidad y sin una prueba previa cuando corresponda.",
  "Aplicar sobre plantas severamente marchitas, suelo totalmente seco o con lluvia inmediata prevista.",
  "Confundir un síntoma visual con un diagnóstico definitivo.",
  "Repetir una aplicación sin registrar qué se hizo y qué ocurrió después.",
] as const;

export default function WondergreenUseManualPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · manual web</span>
              <h1>Aplicar mejor empieza antes de abrir el producto.</h1>
              <p className={styles.lead}>
                Esta guía organiza una ruta común de uso y seguimiento. No reemplaza la ficha técnica vigente, el análisis del lote ni la recomendación agronómica específica.
              </p>
            </div>
            <aside className={styles.warning}>
              <strong>Regla de uso.</strong>
              <p>Producto correcto + contexto correcto + aplicación consistente + seguimiento. Si falta información crítica, la decisión correcta es detener la receta y completar el diagnóstico.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Ruta de aplicación</span>
              <h2>Seis momentos para convertir una aplicación en un proceso controlado.</h2>
            </div>
            <div className={styles.libraryGrid}>
              {route.map(([number, title, copy]) => (
                <article className={styles.libraryCard} key={number}>
                  <span className={styles.status}>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Antes de aplicar</span>
              <h2>Comprobaciones mínimas de campo.</h2>
              <p>Estas preguntas ya forman parte de los programas Wondergreen por cultivo y ayudan a evitar recomendaciones descontextualizadas.</p>
            </div>
            <div className={styles.notes}>
              {fieldChecklist.map((item) => <div className={styles.note} key={item}>{item}</div>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Ejecución</span>
              <h2>Reglas comunes para una aplicación más consistente.</h2>
            </div>
            <div className={styles.notes}>
              {fieldApplicationRules.map((item) => <div className={styles.note} key={item}>{item}</div>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Errores a evitar</span>
              <h2>Una buena recomendación también define qué no hacer.</h2>
            </div>
            <div className={styles.notes}>
              {avoid.map((item) => <div className={styles.note} key={item}>{item}</div>)}
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Siguiente paso</span><h2>Conecta el manual con el cultivo real.</h2></div>
            <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/cultivos">Ver programas por cultivo</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
