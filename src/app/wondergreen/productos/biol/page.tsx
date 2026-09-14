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
    description: "Fertilizante líquido con actividad biológica y composición analítica documentada en ficha consultada de abril de 2024.",
    url: productUrl,
    brand: { "@type": "Brand", name: "Wondergreen Nutrients" },
    category: "Fertilizante líquido",
    sku: "biol",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Presentaciones documentadas", value: presentations.join(", ") },
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
            <span className="eyebrow eyebrow--light">Wondergreen · ficha técnica consultada</span>
            <h1>Biol: materia orgánica y nutrientes en una referencia líquida.</h1>
            <p className="lead">Una ficha de producto sirve para entender qué está documentado, cómo se presenta y qué debe revisarse antes de aplicar. Aquí organizamos el contenido técnico del documento fuente sin convertirlo en una receta universal.</p>
            <div className="button-row"><a className="button button--light" href="/downloads/ficha-tecnica-biol-wondergreen.pdf" target="_blank" rel="noreferrer">Descargar ficha PDF</a><Link className="button button--outline-light" href="/contacto/?interes=wondergreen&perfil=agro&diagnostico=Biol%20Wondergreen">Consultar al equipo</Link></div>
          </div>
          <figure className="wg-biol-hero__visual"><Image src="/guides/ficha-biol-cover.png" alt="Portada de la ficha técnica de Biol Wondergreen" fill priority sizes="(max-width: 800px) 100vw, 34vw" /><figcaption><strong>Ficha técnica · abril de 2024</strong><span>Documento fuente para orientar la presentación, el programa de uso y el acompañamiento agronómico.</span></figcaption></figure>
        </div>
      </section>

      <section className="wg-biol-intro"><div className="container wg-biol-intro__grid"><div><span className="eyebrow">Qué dice la ficha</span><h2>Un fertilizante líquido con actividad biológica para integrar a un programa de cultivo.</h2></div><div><p>El documento describe una referencia líquida para fertirriego y uso edáfico, con aporte de carbono orgánico, nutrientes y una fracción asociada a actividad biológica. Su valor está en aportar información para decidir mejor, no en reemplazar el diagnóstico del lote.</p><p className="wg-biol-callout"><strong>Marco correcto:</strong> la ficha menciona actividad biológica y microorganismos, pero esta página no publica una concentración microbiológica garantizada ni presenta el producto como inoculante sin una caracterización vigente.</p></div></div></section>

      <section className="wg-biol-use"><div className="container wg-biol-use__grid"><div><span className="eyebrow eyebrow--light">Uso documentado</span><h2>Una referencia clara para iniciar la conversación técnica.</h2><p>La ficha consultada indica <strong>1 L en 100 L de agua</strong> para fertirrigación y uso edáfico en todas las etapas del cultivo. Este dato se conserva como uso documentado del soporte consultado; no se extiende automáticamente a todos los cultivos, vías, mezclas o condiciones.</p><div className="wg-biol-use__note"><strong>Antes de convertirlo en dosis:</strong><span>confirmar etiqueta vigente, cultivo, vía, frecuencia, calidad del agua y recomendación técnica.</span></div></div><div className="wg-biol-use__facts"><div><span>01</span><strong>Presentaciones</strong><p>Desde 1 L hasta 1.000 L para distintos tamaños de operación.</p></div><div><span>02</span><strong>Almacenamiento</strong><p>Conservar por debajo de 30 °C, protegido de la humedad, según la ficha consultada.</p></div><div><span>03</span><strong>Preparación</strong><p>Agitar antes de usar y verificar que no exista separación de fases.</p></div></div></div></section>

      <section className="wg-biol-analysis"><div className="container"><div className="wg-biol-section-heading"><div><span className="eyebrow">Composición analítica</span><h2>Los números hacen visible qué contiene la referencia.</h2></div><p>Valores transcritos de la segunda página de la ficha consultada. No sustituyen un análisis del lote ni una ficha actualizada.</p></div><div className="wg-biol-analysis__table">{analysis.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</div></div></section>

      <section className="wg-biol-presentations"><div className="container wg-biol-presentations__grid"><div><span className="eyebrow">Escala de suministro</span><h2>El mismo lenguaje técnico puede acompañar distintas operaciones.</h2><p>Las presentaciones documentadas permiten atender desde aplicaciones puntuales hasta operaciones de mayor escala. La cotización coordina inventario, logística y volumen de suministro.</p></div><div className="wg-biol-pills">{presentations.map((item) => <span key={item}>{item}</span>)}</div></div></section>

      <section className="wg-biol-checks"><div className="container"><div className="wg-biol-section-heading wg-biol-section-heading--light"><div><span className="eyebrow eyebrow--light">Del documento a la decisión</span><h2>La ficha abre la conversación. El lote define el programa.</h2></div><p>Esta es la información que debemos cruzar antes de convertir una referencia documental en orientación aplicada.</p></div><div className="wg-biol-checks__grid">{checks.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Siguiente paso</span><h2>¿Quieres revisar si Biol tiene sentido dentro de tu programa?</h2></div><div className="button-row"><Link className="button button--dark" href="/wondergreen/analisis-suelo/">Preparar el contexto</Link><Link className="button button--ghost" href="/wondergreen/compatibilidad/">Revisar compatibilidad</Link><Link className="button button--ghost" href="/wondergreen/">Volver al portafolio</Link></div></div></section>
    </>
  );
}
