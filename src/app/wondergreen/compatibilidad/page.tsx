"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";

interface InputItem {
  id: string;
  name: string;
  category: "wondergreen" | "bioinsumo" | "quimico" | "cobre";
  phRange: string;
}

const availableInputs: InputItem[] = [
  { id: "wg-solid", name: "Wondergreen Sólido (2GROW / 2BALANCE / 2BLOOM / 2FRUIT)", category: "wondergreen", phRange: "6.0 - 7.5" },
  { id: "wg-biol", name: "Wondergreen Biol Fermentado (Líquido)", category: "bioinsumo", phRange: "5.5 - 6.8" },
  { id: "tricho", name: "Consorcio Trichoderma & Micorrizas (Biológico)", category: "bioinsumo", phRange: "5.5 - 7.0" },
  { id: "bacillus", name: "Bacillus subtilis / thuringiensis (Biológico)", category: "bioinsumo", phRange: "6.0 - 7.2" },
  { id: "cobre", name: "Fungicida Cúprico (Oxicloruro / Sulfato de Cobre)", category: "cobre", phRange: "7.0 - 8.5" },
  { id: "calcio", name: "Nitrato de Calcio Soluble", category: "quimico", phRange: "5.0 - 6.0" },
  { id: "aceite", name: "Aceite Agrícola / Extracto de Neem", category: "bioinsumo", phRange: "6.0 - 7.0" },
  { id: "mancozeb", name: "Mancozeb / Fungicida Químico de Contacto", category: "quimico", phRange: "6.5 - 7.5" }
];

export default function CompatibilidadPage() {
  const [selected, setSelected] = useState<string[]>(["wg-biol", "tricho"]);

  const toggleInput = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) {
        setSelected(selected.filter(i => i !== id));
      }
    } else {
      setSelected([...selected, id]);
    }
  };

  const hasCobre = selected.includes("cobre");
  const hasBioinsumo = selected.some(i => i === "tricho" || i === "bacillus" || i === "wg-biol");
  const hasCalcioAndSolid = selected.includes("calcio") && selected.includes("wg-solid");

  let status = "compatible";
  let warningTitle = "Sin alerta en la matriz preliminar";
  let warningDesc = "La combinación seleccionada no activa una alerta en esta matriz preliminar. Confirma siempre las fichas vigentes, la etiqueta y la prueba de jarra antes de preparar el tanque.";

  if (hasCobre && hasBioinsumo) {
    status = "incompatible";
    warningTitle = "Alerta de incompatibilidad biológica";
    warningDesc = "La combinación activa una alerta porque los productos cúpricos pueden afectar microorganismos vivos como Trichoderma, Bacillus y bioles. Separa las aplicaciones y confirma el intervalo en la etiqueta y con orientación técnica.";
  } else if (hasCalcioAndSolid) {
    status = "precaucion";
    warningTitle = "Alerta de mezcla física";
    warningDesc = "La combinación requiere validación porque el calcio puede reaccionar con fosfatos y sulfatos concentrados y formar precipitados. Confirma la secuencia, dilución y prueba de jarra antes de incorporar los productos al tanque.";
  }

  const selectedNames = availableInputs.filter((item) => selected.includes(item.id)).map((item) => item.name).join(" · ");
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent("Compatibilidad de mezcla en tanque")}&prioridad=${encodeURIComponent(`${selectedNames} · estado preliminar: ${status}`)}`;

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <WondergreenToolTrail name="Compatibilidad de mezclas" path="/wondergreen/compatibilidad/" />
      <div className="container" style={{ maxWidth: "1050px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Ingeniería de Mezclas & Drench</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Matriz de Compatibilidad de Mezclas en Tanque
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            Verifica la compatibilidad física y biológica de Wondergreen y bioinsumos con otros agroquímicos antes de preparar tu caneca o equipo de aspersión.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: "32px", alignItems: "flex-start" }}>
          {/* Product Selectors */}
          <div style={{ background: "#ffffff", padding: "32px", borderRadius: "24px", border: "1.5px solid var(--line)", boxShadow: "0 12px 36px rgba(0, 107, 69, 0.05)" }}>
            <h3 style={{ fontSize: "1.3rem", color: "var(--green-950)", margin: "0 0 16px" }}>
              1. Selecciona los productos a mezclar:
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {availableInputs.map((item) => {
                const isChecked = selected.includes(item.id);
                return (
                  <label
                    key={item.id}
                    onClick={() => toggleInput(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: isChecked ? "2px solid var(--green-800)" : "1px solid var(--line)",
                      background: isChecked ? "#eef7eb" : "#fafcf9",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ accentColor: "var(--green-800)", width: "18px", height: "18px" }}
                    />
                    <div>
                      <strong style={{ fontSize: "0.9rem", color: "var(--green-950)", display: "block" }}>{item.name}</strong>
                      <small style={{ fontSize: "0.74rem", color: "var(--muted)" }}>Rango pH: {item.phRange}</small>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Results Box */}
          <div style={{ background: "#0a2920", color: "#ffffff", padding: "36px", borderRadius: "24px", border: "1.5px solid rgba(255, 255, 255, 0.15)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#98cf4f", fontWeight: 800 }}>
                Resultado de la matriz preliminar
              </span>
              <span style={{
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "0.78rem",
                fontWeight: 800,
                background: status === "compatible" ? "rgba(152, 207, 79, 0.25)" : "rgba(255, 107, 107, 0.25)",
                color: status === "compatible" ? "#98cf4f" : "#ff8787"
              }}>
                {status === "compatible" ? "Sin alerta preliminar" : status === "precaucion" ? "Requiere validación" : "Alerta de incompatibilidad"}
              </span>
            </div>

            <h3 style={{ fontSize: "1.5rem", color: "#ffffff", margin: "0 0 12px" }}>
              {warningTitle}
            </h3>

            <p style={{ fontSize: "0.92rem", color: "#cbdcd3", lineHeight: 1.6, margin: "0 0 24px" }}>
              {warningDesc}
            </p>

            <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.15)", marginBottom: "24px" }}>
              <strong style={{ fontSize: "0.86rem", color: "#98cf4f", display: "block", marginBottom: "8px" }}>
                Secuencia de referencia a validar:
              </strong>
              <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "0.82rem", color: "#cbdcd3", lineHeight: 1.6 }}>
                <li>Llenar el tanque con 70% del agua y corregir dureza/pH (5.8 - 6.5).</li>
                <li>Disolver primero polvos mojables o Wondergreen sólido.</li>
                <li>Incorporar productos líquidos emulsionables.</li>
                <li>Agregar los <strong>bioinsumos vivos (Trichoderma / Bioles)</strong> al final bajo agitación suave, solo si la etiqueta y la prueba de jarra lo permiten.</li>
              </ol>
            </div>

            <Link className="button button--light" href={contactHref} style={{ width: "100%", justifyContent: "center", marginBottom: "10px", color: "var(--green-950)" }}>Llevar matriz a Contacto →</Link>
            <a
              href="https://wa.me/573003078822?text=Hola%20Greenatics%2C%20tengo%20una%20duda%20t%C3%A9cnica%20sobre%20la%20compatibilidad%20de%20mezcla%20de%20Wondergreen%20para%20mi%20cultivo"
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
              <span>💬</span>
              <span>Consultar con un Ingeniero Agrónomo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
