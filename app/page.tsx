/* eslint-disable @next/next/no-img-element */

const Arrow = () => <span aria-hidden="true">↗</span>;

const services = [
  ["01", "Plantas de tratamiento", "Diagnóstico, diseño, estructuración, implementación y operación de infraestructura para residuos orgánicos."],
  ["02", "Rehabilitación de plantas", "Recuperación de composteras, biodigestores e infraestructura abandonada o subutilizada."],
  ["03", "Biofábricas", "Transformación de biomasa local en compost, biofertilizantes, bioles y productos para retorno al suelo."],
  ["04", "Rutas y tratamiento", "Recolección, transporte, recepción, pesaje, control de calidad y trazabilidad del material."],
  ["05", "PGIRS y PMIRS", "Diagnóstico, actualización, proyectos de aprovechamiento e indicadores para entidades y generadores privados."],
  ["06", "Consultoría ambiental", "Gestión de residuos, sostenibilidad, huella de carbono, huella hídrica y modelos circulares."],
  ["07", "Operación y control", "Protocolos, balance de masa, bitácoras, calidad, olores, vectores, seguridad y reportes."],
  ["08", "Salida agrícola", "Portafolio Wondergreen, soporte técnico, programas por cultivo y conexión con canales comerciales."],
];

const modules = [
  ["01", "Recepción", "Pesaje, origen y trazabilidad"],
  ["02", "Acondicionamiento", "Separación y preparación"],
  ["03", "Digestión", "Bioproceso anaerobio"],
  ["04", "Compostaje", "Estabilización bioxidativa"],
  ["05", "Formulación", "Ajuste y control de calidad"],
  ["06", "Empaque", "Presentación y almacenamiento"],
  ["07", "Biogás", "Aprovechamiento energético"],
  ["08", "Retorno", "Suelo, cultivo y territorio"],
];

const products = [
  { cls: "compost", phase: "Suelo", name: "COMPOST", solid: "Base orgánica", liquid: "Acondicionamiento", copy: "Materia orgánica y soporte para la estructura del suelo." },
  { cls: "grow", phase: "Crecimiento", name: "2GROW", solid: "Sólido 15-3-3", liquid: "Líquidos 100-20-20 · 200-0-0", copy: "Arranque, brotación, levante, rebrote y recuperación." },
  { cls: "balance", phase: "Equilibrio", name: "2BALANCE", solid: "Sólido 7-7-7", liquid: "Líquido 70-70-70 g/L", copy: "Mantenimiento, transición y nutrición balanceada." },
  { cls: "bloom", phase: "Floración", name: "2BLOOM", solid: "Sólido 3-8-3", liquid: "Líquido 30-80-30 g/L", copy: "Prefloración, floración y soporte reproductivo." },
  { cls: "fruit", phase: "Producción", name: "2FRUIT", solid: "Sólido 3-3-8", liquid: "Líquido 30-30-80 g/L", copy: "Cuajado, llenado, maduración y etapa productiva." },
  { cls: "bio", phase: "Manejo integrado", name: "BIOINSUMOS", solid: "Microorganismos", liquid: "Extractos botánicos", copy: "Soporte biológico dentro de programas integrales de manejo." },
];

