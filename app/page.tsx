const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Greenatics, inicio">
          <img src="/greenatics-logo.png" alt="Greenatics" />
        </a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#soluciones">Soluciones</a>
          <a href="#modelo">Modelo circular</a>
          <a href="#wondergreen">Wondergreen</a>
        </nav>
        <a className="header-cta" href="#contacto">
          Hablemos <Arrow />
        </a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Economía circular · Biotecnología aplicada</p>
          <h1>
            Convertimos residuos orgánicos en <em>vida para la tierra.</em>
          </h1>
          <p className="hero-lead">
            Diseñamos, implementamos y operamos soluciones que transforman
            biomasa residual en valor ambiental, agrícola y energético.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#soluciones">
              Explorar soluciones <Arrow />
            </a>
            <a className="button button-secondary" href="#contacto">
              Solicitar diagnóstico
            </a>
          </div>
          <div className="audience-list" aria-label="Sectores atendidos">
            <span>Municipios</span>
            <span>Empresas de servicios públicos</span>
            <span>Agroindustria</span>
          </div>
        </div>

        <div className="hero-system" aria-label="Modelo circular Greenatics">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="system-core">
            <span>Greenatics</span>
            <strong>Tecnología<br />+ operación</strong>
          </div>
          <article className="system-card input-card">
            <span className="card-index">01</span>
            <p>Entrada</p>
            <strong>Residuos orgánicos</strong>
          </article>
          <article className="system-card process-card">
            <span className="card-index">02</span>
            <p>Transformación</p>
            <strong>Bioprocesos</strong>
          </article>
          <article className="system-card output-card">
            <span className="card-index">03</span>
            <p>Retorno</p>
            <strong>Suelo · productos · energía</strong>
          </article>
          <div className="hero-note">
            <span className="note-dot" />
            Circularidad que conecta territorio y campo
          </div>
        </div>
      </section>

      <section className="model-strip" id="modelo" aria-label="Proceso Greenatics">
        <div>
          <span>01</span>
          <strong>Separar</strong>
          <p>Caracterización y flujo limpio.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Transformar</strong>
          <p>Tecnología, infraestructura y operación.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Retornar</strong>
          <p>Productos e indicadores para el territorio.</p>
        </div>
      </section>

      <section className="section solutions-preview" id="soluciones">
        <div className="section-heading">
          <p className="eyebrow">Soluciones integradas</p>
          <h2>Del residuo a un sistema productivo.</h2>
        </div>
        <div className="preview-grid">
          <article className="preview-card featured">
            <span>01</span>
            <h3>Plantas de tratamiento</h3>
            <p>Diagnóstico, diseño, implementación y operación.</p>
          </article>
          <article className="preview-card">
            <span>02</span>
            <h3>Biofábricas</h3>
            <p>Biomasa local convertida en insumos para el territorio.</p>
          </article>
          <article className="preview-card">
            <span>03</span>
            <h3>PGIRS y rutas</h3>
            <p>Planeación, articulación y trazabilidad del aprovechamiento.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
