"use client";

import React, { useState } from "react";
import Link from "next/link";

const profiles = [
  {
    id: "esp",
    icon: "🏛️",
    title: "Municipio o Empresa de Servicios Públicos (ESP)",
    need: "Cumplimiento PGIRS, desvío de relleno sanitario, microrrutas en motocarguero y planta de aprovechamiento modular.",
    route: "/soluciones",
    pdf: "/downloads/catalogo-wondergreen.pdf",
    cta: "Ver Soluciones para Organizaciones"
  },
  {
    id: "empresa",
    icon: "🏢",
    title: "Empresa o Gran Generador (PMIRS / Casino / Industria)",
    need: "Manejo integral de residuos orgánicos, certificado de aprovechamiento SUI y reducción de huella de carbono.",
    route: "/soluciones",
    pdf: "/downloads/catalogo-wondergreen.pdf",
    cta: "Ver Esquema PMIRS para Empresas"
  },
  {
    id: "agro",
    icon: "🌾",
    title: "Agricultor o Productor Agrícola (12 Cultivos)",
    need: "Nutrición organomineral con oclusión, recuperación de suelos y programas agronómicos por cultivo.",
    route: "/wondergreen/calculadora",
    pdf: "/downloads/catalogo-wondergreen.pdf",
    cta: "Preparar recomendación agronómica"
  },
  {
    id: "hogar",
    icon: "🏡",
    title: "Casa, Jardín, Vivero o Huerta Doméstica",
    need: "Cuidado de plantas de interior, huertas urbanas, trasplante seguro y kits de nutrición por etapas.",
    route: "/casa-jardin",
    pdf: "/downloads/guia-casa-jardin.pdf",
    cta: "Explorar Casa & Jardín"
  },
];

export default function DiagnosticoPage() {
  const [selectedId, setSelectedId] = useState<string>("agro");
  const current = profiles.find(p => p.id === selectedId) || profiles[0];
  const contactHref = `/contacto/?interes=diagnostico&perfil=${encodeURIComponent(current.id)}&diagnostico=${encodeURIComponent(current.title)}&prioridad=${encodeURIComponent(current.need)}`;

  return (
    <div style={{ padding: "60px 0", background: "#f7faf5" }}>
      <div className="container" style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 40px" }}>
          <span className="eyebrow">Orientador Inteligente Greenatics</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Identifica el mejor punto de entrada para tu necesidad
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.6 }}>
            Selecciona tu perfil y te guiaremos directamente a la oferta técnica, recursos y acompañamiento que corresponden a tu caso.
          </p>
        </div>

        {/* Profile Options Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "32px" }}>
          {profiles.map((p) => {
            const isSelected = selectedId === p.id;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                style={{
                  padding: "20px 14px",
                  borderRadius: "16px",
                  border: isSelected ? "2px solid var(--green-700)" : "1px solid var(--line)",
                  background: isSelected ? "#ffffff" : "#fafcf9",
                  cursor: "pointer",
                  textAlign: "center",
                  boxShadow: isSelected ? "0 10px 28px rgba(0, 107, 69, 0.12)" : "none",
                  transform: isSelected ? "translateY(-3px)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>{p.icon}</span>
                <strong style={{ fontSize: "0.86rem", color: "var(--green-950)", display: "block", lineHeight: 1.3 }}>
                  {p.title.split("(")[0]}
                </strong>
              </button>
            );
          })}
        </div>

        {/* Result Card */}
        <div style={{ background: "#0a2920", color: "#ffffff", padding: "36px", borderRadius: "24px", border: "1.5px solid rgba(255, 255, 255, 0.15)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)" }}>
          <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#98cf4f", fontWeight: 800 }}>
            Diagnóstico Asignado
          </span>
          <h3 style={{ fontSize: "1.8rem", color: "#ffffff", margin: "6px 0 12px" }}>
            {current.title}
          </h3>
          <p style={{ color: "#cbdcd3", fontSize: "1.02rem", lineHeight: 1.6, marginBottom: "28px" }}>
            {current.need}
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <Link
              href={current.route}
              className="button button--primary"
              style={{ padding: "14px 24px", fontSize: "0.95rem" }}
            >
              {current.cta} →
            </Link>
            <Link
              href={contactHref}
              className="button button--outline-light"
              style={{ padding: "14px 24px", fontSize: "0.95rem" }}
            >
              Hablar con ingeniería →
            </Link>
            <a
              href={current.pdf}
              download
              className="button button--outline"
              style={{ padding: "14px 24px", fontSize: "0.95rem", color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.3)" }}
            >
              Descargar Guía Oficial en PDF ↓
            </a>
          </div>
          <p style={{ color: "#b9cec2", fontSize: "0.82rem", lineHeight: 1.55, margin: "18px 0 0", maxWidth: "720px" }}>
            Si todavía no tienes todos los datos, no hay problema: cuéntanos qué quieres resolver y usaremos esta ruta como punto de partida para definir el siguiente paso técnico.
          </p>
        </div>
      </div>
    </div>
  );
}
