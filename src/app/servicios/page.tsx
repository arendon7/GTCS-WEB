import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getYarumalClaim } from "@/data/claims";
import { services, type ServiceCategory, type ServiceSlug } from "@/data/services";
import { getServiceVisual } from "@/data/service-visuals";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Consultoría técnica y ciencia aplicada para municipios, empresas, grandes generadores y agroindustrias: diagnóstico, proyectos, infraestructura y operación.",
  alternates: { canonical: "/servicios/" },
};

const categories: ServiceCategory[] = ["Planeación", "Recolección", "Infraestructura", "Operación", "Datos", "Valorización"];
const serviceYarumalClaims = [
  getYarumalClaim("monthly-diversion"),
  getYarumalClaim("reception-purity"),
];
const categoryAnchors: Record<ServiceCategory, string> = {
  Planeación: "planeacion",
  Recolección: "recoleccion",
  Infraestructura: "infraestructura",
  Operación: "operacion",
  Datos: "datos",
  Valorización: "valorizacion",
};

const categoryVisuals: Record<ServiceCategory, { src: string; alt: string; caption: string; fit?: "cover" | "contain" }> = {
  Planeación: { src: "/services/pmirs-large-generators-editorial.jpg", alt: "Separación de residuos orgánicos en una unidad residencial y un gran generador.", caption: "Ordenar corrientes y responsables permite definir acciones de PGIRS y PMIRS." },
  Recolección: { src: "/projects/routes/motocarguero-verde-operacion-real.webp", alt: "Representación del motocarguero sobre base Ceronte con contenedor diseñado por Greenatics para recolección selectiva.", caption: "El recorrido, la carga y la recepción se evalúan como partes de una misma operación." },
  Infraestructura: getServiceVisual({ slug: "plantas-modulares" }),
  Operación: { src: "/services/operation-follow-up-concept-v1.jpg", alt: "Profesional revisa una pila de compostaje con libreta y sonda.", caption: "Observar variables del proceso ayuda a orientar ajustes de operación.", fit: "cover" },
  Datos: { src: "/tools/digital-tools-field-v1.jpg", alt: "Dos profesionales revisan información en una tableta junto a material orgánico en tratamiento.", caption: "Los registros de operación ayudan a relacionar lo que ocurre en planta con decisiones técnicas.", fit: "cover" },
  Valorización: { src: "/services/organic-valorization-concept-v1.jpg", alt: "Compost aplicado en un cultivo junto a infraestructura de aprovechamiento.", caption: "Las alternativas se estudian desde la biomasa, el proceso y el uso previsto.", fit: "cover" },
};

const categoryContent: Record<ServiceCategory, { title: string; intro: string; related?: { id: string; title: string; summary: string; href: string; followUp?: { copy: string; title: string; href: string } }[] }> = {
  Planeación: {
    title: "Saber qué proyecto tiene sentido antes de invertir.",
    intro: "Leemos la corriente y la escala del problema para decidir qué conviene estudiar o planificar.",
  },
  Recolección: {
    title: "Asegurar entregas selectivas y previsibles para la planta.",
    intro: "Del punto de separación a la recepción: diseñamos una ruta que responde al proceso y a la capacidad de tratamiento.",
    related: [{ id: "recoleccion-recurrente", title: "Recolección, trazabilidad y tratamiento recurrentes", summary: "Conectamos generadores, retiro periódico, recepción y tratamiento en un alcance acordado para cada operación.", href: "/servicios/recoleccion-tratamiento/" }],
  },
  Infraestructura: {
    title: "Dimensionar infraestructura para lo que llega y puede operarse.",
    intro: "Ajustamos el diseño a la biomasa, el predio y la capacidad local; también evaluamos instalaciones existentes.",
    related: [{ id: "rehabilitacion-infraestructura", title: "Planta en Marcha · rehabilitación de infraestructura existente", summary: "Evaluamos estado, proceso y registros para priorizar intervenciones y definir condiciones de arranque.", href: "/servicios/rehabilitacion-infraestructura/" }],
  },
  Operación: {
    title: "Sostener la calidad del proceso día a día.",
    intro: "Definimos responsables y rutinas para sostener el proceso y responder a sus variables críticas.",
    related: [{ id: "optimizacion-composteras", title: "Optimización técnica de composteras", summary: "Revisamos materiales, mezcla, humedad, aireación y maduración para ajustar un compostaje que ya está en marcha. El acompañamiento no sustituye la rehabilitación de infraestructura ni la operación física diaria.", href: "/servicios/optimizacion-composteras/" }],
  },
  Datos: {
    title: "Tener una lectura confiable de la operación.",
    intro: "Los registros sirven cuando conectan la actividad diaria con evidencia útil para decidir.",
  },
  Valorización: {
    title: "Convertir biomasa en productos, energía y valor para el territorio.",
    intro: "Definimos la salida según biomasa, proceso y uso: aprovechamiento material, energía o aplicación agronómica.",
    related: [{
      id: "desarrollo-productos-derivados",
      title: "Desarrollo técnico de productos derivados",
      summary: "Para desarrollar un producto definido, evaluamos formulación, proceso, calidad y ruta regulatoria, fuera del catálogo Wondergreen vigente.",
      href: "/contacto/?servicio=desarrollo-productos-derivados",
      followUp: {
        copy: "Si primero necesitas probar biomasa y proceso para decidir si avanzar, ajustar o detener, conoce la ruta de pilotos.",
        title: "Piloto de I+D+i agroindustrial",
        href: "/contacto/?servicio=idi-agroindustrial",
      },
    }],
  },
};

