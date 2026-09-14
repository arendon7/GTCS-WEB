import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Caso Támesis | UASB, biogás y bioenergía",
  description:
    "Caso Greenatics en Támesis: ruta selectiva, reactor anaerobio UASB, captura de biogás, bioenergía, compostaje y control operativo.",
  alternates: { canonical: "/proyectos/tamesis/" },
};

const systemSteps = [
  ["01", "Recibir", "La ruta selectiva entrega orgánicos que se pesan, inspeccionan y reseleccionan antes de entrar al sistema.", "Corriente aceptada, cuantificada y trazable"],
  ["02", "Preparar", "La molienda aumenta el área disponible y los dos reactores de hidrólisis separan las corrientes líquida y sólida.", "Biomasa acondicionada para dos rutas de valor"],
  ["03", "Digerir", "El percolado alimenta el reactor anaerobio UASB de 30 m³, donde la materia orgánica se convierte biológicamente.", "Conversión anaerobia estable y controlable"],
  ["04", "Capturar", "La red de conducción, los filtros, el medidor y la bolsa de almacenamiento permiten controlar el biogás producido.", "Gas medido, acondicionado y disponible"],
  ["05", "Aprovechar", "El biogás se convierte en bioenergía y la fracción sólida continúa hacia estabilización y compostaje.", "Energía útil y productos orgánicos aprovechables"],
  ["06", "Controlar", "Pesajes, bitácoras, consumos, mantenimiento, evidencias y alertas convierten el proceso en una operación gestionable.", "Balance de masa, gas, energía y decisiones"],
] as const;

const operatingRecords = [
  ["Entradas", "Toneladas recibidas, origen, fecha, calidad del material e impropios."],
  ["Tratamiento", "Lotes, alimentación al sistema, tiempos, novedades y toneladas tratadas."],
  ["Biogás y energía", "Volumen producido y capturado, calidad, destino y energía útil obtenida."],
  ["Salidas", "Compost, líquidos estabilizados, inventario, entregas y rechazo devuelto."],
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
    copy: "Roles, entradas, salidas, uso del espacio, reportes, conciliación y soportes documentales permiten consolidar la relación con la ESP y avanzar en NUIT.",
  },
] as const;

const gallery = [
  {
    src: "/projects/tamesis/ruta-selectiva.jpeg",
    alt: "Ruta selectiva de residuos orgánicos en el casco urbano de Támesis",
    title: "La planta empieza en la calle",
    caption: "La calidad de la corriente se construye con separación, recolección diferenciada e inspección en ruta.",
  },
  {
    src: "/projects/tamesis/recepcion-organicos.jpg",
    alt: "Residuos orgánicos recibidos durante la ruta selectiva de Támesis",
    title: "Materia prima bajo inspección",
    caption: "El registro de orgánicos e impropios permite intervenir la fuente y proteger los procesos biológicos.",
  },
  {
    src: "/projects/tamesis/reactor-uasb.jpeg",
    alt: "Vista aérea del reactor anaerobio UASB y el área de recepción en Támesis",
    title: "Infraestructura anaerobia existente",
    caption: "El reactor UASB forma parte de una secuencia que integra hidrólisis, digestión, captura de gas y salidas aprovechables.",
  },
  {
    src: "/projects/tamesis/paisaje-tamesis.jpg",
    alt: "Paisaje rural alrededor de la planta de aprovechamiento de Támesis",
    title: "Una solución vinculada al territorio",
    caption: "El valor final aparece cuando la gestión de residuos, la energía y la producción agrícola vuelven a conectarse localmente.",
  },
] as const;

