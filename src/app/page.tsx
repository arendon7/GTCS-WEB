import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeProjectEvidence } from "@/components/public-home-evidence-crops";
import { PublicShell } from "@/components/public-shell";
import styles from "./public-home-v2.module.css";

export const metadata: Metadata = {
  title: "Greenatics | Transformamos residuos en vida",
  description:
    "Greenatics diseña sistemas que conectan residuos, tecnología, operación, datos y valorización para devolver valor al territorio y a los sistemas productivos.",
  alternates: { canonical: "/" },
};

const universes = [
  {
    number: "01",
    kicker: "Organizaciones",
    title: "Soluciones para organizaciones",
    copy: "Diagnóstico, planeación, regulación, rutas, plantas, dirección técnica y datos para convertir necesidades de gestión en decisiones y entregables concretos.",
    href: "/soluciones",
    cta: "Explorar soluciones",
  },
  {
    number: "02",
    kicker: "Agro",
    title: "Wondergreen",
    copy: "Nutrición organomineral, bioinsumos, programas por cultivo, guías y acompañamiento técnico dentro de una misma lógica de suelo, nutrición y seguimiento.",
    href: "/wondergreen",
    cta: "Descubrir Wondergreen",
  },
  {
    number: "03",
    kicker: "Hogar · jardín · huerta",
    title: "Casa & Jardín",
    copy: "Nutrición por etapas, diagnóstico orientativo y guías para plantas de casa, jardines, huertas y viveros, con el comercio aún separado de la validación técnica.",
    href: "/casa-jardin",
    cta: "Explorar Casa & Jardín",
  },
];

const operatingLogic = [
  ["01", "Entender", "Caracterización, contexto, restricciones, operación existente y datos disponibles."],
  ["02", "Diseñar", "Ruta técnica, jurídica, operativa y económica adecuada al problema real."],
  ["03", "Implementar", "Protocolos, infraestructura, acompañamiento, puesta en marcha o dirección técnica según el alcance."],
  ["04", "Medir y mejorar", "Trazabilidad, indicadores, seguimiento y nuevas decisiones sobre información verificable."],
];

const resourceLinks = [
  {
    number: "01",
    title: "Biblioteca",
    copy: "Guías, criterios y documentos técnicos convertidos en rutas de consulta útiles.",
    href: "/biblioteca",
    cta: "Abrir biblioteca",
  },
  {
    number: "02",
    title: "Proyectos y casos",
    copy: "Experiencia documentada en territorio, separando evidencia histórica de afirmaciones sobre estado actual.",
    href: "/proyectos",
    cta: "Ver proyectos",
  },
  {
    number: "03",
    title: "Impacto",
    copy: "Indicadores públicos solo cuando cuentan con fuente, periodo, metodología y aprobación suficientes.",
    href: "/impacto",
    cta: "Ver impacto",
  },
];

