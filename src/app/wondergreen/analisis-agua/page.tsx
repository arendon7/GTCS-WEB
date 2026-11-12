"use client";

import { useState } from "react";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";
import { buildToolContactHref, storeToolContactDraft } from "@/data/tool-contact-handoff";
import { calculateSodiumAdsorptionRatio, parseWaterNumber } from "@/data/irrigation-water";
import "./irrigation-water.css";

const fields = [
  { key: "ph", label: "pH del agua", unit: "" },
  { key: "ec", label: "Conductividad eléctrica", unit: "dS/m a 25 °C" },
  { key: "sodium", label: "Sodio (Na)", unit: "meq/L" },
  { key: "calcium", label: "Calcio (Ca)", unit: "meq/L" },
  { key: "magnesium", label: "Magnesio (Mg)", unit: "meq/L" },
] as const;
type FieldKey = typeof fields[number]["key"];
type Report = Record<FieldKey, string>;
const emptyReport: Report = { ph: "", ec: "", sodium: "", calcium: "", magnesium: "" };
const exampleReport: Report = { ph: "7,6", ec: "1,2", sodium: "3,5", calcium: "2,5", magnesium: "1,8" };

export default function AnalisisAguaPage() {
  const [report, setReport] = useState<Report>(emptyReport);
  const [isExample, setIsExample] = useState(false);
  const values = Object.fromEntries(fields.map(({ key }) => [key, parseWaterNumber(report[key])])) as Record<FieldKey, number | null>;
  const fieldError = (key: FieldKey): string | null => {
    if (!report[key].trim()) return null;
    const value = values[key];
    if (value === null || value < 0) return "Introduce un número válido, mayor o igual a cero.";
    if (key === "ph" && value > 14) return "Revisa el pH: el intervalo de entrada es de 0 a 14.";
    return null;
  };
  const hasInvalidField = fields.some(({ key }) => fieldError(key) !== null);
  const sar = calculateSodiumAdsorptionRatio(values.sodium, values.calcium, values.magnesium);
  const ratioText = sar === null ? "Por calcular" : sar.toFixed(2).replace(".", ",");
  const zeroDenominator = values.calcium === 0 && values.magnesium === 0;
  const describe = (key: FieldKey, unit: string) => fieldError(key)
    ? `${report[key]} (dato por revisar)`
    : values[key] === null ? "Pendiente" : `${values[key]}${unit ? ` ${unit}` : ""}`;
  const assessmentDetails = [
    `Origen: ${isExample ? "Ejemplo numérico editable; no es un informe de laboratorio" : "Datos transcritos por el usuario; pendientes de revisión técnica"}`,
    `pH del agua: ${describe("ph", "")}`,
    `Conductividad eléctrica: ${describe("ec", "dS/m a 25 °C")}`,
    `Sodio: ${describe("sodium", "meq/L")}`,
    `Calcio: ${describe("calcium", "meq/L")}`,
    `Magnesio: ${describe("magnesium", "meq/L")}`,
    `RAS: ${sar === null ? "No calculable con los datos ingresados" : sar.toFixed(2)}`,
    "Método: Na / raíz cuadrada de ((Ca + Mg) / 2), con los tres iones en meq/L.",
    "Revisar CE, informe completo, suelo, cultivo y sistema de riego antes de decidir el manejo.",
  ].join("\n");
  const contactHref = buildToolContactHref("wondergreen", "agro", "Calidad de agua de riego");
  const whatsappMessage = encodeURIComponent(`Hola Greenatics. Quiero revisar mi agua de riego.\n\n${assessmentDetails}`);

  function renderField(field: typeof fields[number]) {
    const error = fieldError(field.key);
    const id = `water-${field.key}`;
    return (
      <div className="wg-water__field" key={field.key}>
        <label htmlFor={id}>{field.label}{field.unit ? ` (${field.unit})` : ""}</label>
        <input id={id} type="text" inputMode="decimal" value={report[field.key]} autoComplete="off"
          aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error water-units` : "water-units"}
          onChange={(event) => setReport((current) => ({ ...current, [field.key]: event.target.value }))} />
        {error ? <span className="wg-water__field-error" id={`${id}-error`}>{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="wg-water">
      <WondergreenToolTrail name="Análisis de agua" path="/wondergreen/analisis-agua/" />
      <div className="container">
        <header className="wg-water__intro">
          <span className="eyebrow">Agua de riego · Wondergreen</span>
          <h1>Revisa el agua antes de decidir el fertirriego.</h1>
          <p>Organiza los resultados de tu laboratorio y calcula la relación de adsorción de sodio (RAS). Con esa lectura, nuestro equipo puede ayudarte a preparar la revisión del agua, el suelo y el cultivo.</p>
        </header>
        <div className="wg-water__layout">
          <section className="wg-water__form" aria-labelledby="water-report-title">
            <h2 id="water-report-title">Los datos de tu informe</h2>
            <p id="water-units">Transcribe sodio, calcio y magnesio en meq/L. Usa coma o punto decimal, sin separadores de miles. Confirma las unidades con el laboratorio antes de calcular.</p>
            <div className="wg-water__example-actions">
              <button type="button" onClick={() => { setReport(exampleReport); setIsExample(true); }}>Cargar un ejemplo</button>
              <button type="button" onClick={() => { setReport(emptyReport); setIsExample(false); }}>Limpiar datos</button>
            </div>
            {isExample ? <p className="wg-water__example-note" role="status">Estás editando un ejemplo numérico. Usa «Limpiar datos» para empezar con tu propio informe.</p> : null}
            <fieldset><legend>Contexto del agua</legend><div className="wg-water__fields">{fields.slice(0, 2).map(renderField)}</div></fieldset>
            <fieldset><legend>Iones para el cálculo de RAS</legend><div className="wg-water__fields wg-water__fields--ions">{fields.slice(2).map(renderField)}</div></fieldset>
          </section>
          <section className="wg-water__result" aria-labelledby="water-result-title">
            <h2 id="water-result-title">Relación de adsorción de sodio</h2>
            <output className="wg-water__ratio" aria-live="polite" aria-label="RAS calculada">{ratioText}</output>
            <div className="wg-water__formula">RAS = Na / √((Ca + Mg) / 2)</div>
            {sar === null ? <p>{zeroDenominator ? "Calcio y magnesio no pueden sumar cero para este cálculo." : "Completa sodio, calcio y magnesio con valores válidos del informe para obtener la RAS."}</p> : <p>Este índice se calcula con los tres iones ingresados. Para interpretar su relación con la infiltración, cruza la RAS con la conductividad eléctrica y las condiciones del suelo.</p>}
            {hasInvalidField ? <p>Revisa los campos señalados antes de compartir esta lectura.</p> : null}
            <h3>De los números al manejo del lote</h3>
            <p>Reúne el informe completo, fecha y punto de muestreo, cultivo, suelo y sistema de riego. La decisión de acondicionar el agua requiere esa revisión; la RAS por sí sola no define una dosis ni una mezcla de fertilizantes.</p>
            <a className="wg-water__source" href="https://www.fao.org/4/T0234e/T0234E04.htm" target="_blank" rel="noopener noreferrer">Consultar el método y contexto en FAO<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
            <Link className="button button--light" href={contactHref} onClick={() => storeToolContactDraft(assessmentDetails)}>Compartir lectura con Greenatics</Link>
            <a className="wg-water__whatsapp" href={`https://wa.me/573003078822?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">Conversar por WhatsApp<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
          </section>
        </div>
      </div>
    </div>
  );
}
