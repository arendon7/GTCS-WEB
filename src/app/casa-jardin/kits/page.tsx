import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Kits por uso | Wondergreen Casa & Jardín",
  description: "Kits Wondergreen para plantas verdes, plantas con flor, huertas y colecciones, con rutas de cuidado y etapas claramente separadas.",
  alternates: { canonical: "/casa-jardin/kits/" },
  openGraph: {
    title: "Kits por uso | Wondergreen Casa & Jardín",
    description: "Kits Wondergreen para plantas verdes, plantas con flor, huertas y colecciones, con rutas de cuidado y etapas claramente separadas.",
    url: "/casa-jardin/kits/",
    images: ["/kits/kit-casa-completa.webp"],
  },
};

const kits = [
  { slug: "plantas-verdes", name: "Plantas Verdes", audience: "Follaje, interior y exterior", composition: "2GROW + 2BALANCE", promise: "Crece cuando lo necesita. Equilibra cuando está estable.", image: "/kits/kit-plantas-verdes.png" },
  { slug: "plantas-con-flor", name: "Plantas con Flor", audience: "Ornamentales en transición", composition: "2BALANCE + 2BLOOM", promise: "La floración se acompaña después de revisar luz, agua, edad y sanidad.", image: "/kits/kit-plantas-con-flor.png" },
  { slug: "mi-huerta", name: "Mi Huerta", audience: "Aromáticas y plantas productivas", composition: "COMPOST + CRECE + FLORECE + FRUCTIFICA", promise: "Del sustrato al fruto, con una secuencia que no significa aplicar todo al mismo tiempo.", image: "/kits/kit-mi-huerta.png" },
  { slug: "casa-completa", name: "Casa Completa", audience: "Hogares con plantas en etapas distintas", composition: "4 líneas Wondergreen · orientación 500 g", promise: "Muchas plantas pueden compartir una lógica, pero cada una entra por su momento.", image: "/kits/kit-casa-completa.webp" },
  { slug: "casa-completa-xl", name: "Casa Completa XL", audience: "Colecciones y jardines pequeños", composition: "4 líneas Wondergreen · orientación 1 kg", promise: "Una ruta de mayor volumen para jardines y necesidades recurrentes.", image: "/kits/kit-casa-completa-xl.png" },
] as const;

export default function CasaJardinKitsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` }, { name: "Kits por uso", url: `${site.url}/casa-jardin/kits/` }]} />
      <div className="homegarden-public-subpage">
      <section className="homegarden-subpage-hero">
        <div className="container homegarden-subpage-hero__grid">
          <div><Link className="back-link" href="/casa-jardin/">← Volver a Casa & Jardín</Link><span className="eyebrow eyebrow--light">Wondergreen · kits por uso</span><h1>Kits por contexto. Etapas separadas.</h1><p className="lead">Un kit organiza opciones para una necesidad concreta; no prescribe aplicaciones simultáneas. Revisa cada planta, reconoce su etapa y confirma su condición antes de decidir.</p><div className="button-row"><a className="button button--light" href="#kits">Explorar kits</a><Link className="button button--outline-light" href="/casa-jardin/productos/">Ver productos</Link></div></div>
          <figure className="homegarden-subpage-hero__visual homegarden-subpage-hero__visual--kits"><Image src="/kits/kit-casa-completa.webp" alt="Guía visual del Kit Wondergreen Casa Completa" fill priority sizes="(max-width: 850px) 100vw, 40vw" /><figcaption>RUTA DE CUIDADO · COTIZACIÓN ACOMPAÑADA</figcaption></figure>
        </div>
      </section>
      <section className="homegarden-public-section" id="kits"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Composiciones visibles</span><h2>Elige por uso. Después revisa cada etapa.</h2></div><p>Los artes visuales ayudan a reconocer la ruta de cuidado. La cotización y el acompañamiento definen presentación, disponibilidad y forma de entrega.</p></div><div className="homegarden-kit-grid">{kits.map(({ slug, name, audience, composition, promise, image }, index) => <article className="homegarden-kit-card" key={name}><Link className="homegarden-kit-card__media" href={`/casa-jardin/kits/${slug}/`} aria-label={`Ver composición de ${name}`}><Image src={image} alt={`Guía visual ${name}`} fill sizes="(max-width: 760px) 100vw, 33vw" /></Link><div className="homegarden-kit-card__body"><span className="homegarden-product-card__number">0{index + 1} · RUTA DE CUIDADO</span><small>{audience}</small><h3>{name}</h3><strong>{promise}</strong><p>{composition}</p><Link className="homegarden-kit-card__link" href={`/casa-jardin/kits/${slug}/`}>Ver composición <span aria-hidden="true">→</span></Link><span className="homegarden-kit-card__status">Disponible bajo cotización y acompañamiento</span></div></article>)}</div><div className="homegarden-public-callout homegarden-public-callout--compact"><strong>Trasplanta & Arranca se recomienda según el estado de raíz y el tipo de planta.</strong><p>El equipo define el componente radicular o bioinsumo y el protocolo de aplicación de acuerdo con el diagnóstico del caso.</p></div></div></section>
      <section className="homegarden-public-section homegarden-public-section--soft"><div className="container homegarden-public-callout"><div><span className="eyebrow">¿Todavía no sabes cuál encaja?</span><h2>La orientación entra cuando hay una duda real.</h2></div><p>Si no está clara la etapa o la planta muestra encharcamiento, daño radicular, estrés severo o señales sanitarias, primero revisa la causa.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Usar orientador</Link><Link className="button button--ghost" href="/casa-jardin/guias/">Abrir guías</Link></div></div></section>
      </div>
    </>
  );
}
