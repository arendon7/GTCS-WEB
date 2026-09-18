"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { crops } from "@/data/crops";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";

const stages = [
  { id: "arranque", name: "Establecimiento y crecimiento", product: "Wondergreen 2GROW (15-3-3)", verify: "Edad del cultivo, raíz, humedad y nutrición de base." },
  { id: "balance", name: "Balance y mantenimiento", product: "Wondergreen 2BALANCE (7-7-7)", verify: "Análisis, extracción, manejo previo y objetivo de mantenimiento." },
  { id: "floracion", name: "Transición reproductiva", product: "Wondergreen 2BLOOM (3-8-3)", verify: "Estado de floración, clima, sanidad y nutrición previa." },
  { id: "llenado", name: "Desarrollo y llenado", product: "Wondergreen 2FRUIT (3-3-8)", verify: "Carga productiva, disponibilidad de agua y respuesta del lote." },
] as const;

function Planner() {
  const searchParams = useSearchParams();
  const [selectedCrop, setSelectedCrop] = useState("cafe");
  const [hectares, setHectares] = useState(3);
  const [selectedStage, setSelectedStage] = useState<(typeof stages)[number]["id"]>("floracion");

  useEffect(() => {
    const crop = searchParams.get("crop");
    const stage = searchParams.get("stage");
    if (crop && crops.some((item) => item.slug === crop)) setSelectedCrop(crop);
    if (stage && stages.some((item) => item.id === stage)) setSelectedStage(stage as (typeof stages)[number]["id"]);
  }, [searchParams]);

  const crop = crops.find((item) => item.slug === selectedCrop) ?? crops[0];
  const stage = stages.find((item) => item.id === selectedStage) ?? stages[0];
  const waText = encodeURIComponent(
    `Hola Wondergreen, quiero preparar una recomendación para ${crop.name}.\n` +
    `Área aproximada: ${hectares} ha.\nEtapa: ${stage.name}.\n` +
    `Referencia a evaluar: ${stage.product}.\n` +
    "Quiero validar diagnóstico, dosis, presentación, disponibilidad, logística y cotización.",
  );
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent(`${crop.name} · ${stage.name}`)}&prioridad=${encodeURIComponent(`${hectares} ha · referencia a evaluar: ${stage.product}`)}`;

  return (
    <div style={{ background: "#f8faf6", color: "var(--green-950)", padding: "70px 0 90px" }}>
      <WondergreenToolTrail name="Calculadora agronómica" path="/wondergreen/calculadora/" />
      <div className="container" style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <header style={{ textAlign: "center", maxWidth: "780px", margin: "0 auto 40px" }}>
          <span className="eyebrow">Preparador de recomendación Wondergreen</span>
          <h1 style={{ fontSize: "2.5rem", margin: "8px 0 12px" }}>Organiza el lote antes de solicitar dosis y cotización.</h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>El área ayuda a dimensionar el suministro, pero no prescribe una cantidad. Esta herramienta identifica la línea por etapa y reúne la información que el equipo necesita verificar.</p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "28px", alignItems: "stretch" }}>
          <section style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1.5px solid var(--line)" }}>
            <h2 style={{ fontSize: "1.3rem", margin: "0 0 22px" }}>1. Contexto inicial</h2>
            <label style={{ display: "block", marginBottom: "20px", fontSize: "0.86rem", fontWeight: 700 }}>Cultivo<select value={selectedCrop} onChange={(event) => setSelectedCrop(event.target.value)} style={{ display: "block", width: "100%", marginTop: "8px", padding: "12px", borderRadius: "10px", border: "1px solid var(--line)", background: "#fafcf9" }}>{crops.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <label style={{ display: "block", marginBottom: "20px", fontSize: "0.86rem", fontWeight: 700 }}>Área aproximada: {hectares} ha<input type="range" min="0.5" max="50" step="0.5" value={hectares} onChange={(event) => setHectares(Number(event.target.value))} style={{ display: "block", width: "100%", marginTop: "10px", accentColor: "var(--green-700)" }} /></label>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}><legend style={{ fontSize: "0.86rem", fontWeight: 700, marginBottom: "10px" }}>Etapa principal</legend><div style={{ display: "grid", gap: "8px" }}>{stages.map((item) => <button key={item.id} type="button" onClick={() => setSelectedStage(item.id)} style={{ padding: "12px 14px", borderRadius: "10px", border: selectedStage === item.id ? "2px solid var(--green-700)" : "1px solid var(--line)", background: selectedStage === item.id ? "#eef7eb" : "#fff", textAlign: "left", fontWeight: 700, cursor: "pointer" }}>{item.name}</button>)}</div></fieldset>
          </section>

          <section style={{ background: "#0a2920", color: "#ffffff", padding: "32px", borderRadius: "24px" }}>
            <span style={{ color: "#98cf4f", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Orientación por etapa</span>
            <h2 style={{ color: "#ffffff", fontSize: "1.6rem", margin: "6px 0 6px" }}>{stage.product}</h2>
            <p style={{ color: "#c7d9d0", marginTop: 0 }}>{stage.name} en {crop.name}</p>
            <div style={{ padding: "18px", borderRadius: "14px", background: "rgba(255,255,255,.07)", margin: "20px 0" }}><strong>Información que falta verificar</strong><p style={{ color: "#bed2c7", fontSize: "0.86rem", lineHeight: 1.55, marginBottom: 0 }}>{stage.verify}</p></div>
            <ul style={{ paddingLeft: "20px", color: "#d5e3dc", fontSize: "0.86rem", lineHeight: 1.7 }}><li>Análisis de suelo, agua o tejido disponible.</li><li>Presentación y etiqueta vigentes.</li><li>Historial de aplicaciones y respuesta.</li><li>Dosis, vía, frecuencia y compatibilidades.</li><li>Disponibilidad, logística y precio final.</li></ul>
            <p style={{ color: "#9fb9ac", fontSize: "0.78rem" }}>No se calcula una cantidad automática porque dos lotes con la misma área pueden requerir programas diferentes.</p>
            <Link href={contactHref} className="button button--primary" style={{ whiteSpace: "normal", textAlign: "center" }}>Llevar esta preparación a Contacto →</Link>
            <a href={`https://wa.me/573003078822?text=${waText}`} target="_blank" rel="noopener noreferrer" className="button button--outline-light" style={{ whiteSpace: "normal", textAlign: "center", marginTop: "10px" }}>Abrir WhatsApp directo</a>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return <Suspense fallback={<div style={{ background: "#f8faf6", color: "var(--green-950)", padding: "70px 0 90px", minHeight: "60vh" }}><WondergreenToolTrail name="Calculadora agronómica" path="/wondergreen/calculadora/" /><div className="container" style={{ maxWidth: "1080px", margin: "0 auto", padding: "80px 0" }}>Preparando la calculadora agronómica…</div></div>}><Planner /></Suspense>;
}
