import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Municipios y ESP", description: "Soluciones Greenatics para gestión y aprovechamiento de residuos orgánicos en municipios y prestadores de servicios públicos." };

const capabilities = [
  ["Diagnóstico", "Caracterización, línea base, brechas y definición de la solución."],
  ["Planeación", "PGIRS, dimensionamiento, rutas, microrrutas y modelo operativo."],
  ["Infraestructura", "Diseño, adecuación, plantas de compostaje, biodigestión y equipamiento."],
  ["Puesta en marcha", "Protocolos, capacitación, acompañamiento y estabilización operacional."],
  ["Operación", "Procesos, mantenimiento, control de calidad y aprovechamiento."],
  ["Datos", "Trazabilidad, indicadores, bitácoras digitales y dashboards de gestión."],
];

export default function MunicipiosPage() {
  return (
    <>
      <section className="municipal-hero"><div className="container municipal-grid"><div><span className="eyebrow eyebrow--light">Greenatics para municipios y ESP</span><h1>De la obligación de gestionar residuos a una operación que funciona.</h1><p className="lead">Integramos diagnóstico, infraestructura, operación, producto y datos para convertir la fracción orgánica en aprovechamiento trazable.</p><div className="button-row"><Link className="button button--light" href="/contacto/">Solicitar diagnóstico</Link><a className="button button--outline-light" href="#ruta">Ver metodología</a></div></div><div className="municipal-stat"><span>Modelo integral</span><strong>Planear → operar → medir</strong><p>Una sola arquitectura desde la fuente hasta el producto y el indicador.</p></div></div></section>

      <section className="capabilities"><div className="container"><div className="section-heading"><span className="eyebrow">Capacidad Greenatics</span><h2>No vendemos solamente una planta.</h2><p>Diseñamos el sistema que permite que esa infraestructura tenga entradas, operación, control y resultados.</p></div><div className="capability-grid">{capabilities.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="route-section" id="ruta"><div className="container"><div className="section-heading"><span className="eyebrow">Ruta de proyecto</span><h2>Del territorio al dato.</h2></div><ol className="route-list"><li><strong>Entender</strong><span>Generación, actores, infraestructura, costos y restricciones.</span></li><li><strong>Diseñar</strong><span>Flujos, capacidades, rutas, planta, personal y modelo económico.</span></li><li><strong>Implementar</strong><span>Infraestructura, procedimientos, formación y puesta en marcha.</span></li><li><strong>Operar</strong><span>Recepción, procesos, mantenimiento, calidad y producción.</span></li><li><strong>Medir</strong><span>Indicadores, trazabilidad, alertas y mejora continua.</span></li></ol></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Prefactibilidad</span><h2>Antes de comprar infraestructura, entendamos qué necesita realmente el municipio.</h2></div><Link className="button button--dark" href="/contacto/">Solicitar reunión técnica</Link></div></section>
    </>
  );
}
