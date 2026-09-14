"use client";

import React, { useState } from "react";
import Link from "next/link";

const terms = [
  { term: "Oclusión en Matriz Orgánica", cat: "Química", def: "Proceso biotecnológico donde los iones de N, P y K quedan atrapados físicamente y quelados químicamente dentro de cadenas de ácidos húmicos y fúlvicos, evitando su lixiviación y volatilización." },
  { term: "Capacidad de Intercambio Catiónico (C.I.C.)", cat: "Suelos", def: "Medida de la capacidad del suelo o de una enmienda orgánica para retener e intercambiar cationes nutritivos (Ca2+, Mg2+, K+, NH4+) con la raíz. En Wondergreen supera los 45 meq/100g." },
  { term: "Andisoles", cat: "Suelos", def: "Suelos de origen volcánico predominantes en las cordilleras andinas colombianas. Tienen alta acidez y el mineral alofana que fija químicamente el fósforo, haciéndolo insoluble para las plantas." },
  { term: "Fase termófila", cat: "Bioprocesos", def: "Etapa del compostaje en la que la actividad biológica eleva la temperatura. Su duración y rango se controlan según el proceso y el criterio de higienización aplicable." },
  { term: "Biol Fermentado", cat: "Bioinsumos", def: "Biofertilizante líquido obtenido mediante fermentación anaerobia de biomasa orgánica enriquecida con microorganismos nativos y minerales, de rápida absorción foliar o radicular." },
  { term: "Resolución CRA 720 de 2015", cat: "Regulatorio", def: "Marco tarifario para personas prestadoras del servicio público de aseo que define el costo de aprovechamiento (VBA) y los incentivos para desviar residuos del relleno sanitario." },
  { term: "PGIRS", cat: "Regulatorio", def: "Plan de Gestión Integral de Residuos Sólidos. Instrumento de planeación municipal obligatorio (Res. 0754/2014) para formular proyectos de aprovechamiento y reciclaje." },
  { term: "PMIRS", cat: "Regulatorio", def: "Plan de Manejo Integral de Residuos Sólidos para grandes generadores privados (centros comerciales, plantas de alimentos, hoteles) para certificar desvío y vertimiento cero." },
  { term: "SUI (Superintendencia de Servicios Públicos)", cat: "Regulatorio", def: "Sistema Único de Información donde las empresas prestadoras de aseo deben reportar mensualmente los pesajes y toneladas aprovechadas para validar la tarifa al usuario." },
  { term: "Lixiviación de Nutrientes", cat: "Agronomía", def: "Pérdida por lavado de sales minerales solubles (especialmente nitratos y potasio) arrastradas por el agua de lluvia hacia capas profundas del suelo o fuentes hídricas." },
  { term: "Resistencia Sistémica Adquirida (SAR)", cat: "Agronomía", def: "Mecanismo de defensa inmunológica en plantas inducido por metabolitos secundarios y microorganismos benéficos (como Trichoderma y Bacillus) frente a hongos y bacterias patógenas." }
];

export default function GlosarioPage() {
  const [filter, setFilter] = useState<string>("");

  const filtered = terms.filter(t =>
    filter.trim() === "" ||
    t.term.toLowerCase().includes(filter.toLowerCase()) ||
    t.def.toLowerCase().includes(filter.toLowerCase()) ||
    t.cat.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <div className="container" style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Terminología & Criterio Científico</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Glosario Técnico de Economía Circular & Agronomía
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.6 }}>
            Conceptos clave de química de suelos, ingeniería de bioprocesos y normatividad colombiana de aseo explicados con rigor.
          </p>
        </div>

        <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "16px", border: "1.5px solid var(--line)", marginBottom: "32px" }}>
          <input
            type="text"
            placeholder="Buscar término (ej: oclusión, andisol, CRA 720, biol)..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: "100%", border: "none", outline: "none", fontSize: "1rem", color: "var(--green-950)", fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((t) => (
            <article key={t.term} style={{ background: "#ffffff", border: "1px solid var(--line)", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 4px 14px rgba(0, 107, 69, 0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "1.2rem", color: "var(--green-950)", margin: 0 }}>{t.term}</h3>
                <span style={{ padding: "3px 8px", background: "#eaf5e6", color: "var(--green-800)", borderRadius: "6px", fontSize: "0.74rem", fontWeight: 800 }}>
                  {t.cat}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.6 }}>
                {t.def}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
