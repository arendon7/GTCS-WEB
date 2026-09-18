import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { CropLibraryGrid } from "@/components/crop-library-grid";
import { WondergreenPackshots } from "@/components/wondergreen-packshots";
import { WondergreenScienceOverview } from "@/components/wondergreen-science-overview";
import { WondergreenLiquidLines } from "@/components/wondergreen-liquid-lines";
import { WondergreenBioinputLines } from "@/components/wondergreen-bioinput-lines";
import { WondergreenBioinputMethod } from "@/components/wondergreen-bioinput-method";
import { WondergreenTechnicalLibrary } from "@/components/wondergreen-technical-library";

export const metadata: Metadata = {
  title: "Wondergreen | Nutrición organomineral y acompañamiento agronómico",
  description: "Productos Wondergreen, diagnóstico, recomendación, planes de aplicación y acompañamiento para productores, asociaciones, distribuidores y empresas agrícolas.",
  alternates: { canonical: "/wondergreen/" },
  openGraph: {
    title: "Wondergreen | Nutrición organomineral y acompañamiento agronómico",
    description: "Productos Wondergreen, diagnóstico, recomendación, planes de aplicación y acompañamiento para productores, asociaciones, distribuidores y empresas agrícolas.",
    url: "/wondergreen/",
    images: ["/products/wondergreen-system-stages.webp"],
  },
};

const serviceLevels = [
  { number: "01", name: "Suministro orientado", ideal: "Cuando ya conoces el cultivo, la etapa y la necesidad.", includes: ["Selección de referencia y presentación", "Ficha y orientación de uso", "Cotización y logística de entrega"], cta: "Cotizar productos", href: "/wondergreen/cotizador/" },
  { number: "02", name: "Acompañamiento programado", ideal: "Cuando necesitas convertir el producto en un plan aplicable.", includes: ["Lectura de suelo, cultivo y manejo", "Plan por etapa y calendario", "Revisión de aplicación y respuesta"], cta: "Solicitar acompañamiento", href: "/servicios/programas-wondergreen/" },
  { number: "03", name: "Programa técnico", ideal: "Para fincas, asociaciones y empresas que quieren medir y mejorar.", includes: ["Diagnóstico y objetivos por lote", "Protocolo, visitas e indicadores", "Seguimiento, ajustes y continuidad"], cta: "Estructurar un programa", href: "/contacto/?servicio=programas-wondergreen" },
] as const;

const decisionSteps = [
  ["01", "Suelo", "Textura, pH, materia orgánica, humedad, drenaje y análisis disponibles."],
  ["02", "Cultivo", "Especie, edad, densidad, variedad, sistema productivo y condición del lote."],
  ["03", "Momento", "Preparación, crecimiento, equilibrio, floración, llenado o recuperación."],
  ["04", "Objetivo", "Establecimiento, productividad, calidad, sanidad radicular o recuperación del suelo."],
  ["05", "Seguimiento", "Aplicación, respuesta observable, indicadores y decisión de ajuste o continuidad."],
] as const;

const tools = [
  ["Interpretar mi suelo", "Organiza variables del análisis y detecta qué información falta antes de recomendar.", "/wondergreen/analisis-suelo/"],
  ["Preparar un estimado", "Organiza área, etapa y referencias para solicitar una recomendación y una cotización verificadas.", "/wondergreen/calculadora/"],
  ["Revisar compatibilidad", "Consulta precauciones antes de combinar productos en tanque o programa.", "/wondergreen/compatibilidad/"],
  ["Reconocer una alerta", "Orienta la observación de síntomas sin sustituir un diagnóstico agronómico en campo.", "/wondergreen/quiz-deficiencias/"],
] as const;

