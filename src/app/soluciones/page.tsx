import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { publicCommercialMethod } from "@/data/public-method";
import { getPrimaryProjectMedia } from "@/data/public-media";
import catalog from "./solutions-catalog.module.css";
import styles from "./solutions-v2.module.css";

export const metadata: Metadata = {
  title: "Soluciones | Greenatics",
  description:
    "Servicios de planeación, regulación, logística, plantas, dirección técnica, operación, datos, valorización y caracterización para ESP, municipios, empresas, instituciones y operadores.",
  alternates: { canonical: "/soluciones" },
};

const audiences = [
  {
    number: "01",
    title: "ESP / Prestadores",
    copy: "Preparar, estabilizar y fortalecer la prestación y sus capacidades operativas, regulatorias, logísticas y de información.",
    href: "/soluciones/esp",
    cta: "Ver ruta para prestadores",
  },
  {
    number: "02",
    title: "Municipios",
    copy: "Conectar planeación territorial, PGIRS, proyectos, infraestructura, valorización y seguimiento con una ruta técnicamente ejecutable.",
    href: "/soluciones/municipios",
    cta: "Ver ruta para municipios",
  },
  {
    number: "03",
    title: "Empresas / Grandes generadores",
    copy: "Pasar de obligaciones y prácticas dispersas a una gestión de residuos medible, trazable y orientada a mejora continua.",
    href: "/soluciones/empresas",
    cta: "Ver ruta para empresas",
  },
  {
    number: "04",
    title: "Propiedad horizontal / Instituciones",
    copy: "Estandarizar separación, almacenamiento, rutas, responsables, indicadores y oportunidades de gestión en una o varias sedes.",
    href: "/soluciones/propiedad-horizontal",
    cta: "Ver ruta multiunidad",
  },
  {
    number: "05",
    title: "Plantas / Operadores",
    copy: "Recuperar, optimizar, dirigir, operar o madurar infraestructura de tratamiento según el estado real del sistema.",
    href: "/soluciones/plantas",
    cta: "Ver ruta de plantas",
  },
];

const serviceFamilies = [
  {
    number: "01",
    title: "Caracterización y línea base",
    copy: "Mediciones, caracterización, mapa de flujos, brechas y criterios de decisión cuando el proyecto necesita información de partida verificable.",
    offers: [
      { label: "Diagnóstico y caracterización de residuos orgánicos", href: "/soluciones/diagnostico-caracterizacion" },
    ],
  },
  {
    number: "02",
    title: "Planeación y programas",
    copy: "PGIRS, PMIRS, programas internos, matrices, hojas de ruta, responsables, indicadores e implementación según el actor y el alcance.",
    offers: [
      { label: "PGIRS · formulación, actualización y fortalecimiento operativo", href: "/soluciones/pgirs" },
      { label: "PMIRS y planes internos de gestión de residuos", href: "/soluciones/pmirs" },
    ],
  },
  {
    number: "03",
    title: "Gestión jurídica y regulatoria",
    copy: "Obligaciones, competencias, conceptos, contratos, trámites y soporte regulatorio para que la decisión técnica tenga una ruta jurídica clara.",
    offers: [
      { label: "Gestión jurídica y regulatoria para residuos, aseo y proyectos", href: "/soluciones/gestion-juridica-regulatoria" },
    ],
  },
  {
    number: "04",
    title: "Rutas y logística",
    copy: "Diseño de rutas y microrrutas, frecuencias, puntos, pilotos, protocolos, datos operativos y criterios de escalamiento.",
    offers: [
      { label: "Diseño e implementación de rutas selectivas y microrrutas", href: "/soluciones/rutas-selectivas" },
      { label: "Pilotos logísticos con motocarguero y toma de datos", href: "/soluciones/motocarguero" },
    ],
  },
  {
    number: "05",
    title: "Plantas y tratamiento",
    copy: "Prefactibilidad, ingeniería, construcción, rehabilitación, puesta en marcha y optimización según la madurez y el problema real del sistema.",
    offers: [
      { label: "Prefactibilidad de plantas y sistemas de tratamiento y valorización", href: "/soluciones/prefactibilidad" },
      { label: "Factibilidad, APU e ingeniería de detalle", href: "/soluciones/factibilidad-ingenieria" },
      { label: "Diseño, construcción e implementación de plantas", href: "/soluciones/plantas-nuevas" },
      { label: "Diagnóstico, rehabilitación y puesta en marcha de infraestructura existente", href: "/soluciones/rehabilitacion" },
    ],
  },
  {
    number: "06",
    title: "Dirección técnica y operación asistida",
    copy: "Protocolos, programación, mantenimiento, calidad, personas, inventarios, informes y fortalecimiento sostenido de la operación.",
    offers: [
      { label: "Dirección técnica y coordinación de operación", href: "/soluciones/direccion-operacion" },
      { label: "Operación integral de plantas de tratamiento y valorización", href: "/soluciones/operacion-integral" },
      { label: "Gestión, recolección y tratamiento de residuos orgánicos para generadores", href: "/soluciones/recoleccion-tratamiento" },
    ],
  },
  {
    number: "07",
    title: "Datos, trazabilidad y OPS",
    copy: "Captura, indicadores, evidencia, lotes, inventarios y seguimiento para convertir la actividad operativa en información útil para decidir.",
    offers: [
      { label: "Trazabilidad digital, indicadores y GREENATICS OPS", href: "/soluciones/trazabilidad-datos" },
    ],
  },
  {
    number: "08",
    title: "Valorización y desarrollo de productos",
    copy: "Especificaciones, control, documentación, ruta regulatoria, presentación y preparación comercial para convertir una salida en un producto vendible.",
    offers: [
      { label: "Valorización y desarrollo de productos", href: "/soluciones/valorizacion-productos" },
    ],
  },
];

