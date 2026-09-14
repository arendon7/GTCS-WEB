"use client";

import { useId, useState } from "react";
import Link from "next/link";

type ProfileType = "municipio" | "empresa" | "agro";

interface ProfileConfig {
  id: ProfileType;
  label: string;
  sublabel: string;
  defaultTons: number;
  minTons: number;
  maxTons: number;
  step: number;
  wasteDescription: string;
  landfillCostPerTon: number; // in COP (average landfill tariff per ton)
  compostYieldFactor: number; // approx 35% yield
  co2FactorPerTon: number; // ~0.85 t CO2e avoided per ton diverted from landfill
  productValuePerTon: number; // estimated value of stabilized organic nutrient/compost in COP (~$500,000 / ton)
}

const PROFILES: Record<ProfileType, ProfileConfig> = {
  municipio: {
    id: "municipio",
    label: "Municipio / ESP",
    sublabel: "Residuos sólidos orgánicos municipales (FORSU)",
    defaultTons: 80,
    minTons: 5,
    maxTons: 1000,
    step: 5,
    wasteDescription: "Fracción orgánica domiciliaria y plazas de mercado",
    landfillCostPerTon: 85000, // $85,000 COP/ton promedio relleno + flete
    compostYieldFactor: 0.35,
    co2FactorPerTon: 850, // kg CO2e
    productValuePerTon: 450000, // COP por ton de producto valorizado
  },
  empresa: {
    id: "empresa",
    label: "Empresa / Gran Generador",
    sublabel: "Biomasa industrial, casinos, agroindustria",
    defaultTons: 25,
    minTons: 2,
    maxTons: 300,
    step: 1,
    wasteDescription: "Corrientes orgánicas de transformación, alimentos y comedores",
    landfillCostPerTon: 110000, // $110,000 COP/ton disposición especial/comercial
    compostYieldFactor: 0.38,
    co2FactorPerTon: 920, // kg CO2e
    productValuePerTon: 520000,
  },
  agro: {
    id: "agro",
    label: "Finca / Agroproductor",
    sublabel: "Residuos de cosecha, beneficio y estiércoles",
    defaultTons: 40,
    minTons: 5,
    maxTons: 500,
    step: 5,
    wasteDescription: "Pulpa, rastrojo, bagazo, hojarasca y subproductos pecuarios",
    landfillCostPerTon: 40000, // costo logístico/manejo interno
    compostYieldFactor: 0.40,
    co2FactorPerTon: 780, // kg CO2e
    productValuePerTon: 480000,
  },
};

function formatCurrency(cop: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(cop);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 1,
  }).format(num);
}

