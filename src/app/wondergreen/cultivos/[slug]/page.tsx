import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { CropDosageCalculator } from "@/components/crop-dosage-calculator";
import { crops, fieldApplicationRules, fieldChecklist, getCrop, getProductSlugForCropStageLine } from "@/data/crops";
import { site } from "@/data/site";
import "./crop-detail.css";

export function generateStaticParams() {
  return crops.map((crop) => ({ slug: crop.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const crop = getCrop(slug);
  if (!crop) return {};
  const canonical = `/wondergreen/cultivos/${crop.slug}/`;
  const description = `${crop.headline} Ruta de orientación por etapa, variables de diagnóstico y familias Wondergreen para preparar una recomendación técnica.`;
  return {
    title: `Wondergreen para ${crop.name} | Orientación agronómica`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `Wondergreen para ${crop.name} | Guía agronómica`,
      description,
      url: canonical,
      images: [crop.coverImage],
    },
  };
}

const decisionLayers = [
  ["01", "Leer el lote", "Suelo o sustrato, agua, raíces, drenaje, clima, sanidad e historial."],
  ["02", "Ubicar el momento", "Etapa fisiológica, carga, vigor, objetivo y extracción esperada."],
  ["03", "Definir qué validar", "Referencia, vía, compatibilidad, cantidad, frecuencia e indicadores."],
] as const;

const localReviewDocuments: Record<string, readonly { href: string; label: string }[]> = {
  cafe: [
    { href: "/downloads/guia-wondergreen-cafe.pdf", label: "Guía gráfica de café · 20 páginas" },
    { href: "/downloads/MANUAL_TECNICO_WONDERGREEN_CAFE_PROFUNDO_20P.pdf", label: "Manual técnico de café · 20 páginas" },
  ],
  cacao: [
    { href: "/downloads/guia-wondergreen-cacao.pdf", label: "Guía gráfica de cacao · 20 páginas" },
    { href: "/downloads/MANUAL_TECNICO_WONDERGREEN_CACAO_PROFUNDO_20P.pdf", label: "Manual técnico de cacao · 20 páginas" },
  ],
  aguacate: [
    { href: "/downloads/guia-wondergreen-aguacate.pdf", label: "Guía gráfica de aguacate · 20 páginas" },
    { href: "/downloads/MANUAL_TECNICO_WONDERGREEN_AGUACATE_PROFUNDO_20P.pdf", label: "Manual técnico de aguacate · 20 páginas" },
  ],
};

export default async function CropDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const crop = getCrop(slug);
  if (!crop) return notFound();

  const cropUrl = `${site.url}/wondergreen/cultivos/${crop.slug}/`;
  const cropIndex = crops.findIndex((item) => item.slug === crop.slug);
  const otherCrops = Array.from({ length: 4 }, (_, index) => crops[(cropIndex + index + 1) % crops.length]);
  const localReviewLinks = process.env.NODE_ENV === "production" ? [] : localReviewDocuments[crop.slug] ?? [];
  const waConsultMsg = encodeURIComponent(
    `Hola Wondergreen, revisé la ruta agronómica de ${crop.name}.\n` +
    "Quiero organizar la información de mi lote y validar qué referencia, dosis, vía y seguimiento pueden aplicar."
  );
  const contactParams = new URLSearchParams({
    servicio: "programas-wondergreen",
    perfil: "agro",
    diagnostico: `Programa agronómico para ${crop.name}`,
    prioridad: `Cultivo ${crop.name}; revisar etapa y objetivo del lote`,
  });
  const contactHref = `/contacto/?${contactParams.toString()}`;

  return (
    <div className="crop-guide-page">
      <ArticleJsonLd
        about={[crop.name, crop.scientificName, "Nutrición vegetal", "Wondergreen Nutrients"]}
        description={crop.intro}
        headline={`Guía Wondergreen para ${crop.name}`}
        url={cropUrl}
      />
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Wondergreen", url: `${site.url}/wondergreen/` },
        { name: "Cultivos", url: `${site.url}/wondergreen/cultivos/` },
        { name: crop.name, url: cropUrl },
      ]} />

      <section className="crop-guide-hero">
        <div className="container">
          <Link className="crop-guide-back" href="/wondergreen/cultivos/"><span aria-hidden="true">←</span> Biblioteca de cultivos</Link>
          <div className="crop-guide-hero__grid">
            <div className="crop-guide-hero__copy">
              <span className="eyebrow eyebrow--light">Wondergreen · Ruta agronómica</span>
              <p className="crop-guide-hero__species">{crop.scientificName}</p>
              <h1>{crop.name}: <em>leer la etapa antes de elegir la referencia.</em></h1>
              <p className="crop-guide-hero__lead">{crop.intro}</p>

              <div className="crop-guide-hero__context">
                <span>Contexto que cambia la decisión</span>
                <p>{crop.context}</p>
              </div>

              <div className="crop-guide-hero__actions">
                <a className="button button--primary" href="#ruta-fisiologica">Recorrer la ruta técnica</a>
                <a className="button button--outline-light" href="#documento">Ver documento y versión</a>
              </div>
            </div>

            <figure className="crop-guide-hero__cover">
              <div><Image alt={`Portada de la guía Wondergreen para ${crop.name}`} fill priority sizes="(max-width: 900px) 80vw, 34vw" src={crop.coverImage} /></div>
              <figcaption><span>Documento disponible</span><strong>Guía técnica para {crop.name}</strong><small>Confirma versión, etiqueta y contexto antes de aplicar.</small></figcaption>
            </figure>
          </div>

          <div className="crop-guide-hero__facts">
            <article><strong>{crop.stages.length}</strong><span>momentos de lectura</span></article>
            <article><strong>{crop.alerts.length}</strong><span>alertas prioritarias</span></article>
            <article><strong>{crop.followUp.length}</strong><span>variables de seguimiento</span></article>
            <article><strong>1</strong><span>decisión con contexto</span></article>
          </div>
        </div>
      </section>

      <nav className="crop-guide-nav" aria-label="Secciones de la guía">
        <div className="container">
          <a href="#ruta-fisiologica">Ruta por etapa</a>
          <a href="#preparar-recomendacion">Preparar recomendación</a>
          <a href="#senales-campo">Señales de campo</a>
          <a href="#seguimiento">Aplicación y seguimiento</a>
          <a href="#documento">Documento técnico</a>
        </div>
      </nav>

      <section className="crop-stage-route" id="ruta-fisiologica">
        <div className="container">
          <header className="crop-guide-heading">
            <div><span className="eyebrow">Ruta fisiológica</span><h2>Cada momento cambia el objetivo, la observación y la conversación técnica.</h2></div>
            <p>Las líneas Wondergreen que aparecen aquí son referencias compatibles con el objetivo de la etapa. No constituyen por sí solas una recomendación de producto, dosis o frecuencia.</p>
          </header>

          <div className="crop-stage-route__list">
            {crop.stages.map((stage, index) => (
              <article key={stage.moment}>
                <div className="crop-stage-route__number"><span>{String(index + 1).padStart(2, "0")}</span><small>Momento</small></div>
                <div className="crop-stage-route__goal"><h3>{stage.moment}</h3><p>{stage.goal}</p></div>
                <div className="crop-stage-route__lines"><span>Referencias para evaluar</span><div>{stage.lines.map((line) => { const productSlug = getProductSlugForCropStageLine(line); return productSlug ? <Link href={`/wondergreen/productos/${productSlug}/`} key={line}>{line}<span aria-hidden="true"> ↗</span></Link> : <strong key={line}>{line}</strong>; })}</div></div>
                <div className="crop-stage-route__validation"><span>Antes de definir</span><p>Análisis, condición del lote, etiqueta, vía, frecuencia y respuesta esperada.</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="crop-decision-bridge">
        <div className="container crop-decision-bridge__grid">
          <div><span className="eyebrow eyebrow--light">Del momento a la decisión</span><h2>Una etapa orienta la pregunta. El lote define la respuesta.</h2><p>Antes de convertir una fase del cultivo en una compra o aplicación, separa lo observado, lo medido y lo que todavía debe confirmarse.</p></div>
          <div className="crop-decision-bridge__steps">
            {decisionLayers.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="crop-guide-calculator" id="preparar-recomendacion">
        <div className="container">
          <header className="crop-guide-heading crop-guide-heading--compact">
            <div><span className="eyebrow">Preparador de conversación</span><h2>Organiza área y etapa sin convertirlas en una dosis automática.</h2></div>
            <p>La herramienta identifica una referencia para evaluar y reúne preguntas útiles. El resultado debe complementarse con diagnóstico y documentación vigente.</p>
          </header>
          <CropDosageCalculator cropName={crop.name} cropSlug={crop.slug} />
        </div>
      </section>

      <section className="crop-field-reading" id="senales-campo">
        <div className="container">
          <header className="crop-guide-heading">
            <div><span className="eyebrow">Observación en campo</span><h2>Una señal no es todavía una causa.</h2></div>
            <p>Color, crecimiento, caída o deformación pueden responder a nutrición, agua, raíz, pH, ambiente o sanidad. Formula hipótesis antes de corregir.</p>
          </header>

          <div className="crop-field-reading__grid">
            <div className="crop-field-reading__hypotheses">
              {crop.deficiencies.map((item, index) => (
                <article key={item.symptom}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><small>Señal observada</small><h3>{item.symptom}</h3><p><strong>Hipótesis:</strong> {item.nutrient}</p><p><strong>Siguiente verificación:</strong> {item.solution}</p></div>
                </article>
              ))}
            </div>
            <aside className="crop-field-reading__alerts">
              <span>Alertas específicas de {crop.name}</span>
              <h3>Qué conviene registrar antes de intervenir.</h3>
              <ol>{crop.alerts.map((alert, index) => <li key={alert}><span>{String(index + 1).padStart(2, "0")}</span><p>{alert}</p></li>)}</ol>
            </aside>
          </div>
        </div>
      </section>

      <section className="crop-followup" id="seguimiento">
        <div className="container">
          <header className="crop-guide-heading crop-guide-heading--light">
            <div><span className="eyebrow eyebrow--light">Aplicación y seguimiento</span><h2>Si no queda registro, la respuesta del cultivo se vuelve difícil de interpretar.</h2></div>
            <p>El seguimiento conecta lo aplicado con agua, clima, condición del cultivo y cambios observados. Así puede sostenerse, ajustarse o descartarse una hipótesis.</p>
          </header>

          <div className="crop-followup__grid">
            <article><header><span>01</span><div><small>Antes y durante</small><h3>Reglas de aplicación</h3></div></header><ol>{fieldApplicationRules.map((rule, index) => <li key={rule}><span>{String(index + 1).padStart(2, "0")}</span><p>{rule}</p></li>)}</ol></article>
            <article><header><span>02</span><div><small>Después</small><h3>Variables para comparar</h3></div></header><ol>{crop.followUp.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol></article>
          </div>

          <div className="crop-followup__cautions"><strong>Límites de interpretación</strong><div>{crop.cautions.map((caution) => <p key={caution}>{caution}</p>)}</div></div>
        </div>
      </section>

      <section className="crop-guide-document" id="documento">
        <div className="container crop-guide-document__card">
          <div>
            <span className="eyebrow">{crop.technicalManualFile || crop.pdfFile ? "Documentos técnicos" : "Siguiente decisión"}</span>
            <h2>{crop.technicalManualFile ? `Dos niveles de lectura para ${crop.name}.` : crop.pdfFile ? `Continúa la lectura en la guía Wondergreen para ${crop.name}.` : `Usa esta ruta para preparar el manejo de ${crop.name}.`}</h2>
            <p>{crop.technicalManualFile ? "Empieza por la guía breve o consulta el manual ampliado, que organiza la lectura del cultivo por etapa y variables del lote. Ambos sirven para preparar preguntas y contrastar el manejo; la dosis final depende de la ficha, la etiqueta y el diagnóstico vigentes." : crop.pdfFile ? "Consulta el documento disponible y confirma su versión antes de usar información técnica. Cualquier dosis, mezcla o corrección específica requiere validar lote, cultivo, producto y etiqueta." : "Esta ruta web organiza etapas, señales de campo y variables del lote. Cualquier recomendación de producto, dosis o frecuencia requiere contrastar el diagnóstico con la ficha, la etiqueta y la orientación técnica vigentes."}</p>
            <div className="crop-guide-document__links">
              {crop.technicalManualFile ? <a className="button button--primary" download href={crop.technicalManualFile}>Abrir manual técnico · 20 páginas</a> : null}
              {crop.pdfFile ? <a className={crop.technicalManualFile ? "button button--document-secondary" : "button button--primary"} download href={crop.pdfFile}>Descargar guía breve PDF</a> : <Link href="#ruta-fisiologica">Repasar etapas y señales <span aria-hidden="true">→</span></Link>}
              <Link href="/wondergreen/analisis-suelo/">Organizar análisis de suelo <span aria-hidden="true">→</span></Link>
            </div>
            {localReviewLinks.length > 0 ? (
              <aside className="crop-guide-review" aria-label="Material de trabajo para revisión técnica">
                <div><strong>Material de trabajo para revisión técnica</strong><p>Estos documentos conservan el contenido y los claims de sus versiones fuente para que el equipo técnico los revise. La etiqueta señala su estado de trabajo, no una aprobación ni una conclusión sobre cada afirmación.</p></div>
                <ul>{localReviewLinks.map((document) => <li key={document.href}><a href={document.href} target="_blank" rel="noreferrer">{document.label}<span aria-hidden="true">↗</span></a></li>)}</ul>
                <small>Acceso disponible solo en el preview local. Los documentos originales se conservan sin cambios.</small>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      <section className="crop-related-guides">
        <div className="container">
          <header><div><span className="eyebrow">Biblioteca agronómica</span><h2>Continúa explorando otras rutas.</h2></div><Link href="/wondergreen/cultivos/">Ver los 12 cultivos <span aria-hidden="true">→</span></Link></header>
          <div>{otherCrops.map((item) => <Link href={`/wondergreen/cultivos/${item.slug}/`} key={item.slug}><figure><Image alt={`Guía Wondergreen para ${item.name}`} fill loading="lazy" sizes="(max-width: 600px) 45vw, 18vw" src={item.coverImage} /></figure><span>{item.scientificName}</span><strong>{item.name}</strong><p>{item.headline}</p></Link>)}</div>
        </div>
      </section>

      <section className="crop-guide-cta">
        <div className="container crop-guide-cta__inner">
          <div><span className="eyebrow eyebrow--light">Recomendación con contexto</span><h2>¿Necesitas convertir esta ruta en un programa para tu lote de {crop.name}?</h2><p>Comparte análisis, área, etapa, manejo previo y objetivo. Podemos identificar qué información falta antes de definir producto, dosis, vía y seguimiento.</p></div>
          <div><Link className="button button--primary" href={contactHref}>Diseñar un programa para {crop.name} <span aria-hidden="true">→</span></Link><a className="crop-guide-cta__link" href={`https://wa.me/573003078822?text=${waConsultMsg}`} rel="noopener noreferrer" target="_blank">Validar por WhatsApp directo <span aria-hidden="true">→</span></a><Link href="/wondergreen/#productos">Ver referencias Wondergreen <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>
    </div>
  );
}