export default function Home() {
  return (
    <PublicShell>
      <div className={styles.page}>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Greenatics · Economía circular aplicada · Colombia</span>
              <h1 id="home-title">
                Transformamos residuos <em>en vida.</em>
              </h1>
              <p className={styles.heroLead}>
                Diseñamos sistemas que conectan residuos, tecnología, operación y datos para devolver valor al territorio y a los sistemas productivos.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/soluciones">Soluciones para organizaciones</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/wondergreen">Descubrir Wondergreen</Link>
              </div>
              <div className={styles.capabilityLine} aria-label="Lógica de trabajo Greenatics">
                <span>Diagnóstico</span>
                <span>Infraestructura</span>
                <span>Operación</span>
                <span>Datos</span>
              </div>
            </div>

            <figure className={styles.heroMedia}>
              <Image
                src="/projects/yarumal/aerial-01.webp"
                alt="Vista aérea documentada del caso Greenatics en Yarumal"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <figcaption>
                <span>Registro documentado</span>
                <strong>Proyecto Yarumal</strong>
                <small>Antioquia · Colombia</small>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.universes} aria-labelledby="home-universes-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Tres universos</span>
                <h2 id="home-universes-title">Una marca. Tres formas claras de entrar.</h2>
              </div>
              <p>
                La web separa la consultoría para organizaciones, la línea agro Wondergreen y la experiencia Casa & Jardín para que cada visitante llegue rápido al contexto que le corresponde.
              </p>
            </div>

            <div className={styles.universeGrid}>
              {universes.map((item) => (
                <article className={styles.universeCard} key={item.number}>
                  <div className={styles.cardTopline}>
                    <span>{item.number}</span>
                    <small>{item.kicker}</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <Link href={item.href}>{item.cta} <span aria-hidden="true">→</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.identity} aria-labelledby="home-identity-title">
          <div className={`${styles.container} ${styles.identityGrid}`}>
            <div className={styles.identityIntro}>
              <span className={styles.eyebrow}>Qué es Greenatics</span>
              <h2 id="home-identity-title">Conectamos la decisión técnica con la ejecución.</h2>
              <p>
                Greenatics trabaja sobre el sistema completo: entender el residuo o la necesidad, definir una ruta viable, acompañar su implementación y sostener decisiones con operación y datos. No toda solución exige construir o asumir la operación completa; el alcance se define según el contexto.
              </p>
              <Link className={styles.textLink} href="/soluciones">Conocer cómo trabajamos →</Link>
            </div>

            <div className={styles.logicRail} aria-label="Lógica de trabajo Greenatics">
              {operatingLogic.map(([number, title, copy]) => (
                <div className={styles.logicStep} key={number}>
                  <span>{number}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.wondergreen} aria-labelledby="home-wondergreen-title">
          <div className={`${styles.container} ${styles.wondergreenGrid}`}>
            <div className={styles.wondergreenBrand}>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Wondergreen · Nutrición para agro</span>
              <Image
                src="/brand/wondergreen-nutrients.webp"
                alt="Wondergreen Nutrients"
                width={420}
                height={221}
                sizes="(max-width: 760px) 76vw, 420px"
              />
              <h2 id="home-wondergreen-title">Nutrición que vuelve a la tierra.</h2>
            </div>

            <div className={styles.wondergreenCopy}>
              <p>
                Wondergreen organiza el portafolio alrededor del suelo, la nutrición, la biología, el cultivo y el seguimiento. En las referencias sólidas que correspondan, la explicación técnica parte de la matriz organomineral, la oclusión y la lenta liberación documentada para esa versión, sin convertir una característica del producto en una promesa agronómica universal.
              </p>
              <div className={styles.wondergreenLinks}>
                <Link href="/wondergreen/productos">Productos →</Link>
                <Link href="/wondergreen/cultivos">Cultivos →</Link>
                <Link href="/biblioteca">Guías →</Link>
              </div>
            </div>
          </div>
        </section>

        <HomeProjectEvidence />

        <section className={styles.digital} aria-labelledby="home-digital-title">
          <div className={`${styles.container} ${styles.digitalGrid}`}>
            <div>
              <span className={styles.eyebrow}>Tecnología y datos</span>
              <h2 id="home-digital-title">La operación también necesita una capa digital.</h2>
              <p>
                GREENATICS OPS conecta datos operativos, trazabilidad y seguimiento para los procesos que ya están en ejecución. La arquitectura digital de Greenatics está pensada para crecer con nuevas herramientas de captura en campo, diagnóstico y acompañamiento sin fragmentar la experiencia del cliente.
              </p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.buttonDark}`} href="/app">Ingresar</a>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/soluciones">Ver soluciones con datos</Link>
              </div>
            </div>

            <div className={styles.digitalRail} aria-label="Capacidades digitales Greenatics">
              <div><span>01</span><strong>Captura</strong><small>Información de campo y operación.</small></div>
              <div><span>02</span><strong>Trazabilidad</strong><small>Procesos, lotes, tareas e inventarios.</small></div>
              <div><span>03</span><strong>Seguimiento</strong><small>Indicadores, alertas y evidencias.</small></div>
              <div><span>04</span><strong>Decisión</strong><small>Análisis y mejora continua.</small></div>
            </div>
          </div>
        </section>

        <section className={styles.resources} aria-labelledby="home-resources-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Recursos</span>
                <h2 id="home-resources-title">Conocimiento, experiencia e impacto en un mismo lugar.</h2>
              </div>
              <p>
                El contenido técnico y la evidencia se organizan como soporte a la decisión, no como una colección aislada de documentos y cifras.
              </p>
            </div>

            <div className={styles.resourceGrid}>
              {resourceLinks.map((item) => (
                <Link className={styles.resourceLink} href={item.href} key={item.number}>
                  <span>{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                    <strong>{item.cta} →</strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closing} aria-labelledby="home-closing-title">
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Greenatics</span>
              <h2 id="home-closing-title">Empieza por el problema. Construimos la ruta contigo.</h2>
            </div>
            <div>
              <p>
                Residuos, operación, plantas, cumplimiento, datos, valorización o nutrición pueden ser el punto de entrada. La primera conversación sirve para ubicar el contexto y definir el siguiente paso.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonLight}`} href="/contacto">Hablar con nosotros</Link>
                <Link className={`${styles.button} ${styles.buttonOutlineLight}`} href="/soluciones">Explorar soluciones</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
