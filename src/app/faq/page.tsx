"use client";

import React, { useState } from "react";
import Link from "next/link";

interface FaqItem {
  q: string;
  a: string;
  cat: "wondergreen" | "organizaciones" | "hogar";
}

const faqs: FaqItem[] = [
  { q: "¿Cómo se elige una línea Wondergreen?", cat: "wondergreen", a: "Primero se define el objetivo y la etapa: compost para la matriz orgánica del suelo; 2GROW para establecimiento y crecimiento; 2BALANCE para mantenimiento; 2BLOOM para transición reproductiva; y 2FRUIT para fase productiva. La selección final requiere revisar suelo, agua, cultivo, manejo y etiqueta vigente." },
  { q: "¿Una herramienta web puede definir la dosis?", cat: "wondergreen", a: "No por sí sola. El área y la etapa ayudan a preparar un escenario, pero la dosis, vía, frecuencia y compatibilidad deben validarse con análisis, contexto del lote, presentación y documentación vigente." },
  { q: "¿Puedo mezclar productos Wondergreen en el mismo tanque?", cat: "wondergreen", a: "No debe asumirse compatibilidad por pertenecer a la misma marca. Consulta las fichas vigentes y realiza una prueba de jarra; las referencias microbiológicas requieren especial cuidado frente a productos que puedan afectar su viabilidad." },
  { q: "¿Cuánto tarda una planta Greenatics?", cat: "organizaciones", a: "El plazo depende de estudios, permisos, ingeniería, contratación, obra, equipos, puesta en marcha y capacidad local. La prefactibilidad organiza estas variables antes de comprometer un cronograma." },
  { q: "¿Greenatics puede operar una planta existente?", cat: "organizaciones", a: "Sí. Greenatics puede asumir una operación integral, compartir responsabilidades con la entidad o prestar dirección y continuidad técnica. El contrato define personal, turnos, proceso, mantenimiento, datos, informes y responsabilidades." },
  { q: "¿GREENATICS OPS reemplaza el reporte regulatorio?", cat: "organizaciones", a: "OPS organiza pesajes, recepciones, lotes, actividades, inventarios e indicadores. Ayuda a preparar evidencia y exportables, pero la entidad responsable debe revisar, conciliar y presentar la información conforme al requisito aplicable." },
  { q: "¿Los productos son seguros para mascotas?", cat: "hogar", a: "No debe afirmarse seguridad universal sin revisar la etiqueta de la referencia. Mantén productos y material recién aplicado fuera del alcance de niños y animales, sigue las precauciones vigentes y consulta ante una exposición accidental." },
  { q: "¿Cada cuánto debo nutrir mis plantas de interior?", cat: "hogar", a: "No existe una frecuencia única. Cambia con especie, tamaño de maceta, sustrato, luz, riego, estación, etapa y producto. Usa la etiqueta vigente y observa la respuesta antes de repetir." }
];

export default function FaqPage() {
  const [activeCat, setActiveCat] = useState<string>("todos");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filtered = faqs.filter(f => activeCat === "todos" || f.cat === activeCat);

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <div className="container" style={{ maxWidth: "920px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Centro de Ayuda & Respuestas Técnicas</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Preguntas Frecuentes (FAQ)
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            Respuestas detalladas a las dudas más habituales de agricultores, municipios, empresas y amantes de las plantas.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "36px", flexWrap: "wrap" }}>
          {[
            { id: "todos", label: "Todas las Preguntas" },
            { id: "wondergreen", label: "🌾 Wondergreen & Agro" },
            { id: "organizaciones", label: "🏛️ Municipios & Empresas" },
            { id: "hogar", label: "🏡 Casa & Jardín" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCat(tab.id)}
              style={{
                padding: "8px 18px",
                borderRadius: "999px",
                border: activeCat === tab.id ? "2px solid var(--green-800)" : "1px solid var(--line)",
                background: activeCat === tab.id ? "#eaf5e6" : "#ffffff",
                color: activeCat === tab.id ? "var(--green-950)" : "var(--muted)",
                fontWeight: 700,
                fontSize: "0.86rem",
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.q}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid var(--line)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(0, 107, 69, 0.02)"
                }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  <strong style={{ fontSize: "1.05rem", color: "var(--green-950)", paddingRight: "16px" }}>
                    {item.q}
                  </strong>
                  <span style={{ fontSize: "1.2rem", color: "var(--green-800)", fontWeight: 800 }}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 24px 20px", borderTop: "1px solid #f0f4ed", paddingTop: "14px" }}>
                    <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--muted)", lineHeight: 1.65 }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
