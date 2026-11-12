"use client";

import React, { useState } from "react";

const plantImages = [
  { src: "/projects/plant/plant-evidence-04.webp", caption: "Pilas de compostaje bajo cubierta en el archivo fotográfico de Yarumal; no representan necesariamente la configuración actual." },
];

const routeImages = [
  { src: "/projects/tamesis/reactor-uasb.jpeg", caption: "Registro fotográfico del reactor UASB en Támesis; la imagen no representa por sí sola el desempeño del sistema." },
];

export function GalleryEvidence() {
  const [tab, setTab] = useState<"plant" | "routes">("plant");
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const images = tab === "plant" ? plantImages : routeImages;
  const current = images[selectedIdx] || images[0];

  return (
    <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "24px", padding: "32px", boxShadow: "0 16px 40px rgba(0, 107, 69, 0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <span className="eyebrow">Referencias visuales documentadas</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "1.4rem", color: "var(--green-950)" }}>Archivo de proyecto y esquema técnico</h3>
        </div>
        <div style={{ display: "flex", gap: "8px", background: "rgba(0, 107, 69, 0.08)", padding: "4px", borderRadius: "999px" }}>
          <button
            type="button"
            onClick={() => { setTab("plant"); setSelectedIdx(0); }}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.86rem",
              cursor: "pointer",
              background: tab === "plant" ? "var(--green-800)" : "transparent",
              color: tab === "plant" ? "#ffffff" : "var(--muted)",
              transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease"
            }}
          >
            Archivo de Yarumal
          </button>
          <button
            type="button"
            onClick={() => { setTab("routes"); setSelectedIdx(0); }}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.86rem",
              cursor: "pointer",
              background: tab === "routes" ? "var(--green-800)" : "transparent",
              color: tab === "routes" ? "#ffffff" : "var(--muted)",
              transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease"
            }}
          >
            Esquema de Támesis
          </button>
        </div>
      </div>

      {/* Main Showcase Image */}
      <div style={{ position: "relative", width: "100%", height: "420px", borderRadius: "18px", overflow: "hidden", background: "#14352c" }}>
        <img
          src={current.src}
          alt={current.caption}
          width={1600}
          height={1067}
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s ease" }}
        />
        <div style={{ position: "absolute", bottom: 0, insetInline: 0, padding: "20px 24px", background: "linear-gradient(to top, rgba(10, 41, 32, 0.9) 0%, transparent 100%)", color: "#ffffff" }}>
          <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#98cf4f", fontWeight: 800 }}>
            {tab === "plant" ? "Archivo técnico · Yarumal" : "Esquema de proceso · Támesis"}
          </span>
          <p style={{ margin: "4px 0 0", fontSize: "0.95rem", color: "#ffffff", fontWeight: 600 }}>{current.caption}</p>
        </div>
      </div>

      {/* Thumbnails Row */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${images.length}, 1fr)`, gap: "10px", marginTop: "14px" }}>
        {images.map((img, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              type="button"
              key={img.src}
              onClick={() => setSelectedIdx(idx)}
              style={{
                height: "72px",
                borderRadius: "10px",
                overflow: "hidden",
                border: isSelected ? "3px solid var(--green-700)" : "1px solid var(--line)",
                padding: 0,
                cursor: "pointer",
                opacity: isSelected ? 1 : 0.65,
                transition: "opacity 0.2s ease, border-color 0.2s ease"
              }}
            >
              <img src={img.src} alt={`Miniatura: ${img.caption}`} width={1600} height={1067} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