export default function WondergreenPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: "https://greenatics.com.co/" }, { name: "Wondergreen", url: "https://greenatics.com.co/wondergreen/" }]} />
      <section className="wg-v4-hero">
        <div className="container wg-v4-hero__grid">
          <div className="wg-v4-hero__copy">
            <span className="eyebrow eyebrow--light">Wondergreen Nutrients · del producto al criterio agronómico</span>
            <h1>Nutrición organomineral que empieza por entender el suelo y continúa después de la compra.</h1>
            <p className="lead">Wondergreen organiza compost, fertilizantes organominerales sólidos y líquidos, y bioinsumos por objetivo y etapa. La matriz orgánica, la fórmula y la vía de aplicación cumplen funciones distintas: se leen juntas con el suelo, el cultivo y el momento productivo. La selección se convierte en programa cuando incorpora diagnóstico, etiqueta vigente, aplicación, observación y ajuste.</p>
            <div className="button-row"><Link className="button button--light" href="/wondergreen/cotizador/">Cotizar Wondergreen</Link><Link className="button button--outline-light" href="/servicios/programas-wondergreen/">Conocer el acompañamiento</Link></div>
            <ul className="wg-v4-hero__proof"><li><strong>6 módulos</strong><span>Suelo, crecimiento, balance, floración, fruto y manejo biológico.</span></li><li><strong>12 cultivos</strong><span>Rutas técnicas organizadas por momento fisiológico.</span></li><li><strong>3 niveles</strong><span>Suministro, acompañamiento o programa técnico.</span></li></ul>
          </div>
          <figure className="wg-v4-hero__visual"><Image src="/products/wondergreen-system-stages.webp" alt="Sistema Wondergreen organizado por etapas del cultivo" fill priority sizes="(max-width: 900px) 100vw, 46vw" /><figcaption><strong>Un sistema, no una fórmula aislada.</strong><span>Cada producto cumple un papel dentro del ciclo productivo.</span></figcaption></figure>
        </div>
      </section>

      <section className="wg-v4-levels"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Cómo quieres trabajar</span><h2>El producto es una puerta de entrada. El nivel de acompañamiento depende de tu decisión.</h2></div><p>No todas las compras necesitan una visita técnica, pero una recomendación responsable sí debe reconocer qué información existe, qué puede inferirse y qué requiere validación en campo.</p></div><div className="wg-v4-levels__grid">{serviceLevels.map((level) => <article key={level.number}><span>{level.number}</span><h3>{level.name}</h3><p>{level.ideal}</p><ul>{level.includes.map((item) => <li key={item}>{item}</li>)}</ul><Link href={level.href}>{level.cta} →</Link></article>)}</div></div></section>

      <section className="wg-v4-decision"><div className="container"><div className="wg-v4-decision__intro"><span className="eyebrow eyebrow--light">Método Wondergreen</span><h2>Cinco lecturas antes de convertir una fórmula en recomendación.</h2><p>La dosis no se decide únicamente por hectáreas. Se construye leyendo suelo, cultivo, etapa, objetivo y capacidad de seguimiento.</p></div><ol>{decisionSteps.map(([number, title, copy]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>)}</ol></div></section>

      <WondergreenScienceOverview />

      <section className="wg-v4-products" id="productos"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Portafolio Wondergreen</span><h2>Una función clara para cada momento del sistema productivo.</h2></div><p>Explora referencias con precios públicos de referencia, opciones bajo cotización y programas técnicos por cultivo. Cada suministro integra su ficha, condición de uso y recomendación de aplicación.</p></div><WondergreenPackshots /><WondergreenLiquidLines /><WondergreenBioinputMethod /><WondergreenBioinputLines /><WondergreenTechnicalLibrary /></div></section>

      <section className="wg-v4-tools"><div className="container wg-v4-tools__grid"><div><span className="eyebrow eyebrow--light">Herramientas para preparar la conversación</span><h2>Llega a la recomendación con mejores preguntas y mejores datos.</h2><p>Las herramientas producen orientaciones y escenarios. El programa técnico integra además contexto de campo, criterio agronómico y seguimiento.</p><div className="button-row"><Link className="button button--light" href="/herramientas/">Ver ecosistema digital</Link><Link className="button button--outline-light" href="/biblioteca/catalogo-wondergreen/">Abrir biblioteca técnica</Link></div></div><div className="wg-v4-tools__list">{tools.map(([title, copy, href], index) => <Link href={href} key={title}><span>0{index + 1}</span><div><strong>{title}</strong><p>{copy}</p></div><em>→</em></Link>)}</div></div></section>

      <section className="wg-v4-crops"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Biblioteca por cultivo</span><h2>Rutas de lectura para entender el momento antes de hablar de producto.</h2></div><p>Doce recorridos organizan establecimiento, crecimiento, floración, producción, alertas y seguimiento. Son marcos de conversación y no recetas cerradas por hectárea.</p></div><CropLibraryGrid /></div></section>

      <section className="wg-v4-bridge"><div className="container wg-v4-bridge__grid"><figure><Image src="/guides/home-garden-casa-jardin-cover.webp" alt="Guía Wondergreen Casa y Jardín" fill sizes="(max-width: 800px) 100vw, 38vw" /></figure><div><span className="eyebrow">También para espacios cotidianos</span><h2>La lógica del suelo vivo llega a macetas, jardines y huertas urbanas.</h2><p>Casa & Jardín traduce el sistema Wondergreen a decisiones sencillas por tipo de planta, etapa, estado y tamaño de maceta.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/">Explorar Casa & Jardín</Link><Link className="button button--ghost" href="/biblioteca/huertas/">Abrir guía de huertas</Link></div></div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Empezar con contexto</span><h2>Cuéntanos qué produces, dónde, en qué etapa estás y qué necesitas mejorar.</h2></div><Link className="button button--dark" href="/contacto/?servicio=programas-wondergreen">Hablar con el equipo Wondergreen</Link></div></section>
    </>
  );
}
