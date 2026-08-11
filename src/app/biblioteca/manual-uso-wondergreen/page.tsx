import type { Metadata } from "next";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { fieldApplicationRules, fieldChecklist } from "@/data/crops";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Manual de uso en campo Wondergreen",
  description: "Guía práctica para preparar una recomendación, elegir la vía operativa, ejecutar correctamente y hacer seguimiento sin convertir el manual en una receta universal.",
  alternates: { canonical: "/biblioteca/manual-uso-wondergreen/" },
};

const equipment = [
  ["Sólidos", "Aplicación al suelo. En árboles, distribuir en plato o anillo y evitar contacto directo con el tallo."],
  ["Bomba de espalda", "Para líquidos, usar agua limpia, preparar y homogenizar correctamente y aplicar según ficha y recomendación vigente."],
  ["Caneca o tanque", "Premezclar, completar volumen, homogenizar y preparar solo lo necesario para el evento de aplicación."],
  ["Fertirriego", "Puede facilitar aplicaciones líquidas fraccionadas cuando el sistema, el producto y la recomendación sean compatibles."],
  ["Pastos", "La lógica principal se evalúa por hectárea y por manejo del potrero; el sólido al suelo sigue siendo la base operativa cuando corresponda."],
] as const;

const doNot = [
  "No aplicar un sólido dentro de un tanque de aplicación líquida.",
  "No pegar el producto al tallo o cuello del árbol.",
  "No aplicar con la planta marchita, suelo totalmente seco, sol fuerte o lluvia inminente.",
  "No mezclar insumos por costumbre: confirmar compatibilidad y realizar prueba previa.",
  "No convertir una dosis de otro cultivo, otro empaque o una versión histórica en recomendación vigente.",
] as const;

export default function WondergreenUseManualPage() {
  const url = `${site.url}/biblioteca/manual-uso-wondergreen/`;
  return (
    <>
      <ArticleJsonLd headline="Manual de uso en campo Wondergreen" description="Preparación, aplicación y seguimiento del portafolio Wondergreen bajo criterio técnico." url={url} about={["Wondergreen Nutrients", "Aplicación de fertilizantes", "Nutrición vegetal"]} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` },{ name: "Biblioteca", url: `${site.url}/biblioteca/` },{ name: "Manual de uso", url }]} />

      <section className="knowledge-hero">
        <div className="container knowledge-hero-grid"><div><Link className="back-link" href="/biblioteca/">← Biblioteca</Link><span className="eyebrow">Manual práctico</span><h1>Una buena recomendación también debe ser fácil de ejecutar.</h1><p className="lead">Este manual traduce la lógica técnica a decisiones de campo: qué revisar antes, cómo elegir la vía operativa y qué registrar después. No reemplaza la ficha técnica ni define una dosis universal.</p></div><aside className="knowledge-warning"><span>Regla maestra</span><strong>Objetivo → etapa → diagnóstico → producto → vía → seguimiento.</strong><p>El producto llega después de entender el lote. La dosis y compatibilidad llegan después de validar la documentación vigente.</p></aside></div>
      </section>

      <section className="knowledge-section"><div className="container"><div className="section-heading"><span className="eyebrow">Antes de aplicar</span><h2>El checklist que evita recomendaciones automáticas.</h2></div><div className="knowledge-rule-grid">{fieldChecklist.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,"0")}</span><p>{item}</p></article>)}</div></div></section>

      <section className="knowledge-section knowledge-section--soft"><div className="container"><div className="section-heading"><span className="eyebrow">Vía y equipo</span><h2>Adaptar la aplicación a la finca sin perder criterio técnico.</h2></div><div className="knowledge-card-grid">{equipment.map(([title,copy])=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="crop-application-section"><div className="container crop-application-grid"><div><span className="eyebrow">Durante la aplicación</span><h2>Seis reglas generales de operación.</h2><p>La ficha del producto y la recomendación específica siempre tienen precedencia.</p></div><ol>{fieldApplicationRules.map((rule)=><li key={rule}>{rule}</li>)}</ol></div></section>

      <section className="crop-alert-section"><div className="container crop-alert-grid"><div><span className="eyebrow eyebrow--light">Evitar</span><h2>Cinco errores simples que degradan una buena recomendación.</h2></div><div>{doNot.map((item)=><p key={item}>{item}</p>)}</div></div></section>

      <section className="knowledge-section"><div className="container split-knowledge"><div><span className="eyebrow">Después</span><h2>Registrar convierte una aplicación en aprendizaje.</h2></div><div><p>Fecha, lote, etapa, producto, condición de humedad, clima, respuesta y próximo paso permiten comparar eventos y ajustar el programa. El seguimiento debe mirar vigor, uniformidad, síntomas y facilidad operativa, no solo si “se aplicó”.</p><div className="button-row"><Link className="button button--primary" href="/wondergreen/cultivos/">Ver guías por cultivo</Link><Link className="button button--ghost" href="/biblioteca/guia-deficiencias/">Diagnóstico visual</Link></div></div></div></section>

      <section className="knowledge-source-band"><div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Product Truth</span><h2>El manual no libera dosis ni mezclas.</h2></div><div><p>Esos datos se publican por SKU cuando ficha, etiqueta, presentación y registro vigente estén validados.</p><Link href="/contacto/">Solicitar recomendación técnica →</Link></div></div></section>
    </>
  );
}
