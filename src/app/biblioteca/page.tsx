import type { Metadata } from "next";
import Link from "next/link";
import { libraryResources } from "@/data/library";

export const metadata: Metadata = {
  title: "Biblioteca técnica",
  description: "Guías de cultivo, diagnóstico, catálogos, huertas, casos, metodologías y herramientas públicas de Greenatics y Wondergreen.",
  alternates: { canonical: "/biblioteca/" },
};

const categories = ["Cultivos", "Hogar", "Comercial", "Tecnología", "Operación", "Impacto"] as const;

export default function LibraryPage() {
  return (
    <>
      <section className="library-hero">
        <div className="container library-hero-grid">
          <div>
            <span className="eyebrow">Biblioteca Greenatics + Wondergreen</span>
            <h1>Aprender. Diagnosticar. Elegir mejor.</h1>
            <p className="lead">La biblioteca convierte las mejores guías, catálogos y manuales técnicos en conocimiento web navegable. El contenido profundo no queda escondido en una carpeta: acompaña la decisión de cultivo, proyecto o compra.</p>
          </div>
          <aside className="library-rule">
            <span>Regla editorial</span>
            <strong>Conocimiento útil, con fuente y alcance claros.</strong>
            <p>Una guía orienta; una ficha vigente gobierna producto; un diagnóstico define el contexto. No mezclamos borradores, fórmulas antiguas ni activos históricos con la verdad comercial actual.</p>
          </aside>
        </div>
      </section>

      <section className="library-journey">
        <div className="container library-journey-grid">
          <article><span>01</span><strong>Aprender</strong><p>Guías, huertas, etapas, suelo, microbiología y tecnología.</p></article>
          <article><span>02</span><strong>Diagnosticar</strong><p>Síntomas, contexto, lote, operación y preguntas antes de intervenir.</p></article>
          <article><span>03</span><strong>Elegir</strong><p>Familia, formato, producto, servicio o proyecto con criterio y trazabilidad.</p></article>
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
          <div><p>Los maestros permanecen en repositorios controlados. La web publica versiones orientadas al usuario con procedencia, jerarquía de fuentes y guardrails editoriales.</p><Link href="/contacto/">Solicitar información técnica →</Link></div>
        </div>
      </section>
    </>
  );
}