export default function TamesisPage() {
  return (
    <>
      <section className="gt-case-hero gt-tamesis-hero">
        <div className="container gt-case-hero__grid">
          <div className="gt-case-hero__copy">
            <Link className="gt-case-back" href="/proyectos/">Proyectos / Caso Támesis</Link>
            <span className="eyebrow eyebrow--light">Operación existente · Suroeste de Antioquia</span>
            <h1>Támesis transforma orgánicos en fertilizantes, biogás y bioenergía.</h1>
            <p className="lead">
              La planta integra ruta selectiva, preparación de la biomasa, hidrólisis, un reactor
              anaerobio UASB, captura y acondicionamiento de biogás, aprovechamiento energético y
              compostaje. El siguiente salto no es empezar de cero: es consolidar, medir y ampliar el
              valor de lo que ya está operando.
            </p>
            <div className="button-row">
              <a className="button button--light" href="#sistema">Entender el sistema</a>
              <a className="button button--outline-light" href="#control">Ver control operativo</a>
            </div>
          </div>

          <div className="gt-case-hero__visual">
            <figure className="gt-case-hero__main-image gt-tamesis-hero__main">
              <Image
                src="/projects/tamesis/reactor-uasb.jpeg"
                alt="Reactor UASB y áreas de proceso de la planta de Támesis"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <figcaption>
                <strong>El reactor UASB ya forma parte de la operación</strong>
                <span>Digestión anaerobia, producción y captura de biogás en una planta integrada.</span>
              </figcaption>
            </figure>
            <figure className="gt-case-hero__inset gt-tamesis-hero__inset">
              <Image
                src="/projects/tamesis/ruta-selectiva.jpeg"
                alt="Recolección selectiva de residuos orgánicos en Támesis"
                fill
                sizes="(max-width: 900px) 42vw, 17vw"
              />
              <figcaption>Ruta selectiva municipal</figcaption>
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
          <div><strong>Bioenergía</strong><span>Aprovechamiento energético en operación</span></div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container gt-case-context">
          <div className="gt-case-context__heading">
            <span className="eyebrow">La lectura actual</span>
            <h2>No es una planta por rescatar. Es una operación por consolidar.</h2>
          </div>
          <div className="gt-case-context__body">
            <p className="lead">
              Támesis ya cuenta con activos, conocimiento acumulado y una cadena de aprovechamiento en
              marcha. El reto consiste en hacer más confiables las entradas, estabilizar la operación,
              documentar sus balances y convertir el biogás y los productos en valor verificable.
            </p>
            <blockquote>
              <span>Decisión de proyecto</span>
              <strong>Ordenar lo que funciona para llevarlo a su siguiente nivel.</strong>
              <p>La formalización, los datos y el mantenimiento protegen tanto el proceso biológico como la relación institucional.</p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="gt-case-system gt-tamesis-system" id="sistema">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-route-heading--light">
            <div><span className="eyebrow eyebrow--light">Cadena de transformación</span><h2>De la ruta selectiva a dos ciclos de valor.</h2></div>
            <p>La fracción sólida avanza hacia compostaje y fertilizantes. La fracción líquida alimenta la digestión anaerobia para producir biogás, bioenergía y efluentes estabilizados.</p>
          </div>
          <ol className="gt-case-system__steps gt-tamesis-system__steps">
            {systemSteps.map(([number, title, copy, outcome]) => (
              <li key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p><em><small>Resultado operativo</small>{outcome}</em></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white gt-tamesis-map">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Arquitectura existente</span><h2>El UASB no trabaja solo.</h2></div>
            <p>La confiabilidad depende del conjunto: recepción, molienda, hidrólisis, tanque pulmón, reactor, efluente, manejo de gas, compostaje y almacenamiento.</p>
          </div>
          <figure className="gt-tamesis-map__figure">
            <div>
              <Image
                src="/projects/tamesis/sistema-uasb.png"
                alt="Esquema visual de los componentes de la planta Greenatics en Támesis"
                fill
                sizes="(max-width: 900px) 100vw, 1240px"
              />
            </div>
            <figcaption>
              <strong>Lectura funcional de la planta</strong>
              <span>Esquema visual basado en el levantamiento del sistema. Sirve para explicar componentes y flujos; no reemplaza planos de ingeniería.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper" id="control">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Control de la operación</span><h2>La bioenergía necesita una bitácora, no una fotografía aislada.</h2></div>
            <p>Un reporte diario y un cierre mensual deben conectar recepción, tratamiento, biogás, energía, productos, consumos, incidentes y compromisos.</p>
          </div>
          <div className="gt-tamesis-records">
            {operatingRecords.map(([title, copy], index) => (
              <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>
            ))}
          </div>
          <div className="gt-tamesis-control-note">
            <div><span>Reporte diario</span><strong>Volúmenes, novedades, consumos, mantenimiento y alertas.</strong></div>
            <div><span>Seguimiento mensual</span><strong>Balances, conciliación, decisiones, responsables y fechas límite.</strong></div>
          </div>
        </div>
      </section>

      <section className="gt-case-gallery gt-tamesis-gallery">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-route-heading--light">
            <div><span className="eyebrow eyebrow--light">Evidencia territorial</span><h2>Una cadena que conecta municipio, planta y paisaje productivo.</h2></div>
            <p>Registro visual de la ruta, la materia prima y la infraestructura real que sostiene el caso Támesis.</p>
          </div>
          <div className="gt-case-gallery__grid">
            {gallery.map((item, index) => (
              <figure className={index === 0 ? "gt-case-gallery__feature" : undefined} key={item.src}>
                <div><Image src={item.src} alt={item.alt} fill sizes={index === 0 ? "(max-width: 900px) 100vw, 52vw" : "(max-width: 900px) 100vw, 25vw"} /></div>
                <figcaption><strong>{item.title}</strong><span>{item.caption}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading"><span className="eyebrow">Siguiente etapa</span><h2>Cuatro frentes para multiplicar el valor de la planta.</h2><p>Consolidar no significa frenar la ambición. Significa crear las condiciones para que la energía, los productos y el impacto puedan crecer con trazabilidad.</p></div>
          <div className="gt-tamesis-consolidation">
            {consolidation.map((item, index) => (
              <article key={item.label}><span>{String(index + 1).padStart(2, "0")} · {item.label}</span><h3>{item.title}</h3><p>{item.copy}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-case-learning gt-tamesis-closing">
        <div className="container gt-case-learning__grid">
          <div><span className="eyebrow eyebrow--light">Aprendizaje transferible</span><h2>Una planta anaerobia puede ser infraestructura ambiental y energética.</h2></div>
          <div>
            <p>Támesis demuestra que los residuos orgánicos pueden alimentar simultáneamente una estrategia de saneamiento, producción de bioinsumos y generación de energía renovable.</p>
            <p>El potencial se vuelve defendible cuando cada entrada, conversión y salida conserva evidencia operativa.</p>
            <div className="button-row"><Link className="button button--light" href="/app/">Conocer Greenatics OPS</Link><Link className="button button--outline-light" href="/contacto/?interes=solucion&perfil=municipio&diagnostico=Consolidar%20una%20planta%20anaerobia%20en%20T%C3%A1mesis&prioridad=UASB%20%C2%B7%20captura%20de%20biog%C3%A1s%20%C2%B7%20bioenerg%C3%ADa%20%C2%B7%20control%20operativo">Conversar sobre una planta</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
