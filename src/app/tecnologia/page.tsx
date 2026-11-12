import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tecnología, biorefinería y plantas",
  description: "Tecnología Greenatics para FORSU: compostaje, digestión anaerobia multietapa, biogás, biol, fertilizantes organominerales, cierre de ciclos y trazabilidad digital.",
  alternates: { canonical: "/tecnologia/" },
};

const anaerobicStages = [
  ["01", "Hidrólisis y acidogénesis", "La fracción sólida entra a un reactor de lixiviación/percolación. La materia orgánica soluble se moviliza hacia una fase líquida y se generan compuestos intermedios."],
  ["02", "Percolado y transferencia", "El líquido rico en materia orgánica conecta la primera etapa con la etapa metanogénica. Caudales, carga y características del percolado se convierten en variables de operación."],
  ["03", "Metanogénesis", "La fase líquida puede tratarse en un reactor anaerobio tipo UASB, donde comunidades metanogénicas convierten parte de la carga orgánica en biogás."],
  ["04", "Recirculación", "Parte del efluente o biol puede recircularse hacia la etapa de hidrólisis para favorecer la extracción por percolación y mantener una lógica de proceso integrada."],
  ["05", "Control operacional", "pH, relación AGV/alcalinidad, DQO, sólidos, carga orgánica, tiempos de retención y producción de biogás son ejemplos de variables que permiten entender estabilidad y desempeño."],
];

const outputs = [
  ["Compost y acondicionadores", "Fracciones sólidas estabilizadas y acondicionadas para rutas agrícolas, sujetas a especificación y control de calidad."],
  ["Biol", "Efluente líquido proveniente de la digestión que puede convertirse en insumo para formulación o manejo posterior según su caracterización."],
  ["Fertilizantes organominerales", "Formulaciones que combinan matrices orgánicas recuperadas con nutrientes minerales para objetivos agronómicos definidos."],
  ["Biogás", "Mezcla gaseosa rica en metano generada durante la digestión anaerobia, con potencial de aprovechamiento energético cuando el balance del proyecto lo justifica."],
  ["Información de proceso", "Balances de masa, parámetros, mantenimiento y trazabilidad que permiten aprender, estandarizar y mejorar."],
];

const delivery = [
  ["Prefactibilidad", "Caracterización, suministro, alternativas, escala, implantación, salidas, CAPEX/OPEX preliminar y riesgos."],
  ["Factibilidad e ingeniería", "Balances, procesos, equipos, servicios auxiliares, APU/quantities según alcance, layout y criterios operacionales."],
  ["Implementación", "Construcción o adecuación, integración de módulos, procedimientos, seguridad y formación."],
  ["Puesta en marcha", "Arranque controlado, estabilización, capacitación, control de variables y resolución de desviaciones."],
  ["Operación y estandarización", "Programación, POE, mantenimiento, calidad, inventarios, indicadores y mejora continua."],
];

