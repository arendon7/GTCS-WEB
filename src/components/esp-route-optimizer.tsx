"use client";

import React, { useState } from "react";
import Link from "next/link";

export function EspRouteOptimizer() {
  const [households, setHouseholds] = useState<number>(4500);
  const [collectionFreq, setCollectionFreq] = useState<number>(2); // 2 veces por semana

  // Calculations
  const kgPerCapitaDay = 0.55; // 550g organicos / persona / dia
  const peoplePerHousehold = 3.4;
  const weeklyTons = ((households * peoplePerHousehold * kgPerCapitaDay * 7) / 1000);
  const monthlyTons = weeklyTons * 4.33;
  const weeklyCapacityPerVehicle = 18 * (collectionFreq / 2); // 18 t/semana como referencia a 2 días de operación
  const motocarguerosNeeded = Math.max(2, Math.ceil(weeklyTons / weeklyCapacityPerVehicle));
  const compactorTruckSavingsMonth = Math.round(motocarguerosNeeded * 4200000); // Ahorro en ACPM y mantenimiento
  const contactHref = `/contacto/?interes=microrrutas&perfil=municipio&diagnostico=${encodeURIComponent("Escenario de microrruta con motocarguero")}&prioridad=${encodeURIComponent(`${households.toLocaleString("es-CO")} hogares · ${collectionFreq} días/semana · ${Math.round(monthlyTons)} t/mes estimadas · ${motocarguerosNeeded} vehículos`)}`;

  return (
    <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "24px", padding: "32px", boxShadow: "0 14px 40px rgba(0, 107, 69, 0.06)" }}>
      <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 28px" }}>
        <span className="eyebrow">Simulador Logístico para Municipios & ESP</span>
        <h3 style={{ fontSize: "1.5rem", color: "var(--green-950)", margin: "4px 0 8px" }}>
          Dimensionamiento de Microrrutas con Motocarguero
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
          Explora una primera capacidad de flota y un escenario de ahorro frente a camiones compactadores. La microrruta final se valida con distancias, tiempos, cargas y calidad del material.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "28px", alignItems: "center" }}>
        {/* Sliders */}
        <div style={{ background: "#fafcf9", padding: "22px", borderRadius: "18px", border: "1px solid #edf4ea" }}>
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "6px" }}>
            Viviendas Atendidas (Población Urbana): <strong>{households.toLocaleString()} hogares</strong>
          </label>
          <input
            type="range"
            min="1000"
            max="25000"
            step="500"
            value={households}
            onChange={(e) => setHouseholds(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer", marginBottom: "20px" }}
          />

          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "6px" }}>
            Frecuencia de Recolección Selectiva: <strong>{collectionFreq} días por semana</strong>
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={collectionFreq}
            onChange={(e) => setCollectionFreq(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--green-700)", cursor: "pointer" }}
          />
        </div>

        {/* Output Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div style={{ background: "#0a2920", color: "#ffffff", padding: "18px", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#98cf4f", fontWeight: 800 }}>Biomasa Mensual</span>
            <strong style={{ display: "block", fontSize: "1.6rem", margin: "4px 0" }}>{Math.round(monthlyTons)} <span style={{ fontSize: "0.9rem" }}>ton</span></strong>
            <small style={{ fontSize: "0.75rem", color: "#cbdcd3" }}>Orgánicos puros captados</small>
          </div>

          <div style={{ background: "#0a2920", color: "#ffffff", padding: "18px", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#98cf4f", fontWeight: 800 }}>Flota Requerida</span>
            <strong style={{ display: "block", fontSize: "1.6rem", margin: "4px 0" }}>{motocarguerosNeeded} <span style={{ fontSize: "0.85rem" }}>motocargueros</span></strong>
            <small style={{ fontSize: "0.75rem", color: "#cbdcd3" }}>Alta maniobrabilidad urbana</small>
          </div>

          <div style={{ background: "#f0f8ec", border: "1px solid #d4ebd0", padding: "18px", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--green-800)", fontWeight: 800 }}>Referencia de calidad</span>
            <strong style={{ display: "block", fontSize: "1.4rem", color: "var(--green-950)", margin: "4px 0" }}>96,4 %</strong>
            <small style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Caso Yarumal · período validado</small>
          </div>

          <div style={{ background: "#f0f8ec", border: "1px solid #d4ebd0", padding: "18px", borderRadius: "14px" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--green-800)", fontWeight: 800 }}>Ahorro operativo de referencia</span>
            <strong style={{ display: "block", fontSize: "1.35rem", color: "var(--green-950)", margin: "4px 0" }}>COP ${(compactorTruckSavingsMonth / 1000000).toFixed(1)}M</strong>
            <small style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Escenario calculado · validar costos reales</small>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--line)" }}>
        <Link className="button button--dark" href={contactHref}>Llevar escenario a Contacto →</Link>
        <span style={{ color: "var(--muted)", fontSize: "0.76rem" }}>La eficiencia se valida con una microrruta diseñada sobre datos de campo.</span>
      </div>
    </div>
  );
}
