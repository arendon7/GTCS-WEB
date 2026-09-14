"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function BeneficioCafePage() {
  const [cargasCafe, setCargasCafe] = useState<number>(180); // Cargas de 125 kg CPS al año

  // Calculations
  const kgCps = cargasCafe * 125;
  const kgCafeCereza = Math.round(kgCps * 5.2); // Factor de conversión cereza a CPS
  const tonsPulpaFresca = Math.round((kgCafeCereza * 0.42) / 1000); // 42% pulpa
  const litersMucilago = Math.round(kgCafeCereza * 0.15); // 15% mucílago

  const bagsAbonoWondergreen = Math.round((tonsPulpaFresca * 1000 * 0.35) / 40); // 35% rendimiento en bultos de 40kg
  const litersBiolFoliar = Math.round(litersMucilago * 0.60);
  const commercialValueCop = (bagsAbonoWondergreen * 147400) + (litersBiolFoliar * 15000);

  const waCafeMsg = encodeURIComponent(
    `Hola Greenatics, calculé la Valorización de Subproductos de Café para mi Finca:\n\n` +
    `☕ *Producción Anual:* ${cargasCafe} Cargas de Café Pergamino Seco (CPS)\n` +
    `🍂 *Pulpa Generada:* ${tonsPulpaFresca} Toneladas / año\n` +
    `💧 *Mucílago Captado:* ${litersMucilago.toLocaleString()} Litros / año\n\n` +
    `🌿 *Biofertilizante Producido:*\n` +
    `• ${bagsAbonoWondergreen} Bultos (40kg) de Abono Organomineral\n` +
    `• ${litersBiolFoliar.toLocaleString()} Litros de Biol Foliar Fermentado\n` +
    `💰 *Valor Comercial Generado:* COP $${(commercialValueCop / 1000000).toFixed(1)} Millones\n\n` +
    `¿Podemos coordinar la instalación de una biofábrica cafetera modular en mi finca?`
  );
  const contactHref = `/contacto/?interes=agroindustria&perfil=agro&diagnostico=${encodeURIComponent("Valorización de subproductos de café")}&prioridad=${encodeURIComponent(`${cargasCafe} cargas CPS/año · ${tonsPulpaFresca} t de pulpa · ${litersMucilago.toLocaleString()} L de mucílago · ${bagsAbonoWondergreen} bultos y ${litersBiolFoliar.toLocaleString()} L potenciales`)}`;

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <div className="container" style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Economía Circular Cafetera & Biofábricas</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Calculadora de Valorización de Pulpa & Mucílago de Café
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            Evalúa cómo los subproductos del beneficio húmedo del café pueden tratarse y convertirse en insumos o productos útiles dentro de una ruta controlada de valorización.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: "32px", alignItems: "flex-start" }}>
          <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1.5px solid var(--line)", boxShadow: "0 12px 36px rgba(0, 107, 69, 0.05)" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--green-950)", margin: "0 0 20px" }}>
              1. Producción de Café de la Finca
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
                <span>Cargas Anuales de Café Pergamino (CPS):</span>
                <span style={{ color: "var(--green-800)" }}>{cargasCafe} Cargas (125 kg)</span>
              </label>
              <input
                type="range"
                min="20"
                max="800"
                step="10"
                value={cargasCafe}
                onChange={(e) => setCargasCafe(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
              />
            </div>

            <div style={{ background: "#fafcf9", padding: "16px", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <strong style={{ fontSize: "0.86rem", color: "var(--green-950)", display: "block", marginBottom: "4px" }}>
                Subproductos Estimados:
              </strong>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                <li><strong>{tonsPulpaFresca} Toneladas</strong> de Pulpa de Café rica en potasio y carbono.</li>
                <li><strong>{litersMucilago.toLocaleString()} Litros</strong> de Mucílago con azúcares fermentables.</li>
                <li>Cero contaminación por lixiviados en quebradas y nacimientos.</li>
              </ul>
            </div>
          </div>

          <div style={{ background: "#0a2920", color: "#ffffff", padding: "36px", borderRadius: "24px", border: "1.5px solid rgba(255, 255, 255, 0.15)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#98cf4f", fontWeight: 800 }}>
              Producción de Fertilizante en Biofábrica
            </span>
            <h3 style={{ fontSize: "1.6rem", color: "#ffffff", margin: "6px 0 16px" }}>
              Fertilizante Generado
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <small style={{ fontSize: "0.74rem", color: "#a8c7b8", display: "block" }}>Abono Sólido</small>
                <strong style={{ fontSize: "1.4rem", color: "#98cf4f" }}>{bagsAbonoWondergreen} <span style={{ fontSize: "0.8rem" }}>Bultos (40kg)</span></strong>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <small style={{ fontSize: "0.74rem", color: "#a8c7b8", display: "block" }}>Biol Foliar</small>
                <strong style={{ fontSize: "1.4rem", color: "#ffffff" }}>{litersBiolFoliar.toLocaleString()} <span style={{ fontSize: "0.8rem" }}>Litros</span></strong>
              </div>
            </div>

            <div style={{ background: "#f0f8ec", color: "var(--green-950)", padding: "20px", borderRadius: "16px", marginBottom: "24px" }}>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--green-800)", fontWeight: 800, display: "block" }}>
                Valor Económico del Fertilizante Autoproducido:
              </span>
              <strong style={{ display: "block", fontSize: "1.7rem", color: "var(--green-950)", margin: "4px 0 6px" }}>
                COP ${(commercialValueCop / 1000000).toFixed(1)} Millones
              </strong>
              <small style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Ahorro directo en la compra de bultos químicos para la fertilización del lote cafetero.
              </small>
            </div>

            <Link className="button button--light" href={contactHref} style={{ width: "100%", justifyContent: "center", marginBottom: "10px", color: "var(--green-950)" }}>Llevar escenario a Contacto →</Link>
            <a
              href={`https://wa.me/573003078822?text=${waCafeMsg}`}
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
              <span>Cotizar Biofábrica Cafetera en WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
