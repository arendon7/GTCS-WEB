import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { CasaJardinV4Review } from "@/components/casa-jardin-v4-review";
import { casaJardinKits } from "@/data/casa-jardin-detail";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Kits por uso | Wondergreen Casa & Jardín",
  description: "Kits Wondergreen para plantas verdes, plantas con flor, huertas y colecciones, con rutas de cuidado y etapas claramente separadas.",
  alternates: { canonical: "/casa-jardin/kits/" },
  openGraph: {
    title: "Kits por uso | Wondergreen Casa & Jardín",
    description: "Kits Wondergreen para plantas verdes, plantas con flor, huertas y colecciones, con rutas de cuidado y etapas claramente separadas.",
    url: "/casa-jardin/kits/",
  },
};

const kitTone = (composition: readonly string[]) => composition.length > 2 ? "completo" : ({ CRECE: "2grow", EQUILIBRA: "2balance", COMPOST: "compost" }[composition[0].split(" · ")[0]] ?? "completo");

export default function CasaJardinKitsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` }, { name: "Kits por uso", url: `${site.url}/casa-jardin/kits/` }]} />
      <div className="homegarden-public-subpage">
      <section className="homegarden-subpage-hero">
        <div className="container homegarden-subpage-hero__grid">
          <div><Link className="back-link" href="/casa-jardin/">← Volver a Casa & Jardín</Link><span className="eyebrow eyebrow--light">Wondergreen · kits por uso</span><h1>Kits para empezar, cuidar y cultivar.</h1><p className="lead">Revisa nueve propuestas nuevas y las cinco composiciones que ya estaban documentadas en el sitio. Las configuraciones V4 se presentan para revisión; sus componentes, cantidades, empaques y disponibilidad aún requieren confirmación.</p><div className="button-row"><a className="button button--light" href="#kits-v4">Ver propuestas nuevas</a><a className="button button--outline-light" href="#kits">Composiciones documentadas</a></div></div>
          <div className="homegarden-subpage-hero__visual homegarden-product-family-map homegarden-product-family-map--kits"><span>KITS WONDERGREEN · CASA & JARDÍN</span><strong>Una ruta<br />por contexto.</strong><p>Composición orientativa. Cada planta entra por su etapa; no se aplican todas las referencias a la vez.</p></div>
        </div>
      </section>
      <CasaJardinV4Review />
      <section className="homegarden-public-section" id="kits"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Composiciones documentadas</span><h2>Las rutas que ya estaban en el sitio.</h2></div><p>Estas cinco fichas permanecen como referencia de la versión anterior mientras se revisan las nuevas matrices y sus condiciones.</p></div><div className="homegarden-kit-grid">{casaJardinKits.map((kit, index) => <article className={`homegarden-kit-card homegarden-kit-card--${kitTone(kit.composition)}`} key={kit.slug}><Link className="homegarden-kit-card__media" href={`/casa-jardin/kits/${kit.slug}/`} aria-label={`Ver el kit ${kit.name}`}><Image src={kit.image} alt={`Composición visual del kit de cultivo ${kit.name} de Wondergreen`} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" /></Link><div className="homegarden-kit-card__body"><span className="homegarden-product-card__number">0{index + 1} · RUTA DE CUIDADO</span><small>{kit.audience}</small><h3>{kit.name}</h3><strong>{kit.promise}</strong><p>{kit.composition.map((item) => item.split(" · ")[0]).join(" + ")}</p><Link className="homegarden-kit-card__link" href={`/casa-jardin/kits/${kit.slug}/`}>Ver composición y uso <span aria-hidden="true">→</span></Link></div></article>)}</div></div></section>
      <section className="homegarden-public-section homegarden-public-section--soft"><div className="container homegarden-public-callout"><div><span className="eyebrow">¿Todavía no sabes cuál encaja?</span><h2>La orientación entra cuando hay una duda real.</h2></div><p>Si no está clara la etapa o la planta muestra encharcamiento, daño radicular, estrés severo o señales sanitarias, primero revisa la causa.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Usar orientador</Link><Link className="button button--ghost" href="/casa-jardin/guias/">Abrir guías</Link></div></div></section>
      </div>
    </>
  );
}
