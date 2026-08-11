"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LibraryResource } from "@/data/library";

type Category = LibraryResource["category"] | "Todos";

const categories: Category[] = ["Todos", "Cultivos", "Hogar", "Comercial", "Tecnología", "Operación", "Impacto"];

export function LibraryExplorer({ resources }: { resources: LibraryResource[] }) {
  const [category, setCategory] = useState<Category>("Todos");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const filtered = useMemo(() => resources.filter((resource) => {
    const categoryMatch = category === "Todos" || resource.category === category;
    const queryMatch = !normalizedQuery || `${resource.title} ${resource.summary} ${resource.category} ${resource.format}`.toLocaleLowerCase("es").includes(normalizedQuery);
    return categoryMatch && queryMatch;
  }), [category, normalizedQuery, resources]);

  return (
    <div className="library-explorer">
      <div className="library-search-row">
        <label className="library-search">
          <span className="sr-only">Buscar en la biblioteca</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar: café, huertas, manual, pastos…" type="search" />
        </label>
        <span className="library-result-count" aria-live="polite">{filtered.length} recurso{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div className="library-filter-row" aria-label="Filtrar biblioteca por categoría">
        {categories.map((item) => <button className={category === item ? "is-active" : ""} type="button" onClick={() => setCategory(item)} key={item}>{item}</button>)}
      </div>

      {filtered.length ? (
        <div className="library-grid library-grid--explorer">
          {filtered.map((resource) => (
            <Link className="library-card" href={resource.href} key={resource.slug}>
              <div className="library-card-meta"><span>{resource.category} · {resource.format}</span><em>{resource.status === "publicado" ? "Publicado" : "En validación"}</em></div>
              <h2>{resource.title}</h2>
              <p>{resource.summary}</p>
              <strong>Consultar recurso →</strong>
            </Link>
          ))}
        </div>
      ) : <div className="library-empty"><strong>No encontramos ese recurso.</strong><p>Prueba otra palabra o cambia el filtro.</p></div>}
    </div>
  );
}
