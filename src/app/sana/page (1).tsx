import type { Metadata } from "next";
import Link from "next/link";
import "./sana-v1.css";

export const metadata: Metadata = {
  title: "SANA | Estructuración de proyectos agrícolas",
  description:
    "Un marco de trabajo para conectar oportunidad productiva, inversión, criterio agronómico y seguimiento. Explora un recorrido con datos de ejemplo.",
  alternates: { canonical: "/sana/" },
  openGraph: {
    title: "SANA | Estructuración de proyectos agrícolas | Greenatics",
    description: "Un marco de trabajo para conectar oportunidad productiva, inversión, criterio agronómico y seguimiento.",
    url: "/sana/",
  },
};

const journey = [
  ["01", "Entender", "Caracterizar el cultivo, el territorio, los actores, la etapa y la necesidad que da origen al proyecto."],
  ["02", "Estructurar", "Definir el objetivo productivo, el alcance, la inversión requerida, los responsables y el horizonte."],
  ["03", "Acompañar", "Coordinar el criterio agronómico y las actividades acordadas con el equipo del proyecto."],
  ["04", "Revisar", "Contrastar avance, presupuesto y soportes para decidir el siguiente hito."],
] as const;

export default function SanaPage() {
  return (
    <>
      <section className="sana-v1-hero">
        <div className="container sana-v1-hero__grid">
          <div>
            <h1>Conectamos inversión y conocimiento con proyectos que nacen en el campo.</h1>
            <p className="lead">Articulamos territorio, actores, plan productivo, recursos y acompañamiento técnico en una ruta con hitos, responsables y evidencias.</p>
            <div className="button-row"><Link className="button button--neon" href="/sana/app/">Explorar recorrido ilustrativo</Link><Link className="button button--outline-light" href="#como-funciona">Ver la ruta</Link></div>
            <p className="sana-v1-hero__note">La muestra recorre oportunidades, proyectos, seguimiento y documentación con datos ficticios; no guarda ni comparte información.</p>
          </div>
          <figure className="sana-v1-model" aria-label="Elementos que SANA articula alrededor de un proyecto productivo">
            <div className="sana-v1-model__header"><span>MARCO DE TRABAJO</span><strong>SANA</strong></div>
            <div className="sana-v1-model__stages">
              <article><span>01 · PROYECTO PRODUCTIVO</span><strong>Cultivo, territorio y actores</strong></article>
              <i aria-hidden="true" />
              <article><span>02 · PLAN Y RECURSOS</span><strong>Necesidades técnicas, inversión y responsabilidades</strong></article>
              <i aria-hidden="true" />
              <article><span>03 · ACOMPAÑAMIENTO</span><strong>Actividades, evidencia y decisiones</strong></article>
            </div>
            <figcaption>SANA articula estos elementos según la etapa, el alcance y los responsables de cada proyecto.</figcaption>
          </figure>
        </div>
      </section>

      <section className="sana-v1-journey" id="como-funciona" aria-labelledby="sana-journey-title"><div className="container"><header className="sana-v1-heading"><div><span className="eyebrow">Una ruta para ordenar decisiones</span><h2 id="sana-journey-title">Del contexto productivo a un siguiente paso verificable.</h2></div><p>Cada proyecto acuerda su alcance, sus responsabilidades y la evidencia necesaria para revisar avances.</p></header><div className="sana-v1-journey__grid">{journey.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

      <section className="sana-v1-cta"><div className="container"><span className="eyebrow eyebrow--light">SANA · estructuración productiva</span><h2>Cuéntanos qué proyecto agrícola quieres estructurar.</h2><p>Comparte el cultivo, el territorio, los actores, la etapa y el tipo de acompañamiento o inversión que estás buscando.</p><Link className="button button--neon" href="/contacto/?interes=sana">Conversar sobre un proyecto <span aria-hidden="true">→</span></Link></div></section>
    </>
  );
}
