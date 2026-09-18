import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Productos por etapa | Wondergreen Casa & Jardín",
  description: "Explora Wondergreen por suelo, crecimiento, equilibrio, floración y fructificación, con rutas de cuidado y orientación doméstica por etapa.",
  alternates: { canonical: "/casa-jardin/productos/" },
  openGraph: {
    title: "Productos por etapa | Wondergreen Casa & Jardín",
    description: "Explora Wondergreen por suelo, crecimiento, equilibrio, floración y fructificación, con rutas de cuidado y orientación doméstica por etapa.",
    url: "/casa-jardin/productos/",
    images: ["/products/wondergreen-casa-jardin-hero.png"],
  },
};

const products = [
  ["COMPOST", "La base del sistema", "Materia orgánica y acondicionamiento del sustrato antes de pensar en la siguiente etapa.", "/products/wondergreen-system-stages.webp", "Preparar el suelo", "/wondergreen/"],
  ["CRECE", "2GROW · 15-3-3", "Acompaña crecimiento, brotación y recuperación vegetativa cuando la planta está activa.", "/products/wondergreen-2grow.webp", "Leer la etapa", "/wondergreen/productos/2grow/"],
  ["EQUILIBRA", "2BALANCE · 7-7-7", "Nutrición balanceada y mantenimiento para plantas que ya están estables.", "/products/wondergreen-2balance.webp", "Sostener la planta", "/wondergreen/productos/2balance/"],
  ["FLORECE", "2BLOOM · 3-8-3", "Acompaña la transición reproductiva y la floración sin convertir la nutrición en una promesa.", "/products/wondergreen-2bloom.webp", "Leer la transición", "/wondergreen/productos/2bloom/"],
  ["FRUCTIFICA", "2FRUIT · 3-3-8", "Se orienta a cuajado, desarrollo y llenado de fruto dentro de una estrategia de manejo completa.", "/products/wondergreen-2fruit.webp", "Leer la etapa productiva", "/wondergreen/productos/2fruit/"],
] as const;

export default function CasaJardinProductosPage() {
  return (
    <div className="homegarden-public-subpage">
      <section className="homegarden-subpage-hero">
        <div className="container homegarden-subpage-hero__grid">
          <div>
            <Link className="back-link" href="/casa-jardin/">← Volver a Casa & Jardín</Link>
            <span className="eyebrow eyebrow--light">Wondergreen · productos por etapa</span>
            <h1>Primero la etapa. Después la referencia.</h1>
            <p className="lead">El catálogo organiza cinco entradas para que puedas leer qué papel cumple cada línea antes de pensar en dosis o frecuencia. Si la condición de la planta no está clara, el orientador sigue siendo la puerta correcta.</p>
            <div className="button-row"><a className="button button--light" href="#catalogo">Explorar productos</a><Link className="button button--outline-light" href="/casa-jardin/#diagnostico">Usar orientador</Link></div>
          </div>
          <figure className="homegarden-subpage-hero__visual"><Image src="/products/wondergreen-casa-jardin-hero.png" alt="Sistema Wondergreen Casa y Jardín organizado por suelo y cuatro etapas" fill priority sizes="(max-width: 850px) 100vw, 40vw" /><figcaption>COMPOST · CRECE · EQUILIBRA · FLORECE · FRUCTIFICA</figcaption></figure>
        </div>
      </section>

      <section className="homegarden-public-section" id="catalogo">
        <div className="container">
          <div className="wg-v4-heading"><div><span className="eyebrow">Catálogo por etapa</span><h2>Una línea cumple una función dentro del ciclo.</h2></div><p>Las fichas explican el papel de cada línea y ayudan a elegir el siguiente paso. La dosis, la frecuencia y la presentación se recomiendan según el cultivo, el volumen de sustrato, la condición de la planta y la etiqueta vigente.</p></div>
          <div className="homegarden-product-grid">
            {products.map(([name, label, copy, image, prompt, href], index) => <article className="homegarden-product-card" key={name}>
              <div className="homegarden-product-card__media">{image ? <Image src={image} alt={`Ficha visual ${name} Wondergreen`} fill sizes="(max-width: 760px) 100vw, 20vw" /> : <div><span>01</span><strong>Suelo<br />primero.</strong><small>COMPOST</small></div>}</div>
              <div className="homegarden-product-card__body"><span className="homegarden-product-card__number">{String(index + 1).padStart(2, "0")} · {label}</span><h3>{name}</h3><p>{copy}</p><Link href={href}>{prompt} <span aria-hidden="true">→</span></Link></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="homegarden-public-section homegarden-public-section--soft"><div className="container homegarden-public-callout"><div><span className="eyebrow">Regla de decisión</span><h2>Una etapa orienta; la condición confirma.</h2></div><p>Agua, drenaje, raíces, luz, sanidad, tamaño del recipiente y estado general importan tanto como la fórmula. Por eso no publicamos una dosis universal ni convertimos una imagen de síntoma en diagnóstico.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Revisar mi planta</Link><Link className="button button--ghost" href="/casa-jardin/kits/">Ver kits por uso</Link></div></div></section>
    </div>
  );
}
