import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { portfolioGroups } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Portafolio Greenatics 2.0",
  description: "Territorio, valorización, Wondergreen, clima, datos y operación digital en un portafolio conectado.",
  alternates: { canonical: "/portafolio/" },
};

export default function PortfolioPage() {
  return (
    <>
      <section className="portfolio-v5-hero">
        <div className="container portfolio-v5-hero__grid">
          <div>
            <span className="eyebrow eyebrow--light">Greenatics 2.0 · portafolio vivo</span>
            <h1>Un mismo propósito. Cinco formas de crear valor.</h1>
            <p className="lead">Greenatics integra territorio, residuos, bioprocesos, agricultura, clima, datos y operación. Entra por el problema que hoy necesitas resolver y encuentra la combinación de productos, servicios, plataformas y acompañamiento que puede sostener tu sistema.</p>
            <div className="button-row"><Link className="button button--light" href="/diagnostico/">Encontrar mi punto de entrada</Link><Link className="button button--outline-light" href="/contacto/">Hablar con el equipo</Link></div>
          </div>
          <figure><Image src="/projects/tamesis/reactor-uasb.jpeg" alt="Reactor anaerobio UASB del sistema de Támesis" fill priority sizes="(max-width: 900px) 100vw, 46vw" /><figcaption><strong>Del residuo al sistema.</strong><span>Materia, energía, producto, datos y territorio conectados.</span></figcaption></figure>
        </div>
      </section>

      <section className="portfolio-v5-principle"><div className="container portfolio-v5-principle__inner"><span className="eyebrow">Cómo leerlo</span><h2>No mostramos una lista infinita. Mostramos puertas de entrada que abren sistemas completos.</h2><p>Una planta puede llevar a dirección técnica y OPS. Un diagnóstico de huella puede abrir una ruta de reducción. Un producto Wondergreen puede convertirse en un programa de cultivo. La primera compra resuelve una necesidad; la relación crece cuando la evidencia muestra el siguiente paso.</p></div></section>

      <section className="portfolio-v5-groups"><div className="container"><div className="portfolio-v5-heading"><div><span className="eyebrow">Cinco líneas conectadas</span><h2>Elige el sistema que más se parece a tu necesidad.</h2></div><p>Cada línea contiene ofertas concretas, activos visuales, evidencia, herramientas y rutas de implementación. Las páginas internas explican qué incluye cada una y desde dónde se accede.</p></div><div className="portfolio-v5-group-grid">{portfolioGroups.map((group, index) => <article key={group.slug} className={`portfolio-v5-group-card portfolio-v5-group-card--${group.color}`}><figure><Image src={group.image} alt={group.imageAlt} fill sizes="(max-width: 760px) 100vw, 33vw" /><span>0{index + 1}</span></figure><div><span className="eyebrow">{group.eyebrow}</span><h3>{group.name}</h3><p>{group.intro}</p><Link href={`/portafolio/${group.slug}/`}>Explorar esta línea <span aria-hidden="true">→</span></Link></div></article>)}</div></div></section>

      <section className="portfolio-v5-sequence"><div className="container"><span className="eyebrow eyebrow--light">Un ciclo de valor</span><h2>Entender. Estructurar. Implementar. Medir. Valorizar.</h2><div className="portfolio-v5-sequence__track">{[["01", "Entender", "Línea base y necesidad"], ["02", "Estructurar", "Alcance y economía"], ["03", "Implementar", "Operación y adopción"], ["04", "Medir", "Datos y evidencia"], ["05", "Valorizar", "Producto, energía y aprendizaje"]].map(([number, title, copy]) => <div key={number}><span>{number}</span><strong>{title}</strong><small>{copy}</small></div>)}</div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">El siguiente paso</span><h2>Cuéntanos qué necesitas transformar y te ayudamos a encontrar la primera decisión.</h2></div><Link className="button button--dark" href="/contacto/">Comenzar conversación</Link></div></section>
    </>
  );
}
