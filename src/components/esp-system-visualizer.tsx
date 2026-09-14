"use client";

import React, { useState } from "react";

const links = [
  { num: "01", title: "Diagnóstico & PGIRS", desc: "Línea base técnica, aforos y matriz de metas municipales de aprovechamiento.", deliverable: "Documento técnico PGIRS / PMIRS" },
  { num: "02", title: "Microrrutas Motocarguero", desc: "Recolección selectiva de alta densidad con captura de pesaje en tiempo real.", deliverable: "Protocolos de separación y pesaje" },
  { num: "03", title: "Recepción & Triaje", desc: "Descarga, separación de impropios y preparación de materia orgánica pura.", deliverable: "Control de rechazo < 4%" },
  { num: "04", title: "Plantas Modulares", desc: "Alternativas de digestión anaerobia y compostaje configuradas según biomasa, escala y operación.", deliverable: "Ingeniería según alcance" },
  { num: "05", title: "Operación & POE", desc: "Procedimientos Operativos Estandarizados, control de lixiviados y olores.", deliverable: "Manuales y control de calidad" },
  { num: "06", title: "GREENATICS OPS", desc: "Trazabilidad digital por lote, balance de masa y certificación de desvío SUI.", deliverable: "Reportabilidad auditable" },
  { num: "07", title: "Valorización Wondergreen", desc: "Formulación de fertilizantes organominerales y bioles para el campo.", deliverable: "Retorno de producto a agricultores" },
  { num: "08", title: "Impacto Territorial", desc: "Extensión de vida útil del relleno sanitario y mitigación de huella de carbono.", deliverable: "Certificado de t CO2e evitadas" },
];

export function EspSystemVisualizer() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const current = links[selectedIdx];

  return (
    <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "20px", padding: "32px", boxShadow: "0 12px 36px rgba(0, 0, 0, 0.05)" }}>
      <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 28px" }}>
        <span className="eyebrow">Esquema Integral para Municipios y ESP</span>
        <h3 style={{ fontSize: "1.5rem", color: "var(--green-950)", margin: "6px 0 8px" }}>Los 8 Eslabones de la Cadena de Aprovechamiento</h3>
        <p style={{ fontSize: "0.92rem", color: "var(--muted)" }}>
          Un sistema continuo que conecta el camión, la planta, el suelo y la reportabilidad ante entidades de control.
        </p>
      </div>

      {/* Grid of 8 Eslabones Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "24px" }}>
        {links.map((link, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={link.num}
              onClick={() => setSelectedIdx(idx)}
              style={{
                padding: "14px",
                borderRadius: "12px",
                border: isSelected ? "2px solid var(--green-700)" : "1px solid var(--line)",
                background: isSelected ? "#f0f8ec" : "#fafcf9",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                transform: isSelected ? "translateY(-2px)" : "none",
                boxShadow: isSelected ? "0 8px 20px rgba(0, 107, 69, 0.12)" : "none",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isSelected ? "var(--green-700)" : "var(--muted)" }}>{link.num}</span>
              <strong style={{ display: "block", fontSize: "0.88rem", color: "var(--green-950)", marginTop: "2px" }}>{link.title}</strong>
            </button>
          );
        })}
      </div>

      {/* Active Detail Panel */}
      <div style={{ background: "#0a2920", color: "#ffffff", borderRadius: "16px", padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#98cf4f", fontWeight: 800 }}>Eslabón {current.num}</span>
          <h4 style={{ fontSize: "1.4rem", margin: "4px 0 10px", color: "#ffffff" }}>{current.title}</h4>
          <p style={{ fontSize: "0.92rem", color: "#cbdcd3", margin: 0, lineHeight: 1.5 }}>{current.desc}</p>
        </div>
        <div style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "12px", padding: "18px" }}>
          <span style={{ fontSize: "0.76rem", textTransform: "uppercase", color: "#d8ffbe", fontWeight: 700 }}>Entregable típico:</span>
          <strong style={{ display: "block", fontSize: "1.05rem", color: "#ffffff", marginTop: "4px" }}>{current.deliverable}</strong>
          <small style={{ display: "block", fontSize: "0.78rem", color: "#a8c7b8", marginTop: "6px" }}>
            Soporte contractual, técnico y operativo con Greenatics.
          </small>
        </div>
      </div>
    </div>
  );
}
