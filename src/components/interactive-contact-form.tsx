"use client";

import React, { useEffect, useState } from "react";

const profileOptions = [
  { id: "esp", label: "Municipio / ESP", placeholderVol: "Ej: 150 ton/mes de orgánicos" },
  { id: "agroindustria", label: "Agroindustria / Empresa", placeholderVol: "Ej: 40 ton/mes (pulpa/estiércol)" },
  { id: "agro", label: "Productor / Finca", placeholderVol: "Ej: 15 hectáreas de café/aguacate" },
  { id: "hogar", label: "Casa y Jardín", placeholderVol: "Ej: 2 kits para interior y balcón" }
];

const contactContexts = {
  "calcula-tu-huella": { label: "Calcula tu Huella", title: "Inventarios y reportes climáticos", copy: "Cuéntanos qué organización, fuentes o periodo quieres organizar para preparar el acceso o la orientación adecuada.", profile: "agroindustria" },
  "greenatics-ops": { label: "GREENATICS OPS", title: "Control operativo para una planta", copy: "Indica qué necesitas controlar primero: bitácora, recepciones, volúmenes, lotes, mantenimiento, inventarios o reportes.", profile: "esp" },
  "greenatics-red": { label: "GREENATICS Red", title: "Diagnóstico territorial y PMIRS", copy: "Comparte el territorio, los actores y la información de campo que quieres convertir en prioridades y planes de implementación.", profile: "esp" },
  "red": { label: "GREENATICS Red", title: "Diagnóstico territorial y PMIRS", copy: "Comparte el territorio, los actores y la información de campo que quieres convertir en prioridades y planes de implementación.", profile: "esp" },
  "agroway": { label: "AGROWAY", title: "Trazabilidad para un proyecto productivo", copy: "Cuéntanos sobre el productor, la finca, el lote y el ciclo que quieres registrar y seguir en campo.", profile: "agro" },
  "sana": { label: "SANA", title: "Estructurar inversión productiva", copy: "Cuéntanos sobre el proyecto agrícola, sus actores, el nivel de acompañamiento y la información que debe alimentar una decisión de inversión.", profile: "agro" },
  "agroindustria": { label: "Agroindustria", title: "Tratamiento, biogás o bioenergía", copy: "Describe la corriente, su volumen, continuidad y salida esperada para orientar la alternativa técnica más coherente.", profile: "agroindustria" },
  "herramientas": { label: "Herramientas Greenatics", title: "Implementación de una plataforma", copy: "Indica qué proceso quieres ordenar primero y quiénes participarían en la operación, supervisión y toma de decisiones.", profile: "esp" },
  "casa-jardin": { label: "Casa y Jardín", title: "Orientación para tus plantas", copy: "Cuéntanos qué plantas tienes, en qué espacio están y qué quieres mejorar para orientar producto, kit o guía.", profile: "hogar" },
  "programas-wondergreen": { label: "Programas Wondergreen", title: "Nutrición por suelo, cultivo y etapa", copy: "Comparte cultivo, área, etapa y objetivo productivo para preparar una conversación técnica y comercial más útil.", profile: "agro" },
  "prefactibilidad": { label: "Prefactibilidad", title: "Evaluar una solución antes de invertir", copy: "Trae los datos de generación, infraestructura, restricciones y objetivo que ya tengas disponibles.", profile: "esp" },
  "esg": { label: "Escenario ESG", title: "Convertir una estimación en una línea base", copy: "Comparte el volumen, periodo, costos y fuentes disponibles para revisar qué puede medirse y con qué metodología.", profile: "agroindustria" },
  "impacto": { label: "Escenario de transformación", title: "Dimensionar valor e impacto de una corriente", copy: "Indica el perfil, volumen y periodo del escenario para separar potencial orientativo de resultado validado.", profile: "esp" },
  "solucion": { label: "Solución Greenatics", title: "Definir el alcance de una solución", copy: "Comparte el escenario que quieres resolver para ordenar evidencia, alcance técnico y siguiente decisión.", profile: "esp" },
  "wondergreen": { label: "Wondergreen", title: "Recomendación agronómica y cotización", copy: "Comparte cultivo, área, etapa y análisis disponibles para revisar referencia, dosis, logística y suministro.", profile: "agro" },
} as const;

type ContactContext = {
  label: string;
  title: string;
  copy: string;
  profile: string;
};

const diagnosticProfiles: Record<string, string> = {
  municipio: "esp",
  esp: "esp",
  empresa: "agroindustria",
  agro: "agro",
  hogar: "hogar",
};

