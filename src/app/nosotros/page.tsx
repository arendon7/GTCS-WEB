import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Greenatics conecta gestión de residuos orgánicos, ingeniería y biotecnología, operación, nutrición vegetal Wondergreen y datos para cerrar ciclos de economía circular.",
  alternates: { canonical: "/nosotros/" },
};

const capabilities = [
  ["Gestión territorial y empresarial", "Diagnóstico, PGIRS/PMIRS, separación, rutas selectivas, microrrutas, recolección y trazabilidad desde el generador."],
  ["Ingeniería y biotecnología", "Prefactibilidad, factibilidad, plantas, rehabilitación, compostaje, digestión anaerobia, biogás, puesta en marcha y estandarización."],
  ["Operación", "Personas, protocolos, mantenimiento, control de calidad, inventarios, coordinación y mejora de plantas de aprovechamiento."],
  ["Productos agrícolas", "Wondergreen organiza acondicionadores, fertilizantes organominerales y bioinsumos dentro de una lógica técnica por función y etapa."],
  ["Datos", "GREENATICS OPS conecta generador, ruta, recepción, proceso, producto y destino para convertir la operación en evidencia utilizable."],
];

const principles = [
  ["Entender antes de dimensionar", "Una tecnología correcta para la corriente equivocada sigue siendo una mala solución. La línea base gobierna la ingeniería."],
  ["Diseñar pensando en operar", "Una planta necesita suministro, personas, procedimientos, mantenimiento, presupuesto, control y salida de producto; no solo equipos."],
  ["Cerrar el ciclo", "El aprovechamiento adquiere más sentido cuando carbono, materia orgánica y nutrientes pueden regresar a sistemas productivos bajo condiciones controladas."],
  ["Empezar, consolidar y escalar", "Preferimos madurar proyectos por etapas y usar datos reales para justificar la siguiente inversión."],
  ["Medir para mejorar", "Recepciones, impropios, lotes, parámetros, mantenimiento, producto e inventarios deben convertirse en información para decisión."],
];

const evolution = [
  ["Residuo", "La conversación empieza en el material: quién lo genera, cuánto, cómo se separa y qué problemas produce."],
  ["Sistema", "Después aparecen la logística, la infraestructura, la biología, el personal, los costos y los actores que deben trabajar juntos."],
  ["Recurso", "El tratamiento busca recuperar valor material y, cuando aplica, energético mediante compost, biol, fertilizantes y biogás."],
  ["Retorno", "Wondergreen y otras rutas agrícolas permiten pensar en devolver nutrientes y materia orgánica a sistemas productivos."],
  ["Evidencia", "La capa digital documenta qué entró, qué ocurrió durante el proceso y cuál fue el destino del material o producto."],
];

