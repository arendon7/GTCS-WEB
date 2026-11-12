import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { JsonLd } from "@/components/json-ld";
import { ServiceAudienceLink } from "@/components/service-audience-link";
import { crops } from "@/data/crops";
import { products } from "@/data/products";
import { relatedServiceDetails, relatedServiceSlugs, serviceCaseLabels, serviceCaseRoutes, services, type ServiceSlug } from "@/data/services";
import { getServiceVisual } from "@/data/service-visuals";
import { yarumalClaims } from "@/data/claims";
import { site } from "@/data/site";

const programCropDocuments = crops.filter((crop) => crop.pdfFile && crop.technicalManualFile);
const solidProgramSlugs = ["2grow", "2balance", "2bloom", "2fruit"];
const solidProgramProducts = products.filter((product) => solidProgramSlugs.includes(product.slug));

const serviceInputs = {
  "diagnostico-residuos": ["Fuentes y tipos de generador incluidos en el estudio", "Volúmenes, frecuencias o registros disponibles", "Ubicación, temporadas y condiciones de recolección", "Caracterizaciones o análisis anteriores, si existen", "La decisión que debe orientar la línea base"],
  "pgirs-pmirs": ["Si es PGIRS: municipio o región, acto e instrumento vigentes, avances, metas y articulación con planeación y presupuesto", "Si es PMIRS: tipo de organización o gran generador —por ejemplo, conjunto residencial, centro comercial, institución o planta productiva—, sedes, procesos, corrientes, almacenamiento, gestores y responsables", "Caracterizaciones, pesajes, rutas, contratos y registros disponibles", "Actores, capacidades, recursos y plazos relevantes para implementar las medidas", "La decisión que debe orientar la formulación, actualización o seguimiento"],
  "microrrutas-motocarguero": ["Mapa o listado de generadores y puntos de entrega, con horarios y volúmenes aproximados", "Tipo de material, separación en origen y forma de presentación", "Frecuencias, ventanas de recolección, vehículos y capacidad de recepción", "Pendientes, sentidos viales, accesos, barreras y restricciones de circulación", "PGIRS o programa de prestación relacionado; registros de pesaje, tiempos, costos y novedades, si existen"],
  "plantas-modulares": ["Ubicación, planos y condiciones del predio", "Tipo, volumen y continuidad de las corrientes", "Infraestructura, equipos y servicios existentes", "Proceso y capacidad que se quieren estudiar", "Horizonte, etapas y restricciones de inversión"],
  "operacion-delegada": ["Diagrama del proceso y capacidad de la planta", "Registros de entrada, salida y variables de operación", "Estado de equipos, mantenimiento y contingencias", "Equipo actual, turnos y responsabilidades", "Modalidad de apoyo que se necesita evaluar"],
  "aprovechamiento-productivo": ["Tipo, origen, volumen y estacionalidad de la biomasa", "Análisis o caracterizaciones disponibles", "Manejo actual y costos logísticos", "Productos, energía o destinos que se quieren evaluar", "Restricciones de espacio, servicios y operación"],
  "programas-wondergreen": ["Cultivo, variedad, área y etapa fisiológica", "Análisis de suelo, agua o información disponible", "Manejo previo, síntomas y objetivo productivo", "Costos o metas de producción, suelo y carbono que quieras evaluar", "Fotografías, fechas y observaciones de seguimiento"],
  "greenatics-ops": ["Planta, proceso y periodo de operación", "Registros actuales de recepción, pesaje y actividades", "Usuarios, roles y responsables de cada turno", "Indicadores, reportes o balances que necesitas controlar", "Equipos, inventarios, mantenimiento y alertas prioritarias"],
} as const;

const operatingModes = [
  { id: "modalidad-direccion-tecnica", title: "Dirección técnica y transferencia", copy: "Tu equipo sigue al frente del trabajo diario. Greenatics revisa balances y registros, fija controles por tecnología, acompaña a los operadores y convierte las brechas en un plan de mejora. El equipo local fortalece su método y puede sostener los cambios; la dirección revisa el efecto de cada ajuste. Tu organización conserva la ejecución de la operación y las decisiones, con mantenimiento y responsabilidades delimitados en el contrato." },
  { id: "modalidad-operacion-compartida", title: "Operación compartida", copy: "Tu equipo aporta el conocimiento del sitio y Greenatics suma criterio técnico y capacidad de ejecución en las funciones acordadas. Definimos quién recibe y procesa el material, quién mantiene y verifica los equipos, cómo se entrega cada turno y quién responde ante una desviación. Así reforzamos los puntos que hoy limitan la planta sin dejar zonas grises entre los dos equipos." },
  { id: "modalidad-operacion-integral", title: "Operación integral", copy: "Cuando se requiere delegar el funcionamiento diario, Greenatics coordina las tareas incluidas en el contrato: programación, recepción, control del proceso, registros, reportes y personal operativo cuando corresponda. El cliente obtiene una gestión articulada de principio a fin y una lectura común de lo que ocurre en planta. Turnos, mantenimiento, recursos, metas, seguridad y responsabilidades se definen antes del inicio." },
] as const;

const plantProjectStages = [
  { title: "Prefactibilidad", copy: "Comparamos alternativas de proceso y estimamos rangos preliminares de inversión y operación, con supuestos, riesgos y vacíos de información.", outcome: "Permite decidir si vale la pena avanzar; no sustituye un presupuesto definitivo ni la ingeniería de detalle." },
  { title: "Factibilidad e ingeniería", copy: "El contrato define las disciplinas, el nivel de detalle y los entregables aplicables a la alternativa seleccionada. La ingeniería puede incluir memorias, planos y cantidades; los análisis de precios unitarios (APU) se incorporan si el alcance los contempla.", outcome: "Define qué se construirá, con qué interfaces y bajo qué especificaciones de diseño." },
  { title: "Construcción y puesta en marcha", copy: "Coordinamos o ejecutamos obras, suministro, montaje, pruebas y arranque cuando forman parte del alcance contratado.", outcome: "La implementación, la compra de equipos y el arranque se acuerdan como una fase independiente." },
] as const;

const planningInstrumentTypes = [
  { id: "pgirs-municipal", title: "PGIRS · municipio o región", copy: "Articula diagnóstico, programas, proyectos, metas y seguimiento territorial. Greenatics acompaña técnicamente; la adopción corresponde a la autoridad competente según la figura territorial aplicable.", cta: "Conversar sobre un PGIRS", href: "/contacto/?servicio=pgirs-municipal&perfil=municipio" },
  { id: "pmirs-organizacional", title: "PMIRS · organizaciones y grandes generadores", copy: "Para organizaciones, unidades residenciales, centros comerciales, instituciones y operaciones productivas o de servicios que necesitan ordenar su manejo de residuos. Define medidas de generación, separación, almacenamiento, rutas internas, gestores, formación y seguimiento según la actividad, la jurisdicción y las obligaciones aplicables.", cta: "Conversar sobre un PMIRS", href: "/contacto/?servicio=pmirs-organizacional&perfil=empresa" },
] as const;

