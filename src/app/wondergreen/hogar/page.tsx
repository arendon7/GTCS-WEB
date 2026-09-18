import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { homeKitFamilies } from "@/data/knowledge";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Wondergreen Nutrients Hogar",
  description: "Guía Wondergreen Hogar para entender el cuidado de plantas en casa, matera y huerta urbana por objetivo y etapa.",
  alternates: { canonical: "/wondergreen/hogar/" },
  openGraph: {
    title: "Wondergreen Nutrients Hogar",
    description: "Guía Wondergreen Hogar para entender el cuidado de plantas en casa, matera y huerta urbana por objetivo y etapa.",
    url: "/wondergreen/hogar/",
    images: ["/kits/kit-casa-completa.webp"],
  },
};

const stages = [
  ["Preparar", "Suelo, sustrato, drenaje y base orgánica antes de pensar en fertilización."],
  ["Establecer", "Trasplante, adaptación y desarrollo inicial sin forzar plantas estresadas."],
  ["Crecer", "Follaje, brotación y recuperación vegetativa según necesidad dominante."],
  ["Florecer / producir", "Solo cuando la especie y el objetivo realmente entran en etapa reproductiva."],
  ["Mantener", "Observación, riego, sanidad, poda y ajustes antes de repetir aplicaciones por rutina."],
] as const;

export default function WondergreenHomePage() {
  const url = `${site.url}/wondergreen/hogar/`;
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Wondergreen", url: `${site.url}/wondergreen/` },
        { name: "Wondergreen Hogar", url },
      ]} />

      <section className="home-garden-hero">
        <div className="container home-garden-grid">
          <div>
            <Link className="back-link" href="/wondergreen/">← Wondergreen</Link>
            <span className="eyebrow">Wondergreen Nutrients Hogar</span>
            <h1>Kits de cultivo para uso práctico en casa, matera y huerta urbana.</h1>
            <p className="lead">Una experiencia más simple para quien no necesita un portafolio agrícola completo, pero sí quiere entender qué hacer con su planta según objetivo, etapa y condición.</p>
            <div className="home-status">Una ruta de cuidado por objetivo, etapa y condición de la planta. El equipo orienta el producto, la presentación y el protocolo apropiados para cada caso.</div>
          </div>
          <div className="home-garden-visual" aria-hidden="true"><div className="home-pot"><span></span><i></i><b></b></div><div className="home-soil-ring">suelo</div><div className="home-care-ring">cuidado</div></div>
        </div>
      </section>

      <section className="knowledge-section">
        <div className="container"><div className="section-heading"><span className="eyebrow">Primero la planta</span><h2>Cinco momentos para leer el cultivo en casa.</h2></div><div className="home-stage-track">{stages.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
      </section>

      <section className="knowledge-section knowledge-section--soft">
        <div className="container"><div className="section-heading"><span className="eyebrow">Familias Hogar</span><h2>Elegir por necesidad, no por nombre de producto.</h2><p>Estas cuatro familias organizan el cuidado doméstico en una secuencia comprensible: suelo, crecimiento, equilibrio y floración o producción.</p></div><div className="home-kit-grid">{homeKitFamilies.map((kit, index) => <article key={kit.name}><span>{String(index + 1).padStart(2,"0")}</span><h3>{kit.name}</h3><p>{kit.use}</p><small>{kit.state}</small></article>)}</div></div>
      </section>

      <section className="home-learning-band">
        <div className="container home-learning-grid">
          <div><span className="eyebrow eyebrow--light">Más que un kit</span><h2>Suelo, nutrición, microbiología y circularidad deben explicarse juntos.</h2></div>
          <div className="home-learning-list"><div><strong>Suelo vivo</strong><span>Materia orgánica, estructura, raíces y agua como punto de partida.</span></div><div><strong>Nutrición por etapa</strong><span>La planta no demanda lo mismo durante establecimiento, crecimiento y producción.</span></div><div><strong>Biología</strong><span>Los bioinsumos se presentan como complemento de sistemas bien diagnosticados.</span></div><div><strong>Economía circular</strong><span>Conectar el cuidado de la planta con el aprovechamiento responsable de recursos orgánicos.</span></div></div>
        </div>
      </section>

      <section className="knowledge-section">
        <div className="container split-knowledge"><div><span className="eyebrow">Huertas</span><h2>Casa, comunidad y educación requieren una ruta diferente al agro profesional.</h2></div><div><p>Para huertas urbanas, escolares o comunitarias priorizamos preparación del suelo, establecimiento, observación, manejo seguro y selección simple por objetivo. En contextos educativos, la relación comercial y técnica se dirige a la institución o responsable adulto.</p><div className="button-row"><Link className="button button--primary" href="/biblioteca/huertas/">Abrir guía de huertas</Link><Link className="button button--ghost" href="/contacto/">Consultar proyecto</Link></div></div></div>
      </section>

      <section className="knowledge-source-band"><div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Acompañamiento Hogar</span><h2>Una recomendación simple también puede tener buen criterio.</h2></div><div><p>La orientación considera especie, etapa, luz, riego, drenaje, tamaño de matera y objetivo de cuidado. Para seleccionar una presentación o programa, el equipo Wondergreen acompaña la decisión.</p><Link href="/contacto/?interes=wondergreen-hogar">Hablar con el equipo →</Link></div></div></section>
    </>
  );
}
