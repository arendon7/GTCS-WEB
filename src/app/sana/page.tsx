import type { Metadata } from "next";
import Link from "next/link";
import "./sana-v1.css";

export const metadata: Metadata = {
  title: "SANA | Estructura y seguimiento de proyectos agroproductivos",
  description:
    "Conoce SANA: un ecosistema en desarrollo para ordenar oportunidades agroproductivas, su alcance, seguimiento, documentación y revisión humana.",
  alternates: { canonical: "/sana/" },
  openGraph: {
    title: "SANA | Estructura y seguimiento de proyectos agroproductivos | Greenatics",
    description:
      "Una ruta para pasar del contexto productivo a un proyecto organizado, con responsabilidades, soportes y próximos pasos revisables.",
    url: "/sana/",
  },
};

const modules = [
  {
    number: "01",
    title: "Oportunidades",
    copy: "Describe la necesidad productiva, el territorio, las personas involucradas y la etapa en la que está la iniciativa.",
    destination: "/sana/app/#opportunities",
    action: "Ver oportunidades",
  },
  {
    number: "02",
    title: "Portafolio",
    copy: "Agrupa proyectos y hace legibles su alcance, supuestos, hitos y estado declarado.",
    destination: "/sana/app/#portfolio",
    action: "Ver portafolio",
  },
  {
    number: "03",
    title: "Seguimiento",
    copy: "Conecta una próxima acción con su responsable, periodo y evidencia que se necesitaría revisar.",
    destination: "/sana/app/#followup",
    action: "Ver seguimiento",
  },
  {
    number: "04",
    title: "Documentación",
    copy: "Ordena categorías de soporte y los datos necesarios para interpretar su origen, versión y revisión.",
    destination: "/sana/app/#data-room",
    action: "Ver documentación",
  },
  {
    number: "05",
    title: "Revisión humana",
    copy: "Pone a la vista condiciones pendientes para que las personas responsables las analicen con contexto.",
    destination: "/sana/app/#committee",
    action: "Ver revisión",
  },
  {
    number: "06",
    title: "Participación",
    copy: "Distingue interés, solicitud, revisión, compromiso, documentación y aporte conciliado.",
    destination: "/sana/app/#participation",
    action: "Ver participación",
  },
] as const;

const stages = [
  { title: "Entender", copy: "Contexto, actores y territorio" },
  { title: "Estructurar", copy: "Alcance, recursos y supuestos" },
  { title: "Acompañar", copy: "Hitos, responsables y soportes" },
  { title: "Revisar", copy: "Faltantes y criterio humano" },
  { title: "Acordar", copy: "Siguientes pasos y condiciones" },
] as const;

