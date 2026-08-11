import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proyecto Yarumal",
  description: "Caso Greenatics de operación técnica, aprovechamiento y trazabilidad digital de residuos orgánicos en Yarumal, Antioquia.",
};

const capabilities = [
  ["Recepción técnica", "Inspección, descarga, almacenamiento temporal y criterios de aceptación de residuos."],
  ["Control de impropios", "Segregación y control de calidad de la corriente que entra al proceso."],
  ["Trazabilidad", "Identificación y seguimiento por lotes desde la recepción hasta el tratamiento."],
  ["Tratamiento biológico", "Procesos de compostaje y digestión anaerobia con control operativo según destino del material."],
  ["Maduración y afinado", "Estabilización, manejo, cribado y acondicionamiento de productos derivados."],
  ["Acompañamiento territorial", "Soporte a separación en la fuente, ruta selectiva, capacitación y mejora operacional."],
];

const digitalEvidence = [
  ["Secuencia conectada", "Ingreso de material → materia prima → compostaje o digestión → producto terminado → inventarios y bitácoras."],
  ["9 formularios oficiales", "Recepción, materia prima, compostaje, digestión, bitácora, producto terminado, inventarios y compras operativas."],
  ["Evidencia fotográfica", "Los registros operativos exigen soporte del dato con fotos o archivos adjuntos tomados en la operación."],
  ["Autor y momento", "Los formularios registran fecha, hora y usuario, reforzando responsabilidad y trazabilidad del registro."],
  ["Histórico auditable", "Los formularios quedan disponibles para revisión, control, auditoría interna y reportes de gestión."],
  ["Puente hacia OPS", "La nueva app interna consolida esta lógica y la convierte en una arquitectura operacional más integrada."],
];

export default function YarumalPage() {
  return (
    <>
      <section className="project-case-hero">
        <div className="container project-case-grid">
          <div><Link className="back-link" href="/proyectos/">← Proyectos</Link><span className="eyebrow">Caso Greenatics · Yarumal</span><h1>Operar bien comienza mucho antes del compostaje.</h1><p className="lead">El caso Yarumal muestra una operación que empieza controlando lo que entra, continúa con tratamiento y trazabilidad, y termina con productos, reportes y mejora continua.</p></div>
          <aside className="project-factbox"><span>Alcance público</span><p>Publicamos capacidades y metodología verificables. Balances de masa, toneladas, eficiencias y otros indicadores operativos se incorporarán con fecha de corte y validación específica.</p></aside>
        </div>
      </section>

      <section className="project-media">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Archivo visual del proyecto</span><h2>Evidencia real antes que fotografía genérica.</h2><p>Estas vistas provienen de la documentación técnica histórica del proyecto Yarumal y se identifican expresamente como archivo; no se presentan como registro fotográfico del estado actual.</p></div>
          <div className="project-media-grid">
            <figure><img src="/projects/yarumal/aerial-01.webp" alt="Vista aérea de archivo del predio del proyecto Yarumal" width="420" height="236" /><figcaption>Vista aérea de archivo del predio/proyecto Yarumal. Fuente: documentación técnica Greenatics.</figcaption></figure>
            <figure><img src="/projects/yarumal/aerial-02.webp" alt="Segunda vista aérea de archivo del predio del proyecto Yarumal" width="420" height="236" /><figcaption>Vista aérea de archivo del predio/proyecto Yarumal. Fuente: documentación técnica Greenatics.</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="project-case-section"><div className="container"><div className="section-heading"><span className="eyebrow">Qué demuestra este caso</span><h2>Una planta es un sistema de operación.</h2></div><div className="project-cap-grid">{capabilities.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="project-case-section route-section"><div className="container"><div className="section-heading"><span className="eyebrow">Trazabilidad digital documentada</span><h2>El residuo deja una huella de información durante todo el proceso.</h2></div><div className="project-cap-grid">{digitalEvidence.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="validation-note"><strong>Datos de impacto:</strong> los registros operativos existentes son internos y varían por periodo. No se exponen como cifras permanentes hasta pasar por el contrato de publicación de GREENATICS OPS.</div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Aplicar el método</span><h2>¿Necesitas estructurar o fortalecer una operación similar?</h2></div><Link className="button button--dark" href="/contacto/">Solicitar diagnóstico</Link></div></section>
    </>
  );
}
