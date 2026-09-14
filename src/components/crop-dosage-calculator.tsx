"use client";

import { useState } from "react";
import Link from "next/link";

const stageConfigs = {
  brotacion: { number: "01", label: "Establecimiento y crecimiento", product: "Wondergreen 2GROW (15-3-3)", question: "Edad del cultivo, desarrollo radicular, humedad y análisis disponible." },
  floracion: { number: "02", label: "Transición reproductiva", product: "Wondergreen 2BLOOM (3-8-3)", question: "Estado de floración, clima, sanidad, nutrición previa y objetivo productivo." },
  llenado: { number: "03", label: "Desarrollo y llenado", product: "Wondergreen 2FRUIT (3-3-8)", question: "Carga productiva, disponibilidad de agua, análisis y respuesta de aplicaciones anteriores." },
  mantenimiento: { number: "04", label: "Balance y mantenimiento", product: "Wondergreen 2BALANCE (7-7-7)", question: "Condición del lote, extracción esperada, manejo previo y objetivo de mantenimiento." },
} as const;

export function CropDosageCalculator({ cropName, cropSlug }: { cropName: string; cropSlug: string }) {
  const [hectares, setHectares] = useState(2);
  const [stage, setStage] = useState<keyof typeof stageConfigs>("floracion");
  const current = stageConfigs[stage];
  const waText = encodeURIComponent(
    `Hola Wondergreen, quiero preparar una recomendación para ${cropName}.\n` +
    `Ruta consultada: ${cropSlug}\n` +
    `Área aproximada: ${hectares} ha\n` +
    `Etapa: ${current.label}\n` +
    `Referencia a evaluar: ${current.product}\n` +
    "Necesito validar diagnóstico, dosis, presentación, disponibilidad y cotización."
  );
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent(`${cropName} · ${current.label}`)}&prioridad=${encodeURIComponent(`${hectares} ha · referencia a evaluar: ${current.product}`)}`;

  return (
    <div className="crop-preparer">
      <div className="crop-preparer__controls">
        <div className="crop-preparer__area">
          <div>
            <span>Área aproximada</span>
            <div className="crop-preparer__stepper">
              <button aria-label="Disminuir una hectárea" disabled={hectares <= 1} onClick={() => setHectares((value) => Math.max(1, value - 1))} type="button">−</button>
              <strong>{hectares} ha</strong>
              <button aria-label="Aumentar una hectárea" disabled={hectares >= 30} onClick={() => setHectares((value) => Math.min(30, value + 1))} type="button">+</button>
            </div>
          </div>
          <input aria-label="Área aproximada en hectáreas" max="30" min="1" onChange={(event) => setHectares(Number(event.target.value))} step="1" type="range" value={hectares} />
          <p>El área dimensiona suministro y logística. No determina por sí sola la cantidad por planta, sitio o hectárea.</p>
        </div>

        <fieldset className="crop-preparer__stages">
          <legend>Momento principal del cultivo</legend>
          <div>
            {Object.entries(stageConfigs).map(([key, config]) => (
              <button aria-pressed={stage === key} className={stage === key ? "is-active" : undefined} key={key} onClick={() => setStage(key as keyof typeof stageConfigs)} type="button">
                <span>{config.number}</span><strong>{config.label}</strong>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="crop-preparer__result" aria-live="polite">
        <span>Referencia para evaluar</span>
        <h3>{current.product}</h3>
        <div><small>Información que falta confirmar</small><p>{current.question}</p></div>
        <ul>
          <li>Diagnóstico y análisis disponibles</li>
          <li>Etiqueta, presentación y compatibilidad</li>
          <li>Dosis, frecuencia y vía de aplicación</li>
        </ul>
        <Link className="button button--primary" href={contactHref}>Llevar esta preparación a Contacto →</Link>
        <a className="button button--outline-light" href={`https://wa.me/573003078822?text=${waText}`} rel="noopener noreferrer" target="_blank">Validar por WhatsApp directo</a>
        <p className="crop-preparer__boundary">Esta preparación no prescribe una dosis ni sustituye la evaluación agronómica.</p>
      </aside>
    </div>
  );
}
