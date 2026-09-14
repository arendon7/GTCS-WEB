import type { Metadata } from "next";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Nutrición regenerativa para pastos y gramíneas",
  description: "Mini catálogo técnico Wondergreen para sistemas ganaderos, lecheros y forrajeros: biomasa, rebrote, suelo y acompañamiento técnico.",
  alternates: { canonical: "/biblioteca/pastos-gramineas/" },
};

const system = [
  ["2GROW", "Nutrición vegetativa", "Línea protagonista para crecimiento, rebrote y recuperación del sistema forrajero."],
  ["Compost", "Base de suelo", "Acompaña acondicionamiento, materia orgánica y recuperación de la condición del suelo."],
  ["Bioinsumos", "Biología del sistema", "Complemento para programas integrales de suelo y manejo biológico, sujeto a producto y objetivo validados."],
  ["Acompañamiento", "Decisión por lote", "Lectura agronómica, seguimiento y ajuste para no convertir una guía en una receta rígida."],
] as const;

const fieldQuestions = [
  "¿El problema es bajo rebrote, poca biomasa, pérdida de cobertura o deterioro del suelo?",
  "¿Qué ocurrió después del último corte o pastoreo?",
  "¿Hay sequía, exceso de humedad, compactación o limitación de raíces?",
  "¿Qué fertilización se aplicó recientemente y cómo respondió el potrero?",
  "¿La necesidad es recuperación puntual o sostenimiento del sistema?",
] as const;

export default function PasturesKnowledgePage() {
  const url = `${site.url}/biblioteca/pastos-gramineas/`;
  return (
    <>
      <ArticleJsonLd
        headline="Nutrición regenerativa para pastos y gramíneas"
        description="Programa técnico-comercial para sistemas forrajeros con foco en biomasa, rebrote, suelo y eficiencia."
        url={url}
        about={["Pastos", "Gramíneas", "Ganadería", "Nutrición vegetal", "2GROW"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Biblioteca", url: `${site.url}/biblioteca/` },
        { name: "Pastos y gramíneas", url },
      ]} />

      <section className="knowledge-hero knowledge-hero--pasture">
        <div className="container knowledge-hero-grid">
          <div><Link className="back-link" href="/biblioteca/">← Biblioteca</Link><span className="eyebrow">Mini catálogo técnico</span><h1>Más biomasa, mejor rebrote y una lectura más completa del suelo.</h1><p className="lead">Para sistemas ganaderos, lecheros, gramíneas forrajeras y cultivos de corte. El foco no es “echar fertilizante”: es entender qué limita la respuesta del potrero y construir un programa coherente con el lote.</p></div>
          <aside className="knowledge-warning"><span>Foco de esta guía</span><strong>Crecimiento y recuperación, no reproducción.</strong><p>2GROW es la línea principal. 2BLOOM y 2FRUIT no se incorporan como eje de este programa porque floración y llenado no son el objetivo agronómico dominante del sistema forrajero.</p></aside>
        </div>
      </section>

      <section className="knowledge-section">
        <div className="container"><div className="section-heading"><span className="eyebrow">Capítulo 1 · entender</span><h2>¿Qué necesita un sistema forrajero productivo?</h2><p>Además de nutrientes, necesita suelo funcional, respuesta al rebrote, humedad suficiente, raíces activas y un manejo que no destruya el stand.</p></div><div className="field-question-list">{fieldQuestions.map((question, index) => <div key={question}><span>{String(index + 1).padStart(2,"0")}</span><strong>{question}</strong></div>)}</div></div>
      </section>

      <section className="knowledge-section knowledge-section--soft">
        <div className="container"><div className="section-heading"><span className="eyebrow">Capítulo 2 · programa</span><h2>Nutrición + suelo + seguimiento.</h2></div><div className="knowledge-card-grid knowledge-card-grid--four">{system.map(([title, role, copy]) => <article key={title}><span className="knowledge-card-kicker">{role}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="knowledge-actions"><Link className="button button--primary" href="/wondergreen/cultivos/pastos-gramineas/">Ver programa por etapa</Link><Link className="button button--ghost" href="/biblioteca/guia-deficiencias/#pastos">Diagnóstico de deficiencias</Link></div></div>
      </section>

      <section className="knowledge-section">
        <div className="container split-knowledge"><div><span className="eyebrow">Capítulo 3 · acompañar</span><h2>Monitoreo preciso → decisión informada → ajuste por lote.</h2></div><div><p>La recomendación se ajusta con análisis de suelo y condición del lote, objetivo productivo, respuesta al corte o pastoreo, humedad, compactación y seguimiento. Los productos líquidos se tratan como complemento cuando corresponda, no como única base automática del programa.</p><div className="technical-lock"><strong>Sin receta rígida</strong><p>Esta página no publica una dosis cerrada porque especie forrajera, ambiente, manejo y nivel productivo cambian la necesidad.</p></div></div></div>
      </section>

      <section className="knowledge-source-band"><div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Greenatics + Wondergreen</span><h2>Una pradera rala no se diagnostica solo mirando una hoja.</h2></div><div><p>Confirma suelo, humedad, manejo, fertilización reciente y patrón del potrero antes de corregir. Luego construimos el programa.</p><Link href="/contacto/">Solicitar acompañamiento técnico →</Link></div></div></section>
    </>
  );
}
