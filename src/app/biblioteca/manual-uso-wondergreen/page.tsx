import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { fieldApplicationRules, fieldChecklist } from "@/data/crops";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Manual de uso en campo Wondergreen · En validación",
  description: "Borrador operativo en validación para preparar, ejecutar y hacer seguimiento de aplicaciones Wondergreen.",
  alternates: { canonical: "/biblioteca/manual-uso-wondergreen/" },
  robots: { index: false, follow: false },
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
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Biblioteca", url: `${site.url}/biblioteca/` },
        { name: "Manual de uso · En validación", url },
      ]} />

      <section className="knowledge-hero">
        <div className="container knowledge-hero-grid">
          <div>
            <Link className="back-link" href="/biblioteca/">← Biblioteca</Link>
            <span className="eyebrow">Borrador operativo · en validación</span>
            <h1>La aplicación en campo debe ser simple, pero nunca improvisada.</h1>
            <p className="lead">Esta versión organiza criterios operativos para revisión interna. No constituye todavía un manual técnico publicado y no libera dosis, mezclas, compatibilidades ni instrucciones específicas de aplicación.</p>
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
          <div className="section-heading"><span className="eyebrow">Antes de aplicar · material en revisión</span><h2>Preguntas que deben resolverse antes de ejecutar.</h2></div>
          <div className="knowledge-rule-grid">{fieldChecklist.map((item,index)=><article key={item}><span>{String(index+1).padStart(2,"0")}</span><p>{item}</p></article>)}</div>
        </div>
      </section>

      <section className="knowledge-section knowledge-section--soft">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Vía y equipo · criterio preliminar</span><h2>La vía depende del producto, el lote y la documentación vigente.</h2></div>
          <div className="knowledge-card-grid">{equipment.map(([title,copy])=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="crop-application-section">
        <div className="container crop-application-grid"><div><span className="eyebrow">Durante la aplicación</span><h2>Reglas internas pendientes de validación de fuente.</h2><p>Se conservan para QA editorial. No deben interpretarse como instrucciones públicas hasta cerrar la trazabilidad técnica.</p></div><ol>{fieldApplicationRules.map((rule)=><li key={rule}>{rule}</li>)}</ol></div>
      </section>

      <section className="crop-alert-section"><div className="container crop-alert-grid"><div><span className="eyebrow eyebrow--light">Evitar</span><h2>La prudencia operativa tiene precedencia.</h2></div><div>{doNot.map((item)=><p key={item}>{item}</p>)}</div></div></section>

      <section className="knowledge-section"><div className="container split-knowledge"><div><span className="eyebrow">Después</span><h2>El seguimiento convierte la operación en aprendizaje.</h2></div><div><p>El registro de fecha, lote, etapa, producto, condiciones del evento y respuesta observada puede servir para comparar aplicaciones y mejorar decisiones, siempre bajo el sistema operativo y técnico vigente.</p><div className="button-row"><Link className="button button--primary" href="/wondergreen/cultivos/">Ver guías por cultivo</Link><Link className="button button--ghost" href="/contacto/">Pedir recomendación técnica</Link></div></div></div></section>

      <section className="knowledge-source-band"><div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Fuente pendiente</span><h2>No se indexa hasta cerrar la trazabilidad técnica.</h2></div><div><p>No hemos localizado todavía una fuente maestra vigente que permita validar de manera suficiente todas las reglas operativas consolidadas aquí. La página permanece fuera del índice público hasta resolver esa deuda.</p><Link href="/biblioteca/">Volver a Biblioteca →</Link></div></div></section>
    </>
  );
}
