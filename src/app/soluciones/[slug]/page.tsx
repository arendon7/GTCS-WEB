import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { getService, services } from "@/data/services";
import styles from "../solutions.module.css";
import refresh from "../solutions-refresh.module.css";

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

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Soluciones", path: "/soluciones" },
        { name: service.name, path: `/soluciones/${service.slug}` as `/${string}` },
      ]} />
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
              <article className={styles.listBox}>
                <span className={styles.detailIndex}>01</span>
                <div><span className={styles.eyebrow}>Alcance posible</span><h2>Qué puede incluir</h2><ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </article>
              <article className={styles.listBox}>
                <span className={styles.detailIndex}>02</span>
                <div><span className={styles.eyebrow}>Salida esperada</span><h2>Entregables típicos</h2><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </article>
            </div>
            {service.scopeNote ? (
              <aside className={styles.scopeNote}>
                <span className={styles.eyebrow}>Alcance y precisión</span>
                <p>{service.scopeNote}</p>
              </aside>
            ) : null}
            <div className={styles.detailCta}>
              <div><span className={styles.eyebrow}>Siguiente paso</span><h3>{service.cta}</h3><p>El alcance final depende del diagnóstico, la información disponible y las responsabilidades acordadas para el proyecto.</p></div>
              <Link className={`${styles.button} ${styles.primary}`} href="/contacto">Hablar con Greenatics</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
