"use client";

import { useState } from "react";
import Link from "next/link";

export interface AssessmentField {
  id: string;
  label: string;
  help: string;
  options?: string[];
  placeholder?: string;
}

interface SolutionAssessmentProps {
  eyebrow: string;
  title: string;
  lead: string;
  principle: string;
  fields: AssessmentField[];
  questions: string[];
  evidence: string[];
  deliverables: string[];
  nextStep: string;
  whatsappIntro: string;
}

export function SolutionAssessment({
  eyebrow,
  title,
  lead,
  principle,
  fields,
  questions,
  evidence,
  deliverables,
  nextStep,
  whatsappIntro,
}: SolutionAssessmentProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((field) => [field.id, field.options?.[0] ?? ""]))
  );

  const completed = fields.filter((field) => values[field.id]?.trim()).length;
  const details = fields
    .filter((field) => values[field.id]?.trim())
    .map((field) => `${field.label}: ${values[field.id]}`)
    .join("\n");
  const message = encodeURIComponent(
    `${whatsappIntro}\n\nContexto registrado:\n${details || "Aún no tengo datos consolidados."}\n\nQuiero definir qué evidencia falta y cuál debería ser el alcance de la evaluación.`
  );
  const contactHref = `/contacto/?interes=solucion&perfil=esp&diagnostico=${encodeURIComponent(title)}&prioridad=${encodeURIComponent(details || nextStep)}`;

  return (
    <main style={{ background: "#f7faf5", color: "var(--green-950)" }}>
      <section style={{ background: "linear-gradient(135deg, #082b21 0%, #124b38 58%, #1c6847 100%)", color: "#fff", padding: "clamp(64px, 9vw, 112px) 0 70px" }}>
        <div className="container" style={{ maxWidth: 1120, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "clamp(30px, 6vw, 72px)", alignItems: "end" }}>
          <div>
            <span className="eyebrow eyebrow--light">{eyebrow}</span>
            <h1 style={{ color: "#fff", fontSize: "clamp(2.35rem, 6vw, 4.5rem)", lineHeight: .98, margin: "14px 0 20px", letterSpacing: "-.04em" }}>{title}</h1>
          </div>
          <div>
            <p style={{ color: "#dbe9e2", fontSize: "clamp(1rem, 2vw, 1.18rem)", lineHeight: 1.65, margin: "0 0 22px" }}>{lead}</p>
            <div style={{ borderLeft: "3px solid #a8d65e", paddingLeft: 18, color: "#fff", fontWeight: 750, lineHeight: 1.55 }}>{principle}</div>
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 0" }}>
        <div className="container" style={{ maxWidth: 1120 }}>
          <header style={{ maxWidth: 760, marginBottom: 30 }}>
            <span className="eyebrow">Punto de partida</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "9px 0" }}>Organiza el escenario antes de calcular resultados.</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>Completa lo que ya conoces. Los campos vacíos no son un error: muestran qué información conviene levantar durante el diagnóstico.</p>
          </header>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
            <section style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 24, padding: "clamp(22px, 4vw, 34px)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", marginBottom: 22 }}>
                <h3 style={{ fontSize: "1.22rem", margin: 0 }}>Información disponible</h3>
                <span style={{ fontSize: ".76rem", fontWeight: 800, color: "var(--green-800)", background: "#eaf5e6", borderRadius: 999, padding: "6px 10px" }}>{completed}/{fields.length}</span>
              </div>
              {fields.map((field) => (
                <label key={field.id} style={{ display: "block", marginBottom: 18 }}>
                  <span style={{ display: "block", fontWeight: 800, fontSize: ".84rem", marginBottom: 4 }}>{field.label}</span>
                  <small style={{ display: "block", color: "var(--muted)", lineHeight: 1.4, marginBottom: 7 }}>{field.help}</small>
                  {field.options ? (
                    <select value={values[field.id]} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--line)", background: "#fafcf9" }}>
                      {field.options.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input value={values[field.id]} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} placeholder={field.placeholder} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--line)", background: "#fafcf9", boxSizing: "border-box" }} />
                  )}
                </label>
              ))}
            </section>

            <section style={{ background: "#0a2920", color: "#fff", borderRadius: 24, padding: "clamp(25px, 4vw, 38px)", boxShadow: "var(--shadow-md)" }}>
              <span style={{ color: "#a8d65e", fontSize: ".75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em" }}>Preguntas de decisión</span>
              <h3 style={{ color: "#fff", fontSize: "1.65rem", margin: "8px 0 18px" }}>Lo que una evaluación debe resolver</h3>
              <ol style={{ paddingLeft: 21, margin: "0 0 24px", color: "#d5e3dc", fontSize: ".88rem", lineHeight: 1.65 }}>
                {questions.map((question) => <li key={question} style={{ marginBottom: 8 }}>{question}</li>)}
              </ol>
              <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 15, padding: 18, marginBottom: 22 }}>
                <strong style={{ color: "#fff" }}>Siguiente decisión</strong>
                <p style={{ color: "#c9d9d1", margin: "6px 0 0", fontSize: ".84rem", lineHeight: 1.5 }}>{nextStep}</p>
              </div>
              <Link className="button button--primary" href={contactHref} style={{ width: "100%", justifyContent: "center" }}>Llevar escenario a Contacto →</Link>
              <a className="button button--outline-light" href={`https://wa.me/573003078822?text=${message}`} target="_blank" rel="noopener noreferrer" style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}>Compartir por WhatsApp directo</a>
            </section>
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "64px 0" }}>
        <div className="container" style={{ maxWidth: 1120 }}>
          <header style={{ maxWidth: 760, marginBottom: 30 }}><span className="eyebrow">De información a alcance</span><h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "9px 0" }}>Qué revisar y qué debería entregar el trabajo.</h2></header>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
            <article style={{ border: "1px solid var(--line)", borderRadius: 20, padding: 26 }}>
              <span style={{ color: "var(--green-700)", fontWeight: 800, fontSize: ".75rem", textTransform: "uppercase" }}>Evidencia mínima</span>
              <ul style={{ paddingLeft: 19, color: "var(--muted)", lineHeight: 1.65, fontSize: ".88rem" }}>{evidence.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article style={{ border: "1px solid var(--line)", borderRadius: 20, padding: 26 }}>
              <span style={{ color: "var(--green-700)", fontWeight: 800, fontSize: ".75rem", textTransform: "uppercase" }}>Entregables posibles</span>
              <ul style={{ paddingLeft: 19, color: "var(--muted)", lineHeight: 1.65, fontSize: ".88rem" }}>{deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          </div>
          <p style={{ margin: "24px 0 0", background: "#fff8e8", border: "1px solid #ead6a7", color: "#634510", borderRadius: 15, padding: 18, lineHeight: 1.55, fontSize: ".86rem" }}>
            Esta herramienta prepara una conversación y un alcance. No constituye estudio de viabilidad, diseño de ingeniería, concepto jurídico, certificación, cotización ni garantía de resultado.
          </p>
        </div>
      </section>
    </main>
  );
}
