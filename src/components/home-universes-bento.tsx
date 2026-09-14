import Image from "next/image";
import Link from "next/link";

const capabilities = [
  {
    number: "01",
    name: "Estructuramos",
    description: "Convertimos una necesidad ambiental en una decisión con línea base, alternativas, riesgos y ruta de implementación.",
    scope: "Diagnóstico · viabilidad · modelo operativo",
    outcome: "Una decisión defendible antes de invertir.",
  },
  {
    number: "02",
    name: "Implementamos",
    description: "Ponemos en marcha rutas, infraestructura y bioprocesos dimensionados para el suministro y la capacidad operativa real.",
    scope: "Microrrutas · plantas · puesta en marcha",
    outcome: "Una cadena física lista para iniciar y aprender.",
  },
  {
    number: "03",
    name: "Acompañamos",
    description: "Operamos directamente o transferimos capacidad al equipo local para sostener calidad, seguridad y continuidad.",
    scope: "Dirección técnica · POE · formación",
    outcome: "Rutinas, responsables y criterio instalados.",
  },
  {
    number: "04",
    name: "Medimos",
    description: "Transformamos la operación diaria en trazabilidad, indicadores y decisiones de mejora.",
    scope: "GREENATICS OPS · lotes · reportes",
    outcome: "Evidencia que permite corregir y demostrar.",
  },
  {
    number: "05",
    name: "Valorizamos",
    description: "Conectamos compost, biogás, bioenergía, bioles y nutrición Wondergreen con usos y salidas de valor.",
    scope: "Productos · aplicación · mercado",
    outcome: "Materia y energía que regresan al territorio.",
  },
] as const;

const audiences = [
  {
    label: "Municipios y ESP",
    title: "Gestión territorial que sí llega a operación",
    description: "Rutas selectivas, plantas, dirección técnica, trazabilidad y soporte regulatorio conectados en un solo modelo.",
    outcomes: "Desvío · eficiencia logística · vida útil · reportabilidad",
    decision: "Definir si el territorio debe diagnosticar, rehabilitar, operar o escalar.",
    image: "/projects/routes/route-evidence-01.webp",
    imageAlt: "Operación municipal de recolección selectiva de residuos orgánicos",
    href: "/municipios/",
    cta: "Explorar ruta territorial",
  },
  {
    label: "Empresas",
    title: "Cumplimiento que también crea eficiencia",
    description: "Programas para grandes generadores con separación, recolección, aprovechamiento y evidencia lista para reportar.",
    outcomes: "PMIRS · costos · indicadores · trazabilidad",
    decision: "Caracterizar la corriente y separar responsabilidades internas y externas.",
    image: "/projects/routes/route-evidence-11.webp",
    imageAlt: "Acompañamiento durante la entrega separada de residuos orgánicos",
    href: "/empresas/",
    cta: "Explorar ruta empresarial",
  },
  {
    label: "Agroindustria",
    title: "Subproductos convertidos en nuevas capacidades",
    description: "Caracterización, tratamiento, digestión anaerobia, biogás, bioenergía, productos y trazabilidad.",
    outcomes: "Tratamiento · energía · productos · control",
    decision: "Elegir el proceso a partir de composición, continuidad, escala y salida esperada.",
    image: "/projects/tamesis/reactor-uasb.jpeg",
    imageAlt: "Reactor anaerobio UASB para valorización de corrientes orgánicas",
    href: "/agroindustria/",
    cta: "Explorar ruta agroindustrial",
  },
  {
    label: "Agro y distribución",
    title: "Valorización conectada con productividad",
    description: "Nutrición Wondergreen, protocolos por cultivo, herramientas agronómicas y acompañamiento comercial.",
    outcomes: "Suelo · nutrición · aplicación · seguimiento",
    decision: "Definir cultivo, lote, etapa y objetivo antes de seleccionar el producto.",
    image: "/guides/guia-cafe-cover.webp",
    imageAlt: "Guía técnica Wondergreen para nutrición del cultivo de café",
    href: "/wondergreen/",
    cta: "Explorar Wondergreen",
  },
  {
    label: "Casa, jardín y huertas",
    title: "Bioeconomía que también llega al hogar",
    description: "Productos, kits, diagnóstico y guías para cuidar plantas de interior, jardines, viveros y huertas urbanas.",
    outcomes: "Suelo vivo · crecimiento · floración · cosecha",
    decision: "Identificar el tipo de planta y su etapa antes de aplicar nutrición.",
    image: "/guides/home-garden-casa-jardin-cover.webp",
    imageAlt: "Guía Wondergreen Casa y Jardín organizada por etapas de las plantas",
    href: "/casa-jardin/",
    cta: "Explorar Casa y Jardín",
  },
] as const;

