import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ServiceAudienceLink } from "@/components/service-audience-link";
import { tamesisImpactScenario } from "@/data/tamesis-impact";

export const metadata: Metadata = {
  title: "Caso Támesis | UASB, biogás y bioenergía",
  description:
    "Caso Greenatics en Támesis: ruta selectiva, reactor anaerobio UASB, captura de biogás, bioenergía, compostaje y control operativo.",
  alternates: { canonical: "/proyectos/tamesis/" },
};

const operatingRecords = [
  ["Entradas", "Toneladas recibidas, origen, fecha, calidad del material e impropios."],
  ["Tratamiento", "Lotes, alimentación al sistema, tiempos, novedades y toneladas tratadas."],
  ["Biogás y energía", "Volumen producido y capturado, calidad, destino y energía útil obtenida."],
  ["Salidas", "Compost, líquidos estabilizados, bases para biofábrica, inventario, entregas y rechazo devuelto."],
  ["Confiabilidad", "Consumos de agua y energía, equipos, paradas, mantenimiento y acciones correctivas."],
  ["Evidencia", "Fotografías, responsables, decisiones, compromisos, actas y soportes para seguimiento."],
] as const;

const consolidation = [
  {
    label: "Calidad de entrada",
    title: "Proteger el proceso desde la ruta.",
    copy: "Criterios claros de aceptación, pedagogía sostenida y trazabilidad del rechazo reducen separación secundaria y variabilidad en planta.",
  },
  {
    label: "Confiabilidad operativa",
    title: "Asegurar agua, energía y mantenimiento.",
    copy: "La continuidad del UASB y de los equipos auxiliares depende de servicios estables, inspecciones, repuestos y responsables definidos.",
  },
  {
    label: "Balance de valor",
    title: "Medir masa, gas, energía y productos.",
    copy: "La planta debe conectar cada tonelada recibida con biogás capturado, energía aprovechada, productos obtenidos, pérdidas y destinos.",
  },
  {
    label: "Gobernanza",
    title: "Formalizar lo que ya opera.",
    copy: "Roles, entradas, salidas, uso del espacio, reportes, conciliación y soportes documentales ayudan a ordenar el trabajo con la ESP y dar continuidad a los acuerdos operativos.",
  },
] as const;

