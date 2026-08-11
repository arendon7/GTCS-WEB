import type { Metadata } from "next";
import Link from "next/link";
import { LibraryExplorer } from "@/components/library-explorer";
import { libraryResources } from "@/data/library";

export const metadata: Metadata = {
  title: "Biblioteca técnica",
  description: "Guías de cultivo, diagnóstico, catálogos, manuales, huertas, casos, metodologías y herramientas públicas de Greenatics y Wondergreen.",
  alternates: { canonical: "/biblioteca/" },
};

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
          <div className="section-heading"><span className="eyebrow">Explorador</span><h2>Encuentra el recurso que necesitas.</h2><p>Busca por cultivo, problema, tipo de documento o tema.</p></div>
          <LibraryExplorer resources={libraryResources} />
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
