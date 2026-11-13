import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SegmentDigitalTools } from "@/components/segment-digital-tools";
import { AgroindustryEvaluationV05 } from "./agroindustry-evaluation-v05";

export const metadata: Metadata = {
	title: "Biomasa agroindustrial: evaluación y valorización",
	description: "Caracterización de biomasa, prefactibilidad, diseño y operación de proyectos agroindustriales de biogás, compostaje y valorización.",
  alternates: { canonical: "/agroindustria/" },
};

const currents = [
  ["Subproductos vegetales", "Pulpa, cáscaras, bagazo y fibras pueden cambiar mucho entre lotes. Revisamos cuánto se genera, su humedad, composición, temporada y manejo actual."],
  ["Efluentes y aguas de proceso", "Partimos del origen, los caudales y los análisis disponibles para establecer qué falta medir y qué alternativas de tratamiento conviene estudiar."],
  ["Lodos y mezclas húmedas", "Evaluamos sólidos, contenido de agua y mezclas para entender las exigencias del tratamiento, su logística y el manejo de las salidas."],
  ["Pérdidas y excedentes de producción", "Ubicamos en qué etapa aparecen, cuánto varían y cómo podrían separarse para comparar opciones de aprovechamiento."],
] as const;

const outcomes = [
  {
    title: "Biogás y bioenergía",
    copy: "Estudiamos la corriente, el proceso y una demanda energética posible. La evaluación conecta captura y manejo del gas con seguridad, continuidad operativa y destino del digestato.",
    href: "/soluciones/biogas-energia/?perfil=agroindustria",
    cta: "Explorar la ruta de biogás",
  },
  {
    title: "Compost y acondicionadores",
    copy: "Relacionamos mezcla, humedad, estabilización y calidad requerida con el uso previsto en suelo o sustrato. La ruta y sus controles se definen a partir del material y del destino.",
    href: "/servicios/aprovechamiento-productivo/?perfil=agroindustria",
    cta: "Evaluar rutas de aprovechamiento",
  },
  {
    title: "Desarrollo de productos derivados",
    copy: "Cuando una corriente abre otra posibilidad de aprovechamiento, evaluamos materia prima, proceso, calidad y uso previsto; un piloto permite definir qué conviene validar antes de escalar.",
    href: "/contacto/?servicio=desarrollo-productos-derivados&perfil=agroindustria",
    cta: "Conversar sobre un producto",
  },
] as const;

type ServicePath = {
  id: string;
  title: string;
  copy: string;
  href: string;
  cta: string;
};

type ServiceGroup = {
  id: string;
  heading: string;
  intro: string;
  variant: "assessment" | "infrastructure" | "operation" | "development";
  services: ServicePath[];
};

