import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { crops, fieldApplicationRules, fieldChecklist, getCrop } from "@/data/crops";
import { site } from "@/data/site";

export function generateStaticParams() {
  return crops.map((crop) => ({ slug: crop.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const crop = getCrop(slug);
  if (!crop) return {};
  const canonical = `/wondergreen/cultivos/${crop.slug}/`;
  const description = `${crop.headline} Guía de campo por etapa, objetivo, evaluación y seguimiento.`;
  return { title: `Wondergreen para ${crop.name}`, description, alternates: { canonical }, openGraph: { title: `Wondergreen para ${crop.name}`, description, url: canonical } };
}

export default async function CropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const crop = getCrop(slug);
  if (!crop) notFound();
  const cropUrl = `${site.url}/wondergreen/cultivos/${crop.slug}/`;
  const deficiencyAnchor = crop.slug === "pastos-gramineas" ? "pastos" : crop.slug;

  return (
    <>
      <ArticleJsonLd headline={`Guía Wondergreen para ${crop.name}`} description={crop.intro} url={cropUrl} about={[crop.name, "Nutrición vegetal", "Wondergreen Nutrients"]} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` },{ name: "Wondergreen", url: `${site.url}/wondergreen/` },{ name: "Cultivos", url: `${site.url}/wondergreen/cultivos/` },{ name: crop.name, url: cropUrl }]} />

      <section className="crop-detail-hero"><div className="container crop-detail-grid"><div><Link className="back-link" href="/wondergreen/cultivos/">← Todos los cultivos</Link><span className="eyebrow">Wondergreen · {crop.name}</span><h1>{crop.headline}</h1><p className="lead">{crop.intro}</p></div><aside className="crop-context"><span>Antes de recomendar</span><p>{crop.context}</p></aside></div></section>

      <section className="crop-field-check"><div className="container"><div className="section-heading"><span className="eyebrow">Checklist de campo</span><h2>Seis preguntas antes de elegir una línea.</h2></div><div className="crop-check-grid">{fieldChecklist.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,"0")}</span><p>{item}</p></article>)}</div></div></section>

      <section className="crop-program"><div className="container"><div className="section-heading"><span className="eyebrow">Programa por momento</span><h2>Lee la necesidad antes de elegir el producto.</h2></div><div className="crop-stage-list">{crop.stages.map((stage,index)=><article key={stage.moment}><span className="crop-stage-number">{String(index+1).padStart(2,"0")}</span><div><strong>{stage.moment}</strong><p>{stage.goal}</p></div><div className="line-pills">{stage.lines.map((line)=><span key={line}>{line}</span>)}</div></article>)}</div></div></section>

      <section className="crop-application-section"><div className="container crop-application-grid"><div><span className="eyebrow">Uso en campo</span><h2>Una recomendación debe ser fácil de ejecutar correctamente.</h2><p>Estas reglas son generales. La dosis, concentración, compatibilidad y vía definitiva dependen de la ficha vigente y del contexto del lote.</p><Link className="knowledge-inline-link" href="/biblioteca/manual-uso-wondergreen/">Abrir manual de uso completo →</Link></div><ol>{fieldApplicationRules.map((rule)=><li key={rule}>{rule}</li>)}</ol></div></section>

      <section className="crop-alert-section"><div className="container crop-alert-grid"><div><span className="eyebrow eyebrow--light">Señales de alerta</span><h2>No todo síntoma se resuelve agregando nutrición.</h2><Link className="crop-light-link" href={`/biblioteca/guia-deficiencias/#${deficiencyAnchor}`}>Consultar guía de deficiencias →</Link></div><div>{crop.alerts.map((alert)=><p key={alert}>{alert}</p>)}</div></div></section>

      <section className="crop-followup-section"><div className="container"><div className="section-heading"><span className="eyebrow">Después de aplicar</span><h2>La siguiente recomendación empieza con el seguimiento.</h2></div><div className="crop-followup-grid">{crop.followUp.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,"0")}</span><p>{item}</p></article>)}</div></div></section>

      <section className="crop-related"><div className="container"><div className="section-heading"><span className="eyebrow">Continúa la ruta</span><h2>Diagnóstico, uso y cotización están conectados.</h2></div><div className="crop-related-grid"><Link href={`/biblioteca/guia-deficiencias/#${deficiencyAnchor}`}><span>Diagnosticar</span><strong>Guía de deficiencias</strong><small>Antes de corregir síntomas.</small></Link><Link href="/biblioteca/manual-uso-wondergreen/"><span>Ejecutar</span><strong>Manual de uso</strong><small>Vía, equipo y seguimiento.</small></Link><Link href="/wondergreen/cotizador/"><span>Cotizar</span><strong>Cotizador Wondergreen</strong><small>Estimación de referencias reconciliadas.</small></Link></div></div></section>

      <section className="crop-cautions"><div className="container cautions-grid"><div><span className="eyebrow eyebrow--light">Criterio técnico</span><h2>La guía orienta. El lote decide.</h2></div><ul>{crop.cautions.map((caution)=><li key={caution}>{caution}</li>)}</ul></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Siguiente paso</span><h2>Convierte esta guía en una recomendación para tu lote.</h2></div><div className="button-row crop-cta-row"><Link className="button button--dark" href="/contacto/">Pedir asesoría</Link><Link className="button button--ghost" href="/wondergreen/cotizador/">Cotizar productos</Link></div></div></section>
    </>
  );
}