export default function SanaPage() {
  return (
    <div className="sana-v1-page">
      <section className="sana-v1-hero" aria-labelledby="sana-title">
        <div className="sana-v1-shell sana-v1-hero__grid">
          <div className="sana-v1-hero__copy">
            <p className="sana-v1-status">Estructuración agroproductiva <span aria-hidden="true">·</span> en desarrollo</p>
            <h1 id="sana-title">De la oportunidad productiva a un proyecto que se puede revisar.</h1>
            <p className="sana-v1-lead">
              SANA reúne el contexto de una iniciativa, organiza su alcance y conecta
              avances, responsables y soportes en una misma ruta de trabajo. Así,
              quienes la estructuran y quienes la revisan pueden entender qué se sabe,
              qué falta y cuál podría ser el siguiente paso.
            </p>
            <div className="sana-v1-actions">
              <Link className="sana-v1-button sana-v1-button--primary" href="/sana/app/#overview">
                Recorrer la muestra <span aria-hidden="true">→</span>
              </Link>
              <Link className="sana-v1-text-link" href="/contacto/?interes=sana">
                Conversar sobre un proyecto
              </Link>
            </div>
            <div className="sana-v1-audience" aria-label="Personas a quienes acompaña el modelo">
              <span>Para quienes estructuran proyectos</span>
              <span aria-hidden="true">+</span>
              <span>y para quienes los revisan o acompañan</span>
            </div>
          </div>

          <figure className="sana-v1-product-figure sana-v1-product-figure--hero">
            <div className="sana-v1-product-window" aria-label="Mockup conceptual del resumen de SANA">
              <div className="sana-v1-window-bar">
                <div className="sana-v1-window-brand"><strong>SANA</strong><span>Espacio de proyectos</span></div>
                <span className="sana-v1-window-pill"><i aria-hidden="true" /> Muestra conceptual</span>
              </div>
              <div className="sana-v1-app-frame">
                <div className="sana-v1-app-rail" aria-hidden="true">
                  <span className="is-active">Resumen</span><span>Oportunidades</span><span>Portafolio</span><span>Seguimiento</span><span>Documentación</span><span>Revisión</span><span>Participación</span>
                </div>
                <div className="sana-v1-app-main">
                  <div className="sana-v1-app-heading"><div><span className="sana-v1-eyebrow">VISTA GENERAL</span><h2>Proyectos en contexto</h2><p>Una lectura común para preparar el siguiente paso.</p></div><span className="sana-v1-app-filter">Todos los proyectos <b aria-hidden="true">⌄</b></span></div>
                  <div className="sana-v1-app-stats">
                    <div><span>Oportunidad de muestra</span><strong>Café de montaña</strong><small>OP-014 · escenario ficticio</small></div>
                    <div><span>Personas productoras</span><strong>12</strong><small>dato de ejemplo</small></div>
                    <div><span>Lotes</span><strong>18</strong><small>dato de ejemplo</small></div>
                  </div>
                  <div className="sana-v1-project-card">
                    <div className="sana-v1-project-card__top"><div><span className="sana-v1-project-tag">PORTAFOLIO · PF-024</span><h3>Proyecto de café de montaña</h3><p>Alcance, avance declarado y asuntos por revisar</p></div><span className="sana-v1-status-chip">En estructuración</span></div>
                    <div className="sana-v1-project-progress"><div><span>Avance de ejemplo</span><strong>32%</strong></div><div className="sana-v1-progress-track"><span /></div><small>No es una medición verificada</small></div>
                    <div className="sana-v1-next-step"><span className="sana-v1-next-step__icon" aria-hidden="true">↗</span><div><small>PRÓXIMO ASUNTO</small><strong>Validar cosecha del ciclo principal</strong><span>Seguimiento SEG-108 · falta soporte verificable</span></div><b>Revisión pendiente</b></div>
                  </div>
                  <div className="sana-v1-app-foot"><span><i aria-hidden="true" /> Escenario ficticio</span><span>Sin archivos reales · sin datos guardados</span></div>
                </div>
              </div>
            </div>
            <figcaption>Mockup de la vista general. Los nombres, cantidades y estados son de una muestra ficticia.</figcaption>
          </figure>
        </div>
      </section>

      <section className="sana-v1-purpose" aria-labelledby="sana-purpose-title">
        <div className="sana-v1-shell sana-v1-purpose__grid">
          <div>
            <p className="sana-v1-section-kicker">QUÉ HACE SANA</p>
            <h2 id="sana-purpose-title">Le da estructura compartida a una iniciativa que todavía necesita definirse.</h2>
          </div>
          <div className="sana-v1-purpose__copy">
            <p>Conectamos conocimiento técnico, proyectos agrícolas e inversión. La propuesta de SANA articula inversión, trazabilidad agrícola de AGROWAY, ciencia de Greenatics y soluciones Wondergreen para dar contexto a cada iniciativa productiva y acompañar su desarrollo.</p>
            <p>Del contexto productivo a un siguiente paso claro. Primero se entiende la oportunidad: con esa lectura se acuerda el marco de trabajo y el acompañamiento conecta el plan con su avance. SANA ordena la información y prepara revisiones; las personas responsables conservan el criterio sobre calidad, viabilidad y participación, de acuerdo con la evidencia disponible.</p>
            <p>Esta es la visión del producto. La muestra actual usa información ficticia y no está conectada con datos de AGROWAY ni con operaciones o inversiones reales.</p>
            <Link className="sana-v1-text-link" href="#modulos">Conocer los seis módulos <span aria-hidden="true">↓</span></Link>
          </div>
        </div>
      </section>

      <section className="sana-v1-process" id="como-funciona" aria-labelledby="sana-process-title">
        <div className="sana-v1-shell sana-v1-process__layout">
          <header>
            <p className="sana-v1-section-kicker">UNA RUTA DE TRABAJO</p>
            <h2 id="sana-process-title">Del contexto al siguiente paso, sin saltarse la revisión.</h2>
            <p>La secuencia ayuda a identificar qué está definido y qué necesita conversación, evidencia o acuerdo.</p>
          </header>
          <ol className="sana-v1-stages">
            {stages.map((stage, index) => (
              <li key={stage.title}>
                <span className="sana-v1-stage-index">0{index + 1}</span>
                <div><h3>{stage.title}</h3><p>{stage.copy}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sana-v1-modules" id="modulos" aria-labelledby="sana-modules-title">
        <div className="sana-v1-shell">
          <header className="sana-v1-modules__intro">
            <div><p className="sana-v1-section-kicker">LA PLATAFORMA</p><h2 id="sana-modules-title">Seis módulos para seguir el hilo de cada proyecto.</h2></div>
            <p>El resumen conecta las piezas; cada módulo enfoca una tarea concreta. En la muestra puedes abrir los registros de ejemplo y recorrer sus relaciones.</p>
          </header>
          <div className="sana-v1-module-grid">
            {modules.map((item) => (
              <article key={item.number} className="sana-v1-module-card">
                <span className="sana-v1-module-card__number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <Link href={item.destination}>{item.action}<span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sana-v1-detail" aria-labelledby="sana-detail-title">
        <div className="sana-v1-shell sana-v1-detail__grid">
          <figure className="sana-v1-product-figure sana-v1-product-figure--detail">
            <div className="sana-v1-review-window" aria-label="Mockup conceptual de seguimiento y revisión humana">
              <div className="sana-v1-review-head"><div><span className="sana-v1-eyebrow">SEGUIMIENTO · SEG-108</span><h3>Validar cosecha del ciclo principal</h3><p>Proyecto de café de montaña · PF-024</p></div><span className="sana-v1-review-badge">Pendiente de revisión</span></div>
              <div className="sana-v1-review-body">
                <div className="sana-v1-review-task"><span>PRÓXIMA ACCIÓN</span><strong>Contrastar el registro de cosecha con el soporte y el periodo correspondiente.</strong><small>Responsable de ejemplo: comité técnico</small></div>
                <div className="sana-v1-review-evidence"><div><span className="sana-v1-document-icon" aria-hidden="true">▤</span><div><strong>Resumen de seguimiento productivo</strong><small>Referencia DR-221 · no hay archivo adjunto</small></div></div><span className="sana-v1-evidence-state">Sin soporte</span></div>
                <div className="sana-v1-review-note"><span aria-hidden="true">i</span><p>Con la información de esta muestra, la decisión asociada no es evaluable. Una persona tendría que revisar los soportes y las condiciones aplicables.</p></div>
              </div>
              <div className="sana-v1-review-footer"><span>Ficha de demostración</span><span>Datos ficticios · revisión no ejecutada</span></div>
            </div>
            <figcaption>Mockup de seguimiento y revisión. Muestra cómo se relacionan una acción, un soporte esperado y una condición pendiente.</figcaption>
          </figure>
          <div className="sana-v1-detail__copy">
            <p className="sana-v1-section-kicker">DEL REGISTRO A LA CONVERSACIÓN</p>
            <h2 id="sana-detail-title">No es solo una lista de proyectos: importa cómo se conectan.</h2>
            <p>Una oportunidad puede convertirse en un proyecto de portafolio. Ese proyecto puede tener hitos, responsables y referencias documentales; cuando algo requiere atención, la revisión muestra qué falta antes de considerar una decisión.</p>
            <ul>
              <li><strong>Contexto:</strong> de qué iniciativa se habla y quiénes participan.</li>
              <li><strong>Seguimiento:</strong> cuál es la próxima acción y quién la revisaría.</li>
              <li><strong>Soporte:</strong> qué evidencia se necesitaría y si está disponible.</li>
              <li><strong>Decisión:</strong> qué condición sigue pendiente de análisis humano.</li>
            </ul>
            <Link className="sana-v1-button sana-v1-button--primary" href="/sana/app/#opportunities">Explorar este recorrido <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="sana-v1-ecosystem" aria-labelledby="sana-ecosystem-title">
        <div className="sana-v1-shell">
          <div className="sana-v1-ecosystem__intro">
            <div><p className="sana-v1-section-kicker">VISIÓN DE ECOSISTEMA</p><h2 id="sana-ecosystem-title">Dos aplicaciones, responsabilidades separadas.</h2></div>
            <p>Un proyecto puede necesitar tanto seguimiento de su gestión como trazabilidad de lo que ocurre en campo. La visión de SANA contempla conectar esos contextos sin mezclar quién mantiene cada registro.</p>
          </div>
          <div className="sana-v1-ecosystem-map" aria-label="Visión futura de lectura autorizada desde AgroWay hacia SANA">
            <article className="sana-v1-ecosystem-node">
              <span className="sana-v1-ecosystem-node__eyebrow">OPERACIÓN AGRÍCOLA</span>
              <h3>AgroWay</h3>
              <p>Registros del cultivo y su operación permanecen en la herramienta agrícola.</p>
              <span className="sana-v1-ecosystem-node__owner">Conserva la fuente de campo</span>
            </article>
            <div className="sana-v1-ecosystem-bridge">
              <span>Lectura autorizada futura</span>
              <div aria-hidden="true"><i /><b>→</b></div>
              <small>Por proyecto · solo lectura</small>
            </div>
            <article className="sana-v1-ecosystem-node sana-v1-ecosystem-node--sana">
              <span className="sana-v1-ecosystem-node__eyebrow">GESTIÓN DEL PROYECTO</span>
              <h3>SANA</h3>
              <p>Alcance, portafolio, seguimiento y revisión humana en su propio contexto.</p>
              <span className="sana-v1-ecosystem-node__owner">Organiza el proyecto y sus decisiones</span>
            </article>
          </div>
          <p className="sana-v1-ecosystem-note"><strong>Estado actual:</strong> esta conexión es una dirección de diseño; la muestra local no está conectada con AgroWay ni usa datos de campo.</p>
        </div>
      </section>

      <section className="sana-v1-boundaries" aria-labelledby="sana-boundaries-title">
        <div className="sana-v1-shell sana-v1-boundaries__grid">
          <div><p className="sana-v1-section-kicker">ESTADO Y ALCANCE</p><h2 id="sana-boundaries-title">Una muestra para entender el modelo, no para tramitar un proyecto real.</h2></div>
          <div className="sana-v1-boundaries__items">
            <article><span aria-hidden="true">01</span><div><h3>Qué puedes explorar</h3><p>Vistas, módulos y relaciones entre registros ficticios. La selección ocurre en tu navegador y no se guarda ni se comparte.</p></div></article>
            <article><span aria-hidden="true">02</span><div><h3>Qué requiere una operación real</h3><p>Proyectos y documentos autorizados, responsables definidos, controles de acceso, persistencia y procesos de revisión acordados.</p></div></article>
            <article><span aria-hidden="true">03</span><div><h3>Qué no hace esta muestra</h3><p>No recibe solicitudes, aprueba proyectos, acepta o transfiere inversiones, registra aportes ni estima rendimientos.</p></div></article>
          </div>
        </div>
      </section>

      <section className="sana-v1-cta" aria-labelledby="sana-contact-title">
        <div className="sana-v1-shell sana-v1-cta__inner">
          <div><p className="sana-v1-section-kicker">CONVERSEMOS</p><h2 id="sana-contact-title">¿Estás estructurando una iniciativa agroproductiva?</h2><p>Cuéntanos su contexto, etapa y qué necesitas organizar para explorar un posible alcance de acompañamiento.</p></div>
          <Link className="sana-v1-button sana-v1-button--light" href="/contacto/?interes=sana">Conversar sobre un proyecto <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
