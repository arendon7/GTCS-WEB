import type { Metadata } from "next";
import Link from "next/link";
import { DiagnosticRouter } from "./diagnostic-router";
import styles from "./diagnostic-initial.module.css";

export const metadata: Metadata = {
  title: "Diagnóstico inicial | Greenatics",
  description: "Orientador inicial para identificar contexto, necesidad y estado actual antes de elegir una solución Greenatics.",
  alternates: { canonical: "/soluciones/diagnostico-inicial" },
};

export default function InitialDiagnosticPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Diagnóstico inicial Greenatics · orientador</span>
              <h1>No necesitas saber qué servicio pedir.</h1>
              <p className={styles.lead}>Identifica primero quién está tomando la decisión, qué necesita resolver y cuál es el estado actual. Con esas tres respuestas reducimos el problema a unas pocas rutas que vale la pena revisar.</p>
            </div>
            <aside className={styles.heroAside}>
              <span>Qué hace esta herramienta</span>
              <strong>Orienta la conversación. No sustituye un diagnóstico técnico.</strong>
              <p>No calcula capacidades, tarifas, cumplimiento, inversiones ni diseños. Tampoco concluye automáticamente qué debe contratarse. Su función es evitar que tengas que navegar todo el portafolio para encontrar un punto de partida.</p>
            </aside>
          </div>
        </section>

        <section className={styles.body} aria-label="Orientador inicial Greenatics">
          <div className={styles.container}>
            <DiagnosticRouter />
            <div className={styles.boundary}>
              <strong>Límite de esta orientación</strong>
              <p>El servicio técnico de <Link href="/soluciones/diagnostico-caracterizacion">diagnóstico y caracterización</Link> sigue siendo un alcance independiente cuando se necesitan mediciones, línea base, caracterización, inventario de infraestructura o evidencia de campo. Este orientador únicamente organiza la primera conversación.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
