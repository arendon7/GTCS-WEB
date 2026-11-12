import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getYarumalClaim } from "@/data/claims";
import { environmentalParkModules } from "@/data/services";

const municipalYarumalClaims = [
  getYarumalClaim("monthly-diversion"),
  getYarumalClaim("reception-purity"),
];

export const metadata: Metadata = {
  title: "Municipios y empresas de servicios públicos",
  description:
    "Greenatics convierte metas del PGIRS en sistemas operables: diagnóstico, rutas selectivas, plantas, rehabilitación, operación, productos y trazabilidad para municipios y ESP.",
  alternates: { canonical: "/municipios/" },
};

const pilotSteps = [
  ["Caracterizar", "Ubicamos los generadores, el material, los puntos de carga y las restricciones de acceso."],
  ["Diseñar", "Definimos recorrido, frecuencia, capacidad del vehículo y protocolo de entrega."],
  ["Operar", "Recolectamos, pesamos y registramos las cargas y novedades de la ruta acordada."],
  ["Aprender", "Revisamos tiempos, cobertura, calidad y costos junto con el equipo local."],
  ["Escalar", "Ampliamos solo si la logística y la capacidad de tratamiento pueden sostenerlo."],
];

type MunicipalRoute = {
  need: string;
  title: string;
  copy: string;
  deliverable: string;
  href: string;
  action: string;
  visual: { src: string; alt: string; caption: string; frameClassName?: string };
  secondaryHref?: string;
  secondaryAction?: string;
};

const municipalRoutes: MunicipalRoute[] = [
  {
    need: "Necesitas actualizar el instrumento y convertir sus programas en acciones con responsables y seguimiento.",
    title: "Formulación y actualización del PGIRS municipal",
    copy: "Contrastamos el diagnóstico y las metas con los proyectos e indicadores de avance que pueden llevarlas a la acción. La autoridad territorial conserva la competencia para adoptar formalmente el PGIRS.",
    deliverable: "La propuesta puede priorizar programas y definir una ruta de implementación con responsables e indicadores, según el alcance acordado.",
    href: "/servicios/pgirs-pmirs/?perfil=municipio#pgirs-municipal",
    action: "Explorar la formulación del PGIRS",
    visual: {
      src: "/tools/red-territory-editorial.jpg",
      alt: "Equipo técnico conversa con un operador de aseo en una calle de un municipio andino.",
      caption: "Articular actores y prioridades ayuda a convertir el PGIRS en una ruta de trabajo.",
    },
  },
  {
    need: "Hay orgánicos separados, pero aún falta una recolección estable y un destino verificable.",
    title: "Recolección selectiva, trazabilidad y tratamiento",
    copy: "Diseñamos la conexión entre generadores, recorridos, recepción y tratamiento; el protocolo acordado con el municipio y el prestador guía el registro de cargas y novedades.",
    deliverable: "Con los equipos responsables se acuerdan frecuencia, puntos de entrega y capacidad de tratamiento para cada zona.",
    href: "/servicios/recoleccion-tratamiento/?perfil=municipio",
    action: "Conocer recolección y tratamiento",
    secondaryHref: "/contacto/?servicio=recoleccion-tratamiento&perfil=municipio",
    secondaryAction: "Evaluar el servicio",
    visual: {
      src: "/projects/tamesis/ruta-selectiva.jpeg",
      alt: "Equipo de recolección trabaja junto a un vehículo convencional en una calle de Támesis.",
      caption: "La selección del vehículo depende de la capacidad, los puntos de carga, el acceso y el destino acordado.",
      frameClassName: "gt-municipal-offer__frame--route-photo",
    },
  },
  {
    need: "El municipio proyecta una planta o necesita recuperar y poner en marcha infraestructura existente.",
    title: "Diseño de plantas y recuperación de infraestructura",
    copy: "Para una planta nueva, comparamos alternativas en prefactibilidad e ingeniería. Si la instalación ya existe, revisamos su estado y los registros disponibles antes de definir intervenciones, capacidad recuperable y condiciones de arranque.",
    deliverable: "La propuesta delimita la fase del proyecto y, cuando aplique, la evaluación de la instalación existente.",
    href: "/servicios/plantas-modulares/?perfil=municipio",
    action: "Diseñar una planta nueva",
    secondaryHref: "/servicios/rehabilitacion-infraestructura/?perfil=municipio",
    secondaryAction: "Conocer Planta en Marcha",
    visual: {
      src: "/services/service-consulting-editorial.webp",
      alt: "Profesionales revisan material orgánico en un área de compostaje.",
      caption: "La infraestructura se dimensiona desde la corriente, el predio y la operación prevista.",
    },
  },
  {
    need: "La planta está en marcha, pero requiere continuidad, dirección técnica o roles mejor definidos.",
    title: "Operación integral y continuidad técnica de plantas",
    copy: "Acordamos las tareas y rutinas necesarias para sostener el proceso. Según el sistema, el acompañamiento puede enfocarse en dirección técnica, apoyo al equipo local o una modalidad integral.",
    deliverable: "La propuesta delimita responsabilidades, mantenimiento e informes conforme a la modalidad contratada.",
    href: "/servicios/operacion-delegada/?perfil=municipio",
    action: "Ver modalidades de operación",
    visual: {
      src: "/tools/ops-plant-editorial.jpg",
      alt: "Profesional revisa equipos y registros en una planta de tratamiento.",
      caption: "Variables y registros de proceso orientan las decisiones de continuidad técnica.",
    },
  },
  {
    need: "Buscas una salida útil y técnicamente viable para la biomasa y los orgánicos tratados.",
    title: "Aprovechamiento productivo y bioeconomía",
    copy: "Evaluamos compostaje y digestión anaerobia, además de los requisitos para acondicionar sus salidas. La posibilidad de obtener productos, biogás o bioenergía depende de la corriente, el proceso y el destino que pueda sostenerse.",
    deliverable: "La comparación de alternativas y los balances preliminares orientan la decisión; la viabilidad se valida para cada proyecto.",
    href: "/servicios/aprovechamiento-productivo/?perfil=municipio",
    action: "Ver aprovechamiento productivo",
    visual: {
      src: "/services/valorization-characterization-editorial.jpg",
      alt: "Consultora compara muestras de biomasa para evaluar alternativas de aprovechamiento.",
      caption: "La caracterización ayuda a comparar alternativas antes de definir una ruta.",
    },
  },
];

