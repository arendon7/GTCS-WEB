"use client";

import React, { useState } from "react";

const campaignCards = [
  { num: "01", title: "Solución Integral", img: "/campaign/01_solucion_integral.jpg", desc: "De la recolección selectiva en la fuente al suelo y al dato ambiental." },
  { num: "02", title: "Consultoría & PGIRS", img: "/campaign/02_consultoria_pgirs.jpg", desc: "Formulación técnica de aprovechamiento y metas reales de desvío." },
  { num: "03", title: "Rutas con Motocarguero", img: "/campaign/03_rutas_motocarguero.jpg", desc: "Logística de alta densidad con menor costo por tonelada y pesaje en campo." },
  { num: "04", title: "Infraestructura Modular", img: "/campaign/04_infraestructura_modular.jpg", desc: "Plantas de bioprocesos configuradas según suministro, proceso, implantación y capacidad operativa." },
  { num: "05", title: "Operación & Acompañamiento", img: "/campaign/05_operacion_acompanamiento.jpg", desc: "Protocolos POE, control de lixiviados, olores y bioseguridad operativa." },
  { num: "06", title: "Dashboard de Indicadores", img: "/campaign/06_dashboard_indicadores.jpg", desc: "Trazabilidad por lote y reportabilidad para entes de control (SUI/CRA)." },
  { num: "07", title: "Salidas de Valor Wondergreen", img: "/campaign/07_wondergreen_salidas_valor.jpg", desc: "Retorno de fertilizantes organominerales y bioles a los agricultores." },
  { num: "08", title: "Ruta de Implementación", img: "/campaign/08_ruta_implementacion.jpg", desc: "Cronograma paso a paso desde el diagnóstico inicial hasta la operación." },
];

export function EspCampaignGallery() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const current = campaignCards[activeIdx];

  return (
    <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "24px", padding: "32px", boxShadow: "0 14px 40px rgba(0, 107, 69, 0.06)" }}>
      <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 28px" }}>
        <span className="eyebrow">Campaña Oficial para Municipios & ESP</span>
        <h3 style={{ fontSize: "1.45rem", color: "var(--green-950)", margin: "4px 0 8px" }}>Los 8 Eslabones Gráficos de la Solución</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
          Haz clic en cada ficha para visualizar el arte técnico oficial de la campaña.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px", alignItems: "center" }}>
        {/* Infographic Preview */}
        <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--line)", background: "#0a2920", minHeight: "380px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img
            src={current.img}
            alt={current.title}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Eslabones List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto", paddingRight: "6px" }}>
          {campaignCards.map((c, idx) => {
            const isSelected = activeIdx === idx;
            return (
              <button
                key={c.num}
                onClick={() => setActiveIdx(idx)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: isSelected ? "2px solid var(--green-700)" : "1px solid var(--line)",
                  background: isSelected ? "#f0f8ec" : "#ffffff",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  transition: "all 0.15s ease"
                }}
              >
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: isSelected ? "var(--green-700)" : "var(--muted)" }}>
                  {c.num}
                </span>
                <div>
                  <strong style={{ display: "block", fontSize: "0.88rem", color: "var(--green-950)" }}>{c.title}</strong>
                  <small style={{ color: "var(--muted)", fontSize: "0.76rem" }}>{c.desc}</small>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