const serviceIndexCtas: Record<ServiceSlug, string> = {
  "diagnostico-residuos": "Ver aforos y entregables",
  "pgirs-pmirs": "Distinguir PGIRS y PMIRS",
  "microrrutas-motocarguero": "Ver diseño de microrrutas",
  "plantas-modulares": "Ver fases de ingeniería",
  "operacion-delegada": "Comparar modalidades de operación",
  "greenatics-ops": "Conocer GREENATICS OPS",
  "aprovechamiento-productivo": "Explorar rutas de valorización",
  "programas-wondergreen": "Conocer el acompañamiento agronómico",
};

const agronomicProgram = services.find((service) => service.slug === "programas-wondergreen");
const agronomicVisual = agronomicProgram ? getServiceVisual(agronomicProgram) : undefined;

const specialistCapabilities = [
  {
    title: "Preparar una decisión técnica, económica o regulatoria",
    copy: "Comparamos alternativas, ordenamos evidencia y revisamos qué exige cada caso antes de definir el siguiente paso.",
    services: [
      { title: "Prefactibilidad técnica y económica", summary: "Comparamos alternativas y estimaciones preliminares de inversión y operación para decidir si avanzar.", href: "/contacto/?servicio=prefactibilidad" },
      { title: "Clima, carbono y reportabilidad", summary: "Definimos alcance y línea base, revisamos datos y factores, y preparamos reportes con supuestos trazables.", href: "/contacto/?servicio=clima-carbono", secondaryLink: { title: "Organizar el inventario con Back 2 Green", href: "/huella/" } },
      { title: "Preparación SUI", summary: "Ordenamos fuentes y soportes por prestador y periodo y revisamos su consistencia antes del reporte.", href: "/contacto/?servicio=preparacion-sui" },
      { title: "Auditoría y aseguramiento técnico", summary: "Contrastamos registros, balances, procedimientos y evidencias para ubicar brechas y orientar acciones.", href: "/contacto/?servicio=aseguramiento-tecnico" },
      { title: "Acompañamiento jurídico y regulatorio para residuos, plantas y ESP", summary: "Trazamos una ruta según las obligaciones y jurisdicción aplicables; la decisión final corresponde a la autoridad.", href: "/contacto/?servicio=regulatorio-residuos-esp" },
      { title: "Estructuración técnico-documental para remunerar el tratamiento", summary: "Conectamos contrato, costos, operación y soportes; el reconocimiento y el recaudo dependen de cada caso.", href: "/contacto/?servicio=remuneracion-tratamiento" },
      { title: "Estructuración técnico-económica y financiera de proyectos", summary: "Ordenamos inversión, costos, riesgos y capital requerido. Complementa la prefactibilidad y no garantiza financiación.", href: "/contacto/?servicio=estructuracion-financiera", secondaryLink: { title: "Explorar prefactibilidad e ingeniería", href: "/servicios/plantas-modulares/#fases-del-proyecto" } },
    ],
    resources: [
      { title: "Metodología de impacto", href: "/impacto/" },
      { title: "Revisión preliminar SUI", href: "/soluciones/auditoria-sui/" },
    ],
  },
  {
    title: "Desarrollar y coordinar el proyecto",
    copy: "Acompañamos al propietario para conectar diseño, compras, pruebas y puesta en marcha.",
    services: [
      { title: "Gerencia técnica e ingeniería del propietario", summary: "Coordinamos entregables, interfaces e hitos desde el lado del propietario. El diseño de cada disciplina y la obra siguen bajo sus contratos responsables.", href: "/contacto/?servicio=gerencia-tecnica" },
    ],
  },
  {
    title: "Probar alternativas y llevarlas al trabajo cotidiano",
    copy: "Probamos rutas de bioeconomía y acompañamos a equipos y comunidades para incorporar lo aprendido.",
    services: [
      { title: "I+D+i agroindustrial y bioeconomía · pilotos", summary: "Probamos biomasa y proceso para decidir si conviene avanzar, ajustar o detener un desarrollo.", href: "/contacto/?servicio=idi-agroindustrial" },
      { title: "Educación, adopción y transferencia", summary: "Formamos y acompañamos a equipos para incorporar procedimientos y prácticas a su trabajo diario.", href: "/contacto/?servicio=educacion-adopcion" },
    ],
    resources: [{ title: "Conocer la tecnología Greenatics", href: "/tecnologia/" }],
  },
] as const;

