import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { ServiceJsonLd } from "@/components/service-json-ld";
import { publicProjects } from "@/data/projects-public";
import { getService, services } from "@/data/services";
import styles from "../solutions.module.css";
import refresh from "../solutions-refresh.module.css";
import depth from "./service-depth.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.name} | Greenatics`,
    description: service.summary,
    alternates: { canonical: `/soluciones/${service.slug}` },
  };
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const servicePath = `/soluciones/${service.slug}` as `/soluciones/${string}`;
  const relatedProjects = publicProjects.filter((project) => project.relatedSolution.href === servicePath);
  const relatedServices = services
    .filter((candidate) => candidate.category === service.category && candidate.slug !== service.slug)
    .slice(0, 3);
  const contactContext = `Interés en ${service.name}. ${service.summary}`;
  const contactHref = `/contacto?service=${encodeURIComponent(service.name)}&source=solucion&contexto=${encodeURIComponent(contactContext)}`;

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Soluciones", path: "/soluciones" },
        { name: service.name, path: servicePath },
      ]} />
      <ServiceJsonLd service={service} />
      <main>
        <section className={styles.detailHero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={styles.container}>
            <div className={styles.breadcrumb}><Link href="/soluciones">Soluciones</Link><span>→</span><span>{service.category}</span></div>
            <div className={styles.detailGrid}>
              <div>
                <span className={styles.eyebrow}>{service.audience} · {service.category}</span>
                <h1>{service.name}</h1>
                <p className={styles.detailLead}>{service.summary}</p>
                <div className={styles.actions}>
                  <a className={`${styles.button} ${styles.primary}`} href="#entregables">Ver qué recibe el cliente</a>
                  <Link className={styles.button} href={contactHref}>Solicitar conversación comercial</Link>
                </div>
              </div>
              <aside className={styles.detailAside}>
                <span>Problema de partida</span>
                <strong>Qué problema busca resolver</strong>
                <p>{service.solves}</p>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.detailBody}>
          <div className={styles.container}>
            <div className={styles.detailColumns}>
              <article className={styles.listBox} id="entregables">
                <span className={styles.detailIndex}>01</span>
                <div><span className={styles.eyebrow}>Resultado contratado</span><h2>Qué recibe</h2><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </article>
              <article className={styles.listBox}>
                <span className={styles.detailIndex}>02</span>
                <div><span className={styles.eyebrow}>Actividades y alcance</span><h2>Qué hacemos</h2><ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </article>
            </div>

            {service.scopeNote ? (
              <aside className={styles.detailAside}>
                <span>Alcance y precisión</span>
                <strong>La capacidad técnica no amplía automáticamente el alcance contractual.</strong>
                <p>{service.scopeNote}</p>
              </aside>
            ) : null}

            {relatedProjects.length > 0 ? (
              <section className={depth.depthSection} aria-labelledby="service-evidence-title">
                <div className={depth.sectionHead}>
                  <div>
                    <span>Evidencia pública relacionada</span>
                    <h2 id="service-evidence-title">Casos que documentan esta capacidad sin convertirlos en una promesa universal.</h2>
                  </div>
                  <p>Estos proyectos muestran experiencia y aprendizajes ya publicados. El caso no reemplaza el alcance, diagnóstico o condiciones específicas de un proyecto nuevo.</p>
                </div>
                <div className={depth.projectGrid}>
                  {relatedProjects.map((project) => (
                    <article className={depth.projectCard} key={project.slug}>
                      <div className={depth.projectMeta}><span>{project.statusLabel}</span><span>{project.region}</span></div>
                      <h3>{project.name}</h3>
                      <p>{project.summary}</p>
                      <p className={depth.projectContext}>{project.relatedSolution.context}</p>
                      <Link href={`/proyectos/${project.slug}`}>Abrir caso documentado <span aria-hidden="true">→</span></Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {relatedServices.length > 0 ? (
              <section className={depth.depthSection} aria-labelledby="related-services-title">
                <div className={depth.sectionHead}>
                  <div>
                    <span>Rutas relacionadas · {service.category}</span>
                    <h2 id="related-services-title">El servicio puede conectarse con otras fases sin obligarte a contratar un paquete único.</h2>
                  </div>
                  <p>Cada ruta conserva su propio alcance y entregables. Esta relación sirve para navegar la oferta, no para presumir actividades adicionales dentro del servicio actual.</p>
                </div>
                <div className={depth.relatedGrid}>
                  {relatedServices.map((candidate) => (
                    <article className={depth.relatedCard} key={candidate.slug}>
                      <span>{candidate.category}</span>
                      <h3>{candidate.name}</h3>
                      <p>{candidate.summary}</p>
                      <Link href={`/soluciones/${candidate.slug}`}>Ver servicio <span aria-hidden="true">→</span></Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <div className={styles.detailCta}>
              <div>
                <span className={styles.eyebrow}>Siguiente paso</span>
                <h3>{service.cta}</h3>
                <p>El alcance final depende de la información disponible, las condiciones del proyecto y las responsabilidades acordadas. Cuando falte información crítica, la línea base o el diagnóstico se incorpora como una actividad inicial; no sustituye el servicio contratado.</p>
              </div>
              <Link className={`${styles.button} ${styles.primary}`} href={contactHref}>Hablar con Greenatics</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
