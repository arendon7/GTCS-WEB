"use client";

import React, { useState } from "react";
import Link from "next/link";

interface DiagnosticResult {
  product: string;
  formula: string;
  badge: string;
  color: string;
  bgLight: string;
  headline: string;
  description: string;
  application: string;
  recommendedKit: string;
  kitHref: string;
  waMessage: string;
}

const diagnosticMatrix: Record<string, DiagnosticResult> = {
  crece: {
    product: "Wondergreen 2GROW",
    formula: "15-3-3 Organomineral",
    badge: "Etapa: Crecimiento & Brotación",
    color: "#e65100",
    bgLight: "#fff3e0",
    headline: "La etapa observada es compatible con una orientación hacia crecimiento vegetativo.",
    description: "2GROW está orientado a acompañar establecimiento, brotación y crecimiento. Antes de aplicarlo conviene revisar humedad, drenaje, tamaño de maceta y condición general de la planta.",
    application: "Confirma la dosis y la frecuencia en la etiqueta vigente o con orientación técnica según presentación, especie y volumen de sustrato.",
    recommendedKit: "Plantas Verdes",
    kitHref: "/casa-jardin/kits/plantas-verdes/",
    waMessage: "Hola Wondergreen, hice el diagnóstico para mi planta en brotación y quiero pedir el Kit Plantas Verdes (CRECE + EQUILIBRA)."
  },
  equilibra: {
    product: "Wondergreen 2BALANCE",
    formula: "7-7-7 Organomineral",
    badge: "Etapa: Mantenimiento & Sostenimiento",
    color: "#6a1b9a",
    bgLight: "#f3e5f5",
    headline: "La etapa observada es compatible con una orientación de nutrición balanceada.",
    description: "2BALANCE está orientado al mantenimiento nutricional. La selección final debe considerar especie, sustrato, riego, exposición y aplicaciones previas.",
    application: "Usa únicamente la dosis, frecuencia y vía indicadas en la etiqueta vigente o en una recomendación técnica para tu caso.",
    recommendedKit: "Plantas Verdes",
    kitHref: "/casa-jardin/kits/plantas-verdes/",
    waMessage: "Hola Wondergreen, hice el diagnóstico para mi planta estable y quiero pedir el Kit de Mantenimiento EQUILIBRA."
  },
  florece: {
    product: "Wondergreen 2BLOOM",
    formula: "3-8-3 Organomineral",
    badge: "Etapa: Inducción Floral & Botones",
    color: "#1565c0",
    bgLight: "#e3f2fd",
    headline: "La etapa observada es compatible con una orientación hacia transición reproductiva.",
    description: "2BLOOM está orientado a acompañar la etapa de floración. La respuesta depende también de luz, temperatura, riego, sanidad y condición radicular.",
    application: "Confirma la aplicación en la etiqueta vigente y evita ajustar frecuencia solo por la presencia de flores o botones.",
    recommendedKit: "Plantas con Flor",
    kitHref: "/casa-jardin/kits/plantas-con-flor/",
    waMessage: "Hola Wondergreen, mi planta está sacando botones/flores y quiero pedir el Kit Plantas con Flor (FLORECE)."
  },
  fructifica: {
    product: "Wondergreen 2FRUIT",
    formula: "3-3-8 Organomineral",
    badge: "Etapa: Cuajado & Llenado de Fruto",
    color: "#c62828",
    bgLight: "#ffebee",
    headline: "La etapa observada es compatible con una orientación hacia desarrollo y llenado.",
    description: "2FRUIT está orientado a acompañar la fase productiva. El programa debe considerar carga de frutos, especie, disponibilidad de agua y nutrición previa.",
    application: "Valida dosis y frecuencia según etiqueta, presentación y condiciones de la huerta; esta orientación no reemplaza esa verificación.",
    recommendedKit: "Mi Huerta",
    kitHref: "/casa-jardin/kits/mi-huerta/",
    waMessage: "Hola Wondergreen, mis plantas tienen frutos/huerta activa y quiero pedir el Kit Mi Huerta en Casa (FRUCTIFICA + COMPOST)."
  },
  compost: {
    product: "Wondergreen Compost",
    formula: "Acondicionador 100% Orgánico",
    badge: "Etapa: Regeneración de Suelo / Trasplante",
    color: "#2e7d32",
    bgLight: "#e8f5e9",
    headline: "La situación observada sugiere revisar primero la condición física y orgánica del sustrato.",
    description: "El compost puede contribuir al aporte de materia orgánica y al acondicionamiento del sustrato cuando su uso es compatible con la especie y el drenaje.",
    application: "Define la proporción con la etiqueta vigente y el volumen de la maceta; en trasplantes, verifica además aireación y drenaje de la mezcla.",
    recommendedKit: "Mi Huerta o Compost",
    kitHref: "/casa-jardin/kits/mi-huerta/",
    waMessage: "Hola Wondergreen, necesito regenerar la tierra de mis macetas y quiero pedir Wondergreen Compost Vivo."
  }
};

