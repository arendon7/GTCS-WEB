import Image from "next/image";
import Link from "next/link";

const documents = [
  {
    title: "Ficha técnica · Biol Wondergreen",
    kicker: "Documento fuente · 2 páginas",
    description: "Fertilizante líquido con actividad biológica. Incluye presentaciones de 1 L a 1000 L, usos documentados, composición analítica y condiciones de almacenamiento.",
    image: "/guides/ficha-biol-cover.png",
    href: "/wondergreen/productos/biol/",
    pdf: "/downloads/ficha-tecnica-biol-wondergreen.pdf",
    action: "Abrir ficha web",
    note: "Ficha consultada · abril de 2024"
  },
  {
    title: "Catálogo técnico-comercial Wondergreen",
    kicker: "Portafolio · Product Master",
    description: "Consulta las familias, fórmulas, etapas, presentaciones y estados comerciales del sistema Wondergreen antes de solicitar una recomendación.",
    image: "/guides/catalogo-cover-hd.png",
    href: "/biblioteca/catalogo-wondergreen/",
    pdf: "/downloads/CATALOGO_WONDERGREEN_AGOSTO_2026.pdf",
    action: "Abrir catálogo web",
    note: "Referencia editorial vigente del portafolio"
  },
  {
    title: "Rutas técnicas por cultivo",
    kicker: "Biblioteca · 12 recorridos",
    description: "Explora guías de café, cacao, aguacate, cítricos, pastos, hortalizas y pasifloras para llegar al producto con mejor contexto.",
    image: "/guides/guia-cafe-cover.webp",
    href: "/wondergreen/cultivos/",
    pdf: "/downloads/BIBLIOTECA_MANUALES_TECNICOS_WONDERGREEN_6_MANUALES_A4.pdf",
    action: "Explorar cultivos",
    note: "Etapa, observación y seguimiento"
  },
  {
    title: "Ciencia aplicada · suelo y bioles",
    kicker: "Lectura editorial · evidencia",
    description: "Una explicación de cómo se conectan materia orgánica, microbiología, organominerales y bioles, con cifras de contexto y límites de interpretación.",
    image: "/products/wondergreen-bioinsumos.webp",
    href: "/wondergreen/ciencia/",
    action: "Leer ciencia aplicada",
    note: "Literatura consultada · no es ensayo propio"
  }
];

export function WondergreenTechnicalLibrary() {
  return (
    <section className="wg-docs" id="documentos" aria-labelledby="wg-docs-title">
      <div className="wg-docs__heading">
        <div>
          <span className="eyebrow">Biblioteca Wondergreen</span>
          <h3 id="wg-docs-title">El producto se vuelve útil cuando también puedes consultar su fuente.</h3>
        </div>
        <p>Reunimos documentos de producto, catálogo y cultivo en una misma ruta. Cada pieza conserva su fecha, su propósito y el nivel de confianza que corresponde: documento fuente no significa automáticamente etiqueta vigente ni recomendación para todos los lotes.</p>
      </div>
      <div className="wg-docs__grid">
        {documents.map((document) => (
          <article key={document.title}>
            <div className="wg-docs__media"><Image src={document.image} alt={`Portada: ${document.title}`} fill sizes="(max-width: 760px) 100vw, 25vw" /></div>
            <div className="wg-docs__body">
              <span>{document.kicker}</span>
              <h4>{document.title}</h4>
              <p>{document.description}</p>
              <small>{document.note}</small>
              <div className="wg-docs__actions">
                <Link href={document.href}>{document.action} →</Link>
                {document.pdf ? <a href={document.pdf} target="_blank" rel="noreferrer">Descargar PDF ↗</a> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
