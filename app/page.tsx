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
          <article className="preview-card">
            <span>04</span>
            <h3>Rehabilitación</h3>
            <p>Diagnóstico y recuperación de infraestructura subutilizada.</p>
          </article>
          <article className="preview-card">
            <span>05</span>
            <h3>Recepción y tratamiento</h3>
            <p>Operación controlada para generadores y territorios.</p>
          </article>
          <article className="preview-card product-card">
            <span>06</span>
            <h3>Wondergreen</h3>
            <p>Nutrición agrícola por etapa conectada con la economía circular.</p>
          </article>
        </div>
      </section>

      <section className="back2green-section" aria-labelledby="back2green-title">
        <div className="back2green-intro">
          <p className="eyebrow">Back2Green</p>
          <h2 id="back2green-title">El residuo vuelve al ciclo productivo.</h2>
          <p>
            Integramos separación, logística, tratamiento, biotecnología y
            salida agrícola dentro de una sola arquitectura operativa.
          </p>
        </div>
        <div className="process-map">
          <article>
            <span>01</span>
            <div>
              <h3>Diagnóstico</h3>
              <p>Origen, volumen, calidad, actores e infraestructura.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Diseño</h3>
              <p>Ruta, tecnología, balance de masa e indicadores.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Operación</h3>
              <p>Recepción, transformación, control y trazabilidad.</p>
            </div>
          </article>
          <article>
            <span>04</span>
            <div>
              <h3>Retorno</h3>
              <p>Compost, biofertilizantes, biogás y valor territorial.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section impact-section" aria-labelledby="impact-title">
        <div className="impact-copy">
          <p className="eyebrow">Operación territorial</p>
          <h2 id="impact-title">La circularidad se demuestra operando.</h2>
          <p>
            En Yarumal, la ruta selectiva articula ciudadanía, Alcaldía, empresa
            de servicios públicos y tratamiento local para devolver valor al
            territorio.
          </p>
          <a href="#contacto">Estructurar un caso territorial <Arrow /></a>
        </div>
        <div className="impact-data" aria-label="Resultados de operación en Yarumal">
          <div className="impact-main">
            <span>Enero — 13 de junio de 2026</span>
            <strong>124,64</strong>
            <p>toneladas de residuos orgánicos recibidos</p>
          </div>
          <div className="impact-secondary">
            <strong>119,56 t</strong>
            <p>aprovechables estimadas</p>
          </div>
          <p className="method-note">
            Caso operativo. Estimación basada en registros de recepción y rechazo
            utilizado en la metodología interna del periodo.
          </p>
        </div>
      </section>

      <section className="wondergreen-section" id="wondergreen" aria-labelledby="wondergreen-title">
        <div className="wondergreen-top">
          <div>
            <p className="eyebrow">Wondergreen by Greenatics</p>
            <h2 id="wondergreen-title">Nutrición que responde a cada etapa.</h2>
          </div>
          <p>
            Un sistema que conecta necesidades del cultivo, productos sólidos y
            líquidos, compost y manejo biológico con criterio técnico.
          </p>
        </div>
        <div className="stage-grid">
          <article className="stage-card grow">
            <span>01 · Crecer</span>
            <h3>2GROW</h3>
            <p>Arranque, brotación, levante y recuperación.</p>
            <small>Sólido 15-3-3</small>
          </article>
          <article className="stage-card balance">
            <span>02 · Equilibrar</span>
            <h3>2BALANCE</h3>
            <p>Mantenimiento, transición y nutrición balanceada.</p>
            <small>Sólido 7-7-7</small>
          </article>
          <article className="stage-card bloom">
            <span>03 · Florecer</span>
            <h3>2BLOOM</h3>
            <p>Prefloración, floración y soporte reproductivo.</p>
            <small>Sólido 3-8-3</small>
          </article>
          <article className="stage-card fruit">
            <span>04 · Producir</span>
            <h3>2FRUIT</h3>
            <p>Cuajado, llenado y etapa productiva.</p>
            <small>Sólido 3-3-8</small>
          </article>
        </div>
        <p className="agronomy-note">
          Toda recomendación se ajusta al cultivo, etapa, suelo, humedad, riego e historial de manejo.
        </p>
      </section>

      <section className="contact-section" id="contacto">
        <div>
          <p className="eyebrow">Primer paso</p>
          <h2>Convirtamos tu reto en un sistema circular.</h2>
        </div>
        <div className="contact-panel">
          <p>Para iniciar, necesitamos tres datos:</p>
          <ol>
            <li><span>01</span> Origen y tipo de residuo</li>
            <li><span>02</span> Volumen y frecuencia</li>
            <li><span>03</span> Objetivo territorial o productivo</li>
          </ol>
          <a
            className="button contact-button"
            href="https://greenatics.org/contacto/"
            target="_blank"
            rel="noreferrer"
          >
            Solicitar diagnóstico <Arrow />
          </a>
        </div>
      </section>

      <footer>
        <a className="footer-brand" href="#inicio" aria-label="Volver al inicio">
          <img src="/greenatics-logo.png" alt="Greenatics" />
        </a>
        <p>Economía circular · Biotecnología aplicada · Medellín, Colombia</p>
        <a href="#inicio">Volver arriba ↑</a>
      </footer>
    </main>
  );
}