export function InteractiveContactForm() {
  const [profile, setProfile] = useState<string>("esp");
  const [name, setName] = useState<string>("");
  const [entity, setEntity] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [context, setContext] = useState<ContactContext | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("interes") || params.get("servicio") || "";
    const baseContext = contactContexts[key as keyof typeof contactContexts];
    const diagnosticTitle = params.get("diagnostico");
    const diagnosticPriority = params.get("prioridad");
    const diagnosticProfile = params.get("perfil");
    const diagnosticContext = diagnosticTitle
      ? {
        label: "Diagnóstico Greenatics",
        title: `Ruta sugerida: ${diagnosticTitle}`,
        copy: `${diagnosticProfile ? `Perfil seleccionado: ${diagnosticProfile}. ` : ""}${diagnosticPriority ? `Prioridad identificada: ${diagnosticPriority}` : "Partimos de la necesidad que seleccionaste para definir el alcance adecuado."}`,
        profile: diagnosticProfiles[diagnosticProfile || ""] || "esp",
      }
      : null;
    const nextContext = diagnosticContext || baseContext || null;
    setContext(nextContext);
    if (nextContext) setProfile(nextContext.profile);
  }, []);

  const currentProfile = profileOptions.find(p => p.id === profile) || profileOptions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const message = encodeURIComponent(
      `Hola equipo de Ingeniería Greenatics, quiero agendar una sesión técnica:\n\n` +
      `*Nombre:* ${name || "No especificado"}\n` +
      `*Entidad/Empresa:* ${entity || "No especificada"}\n` +
      `*Perfil:* ${currentProfile.label}\n` +
      `*Interés:* ${context?.title || "Orientación general"}\n` +
      `*Correo:* ${email || "No especificado"}\n` +
      `*Teléfono:* ${phone || "No especificado"}\n` +
      `*Ubicación:* ${location || "No especificada"}\n` +
      `*Volumen/Escala:* ${volume || "No especificado"}\n` +
      `*Requerimiento:* ${details || "Diagnóstico y cotización técnica"}\n\n` +
      `¿Podemos coordinar fecha para una llamada de ingeniería o visita técnica a la Planta Yarumal?`
    );
    window.open(`https://wa.me/573003078822?text=${message}`, "_blank");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#ffffff",
        padding: "clamp(28px, 3vw, 40px)",
        borderRadius: "var(--radius-lg)",
        border: "1.5px solid var(--line)",
        boxShadow: "var(--shadow-md)"
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--green-700)", fontWeight: 800, display: "block", marginBottom: "4px" }}>
          Paso 01 · {context ? `Ruta: ${context.label}` : "Selecciona tu perfil"}
        </span>
        <h3 style={{ fontSize: "1.4rem", color: "var(--green-950)", margin: "0 0 14px" }}>
          {context ? "Preparemos la conversación correcta" : "Estructura tu solicitud técnica"}
        </h3>

        {context && (
          <div role="status" style={{ marginBottom: "18px", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cfe0ca", background: "#eef7e9" }}>
            <strong style={{ display: "block", color: "var(--green-950)", fontSize: "0.9rem" }}>{context.title}</strong>
            <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.5 }}>{context.copy}</p>
          </div>
        )}

        {/* Profile Selector Chips */}
        <div className="contact-profile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          {profileOptions.map((opt) => (
            <button
              key={opt.id}
              aria-pressed={profile === opt.id}
              type="button"
              onClick={() => setProfile(opt.id)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: profile === opt.id ? "1.5px solid var(--green-800)" : "1px solid var(--line)",
                background: profile === opt.id ? "#eaf5e6" : "#fafcf9",
                color: profile === opt.id ? "var(--green-950)" : "var(--muted)",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                transition: "var(--transition-fast)"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="contact-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label htmlFor="contact-name" style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
            Nombre Completo / Cargo *
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            type="text"
            className="contact-field"
            placeholder="Ej.: Ing. Carlos Restrepo…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--line)", fontSize: "0.88rem", background: "#fafcf9" }}
          />
        </div>

        <div>
          <label htmlFor="contact-entity" style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
            Entidad, Empresa o Finca *
          </label>
          <input
            id="contact-entity"
            name="organization"
            autoComplete="organization"
            required
            type="text"
            className="contact-field"
            placeholder="Ej.: Alcaldía Municipal o Agropecuaria SAS…"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--line)", fontSize: "0.88rem", background: "#fafcf9" }}
          />
        </div>
      </div>

      <div className="contact-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label htmlFor="contact-email" style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
            Correo Electrónico *
          </label>
          <input
            id="contact-email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            required
            type="email"
            className="contact-field"
            placeholder="nombre@entidad.gov.co…"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--line)", fontSize: "0.88rem", background: "#fafcf9" }}
          />
        </div>

        <div>
          <label htmlFor="contact-phone" style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
            Celular / WhatsApp *
          </label>
          <input
            id="contact-phone"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            required
            type="tel"
            className="contact-field"
            placeholder="+57 300 000 0000…"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--line)", fontSize: "0.88rem", background: "#fafcf9" }}
          />
        </div>
      </div>

      <div className="contact-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label htmlFor="contact-location" style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
            Municipio y Departamento *
          </label>
          <input
            id="contact-location"
            name="location"
            autoComplete="address-level2"
            required
            type="text"
            className="contact-field"
            placeholder="Ej.: Yarumal, Antioquia…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--line)", fontSize: "0.88rem", background: "#fafcf9" }}
          />
        </div>

        <div>
          <label htmlFor="contact-volume" style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
            Volumen o Escala Estimada
          </label>
          <input
            id="contact-volume"
            name="volume"
            type="text"
            className="contact-field"
            placeholder={currentProfile.placeholderVol}
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--line)", fontSize: "0.88rem", background: "#fafcf9" }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "22px" }}>
        <label htmlFor="contact-details" style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--green-950)", marginBottom: "4px" }}>
          Detalle del Requerimiento o Desafío Técnico:
        </label>
        <textarea
          id="contact-details"
          name="details"
          className="contact-field"
          rows={3}
          placeholder="Describe la situación actual, los plazos o la necesidad técnica de fertilización o aprovechamiento…"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--line)", fontSize: "0.88rem", background: "#fafcf9" }}
        />
      </div>

      <button
        type="submit"
        className="button button--primary"
        style={{ width: "100%", padding: "16px", fontSize: "1rem", textAlign: "center", boxShadow: "0 10px 24px rgba(0, 107, 69, 0.2)" }}
      >
        <span>Preparar mensaje y conectar con un ingeniero →</span>
      </button>
      {submitted ? (
        <p role="status" aria-live="polite" style={{ margin: "14px 0 0", color: "var(--green-800)", fontSize: "0.82rem", lineHeight: 1.5 }}>
          Abrimos WhatsApp con el resumen de tu solicitud. Revisa el mensaje antes de enviarlo.
        </p>
      ) : null}
    </form>
  );
}