const parkProcessStages = [
  {
    title: "Recibir con control",
    copy: "La operación empieza por saber qué material llega, de dónde viene y si cumple los criterios de recepción acordados.",
    modules: [environmentalParkModules[0]],
  },
  {
    title: "Tratar según la corriente",
    copy: "Compostaje y digestión anaerobia responden a materiales y objetivos distintos; su combinación debe justificarse en el estudio del proyecto.",
    modules: [environmentalParkModules[1], environmentalParkModules[2]],
  },
  {
    title: "Preparar salidas con destino",
    copy: "El acondicionamiento y la biofábrica se definen según la calidad requerida, el uso previsto y la capacidad de sostener esa salida.",
    modules: [environmentalParkModules[3], environmentalParkModules[4]],
  },
] as const;

export default function MunicipiosPage() {
  return (
    <>
      <section className="gt-route-hero gt-route-hero--municipal" aria-labelledby="municipal-page-title">
        <div className="container gt-route-hero__grid gt-segment-hero-grid">
          <div className="gt-route-hero__copy gt-segment-hero__copy">
            <span className="eyebrow eyebrow--light">Municipios y empresas de servicios públicos</span>
            <h1 id="municipal-page-title">Del PGIRS a una <span className="gt-municipal-title-accent">operación</span> que el territorio puede sostener.</h1>
            <p className="lead">
              Conectamos las metas del Plan de Gestión Integral de Residuos Sólidos (PGIRS) con
              separación, microrrutas, tratamiento y aprovechamiento. Trabajamos con municipio, ESP y
              actores locales para caracterizar corrientes, definir el alcance técnico y acordar cómo
              sostener cada etapa.
            </p>
            <Link className="gt-municipal-hero__services" href="#servicios-municipales">
              Explorar los servicios municipales
            </Link>
          </div>

          <Link className="button button--light gt-segment-hero__primary" href="/servicios/diagnostico-residuos/?perfil=municipio">Evaluar el sistema territorial</Link>

          <figure className="gt-route-hero__figure gt-segment-hero__visual">
            <Image
              src="/projects/routes/motocarguero-verde-operacion-real.webp"
              alt="Motocarguero sobre base Ceronte con contenedor verde diseñado por Greenatics para recolección selectiva de orgánicos"
              width={720}
              height={575}
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <figcaption>
              <strong>Configuración desarrollada por Greenatics y Auteco Mobility</strong>
              <span>El diseño conjunto de Greenatics y Auteco Mobility se integra a microrrutas según las condiciones de cada territorio.</span>
            </figcaption>
          </figure>

          <Link className="button button--outline-light gt-segment-hero__secondary" href="/proyectos/yarumal/?perfil=municipio">Ver el caso Yarumal</Link>
        </div>
      </section>

      <section className="gt-proof-ribbon" aria-label="Resultados de gestión de orgánicos en Yarumal">
        <div className="container gt-proof-ribbon__grid gt-proof-ribbon__grid--compact">
          <div className="gt-proof-ribbon__intro"><span>Experiencia validada</span><strong>Separación, calidad y aprovechamiento en Yarumal</strong></div>
          {municipalYarumalClaims.map((claim) => <div key={claim.id}><strong>{claim.value}</strong><span>{claim.compactLabel}</span><small>{claim.context.replace("Caso Yarumal · ", "")}</small></div>)}
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper gt-municipal-buying-roles" aria-labelledby="municipal-buying-roles-title">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><h2 id="municipal-buying-roles-title">La ruta depende de quién decide, contrata y opera.</h2></div>
            <p>Municipio, ESP y proyecto regional pueden compartir un flujo, pero no siempre comparten autoridad, datos, presupuesto o capacidad operativa. Acordamos quién decide el estudio, aporta registros y sostendrá su implementación.</p>
          </div>
          <div className="gt-municipal-buying-roles__grid">
            <article>
              <h3>Municipio o entidad territorial</h3>
              <p>La entidad prioriza la planeación y conserva la responsabilidad sobre el PGIRS. Revisamos metas, datos y decisiones pendientes para ordenar qué alternativa estudiar, sin reemplazar sus competencias ni su adopción formal. Si el proceso requiere formularlo o actualizarlo, verificamos la metodología y el régimen de transición según su fecha y estado.</p>
              <div className="gt-municipal-buying-roles__actions">
                <Link href="/servicios/pgirs-pmirs/?perfil=municipio#pgirs-municipal">Revisar planeación municipal <span aria-hidden="true">→</span></Link>
                <a href="https://minvivienda.gov.co/normativa/resolucion-0555-2026-0" target="_blank" rel="noreferrer">Consultar Resolución 0555 en Minvivienda <span aria-hidden="true">↗</span></a>
              </div>
            </article>
            <article>
              <h3>ESP, prestador u operador</h3>
              <p>Cuando la decisión está en la operación, partimos de la ruta, el activo, los registros y la capacidad que controla el prestador. El alcance se acuerda con quien puede aportar esos datos y asumir las tareas correspondientes.</p>
              <Link href="/servicios/recoleccion-tratamiento/?perfil=municipio">Evaluar operación y rutas <span aria-hidden="true">→</span></Link>
            </article>
            <article>
              <h3>Esquema o proyecto regional</h3>
              <p>Si participan varias entidades, aclaramos actores, flujo, localización, logística, financiación y quién asumirá la inversión y la operación antes de comparar escala o infraestructura.</p>
              <Link href="/soluciones/viabilidad-municipal/">Estudiar viabilidad municipal <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </div>
      </section>

      <section className="gt-microroute" aria-labelledby="municipal-microroute-title">
        <div className="container">
          <div className="gt-microroute__intro">
            <div><span className="eyebrow eyebrow--light">Implementar para aprender</span><h2 id="municipal-microroute-title">El motocarguero es una herramienta. La solución es la microrruta.</h2></div>
            <p>El vehículo resuelve el transporte; el servicio exige una ruta que tenga sentido para el territorio y para la planta. Un piloto permite revisar generación, recorrido, frecuencia y capacidad de recepción antes de decidir qué ajustar o ampliar.</p>
          </div>

          <ol className="gt-pilot-steps" aria-label="Cinco etapas para diseñar y validar una microrruta selectiva">
            {pilotSteps.map(([title, copy]) => <li key={title}><strong>{title}</strong><p>{copy}</p></li>)}
          </ol>
          <div className="gt-inline-action"><p><strong>Resultado del piloto:</strong> una decisión de cobertura, frecuencia y flota respaldada por datos reales.</p><Link href="/servicios/microrrutas-motocarguero/?perfil=municipio">Conocer el servicio de microrrutas →</Link></div>
        </div>
      </section>

      <section
        className="gt-route-section gt-route-section--paper gt-route-section--municipal-park"
        aria-labelledby="municipal-park-title"
      >
        <div className="container gt-park-story gt-park-story--municipal">
          <div className="gt-park-story__copy">
            <header className="gt-park-story__header">
              <span className="eyebrow">Infraestructura conectada al territorio</span>
              <h2 id="municipal-park-title">Un parque ambiental se diseña desde lo que el territorio puede sostener.</h2>
              <p>Más que sumar equipos, se conectan recepción, tratamiento, acondicionamiento y destinos de valor. Formación, gobernanza y datos también requieren diseño; cada módulo se incorpora solo si la corriente, la operación y la prefactibilidad lo justifican.</p>
            </header>
            <figure className="gt-park-story__evidence">
              <Image
                src="/projects/plant/plant-evidence-02.webp"
                alt="Pilas de compostaje bajo cubierta en Yarumal"
                fill
                sizes="(max-width: 900px) 100vw, 34vw"
              />
              <figcaption>
                <strong>Compostaje bajo cubierta · Yarumal</strong>
                <span>Una experiencia de tratamiento y aprovechamiento que orienta la planeación territorial.</span>
              </figcaption>
            </figure>
            <ol className="gt-park-process" aria-label="Tres decisiones para configurar el proceso">
              {parkProcessStages.map((stage) => (
                <li key={stage.title}>
                  <div className="gt-park-process__stage-title">
                    <h3>{stage.title}</h3>
                  </div>
                  <p>{stage.copy}</p>
                  <p className="gt-park-process__details">
                    {stage.modules.map(([title, copy], index) => <span key={title}>{index > 0 ? " " : ""}<strong>{title}:</strong> {copy.replace(/\.$/, "")}{index < stage.modules.length - 1 ? ";" : "."}</span>)}
                  </p>
                </li>
              ))}
            </ol>
            <div className="button-row gt-park-story__actions">
              <Link className="button button--dark" href="/parque-ambiental/">Explorar el concepto</Link>
              <Link className="button button--ghost" href="/soluciones/viabilidad-municipal/">Evaluar prefactibilidad</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white gt-route-section--municipal-services" id="servicios-municipales" aria-labelledby="municipal-services-heading">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><h2 id="municipal-services-heading">Servicios municipales para resolver necesidades concretas.</h2></div>
            <p>Empieza por la decisión pendiente: actualizar el PGIRS, organizar la recolección selectiva, estudiar infraestructura o fortalecer la continuidad de una planta. Con datos, actores y capacidad local, definimos qué ruta estudiar y qué servicios conviene conectar.</p>
          </div>
          <div className="gt-municipal-offer-list">
            {municipalRoutes.map((service, index) => (
              <article className={`gt-municipal-offer${index === 0 ? " gt-municipal-offer--featured" : ""}${index > 0 && index % 2 === 0 ? " gt-municipal-offer--reverse" : ""}`} key={service.href}>
                <figure className="gt-municipal-offer__visual">
                  <div className={`gt-municipal-offer__frame${service.visual.frameClassName ? ` ${service.visual.frameClassName}` : ""}`}>
                    <Image src={service.visual.src} alt={service.visual.alt} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 42vw, 24vw" />
                  </div>
                  <figcaption>{service.visual.caption}</figcaption>
                </figure>
                <div className="gt-municipal-offer__content">
                  <h3>{service.title}</h3>
                  <div className="gt-municipal-offer__need"><p>{service.need}</p></div>
                  <p className="gt-municipal-offer__copy">{service.copy}</p>
                  <p className="gt-municipal-offer__scope">{service.deliverable}</p>
                  <div className="gt-municipal-offer__actions">
                    <Link className="gt-municipal-offer__link" href={service.href}>{service.action}<span aria-hidden="true">→</span></Link>
                    {service.secondaryHref && service.secondaryAction && <Link className="gt-municipal-offer__link" href={service.secondaryHref}>{service.secondaryAction}<span aria-hidden="true">→</span></Link>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-route-closing" aria-labelledby="municipal-next-step-title">
        <div className="container gt-route-closing__inner">
          <div><span className="eyebrow">Siguiente paso</span><h2 id="municipal-next-step-title">Definamos qué alternativa merece estudiarse y qué información falta.</h2><p>Comparte el PGIRS vigente, las fuentes y periodos de datos disponibles, los actores involucrados y la decisión pendiente. Con ese contexto se puede acordar si corresponde una focalización, un diagnóstico o un estudio de mayor alcance.</p></div>
          <Link className="button button--dark" href="/contacto/?servicio=diagnostico-residuos&perfil=municipio&diagnostico=Comparar%20alternativas%20de%20gesti%C3%B3n%20territorial&prioridad=Compartir%20el%20PGIRS%20vigente%2C%20fuentes%20y%20periodos%20de%20datos%2C%20actores%20y%20decisi%C3%B3n%20pendiente">Compartir el contexto del territorio</Link>
        </div>
      </section>
    </>
  );
}
