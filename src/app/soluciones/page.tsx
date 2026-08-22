import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPrimaryProjectMedia } from "@/data/public-media";
import styles from "./solutions-v2.module.css";

export const metadata: Metadata = {
  title: "Soluciones | Greenatics",
  description:
    "Diagnóstico, planeación, regulación, logística, plantas, dirección técnica, datos y valorización para ESP, municipios, empresas, instituciones y operadores.",
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
    copy: "Estandarizar diagnóstico, separación, almacenamiento, rutas, indicadores y oportunidades de gestión en una o varias sedes.",
    href: "/soluciones/propiedad-horizontal",
    cta: "Ver ruta multiunidad",
  },
  {
    number: "05",
    title: "Plantas / Operadores",
    copy: "Diagnosticar, recuperar, optimizar, dirigir o madurar infraestructura de tratamiento antes de comprometer nuevas inversiones.",
    href: "/soluciones/plantas",
    cta: "Ver ruta de plantas",
  },
];

const serviceFamilies = [
  {
    number: "01",
    title: "Diagnóstico y gestión de residuos",
    copy: "Línea base, caracterización, flujos, brechas y priorización para decidir con información real.",
    href: "/soluciones/diagnostico-caracterizacion",
  },
  {
    number: "02",
    title: "Planeación y programas",
    copy: "PGIRS, PMIRS, programas internos, hojas de ruta e implementación según actor, territorio y obligación aplicable.",
    href: "/soluciones/pmirs",
  },
  {
    number: "03",
    title: "Gestión jurídica y regulatoria",
    copy: "Lectura del marco aplicable, responsabilidades, instrumentos, relaciones contractuales y ruta de cumplimiento dentro del alcance definido.",
    href: "/contacto",
  },
  {
    number: "04",
    title: "Rutas y logística",
    copy: "Diseño de rutas y microrrutas, frecuencias, puntos, pilotos, datos operativos y criterios de escalamiento.",
    href: "/soluciones/rutas-selectivas",
  },
  {
    number: "05",
    title: "Plantas y tratamiento",
    copy: "Prefactibilidad, ingeniería, construcción, rehabilitación y optimización según la madurez y el problema real del sistema.",
    href: "/soluciones/infraestructura-plantas",
  },
  {
    number: "06",
    title: "Dirección técnica y operación asistida",
    copy: "Protocolos, programación, mantenimiento, calidad, roles, seguimiento y fortalecimiento de la operación sin presumir un modelo único.",
    href: "/soluciones/direccion-operacion",
  },
  {
    number: "07",
    title: "Datos, trazabilidad y OPS",
    copy: "Captura, indicadores, evidencia, inventarios y seguimiento para convertir la actividad operativa en información útil para decidir.",
    href: "/soluciones/trazabilidad-datos",
  },
  {
    number: "08",
    title: "Valorización y desarrollo de productos",
    copy: "Ruta técnica para convertir salidas del tratamiento en productos con especificaciones, control, documentación y estrategia de aprovechamiento según el caso.",
    href: "/contacto",
  },
];

const process = [
  ["01", "Diagnosticar", "Entender generación, corrientes, infraestructura, operación, datos, restricciones y objetivos."],
  ["02", "Definir la ruta", "Separar lo urgente de lo estructural y ordenar decisiones técnicas, jurídicas, operativas y económicas."],
  ["03", "Implementar", "Ejecutar el alcance contratado: programas, rutas, adecuaciones, protocolos, puesta en marcha o herramientas."],
  ["04", "Acompañar", "Dirigir, medir, documentar y corregir con responsables y una cadencia de seguimiento definida."],
  ["05", "Mejorar y valorizar", "Usar la evidencia para optimizar el sistema y abrir nuevas oportunidades de aprovechamiento cuando sean viables."],
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
              <h1 id="solutions-title">Empieza por tu contexto. Después elegimos el servicio.</h1>
              <p className={styles.lead}>
                Greenatics conecta diagnóstico, planeación, regulación, logística, plantas, dirección técnica, datos y valorización para convertir necesidades de gestión en decisiones, entregables y capacidad operativa.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/soluciones/diagnostico-caracterizacion">No sé por dónde empezar</Link>
                <a className={`${styles.button} ${styles.buttonGhost}`} href="#servicios">Ya sé qué necesito</a>
              </div>
              <div className={styles.heroPrinciple}>
                <span>Principio de trabajo</span>
                <strong>Primero claridad. Después inversión y ejecución.</strong>
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

        <section className={styles.audiences} aria-labelledby="audiences-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>¿Quién eres?</span>
                <h2 id="audiences-title">El mismo residuo exige decisiones distintas según quién lo gestiona.</h2>
              </div>
              <p>La ruta cambia por competencia, responsabilidad, escala, infraestructura, tipo de generador y relación con usuarios. Por eso la primera entrada es el contexto.</p>
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

        <section className={styles.services} id="servicios" aria-labelledby="services-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Ya sé qué necesito</span>
                <h2 id="services-title">Ocho familias para contratar actividades y resultados concretos.</h2>
              </div>
              <p>Las familias organizan la conversación comercial. El alcance contractual define estudios, entregables, permisos, personal, operación, herramientas y responsabilidades realmente incluidos.</p>
            </div>

            <div className={styles.serviceList}>
              {serviceFamilies.map((family) => (
                <Link className={styles.serviceRow} href={family.href} key={family.number}>
                  <span className={styles.index}>{family.number}</span>
                  <h3>{family.title}</h3>
                  <p>{family.copy}</p>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.process} aria-labelledby="process-title">
          <div className={`${styles.container} ${styles.processGrid}`}>
            <div className={styles.processIntro}>
              <span className={styles.eyebrow}>Cómo trabajamos</span>
              <h2 id="process-title">El diagnóstico ordena la ruta; no reemplaza el servicio.</h2>
              <p>
                Cuando el alcance ya está claro podemos entrar directamente a una fase específica. Cuando no lo está, la línea base evita diseñar rutas, comprar equipos o intervenir infraestructura sobre supuestos débiles.
              </p>
            </div>
            <div className={styles.processRail}>
              {process.map(([number, title, copy]) => (
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
                GREENATICS OPS funciona como capa de operación y trazabilidad para procesos activos. La arquitectura deja espacio para incorporar nuevas herramientas de captura de campo, diagnóstico y seguimiento sin convertir cada servicio en una aplicación aislada.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonLight}`} href="/soluciones/trazabilidad-datos">Ver trazabilidad y datos</Link>
                <a className={`${styles.button} ${styles.buttonOutlineLight}`} href="/app">Ingresar</a>
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
              <span className={styles.eyebrow}>Punto de entrada recomendado</span>
              <h2 id="final-cta-title">Si todavía no sabes qué contratar, empieza por una línea base.</h2>
            </div>
            <div>
              <p>El diagnóstico permite identificar brechas, prioridades y la siguiente fase sin obligar a convertir todo el problema en un proyecto de infraestructura o en una operación integral.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/soluciones/diagnostico-caracterizacion">Conocer diagnóstico y caracterización</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/contacto">Hablar con Greenatics</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