export function HomeUniversesBento() {
  return (
    <section className="home-system-map" aria-labelledby="system-map-title">
      <div className="container">
        <div className="home-system-map__heading">
          <div>
            <span className="eyebrow">El sistema Greenatics</span>
            <h2 id="system-map-title">Cinco capacidades convierten una intención circular en una operación completa.</h2>
          </div>
          <div className="home-system-map__promise">
            <span>Una responsabilidad compartida</span>
            <strong>Greenatics puede operar, compartir la operación o fortalecer al equipo responsable.</strong>
            <p>
              No entregamos piezas desconectadas: articulamos personas, infraestructura,
              biología y datos alrededor de una operación que debe sostenerse en el tiempo.
            </p>
          </div>
        </div>

        <div className="home-capability-story">
          <div className="home-capability-story__visual">
            <figure>
              <Image src="/projects/plant/plant-evidence-05.webp" alt="Pilas de transformación orgánica en una planta operada por Greenatics" fill sizes="(max-width: 900px) 100vw, 42vw" />
              <figcaption><span>Operación real</span><strong>La circularidad ocurre cuando la estrategia llega al turno, al proceso y al producto.</strong></figcaption>
            </figure>
            <div className="home-capability-story__thesis"><span>Una cadena de responsabilidad</span><p>Diagnosticar sin implementar deja un documento. Implementar sin acompañar deja infraestructura vulnerable. Operar sin medir impide aprender. Valorizar sin calidad ni destino solo traslada el problema.</p></div>
          </div>
          <ol className="home-capability-track">
            {capabilities.map((capability) => (
              <li key={capability.number}>
                <span>{capability.number}</span>
                <div><h3>{capability.name}</h3><small>{capability.scope}</small></div>
                <div><p>{capability.description}</p><strong>{capability.outcome}</strong></div>
              </li>
            ))}
          </ol>
        </div>

        <div className="home-system-loop" aria-label="Lógica de integración Greenatics">
          <span className="home-system-loop__label">La lógica de integración</span>
          <ol>
            <li><b>01</b><strong>Señal</strong><small>El territorio muestra una necesidad.</small></li>
            <li><b>02</b><strong>Decisión</strong><small>La línea base ordena las alternativas.</small></li>
            <li><b>03</b><strong>Operación</strong><small>La ruta, la planta y el equipo actúan.</small></li>
            <li><b>04</b><strong>Evidencia</strong><small>Los datos permiten revisar y mejorar.</small></li>
            <li><b>05</b><strong>Valor</strong><small>Materia, energía y productos regresan al sistema.</small></li>
          </ol>
        </div>

        <div className="home-audience-paths__heading">
          <span>Cinco puertas de entrada</span>
          <h3>Un mismo sistema, configurado para decisiones diferentes.</h3>
        </div>

        <div className="home-audience-paths">
          {audiences.map((audience, index) => (
            <article key={audience.href}>
              <figure><Image src={audience.image} alt={audience.imageAlt} fill sizes={index < 3 ? "(max-width: 900px) 100vw, 33vw" : "(max-width: 900px) 100vw, 50vw"} /></figure>
              <div className="home-audience-paths__body">
                <div className="home-audience-paths__meta"><span>0{index + 1}</span><small>{audience.label}</small></div>
                <h3>{audience.title}</h3>
                <p>{audience.description}</p>
                <div className="home-audience-paths__decision"><span>Primera decisión</span><strong>{audience.decision}</strong></div>
                <small className="home-audience-paths__outcomes">{audience.outcomes}</small>
                <Link href={audience.href}>{audience.cta} <span aria-hidden="true">→</span></Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
