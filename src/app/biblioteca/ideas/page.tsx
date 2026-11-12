import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { getPublishedEditorialPosts } from "@/data/editorial-blog";
import { site } from "@/data/site";
import styles from "./editorial-blog.module.css";

export const metadata: Metadata = {
  title: "Ideas y análisis sobre biomasa y valorización",
  description:
    "Lecturas técnicas de Greenatics para entender biomasa, comparar rutas de valorización y preparar decisiones de proyecto con evidencia.",
  alternates: { canonical: "/biblioteca/ideas/" },
};

const flow = ["Corriente disponible", "Calidad y logística", "Alternativa técnica", "Operación y salidas"];

export default function EditorialIdeasPage() {
  const posts = getPublishedEditorialPosts();
  const url = `${site.url}/biblioteca/ideas/`;

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Biblioteca", url: `${site.url}/biblioteca/` },
        { name: "Ideas y análisis", url },
      ]} />
      <section className={styles.masthead} aria-labelledby="ideas-title">
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="Ruta de navegación">
            <Link href="/biblioteca/">Biblioteca técnica</Link><span aria-hidden="true">/</span><span aria-current="page">Ideas y análisis</span>
          </nav>
          <div className={styles.mastheadGrid}>
            <div>
              <h1 id="ideas-title">Ideas para decidir proyectos de biomasa con criterio técnico.</h1>
            </div>
            <p className={styles.mastheadLead}>Artículos que convierten preguntas de campo y fuentes técnicas en criterios claros para evaluar alternativas, riesgos y siguientes pasos.</p>
          </div>
          <ol className={styles.flow} aria-label="Ruta de evaluación de una corriente orgánica">
            {flow.map((step) => <li key={step}><strong>{step}</strong></li>)}
          </ol>
        </div>
      </section>

      <section className={styles.listSection} aria-labelledby="ideas-list-title">
        <div className={styles.container}>
          <header className={styles.sectionHeading}>
            <div><h2 id="ideas-list-title">Una buena decisión empieza por hacer mejores preguntas.</h2></div>
            <p>Estas lecturas complementan las guías y documentos de consulta. Cada artículo identifica sus fuentes y aclara qué puede concluirse y qué requiere evaluación propia del sitio.</p>
          </header>
          {posts.length ? posts.map((post) => (
            <Link className={styles.postCard} href={`/biblioteca/ideas/${post.slug}/`} key={post.slug}>
              <figure className={styles.postCardArt}>
                <Image
                  alt={post.cardVisual.alt}
                  fill
                  sizes="(max-width: 820px) 100vw, 40vw"
                  src={post.cardVisual.src}
                />
              </figure>
              <div className={styles.postCardCopy}>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <div className={styles.postMeta}><span className={styles.postMetaCategory}>{post.category}</span><time dateTime={post.publishedAt}>{new Date(`${post.publishedAt}T12:00:00Z`).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time><span>{post.readingMinutes} min de lectura</span></div>
                <span className={styles.postLink}>Leer el análisis <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          )) : <p>No hay artículos publicados todavía.</p>}
        </div>
      </section>
    </div>
  );
}
