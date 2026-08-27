import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tecnología, biorefinería y plantas",
  description: "Tecnología Greenatics para FORSU: compostaje, digestión anaerobia multietapa, biogás, biol, fertilizantes organominerales, cierre de ciclos y trazabilidad digital.",
  alternates: { canonical: "/tecnologia/" },
};

const principles = [
  ["Caracterizar antes de diseñar", "La composición, humedad, impropios, carga orgánica, continuidad y escala determinan qué procesos tienen sentido."],
  ["Separar funciones biológicas", "En sistemas anaerobios multietapa, distintas comunidades microbianas pueden trabajar en condiciones y reactores diferenciados."],
  ["Aprovechar material y energía", "El objetivo no es solo estabilizar un residuo: se buscan rutas para recuperar carbono, nutrientes y, cuando aplica, energía en forma de biogás."],
  ["Cerrar ciclos", "La materia orgánica y los nutrientes pueden retornar a cadenas agrícolas mediante productos que pasan por formulación, control de calidad y requisitos regulatorios aplicables."],
  ["Operar con datos", "Una tecnología solo se vuelve repetible cuando parámetros, mantenimiento, entradas, salidas y desviaciones quedan registrados."],
];

const anaerobicStages = [
  ["01", "Hidrólisis y acidogénesis", "La fracción sólida entra a un reactor de lixiviación/percolación. La materia orgánica soluble se moviliza hacia una fase líquida y se generan compuestos intermedios."],
  ["02", "Percolado y transferencia", "El líquido rico en materia orgánica conecta la primera etapa con la etapa metanogénica. Caudales, carga y características del percolado se convierten en variables de operación."],
  ["03", "Metanogénesis", "La fase líquida pasa a una etapa metanogénica en reactores anaerobios, cuya configuración final depende del proyecto. En esta etapa, comunidades metanogénicas convierten parte de la carga orgánica en biogás."],
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
    <>
      <section className="tech-hero tech-hero--depth"><div className="container tech-hero-grid"><div><span className="eyebrow">Tecnología Greenatics</span><h1>Biología, ingeniería y operación para devolver carbono y nutrientes al ciclo productivo.</h1><p className="lead">Greenatics desarrolla sistemas de aprovechamiento material y energético de residuos orgánicos. Dependiendo de la corriente y la escala, una solución puede integrar compostaje, digestión anaerobia multietapa, recuperación de biogás, acondicionamiento de productos y trazabilidad digital.</p><div className="button-row"><Link className="button button--primary" href="/contacto/?servicio=prefactibilidad">Evaluar un proyecto</Link><Link className="button button--ghost" href="/proyectos/">Ver experiencia</Link></div></div><div className="tech-system tech-system--deep" aria-label="Sistema Greenatics: residuo, hidrólisis, metanogénesis, compostaje, productos y datos"><div className="tech-core"><img src="/brand/greenatics-symbol.svg" alt="" /></div><span className="tech-node tech-node-1">FORSU</span><span className="tech-node tech-node-2">Hidrólisis</span><span className="tech-node tech-node-3">Metanogénesis + biogás</span><span className="tech-node tech-node-4">Productos</span><span className="tech-node tech-node-5">Datos</span></div></div></section>

      <section className="technology-principles"><div className="container"><div className="section-heading"><span className="eyebrow">Cinco principios</span><h2>La tecnología es el sistema, no una sola máquina.</h2></div><div className="tech-principle-cards">{principles.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="anaerobic-deep"><div className="container"><div className="section-heading"><span className="eyebrow eyebrow--light">Digestión anaerobia multietapa</span><h2>Separar etapas para controlar mejor la transformación biológica.</h2><p>En el trabajo técnico y de investigación asociado a Greenatics y GIEM–Universidad de Antioquia se ha planteado una arquitectura de dos etapas: hidrólisis/acidogénesis en fase sólida y metanogénesis en fase líquida. La configuración final, dimensiones y propiedad intelectual de equipos se rigen por cada proyecto y por los acuerdos con la Universidad.</p></div><div className="anaerobic-stage-list">{anaerobicStages.map(([number,title,copy])=><article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

      <section className="complementary-tech"><div className="container complementary-grid"><div><span className="eyebrow">Compostaje + digestión</span><h2>No son tecnologías rivales: resuelven fracciones y objetivos diferentes.</h2><p>El compostaje transforma y estabiliza material sólido mediante condiciones aeróbicas; la digestión anaerobia permite recuperar parte de la energía contenida en la materia orgánica y genera corrientes líquidas y sólidas que requieren manejo posterior. En una biorefinería territorial, ambas rutas pueden integrarse dentro del mismo balance de masas.</p></div><div className="cycle-loop"><span>Residuo separado</span><strong>→</strong><span>Procesos biológicos</span><strong>→</strong><span>Carbono + nutrientes + energía</span><strong>→</strong><span>Suelo / cultivo / operación</span></div></div></section>

      <section className="tech-output-section"><div className="container"><div className="section-heading"><span className="eyebrow">Salidas del sistema</span><h2>El proceso busca generar recursos, no simplemente reducir volumen.</h2></div><div className="tech-output-grid">{outputs.map(([title,copy])=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="science-section"><div className="container science-grid"><div><span className="eyebrow eyebrow--light">Ciencia aplicada</span><h2>Greenatics articula empresa, territorio y conocimiento académico.</h2><p>Parte del desarrollo tecnológico de los sistemas FORSU se ha realizado con acompañamiento y trabajo conjunto del Grupo Interdisciplinario de Estudios Moleculares —GIEM— de la Universidad de Antioquia.</p><div className="button-row"><a className="button button--outline-light" href="https://www.udea.edu.co/giem" target="_blank" rel="noreferrer">Ver GIEM en UdeA ↗</a></div></div><div className="science-facts"><article><span>1992</span><strong>Trayectoria GIEM</strong><p>La Universidad de Antioquia reporta la creación del GIEM en 1992 y un trabajo interdisciplinario de investigación básica y aplicada.</p></article><article><span>A1</span><strong>Reconocimiento institucional</strong><p>El directorio institucional de grupos de investigación de la UdeA identifica al GIEM con código COL0007462 y muestra clasificación A1.</p></article><article><span>ICA</span><strong>Capacidad analítica</strong><p>La página institucional de Servicios de Extensión GIEM reporta el registro ICA LB0000152021 para control de calidad de fertilizantes, acondicionadores de suelo y/o reguladores fisiológicos.</p></article><article><span>Biomasa residual</span><strong>Línea de investigación</strong><p>El directorio institucional de la UdeA incluye “Aprovechamiento Energético y Material de Biomasa Residual” entre las líneas del grupo.</p></article></div></div></section>

      <section className="science-boundary"><div className="container"><strong>Qué significa esta relación</strong><p>Greenatics puede integrar conocimiento, experiencia de campo y resultados de proyectos desarrollados con la Universidad; no significa que Greenatics sea propietaria de los diseños, equipos o propiedad intelectual que correspondan a la UdeA/GIEM. Cada proyecto, licencia y transferencia tecnológica conserva sus acuerdos específicos.</p></div></section>

      <section className="tech-delivery"><div className="container"><div className="section-heading"><span className="eyebrow">De la idea a la operación</span><h2>La ingeniería termina cuando la operación puede sostener el proceso.</h2></div><ol className="tech-delivery-list">{delivery.map(([title,copy],index)=><li key={title}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Diseño responsable</span><h2>Antes de dimensionar un reactor, dimensionemos correctamente el flujo que debe tratar.</h2></div><Link className="button button--dark" href="/contacto/?servicio=prefactibilidad">Solicitar prefactibilidad</Link></div></section>
    </>
  );
}
