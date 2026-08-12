import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, services } from "@/data/services";
import styles from "../solutions.module.css";

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
  };
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" aria-label="Greenatics, inicio"><img className={styles.logo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" /></Link>
          <nav className={styles.nav} aria-label="Navegación pública"><Link href="/soluciones">Soluciones</Link><Link href="/wondergreen">Wondergreen</Link><Link href="/biblioteca">Conocimiento</Link></nav>
          <div className={styles.headerActions}><Link className={`${styles.button} ${styles.ghost}`} href="/#contacto">Contacto</Link><Link className={`${styles.button} ${styles.primary}`} href="/app">Acceder a Greenatics</Link></div>
        </div>
      </header>

      <main>
        <section className={styles.detailHero}>
          <div className={styles.container}>
            <div className={styles.breadcrumb}><Link href="/soluciones">Soluciones</Link><span>→</span><span>{service.category}</span></div>
            <div className={styles.detailGrid}>
              <div><span className={styles.eyebrow}>{service.audience} · {service.category}</span><h1>{service.name}</h1><p className={styles.lead} style={{color:"#506058"}}>{service.summary}</p></div>
              <aside className={styles.detailAside}><strong>Qué problema busca resolver</strong><p>{service.solves}</p></aside>
            </div>
          </div>
        </section>

        <section className={styles.detailBody}>
          <div className={styles.container}>
            <div className={styles.detailColumns}>
              <article className={styles.listBox}><span className={styles.eyebrow}>Alcance posible</span><h2>Qué puede incluir</h2><ul>{service.includes.map((item)=><li key={item}>{item}</li>)}</ul></article>
              <article className={styles.listBox}><span className={styles.eyebrow}>Salida esperada</span><h2>Entregables típicos</h2><ul>{service.deliverables.map((item)=><li key={item}>{item}</li>)}</ul></article>
            </div>
            <div className={styles.detailCta}><div><span className={styles.eyebrow}>Siguiente paso</span><h3>{service.cta}</h3><p>El alcance final depende del diagnóstico, la información disponible y las responsabilidades acordadas para el proyecto.</p></div><Link className={`${styles.button} ${styles.primary}`} href="/#contacto">Hablar con Greenatics</Link></div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}><div className={`${styles.container} ${styles.footerInner}`}><span>Greenatics · soluciones circulares</span><div><Link href="/soluciones">Todas las soluciones</Link> · <Link href="/app">GREENATICS OPS</Link></div></div></footer>
    </div>
  );
}
