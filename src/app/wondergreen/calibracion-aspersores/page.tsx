"use client";

import { MeasuredToolFields, useMeasurementDraft, readingRatio, formatReading } from "@/components/measured-tool-fields";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";
import { buildToolContactHref, storeToolContactDraft } from "@/data/tool-contact-handoff";

const fields = [
  { key: "tank", label: "Agua utilizada por tanque", unit: "L", example: "20", positive: true },
  { key: "measuredArea", label: "Área medida cubierta", unit: "m²", example: "600", positive: true },
  { key: "targetArea", label: "Área total a intervenir", unit: "m²", example: "10000", positive: true },
];

export default function CalibracionAspersoresPage() {
  const draft = useMeasurementDraft(fields);
  const { tank, measuredArea, targetArea } = draft.values;
  const tanks = readingRatio(targetArea, measuredArea);
  const carrier = tanks === null || tank === null ? null : tanks * tank;
  const observed = readingRatio(tank, measuredArea);
  const litersPerHa = observed === null ? null : observed * 10000;
  const assessmentDetails = `Origen: ${draft.origin}\n${draft.details}\nCargas equivalentes: ${formatReading(tanks, 2)}\nAgua total estimada: ${formatReading(carrier, 2)} L\nVolumen observado equivalente: ${formatReading(litersPerHa, 2)} L/ha\nNo se calcula dosis de producto.`;
  const message = encodeURIComponent(`Hola Greenatics. Quiero revisar una lectura de calibración con agua.\n\n${assessmentDetails}\n\nRevisar cobertura, boquilla, presión y la etiqueta del producto antes de aplicar.`);
  const contactHref = buildToolContactHref("wondergreen", "agro", "Calibración de aspersión");

  return (
    <div style={{ background: "#f7faf5", padding: "60px 0 80px", color: "var(--green-950)" }}>
      <WondergreenToolTrail name="Calibración de aspersores" path="/wondergreen/calibracion-aspersores/" />
      <div className="container" style={{ maxWidth: 1080 }}>
        <header style={{ maxWidth: 800, margin: "0 auto 38px", textAlign: "center" }}>
          <span className="eyebrow">Calibración medida en campo</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)", margin: "10px 0 14px" }}>Convierte una prueba con agua en un plan operativo</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.65, fontSize: "1.04rem" }}>
            Registra cuánto terreno cubre realmente un tanque con el equipo, boquilla, presión, velocidad y operador definidos. El resultado estima agua y cargas; nunca calcula la dosis del producto.
          </p>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 28, alignItems: "start" }}>
          <section style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 24, padding: "clamp(24px, 4vw, 34px)" }}>
            <h2 style={{ fontSize: "1.25rem", marginTop: 0 }}>Prueba de calibración</h2>
            <MeasuredToolFields fields={fields} draft={draft} />
            <p style={{ background: "#fff8e8", color: "#714c13", padding: 14, borderRadius: 12, margin: 0, fontSize: ".8rem", lineHeight: 1.5 }}>Haz la prueba solo con agua y registra boquilla, presión, velocidad, clima y uniformidad de cobertura.</p>
          </section>
          <section style={{ background: "#0a2920", color: "#fff", borderRadius: 24, padding: "clamp(26px, 4vw, 38px)" }}>
            <span style={{ color: "#98cf4f", fontWeight: 800, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".1em" }}>Resultado operativo</span>
            <h2 style={{ color: "#fff", fontSize: "1.7rem", margin: "7px 0 18px" }}>Agua y cargas estimadas</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 13, padding: 16 }}><small style={{ color: "#a8c7b8", display: "block" }}>Cargas equivalentes</small><strong style={{ fontSize: "1.5rem", color: "#fff" }}>{formatReading(tanks, 2)}</strong></div>
              <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 13, padding: 16 }}><small style={{ color: "#a8c7b8", display: "block" }}>Agua total</small><strong style={{ fontSize: "1.5rem", color: "#fff" }}>{formatReading(carrier, 2)}{carrier !== null ? " L" : ""}</strong></div>
            </div>
            <div style={{ background: "#f0f8ec", color: "var(--green-950)", borderRadius: 15, padding: 18, margin: "18px 0" }}>
              <small style={{ display: "block", color: "var(--green-800)", fontWeight: 800, textTransform: "uppercase" }}>Volumen observado</small>
              <strong style={{ fontSize: "1.35rem" }}>{formatReading(litersPerHa, 2)}{litersPerHa !== null ? " L/ha equivalentes" : ""}</strong>
              <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.5 }}>Es el resultado de tu prueba, no un volumen objetivo recomendado.</p>
            </div>
            <p style={{ color: "#c9d9d1", fontSize: ".85rem", lineHeight: 1.55 }}>La cantidad de producto se define únicamente con la etiqueta vigente, el uso autorizado, el área tratada y la orientación técnica aplicable.</p>
            <Link className="button button--primary" href={contactHref} onClick={() => storeToolContactDraft(assessmentDetails)} style={{ width: "100%", justifyContent: "center" }}>Llevar calibración a Contacto →</Link>
            <a className="button button--outline-light" href={`https://wa.me/573003078822?text=${message}`} target="_blank" rel="noopener noreferrer" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>Validar por WhatsApp directo</a>
          </section>
        </div>
      </div>
    </div>
  );
}
