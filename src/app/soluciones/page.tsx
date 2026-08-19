import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { commercialModules } from "@/data/commercial-modules";
import { serviceJourneys } from "@/data/service-journeys";
import { getPrimaryProjectMedia } from "@/data/public-media";
import { companyServices, getService, municipalServices, serviceCategories, services, type ServiceCategory } from "@/data/services";
import { strategicPrograms } from "@/data/strategic-programs";
import styles from "./solutions.module.css";
import refresh from "./solutions-refresh.module.css";
import programStyles from "./strategic-programs.module.css";
import moduleStyles from "./commercial-modules.module.css";

export const metadata: Metadata = {
  title: "Soluciones | Greenatics",
  description: "Estructuración, línea base, planeación, operación de aseo, gestión de residuos, infraestructura, trazabilidad y acompañamiento para municipios, ESP, empresas y grandes generadores.",
  alternates: { canonical: "/soluciones" },
};

const categoryIntro: Record<ServiceCategory, string> = {
  Planeación: "Entender el problema y madurar el proyecto antes de comprometer inversión.",
  Recolección: "Conectar al generador con el destino previsto mediante logística, separación y datos.",
  Infraestructura: "Diseñar, construir o recuperar sistemas alrededor del residuo y de la operación real.",
  Operación: "Convertir infraestructura en rutina, control, mantenimiento, producto y mejora continua.",
  Datos: "Hacer que cada actividad deje evidencia y alimente decisiones, indicadores y trazabilidad.",
};

const path = ["Entender", "Estructurar", "Operar", "Medir", "Optimizar", "Valorizar", "Escalar"];

