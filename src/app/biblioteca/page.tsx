import type { Metadata } from "next";
import Link from "next/link";
import { libraryResources } from "@/data/library";

export const metadata: Metadata = {
  title: "Biblioteca técnica",
  description: "Guías, casos, metodologías y herramientas públicas de Greenatics y Wondergreen.",
};

const categories = ["Cultivos", "Tecnología", "Operación", "Impacto", "Comercial"] as const;

export default function LibraryPage() {
  return (
    <>
      <section className="library-hero">
        <div className="container library-hero-grid">
          <div>
            <span className="eyebrow">Biblioteca Greenatics</span>
            <h1>Conocimiento útil, con fuente y alcance claros.</h1>
            <p className="lead">Reunimos guías por cultivo, metodología de plantas, casos operativos y herramientas comerciales. La biblioteca pública no expone documentos internos ni convierte borradores técnicos en recomendaciones definitivas.</p>
          </div>
          <aside className="library-rule">
            <span>Regla editorial</span>
            <strong>Publicar menos, pero publicar bien.</strong>
            <p>Dosis, claims, registros, capacidades y cifras operativas requieren fuente vigente y validación específica antes de convertirse en contenido público.</p>
          </aside>
        </div>
      </section>

      <section className="library-section">
        <div className="container">
          {categories.map((category) => {
            const resources = libraryResources.filter((resource) => resource.category === category);
            if (!resources.length) return null;
            return (
              <div className="library-group" key={category}>
                <div className="library-group-heading"><span>{category}</span><strong>{resources.length} recurso{resources.length === 1 ? "" : "s"}</strong></div>
                <div className="library-grid">
                  {resources.map((resource) => (
                    <Link className="library-card" href={resource.href} key={resource.slug}>
                      <div className="library-card-meta"><span>{resource.format}</span><em>{resource.status === "publicado" ? "Publicado" : "En validación"}</em></div>
                      <h2>{resource.title}</h2>
                      <p>{resource.summary}</p>
                      <strong>Consultar recurso →</strong>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="library-source-note">
        <div className="container library-source-grid">
          <div><span className="eyebrow eyebrow--light">Knowledge Ops</span><h2>La biblioteca es una salida del sistema de conocimiento, no una carpeta de archivos.</h2></div>
          <div><p>Los documentos maestros permanecen en repositorios controlados. La web publica versiones orientadas al usuario, con procedencia, jerarquía de fuentes y guardrails editoriales.</p><Link href="/contacto/">Solicitar información técnica →</Link></div>
        </div>
      </section>
    </>
  );
}
