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
              </div>
              <aside className={styles.detailAside}>
                <span>Producto consultivo</span>
                <strong>Primero claridad para decidir.</strong>
                <p>{program.summary}</p>
              </aside>
            </div>
          </div>
        </section>

        <section className={programStyles.detailIntro}>
          <div className={`${styles.container} ${programStyles.detailIntroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Cómo se usa</span>
              <h2>Una puerta de entrada que organiza las siguientes decisiones.</h2>
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
            <h2>{program.slug === "esp-ready" ? "La preparación se revisa como un sistema." : "Cada unidad conserva su propio plan."}</h2>
            <div className={programStyles.itemGrid}>
              {program.primaryItems.map((item, index) => <div className={programStyles.item} key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
            </div>
          </div>
        </section>

        {program.secondaryItems ? (
          <section className={programStyles.programSection}>
            <div className={styles.container}>
              <span className={styles.eyebrow}>{program.secondaryLabel}</span>
              <h2>La red transforma planes separados en información comparable.</h2>
              <div className={programStyles.itemGrid}>
                {program.secondaryItems.map((item, index) => <div className={programStyles.item} key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
              </div>
            </div>
          </section>
        ) : null}

        <section className={programStyles.programSection}>
          <div className={styles.container}>
            <span className={styles.eyebrow}>Salida del programa</span>
            <h2>Resultados que permiten decidir qué activar después.</h2>
            <div className={programStyles.programOutputs}>
              {program.outputs.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
            </div>
            <p className={programStyles.programNote}>{program.sourceNote}</p>
          </div>
        </section>

        <section className={programStyles.programSection}>
          <div className={styles.container}>
            <span className={styles.eyebrow}>Servicios que pueden activarse después</span>
            <h2>El programa organiza la decisión; el alcance contractual sigue en las fichas técnicas.</h2>
            <div className={programStyles.relatedLinks}>
              {relatedServices.map((service) => service ? <Link href={`/soluciones/${service.slug}`} key={service.slug}><span>{service.name}</span><span>Ver servicio →</span></Link> : null)}
            </div>
          </div>
        </section>

        <section className={styles.guardrail}>
          <div className={`${styles.container} ${styles.guardrailGrid}`}>
            <div><span className={styles.eyebrow}>Siguiente paso</span><h2>{program.cta}</h2></div>
            <div><p>La metodología se adapta al estado real del cliente. No presupone que todas las brechas existan ni convierte una capacidad general de Greenatics en obligación contractual automática.</p><Link className={`${styles.button} ${styles.primary}`} href="/contacto">Hablar con Greenatics</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