const servicePageCopy = {
  "diagnostico-residuos": {
    activities: "De la fuente al balance de masa",
    activitiesIntro: "Definimos la muestra alrededor de la decisión: qué fuentes y periodos observar, qué medir y con qué unidades comparar los resultados.",
    deliverables: "Una línea base para priorizar fuentes y definir qué sigue",
    inputs: "Un mapa de fuentes, registros y decisión por resolver",
    closing: "Decidamos qué corrientes vale la pena medir, recoger o estudiar.",
  },
  "pgirs-pmirs": {
    activities: "Convertir la planeación en tareas y seguimiento",
    activitiesIntro: "Alineamos diagnóstico, medidas y seguimiento con el instrumento vigente y la capacidad de quienes lo implementan.",
    deliverables: "Instrumento, acciones y seguimiento organizados",
    inputs: "Definamos primero el instrumento y su contexto",
    closing: "Aclaremos si tu necesidad es territorial o corresponde a una organización o gran generador.",
  },
  "microrrutas-motocarguero": {
    activities: "Diseñar recorridos que funcionen en la calle",
    activitiesIntro: "Contrastamos puntos de entrega, recorrido, accesos, frecuencia y carga. Si se acuerda un piloto, definimos qué registrar para evaluar sus resultados.",
    deliverables: "Un diseño de microrruta para evaluar en contexto",
    inputs: "Leamos juntos las condiciones de la ruta",
    closing: "Cuéntanos cómo se mueven hoy los materiales y qué debe resolver la microrruta.",
  },
  "plantas-modulares": {
    activities: "Pasar de la corriente a un proyecto dimensionado",
    activitiesIntro: "La prefactibilidad compara alternativas; la ingeniería desarrolla la elegida; la implementación se acuerda como fase propia.",
    deliverables: "Bases técnicas para definir y desarrollar el proyecto",
    inputs: "Datos del proceso, el predio y la operación prevista",
    closing: "Conversemos sobre las corrientes, el predio y el alcance que necesitas evaluar.",
  },
  "operacion-delegada": {
    activities: "De la recepción al despacho, una operación conectada",
    activitiesIntro: "Alineamos materiales, personas, proceso y equipos para que cada turno deje datos útiles, el producto avance y las desviaciones se conviertan en mejoras con seguimiento.",
    deliverables: "Más continuidad, mejor aprovechamiento y correcciones trazables",
    inputs: "Definamos dónde se detiene el flujo de tu planta",
    closing: "Cuéntanos qué procesa tu planta y qué cambio quieres poner en marcha.",
  },
  "greenatics-ops": {
    activities: "De la actividad del turno a la lectura de toda la planta",
    activitiesIntro: "OPS enlaza lo planificado con la ejecución, registra novedades y mantiene contexto para consultar indicadores e históricos.",
    deliverables: "Una misma lectura para operar, coordinar y decidir",
    inputs: "Definamos cómo trabaja tu planta",
    closing: "Revisemos qué necesita registrar y consultar tu equipo en GREENATICS OPS.",
  },
  "aprovechamiento-productivo": {
    activities: "Antes de elegir una tecnología, entendemos la corriente y lo que puede sostenerla.",
    activitiesIntro: "Leemos la biomasa, los requisitos del proceso y el destino posible para decidir qué alternativa merece estudiarse.",
    deliverables: "El estudio puede dejar una ruta concreta para decidir qué sigue.",
    inputs: "Empezamos por lo que ya conoces",
    closing: "Evaluemos qué ruta vale la pena estudiar para tu biomasa.",
  },
  "programas-wondergreen": {
    activities: "Diseñar, probar y decidir junto al productor",
    activitiesIntro: "Ajustamos la estrategia al cultivo, al lote y a la etapa. Si hace falta comprobarla, acordamos un ensayo con comparación, variables y seguimiento.",
    deliverables: "Podemos empezar con la información que ya tienes",
    inputs: "Cuéntanos qué cultivo quieres llevar a un programa",
    closing: "Conversemos sobre tu cultivo, la meta productiva y la información del lote.",
  },
} as const;

const serviceHeroActions: Record<ServiceSlug, { primary: string; secondaryHref: string; secondary: string }> = {
  "diagnostico-residuos": { primary: "Ver método de caracterización", secondaryHref: "#punto-de-partida", secondary: "Preparar diagnóstico" },
  "pgirs-pmirs": { primary: "Ver cómo trabajamos", secondaryHref: "#rutas-de-planeacion", secondary: "Elegir PGIRS o PMIRS" },
  "microrrutas-motocarguero": { primary: "Ver diseño de la ruta", secondaryHref: "#punto-de-partida", secondary: "Preparar la ruta" },
  "plantas-modulares": { primary: "Ver fases de ingeniería", secondaryHref: "#punto-de-partida", secondary: "Hablar del proyecto" },
  "operacion-delegada": { primary: "Ver cómo organizamos la operación", secondaryHref: "#modalidades", secondary: "Comparar modalidades" },
  "greenatics-ops": { primary: "Explorar la muestra de OPS", secondaryHref: "#configuracion-ops", secondary: "Consultar configuración" },
  "aprovechamiento-productivo": { primary: "Ver método de evaluación", secondaryHref: "#rutas-de-valorizacion", secondary: "Comparar rutas" },
  "programas-wondergreen": { primary: "Ver diseño del programa", secondaryHref: "/wondergreen/cultivos/", secondary: "Ver programas por cultivo" },
};

