import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";
import "./care-reading.css";

export const metadata: Metadata = {
  title: "Guías Casa & Jardín | Wondergreen",
  description: "Guías y recursos para reconocer etapas, revisar el sustrato, trasplantar y acompañar una huerta doméstica.",
  alternates: { canonical: "/casa-jardin/guias/" },
  openGraph: {
    title: "Guías Casa & Jardín | Wondergreen",
    description: "Encuentra una guía para el cuidado de tus plantas, flores y huertas.",
    url: "/casa-jardin/guias/",
    images: ["/products/wondergreen-soil-roots-editorial-og.jpg"],
  },
};

const guides = [
  {
    title: "Guía Casa & Jardín",
    question: "¿Qué reviso antes de nutrir?",
    copy: "Compara una planta activa, un trasplante reciente y señales de encharcamiento. Observa humedad, drenaje y raíces antes de decidir el siguiente paso.",
    illustrations: [
      { src: "/guides/casa-observar-activa.jpg", alt: "Ilustración de una planta activa en una matera" },
      { src: "/guides/casa-observar-revisar.jpg", alt: "Ilustración de una planta recién trasplantada para observar antes de nutrir" },
      { src: "/guides/casa-observar-detener.jpg", alt: "Ilustración de una planta con señales de encharcamiento que invitan a revisar el drenaje" },
    ],
    pdf: "/casa-jardin/guias/#observar",
    downloadLabel: "Leer la guía de observación",
  },
  {
    title: "Guía rápida de etapas",
    question: "¿En qué etapa está mi planta?",
    copy: "Reconoce CRECE, EQUILIBRA, FLORECE y FRUCTIFICA. La etapa orienta la referencia; la especie y el estado de la planta completan la decisión.",
    image: "/guides/casa-guia-etapas.jpg",
    alt: "Ilustraciones de una planta en crecimiento, una planta de hojas, una planta en flor y una planta con frutos",
    pdf: "/downloads/guia-rapida-etapas.pdf",
    downloadLabel: "Descargar PDF · etapas",
  },
  {
    title: "Guía de trasplante",
    question: "¿Cómo preparo el cambio de matera?",
    copy: "Revisa el cepellón, la humedad, el drenaje y el tamaño del recipiente. Después del cambio, observa cómo se estabiliza la planta.",
    image: "/guides/casa-transplante-planting-detail.jpg",
    alt: "Una planta retirada con su cepellón junto a una matera limpia, lista para trasplantar",
    pdf: "/casa-jardin/guias/#trasplantar",
    downloadLabel: "Leer la guía de trasplante",
  },
  {
    title: "Guía Mi Huerta",
    question: "¿Qué ruta sigue mi aromática u hortaliza?",
    copy: "Prepara el sustrato y acompaña aromáticas de hoja o cultivos de fruto según su ciclo. No toda huerta llega a FRUCTIFICA.",
    image: "/guides/casa-hierbas-editorial.jpg",
    alt: "Materas de albahaca, cilantro, perejil, tomillo y romero en una huerta doméstica",
    pdf: "/biblioteca/huertas/",
    downloadLabel: "Consultar la guía web · Mi Huerta",
  },
] as const;

