"use client";

import Link from "next/link";
import { useState } from "react";
import { buildToolContactHref, storeToolContactDraft } from "@/data/tool-contact-handoff";

const format = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

export function HuellaScenarioExplorer() {
  const [monthlyTons, setMonthlyTons] = useState(120);
  const [diversionPercent, setDiversionPercent] = useState(90);

  const annualTons = monthlyTons * 12;
  const divertedTons = annualTons * (diversionPercent / 100);
  const remainingTons = annualTons - divertedTons;
  const scenario = `${monthlyTons} t/mes · meta de desvío ${diversionPercent}%`;
  const message = encodeURIComponent(`Hola Greenatics. Quiero revisar un escenario de materia orgánica: ${scenario}. Me interesa acordar línea base, destino y método antes de estimar emisiones.`);
  const assessmentDetails = `Flujo orgánico considerado: ${monthlyTons} t/mes (${annualTons} t/año)\nMeta de desvío explorada: ${diversionPercent}%\nMasa anual desviada proyectada: ${divertedTons.toLocaleString("es-CO", { maximumFractionDigits: 1 })} t/año\nMasa remanente proyectada: ${remainingTons.toLocaleString("es-CO", { maximumFractionDigits: 1 })} t/año\nEsta herramienta proyecta flujo de masa, no calcula CO₂e evitado. Para estimar emisiones se deben acordar referencia, destino, rutas, factores y periodo.`;
  const contactHref = buildToolContactHref("estimador-organicos", "territorio", "Flujo de materia orgánica");

  return (
    <section className="carbon-v4-calculator" id="calculadora-organicos" aria-labelledby="huella-explorer-title">
      <div className="container carbon-v4-calculator__grid">
        <div className="carbon-v4-controls">
          <div>
            <span className="eyebrow">Exploración pública</span>
            <h2 id="huella-explorer-title">Explora el flujo antes de hablar de emisiones.</h2>
            <p>Modifica dos supuestos para dimensionar el material. Es una proyección de masa; no representa una medición ni una reducción de GEI atribuible a un proyecto.</p>
          </div>
          <label>
            <span>Generación orgánica mensual <strong>{monthlyTons} t/mes</strong></span>
            <input aria-label="Generación orgánica mensual en toneladas" type="range" min="10" max="500" step="10" value={monthlyTons} onChange={(event) => setMonthlyTons(Number(event.target.value))} />
          </label>
          <label>
            <span>Meta de desvío <strong>{diversionPercent} %</strong></span>
            <input aria-label="Meta de desvío porcentual" type="range" min="20" max="100" step="5" value={diversionPercent} onChange={(event) => setDiversionPercent(Number(event.target.value))} />
          </label>
          <div className="carbon-v4-assumptions">
            <strong>Qué se necesita para estimar GEI</strong>
            <ul>
              <li>Una línea base y el destino de disposición que se compara.</li>
              <li>Flujos pesados, composición, distancias y viajes realmente asociados.</li>
              <li>Factores de emisión con fuente, versión, alcance e incertidumbre.</li>
            </ul>
          </div>
        </div>

        <div className="carbon-v4-results">
          <div className="carbon-v4-results__head">
            <span>Flujo anual de referencia</span>
            <strong>{format.format(annualTons)} <small>t/año</small></strong>
            <p>Proyección basada en la generación mensual que seleccionaste; el desvío es una meta, no un resultado observado.</p>
          </div>
          <div className="carbon-v4-results__grid">
            <article><span>Generación mensual</span><strong>{format.format(monthlyTons)} t</strong><small>Supuesto de entrada</small></article>
            <article><span>Meta de desvío</span><strong>{diversionPercent} %</strong><small>Parámetro seleccionado</small></article>
            <article><span>Material en la meta</span><strong>{format.format(divertedTons)} t</strong><small>Proyección anual</small></article>
            <article><span>Fuera de la meta</span><strong>{format.format(remainingTons)} t</strong><small>Proyección anual</small></article>
          </div>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            Proyección de flujo: {format.format(annualTons)} t/año; meta de desvío {diversionPercent} %:
            {" "}{format.format(divertedTons)} t/año dentro de la meta y {format.format(remainingTons)} t/año fuera.
            Escenario estimado; no es resultado observado ni CO₂e evitado.
          </p>
          <div className="carbon-v4-result-note">
            <span>La masa proyectada no equivale a CO₂e evitado.</span>
            <p>Para estimar emisiones se deben definir el escenario de referencia, el tratamiento y destino del material, las rutas, los factores aplicables y el periodo de análisis. El resultado debe conservar fuentes y supuestos.</p>
          </div>
          <div className="button-row">
            <Link className="button button--light" href={contactHref} onClick={() => storeToolContactDraft(assessmentDetails)}>Revisar el escenario con Greenatics</Link>
            <a className="button button--outline-light" href={`https://wa.me/573003078822?text=${message}`} target="_blank" rel="noopener noreferrer">Conversar por WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}
