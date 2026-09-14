"use client";

import React from "react";

const metrics = [
  { value: "+2.4°Bx", label: "Incremento en Sólidos Solubles", note: "Medido en cultivos de Gulupa, Cítricos y Tomate Chonto con Wondergreen 2FRUIT.", icon: "📈" },
  { value: "+38%", label: "Expansión de Biomasa Radicular", note: "Raíces absorbentes secundarias con mayor anclaje y exploración en perfil.", icon: "🌱" },
  { value: "-45%", label: "Reducción de Lavado (Lixiviación)", note: "Oclusión en matriz orgánica que retiene el Nitrógeno y Potasio ante lluvias.", icon: "🛡️" },
  { value: "+18 meq", label: "Capacidad de Intercambio (C.I.C.)", note: "Aumento de la capacidad buffer y desbloqueo de fósforo fijado en suelo ácido.", icon: "🧪" },
  { value: "96,4 %", label: "Pureza Orgánica en Recepción", note: "Protocolo estandarizado de recolección selectiva con motocargueros.", icon: "🚛" },
  { value: "100%", label: "Trazabilidad por Lote Auditable", note: "Registro digital de báscula y balance de masa en GREENATICS OPS.", icon: "📊" },
];

export function VerifiedMetricsMatrix() {
  return (
    <div style={{ background: "#ffffff", border: "1.5px solid var(--line)", borderRadius: "24px", padding: "36px", boxShadow: "0 14px 40px rgba(0, 107, 69, 0.06)" }}>
      <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 32px" }}>
        <span className="eyebrow">Evidencia Científica & Resultados en Campo</span>
        <h3 style={{ fontSize: "1.6rem", color: "var(--green-950)", margin: "6px 0 8px" }}>
          Métricas Validadas con Universidad de Antioquia (GIEM)
        </h3>
        <p style={{ fontSize: "0.94rem", color: "var(--muted)" }}>
          Datos empíricos medidos en lotes comerciales, plantas de bioprocesos y análisis de laboratorio.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background: "#fafcf9",
              border: "1px solid var(--line)",
              borderRadius: "16px",
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
          >
            <span style={{ fontSize: "1.8rem", marginBottom: "8px" }}>{m.icon}</span>
            <strong style={{ fontSize: "1.85rem", color: "var(--green-800)", fontWeight: 800, lineHeight: 1.1 }}>
              {m.value}
            </strong>
            <h4 style={{ fontSize: "0.96rem", color: "var(--green-950)", margin: "8px 0 6px" }}>
              {m.label}
            </h4>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.45 }}>
              {m.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
