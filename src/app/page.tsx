import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeProjectEvidence } from "@/components/public-home-evidence-crops";
import { PublicShell } from "@/components/public-shell";
import { publicCommercialMethod } from "@/data/public-method";
import styles from "./public-home-v2.module.css";

export const metadata: Metadata = {
  title: "Greenatics | Transformamos residuos en vida",
  description:
    "Greenatics diseña e implementa soluciones de gestión integral de residuos que conectan planeación, infraestructura, operación, datos y valorización para devolver valor al territorio y a los sistemas productivos.",
  alternates: { canonical: "/" },
};

const universes = [
  {
    number: "01",
    kicker: "Organizaciones",
    title: "Soluciones para organizaciones",
    copy: "Planeación, soporte jurídico-regulatorio, rutas, plantas, dirección técnica, operación, datos y valorización con actividades, entregables y límites de alcance definidos.",
    href: "/soluciones",
    cta: "Explorar soluciones",
  },
  {
    number: "02",
    kicker: "Agro",
    title: "Wondergreen",
    copy: "Fertilizantes organominerales, bioinsumos, programas por cultivo, guías y acompañamiento técnico para conectar nutrición, suelo y seguimiento.",
    href: "/wondergreen",
    cta: "Descubrir Wondergreen",
  },
  {
    number: "03",
    kicker: "Hogar · jardín · huerta",
    title: "Casa & Jardín",
    copy: "Productos por etapa, kits y guías para plantas de casa, jardines, huertas y viveros, con orientación cuando la etapa o condición todavía no están claras.",
    href: "/casa-jardin",
    cta: "Explorar Casa & Jardín",
  },
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
    copy: "Experiencia documentada en territorio, con contexto suficiente para entender alcance y aprendizaje.",
    href: "/proyectos",
    cta: "Ver proyectos",
  },
  {
    number: "03",
    title: "Impacto",
    copy: "Indicadores públicos respaldados por fuente, periodo y metodología antes de convertirse en una cifra comunicada.",
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
                Diseñamos e implementamos soluciones de gestión integral de residuos que conectan planeación, infraestructura, operación, datos y valorización para devolver valor al territorio y a los sistemas productivos.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/soluciones">Soluciones para organizaciones</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/wondergreen">Descubrir Wondergreen</Link>
              </div>
              <div className={styles.capabilityLine} aria-label="Capacidades Greenatics">
                <span>Planeación</span>
                <span>Regulación</span>
                <span>Infraestructura</span>
                <span>Operación</span>
                <span>Datos</span>
                <span>Valorización</span>
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
                Elige la ruta según lo que necesitas: servicios para organizaciones, nutrición y bioinsumos para el agro, o productos y guías para casa, jardín y huerta.
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
              <span className={styles.eyebrow}>Cómo trabajamos</span>
              <h2 id="home-identity-title">Conectamos la decisión técnica con la ejecución.</h2>
              <p>
                Podemos intervenir una fase puntual o articular varias. El alcance parte del resultado que se necesita, define responsabilidades y entregables, y usa la evidencia de la implementación para acompañar, corregir y mejorar.
              </p>
              <Link className={styles.textLink} href="/soluciones">Conocer cómo trabajamos →</Link>
            </div>

            <div className={styles.logicRail} aria-label="Lógica de trabajo Greenatics">
              {publicCommercialMethod.map(([number, title, copy]) => (
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
              <h2 id="home-wondergreen-title">Nutrición que trabaja con el suelo.</h2>
            </div>

            <div className={styles.wondergreenCopy}>
              <p>
                Wondergreen conecta productos, programas por cultivo y soporte técnico alrededor del suelo, la nutrición y el seguimiento. Las características de cada referencia se publican con su soporte documental y la profundidad sobre organomineral, oclusión y lenta liberación se consulta en la ruta de tecnología.
              </p>
              <div className={styles.wondergreenLinks} aria-label="Profundizar en Wondergreen">
                <Link href="/wondergreen/productos">Productos →</Link>
                <Link href="/wondergreen/cultivos">Cultivos →</Link>
                <Link href="/wondergreen/tecnologia">Tecnología →</Link>
                <Link href="/wondergreen/finder">Encontrar mi programa →</Link>
              </div>
            </div>
          </div>
        </section>

        <HomeProjectEvidence />

        <section className={styles.digital} aria-labelledby="home-digital-title">
          <div className={`${styles.container} ${styles.digitalGrid}`}>
            <div>
              <span className={styles.eyebrow}>GREENATICS OPS</span>
              <h2 id="home-digital-title">Datos para operar, seguir y decidir.</h2>
              <p>
                GREENATICS OPS es la capa operativa para procesos que ya están en ejecución: conecta registros, trazabilidad, indicadores y seguimiento para convertir actividad de campo en información utilizable.
              </p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.buttonDark}`} href="/app">Ingresar a GREENATICS OPS</a>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/soluciones/trazabilidad-datos">Ver soluciones con datos</Link>
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
                Guías, casos e indicadores respaldan decisiones concretas y permiten profundizar sin interrumpir la ruta comercial principal.
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
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Siguiente paso</span>
              <h2 id="home-closing-title">Convirtamos tu necesidad en un alcance concreto.</h2>
            </div>
            <div>
              <p>
                Si ya sabes qué servicio necesitas, revisa su alcance y entregables. Si necesitas aterrizar el punto de partida, cuéntanos el contexto y definimos el siguiente paso sin convertir el diagnóstico en una barrera de entrada.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonLight}`} href="/contacto">Hablar con Greenatics</Link>
                <Link className={`${styles.button} ${styles.buttonOutlineLight}`} href="/soluciones">Explorar soluciones</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