export function ImpactCalculator() {
  const [profile, setProfile] = useState<ProfileType>("municipio");
  const [tonsPerMonth, setTonsPerMonth] = useState<number>(PROFILES.municipio.defaultTons);
  const sliderId = useId();

  const currentConfig = PROFILES[profile];

  const handleProfileChange = (newProfile: ProfileType) => {
    setProfile(newProfile);
    setTonsPerMonth(PROFILES[newProfile].defaultTons);
  };

  // Calculations per year
  const tonsPerYear = tonsPerMonth * 12;
  const compostProducedTonsYear = tonsPerYear * currentConfig.compostYieldFactor;
  const co2AvoidedKgYear = tonsPerYear * currentConfig.co2FactorPerTon;
  const co2AvoidedTonsYear = co2AvoidedKgYear / 1000;
  const landfillSavingsYear = tonsPerYear * currentConfig.landfillCostPerTon;
  const economicValueCreatedYear = compostProducedTonsYear * currentConfig.productValuePerTon;
  const totalEconomicImpactYear = landfillSavingsYear + economicValueCreatedYear;
  const contactHref = `/contacto/?interes=impacto&perfil=${encodeURIComponent(profile)}&diagnostico=${encodeURIComponent("Escenario de transformación y valorización")}&prioridad=${encodeURIComponent(`${currentConfig.label} · ${tonsPerMonth} ton/mes · escenario anual de ${formatNumber(tonsPerYear)} toneladas`)}`;

  return (
    <div className="calculator-widget">
      <div className="calculator-header">
        <span className="eyebrow eyebrow--light">Simulador de Aprovechamiento</span>
        <h3>Calcula el potencial de valor y mitigación en tu territorio o empresa</h3>
        <p>
          Configura un volumen mensual para explorar producto potencial, costo de disposición de referencia
          e impacto climático teórico. Los resultados son orientativos.
        </p>
      </div>

      <div className="calculator-profile-selector" role="tablist" aria-label="Perfil de generador">
        {(Object.keys(PROFILES) as ProfileType[]).map((key) => {
          const cfg = PROFILES[key];
          const isSelected = profile === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`calc-profile-btn ${isSelected ? "is-active" : ""}`}
              onClick={() => handleProfileChange(key)}
            >
              <strong>{cfg.label}</strong>
              <small>{cfg.sublabel}</small>
            </button>
          );
        })}
      </div>

      <div className="calculator-body">
        <div className="calculator-controls">
          <div className="calc-slider-group">
            <div className="calc-slider-header">
              <label htmlFor={sliderId}>Volumen mensual de residuos orgánicos:</label>
              <div className="calc-live-value">
                <strong>{tonsPerMonth}</strong>
                <span>toneladas/mes</span>
              </div>
            </div>
            <input
              id={sliderId}
              type="range"
              min={currentConfig.minTons}
              max={currentConfig.maxTons}
              step={currentConfig.step}
              value={tonsPerMonth}
              onChange={(e) => setTonsPerMonth(Number(e.target.value))}
              className="calc-range-input"
            />
            <div className="calc-slider-limits">
              <span>{currentConfig.minTons} ton/mes</span>
              <span>{currentConfig.wasteDescription}</span>
              <span>{currentConfig.maxTons} ton/mes</span>
            </div>
          </div>

          <div className="calc-notes">
            <p>
              <em>Escenario a 12 meses con factores predeterminados por perfil. Requiere caracterización, ingeniería y metodología documentada antes de usarse en una decisión.</em>
            </p>
          </div>
        </div>

        <div className="calculator-results-grid">
          <div className="calc-result-card calc-result-card--highlight">
            <span className="calc-card-kicker">Biomasa recuperada / año</span>
            <div className="calc-stat">
              <strong>{formatNumber(compostProducedTonsYear)}</strong>
              <span>toneladas</span>
            </div>
            <p>de acondicionador de suelo / fertilizante estabilizado listo para reintegrar al campo.</p>
          </div>

          <div className="calc-result-card">
            <span className="calc-card-kicker">Impacto climático teórico</span>
            <div className="calc-stat">
              <strong>{formatNumber(co2AvoidedTonsYear)}</strong>
              <span>t CO₂e</span>
            </div>
            <p>estimación de escenario; no constituye reducción certificada ni inventario de emisiones.</p>
          </div>

          <div className="calc-result-card">
            <span className="calc-card-kicker">Costo de disposición de referencia</span>
            <div className="calc-stat">
              <strong>{formatCurrency(landfillSavingsYear)}</strong>
            </div>
            <p>costo bruto potencialmente sustituible antes de inversión y costos de aprovechamiento.</p>
          </div>

          <div className="calc-result-card calc-result-card--value">
            <span className="calc-card-kicker">Valor total proyectado</span>
            <div className="calc-stat">
              <strong>{formatCurrency(totalEconomicImpactYear)}</strong>
              <span>/ año</span>
            </div>
            <p>sumando ahorro operativo más valorización del producto orgánico generado.</p>
          </div>
        </div>
      </div>

      <div className="calculator-footer">
        <div className="calc-footer-info">
          <span>¿Quieres estructurar este proyecto para tu municipio o empresa?</span>
        </div>
        <div className="button-row" style={{ marginTop: 0 }}>
          <Link className="button button--primary" href={contactHref}>
            Estructurar este proyecto →
          </Link>
          <Link className="button button--ghost" href="/diagnostico/">
            Hacer diagnóstico guiado
          </Link>
        </div>
      </div>
    </div>
  );
}
