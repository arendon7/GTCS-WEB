import type { Metadata } from "next";
import Link from "next/link";
import styles from "./public-home.module.css";

export const metadata: Metadata = {
  title: "Greenatics | Transformamos residuos en vida",
  description:
    "Greenatics integra aprovechamiento de residuos orgánicos, tecnología, operación, Wondergreen y conocimiento para devolver valor al territorio y al suelo.",
};

const doors = [
  {
    kicker: "Producto agrícola",
    title: "Wondergreen",
    copy: "Fertilizantes organominerales sólidos y líquidos, compost, bioinsumos, guías por cultivo y acompañamiento técnico.",
    href: "/wondergreen",
    cta: "Conocer Wondergreen",
  },
  {
    kicker: "Territorios",
    title: "Municipios y ESP",
    copy: "Diagnóstico, rutas selectivas, plantas, rehabilitación, operación y trazabilidad para convertir planeación en capacidad real.",
    href: "/servicios#municipios",
    cta: "Explorar soluciones",
  },
  {
    kicker: "Generadores",
    title: "Empresas",
    copy: "Caracterización, separación, recolección, tratamiento, infraestructura y evidencia para corrientes orgánicas empresariales.",
    href: "/servicios#empresas",
    cta: "Explorar soluciones",
  },
  {
    kicker: "Ingeniería + biología",
    title: "Plantas y tecnología",
    copy: "Compostaje, digestión anaerobia, biogás, biol, fertilizantes y operación basada en parámetros, mantenimiento y datos.",
    href: "/servicios#infraestructura",
    cta: "Entender la tecnología",
  },
];

const chain = [
  ["01", "Entender", "Generadores, corriente, volumen, calidad, logística, infraestructura y restricciones."],
  ["02", "Separar y recolectar", "Protocolos, rutas selectivas, microrrutas y captura de datos."],
  ["03", "Transformar", "Compostaje, digestión anaerobia u otras rutas definidas por caracterización y escala."],
  ["04", "Operar", "Personal, procedimientos, mantenimiento, control de calidad, lotes e inventarios."],
  ["05", "Crear valor", "Compost, biol, fertilizantes organominerales, bioinsumos, biogás y otros destinos validados."],
  ["06", "Medir y mejorar", "GREENATICS OPS conecta operación, evidencia, indicadores y publicación controlada."],
];

const wgSystem = [
  ["Suelo", "Compost", "Materia orgánica y acondicionamiento como parte del sistema productivo."],
  ["Nutrición", "Sólidos", "4 referencias organominerales sólidas, con oclusión y peletizado cuando aplica a su versión técnica."],
  ["Ajuste", "Líquidos", "5 referencias líquidas para acompañar distintos momentos y objetivos del cultivo."],
  ["Biología", "Bioinsumos", "Microorganismos y extractos botánicos, incluidos Neem y Ajo–Ají, según estado y uso aprobado."],
  ["Decisión", "Conocimiento", "Guías por cultivo, diagnóstico orientativo, protocolos y acompañamiento técnico."],
];

const techSteps = [
  ["01", "Matriz orgánica", "Base orgánica estabilizada para formular el sistema."],
  ["02", "Formulación + oclusión", "Integración de componentes orgánicos y minerales según la referencia."],
  ["03", "Peletizado", "Formato físico homogéneo para aplicación y manejo en campo."],
  ["04", "Suelo + humedad + biología", "El producto entra a un sistema vivo, no a un sustrato inerte."],
  ["05", "Disponibilidad gradual", "La comunicación pública se limita a efectos respaldados por la versión y evidencia disponibles."],
];

const knowledge = [
  ["Guías por cultivo", "Café, cacao, aguacate, limón Tahití y pastos ya cuentan con programas web orientativos por etapa y contexto.", "/wondergreen/cultivos"],
  ["Deficiencias nutricionales", "Lectura de síntomas, posibles confundidores y comprobaciones antes de asumir que todo se resuelve aplicando fertilizante.", "/biblioteca/guia-deficiencias"],
  ["Uso Wondergreen", "Etapa, objetivo, formato, complemento, aplicación, seguimiento y ajuste como una ruta técnica, no una receta automática.", "/biblioteca"],
];

