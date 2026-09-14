import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { getService } from "@/data/services";
import { getStrategicProgram, strategicPrograms } from "@/data/strategic-programs";
import styles from "../../solutions.module.css";
import refresh from "../../solutions-refresh.module.css";
import programStyles from "../../strategic-programs.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return strategicPrograms.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = getStrategicProgram(slug);
  if (!program) return {};
  return {
    title: `${program.name} | Soluciones Greenatics`,
    description: program.summary,
    alternates: { canonical: `/soluciones/programas/${program.slug}` },
  };
}

export default async function StrategicProgramPage({ params }: Props) {
  const { slug } = await params;
  const program = getStrategicProgram(slug);
  if (!program) notFound();
  const relatedServices = program.relatedServiceSlugs.map((serviceSlug) => getService(serviceSlug)).filter(Boolean);
  const contactContext = `Interés en el programa ${program.name}. ${program.summary}`;
  const contactHref = `/contacto?service=${encodeURIComponent(program.name)}&source=programa&contexto=${encodeURIComponent(contactContext)}`;

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Soluciones", path: "/soluciones" },
        { name: program.name, path: `/soluciones/programas/${program.slug}` as `/${string}` },
      ]} />
      <main>
        <section className={styles.detailHero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={styles.container}>
            <div className={styles.breadcrumb}><Link href="/soluciones">Soluciones</Link><span>→</span><span>Programas estratégicos</span></div>
            <div className={styles.detailGrid}>
              <div>
                <span className={styles.eyebrow}>{program.audience}</span>
                <h1>{program.name}</h1>
                <p className={styles.detailLead}>{program.headline}</p>
                <div className={styles.actions}>
                  <a className={`${styles.button} ${styles.primary}`} href="#entregables">Ver qué recibe el cliente</a>
                  <Link className={styles.button} href={contactHref}>Solicitar conversación comercial</Link>
                </div>
              </div>
              <aside className={styles.detailAside}>
                <span>Programa consultivo</span>
                <strong>Un alcance propio con salidas definidas y servicios técnicos relacionados.</strong>
                <p>{program.summary}</p>
              </aside>
            </div>
          </div>
        </section>

        <section className={programStyles.programSection} id="entregables" aria-labelledby="program-outputs-title">
          <div className={styles.container}>
            <span className={styles.eyebrow}>Qué recibe el cliente</span>
            <h2 id="program-outputs-title">Salidas gobernadas del programa.</h2>
            <div className={programStyles.programOutputs}>
              {program.outputs.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
            </div>
            <p className={programStyles.programNote}>{program.sourceNote}</p>
          </div>
        </section>

        <section className={programStyles.detailIntro}>
          <div className={`${styles.container} ${programStyles.detailIntroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Qué es y cómo funciona</span>
              <h2>El programa organiza una etapa concreta sin convertirla en una ruta obligatoria para todos.</h2>
              <p>{program.summary}</p>
            </div>
            <aside className={programStyles.principle}>
              <strong>Principio de trabajo</strong>
              <p>{program.principle}</p>
            </aside>
          </div>
        </section>

        <section className={programStyles.programSection}>
          <div className={styles.container}>
            <span className={styles.eyebrow}>{program.primaryLabel}</span>
            <h2>{program.primaryHeading}</h2>
            <div className={programStyles.itemGrid}>
              {program.primaryItems.map((item, index) => <div className={programStyles.item} key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
            </div>
          </div>
        </section>

        {program.secondaryItems ? (
          <section className={programStyles.programSection}>
            <div className={styles.container}>
              <span className={styles.eyebrow}>{program.secondaryLabel}</span>
              <h2>{program.secondaryHeading}</h2>
              <div className={programStyles.itemGrid}>
                {program.secondaryItems.map((item, index) => <div className={programStyles.item} key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
              </div>
            </div>
          </section>
        ) : null}

        <section className={programStyles.programSection}>
          <div className={styles.container}>
            <span className={styles.eyebrow}>Servicios técnicos relacionados</span>
            <h2>El programa puede conectarse con servicios específicos sin convertirlos en un paquete obligatorio.</h2>
            <p className={programStyles.programNote}>Cada servicio conserva alcance, actividades, entregables y límites propios. Puede contratarse directamente cuando la necesidad ya está clara; su presencia aquí no significa que esté incluido automáticamente dentro del programa.</p>
            <div className={programStyles.relatedLinks}>
              {relatedServices.map((service) => service ? <Link href={`/soluciones/${service.slug}`} key={service.slug}><span>{service.name}</span><span>Ver alcance y entregables →</span></Link> : null)}
            </div>
          </div>
        </section>

        <section className={styles.guardrail}>
          <div className={`${styles.container} ${styles.guardrailGrid}`}>
            <div><span className={styles.eyebrow}>Siguiente paso</span><h2>{program.cta}</h2></div>
            <div>
              <p>La metodología se adapta al estado real del cliente. No presupone que todas las brechas existan ni convierte una capacidad general de Greenatics en obligación contractual automática.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href={contactHref}>Hablar sobre {program.name}</Link>
                <Link className={styles.button} href="/soluciones">Ver portafolio de servicios</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