export default function TamesisPage() {
  return (
    <>
      <section className="gt-case-hero gt-tamesis-hero">
        <div className="container gt-case-hero__grid">
          <div className="gt-case-hero__copy">
            <Link className="gt-case-back" href="/proyectos/">Proyectos / Caso Támesis</Link>
            <span className="eyebrow eyebrow--light">Más de tres años de experiencia · Suroeste de Antioquia</span>
            <h1>Támesis conecta orgánicos con biogás, bioenergía y salidas para el suelo.</h1>
            <p className="lead">
              Támesis ya cuenta con infraestructura anaerobia y rutas de aprovechamiento. La prioridad
              es fortalecer la continuidad de la operación, documentar los balances de masa y energía
              y convertir el biogás y las salidas orgánicas en valor verificable.
            </p>
            <div className="button-row">
              <a className="button button--light" href="#sistema">Entender el sistema</a>
              <a className="button button--outline-light" href="#control">Ver control operativo</a>
            </div>
          </div>
          <div className="gt-case-hero__visual gt-tamesis-hero__visual">
            <figure className="gt-case-hero__main-image">
              <Image
                src="/projects/tamesis/planta-aerea.jpg"
                alt="Vista aérea de instalaciones para aprovechamiento de biomasa en Támesis"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <figcaption><strong>Támesis · Suroeste de Antioquia</strong><span>Vista aérea de la planta y su contexto territorial.</span></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="gt-proof-ribbon" aria-label="Componentes existentes en la planta de Támesis">
        <div className="container gt-proof-ribbon__grid">
          <div className="gt-proof-ribbon__intro">
            <span>Infraestructura y proceso</span>
            <strong>Un sistema anaerobio que ya existe</strong>
          </div>
          <div><strong>30 m³</strong><span>Reactor anaerobio UASB</span></div>
          <div><strong>2 etapas</strong><span>Reactores de hidrólisis</span></div>
          <div><strong>Biogás</strong><span>Captura, filtrado y almacenamiento</span></div>
          <div><strong>Salidas de valor</strong><span>Compost, digestatos y ruta hacia biofábrica</span></div>
        </div>
      </section>

      <nav className="gt-case-local-nav" aria-label="Recorrido del caso Támesis">
        <div className="container">
          <span>Recorrido del caso</span>
          <a href="#sistema">Proceso y rutas</a>
          <a href="#control">Registros operativos</a>
          <a href="#impacto">Impacto y CO₂e</a>
          <a href="#siguiente">Consolidación</a>
        </div>
      </nav>

      <section className="gt-route-section gt-route-section--white gt-tamesis-map" id="sistema">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Proceso del caso</span><h2>Del material recibido salen dos rutas de aprovechamiento.</h2></div>
            <p>Los orgánicos se reciben y acondicionan. La fracción líquida alimenta la digestión anaerobia; la sólida continúa hacia estabilización y compostaje. Medir ambas rutas permite entender qué entra, qué se transforma y cuál es su destino.</p>
          </div>
          <figure className="gt-tamesis-map__figure" aria-labelledby="gt-tamesis-map-caption">
            <div className="gt-tamesis-map__diagram">
              <ol className="gt-tamesis-map__intake">
                <li><span>Entrada</span><strong>Orgánicos separados</strong><small>Recepción y acondicionamiento de la biomasa.</small></li>
                <li><span>Preparación</span><strong>Molienda e hidrólisis en dos etapas</strong><small>El proceso genera corrientes sólida y líquida.</small></li>
              </ol>
              <div className="gt-tamesis-map__split">
                <h3>La salida se organiza en dos rutas</h3>
                <div className="gt-tamesis-map__routes">
                  <article>
                    <span>Fracción líquida · percolado</span>
                    <strong>Digestión anaerobia en UASB</strong>
                    <p>El biogás capturado se mide y se evalúa para su aprovechamiento energético.</p>
                  </article>
                  <article>
                    <span>Fracción sólida</span>
                    <strong>Estabilización y compostaje</strong>
                    <p>La biomasa continúa por una ruta de aprovechamiento orgánico; su salida se gestiona según calidad y condiciones de operación.</p>
                  </article>
                </div>
              </div>
            </div>
            <figcaption>
              <strong id="gt-tamesis-map-caption">Lectura funcional del sistema</strong>
              <span>La biomasa acondicionada se separa en una ruta líquida para digestión anaerobia y otra sólida para estabilización y compostaje.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper gt-tamesis-technology" aria-labelledby="gt-tamesis-technology-title">
        <div className="container gt-tamesis-technology__grid">
          <figure className="gt-tamesis-technology__image">
            <Image
              src="/projects/tamesis/reactor-uasb.jpeg"
              alt="Reactor anaerobio UASB instalado en la infraestructura de aprovechamiento de Támesis."
              fill
              sizes="(max-width: 820px) 100vw, 48vw"
            />
            <figcaption>
              <strong>Reactor UASB · Támesis</strong>
              <span>Infraestructura integrada a la ruta de digestión anaerobia.</span>
            </figcaption>
          </figure>
          <div className="gt-tamesis-technology__copy">
            <span className="eyebrow">Tecnología en el territorio</span>
            <h2 id="gt-tamesis-technology-title">La infraestructura toma sentido cuando se conecta con la operación.</h2>
            <p>
              En Támesis, la preparación de la biomasa y la digestión anaerobia se integran en una
              misma cadena. El reactor UASB forma parte de la ruta líquida; su operación se relaciona
              con el manejo y la medición del biogás y con la gestión de las salidas del proceso.
            </p>
            <p>
              Esa lectura conjunta permite entender el papel de cada equipo, seguir el material entre
              etapas y orientar las decisiones de continuidad, mantenimiento y aprovechamiento.
            </p>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper" id="control">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Control de la operación</span><h2>La bioenergía necesita una bitácora, no una fotografía aislada.</h2></div>
            <p>Un reporte diario y un cierre mensual deben conectar recepción, tratamiento, biogás, energía, productos, consumos, incidentes y compromisos.</p>
          </div>
          <div className="gt-tamesis-records">
            {operatingRecords.map(([title, copy]) => (
              <article key={title}><h3>{title}</h3><p>{copy}</p></article>
            ))}
          </div>
          <div className="gt-tamesis-control-note">
            <div><span>Reporte diario</span><strong>Volúmenes, novedades, consumos, mantenimiento y alertas.</strong></div>
            <div><span>Seguimiento mensual</span><strong>Balances, conciliación, decisiones, responsables y fechas límite.</strong></div>
          </div>
        </div>
      </section>

      <section className="gt-tamesis-impact" id="impacto">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div>
              <span className="eyebrow">{tamesisImpactScenario.eyebrow}</span>
              <h2>{tamesisImpactScenario.title}</h2>
            </div>
            <p>{tamesisImpactScenario.intro}</p>
          </div>
          <div className="gt-tamesis-impact__metrics">
            {tamesisImpactScenario.metrics.filter((metric) => metric.basis !== "Infraestructura existente").map((metric) => (
              <article key={metric.label}>
                <strong>{metric.value}</strong>
                <h3>{metric.label}</h3>
                <p>{metric.detail}</p>
                <small>{metric.basis}</small>
              </article>
            ))}
          </div>
          <div className="gt-tamesis-impact__method">
            <div>
              <span>Cómo se valida</span>
              <p>{tamesisImpactScenario.method}</p>
            </div>
            <div className="button-row">
              <Link className="button button--dark" href="/contacto/?servicio=clima-carbono&perfil=clima&diagnostico=Evaluar%20escenario%20potencial%20de%20CO%E2%82%82e%20en%20T%C3%A1mesis&prioridad=L%C3%ADnea%20base%2C%20entradas%2C%20biog%C3%A1s%20medido%2C%20energ%C3%ADa%2C%20emisiones%20del%20proceso%2C%20digestatos%20y%20periodo">Evaluar el escenario de GEI</Link>
              <Link className="button button--ghost" href="/impacto/#impacto-tamesis">Ver metodología de impacto</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white" id="siguiente">
        <div className="container">
          <div className="gt-route-heading"><span className="eyebrow">Qué falta consolidar</span><h2>Cuatro frentes conectan la capacidad instalada con un valor verificable.</h2><p>La infraestructura existe; el siguiente trabajo es sostener la operación y documentar las entradas, los resultados y los destinos de cada ruta.</p></div>
          <div className="gt-tamesis-consolidation">
            {consolidation.map((item) => (
              <article key={item.label}><span>{item.label}</span><h3>{item.title}</h3><p>{item.copy}</p></article>
            ))}
          </div>
          <aside className="gt-tamesis-next-step" aria-labelledby="gt-tamesis-next-step-title">
            <div>
              <span>¿Estás evaluando una planta existente?</span>
              <h3 id="gt-tamesis-next-step-title">Primero revisemos continuidad, datos y destinos.</h3>
              <p>El alcance se define con el estado de la infraestructura, la operación y la información disponible. <Link href="/servicios/rehabilitacion-infraestructura/?perfil=municipio">Conoce cómo evaluamos una planta existente.</Link> <Link href="/portafolio/valorizacion/">Conoce también la ruta de biofábrica y valorización.</Link></p>
            </div>
            <div className="button-row">
              <ServiceAudienceLink className="button button--dark" href="/contacto/?servicio=rehabilitacion-infraestructura&perfil=municipio&diagnostico=Evaluar%20una%20planta%20existente%20en%20T%C3%A1mesis&prioridad=Continuidad%20operativa%20%C2%B7%20balances%20%C2%B7%20destinos%20de%20valorizaci%C3%B3n" preferIncomingProfile>Evaluar una planta existente</ServiceAudienceLink>
              <Link className="button button--ghost" href="/app/">Explorar GREENATICS OPS</Link>
            </div>
          </aside>
          </div>
      </section>
    </>
  );
}
