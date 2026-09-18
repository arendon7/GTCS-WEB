"use client";

import { useState } from "react";
import Link from "next/link";

export default function BalanceCnPage() {
  const [wetKg, setWetKg] = useState(600);
  const [structureKg, setStructureKg] = useState(200);
  const [wetMaterial, setWetMaterial] = useState("Residuos de alimentos");
  const [structureMaterial, setStructureMaterial] = useState("Poda triturada");
  const total = wetKg + structureKg;
  const wetShare = Math.round((wetKg / total) * 100);
  const structureShare = 100 - wetShare;
  const message = encodeURIComponent(`Hola Greenatics. Quiero preparar un lote de bioproceso con ${wetKg} kg de ${wetMaterial} y ${structureKg} kg de ${structureMaterial}; masa inicial ${total} kg. Necesito validar caracterización, humedad, densidad, porosidad y seguimiento antes de definir ajustes.`);
  const contactHref = `/contacto/?interes=agroindustria&perfil=empresa&diagnostico=${encodeURIComponent("Preparación de lote y balance C/N")}&prioridad=${encodeURIComponent(`${wetKg} kg de ${wetMaterial} · ${structureKg} kg de ${structureMaterial} · lote inicial ${total} kg · ${wetShare}% húmedo / ${structureShare}% estructurante`)}`;

  return (
    <div style={{ background: "#f7faf5", padding: "60px 0 80px", color: "var(--green-950)" }}>
      <div className="container" style={{ maxWidth: 1080 }}>
        <header style={{ maxWidth: 810, margin: "0 auto 38px", textAlign: "center" }}>
          <span className="eyebrow">Preparación de bioprocesos</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)", margin: "10px 0 14px" }}>Dimensiona el lote antes de estimar su relación C/N</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.65, fontSize: "1.04rem" }}>
            Organiza masas y materiales para planear recepción, mezcla y seguimiento. Una relación C/N fiable requiere composición en base seca o una caracterización consistente; no puede inferirse solo llamando “verde” o “café” a un residuo.
          </p>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28, alignItems: "start" }}>
          <section style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 24, padding: "clamp(24px, 4vw, 34px)" }}>
            <h2 style={{ fontSize: "1.25rem", marginTop: 0 }}>Escenario de mezcla</h2>
            <label style={{ display: "block", fontWeight: 750, fontSize: ".86rem", marginBottom: 18 }}>Material húmedo principal
              <select value={wetMaterial} onChange={(e) => setWetMaterial(e.target.value)} style={{ width: "100%", marginTop: 7, padding: 12, borderRadius: 10, border: "1px solid var(--line)", background: "#fafcf9" }}>
                {["Residuos de alimentos", "Pulpa de café", "Césped y poda fresca", "Estiércol", "Otro material"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label style={{ display: "block", fontWeight: 750, fontSize: ".86rem", marginBottom: 20 }}>
              <span style={{ display: "flex", justifyContent: "space-between" }}><span>Masa registrada</span><strong>{wetKg} kg</strong></span>
              <input type="range" min="50" max="5000" step="50" value={wetKg} onChange={(e) => setWetKg(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--green-700)" }} />
            </label>
            <label style={{ display: "block", fontWeight: 750, fontSize: ".86rem", marginBottom: 18 }}>Material estructurante
              <select value={structureMaterial} onChange={(e) => setStructureMaterial(e.target.value)} style={{ width: "100%", marginTop: 7, padding: 12, borderRadius: 10, border: "1px solid var(--line)", background: "#fafcf9" }}>
                {["Poda triturada", "Viruta o aserrín", "Cascarilla", "Material recirculado", "Otro material"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label style={{ display: "block", fontWeight: 750, fontSize: ".86rem" }}>
              <span style={{ display: "flex", justifyContent: "space-between" }}><span>Masa registrada</span><strong>{structureKg} kg</strong></span>
              <input type="range" min="25" max="3000" step="25" value={structureKg} onChange={(e) => setStructureKg(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--green-700)" }} />
            </label>
          </section>
          <section style={{ background: "#0a2920", color: "#fff", borderRadius: 24, padding: "clamp(26px, 4vw, 38px)" }}>
            <span style={{ color: "#98cf4f", fontWeight: 800, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".1em" }}>Ficha operativa</span>
            <h2 style={{ color: "#fff", fontSize: "1.7rem", margin: "7px 0 18px" }}>Lote inicial de {total.toLocaleString("es-CO")} kg</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 18 }}>
              <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 13, padding: 16 }}><small style={{ color: "#a8c7b8", display: "block" }}>Material húmedo</small><strong style={{ color: "#fff", fontSize: "1.45rem" }}>{wetShare}%</strong></div>
              <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 13, padding: 16 }}><small style={{ color: "#a8c7b8", display: "block" }}>Estructurante</small><strong style={{ color: "#fff", fontSize: "1.45rem" }}>{structureShare}%</strong></div>
            </div>
            <h3 style={{ color: "#fff", fontSize: "1rem" }}>Qué se debe medir o verificar</h3>
            <ul style={{ paddingLeft: 20, color: "#d4e3dc", lineHeight: 1.62, fontSize: ".86rem" }}>
              <li>Humedad y composición de cada corriente, preferiblemente en base seca.</li>
              <li>Densidad aparente, tamaño de partícula, porosidad y capacidad de aireación.</li>
              <li>Temperatura por puntos, olor, humedad, oxígeno cuando aplique y asentamiento.</li>
              <li>Homogeneidad, contaminantes, lixiviados, lluvias y frecuencia real de volteo.</li>
            </ul>
            <div style={{ background: "#f0f8ec", color: "var(--green-950)", borderRadius: 15, padding: 18, margin: "18px 0 22px" }}>
              <strong>Sin promesa térmica automática</strong>
              <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.5 }}>La temperatura y el control de olores son resultados de la mezcla, la geometría, el clima y la operación. Deben verificarse con bitácora.</p>
            </div>
            <Link className="button button--primary" href={contactHref} style={{ width: "100%", justifyContent: "center" }}>Llevar lote a Contacto →</Link>
            <a className="button button--outline-light" href={`https://wa.me/573003078822?text=${message}`} target="_blank" rel="noopener noreferrer" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>Validar por WhatsApp directo</a>
          </section>
        </div>
      </div>
    </div>
  );
}
