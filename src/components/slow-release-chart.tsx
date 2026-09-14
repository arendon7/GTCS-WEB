"use client";

import React, { useState } from "react";

export function SlowReleaseChart() {
  const [activeDay, setActiveDay] = useState<number>(30);

  // Curves formulas
  // Conventional: fast surge at day 5-15, drops drastically due to leaching (lavado)
  const getConvValue = (d: number) => {
    if (d <= 10) return Math.min(95, 20 + d * 7.5);
    return Math.max(8, 95 * Math.exp(-0.065 * (d - 10)));
  };

  // Wondergreen Organomineral: sustained biological delivery with organic occlusion
  const getWonderValue = (d: number) => {
    if (d <= 15) return 30 + d * 3.5;
    if (d <= 50) return 82 - (d - 15) * 0.25;
    return Math.max(35, 73 - (d - 50) * 0.9);
  };

  const convVal = Math.round(getConvValue(activeDay));
  const wonderVal = Math.round(getWonderValue(activeDay));

  return (
    <div className="slow-release-card" style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 36px rgba(0, 107, 69, 0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <span className="eyebrow">Ciencia de Asimilación</span>
          <h3 style={{ margin: "4px 0 6px", fontSize: "1.35rem", color: "var(--green-950)" }}>Curva de Disponibilidad Nutricional en Suelo</h3>
          <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--muted)" }}>
            Comparativa de entrega de N-P-K y micronutrientes a lo largo de 90 días de ciclo vegetativo.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "var(--green-800)" }}>
            <span style={{ width: "12px", height: "4px", background: "var(--green-700)", borderRadius: "2px" }}></span>
            Wondergreen (Oclusión)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#c25e00" }}>
            <span style={{ width: "12px", height: "4px", background: "#e67e22", borderRadius: "2px" }}></span>
            Fertilizante Químico Convencional
          </div>
        </div>
      </div>

      {/* SVG Living Chart */}
      <div style={{ position: "relative", width: "100%", height: "240px", background: "#fafcf9", borderRadius: "14px", border: "1px solid #edf4ea", padding: "10px" }}>
        <svg viewBox="0 0 500 200" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          {/* Grid lines */}
          <line x1="40" y1="20" x2="480" y2="20" stroke="#e5eee1" strokeDasharray="4 4" />
          <line x1="40" y1="60" x2="480" y2="60" stroke="#e5eee1" strokeDasharray="4 4" />
          <line x1="40" y1="100" x2="480" y2="100" stroke="#e5eee1" strokeDasharray="4 4" />
          <line x1="40" y1="140" x2="480" y2="140" stroke="#e5eee1" strokeDasharray="4 4" />
          <line x1="40" y1="180" x2="480" y2="180" stroke="#c2d9c0" strokeWidth="1.5" />

          {/* Conventional Area & Path */}
          <path
            d="M 40 180 Q 90 20 130 50 T 220 140 T 360 170 T 480 175 L 480 180 L 40 180 Z"
            fill="rgba(230, 126, 34, 0.08)"
          />
          <path
            d="M 40 180 Q 90 20 130 50 T 220 140 T 360 170 T 480 175"
            fill="none"
            stroke="#e67e22"
            strokeWidth="3"
            strokeDasharray="4 2"
          />

          {/* Wondergreen Area & Path */}
          <path
            d="M 40 160 Q 110 55 190 50 T 340 65 T 480 120 L 480 180 L 40 180 Z"
            fill="rgba(0, 139, 76, 0.12)"
          />
          <path
            d="M 40 160 Q 110 55 190 50 T 340 65 T 480 120"
            fill="none"
            stroke="var(--green-700)"
            strokeWidth="3.5"
          />

          {/* Active Day Indicator Line */}
          {(() => {
            const xPos = 40 + (activeDay / 90) * 440;
            return (
              <g>
                <line x1={xPos} y1="15" x2={xPos} y2="180" stroke="#0a2920" strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx={xPos} cy={180 - (wonderVal * 1.6)} r="6" fill="var(--green-700)" stroke="#ffffff" strokeWidth="2" />
                <circle cx={xPos} cy={180 - (convVal * 1.6)} r="5" fill="#e67e22" stroke="#ffffff" strokeWidth="2" />
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Interactive Slider */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", fontWeight: 700 }}>
          <span>Día 0 (Aplicación)</span>
          <span style={{ color: "var(--green-800)", background: "#eaf5e6", padding: "4px 12px", borderRadius: "999px" }}>
            Momento seleccionado: <strong>Día {activeDay} de 90</strong>
          </span>
          <span>Día 90 (Cosecha / Retorno)</span>
        </div>
        <input
          type="range"
          min="1"
          max="90"
          value={activeDay}
          onChange={(e) => setActiveDay(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
        />
      </div>

      {/* Dynamic Data Callout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "18px" }}>
        <div style={{ background: "#f0f8ec", border: "1px solid #d4ebd0", borderRadius: "12px", padding: "14px" }}>
          <strong style={{ color: "var(--green-800)", display: "block", fontSize: "0.84rem" }}>Wondergreen Nutrients:</strong>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--green-950)" }}>{wonderVal}%</span>
          <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>
            Disponibilidad activa en rizósfera sin salinización ni pérdida por lixiviación.
          </p>
        </div>
        <div style={{ background: "#fff7ef", border: "1px solid #f9dfca", borderRadius: "12px", padding: "14px" }}>
          <strong style={{ color: "#c25e00", display: "block", fontSize: "0.84rem" }}>Fertilizante Convencional:</strong>
          <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#a84b00" }}>{convVal}%</span>
          <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>
            {activeDay > 25 ? "Pérdida por lavado (lixiviación) y fijación en suelo." : "Pico inicial con alto riesgo de quemado radicular."}
          </p>
        </div>
      </div>
    </div>
  );
}
