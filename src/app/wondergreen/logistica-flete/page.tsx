"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";

export default function LogisticaFletePage() {
  const [bags, setBags] = useState<number>(120); // Bultos de 40 kg
  const [destinationRegion, setDestinationRegion] = useState<string>("Antioquia");

  // Calculations
  const totalWeightKg = bags * 40;
  const totalWeightTons = Number((totalWeightKg / 1000).toFixed(2));
  const palletsCount = Math.ceil(bags / 25); // 25 bultos por estiba (1 ton/pallet)

  let suggestedVehicle = "Camión Turbo (4.5 Toneladas)";
  if (totalWeightTons > 16.0) {
    suggestedVehicle = "Tractomula (32 Toneladas)";
  } else if (totalWeightTons > 8.5) {
    suggestedVehicle = "Camión Dobletroque (16 Toneladas)";
  } else if (totalWeightTons > 4.5) {
    suggestedVehicle = "Camión Sencillo (8.5 Toneladas)";
  }

  const waFleteMsg = encodeURIComponent(
    `Hola Greenatics, coticé el Despacho Logístico de Wondergreen para *${destinationRegion}*:\n\n` +
    `📦 *Pedido:* ${bags} Bultos de 40 kg (${totalWeightTons} Toneladas)\n` +
    `🪵 *Palletización:* ${palletsCount} Estibas estándar\n` +
    `🚛 *Escenario de vehículo:* ${suggestedVehicle}\n\n` +
    `¿Me pueden cotizar el flete consolidado y tiempo de entrega a mi municipio?`
  );
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent("Despacho y logística Wondergreen")}&prioridad=${encodeURIComponent(`${bags} bultos · ${totalWeightTons} t · ${palletsCount} estibas · ${suggestedVehicle} · destino ${destinationRegion}`)}`;

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <WondergreenToolTrail name="Logística y flete" path="/wondergreen/logistica-flete/" />
      <div className="container" style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Despachos Nacionales & Palletización</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Calculadora Logística de Carga, Pallets & Flete
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            Calcula el peso total, número de estibas y un escenario de vehículo para preparar el despacho de fertilizantes Wondergreen a cualquier departamento de Colombia.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: "32px", alignItems: "flex-start" }}>
          <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1.5px solid var(--line)", boxShadow: "0 12px 36px rgba(0, 107, 69, 0.05)" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--green-950)", margin: "0 0 20px" }}>
              1. Configuración del Pedido
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
                <span>Cantidad de Bultos (40 kg):</span>
                <span style={{ color: "var(--green-800)" }}>{bags} Bultos</span>
              </label>
              <input
                type="range"
                min="10"
                max="800"
                step="10"
                value={bags}
                onChange={(e) => setBags(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "6px" }}>
                Departamento de Destino:
              </label>
              <select
                value={destinationRegion}
                onChange={(e) => setDestinationRegion(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.88rem", color: "var(--green-950)", background: "#fafcf9" }}
              >
                <option value="Antioquia">Antioquia</option>
                <option value="Caldas / Quindío / Risaralda">Eje Cafetero (Caldas, Quindío, Risaralda)</option>
                <option value="Cundinamarca / Boyacá">Cundinamarca / Boyacá</option>
                <option value="Huila / Tolima">Huila / Tolima</option>
                <option value="Santander / N. Santander">Santanderes</option>
                <option value="Valle del Cauca / Cauca">Valle del Cauca / Cauca</option>
                <option value="Meta / Casanare">Llanos Orientales</option>
                <option value="Costa Caribe">Costa Caribe</option>
              </select>
            </div>

            <div style={{ background: "#fafcf9", padding: "16px", borderRadius: "14px", border: "1px solid var(--line)" }}>
              <strong style={{ fontSize: "0.86rem", color: "var(--green-950)", display: "block", marginBottom: "4px" }}>
                Estándar de Embalaje:
              </strong>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                Bultos de polipropileno laminado de 40 kg con barrera antihumedad. Cada estiba estándar contiene 25 bultos (1.000 kg netos) termoencogidos con plástico stretch.
              </p>
            </div>
          </div>

          <div style={{ background: "#0a2920", color: "#ffffff", padding: "36px", borderRadius: "24px", border: "1.5px solid rgba(255, 255, 255, 0.15)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#98cf4f", fontWeight: 800 }}>
              Cálculo de Despacho
            </span>
            <h3 style={{ fontSize: "1.6rem", color: "#ffffff", margin: "6px 0 16px" }}>
              Logística & Transporte
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <small style={{ fontSize: "0.74rem", color: "#a8c7b8", display: "block" }}>Peso de Carga</small>
                <strong style={{ fontSize: "1.4rem", color: "#98cf4f" }}>{totalWeightTons} <span style={{ fontSize: "0.8rem" }}>Toneladas</span></strong>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                <small style={{ fontSize: "0.74rem", color: "#a8c7b8", display: "block" }}>Estibas (Pallets)</small>
                <strong style={{ fontSize: "1.4rem", color: "#ffffff" }}>{palletsCount} <span style={{ fontSize: "0.8rem" }}>Pallets</span></strong>
              </div>
            </div>

            <div style={{ background: "#f0f8ec", color: "var(--green-950)", padding: "20px", borderRadius: "16px", marginBottom: "24px" }}>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--green-800)", fontWeight: 800, display: "block" }}>
                Escenario de vehículo:
              </span>
              <strong style={{ display: "block", fontSize: "1.25rem", color: "var(--green-950)", margin: "4px 0 4px" }}>
                🚛 {suggestedVehicle}
              </strong>
              <small style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Despacho directo desde planta en Antioquia hacia {destinationRegion}.
              </small>
            </div>

            <Link className="button button--light" href={contactHref} style={{ width: "100%", justifyContent: "center", marginBottom: "10px", color: "var(--green-950)" }}>Llevar despacho a Contacto →</Link>
            <a
              href={`https://wa.me/573003078822?text=${waFleteMsg}`}
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
              <span>Cotizar Flete y Despacho en WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
