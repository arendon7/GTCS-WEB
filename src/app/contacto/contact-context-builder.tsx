"use client";

import { useMemo, useState } from "react";
import styles from "./contact-v2.module.css";

type ContactContextBuilderProps = {
  bookingUrl: string;
  initialAudience?: string;
  initialNeed?: string;
  initialProduct?: string;
  initialCrop?: string;
  initialContext?: string;
};

const audiences = [
  ["", "Selecciona una opción"],
  ["esp", "ESP / Prestador"],
  ["municipio", "Municipio"],
  ["empresa", "Empresa / Gran generador"],
  ["ph", "Propiedad horizontal / Institución"],
  ["planta", "Planta / Operador"],
  ["wondergreen", "Agro / Wondergreen"],
  ["otro", "Otro contexto"],
] as const;

const needs = [
  ["", "Selecciona una necesidad"],
  ["diagnostico", "Entender la situación actual"],
  ["planeacion", "Organizar la gestión o un plan"],
  ["regulacion", "Resolver un tema jurídico o regulatorio"],
  ["rutas", "Mejorar rutas o logística"],
  ["planta", "Evaluar, recuperar o mejorar una planta"],
  ["operacion", "Mejorar la operación"],
  ["datos", "Organizar datos, evidencia o trazabilidad"],
  ["valorizacion", "Desarrollar una salida o producto"],
  ["nutricion", "Orientar nutrición para un cultivo"],
  ["distribucion", "Distribuir Wondergreen"],
  ["otro", "Otra necesidad"],
] as const;

function optionLabel(options: readonly (readonly [string, string])[], value: string) {
  return options.find(([id]) => id === value)?.[1] ?? value;
}

export function ContactContextBuilder({ bookingUrl, initialAudience = "", initialNeed = "", initialProduct, initialCrop, initialContext }: ContactContextBuilderProps) {
  const [audience, setAudience] = useState(initialAudience);
  const [need, setNeed] = useState(initialNeed);
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [prepared, setPrepared] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const summary = useMemo(() => {
    const lines = [
      `Contexto: ${optionLabel(audiences, audience) || "Por definir"}`,
      `Necesidad: ${optionLabel(needs, need) || "Por definir"}`,
      initialContext ? `Contexto heredado: ${initialContext}` : "",
      location ? `Ubicación: ${location}` : "",
      initialProduct ? `Referencia Wondergreen: ${initialProduct}` : "",
      initialCrop ? `Cultivo: ${initialCrop}` : "",
      details ? `Situación: ${details}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [audience, need, location, details, initialContext, initialProduct, initialCrop]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("Contexto copiado.");
    } catch {
      setCopyStatus("No pudimos copiarlo automáticamente. Puedes seleccionar el texto y copiarlo manualmente.");
    }
  }

  return (
    <form className={styles.form} onSubmit={(event) => { event.preventDefault(); setPrepared(true); setCopyStatus(""); }}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="contact-audience">¿Desde qué contexto nos escribes?</label>
          <select id="contact-audience" value={audience} onChange={(event) => setAudience(event.target.value)} required>
            {audiences.map(([value, label]) => <option value={value} key={value || "empty"}>{label}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-need">¿Qué necesitas resolver primero?</label>
          <select id="contact-need" value={need} onChange={(event) => setNeed(event.target.value)} required>
            {needs.map(([value, label]) => <option value={value} key={value || "empty"}>{label}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-location">Ubicación</label>
          <input id="contact-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Municipio, ciudad o zona" />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-details">Describe brevemente la situación</label>
          <textarea id="contact-details" value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Qué ocurre hoy, qué información tienes y qué decisión necesitas tomar." />
        </div>
      </div>

      {initialContext ? <p className={styles.formHelp} aria-label="Contexto recibido de la navegación"><strong>Contexto recibido de la navegación:</strong> {initialContext}</p> : null}
      <p className={styles.formHelp}>Este paso no envía información a Greenatics ni la guarda en un servidor. Solo organiza el contexto en tu navegador para que llegues mejor preparado a la conversación.</p>
      <div className={styles.actions}><button className={`${styles.button} ${styles.primary}`} type="submit">Preparar contexto</button><a className={`${styles.button} ${styles.ghost}`} href={bookingUrl} target="_blank" rel="noreferrer">Agendar sin preparar</a></div>

      {prepared ? (
        <div className={styles.prepared} aria-live="polite">
          <h3>Contexto preparado.</h3>
          <p>Úsalo como guía al agendar o al iniciar la conversación. Nada se ha enviado todavía.</p>
          <textarea className={styles.summary} value={summary} readOnly aria-label="Resumen preparado para la conversación" />
          <div className={styles.actions}><button className={`${styles.button} ${styles.ghost}`} type="button" onClick={copySummary}>Copiar contexto</button><a className={`${styles.button} ${styles.primary}`} href={bookingUrl} target="_blank" rel="noreferrer">Agendar reunión</a></div>
          <div className={styles.copyStatus} aria-live="polite">{copyStatus}</div>
        </div>
      ) : null}
    </form>
  );
}
