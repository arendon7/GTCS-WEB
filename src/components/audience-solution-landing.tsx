import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import type { AudienceLanding } from "@/data/audience-landings";
import { commercialModules } from "@/data/commercial-modules";
import type { IntentLanding } from "@/data/intent-landings";
import { getService } from "@/data/services";
import { strategicPrograms } from "@/data/strategic-programs";
import styles from "@/app/soluciones/solutions.module.css";
import refresh from "@/app/soluciones/solutions-refresh.module.css";
import programStyles from "@/app/soluciones/strategic-programs.module.css";
import moduleStyles from "@/app/soluciones/commercial-modules.module.css";
import catalogStyles from "@/app/soluciones/audience-service-catalog.module.css";

type GuidedSolutionLanding = AudienceLanding | IntentLanding;

const contactAudienceBySlug: Partial<Record<GuidedSolutionLanding["slug"], string>> = {
  esp: "esp",
  municipios: "municipio",
  empresas: "empresa",
  "propiedad-horizontal": "ph",
  plantas: "planta",
};

function uniqueServiceSlugs(landing: GuidedSolutionLanding) {
  const decisionSlugs = landing.decisions.flatMap((decision) => {
    if (!decision.href.startsWith("/soluciones/") || decision.href.startsWith("/soluciones/programas/")) return [];
    const slug = decision.href.replace("/soluciones/", "");
    return getService(slug) ? [slug] : [];
  });

  return [...new Set([
    ...decisionSlugs,
    ...landing.stages.flatMap((stage) => stage.serviceSlugs),
  ])];
}

function contactHref(landing: GuidedSolutionLanding) {
  const params = new URLSearchParams({
    source: `soluciones-${landing.slug}`,
    contexto: landing.audience,
  });
  const audience = contactAudienceBySlug[landing.slug];
  if (audience) params.set("audience", audience);
  return `/contacto?${params.toString()}`;
}

export function AudienceSolutionLanding({ landing }: { landing: GuidedSolutionLanding }) {
  const programs = landing.programSlugs
    .map((slug) => strategicPrograms.find((program) => program.slug === slug))
    .filter(Boolean);
  const modules = landing.moduleIds
    .map((id) => commercialModules.find((commercialModule) => commercialModule.id === id))
    .filter(Boolean);
  const audienceServices = uniqueServiceSlugs(landing)
    .map((slug) => getService(slug))
    .filter(Boolean);
  const conversationHref = contactHref(landing);

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Soluciones", path: "/soluciones" },
        { name: landing.audience, path: `/soluciones/${landing.slug}` as `/${string}` },
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
                <a href="#servicios">Ver servicios para este contexto →</a>
                {programs.length > 0 ? <a href="#programas">Ver programas aplicables →</a> : null}
                <a href="#decisiones">No sé cuál revisar →</a>
                <Link href={conversationHref}>Hablar con Greenatics →</Link>
              </div>
            </div>
            <aside className={styles.heroProof}>
              <span>{landing.audience}</span>
              <strong>{landing.proofTitle}</strong>
              <p>{landing.proofCopy}</p>
            </aside>
          </div>
        </section>

        <section className={catalogStyles.catalog} id="servicios" aria-labelledby={`${landing.slug}-services-title`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Oferta para {landing.audience}</span>
                <h2 id={`${landing.slug}-services-title`}>Servicios que puedes abrir directamente.</h2>
              </div>
              <p>Si ya sabes qué necesitas, no tienes que pasar por un orientador. Cada ficha explica alcance, entregables, actividades, límites y evidencia disponible antes de preparar una conversación comercial.</p>
            </div>
            <div className={catalogStyles.catalogGrid}>
              {audienceServices.map((service) => service ? (
                <article className={catalogStyles.serviceCard} key={service.slug}>
                  <div className={catalogStyles.serviceMeta}>
                    <span>{service.category}</span>
                    <small>{service.audience}</small>
                  </div>
                  <h3>{service.name}</h3>
                  <p>{service.summary}</p>
                  <div className={catalogStyles.deliverables}>
                    <span>Entregables típicos</span>
                    <ul>
                      {service.deliverables.slice(0, 2).map((deliverable) => <li key={deliverable}>{deliverable}</li>)}
                    </ul>
                  </div>
                  <Link className={catalogStyles.serviceLink} href={`/soluciones/${service.slug}`}>
                    Ver alcance y entregables <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ) : null)}
            </div>
            <p className={catalogStyles.catalogNote}>La relación con este contexto facilita la navegación; no presume contratación conjunta ni amplía automáticamente el alcance de ninguna ficha.</p>
          </div>
        </section>

        {programs.length > 0 ? (
          <section className={programStyles.programs} id="programas">
            <div className={styles.container}>
              <div className={styles.sectionHead}>
                <span className={`${styles.eyebrow} ${programStyles.eyebrow}`}>Programas aplicables</span>
                <h2>Programas empaquetados para situaciones recurrentes.</h2>
                <p>Cuando un programa coincide con la necesidad puede funcionar como alcance comercial propio. Los servicios técnicos que lo soportan conservan de todos modos sus fichas, límites y entregables específicos.</p>
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
        ) : null}

        <section className={styles.path} aria-label={`Ruta Greenatics para ${landing.audience}`}>
          <div className={`${styles.container} ${styles.pathGrid} ${refresh.businessPath}`}>
            {landing.path.map((item, index) => (
              <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>
            ))}
          </div>
        </section>

        <section className={`${styles.journeys} ${catalogStyles.orientation}`} id="decisiones">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Si todavía no sabes cuál servicio revisar</span>
              <h2>Usa la situación actual como orientación.</h2>
              <p>Esta capa es secundaria: sirve para ubicar una ficha o un programa cuando el nombre de la solución todavía no está claro. No sustituye el servicio ni crea una prescripción automática.</p>
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

        <section className={moduleStyles.modules} id="modulos">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Decisiones frecuentes</span>
              <h2>Módulos para resolver preguntas concretas sin inventar servicios nuevos.</h2>
              <p>Seleccionamos únicamente los módulos útiles para este contexto y los conectamos con los servicios técnicos que realmente los soportan.</p>
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
                <Link href={conversationHref}>Preparar conversación →</Link>
                <Link href="/soluciones">Volver al portafolio completo →</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
