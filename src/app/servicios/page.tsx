import type { Metadata } from "next";
import Link from "next/link";
import { environmentalParkModules, publicServices, serviceCategories } from "@/data/public-services";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: "Servicios | Greenatics",
  description: "Diagnóstico, planeación, rutas selectivas, plantas, rehabilitación, operación y trazabilidad para sistemas de aprovechamiento de residuos orgánicos.",
};

const audiencePaths = [
  {
    id: "municipios",
    title: "Municipios y ESP",
    copy: "Planeación, rutas selectivas, prefactibilidad, infraestructura, operación e indicadores para convertir metas territoriales en capacidad operativa.",
    cta: "Ver servicios para territorio",
  },
  {
    id: "empresas",
    title: "Empresas y grandes generadores",
    copy: "Diagnóstico, PMIRS, recolección, tratamiento, evidencia y trazabilidad para ordenar la corriente orgánica desde el origen hasta su aprovechamiento.",
    cta: "Ver servicios para empresas",
  },
];

export default function ServicesPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" aria-label="Greenatics">
            <img className={styles.logo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
          </Link>
          <nav className={styles.nav} aria-label="Navegación de servicios">
            <a href="#catalogo">Catálogo</a>
            <a href="#parque-ambiental">Sistema integrado</a>
            <Link href="/biblioteca">Biblioteca</Link>
            <Link href="/wondergreen">Wondergreen</Link>
          </nav>
          <Link className={`${styles.button} ${styles.primary}`} href="/app">Acceder a Greenatics</Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Greenatics · soluciones</span>
              <h1>Del residuo al sistema que puede operar.</h1>
              <p className={styles.lead}>Greenatics acompaña la cadena completa: entender la corriente, diseñar la logística, madurar la infraestructura, ponerla en marcha, operar y convertir la información diaria en trazabilidad y mejora.</p>
            </div>
            <aside className={styles.heroAside}>
              <strong>No empezamos por la máquina.</strong>
              <p>La tecnología se selecciona después de entender generación, calidad del residuo, logística, capacidad institucional, salida de productos y modelo operativo.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Dos rutas de entrada</span>
              <h2>El problema cambia según quién genera y quién debe operar.</h2>
            </div>
            <div className={styles.audienceGrid}>
              {audiencePaths.map((path) => (
                <article className={styles.audienceCard} id={path.id} key={path.id}>
                  <span className={styles.eyebrow}>{path.title}</span>
                  <h3>{path.title}</h3>
                  <p>{path.copy}</p>
                  <a href="#catalogo">{path.cta} →</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} id="catalogo">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Catálogo de capacidades</span>
              <h2>No son servicios aislados: son fases que pueden conectarse.</h2>
              <p>El alcance real se define caso por caso. La web explica qué resuelve cada capacidad, qué suele incluir y qué tipo de entregable puede producir.</p>
            </div>
            <div className={styles.categoryNav} aria-label="Categorías de servicios">
              {serviceCategories.map((category) => <a href={`#${category.toLowerCase().replace(/ó/g, "o").replace(/í/g, "i").replace(/ /g, "-")}`} key={category}>{category}</a>)}
            </div>

            {serviceCategories.map((category) => {
              const id = category.toLowerCase().replace(/ó/g, "o").replace(/í/g, "i").replace(/ /g, "-");
              const services = publicServices.filter((service) => service.category === category);
              return (
                <section className={styles.categorySection} id={id} key={category}>
                  <div className={styles.categoryHead}><h2>{category}</h2><span>{services.length} capacidades</span></div>
                  <div className={styles.serviceGrid}>
                    {services.map((service) => (
                      <article className={styles.serviceCard} id={service.slug} key={service.slug}>
                        <div className={styles.serviceMeta}><span className={styles.badge}>{service.category}</span><span className={styles.badge}>{service.audience}</span></div>
                        <h3>{service.name}</h3>
                        <p>{service.summary}</p>
                        <div className={styles.serviceDetail}>
                          <div className={styles.detailBlock}><strong>Qué ayuda a resolver</strong><p>{service.solves}</p></div>
                          <div className={styles.detailBlock}><strong>Puede incluir</strong><ul>{service.includes.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul></div>
                        </div>
                        <a className={styles.serviceCta} href="/#contacto">{service.cta} →</a>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
            <div className={styles.truth}><strong>Alcance gobernado:</strong> cada propuesta concreta define actividades, entregables, responsabilidades, cronograma, supuestos y exclusiones. La descripción web no reemplaza el alcance contractual ni afirma que todos los módulos apliquen a todos los proyectos.</div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`} id="parque-ambiental">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={`${styles.eyebrow} ${styles.lightEyebrow}`}>Cuando la solución es un sistema</span>
              <h2>Un parque ambiental no es una planta aislada.</h2>
              <p>Puede integrar educación, logística, recepción, tratamiento, producto, energía, formación y datos. La combinación final depende de la caracterización y del territorio.</p>
            </div>
            <div className={styles.parkGrid}>
              {environmentalParkModules.map(([title, copy], index) => (
                <article className={styles.parkCard} key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Conocimiento + operación</span>
              <h2>La ingeniería mejora cuando aprende de la operación.</h2>
              <p>La Biblioteca Greenatics organiza guías y criterios técnicos; GREENATICS OPS captura lo que ocurre en planta. La arquitectura futura conecta ambas capas mediante publicación gobernada, no exponiendo datos internos directamente.</p>
            </div>
            <div><Link className={`${styles.button} ${styles.ghost}`} href="/biblioteca">Explorar Biblioteca</Link></div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Siguiente paso</span><h2>¿Tienes un residuo, una planta o un proyecto por estructurar?</h2></div>
            <a className={`${styles.button} ${styles.primary}`} href="/#contacto">Hablar con Greenatics</a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}><span>© Greenatics S.A.S. · Servicios</span><Link href="/">Volver a Greenatics</Link></div>
      </footer>
    </div>
  );
}
