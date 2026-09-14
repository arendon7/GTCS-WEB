"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalibracionAspersoresPage() {
  const [tank, setTank] = useState(20);
  const [measuredArea, setMeasuredArea] = useState(600);
  const [targetArea, setTargetArea] = useState(10000);
  const tanks = targetArea / Math.max(measuredArea, 1);
  const carrier = tanks * tank;
  const litersPerHa = carrier / (targetArea / 10000);
  const message = encodeURIComponent(`Hola Greenatics. Hice una prueba de calibración con agua: tanque de ${tank} L, área cubierta por tanque ${measuredArea} m² y área objetivo ${targetArea} m². Resultado operativo aproximado: ${tanks.toFixed(1)} cargas y ${carrier.toFixed(0)} L de agua. Quiero revisar cobertura, boquilla, presión y la etiqueta del producto antes de aplicar.`);
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent("Calibración de aspersión")}&prioridad=${encodeURIComponent(`Tanque ${tank} L · cobertura medida ${measuredArea} m² · área objetivo ${targetArea} m² · ${tanks.toFixed(1)} cargas · ${carrier.toFixed(0)} L observados`)}`;

  return (
    <main style={{ background: "#f7faf5", padding: "60px 0 80px", color: "var(--green-950)" }}>
      <div className="container" style={{ maxWidth: 1080 }}>
        <header style={{ maxWidth: 800, margin: "0 auto 38px", textAlign: "center" }}>
          <span className="eyebrow">Calibración medida en campo</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)", margin: "10px 0 14px" }}>Convierte una prueba con agua en un plan operativo</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.65, fontSize: "1.04rem" }}>
            Registra cuánto terreno cubre realmente un tanque con el equipo, boquilla, presión, velocidad y operador definidos. El resultado estima agua y cargas; nunca calcula la dosis del producto.
          </p>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28, alignItems: "start" }}>
          <section style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 24, padding: "clamp(24px, 4vw, 34px)" }}>
            <h2 style={{ fontSize: "1.25rem", marginTop: 0 }}>Prueba de calibración</h2>
            {[
              { label: "Agua utilizada por tanque", value: tank, set: setTank, min: 5, max: 500, step: 5, unit: " L" },
              { label: "Área medida cubierta", value: measuredArea, set: setMeasuredArea, min: 50, max: 5000, step: 50, unit: " m²" },
              { label: "Área total a intervenir", value: targetArea, set: setTargetArea, min: 500, max: 100000, step: 500, unit: " m²" },
            ].map((item) => (
              <label key={item.label} style={{ display: "block", marginBottom: 22, fontWeight: 750, fontSize: ".86rem" }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>{item.label}</span><strong>{item.value.toLocaleString("es-CO")}{item.unit}</strong></span>
                <input type="range" min={item.min} max={item.max} step={item.step} value={item.value} onChange={(e) => item.set(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--green-700)" }} />
              </label>
            ))}
            <p style={{ background: "#fff8e8", color: "#714c13", padding: 14, borderRadius: 12, margin: 0, fontSize: ".8rem", lineHeight: 1.5 }}>Haz la prueba solo con agua y registra boquilla, presión, velocidad, clima y uniformidad de cobertura.</p>
          </section>
          <section style={{ background: "#0a2920", color: "#fff", borderRadius: 24, padding: "clamp(26px, 4vw, 38px)" }}>
            <span style={{ color: "#98cf4f", fontWeight: 800, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".1em" }}>Resultado operativo</span>
            <h2 style={{ color: "#fff", fontSize: "1.7rem", margin: "7px 0 18px" }}>Agua y cargas estimadas</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 13, padding: 16 }}><small style={{ color: "#a8c7b8", display: "block" }}>Cargas equivalentes</small><strong style={{ fontSize: "1.5rem", color: "#fff" }}>{tanks.toFixed(1)}</strong></div>
              <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 13, padding: 16 }}><small style={{ color: "#a8c7b8", display: "block" }}>Agua total</small><strong style={{ fontSize: "1.5rem", color: "#fff" }}>{carrier.toFixed(0)} L</strong></div>
            </div>
            <div style={{ background: "#f0f8ec", color: "var(--green-950)", borderRadius: 15, padding: 18, margin: "18px 0" }}>
              <small style={{ display: "block", color: "var(--green-800)", fontWeight: 800, textTransform: "uppercase" }}>Volumen observado</small>
              <strong style={{ fontSize: "1.35rem" }}>{litersPerHa.toFixed(0)} L/ha equivalentes</strong>
              <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.5 }}>Es el resultado de tu prueba, no un volumen objetivo recomendado.</p>
            </div>
            <p style={{ color: "#c9d9d1", fontSize: ".85rem", lineHeight: 1.55 }}>La cantidad de producto se define únicamente con la etiqueta vigente, el uso autorizado, el área tratada y la orientación técnica aplicable.</p>
            <Link className="button button--primary" href={contactHref} style={{ width: "100%", justifyContent: "center" }}>Llevar calibración a Contacto →</Link>
            <a className="button button--outline-light" href={`https://wa.me/573003078822?text=${message}`} target="_blank" rel="noopener noreferrer" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>Validar por WhatsApp directo</a>
          </section>
        </div>
      </div>
    </main>
  );
}
