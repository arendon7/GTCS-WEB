/* eslint-disable @next/next/no-img-element */

const Arrow = () => <span aria-hidden="true">↗</span>;

const lines = [
  { cls: "grow", step: "01", phase: "Crecer", name: "2GROW", solid: "Sólido 15-3-3", liquid: "Líquidos 100-20-20 · 200-0-0 g/L", image: "/wg-grow.png", copy: "Arranque, crecimiento, rebrote y recuperación cuando la necesidad dominante lo justifica." },
  { cls: "balance", step: "02", phase: "Equilibrar", name: "2BALANCE", solid: "Sólido 7-7-7", liquid: "Líquido 70-70-70 g/L", image: "/wg-balance.png", copy: "Mantenimiento, transición y nutrición balanceada según el cultivo y su etapa." },
  { cls: "bloom", step: "03", phase: "Florecer", name: "2BLOOM", solid: "Sólido 3-8-3", liquid: "Líquido 30-80-30 g/L", image: "/wg-bloom.png", copy: "Prefloración, floración y soporte a la fase reproductiva." },
  { cls: "fruit", step: "04", phase: "Producir", name: "2FRUIT", solid: "Sólido 3-3-8", liquid: "Líquido 30-30-80 g/L", image: "/wg-fruit.png", copy: "Cuajado, llenado y producción con una nutrición ajustada al momento." },
];

const parkModules = [
  ["01", "Acceso y báscula", "Origen, pesaje y trazabilidad"],
  ["02", "Recepción", "Control de impropios y acondicionamiento"],
  ["03", "Biodigestión", "Ruta anaerobia según la matriz"],
  ["04", "Compostaje", "Estabilización y maduración"],
  ["05", "Biofábrica", "Fermentaciones y bioprocesos"],
  ["06", "Formulación", "Control, ajuste y empaque"],
  ["07", "Biogás y energía", "Aprovechamiento condicionado al proyecto"],
  ["08", "Retorno productivo", "Vivero, parcelas y mercado agrícola"],
];

const services = [
  ["Plantas y parques ambientales", "Diagnóstico, diseño, estructuración, implementación y operación modular."],
  ["Rehabilitación de infraestructura", "Recuperación de composteras, biodigestores y plantas subutilizadas."],
  ["Rutas, recepción y tratamiento", "Recolección diferenciada, pesaje, control de calidad y trazabilidad."],
  ["Biofábricas", "Paquetes tecnológicos para transformar biomasa local en productos útiles."],
  ["PGIRS y PMIRS", "Línea base, proyectos de aprovechamiento, actores, metas e indicadores."],
  ["Consultoría ambiental", "Gestión de residuos, circularidad y estudios de huella según alcance."],
  ["Operación y control", "Protocolos, bitácoras, balance de masa, calidad, seguridad y reportes."],
  ["Salida agrícola", "Wondergreen, soporte técnico, programas por cultivo y desarrollo de mercado."],
];

