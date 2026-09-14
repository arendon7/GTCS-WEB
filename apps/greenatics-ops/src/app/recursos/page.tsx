import type { Metadata } from "next";
import Link from "next/link";
import styles from "../biblioteca/resources-v2.module.css";

export const metadata: Metadata = {
  title: "Recursos | Greenatics",
  description:
    "Biblioteca técnica, proyectos documentados e impacto gobernado de Greenatics reunidos en una entrada común para aprender, comprobar experiencia y revisar resultados con contexto.",
  alternates: { canonical: "/recursos" },
};

const layers = [
  {
    number: "01",
    kicker: "Aprender",
    title: "Biblioteca técnica",
    copy: "Guías, manuales, criterios, programas por cultivo y recursos que ayudan a entender una decisión antes de ejecutarla.",
    href: "/biblioteca",
    cta: "Abrir biblioteca",
  },
  {
    number: "02",
    kicker: "Ver experiencia",
    title: "Proyectos / casos",
    copy: "Trabajo documentado con periodo, alcance, evidencia y aprendizajes, sin presentar una fotografía histórica como prueba automática del estado actual.",
    href: "/proyectos",
    cta: "Ver proyectos",
  },
  {
    number: "03",
    kicker: "Ver resultados",
    title: "Impacto",
    copy: "Indicadores públicos únicamente cuando existe fuente, periodo, metodología y gobierno suficiente para sostener lo publicado.",
    href: "/impacto",
    cta: "Ver impacto",
  },
] as const;

const decisionRoutes = [
  {
    number: "01",
    kicker: "Necesito conocimiento técnico",
    title: "Quiero una guía, un manual o un criterio para tomar una decisión.",
    copy: "Empieza por la biblioteca y busca el recurso según cultivo, síntoma, producto, aplicación o tema técnico disponible.",
    href: "/biblioteca",
    cta: "Explorar biblioteca",
  },
  {
    number: "02",
    kicker: "Quiero comprobar experiencia",
    title: "Necesito ver proyectos reales y entender qué se hizo.",
    copy: "Los casos publicados separan contexto, evidencia, aprendizaje y estado para que la experiencia sea verificable y transferible.",
    href: "/proyectos",
    cta: "Revisar casos",
  },
  {
    number: "03",
    kicker: "Busco resultados",
    title: "Quiero revisar indicadores sin perder la fuente ni el periodo.",
    copy: "Impacto reúne únicamente cifras publicables bajo reglas explícitas de trazabilidad, contexto y aprobación.",
    href: "/impacto",
    cta: "Revisar impacto",
  },
  {
    number: "04",
    kicker: "Tengo un problema concreto",
    title: "Necesito pasar del conocimiento a una ruta de intervención.",
    copy: "Si ya existe una necesidad operativa, técnica o territorial, entra a Soluciones o lleva el contexto directamente al equipo Greenatics.",
    href: "/soluciones",
    cta: "Explorar soluciones",
  },
] as const;

export default function ResourcesHubPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero} aria-labelledby="resources-hub-title">
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Recursos Greenatics · conocimiento + evidencia</span>
              <h1 id="resources-hub-title">Conocimiento, experiencia e impacto para decidir mejor.</h1>
              <p className={styles.lead}>
                Recursos organiza tres rutas distintas: aprender con la biblioteca, comprobar experiencia mediante proyectos documentados y revisar resultados únicamente cuando pueden sostenerse con fuente, periodo y metodología.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/biblioteca">Abrir biblioteca</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/proyectos">Ver proyectos</Link>
              </div>
            </div>

            <aside className={styles.heroLedger}>
              <span>Una entrada · tres funciones</span>
              <strong>Aprender, comprobar y revisar resultados.</strong>
              <p>Cada capa responde una pregunta diferente y conserva su propio estándar de evidencia.</p>
              <div className={styles.ledgerRows}>
                <div className={styles.ledgerRow}><span>01</span><div><strong>Biblioteca</strong><small>guías · manuales · criterios</small></div></div>
                <div className={styles.ledgerRow}><span>02</span><div><strong>Proyectos</strong><small>contexto · evidencia · aprendizajes</small></div></div>
                <div className={styles.ledgerRow}><span>03</span><div><strong>Impacto</strong><small>fuente · periodo · metodología</small></div></div>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.universes} aria-labelledby="resources-layers-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Tres rutas</span>
                <h2 id="resources-layers-title">No todo recurso cumple la misma función.</h2>
              </div>
              <p>Una guía orienta. Un caso documenta experiencia. Un indicador resume un resultado bajo reglas de publicación. Separarlos evita convertir información útil en una promesa ambigua.</p>
            </div>

            <div className={styles.universeGrid}>
              {layers.map((item) => (
                <article className={styles.universeCard} key={item.number}>
                  <span>{item.number} · {item.kicker}</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <Link href={item.href}>{item.cta} →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.router} aria-labelledby="resources-router-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Empieza por lo que necesitas encontrar</span>
                <h2 id="resources-router-title">No necesitas conocer el nombre del documento.</h2>
              </div>
              <p>Elige si estás buscando conocimiento, experiencia, resultados o una ruta de intervención.</p>
            </div>

            <div className={styles.intentList}>
              {decisionRoutes.map((route) => (
                <Link className={styles.intentRow} href={route.href} key={route.number}>
                  <span className={styles.intentNumber}>{route.number}</span>
                  <small className={styles.intentKicker}>{route.kicker}</small>
                  <div><h3>{route.title}</h3><p>{route.copy}</p></div>
                  <strong>{route.cta} →</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Recursos Greenatics</span>
              <h2>El conocimiento sirve cuando ayuda a tomar la siguiente decisión.</h2>
            </div>
            <div>
              <p>Consulta una guía, revisa un caso, valida un indicador o lleva un problema concreto al equipo si ya necesitas convertir información en una intervención.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.light}`} href="/contacto?source=recursos">Hablar con nosotros</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/soluciones">Explorar soluciones</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
