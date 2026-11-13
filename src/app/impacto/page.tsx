import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { yarumalClaims } from "@/data/claims";
import { tamesisImpactScenario } from "@/data/tamesis-impact";

export const metadata: Metadata = {
  title: "Impacto y evidencia",
  description:
    "Resultados validados, metodología, gobernanza de datos y herramientas orientativas para medir el impacto de sistemas Greenatics.",
  alternates: { canonical: "/impacto/" },
};

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
              <a className="button button--light" href="#resultados">Ver indicadores y escenario</a>
              <Link className="button button--outline-light" href="/proyectos/">Ver Yarumal y Támesis</Link>
            </div>
          </div>
          <figure className="gt-service-hero__figure">
            <Image
              src="/projects/plant/plant-evidence-04.webp"
              alt="Pilas de compostaje bajo cubierta en Yarumal"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <figcaption><strong>Compostaje bajo cubierta · Yarumal</strong><span>Una etapa de la ruta que conecta recolección selectiva, tratamiento y aprovechamiento.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-proof-ribbon gt-impact-proof-ribbon" id="resultados" aria-label="Indicadores operativos validados y escenario económico del caso Yarumal">
        <div className="container gt-proof-ribbon__grid">
          <div className="gt-proof-ribbon__intro"><span>Caso Yarumal</span><strong>Resultados operativos y escenario anualizado</strong></div>
          {yarumalClaims.map((claim) => <div key={claim.id}><strong>{claim.value}</strong><span>{claim.compactLabel}</span><small>{claim.context.replace("Caso Yarumal · ", "")}</small></div>)}
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Lectura responsable</span><h2>Qué dice cada resultado y cómo se obtuvo.</h2></div>
            <p>Las cifras no representan el mismo tipo de dato: dos describen resultados de un periodo validado, una compara el recorrido por viaje y otra presenta un escenario anualizado de ahorro. Cada valor conserva su método y alcance; ninguno se traslada automáticamente a otro municipio.</p>
          </div>
          <div className="gt-case-method-grid gt-case-method-grid--method-only">
            {yarumalClaims.map((claim) => (
              <article key={claim.id}>
                <span>{claim.evidence}</span>
                <h3>{claim.compactLabel}</h3>
                <p>{claim.method}</p>
                <small>{claim.context}</small>
              </article>
            ))}
          </div>
          <div className="gt-case-evidence-note">
            <div><span>Resultados y alcance</span><p>Las cifras describen el caso Yarumal: dos corresponden a un periodo validado, una compara el recorrido por viaje y el ahorro en fletes es un escenario anualizado. En otros territorios, los resultados dependerán de la generación, las rutas, la infraestructura y el periodo evaluado.</p></div>
            <div><span>Proyección de un nuevo proyecto</span><p>Requiere línea base, supuestos y validación propios. Los resultados históricos orientan; no sustituyen el estudio del nuevo territorio.</p></div>
          </div>
          <aside className="gt-impact-climate-bridge" aria-label="Puente entre evidencia operativa e impacto climático">
            <div>
              <span className="eyebrow">Del dato operativo al CO₂</span>
              <h3>¿Qué datos hacen falta para estimar las emisiones del transporte?</h3>
            </div>
            <div>
              <p>La distancia comparada describe un cambio de recorrido, no una reducción de gases de efecto invernadero. Para estimar emisiones hay que documentar carga, vehículo, combustible, frecuencia, factor de emisión, periodo y límites del cálculo.</p>
              <Link href="/contacto/?servicio=clima-carbono&perfil=clima&diagnostico=Evaluar%20escenario%20GEI%20de%20Yarumal&prioridad=Recorrido%20sustituido%2C%20carga%2C%20veh%C3%ADculo%2C%20combustible%2C%20frecuencia%2C%20periodo%20y%20l%C3%ADmites">Preparar una estimación climática</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="gt-impact-tamesis" id="impacto-tamesis">
        <div className="container gt-impact-tamesis__grid">
          <figure className="gt-impact-tamesis__photo"><Image alt="Reactor UASB de 30 m³ en Támesis" fill sizes="(max-width: 900px) 100vw, 48vw" src="/projects/tamesis/reactor-uasb.jpeg" /><figcaption><span>Reactor UASB · Támesis</span><strong>La estimación de CO₂e se construye a partir de variables y supuestos del proceso.</strong></figcaption></figure>
          <div>
            <span className="eyebrow">{tamesisImpactScenario.eyebrow}</span>
            <h2>{tamesisImpactScenario.title}</h2>
            <p>{tamesisImpactScenario.intro}</p>
            <dl className="gt-impact-tamesis__variables">
              {tamesisImpactScenario.metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
            </dl>
            <p className="gt-impact-tamesis__truth"><strong>Base de lectura:</strong> {tamesisImpactScenario.method}</p>
            <Link className="button button--dark" href="/proyectos/tamesis/#impacto">Ver el escenario en el caso Támesis</Link>
          </div>
        </div>
      </section>

      <section className="gt-impact-governance">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-route-heading--light">
            <div><span className="eyebrow eyebrow--light">Gobierno de datos</span><h2>Medir, conciliar, validar y publicar.</h2></div>
            <p>La gobernanza no consiste en esconder cifras. Consiste en conservar su definición, evidencia y alcance para que sigan siendo defendibles cuando cambian el periodo o la operación.</p>
          </div>
          <p className="gt-impact-governance__narrative">
            Partimos de pesajes, recorridos, caracterizaciones, lotes, costos y otros registros identificables. Revisamos consistencia, duplicados, periodos y balances; confirmamos qué representa cada cifra, su unidad, alcance, responsable y método. Publicamos el resultado con el caso, periodo o escenario y la metodología disponible para entenderlo.
          </p>
        </div>
      </section>

      <section className="gt-route-closing" id="siguiente-paso" aria-labelledby="impact-next-step-title">
        <div className="container gt-route-closing__inner gt-impact-next-step">
          <div>
            <span className="eyebrow">Explorar un escenario</span>
            <h2 id="impact-next-step-title">Prueba una hipótesis. Luego llévala a una línea base.</h2>
            <p>El estimador público de orgánicos proyecta generación y meta de desvío; no calcula emisiones ni usa distancias. Para estimar GEI de un proyecto se acuerdan línea base, datos, factores y límites documentados.</p>
          </div>
          <Link className="button button--dark" href="/herramientas/estimador-organicos/">Probar estimador público</Link>
        </div>
      </section>
    </>
  );
}
