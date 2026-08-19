import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import type { AudienceLanding } from "@/data/audience-landings";
import { commercialModules } from "@/data/commercial-modules";
import { getService } from "@/data/services";
import { strategicPrograms } from "@/data/strategic-programs";
import styles from "@/app/soluciones/solutions.module.css";
import refresh from "@/app/soluciones/solutions-refresh.module.css";
import programStyles from "@/app/soluciones/strategic-programs.module.css";
import moduleStyles from "@/app/soluciones/commercial-modules.module.css";

export function AudienceSolutionLanding({ landing }: { landing: AudienceLanding }) {
  const programs = landing.programSlugs
    .map((slug) => strategicPrograms.find((program) => program.slug === slug))
    .filter(Boolean);
  const modules = landing.moduleIds
    .map((id) => commercialModules.find((commercialModule) => commercialModule.id === id))
    .filter(Boolean);

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Soluciones", path: "/soluciones" },
        { name: landing.audience, path: `/soluciones/${landing.slug}` },
      ]} />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>{landing.eyebrow}</span>
              <h1>{landing.title}</h1>
              <p className={styles.lead}>{landing.lead}</p>
              <div className={styles.heroLinks}>
                <a href="#decisiones">Encontrar punto de entrada →</a>
                <a href="#programas">Ver programas aplicables →</a>
                <a href="#etapas">Ver ruta por etapas →</a>
                <Link href="/contacto">Hablar con Greenatics →</Link>
              </div>
            </div>
            <aside className={styles.heroProof}>
              <span>{landing.audience}</span>
              <strong>{landing.proofTitle}</strong>
              <p>{landing.proofCopy}</p>
            </aside>
          </div>
        </section>

        <section className={styles.path} aria-label={`Ruta Greenatics para ${landing.audience}`}>
          <div className={`${styles.container} ${styles.pathGrid} ${refresh.businessPath}`}>
            {landing.path.map((item, index) => (
              <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>
            ))}
          </div>
        </section>

        <section className={styles.journeys} id="decisiones">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Empieza por la situación actual</span>
              <h2>No necesitas conocer el nombre del servicio.</h2>
              <p>Ubica primero la decisión que tienes abierta. Cada entrada conduce a un programa o servicio ya gobernado; esta página no crea un catálogo paralelo.</p>
            </div>
            <div className={styles.journeyGrid}>
              {landing.decisions.map((decision, index) => (
                <article className={styles.journeyCard} key={decision.situation}>
                  <span className={styles.journeyNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <small>Si estás aquí</small>
                  <h3>{decision.situation}</h3>
                  <p>{decision.copy}</p>
                  <div className={styles.journeyLinks}>
                    <Link href={decision.href}>{decision.startWith} →</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={programStyles.programs} id="programas">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={`${styles.eyebrow} ${programStyles.eyebrow}`}>Programas de entrada más relevantes</span>
              <h2>Programas para ordenar el inicio antes de desplegar servicios.</h2>
              <p>Los programas empaquetan una primera etapa de trabajo. El alcance contractual y los servicios técnicos relacionados permanecen gobernados por sus fichas específicas.</p>
            </div>
            <div className={programStyles.programGrid}>
              {programs.map((program) => program ? (
                <article className={programStyles.programCard} key={program.slug}>
                  <span>{program.audience}</span>
                  <h3>{program.name}</h3>
                  <strong>{program.headline}</strong>
                  <p>{program.summary}</p>
                  <div className={programStyles.outputFlow}>{program.outputs.map((output) => <span key={output}>{output}</span>)}</div>
                  <Link href={`/soluciones/programas/${program.slug}`}>Conocer {program.name} →</Link>
                </article>
              ) : null)}
            </div>
          </div>
        </section>

        <section className={moduleStyles.modules} id="modulos">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Decisiones frecuentes</span>
              <h2>Módulos para resolver preguntas concretas sin inventar servicios nuevos.</h2>
              <p>Seleccionamos únicamente los módulos útiles para esta audiencia y los conectamos con los servicios técnicos que realmente los soportan.</p>
            </div>
            <div className={moduleStyles.moduleGrid}>
              {modules.map((commercialModule) => {
                if (!commercialModule) return null;
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
                      {relatedServices.slice(0, 3).map((service) => service ? (
                        <Link href={`/soluciones/${service.slug}`} key={service.slug}><span>{service.name}</span><span>→</span></Link>
                      ) : null)}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.audience} id="etapas">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Ruta por madurez</span>
              <h2>El siguiente paso depende de la etapa, no de una lista fija de compras.</h2>
              <p>Los servicios pueden contratarse por fase. La secuencia muestra qué capacidades suelen volverse relevantes a medida que aparece mejor información.</p>
            </div>
            <div className={styles.audienceGrid}>
              {landing.stages.map((stage) => (
                <article className={styles.audienceCard} key={stage.number}>
                  <div className={styles.audienceIndex}>{stage.number}</div>
                  <div>
                    <span className={styles.eyebrow}>{stage.kicker}</span>
                    <h3>{stage.title}</h3>
                    <p>{stage.copy}</p>
                  </div>
                  <div className={styles.audienceFacts}>
                    <strong>{stage.serviceSlugs.length}</strong>
                    <span>capacidades relacionadas</span>
                    <small>{stage.serviceSlugs.map((slug) => getService(slug)?.name).filter(Boolean).join(" · ")}</small>
                  </div>
                  <Link href={`/soluciones/${stage.serviceSlugs[0]}`}>Abrir primera ficha →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.guardrail}>
          <div className={`${styles.container} ${styles.guardrailGrid}`}>
            <div>
              <span className={styles.eyebrow}>Siguiente conversación</span>
              <h2>{landing.ctaTitle}</h2>
            </div>
            <div>
              <p>{landing.ctaCopy}</p>
              <div className={styles.heroLinks}>
                <Link href="/contacto">Preparar conversación →</Link>
                <Link href="/soluciones">Volver al portafolio completo →</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
