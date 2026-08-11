import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Agenda una conversación con Greenatics sobre Wondergreen, tratamiento de residuos, proyectos municipales, plantas o soluciones empresariales.",
  alternates: { canonical: "/contacto/" },
};

const preparation = [
  {
    audience: "Agro / Wondergreen",
    title: "Cultivo y nutrición",
    items: ["Cultivo y edad o etapa", "Área o número de plantas", "Objetivo o problema observado", "Análisis disponibles y fertilización reciente"],
  },
  {
    audience: "Empresas",
    title: "Residuos orgánicos",
    items: ["Tipo y origen del residuo", "Volumen aproximado y frecuencia", "Ubicación", "Separación actual y principal dificultad"],
  },
  {
    audience: "Municipios / ESP",
    title: "Proyecto territorial",
    items: ["Municipio o área de servicio", "Generadores y rutas actuales", "Infraestructura existente", "Objetivo, etapa del proyecto y restricciones conocidas"],
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="contact-page contact-page--expanded">
        <div className="container contact-grid">
          <div>
            <span className="eyebrow">Contacto Greenatics</span>
            <h1>Cuéntanos qué quieres transformar.</h1>
            <p className="lead">Podemos hablar de Wondergreen, gestión de residuos, proyectos municipales, plantas o soluciones empresariales.</p>
            <div className="button-row"><Link className="button button--ghost" href="/diagnostico/">No sé por dónde empezar</Link></div>
          </div>
          <div className="contact-panel">
            <span>Reunión técnica</span>
            <h2>Agenda directamente con el equipo.</h2>
            <p>Una reunión funciona mejor cuando llegamos con el contexto mínimo. Usa la guía inferior y trae lo que ya tengas; no necesitas tener toda la información resuelta.</p>
            <a className="button button--primary" href={site.bookingUrl} target="_blank" rel="noreferrer">Agendar reunión</a>
          </div>
        </div>
      </section>

      <section className="contact-prep-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Antes de la reunión</span><h2>Cuatro datos pueden ahorrar mucho tiempo.</h2><p>No es un formulario obligatorio. Es una lista corta para que la primera conversación llegue más rápido al problema real.</p></div>
          <div className="contact-prep-grid">
            {preparation.map((group, index) => (
              <article key={group.audience}>
                <span>{String(index + 1).padStart(2, "0")} · {group.audience}</span>
                <h3>{group.title}</h3>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">¿Aún no sabes qué necesitas?</span><h2>Dos preguntas te llevan a la ruta Greenatics más útil.</h2></div><Link className="button button--dark" href="/diagnostico/">Hacer diagnóstico</Link></div></section>
    </>
  );
}
