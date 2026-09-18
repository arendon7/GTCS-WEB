"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";

export default function AnalisisAguaPage() {
  const [ph, setPh] = useState<number>(7.6);
  const [ec, setEc] = useState<number>(1.2); // dS/m
  const [na, setNa] = useState<number>(3.5); // meq/L
  const [ca, setCa] = useState<number>(2.5); // meq/L
  const [mg, setMg] = useState<number>(1.8); // meq/L

  // Calculations
  const sar = Number((na / Math.sqrt(((ca + mg) / 2) || 1)).toFixed(2));
  const isHighSalinity = ec > 1.5;
  const isHighSar = sar > 4.0;
  const isAlkaline = ph > 7.4;

  let waterQuality = "Buena";
  if (isHighSalinity || isHighSar || isAlkaline) {
    waterQuality = isHighSalinity && isHighSar ? "Riesgo Severo de Salinidad y Sodio" : "Precaución / Requiere Acondicionamiento";
  }

  const waAguaMsg = encodeURIComponent(
    `Hola Greenatics, interpreté la Calidad de Agua de Riego en su web:\n\n` +
    `💧 *Parámetros:* pH ${ph} | CE: ${ec} dS/m | RAS (SAR): ${sar}\n` +
    `⚠️ *Diagnóstico:* ${waterQuality}\n` +
    `📋 *Siguiente paso:* validar el reporte completo, el cultivo y la calidad del agua antes de definir acondicionamiento o fertirriego.\n\n` +
    `¿Me pueden brindar asesoría para el manejo de agua y fertirriego en mi cultivo?`
  );
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent("Calidad de agua de riego")}&prioridad=${encodeURIComponent(`pH ${ph} · CE ${ec} dS/m · RAS ${sar} · ${waterQuality}`)}`;

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", paddingBlock: "60px 80px" }}>
      <WondergreenToolTrail name="Análisis de agua" path="/wondergreen/analisis-agua/" />
      <div className="container" style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Fertirriego & Calidad de Agua</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Intérprete de Calidad de Agua de Riego & Riesgo Salino (RAS)
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            El agua alcalina o con alto contenido de sodio precipita los fertilizantes en los goteros y daña la estructura del suelo. Evalúa la salinidad y la Relación de Adsorción de Sodio (RAS).
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: "32px", alignItems: "flex-start" }}>
          <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1.5px solid var(--line)", boxShadow: "0 12px 36px rgba(0, 107, 69, 0.05)" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--green-950)", margin: "0 0 20px" }}>
              1. Datos del Reporte de Agua
            </h3>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
                <span>pH del Agua:</span>
                <span style={{ color: isAlkaline ? "#c45100" : "var(--green-800)" }}>{ph} {isAlkaline ? "(Alcalina)" : "(Óptima)"}</span>
              </label>
              <input
                type="range"
                min="5.0"
                max="8.5"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
                <span>Conductividad Eléctrica (CE dS/m):</span>
                <span style={{ color: isHighSalinity ? "#c45100" : "var(--green-800)" }}>{ec} dS/m</span>
              </label>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={ec}
                onChange={(e) => setEc(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
                <span>Sodio (Na+ meq/L):</span>
                <span style={{ color: "var(--green-800)" }}>{na} meq/L</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={na}
                onChange={(e) => setNa(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
              />
            </div>

            <div style={{ background: "#fafcf9", padding: "16px", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <strong style={{ fontSize: "0.86rem", color: "var(--green-950)", display: "block", marginBottom: "4px" }}>
                Riesgo de Obturación:
              </strong>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                Con pH &gt; 7.4, los fosfatos y el hierro se vuelven insolubles formando precipitados blancos que tapan los goteros de riego.
              </p>
            </div>
          </div>

          <div style={{ background: "#0a2920", color: "#ffffff", padding: "36px", borderRadius: "24px", border: "1.5px solid rgba(255, 255, 255, 0.15)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#98cf4f", fontWeight: 800 }}>
              Diagnóstico de Fertirriego
            </span>
            <h3 style={{ fontSize: "1.6rem", color: "#ffffff", margin: "6px 0 16px" }}>
              Relación de Adsorción de Sodio (RAS)
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <small style={{ fontSize: "0.74rem", color: "#a8c7b8", display: "block" }}>Índice RAS (SAR)</small>
                <strong style={{ fontSize: "1.4rem", color: isHighSar ? "#ff8787" : "#98cf4f" }}>{sar}</strong>
                <span style={{ fontSize: "0.68rem", color: "#cbdcd3", display: "block" }}>Ideal: &lt; 3.0</span>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <small style={{ fontSize: "0.74rem", color: "#a8c7b8", display: "block" }}>Riesgo Salino</small>
                <strong style={{ fontSize: "1.4rem", color: isHighSalinity ? "#ff8787" : "#ffffff" }}>{ec < 0.8 ? "Bajo" : ec < 1.5 ? "Medio" : "Alto"}</strong>
              </div>
            </div>

            <div style={{ background: "#f0f8ec", color: "var(--green-950)", padding: "20px", borderRadius: "16px", marginBottom: "24px" }}>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--green-800)", fontWeight: 800, display: "block" }}>
                Protocolo de Acondicionamiento Recomendado:
              </span>
              <p style={{ margin: "4px 0 0", fontSize: "0.84rem", color: "var(--green-950)", fontWeight: 600, lineHeight: 1.5 }}>
                {isAlkaline
                  ? "Incorporar biol fermentado y ácidos húmicos Wondergreen para amortiguar el pH a 6.2 y evitar precipitados de fósforo."
                  : "Los valores ingresados no muestran una alerta preliminar; confirma compatibilidad y calidad con la ficha vigente antes de mezclar."}
              </p>
            </div>

            <Link className="button button--light" href={contactHref} style={{ width: "100%", justifyContent: "center", marginBottom: "10px", color: "var(--green-950)" }}>Llevar diagnóstico a Contacto →</Link>
            <a
              href={`https://wa.me/573003078822?text=${waAguaMsg}`}
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
              <span>Consultar Fertirriego en WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
