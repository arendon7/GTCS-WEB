"use client";

import { MeasuredToolFields, useMeasurementDraft, readingRatio, formatReading } from "@/components/measured-tool-fields";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";
import { buildToolContactHref, storeToolContactDraft } from "@/data/tool-contact-handoff";

const fields = [
  { key: "alternativePrice", label: "Precio de la alternativa", unit: "COP", example: "185000" },
  { key: "alternativeWeight", label: "Peso de la alternativa", unit: "kg", example: "50", positive: true },
  { key: "wondergreenPrice", label: "Precio Wondergreen", unit: "COP", example: "147400" },
  { key: "wondergreenWeight", label: "Peso Wondergreen", unit: "kg", example: "40", positive: true },
];

export default function CostoUnidadNutrientePage() {
  const draft = useMeasurementDraft(fields);
  const { alternativePrice, alternativeWeight, wondergreenPrice, wondergreenWeight } = draft.values;
  const alternativeCostPerKg = readingRatio(alternativePrice, alternativeWeight);
  const wondergreenCostPerKg = readingRatio(wondergreenPrice, wondergreenWeight);
  const difference = alternativeCostPerKg === null || wondergreenCostPerKg === null ? null : wondergreenCostPerKg - alternativeCostPerKg;
  const differenceText = difference === null ? "Completa precios y pesos válidos para comparar." : difference === 0 ? "Ambas opciones tienen el mismo precio por kilogramo." : `Wondergreen cuesta COP ${formatReading(Math.abs(difference), 2)} ${difference > 0 ? "más" : "menos"} por kilogramo en los datos ingresados.`;
  const assessmentDetails = `Alternativa comparada:\nOrigen: ${draft.origin}\n${draft.details}\nPrecio por kg de alternativa: ${formatReading(alternativeCostPerKg, 2)} COP/kg\nPrecio por kg Wondergreen: ${formatReading(wondergreenCostPerKg, 2)} COP/kg\n${differenceText}\nLa comparación es de precio por masa, no de equivalencia nutricional ni costo por hectárea. Revisar composición, dosis recomendada, número de aplicaciones, logística y disponibilidad.`;
  const waText = encodeURIComponent(`Hola Wondergreen, quiero revisar una comparación comercial.\n${assessmentDetails}`);
  const contactHref = buildToolContactHref("wondergreen", "agro", "Comparación de costo por unidad de nutriente");

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <WondergreenToolTrail name="Costo por unidad de nutriente" path="/wondergreen/costo-unidad-nutriente/" />
      <div className="container" style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Comparación comercial responsable</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>El precio por kilogramo es apenas el comienzo de la comparación.</h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>Compara presentación y precio de compra. Después valida composición, dosis, frecuencia, logística y respuesta esperada para estimar el costo real del programa.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "28px", alignItems: "start" }}>
          <section style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1.5px solid var(--line)" }}>
            <h2 style={{ fontSize: "1.3rem", margin: "0 0 22px" }}>Datos de compra</h2>
            <MeasuredToolFields fields={fields} draft={draft} />
            <p style={{ fontSize: ".88rem", color: "var(--muted)" }}>Usa el precio y peso de las cotizaciones que estás comparando. El ejemplo no confirma precio actual, presentación ni disponibilidad.</p>
          </section>

          <section style={{ background: "#0a2920", color: "#ffffff", padding: "32px", borderRadius: "24px" }}>
            <span style={{ color: "#98cf4f", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Comparación normalizada</span>
            <h2 style={{ color: "#ffffff", fontSize: "1.45rem", margin: "6px 0 20px" }}>Precio de producto por kilogramo</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,.08)" }}><small style={{ display: "block", color: "#b8cfc3" }}>Alternativa</small><strong style={{ fontSize: "1.35rem", overflowWrap: "anywhere" }}>{alternativeCostPerKg === null ? "Por calcular" : `COP ${formatReading(alternativeCostPerKg, 2)}`}</strong></div>
              <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,.08)" }}><small style={{ display: "block", color: "#b8cfc3" }}>Wondergreen</small><strong style={{ fontSize: "1.35rem", color: "#98cf4f", overflowWrap: "anywhere" }}>{wondergreenCostPerKg === null ? "Por calcular" : `COP ${formatReading(wondergreenCostPerKg, 2)}`}</strong></div>
            </div>
            <p style={{ color: "#c7d9d0", fontSize: "0.86rem", lineHeight: 1.55 }}>{differenceText} Este valor no demuestra disponibilidad nutricional, rendimiento ni ahorro por hectárea.</p>
            <div style={{ padding: "16px", background: "rgba(255,255,255,.06)", borderRadius: "14px", marginBottom: "18px" }}><strong>Para comparar el programa completo</strong><p style={{ margin: "6px 0 0", color: "#b8cfc3", fontSize: "0.82rem" }}>Solicita ficha vigente, recomendación, número de aplicaciones, costo logístico e indicadores de seguimiento.</p></div>
            <Link href={contactHref} onClick={() => storeToolContactDraft(assessmentDetails)} className="button button--primary">Llevar comparación a Contacto →</Link>
            <a href={`https://wa.me/573003078822?text=${waText}`} target="_blank" rel="noopener noreferrer" className="button button--outline-light" style={{ marginTop: "10px" }}>Validar por WhatsApp directo</a>
          </section>
        </div>
      </div>
    </div>
  );
}
