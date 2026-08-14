import type { Metadata } from "next";
import Link from "next/link";
import { publicResources } from "@/data/public-resources";
import styles from "./library.module.css";

export const metadata: Metadata = {
  title: "Biblioteca | Greenatics",
  description: "Guías, programas por cultivo, manuales y herramientas técnicas de Greenatics y Wondergreen convertidas en conocimiento navegable.",
};

export default function LibraryPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Greenatics · conocimiento aplicado</span>
              <h1>La biblioteca no es un archivo. Es parte de la decisión.</h1>
              <p className={styles.lead}>Guías, manuales y conocimiento técnico se convierten en rutas web conectadas con cultivos, productos, síntomas, evidencia y acompañamiento.</p>
            </div>
            <aside className={styles.warning}>
              <strong>Conocimiento antes que recomendación.</strong>
              <p>Una página técnica debe ayudar a formular mejores preguntas. Cuando la información no alcanza, la salida correcta es pedir análisis o escalar a un asesor.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Recursos disponibles</span>
              <h2>De documentos aislados a un sistema de conocimiento.</h2>
              <p>Cada recurso se conecta con el Product Master, una ruta agronómica o una decisión concreta. El estado visible evita presentar como definitivo lo que todavía requiere validación.</p>
            </div>
            <div className={styles.libraryGrid}>
              {publicResources.map((resource) => (
                <article className={styles.libraryCard} key={resource.id}>
                  <span className={styles.status}>{resource.statusLabel}</span>
                  <h3>{resource.title}</h3>
                  <p>{resource.copy}</p>
                  <Link href={resource.href}>{resource.cta} →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Cómo usar la biblioteca</span>
              <h2>Diagnosticar → entender → elegir → aplicar → medir.</h2>
              <p>La navegación debe acompañar la decisión, no obligar al usuario a conocer de antemano el nombre del producto.</p>
            </div>
            <div className={styles.ruleGrid}>
              <article className={styles.ruleCard}><span>01</span><h3>Diagnosticar</h3><p>Revisa síntomas, lote, suelo y posibles confundidores.</p></article>
              <article className={styles.ruleCard}><span>02</span><h3>Entender etapa</h3><p>Ubica el momento fisiológico y el objetivo productivo.</p></article>
              <article className={styles.ruleCard}><span>03</span><h3>Aplicar con criterio</h3><p>Confirma referencia, vía, equipo, condiciones y registro.</p></article>
              <article className={styles.ruleCard}><span>04</span><h3>Medir y ajustar</h3><p>Observa respuesta y usa evidencia para decidir el siguiente evento.</p></article>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Biblioteca Greenatics</span><h2>¿Buscas una guía para un cultivo específico?</h2></div>
            <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/cultivos">Ver cultivos</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
