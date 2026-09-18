import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guías Casa & Jardín | Wondergreen",
  description: "Guías prácticas Wondergreen para observar, preparar, trasplantar, reconocer etapas y acompañar una huerta doméstica.",
  alternates: { canonical: "/casa-jardin/guias/" },
  openGraph: {
    title: "Guías Casa & Jardín | Wondergreen",
    description: "Guías prácticas Wondergreen para observar, preparar, trasplantar, reconocer etapas y acompañar una huerta doméstica.",
    url: "/casa-jardin/guias/",
    images: ["/guides/home-garden-casa-jardin-cover.webp"],
  },
};

const guides = [
  { title: "Guía Casa & Jardín", copy: "El método completo para observar, identificar, elegir, aplicar y revisar.", use: "Para entender el sistema completo antes de intervenir.", pages: "12 páginas", image: "/guides/home-garden-casa-jardin-cover.webp", pdf: "/downloads/guia-casa-jardin.pdf" },
  { title: "Guía rápida de etapas", copy: "Reconoce el momento de la planta antes de elegir una línea.", use: "Para una consulta rápida junto a la planta.", pages: "5 páginas", image: "/guides/home-garden-etapas-cover.webp", pdf: "/downloads/guia-rapida-etapas.pdf" },
  { title: "Guía de trasplante", copy: "Drenaje, raíces, sustrato y estabilidad antes de decidir nutrición.", use: "Para preparar una nueva etapa sin improvisar.", pages: "8 páginas", image: "/guides/home-garden-trasplante-cover.webp", pdf: "/downloads/guia-trasplante.pdf" },
  { title: "Guía Mi Huerta", copy: "Una secuencia doméstica: prepara, crece, florece y fructifica.", use: "Para acompañar una huerta desde el sustrato hasta el fruto.", pages: "8 páginas", image: "/guides/home-garden-mi-huerta-cover.webp", pdf: "/downloads/guia-mi-huerta.pdf" },
] as const;

export default function CasaJardinGuiasPage() {
  return (
    <div className="homegarden-public-subpage">
      <section className="homegarden-subpage-hero"><div className="container homegarden-subpage-hero__grid"><div><Link className="back-link" href="/casa-jardin/">← Volver a Casa & Jardín</Link><span className="eyebrow eyebrow--light">Wondergreen · biblioteca práctica</span><h1>Aprender también es una forma de cuidar.</h1><p className="lead">Estas guías convierten el sistema Wondergreen en decisiones observables: qué mirar, qué revisar primero y cuándo tiene sentido pasar de una etapa a otra.</p><div className="button-row"><a className="button button--light" href="#guias">Ver guías PDF</a><Link className="button button--outline-light" href="/casa-jardin/productos/">Ver productos</Link></div></div><figure className="homegarden-subpage-hero__visual"><Image src="/guides/home-garden-casa-jardin-cover.webp" alt="Portada de la guía Wondergreen Casa y Jardín" fill priority sizes="(max-width: 850px) 100vw, 40vw" /><figcaption>WEB = CONTEXTO · PDF = DOCUMENTO COMPLETO</figcaption></figure></div></section>
      <section className="homegarden-public-section" id="guias"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Biblioteca de descarga</span><h2>Cuatro guías para cuatro decisiones distintas.</h2></div><p>La página ayuda a descubrir y elegir el material. Al abrir una tarjeta accedes al PDF completo, sin sustituirlo por extractos ni promesas de aplicación.</p></div><div className="homegarden-guide-grid">{guides.map(({ title, copy, use, pages, image, pdf }, index) => <article className="homegarden-guide-card" key={title}><a href={pdf} download aria-label={`Descargar ${title}`}><Image src={image} alt={`Portada: ${title}`} fill sizes="(max-width: 760px) 100vw, 25vw" /></a><div><div className="homegarden-guide-card__meta"><span>Guía 0{index + 1}</span><span>{pages} · PDF completo</span></div><h3>{title}</h3><p>{copy}</p><p className="homegarden-guide-card__use">{use}</p><a className="text-link" href={pdf} download>Descargar PDF <span aria-hidden="true">↓</span></a></div></article>)}</div></div></section>
      <section className="homegarden-public-section homegarden-public-section--soft"><div className="container homegarden-public-callout"><div><span className="eyebrow">Regla común</span><h2>Observa. Identifica. Elige. Aplica. Revisa.</h2></div><p>La guía acompaña la decisión, pero la etiqueta vigente y la recomendación técnica siguen definiendo dosis, frecuencia y vía de aplicación.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Usar orientador</Link><Link className="button button--ghost" href="/biblioteca/">Abrir biblioteca Greenatics</Link></div></div></section>
    </div>
  );
}