const potSizes = [
  { id: "S", label: "Pequeña (S)", diameter: "10 – 15 cm", volume: "1 – 3 Litros", examples: "Suculentas, violetas y potos pequeños" },
  { id: "M", label: "Mediana (M)", diameter: "16 – 25 cm", volume: "4 – 8 Litros", examples: "Anturios, sansevierias y tomate cherry" },
  { id: "L", label: "Grande (L)", diameter: "26 – 40 cm", volume: "10 – 25 Litros", examples: "Monstera, ficus y cítricos enanos" },
  { id: "XL", label: "Jardinera / XL", diameter: "> 40 cm", volume: "> 30 Litros", examples: "Arbustos de balcón y jardineras de huerta" }
];

export function CasaJardinInteractive() {
  // Diagnostic State
  const [plantType, setPlantType] = useState<string>("verdes");
  const [plantStage, setPlantStage] = useState<string>("brotes");
  const [plantHealth, setPlantHealth] = useState<string>("sana");
  const [potSizeSelect, setPotSizeSelect] = useState<string>("M");

  // Determine diagnostic result
  const isSafetyGateTriggered = plantHealth === "estresada" || plantHealth === "encharcada" || plantHealth === "plaga";

  let resultKey = "equilibra";
  if (plantStage === "brotes") resultKey = "crece";
  else if (plantStage === "flores") resultKey = "florece";
  else if (plantStage === "fruto") resultKey = "fructifica";
  else if (plantStage === "trasplante") resultKey = "compost";
  else resultKey = "equilibra";

  const result = diagnosticMatrix[resultKey];
  const selectedPot = potSizes.find((p) => p.id === potSizeSelect) || potSizes[1];
  const contactHref = isSafetyGateTriggered
    ? `/contacto/?interes=casa-jardin&perfil=hogar&diagnostico=${encodeURIComponent("Orientación para recuperar una planta doméstica")}&prioridad=${encodeURIComponent(`${plantHealth} · ${plantStage} · maceta ${selectedPot.label} · ${selectedPot.volume}`)}`
    : `/contacto/?interes=casa-jardin&perfil=hogar&diagnostico=${encodeURIComponent(`Orientación sobre ${result.product}`)}&prioridad=${encodeURIComponent(`${plantType} · ${plantStage} · ${plantHealth} · ${selectedPot.label} · ${result.recommendedKit}`)}`;

  return (
    <div style={{ marginTop: "40px" }}>
      {/* ========================================================= */}
      {/* 1. DIAGNÓSTICO INTERACTIVO: ¿QUÉ NECESITA TU PLANTA?     */}
      {/* ========================================================= */}
      <section style={{ background: "#ffffff", borderRadius: "24px", padding: "clamp(24px, 4vw, 48px)", border: "1.5px solid var(--line)", boxShadow: "var(--shadow-md)", marginBottom: "70px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto 36px", textAlign: "center" }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--green-700)", background: "#eaf5e6", padding: "6px 14px", borderRadius: "999px", display: "inline-block", marginBottom: "12px" }}>
            Orientador botánico inicial
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)", color: "var(--green-950)", margin: "0 0 10px", lineHeight: 1.2 }}>
            Identifica una línea compatible con la etapa de tu planta
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: 0 }}>
            Responde tres preguntas para recibir una orientación inicial. El resultado no diagnostica la causa de un síntoma ni reemplaza la etiqueta o una recomendación técnica.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "36px" }}>
          {/* Pregunta 1 */}
          <div style={{ background: "#f8faf6", border: "1.5px solid var(--line)", borderRadius: "16px", padding: "20px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "var(--green-900)", marginBottom: "12px" }}>
              1. ¿Qué tipo de planta tienes?
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { id: "verdes", label: "🌿 Plantas verdes / follaje (Monsteras, potos)" },
                { id: "flores", label: "🌸 Plantas con flor / orquídeas" },
                { id: "huerta", label: "🍅 Huerta casera / aromáticas / frutos" },
                { id: "mixto", label: "🏡 Varias plantas diferentes en casa" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlantType(opt.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: plantType === opt.id ? "2px solid var(--green-700)" : "1.5px solid var(--line)",
                    background: plantType === opt.id ? "#eaf5e6" : "#ffffff",
                    color: plantType === opt.id ? "var(--green-950)" : "var(--ink-soft)",
                    fontWeight: plantType === opt.id ? 700 : 500,
                    fontSize: "0.86rem",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pregunta 2 */}
          <div style={{ background: "#f8faf6", border: "1.5px solid var(--line)", borderRadius: "16px", padding: "20px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "var(--green-900)", marginBottom: "12px" }}>
              2. ¿Qué está haciendo ahora?
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { id: "brotes", label: "🌱 Sacando hojas nuevas o brotes" },
                { id: "estable", label: "⚖️ Estable / mantenimiento rutinario" },
                { id: "flores", label: "🌸 Formando botones o flores abiertas" },
                { id: "fruto", label: "🍅 Formando o llenando frutos" },
                { id: "trasplante", label: "🪴 Recién trasplantada / cambio de tierra" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlantStage(opt.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: plantStage === opt.id ? "2px solid var(--green-700)" : "1.5px solid var(--line)",
                    background: plantStage === opt.id ? "#eaf5e6" : "#ffffff",
                    color: plantStage === opt.id ? "var(--green-950)" : "var(--ink-soft)",
                    fontWeight: plantStage === opt.id ? 700 : 500,
                    fontSize: "0.86rem",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pregunta 3 */}
          <div style={{ background: "#f8faf6", border: "1.5px solid var(--line)", borderRadius: "16px", padding: "20px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "var(--green-900)", marginBottom: "12px" }}>
              3. ¿Cuál es su estado de salud?
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { id: "sana", label: "✅ Activa, verde y saludable" },
                { id: "estresada", label: "⚠️ Puntas secas o crecimiento lento" },
                { id: "encharcada", label: "🚨 Sustrato encharcado / tierra dura" },
                { id: "plaga", label: "🐛 Hojas amarillas con plaga o manchas" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlantHealth(opt.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: plantHealth === opt.id ? (isSafetyGateTriggered ? "2px solid #d32f2f" : "2px solid var(--green-700)") : "1.5px solid var(--line)",
                    background: plantHealth === opt.id ? (isSafetyGateTriggered ? "#ffebee" : "#eaf5e6") : "#ffffff",
                    color: plantHealth === opt.id ? (isSafetyGateTriggered ? "#c62828" : "var(--green-950)") : "var(--ink-soft)",
                    fontWeight: plantHealth === opt.id ? 700 : 500,
                    fontSize: "0.86rem",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de Resultado / Safety Gate */}
        {isSafetyGateTriggered ? (
          <div style={{ background: "#fff8e1", border: "2px solid #ffb300", borderRadius: "18px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "2rem" }}>🛑</span>
              <div>
                <strong style={{ fontSize: "1.15rem", color: "#b78103", display: "block" }}>
                  Pausa la fertilización y revisa primero la causa
                </strong>
                <span style={{ fontSize: "0.86rem", color: "#795548" }}>
                  El estrés, el encharcamiento, las manchas o la presencia de insectos pueden tener causas distintas. Agregar nutrientes sin revisar el problema puede aumentar el daño.
                </span>
              </div>
            </div>
            <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #ffe082" }}>
              <strong style={{ fontSize: "0.9rem", color: "var(--green-950)", display: "block", marginBottom: "6px" }}>
                Qué hacer antes de nutrir:
              </strong>
              <ol style={{ margin: 0, paddingLeft: "20px", fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
                <li><strong>Revisa el drenaje:</strong> Asegúrate de que la maceta tenga orificios libres y la tierra no esté lodosa.</li>
                <li><strong>Deja secar:</strong> Espera a que los primeros 3 cm de tierra estén secos al tacto antes de volver a regar.</li>
                <li><strong>Observa antes de tratar:</strong> Registra dónde aparece el síntoma y consulta antes de usar un producto de control.</li>
                <li><strong>Retoma la nutrición después:</strong> Cuando la causa esté identificada y la planta se estabilice, revisa la línea y la dosis adecuadas.</li>
              </ol>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href={contactHref}
                className="button button--primary"
                style={{ maxWidth: "100%", padding: "12px 24px", fontSize: "0.9rem", whiteSpace: "normal", textAlign: "center" }}
              >
                Llevar fotos y contexto a Contacto →
              </Link>
              <a
                href={`https://wa.me/573003078822?text=${encodeURIComponent("Hola Wondergreen, mi planta está estresada/encharcada y quiero enviarles una foto para que me ayuden a recuperarla.")}`}
              target="_blank"
              rel="noopener noreferrer"
                style={{ color: "#8a6200", fontWeight: 800, textDecoration: "underline", padding: "8px 2px" }}
              >
                Validar por WhatsApp directo
              </a>
            </div>
          </div>
        ) : (
          <div style={{ background: result.bgLight, border: `2px solid ${result.color}`, borderRadius: "18px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", background: result.color, color: "#ffffff", padding: "4px 12px", borderRadius: "999px", display: "inline-block", marginBottom: "6px" }}>
                  {result.badge}
                </span>
                <h3 style={{ fontSize: "1.45rem", color: "var(--green-950)", margin: 0 }}>
                  {result.product} · <span style={{ fontWeight: 500, fontSize: "1.1rem" }}>{result.formula}</span>
                </h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>Kit sugerido:</span>
                <Link href={result.kitHref} style={{ fontSize: "1rem", color: "var(--green-900)", fontWeight: 800, textDecoration: "underline", textUnderlineOffset: "3px" }}>{result.recommendedKit} →</Link>
              </div>
            </div>

            <p style={{ fontSize: "0.98rem", color: "var(--green-950)", fontWeight: 600, margin: "0 0 10px" }}>
              {result.headline}
            </p>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-soft)", margin: "0 0 16px", lineHeight: 1.55 }}>
              {result.description}
            </p>

            <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.08)", marginBottom: "20px" }}>
              <strong style={{ fontSize: "0.84rem", color: "var(--green-900)", display: "block", marginBottom: "4px" }}>
                Criterio para definir la aplicación:
              </strong>
              <p style={{ fontSize: "0.84rem", color: "var(--ink-soft)", margin: 0 }}>
                {result.application}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href={contactHref}
                className="button button--primary"
                style={{ maxWidth: "100%", padding: "14px 28px", fontSize: "0.95rem", whiteSpace: "normal", textAlign: "center" }}
              >
                Llevar orientación a Contacto →
              </Link>
              <a
                href={`https://wa.me/573003078822?text=${encodeURIComponent(result.waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.86rem", color: "var(--green-800)", fontWeight: 700, textDecoration: "underline", padding: "8px 12px" }}
              >
                Consultar por WhatsApp directo
              </a>
              <a
                href="#calculadora"
                style={{ fontSize: "0.86rem", color: "var(--green-800)", fontWeight: 700, textDecoration: "underline", padding: "8px 12px" }}
              >
                Revisar criterios según la maceta ↓
              </a>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 2. ORIENTADOR POR TAMAÑO DE MACETA                       */}
      {/* ========================================================= */}
      <section id="calculadora" style={{ background: "#f8faf6", borderRadius: "24px", padding: "clamp(24px, 4vw, 48px)", border: "1.5px solid var(--line)", marginBottom: "70px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto 32px", textAlign: "center" }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--green-700)", background: "#eaf5e6", padding: "6px 14px", borderRadius: "999px", display: "inline-block", marginBottom: "12px" }}>
            Criterios de aplicación doméstica
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "var(--green-950)", margin: "0 0 10px" }}>
            El tamaño de la maceta es una variable, no una receta completa
          </h2>
          <p style={{ fontSize: "0.92rem", color: "var(--muted)", margin: 0 }}>
            La especie, el volumen de sustrato, su humedad, el drenaje, la etapa y la presentación del producto cambian la aplicación. Verifica siempre la etiqueta vigente.
          </p>
        </div>

        {/* Selector de Tamaño */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "28px" }}>
          {potSizes.map((pot) => (
            <button
              key={pot.id}
              type="button"
              onClick={() => setPotSizeSelect(pot.id)}
              style={{
                padding: "16px 12px",
                borderRadius: "14px",
                border: potSizeSelect === pot.id ? "2px solid var(--green-700)" : "1.5px solid var(--line)",
                background: potSizeSelect === pot.id ? "#ffffff" : "#f1f5f0",
                boxShadow: potSizeSelect === pot.id ? "var(--shadow-sm)" : "none",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <strong style={{ fontSize: "1rem", color: potSizeSelect === pot.id ? "var(--green-900)" : "var(--ink-soft)", display: "block", marginBottom: "4px" }}>
                {pot.label}
              </strong>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                Diámetro: {pot.diameter}
              </span>
            </button>
          ))}
        </div>

        {/* Detalle de la Maceta Seleccionada */}
        <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "18px", padding: "28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          <div>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: "4px" }}>
              Volumen y Ejemplos:
            </span>
            <strong style={{ fontSize: "1.1rem", color: "var(--green-950)", display: "block", marginBottom: "4px" }}>
              {selectedPot.volume}
            </strong>
            <p style={{ fontSize: "0.84rem", color: "var(--ink-soft)", margin: 0 }}>
              {selectedPot.examples}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--green-700)", fontWeight: 800, display: "block", marginBottom: "4px" }}>
              Orientación preliminar:
            </span>
            <strong style={{ fontSize: "1.1rem", color: "var(--green-900)", display: "block", marginBottom: "4px" }}>
              Confirmar en etiqueta
            </strong>
            <p style={{ fontSize: "0.84rem", color: "var(--ink-soft)", margin: 0 }}>
              Usa el volumen de sustrato y la condición de la planta para solicitar una recomendación ajustada.
            </p>
          </div>

          <div>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700, display: "block", marginBottom: "4px" }}>
              Frecuencia:
            </span>
            <strong style={{ fontSize: "1.1rem", color: "var(--green-950)", display: "block", marginBottom: "4px" }}>
              Depende de producto y especie
            </strong>
            <p style={{ fontSize: "0.84rem", color: "var(--ink-soft)", margin: 0 }}>
              No repitas una aplicación sin revisar humedad, respuesta y etiqueta.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. LOS 4 PASOS DEL MÉTODO WONDERGREEN CASA               */}
      {/* ========================================================= */}
      <section style={{ background: "linear-gradient(145deg, #07261d 0%, #03150f 100%)", color: "#ffffff", borderRadius: "24px", padding: "clamp(32px, 5vw, 60px)", marginBottom: "70px" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto 40px", textAlign: "center" }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--lime-400)", display: "inline-block", marginBottom: "10px" }}>
            Protocolo Botánico Wondergreen
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#ffffff", margin: "0 0 12px" }}>
            No es solo qué aplicas. También importa cómo.
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#cbdcd3", margin: 0 }}>
            Cuatro comprobaciones sencillas para aplicar con más criterio y observar la respuesta de la planta.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {[
            { step: "01", title: "HUMEDECE", desc: "Trabaja con humedad adecuada y buen drenaje; no fertilices una planta encharcada o severamente estresada." },
            { step: "02", title: "VERIFICA", desc: "Consulta la etiqueta de la presentación vigente y ajusta únicamente con orientación técnica." },
            { step: "03", title: "DISTRIBUYE EN LA ZONA RADICULAR", desc: "Distribuye alrededor de la zona radicular y evita acumular producto contra el tallo." },
            { step: "04", title: "OBSERVA", desc: "Registra la fecha y revisa humedad, color, brotación y señales de estrés antes de repetir." },
          ].map((s) => (
            <div key={s.step} style={{ background: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "16px", padding: "24px" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--lime-400)", display: "block", marginBottom: "8px" }}>
                {s.step}
              </span>
              <strong style={{ fontSize: "1.1rem", color: "#ffffff", display: "block", marginBottom: "6px" }}>
                {s.title}
              </strong>
              <p style={{ fontSize: "0.84rem", color: "#a8c7b8", margin: 0, lineHeight: 1.55 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
