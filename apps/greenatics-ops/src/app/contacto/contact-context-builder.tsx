"use client";

import { useMemo, useRef, useState } from "react";
import { publicLeadValidationMessage, validatePublicLeadSubmission } from "@/lib/public-leads";
import styles from "./contact-v2.module.css";

type ContactContextBuilderProps = {
  bookingUrl: string;
  initialAudience?: string;
  initialNeed?: string;
  initialService?: string;
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

export function ContactContextBuilder({ bookingUrl, initialAudience = "", initialNeed = "", initialService, initialProduct, initialCrop, initialContext }: ContactContextBuilderProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [audience, setAudience] = useState(initialAudience);
  const [need, setNeed] = useState(initialNeed);
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [prepared, setPrepared] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const requestIdRef = useRef<string | null>(null);

  const summary = useMemo(() => {
    const lines = [
      `Contexto: ${optionLabel(audiences, audience) || "Por definir"}`,
      `Necesidad: ${optionLabel(needs, need) || "Por definir"}`,
      initialService ? `Servicio de interés: ${initialService}` : "",
      initialContext ? `Contexto heredado: ${initialContext}` : "",
      location ? `Ubicación: ${location}` : "",
      initialProduct ? `Referencia Wondergreen: ${initialProduct}` : "",
      initialCrop ? `Cultivo: ${initialCrop}` : "",
      details ? `Situación: ${details}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  }, [audience, need, location, details, initialService, initialContext, initialProduct, initialCrop]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("Contexto copiado.");
    } catch {
      setCopyStatus("No pudimos copiarlo automáticamente. Puedes seleccionar el texto y copiarlo manualmente.");
    }
  }

  function prepareContext() {
    setPrepared(true);
    setCopyStatus("");
  }

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "submitting" || submitState === "success") return;
    if (!requestIdRef.current) requestIdRef.current = window.crypto.randomUUID();

    const validation = validatePublicLeadSubmission({
      requestId: requestIdRef.current,
      name,
      email,
      phone,
      organization,
      roleTitle,
      audience,
      need,
      location,
      service: initialService,
      product: initialProduct,
      crop: initialCrop,
      context: initialContext,
      details,
      consent,
      website,
    });

    if (!validation.ok) {
      setSubmitState("error");
      setSubmitMessage(publicLeadValidationMessage(validation.code));
      return;
    }

    setSubmitState("submitting");
    setSubmitMessage("Enviando consulta…");
    try {
      const response = await fetch("/api/public-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.value),
      });
      if (response.ok) {
        setSubmitState("success");
        setSubmitMessage("Consulta enviada. Greenatics recibió tu contexto. Si prefieres, también puedes agendar una reunión.");
        return;
      }
      if (response.status === 429) {
        setSubmitState("error");
        setSubmitMessage("Recibimos demasiados intentos desde esta conexión. Intenta más tarde o usa la agenda directa.");
        return;
      }
      setSubmitState("error");
      setSubmitMessage("No pudimos enviar la consulta. Puedes intentarlo de nuevo o usar la agenda directa.");
    } catch {
      setSubmitState("error");
      setSubmitMessage("No pudimos conectar con el canal de consultas. Puedes intentarlo de nuevo o usar la agenda directa.");
    }
  }

  return (
    <form className={styles.form} onSubmit={submitLead}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="contact-name">Nombre</label>
          <input id="contact-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={120} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Correo electrónico</label>
          <input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} placeholder="nombre@organizacion.com" />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-phone">Teléfono</label>
          <input id="contact-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" maxLength={40} placeholder="+57 300 000 0000" />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-organization">Organización</label>
          <input id="contact-organization" value={organization} onChange={(event) => setOrganization(event.target.value)} autoComplete="organization" maxLength={180} placeholder="Empresa, entidad, finca o proyecto" />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-role">Rol / cargo</label>
          <input id="contact-role" value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} autoComplete="organization-title" maxLength={120} />
        </div>
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
          <input id="contact-location" value={location} onChange={(event) => setLocation(event.target.value)} maxLength={180} placeholder="Municipio, ciudad o zona" />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-details">Describe brevemente la situación</label>
          <textarea id="contact-details" value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1500} placeholder="Qué ocurre hoy, qué información tienes y qué decisión necesitas tomar." />
        </div>
      </div>

      <div className={styles.honeypotField} aria-hidden="true">
        <label htmlFor="contact-website">Sitio web</label>
        <input id="contact-website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
      </div>

      {initialService ? <p className={styles.formHelp} aria-label="Servicio recibido de la navegación"><strong>Servicio de interés:</strong> {initialService}</p> : null}
      {initialContext ? <p className={styles.formHelp} aria-label="Contexto recibido de la navegación"><strong>Contexto recibido de la navegación:</strong> {initialContext}</p> : null}
      <p className={styles.formHelp}>Puedes preparar y copiar el contexto sin enviarlo. Si eliges <strong>Enviar consulta</strong>, Greenatics recibirá los datos de contacto y el contexto que ves en este formulario.</p>
      <p className={styles.formHelp}><strong>Aviso de privacidad.</strong> Usaremos estos datos para gestionar esta consulta y su seguimiento comercial. Si no se establece una relación, la retención inicial es de hasta 180 días. No incluyas secretos industriales, datos personales sensibles ni documentación confidencial en este primer contacto.</p>
      <label className={styles.consentRow}>
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
        <span>Autorizo a Greenatics a usar estos datos para responder esta consulta y gestionar su seguimiento comercial.</span>
      </label>

      <div className={styles.actions}>
        <button className={`${styles.button} ${styles.primary}`} type="submit" disabled={submitState === "submitting" || submitState === "success"}>{submitState === "submitting" ? "Enviando…" : submitState === "success" ? "Enviado" : "Enviar consulta"}</button>
        <button className={`${styles.button} ${styles.ghost}`} type="button" onClick={prepareContext}>Preparar contexto</button>
        <a className={`${styles.button} ${styles.ghost}`} href={bookingUrl} target="_blank" rel="noreferrer">Agendar sin preparar</a>
      </div>
      <div className={submitState === "success" ? styles.submitSuccess : styles.submitStatus} aria-live="polite">{submitMessage}</div>

      {prepared ? (
        <div className={styles.prepared} aria-live="polite">
          <h3>Contexto preparado.</h3>
          <p>Úsalo como guía al agendar o al iniciar la conversación. Nada se ha enviado todavía. Esta acción solo prepara el resumen local.</p>
          <textarea className={styles.summary} value={summary} readOnly aria-label="Resumen preparado para la conversación" />
          <div className={styles.actions}><button className={`${styles.button} ${styles.ghost}`} type="button" onClick={copySummary}>Copiar contexto</button><a className={`${styles.button} ${styles.primary}`} href={bookingUrl} target="_blank" rel="noreferrer">Agendar reunión</a></div>
          <div className={styles.copyStatus} aria-live="polite">{copyStatus}</div>
        </div>
      ) : null}
    </form>
  );
}
