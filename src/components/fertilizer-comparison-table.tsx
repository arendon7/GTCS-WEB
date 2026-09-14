"use client";

import React from "react";

const comparisonRows = [
  {
    parameter: "Composición",
    wondergreen: "Fórmula organomineral; confirmar valores en ficha vigente",
    chemical: "Depende de la fuente y la formulación",
    rawCompost: "Variable según materias primas y proceso"
  },
  {
    parameter: "Criterio de selección",
    wondergreen: "Objetivo, etapa, suelo, agua y manejo",
    chemical: "Concentración, fuente, índice salino y programa",
    rawCompost: "Madurez, estabilidad, calidad y dosis"
  },
  {
    parameter: "Información necesaria",
    wondergreen: "Etiqueta vigente y recomendación por etapa",
    chemical: "Ficha, análisis y compatibilidad con el programa",
    rawCompost: "Análisis de calidad y trazabilidad del proceso"
  },
  {
    parameter: "Seguimiento",
    wondergreen: "Respuesta del cultivo, suelo y objetivo definido",
    chemical: "Respuesta, balance nutricional y condición del suelo",
    rawCompost: "Respuesta del suelo, estabilidad y condiciones sanitarias"
  },
  {
    parameter: "Regla responsable",
    wondergreen: "No usar sin verificar presentación y etiqueta",
    chemical: "No generalizar riesgos entre fuentes distintas",
    rawCompost: "No usar sin conocer madurez y calidad"
  }
];

export function FertilizerComparisonTable() {
  return (
    <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "24px", padding: "32px", boxShadow: "0 14px 40px rgba(0, 107, 69, 0.06)" }}>
      <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 28px" }}>
        <span className="eyebrow">Cuadro Comparativo de Tecnologías</span>
        <h3 style={{ fontSize: "1.45rem", color: "var(--green-950)", margin: "4px 0 8px" }}>
          ¿Qué debe compararse antes de elegir una fuente nutricional?
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
          Una comparación responsable no declara un ganador universal: organiza la información que debe verificarse para cada alternativa.
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#fafcf9", borderBottom: "2px solid var(--line)" }}>
              <th style={{ padding: "14px 16px", color: "var(--green-950)" }}>Parámetro Fisiológico</th>
              <th style={{ padding: "14px 16px", color: "var(--green-800)", background: "#eef7eb", fontWeight: 800 }}>🌿 Wondergreen Nutrients</th>
              <th style={{ padding: "14px 16px", color: "#a84b00" }}>🧪 Químico Convencional</th>
              <th style={{ padding: "14px 16px", color: "var(--muted)" }}>🍂 Compost Crudo Artesanal</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, idx) => (
              <tr key={row.parameter} style={{ borderBottom: "1px solid var(--line)", background: idx % 2 === 0 ? "#ffffff" : "#fafcf9" }}>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--green-950)" }}>{row.parameter}</td>
                <td style={{ padding: "14px 16px", color: "var(--green-950)", background: "#f4fbf1", fontWeight: 600 }}>{row.wondergreen}</td>
                <td style={{ padding: "14px 16px", color: "#8a3e00" }}>{row.chemical}</td>
                <td style={{ padding: "14px 16px", color: "var(--muted)" }}>{row.rawCompost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