const serviceGroups: ServiceGroup[] = [
  {
    id: "agroindustry-assessment",
    heading: "Entender qué tienes y si vale la pena avanzar",
    intro: "Ordenamos los datos de la corriente y comparamos rutas posibles con la decisión que tu proyecto necesita tomar.",
    variant: "assessment",
    services: [
      {
        id: "S01",
        title: "Diagnóstico y caracterización de corrientes agroindustriales",
        copy: "Ubicamos fuentes, cantidades, composición y variaciones del material. Definimos el muestreo según la decisión que debes tomar y señalamos qué información falta antes de comparar rutas.",
        href: "/servicios/diagnostico-residuos/?perfil=agroindustria",
        cta: "Ver el alcance del diagnóstico",
      },
      {
        id: "S04",
        title: "Prefactibilidad técnico-económica de proyectos de valorización",
        copy: "Contrastamos alternativas, infraestructura, logística y condiciones de operación con estimaciones preliminares acordadas. El estudio orienta si conviene pasar a ingeniería; el alcance no reemplaza un presupuesto definitivo.",
        href: "/contacto/?servicio=prefactibilidad&perfil=agroindustria",
        cta: "Consultar una prefactibilidad",
      },
    ],
  },
  {
    id: "agroindustry-infrastructure",
    heading: "Diseñar una planta o recuperar la que ya tienes",
    intro: "Convertimos la alternativa priorizada en criterios de ingeniería, intervenciones y condiciones de puesta en operación.",
    variant: "infrastructure",
    services: [
      {
        id: "S05",
        title: "Diseño e ingeniería de sistemas de tratamiento y aprovechamiento",
        copy: "Traducimos la ruta seleccionada en criterios de proceso, planos, cantidades y disciplinas según el nivel de ingeniería acordado. Construcción, montaje y arranque se delimitan por separado.",
        href: "/servicios/plantas-modulares/?perfil=agroindustria",
        cta: "Revisar diseño e ingeniería",
      },
      {
        id: "S09",
        title: "Planta en Marcha: rehabilitación y puesta en operación de infraestructura existente",
        copy: "Revisamos infraestructura, proceso y registros para priorizar intervenciones y establecer condiciones de arranque. La capacidad recuperable se determina durante la evaluación técnica.",
        href: "/servicios/rehabilitacion-infraestructura/?perfil=agroindustria",
        cta: "Conocer Planta en Marcha",
      },
    ],
  },
  {
    id: "agroindustry-operation",
    heading: "Fortalecer al equipo o asumir una operación acordada",
    intro: "Definimos el nivel de respaldo que necesita la planta: dirección técnica junto a tu equipo o gestión integral con responsabilidades claras.",
    variant: "operation",
    services: [
      {
        id: "S10",
        title: "Dirección técnica y transferencia operacional de plantas",
        copy: "Acompañamos a tu equipo a leer variables críticas, sostener rutinas y resolver decisiones del proceso. La dirección técnica y sus responsabilidades quedan definidas en el alcance.",
        href: "/servicios/operacion-delegada/?perfil=agroindustria#modalidad-direccion-tecnica",
        cta: "Conocer la dirección técnica",
      },
      {
        id: "S11",
        title: "Operación integral de plantas de tratamiento y valorización",
        copy: "Asumimos las tareas recurrentes que se acuerden para la planta. Turnos, personal, mantenimiento, insumos y reportes se especifican junto con responsabilidades y exclusiones.",
        href: "/servicios/operacion-delegada/?perfil=agroindustria#modalidad-operacion-integral",
        cta: "Revisar modalidades de operación",
      },
    ],
  },
  {
    id: "agroindustry-development",
    heading: "Probar una alternativa o desarrollar un producto",
    intro: "Delimitamos una evaluación para saber qué se debe ajustar, validar o descartar antes de escalar una solución.",
    variant: "development",
    services: [
      {
        id: "S19",
        title: "Pilotos de I+D+i para la valorización agroindustrial",
        copy: "Acordamos material, condiciones y criterios para avanzar, ajustar o detener la prueba. Sus resultados orientan el siguiente paso y requieren validación adicional antes de proyectar desempeño a escala.",
        href: "/contacto/?servicio=idi-agroindustrial&perfil=agroindustria",
        cta: "Consultar un piloto de I+D+i",
      },
      {
        id: "S17",
        title: "Valorización y desarrollo técnico de productos derivados",
        copy: "Exploramos cómo transformar una corriente en un producto con uso definido, revisando proceso, calidad y requisitos técnicos. Es una ruta de desarrollo independiente del catálogo Wondergreen.",
        href: "/contacto/?servicio=desarrollo-productos-derivados&perfil=agroindustria",
        cta: "Conversar sobre un producto derivado",
      },
    ],
  },
];