export default function CasaJardinGuiasPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` }, { name: "Guías", url: `${site.url}/casa-jardin/guias/` }]} />
      <div className="homegarden-public-subpage homegarden-public-subpage--guides">
        <section className="homegarden-subpage-hero">
          <div className="container homegarden-subpage-hero__grid homegarden-subpage-hero__grid--text-only">
            <div><Link className="back-link" href="/casa-jardin/">← Volver a Casa & Jardín</Link><h1>Guías para entender qué necesita tu planta.</h1><p className="lead">Observa la etapa, revisa sustrato y raíces y elige una ruta de cuidado. Aquí encontrarás recursos para materas, aromáticas y huertas domésticas, con ilustraciones y pasos legibles en la página.</p><div className="button-row"><a className="button button--light" href="#guias">Elegir una guía</a><Link className="button button--outline-light" href="/casa-jardin/productos/">Ver productos</Link></div></div>
          </div>
        </section>
        <section className="homegarden-public-section" id="guias">
          <div className="container"><div className="wg-v4-heading"><div><h2>Elige la guía por lo que necesitas resolver.</h2></div><p>Lee las guías de observación, trasplante y huerta en la web. La guía rápida de etapas también está disponible en PDF.</p></div>
            <div className="homegarden-guide-grid">{guides.map((guide) => <article className={`homegarden-guide-card${"illustrations" in guide ? " homegarden-guide-card--observation" : guide.title === "Guía rápida de etapas" ? " homegarden-guide-card--stages" : ""}`} key={guide.title}><figure>{"illustrations" in guide ? <div className="homegarden-guide-card__comparison">{guide.illustrations.map((illustration) => <Image key={illustration.src} src={illustration.src} alt={illustration.alt} width={440} height={400} sizes="(max-width: 760px) 33vw, 20vw" />)}</div> : <Image src={guide.image} alt={guide.alt} fill sizes="(max-width: 760px) 100vw, 25vw" />}</figure><div><h3>{guide.title}</h3><p className="homegarden-guide-card__question">{guide.question}</p><p>{guide.copy}</p><a className="text-link" href={guide.pdf} download={guide.pdf.endsWith(".pdf") || undefined}>{guide.downloadLabel} <span aria-hidden="true">{guide.pdf.endsWith(".pdf") ? "↓" : "→"}</span></a></div></article>)}</div>
          </div>
        </section>

        <section className="care-reading" id="observar" aria-labelledby="care-observation-heading">
          <div className="container">
            <div className="care-reading__heading">
              <h2 id="care-observation-heading">Antes de nutrir, entiende cómo está tu planta.</h2>
              <p>La etapa ayuda a elegir una referencia. El estado de las raíces, la humedad y el drenaje ayudan a decidir si es momento de usarla.</p>
            </div>
            <div className="care-reading__states">
              <div><h3>Está activa y tiene buen drenaje</h3><p>Busca brotes nuevos, follaje estable y un sustrato con humedad adecuada. Distingue crecimiento, mantenimiento, floración o formación de fruto; no todas las especies pasan por las cuatro etapas.</p><Link className="text-link" href="/casa-jardin/productos/">Comparar referencias por etapa →</Link></div>
              <div><h3>Acaba de cambiar de matera</h3><p>Después de un trasplante, observa cómo se establece antes de fertilizar. Revisa si el sustrato está demasiado seco, si hay estrés o si las señales todavía no son claras.</p><a className="text-link" href="#trasplantar">Leer la guía de trasplante →</a></div>
              <div><h3>Hay encharcamiento o raíces comprometidas</h3><p>No intentes resolver la pudrición, una enfermedad o la marchitez severa con más fertilizante. Primero revisa la causa: agua, raíces y sanidad pueden necesitar atención distinta.</p><Link className="text-link" href="/casa-jardin/#diagnostico">Ordenar lo que observo →</Link></div>
            </div>
            <aside className="care-reading__note"><h3>Una referencia por necesidad, no todo el kit junto.</h3><p>Evita aplicar por rutina, concentrar el producto contra el tallo o fertilizar sobre sustrato extremadamente seco. La etiqueta vigente define dosis y frecuencia; el orientador ayuda a ordenar señales, no a diagnosticar enfermedades.</p></aside>
          </div>
        </section>
        <section className="care-reading care-reading--soft" id="trasplantar" aria-labelledby="care-transplant-heading">
          <div className="container care-reading__transplant">
            <div className="care-reading__intro">
              <h2 id="care-transplant-heading">Un cambio de matera empieza por las raíces.</h2>
              <p>Prepara el recipiente y el sustrato antes de mover la planta. El objetivo inmediato es un establecimiento cuidadoso, no adelantar una aplicación de fertilizante.</p>
              <figure><Image src="/guides/casa-transplante-planting-detail.jpg" alt="Cepellón de una planta junto a una matera limpia preparada para el trasplante" width={900} height={700} sizes="(max-width: 760px) 90vw, 420px" /><figcaption>El cepellón, el recipiente y el drenaje se revisan antes del cambio.</figcaption></figure>
            </div>
            <div className="care-reading__steps">
              <h3>Revisa el cepellón y el recipiente</h3><p>Observa el estado de las raíces y la humedad del cepellón. Elige el tamaño de matera según la planta y comprueba que el agua pueda salir: un recipiente sin drenaje necesita resolverse antes de continuar.</p>
              <h3>Prepara una mezcla adecuada</h3><p>El sustrato debe permitir revisar humedad y drenaje. La proporción depende del sustrato, la planta y las condiciones de cultivo; no hay una mezcla universal para todas las materas. El compost aporta materia orgánica, pero no sustituye por sí solo toda la nutrición.</p>
              <h3>Acomoda la planta con cuidado</h3><p>Coloca el cepellón en el recipiente preparado y completa el espacio con sustrato, cuidando las raíces y el tallo. Revisa la humedad durante el establecimiento y evita dejar agua acumulada.</p>
              <h3>Observa antes de volver a nutrir</h3><p>Comprueba cómo responde después del cambio. Si hay estrés, encharcamiento o señales poco claras, revisa primero agua, raíces y sanidad. Cuando esté estable, vuelve a identificar su etapa y consulta la etiqueta de la referencia elegida.</p>
              <div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Revisar el estado de mi planta</Link><Link className="text-link" href="/casa-jardin/productos/compost/">Conocer el papel del compost →</Link></div>
            </div>
          </div>
        </section>
        <section className="homegarden-public-section homegarden-public-section--soft"><div className="container homegarden-public-callout"><div><h2>De la observación a una referencia.</h2></div><p>Compara productos por etapa o usa el orientador para ordenar lo que observas. Consulta la etiqueta vigente para dosis y frecuencia.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Abrir orientador</Link><Link className="button button--ghost" href="/casa-jardin/kits/">Explorar kits por uso</Link></div></div></section>
      </div>
    </>
  );
}
