"use client";

import { useState } from "react";
import { parseWaterNumber } from "@/data/irrigation-water";
import "./measured-tool-fields.css";
export { readingRatio, formatReading } from "@/data/measured-tool-math";

export interface MeasurementField {
  key: string;
  label: string;
  unit: string;
  example: string;
  positive?: boolean;
}

export function useMeasurementDraft(fields: readonly MeasurementField[]) {
  const blank = () => Object.fromEntries(fields.map(({ key }) => [key, ""]));
  const [raw, setRaw] = useState<Record<string, string>>(blank);
  const [isExample, setIsExample] = useState(false);
  const values: Record<string, number | null> = Object.fromEntries(fields.map(({ key, positive }) => {
    const number = parseWaterNumber(raw[key]);
    return [key, number === null || number < 0 || (positive && number === 0) ? null : number];
  }));
  const details = fields.map(({ key, label, unit }) => `${label}: ${values[key] === null ? raw[key].trim() ? `${raw[key]} (dato por revisar)` : "Pendiente" : `${values[key]} ${unit}`}`).join("\n");
  return {
    raw, values, isExample,
    origin: isExample ? "Ejemplo editable; no son mediciones ni una cotización confirmada" : "Datos ingresados por el usuario; pendientes de revisión",
    details,
    edit: (key: string, value: string) => setRaw((current) => ({ ...current, [key]: value })),
    loadExample: () => { setRaw(Object.fromEntries(fields.map(({ key, example }) => [key, example]))); setIsExample(true); },
    clear: () => { setRaw(blank()); setIsExample(false); },
  };
}

export function MeasuredToolFields({ fields, draft }: { fields: readonly MeasurementField[]; draft: ReturnType<typeof useMeasurementDraft> }) {
  return <div className="wg-measured">
    <p>Ingresa tus datos con coma o punto decimal, sin separadores de miles.</p>
    <div className="wg-measured__actions">
      <button type="button" onClick={draft.loadExample}>Cargar un ejemplo</button>
      <button type="button" onClick={draft.clear}>Limpiar datos</button>
    </div>
    {draft.isExample ? <p className="wg-measured__example" role="status">Estás editando un ejemplo. Usa «Limpiar datos» antes de registrar tus propios valores.</p> : null}
    {fields.map(({ key, label, unit, positive }) => {
      const invalid = draft.raw[key].trim() !== "" && draft.values[key] === null;
      const id = `measured-${key}`;
      return <div className="wg-measured__field" key={key}>
        <label htmlFor={id}>{label} ({unit})</label>
        <input id={id} type="text" inputMode="decimal" value={draft.raw[key]} onChange={(event) => draft.edit(key, event.target.value)} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} />
        {invalid ? <p id={`${id}-error`} className="wg-measured__error">{positive ? "Introduce un número mayor que cero." : "Introduce un número mayor o igual a cero."}</p> : null}
      </div>;
    })}
  </div>;
}
