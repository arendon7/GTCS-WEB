import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Empresas y grandes generadores",
  description: "Soluciones Greenatics para aprovechar residuos orgánicos, diseñar rutas de gestión y convertir la operación en información trazable.",
};

const segments = [
  ["Alimentos", "Residuos de proceso, descartes orgánicos y corrientes aprovechables."],
  ["Hoteles y restaurantes", "Separación, recolección, aprovechamiento y trazabilidad de orgánicos."],
  ["Pecuario", "Corrientes orgánicas con potencial de compostaje, digestión y valorización."],
  ["Cárnicos", "Diagnóstico y diseño de soluciones según características y restricciones de la corriente."],
  ["Paisajismo", "Gestión de podas y biomasa con rutas de aprovechamiento y retorno al suelo."],
  ["Operadores de aseo", "Esquemas de aprovechamiento, rutas selectivas, plantas y soporte operativo."],
];

export default function CompaniesPage() {
  return (
    <>
      <section className="solution-hero solution-hero--dark">
        <div className="container solution-hero-grid">
          <div>
            <span className="eyebrow eyebrow--light">Empresas y grandes generadores</span>
            <h1>Gestionar residuos es mejor cuando también genera valor y datos.</h1>
            <p className="lead">Greenatics diseña soluciones desde la caracterización de la corriente hasta su recolección, tratamiento, valorización y trazabilidad.</p>
            <div className="button-row"><Link className="button button--light" href="/contacto/">Solicitar diagnóstico</Link><Link className="button button--outline-light" href="/proyectos/">Ver experiencia</Link></div>
          </div>
          <aside className="solution-proof">
            <span className="eyebrow eyebrow--light">Enfoque</span>
            <strong>No todos los residuos necesitan la misma solución.</strong>
            <p>Primero entendemos origen, volumen, calidad, frecuencia, impropios, logística y destino. Después definimos el sistema.</p>
          </aside>
        </div>
      </section>

      <section className="segment-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Sectores priorizados</span><h2>Diseñamos alrededor del generador.</h2></div>
          <div className="segment-grid">{segments.map(([title, copy], index) => <article className="segment-card" key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p><strong>Diagnóstico → solución → trazabilidad</strong></article>)}</div>
        </div>
      </section>

      <section className="solution-flow">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Ruta Greenatics</span><h2>De la corriente residual al resultado.</h2></div>
          <ol className="solution-flow-list">
            <li><span>01</span><strong>Caracterizar</strong><small>Qué se genera, cuánto, dónde y con qué calidad.</small></li>
            <li><span>02</span><strong>Diseñar</strong><small>Separación, logística, tratamiento y destino.</small></li>
            <li><span>03</span><strong>Implementar</strong><small>Protocolos, infraestructura y operación.</small></li>
            <li><span>04</span><strong>Valorizar</strong><small>Compostaje, digestión u otras rutas técnicamente aplicables.</small></li>
            <li><span>05</span><strong>Medir</strong><small>Recepción, trazabilidad, productos e indicadores.</small></li>
          </ol>
        </div>
      </section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Primer paso</span><h2>Muéstranos tu corriente residual y construimos la ruta adecuada.</h2></div><Link className="button button--dark" href="/contacto/">Hablar con Greenatics</Link></div></section>
    </>
  );
}