export default function Home() {
  return (
    <div className={styles.publicSite}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link className={styles.brandLink} href="/" aria-label="Greenatics, inicio">
            <img className={styles.brandLogo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
          </Link>
          <nav className={styles.nav} aria-label="Navegación pública">
            <Link href="/servicios">Soluciones</Link>
            <Link href="/wondergreen">Wondergreen</Link>
            <a href="#tecnologia">Tecnología</a>
            <Link href="/biblioteca">Conocimiento</Link>
            <a href="#impacto">Impacto</a>
          </nav>
          <div className={styles.headerActions}>
            <a className={`${styles.button} ${styles.buttonGhost}`} href="#contacto">Contacto</a>
            <Link className={`${styles.button} ${styles.buttonDark}`} href="/app">Acceder a Greenatics</Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <div className={styles.heroBrand}>
                <img src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
              </div>
              <span className={styles.eyebrow}>Economía circular aplicada · Colombia</span>
              <h1>
                Convertimos residuos orgánicos en <em>sistemas que devuelven valor al territorio y al suelo.</em>
              </h1>
              <p className={styles.lead}>
                Greenatics conecta planeación, aprovechamiento, plantas, biotecnología, operación, Wondergreen y datos. No trabajamos una etapa aislada: diseñamos cómo el residuo entra, se transforma, se controla y vuelve al ciclo productivo.
              </p>
              <div className={styles.buttonRow}>
                <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/wondergreen">Descubrir Wondergreen</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/servicios">Conocer nuestras soluciones</Link>
              </div>
            </div>

            <div className={styles.cycleVisual} aria-label="Ciclo Greenatics: residuo, bioproceso, recurso, suelo y datos">
              <div className={styles.cycleCenter}>
                <img src="/brand/greenatics-symbol.svg" alt="" aria-hidden="true" />
              </div>
              <div className={`${styles.cycleNode} ${styles.node1}`}><strong>01</strong><span>Residuo</span></div>
              <div className={`${styles.cycleNode} ${styles.node2}`}><strong>02</strong><span>Bioproceso</span></div>
              <div className={`${styles.cycleNode} ${styles.node3}`}><strong>03</strong><span>Recurso</span></div>
              <div className={`${styles.cycleNode} ${styles.node4}`}><strong>04</strong><span>Suelo</span></div>
              <div className={`${styles.cycleNode} ${styles.node5}`}><strong>05</strong><span>Datos</span></div>
            </div>
          </div>
        </section>

        <section className={styles.definition}>
          <div className={`${styles.container} ${styles.definitionGrid}`}>
            <div>
              <span className={styles.eyebrow}>Qué es Greenatics</span>
              <h2>Una plataforma de aprovechamiento orgánico con una cadena completa de servicios, tecnología y producto.</h2>
            </div>
            <div>
              <p>
                No somos únicamente una empresa de fertilizantes y tampoco únicamente una empresa de residuos. Greenatics une ambas puntas: gestionar biomasa residual de manera técnicamente controlada y convertir parte de ese proceso en recursos que puedan retornar a sistemas productivos, con información suficiente para operar, medir y aprender.
              </p>
              <Link className={styles.inlineLink} href="/servicios">Ver cómo cerramos el ciclo →</Link>
            </div>
          </div>
        </section>

        <section className={styles.doors} id="soluciones">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Cuatro puertas de entrada</span>
              <h2>Empieza por lo que necesitas resolver hoy.</h2>
            </div>
            <div className={styles.doorGrid}>
              {doors.map((item) => (
                <article className={styles.doorCard} key={item.title}>
                  <span className={styles.eyebrow}>{item.kicker}</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <Link href={item.href}>{item.cta} →</Link>
                </article>
              ))}
            </div>
            <div className={styles.router}>
              <div>
                <strong>¿Tienes un residuo, un cultivo o un proyecto por resolver?</strong>
                <span>La web irá enrutando cada caso antes de recomendar producto, planta o servicio.</span>
              </div>
              <a className={`${styles.button} ${styles.buttonDark}`} href="#contacto">Hablar con Greenatics</a>
            </div>
          </div>
        </section>

        <section className={styles.chain}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Cómo cerramos el ciclo</span>
              <h2>Del generador al dato y del dato a la mejora.</h2>
              <p>La propuesta se vuelve concreta cuando cada eslabón tiene una función y una salida verificable.</p>
            </div>
            <div className={styles.chainGrid}>
              {chain.map(([number, title, copy]) => (
                <article className={styles.chainCard} key={number}>
                  <span>{number}</span><strong>{title}</strong><p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.wondergreen} id="wondergreen">
          <div className={styles.container}>
            <div className={styles.wgIntro}>
              <div>
                <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Wondergreen · producto agrícola</span>
                <img className={styles.wgLogo} src="/brand/wondergreen-nutrients.webp" alt="Wondergreen Nutrients" width="420" height="221" />
                <h2>Suelo, nutrición y biología trabajando como un sistema.</h2>
              </div>
              <div>
                <p>
                  Wondergreen integra materia orgánica, fertilizantes organominerales sólidos y líquidos, compost y bioinsumos dentro de programas pensados alrededor del cultivo, su etapa, condición y objetivo.
                </p>
                <div className={styles.wgStats}>
                  <div className={styles.wgStat}><strong>5</strong><span>referencias líquidas</span></div>
                  <div className={styles.wgStat}><strong>4</strong><span>referencias sólidas</span></div>
                  <div className={styles.wgStat}><strong>+ compost</strong><span>y familia de bioinsumos</span></div>
                </div>
              </div>
            </div>

            <div className={styles.wgSystem}>
              {wgSystem.map(([kicker, title, copy]) => (
                <article key={title}>
                  <span>{kicker}</span><h3>{title}</h3><p>{copy}</p>
                </article>
              ))}
            </div>
            <div className={styles.buttonRow}>
              <Link className={`${styles.button} ${styles.buttonLight}`} href="/wondergreen">Explorar Wondergreen</Link>
              <Link className={`${styles.button} ${styles.buttonOutlineLight}`} href="/wondergreen/cultivos">Ver conocimiento por cultivo</Link>
            </div>
          </div>
        </section>

        <section className={styles.technology} id="tecnologia">
          <div className={`${styles.container} ${styles.techGrid}`}>
            <div className={styles.techCopy}>
              <span className={styles.eyebrow}>Wondergreen · Más que NPK</span>
              <h2>Una forma diferente de integrar nutrientes y materia orgánica en el suelo.</h2>
              <p>
                En las referencias sólidas que correspondan, la tecnología Wondergreen se explica desde la matriz organomineral, la oclusión y el peletizado. La web diferenciará siempre entre una característica documentada del producto y un efecto agronómico que todavía requiera evidencia específica.
              </p>
            </div>
            <div className={styles.techFlow}>
              {techSteps.map(([number, title, copy]) => (
                <div className={styles.techStep} key={number}>
                  <span>{number}</span><div><strong>{title}</strong><small>{copy}</small></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.knowledge} id="conocimiento">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Conocimiento que se usa</span>
              <h2>Las guías dejan de vivir escondidas en un PDF.</h2>
              <p>El conocimiento ya construido en Greenatics Marketing Studio ya se convierte en rutas web conectadas a cultivos, productos, síntomas y acompañamiento.</p>
            </div>
            <div className={styles.knowledgeGrid}>
              {knowledge.map(([title, copy, href]) => (
                <article className={styles.knowledgeCard} key={title}>
                  <span className={styles.eyebrow}>Biblioteca Wondergreen</span><h3>{title}</h3><p>{copy}</p><Link href={href}>Abrir recurso →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.impact} id="impacto">
          <div className={`${styles.container} ${styles.impactGrid}`}>
            <div>
              <span className={styles.eyebrow}>Impacto conectado a la operación</span>
              <h2>Preferimos un dato pendiente a una cifra espectacular sin trazabilidad.</h2>
              <p>
                GREENATICS OPS conecta recepción, proceso, producción, inventario, comercial y otros dominios internos. La capa pública solo mostrará indicadores conciliados, aprobados, fechados y con metodología cuando corresponda.
              </p>
              <Link className={`${styles.button} ${styles.buttonGhost}`} href="/app">Entrar a GREENATICS OPS</Link>
            </div>
            <div className={styles.console}>
              <div className={styles.consoleTop}><span>GREENATICS · IMPACTO</span><span className={styles.live}>publicación gobernada</span></div>
              <div className={styles.metric}><span>Residuos aprovechados</span><strong>—</strong><small>Pendiente corte conciliado</small></div>
              <div className={styles.metric}><span>Producto generado</span><strong>—</strong><small>Fuente futura: GREENATICS OPS</small></div>
              <div className={styles.metric}><span>Indicadores ambientales</span><strong>—</strong><small>Metodología + aprobación requeridas</small></div>
            </div>
          </div>
        </section>

        <section className={styles.closing} id="contacto">
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Greenatics</span><h2>¿Tienes un residuo, un cultivo, una planta o un territorio por transformar?</h2></div>
            <div className={styles.buttonRow}>
              <a className={`${styles.button} ${styles.buttonDark}`} href="#contacto">Contactar a Greenatics</a>
              <Link className={`${styles.button} ${styles.buttonGhost}`} href="/app">Acceder a la app interna</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <img className={styles.footerLogo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
            <p>Transformamos residuos en vida mediante tecnología, operación, conocimiento y soluciones que vuelven al suelo.</p>
          </div>
          <div className={styles.footerLinks}>
            <strong>Explorar</strong>
            <Link href="/servicios">Soluciones</Link><Link href="/wondergreen">Wondergreen</Link><a href="#tecnologia">Tecnología</a><Link href="/biblioteca">Conocimiento</Link>
          </div>
          <div className={styles.footerLinks}>
            <strong>Plataforma</strong>
            <Link href="/app">GREENATICS OPS</Link><a href="#contacto">Contacto</a>
          </div>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>© Greenatics S.A.S. · Plataforma pública + GREENATICS OPS</div>
      </footer>
    </div>
  );
}