const serviceHeroHeadlines: Partial<Record<ServiceSlug, string>> = {
  "operacion-delegada": "Más continuidad y control para tu planta",
  "greenatics-ops": "Trazabilidad para operar mejor tu planta",
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  const canonical = `/servicios/${service.slug}/`;
  return {
    title: service.name,
    description: service.summary,
    alternates: { canonical },
    openGraph: { title: service.name, description: service.summary, url: canonical },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const url = `${site.url}/servicios/${service.slug}/`;
  const inputs = serviceInputs[service.slug as keyof typeof serviceInputs];
  const related = (relatedServiceSlugs[service.slug] ?? []).flatMap((relatedSlug) => {
    const item = services.find((candidate) => candidate.slug === relatedSlug);
    return item ? [item] : [];
  });
  const visual = getServiceVisual(service);
  const receptionPurity = yarumalClaims.find((claim) => claim.id === "reception-purity");
  const pageCopy = servicePageCopy[service.slug as keyof typeof servicePageCopy];
  const heroHeadline = serviceHeroHeadlines[service.slug] ?? service.name;
  const contactHref = service.slug === "greenatics-ops" ? "/contacto/?interes=greenatics-ops" : `/contacto/?servicio=${service.slug}`;
  const primaryHref = service.slug === "greenatics-ops" ? "#muestra-ops" : service.slug === "plantas-modulares" ? "#fases-del-proyecto" : service.slug === "programas-wondergreen" ? "#programa-agronomico" : "#actividades";
  const { primary: primaryLabel, secondaryHref, secondary: secondaryLabel } = serviceHeroActions[service.slug];
  const closingHref = contactHref;
  const closingLabel = service.slug === "greenatics-ops" ? "Consultar alcance y configuración" : service.cta;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.name,
    description: service.summary,
    url,
    serviceType: service.category,
    provider: { "@id": `${site.url}/#organization` },
    areaServed: { "@type": "Country", name: "Colombia" },
    audience: { "@type": "Audience", audienceType: service.audienceLabel },
  };

  return (
    <>
      <JsonLd data={serviceSchema} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` },{ name: "Servicios", url: `${site.url}/servicios/` },{ name: service.name, url }]} />

      <div className={`service-detail-page${service.slug === "programas-wondergreen" ? " service-detail-page--wondergreen" : service.slug === "microrrutas-motocarguero" ? " service-detail-page--microrrutas" : service.slug === "diagnostico-residuos" ? " service-detail-page--diagnostico" : service.slug === "plantas-modulares" ? " service-detail-page--plantas" : service.slug === "aprovechamiento-productivo" ? " service-detail-page--valorization" : service.slug === "operacion-delegada" ? " service-detail-page--operation" : service.slug === "greenatics-ops" ? " service-detail-page--ops" : service.slug === "pgirs-pmirs" ? " service-detail-page--planning" : ""}`}>
      <section className={`service-detail-hero${service.slug === "programas-wondergreen" ? " service-detail-hero--wondergreen" : ""}`}>
        <div className={`container service-detail-hero-grid${service.slug === "programas-wondergreen" ? " service-detail-hero-grid--wondergreen" : ""}`}>
          <div className="service-detail-hero-copy">
            <Link className={`back-link${service.slug === "programas-wondergreen" ? "" : " back-link--light"}`} href="/servicios/">← Todos los servicios</Link>
            <span className={service.slug === "programas-wondergreen" ? "eyebrow" : "service-detail-category"}>{service.categoryLabel} · {service.audienceLabel}</span>
            <h1>{heroHeadline}</h1>
            <p className="lead">{service.summary}</p>
            {service.slug === "greenatics-ops" && <p className="service-ops-demo-note">La muestra pública usa datos ficticios; no está conectada a una planta ni habilita acceso operativo.</p>}
            {service.slug === "aprovechamiento-productivo" && <div className="button-row service-detail-hero-actions service-valorization-hero-actions">
              <Link className="button button--light" href={primaryHref}>{primaryLabel}</Link>
              <Link className="button button--outline-light" href={secondaryHref}>{secondaryLabel}</Link>
            </div>}
            {service.slug === "greenatics-ops" && <div className="button-row service-detail-hero-actions service-ops-hero-actions">
              <Link className="button button--light" href={primaryHref}>{primaryLabel}</Link>
              <Link className="button button--outline-light" href={secondaryHref}>{secondaryLabel}</Link>
            </div>}
          </div>
          {service.slug !== "aprovechamiento-productivo" && service.slug !== "greenatics-ops" && <div className="button-row service-detail-hero-actions">
            <Link className={`button ${service.slug === "programas-wondergreen" ? "button--dark" : "button--light"}`} href={primaryHref}>{primaryLabel}</Link>
            <Link className={`button ${service.slug === "programas-wondergreen" ? "button--ghost" : "button--outline-light"}`} href={secondaryHref}>{secondaryLabel}</Link>
          </div>}
          <div className={`service-detail-visual${service.slug === "programas-wondergreen" ? " service-detail-visual--wondergreen" : ""}`}>
            <figure className={service.slug === "programas-wondergreen" ? "service-detail-visual__artwork" : service.slug === "greenatics-ops" ? "service-detail-visual__photo" : visual.fit === "contain" || visual.src.endsWith(".svg") ? "service-detail-visual__diagram" : undefined}>
              <div className="service-detail-visual__media">
                <Image src={visual.src} alt={visual.alt} fill preload sizes="(max-width: 1000px) 100vw, 52vw" style={{ objectFit: service.slug === "programas-wondergreen" ? "cover" : visual.fit ?? (visual.src.endsWith(".svg") ? "contain" : "cover") }} />
              </div>
              {service.slug !== "programas-wondergreen" && <figcaption>{visual.caption}</figcaption>}
            </figure>
          </div>
        </div>
      </section>

      {service.slug !== "microrrutas-motocarguero" && service.slug !== "diagnostico-residuos" && service.slug !== "plantas-modulares" && service.slug !== "aprovechamiento-productivo" && <section className={`service-detail-context${service.slug === "greenatics-ops" ? " service-ops-context" : service.slug === "pgirs-pmirs" ? " service-planning-context" : ""}`}>
        <div className="container">
          <div className="service-detail-context__heading">
            <div><h2>{service.headline}</h2></div>
            {service.slug === "pgirs-pmirs" ? <div className="service-planning-context__copy">
              <p>{service.intro}</p>
              <div className="service-detail-context__solution"><p>{service.solution}</p></div>
            </div> : <p>{service.intro}</p>}
          </div>
          {service.slug !== "programas-wondergreen" && service.slug !== "pgirs-pmirs" && <div className="service-detail-context__solution"><p>{service.solution}</p></div>}
          {service.slug === "operacion-delegada" && <nav className="service-operation-jump" aria-label="En esta página">
            <a href="#actividades">Qué hacemos</a>
            <a href="#modalidades">Modalidades</a>
            <a href="#greenatics-ops">GREENATICS OPS</a>
            <a href="#punto-de-partida">Resultados y punto de partida</a>
          </nav>}
          {service.slug === "programas-wondergreen" && <aside className="service-product-path service-product-path--wondergreen" id="programa-agronomico" aria-labelledby="service-product-path-title">
            <div className="service-program-intro">
              <span className="eyebrow">Nutrición de precisión, con criterio agronómico</span>
              <h3 id="service-product-path-title">Cada lote pide una lectura propia. El programa también.</h3>
              <p>Agricultura de precisión es decidir con información del cultivo, el suelo, el agua, la etapa y el manejo; no presupone sensores ni dosificación automatizada. Según la necesidad, articulamos compost, las cuatro líneas de fertilizantes sólidos organominerales ocluidos de liberación gradual, cinco formulaciones líquidas Wondergreen elaboradas a partir de bioles y bioinsumos pertinentes. Cada referencia se selecciona y usa según su ficha y etiqueta vigentes.</p>
            </div>
            <p className="service-program-story">
              <strong>Primero leemos el cultivo y la meta:</strong> revisamos el lote, su etapa, el manejo, los análisis disponibles y la decisión que necesita tomar el productor. <strong>Con esa base diseñamos una estrategia nutricional</strong>, seleccionamos las referencias pertinentes y acordamos cómo llevarla a campo. Si se acuerda un ensayo, definimos la comparación, las variables y las fechas para decidir qué ajustar o repetir.
            </p>
            <div className="service-program-editorial">
              <div className="service-program-editorial__copy">
                <h4>La lectura cambia con cada cultivo</h4>
                <p>Abre la ruta de tu cultivo para consultar su guía breve y el manual técnico ampliado. Son documentos de apoyo para preparar preguntas; la recomendación depende del lote y de la etiqueta vigente.</p>
              </div>
              <nav className="service-program-guides" aria-label="Guías y manuales Wondergreen por cultivo">
                {programCropDocuments.map((crop) => (
                  <Link
                    aria-label={`Abrir la ruta de documentos Wondergreen para ${crop.name}`}
                    className="service-program-guide"
                    href={`/wondergreen/cultivos/${crop.slug}/`}
                    key={crop.slug}
                  >
                    <span className="service-program-guide__cover">
                      <Image src={crop.coverImage} alt={`Portada de la guía Wondergreen para ${crop.name}`} fill sizes="88px" />
                    </span>
                    <span className="service-program-guide__copy">
                      <strong>{crop.name}</strong>
                      <span>Guía breve y manual técnico · 20 páginas</span>
                    </span>
                    <span className="service-program-guide__arrow" aria-hidden="true">↗</span>
                  </Link>
                ))}
              </nav>
            </div>
            <section className="service-program-science" aria-labelledby="service-program-science-title">
              <header className="service-program-science__heading">
                <div>
                  <span className="eyebrow">Diseño del sólido y evidencia en campo</span>
                  <h4 id="service-program-science-title">La matriz explica el diseño. El lote confirma la respuesta.</h4>
                </div>
                <p>Los fertilizantes sólidos Wondergreen se presentan como pellets alargados dentro de una matriz organomineral ocluida. La liberación o interacción gradual es un objetivo de diseño; por sí sola, la oclusión no demuestra una respuesta específica ni “cero pérdidas”.</p>
              </header>
              <div className="service-program-science__body">
                <figure className="service-program-pellet">
                  <div className="service-program-pellet__image">
                    <Image
                      src="/images/editorial/wondergreen-pellet-concept-a200-v2.png"
                      alt="Ilustración de pellets sólidos alargados sobre suelo cultivado"
                      fill
                      sizes="(max-width: 700px) 100vw, 32vw"
                    />
                  </div>
                  <figcaption>Esquema sin escala de la forma peletizada descrita en las guías; la selección y la dosis dependen del diagnóstico del lote y de la ficha vigente.</figcaption>
                </figure>
                <figure className="service-program-composition" aria-labelledby="service-program-composition-title">
                  <div className="service-program-composition__heading">
                    <h5 id="service-program-composition-title">Cuatro fórmulas del portafolio sólido</h5>
                    <p>La proporción visual repite los valores N-P-K publicados; no es una dosis ni una recomendación de uso.</p>
                  </div>
                  <div className="service-program-composition__legend" aria-label="Orden de la fórmula">
                    <span><i className="service-program-composition__key service-program-composition__key--n" aria-hidden="true" />N</span>
                    <span><i className="service-program-composition__key service-program-composition__key--p" aria-hidden="true" />P</span>
                    <span><i className="service-program-composition__key service-program-composition__key--k" aria-hidden="true" />K</span>
                  </div>
                  <ul className="service-program-composition__list">
                    {solidProgramProducts.map((product) => {
                      const formula = (product.formula ?? "").split("-").map(Number);
                      const formulaTotal = formula.reduce((sum, value) => sum + value, 0);
                      return (
                        <li className="service-program-composition__row" key={product.slug}>
                          <div className="service-program-composition__labels">
                            <span><strong>{product.family}</strong><small>{product.stage}</small></span>
                            <b>{formula.join(" : ")}</b>
                          </div>
                          <div className="service-program-composition__bar" aria-hidden="true">
                            {formula.map((value, index) => (
                              <span className={`service-program-composition__segment service-program-composition__segment--${index}`} key={`${product.slug}-${index}`} style={{ width: `${formulaTotal ? value / formulaTotal * 100 : 0}%` }} />
                            ))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <figcaption>Composición de referencia, no desempeño: selección, momento y cantidad se definen con cultivo, análisis, humedad, manejo y etiqueta vigente.</figcaption>
                </figure>
              </div>
            </section>
            <section className="service-program-families" aria-labelledby="service-program-families-title">
              <div className="service-program-families__intro">
                <Image
                  src="/products/wondergreen-catalog-editorial-v1.webp"
                  alt="Compost, fertilizante sólido, fertilizante líquido y una planta joven."
                  width={1536}
                  height={1024}
                  sizes="(max-width: 900px) 100vw, 42vw"
                />
                <div>
                  <span className="eyebrow">Portafolio Wondergreen</span>
                  <h4 id="service-program-families-title">Familias que se integran según lo que el cultivo necesita.</h4>
                  <p>El programa no parte de una receta ni de un producto único. Revisa qué referencias pueden tener sentido para el cultivo, el lote y su etapa, siempre con sus fichas y etiquetas vigentes como guía.</p>
                  <Link href="/wondergreen/#productos">Explorar productos y fichas <span aria-hidden="true">→</span></Link>
                </div>
              </div>
              <div className="service-program-family-list">
                <article>
                  <h5>Fertilizantes líquidos</h5>
                  <p>La línea reúne 2GROW 100-20-20 y 200-0-0, 2BALANCE 70-70-70, 2BLOOM 30-80-30 y 2FRUIT 30-30-80, elaborados a partir de bioles de digestión anaerobia multietapa. 2GROW 200-0-0 tiene la mayor concentración de nitrógeno de la línea. Su presentación y la de 2BLOOM se consultan por separado; las demás se confirman según el catálogo vigente.</p>
                </article>
                <article>
                  <h5>Compost</h5>
                  <p>Materia orgánica que puede formar parte de la preparación y el enriquecimiento del suelo o del sustrato, dentro de un manejo definido para el cultivo.</p>
                </article>
                <article>
                  <h5>Bioinsumos</h5>
                  <p>El portafolio técnico considera extractos de ajo + ají y neem, además de Beauveria, Metarhizium, Bacillus subtilis y Trichoderma. La selección se revisa para el cultivo y la ficha vigente, sin atribuir efectos específicos que no estén respaldados.</p>
                </article>
              </div>
            </section>
            <div className="service-program-outcomes">
              <p>Reducir costos es una posibilidad que se evalúa, no un resultado garantizado. Si el alcance incluye una comparación, acordamos área, periodo y manejo de partida; registramos insumos, costos y una variable productiva pertinente para valorar el cambio en condiciones comparables.</p>
              <p>Si también se quiere evaluar carbono del suelo o huella, definimos línea base, límites, método e indicadores. La contribución se determina con datos del sistema y del periodo, no se atribuye al fertilizante por sí solo.</p>
            </div>
          </aside>}
          {service.slug === "operacion-delegada" && <div className="service-detail-context__grid service-context-comparison service-operation-modes" id="modalidades" aria-label="Modalidades del servicio de operación">
            {operatingModes.map((mode) => <article id={mode.id} aria-labelledby={`${mode.id}-title`} tabIndex={-1} key={mode.id}>
              <h3 id={`${mode.id}-title`}>{mode.title}</h3>
              <p>{mode.copy}</p>
              {mode.id === "modalidad-direccion-tecnica" ? (
                <ServiceAudienceLink className="service-operation-mode-action" href="/contacto/?servicio=operacion-delegada&modalidad=direccion-tecnica">
                  Conversar sobre dirección técnica
                </ServiceAudienceLink>
              ) : null}
              {mode.id === "modalidad-operacion-integral" ? (
                <ServiceAudienceLink className="service-operation-mode-action" href="/contacto/?servicio=operacion-delegada&modalidad=operacion-integral">
                  Conversar sobre operación integral
                </ServiceAudienceLink>
              ) : null}
              {mode.id === "modalidad-operacion-compartida" ? (
                <ServiceAudienceLink className="service-operation-mode-action" href="/contacto/?servicio=operacion-delegada&modalidad=operacion-compartida">
                  Conversar sobre operación compartida
                </ServiceAudienceLink>
              ) : null}
            </article>)}
          </div>}
          {service.slug === "pgirs-pmirs" && <div className="service-detail-context__grid service-context-comparison service-planning-types" id="rutas-de-planeacion" aria-label="Rutas de planeación territorial y organizacional">
            {planningInstrumentTypes.map((instrument) => <article id={instrument.id} key={instrument.id}><span>{instrument.title}</span><p>{instrument.copy}</p><ServiceAudienceLink href={instrument.href}>{instrument.cta} →</ServiceAudienceLink></article>)}
            <aside className="service-pgirs-transition" aria-labelledby="service-pgirs-transition-title">
              <div>
                <h3 id="service-pgirs-transition-title">La fecha de inicio define la ruta aplicable al PGIRS.</h3>
                <span>Metodología y transición</span>
              </div>
              <div>
                <p>La Resolución 0555 de 2026 adoptó la metodología general y derogó la 754 de 2014, con un régimen de transición. Si la actualización estaba en curso al entrar en vigor, el 12 de agosto de 2026, el municipio o distrito puede continuar bajo la metodología anterior. Los PGIRS actualizados a esa fecha pueden mantenerse hasta el periodo para el que fueron formulados; las actualizaciones iniciadas después deben aplicar la nueva metodología. Antes de definir el apoyo, revisamos el expediente y el acto vigente. Greenatics brinda asistencia técnica: la adopción y responsabilidad del instrumento corresponden a la autoridad territorial.</p>
                <a href="https://normas.cra.gov.co/Gestor/docs/resolucion_minviviendact_0555_2026.htm">Consultar la Resolución 0555 de 2026 en el normograma de la CRA <span aria-hidden="true">↗</span></a>
              </div>
            </aside>
          </div>}
        </div>
      </section>}

      {service.slug === "aprovechamiento-productivo" && <>
        <section className="service-valorization-story" aria-labelledby="service-valorization-story-title">
          <div className="container service-valorization-story__grid">
            <div>
              <h2 id="service-valorization-story-title">Una corriente, varias posibilidades. La decisión depende del contexto.</h2>
              <p>{service.intro}</p>
              <p>{service.solution}</p>
            </div>
            <figure>
              <div className="service-valorization-story__image">
                <Image src="/services/organic-valorization-concept-v1.jpg" alt="Compost incorporado al suelo de un cultivo joven junto a una instalación de tratamiento de orgánicos." fill sizes="(max-width: 850px) 100vw, 46vw" />
              </div>
              <figcaption>El uso agrícola es una alternativa cuando la calidad del material y su destino lo permiten.</figcaption>
            </figure>
          </div>
        </section>

        <section className="service-valorization-path" id="actividades" aria-labelledby="service-valorization-path-title">
          <div className="container service-valorization-path__grid">
            <header className="service-valorization-path__intro">
              <h2 id="service-valorization-path-title">Entender la biomasa antes de elegir la ruta.</h2>
              <p>Leemos la biomasa, los requisitos del proceso y el destino posible para decidir qué alternativa merece estudiarse.</p>
            </header>
            <div className="service-valorization-path__narrative" id="rutas-de-valorizacion">
              <p className="service-valorization-path__lead">Contrastamos continuidad del suministro, requisitos de operación y destino posible antes de proponer un estudio o una prueba.</p>
              <ol className="service-valorization-path__steps" aria-label="Secuencia para evaluar rutas de aprovechamiento">
                <li><strong>Caracterizar la corriente</strong><span>Origen, composición, volumen, continuidad y manejo actual.</span></li>
                <li><strong>Contrastar el proceso</strong><span>Logística, espacio, servicios, infraestructura y capacidad del equipo.</span></li>
                <li><strong>Evaluar el destino</strong><span>Requisitos técnicos y posibilidades de uso de las salidas.</span></li>
              </ol>
              <p className="service-valorization-path__boundary">Compost, bioenergía e insumos agrícolas son opciones por evaluar, no resultados automáticos. La comparación hace visibles supuestos y datos faltantes; por sí sola no confirma viabilidad, desempeño ni impacto.</p>
            </div>
          </div>
        </section>

        <section className="service-valorization-start" id="punto-de-partida" aria-labelledby="service-valorization-start-title">
          <div className="container service-valorization-start__grid">
            <div>
              <h2 id="service-valorization-start-title">El estudio puede dejar una ruta concreta para decidir qué sigue.</h2>
              <p>Según el alcance y la información disponible, entregamos una comparación de alternativas, un balance preliminar de entradas y salidas y una hoja de ruta para pruebas, diseño o implementación. La comparación deja visibles los datos confirmados y los que conviene levantar antes de probar o diseñar.</p>
            </div>
            <div className="service-valorization-start__brief">
              <h3>Empezamos por lo que ya conoces</h3>
              <p>El origen y volumen aproximado de la biomasa, cuándo se genera, cómo se maneja hoy, qué análisis existen y qué quisieras obtener ayudan a orientar la conversación. Las restricciones del predio, los servicios y la operación afinan la evaluación.</p>
              <nav aria-label="Servicios relacionados con la valorización">
                <ServiceAudienceLink href="/servicios/plantas-modulares/">Ingeniería para dimensionar una planta <span aria-hidden="true">→</span></ServiceAudienceLink>
                <ServiceAudienceLink href="/servicios/programas-wondergreen/">Acompañamiento agronómico Wondergreen <span aria-hidden="true">→</span></ServiceAudienceLink>
              </nav>
            </div>
          </div>
        </section>
      </>}

      {service.slug === "plantas-modulares" && <>
        <section className="service-plant-journey" id="fases-del-proyecto" aria-labelledby="service-plant-journey-title">
          <div className="container">
            <header className="service-plant-journey__intro">
              <div><h2 id="service-plant-journey-title">{service.headline}</h2></div>
              <p>{service.solution}</p>
            </header>
            <div className="service-plant-journey__stages">
              <article className="service-plant-journey__entry">
                <h3>{plantProjectStages[0].title}</h3>
                <p>{plantProjectStages[0].copy}</p>
                <p className="service-plant-journey__outcome">{plantProjectStages[0].outcome}</p>
              </article>
              <div className="service-plant-journey__continuation">
                {plantProjectStages.slice(1).map((stage) => <article key={stage.title}>
                  <h3>{stage.title}</h3>
                  <p>{stage.copy}</p>
                  <p className="service-plant-journey__outcome">{stage.outcome}</p>
                  {stage.title === "Construcción y puesta en marcha" ? (
                    <nav className="service-detail-case-links service-plant-journey__phase-action" aria-label="Conversar sobre esta fase">
                      <ServiceAudienceLink href="/contacto/?servicio=plantas-modulares&fase=implementacion">
                        Conversar sobre construcción y puesta en marcha <span aria-hidden="true">→</span>
                      </ServiceAudienceLink>
                    </nav>
                  ) : null}
                </article>)}
              </div>
            </div>
          </div>
        </section>
        <section className="service-plant-start" id="punto-de-partida" aria-labelledby="service-plant-start-title">
          <div className="container service-plant-start__grid">
            <div><h2 id="service-plant-start-title">Una conversación útil empieza con el sitio y la corriente.</h2><p>La información disponible permite orientar la fase. Señalamos qué datos del suministro, el predio y la operación conviene completar antes de definir capacidad y nivel de ingeniería.</p></div>
            <div className="service-plant-start__brief"><h3>Información para orientar el alcance</h3><p>Ubicación y condiciones del predio; tipo, volumen y continuidad de las corrientes; infraestructura, servicios y equipos existentes; capacidad y proceso por estudiar; horizonte y restricciones de inversión.</p><nav aria-label="Servicios que se articulan con la ingeniería de plantas"><ServiceAudienceLink href="/servicios/operacion-delegada/">Definir quién operará la planta <span aria-hidden="true">→</span></ServiceAudienceLink><ServiceAudienceLink href="/servicios/aprovechamiento-productivo/">Evaluar las rutas de valorización <span aria-hidden="true">→</span></ServiceAudienceLink></nav><p>Explora también un caso territorial relacionado con infraestructura y valorización.</p><nav className="service-detail-case-links" aria-label="Caso territorial relacionado"><ServiceAudienceLink href={serviceCaseRoutes["Támesis"]} preferIncomingProfile>{serviceCaseLabels["Támesis"]}<span aria-hidden="true">→</span></ServiceAudienceLink></nav></div>
          </div>
        </section>
      </>}

      {service.slug === "operacion-delegada" && <>
        <section className="service-operation-work" id="actividades" aria-labelledby="service-operation-work-title">
          <div className="container">
            <header className="service-operation-work__intro">
              <h2 id="service-operation-work-title">El control empieza en la entrada y termina cuando el producto sale.</h2>
              <p>Una planta no gana productividad por mirar solo el proceso. Greenatics conecta calidad y continuidad del suministro, recepción, capacidad de tratamiento, turnos, equipos y producto final. Con registros y controles acordados encontramos dónde se frena el flujo, qué conviene corregir primero y cómo comprobar el efecto del cambio en la siguiente operación.</p>
            </header>
            <div className="service-operation-work__body">
              <div className="service-operation-work__areas">
                <article><h3>La entrada debe alimentar el proceso con el material adecuado.</h3><p>Caracterizamos y pesamos las corrientes; definimos aceptación según origen, composición, humedad, impropios y capacidad del proceso. Distinguimos material recibido, aceptado, rechazado y realmente incorporado. Así el municipio, la ESP o la empresa puede actuar sobre la separación, el suministro o la recepción antes de que una variación se convierta en una parada.</p></article>
                <article><h3>El control cambia con la tecnología y la condición de la planta.</h3><p>En compostaje seguimos mezcla, humedad, temperatura, aireación y maduración. En digestión anaerobia, alimentación, pH, caudal y tiempo de retención. Relacionamos estos controles con disponibilidad de equipos, fallas, mantenimiento y calidad de salida para priorizar intervenciones, recuperar horas útiles y reducir paradas que vuelven a repetirse.</p></article>
                <article><h3>El balance se cierra con producto terminado e inventario.</h3><p>Seguimos lotes, acondicionamiento, controles de calidad acordados, producción, inventario y salida. Separamos la masa que continúa en proceso del producto terminado y disponible. Tu equipo puede saber cuánto se transformó, qué requiere revisión y qué volumen puede planear para uso, comercialización o despacho.</p></article>
              </div>
              <figure className="service-operation-work__visual">
                <Image
                  src="/tools/ops-plant-editorial.jpg"
                  alt="Una operaria revisa el material orgánico junto a equipos y pilas de compostaje bajo cubierta."
                  width={1400}
                  height={1000}
                  sizes="(max-width: 1000px) 100vw, 42vw"
                />
                <figcaption>La observación del material, los equipos y las condiciones del proceso orienta qué revisar en cada turno.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="service-operation-ops" id="greenatics-ops" aria-labelledby="service-operation-ops-title">
          <div className="container service-operation-ops__grid">
            <div className="service-operation-ops__story">
              <h2 id="service-operation-ops-title">GREENATICS OPS convierte cada turno en información para el siguiente.</h2>
              <p>OPS enlaza programación semanal o mensual con actividades ejecutadas, registros técnicos, recepciones, lotes, equipos, mantenimientos, producción e inventario. El operario deja constancia del trabajo y sus novedades; coordinación compara lo planeado con lo realizado; dirección revisa periodos, indicadores e historial. Así cada turno conserva contexto y la coordinación puede ubicar qué requiere atención sin reconstruir la jornada desde fuentes dispersas.</p>
              <p>Al revisar retrasos, paradas recurrentes, rechazos, reprocesos o cambios de calidad, el equipo contrasta cuándo ocurren, en qué etapa y bajo qué condiciones. Con esa lectura puede priorizar una acción correctiva o una mejora en recepción, mezcla, rutina, programación o mantenimiento; OPS permite asignar responsable y fecha, adjuntar evidencia y revisar el cierre. En el siguiente ciclo, el indicador acordado ayuda a valorar si la intervención produjo el cambio esperado. Los responsables técnicos validan las causas y deciden qué poner en práctica; la herramienta organiza el seguimiento, no corrige la planta por sí sola.</p>
              <ServiceAudienceLink href="/servicios/greenatics-ops/" preferIncomingProfile>Conocer GREENATICS OPS y sus alcances <span aria-hidden="true">→</span></ServiceAudienceLink>
            </div>
            <div className="service-operation-ops__sequence" aria-label="Ciclo de seguimiento operativo">
              <p><strong>Programar</strong><span>Actividades, turnos y responsables.</span></p>
              <p><strong>Registrar</strong><span>Recepción, proceso, equipos y novedades.</span></p>
              <p><strong>Priorizar</strong><span>Desviaciones y causas que el equipo debe revisar.</span></p>
              <p><strong>Verificar</strong><span>Acción, responsable, evidencia e indicador del siguiente ciclo.</span></p>
            </div>
          </div>
        </section>

        <section className="service-operation-start" id="punto-de-partida" aria-labelledby="service-operation-start-title">
          <div className="container service-operation-start__grid">
            <div>
              <h2 id="service-operation-start-title">Una lectura común para decidir qué corregir y sostener.</h2>
              <p>Relacionamos calidad y volumen de entrada con balance de masa, capacidad efectiva, horas disponibles, producción, inventario y despacho. Cada indicador conserva fuente, unidad, periodo y método; así el equipo puede ubicar el cuello de botella y comparar el siguiente ciclo con una línea base propia.</p>
              <p>La lectura responde a cada operación: municipios y ESP coordinan generadores, recolección, recepción y tratamiento; las empresas ubican pérdidas, paradas y costos de proceso; y las agroindustrias relacionan su biomasa con capacidad, producción e inventario.</p>
              <p>El trabajo deja criterios de recepción, rutinas por tecnología y acciones priorizadas con responsables y fecha de revisión. Dirección técnica, operación compartida o integral se acuerdan según el equipo disponible y quién ejecutará cada función.</p>
              <nav aria-label="Servicios relacionados con la continuidad de planta">
                <ServiceAudienceLink href="/servicios/rehabilitacion-infraestructura/">Recuperar una planta detenida o subutilizada <span aria-hidden="true">→</span></ServiceAudienceLink>
                <ServiceAudienceLink href="/servicios/greenatics-ops/">Ver cómo OPS organiza la trazabilidad <span aria-hidden="true">→</span></ServiceAudienceLink>
                <ServiceAudienceLink href="/servicios/plantas-modulares/">Estudiar cambios de infraestructura y proceso <span aria-hidden="true">→</span></ServiceAudienceLink>
              </nav>
            </div>
            <aside>
              <h3>Seguir cada etapa evita confundir el resultado.</h3>
              <p>Material recibido, masa procesada, producto terminado, inventario y despacho son eventos distintos. GREENATICS OPS ayuda a relacionarlos con el periodo y la evidencia; el equipo técnico interpreta las causas y valida si una acción movió el indicador esperado.</p>
              <p><strong>Para definir el alcance:</strong> sirven el diagrama y la capacidad de planta, registros de entrada y salida, estado de equipos, mantenimiento y turnos. Si faltan datos, acordamos qué levantar primero. El contrato define quién ejecuta, mantiene y responde; la dirección técnica no transfiere por sí sola la operación física ni las obligaciones del titular o prestador.</p>
            </aside>
          </div>
        </section>
      </>}

      {service.slug === "greenatics-ops" && <>
        <section className="service-ops-flow" id="actividades" aria-labelledby="service-ops-flow-title">
          <div className="container">
            <header className="service-ops-flow__intro">
              <h2 id="service-ops-flow-title">Del plan de trabajo al historial operativo, sin perder el hilo.</h2>
              <p>GREENATICS OPS sigue el ciclo de la planta: programación mensual o semanal, calendario, actividad, ejecución, registro técnico, evidencia o incidencia, revisión, indicadores e histórico. Cada registro aporta contexto a la operación y reduce el esfuerzo de reconstruir después qué ocurrió.</p>
            </header>
            <div className="service-ops-flow__areas">
              <article><h3>Operación · registrar lo que pasó</h3><p>El equipo parte de las actividades programadas, inicia y cierra el trabajo y completa los datos que no pueden derivarse. Recepciones, pesajes, lotes, evidencias e incidencias quedan asociados al flujo que los originó.</p></article>
              <article><h3>Coordinación · detectar qué requiere atención</h3><p>La vista de coordinación contrasta plan y ejecución, muestra faltantes, desviaciones, incidencias, equipos y calidad del dato. Así, el responsable puede priorizar el pendiente, asignar una acción y revisar su cierre.</p></article>
              <article><h3>Dirección · leer el día, el mes y el histórico</h3><p>La información de recepción, procesamiento, producción, horas de trabajo, cumplimiento, mantenimiento y alertas permite entender cómo se comporta la operación en distintos periodos y orientar decisiones con registros en contexto.</p></article>
            </div>
            <Link className="service-ops-flow__related" href="/servicios/operacion-delegada/">Conoce también las modalidades de operación y dirección técnica <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="service-ops-paths" id="punto-de-partida" aria-labelledby="service-ops-paths-title">
          <div className="container">
            <header><h2 id="service-ops-paths-title">Explora la muestra o conversemos sobre una operación real.</h2></header>
            <div className="service-ops-paths__split">
              <article className="service-ops-paths__demo" id="muestra-ops">
                <p className="service-ops-paths__label">Muestra pública</p>
                <h3>Recorre los módulos con un proceso de ejemplo.</h3>
                <p>Explora cómo se relacionan actividades, recepciones, procesos, activos e indicadores. Los datos son ficticios y no corresponden a Yarumal, Támesis ni a una planta conectada.</p>
                <Link className="button button--light" href="/app/">Abrir muestra de OPS <span aria-hidden="true">→</span></Link>
              </article>
              <article className="service-ops-paths__consult" id="configuracion-ops">
                <p className="service-ops-paths__label">Configuración por proyecto</p>
                <h3>Define qué necesita registrar y seguir tu equipo.</h3>
                <p>La consulta permite revisar sedes, roles, procesos, registros e indicadores prioritarios, desde una planta hasta una operación multi-sede. Disponibilidad, acceso, conexiones y alcance se confirman antes de acordar una implementación.</p>
                <ServiceAudienceLink className="button button--dark" href="/contacto/?interes=greenatics-ops&modalidad=configuracion">Consultar alcance y configuración <span aria-hidden="true">→</span></ServiceAudienceLink>
              </article>
            </div>
          </div>
        </section>
      </>}

      {service.slug === "pgirs-pmirs" && <>
        <section className="service-planning-work" id="actividades" aria-labelledby="service-planning-work-title">
          <div className="container">
            <header className="service-planning-work__intro">
              <h2 id="service-planning-work-title">La planeación toma forma cuando cada medida tiene cómo avanzar.</h2>
              <p>El acompañamiento conecta la información del territorio o de la organización con prioridades realizables, responsabilidades y una manera de revisar avances.</p>
            </header>
            <div className="service-planning-work__narrative">
              <p><strong>Leemos la situación actual.</strong> Reunimos el instrumento vigente, los datos disponibles, los avances y las capacidades para entender qué decisión necesita orden.</p>
              <p><strong>Priorizamos acciones posibles.</strong> Conectamos cada medida con responsables, recursos, plazos e indicadores acordes con el alcance y la información existente.</p>
              <p><strong>Preparamos el seguimiento.</strong> Organizamos evidencias para que los equipos puedan revisar qué se hizo, qué falta y qué requiere ajuste.</p>
            </div>
          </div>
        </section>

        <section className="service-planning-start" id="punto-de-partida" aria-labelledby="service-planning-start-title">
          <div className="container service-planning-start__grid">
            <div>
              <h2 id="service-planning-start-title">Partimos del instrumento y de la decisión pendiente.</h2>
              <p>El acto y el instrumento vigente, los avances, las caracterizaciones, los pesajes, las rutas, los contratos y los responsables permiten reconocer qué información se puede aprovechar y qué dato hace falta construir.</p>
            </div>
            <aside>
              <p>Para la gestión territorial, consulta la ruta PGIRS; para una organización o gran generador, revisa PMIRS. Cada enlace abre el formulario con el servicio y el perfil correspondientes.</p>
              <nav aria-label="Servicios que pueden complementar la planeación">
                <ServiceAudienceLink href="/servicios/diagnostico-residuos/">Caracterizar residuos cuando falta una línea base <span aria-hidden="true">→</span></ServiceAudienceLink>
                <ServiceAudienceLink href="/servicios/microrrutas-motocarguero/">Diseñar recolección selectiva desde las medidas del plan <span aria-hidden="true">→</span></ServiceAudienceLink>
              </nav>
            </aside>
          </div>
        </section>
      </>}

      {service.slug === "microrrutas-motocarguero" && <>
        <section className="service-route-evidence" id="yarumal-route-case" aria-labelledby="yarumal-route-case-title">
          <div className="container service-route-evidence__grid">
            <figure>
              <div className="service-route-evidence__image">
                <Image src="/projects/plant/plant-evidence-05.webp" alt="Compostaje en hileras bajo cubierta en la planta de Yarumal." fill sizes="(max-width: 850px) 100vw, 48vw" />
              </div>
              <figcaption>El diseño de recolección se conecta con la capacidad de recepción y tratamiento.</figcaption>
            </figure>
            <div className="service-route-evidence__copy">
              <h2 id="yarumal-route-case-title">La microrruta funciona dentro de un sistema, no de forma aislada.</h2>
              <p>En Yarumal, el trabajo con el municipio y Aguas del Norte articula la recolección selectiva con el tratamiento de los orgánicos. Durante el periodo validado, la caracterización en recepción registró <strong>{receptionPurity?.value} {receptionPurity?.label}</strong>. Ese resultado corresponde al caso y orienta preguntas para cada nuevo territorio; no anticipa el resultado de otra ruta.</p>
              <ServiceAudienceLink href="/proyectos/yarumal/?perfil=municipio" preferIncomingProfile>Conocer el caso de Yarumal <span aria-hidden="true">→</span></ServiceAudienceLink>
            </div>
          </div>
        </section>

        <section className="service-route-design" id="actividades" aria-labelledby="service-route-design-title">
          <div className="container">
            <div className="service-route-design__intro">
              <div>
                <span className="eyebrow">Del generador a la recepción</span>
              <h2 id="service-route-design-title">Una microrruta conecta generación, recorrido y recepción.</h2>
              </div>
              <p>Contrastamos la demanda por generador con la red vial y las restricciones de acceso. Después verificamos la compatibilidad entre la carga estimada por ciclo, la capacidad útil del vehículo, la ventana de recolección y la capacidad de recepción. La precisión del trazado y la verificación en campo se acuerdan según la decisión del cliente.</p>
            </div>
            <div className="service-route-design__story">
              <figure className="service-route-design__figure">
                <div className="service-route-design__image">
                  <Image src="/services/microroutes-organics-handoff-editorial-v01.jpg" alt="Entrega de residuos orgánicos separados a un equipo de recolección en un barrio andino." fill sizes="(max-width: 960px) 100vw, 36vw" />
                </div>
                <figcaption>La separación en origen se concreta cuando generadores, horarios de recolección y recepción pueden coordinarse.</figcaption>
              </figure>
              <div className="service-route-design__narrative">
                <article className="service-route-design__territory">
                  <h3>Convertimos la generación y las condiciones de calle en un recorrido operable.</h3>
                  <p>Georreferenciamos generadores y puntos de entrega; estimamos cantidades, presentación y frecuencia requerida, y cruzamos esa demanda con sentidos viales, pendientes, anchos, accesos, horarios y distancia a recepción. Con la capacidad útil del vehículo y el tiempo de ciclo como restricciones, organizamos cobertura, secuencia de paradas y ventanas de servicio. El resultado puede concretarse en un trazado, una ficha de operación y criterios para coordinar entrega, recolección y recepción.</p>
                </article>
                <article className="service-route-design__pilot">
                  <h3>Si hace falta, probamos el diseño antes de ampliar la cobertura.</h3>
                  <p>Un piloto permite contrastar el trazado previsto con la operación observada. Según el alcance acordado, registramos viajes, tiempos de recorrido y parada, carga recibida y pesada, novedades de acceso, material rechazado o contaminante y capacidad disponible en el sitio receptor. La comparación ayuda a decidir ajustes de cobertura, frecuencia, secuencia, horarios y logística; cualquier cambio se sustenta en los datos levantados en ese territorio.</p>
                </article>
              </div>
            </div>
            <p className="service-route-design__scope">{service.scope}</p>
          </div>
        </section>

        <section className="service-route-framework" aria-labelledby="service-route-framework-title">
          <div className="container">
            <div className="service-route-framework__grid">
              <figure>
                <div className="service-route-framework__image">
                  <Image src="/services/microroute-flow-vertical-v1.svg" alt="Esquema de microrruta: generadores, recorrido, recepción y seguimiento." fill sizes="(max-width: 850px) 100vw, 42vw" />
                </div>
                <figcaption>La frecuencia y el trazado se coordinan con la separación en la fuente y la capacidad de recepción.</figcaption>
              </figure>
              <div className="service-route-framework__copy">
              <span className="eyebrow">Diseño técnico y marco sectorial</span>
              <h2 id="service-route-framework-title">Diseño técnico dentro del marco del servicio de aseo.</h2>
              <p>Cuando una ruta hace parte del servicio público de aseo, el Decreto 1077 de 2015 y su modificación por el Decreto 0772 de 2026 distinguen la recolección selectiva de orgánicos. El nuevo marco prevé microrrutas georreferenciadas como referencia para el seguimiento, registro de tiempos y movimientos, y coordinación de horarios y frecuencias entre prestadores para mantener separadas las corrientes. La verificación considera red vial, sentidos, accesos, pendientes, generadores, cantidades, separación y capacidad del sitio de tratamiento.</p>
              <p>En esa modalidad, la norma asigna la recolección selectiva de orgánicos a una persona prestadora registrada en el RUPS para esa actividad. Entre los controles previstos están contrastar por GPS la posición del vehículo con la microrruta georreferenciada y registrar tiempos y movimientos. Por eso el diseño no se limita a dibujar un recorrido: debe articular trazado, equipo, puntos de entrega, recepción y registros que permitan seguir la operación. Estas disposiciones entran en aplicación al concluir el periodo transitorio de seis meses contado desde la publicación del decreto.</p>
              <p className="service-route-framework__transition"><strong>Durante el periodo transitorio:</strong> el Decreto 0772 fue publicado el 17 de julio de 2026 y fijó seis meses para aplicar sus disposiciones. Al entrar en aplicación, el nuevo marco prevé para la ruta selectiva de orgánicos una frecuencia mínima semanal, ajustable al porcentaje de separación, y vincula otras frecuencias con la naturaleza y cantidad de los residuos, los programas del PGIRS, el clima y las características de producción de grandes generadores. La planeación de cada proyecto debe confirmar la fecha de inicio, el tipo de prestador, el alcance y las reglas aplicables.</p>
              <p>La Resolución 2184 de 2019 define el color verde para presentar residuos orgánicos separados en la fuente. La Resolución 0412 de 2026 regula la actividad de aprovechamiento y el régimen de regularización de organizaciones de recicladores de oficio; su aplicación depende de la corriente y del esquema. No se traslada automáticamente a toda ruta selectiva de orgánicos ni a una operación privada.</p>
              <nav className="service-route-framework__sources" aria-label="Normativa sectorial consultada">
                <a href="https://minvivienda.gov.co/sites/default/files/normativa/decreto-0772-2026_compressed.pdf" target="_blank" rel="noreferrer">Decreto 0772 de 2026 · arts. 2.3.2.2.2.3.26, 32, 49, 50.A y 50.B · transición, art. 11 <span aria-hidden="true">↗</span></a>
                <a href="https://www.minambiente.gov.co/wp-content/uploads/2021/08/resolucion-2184-de-2019.pdf" target="_blank" rel="noreferrer">Resolución 2184 de 2019 · art. 4 <span aria-hidden="true">↗</span></a>
                <a href="https://minvivienda.gov.co/normativa/resolucion-0412-2026-0" target="_blank" rel="noreferrer">Resolución 0412 de 2026 · esquema de aprovechamiento <span aria-hidden="true">↗</span></a>
              </nav>
              <p className="service-route-framework__note">El diseño y acompañamiento técnico no sustituyen las obligaciones del prestador, la adopción o actualización del PGIRS, los permisos aplicables ni la validación jurídica del esquema de prestación.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="service-route-start" id="punto-de-partida" aria-labelledby="service-route-start-title">
          <div className="container service-route-start__inner">
            <h2 id="service-route-start-title">La primera decisión es qué necesita demostrar la ruta.</h2>
            <p>Podemos partir de un mapa, un registro de generadores o una operación existente. Con esa base definimos qué falta levantar y el nivel de trabajo requerido: análisis de cobertura y accesibilidad, trazado georreferenciado, fichas operativas, coordinación de separación y recepción o un piloto con pesaje, tiempos, novedades, calidad del material y costos observados. Estos datos sirven para ajustar el diseño; no anticipan por sí solos un ahorro o desempeño garantizado.</p>
            {related.length > 0 && <nav className="service-route-start__related" aria-label="Servicios que pueden complementar el diseño de microrrutas">
              <span>Según el proyecto, también puede ser útil:</span>
              {related.map((item) => <ServiceAudienceLink href={`/servicios/${item.slug}/`} key={item.slug}>{item.name} <span aria-hidden="true">→</span></ServiceAudienceLink>)}
            </nav>}
          </div>
        </section>
      </>}

      {service.slug === "diagnostico-residuos" && <>
        <section className="service-diagnosis-story" aria-labelledby="service-diagnosis-story-title">
          <div className="container service-diagnosis-story__grid">
            <div className="service-diagnosis-story__copy">
              <h2 id="service-diagnosis-story-title">{service.headline}</h2>
              <p>{service.intro}</p>
              <p>{service.solution}</p>
            </div>
            <aside className="service-diagnosis-proof" aria-label="Resultado de caracterización en Yarumal">
              <strong className="service-diagnosis-proof__value">{receptionPurity?.value}</strong>
              <p><strong>{receptionPurity?.label}</strong><br />{receptionPurity?.context}</p>
              <p>En Yarumal, esta medición describe el material recibido durante el periodo validado. Cada nuevo estudio define su propia muestra, fuentes, periodo y método.</p>
              <ServiceAudienceLink href="/proyectos/yarumal/">Ver la experiencia de Yarumal <span aria-hidden="true">→</span></ServiceAudienceLink>
            </aside>
          </div>
        </section>

        <section className="service-diagnosis-method" id="actividades" aria-labelledby="service-diagnosis-method-title">
          <div className="container">
            <div className="service-diagnosis-method__intro">
              <h2 id="service-diagnosis-method-title">{pageCopy.activities}</h2>
              <p>{pageCopy.activitiesIntro}</p>
            </div>
            <ol className="service-diagnosis-method__flow" aria-label="Recorrido de una caracterización de residuos">
              <li><strong>Ubicar</strong><span>Fuentes, generadores y periodo</span></li>
              <li><strong>Medir</strong><span>Volumen y composición del material</span></li>
              <li><strong>Balancear</strong><span>Oferta disponible y variación</span></li>
              <li><strong>Comparar</strong><span>Rutas posibles y datos por completar</span></li>
            </ol>
            <div className="service-diagnosis-method__narrative">
              <p>El protocolo deja claro de dónde viene cada dato, a qué periodo aplica y qué representa. Según la pregunta, registramos composición, humedad e impropios; el balance separa mediciones de campo, registros existentes y estimaciones para mostrar qué cantidad está disponible y cómo varía por fuente o temporada.</p>
              <p>Esto ayuda a evitar que un promedio o una muestra puntual se conviertan en la descripción de toda la operación. El cliente puede decidir si cuenta con base suficiente para priorizar una corriente, ajustar la recolección o avanzar a una evaluación de alternativas, o si necesita ampliar el periodo o la cobertura.</p>
            </div>
            <div className="service-diagnosis-method__starting" id="punto-de-partida">
              <div className="service-diagnosis-start__copy">
                <h3 id="service-diagnosis-start-title">El método cambia con la decisión de cada cliente.</h3>
                <p>Para un municipio o una ESP, la lectura ayuda a distinguir fuentes y fracciones antes de organizar separación, recolección y recepción. En una organización, ubica procesos, puntos de generación y formas de presentación. En agroindustria, caracteriza corrientes asociadas a procesos y temporadas, con sus condiciones de manejo. Registros, mapas, pesajes, análisis y operación existente permiten acordar qué información se aprovecha y cuál hace falta levantar.</p>
                <p>Entregamos una base con método, periodo, unidades y límites documentados; un balance que separa lo medido de lo estimado; y una comparación de rutas potenciales con sus vacíos críticos. Así el cliente puede priorizar la siguiente acción y definir si requiere un estudio de prefactibilidad o ingeniería con alcance propio. La caracterización informa esa decisión, pero no la reemplaza ni garantiza la viabilidad de una alternativa.</p>
              </div>
              <aside className="service-diagnosis-start__next" aria-labelledby="service-diagnosis-next-title">
                <h4 id="service-diagnosis-next-title">¿Qué decisión puede seguir?</h4>
                <p>Si la línea base ayuda a priorizar una corriente, puedes llevar los hallazgos al instrumento de planeación correspondiente o evaluar qué infraestructura requiere esa operación.</p>
                <nav className="service-diagnosis-start__related" aria-label="Servicios que pueden aprovechar una línea base">
                  <ServiceAudienceLink href="/servicios/pgirs-pmirs/">Planeación PGIRS o PMIRS <span aria-hidden="true">→</span></ServiceAudienceLink>
                  <ServiceAudienceLink href="/servicios/plantas-modulares/">Ingeniería y dimensionamiento de plantas <span aria-hidden="true">→</span></ServiceAudienceLink>
                </nav>
              </aside>
            </div>
          </div>
        </section>
      </>}

      {service.slug === "microrrutas-motocarguero" || service.slug === "diagnostico-residuos" || service.slug === "plantas-modulares" || service.slug === "aprovechamiento-productivo" || service.slug === "operacion-delegada" || service.slug === "greenatics-ops" || service.slug === "pgirs-pmirs" ? null : service.slug === "programas-wondergreen" ? (
        <section className="service-detail-practice service-detail-practice--wondergreen" id="actividades">
          <div className="container service-detail-practice__grid">
            <div>
              <span className="eyebrow">A quién acompaña el programa</span>
              <h2>Una estrategia pensada para el cultivo y el equipo que la llevará a campo.</h2>
            </div>
            <p className="service-detail-fit-copy">{service.scope}</p>
          </div>
        </section>
      ) : (
        <section className="service-detail-practice" id="actividades">
          <div className="container service-detail-practice__grid">
            <div>
              <h2>{pageCopy.activities}</h2>
              <p>{pageCopy.activitiesIntro}</p>
              <p className="service-detail-scope-copy">{service.scope}</p>
            </div>
            <ul className="service-detail-activities">
              {service.activities.map((activity) => <li key={activity}><strong>{activity}</strong></li>)}
            </ul>
          </div>
        </section>
      )}

      {service.slug === "microrrutas-motocarguero" || service.slug === "diagnostico-residuos" || service.slug === "plantas-modulares" || service.slug === "aprovechamiento-productivo" || service.slug === "operacion-delegada" || service.slug === "greenatics-ops" || service.slug === "pgirs-pmirs" ? null : service.slug === "programas-wondergreen" ? (
        <section className="service-detail-deliverables service-detail-deliverables--wondergreen service-program-start" id="punto-de-partida" aria-labelledby="service-program-start-title">
          <div className="container service-program-start__content">
            <h2 id="service-program-start-title">{pageCopy.deliverables}</h2>
            <p>Comenzamos por el cultivo, la variedad, el área y la etapa. Los análisis de suelo o agua, registros de manejo, síntomas, costos, fechas, fotografías y observaciones amplían la lectura del lote. Con la meta productiva —o el objetivo relacionado con suelo o carbono— acordamos qué información conviene completar primero.</p>
          </div>
        </section>
      ) : (
        <section className="service-detail-offer" id="punto-de-partida">
          <div className="container">
            <div className="service-detail-offer__heading">
              <h2>{pageCopy.deliverables}</h2>
              <p>{pageCopy.inputs}. Revisamos la información disponible y señalamos qué datos conviene completar para definir el alcance.</p>
            </div>
            <div className="service-detail-offer__columns">
              <div>
                <h3>Qué puede quedar definido</h3>
                <ul className="deliverable-list">{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3>Información útil para empezar</h3>
                <ul className="service-detail-input-list">{inputs.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && !["microrrutas-motocarguero", "diagnostico-residuos", "plantas-modulares", "aprovechamiento-productivo", "operacion-delegada", "greenatics-ops", "pgirs-pmirs"].includes(service.slug) && <section className="service-related" aria-labelledby="service-related-title"><div className="container"><div className="section-heading"><h2 id="service-related-title">Rutas que pueden complementar este trabajo</h2></div><div className="service-related-grid">{related.map((item)=>{const detail=relatedServiceDetails[service.slug]?.[item.slug]; if(!detail) return null; return <ServiceAudienceLink href={`/servicios/${item.slug}/`} key={item.slug}><strong>{item.name}</strong><span>{detail.reason}</span><em>{detail.action} →</em></ServiceAudienceLink>})}</div></div></section>}

      {service.slug !== "greenatics-ops" && service.slug !== "pgirs-pmirs" && <section className="closing-cta service-detail-closing"><div className="container closing-inner"><div>{service.slug === "programas-wondergreen" && <span className="eyebrow">Siguiente paso</span>}<h2>{pageCopy.closing}</h2></div><ServiceAudienceLink className="button button--dark" href={closingHref}>{closingLabel}</ServiceAudienceLink></div></section>}
      </div>
    </>
  );
}
