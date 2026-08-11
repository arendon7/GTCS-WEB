import Link from "next/link";
import { BrandName } from "@/components/brand-name";
import { ProductCard } from "@/components/product-card";
import { featuredProducts } from "@/data/products";

const audiences = [
  { kicker: "Agro", title: "Nutrición que acompaña cada etapa del cultivo", copy: "Explora Wondergreen por objetivo, etapa y formato.", href: "/wondergreen/", cta: "Conocer Wondergreen" },
  { kicker: "Sector público", title: "Soluciones para municipios y ESP", copy: "Planeación, aprovechamiento, infraestructura, operación y trazabilidad.", href: "/municipios/", cta: "Ver soluciones" },
  { kicker: "Empresas", title: "Convierte residuos orgánicos en resultados medibles", copy: "Diseñamos rutas de aprovechamiento y proyectos adaptados al generador.", href: "/contacto/", cta: "Hablar con Greenatics" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Economía circular aplicada</span>
            <h1>Lo orgánico no termina como residuo. <em>Vuelve a la vida.</em></h1>
            <p className="lead">Greenatics conecta gestión de residuos, plantas de aprovechamiento, nutrición vegetal y datos para cerrar el ciclo con resultados reales.</p>
            <div className="button-row">
              <Link className="button button--primary" href="/wondergreen/">Comprar Wondergreen</Link>
              <Link className="button button--light" href="/municipios/">Soluciones para municipios</Link>
            </div>
          </div>
          <div className="cycle-visual" aria-label="Ciclo Greenatics: residuo, transformación, producto, suelo e impacto">
            <div className="cycle-center"><BrandName inverse /></div>
            <div className="cycle-node node-1"><strong>01</strong><span>Residuo</span></div>
            <div className="cycle-node node-2"><strong>02</strong><span>Transformación</span></div>
            <div className="cycle-node node-3"><strong>03</strong><span>Producto</span></div>
            <div className="cycle-node node-4"><strong>04</strong><span>Suelo</span></div>
            <div className="cycle-node node-5"><strong>05</strong><span>Impacto</span></div>
          </div>
        </div>
      </section>

      <section className="audience-section" id="soluciones">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">¿Qué necesitas resolver?</span><h2>Una empresa. Tres puertas de entrada.</h2></div>
          <div className="audience-grid">
            {audiences.map((item) => (
              <article className="audience-card" key={item.title}>
                <span className="eyebrow">{item.kicker}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <Link href={item.href}>{item.cta} →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wondergreen-band">
        <div className="container wg-intro">
          <div><span className="eyebrow eyebrow--light">Producto inmediato</span><BrandName brand="wondergreen" inverse /><h2>Nutrición pensada como un sistema, no como una lista de productos.</h2></div>
          <p>Encuentra la línea adecuada según la etapa: suelo, crecimiento, balance, floración o producción.</p>
        </div>
        <div className="container product-grid">
          {featuredProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
        </div>
        <div className="container band-cta"><Link className="button button--light" href="/wondergreen/">Explorar portafolio completo</Link></div>
      </section>

      <section className="impact-section" id="impacto">
        <div className="container impact-grid">
          <div>
            <span className="eyebrow">Impacto conectado a la operación</span>
            <h2>Lo que hacemos debe poder medirse.</h2>
            <p>La capa pública de impacto se conectará con GREENATICS OPS para publicar únicamente indicadores validados: recepción, aprovechamiento, producción, inventario e impacto ambiental.</p>
          </div>
          <div className="impact-console">
            <div className="console-top"><span>GREENATICS · IMPACTO</span><span className="live-dot">datos verificados</span></div>
            <div className="metric-skeleton"><span>Residuos aprovechados</span><strong>—</strong><small>Pendiente publicación validada</small></div>
            <div className="metric-skeleton"><span>Producto generado</span><strong>—</strong><small>Fuente futura: GREENATICS OPS</small></div>
            <div className="metric-skeleton"><span>Indicadores ambientales</span><strong>—</strong><small>Sin cifras no aprobadas</small></div>
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="container closing-inner"><div><span className="eyebrow">Greenatics</span><h2>¿Tienes un residuo, un cultivo o un territorio por transformar?</h2></div><Link className="button button--dark" href="/contacto/">Hablemos</Link></div>
      </section>
    </>
  );
}
