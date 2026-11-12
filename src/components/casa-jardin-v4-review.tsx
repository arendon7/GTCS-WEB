import Image from "next/image";
import Link from "next/link";
import { casaJardinV4Kits } from "@/data/casa-jardin-v4";
import { casaJardinKits, casaJardinProducts } from "@/data/casa-jardin-v4-review";

const kitGroups: Record<string, string> = {
  "mi-primera-matera": "Para empezar",
  "plantas-verdes": "Follaje",
  "plantas-con-flor": "Flores",
  "aromaticas-y-hojas": "Aromáticas y hojas",
  "trasplanta-y-activa": "Trasplante",
  "mi-huerta": "Huerta",
  "casa-completa": "Colección",
  "casa-completa-xl": "Colección ampliada",
  "proteccion-de-hojas": "Cuidado foliar",
};

const supportIcons: Record<string, string> = Object.fromEntries(
  casaJardinV4Kits.map(({ slug, iconImage }) => [slug, iconImage]),
);

export function CasaJardinV4Review() {
  return (
    <section className="homegarden-v4-review" id="kits-v4" aria-labelledby="kits-v4-title">
      <div className="container">
        <header className="homegarden-v4-review__heading">
          <div>
            <span className="eyebrow">Wondergreen · propuesta en revisión</span>
            <h2 id="kits-v4-title">Nueve rutas para distintos espacios y plantas.</h2>
          </div>
          <p>Explora las nuevas imágenes y matrices de composición. Cada configuración, cantidad y accesorio sigue pendiente de confirmación técnica y comercial.</p>
        </header>

        <nav className="homegarden-v4-review__map" aria-label="Mapa de rutas propuestas para kits">
          <p className="homegarden-v4-review__map-start"><strong>Empieza por la situación de tu planta</strong><span>Este mapa orienta la exploración; no indica aplicar varias referencias juntas.</span></p>
          <ul>
            <li><span>Para empezar</span><a href="#mi-primera-matera">Mi Primera Matera <b aria-hidden="true">→</b></a></li>
            <li><span>Follaje y aromáticas</span><a href="#plantas-verdes">Plantas Verdes <b aria-hidden="true">→</b></a><a href="#aromaticas-y-hojas">Aromáticas y Hojas <b aria-hidden="true">→</b></a></li>
            <li><span>Ornamentales en flor</span><a href="#plantas-con-flor">Plantas con Flor <b aria-hidden="true">→</b></a></li>
            <li><span>Cambio de recipiente</span><a href="#trasplanta-y-activa">Trasplanta y Activa <b aria-hidden="true">→</b></a></li>
            <li><span>Huerta doméstica</span><a href="#mi-huerta">Mi Huerta <b aria-hidden="true">→</b></a></li>
            <li><span>Varias plantas o etapas</span><a href="#casa-completa">Casa Completa <b aria-hidden="true">→</b></a><a href="#casa-completa-xl">Casa Completa XL <b aria-hidden="true">→</b></a></li>
            <li className="homegarden-v4-review__map-caution"><span>Cambios visibles en las hojas</span><a href="#proteccion-de-hojas">Protección de Hojas <b aria-hidden="true">→</b></a><small>La propuesta requiere revisión técnica antes de definir su uso.</small></li>
          </ul>
        </nav>

        <div className="homegarden-v4-review__grid">
          {casaJardinKits.map((kit) => (
            <article className="homegarden-v4-review__card" id={kit.slug} key={kit.slug}>
              <figure>
                <div className="homegarden-v4-review__art">
                  <Image src={kit.image} alt={kit.imageAlt} fill sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw" />
                </div>
                <figcaption>Propuesta de kit · contenido y empaques por confirmar</figcaption>
              </figure>
              <div className="homegarden-v4-review__body">
                <div className="homegarden-v4-review__category-row">
                  <span className="homegarden-v4-review__category">{kitGroups[kit.slug]}</span>
                  <Image className="homegarden-v4-review__support-icon" src={supportIcons[kit.slug]} alt="" width={40} height={40} />
                </div>
                <h3>{kit.name}</h3>
                <p className="homegarden-v4-review__audience">{kit.audience}</p>
                <p>{kit.promise}</p>
                {kit.secondaryPromise ? <p>{kit.secondaryPromise}</p> : null}
                <details>
                  <summary>Ver matriz propuesta</summary>
                  <div className="homegarden-v4-review__details">
                    <p><strong>Referencias:</strong></p>
                    <ul>
                      {kit.composition.map((item) => {
                        const product = casaJardinProducts.find(({ slug }) => slug === item.productSlug);
                        return <li key={item.productSlug}>{product?.name ?? item.productSlug}{item.quantity > 1 ? ` · ${item.quantity} unidades propuestas` : ""}</li>;
                      })}
                    </ul>
                    <p><strong>Cantidades totales:</strong> {kit.proposedTotals}.</p>
                    <p><strong>Accesorios propuestos:</strong> {kit.accessories.join("; ")}.</p>
                    <p>{kit.note}</p>
                  </div>
                </details>
                <Link className="homegarden-v4-review__detail-link" href={`/casa-jardin/kits/v4/${kit.slug}/`}>
                  Ver imagen y ficha de revisión <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="homegarden-v4-review__footnote">La imagen ayuda a revisar la dirección visual. No confirma empaque vigente, inventario, precio ni disponibilidad. La guía final de Mi Huerta también sigue en preparación.</p>
        <p className="homegarden-v4-review__back"><Link href="/casa-jardin/#diagnostico">¿Quieres orientación para una planta? Usa el orientador <span aria-hidden="true">→</span></Link></p>
      </div>
    </section>
  );
}

export function CasaJardinV4PreviewLink() {
  return (
    <section className="homegarden-v4-review-link" aria-labelledby="kits-v4-preview-title">
      <div className="container">
        <div>
          <span className="eyebrow">Nuevas composiciones en revisión</span>
          <h2 id="kits-v4-preview-title">Estamos ampliando las rutas de cultivo Wondergreen.</h2>
          <p>Ya puedes revisar nueve propuestas de kit, sus imágenes y matrices de contenido. Presentaciones, cantidades y disponibilidad siguen pendientes de confirmación.</p>
        </div>
        <Link className="button button--dark" href="/casa-jardin/kits/#kits-v4">Explorar las nueve propuestas <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
