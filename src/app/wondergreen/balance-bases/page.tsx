"use client";

import { MeasuredToolFields, useMeasurementDraft, readingRatio, formatReading } from "@/components/measured-tool-fields";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";
import { buildToolContactHref, storeToolContactDraft } from "@/data/tool-contact-handoff";

const fields = [
  { key: "ca", label: "Calcio intercambiable", unit: "cmol(+)/kg", example: "6,5" },
  { key: "mg", label: "Magnesio intercambiable", unit: "cmol(+)/kg", example: "2" },
  { key: "k", label: "Potasio intercambiable", unit: "cmol(+)/kg", example: "0,35" },
  { key: "cic", label: "C.I.C. reportada", unit: "cmol(+)/kg", example: "14", positive: true },
];

export default function BalanceBasesPage() {
  const draft = useMeasurementDraft(fields);
  const { ca, mg, k, cic } = draft.values;
  const caMg = formatReading(readingRatio(ca, mg), 2);
  const mgK = formatReading(readingRatio(mg, k), 2);
  const saturation = (value: number | null) => {
    const ratio = readingRatio(value, cic);
    return ratio === null ? "Por calcular" : `${formatReading(ratio * 100, 2)}%`;
  };
  const assessmentDetails = `Origen: ${draft.origin}\n${draft.details}\nRelación Ca/Mg: ${caMg}\nRelación Mg/K: ${mgK}\nCa/C.I.C.: ${saturation(ca)}\nMg/C.I.C.: ${saturation(mg)}\nK/C.I.C.: ${saturation(k)}`;
  const message = encodeURIComponent(`Hola Greenatics. Quiero revisar la coherencia de un análisis de suelo.\n\n${assessmentDetails}\n\nCompartiré el informe completo para validar unidades, método y contexto del lote.`);
  const contactHref = buildToolContactHref("wondergreen", "agro", "Relaciones entre bases del suelo");

  return (
    <div style={{ background: "#f7faf5", padding: "60px 0 80px", color: "var(--green-950)" }}>
      <WondergreenToolTrail name="Balance de bases del suelo" path="/wondergreen/balance-bases/" />
      <div className="container" style={{ maxWidth: 1080 }}>
        <header style={{ maxWidth: 800, margin: "0 auto 38px", textAlign: "center" }}>
          <span className="eyebrow">Relaciones entre bases</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)", margin: "10px 0 14px" }}>Explora los datos, sin convertir una relación en receta</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.65, fontSize: "1.04rem" }}>
            La herramienta calcula proporciones aritméticas a partir de los valores ingresados. No usa rangos “ideales” universales ni asigna fertilizantes: la lectura agronómica requiere cultivo, textura, mineralogía, pH, método y respuesta observada.
          </p>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 28, alignItems: "start" }}>
          <section style={{ background: "#fff", padding: "clamp(24px, 4vw, 34px)", border: "1px solid var(--line)", borderRadius: 24 }}>
            <h2 style={{ fontSize: "1.25rem", marginTop: 0 }}>Valores del mismo informe</h2>
            <MeasuredToolFields fields={fields} draft={draft} />
            <p style={{ background: "#fff8e8", color: "#714c13", padding: 14, borderRadius: 12, margin: 0, fontSize: ".8rem", lineHeight: 1.5 }}>No mezcles resultados de laboratorios, métodos, unidades o fechas diferentes.</p>
          </section>
          <section style={{ background: "#0a2920", color: "#fff", padding: "clamp(26px, 4vw, 38px)", borderRadius: 24 }}>
            <span style={{ color: "#98cf4f", fontWeight: 800, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".1em" }}>Lectura matemática</span>
            <h2 style={{ color: "#fff", fontSize: "1.7rem", margin: "7px 0 18px" }}>Proporciones calculadas</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))", gap: 9, marginBottom: 18 }}>
              {[["Ca", saturation(ca)], ["Mg", saturation(mg)], ["K", saturation(k)]].map(([label, value]) => (
                <div key={label} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 12, padding: 13, textAlign: "center" }}>
                  <small style={{ display: "block", color: "#a8c7b8" }}>{label} / C.I.C.</small><strong style={{ color: "#fff", fontSize: "1.2rem", overflowWrap: "anywhere" }}>{value}</strong>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 14, padding: 17, color: "#d4e3dc", lineHeight: 1.7, fontSize: ".88rem" }}>
              <div><strong style={{ color: "#fff" }}>Ca/Mg:</strong> {caMg}</div>
              <div><strong style={{ color: "#fff" }}>Mg/K:</strong> {mgK}</div>
            </div>
            {mg === 0 || k === 0 ? <p style={{ color: "#d4e3dc" }}>Una relación con denominador cero queda pendiente; no se sustituye ese dato por otro valor.</p> : null}
            <div style={{ background: "#f0f8ec", color: "var(--green-950)", borderRadius: 15, padding: 18, margin: "18px 0 22px" }}>
              <strong>Preguntas para la revisión</strong>
              <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: ".84rem", lineHeight: 1.5 }}>¿La C.I.C. es medida o estimada? ¿Qué parte ocupan aluminio, hidrógeno y sodio? ¿Hay síntomas, análisis foliar o limitaciones físicas que respalden una intervención?</p>
            </div>
            <Link className="button button--primary" href={contactHref} onClick={() => storeToolContactDraft(assessmentDetails)} style={{ width: "100%", justifyContent: "center" }}>Llevar lectura a Contacto →</Link>
            <a className="button button--outline-light" href={`https://wa.me/573003078822?text=${message}`} target="_blank" rel="noopener noreferrer" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>Validar por WhatsApp directo</a>
          </section>
        </div>
      </div>
    </div>
  );
}