export default function AboutPage() {
  return (
    <>
      <section className="about-hero about-hero--depth">
        <div className="container about-hero-grid">
          <div>
            <span className="eyebrow">Greenatics</span>
            <h1>No somos solo una planta, una consultora ni una marca de fertilizantes.</h1>
            <p className="lead">Greenatics construye sistemas de economía circular para residuos orgánicos. Conectamos la gestión en la fuente, la logística, el tratamiento biológico, la ingeniería, la operación, los productos agrícolas y los datos necesarios para que el ciclo pueda funcionar de extremo a extremo.</p>
            <div className="button-row"><Link className="button button--primary" href="/servicios/">Ver lo que hacemos</Link><Link className="button button--ghost" href="/proyectos/">Ver experiencia</Link></div>
          </div>
          <div className="about-mark"><img src="/brand/greenatics-symbol.svg" alt="Símbolo Greenatics" /></div>
        </div>
      </section>

      <section className="about-definition"><div className="container about-definition-grid"><div><span className="eyebrow">La idea central</span><h2>Un residuo es un material fuera de lugar. Nuestro trabajo es reconstruir la cadena que puede devolverle valor.</h2></div><div><p>La web histórica de Greenatics ya hablaba de recolección y tratamiento, plantas y biofábricas, rehabilitación, consultoría, PGIRS, fertilizantes y bioinsumos. La empresa actual integra esas capacidades dentro de una arquitectura más completa: <strong>Planear → Recolectar → Transformar → Operar → Medir → Devolver valor.</strong></p><p>Eso permite abordar el mismo problema desde diferentes puntos de entrada: un municipio que necesita madurar su PGIRS, una ESP con una planta subutilizada, una empresa con residuos orgánicos, un territorio que evalúa un Parque Ambiental o un productor que necesita soluciones Wondergreen.</p></div></div></section>

      <section className="about-evolution"><div className="container"><div className="section-heading"><span className="eyebrow eyebrow--light">Cómo vemos el ciclo</span><h2>Del residuo a una cadena verificable de valor.</h2></div><div className="about-cycle-grid">{evolution.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><strong>{title}</strong><p>{copy}</p></article>)}</div></div></section>

      <section className="about-capabilities about-capabilities--depth">
        <div className="container"><div className="section-heading"><span className="eyebrow">Cinco capacidades conectadas</span><h2>La ventaja está en trabajar la cadena completa.</h2><p>Greenatics puede intervenir una fase puntual o articular varias cuando el proyecto requiere un sistema integral.</p></div><div className="about-cap-grid about-cap-grid--five">{capabilities.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
      </section>

      <section className="about-statement"><div className="container"><span>PROPÓSITO</span><h2>Transformar residuos en vida.</h2><p>Para Greenatics, economía circular no es solamente desviar material de disposición final. Es construir una cadena capaz de recibirlo, transformarlo, recuperar recursos útiles, devolver parte de ese valor al territorio o al agro y demostrar qué ocurrió mediante información confiable.</p></div></section>

      <section className="about-science"><div className="container about-science-grid"><div><span className="eyebrow">Ciencia aplicada + experiencia de campo</span><h2>La tecnología se fortalece cuando empresa, territorio y academia trabajan sobre la misma operación.</h2><p>Greenatics ha desarrollado proyectos y procesos de estandarización con participación del Grupo Interdisciplinario de Estudios Moleculares —GIEM— de la Universidad de Antioquia. El GIEM es un grupo institucional de la UdeA, identificado como COL0007462 y clasificado A1 en el directorio institucional consultado, con una línea explícita de aprovechamiento energético y material de biomasa residual.</p><p>La relación se comunica con un límite claro: la experiencia Greenatics integra conocimiento aplicado y operación; la propiedad intelectual que corresponda a la Universidad o a sus grupos conserva los acuerdos específicos de cada proyecto.</p><Link className="button button--dark" href="/tecnologia/">Conocer la tecnología</Link></div><div className="about-science-facts"><article><strong>FORSU</strong><span>Residuos orgánicos como materia prima potencial.</span></article><article><strong>Compostaje</strong><span>Ruta aeróbica para estabilización y aprovechamiento material.</span></article><article><strong>Digestión anaerobia</strong><span>Ruta multietapa documentada para recuperación material y energética.</span></article><article><strong>Biogás + productos</strong><span>Salidas que requieren control, balance y destino definido.</span></article></div></div></section>

      <section className="about-principles"><div className="container"><div className="section-heading"><span className="eyebrow">Cómo tomamos decisiones</span><h2>Principios que orientan los proyectos.</h2></div><div className="about-principle-list">{principles.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

      <section className="about-ecosystem"><div className="container about-ecosystem-grid"><div><span className="eyebrow eyebrow--light">Ecosistema Greenatics</span><h2>Una empresa, varias capas que se alimentan entre sí.</h2><p>La operación genera conocimiento; el conocimiento mejora la ingeniería; la ingeniería fortalece los proyectos; los proyectos generan productos y datos; y Wondergreen conecta parte de ese valor con el agro.</p></div><div className="ecosystem-links"><Link href="/servicios/"><strong>Servicios</strong><span>Planeación, recolección, infraestructura, operación y datos.</span></Link><Link href="/parque-ambiental/"><strong>Parque Ambiental</strong><span>Arquitectura modular territorial para articular varias capacidades.</span></Link><Link href="/wondergreen/"><strong>Wondergreen</strong><span>Fertilizantes, acondicionadores, bioinsumos y conocimiento agronómico.</span></Link><Link href="/tecnologia/"><strong>Tecnología</strong><span>Compostaje, digestión, biorefinería, productos y biogás.</span></Link><Link href="/biblioteca/"><strong>Biblioteca</strong><span>Guías, manuales, cultivo, diagnóstico y conocimiento técnico.</span></Link><Link href="/acceso/"><strong>GREENATICS OPS</strong><span>Operación interna, trazabilidad e indicadores.</span></Link></div></div></section>

      <section className="about-boundary"><div className="container"><strong>Una regla para esta web</strong><p>Preferimos mostrar una capacidad con su alcance real antes que inflar una cifra o una promesa. Capacidades, rendimientos, impacto, registros, imágenes de producto y resultados específicos se publican únicamente cuando tienen fuente vigente, periodo y contexto verificables.</p></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Trabajemos juntos</span><h2>Si el problema involucra residuos orgánicos, aprovechamiento, territorio o nutrición vegetal, construyamos la ruta correcta.</h2></div><Link className="button button--dark" href="/diagnostico/">Encontrar mi ruta</Link></div></section>
    </>
  );
}
