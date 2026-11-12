import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Biol Wondergreen | Ficha técnica y uso documentado",
  description: "Consulta la ficha web de Biol Wondergreen: composición analítica, presentaciones, uso documentado y condiciones de almacenamiento.",
  alternates: { canonical: "/wondergreen/productos/biol/" },
  openGraph: {
    title: "Biol Wondergreen | Ficha técnica y uso documentado",
    description: "Consulta la ficha web de Biol Wondergreen: composición analítica, presentaciones, uso documentado y condiciones de almacenamiento.",
    url: "/wondergreen/productos/biol/",
    images: ["/guides/ficha-biol-cover.png"],
  },
};

const analysis = [
  ["Carbono orgánico oxidable", "8,81 g/L"],
  ["Nitrógeno orgánico total", "0,89 g/L"],
  ["Relación C/N", "9,90"],
  ["Fósforo soluble (P₂O₅)", "0,15 g/L"],
  ["Potasio soluble (K₂O)", "4,16 g/L"],
  ["Calcio (CaO)", "1,909 g/L"],
  ["Magnesio (MgO)", "0,446 g/L"],
  ["Sodio (Na)", "0,548 g/L"],
  ["pH", "6,15"],
  ["Conductividad eléctrica", "0,26 dS/m · dilución 1:100"],
  ["Densidad", "1,02 g/mL"],
] as const;

const presentations = ["1 L", "1 galón · 3,78 L", "20 L", "200 L", "1.000 L"];

const checks = [
  ["Etiqueta y registro vigentes", "Confirmar que el documento consultado corresponde a la presentación, lote y condición regulatoria que se va a suministrar."],
  ["Objetivo del cultivo", "Leer suelo, cultivo, etapa, vía de aplicación, calidad del agua y manejo previo antes de convertir el dato en una recomendación."],
  ["Compatibilidad", "Validar mezclas, orden de incorporación y prueba previa. La ficha consultada no autoriza por sí sola una mezcla con otros productos."],
  ["Seguimiento", "Registrar la aplicación y observar respuesta radicular, nutricional y productiva antes de ajustar frecuencia o programa."],
] as const;

