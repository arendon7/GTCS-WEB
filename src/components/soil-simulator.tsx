"use client";

import React, { useState } from "react";

interface SoilProfile {
  id: string;
  name: string;
  region: string;
  typicalPh: number;
  challenge: string;
  solution: string;
}

const soils: SoilProfile[] = [
  {
    id: "andisol",
    name: "Andisol Volcánico",
    region: "Eje Cafetero, Suroeste Antioqueño, Nariño",
    typicalPh: 5.2,
    challenge: "Alta fijación de fósforo (complejos con alofana) y acidez con riesgo de aluminio.",
    solution: "La materia orgánica estabilizada de Wondergreen bloquea sitios de fijación, liberando el fósforo retenido y aumentando la C.I.C."
  },
  {
    id: "oxisol",
    name: "Oxisol / Ultisol",
    region: "Llanos Orientales, Piedemonte, Amazonía",
    typicalPh: 4.6,
    challenge: "Baja fertilidad natural, lavado extremo de bases (Ca, Mg, K) y toxicidad por aluminio.",
    solution: "La matriz organomineral amortigua el pH, aporta bases estructuradas y evita el lavado por lluvias intensas."
  },
  {
    id: "inceptisol",
    name: "Inceptisol de Ladera",
    region: "Zona Andina, Laderas de Alta Pendiente",
    typicalPh: 5.8,
    challenge: "Suelo joven susceptible a erosión hídrica, pérdida de capa superficial y sequías periódicas.",
    solution: "Aporte de biomasa humificada que mejora la agregación del suelo, retiene hasta 3x su peso en agua y nutre la microbiota nativa."
  }
];

export function SoilSimulator() {
  const [selectedSoil, setSelectedSoil] = useState<string>("andisol");
  const [ph, setPh] = useState<number>(5.2);

  const currentSoil = soils.find(s => s.id === selectedSoil) || soils[0];

  // Calculations based on pH and Soil
  const pAvailability = Math.min(95, Math.max(20, Math.round(30 + (ph - 4.5) * 22)));
  const microbialActivity = Math.min(98, Math.max(25, Math.round(35 + (ph - 4.0) * 18)));
  const aluminumToxicity = ph < 5.0 ? "Alto (Toxicidad Radicular)" : ph < 5.5 ? "Moderado (Riesgo)" : "Bajo / Neutralizado";
  const alColor = ph < 5.0 ? "#d9534f" : ph < 5.5 ? "#f0ad4e" : "#5cb85c";

  return (
    <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "24px", padding: "32px", boxShadow: "0 16px 44px rgba(0, 107, 69, 0.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "24px" }}>
        <div>
          <span className="eyebrow">Simulador de Suelo & Rizósfera</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "1.5rem", color: "var(--green-950)" }}>
            Dinámica Nutricional y Efecto Buffer Wondergreen
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--muted)" }}>
            Evalúa la respuesta fisiológica del suelo según su orden edáfico y nivel de pH.
          </p>
        </div>

        {/* Soil Selector Tabs */}
        <div style={{ display: "flex", gap: "8px", background: "rgba(0, 107, 69, 0.08)", padding: "4px", borderRadius: "999px" }}>
          {soils.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => {
                setSelectedSoil(s.id);
                setPh(s.typicalPh);
              }}
              style={{
                padding: "7px 16px",
                borderRadius: "999px",
                border: "none",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                background: selectedSoil === s.id ? "var(--green-800)" : "transparent",
                color: selectedSoil === s.id ? "#ffffff" : "var(--muted)",
                transition: "all 0.2s ease"
              }}
            >
              {s.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Interactive Controls & Live Bio-Output */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: "28px" }}>
        {/* Left: Soil Context & Slider */}
        <div style={{ background: "#fafcf9", padding: "22px", borderRadius: "18px", border: "1px solid #edf4ea" }}>
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "0.76rem", textTransform: "uppercase", color: "var(--green-800)", fontWeight: 800 }}>Tipo de Suelo Seleccionado</span>
            <h4 style={{ fontSize: "1.2rem", color: "var(--green-950)", margin: "2px 0 4px" }}>{currentSoil.name}</h4>
            <small style={{ color: "var(--muted)", display: "block" }}>📍 Regiones: {currentSoil.region}</small>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "8px" }}>
              <span>Nivel de pH del Suelo:</span>
              <span style={{ color: "var(--green-800)", background: "#eaf5e6", padding: "2px 10px", borderRadius: "999px" }}>
                pH {ph.toFixed(1)} ({ph < 5.2 ? "Ácido Fuerte" : ph < 6.2 ? "Moderadamente Ácido" : "Óptimo / Neutro"})
              </span>
            </label>
            <input
              type="range"
              min="4.2"
              max="7.2"
              step="0.1"
              value={ph}
              onChange={(e) => setPh(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
            />
          </div>

          <div style={{ padding: "14px", background: "#ffffff", borderRadius: "12px", border: "1px solid var(--line)" }}>
            <strong style={{ fontSize: "0.82rem", color: "#c25e00", display: "block", marginBottom: "4px" }}>Reto Agronómico:</strong>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.45 }}>{currentSoil.challenge}</p>
          </div>
        </div>

        {/* Right: Live Metrics with Wondergreen Matrix */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#0a2920", color: "#ffffff", borderRadius: "18px", padding: "20px 24px" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#98cf4f", fontWeight: 800 }}>
              Respuesta con Wondergreen Organomineral
            </span>
            <p style={{ margin: "6px 0 16px", fontSize: "0.88rem", color: "#cbdcd3", lineHeight: 1.5 }}>
              {currentSoil.solution}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "14px" }}>
              <div>
                <small style={{ fontSize: "0.72rem", color: "#a8c7b8", display: "block" }}>Fósforo Asimilable</small>
                <strong style={{ fontSize: "1.35rem", color: "#98cf4f" }}>{pAvailability}%</strong>
              </div>
              <div>
                <small style={{ fontSize: "0.72rem", color: "#a8c7b8", display: "block" }}>Actividad Biológica</small>
                <strong style={{ fontSize: "1.35rem", color: "#ffffff" }}>{microbialActivity}%</strong>
              </div>
              <div>
                <small style={{ fontSize: "0.72rem", color: "#a8c7b8", display: "block" }}>Riesgo Aluminio</small>
                <strong style={{ fontSize: "0.95rem", color: alColor, display: "block", marginTop: "4px" }}>{aluminumToxicity.split(" ")[0]}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: "#f0f8ec", border: "1px solid #d4ebd0", borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--green-700)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 800, flexShrink: 0 }}>
              ✓
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--green-950)" }}>
              <strong>Recomendación por Lote:</strong> Para este suelo en pH {ph.toFixed(1)}, aplicar fórmula sólida al suelo (2GROW o 2BALANCE) complementada con bioles líquidos para máxima asimilación radicular.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