export default function AgroindustryPage() {
  return (
    <>
      <section className="agroindustry-v4-hero" aria-labelledby="agroindustry-page-title">
        <div className="container agroindustry-v4-hero__grid gt-segment-hero-grid">
          <div className="gt-segment-hero__copy">
            <span className="eyebrow eyebrow--light">Agroindustria y proyectos productivos</span>
			<h1 id="agroindustry-page-title">Convierte tu <span className="agroindustry-v4-title-accent">biomasa</span> en una nueva ruta productiva.</h1>
			<p className="lead">Caracterizamos corrientes y procesos, comparamos rutas de biogás, compostaje y desarrollo de productos, y llevamos la alternativa elegida a prefactibilidad, ingeniería, recuperación de infraestructura, pilotaje u operación.</p>
          </div>
          <Link className="button button--light gt-segment-hero__primary" href="/servicios/diagnostico-residuos/?perfil=agroindustria">Evaluar una oportunidad</Link>
          <figure className="agroindustry-v4-hero__photo gt-segment-hero__visual">
            <Image
              src="/services/agroindustry-characterization-editorial.jpg"
              alt="Una ingeniera y un operario toman una muestra de subproductos orgánicos en una planta agroindustrial."
              fill
              priority
              sizes="(max-width: 1100px) 100vw, 38vw"
            />
            <figcaption>
              <strong>Del proceso real a una ruta que se puede estudiar.</strong>
            </figcaption>
          </figure>
          <Link className="button button--outline-light gt-segment-hero__secondary" href="#rutas-de-valorizacion">Explorar rutas de valorización</Link>
        </div>
      </section>

      <section className="agroindustry-v4-currents" aria-labelledby="agroindustry-currents-title">
        <div className="container">
          <div className="wg-v4-heading">
            <div><span className="eyebrow">Biomasa, proceso y destino</span><h2 id="agroindustry-currents-title">Cada corriente exige una lectura distinta. Ahí empieza el aprovechamiento.</h2></div>
            <p>Las pulpas, fibras, efluentes y lodos cambian en composición, humedad, volumen y temporada. Miramos dónde aparecen dentro del proceso, cómo se manejan hoy y qué datos existen para estimar su potencial y sus exigencias logísticas. Con esa lectura inicial defines qué medir y qué rutas vale la pena comparar.</p>
          </div>
          <div className="agroindustry-v4-currents__layout">
            <figure className="agroindustry-v4-currents__visual">
              <div className="agroindustry-v4-currents__frame">
                <Image
                  src="/services/agroindustry-biomass-editorial.jpg"
                  alt="Técnica y productor revisan subproductos de una operación agroindustrial."
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 42vw, 34vw"
                />
              </div>
              <figcaption>La variación del material importa tanto como su origen.</figcaption>
            </figure>
            <div className="agroindustry-v4-currents__list">
              {currents.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
          </div>
          <AgroindustryEvaluationV05 />
        </div>
      </section>

      <section className="agroindustry-v4-service-paths" aria-labelledby="agroindustry-services-title">
        <div className="container">
          <header className="agroindustry-v4-service-paths__heading">
            <h2 id="agroindustry-services-title">Un equipo técnico para cada <span className="agroindustry-v4-title-accent">momento del proyecto.</span></h2>
            <p>No partimos de una tecnología única. Empezamos por el material, la escala y las condiciones de tu planta; luego conectamos diagnóstico y prefactibilidad con ingeniería, rehabilitación, operación o un piloto de I+D+i, según la decisión que tengas por delante.</p>
          </header>
          <div className="agroindustry-v4-service-paths__groups">
            {serviceGroups.map((group) => (
              <section
                aria-labelledby={`${group.id}-title`}
                className={`agroindustry-v4-service-paths__group agroindustry-v4-service-paths__group--${group.variant}`}
                key={group.id}
              >
                <div className="agroindustry-v4-service-paths__group-intro"><h3 id={`${group.id}-title`}>{group.heading}</h3><p>{group.intro}</p></div>
                <div className="agroindustry-v4-service-paths__offers">
                  {group.services.map((service) => (
                    <article className="agroindustry-v4-service-paths__offer" data-service-id={service.id} key={service.id}>
                      <h4>{service.title}</h4>
                      <p>{service.copy}</p>
                      <Link href={service.href}>{service.cta}<span aria-hidden="true"> →</span></Link>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <SegmentDigitalTools
        id="herramientas-agroindustria"
        heading="La trazabilidad también hace parte de una operación bien diseñada."
        intro="Cuando el proceso necesita conectar recepción, actividades, lotes, equipos y salidas, GREENATICS OPS ofrece una muestra navegable para conocer ese flujo. La herramienta complementa el trabajo técnico: no reemplaza la operación ni implica que la configuración esté activa para cada proyecto."
        entries={[
          {
            code: "OPS",
            summary: "Explora la estación pública y conoce cómo se organiza la información de una jornada. Si buscas configurar registros, módulos o acompañamiento para una planta agroindustrial, revisa primero el alcance del servicio.",
            href: "/app/",
            action: "Recorrer la muestra de OPS",
            detailsHref: "/servicios/greenatics-ops/?perfil=agroindustria",
            detailsAction: "Consultar configuración para una planta",
          },
        ]}
      />

      <section className="agroindustry-v4-biogas" aria-labelledby="agroindustry-biogas-title">
        <div className="container agroindustry-v4-biogas__grid">
          <div className="agroindustry-v4-biogas__copy">
            <span className="eyebrow">Más de tres años de experiencia · Támesis</span>
            <h2 id="agroindustry-biogas-title">En Támesis, la ruta se entiende desde la recepción hasta el uso del biogás.</h2>
            <p>En Támesis acompañamos una cadena de digestión anaerobia que articula recepción y acondicionamiento de biomasa, dos etapas de hidrólisis y un reactor UASB. La experiencia combina infraestructura instalada con seguimiento al proceso y sus salidas; sirve para explicar cómo se organiza la ruta y qué condiciones deben mirarse en cada proyecto.</p>
            <ul>
              <li>Recepción selectiva y acondicionamiento de la biomasa.</li>
              <li>Digestión anaerobia, captura, conducción y manejo del biogás.</li>
              <li>Relación entre gas, energía útil, compost, digestatos y continuidad de operación.</li>
            </ul>
            <div className="button-row">
              <Link className="button button--dark" href="/soluciones/biogas-energia/?perfil=agroindustria">Conocer la ruta de biogás</Link>
              <Link className="button button--ghost" href="/proyectos/tamesis/?perfil=agroindustria">Ver proceso y evidencias</Link>
            </div>
          </div>
          <div className="agroindustry-v4-biogas__gallery" role="group" aria-label="Etapas de la ruta de digestión anaerobia en Támesis">
            <figure className="agroindustry-v4-biogas__photo agroindustry-v4-biogas__photo--featured">
              <div className="agroindustry-v4-biogas__frame">
                <Image src="/projects/tamesis/planta-aerea.jpg" alt="Vista aérea de la infraestructura de aprovechamiento en Támesis" fill sizes="(max-width: 900px) 100vw, 34vw" />
              </div>
              <figcaption><span>Contexto territorial</span> La infraestructura y su entorno.</figcaption>
            </figure>
            <figure className="agroindustry-v4-biogas__photo">
              <div className="agroindustry-v4-biogas__frame">
                <Image src="/projects/tamesis/recepcion-organicos.jpg" alt="Recepción de residuos orgánicos para su acondicionamiento en Támesis" fill sizes="(max-width: 900px) 48vw, 16vw" />
              </div>
              <figcaption><span>Recepción</span> Acondicionamiento de la biomasa.</figcaption>
            </figure>
            <figure className="agroindustry-v4-biogas__photo">
              <div className="agroindustry-v4-biogas__frame">
                <Image src="/projects/tamesis/reactor-uasb.jpeg" alt="Reactor UASB de 30 m³ instalado en Támesis" fill sizes="(max-width: 900px) 48vw, 16vw" />
              </div>
              <figcaption><span>Digestión</span> Reactor UASB.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="agroindustry-v4-outcomes" id="rutas-de-valorizacion" aria-labelledby="agroindustry-outcomes-title">
        <div className="container">
          <div className="wg-v4-heading">
            <div><span className="eyebrow">Rutas de valorización</span><h2 id="agroindustry-outcomes-title">Energía, suelo o nuevos productos: cada destino tiene su propio proceso.</h2></div>
            <p>La composición de la corriente, la infraestructura disponible y la calidad que exige el uso final orientan el tratamiento. Comparamos esas condiciones para definir qué alternativa estudiar, qué controles considerar y qué evidencia reunir antes de escalarla.</p>
          </div>
          <div className="agroindustry-v4-outcomes__grid">
            {outcomes.map(({ title, copy, href, cta }) => <article key={title}><h3>{title}</h3><div><p>{copy}</p><div className="agroindustry-v4-outcomes__links"><Link href={href}>{cta}<span aria-hidden="true"> →</span></Link></div></div></article>)}
          </div>
          <div className="button-row"><Link className="button button--dark" href="/servicios/aprovechamiento-productivo/?perfil=agroindustria">Ver valorización y bioeconomía</Link><Link className="button button--ghost" href="/servicios/greenatics-ops/?perfil=agroindustria">Conocer trazabilidad en OPS</Link></div>
        </div>
      </section>

      <section className="agroindustry-v4-products" aria-labelledby="agroindustry-products-title">
        <div className="container">
          <div className="agroindustry-v4-products__intro">
            <div className="agroindustry-v4-products__identity">
              <Image src="/brand/wondergreen-nutrients-transparent.png" alt="Wondergreen Nutrients" width={220} height={62} />
              <span className="eyebrow">Nutrición y manejo del cultivo</span>
            </div>
            <h2 id="agroindustry-products-title">Para volver al suelo, la formulación y el cultivo tienen que conversar.</h2>
            <p>Wondergreen reúne compost, fertilizantes organominerales sólidos, formulaciones líquidas basadas en bioles y bioinsumos para acompañar decisiones agronómicas. Cada familia cumple un papel distinto: acondicionar el suelo, aportar nutrientes o integrar herramientas biológicas al manejo del cultivo.</p>
            <p className="agroindustry-v4-products__context">El uso agrícola se define con el material, el suelo, el cultivo y su ficha técnica. Una biomasa o un digestato de un proyecto no se convierte automáticamente en producto Wondergreen.</p>
          </div>
          <div className="agroindustry-v4-products__features" aria-label="Cómo se organizan las familias de fertilizantes Wondergreen">
            <article className="agroindustry-v4-products__feature">
              <figure>
                <Image src="/products/agroindustry/wondergreen-organomineral-solids-scene-v01.jpg" alt="Planta joven con raíces visibles y gránulos sólidos distribuidos en el suelo alrededor de la zona radicular." fill sizes="(max-width: 760px) 100vw, 42vw" />
              </figure>
              <div className="agroindustry-v4-products__feature-copy">
                <span className="eyebrow">Fertilizantes sólidos · 4 formulaciones</span>
                <h3>Nutrientes integrados en una matriz organomineral ocluida.</h3>
                <p>Las formulaciones combinan nutrientes minerales y materia orgánica, y están diseñadas para una liberación gradual. La respuesta depende de la formulación, el lote, el suelo y el manejo del cultivo.</p>
                <ul aria-label="Formulaciones sólidas Wondergreen">
                  <li>2GROW · 15-3-3</li><li>2BALANCE · 7-7-7</li><li>2BLOOM · 3-8-3</li><li>2FRUIT · 3-3-8</li>
                </ul>
                <Link href="/wondergreen/#solidos">Explorar las formulaciones sólidas <span aria-hidden="true">→</span></Link>
              </div>
            </article>
            <article className="agroindustry-v4-products__feature agroindustry-v4-products__feature--liquid">
              <figure>
                <Image src="/products/agroindustry/wondergreen-biol-liquids-scene-v01.jpg" alt="Muestra de líquido ámbar junto a biomasa vegetal y raíces de cultivo visibles en el suelo." fill sizes="(max-width: 760px) 100vw, 42vw" />
              </figure>
              <div className="agroindustry-v4-products__feature-copy">
                <span className="eyebrow">Fertilizantes líquidos · 5 formulaciones</span>
                <h3>Bioles de fermentación anaerobia, formulados y estabilizados.</h3>
                <p>La línea parte de bioles de fermentación anaerobia multietapa y luego pasa por formulación y estabilización. Aporta materia orgánica, nutrientes y microorganismos benéficos al sistema suelo-planta.</p>
                <ul aria-label="Formulaciones líquidas Wondergreen">
                  <li>2GROW · 100-20-20 y 200-0-0</li><li>2BALANCE · 70-70-70</li><li>2BLOOM · 30-80-30</li><li>2FRUIT · 30-30-80</li>
                </ul>
                <Link href="/wondergreen/#liquidos">Conocer la línea líquida y su base biológica <span aria-hidden="true">→</span></Link>
              </div>
            </article>
          </div>
          <div className="agroindustry-v4-products__other-families" aria-label="Otras familias Wondergreen">
            <article><strong>Compost</strong><p>Acondicionador orgánico para preparar suelos y sustratos.</p><Link href="/wondergreen/#compost">Ver compost <span aria-hidden="true">→</span></Link></article>
            <article><strong>Bioinsumos</strong><p>Referencias botánicas y microbiológicas para integrar al manejo del cultivo.</p><Link href="/wondergreen/#bioinsumos">Explorar bioinsumos <span aria-hidden="true">→</span></Link></article>
          </div>
          <div className="agroindustry-v4-products__actions"><Link className="button button--dark" href="/wondergreen/">Explorar Wondergreen <span aria-hidden="true">→</span></Link><Link href="/servicios/programas-wondergreen/?perfil=agroindustria">Solicitar acompañamiento agronómico <span aria-hidden="true">→</span></Link><Link href="/wondergreen/ciencia/">Leer sobre formulación y evidencia científica <span aria-hidden="true">→</span></Link></div>
          <p className="agroindustry-v4-product-note">La investigación en fertilizantes organominerales orienta preguntas sobre formulación, suelo y disponibilidad de nutrientes; sus resultados dependen del material y del cultivo estudiados. No son resultados de ensayos Wondergreen. La dosis, el uso y la composición se consultan en la ficha vigente de cada referencia.</p>
        </div>
      </section>

      <section className="closing-cta agroindustry-v4-closing" aria-labelledby="agroindustry-next-step-title"><div className="container closing-inner"><div><span className="eyebrow">Primera conversación</span><h2 id="agroindustry-next-step-title">Cuéntanos qué genera tu proceso y qué decisión necesitas tomar.</h2><p>Trae una corriente priorizada, el sitio y el periodo o temporada, junto con el manejo actual, cantidades o análisis disponibles y la salida que buscas. Así podremos orientar si conviene caracterizar, preparar un piloto o detener la evaluación.</p></div><Link className="button button--dark" href="/contacto/?servicio=diagnostico-residuos&perfil=agroindustria&diagnostico=Evaluar%20una%20corriente%20agroindustrial&prioridad=Compartir%20sitio%2C%20periodo%20o%20temporada%2C%20cantidad%2C%20calidad%2C%20manejo%20actual%20y%20destino%20posible">Evaluar mi corriente</Link></div></section>
    </>
  );
}