const tamesisCase = {
  title: "Tratamiento anaerobio, biogás y bioenergía.",
  copy: "La ruta conecta recolección selectiva, acondicionamiento, digestión anaerobia, reactor UASB, captura de biogás y aprovechamiento energético. El caso distingue la infraestructura instalada de los rangos de diseño y del escenario preliminar de CO₂e; la ficha explica sus bases y límites.",
  href: "/proyectos/tamesis/",
} as const;

export default function ServicesPage() {
  return (
    <>
      <section className="gt-service-hero gt-service-hero--index">
        <div className="container gt-service-hero__grid">
          <div className="gt-service-hero__copy">
            <span className="eyebrow eyebrow--light">Capacidades contratables</span>
            <h1>Consultoría y ciencia aplicada, del diagnóstico a la operación.</h1>
            <p className="lead">Acompañamos a municipios, empresas de servicios públicos, grandes generadores y agroindustrias a entender sus retos y traducirlos en proyectos, infraestructura y rutinas operativas. Combinamos conocimiento del sector aseo, ciencia aplicada y experiencia técnica; el alcance parte de cada contexto.</p>
            <div className="button-row">
              <Link className="button button--light" href="#familias-de-servicios">Explorar familias de servicios</Link>
              <Link className="button button--outline-light" href="/diagnostico/">Definir el punto de partida</Link>
            </div>
          </div>
          <figure className="gt-service-hero__figure gt-service-hero__figure--editorial">
            <Image src="/services/service-consulting-editorial.webp" alt="Tres profesionales revisan material orgánico y una muestra en un área de compostaje." fill priority sizes="(max-width: 900px) 100vw, 48vw" />
            <figcaption><strong>La solución empieza por entender el contexto.</strong></figcaption>
          </figure>
        </div>
      </section>

      <nav className="gt-service-nav" id="familias-de-servicios" aria-label="Familias de servicios">
        <div className="container">
          {categories.map((category) => <a key={category} href={`#${categoryAnchors[category]}`}>{category}</a>)}
        </div>
      </nav>

      {categories.map((category) => {
        const items = services.filter((service) => service.category === category && service.slug !== "programas-wondergreen");
        const content = categoryContent[category];
        const relatedRoutes = content.related?.flatMap((service) => [
          {
            id: service.id,
            copy: service.summary,
            title: service.title,
            href: service.href,
          },
          ...(service.followUp ? [{
            id: `${service.id}-follow-up`,
            copy: service.followUp.copy,
            title: service.followUp.title,
            href: service.followUp.href,
          }] : []),
        ]);
        return (
          <section
            className="gt-service-category"
            key={category}
            id={categoryAnchors[category]}
            aria-labelledby={`service-category-${categoryAnchors[category]}-heading`}
          >
            <div className="container">
              <header className="gt-service-category__head">
                <div className="gt-service-category__copy">
                  <small>{category}</small>
                  <h2 id={`service-category-${categoryAnchors[category]}-heading`}>{content.title}</h2>
                  <p>{content.intro}</p>
                </div>
              </header>
              <div className={`gt-service-offers${items.length === 1 ? " gt-service-offers--single" : " gt-service-offers--pair"}`}>
                {items.map((service, index) => {
                  const offerSummary = service.slug === "microrrutas-motocarguero"
                    ? "Diseñamos la ruta entre generadores y recepción y evaluamos la integración del motocarguero al territorio. Si se contrata un piloto, acordamos los registros para evaluar la calidad del material y los costos operativos."
                    : service.summary;
                  return (
                    <article className={`gt-service-offer${index === 0 ? " gt-service-offer--featured" : ""}`} key={service.slug}>
                      {index === 0 && <figure className={`gt-service-offer__visual${categoryVisuals[category].src.endsWith(".svg") ? " gt-service-offer__visual--diagram" : ""}`}>
                        <Image
                          src={categoryVisuals[category].src}
                          alt={categoryVisuals[category].alt}
                          width={640}
                          height={400}
                          sizes="(max-width: 760px) 100vw, (max-width: 1100px) 38vw, 420px"
                          style={{ objectFit: categoryVisuals[category].src.endsWith(".svg") ? "contain" : categoryVisuals[category].fit ?? "cover" }}
                        />
                        <figcaption>{categoryVisuals[category].caption}</figcaption>
                      </figure>}
                      <div className="gt-service-offer__copy">
                        <h3>{service.name}</h3>
                        <p className={offerSummary.length >= 170 ? "gt-service-offer__prose--long" : undefined}>{offerSummary}</p>
                        <Link className="gt-service-offer__action" href={`/servicios/${service.slug}/`}>
                          {serviceIndexCtas[service.slug]} <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
              {relatedRoutes && <aside
                className={`gt-service-category__related${relatedRoutes.length > 1 ? " gt-service-category__related--pair" : ""}`}
                aria-label={`Rutas que complementan: ${content.title}`}
              >
                {relatedRoutes.map((route) => <div
                  className="gt-service-category__related-entry"
                  id={route.id}
                  key={route.href}
                >
                  <p className={route.copy.length >= 200 ? "gt-service-category__related-copy--long" : "gt-service-category__related-copy"}>{route.copy}</p>
                  <Link className="gt-service-category__related-action" href={route.href}>{route.title}<span aria-hidden="true"> →</span></Link>
                </div>)}
              </aside>}
            </div>
          </section>
        );
      })}

      {agronomicProgram && agronomicVisual && <section className="gt-service-agronomy" id="acompanamiento-agronomico" aria-labelledby="gt-service-agronomy-title">
        <div className="container gt-service-agronomy__grid">
          <div className="gt-service-agronomy__copy">
            <h2 id="gt-service-agronomy-title">{agronomicProgram.name}</h2>
            <p>Acompañamos a productores, asociaciones y agroindustrias con programas de nutrición por cultivo y etapa. Leemos suelo, agua, manejo y objetivo productivo para orientar qué evaluar; cuando la evidencia lo respalda, la ruta puede integrar compost, fertilizantes organominerales ocluidos de liberación gradual, líquidos y bioinsumos.</p>
            <p className="gt-service-agronomy__boundary">El ensayo y seguimiento se acuerdan para cada proyecto. Dosis y aplicación siguen la ficha y etiqueta vigentes; las metas de huella o carbono requieren línea base y medición.</p>
            <div className="gt-service-agronomy__actions">
              <Link className="button button--dark" href={`/servicios/${agronomicProgram.slug}/`}>{serviceIndexCtas[agronomicProgram.slug]} <span aria-hidden="true">→</span></Link>
              <Link href="/wondergreen/cultivos/">Explorar programas por cultivo <span aria-hidden="true">→</span></Link>
              <Link href="/wondergreen/#productos">Explorar productos Wondergreen <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <figure className="gt-service-agronomy__visual">
            <div><Image src={agronomicVisual.src} alt={agronomicVisual.alt} fill sizes="(max-width: 760px) 100vw, 40vw" /></div>
            <figcaption>{agronomicVisual.caption}</figcaption>
          </figure>
        </div>
      </section>}

      <section className="gt-service-evidence" aria-labelledby="service-evidence-title">
        <div className="container">
          <header className="gt-service-evidence__head">
            <h2 id="service-evidence-title">Experiencia en operación territorial y aprovechamiento energético.</h2>
            <p>Yarumal reúne evidencia de separación, logística y compostaje. Támesis documenta una ruta de digestión anaerobia y biogás, con sus escenarios diferenciados de los resultados medidos.</p>
          </header>
          <div className="gt-service-evidence__grid">
            <article className="gt-service-evidence__yarumal">
              <figure className="gt-service-evidence__photo">
                <Image src="/projects/plant/plant-evidence-05.webp" alt="Pilas de compostaje bajo cubierta en Yarumal" width={1600} height={1067} sizes="(max-width: 980px) 100vw, 54vw" />
                <figcaption>Compostaje en hileras bajo cubierta en la planta de Yarumal.</figcaption>
              </figure>
              <div className="gt-service-evidence__case-head"><span>Yarumal · experiencia operativa</span><h3>Separación en la fuente, recolección selectiva y compostaje.</h3><Link href="/proyectos/yarumal/">Ver experiencia y datos →</Link></div>
              <div className="gt-service-evidence__metrics">
                {serviceYarumalClaims.map((claim) => <div key={claim.id}><strong>{claim.value}</strong><span>{claim.label}</span><small>{claim.context}</small></div>)}
              </div>
            </article>
            <article className="gt-service-evidence__tamesis">
              <figure className="gt-service-evidence__photo">
                <Image src="/projects/tamesis/reactor-uasb.jpeg" alt="Reactor UASB de la infraestructura de tratamiento anaerobio en Támesis" width={1824} height={1368} sizes="(max-width: 980px) 100vw, 38vw" />
                <figcaption>Támesis · reactor UASB dentro de una ruta de digestión anaerobia y biogás.</figcaption>
              </figure>
              <span>Támesis · infraestructura y escenario de diseño</span>
              <h3>{tamesisCase.title}</h3>
              <p>{tamesisCase.copy}</p>
              <Link href={tamesisCase.href}>Ver caso Támesis →</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="gt-service-capabilities" aria-labelledby="service-capabilities-title">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><h2 id="service-capabilities-title">¿Qué decisión necesitas preparar?</h2></div>
            <p>Explora el tipo de apoyo que se acerca a tu necesidad. El alcance se acuerda para el proyecto; no tienes que contratar etapas que no necesitas.</p>
          </div>
          <div className="gt-service-capabilities__list">
            {specialistCapabilities.map((capability) => {
              return (
                <article className={specialistCapabilities.indexOf(capability) === 0 ? "gt-service-capabilities__group gt-service-capabilities__group--primary" : "gt-service-capabilities__group"} key={capability.title}>
                  <div className="gt-service-capabilities__group-intro">
                    <h3>{capability.title}</h3>
                    <p className="gt-service-capabilities__intro">{capability.copy}</p>
                  </div>
                  <ul className="gt-service-capabilities__services">
                    {capability.services.map((service) => (
                      <li key={service.href}>
                        <Link href={service.href}>{service.title}<span aria-hidden="true"> →</span></Link>
                        <p className="gt-service-capabilities__service-summary">{service.summary}</p>
                        {"secondaryLink" in service && <Link className="gt-service-capabilities__service-secondary" href={service.secondaryLink.href}>{service.secondaryLink.title}<span aria-hidden="true"> ↗</span></Link>}
                      </li>
                    ))}
                  </ul>
                  {"resources" in capability && (
                    <div className="gt-service-capabilities__resources" aria-label={`Herramientas y recursos: ${capability.title}`}>
                      {capability.resources.map((resource) => <Link key={resource.href} href={resource.href}>{resource.title} ↗</Link>)}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="gt-service-scope">
        <div className="container gt-service-scope__grid">
          <div><span className="eyebrow eyebrow--light">Siguiente paso</span><h2>Del portafolio al alcance de trabajo.</h2></div>
          <div><p>El alcance puede reunir estudios, ingeniería, revisión regulatoria, implementación u operación. Acordamos las fases, la evidencia y las responsabilidades según el proyecto.</p><Link href="/contacto/?interes=servicios">Contar el punto de partida →</Link></div>
        </div>
      </section>
    </>
  );
}