export default function SolutionsPage() {
  const yarumalEvidence = getPrimaryProjectMedia("yarumal");

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Soluciones Greenatics · Estructuración técnica de sistemas de residuos</span>
              <h1>Primero estructurar. Luego operar. Después valorizar.</h1>
              <p className={styles.lead}>Greenatics acompaña sistemas de gestión de residuos desde la comprensión del problema hasta la operación, la medición, la optimización, la valorización y el escalamiento. No partimos de una planta, un vehículo o un documento predeterminado: partimos de las decisiones que el sistema realmente necesita.</p>
              <div className={styles.heroLinks}>
                <a href="#programas">Ver programas de entrada →</a>
                <a href="#modulos">Resolver una decisión concreta →</a>
                <a href="#recorridos">Explorar líneas de solución →</a>
                <Link href="/soluciones/esp-municipios">Municipios y ESP →</Link>
                <Link href="/soluciones/empresas-grandes-generadores">Empresas →</Link>
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
              <span>Principio de trabajo</span>
              <strong>Método + evidencia antes de inversión.</strong>
              <p>El residuo, los usuarios, la logística, la operación, los datos y el destino deben entenderse como un sistema. La infraestructura y la tecnología se deciden después, no al revés.</p>
            </aside>
          </div>
        </section>

        <section className={styles.path} aria-label="Ruta Greenatics de estructuración y crecimiento">
          <div className={`${styles.container} ${styles.pathGrid} ${refresh.businessPath}`}>
            {path.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
          </div>
        </section>

        <section className={programStyles.programs} id="programas">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={`${styles.eyebrow} ${programStyles.eyebrow}`}>Programas estratégicos de entrada</span>
              <h2>Tres formas de empezar con una base más clara.</h2>
              <p>ESP READY ordena la preparación de una operación; GREENATICS BASE permite producir una línea base técnica desde campo; PMIRS RED convierte planes por unidad en una arquitectura común de información. Ninguno sustituye el catálogo técnico.</p>
            </div>
            <div className={programStyles.programGrid}>
              {strategicPrograms.map((program) => (
                <article className={programStyles.programCard} key={program.slug}>
                  <span>{program.audience}</span>
                  <h3>{program.name}</h3>
                  <strong>{program.headline}</strong>
                  <p>{program.summary}</p>
                  <div className={programStyles.outputFlow}>
                    {program.outputs.map((output) => <span key={output}>{output}</span>)}
                  </div>
                  <Link href={`/soluciones/programas/${program.slug}`}>Conocer {program.name} →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={moduleStyles.modules} id="modulos">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Módulos de decisión e implementación</span>
              <h2>No todo problema necesita convertirse en un servicio nuevo.</h2>
              <p>Estos módulos empaquetan decisiones frecuentes y conectan capacidades ya gobernadas. Sirven para entrar por una pregunta concreta sin duplicar los 13 servicios técnicos ni prometer resultados antes de contar con evidencia.</p>
            </div>
            <div className={moduleStyles.moduleGrid}>
              {commercialModules.map((commercialModule) => {
                const relatedServices = commercialModule.relatedServiceSlugs.map((slug) => getService(slug)).filter(Boolean);
                return (
                  <article className={moduleStyles.moduleCard} key={commercialModule.id}>
                    <span>{commercialModule.kicker}</span>
                    <h3>{commercialModule.title}</h3>
                    <p>{commercialModule.summary}</p>
                    <div className={moduleStyles.decision}><small>Decisión que organiza</small><strong>{commercialModule.decision}</strong></div>
                    <div className={moduleStyles.signals}>{commercialModule.signals.map((signal) => <span key={signal}>{signal}</span>)}</div>
                    <p className={moduleStyles.guardrail}>{commercialModule.guardrail}</p>
                    <div className={moduleStyles.moduleLinks}>
                      <small>Servicios técnicos relacionados</small>
                      {relatedServices.slice(0, 3).map((service) => service ? <Link href={`/soluciones/${service.slug}`} key={service.slug}><span>{service.name}</span><span>→</span></Link> : null)}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.journeys} id="recorridos">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Seis líneas de solución</span>
              <h2>Primero ubica el problema; luego elegimos el servicio.</h2>
              <p>Los 13 servicios siguen siendo independientes y contratables por fase. Estas seis líneas son la arquitectura comercial que conecta necesidades reales con el catálogo técnico sin duplicarlo.</p>
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
              <h2>Un sistema de residuos cambia según quién lo planea, quién lo opera y dónde se genera.</h2>
              <p>Por eso el portafolio distingue rutas para territorios y prestadores, y rutas para empresas o grandes generadores.</p>
            </div>
            <div className={styles.audienceGrid}>
              <article className={styles.audienceCard} id="municipios">
                <div className={styles.audienceIndex}>01</div>
                <div><span className={styles.eyebrow}>Municipios y ESP</span><h3>De la planeación a una operación preparada para crecer.</h3><p>Diagnóstico, PGIRS, rutas, operación, datos, infraestructura y valorización para convertir metas o nuevas oportunidades en capacidad real.</p></div>
                <div className={styles.audienceFacts}><strong>{municipalServices.length}</strong><span>servicios aplicables</span><small>Primero claridad de modelo · luego operación e inversión.</small></div>
                <Link href="/soluciones/esp-municipios">Ver ruta para ESP y municipios →</Link>
              </article>
              <article className={styles.audienceCard} id="empresas">
                <div className={styles.audienceIndex}>02</div>
                <div><span className={styles.eyebrow}>Empresas y grandes generadores</span><h3>De cumplimiento aislado a gestión medible y circular.</h3><p>Caracterización, PMIRS, redes multiunidad, separación, recolección, tratamiento, infraestructura y evidencia de gestión según cada corriente.</p></div>
                <div className={styles.audienceFacts}><strong>{companyServices.length}</strong><span>servicios aplicables</span><small>Información una vez · gestión y seguimiento sobre la misma base.</small></div>
                <Link href="/soluciones/empresas-grandes-generadores">Ver ruta para empresas →</Link>
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
            <div><span className={styles.eyebrow}>Alcance responsable</span><h2>La arquitectura orienta; el alcance contractual manda.</h2></div>
            <p>Los programas y módulos comerciales ayudan a ordenar la conversación. Las fichas técnicas describen capacidades y entregables posibles. Cada proyecto define expresamente estudios, ingeniería, construcción, permisos, operación, personal, certificaciones, informes y responsabilidades incluidas.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
