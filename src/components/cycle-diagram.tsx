"use client";

import React, { useState } from "react";
import Link from "next/link";

interface PhaseDetail {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  description: string;
  metrics: string[];
  techLink: string;
  techLinkLabel: string;
  badge: string;
}

const PHASES: PhaseDetail[] = [
  {
    id: "residuo",
    step: "01",
    title: "Residuo",
    subtitle: "Separación en la fuente y microrrutas",
    description: "Captura de biomasa limpia mediante rutas selectivas con motocarguero, acuerdos con generadores comerciales, plazas de mercado y grandes industrias.",
    metrics: ["Motocargueros dedicados", "Protocolos de pureza > 92%", "Georreferenciación de rutas"],
    techLink: "/servicios/",
    techLinkLabel: "Ver servicios de recolección",
    badge: "Entrada de Biomasa",
  },
  {
    id: "bioproceso",
    step: "02",
    title: "Bioproceso",
    subtitle: "Ingeniería + Biotecnología (GIEM - UdeA)",
    description: "Transformación en plantas modulares que combinan digestión anaerobia multietapa (separando acidogénesis y metanogénesis) y pilas de compostaje aireadas.",
    metrics: ["Digestión anaerobia multietapa", "Monitoreo termófilo (55°C-65°C)", "Control de olores y lixiviados"],
    techLink: "/tecnologia/",
    techLinkLabel: "Conocer la tecnología",
    badge: "Transformación Controlada",
  },
  {
    id: "recurso",
    step: "03",
    title: "Recurso",
    subtitle: "Acondicionadores, bioles y energía",
    description: "El residuo deja de ser pasivo ambiental y se convierte en fracciones estabilizadas de alta calidad agronómica, bioles líquidos bioactivos y biogás.",
    metrics: ["Compost estabilizado", "Biol líquido rico en microorganismos", "Biogás / energía térmica"],
    techLink: "/wondergreen/",
    techLinkLabel: "Ver línea de productos",
    badge: "Valorización de Salida",
  },
  {
    id: "suelo",
    step: "04",
    title: "Suelo & Cultivo",
    subtitle: "Wondergreen Nutrients en campo",
    description: "Formulaciones organominerales adaptadas a etapas fisiológicas (2GROW, 2BALANCE, 2BLOOM, 2FRUIT) para regenerar microbiología y nutrir cultivos de alto valor.",
    metrics: ["Aporte de materia orgánica", "Fórmulas N-P-K reconciliadas", "Mayor retención hídrica"],
    techLink: "/wondergreen/cultivos/",
    techLinkLabel: "Explorar por cultivo",
    badge: "Regeneración Productiva",
  },
  {
    id: "datos",
    step: "05",
    title: "Datos & OPS",
    subtitle: "Trazabilidad digital y evidencia",
    description: "GREENATICS OPS registra el pesaje, las curvas de proceso, los inventarios de producto y la trazabilidad de impacto bajo un esquema estricto de validación.",
    metrics: ["Trazabilidad por lote", "Balance de masas diario", "Cifras públicas gobernadas"],
    techLink: "/impacto/",
    techLinkLabel: "Ver modelo de impacto",
    badge: "Gobernanza Digital",
  },
];

export function CycleDiagram() {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const activePhase = PHASES[activePhaseIndex];

  return (
    <div className="cycle-interactive-container">
      <div className="cycle-diagram-visual" aria-label="Ciclo interactivo de bioprocesos Greenatics">
        <div className="cycle-wheel">
          <div className="cycle-svg-wrap">
            <svg viewBox="0 0 400 400" className="cycle-svg" aria-hidden="true">
              <circle cx="200" cy="200" r="140" className="cycle-track" />
              <circle
                cx="200"
                cy="200"
                r="140"
                className="cycle-indicator"
                style={{
                  strokeDasharray: "880",
                  strokeDashoffset: `${880 - ((activePhaseIndex + 1) / 5) * 880}`,
                }}
              />
            </svg>
          </div>

          <div className="cycle-center-brand">
            <img src="/brand/greenatics-symbol.svg" alt="Greenatics" width="48" height="48" />
            <small>Ciclo Circular</small>
          </div>

          {PHASES.map((phase, idx) => {
            const isSelected = activePhaseIndex === idx;
            return (
              <button
                key={phase.id}
                type="button"
                className={`cycle-node-btn node-${idx + 1} ${isSelected ? "is-active" : ""}`}
                onClick={() => setActivePhaseIndex(idx)}
                aria-pressed={isSelected}
              >
                <span className="node-num">{phase.step}</span>
                <strong className="node-label">{phase.title}</strong>
              </button>
            );
          })}
        </div>
      </div>

      <div className="cycle-detail-panel">
        <div className="cycle-panel-header">
          <span className="eyebrow eyebrow--badge">{activePhase.badge}</span>
          <span className="cycle-step-counter">Etapa {activePhase.step} de 05</span>
        </div>

        <h3>{activePhase.title}: {activePhase.subtitle}</h3>
        <p className="cycle-panel-description">{activePhase.description}</p>

        <div className="cycle-panel-metrics">
          <strong>Puntos clave de control:</strong>
          <ul>
            {activePhase.metrics.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>

        <div className="cycle-panel-actions">
          <Link href={activePhase.techLink} className="button button--dark">
            {activePhase.techLinkLabel} →
          </Link>
          <div className="cycle-step-nav">
            <button
              type="button"
              className="cycle-nav-arrow"
              onClick={() => setActivePhaseIndex((prev) => (prev > 0 ? prev - 1 : PHASES.length - 1))}
              aria-label="Etapa anterior"
            >
              ←
            </button>
            <button
              type="button"
              className="cycle-nav-arrow"
              onClick={() => setActivePhaseIndex((prev) => (prev < PHASES.length - 1 ? prev + 1 : 0))}
              aria-label="Siguiente etapa"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
