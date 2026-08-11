import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { crops, getCrop } from "@/data/crops";

export function generateStaticParams() {
  return crops.map((crop) => ({ slug: crop.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const crop = getCrop(slug);
  if (!crop) return {};
  return {
    title: `Wondergreen para ${crop.name}`,
    description: `${crop.headline} Guía orientativa por etapa y objetivo agronómico.`,
  };
}

export default async function CropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const crop = getCrop(slug);
  if (!crop) notFound();

  return (
    <>
      <section className="crop-detail-hero">
        <div className="container crop-detail-grid">
          <div>
            <Link className="back-link" href="/wondergreen/cultivos/">← Todos los cultivos</Link>
            <span className="eyebrow">Wondergreen · {crop.name}</span>
            <h1>{crop.headline}</h1>
            <p className="lead">{crop.intro}</p>
          </div>
          <aside className="crop-context">
            <span>Antes de recomendar</span>
            <p>{crop.context}</p>
          </aside>
        </div>
      </section>

      <section className="crop-program">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Programa por momento</span>
            <h2>Lee la necesidad antes de elegir el producto.</h2>
          </div>
          <div className="crop-stage-list">
            {crop.stages.map((stage, index) => (
              <article key={stage.moment}>
                <span className="crop-stage-number">{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{stage.moment}</strong><p>{stage.goal}</p></div>
                <div className="line-pills">{stage.lines.map((line) => <span key={line}>{line}</span>)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="crop-cautions">
        <div className="container cautions-grid">
          <div><span className="eyebrow eyebrow--light">Criterio técnico</span><h2>La guía orienta. El lote decide.</h2></div>
          <ul>{crop.cautions.map((caution) => <li key={caution}>{caution}</li>)}</ul>
        </div>
      </section>

      <section className="closing-cta">
        <div className="container closing-inner">
          <div><span className="eyebrow">Siguiente paso</span><h2>Convierte esta guía en una recomendación para tu lote.</h2></div>
          <div className="button-row crop-cta-row"><Link className="button button--dark" href="/contacto/">Pedir asesoría</Link><Link className="button button--ghost" href="/wondergreen/cotizador/">Cotizar productos</Link></div>
        </div>
      </section>
    </>
  );
}
