"use client";

import { useState } from "react";
import Link from "next/link";

export default function CostoUnidadNutrientePage() {
  const [alternativePrice, setAlternativePrice] = useState(185000);
  const [alternativeWeight, setAlternativeWeight] = useState(50);
  const [wondergreenPrice, setWondergreenPrice] = useState(147400);

  const alternativeCostPerKg = Math.round(alternativePrice / alternativeWeight);
  const wondergreenCostPerKg = Math.round(wondergreenPrice / 40);
  const difference = wondergreenCostPerKg - alternativeCostPerKg;

  const waText = encodeURIComponent(
    `Hola Wondergreen, preparé una comparación comercial inicial.\n` +
    `Alternativa: COP $${alternativePrice.toLocaleString()} por ${alternativeWeight} kg.\n` +
    `Wondergreen: COP $${wondergreenPrice.toLocaleString()} por 40 kg.\n` +
    "Quiero comparar composición, dosis recomendada, costo por hectárea y disponibilidad con información técnica vigente.",
  );
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent("Comparación de costo por unidad de nutriente")}&prioridad=${encodeURIComponent(`Alternativa ${alternativeWeight} kg · Wondergreen 40 kg · diferencia de compra ${Math.abs(difference)} COP/kg`)}`;

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <div className="container" style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Comparación comercial responsable</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>El precio por kilogramo es apenas el comienzo de la comparación.</h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>Compara presentación y precio de compra. Después valida composición, dosis, frecuencia, logística y respuesta esperada para estimar el costo real del programa.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px", alignItems: "stretch" }}>
          <section style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1.5px solid var(--line)" }}>
            <h2 style={{ fontSize: "1.3rem", margin: "0 0 22px" }}>Datos de compra</h2>
            <label style={{ display: "block", marginBottom: "18px", fontSize: "0.86rem", fontWeight: 700 }}>Precio de la alternativa: COP ${alternativePrice.toLocaleString()}<input type="range" min="80000" max="300000" step="5000" value={alternativePrice} onChange={(event) => setAlternativePrice(Number(event.target.value))} style={{ display: "block", width: "100%", marginTop: "8px", accentColor: "var(--green-700)" }} /></label>
            <label style={{ display: "block", marginBottom: "18px", fontSize: "0.86rem", fontWeight: 700 }}>Peso de la alternativa: {alternativeWeight} kg<input type="range" min="20" max="50" step="5" value={alternativeWeight} onChange={(event) => setAlternativeWeight(Number(event.target.value))} style={{ display: "block", width: "100%", marginTop: "8px", accentColor: "var(--green-700)" }} /></label>
            <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700 }}>Precio Wondergreen 40 kg: COP ${wondergreenPrice.toLocaleString()}<input type="range" min="90000" max="200000" step="1000" value={wondergreenPrice} onChange={(event) => setWondergreenPrice(Number(event.target.value))} style={{ display: "block", width: "100%", marginTop: "8px", accentColor: "var(--green-700)" }} /></label>
          </section>

          <section style={{ background: "#0a2920", color: "#ffffff", padding: "32px", borderRadius: "24px" }}>
            <span style={{ color: "#98cf4f", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Comparación normalizada</span>
            <h2 style={{ color: "#ffffff", fontSize: "1.45rem", margin: "6px 0 20px" }}>Precio de producto por kilogramo</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,.08)" }}><small style={{ display: "block", color: "#b8cfc3" }}>Alternativa</small><strong style={{ fontSize: "1.35rem" }}>COP ${alternativeCostPerKg.toLocaleString()}</strong></div>
              <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,.08)" }}><small style={{ display: "block", color: "#b8cfc3" }}>Wondergreen</small><strong style={{ fontSize: "1.35rem", color: "#98cf4f" }}>COP ${wondergreenCostPerKg.toLocaleString()}</strong></div>
            </div>
            <p style={{ color: "#c7d9d0", fontSize: "0.86rem", lineHeight: 1.55 }}>Diferencia de compra: COP {Math.abs(difference).toLocaleString()} por kg. Este valor no demuestra disponibilidad nutricional, rendimiento ni ahorro por hectárea.</p>
            <div style={{ padding: "16px", background: "rgba(255,255,255,.06)", borderRadius: "14px", marginBottom: "18px" }}><strong>Para comparar el programa completo</strong><p style={{ margin: "6px 0 0", color: "#b8cfc3", fontSize: "0.82rem" }}>Solicita ficha vigente, recomendación, número de aplicaciones, costo logístico e indicadores de seguimiento.</p></div>
            <Link href={contactHref} className="button button--primary">Llevar comparación a Contacto →</Link>
            <a href={`https://wa.me/573003078822?text=${waText}`} target="_blank" rel="noopener noreferrer" className="button button--outline-light" style={{ marginTop: "10px" }}>Validar por WhatsApp directo</a>
          </section>
        </div>
      </div>
    </div>
  );
}
