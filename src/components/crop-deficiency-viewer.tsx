"use client";

import React, { useState } from "react";

interface Deficiency {
  id: string;
  nutrient: string;
  symbol: string;
  symptom: string;
  risk: string;
  solution: string;
}

const deficiencies: Deficiency[] = [
  {
    id: "nitrogeno",
    nutrient: "Nitrógeno",
    symbol: "N",
    symptom: "Clorosis generalizada (amarillamiento) en hojas viejas que avanza hacia el ápice, con detención del crecimiento vegetativo.",
    risk: "Reducción del área foliar fotosintética y caída de rendimiento hasta en 40%.",
    solution: "Aplicación edáfica de Wondergreen 2GROW (15-3-3) para reanudar brotación vigorosa y síntesis de clorofila sin estrés salino."
  },
  {
    id: "fosforo",
    nutrient: "Fósforo",
    symbol: "P",
    symptom: "Pigmentación púrpura o bronceada en hojas basales, tallos delgados y escaso desarrollo del sistema radicular.",
    risk: "Pobre anclaje de la planta, caída masiva de botones florales y retraso de cosecha.",
    solution: "Aplicación de Wondergreen 2BLOOM (3-8-3) con fósforo biodisponible ocluido en carbón orgánico para estimular floración y raíces."
  },
  {
    id: "potasio",
    nutrient: "Potasio",
    symbol: "K",
    symptom: "Quemazón o necrosis marginal en los bordes de las hojas maduras, tallos débiles y frutos pequeños y desabridos.",
    risk: "Frutos de bajo calibre comercial, susceptibilidad a vuelco y pérdida de peso de pulpa.",
    solution: "Aplicación de Wondergreen 2FRUIT (3-3-8) para llenado de fruto, peso de grano, consistencia de cáscara y grados Brix."
  },
  {
    id: "magnesio",
    nutrient: "Magnesio & Micronutrientes",
    symbol: "Mg + B + Zn",
    symptom: "Clorosis intervenal en forma de espina de pescado (hojas amarillas con nervaduras verdes) y deformación de brotes.",
    risk: "Pérdida de eficiencia en fotosíntesis y cuajado deficiente en floración.",
    solution: "Aplicación de Wondergreen 2BALANCE (7-7-7) o bioinsumos botánicos enriquecidos con bioles fermentados multiminerales."
  }
];

export function CropDeficiencyViewer() {
  const [selectedId, setSelectedId] = useState<string>("nitrogeno");
  const current = deficiencies.find(d => d.id === selectedId) || deficiencies[0];

  return (
    <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "24px", padding: "32px", boxShadow: "0 14px 40px rgba(0, 107, 69, 0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "24px" }}>
        <div>
          <span className="eyebrow">Orientador Agronómico en Campo</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "1.45rem", color: "var(--green-950)" }}>
            Diagnóstico Visual de Deficiencias Nutricionales
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--muted)" }}>
            Identifica rápidamente los síntomas en cultivo y la fórmula Wondergreen recomendada.
          </p>
        </div>

        {/* Nutrients Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {deficiencies.map((d) => (
            <button
              type="button"
              key={d.id}
              onClick={() => setSelectedId(d.id)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: selectedId === d.id ? "2px solid var(--green-700)" : "1px solid var(--line)",
                background: selectedId === d.id ? "#f0f8ec" : "#ffffff",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                color: selectedId === d.id ? "var(--green-950)" : "var(--muted)",
                transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease"
              }}
            >
              {d.symbol} · {d.nutrient}
            </button>
          ))}
        </div>
      </div>

      {/* Symptom and orientation card */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", background: "#fafcf9", padding: "24px", borderRadius: "18px", border: "1px solid #edf4ea" }}>
        <div>
          <span style={{ fontSize: "0.76rem", textTransform: "uppercase", color: "#c25e00", fontWeight: 800 }}>
            Síntoma Visual Observado:
          </span>
          <h4 style={{ fontSize: "1.25rem", color: "var(--green-950)", margin: "4px 0 8px" }}>
            Deficiencia de {current.nutrient} ({current.symbol})
          </h4>
          <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.5, marginBottom: "14px" }}>
            {current.symptom}
          </p>
          <div style={{ padding: "10px 14px", background: "#fff4e8", border: "1px solid #fedbc4", borderRadius: "10px", fontSize: "0.82rem", color: "#9a4200" }}>
            <strong>Impacto en Cosecha:</strong> {current.risk}
          </div>
        </div>

        <div style={{ background: "#0a2920", color: "#ffffff", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#98cf4f", fontWeight: 800 }}>
            Tratamiento Técnico Wondergreen:
          </span>
          <p style={{ color: "#cbdcd3", fontSize: "0.9rem", lineHeight: 1.5, margin: "8px 0 16px" }}>
            {current.solution}
          </p>
          <a
            href="/wondergreen/cotizador/"
            className="button button--primary"
            style={{ fontSize: "0.84rem", textAlign: "center" }}
          >
            Cotizar Tratamiento para Cultivo →
          </a>
        </div>
      </div>
    </div>
  );
}
