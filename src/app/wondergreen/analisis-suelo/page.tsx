"use client";

import { useState } from "react";
import Link from "next/link";

const fields = [
  { key: "ph", label: "pH reportado", min: 4, max: 8, step: 0.1, unit: "" },
  { key: "om", label: "Materia orgánica", min: 0, max: 15, step: 0.1, unit: "%" },
  { key: "cic", label: "C.I.C.", min: 1, max: 50, step: 1, unit: " cmol(+)/kg" },
  { key: "al", label: "Saturación de aluminio", min: 0, max: 80, step: 1, unit: "%" },
] as const;

export default function SoilAnalysisPage() {
  const [crop, setCrop] = useState("Café");
  const [values, setValues] = useState({ ph: 5.1, om: 3.5, cic: 16, al: 22 });

  const message = encodeURIComponent(
    `Hola Greenatics. Quiero revisar un análisis de suelo para ${crop}. Valores transcritos: pH ${values.ph}; materia orgánica ${values.om}%; C.I.C. ${values.cic} cmol(+)/kg; saturación de aluminio ${values.al}%. Puedo compartir el informe completo, método del laboratorio, ubicación, profundidad de muestreo y antecedentes del lote.`
  );
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent("Revisión de análisis de suelo")}&prioridad=${encodeURIComponent(`${crop} · pH ${values.ph} · materia orgánica ${values.om}% · C.I.C. ${values.cic} · aluminio ${values.al}%`)}`;

  return (
    <main style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <div className="container" style={{ maxWidth: 1080 }}>
        <header style={{ maxWidth: 780, margin: "0 auto 38px", textAlign: "center" }}>
          <span className="eyebrow">Lectura técnica del suelo</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)", margin: "10px 0 14px" }}>Organiza tu análisis antes de tomar decisiones</h1>
          <p style={{ color: "var(--muted)", fontSize: "1.04rem", lineHeight: 1.65 }}>
            Transcribe cuatro resultados para preparar una conversación técnica. La herramienta no clasifica el suelo ni prescribe productos: los rangos dependen del método analítico, el cultivo, la textura y el contexto del lote.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28, alignItems: "start" }}>
          <section style={{ background: "#fff", padding: "clamp(24px, 4vw, 34px)", borderRadius: 24, border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ fontSize: "1.25rem", marginTop: 0 }}>Resultados transcritos</h2>
            <label style={{ display: "block", fontWeight: 750, fontSize: ".86rem", marginBottom: 18 }}>
              Cultivo o sistema productivo
              <select value={crop} onChange={(event) => setCrop(event.target.value)} style={{ width: "100%", marginTop: 7, padding: 12, borderRadius: 10, border: "1px solid var(--line)", background: "#fafcf9" }}>
                {["Café", "Aguacate Hass", "Cacao", "Cítricos", "Pastos", "Plátano y banano", "Hortalizas", "Otro"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            {fields.map((field) => (
              <label key={field.key} style={{ display: "block", marginBottom: 19, fontSize: ".86rem", fontWeight: 750 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span>{field.label}</span><strong style={{ color: "var(--green-800)" }}>{values[field.key]}{field.unit}</strong>
                </span>
                <input type="range" min={field.min} max={field.max} step={field.step} value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: Number(event.target.value) }))} style={{ width: "100%", accentColor: "var(--green-700)" }} />
              </label>
            ))}
            <p style={{ margin: 0, padding: 14, borderRadius: 12, background: "#fff8e8", color: "#714c13", fontSize: ".8rem", lineHeight: 1.5 }}>
              Verifica que las unidades y el método de extracción coincidan exactamente con el informe del laboratorio.
            </p>
          </section>

          <section style={{ background: "#0a2920", color: "#fff", padding: "clamp(26px, 4vw, 38px)", borderRadius: 24, boxShadow: "var(--shadow-md)" }}>
            <span style={{ color: "#98cf4f", fontWeight: 800, fontSize: ".75rem", letterSpacing: ".1em", textTransform: "uppercase" }}>Ficha preparada</span>
            <h2 style={{ color: "#fff", fontSize: "1.7rem", margin: "7px 0 18px" }}>Qué falta para interpretar bien</h2>
            <ol style={{ margin: "0 0 24px", paddingLeft: 20, color: "#d4e3dc", lineHeight: 1.65, fontSize: ".9rem" }}>
              <li>Informe completo, laboratorio, fecha, unidades y métodos analíticos.</li>
              <li>Ubicación, profundidad, número de submuestras y homogeneidad del área.</li>
              <li>Textura, drenaje, pendiente, historial de enmiendas y fertilización.</li>
              <li>Edad, etapa, rendimiento esperado y síntomas observados en el cultivo.</li>
              <li>Disponibilidad de agua, manejo de coberturas y restricciones operativas.</li>
            </ol>
            <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 15, padding: 18, marginBottom: 22 }}>
              <strong style={{ color: "#fff" }}>El siguiente paso no es una fórmula automática</strong>
              <p style={{ color: "#c9d9d1", margin: "7px 0 0", fontSize: ".86rem", lineHeight: 1.55 }}>
                Es contrastar el reporte con el lote y definir si se requiere una recomendación de nutrición, acondicionamiento, encalamiento o una validación adicional.
              </p>
            </div>
            <Link className="button button--primary" href={contactHref} style={{ width: "100%", justifyContent: "center" }}>Llevar análisis a Contacto →</Link>
            <a className="button button--outline-light" href={`https://wa.me/573003078822?text=${message}`} target="_blank" rel="noopener noreferrer" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>Validar por WhatsApp directo</a>
          </section>
        </div>
      </div>
    </main>
  );
}
