"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { getPublishedEditorialPosts } from "@/data/editorial-blog";
import { libraryResources } from "@/data/library";
import { site } from "@/data/site";
import editorialStyles from "./ideas/editorial-blog.module.css";

const publishedResources = libraryResources.filter((resource) => resource.status === "publicado");
const latestEditorialPost = getPublishedEditorialPosts()[0];
const categories = [...new Set(publishedResources.map((resource) => resource.category))];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function BibliotecaPage() {
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const query = normalize(search.trim());
  const filtered = publishedResources.filter((resource) => {
    const matchesCategory = category === "Todos" || resource.category === category;
    const searchable = normalize(`${resource.title} ${resource.summary} ${resource.category} ${resource.format}`);
    return matchesCategory && (!query || searchable.includes(query));
  });
  const filterOptions = [
    { label: "Todos", count: publishedResources.length },
    ...categories.map((label) => ({
      label,
      count: publishedResources.filter((resource) => resource.category === label).length,
    })),
  ];
  const url = `${site.url}/biblioteca/`;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Recursos", url: `${site.url}/recursos/` }, { name: "Biblioteca técnica", url }]} />
      <div className="library-page">
        <section className="library-page-hero">
          <div className="container">
            <nav className="library-page-breadcrumb" aria-label="Ruta de navegación">
              <Link href="/recursos/">← Centro de recursos</Link>
              <span aria-current="page">Biblioteca técnica</span>
            </nav>
            <div className="library-page-intro-layout">
              <div className="library-page-intro">
                <span className="eyebrow">Conocimiento Greenatics</span>
                <h1>Guías y documentos para decidir y aplicar.</h1>
                <p>Encuentra programas por cultivo, referencias Wondergreen y materiales de trabajo. Cada recurso te lleva a su versión web y, cuando existe un documento descargable asociado, también puedes consultarlo en PDF.</p>
                <div className="library-page-actions">
                  <Link className="button button--dark" href="#catalogo">Buscar en la biblioteca</Link>
                  <Link className="library-page-text-link" href="/casa-jardin/guias/">Guías para Casa &amp; Jardín <span aria-hidden="true">→</span></Link>
                </div>
              </div>
              <aside className="library-page-showcase" aria-label="Programas de campo web para cacao, café y aguacate">
                <Link className="library-page-cover library-page-cover--cacao" href="/wondergreen/cultivos/cacao/">
                  <figure>
                    <Image alt="Portada del programa de campo Wondergreen para cacao" fill sizes="(max-width: 620px) 31vw, 15vw" src="/guides/guia-cacao-cover.webp" />
                    <figcaption>Cacao · guía web</figcaption>
                  </figure>
                </Link>
                <Link className="library-page-cover library-page-cover--cafe" href="/wondergreen/cultivos/cafe/">
                  <figure>
                    <Image alt="Portada del programa de campo Wondergreen para café" fill priority sizes="(max-width: 620px) 39vw, 18vw" src="/guides/guia-cafe-cover.webp" />
                    <figcaption>Café · guía web</figcaption>
                  </figure>
                </Link>
                <Link className="library-page-cover library-page-cover--aguacate" href="/wondergreen/cultivos/aguacate/">
                  <figure>
                    <Image alt="Portada del programa de campo Wondergreen para aguacate" fill sizes="(max-width: 620px) 31vw, 15vw" src="/guides/guia-aguacate-cover.webp" />
                    <figcaption>Aguacate · guía web</figcaption>
                  </figure>
                </Link>
                <p className="library-page-showcase-note">Programas por cultivo · consulta web</p>
              </aside>
            </div>
          </div>
        </section>

        <section className={editorialStyles.libraryFeature} aria-labelledby="library-ideas-title">
          <div className={`${editorialStyles.container} ${editorialStyles.libraryFeatureGrid}`}>
            <div className={editorialStyles.libraryFeatureIntro}>
              <h2 id="library-ideas-title">Ideas y análisis</h2>
              <p>Lecturas para conectar fuentes técnicas con decisiones de biomasa, valorización y proyectos productivos.</p>
              <Link className={editorialStyles.libraryFeatureLink} href="/biblioteca/ideas/">Ver todas las lecturas <span aria-hidden="true">→</span></Link>
            </div>
            {latestEditorialPost ? (
              <article className={editorialStyles.libraryFeaturePost}>
                <h3>{latestEditorialPost.title}</h3>
                <div className={editorialStyles.postMeta}><span className={editorialStyles.postMetaCategory}>{latestEditorialPost.category}</span><span>{latestEditorialPost.readingMinutes} min de lectura</span></div>
                <p>{latestEditorialPost.description}</p>
                <Link href={`/biblioteca/ideas/${latestEditorialPost.slug}/`}>Leer el artículo <span aria-hidden="true">→</span></Link>
              </article>
            ) : null}
          </div>
        </section>

        <section className="library-page-catalog" id="catalogo">
          <div className="container">
            <div className="library-page-heading">
              <div><span className="eyebrow">Biblioteca técnica</span><h2>Busca por tema o tipo de recurso.</h2></div>
              <p>Los manuales y guías indican su paginación real. Las rutas web abren el contenido en la página donde se mantiene actualizado.</p>
            </div>

            <div className="library-page-controls">
              <label className="library-page-search">
                <span>Buscar en los recursos</span>
                <input
                  aria-controls="library-resource-list"
                  aria-label="Buscar por cultivo, producto o tema"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Por ejemplo: café, biol, huerta o municipio"
                  type="search"
                  value={search}
                />
              </label>
              <div className="library-page-filters" role="group" aria-label="Filtrar recursos por categoría">
                {filterOptions.map((option) => (
                  <button
                    aria-pressed={category === option.label}
                    className={category === option.label ? "is-active" : ""}
                    key={option.label}
                    onClick={() => setCategory(option.label)}
                    type="button"
                  >
                    {option.label}<span>{option.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="library-page-results" aria-live="polite" aria-atomic="true">
              <strong>{filtered.length}</strong> {filtered.length === 1 ? "recurso" : "recursos"}
              {search.trim() ? (
                <> para “{search.trim()}”{category !== "Todos" ? ` en ${category}` : ""}</>
              ) : category !== "Todos" ? ` en ${category}` : " disponibles"}
            </p>

            {filtered.length ? (
              <div className="library-page-list" id="library-resource-list" role="list" aria-label="Recursos de la biblioteca">
                {filtered.map((resource) => (
                  <article className={`library-resource${resource.coverImage ? " has-cover" : ""}`} key={resource.slug} role="listitem">
                    {resource.coverImage && (
                      <div className="library-resource-cover" aria-hidden="true">
                        <Image alt="" fill sizes="(max-width: 620px) 64px, (max-width: 900px) 76px, 84px" src={resource.coverImage} />
                      </div>
                    )}
                    <div className="library-resource-copy">
                      <div className="library-resource-labels"><span>{resource.category}</span><span>{resource.format}</span></div>
                      <h3>{resource.title}</h3>
                      <p>{resource.summary}</p>
                      <div className="library-resource-meta">
                        {resource.downloadUrl && <span>PDF · {resource.downloadPages} páginas</span>}
                        <span>Versión web disponible</span>
                      </div>
                    </div>
                    <div className="library-resource-actions">
                      <Link href={resource.href} aria-label={`Abrir recurso: ${resource.title}`}>Abrir recurso <span aria-hidden="true">→</span></Link>
                      {resource.downloadUrl && (
                        <a href={resource.downloadUrl} download aria-label={`Descargar ${resource.title} en PDF, ${resource.downloadPages} páginas`}>
                          Descargar PDF <span aria-hidden="true">↓</span>
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="library-page-empty" role="status">
                <h3>No encontramos ese recurso.</h3>
                <p>Prueba con otro cultivo, producto o tema; también puedes quitar el filtro de categoría.</p>
                <button className="button button--ghost" onClick={() => { setSearch(""); setCategory("Todos"); }} type="button">Limpiar búsqueda</button>
              </div>
            )}
          </div>
        </section>

        <section className="library-page-next">
          <div className="container library-page-next__inner">
            <div><span className="eyebrow eyebrow--light">¿No sabes por dónde empezar?</span><h2>Elige primero la decisión que necesitas tomar.</h2></div>
            <Link className="button button--light" href="/recursos/">Ir al centro de recursos <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </div>
    </>
  );
}
