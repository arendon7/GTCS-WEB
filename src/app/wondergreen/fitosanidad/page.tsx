"use client";

import { useState } from "react";
import Link from "next/link";

const routes = [
  { crop: "Café", focus: "Frutos, hojas, tallos y raíces", observe: "Distribución por lote, incidencia, severidad, estado del fruto, historial de manejo y relación con lluvias o floración." },
  { crop: "Aguacate Hass", focus: "Raíz, cuello, follaje y frutos", observe: "Drenaje, raíces absorbentes, focos de decaimiento, heridas, humedad del suelo y avance espacial de los síntomas." },
  { crop: "Cacao", focus: "Mazorcas, cojines florales y arquitectura", observe: "Edad de lesiones, frutos afectados por estrato, sombra, ventilación, remoción sanitaria y evolución semanal." },
  { crop: "Cítricos", focus: "Brotaciones, hojas nuevas, frutos y tronco", observe: "Edad del brote, patrón del daño, presencia de insectos o signos, vigor, cobertura y antecedentes del lote." },
  { crop: "Pastos", focus: "Macolla, base, raíces y cobertura", observe: "Nivel de infestación, humedad, rotación, altura antes y después del pastoreo y recuperación por franjas." },
  { crop: "Hortalizas", focus: "Plántula, raíz, follaje, flor y fruto", observe: "Velocidad de avance, distribución, riego, ventilación, conductividad, daños mecánicos y síntomas fisiológicos." },
] as const;

export default function FitosanidadPage() {
  const [filter, setFilter] = useState("Todos");
  const visible = filter === "Todos" ? routes : routes.filter((route) => route.crop === filter);

  return (
    <main style={{ background: "#f7faf5", padding: "60px 0 80px", color: "var(--green-950)" }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        <header style={{ maxWidth: 820, margin: "0 auto 34px", textAlign: "center" }}>
          <span className="eyebrow">Manejo integrado y trazable</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)", margin: "10px 0 14px" }}>Del síntoma observado a una decisión fitosanitaria responsable</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.65, fontSize: "1.04rem" }}>
            Una fotografía o el nombre común de un problema no bastan para asignar un bioinsumo. Greenatics organiza la observación, la confirmación diagnóstica, la selección regulatoria y el seguimiento dentro de una ruta de manejo integrado.
          </p>
        </header>

        <section style={{ background: "#0a2920", color: "#fff", borderRadius: 24, padding: "clamp(26px, 4vw, 38px)", marginBottom: 30 }}>
          <span style={{ color: "#98cf4f", fontWeight: 800, fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".1em" }}>Ruta de decisión</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginTop: 16 }}>
            {[
              ["1. Delimitar", "Cultivo, órgano, lote, distribución, incidencia, severidad y velocidad de avance."],
              ["2. Confirmar", "Diferenciar plaga, patógeno, fisiopatía, nutrición, clima o daño de aplicación."],
              ["3. Seleccionar", "Revisar uso autorizado, etiqueta vigente, compatibilidad, calidad y condiciones de aplicación."],
              ["4. Verificar", "Definir indicador, testigo o referencia, fecha de lectura, registro y criterio de ajuste."],
            ].map(([title, text]) => <article key={title} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 14, padding: 17 }}><strong style={{ color: "#fff" }}>{title}</strong><p style={{ color: "#c9d9d1", fontSize: ".82rem", lineHeight: 1.5, margin: "7px 0 0" }}>{text}</p></article>)}
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
          {["Todos", ...routes.map((route) => route.crop)].map((crop) => <button type="button" key={crop} onClick={() => setFilter(crop)} style={{ padding: "9px 15px", borderRadius: 999, border: filter === crop ? "2px solid var(--green-700)" : "1px solid var(--line)", background: filter === crop ? "#eaf5e6" : "#fff", color: "var(--green-950)", fontWeight: 750 }}>{crop}</button>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
          {visible.map((route) => (
            <article key={route.crop} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 20, padding: 26, boxShadow: "var(--shadow-sm)" }}>
              <span style={{ color: "var(--green-700)", fontWeight: 800, fontSize: ".74rem", textTransform: "uppercase", letterSpacing: ".08em" }}>{route.focus}</span>
              <h2 style={{ fontSize: "1.35rem", margin: "8px 0 10px" }}>{route.crop}</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.58, fontSize: ".88rem", minHeight: 84 }}>{route.observe}</p>
              <Link href={`/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent(`Situación fitosanitaria en ${route.crop}`)}&prioridad=${encodeURIComponent(route.observe)}`} style={{ display: "inline-flex", color: "var(--green-800)", fontWeight: 800, textDecoration: "none", borderBottom: "1px solid currentColor" }}>Llevar consulta a Contacto →</Link>
            </article>
          ))}
        </div>

        <aside style={{ marginTop: 30, background: "#fff8e8", border: "1px solid #ead6a7", borderRadius: 18, padding: "20px clamp(20px, 4vw, 30px)", color: "#634510" }}>
          <strong>Sobre el portafolio biológico</strong>
          <p style={{ margin: "7px 0 0", lineHeight: 1.55, fontSize: ".88rem" }}>Greenatics puede evaluar alternativas microbianas, botánicas, culturales, físicas y nutricionales. La web no vincula automáticamente un organismo, extracto o fertilizante con una plaga o enfermedad: cada uso debe contrastarse con diagnóstico, registro, etiqueta, calidad del producto y condiciones del sistema.</p>
        </aside>
      </div>
    </main>
  );
}