export default function TechnologyPage() {
  return (
    <div className="technology-v5">
      <section className="tech-hero tech-hero--depth"><div className="container tech-hero-grid"><div><h1>Tecnología para tratar orgánicos y sostener la operación.</h1><p className="lead">Greenatics integra caracterización, ingeniería, puesta en marcha y acompañamiento operativo. La ruta se define según la composición y continuidad de la corriente, la escala del proyecto y el destino de sus salidas.</p><div className="button-row"><Link className="button button--primary" href="#proceso-anaerobio">Entender el proceso</Link><Link className="button button--ghost" href="#caso-tamesis">Ver el caso Támesis</Link></div></div><figure className="tech-process-figure tech-process-figure--editorial" aria-labelledby="tech-process-map-caption"><div className="tech-process-figure__visual"><Image alt="Comparación de dos rutas para tratar residuos orgánicos: compostaje abierto y digestión anaerobia en un recipiente cerrado." fill priority sizes="(max-width: 980px) 100vw, 46vw" src="/technology/organic-treatment-routes-concept.jpg" /></div><figcaption id="tech-process-map-caption">Compostaje y digestión anaerobia son rutas distintas; la corriente y las condiciones del proyecto orientan cuál conviene estudiar.</figcaption><div className="tech-route-notes"><article><span>Ruta aeróbica</span><h2>Compostaje</h2><p>Estabilización de fracciones sólidas; sus usos dependen de la calidad y el control del proceso.</p></article><article><span>Ruta anaerobia</span><h2>Digestión multietapa</h2><p>Hidrólisis, transferencia de percolado y metanogénesis; biogás y efluentes requieren manejo.</p></article></div></figure></div></section>

      <section className="anaerobic-deep" id="proceso-anaerobio"><div className="container"><div className="section-heading"><span className="eyebrow eyebrow--light">Digestión anaerobia multietapa</span><h2>Separar etapas ayuda a entender qué ocurre en cada fase.</h2><p>El trabajo técnico asociado a Greenatics y al GIEM–Universidad de Antioquia plantea hidrólisis/acidogénesis en fase sólida y metanogénesis en fase líquida. La configuración, dimensiones y propiedad intelectual se definen para cada proyecto y conforme a los acuerdos con la Universidad.</p></div><div className="anaerobic-stage-list">{anaerobicStages.map(([number,title,copy])=><article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

      <section className="gt-tech-case-proof" id="caso-tamesis">
        <div className="container gt-tech-case-proof__grid">
          <div className="gt-tech-case-proof__visual">
            <figure className="gt-tech-case-proof__main"><Image alt="Reactor anaerobio UASB de 30 m³ instalado en Támesis" fill sizes="(max-width: 900px) 100vw, 55vw" src="/projects/tamesis/reactor-uasb.jpeg" /><figcaption><span>Digestión anaerobia · Támesis</span><strong>Reactor UASB de 30 m³</strong></figcaption></figure>
          </div>
          <div className="gt-tech-case-proof__copy">
            <span className="eyebrow">Tecnología en territorio</span>
            <h2>Támesis permite ver la arquitectura anaerobia como un sistema completo.</h2>
            <p>La operación reúne recepción, molienda, dos reactores de hidrólisis, tanque pulmón, reactor UASB, manejo de efluente, filtros, medición, almacenamiento de biogás y aprovechamiento energético.</p>
            <dl>
              <div><dt>Materia</dt><dd>Entradas, impropios, sólidos, líquidos y productos.</dd></div>
              <div><dt>Biología</dt><dd>Hidrólisis, digestión, estabilidad y calidad de corrientes.</dd></div>
              <div><dt>Energía</dt><dd>Producción, captura, acondicionamiento y uso del biogás.</dd></div>
              <div><dt>Operación</dt><dd>Bitácora, activos, consumos, incidentes y decisiones.</dd></div>
            </dl>
            <Link className="button button--dark" href="/proyectos/tamesis/">Explorar el caso Támesis</Link>
          </div>
        </div>
      </section>

      <section className="tech-output-section"><div className="container tech-output-layout"><div className="tech-output-intro"><span className="eyebrow">Salidas por caracterizar</span><h2>Qué puede salir del proceso depende de la corriente y su calidad.</h2><p>La valorización no se define por catálogo: se revisan composición, requisitos, destino y capacidad de operación antes de elegir una ruta.</p></div><div className="tech-output-grid">{outputs.map(([title,copy])=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="science-section"><div className="container science-grid"><div><span className="eyebrow eyebrow--light">Ciencia aplicada</span><h2>Empresa, territorio y conocimiento académico conectados.</h2><p>Parte del desarrollo tecnológico de sistemas FORSU se ha realizado en trabajo conjunto con el Grupo Interdisciplinario de Estudios Moleculares —GIEM— de la Universidad de Antioquia.</p><div className="button-row"><a className="button button--outline-light" href="https://www.udea.edu.co/giem" target="_blank" rel="noreferrer">Ver GIEM en UdeA ↗</a></div></div><div className="science-facts">{[
          ["1992", "Trayectoria GIEM", "La Universidad de Antioquia reporta la creación del grupo y su trabajo interdisciplinario en investigación básica y aplicada."],
          ["A1", "Reconocimiento institucional", "El directorio de grupos de investigación de la UdeA identifica al GIEM con código COL0007462 y clasificación A1."],
          ["LB0000152021", "Registro ICA del laboratorio", "Servicios de Extensión GIEM reporta este registro para control de calidad de fertilizantes, acondicionadores de suelo y reguladores fisiológicos."],
          ["Biomasa residual", "Línea de investigación", "El directorio de la UdeA incluye su aprovechamiento energético y material entre las líneas del grupo."],
        ].map(([value, title, copy]) => <article key={title}><div><span>{value}</span><strong>{title}</strong></div><p>{copy}</p></article>)}</div></div><div className="science-boundary-note"><strong>Alcance de la relación</strong><p>Greenatics puede integrar conocimiento, experiencia de campo y resultados de proyectos desarrollados con la Universidad; esto no significa que Greenatics sea propietaria de los diseños, equipos o propiedad intelectual que correspondan a la UdeA/GIEM. Cada proyecto, licencia y transferencia tecnológica conserva sus acuerdos específicos.</p></div></section>

      <section className="tech-delivery"><div className="container"><div className="section-heading"><span className="eyebrow">De la idea a la operación</span><h2>La ingeniería termina cuando la operación puede sostener el proceso.</h2></div><ol className="tech-delivery-list">{delivery.map(([title,copy],index)=><li key={title}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Diseño responsable</span><h2>Antes de dimensionar un reactor, dimensionemos correctamente el flujo que debe tratar.</h2></div><Link className="button button--dark" href="/contacto/?servicio=prefactibilidad">Solicitar prefactibilidad</Link></div></section>
    </div>
  );
}
