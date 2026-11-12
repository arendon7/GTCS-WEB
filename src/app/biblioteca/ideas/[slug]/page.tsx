import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { getPublishedEditorialPost, getPublishedEditorialPosts } from "@/data/editorial-blog";
import { site } from "@/data/site";
import styles from "../editorial-blog.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedEditorialPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedEditorialPost(slug);
  if (!post) return { title: "Artículo no disponible" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/biblioteca/ideas/${post.slug}/` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.publishedAt },
  };
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

export default async function EditorialArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPublishedEditorialPost(slug);
  if (!post) notFound();
  const url = `${site.url}/biblioteca/ideas/${post.slug}/`;
  const articleSections = post.blocks.flatMap((block) =>
    block.type === "heading" ? [{ id: block.id, title: block.text }] : [],
  );

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Biblioteca", url: `${site.url}/biblioteca/` },
        { name: "Ideas y análisis", url: `${site.url}/biblioteca/ideas/` },
        { name: post.title, url },
      ]} />
      <header className={styles.articleMasthead}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="Ruta de navegación">
            <Link href="/biblioteca/">Biblioteca técnica</Link><span aria-hidden="true">/</span>
            <Link href="/biblioteca/ideas/">Ideas y análisis</Link><span aria-hidden="true">/</span>
            <span aria-current="page">Artículo</span>
          </nav>
          <div className={styles.articleTop}>
            <h1 className={styles.articleTitle}>{post.title}</h1>
            <p className={styles.articleDescription}>{post.description}</p>
            <div className={styles.articleMeta}><span className={styles.articleMetaCategory}>{post.category}</span><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time><span>{post.readingMinutes} min de lectura</span><span>Fuentes técnicas al final</span></div>
          </div>
        </div>
      </header>

      <section className={styles.articleMain} aria-label="Contenido del artículo">
        <div className={`${styles.container} ${styles.articleLayout}`}>
          <article className={styles.articleBody}>
            {articleSections.length > 1 ? (
              <nav className={styles.articleContents} aria-label="Secciones de este artículo">
                <strong>En este análisis</strong>
                <ul>
                  {articleSections.map((section) => (
                    <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>
                  ))}
                </ul>
              </nav>
            ) : null}
            {post.blocks.map((block, index) => {
              if (block.type === "paragraph") return <p key={`p-${index}`}>{block.text}{block.sourceRefs?.map((sourceRef) => <sup key={sourceRef}><a href={`#source-${sourceRef}`} aria-label={`Ir a la fuente ${sourceRef}`}>[{sourceRef}]</a></sup>)}</p>;
              if (block.type === "heading") return <h2 id={block.id} key={block.id}>{block.text}</h2>;
              if (block.type === "list") return <ul key={`list-${index}`}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
              if (block.type === "studyComparison") return (
                <figure className={styles.studyFigure} key={`figure-${index}`}>
                  <div className={styles.studyFigureGrid}>
                    {block.panels.map((panel) => panel.kind === "metricBars" ? (
                      <section className={styles.studyPanel} aria-labelledby={panel.id} key={panel.id}>
                        <div className={styles.studyPanelHeading}>
                          <h3 id={panel.id}>{panel.title}</h3>
                          <p>{panel.context}</p>
                        </div>
                        <ul className={styles.metricRows}>
                          {panel.metrics.map((metric) => {
                            const barWidth = panel.scaleMax > 0
                              ? Math.max(0, Math.min(100, (metric.value / panel.scaleMax) * 100))
                              : 0;
                            return (
                              <li className={styles.metricRow} key={metric.label}>
                                <span>{metric.label}</span>
                                <strong>{metric.displayValue}</strong>
                                <span className={styles.metricTrack} aria-hidden="true">
                                  <span style={{ width: `${barWidth}%` }} />
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                        <p className={styles.metricNote}>{panel.note}</p>
                      </section>
                    ) : (
                      <section className={`${styles.studyPanel} ${styles.ammoniaPanel}`} aria-labelledby={panel.id} key={panel.id}>
                        <p className={styles.studyEyebrow}>{panel.eyebrow}</p>
                        <h3 id={panel.id} className={styles.ammoniaValue}>{panel.value}</h3>
                        <p className={styles.ammoniaLead}>{panel.description}</p>
                        <p className={styles.metricNote}>{panel.note}</p>
                        <p className={styles.metricLimit}>{panel.boundary}</p>
                      </section>
                    ))}
                  </div>
                  <figcaption>
                    {block.caption}
                    {block.sourceRefs?.map((sourceRef) => <sup key={sourceRef}><a href={`#source-${sourceRef}`} aria-label={`Ir a la fuente ${sourceRef}`}>[{sourceRef}]</a></sup>)}
                  </figcaption>
                </figure>
              );
              return <aside className={styles.callout} key={`callout-${index}`}><h2>{block.title}</h2><p>{block.text}</p></aside>;
            })}
          </article>

          <aside className={styles.sourcePanel} aria-labelledby="article-sources-title">
            <h2 id="article-sources-title">Fuentes consultadas</h2>
            <ol className={styles.sourceList}>
              {post.sources.map((source, index) => (
                <li id={`source-${index + 1}`} key={source.href}>
                  <span className={styles.sourceNumber} aria-hidden="true">{index + 1}</span>
                  <a href={source.href}>{source.title}</a>
                  <span>{source.publisher}{source.year ? ` · ${source.year}` : ""}</span>
                </li>
              ))}
            </ol>
            <p className={styles.sourceNote}>{post.sourceNote}</p>
          </aside>
        </div>
      </section>

      <section className={styles.related} aria-labelledby="related-title">
        <div className={`${styles.container} ${styles.relatedInner}`}>
          <div><h2 id="related-title">{post.relatedTitle}</h2></div>
          <Link className={styles.relatedLink} href={post.relatedHref}>{post.relatedLabel} <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