const crops = ["Aguacate", "Café", "Banano", "Cacao", "Cítricos", "Pastos", "Cannabis medicinal", "Viveros y jardinería"];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Greenatics, inicio">
          <img src="/greenatics-logo.png" alt="Greenatics" />
        </a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#soluciones">Soluciones</a>
          <a href="#planta">Planta modular</a>
          <a href="#operacion">Operación</a>
          <a href="#wondergreen">Wondergreen</a>
        </nav>
        <a className="header-cta" href="#contacto">Diagnóstico <Arrow /></a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Economía circular · Biotecnología aplicada</p>
          <h1>Residuos que vuelven como <em>suelo, productos y energía.</em></h1>
          <p className="hero-lead">
            Greenatics integra infraestructura, operación, sector aseo y salida
            agrícola para transformar residuos orgánicos y biomasa residual en valor territorial.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#soluciones">Conocer el modelo <Arrow /></a>
            <a className="button button-secondary" href="#wondergreen">Ver Wondergreen</a>
          </div>
          <div className="hero-proof">
            <div><strong>3</strong><span>frentes conectados</span></div>
            <div><strong>8</strong><span>módulos de planta</span></div>
            <div><strong>1</strong><span>ciclo de retorno</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/seedling-soil.jpg" alt="Plántula creciendo en suelo fértil" />
          <div className="hero-overlay" />
          <div className="hero-loop" aria-label="Ciclo Greenatics">
            <span>Residuo</span><i>→</i><span>Bioproceso</span><i>→</i><span>Retorno</span>
          </div>
          <div className="hero-float float-top"><span>01</span> Territorio</div>
          <div className="hero-float float-bottom"><span>02</span> Agricultura</div>
        </div>
      </section>

      <section className="challenge-section" aria-labelledby="challenge-title">
        <div className="challenge-image">
          <img src="/organic-waste.jpg" alt="Residuos orgánicos separados para aprovechamiento" />
          <span>La materia orgánica no es el final del ciclo.</span>
        </div>
        <div className="challenge-content">
          <p className="eyebrow">El reto estructural</p>
          <h2 id="challenge-title">Enterramos recursos que el territorio necesita.</h2>
          <p>
            El problema no termina en recoger. Exige separar bien, tratar con
            tecnología, operar con trazabilidad y construir una salida real para los productos.
          </p>
          <div className="sector-data">
            <article>
              <strong>12,15</strong><span>millones t/año</span>
              <p>Residuos sólidos generados en Colombia, referencia sectorial 2022.</p>
            </article>
            <article>
              <div className="donut disposal"><b>96,65%</b></div>
              <p>Disposición final reportada. El aprovechamiento sigue siendo el gran reto.</p>
            </article>
            <article>
              <div className="bar-visual"><i style={{ width: "61.5%" }} /></div>
              <strong>≈61,5%</strong>
              <p>Fracción orgánica de referencia en grandes ciudades.</p>
            </article>
          </div>
          <small>Fuentes de referencia utilizadas por el proyecto: SSPD e información sectorial nacional. Las cifras conservan su año y alcance.</small>
        </div>
      </section>

      <section className="section services-section" id="soluciones">
        <div className="section-heading wide-heading">
          <div>
            <p className="eyebrow">Ecosistema de soluciones</p>
            <h2>Mucho más que una planta.</h2>
          </div>
          <p>
            Greenatics conecta el problema logístico, la infraestructura, la
            operación, la regulación sectorial, la biotecnología y el mercado agrícola.
          </p>
        </div>
        <div className="service-grid">
          {services.map(([index, title, copy]) => (
            <article className="service-card" key={index}>
              <span>{index}</span><h3>{title}</h3><p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="audience-section" aria-labelledby="audience-title">
        <div className="audience-title">
          <p className="eyebrow">Una plataforma · cuatro rutas</p>
          <h2 id="audience-title">Una solución distinta para cada actor.</h2>
        </div>
        <div className="audience-grid">
          <article><span>Gobierno</span><h3>Municipios y entidades</h3><p>PGIRS, rutas selectivas, infraestructura, ciudadanía e indicadores territoriales.</p><b>Mesa técnica →</b></article>
          <article><span>Operación</span><h3>ESP y operadores</h3><p>Recepción, pesaje, tratamiento, calidad del material, trazabilidad y reportes.</p><b>Piloto operativo →</b></article>
          <article><span>Industria</span><h3>Agroindustria y generadores</h3><p>Biomasa residual, costos de disposición, biofábricas, circularidad y retorno interno.</p><b>Balance de masa →</b></article>
          <article><span>Campo</span><h3>Agricultores y agrotiendas</h3><p>Nutrición por etapas, soporte técnico, portafolio y programas ajustados al cultivo.</p><b>Diagnóstico agronómico →</b></article>
        </div>
      </section>

      <section className="back2green-section" aria-labelledby="back2green-title">
        <div className="back2green-copy">
          <p className="eyebrow">Back2Green · El regreso al ciclo</p>
          <h2 id="back2green-title">Separar no basta. Hay que cerrar el ciclo.</h2>
          <p>
            Back2Green organiza la narrativa operativa: del generador a la ruta,
            de la ruta a la planta y de la planta nuevamente al territorio.
          </p>
          <div className="back2green-tags"><span>Ruta selectiva</span><span>Planta</span><span>Biofábrica</span><span>Retorno</span></div>
        </div>
        <div className="circular-diagram" aria-label="Ciclo Back2Green">
          <div className="circle-core"><small>Back2Green</small><strong>Transformar<br />para retornar</strong></div>
          <div className="circle-node node-one"><b>01</b><span>Generar</span></div>
          <div className="circle-node node-two"><b>02</b><span>Separar</span></div>
          <div className="circle-node node-three"><b>03</b><span>Tratar</span></div>
          <div className="circle-node node-four"><b>04</b><span>Valorizar</span></div>
          <div className="circle-node node-five"><b>05</b><span>Retornar</span></div>
        </div>
      </section>

      <section className="plant-section" id="planta" aria-labelledby="plant-title">
        <div className="plant-heading">
          <div><p className="eyebrow">PTA modular</p><h2 id="plant-title">Ocho módulos. Una operación trazable.</h2></div>
          <p>La configuración final depende de caracterización, lote, capacidad, tecnología, permisos, destino de productos y modelo operativo.</p>
        </div>
        <div className="module-flow">
          {modules.map(([index, title, copy]) => (
            <article key={index}><span>{index}</span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
        <div className="plant-model">
          <div className="model-title"><span>Modelo estándar de referencia</span><strong>14 t/día</strong><p>Entrada estimada de residuos orgánicos</p></div>
          <div className="model-arrow">→</div>
          <div className="output-grid">
            <article><strong>≈4 t/d</strong><span>salida sólida</span></article>
            <article><strong>≈1,6 m³/d</strong><span>salida líquida</span></article>
            <article><strong>≈280 m³/d</strong><span>biogás</span></article>
            <article><strong>≈1.680 kWh/d</strong><span>potencial energético</span></article>
          </div>
        </div>
        <p className="model-disclaimer">Modelo técnico preliminar, no resultado auditado ni promesa contractual. Debe recalcularse para cada residuo y proyecto.</p>
      </section>

      <section className="operation-section" id="operacion" aria-labelledby="operation-title">
        <div className="operation-visual"><img src="/plant-operation.jpg" alt="Infraestructura de tratamiento y material orgánico en proceso" /><div><span>Infraestructura + protocolo + personas</span><strong>Operar es convertir tecnología en resultados medibles.</strong></div></div>
        <div className="operation-copy">
          <p className="eyebrow">Experiencia territorial</p>
          <h2 id="operation-title">De la propuesta a la operación real.</h2>
          <p>Greenatics ha construido experiencia en Antioquia articulando plantas, aliados, rutas, producción y retorno de productos al territorio.</p>
          <div className="territory-list">
            <article><span>Yarumal</span><strong>Ruta selectiva + tratamiento</strong><p>Ciudadanía, Alcaldía, ESP y operación local.</p></article>
            <article><span>Támesis</span><strong>Planta territorial</strong><p>Infraestructura, productos sólidos y líquidos.</p></article>
          </div>
        </div>
      </section>

      <section className="yarumal-section" aria-labelledby="yarumal-title">
        <div className="yarumal-copy"><p className="eyebrow">Caso operativo · Yarumal</p><h2 id="yarumal-title">Cuando la ruta selectiva se convierte en impacto visible.</h2><p>Periodo: enero al 13 de junio de 2026. La operación integra separación ciudadana, recolección diferenciada, tratamiento y retorno de fertilizantes al territorio.</p></div>
        <div className="yarumal-dashboard">
          <div className="yard-main"><span>Recibidos</span><strong>124,64 t</strong><p>Residuos orgánicos</p></div>
          <div className="yard-donut"><div className="donut recovery"><b>95,92%</b></div><p>Aprovechables estimados</p></div>
          <div className="yard-stat"><strong>119,56 t</strong><span>aprovechables</span></div>
          <div className="yard-stat"><strong>5,08 t</strong><span>rechazo estimado</span></div>
          <div className="yard-stat accent"><strong>≈67,3 tCO₂e</strong><span>estimadas evitadas</span></div>
        </div>
        <p className="case-note">Estimaciones internas del periodo. Rechazo calculado con 20 kg por viaje; impacto climático sujeto a metodología y verificación.</p>
      </section>

      <section className="wondergreen-section" id="wondergreen" aria-labelledby="wondergreen-title">
        <div className="wondergreen-heading">
          <div><p className="eyebrow">Wondergreen by Greenatics</p><h2 id="wondergreen-title">El ciclo llega al suelo.</h2></div>
          <p>Wondergreen no es una lista aislada de fertilizantes. Es un sistema de nutrición por etapa que integra base orgánica, sólidos, líquidos y soporte biológico.</p>
        </div>
        <div className="portfolio-showcase">
          <div className="portfolio-image"><img src="/wondergreen-portfolio.jpg" alt="Vista gráfica del portafolio Wondergreen" /><span>Referencia visual del sistema de productos</span></div>
          <div className="nutrition-path"><span>Suelo</span><i>→</i><span>Crecer</span><i>→</i><span>Equilibrar</span><i>→</i><span>Florecer</span><i>→</i><span>Producir</span></div>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className={`product-card ${product.cls}`} key={product.name}>
              <span>{product.phase}</span><h3>{product.name}</h3><p>{product.copy}</p><div><b>{product.solid}</b><small>{product.liquid}</small></div>
            </article>
          ))}
        </div>
        <div className="product-notes">
          <p><strong>Líquidos Wondergreen:</strong> dilución general 1:10, salvo ficha o recomendación técnica validada distinta.</p>
          <p><strong>Programa técnico:</strong> producto, dosis, momento y vía se definen según diagnóstico; no por rutina.</p>
        </div>
      </section>

      <section className="bio-section" aria-labelledby="bio-title">
        <div><p className="eyebrow">Manejo integrado</p><h2 id="bio-title">Biología que complementa la nutrición.</h2><p>El manejo biológico se integra según objetivo, cultivo, ambiente, historial y presión fitosanitaria. No reemplaza el diagnóstico.</p></div>
        <div className="bio-grid">
          <article><i>Tr</i><strong>Trichoderma</strong><span>Entorno radicular</span></article>
          <article><i>Bs</i><strong>Bacillus subtilis</strong><span>Soporte microbiológico</span></article>
          <article><i>Bv</i><strong>Beauveria</strong><span>Manejo biológico</span></article>
          <article><i>Mm</i><strong>Metarhizium</strong><span>Manejo biológico</span></article>
          <article><i>AA</i><strong>Ajo · Ají</strong><span>Extracto botánico</span></article>
        </div>
      </section>

      <section className="crop-section" aria-labelledby="crop-title">
        <div className="crop-heading"><p className="eyebrow">Programas por cultivo</p><h2 id="crop-title">La recomendación comienza con preguntas.</h2><p>Etapa, edad, densidad, suelo, humedad, riego, carga, historial, síntomas, área y equipo determinan el programa.</p></div>
        <div className="crop-list">{crops.map((crop, index) => <span key={crop}><b>{String(index + 1).padStart(2, "0")}</b>{crop}</span>)}</div>
        <div className="diagnostic-flow"><article><span>01</span><strong>Diagnosticar</strong><p>Cultivo, suelo y necesidad dominante.</p></article><article><span>02</span><strong>Definir etapa</strong><p>Crecimiento, balance, floración o producción.</p></article><article><span>03</span><strong>Elegir vía</strong><p>Suelo, drench, fertirriego o foliar.</p></article><article><span>04</span><strong>Medir y ajustar</strong><p>Seguimiento técnico y respuesta del cultivo.</p></article></div>
      </section>

      <section className="science-section" aria-labelledby="science-title">
        <div className="science-heading"><p className="eyebrow">Ciencia con prudencia</p><h2 id="science-title">Explicamos el mecanismo. Medimos el resultado.</h2><p>La literatura respalda el enfoque organomineral y el uso agronómico de matrices orgánicas, pero cada formulación, suelo y cultivo debe evaluarse.</p></div>
        <div className="science-grid">
          <article><span>01</span><h3>Matriz organomineral</h3><p>Puede modificar la cinética de disponibilidad de nutrientes según formulación.</p><a href="https://doi.org/10.3390/plants14203154" target="_blank" rel="noreferrer">Plants, 2025 <Arrow /></a></article>
          <article><span>02</span><h3>Aprovechamiento de nutrientes</h3><p>Ensayos específicos muestran respuestas agronómicas que no deben generalizarse.</p><a href="https://doi.org/10.3390/agriengineering7100343" target="_blank" rel="noreferrer">AgriEngineering, 2025 <Arrow /></a></article>
          <article><span>03</span><h3>Eficiencia y suelo</h3><p>La respuesta depende de dosis, matriz, suelo, cultivo, clima y manejo integral.</p><a href="https://doi.org/10.3390/su132111635" target="_blank" rel="noreferrer">Sustainability, 2021 <Arrow /></a></article>
        </div>
      </section>

      <section className="work-section" aria-labelledby="work-title">
        <div><p className="eyebrow">Cómo trabajamos</p><h2 id="work-title">De la línea base a una operación que aprende.</h2></div>
        <ol><li><span>01</span><div><strong>Caracterizar</strong><p>Residuo, territorio, infraestructura, actores y objetivo.</p></div></li><li><span>02</span><div><strong>Estructurar</strong><p>Tecnología, balance de masa, CAPEX/OPEX, permisos y modelo.</p></div></li><li><span>03</span><div><strong>Implementar</strong><p>Infraestructura, protocolo, formación, ruta y puesta en marcha.</p></div></li><li><span>04</span><div><strong>Operar y medir</strong><p>Entradas, rechazos, productos, indicadores y mejora continua.</p></div></li></ol>
      </section>

      <section className="contact-section" id="contacto">
        <div><p className="eyebrow">Diagnóstico inicial</p><h2>Convirtamos tu reto en un proyecto circular.</h2><p>Cuéntanos el origen del residuo, volumen, frecuencia, ubicación, infraestructura disponible y objetivo esperado.</p></div>
        <div className="contact-panel"><span>Selecciona tu punto de partida</span><a href="https://greenatics.org/contacto/" target="_blank" rel="noreferrer">Municipio o ESP <Arrow /></a><a href="https://greenatics.org/contacto/" target="_blank" rel="noreferrer">Agroindustria o generador <Arrow /></a><a href="https://greenatics.org/contacto/" target="_blank" rel="noreferrer">Agricultura o distribución <Arrow /></a></div>
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <div><p className="eyebrow">Preguntas frecuentes</p><h2 id="faq-title">Lo esencial, sin promesas vacías.</h2></div>
        <div>
          <details><summary>¿Greenatics solo comercializa fertilizantes?</summary><p>No. Greenatics diseña y estructura soluciones de residuos, plantas, biofábricas, operación y consultoría. Wondergreen es la línea agrícola.</p></details>
          <details><summary>¿Todos los residuos requieren la misma planta?</summary><p>No. La tecnología se define después de caracterizar origen, composición, volumen, humedad, frecuencia, contaminación y destino esperado.</p></details>
          <details><summary>¿Una planta garantiza tarifa o cumplimiento?</summary><p>No. El modelo económico y regulatorio depende del marco vigente, contratos, reportes, habilitaciones, trazabilidad y condiciones del proyecto.</p></details>
          <details><summary>¿Wondergreen reemplaza toda fertilización convencional?</summary><p>No se plantea como promesa universal. El programa se ajusta al cultivo, etapa, suelo, manejo, análisis y objetivo productivo.</p></details>
        </div>
      </section>

      <footer><a className="footer-brand" href="#inicio" aria-label="Volver al inicio"><img src="/greenatics-logo.png" alt="Greenatics" /></a><p>Economía circular · Biotecnología aplicada · Medellín, Colombia</p><div><a href="#soluciones">Soluciones</a><a href="#wondergreen">Wondergreen</a><a href="#inicio">Volver arriba ↑</a></div></footer>
    </main>
  );
}