const crops = ["Aguacate", "Café", "Banano", "Cacao", "Cítricos", "Pastos", "Cannabis medicinal", "Viveros"];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Greenatics, inicio"><img src="/greenatics-logo.png" alt="Greenatics" /></a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#wondergreen">Wondergreen</a>
          <a href="#organominerales">Organominerales</a>
          <a href="#parque">Parques ambientales</a>
          <a href="#impacto">Impacto</a>
        </nav>
        <a className="header-cta" href="#contacto">Hablemos <Arrow /></a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Wondergreen by Greenatics</p>
          <h1>Nutrir el suelo.<br /><em>Cerrar el ciclo.</em></h1>
          <p className="hero-lead">Wondergreen es la salida agrícola del ecosistema Greenatics: un portafolio de nutrición por etapas, fertilizantes organominerales y soluciones biológicas respaldado por experiencia real en transformación de residuos.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#wondergreen">Explorar Wondergreen <Arrow /></a>
            <a className="button button-secondary" href="#parque">Ver el sistema circular</a>
          </div>
          <div className="hero-proof" aria-label="Arquitectura Wondergreen">
            <div><strong>4</strong><span>líneas por etapa</span></div>
            <div><strong>3</strong><span>familias de solución</span></div>
            <div><strong>1</strong><span>sistema técnico</span></div>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-orbit orbit-one">Suelo</div><div className="hero-orbit orbit-two">Cultivo</div>
          <img src="/wondergreen-family.png" alt="Familia visual del portafolio Wondergreen" />
          <div className="hero-caption"><span>Nutrición por etapas</span><b>Suelo → crecimiento → balance → floración → producción</b></div>
        </div>
      </section>

      <section className="wondergreen-intro" id="wondergreen" aria-labelledby="wondergreen-title">
        <div className="intro-kicker"><span>Producto principal</span><p>El campo no necesita una fórmula repetida: necesita una decisión coherente con su etapa, suelo, clima y objetivo.</p></div>
        <div><p className="eyebrow">Sistema nutricional Wondergreen</p><h2 id="wondergreen-title">Cada momento del cultivo tiene una necesidad dominante.</h2></div>
      </section>

      <section className="line-gallery" aria-label="Líneas Wondergreen">
        {lines.map((line) => (
          <article className={`line-card ${line.cls}`} key={line.name}>
            <div className="line-art"><img src={line.image} alt={`Referencia visual aprobada de ${line.name}`} loading="lazy" /><span>{line.step}</span></div>
            <div className="line-copy">
              <p>{line.phase}</p><h3>{line.name}</h3><div className="formula"><b>{line.solid}</b><small>{line.liquid}</small></div><p className="line-description">{line.copy}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="portfolio-architecture">
        <div className="portfolio-heading"><p className="eyebrow">Un portafolio conectado</p><h2>Base orgánica, nutrición y biología.</h2><p>Wondergreen combina formatos y herramientas. La recomendación define producto, dosis, momento y vía; no una rutina universal.</p></div>
        <div className="portfolio-format-grid">
          <article className="format-card compost-format">
            <div className="format-image"><img src="/wg-compost.png" alt="Referencia visual de Compost Wondergreen" loading="lazy" /></div>
            <span>01 · Suelo</span><h3>Compost</h3><p>Materia orgánica y acondicionamiento como base del sistema, según calidad y lote.</p>
          </article>
          <article className="format-card solid-format"><div className="pellet-mini" aria-hidden="true"><i /><i /><i /><i /><i /></div><span>02 · Nutrición</span><h3>Sólidos peletizados</h3><p>Pellets organominerales ocluidos e irregulares para aplicación al suelo.</p></article>
          <article className="format-card liquid-format"><div className="liquid-mark">1:10</div><span>03 · Complemento</span><h3>Líquidos</h3><p>Dilución general 1:10 para 2GROW, 2BALANCE, 2BLOOM y 2FRUIT, salvo ficha validada distinta.</p></article>
          <article className="format-card bio-format"><div className="micro-grid" aria-hidden="true"><i>Tr</i><i>Bs</i><i>Bv</i><i>Mm</i></div><span>04 · Manejo integrado</span><h3>Bioinsumos</h3><p>Trichoderma, Bacillus subtilis, Beauveria, Metarhizium y extracto Ajo–Ají, según blanco y ficha.</p></article>
        </div>
      </section>

      <section className="pellet-science" id="organominerales" aria-labelledby="pellet-title">
        <div className="pellet-photo"><img src="/organomineral-pellets.png" alt="Pellets organominerales irregulares sobre suelo y raíces" loading="lazy" /><span>Pellet ocluido · matriz heterogénea</span></div>
        <div className="pellet-copy">
          <p className="eyebrow">La ciencia detrás del sólido</p><h2 id="pellet-title">No es una esfera. Es una matriz.</h2>
          <p>La oclusión integra componentes orgánicos y minerales dentro de un pellet irregular. Su comportamiento depende de formulación, humedad, suelo, actividad biológica, dosis y manejo.</p>
          <div className="matrix-flow" aria-label="Lógica de una matriz organomineral">
            <span><b>01</b>Matriz orgánica</span><i>+</i><span><b>02</b>Nutrientes minerales</span><i>→</i><span><b>03</b>Pellet ocluido</span>
          </div>
          <div className="science-points"><p><b>Aplicación al suelo</b>Con humedad y ubicación dentro de la zona radicular activa.</p><p><b>Disponibilidad condicionada</b>Puede modificar la cinética de nutrientes; no equivale a una promesa universal.</p></div>
        </div>
        <aside className="science-reference">
          <div><p className="eyebrow">Atlas visual validado</p><h3>Materia orgánica, nutrición, microbiología y raíz trabajan como sistema.</h3><p>Esta pieza conserva el lenguaje gráfico aprobado de Wondergreen. Las afirmaciones técnicas publicadas en el sitio se reconstruyen con la versión vigente de la información.</p></div>
          <img src="/wg-science.png" alt="Referencia gráfica aprobada sobre ciencia y suelo Wondergreen" loading="lazy" />
          <span>Referencia visual aprobada · no sustituye diagnóstico ni evidencia específica de producto</span>
        </aside>
      </section>

      <section className="crop-programs" aria-labelledby="crop-title">
        <div className="crop-heading"><p className="eyebrow">Programas por cultivo</p><h2 id="crop-title">La recomendación empieza con preguntas.</h2><p>Etapa, edad, densidad, suelo, humedad, drenaje, riego, carga, historial, síntomas, área y equipo determinan el programa.</p></div>
        <div className="crop-grid">{crops.map((crop, index) => <span key={crop}><b>{String(index + 1).padStart(2, "0")}</b>{crop}</span>)}</div>
        <div className="diagnostic-path"><article><span>01</span><strong>Diagnosticar</strong><p>Cultivo, suelo, agua y necesidad dominante.</p></article><article><span>02</span><strong>Definir etapa</strong><p>Crecimiento, balance, floración o producción.</p></article><article><span>03</span><strong>Elegir programa</strong><p>Producto + dosis + momento + vía.</p></article><article><span>04</span><strong>Medir y ajustar</strong><p>Respuesta, fitosanidad y siguiente decisión.</p></article></div>
      </section>

      <section className="system-bridge" aria-labelledby="bridge-title">
        <div><p className="eyebrow">Greenatics + Back2Green + Wondergreen</p><h2 id="bridge-title">Para devolver nutrientes al suelo, primero hay que construir bien todo el ciclo.</h2></div>
        <div className="bridge-flow"><span>Residuo local</span><i>→</i><span>Biotransformación</span><i>→</i><span>Wondergreen</span><i>→</i><span>Suelo y cultivo</span></div>
      </section>

      <section className="park-section" id="parque" aria-labelledby="park-title">
        <div className="park-heading"><div><p className="eyebrow">Parque ambiental modular</p><h2 id="park-title">Infraestructura que produce territorio.</h2></div><p>No es solo una planta. Es un sistema que puede integrar tratamiento, biofábrica, energía, formación, vivero y demostración agrícola, configurado para cada proyecto.</p></div>
        <div className="park-visual"><img src="/environmental-park.png" alt="Vista conceptual de un parque ambiental modular en territorio andino" loading="lazy" /><div className="park-badge"><span>Concepto visual</span><strong>La ingeniería definitiva depende de caracterización, lote, capacidad, permisos y balance de masa.</strong></div></div>
        <div className="park-module-grid">{parkModules.map(([index, title, copy]) => <article key={index}><span>{index}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
      </section>

      <section className="treatment-section" aria-labelledby="treatment-title">
        <div className="treatment-copy"><p className="eyebrow">Arquitectura de tratamiento</p><h2 id="treatment-title">Una entrada. Rutas tecnológicas complementarias.</h2><p>La caracterización define qué corriente va a compostaje, digestión, formulación o rechazo. Las flechas representan lógica de proceso, no una configuración universal.</p><img src="/legacy-plant-diagram.png" alt="Esquema conceptual histórico de tratamiento orgánico" loading="lazy" /></div>
        <div className="treatment-map">
          <div className="map-source"><span>01</span><strong>Recepción y acondicionamiento</strong><small>Pesaje · origen · impropios · preparación</small></div>
          <div className="map-split"><i>↙</i><i>↘</i></div>
          <div className="route-grid"><article className="solid-route"><span>Ruta sólida</span><strong>Compostaje</strong><i>→</i><strong>Maduración</strong><i>→</i><strong>Formulación / pellet</strong></article><article className="anaerobic-route"><span>Ruta anaerobia</span><strong>Digestión</strong><i>→</i><strong>Biogás</strong><i>+</i><strong>Corriente líquida</strong></article></div>
          <div className="map-return"><span>Retorno condicionado a calidad, control y destino</span><strong>Suelo · cultivo · energía local</strong></div>
        </div>
      </section>

      <section className="model-section" aria-labelledby="model-title">
        <div className="model-input"><p className="eyebrow">PTA estándar de referencia</p><h2 id="model-title">14 t/día</h2><span>Entrada modelada de residuos orgánicos</span></div>
        <div className="model-output-grid"><article><strong>≈4 t/d</strong><span>salida sólida</span></article><article><strong>≈1,6 m³/d</strong><span>salida líquida</span></article><article><strong>≈280 m³/d</strong><span>biogás</span></article><article><strong>≈1.680 kWh/d</strong><span>potencial energético</span></article></div>
        <p className="model-note">Modelo técnico preliminar del proyecto. No es un resultado auditado ni una promesa contractual; debe recalcularse para cada residuo, tecnología y territorio.</p>
      </section>

      <section className="services-section" id="soluciones" aria-labelledby="services-title">
        <div className="services-heading"><p className="eyebrow">Ecosistema Greenatics</p><h2 id="services-title">Diseñar, implementar, operar y encontrar salida.</h2></div>
        <div className="service-grid">{services.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="operation-section" id="impacto" aria-labelledby="operation-title">
        <div className="operation-photo"><img src="/plant-operation.jpg" alt="Infraestructura de tratamiento de residuos orgánicos" loading="lazy" /><div><span>Operación territorial</span><strong>La tecnología vale cuando se opera, se registra y mejora.</strong></div></div>
        <div className="operation-copy"><p className="eyebrow">Experiencia en Antioquia</p><h2 id="operation-title">Del discurso al dato.</h2><p>Greenatics articula infraestructura, personas, rutas, tratamiento y retorno agrícola. Cada caso conserva su periodo, metodología y condición de estimación.</p><div className="territory-list"><article><span>Yarumal</span><strong>Ruta selectiva + tratamiento</strong><p>Ciudadanía, Alcaldía, ESP y operación local.</p></article><article><span>Támesis</span><strong>Planta territorial + productos</strong><p>Salidas sólidas y líquidas conectadas con el territorio.</p></article></div></div>
      </section>

      <section className="impact-dashboard" aria-labelledby="yarumal-title">
        <div className="impact-copy"><p className="eyebrow">Caso Yarumal · enero–13 junio 2026</p><h2 id="yarumal-title">Cuando la ruta selectiva se convierte en impacto visible.</h2></div>
        <div className="impact-grid"><article className="impact-main"><span>Recibidos</span><strong>124,64 t</strong><p>Residuos orgánicos</p></article><article className="impact-ring"><div><b>95,92%</b></div><span>aprovechables estimados</span></article><article><strong>119,56 t</strong><span>aprovechables</span></article><article><strong>5,08 t</strong><span>rechazo estimado</span></article><article className="impact-accent"><strong>≈67,3 tCO₂e</strong><span>estimadas evitadas</span></article></div>
        <p className="impact-note">Estimaciones internas del periodo. Rechazo calculado con 20 kg por viaje; impacto climático sujeto a metodología y verificación.</p>
      </section>

      <section className="science-section" aria-labelledby="evidence-title">
        <div><p className="eyebrow">Ciencia con prudencia</p><h2 id="evidence-title">Explicamos el mecanismo. Medimos el resultado.</h2><p>La literatura respalda el estudio de matrices organominerales y el uso agronómico de materia orgánica, pero no permite extrapolar cualquier resultado a todos los productos, suelos o cultivos.</p></div>
        <div className="evidence-list"><a href="https://doi.org/10.3390/plants14203154" target="_blank" rel="noreferrer"><span>01</span><div><strong>Matrices organominerales</strong><small>Plants · 2025</small></div><Arrow /></a><a href="https://doi.org/10.3390/agriengineering7100343" target="_blank" rel="noreferrer"><span>02</span><div><strong>Respuesta agronómica específica</strong><small>AgriEngineering · 2025</small></div><Arrow /></a><a href="https://doi.org/10.3390/su132111635" target="_blank" rel="noreferrer"><span>03</span><div><strong>Eficiencia y condiciones de suelo</strong><small>Sustainability · 2021</small></div><Arrow /></a></div>
      </section>

      <section className="contact-section" id="contacto">
        <div><p className="eyebrow">Elige tu punto de entrada</p><h2>Productos para el campo. Sistemas para el territorio.</h2><p>Podemos comenzar por un diagnóstico agronómico, una oportunidad comercial Wondergreen, un residuo, una infraestructura existente o un proyecto municipal.</p></div>
        <div className="contact-panel"><a href="https://greenatics.org/contacto/" target="_blank" rel="noreferrer"><span>Comprar o distribuir Wondergreen</span><Arrow /></a><a href="https://greenatics.org/contacto/" target="_blank" rel="noreferrer"><span>Programa técnico para cultivo</span><Arrow /></a><a href="https://greenatics.org/contacto/" target="_blank" rel="noreferrer"><span>Planta, parque o biofábrica</span><Arrow /></a><a href="https://greenatics.org/contacto/" target="_blank" rel="noreferrer"><span>Municipio, ESP o generador</span><Arrow /></a></div>
      </section>

      <section className="faq-section"><div><p className="eyebrow">Preguntas frecuentes</p><h2>Lo esencial, sin promesas vacías.</h2></div><div><details><summary>¿Wondergreen reemplaza automáticamente toda la fertilización convencional?</summary><p>No. La transición depende de análisis, etapa, objetivo, suelo, productividad esperada y respuesta del cultivo.</p></details><details><summary>¿Qué significa dilución general 1:10?</summary><p>Una parte de producto líquido por diez partes de agua para las líneas indicadas, salvo ficha o recomendación técnica validada distinta.</p></details><details><summary>¿Todas las plantas producen las mismas salidas?</summary><p>No. El balance cambia con la caracterización, tecnología, operación, humedad, impropios y destino de los productos.</p></details><details><summary>¿Un NUIT implica remuneración automática?</summary><p>No. La arquitectura sectorial depende del prestador, contratos, metodología, reportes, permisos y decisiones aplicables.</p></details></div></section>

      <footer><a className="footer-brand" href="#inicio" aria-label="Volver al inicio"><img src="/greenatics-logo.png" alt="Greenatics" /></a><p>Economía circular · Biotecnología aplicada · Medellín, Colombia</p><div><a href="#wondergreen">Wondergreen</a><a href="#parque">Parques</a><a href="#inicio">Volver arriba ↑</a></div></footer>
    </main>
  );
}