export default function BiolProductPage() {
  const productUrl = `${site.url}/wondergreen/productos/biol/`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: "Biol Wondergreen",
    description: "Fertilizante líquido de base biológica con carbono orgánico, nutrientes y microorganismos eficientes para integrar al manejo del suelo y el cultivo.",
    url: productUrl,
    brand: { "@type": "Brand", name: "Wondergreen Nutrients" },
    category: "Fertilizante líquido",
    sku: "biol",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Presentaciones indicadas en ficha técnica", value: presentations.join(", ") },
      { "@type": "PropertyValue", name: "Estado", value: "Ficha fuente consultada; confirmar vigencia antes de uso" },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Wondergreen", url: `${site.url}/wondergreen/` }, { name: "Biol Wondergreen", url: productUrl }]} />

      <section className="wg-biol-hero">
        <div className="container wg-biol-hero__grid">
          <div>
            <Link className="back-link back-link--light" href="/wondergreen/">← Volver a Wondergreen</Link>
            <span className="eyebrow eyebrow--light">Wondergreen · ficha técnica</span>
            <h1>Biol: materia orgánica y nutrientes en una referencia líquida.</h1>
            <p className="lead">El Biol Wondergreen integra materia orgánica, nutrientes y microorganismos eficientes en una referencia líquida producida a partir de digestión anaerobia multietapa. Está diseñado para acompañar la relación entre suelo, raíz y cultivo dentro de un programa técnico.</p>
            <div className="button-row"><a className="button button--light" href="/downloads/ficha-tecnica-biol-wondergreen.pdf" download>Descargar ficha PDF</a><Link className="button button--ghost-light" href="/contacto/?interes=wondergreen&perfil=agro&diagnostico=Biol%20Wondergreen">Consultar al equipo</Link></div>
          </div>
          <figure className="wg-biol-hero__visual"><Image src="/guides/ficha-biol-cover.png" alt="Portada de la ficha técnica de Biol Wondergreen" fill priority sizes="(max-width: 800px) 100vw, 34vw" /><figcaption><strong>Ficha técnica de Biol Wondergreen</strong><span>Presentación, composición, almacenamiento y programa de uso para integrar el biol al manejo agronómico.</span></figcaption></figure>
        </div>
      </section>

      <section className="wg-biol-intro"><div className="container"><nav className="wg-biol-index" aria-label="Secciones de la ficha de Biol"><span>En esta ficha</span><a href="#uso-documentado">Uso documentado</a><a href="#composicion">Composición</a><a href="#presentaciones">Presentaciones</a><a href="#criterios">Criterios de uso</a></nav><div className="wg-biol-intro__grid"><div><span className="eyebrow">Función del Biol</span><h2>Un fertilizante líquido bioinsumo para integrar carbono, nutrientes y actividad biológica al programa.</h2></div><div><p>El Biol Wondergreen se utiliza en fertirriego y aplicación edáfica para aportar carbono orgánico, nutrientes y microorganismos eficientes al sistema suelo-planta. Su base proviene de bioles de digestión anaerobia multietapa y su función se potencia cuando se integra con diagnóstico, manejo del cultivo y seguimiento.</p><p className="wg-biol-callout"><strong>Cómo aporta:</strong> acompaña la actividad microbiana, el aprovechamiento de nutrientes y el desarrollo radicular dentro de un programa de manejo biológico y nutricional.</p></div></div></div></section>

      <section className="wg-biol-use" id="uso-documentado"><div className="container wg-biol-use__grid"><div><span className="eyebrow eyebrow--light">Programa de uso</span><h2>Una referencia clara para integrar biología y nutrición.</h2><p>La ficha técnica establece <strong>1 L en 100 L de agua</strong> para fertirrigación y uso edáfico. Esta dilución se incorpora al programa considerando cultivo, etapa, vía, frecuencia, calidad del agua y objetivo productivo.</p><div className="wg-biol-use__note"><strong>Aplicación con criterio:</strong><span>ajusta el programa al lote, registra la respuesta y mantén las condiciones de almacenamiento y preparación.</span></div></div><div className="wg-biol-use__facts"><div><strong>Presentaciones</strong><p>La ficha técnica enumera formatos desde 1 L hasta 1.000 L; consulta el equipo para conocer el suministro aplicable a tu operación.</p></div><div><strong>Almacenamiento</strong><p>Conservar por debajo de 30 °C, protegido de la humedad.</p></div><div><strong>Preparación</strong><p>Agitar antes de usar y verificar que no exista separación de fases.</p></div></div></div></section>

      <section className="wg-biol-analysis" id="composicion"><div className="container"><div className="wg-biol-section-heading"><div><span className="eyebrow">Composición analítica</span><h2>Los números hacen visible qué contiene el Biol.</h2></div><p>La composición analítica muestra el aporte orgánico y mineral que acompaña la actividad biológica del producto.</p></div><dl className="wg-biol-analysis__table">{analysis.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></section>

      <section className="wg-biol-presentations" id="presentaciones"><div className="container wg-biol-presentations__grid"><div><span className="eyebrow">Formatos indicados en ficha técnica</span><h2>Una referencia que se adapta a distintas escalas de operación.</h2><p>La ficha consultada enumera estos formatos. El equipo confirma cuál puede suministrarse, junto con inventario y logística, para cada solicitud.</p></div><div className="wg-biol-pills">{presentations.map((item) => <span key={item}>{item}</span>)}</div></div></section>

      <section className="wg-biol-checks" id="criterios"><div className="container"><div className="wg-biol-section-heading wg-biol-section-heading--light"><div><span className="eyebrow eyebrow--light">De la ficha al programa</span><h2>La ficha abre la conversación. El lote define el programa.</h2></div><p>Esta es la información que conviene cruzar antes de convertir una formulación en orientación aplicada.</p></div><div className="wg-biol-checks__grid">{checks.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Siguiente paso</span><h2>¿Quieres revisar si Biol tiene sentido dentro de tu programa?</h2></div><div className="button-row"><Link className="button button--dark" href="/wondergreen/analisis-suelo/">Preparar el contexto</Link><Link className="button button--ghost" href="/wondergreen/compatibilidad/">Revisar compatibilidad</Link><Link className="button button--ghost" href="/wondergreen/">Volver al portafolio</Link></div></div></section>
    </>
  );
}