const digitalCapabilities = [
  ["01", "Captura", "Datos de campo y operación donde ocurre la actividad."],
  ["02", "Trazabilidad", "Rutas, recepciones, procesos, lotes, inventarios y tareas."],
  ["03", "Seguimiento", "Indicadores, novedades, evidencias y compromisos."],
  ["04", "Decisión", "Lectura de tendencias, prioridades y acciones de mejora."],
];

export default function SolutionsPage() {
  const yarumalEvidence = getPrimaryProjectMedia("yarumal");

  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero} aria-labelledby="solutions-title">
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Soluciones Greenatics · Organizaciones</span>
              <h1 id="solutions-title">Servicios para convertir necesidades de gestión en resultados concretos.</h1>
              <p className={styles.lead}>
                Greenatics estructura y ejecuta servicios de planeación, regulación, logística, plantas, operación, datos, valorización y caracterización. Cada ruta baja hasta actividades, entregables, responsabilidades y límites del alcance.
              </p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.buttonPrimary}`} href="#servicios">Ver servicios y entregables</a>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/contacto">Hablar con Greenatics</Link>
              </div>
              <div className={styles.heroPrinciple}>
                <span>Cómo empezar</span>
                <strong>Puedes entrar directamente al servicio que necesitas. El diagnóstico se incorpora solo cuando faltan datos para definir el punto de partida.</strong>
              </div>
            </div>

            {yarumalEvidence ? (
              <figure className={styles.heroMedia}>
                <Image src={yarumalEvidence.src} alt={yarumalEvidence.alt} fill priority sizes="(max-width: 900px) 100vw, 46vw" />
                <figcaption>
                  <span>Evidencia de proyecto</span>
                  <strong>Yarumal · Antioquia</strong>
                  <small>{yarumalEvidence.caption}</small>
                </figcaption>
              </figure>
            ) : null}
          </div>
        </section>

        <section className={styles.services} id="servicios" aria-labelledby="services-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Qué puedes contratar</span>
                <h2 id="services-title">Ocho familias de servicio para necesidades distintas.</h2>
              </div>
              <p>Cada familia reúne servicios con alcance, entregables, actividades, límites, evidencia disponible y un siguiente paso comercial claro.</p>
            </div>

            <div className={styles.serviceList}>
              {serviceFamilies.map((family) => (
                <article className={catalog.serviceFamily} key={family.number}>
                  <div className={catalog.serviceFamilyIntro}>
                    <span className={styles.index}>{family.number}</span>
                    <h3>{family.title}</h3>
                    <p>{family.copy}</p>
                  </div>
                  <nav className={catalog.serviceOfferList} aria-label={`Servicios de ${family.title}`}>
                    {family.offers.map((offer) => (
                      <Link className={catalog.serviceOffer} href={offer.href} key={offer.href}>
                        <strong>{offer.label}</strong>
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </nav>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.audiences} id="audiencias" aria-labelledby="audiences-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Rutas por organización</span>
                <h2 id="audiences-title">La misma familia de servicio cambia según quién la contrata y qué responsabilidad tiene.</h2>
              </div>
              <p>Si prefieres entrar por tu tipo de organización, estas rutas combinan los servicios y programas más relevantes sin convertir la audiencia en una oferta distinta o cerrada.</p>
            </div>

            <div className={styles.audienceGrid}>
              {audiences.map((audience) => (
                <article className={styles.audienceCard} key={audience.number}>
                  <span className={styles.index}>{audience.number}</span>
                  <div>
                    <h3>{audience.title}</h3>
                    <p>{audience.copy}</p>
                  </div>
                  <Link href={audience.href}>{audience.cta} <span aria-hidden="true">→</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.process} aria-labelledby="process-title">
          <div className={`${styles.container} ${styles.processGrid}`}>
            <div className={styles.processIntro}>
              <span className={styles.eyebrow}>Cómo trabajamos</span>
              <h2 id="process-title">El servicio define el resultado; la línea base solo entra cuando es necesaria.</h2>
              <p>
                Si el cliente ya conoce el problema y existe información suficiente, Greenatics puede entrar directamente a una fase específica. Cuando faltan datos críticos, la caracterización o el diagnóstico se incorpora como una actividad inicial para reducir incertidumbre.
              </p>
            </div>
            <div className={styles.processRail}>
              {publicCommercialMethod.map(([number, title, copy]) => (
                <div className={styles.processStep} key={number}>
                  <span>{number}</span>
                  <div><strong>{title}</strong><p>{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.caseStudy} aria-labelledby="case-title">
          <div className={`${styles.container} ${styles.caseGrid}`}>
            <div className={styles.caseMedia}>
              <Image
                src="/projects/yarumal/aerial-02.webp"
                alt="Segunda vista aérea documentada del caso Greenatics en Yarumal"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </div>
            <div className={styles.caseCopy}>
              <span className={styles.eyebrow}>Plantas e infraestructura existente</span>
              <h2 id="case-title">Antes de reemplazar una planta, hay que entender por qué no está entregando lo esperado.</h2>
              <p>
                Greenatics separa brechas de infraestructura, proceso, suministro, personal, mantenimiento, control y gestión. Esa lectura permite decidir si corresponde rehabilitar, optimizar, operar con otra metodología o madurar una nueva inversión.
              </p>
              <div className={styles.caseLinks}>
                <Link href="/soluciones/rehabilitacion">Revisar infraestructura existente →</Link>
                <Link href="/proyectos/yarumal">Ver caso Yarumal →</Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.digital} aria-labelledby="digital-title">
          <div className={`${styles.container} ${styles.digitalGrid}`}>
            <div>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Tecnología y datos</span>
              <h2 id="digital-title">La consultoría gana valor cuando la información sigue viva después del informe.</h2>
              <p>
                GREENATICS OPS funciona como capa de operación y trazabilidad para procesos activos. Registros, indicadores y seguimiento mantienen viva la información después de una intervención puntual y permiten sostener nuevas decisiones.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonLight}`} href="/soluciones/trazabilidad-datos">Ver trazabilidad y datos</Link>
                <a className={`${styles.button} ${styles.buttonOutlineLight}`} href="/app">Ingresar a GREENATICS OPS</a>
              </div>
            </div>
            <div className={styles.digitalRail}>
              {digitalCapabilities.map(([number, title, copy]) => (
                <div key={number}><span>{number}</span><strong>{title}</strong><small>{copy}</small></div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-cta-title">
          <div className={`${styles.container} ${styles.finalGrid}`}>
            <div>
              <span className={styles.eyebrow}>Cuando todavía hay incertidumbre</span>
              <h2 id="final-cta-title">¿No sabes cuál de estas soluciones corresponde a tu caso?</h2>
            </div>
            <div>
              <p>El orientador inicial organiza actor, necesidad y estado para sugerir qué servicio revisar. No sustituye el alcance comercial ni técnico que finalmente se contrate.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/soluciones/diagnostico-inicial">Usar orientador inicial</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/contacto">Hablar con Greenatics</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}