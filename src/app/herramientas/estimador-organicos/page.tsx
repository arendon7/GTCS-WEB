import type { Metadata } from "next";
import Link from "next/link";
import { HuellaScenarioExplorer } from "@/components/huella-scenario-explorer";

export const metadata: Metadata = {
  title: "Estimador de flujo orgánico",
  description: "Explora un escenario de generación y desvío de residuos orgánicos. Proyecta masa; no calcula emisiones ni CO₂e evitado.",
  alternates: { canonical: "/herramientas/estimador-organicos/" },
};

export default function OrganicFlowEstimatorPage() {
  return (
    <>
      <section className="organic-flow-intro" aria-labelledby="organic-flow-title">
        <div className="container organic-flow-intro__inner">
          <div>
            <Link className="back-link" href="/impacto/">← Impacto y evidencia</Link>
            <span className="eyebrow">Herramienta exploratoria · residuos orgánicos</span>
            <h1 id="organic-flow-title">Dimensiona el flujo. Después, evalúa su impacto.</h1>
            <p>Modifica generación mensual y meta de desvío para visualizar una proyección de masa. Es un punto de partida para ordenar preguntas del proyecto; no mide emisiones, no prueba una reducción y no reemplaza una línea base.</p>
            <div className="button-row">
              <a className="button button--dark" href="#calculadora-organicos">Explorar el escenario ↓</a>
              <Link className="button button--ghost" href="/huella/">Conocer el inventario empresarial GEI</Link>
            </div>
          </div>
          <div className="organic-flow-intro__sequence" aria-label="El estimador relaciona generación, meta de desvío y masa proyectada">
            <span>Generación orgánica</span><i aria-hidden="true">→</i><span>Meta de desvío</span><i aria-hidden="true">→</i><strong>Masa proyectada</strong>
          </div>
        </div>
      </section>
      <HuellaScenarioExplorer />
    </>
  );
}
