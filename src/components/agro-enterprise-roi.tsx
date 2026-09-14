"use client";

import React, { useState } from "react";
import Link from "next/link";

export function AgroEnterpriseRoi() {
  const [hectares, setHectares] = useState<number>(25);
  const [currentChemicalCostPerHa, setCurrentChemicalCostPerHa] = useState<number>(3800000); // COP $3.8M / ha / año
  const [biomassTonsYear, setBiomassTonsYear] = useState<number>(80); // 80 ton residuos propios

  // Calculations
  const totalCurrentCost = hectares * currentChemicalCostPerHa;
  const chemicalSavingsPercent = 0.30; // 30% savings with organomineral occlusion
  const annualSavings = totalCurrentCost * chemicalSavingsPercent;
  const compostProducedFromWaste = Math.round(biomassTonsYear * 0.42 * 25); // Bultos de 40kg
  const wasteValueRecovery = compostProducedFromWaste * 135000; // Valor comercial bultos
  const contactHref = `/contacto/?interes=agroindustria&perfil=empresa&diagnostico=${encodeURIComponent("Escenario de valorización agroindustrial")}&prioridad=${encodeURIComponent(`${hectares} ha · ${biomassTonsYear} ton/año de biomasa · costo base ${currentChemicalCostPerHa.toLocaleString("es-CO")} COP/ha/año`)}`;

  return (
    <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "24px", padding: "36px", boxShadow: "0 16px 44px rgba(0, 107, 69, 0.07)" }}>
      <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 32px" }}>
        <span className="eyebrow">Simulador Financiero & Agronómico</span>
        <h3 style={{ fontSize: "1.6rem", color: "var(--green-950)", margin: "6px 0 8px" }}>
          Modelo de Retorno de Inversión (ROI) para Agroempresas
        </h3>
        <p style={{ fontSize: "0.94rem", color: "var(--muted)" }}>
          Explora un escenario de ahorro potencial y valorización de biomasa propia. Úsalo para ordenar la conversación técnica; la decisión se confirma con análisis agronómico, costos y disponibilidad.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: "32px", alignItems: "center" }}>
        {/* Sliders Input */}
        <div style={{ background: "#fafcf9", padding: "24px", borderRadius: "18px", border: "1px solid #edf4ea" }}>
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "6px" }}>
            Área Productiva: <strong>{hectares} Hectáreas</strong>
          </label>
          <input
            type="range"
            min="5"
            max="200"
            step="5"
            value={hectares}
            onChange={(e) => setHectares(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer", marginBottom: "20px" }}
          />

          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "6px" }}>
            Costo Actual de Fertilización Química: <strong>COP ${(currentChemicalCostPerHa / 1000000).toFixed(1)}M / ha / año</strong>
          </label>
          <input
            type="range"
            min="1500000"
            max="7000000"
            step="200000"
            value={currentChemicalCostPerHa}
            onChange={(e) => setCurrentChemicalCostPerHa(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer", marginBottom: "20px" }}
          />

          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "6px" }}>
            Biomasa / Residuos Orgánicos Propios: <strong>{biomassTonsYear} ton / año</strong>
          </label>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={biomassTonsYear}
            onChange={(e) => setBiomassTonsYear(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
          />
        </div>

        {/* Live Output Matrix */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div style={{ background: "#0a2920", color: "#ffffff", padding: "20px", borderRadius: "16px" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#98cf4f", fontWeight: 800 }}>Ahorro potencial anual</span>
            <strong style={{ display: "block", fontSize: "1.6rem", margin: "4px 0", color: "#98cf4f" }}>
              COP ${(annualSavings / 1000000).toFixed(1)}M
            </strong>
            <small style={{ fontSize: "0.75rem", color: "#cbdcd3" }}>Supuesto ilustrativo de reducción: 30 %</small>
          </div>

          <div style={{ background: "#0a2920", color: "#ffffff", padding: "20px", borderRadius: "16px" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#98cf4f", fontWeight: 800 }}>Valor teórico de biomasa</span>
            <strong style={{ display: "block", fontSize: "1.6rem", margin: "4px 0", color: "#ffffff" }}>
              COP ${(wasteValueRecovery / 1000000).toFixed(1)}M
            </strong>
            <small style={{ fontSize: "0.75rem", color: "#cbdcd3" }}>{compostProducedFromWaste} bultos valorizados</small>
          </div>

          <div style={{ background: "#f0f8ec", border: "1px solid #d4ebd0", padding: "18px", borderRadius: "16px", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--green-800)", fontWeight: 800 }}>Valor combinado del escenario:</span>
                <strong style={{ display: "block", fontSize: "1.55rem", color: "var(--green-950)", margin: "2px 0" }}>
                  COP ${((annualSavings + wasteValueRecovery) / 1000000).toFixed(1)} Millones / año
                </strong>
              </div>
              <Link
                href="/wondergreen/cotizador/"
                className="button button--primary"
                style={{ fontSize: "0.86rem" }}
              >
                Explorar productos y cotizador →
              </Link>
            </div>
            <p style={{ gridColumn: "1 / -1", color: "var(--muted)", fontSize: "0.76rem", lineHeight: 1.5, margin: "14px 0 0" }}>
              Escenario de demostración: valida análisis de suelo, producto, dosis, costos, disponibilidad y respuesta agronómica antes de usarlo para una decisión financiera.
            </p>
            <Link className="button button--dark" href={contactHref} style={{ gridColumn: "1 / -1", justifySelf: "start", marginTop: "2px" }}>
              Llevar escenario a Contacto →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
