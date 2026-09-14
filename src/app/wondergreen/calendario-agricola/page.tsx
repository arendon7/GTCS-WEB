"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CropCalendarData {
  region: string;
  crop: string;
  months: {
    month: string;
    phase: string;
    action: string;
    product: string;
    intensity: "high" | "medium" | "low";
  }[];
}

const calendarData: Record<string, CropCalendarData> = {
  "cafe-antioquia": {
    region: "Antioquia / Eje Cafetero",
    crop: "Café (Coffea arabica)",
    months: [
      { month: "Ene", phase: "Pos-cosecha & Poda", action: "Aporte orgánico al suelo y reactivación", product: "Wondergreen 2BALANCE", intensity: "medium" },
      { month: "Feb", phase: "Brotación & Drenaje", action: "Estimulación de ramas productivas", product: "Wondergreen 2GROW", intensity: "medium" },
      { month: "Mar", phase: "Floración Principal", action: "Fósforo biodisponible para amarre", product: "Wondergreen 2BLOOM", intensity: "high" },
      { month: "Abr", phase: "Llenado de Cerillos", action: "Calcio y potasio de lenta asimilación", product: "Wondergreen 2BALANCE", intensity: "high" },
      { month: "May", phase: "Cosecha Mitaca", action: "Mantenimiento foliar y bioinsumos", product: "Biol Fermentado", intensity: "medium" },
      { month: "Jun", phase: "Llenado de Grano", action: "Potasio para peso de café cereza", product: "Wondergreen 2FRUIT", intensity: "high" },
      { month: "Jul", phase: "Llenado de Grano", action: "Sostenimiento de densidad de grano", product: "Wondergreen 2FRUIT", intensity: "high" },
      { month: "Ago", phase: "Pre-cosecha", action: "Bioinsumos para sanidad de fruto", product: "Biol Fermentado", intensity: "medium" },
      { month: "Sep", phase: "Cosecha Principal", action: "Recolección y control de broca", product: "Bioinsumos MIP", intensity: "high" },
      { month: "Oct", phase: "Cosecha Principal", action: "Pico de cosecha y tolva", product: "Recolección", intensity: "high" },
      { month: "Nov", phase: "Cierre de Cosecha", action: "Manejo de pulpa en biofábrica", product: "Wondergreen Suelo", intensity: "medium" },
      { month: "Dic", phase: "Descanso & Enmiendas", action: "Corrección de acidez y C.I.C.", product: "Wondergreen 2BALANCE", intensity: "low" }
    ]
  },
  "aguacate-antioquia": {
    region: "Antioquia (Oriente y Suroeste)",
    crop: "Aguacate Hass",
    months: [
      { month: "Ene", phase: "Floración Loca", action: "Fósforo y boro para amarre floral", product: "Wondergreen 2BLOOM", intensity: "high" },
      { month: "Feb", phase: "Cuajado de Fruto", action: "Calcio quelado contra caída de cerillos", product: "Wondergreen 2BALANCE", intensity: "high" },
      { month: "Mar", phase: "Crecimiento de Fruto", action: "Nutrición balanceada en drench", product: "Wondergreen 2BALANCE", intensity: "medium" },
      { month: "Abr", phase: "Floración Principal", action: "Amarre de flores y sanidad de raíces", product: "Wondergreen 2BLOOM + Trichoderma", intensity: "high" },
      { month: "May", phase: "Llenado de Calibres", action: "Potasio de lenta entrega (calibre 14-20)", product: "Wondergreen 2FRUIT", intensity: "high" },
      { month: "Jun", phase: "Llenado de Calibres", action: "Materia seca >23% para exportación", product: "Wondergreen 2FRUIT", intensity: "high" },
      { month: "Jul", phase: "Mantenimiento", action: "Bioles foliares y bioestimulación", product: "Biol Fermentado", intensity: "medium" },
      { month: "Ago", phase: "Pre-cosecha Exportación", action: "Aseguramiento de firmeza", product: "Wondergreen 2FRUIT", intensity: "medium" },
      { month: "Sep", phase: "Cosecha Principal", action: "Corte y selección para packing", product: "Recolección", intensity: "high" },
      { month: "Oct", phase: "Cosecha & Poda", action: "Poda de iluminación pos-corte", product: "Wondergreen 2GROW", intensity: "high" },
      { month: "Nov", phase: "Sanidad Radicular", action: "Inoculación de raíces vs Phytophthora", product: "Wondergreen 2BALANCE + Bioinsumos", intensity: "medium" },
      { month: "Dic", phase: "Inducción Floral", action: "Preparación de yemas para floración", product: "Wondergreen 2BLOOM", intensity: "high" }
    ]
  }
};

