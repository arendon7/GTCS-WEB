import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SegmentDigitalTools } from "@/components/segment-digital-tools";

export const metadata: Metadata = {
  title: "Organizaciones y grandes generadores",
  description:
    "Greenatics conecta PMIRS, recolección, tratamiento, datos e inventario GEI para empresas, unidades residenciales, centros comerciales, instituciones y otros grandes generadores.",
  alternates: { canonical: "/empresas/" },
};

const segments = [
  {
    title: "Unidades residenciales",
    copy: "En conjuntos y copropiedades conviven zonas comunes, residentes, equipos de operación y varios puntos de generación. El trabajo se concentra en acordar cómo separar y almacenar temporalmente, por dónde se mueve cada corriente y quién responde en cada turno.",
    action: "Planear el PMIRS de mi copropiedad",
    href: "/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional",
  },
  {
    title: "Centros comerciales y plazas",
    copy: "Los locales, las zonas de alimentos, los servicios y las áreas comunes tienen ritmos distintos. La gestión debe coordinar la separación en la fuente con los operadores, los horarios de retiro y las condiciones de cada área.",
    action: "Diseñar la microrruta de mi centro comercial",
    href: "/servicios/microrrutas-motocarguero/?perfil=empresa",
  },
  {
    title: "Instituciones y campus",
    copy: "Cuando una sede reúne muchos usuarios y equipos de servicios generales, la rutina necesita ser fácil de compartir. Se definen protocolos, formación y registros que permitan dar seguimiento entre áreas.",
    action: "Organizar el PMIRS de mi institución",
    href: "/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional",
  },
  {
    title: "Industrias y otros grandes generadores",
    copy: "En plantas, operaciones logísticas y organizaciones multisede, las corrientes y sus responsables varían según el proceso. La evaluación permite priorizar qué manejar, con qué frecuencia y hacia qué destino, de acuerdo con las condiciones de cada operación.",
    action: "Caracterizar mis corrientes orgánicas",
    href: "/servicios/diagnostico-residuos/?perfil=empresa",
  },
];

const companyRoutes = [
  {
    title: "Recolección, trazabilidad y tratamiento recurrentes",
    copy: "Para sedes que generan orgánicos de forma continua: definimos cobertura, frecuencia, criterios de recepción, registro de cantidades y destino acordado. El retiro periódico es distinto del diseño de una ruta nueva.",
    href: "/servicios/recoleccion-tratamiento/?perfil=empresa",
    cta: "Conocer recolección y tratamiento",
    contactHref: "/contacto/?servicio=recoleccion-tratamiento&perfil=empresa",
    contactCta: "Evaluar el servicio para mi organización",
    image: "/services/pmirs-generators-editorial.jpg",
    imageAlt: "Equipo separa residuos orgánicos en el área de servicio de una organización.",
  },
  {
    title: "Diseño de Microrrutas con Motocarguero",
    copy: "Codiseñamos recorridos selectivos desde cada generador hasta la recepción. Greenatics y Auteco Mobility desarrollaron una configuración sobre base Ceronte, con un contenedor diseñado por Greenatics para apoyar la recolección selectiva de orgánicos; frecuencia, carga, topografía y accesos definen su integración a cada ruta.",
    href: "/servicios/microrrutas-motocarguero/?perfil=empresa",
    cta: "Conocer el diseño de microrrutas",
    contactHref: "/contacto/?servicio=microrrutas-motocarguero&perfil=empresa",
    contactCta: "Evaluar una ruta selectiva",
    image: "/projects/routes/motocarguero-verde-operacion-real.webp",
    imageAlt: "Representación del motocarguero sobre base Ceronte con contenedor diseñado por Greenatics.",
  },
  {
    title: "Operación Integral y Continuidad Técnica de Plantas",
    copy: "Cuando una planta necesita continuidad o respaldo técnico, acordamos una modalidad integral, compartida o de dirección técnica. Delimitamos responsabilidades, turnos, mantenimiento y reportes; la dirección técnica no implica por sí sola ejecutar la operación física.",
    href: "/servicios/operacion-delegada/?perfil=empresa",
    cta: "Comparar modalidades de operación",
    contactHref: "/contacto/?servicio=operacion-delegada&perfil=empresa",
    contactCta: "Conversar sobre mi planta",
    image: "/tools/ops-plant-editorial.jpg",
    imageAlt: "Operaria revisa material orgánico y una pila de compost en una planta cubierta.",
  },
  {
    title: "Aprovechamiento Productivo y Bioeconomía",
    copy: "Comparamos compostaje, digestión anaerobia y otras rutas según la composición de la corriente, su continuidad y las condiciones de operación. Los productos, el biogás o la energía son salidas por evaluar, no resultados que se presuponen.",
    href: "/servicios/aprovechamiento-productivo/?perfil=empresa",
    cta: "Explorar rutas de valorización",
    contactHref: "/contacto/?servicio=aprovechamiento-productivo&perfil=empresa",
    contactCta: "Evaluar mi corriente orgánica",
    image: "/services/valorization-characterization-editorial.jpg",
    imageAlt: "Una profesional compara muestras de subproductos orgánicos sobre una mesa de caracterización.",
  },
] as const;

