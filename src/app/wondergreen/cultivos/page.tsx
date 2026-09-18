import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { CropsInteractiveShowroom } from "@/components/crops-interactive-showroom";
import { fieldApplicationRules, fieldChecklist } from "@/data/crops";
import { site } from "@/data/site";
import "./crop-showroom.css";

export const metadata: Metadata = {
  title: "Orientación por cultivo | Wondergreen Nutrients",
  description: "Rutas de lectura agronómica por etapa para preparar diagnósticos y programas Wondergreen en cultivos de Colombia.",
  alternates: { canonical: "/wondergreen/cultivos/" },
  openGraph: {
    title: "Orientación por cultivo | Wondergreen Nutrients",
    description: "Rutas de lectura agronómica por etapa para preparar diagnósticos y programas Wondergreen en cultivos de Colombia.",
    url: "/wondergreen/cultivos/",
    images: ["/guides/guia-cafe-cover.webp"],
  },
};

const readingLayers = [
  ["01", "Contexto", "Suelo o sustrato, agua, clima, drenaje, raíces y antecedentes del lote."],
  ["02", "Momento", "Etapa fisiológica, carga, vigor, condición sanitaria y objetivo productivo."],
  ["03", "Decisión", "Línea compatible, vía de aplicación, validaciones y variables de seguimiento."],
] as const;

const catalogFacts = [
  ["12", "rutas por cultivo", "Organizadas para sistemas productivos frecuentes en Colombia."],
  ["3–5", "momentos de lectura", "Desde establecimiento hasta producción, recuperación o mantenimiento."],
  ["5", "líneas Wondergreen", "Compost, crecimiento, balance, floración y desarrollo de fruto."],
  ["1", "principio transversal", "Observar, registrar, comparar y ajustar antes de repetir."],
] as const;

export default function CropsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Wondergreen", url: `${site.url}/wondergreen/` }, { name: "Cultivos", url: `${site.url}/wondergreen/cultivos/` }]} />
      <div className="crop-catalog-page">
      <section className="crop-catalog-hero">
        <div className="container crop-catalog-hero__grid">
          <div className="crop-catalog-hero__copy">
            <span className="eyebrow eyebrow--light">Biblioteca agronómica · Wondergreen</span>
            <h1>El cultivo no pide una receta. <em>Pide una lectura.</em></h1>
            <p>Estas rutas conectan etapa fisiológica, condición del lote, alertas y objetivos de manejo para preparar una decisión nutricional mejor informada. No reemplazan el diagnóstico: ayudan a hacerlo más ordenado, trazable y útil.</p>
            <div className="crop-catalog-hero__actions">
              <a className="button button--primary" href="#biblioteca-cultivos">Explorar los 12 cultivos</a>
              <Link className="button button--outline-light" href="/wondergreen/analisis-suelo/">Preparar análisis de suelo</Link>
            </div>
          </div>

          <aside className="crop-catalog-method">
            <header>
              <span>Cómo usar esta biblioteca</span>
              <strong>Leer antes de recomendar</strong>
            </header>
            <div>
              {readingLayers.map(([number, title, copy]) => (
                <article key={number}>
                  <span>{number}</span>
                  <div><strong>{title}</strong><p>{copy}</p></div>
                </article>
              ))}
            </div>
            <p className="crop-catalog-method__note">La referencia y la cantidad final deben contrastarse con etiqueta vigente, análisis disponibles, área, sistema de aplicación y criterio profesional.</p>
          </aside>
        </div>

        <div className="container crop-catalog-facts" aria-label="Alcance de la biblioteca">
          {catalogFacts.map(([value, label, copy]) => (
            <article key={label}>
              <strong>{value}</strong>
              <div><span>{label}</span><p>{copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="crop-catalog-library" id="biblioteca-cultivos">
        <div className="container">
          <header className="crop-catalog-heading">
            <div>
              <span className="eyebrow">Orientación por sistema productivo</span>
              <h2>Encuentra el cultivo y comienza por la pregunta correcta.</h2>
            </div>
            <p>Filtra por familia productiva o busca por nombre, especie, etapa o condición. Cada ficha resume qué observar primero y abre una ruta técnica más profunda.</p>
          </header>
          <CropsInteractiveShowroom />
        </div>
      </section>

      <section className="crop-field-protocol">
        <div className="container">
          <header className="crop-field-protocol__heading">
            <div><span className="eyebrow eyebrow--light">Antes de aplicar</span><h2>Una buena recomendación también depende de cómo se valida y se ejecuta.</h2></div>
            <p>El producto es una parte de la decisión. La humedad, el drenaje, la calibración, la compatibilidad, el registro y la observación posterior determinan si el programa puede evaluarse y mejorarse.</p>
          </header>

          <div className="crop-field-protocol__grid">
            <article className="crop-field-panel">
              <header><span>01</span><div><small>Diagnóstico mínimo</small><h3>Lista de chequeo en campo</h3></div></header>
              <ol>
                {fieldChecklist.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}
              </ol>
            </article>

            <article className="crop-field-panel crop-field-panel--accent">
              <header><span>02</span><div><small>Ejecución y seguimiento</small><h3>Reglas para una aplicación trazable</h3></div></header>
              <ol>
                {fieldApplicationRules.map((rule, index) => <li key={rule}><span>{String(index + 1).padStart(2, "0")}</span><p>{rule}</p></li>)}
              </ol>
            </article>
          </div>
        </div>
      </section>

      <section className="crop-decision-route">
        <div className="container crop-decision-route__grid">
          <div>
            <span className="eyebrow">De la guía a una decisión</span>
            <h2>Tres movimientos para construir un programa que pueda aprender del lote.</h2>
          </div>
          <div className="crop-decision-route__steps">
            <article><span>01</span><strong>Caracterizar</strong><p>Reunir análisis, historial, etapa, ambiente, síntomas y objetivo productivo.</p></article>
            <article><span>02</span><strong>Definir</strong><p>Seleccionar la referencia, la vía y el alcance que deben validarse para ese contexto.</p></article>
            <article><span>03</span><strong>Seguir</strong><p>Registrar aplicación, respuesta, novedades y criterios para conservar o ajustar.</p></article>
          </div>
        </div>
      </section>

      <section className="crop-catalog-cta">
        <div className="container crop-catalog-cta__inner">
          <div>
            <span className="eyebrow eyebrow--light">Acompañamiento agronómico</span>
            <h2>¿Tu cultivo, sistema o condición no aparece aquí?</h2>
            <p>Podemos comenzar con la información disponible, identificar los vacíos que cambian la recomendación y definir el siguiente paso técnico antes de hablar de una fórmula o cantidad.</p>
          </div>
          <div className="crop-catalog-cta__actions">
            <Link className="button button--primary" href="/contacto/?interes=wondergreen&perfil=agro&diagnostico=Orientación%20por%20cultivo">Llevar consulta a Contacto →</Link>
            <a className="crop-catalog-cta__link" href="https://wa.me/573003078822?text=Hola%20Wondergreen%2C%20necesito%20orientaci%C3%B3n%20agron%C3%B3mica%20para%20mi%20cultivo" rel="noopener noreferrer" target="_blank">Validar por WhatsApp directo <span aria-hidden="true">→</span></a>
            <Link className="crop-catalog-cta__link" href="/wondergreen/calculadora/">Preparar información del lote <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
