"use client";

import { useState } from "react";

const routeOptions = [
  "Ruta selectiva domiciliaria",
  "Casino y gran generador",
  "Plaza de mercado o mayorista",
  "Agroindustria de cítricos o café",
] as const;

export function OpsInteractivePreview() {
  const [truckWeight, setTruckWeight] = useState(3450);
  const [routeType, setRouteType] = useState<(typeof routeOptions)[number]>(routeOptions[0]);

  const organicPurity = 0.96;
  const recoveredBiomass = Math.round(truckWeight * organicPurity);
  const estimatedSolidMatrix = Math.round(recoveredBiomass * 0.42);
  const estimatedClimateImpact = (recoveredBiomass * 0.00095).toFixed(2);

  return (
    <div className="ops-preview">
      <header className="ops-preview__header">
        <div>
          <span className="ops-preview__badge">Simulador operativo</span>
          <strong>GREENATICS OPS · Escenario de registro y balance</strong>
        </div>
        <span className="ops-preview__status">Demostración · datos simulados</span>
      </header>

      <div className="ops-preview__grid">
        <div className="ops-preview__controls">
          <label htmlFor="ops-route-type">Tipo de corriente</label>
          <select
            id="ops-route-type"
            value={routeType}
            onChange={(event) => setRouteType(event.target.value as (typeof routeOptions)[number])}
          >
            {routeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>

          <label htmlFor="ops-entry-weight">
            Pesaje de entrada <strong>{truckWeight.toLocaleString("es-CO")} kg</strong>
          </label>
          <input
            id="ops-entry-weight"
            type="range"
            min="500"
            max="15000"
            step="250"
            value={truckWeight}
            onChange={(event) => setTruckWeight(Number(event.target.value))}
          />

          <div className="ops-preview__lot">
            <span>Lote de demostración</span>
            <strong>GTCS-2026-B{Math.floor(truckWeight / 100)}-OPS</strong>
          </div>
          <p>El ejemplo muestra cómo una captura puede alimentar balances e indicadores. No consulta una báscula ni una operación en tiempo real.</p>
        </div>

        <div className="ops-preview__results" aria-live="polite">
          <article>
            <span>Biomasa neta estimada</span>
            <strong>{(recoveredBiomass / 1000).toFixed(2)} <small>t</small></strong>
            <p>Supuesto del escenario: 96 % de pureza.</p>
          </article>
          <article>
            <span>Matriz sólida orientativa</span>
            <strong>{estimatedSolidMatrix.toLocaleString("es-CO")} <small>kg</small></strong>
            <p>Rendimiento ilustrativo del 42 %.</p>
          </article>
          <article>
            <span>Impacto climático orientativo</span>
            <strong>{estimatedClimateImpact} <small>t CO₂e</small></strong>
            <p>Factor de demostración; requiere metodología propia.</p>
          </article>
          <article>
            <span>Trazabilidad esperada</span>
            <strong>Registro preparado</strong>
            <p>Autor, fecha, lote, evidencia y revisión.</p>
          </article>
        </div>
      </div>
    </div>
  );
}