export default function CalendarioAgricolaPage() {
  const [selectedKey, setSelectedKey] = useState<string>("cafe-antioquia");
  const current = calendarData[selectedKey] || calendarData["cafe-antioquia"];

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <div className="container" style={{ maxWidth: "1140px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Fenología & Calendario de Nutrición</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Calendario Agronómico de Nutrición por Mes
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            Sincroniza tus aplicaciones de Wondergreen con las fases fenológicas de floración, cuajado, llenado de fruto y poscosecha en Colombia.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "36px" }}>
          <button
            onClick={() => setSelectedKey("cafe-antioquia")}
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              border: selectedKey === "cafe-antioquia" ? "2px solid var(--green-800)" : "1px solid var(--line)",
              background: selectedKey === "cafe-antioquia" ? "#eaf5e6" : "#ffffff",
              color: selectedKey === "cafe-antioquia" ? "var(--green-950)" : "var(--muted)",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            ☕ Café (Antioquia y Eje Cafetero)
          </button>
          <button
            onClick={() => setSelectedKey("aguacate-antioquia")}
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              border: selectedKey === "aguacate-antioquia" ? "2px solid var(--green-800)" : "1px solid var(--line)",
              background: selectedKey === "aguacate-antioquia" ? "#eaf5e6" : "#ffffff",
              color: selectedKey === "aguacate-antioquia" ? "var(--green-950)" : "var(--muted)",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            🥑 Aguacate Hass (Oriente y Suroeste)
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
          {current.months.map((m) => (
            <div
              key={m.month}
              style={{
                background: "#ffffff",
                border: "1.5px solid var(--line)",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 14px rgba(0, 107, 69, 0.03)"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "1.2rem", color: "var(--green-950)" }}>{m.month}</strong>
                  <span style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: m.intensity === "high" ? "#fff3e8" : "#eef7eb",
                    color: m.intensity === "high" ? "#c45100" : "var(--green-800)"
                  }}>
                    {m.phase}
                  </span>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.45 }}>
                  {m.action}
                </p>
              </div>

              <div style={{ paddingTop: "10px", borderTop: "1px solid var(--line)" }}>
                <small style={{ fontSize: "0.7rem", color: "var(--muted)", display: "block" }}>Producto Asignado:</small>
                <strong style={{ fontSize: "0.86rem", color: "var(--green-800)" }}>{m.product}</strong>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#07261d", color: "#ffffff", padding: "32px 36px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#98cf4f", fontWeight: 800 }}>Plan a la Medida</span>
            <h3 style={{ fontSize: "1.5rem", color: "#ffffff", margin: "4px 0" }}>¿Quieres calibrar el calendario para la altura y clima de tu finca?</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#cbdcd3" }}>El equipo puede ayudarte a construir un cronograma ajustado al lote, la etapa, la etiqueta vigente y el seguimiento.</p>
          </div>
          <Link href="/wondergreen/calculadora/" className="button button--primary" style={{ padding: "12px 24px", fontSize: "0.92rem" }}>
            Abrir Calculadora Agronómica →
          </Link>
        </div>
      </div>
    </div>
  );
}