export default function CompaniesPage() {
  return (
    <>
      <section className="gt-route-hero gt-route-hero--company gt-route-hero--company-editorial" aria-labelledby="company-page-title">
        <div className="container gt-route-hero__grid gt-segment-hero-grid gt-company-hero-grid">
          <div className="gt-route-hero__copy gt-segment-hero__copy">
            <h1 id="company-page-title">Organiza la gestión de residuos en <span className="gt-company-title-accent">cada sede.</span></h1>
            <p className="lead">Cada organización combina espacios, turnos y corrientes distintas. Coordinamos separación, almacenamiento temporal, recolección y destino con quienes sostienen la operación. Cuando corresponde, articulamos el trabajo con el Plan de Manejo Integral de Residuos Sólidos (PMIRS) y acordamos medidas, responsables y seguimiento por sede.</p>
            <Link className="gt-company-hero__pmirs" href="/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional">
              Cuándo aplica el PMIRS organizacional
            </Link>
          </div>
          <Link className="button button--dark gt-segment-hero__primary gt-company-hero__primary" href="/contacto/?interes=empresas&perfil=empresa&diagnostico=Ordenar%20una%20sede%20o%20corriente&prioridad=Comparte%20el%20detonante%2C%20sedes%2C%20corrientes%2C%20responsables%2C%20manejo%20actual%20y%20datos%20disponibles">Conversar sobre mi operación</Link>
          <figure className="gt-company-hero-visual gt-segment-hero__visual">
            <Image src="/services/large-generators-editorial-01.jpg" alt="Persona revisa contenedores en el área de servicio de un edificio urbano." fill priority sizes="(max-width: 900px) 100vw, 46vw" />
            <figcaption><strong>Una rutina compartida entre sedes y equipos.</strong></figcaption>
          </figure>
          <Link className="gt-segment-hero__secondary gt-company-hero__routes" href="#puntos-de-entrada">Explorar las cuatro rutas de servicio <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper" aria-labelledby="company-audiences-title">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-company-audiences__heading">
            <div><h2 id="company-audiences-title">El residuo y la operación definen el sistema.</h2></div>
            <p>Una sede con un episodio concreto es suficiente para abrir la revisión. Comparamos corriente, responsables, manejo y destino en ese punto; ampliamos el análisis a otras sedes solo si los registros muestran que conviene hacerlo.</p>
          </div>
          <ul className="gt-company-audience">
            {segments.map(({ title, copy, action, href }) => (
              <li key={title}><article><h3>{title}</h3><p>{copy}</p><Link className="gt-company-audience__action" href={href}>{action}<span aria-hidden="true">→</span></Link></article></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="gt-company-evidence" aria-labelledby="company-evidence-title">
        <div className="container gt-company-evidence__layout">
          <div className="gt-company-evidence__story">
            <h2 id="company-evidence-title">En una misma organización pueden convivir varias rutas.</h2>
            <p>Servicio público, reciclaje, aprovechamiento interno y gestores externos pueden formar parte de la misma operación. Una encuesta empresarial de Bogotá y municipios de su jurisdicción muestra por qué conviene mirar cada sede, corriente y responsable antes de proponer cambios.</p>
            <Link href="#puntos-de-entrada">Explorar rutas para mi organización <span aria-hidden="true">→</span></Link>
          </div>
          <figure className="gt-company-evidence__chart" aria-labelledby="company-evidence-chart-title">
            <figcaption id="company-evidence-chart-title">Prácticas de manejo de residuos reportadas en la encuesta CCB 2023</figcaption>
            <ul>
              <li>
                <div><span>Entrega al servicio público de aseo</span><strong>60,2 %</strong></div>
                <span className="gt-company-evidence__track" aria-hidden="true"><span style={{ width: "60.2%" }} /></span>
              </li>
              <li>
                <div><span>Reciclaje y entrega a organizaciones recicladoras</span><strong>43,3 %</strong></div>
                <span className="gt-company-evidence__track" aria-hidden="true"><span style={{ width: "43.3%" }} /></span>
              </li>
              <li>
                <div><span>Aprovechamiento interno</span><strong>25,1 %</strong></div>
                <span className="gt-company-evidence__track" aria-hidden="true"><span style={{ width: "25.1%" }} /></span>
              </li>
              <li>
                <div><span>Contratación de terceros para residuos no recogidos por el servicio público</span><strong>20,7 %</strong></div>
                <span className="gt-company-evidence__track" aria-hidden="true"><span style={{ width: "20.7%" }} /></span>
              </li>
            </ul>
            <p className="gt-company-evidence__note">1.500 encuestas en Bogotá y 59 municipios de la jurisdicción CCB. La pregunta permitía varias respuestas, por eso las prácticas pueden coexistir y los porcentajes no suman 100 %. Es una referencia regional de 2023, no un resultado de clientes Greenatics.</p>
            <a className="gt-company-evidence__source" href="https://bibliotecadigital.ccb.org.co/bitstreams/300c8fb5-e67f-4004-963b-da9e6f1cc557/download" target="_blank" rel="noreferrer">Consultar encuesta y ficha técnica de la CCB <span aria-hidden="true">↗</span></a>
          </figure>
        </div>
      </section>

      <section
        className="gt-route-section gt-route-section--white gt-route-section--company-story"
        aria-labelledby="company-pmirs-story-title"
      >
        <div className="container gt-pmirs-story gt-pmirs-story--company">
          <div className="gt-pmirs-story__copy gt-company-pmirs-copy">
            <h2 id="company-pmirs-story-title">Una gestión que se sostiene cuando cambia el turno.</h2>
            <p className="gt-company-pmirs-copy__story">Cuando corresponde, partimos del PMIRS o del instrumento vigente y de lo que sucede en cada sede. <strong>En el punto de generación,</strong> definimos separación, recipientes y criterios para reconocer materiales que no deben mezclarse. A partir de ahí, <strong>entre áreas y gestores,</strong> acordamos responsables, almacenamiento temporal, recorridos internos y frecuencia de retiro. <strong>En el seguimiento,</strong> los registros de entrega, destino e incidencias ayudan al equipo a revisar la rutina y ajustar lo necesario.</p>
            <Link className="gt-company-pmirs-copy__link" href="/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional">Ver actividades y alcance del PMIRS <span aria-hidden="true">→</span></Link>
          </div>
          <figure className="gt-company-pmirs-scene">
            <Image src="/services/pmirs-large-generators-editorial.jpg" alt="Separación de residuos orgánicos en una unidad residencial y traslado a un espacio de aprovechamiento." fill sizes="(max-width: 900px) 100vw, 48vw" />
            <figcaption><strong>Una rutina visible para todas las áreas.</strong></figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper gt-route-section--company-offers" id="puntos-de-entrada" aria-labelledby="company-routes-title">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-company-offers__heading"><div><span className="eyebrow">Servicios para orgánicos</span><h2 id="company-routes-title">¿Qué frente de tu operación necesitas resolver?</h2></div><p>Elige la necesidad actual: recolección recurrente, diseño de microrruta, continuidad de planta o evaluación de aprovechamiento. Cada ficha explica su alcance y un primer paso; conectamos servicios adicionales cuando los datos y la operación lo justifican.</p></div>
          <div className="gt-segment-offer-links gt-segment-offer-links--detailed gt-company-service-list">
            {companyRoutes.map((route) => (
              <article className="gt-company-route-card" key={route.href}>
                <figure className="gt-company-route-card__visual">
                <Image src={route.image} alt={route.imageAlt} fill sizes="(max-width: 360px) 110px, (max-width: 620px) 140px, (max-width: 760px) 32vw, (max-width: 1100px) 20vw, 19vw" />
                </figure>
                <div className="gt-company-route-card__body">
                  <div className="gt-segment-offer-links__identity">
                    <h3>{route.title}</h3>
                  </div>
                  <div className="gt-segment-offer-links__details">
                    <p>{route.copy}</p>
                    <Link href={route.href}>{route.cta}<span aria-hidden="true">→</span></Link>
                    <Link className="gt-company-route-card__contact" href={route.contactHref}>{route.contactCta}</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SegmentDigitalTools
        id="herramientas-organizaciones"
        heading="Herramientas digitales para organizar y seguir los datos."
        intro="Además del acompañamiento profesional, puedes explorar entornos digitales con propósitos distintos: Back 2 Green organiza inventarios de emisiones y GREENATICS OPS permite recorrer el registro operativo de una planta. Cada landing explica el acceso y el alcance disponible."
        entries={[
          {
            code: "CO₂",
            summary: "Organiza fuentes, periodos y soportes a tu ritmo con una metodología basada en GHG Protocol y acompañamiento profesional. En la landing puedes revisar el método, los planes anuales y el acceso a la plataforma. La preparación del reporte no sustituye la revisión de las obligaciones aplicables a tu organización.",
            href: "/huella/",
            action: "Ver método, planes y acceso",
          },
          {
            code: "OPS",
            summary: "Recorre una muestra pública del flujo de registros de planta. La configuración, los usuarios y las integraciones se revisan para cada proyecto; la muestra no equivale a un entorno propio habilitado.",
            href: "/app/",
            action: "Abrir muestra de GREENATICS OPS",
            detailsHref: "/servicios/greenatics-ops/?perfil=empresa",
            detailsAction: "Consultar configuración y acompañamiento",
          },
        ]}
      />

      <section className="gt-route-closing gt-route-closing--company" aria-labelledby="company-next-step-title">
        <div className="container gt-route-closing__inner">
          <div><span className="eyebrow">Siguiente paso</span><h2 id="company-next-step-title">Definamos qué necesita funcionar en tu operación.</h2><p>Cuéntanos qué sedes, corrientes o datos tienes que ordenar. Con ese contexto podemos conversar sobre el alcance técnico y la ruta adecuada.</p></div>
          <Link className="button button--dark" href="/contacto/?interes=empresas&perfil=empresa&diagnostico=Organizar%20residuos%20en%20una%20o%20varias%20sedes&prioridad=Compartir%20sedes%2C%20corrientes%2C%20responsables%20y%20necesidad%20actual">Compartir el contexto de mi operación</Link>
        </div>
      </section>
    </>
  );
}
