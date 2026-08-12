import type { Metadata } from "next";
import Link from "next/link";
import { companyServices, municipalServices, serviceCategories, services, type ServiceCategory } from "@/data/services";
import styles from "./solutions.module.css";

export const metadata: Metadata = {
  title: "Soluciones | Greenatics",
  description: "Diagnóstico, planeación, rutas selectivas, plantas, operación y trazabilidad para municipios, ESP, empresas y grandes generadores.",
};

const categoryIntro: Record<ServiceCategory, string> = {
  Planeación: "Entender el problema y madurar el proyecto antes de comprometer inversión.",
  Recolección: "Conectar al generador con el aprovechamiento mediante logística, separación y datos.",
  Infraestructura: "Diseñar, construir o recuperar sistemas alrededor del residuo y de la operación real.",
  Operación: "Convertir infraestructura en rutina, control, mantenimiento, producto y mejora continua.",
  Datos: "Hacer que cada actividad deje evidencia y alimente decisiones, indicadores y trazabilidad.",
};

const path = ["Entender", "Recolectar", "Transformar", "Operar", "Medir", "Devolver valor"];

export default function SolutionsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" aria-label="Greenatics, inicio"><img className={styles.logo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" /></Link>
          <nav className={styles.nav} aria-label="Navegación pública">
            <Link href="/soluciones">Soluciones</Link>
            <Link href="/wondergreen">Wondergreen</Link>
            <Link href="/biblioteca">Conocimiento</Link>
          </nav>
          <div className={styles.headerActions}>
            <Link className={`${styles.button} ${styles.ghost}`} href="/#contacto">Contacto</Link>
            <Link className={`${styles.button} ${styles.primary}`} href="/app">Acceder a Greenatics</Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Soluciones Greenatics</span>
              <h1>El proyecto no empieza en la planta ni termina cuando se entrega un equipo.</h1>
              <p className={styles.lead}>Greenatics trabaja sobre toda la cadena: diagnosticar, planear, recolectar, transformar, operar, medir y devolver valor. Cada servicio puede contratarse como una fase independiente o integrarse dentro de un sistema territorial o empresarial.</p>
            </div>
            <aside className={styles.heroProof}>
              <strong>Residuo → operación → producto → dato.</strong>
              <p>No partimos de una máquina predeterminada. Partimos del origen, volumen, composición, logística, infraestructura, actores, destino de productos y capacidad real de gestión.</p>
            </aside>
          </div>
        </section>

        <section className={styles.path} aria-label="Ruta de solución Greenatics">
          <div className={`${styles.container} ${styles.pathGrid}`}>{path.map((item,index)=><div key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong></div>)}</div>
        </section>

        <section className={styles.audience}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>Empieza por tu contexto</span><h2>La misma corriente orgánica exige decisiones distintas según quién la genera y quién la opera.</h2><p>Por eso el portafolio distingue rutas para territorios y prestadores, y rutas para empresas o grandes generadores.</p></div>
            <div className={styles.audienceGrid}>
              <article className={styles.audienceCard} id="municipios"><span className={styles.eyebrow}>Municipios y ESP</span><h3>Del PGIRS a una operación sostenible.</h3><p>Planeación, rutas selectivas, infraestructura, rehabilitación, operación y trazabilidad para convertir metas territoriales en capacidad real.</p><ul><li>{municipalServices.length} servicios aplicables al contexto territorial</li><li>Diagnóstico antes de dimensionar infraestructura</li><li>Operación y datos como parte del sistema</li></ul><a href="#planeación">Ver ruta para municipios →</a></article>
              <article className={styles.audienceCard} id="empresas"><span className={styles.eyebrow}>Empresas y grandes generadores</span><h3>De residuo operativo a flujo gestionado y trazable.</h3><p>Caracterización, PMIRS, separación, recolección, tratamiento, infraestructura y evidencia de gestión según el tipo de corriente.</p><ul><li>{companyServices.length} servicios aplicables a empresas</li><li>La logística se diseña desde el punto de generación</li><li>Tratamiento y evidencia permanecen conectados</li></ul><a href="#planeación">Ver ruta para empresas →</a></article>
            </div>
          </div>
        </section>

        {serviceCategories.map((category) => {
          const items = services.filter((service) => service.category === category);
          return (
            <section className={styles.category} key={category} id={category.toLocaleLowerCase("es")}>
              <div className={styles.container}>
                <div className={styles.categoryHead}><div><span className={styles.eyebrow}>{category}</span><h2>{categoryIntro[category]}</h2></div><strong>{items.length} solución{items.length === 1 ? "" : "es"}</strong></div>
                <div className={styles.serviceGrid}>
                  {items.map((service) => (
                    <article className={styles.card} key={service.slug}>
                      <div className={styles.meta}><span>{service.audience}</span><em>{service.category}</em></div>
                      <h3>{service.name}</h3>
                      <p>{service.summary}</p>
                      <div className={styles.problem}><strong>Qué resuelve</strong><p>{service.solves}</p></div>
                      <Link href={`/soluciones/${service.slug}`}>Ver solución en profundidad →</Link>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <section className={styles.guardrail}>
          <div className={`${styles.container} ${styles.guardrailGrid}`}><div><span className={styles.eyebrow}>Alcance responsable</span><h2>El portafolio es modular; el alcance contractual manda.</h2></div><p>Estas fichas describen capacidades y entregables posibles. Cada proyecto define expresamente estudios, ingeniería, construcción, permisos, operación, personal, certificaciones, informes y responsabilidades incluidas. La web no convierte una capacidad general en una obligación contractual automática.</p></div>
        </section>
      </main>

      <footer className={styles.footer}><div className={`${styles.container} ${styles.footerInner}`}><span>Greenatics · transformar residuos en vida</span><div><Link href="/wondergreen">Wondergreen</Link> · <Link href="/biblioteca">Biblioteca</Link> · <Link href="/app">GREENATICS OPS</Link></div></div></footer>
    </div>
  );
}
