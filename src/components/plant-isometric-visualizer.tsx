"use client";

import React, { useState } from "react";

interface Station {
  id: number;
  title: string;
  short: string;
  role: string;
  tech: string;
  deliverable: string;
}

const stations: Station[] = [
  {
    id: 1,
    title: "Recepción & Triaje Mecánico",
    short: "Tolva & Separación",
    role: "Descarga directa de motocargueros y camiones compactadores. Retiro automatizado y manual de impropios (plásticos, metales).",
    tech: "Tolva de alimentación con pendiente de gravedad y mesa de triaje con banda de baja velocidad.",
    deliverable: "Pureza de materia orgánica > 96% lista para bioproceso."
  },
  {
    id: 2,
    title: "Digestión Anaerobia Multietapa",
    short: "Biodigestores GIEM-UdeA",
    role: "Fermentación anaerobia metanogénica en fase líquida para degradación acelerada y estabilización de patógenos.",
    tech: "Reactores de mezcla completa desarrollados y validados con el grupo GIEM de la Universidad de Antioquia.",
    deliverable: "Captura de bioles concentrados ricos en ácidos húmicos y fúlvicos."
  },
  {
    id: 3,
    title: "Compostaje Termófilo Aireado",
    short: "Pilas Aireadas (>55°C)",
    role: "Maduración aerobia de la fracción sólida con control riguroso de temperatura, humedad y relación C:N.",
    tech: "Aireación forzada positiva y volteos mecánicos programados para higienización total de semillas y patógenos.",
    deliverable: "Compost orgánico estabilizado con C.I.C. superior a 40 meq/100g."
  },
  {
    id: 4,
    title: "Tamizaje & Clasificación Granulométrica",
    short: "Zarandas Trommel",
    role: "Separación por tamaño de partícula para obtener matriz fina homogénea sin grumos ni impurezas.",
    tech: "Zaranda rotativa trommel con mallas de 4 mm y 8 mm intercambiables.",
    deliverable: "Matriz sólida de textura uniforme con humedad óptima < 20%."
  },
  {
    id: 5,
    title: "Línea de Oclusión & Empaque 40 kg",
    short: "Envasado Wondergreen",
    role: "Adición balanceada de minerales primarios y micronutrientes sobre la matriz orgánica y ensacado sellado.",
    tech: "Mezclador helicoidal de flujo continuo y ensacadora de tolva con pesaje digital.",
    deliverable: "Bultos comerciales Wondergreen Nutrients (2GROW, 2BALANCE, 2BLOOM, 2FRUIT)."
  }
];

export function PlantIsometricVisualizer() {
  const [activeStation, setActiveStation] = useState<number>(1);
  const current = stations.find(s => s.id === activeStation) || stations[0];

  return (
    <div style={{ background: "#0c221a", color: "#ffffff", borderRadius: "24px", padding: "32px", border: "1.5px solid rgba(255, 255, 255, 0.15)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)" }}>
      <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 28px" }}>
        <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#98cf4f", fontWeight: 800 }}>
          Ingeniería de Planta Modular
        </span>
        <h3 style={{ fontSize: "1.6rem", color: "#ffffff", margin: "6px 0 8px" }}>
          Arquitectura del Bioproceso Greenatics
        </h3>
        <p style={{ fontSize: "0.92rem", color: "#cbdcd3", margin: 0 }}>
          Tecnología modular y escalable diseñada para transformar desde 5 hasta 50 toneladas/día de residuos orgánicos en bioinsumos.
        </p>
      </div>

      {/* 5-Step Process Interactive Visual Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "28px" }}>
        {stations.map((st) => {
          const isSelected = activeStation === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStation(st.id)}
              style={{
                padding: "14px 10px",
                borderRadius: "14px",
                border: isSelected ? "2px solid #98cf4f" : "1px solid rgba(255, 255, 255, 0.12)",
                background: isSelected ? "rgba(152, 207, 79, 0.15)" : "rgba(255, 255, 255, 0.04)",
                color: "#ffffff",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s ease",
                transform: isSelected ? "translateY(-3px)" : "none",
                boxShadow: isSelected ? "0 8px 24px rgba(152, 207, 79, 0.2)" : "none"
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isSelected ? "#98cf4f" : "#a8c7b8", display: "block" }}>
                ETAPA 0{st.id}
              </span>
              <strong style={{ fontSize: "0.84rem", display: "block", marginTop: "4px", lineHeight: 1.25 }}>
                {st.short}
              </strong>
            </button>
          );
        })}
      </div>

      {/* Detailed Station Showcase Box */}
      <div style={{ background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "18px", padding: "28px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#98cf4f", color: "#0a2920", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
              {current.id}
            </span>
            <h4 style={{ fontSize: "1.35rem", margin: 0, color: "#ffffff" }}>{current.title}</h4>
          </div>
          <p style={{ color: "#cbdcd3", fontSize: "0.94rem", lineHeight: 1.6, marginBottom: "16px" }}>
            {current.role}
          </p>
          <div style={{ padding: "12px 16px", background: "rgba(0, 0, 0, 0.25)", borderRadius: "10px", fontSize: "0.82rem", color: "#b8d5c7" }}>
            <strong style={{ color: "#98cf4f" }}>Base Tecnológica:</strong> {current.tech}
          </div>
        </div>

        <div style={{ background: "rgba(0, 107, 69, 0.4)", border: "1px solid rgba(152, 207, 79, 0.4)", borderRadius: "14px", padding: "22px" }}>
          <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#d8ffbe", fontWeight: 700 }}>
            Resultado / Salida de la Etapa:
          </span>
          <strong style={{ display: "block", fontSize: "1.15rem", color: "#ffffff", margin: "6px 0 10px" }}>
            {current.deliverable}
          </strong>
          <small style={{ display: "block", fontSize: "0.78rem", color: "#a8c7b8" }}>
            Monitoreo en tiempo real registrado en la bitácora digital de GREENATICS OPS.
          </small>
        </div>
      </div>
    </div>
  );
}
