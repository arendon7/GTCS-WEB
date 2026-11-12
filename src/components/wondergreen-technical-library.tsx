import Image from "next/image";
import Link from "next/link";

const documents: {
  title: string;
  kicker: string;
  description: string;
  image?: string;
  imageAlt?: string;
  href: string;
  pdf?: string;
  action: string;
  note?: string;
  pdfAction?: string;
}[] = [
  {
    title: "Ficha técnica · Biol Wondergreen",
    kicker: "Ficha técnica · 2 páginas",
    description: "Fertilizante líquido con actividad biológica. Incluye presentaciones de 1 L a 1000 L, usos documentados, composición analítica y condiciones de almacenamiento.",
    image: "/guides/ficha-biol-cover.png",
    imageAlt: "Portada de la ficha técnica del Biol Wondergreen",
    href: "/wondergreen/productos/biol/",
    pdf: "/downloads/ficha-tecnica-biol-wondergreen.pdf",
    action: "Abrir ficha web",
  },
  {
    title: "Catálogo técnico-comercial Wondergreen",
    kicker: "Edición PDF · agosto de 2026",
    description: "Edición de agosto de 2026 para consultar el portafolio. Para confirmar nombres, concentraciones y presentaciones vigentes, consulta el catálogo web.",
    image: "/guides/catalogo-cover-hd.png",
    imageAlt: "Portada del catálogo técnico-comercial Wondergreen",
    href: "/biblioteca/catalogo-wondergreen/",
    pdf: "/downloads/CATALOGO_WONDERGREEN_AGOSTO_2026.pdf",
    action: "Abrir catálogo web vigente",
    pdfAction: "Consultar PDF · agosto 2026 ↗"
  },
  {
    title: "Ciencia aplicada · suelo y bioles",
    kicker: "Contexto técnico · suelo y bioles",
    description: "Una lectura sobre cómo se relacionan materia orgánica, microbiología, organominerales y bioles, y cómo interpretar las cifras según el contexto.",
    href: "/wondergreen/ciencia/",
    action: "Leer ciencia aplicada",
    note: "Las cifras ofrecen contexto; la respuesta depende del cultivo y las condiciones de manejo."
  }
];

export function WondergreenTechnicalLibrary() {
  return (
    <section className="wg-docs" id="documentos" aria-labelledby="wg-docs-title">
      <div className="wg-docs__heading">
        <div>
          <span className="eyebrow">Biblioteca Wondergreen</span>
          <h3 id="wg-docs-title">Fichas y documentos para decidir con contexto.</h3>
        </div>
        <p>
          El directorio del ICA registra a Greenatics S.A.S. como productor en Yarumal de fertilizantes
          inorgánicos sólidos (mezclas físicas) y acondicionadores inorgánicos sólidos para suelos.
          Este registro empresarial no equivale al registro de venta de cada producto ni acredita por sí
          solo otras formulaciones. Consulta la ficha y etiqueta vigente de cada referencia.{' '}
          <a href="https://www.ica.gov.co/getdoc/90935cf8-c4c1-4093-85ad-5ad06fbfda5d/base_de_datos_empresas.aspx" target="_blank" rel="noreferrer">Ver directorio del ICA ↗</a>
        </p>
      </div>
      <div className="wg-docs__grid">
        {documents.map((document) => (
          <article key={document.title} className={document.image ? undefined : "wg-docs__article--reading"}>
            {document.image ? <div className="wg-docs__media"><Image src={document.image} alt={document.imageAlt ?? ""} fill sizes="(max-width: 760px) 100vw, 25vw" /></div> : null}
            <div className="wg-docs__body">
              <span>{document.kicker}</span>
              <h4>{document.title}</h4>
              <p>{document.description}</p>
              {document.note ? <small>{document.note}</small> : null}
              <div className="wg-docs__actions">
                <Link href={document.href}>{document.action} →</Link>
                {document.pdf ? <a href={document.pdf} target="_blank" rel="noreferrer">{document.pdfAction ?? "Descargar PDF ↗"}</a> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
