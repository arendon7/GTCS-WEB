"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CheckItem {
  id: string;
  title: string;
  norma: string;
  desc: string;
}

const checkItems: CheckItem[] = [
  { id: "c1", title: "Sistema de pesaje con control metrológico documentado", norma: "Validar marco aplicable", desc: "Registro de peso bruto, tara y neto por viaje, con identificación del equipo y soportes de verificación o calibración." },
  { id: "c2", title: "Control y bitácora de la fase termófila", norma: "Criterio según proceso y marco aplicable", desc: "Registros de tiempo y temperatura para sustentar el control del proceso y la verificación de calidad." },
  { id: "c3", title: "Balance de materia por lote o periodo", norma: "Criterio de trazabilidad", desc: "Conciliación documentada entre entradas, inventarios, rechazos, pérdidas de proceso y productos obtenidos." },
  { id: "c4", title: "Manejo documentado de aguas y lixiviados", norma: "Validar permiso y diseño", desc: "Infraestructura, operación, contingencias y registros coherentes con las condiciones reales de la planta." },
  { id: "c5", title: "Plan de muestreo y caracterización", norma: "Según producto y destino", desc: "Parámetros, frecuencia, laboratorio y criterios de aceptación definidos según el material y su uso previsto." },
  { id: "c6", title: "Preparación y revisión de información reportable", norma: "Según prestador y actividad", desc: "Responsables, fuentes, cortes, soportes y control de calidad antes de cualquier cargue oficial." },
];

export default function AuditoriaSuiPage() {
  const [checked, setChecked] = useState<string[]>(["c1", "c2"]);

  const toggleCheck = (id: string) => {
    if (checked.includes(id)) {
      setChecked(checked.filter(i => i !== id));
    } else {
      setChecked([...checked, id]);
    }
  };

  const score = Math.round((checked.length / checkItems.length) * 100);

  const waAuditMsg = encodeURIComponent(
    `Hola Greenatics. Completé una revisión preliminar de preparación documental para una planta municipal. Marqué ${checked.length} de ${checkItems.length} capacidades como disponibles y quiero validar el alcance, el marco aplicable y los soportes antes de definir brechas o acciones.`
  );
  const selectedCapabilities = checkItems
    .filter((item) => checked.includes(item.id))
    .map((item) => item.title)
    .join(" · ");
  const contactHref = `/contacto/?interes=solucion&perfil=municipio&diagnostico=${encodeURIComponent("Auditoría SUI y preparación de soportes")}&prioridad=${encodeURIComponent(`${checked.length}/${checkItems.length} capacidades marcadas · ${score}% · ${selectedCapabilities || "Sin capacidades marcadas"}`)}`;

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <div className="container" style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Preparación documental y operativa</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Revisión preliminar para reportabilidad y control
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            Identifica qué capacidades y soportes están disponibles antes de una revisión formal. El resultado no certifica cumplimiento ni sustituye la validación jurídica, tarifaria, ambiental o técnica del caso.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", alignItems: "flex-start" }}>
          <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1.5px solid var(--line)", boxShadow: "0 12px 36px rgba(0, 107, 69, 0.05)" }}>
            <h3 style={{ fontSize: "1.25rem", color: "var(--green-950)", margin: "0 0 16px" }}>
              Capacidades para revisar
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {checkItems.map((item) => {
                const isDone = checked.includes(item.id);
                return (
                  <label
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "14px",
                      border: isDone ? "1.5px solid var(--green-800)" : "1px solid var(--line)",
                      background: isDone ? "#f0f8ec" : "#fafcf9",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      style={{ accentColor: "var(--green-800)", width: "18px", height: "18px", marginTop: "2px" }}
                    />
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                        <strong style={{ fontSize: "0.92rem", color: "var(--green-950)" }}>{item.title}</strong>
                        <span style={{ fontSize: "0.7rem", color: "var(--green-800)", background: "#eaf5e6", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          {item.norma}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.45 }}>
                        {item.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ background: "#0a2920", color: "#ffffff", padding: "36px", borderRadius: "24px", border: "1.5px solid rgba(255, 255, 255, 0.15)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#98cf4f", fontWeight: 800 }}>
                Avance de la lista preliminar
              </span>
              <span style={{ background: "rgba(152, 207, 79, 0.2)", color: "#98cf4f", padding: "4px 12px", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 800 }}>
                {score}%
              </span>
            </div>

            <h3 style={{ fontSize: "1.6rem", color: "#ffffff", margin: "0 0 12px" }}>
              {checked.length} de {checkItems.length} capacidades marcadas
            </h3>

            <p style={{ fontSize: "0.9rem", color: "#cbdcd3", lineHeight: 1.6, margin: "0 0 20px" }}>
              Este porcentaje solo resume tus respuestas. Para convertirlo en un diagnóstico se deben verificar evidencias, responsables, periodicidad, calidad del dato y normas aplicables al prestador, la actividad y el territorio.
            </p>

            <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.15)", marginBottom: "24px" }}>
              <strong style={{ fontSize: "0.84rem", color: "#98cf4f", display: "block", marginBottom: "6px" }}>
                ¿Cómo ayuda GREENATICS OPS?
              </strong>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbdcd3", lineHeight: 1.5 }}>
                Integra captura de pesajes, bitácoras y seguimiento por lote para reducir reprocesos y preparar información que debe revisarse antes del reporte SUI.
              </p>
            </div>

            <Link
              href={contactHref}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "16px 24px",
                background: "#98cf4f",
                color: "#073319",
                borderRadius: "14px",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none",
                marginBottom: "10px"
              }}
            >
              Llevar revisión a Contacto →
            </Link>
            <a
              href={`https://wa.me/573003078822?text=${waAuditMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                width: "100%",
                padding: "16px 24px",
                background: "#25D366",
                color: "#073319",
                borderRadius: "14px",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none"
              }}
            >
              <span>Validar por WhatsApp directo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
