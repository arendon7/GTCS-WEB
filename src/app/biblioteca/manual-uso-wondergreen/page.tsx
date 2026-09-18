import type { Metadata } from "next";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { fieldApplicationRules, fieldChecklist } from "@/data/crops";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Guía de aplicación en campo Wondergreen",
  description: "Guía de criterio para preparar, ejecutar y hacer seguimiento de aplicaciones Wondergreen.",
  alternates: { canonical: "/biblioteca/manual-uso-wondergreen/" },
  openGraph: {
    title: "Guía de aplicación en campo Wondergreen | Greenatics",
    description: "Criterios para preparar, ejecutar y hacer seguimiento de aplicaciones Wondergreen con la ficha vigente como referencia principal.",
    url: "/biblioteca/manual-uso-wondergreen/",
    images: ["/brand/wondergreen-nutrients.webp"],
  },
};

const equipment = [
  ["Sólidos", "Aplicación al suelo. La forma exacta de distribución debe validarse con la ficha y recomendación vigentes."],
  ["Bomba de espalda", "Para líquidos, usar equipo limpio y aplicar únicamente bajo instrucciones técnicas vigentes."],
  ["Caneca o tanque", "La preparación, homogenización y volumen final deben seguir la documentación aprobada del producto."],
  ["Fertirriego", "Su uso depende de la compatibilidad del producto, el sistema y la recomendación técnica específica."],
  ["Pastos", "La decisión debe leerse por hectárea, manejo del potrero, humedad, objetivo y condición real del lote."],
] as const;

const doNot = [
  "No convertir una práctica histórica en instrucción vigente sin validarla.",
  "No asumir compatibilidad entre productos o sistemas de aplicación.",
  "No trasladar una dosis entre cultivos, presentaciones o formulaciones.",
  "No aplicar por rutina cuando el lote presenta estrés o una causa no diagnosticada.",
  "No usar este borrador como sustituto de ficha, etiqueta o recomendación técnica aprobada.",
] as const;

export default function WondergreenUseManualPage() {
  const url = `${site.url}/biblioteca/manual-uso-wondergreen/`;
  return (
    <>
      <ArticleJsonLd
        headline="Guía de aplicación en campo Wondergreen"
        description="Criterios para preparar, ejecutar y hacer seguimiento de aplicaciones Wondergreen sin sustituir la ficha técnica vigente."
        url={url}
        dateModified="2026-09-18"
        about={["Aplicación agronómica", "Wondergreen", "Nutrición vegetal"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Biblioteca", url: `${site.url}/biblioteca/` },
        { name: "Guía de aplicación", url },
      ]} />

      <section className="knowledge-hero">
        <div className="container knowledge-hero-grid">
          <div>
            <Link className="back-link" href="/biblioteca/">← Biblioteca</Link>
            <span className="eyebrow">Guía de aplicación en campo</span>
            <h1>La aplicación en campo debe ser simple, pero nunca improvisada.</h1>
            <p className="lead">Esta guía organiza los criterios operativos que acompañan una aplicación responsable. La ficha técnica y el protocolo de la referencia elegida definen las dosis, mezclas, compatibilidades e instrucciones específicas.</p>
          </div>
          <aside className="knowledge-warning">
            <span>Regla maestra</span>
            <strong>Objetivo → etapa → diagnóstico → producto → ficha vigente → seguimiento.</strong>
            <p>La recomendación específica y la documentación aprobada tienen precedencia sobre cualquier regla general de esta página.</p>
          </aside>
        </div>
      </section>

      <section className="knowledge-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Antes de aplicar</span><h2>Preguntas que organizan una buena ejecución.</h2></div>
          <div className="knowledge-rule-grid">{fieldChecklist.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,"0")}</span><p>{item}</p></article>)}</div>
        </div>
      </section>

      <section className="knowledge-section knowledge-section--soft">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Vía y equipo</span><h2>La vía depende del producto, el lote y la documentación vigente.</h2></div>
          <div className="knowledge-card-grid">{equipment.map(([title,copy])=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="crop-application-section">
        <div className="container crop-application-grid"><div><span className="eyebrow">Durante la aplicación</span><h2>Reglas de operación que ayudan a proteger la decisión.</h2><p>Estas reglas organizan una ejecución cuidadosa. La ficha técnica y el protocolo de cada referencia prevalecen cuando definen una condición más específica.</p></div><ol>{fieldApplicationRules.map((rule)=><li key={rule}>{rule}</li>)}</ol></div>
      </section>

      <section className="crop-alert-section"><div className="container crop-alert-grid"><div><span className="eyebrow eyebrow--light">Evitar</span><h2>La prudencia operativa tiene precedencia.</h2></div><div>{doNot.map((item)=><p key={item}>{item}</p>)}</div></div></section>

      <section className="knowledge-section"><div className="container split-knowledge"><div><span className="eyebrow">Después</span><h2>El seguimiento convierte la operación en aprendizaje.</h2></div><div><p>El registro de fecha, lote, etapa, producto, condiciones del evento y respuesta observada puede servir para comparar aplicaciones y mejorar decisiones, siempre bajo el sistema operativo y técnico vigente.</p><div className="button-row"><Link className="button button--primary" href="/wondergreen/cultivos/">Ver guías por cultivo</Link><Link className="button button--ghost" href="/contacto/">Pedir recomendación técnica</Link></div></div></div></section>

      <section className="knowledge-source-band"><div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Aplicación con criterio</span><h2>La regla general organiza; la ficha técnica define.</h2></div><div><p>Esta guía acompaña la conversación operativa. Para cada producto, la ficha técnica, la etiqueta y el protocolo de aplicación establecen la condición de uso, la dosis, la frecuencia y las compatibilidades correspondientes.</p><Link href="/biblioteca/">Volver a Biblioteca →</Link></div></div></section>
    </>
  );
}
