import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { featuredProducts } from "@/data/products";

const audiences = [
  { kicker: "Agro", title: "Nutrición que acompaña cada etapa del cultivo", copy: "Explora Wondergreen por objetivo, etapa y formato.", href: "/wondergreen/", cta: "Conocer Wondergreen" },
  { kicker: "Sector público", title: "Soluciones para municipios y ESP", copy: "Planeación, aprovechamiento, infraestructura, operación y trazabilidad.", href: "/municipios/", cta: "Ver soluciones" },
  { kicker: "Empresas", title: "Convierte residuos orgánicos en resultados medibles", copy: "Diseñamos rutas de aprovechamiento y proyectos adaptados al generador.", href: "/empresas/", cta: "Ver soluciones empresariales" },
];

const knowledge = [
  { kicker: "Diagnóstico", title: "Deficiencias nutricionales", copy: "Una guía para leer síntomas en cinco cultivos antes de asumir que todo se resuelve aplicando fertilizante.", href: "/biblioteca/guia-deficiencias/" },
  { kicker: "Uso en campo", title: "Manual Wondergreen", copy: "Checklist previo, vía operativa, errores a evitar y seguimiento para ejecutar mejor una recomendación.", href: "/biblioteca/manual-uso-wondergreen/" },
  { kicker: "Huertas", title: "Cultivar también es aprender", copy: "Ruta para huertas urbanas, escolares y comunitarias desde el suelo hasta la cosecha y el aprendizaje circular.", href: "/biblioteca/huertas/" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-brand-lockup"><img className="official-logo" src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" /></div>
            <span className="eyebrow">Economía circular aplicada</span>
            <h1>Lo orgánico no termina como residuo. <em>Vuelve a la vida.</em></h1>
            <p className="lead">Conectamos gestión de residuos, plantas de aprovechamiento, nutrición vegetal y datos para cerrar el ciclo con resultados reales.</p>
            <div className="button-row"><Link className="button button--primary" href="/wondergreen/">Comprar Wondergreen</Link><Link className="button button--light" href="/diagnostico/">¿Qué solución necesito?</Link></div>
          </div>
          <div className="cycle-visual" aria-label="Ciclo Greenatics: residuo, transformación, producto, suelo e impacto">
            <div className="cycle-center"><img src="/brand/greenatics-symbol.svg" alt="" aria-hidden="true" /></div>
            <div className="cycle-node node-1"><strong>01</strong><span>Residuo</span></div><div className="cycle-node node-2"><strong>02</strong><span>Transformación</span></div><div className="cycle-node node-3"><strong>03</strong><span>Producto</span></div><div className="cycle-node node-4"><strong>04</strong><span>Suelo</span></div><div className="cycle-node node-5"><strong>05</strong><span>Impacto</span></div>
          </div>
        </div>
      </section>

      <section className="audience-section" id="soluciones"><div className="container"><div className="section-heading"><span className="eyebrow">¿Qué necesitas resolver?</span><h2>Una empresa. Tres puertas de entrada.</h2></div><div className="audience-grid">{audiences.map((item) => <article className="audience-card" key={item.title}><span className="eyebrow">{item.kicker}</span><h3>{item.title}</h3><p>{item.copy}</p><Link href={item.href}>{item.cta} →</Link></article>)}</div><div className="diagnostic-entry"><div><strong>¿No sabes por dónde empezar?</strong><span>Dos preguntas te llevan a la ruta Greenatics más útil.</span></div><Link className="button button--dark" href="/diagnostico/">Hacer diagnóstico</Link></div></div></section>

      <section className="wondergreen-band"><div className="container wg-intro"><div className="wg-brand-column"><span className="eyebrow eyebrow--light">Producto inmediato · una marca Greenatics</span><div className="wondergreen-official-lockup"><img className="official-logo" src="/brand/wondergreen-nutrients.webp" alt="Wondergreen Nutrients" width="420" height="221" /></div><h2>Nutrición pensada como un sistema, no como una lista de productos.</h2></div><div><p>Encuentra la línea adecuada según la etapa: suelo, crecimiento, balance, floración o producción.</p><div className="button-row"><Link className="button button--light" href="/wondergreen/cultivos/">Buscar por cultivo</Link><Link className="button button--outline-light" href="/wondergreen/cotizador/">Cotizar</Link></div></div></div><div className="container product-grid">{featuredProducts.map((product) => <ProductCard key={product.slug} product={product} />)}</div><div className="container band-cta"><Link className="button button--light" href="/wondergreen/">Explorar Wondergreen</Link></div></section>

      <section className="knowledge-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Conocimiento que se usa</span><h2>No vendemos una bolsa sin explicar cómo pensar el sistema.</h2><p>Guías de cultivo, manuales de uso, diagnóstico y huertas convierten nuestro conocimiento técnico en herramientas útiles antes y después de la compra.</p></div>
          <div className="knowledge-card-grid">{knowledge.map((item) => <article key={item.title}><span className="knowledge-card-kicker">{item.kicker}</span><h3>{item.title}</h3><p>{item.copy}</p><Link className="knowledge-inline-link" href={item.href}>Abrir recurso →</Link></article>)}</div>
          <div className="knowledge-actions"><Link className="button button--ghost" href="/biblioteca/">Explorar biblioteca técnica</Link></div>
        </div>
      </section>

      <section className="impact-section" id="impacto"><div className="container impact-grid"><div><span className="eyebrow">Impacto conectado a la operación</span><h2>Lo que hacemos debe poder medirse.</h2><p>La capa pública de impacto se conecta conceptualmente con GREENATICS OPS y solo publicará indicadores conciliados y aprobados.</p><div className="button-row"><Link className="button button--primary" href="/impacto/">Ver modelo de impacto</Link><Link className="button button--ghost" href="/tecnologia/">Tecnología y plantas</Link></div></div><div className="impact-console"><div className="console-top"><span>GREENATICS · IMPACTO</span><span className="live-dot">publicación gobernada</span></div><div className="metric-skeleton"><span>Residuos aprovechados</span><strong>—</strong><small>Pendiente publicación validada</small></div><div className="metric-skeleton"><span>Producto generado</span><strong>—</strong><small>Fuente futura: GREENATICS OPS</small></div><div className="metric-skeleton"><span>Indicadores ambientales</span><strong>—</strong><small>Sin cifras no aprobadas</small></div></div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Greenatics</span><h2>¿Tienes un residuo, un cultivo o un territorio por transformar?</h2></div><Link className="button button--dark" href="/contacto/">Hablemos</Link></div></section>
    </>
  );
}
