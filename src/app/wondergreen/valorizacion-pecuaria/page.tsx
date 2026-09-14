"use client";

import React, { useState } from "react";
import Link from "next/link";

interface LivestockType {
  name: string;
  manureKgPerDay: number;
  nPercent: number;
  pPercent: number;
  kPercent: number;
}

const livestockTypes: Record<string, LivestockType> = {
  "porcinos": { name: "Porcicultura (Cerdos de Ceba / Cría)", manureKgPerDay: 2.8, nPercent: 3.2, pPercent: 2.8, kPercent: 1.9 },
  "bovinos": { name: "Ganadería Bovina (Leche / Ceba)", manureKgPerDay: 18.0, nPercent: 2.1, pPercent: 1.2, kPercent: 2.3 },
  "avicola": { name: "Avicultura (Gallinas / Pollo de Engorde)", manureKgPerDay: 0.12, nPercent: 4.5, pPercent: 3.8, kPercent: 2.4 }
};

export default function ValorizacionPecuariaPage() {
  const [animalKey, setAnimalKey] = useState<string>("porcinos");
  const [animalCount, setAnimalCount] = useState<number>(1500);

  const lType = livestockTypes[animalKey] || livestockTypes["porcinos"];
  const dailyManureTons = Number(((animalCount * lType.manureKgPerDay) / 1000).toFixed(1));
  const annualManureTons = Math.round(dailyManureTons * 365);

  const annualBagsAbono40kg = Math.round((annualManureTons * 1000 * 0.38) / 40); // 38% conversion a abono organomineral
  const commercialAbonoValueCop = annualBagsAbono40kg * 147400; // Valor comercial en COP

  const waPecMsg = encodeURIComponent(
    `Hola Greenatics, coticé la Valorización de Residuos Pecuarios para mi Granja:\n\n` +
    `🐷 *Sector:* ${lType.name}\n` +
    `🔢 *Población:* ${animalCount.toLocaleString()} animales\n` +
    `💩 *Estiércol / Porquinaza Generada:* ${annualManureTons.toLocaleString()} Toneladas / año\n\n` +
    `🌿 *Abono Organomineral Obtenido:* ${annualBagsAbono40kg.toLocaleString()} Bultos de 40 kg\n` +
    `💰 *Valor Económico del Fertilizante:* COP $${(commercialAbonoValueCop / 1000000).toFixed(1)} Millones / año\n\n` +
    `¿Podemos solicitar una propuesta para instalar una biofábrica pecuaria modular en mi predio?`
  );
  const contactHref = `/contacto/?interes=agroindustria&perfil=empresa&diagnostico=${encodeURIComponent("Valorización de residuos pecuarios")}&prioridad=${encodeURIComponent(`${lType.name} · ${animalCount.toLocaleString()} animales · ${annualManureTons.toLocaleString()} t/año de estiércol · ${annualBagsAbono40kg.toLocaleString()} bultos potenciales`)}`;

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <div className="container" style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Economía Circular Pecuaria & Biofábricas</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Calculadora de Valorización de Estiércol, Porquinaza & Gallinaza
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            Convierte las excretas pecuarias en biofertilizantes higienizados de alta graduación N-P-K para tus propios pastos y cultivos, cumpliendo con la normatividad ambiental de vertimientos.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: "32px", alignItems: "flex-start" }}>
          <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1.5px solid var(--line)", boxShadow: "0 12px 36px rgba(0, 107, 69, 0.05)" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--green-950)", margin: "0 0 20px" }}>
              1. Censo de la Granja Pecuaria
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "6px" }}>
                Tipo de Producción:
              </label>
              <select
                value={animalKey}
                onChange={(e) => setAnimalKey(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.88rem", color: "var(--green-950)", background: "#fafcf9" }}
              >
                {Object.entries(livestockTypes).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
                <span>Número de Animales / Cabezas:</span>
                <span style={{ color: "var(--green-800)" }}>{animalCount.toLocaleString()} Animales</span>
              </label>
              <input
                type="range"
                min="50"
                max="50000"
                step="100"
                value={animalCount}
                onChange={(e) => setAnimalCount(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
              />
            </div>

            <div style={{ background: "#fafcf9", padding: "16px", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <strong style={{ fontSize: "0.86rem", color: "var(--green-950)", display: "block", marginBottom: "4px" }}>
                Pasteurización Termófila:
              </strong>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                El compostaje puede alcanzar una fase termófila y contribuir a la higienización cuando tiempo, temperatura, humedad y volteo cumplen el criterio técnico aplicable. El resultado debe verificarse con registros y control de calidad.
              </p>
            </div>
          </div>

          <div style={{ background: "#0a2920", color: "#ffffff", padding: "36px", borderRadius: "24px", border: "1.5px solid rgba(255, 255, 255, 0.15)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#98cf4f", fontWeight: 800 }}>
              Producción de Abono Organomineral
            </span>
            <h3 style={{ fontSize: "1.6rem", color: "#ffffff", margin: "6px 0 16px" }}>
              Fertilizante Generado
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <small style={{ fontSize: "0.74rem", color: "#a8c7b8", display: "block" }}>Biomasa Anual</small>
                <strong style={{ fontSize: "1.4rem", color: "#98cf4f" }}>{annualManureTons.toLocaleString()} <span style={{ fontSize: "0.8rem" }}>ton/año</span></strong>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <small style={{ fontSize: "0.74rem", color: "#a8c7b8", display: "block" }}>Bultos (40 kg)</small>
                <strong style={{ fontSize: "1.4rem", color: "#ffffff" }}>{annualBagsAbono40kg.toLocaleString()} <span style={{ fontSize: "0.8rem" }}>Bultos</span></strong>
              </div>
            </div>

            <div style={{ background: "#f0f8ec", color: "var(--green-950)", padding: "20px", borderRadius: "16px", marginBottom: "24px" }}>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--green-800)", fontWeight: 800, display: "block" }}>
                Valor Comercial del Fertilizante Producido:
              </span>
              <strong style={{ display: "block", fontSize: "1.7rem", color: "var(--green-950)", margin: "4px 0 6px" }}>
                COP ${(commercialAbonoValueCop / 1000000).toFixed(1)} Millones / año
              </strong>
              <small style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Ahorro directo en la compra de fertilizantes químicos para praderas y pasturas de corte.
              </small>
            </div>

            <Link className="button button--light" href={contactHref} style={{ width: "100%", justifyContent: "center", marginBottom: "10px", color: "var(--green-950)" }}>Llevar escenario a Contacto →</Link>
            <a
              href={`https://wa.me/573003078822?text=${waPecMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                width: "100%",
                padding: "16px 24px",
                background: "#25D366",
                color: "#073319",
                borderRadius: "14px",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 10px 24px rgba(37, 211, 102, 0.35)"
              }}
            >
              <span>💬</span>
              <span>Cotizar Biofábrica Pecuaria en WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
