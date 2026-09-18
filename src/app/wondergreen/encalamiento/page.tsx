"use client";

import { useState } from "react";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";

export default function EncalamientoPage() {
  const [ph, setPh] = useState(4.8);
  const [al, setAl] = useState(35);
  const [texture, setTexture] = useState("Franca");
  const [crop, setCrop] = useState("Café");
  const message = encodeURIComponent(`Hola Greenatics. Quiero evaluar una posible intervención de acidez para ${crop}. Datos preliminares: pH ${ph}, saturación de aluminio ${al}% y textura ${texture}. Necesito validar el requerimiento con el análisis completo y la calidad de la enmienda disponible.`);
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent("Evaluación de encalamiento")}&prioridad=${encodeURIComponent(`${crop} · pH ${ph} · saturación de aluminio ${al}% · textura ${texture}`)}`;

  return (
    <div style={{ background: "#f7faf5", padding: "60px 0 80px", color: "var(--green-950)" }}>
      <WondergreenToolTrail name="Evaluación de encalamiento" path="/wondergreen/encalamiento/" />
      <div className="container" style={{ maxWidth: 1080 }}>
        <header style={{ maxWidth: 790, margin: "0 auto 38px", textAlign: "center" }}>
          <span className="eyebrow">Acidez y enmiendas</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)", margin: "10px 0 14px" }}>Prepara una evaluación de encalamiento responsable</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.65, fontSize: "1.04rem" }}>
            El pH por sí solo no determina cuánto material aplicar. Esta ruta reúne el contexto mínimo para calcular una necesidad real y comparar enmiendas por su capacidad neutralizante, composición y comportamiento en el suelo.
          </p>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28, alignItems: "start" }}>
          <section style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 24, padding: "clamp(24px, 4vw, 34px)" }}>
            <h2 style={{ fontSize: "1.25rem", marginTop: 0 }}>Contexto preliminar</h2>
            <label style={{ display: "block", fontWeight: 750, fontSize: ".86rem", marginBottom: 18 }}>Cultivo
              <select value={crop} onChange={(e) => setCrop(e.target.value)} style={{ width: "100%", marginTop: 7, padding: 12, borderRadius: 10, border: "1px solid var(--line)", background: "#fafcf9" }}>
                {["Café", "Aguacate Hass", "Cacao", "Pastos", "Cítricos", "Hortalizas", "Otro"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label style={{ display: "block", fontWeight: 750, fontSize: ".86rem", marginBottom: 20 }}>
              <span style={{ display: "flex", justifyContent: "space-between" }}><span>pH reportado</span><strong>{ph}</strong></span>
              <input type="range" min="4" max="7" step=".1" value={ph} onChange={(e) => setPh(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--green-700)" }} />
            </label>
            <label style={{ display: "block", fontWeight: 750, fontSize: ".86rem", marginBottom: 20 }}>
              <span style={{ display: "flex", justifyContent: "space-between" }}><span>Saturación de aluminio</span><strong>{al}%</strong></span>
              <input type="range" min="0" max="80" step="1" value={al} onChange={(e) => setAl(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--green-700)" }} />
            </label>
            <span style={{ display: "block", fontWeight: 750, fontSize: ".86rem", marginBottom: 8 }}>Textura reportada</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {["Arenosa", "Franca", "Arcillosa"].map((item) => <button type="button" key={item} onClick={() => setTexture(item)} style={{ padding: 10, borderRadius: 9, border: texture === item ? "2px solid var(--green-700)" : "1px solid var(--line)", background: texture === item ? "#eaf5e6" : "#fff", fontWeight: 700 }}>{item}</button>)}
            </div>
          </section>
          <section style={{ background: "#0a2920", color: "#fff", borderRadius: 24, padding: "clamp(26px, 4vw, 38px)" }}>
            <span style={{ color: "#98cf4f", fontWeight: 800, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".1em" }}>Antes de calcular</span>
            <h2 style={{ color: "#fff", fontSize: "1.7rem", margin: "7px 0 18px" }}>Seis datos cambian la decisión</h2>
            <ul style={{ paddingLeft: 20, color: "#d4e3dc", lineHeight: 1.65, fontSize: ".9rem" }}>
              <li>Acidez intercambiable y bases intercambiables del análisis completo.</li>
              <li>C.I.C., materia orgánica, textura y profundidad efectiva a corregir.</li>
              <li>Tolerancia del cultivo y objetivo agronómico de la intervención.</li>
              <li>Poder relativo de neutralización total y granulometría del material.</li>
              <li>Contenido de calcio y magnesio, humedad y condiciones de incorporación.</li>
              <li>Aplicaciones previas, pendiente, lluvias y ventana operativa disponible.</li>
            </ul>
            <div style={{ background: "#f0f8ec", color: "var(--green-950)", borderRadius: 15, padding: 18, margin: "20px 0 22px" }}>
              <strong>No se publica una cantidad por hectárea</strong>
              <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: ".84rem", lineHeight: 1.5 }}>La necesidad se calcula con datos del suelo y luego se ajusta a la calidad comprobada de la enmienda, no al nombre comercial.</p>
            </div>
            <Link className="button button--primary" href={contactHref} style={{ width: "100%", justifyContent: "center" }}>Llevar caso a Contacto →</Link>
            <a className="button button--outline-light" href={`https://wa.me/573003078822?text=${message}`} target="_blank" rel="noopener noreferrer" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>Validar por WhatsApp directo</a>
          </section>
        </div>
      </div>
    </div>
  );
}
