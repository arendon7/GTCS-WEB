"use client";

import Link from "next/link";
import { useId, useState } from "react";

export function EsgCalculator() {
  const [tonsPerMonth, setTonsPerMonth] = useState(120);
  const [disposalCostPerTon, setDisposalCostPerTon] = useState(85000);
  const tonsId = useId();
  const costId = useId();

  const annualTons = tonsPerMonth * 12;
  const estimatedClimateImpact = annualTons * 0.95;
  const grossDisposalCost = annualTons * disposalCostPerTon;
  const estimatedSolidMatrix = annualTons * 0.42;
  const contactHref = `/contacto/?interes=esg&perfil=empresa&diagnostico=${encodeURIComponent("Escenario ESG de escala y costo")}&prioridad=${encodeURIComponent(`${tonsPerMonth} t/mes · ${disposalCostPerTon.toLocaleString("es-CO")} COP/t · horizonte de 12 meses`)}`;

  return (
    <div className="esg-scenario">
      <header className="esg-scenario__header">
        <span className="eyebrow">Escenario orientativo de escala y costo</span>
        <h3>¿Qué magnitud tendría una corriente orgánica durante un año?</h3>
        <p>Modifica volumen y costo unitario para dimensionar la conversación. Ningún resultado equivale por sí solo a ahorro, mitigación certificada o producto comercial.</p>
      </header>

      <div className="esg-scenario__body">
        <div className="esg-scenario__controls">
          <label htmlFor={tonsId}>Residuos orgánicos generados <strong>{tonsPerMonth} t/mes</strong></label>
          <input id={tonsId} type="range" min="10" max="1000" step="10" value={tonsPerMonth} onChange={(event) => setTonsPerMonth(Number(event.target.value))} />

          <label htmlFor={costId}>Costo unitario de referencia <strong>${disposalCostPerTon.toLocaleString("es-CO")} COP/t</strong></label>
          <input id={costId} type="range" min="40000" max="180000" step="5000" value={disposalCostPerTon} onChange={(event) => setDisposalCostPerTon(Number(event.target.value))} />

          <p>Supuestos de demostración: 12 meses, factor climático de 0,95 t CO₂e/t y rendimiento de matriz sólida del 42 %.</p>
        </div>

        <div className="esg-scenario__results" aria-live="polite">
          <article><span>Volumen anual evaluado</span><strong>{annualTons.toLocaleString("es-CO")} <small>t</small></strong><p>Generación bruta configurada.</p></article>
          <article><span>Impacto climático teórico</span><strong>{estimatedClimateImpact.toLocaleString("es-CO")} <small>t CO₂e</small></strong><p>Estimación sujeta a metodología.</p></article>
          <article><span>Costo bruto de referencia</span><strong>${(grossDisposalCost / 1_000_000).toFixed(1)} M</strong><p>No equivale a ahorro neto del proyecto.</p></article>
          <article><span>Matriz sólida teórica</span><strong>{estimatedSolidMatrix.toLocaleString("es-CO")} <small>t</small></strong><p>Antes de calidad, registro o mercado.</p></article>
        </div>
      </div>
      <div className="esg-scenario__actions">
        <Link className="button button--dark" href={contactHref}>Llevar este escenario a Contacto →</Link>
        <span>El equipo puede ayudarte a convertirlo en una línea base verificable.</span>
      </div>
    </div>
  );
}
