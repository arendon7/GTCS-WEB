import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Greenatics conecta gestión de residuos orgánicos, ingeniería, valorización, nutrición vegetal y datos para cerrar ciclos de economía circular.",
};

const capabilities = [
  ["Residuos", "Partimos de la corriente real: origen, calidad, volumen, logística, impropios y posibilidades de aprovechamiento."],
  ["Ingeniería", "Convertimos el diagnóstico en sistemas de tratamiento, flujos, infraestructura, protocolos y puesta en marcha."],
  ["Productos", "Buscamos que la transformación tenga una salida de valor: materiales estabilizados, fertilizantes y soluciones agrícolas."],
  ["Datos", "La trazabilidad convierte cada recepción, proceso y producto en evidencia útil para operación, auditoría y mejora."],
];

const principles = [
  ["Entender antes de dimensionar", "Una tecnología correcta para la corriente equivocada sigue siendo una mala solución."],
  ["Diseñar pensando en operar", "Una planta necesita personas, procedimientos, mantenimiento, abastecimiento, control y salida de producto."],
  ["Cerrar el ciclo", "El aprovechamiento adquiere más sentido cuando el material transformado puede regresar a sistemas productivos."],
  ["Medir para mejorar", "Datos trazables permiten identificar pérdidas, rechazos, cuellos de botella y oportunidades de optimización."],
];

export default function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <div className="container about-hero-grid">
          <div>
            <span className="eyebrow">Greenatics</span>
            <h1>Transformar residuos en vida requiere conectar muchas disciplinas.</h1>
            <p className="lead">Trabajamos en la intersección entre gestión de residuos orgánicos, tratamiento biológico, ingeniería, agricultura y sistemas de información.</p>
          </div>
          <div className="about-mark"><img src="/brand/greenatics-symbol.svg" alt="Símbolo Greenatics" /></div>
        </div>
      </section>

      <section className="about-capabilities">
        <div className="container"><div className="section-heading"><span className="eyebrow">Qué conectamos</span><h2>Del residuo al valor.</h2></div><div className="about-cap-grid">{capabilities.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
      </section>

      <section className="about-statement"><div className="container"><span>PROPÓSITO</span><h2>Transformar residuos en vida.</h2><p>Para Greenatics, economía circular no es solamente desviar material de disposición final: es diseñar una cadena capaz de recibirlo, transformarlo, convertirlo en recursos útiles y demostrar qué ocurrió con datos.</p></div></section>

      <section className="about-principles"><div className="container"><div className="section-heading"><span className="eyebrow">Cómo pensamos</span><h2>Principios que orientan los proyectos.</h2></div><div className="about-principle-list">{principles.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2,"0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

      <section className="about-ecosystem"><div className="container about-ecosystem-grid"><div><span className="eyebrow eyebrow--light">Ecosistema Greenatics</span><h2>Una marca madre, una línea comercial y una capa operacional.</h2></div><div className="ecosystem-links"><Link href="/wondergreen/"><strong>Wondergreen</strong><span>Nutrición vegetal y productos.</span></Link><Link href="/tecnologia/"><strong>Tecnología</strong><span>Tratamiento, valorización e ingeniería.</span></Link><Link href="/impacto/"><strong>Impacto</strong><span>Datos públicos gobernados desde la operación.</span></Link><Link href="/acceso/"><strong>GREENATICS OPS</strong><span>Operación interna y trazabilidad.</span></Link></div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Trabajemos juntos</span><h2>Si el problema involucra residuos orgánicos, suelo o aprovechamiento, conversemos.</h2></div><Link className="button button--dark" href="/contacto/">Contactar Greenatics</Link></div></section>
    </>
  );
}
