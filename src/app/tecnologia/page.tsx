import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tecnología y plantas",
  description: "Arquitectura Greenatics para recepción, compostaje, digestión anaerobia, fertilizantes, biogás y trazabilidad digital.",
};

const modules = [
  ["Recepción y control", "Pesaje, inspección, clasificación, rechazo, evidencia y trazabilidad desde el origen."],
  ["Compostaje", "Tratamiento aeróbico, control operativo, maduración, afinado y acondicionamiento de fracciones sólidas."],
  ["Digestión anaerobia", "Valorización de corrientes orgánicas mediante procesos anaerobios y manejo de coproductos."],
  ["Biogás", "Aprovechamiento energético como componente posible del sistema cuando la corriente, escala y balance lo justifican."],
  ["Fertilizantes", "Transformación y acondicionamiento de fracciones sólidas y líquidas para rutas agrícolas sujetas a control de calidad y requisitos regulatorios."],
  ["Trazabilidad digital", "Registros por etapa, evidencias, históricos, inventarios, bitácoras, mantenimiento e indicadores conectados a GREENATICS OPS."],
];

const delivery = [
  ["Prefactibilidad", "Demanda, residuos, actores, infraestructura, alternativas, CAPEX/OPEX y brechas críticas."],
  ["Ingeniería", "Flujos, capacidades, equipos, implantación, servicios, seguridad y lógica operacional."],
  ["Implementación", "Construcción, adecuación, integración de equipos, procedimientos y formación."],
  ["Puesta en marcha", "Arranque controlado, estabilización, capacitación y protocolos de operación."],
  ["Operación y mejora", "Bitácoras, mantenimiento, calidad, alertas, inventarios, trazabilidad y optimización."],
];

export default function TechnologyPage() {
  return (
    <>
      <section className="tech-hero">
        <div className="container tech-hero-grid">
          <div>
            <span className="eyebrow">Tecnología Greenatics</span>
            <h1>La tecnología no empieza con la máquina. Empieza entendiendo el residuo.</h1>
            <p className="lead">Diseñamos sistemas multietapa que combinan tratamiento biológico, productos de valor y control digital. La configuración final depende de la corriente, la escala, el territorio y el objetivo del proyecto.</p>
            <div className="button-row"><Link className="button button--primary" href="/contacto/">Evaluar un proyecto</Link><Link className="button button--ghost" href="/proyectos/">Ver experiencia</Link></div>
          </div>
          <div className="tech-system" aria-label="Arquitectura tecnológica Greenatics">
            <div className="tech-core"><img src="/brand/greenatics-symbol.svg" alt="" /></div>
            <span className="tech-node tech-node-1">Residuo</span>
            <span className="tech-node tech-node-2">Compostaje</span>
            <span className="tech-node tech-node-3">Digestión</span>
            <span className="tech-node tech-node-4">Productos</span>
            <span className="tech-node tech-node-5">Datos</span>
          </div>
        </div>
      </section>

      <section className="tech-modules">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Arquitectura modular</span><h2>Una solución puede combinar varias rutas.</h2><p>La selección tecnológica se hace después de caracterizar material, volúmenes, continuidad de suministro, espacio, servicios, costos y destino de los productos.</p></div>
          <div className="tech-module-grid">{modules.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="tech-principle">
        <div className="container tech-principle-grid">
          <div><span className="eyebrow eyebrow--light">Principio de diseño</span><h2>Compostaje y digestión no compiten: pueden cumplir funciones distintas dentro del mismo sistema.</h2></div>
          <div><p>La documentación de ingeniería Greenatics contempla sistemas multietapa para aprovechamiento material y energético de FORSU. La web no convierte capacidades de diseños históricos en promesas estándar: cada proyecto se dimensiona nuevamente.</p><Link href="/municipios/">Ver enfoque para municipios →</Link></div>
        </div>
      </section>

      <section className="tech-delivery">
        <div className="container"><div className="section-heading"><span className="eyebrow">De la idea a la operación</span><h2>No entregamos solamente equipos.</h2></div><ol className="tech-delivery-list">{delivery.map(([title, copy], index) => <li key={title}><span>{String(index + 1).padStart(2,"0")}</span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol></div>
      </section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Diseño responsable</span><h2>Antes de dimensionar una planta, dimensionemos correctamente el problema.</h2></div><Link className="button button--dark" href="/contacto/">Solicitar prefactibilidad</Link></div></section>
    </>
  );
}
