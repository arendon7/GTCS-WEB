import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { serviceJourneys } from "@/data/service-journeys";
import { getPrimaryProjectMedia } from "@/data/public-media";
import { companyServices, municipalServices, serviceCategories, services, type ServiceCategory } from "@/data/services";
import styles from "./solutions.module.css";
import refresh from "./solutions-refresh.module.css";

export const metadata: Metadata = {
  title: "Soluciones | Greenatics",
  description: "Diagnóstico, planeación, rutas selectivas, plantas, operación y trazabilidad para municipios, ESP, empresas y grandes generadores.",
  alternates: { canonical: "/soluciones" },
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
  const yarumalEvidence = getPrimaryProjectMedia("yarumal");

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Soluciones Greenatics · Del diagnóstico a la operación</span>
              <h1>El proyecto no empieza en la planta ni termina cuando se entrega un equipo.</h1>
              <p className={styles.lead}>Greenatics trabaja sobre toda la cadena: diagnosticar, planear, recolectar, transformar, operar, medir y devolver valor. Cada servicio puede contratarse como una fase independiente o integrarse dentro de un sistema territorial o empresarial.</p>
              <div className={styles.heroLinks}>
                <a href="#recorridos">Encontrar mi punto de entrada →</a>
                <a href="#municipios">Municipios y ESP →</a>
                <a href="#empresas">Empresas →</a>
              </div>
            </div>
            <aside className={styles.heroProof}>
              {yarumalEvidence ? (
                <figure className={refresh.proofFigure}>
                  <div className={refresh.proofImage}>
                    <Image src={yarumalEvidence.src} alt={yarumalEvidence.alt} fill sizes="(max-width: 1060px) 100vw, 36vw" priority />
                  </div>
                  <figcaption>{yarumalEvidence.caption}</figcaption>
                </figure>
              ) : null}
              <span>Principio de diseño</span>
              <strong>Residuo → operación → producto → dato.</strong>
              <p>No partimos de una máquina predeterminada. Partimos del origen, volumen, composición, logística, infraestructura, actores, destino de productos y capacidad real de gestión.</p>
            </aside>
          </div>
        </section>

        <section className={styles.path} aria-label="Ruta de solución Greenatics">
          <div className={`${styles.container} ${styles.pathGrid}`}>
            {path.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
          </div>
        </section>

        <section className={styles.journeys} id="recorridos">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Empieza por lo que necesitas resolver</span>
              <h2>No necesitas conocer el nombre del servicio.</h2>
              <p>Los 13 servicios siguen siendo independientes y contratables por fase. Estos cuatro recorridos solo simplifican la entrada según el estado real del proyecto.</p>
            </div>
            <div className={styles.journeyGrid}>
              {serviceJourneys.map((journey) => (
                <article className={styles.journeyCard} key={journey.number}>
                  <span className={styles.journeyNumber}>{journey.number}</span>
                  <small>{journey.kicker}</small>
                  <h3>{journey.title}</h3>
                  <p>{journey.copy}</p>
                  <div className={styles.journeyLinks}>
                    {journey.services.map((service) => (
                      <Link href={`/soluciones/${service.slug}`} key={service.slug}>{service.label} →</Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.audience}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Ahora ubica tu contexto</span>
              <h2>La misma corriente orgánica exige decisiones distintas según quién la genera y quién la opera.</h2>
              <p>Por eso el portafolio distingue rutas para territorios y prestadores, y rutas para empresas o grandes generadores.</p>
            </div>
            <div className={styles.audienceGrid}>
              <article className={styles.audienceCard} id="municipios">
                <div className={styles.audienceIndex}>01</div>
                <div><span className={styles.eyebrow}>Municipios y ESP</span><h3>Del PGIRS a una operación sostenible.</h3><p>Planeación, rutas selectivas, infraestructura, rehabilitación, operación y trazabilidad para convertir metas territoriales en capacidad real.</p></div>
                <div className={styles.audienceFacts}><strong>{municipalServices.length}</strong><span>servicios aplicables</span><small>Diagnóstico antes de dimensionar · operación y datos dentro del sistema.</small></div>
                <a href="#planeación">Ver ruta →</a>
              </article>
              <article className={styles.audienceCard} id="empresas">
                <div className={styles.audienceIndex}>02</div>
                <div><span className={styles.eyebrow}>Empresas y grandes generadores</span><h3>De residuo operativo a flujo gestionado y trazable.</h3><p>Caracterización, PMIRS, separación, recolección, tratamiento, infraestructura y evidencia de gestión según el tipo de corriente.</p></div>
                <div className={styles.audienceFacts}><strong>{companyServices.length}</strong><span>servicios aplicables</span><small>Logística desde el origen · tratamiento y evidencia conectados.</small></div>
                <a href="#planeación">Ver ruta →</a>
              </article>
            </div>
          </div>
        </section>

        {serviceCategories.map((category, categoryIndex) => {
          const items = services.filter((service) => service.category === category);
          return (
            <section className={styles.category} key={category} id={category.toLocaleLowerCase("es")}>
              <div className={styles.container}>
                <div className={styles.categoryHead}>
                  <span className={styles.categoryIndex}>{String(categoryIndex + 1).padStart(2, "0")}</span>
                  <div><span className={styles.eyebrow}>{category}</span><h2>{categoryIntro[category]}</h2></div>
                  <strong>{items.length} solución{items.length === 1 ? "" : "es"}</strong>
                </div>
                <div className={styles.serviceGrid}>
                  {items.map((service, index) => (
                    <article className={styles.card} key={service.slug}>
                      <span className={styles.serviceIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <div className={styles.serviceBody}>
                        <div className={styles.meta}><span>{service.audience}</span><em>{service.category}</em></div>
                        <h3>{service.name}</h3>
                        <p>{service.summary}</p>
                      </div>
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
          <div className={`${styles.container} ${styles.guardrailGrid}`}>
            <div><span className={styles.eyebrow}>Alcance responsable</span><h2>El portafolio es modular; el alcance contractual manda.</h2></div>
            <p>Estas fichas describen capacidades y entregables posibles. Cada proyecto define expresamente estudios, ingeniería, construcción, permisos, operación, personal, certificaciones, informes y responsabilidades incluidas. La web no convierte una capacidad general en una obligación contractual automática.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
