import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EsgCalculator } from "@/components/esg-calculator";
import { ImpactCalculator } from "@/components/impact-calculator";
import { OpsInteractivePreview } from "@/components/ops-interactive-preview";
import { yarumalClaims } from "@/data/claims";

export const metadata: Metadata = {
  title: "Impacto y evidencia",
  description:
    "Resultados validados, metodología, gobernanza de datos y herramientas orientativas para medir el impacto de sistemas Greenatics.",
  alternates: { canonical: "/impacto/" },
};

const governanceSteps = [
  ["01", "Medido", "El dato nace en pesajes, recorridos, caracterizaciones, lotes, costos u otros registros identificables."],
  ["02", "Conciliado", "Se revisan consistencia, duplicados, periodos, balance de masa y relación con la evidencia disponible."],
  ["03", "Validado", "Se confirma qué representa la cifra, su unidad, alcance, responsable y método de cálculo."],
  ["04", "Publicado", "El resultado se comunica con caso, periodo o escenario y un acceso claro a su metodología."],
] as const;

export default function ImpactoPage() {
  return (
    <>
      <section className="gt-service-hero gt-impact-hero">
        <div className="container gt-service-hero__grid">
          <div className="gt-service-hero__copy">
            <span className="eyebrow eyebrow--light">Impacto y evidencia</span>
            <h1>Una cifra crea confianza cuando se puede rastrear hasta la operación.</h1>
            <p className="lead">
              Greenatics conecta resultados ambientales, logísticos y económicos con registros,
              contexto y metodología. Comunicamos impacto comprobado sin convertir un caso real
              en una promesa automática para todos los proyectos.
            </p>
            <div className="button-row">
              <a className="button button--light" href="#resultados">Ver resultados validados</a>
              <Link className="button button--outline-light" href="/proyectos/">Explorar los casos</Link>
            </div>
          </div>
          <figure className="gt-service-hero__figure">
            <Image
              src="/projects/routes/route-evidence-02.webp"
              alt="Pesaje y registro de residuos orgánicos durante una operación Greenatics"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <figcaption><strong>Del registro a la decisión</strong><span>Cada resultado comienza con evidencia capturada en campo.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-proof-ribbon" id="resultados" aria-label="Resultados validados del caso Yarumal">
        <div className="container gt-proof-ribbon__grid">
          <div className="gt-proof-ribbon__intro"><span>Caso Yarumal</span><strong>Resultados validados y publicables</strong></div>
          {yarumalClaims.map((claim) => <div key={claim.id}><strong>{claim.value}</strong><span>{claim.compactLabel}</span><small>{claim.context.replace("Caso Yarumal · ", "")}</small></div>)}
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Lectura responsable</span><h2>Qué dice cada resultado y cómo se obtuvo.</h2></div>
            <p>Las cuatro cifras describen el desempeño validado de Yarumal. El contexto permanece visible para que el claim sea fuerte, comprensible y transferible sin perder precisión.</p>
          </div>
          <div className="gt-case-method-grid">
            {yarumalClaims.map((claim) => (
              <article key={claim.id}>
                <span>{claim.evidence}</span>
                <strong>{claim.value}</strong>
                <h3>{claim.compactLabel}</h3>
                <p>{claim.method}</p>
                <small>{claim.context}</small>
              </article>
            ))}
          </div>
          <div className="gt-case-evidence-note">
            <div><span>Claims del caso</span><p>Son resultados de impacto, eficacia y eficiencia validados para Yarumal y pueden comunicarse comercialmente con su contexto.</p></div>
            <div><span>Proyección de un nuevo proyecto</span><p>Requiere línea base, supuestos y validación propios. Los resultados históricos orientan; no sustituyen el estudio del nuevo territorio.</p></div>
          </div>
          <aside className="gt-impact-climate-bridge" aria-label="Puente entre evidencia operativa e impacto climático">
            <div>
              <span className="eyebrow">Del dato operativo al CO₂</span>
              <h3>La evidencia logística también puede convertirse en un claim climático.</h3>
            </div>
            <div>
              <p>Los 140 km de transporte evitado por viaje ya muestran una mejora operativa verificable. Para traducirla a tCO₂e hay que documentar carga, vehículo, combustible, frecuencia, factor de emisión, periodo y frontera del cálculo.</p>
              <Link href="/huella/#calculadora">Explorar un escenario de CO₂ <span aria-hidden="true">↗</span></Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="gt-impact-tamesis" id="impacto-tamesis">
        <div className="container gt-impact-tamesis__grid">
          <figure><Image alt="Reactor UASB de Támesis visto desde el aire" fill sizes="(max-width: 900px) 100vw, 48vw" src="/projects/tamesis/reactor-uasb.jpeg" /><figcaption><span>Caso Támesis</span><strong>Materia, biogás y energía dentro del mismo balance.</strong></figcaption></figure>
          <div>
            <span className="eyebrow">La siguiente capa de evidencia</span>
            <h2>En Támesis, medir impacto también significa cerrar el balance energético.</h2>
            <p>La existencia del UASB, la captura de biogás y el aprovechamiento de bioenergía amplían la pregunta: no basta con saber cuánto material entró. La operación debe relacionar transformación, gas capturado, energía útil, productos y destinos.</p>
            <div className="gt-impact-tamesis__variables">
              <div><span>01</span><strong>Masa recibida y tratada</strong></div>
              <div><span>02</span><strong>Biogás producido y capturado</strong></div>
              <div><span>03</span><strong>Energía obtenida y utilizada</strong></div>
              <div><span>04</span><strong>Productos, pérdidas y destinos</strong></div>
            </div>
            <p className="gt-impact-tamesis__truth"><strong>Límite actual:</strong> esta página no publica todavía una serie energética validada de Támesis. Presenta las variables y la arquitectura necesarias para construirla con rigor.</p>
            <Link className="button button--dark" href="/proyectos/tamesis/">Ver el sistema de Támesis</Link>
          </div>
        </div>
      </section>

      <section className="gt-impact-governance">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-route-heading--light">
            <div><span className="eyebrow eyebrow--light">Gobierno de datos</span><h2>Medir, conciliar, validar y publicar.</h2></div>
            <p>La gobernanza no consiste en esconder cifras. Consiste en conservar su definición, evidencia y alcance para que sigan siendo defendibles cuando cambian el periodo o la operación.</p>
          </div>
          <ol className="gt-impact-governance__steps">
            {governanceSteps.map(([number, title, copy]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">GREENATICS OPS</span><h2>La trazabilidad convierte actividad diaria en memoria operativa.</h2></div>
            <p>La demostración permite recorrer generadores, rutas, recepción, lotes e indicadores. Su propósito es mostrar la arquitectura de control, no presentar datos en vivo de una operación específica.</p>
          </div>
          <OpsInteractivePreview />
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Herramientas orientativas</span><h2>Explorar escenarios antes de formular.</h2></div>
            <p>Estas calculadoras ayudan a dimensionar preguntas y comparar escenarios. Sus resultados son estimaciones y no reemplazan caracterización, ingeniería, factores documentados ni validación contractual.</p>
          </div>
          <div className="gt-impact-tools">
            <article><span>Escenario ESG</span><EsgCalculator /></article>
            <article><span>Escenario de transformación</span><ImpactCalculator /></article>
          </div>
        </div>
      </section>

      <section className="gt-route-closing">
        <div className="container gt-route-closing__inner">
          <div><span className="eyebrow">Construir una línea base</span><h2>Podemos convertir tus registros en una ruta de medición útil.</h2></div>
          <Link className="button button--dark" href="/contacto/">Revisar un caso con el equipo</Link>
        </div>
      </section>
    </>
  );
}
