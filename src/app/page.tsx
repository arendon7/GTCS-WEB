import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeCropPrograms, HomeProjectEvidence } from "@/components/public-home-evidence-crops";
import { PublicShell } from "@/components/public-shell";
import styles from "./public-home.module.css";
import refresh from "./public-home-refresh.module.css";

export const metadata: Metadata = {
  title: "Greenatics | Transformamos residuos en vida",
  description:
    "Greenatics integra aprovechamiento de residuos orgánicos, tecnología, operación, Wondergreen, Casa & Jardín y conocimiento para devolver valor al territorio y al suelo.",
  alternates: { canonical: "/" },
};

const entryPoints = [
  {
    number: "01",
    kicker: "Producto agrícola",
    title: "Wondergreen",
    copy: "Fertilizantes organominerales sólidos y líquidos, compost, bioinsumos, guías por cultivo y acompañamiento técnico.",
    href: "/wondergreen",
    cta: "Conocer Wondergreen",
  },
  {
    number: "02",
    kicker: "Hogar · jardín · vivero",
    title: "Casa & Jardín",
    copy: "Nutrición por etapas, diagnóstico orientativo, kits de pre-lanzamiento y guías para plantas, huertas, jardines y viveros.",
    href: "/casa-jardin",
    cta: "Explorar Casa & Jardín",
  },
  {
    number: "03",
    kicker: "Territorios",
    title: "Municipios y ESP",
    copy: "Diagnóstico, rutas selectivas, plantas, rehabilitación, operación y trazabilidad para convertir planeación en capacidad real.",
    href: "/soluciones/esp-municipios",
    cta: "Soluciones para municipios y ESP",
  },
  {
    number: "04",
    kicker: "Generadores",
    title: "Empresas",
    copy: "Caracterización, separación, recolección, tratamiento, infraestructura y evidencia para corrientes orgánicas empresariales.",
    href: "/soluciones/empresas-grandes-generadores",
    cta: "Soluciones para empresas",
  },
  {
    number: "05",
    kicker: "Ingeniería + biología",
    title: "Plantas y tecnología",
    copy: "Compostaje, digestión anaerobia, biogás, biol, fertilizantes y operación basada en parámetros, mantenimiento y datos.",
    href: "/soluciones/infraestructura-plantas",
    cta: "Explorar infraestructura y plantas",
  },
  {
    number: "06",
    kicker: "Guías + decisión",
    title: "Conocimiento",
    copy: "Programas por cultivo, Casa & Jardín, deficiencias, criterios nutricionales y manuales convertidos en rutas navegables.",
    href: "/biblioteca",
    cta: "Abrir biblioteca",
  },
];

const identityPillars = [
  [
    "01",
    "Biotecnología aplicada",
    "Compostaje, digestión anaerobia, formulación organomineral y desarrollos biológicos se integran según el problema y la evidencia disponible.",
  ],
  [
    "02",
    "Economía circular",
    "La biomasa residual se entiende como un flujo que puede volver al territorio, al suelo y a sistemas productivos cuando existe una ruta técnica viable.",
  ],
  [
    "03",
    "Operación y acompañamiento",
    "Diagnóstico, diseño, puesta en marcha, operación, mantenimiento, seguimiento y datos conectan la solución con la ejecución real.",
  ],
];

const cycleMarks = [
  ["01", "Residuo", "Caracterizar"],
  ["02", "Bioproceso", "Transformar"],
  ["03", "Recurso", "Valorizar"],
  ["04", "Suelo", "Retornar"],
  ["05", "Datos", "Medir"],
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
  ["Guías por cultivo", "Café, cacao, aguacate, limón Tahití y pastos ya cuentan con programas técnicos navegables por etapa y contexto.", "/wondergreen/cultivos"],
  ["Deficiencias nutricionales", "Lectura de síntomas, posibles confundidores y comprobaciones antes de asumir que todo se resuelve aplicando fertilizante.", "/biblioteca/guia-deficiencias"],
  ["Uso Wondergreen", "Etapa, objetivo, formato, complemento, aplicación, seguimiento y ajuste como una ruta técnica, no una receta automática.", "/biblioteca/manual-uso-wondergreen"],
];

export default function Home() {
  return (
    <PublicShell>
      <div className={`${styles.publicSite} ${refresh.page}`}>
        <section className={`${styles.hero} ${refresh.hero}`}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Greenatics · Economía circular aplicada · Colombia</span>
              <h1>
                Transformar residuos <em>en vida.</em>
              </h1>
              <p className={styles.lead}>
                Diseñamos y operamos sistemas que conectan residuos orgánicos, tecnología, territorio, suelo, Wondergreen y datos. El objetivo no es mover el residuo de lugar: es devolverle una función dentro del ciclo productivo.
              </p>
              <div className={styles.buttonRow}>
                <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/wondergreen">Descubrir Wondergreen</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/soluciones">Explorar soluciones</Link>
              </div>
              <div className={styles.heroMeta} aria-label="Capacidades Greenatics">
                <span>Planeación</span>
                <span>Infraestructura</span>
                <span>Operación</span>
                <span>Producto</span>
                <span>Trazabilidad</span>
              </div>
            </div>

            <aside className={styles.cycleLedger} aria-label="Ciclo Greenatics: residuo, bioproceso, recurso, suelo y datos">
              <div className={styles.cycleLedgerTop}>
                <div className={styles.cycleSymbol}>
                  <Image src="/brand/greenatics-symbol.svg" alt="" aria-hidden="true" width={68} height={68} />
                </div>
                <div>
                  <span>El ciclo Greenatics</span>
                  <strong>Una cadena, no piezas sueltas.</strong>
                </div>
              </div>
              <div className={styles.cycleLedgerBody}>
                {cycleMarks.map(([number, title, action]) => (
                  <div className={styles.cycleLedgerRow} key={number}>
                    <span>{number}</span>
                    <strong>{title}</strong>
                    <small>{action}</small>
                  </div>
                ))}
              </div>
              <p className={styles.cycleLedgerFoot}>Residuo → recurso → suelo → evidencia.</p>
            </aside>
          </div>
        </section>

        <section className={styles.definition}>
          <div className={`${styles.container} ${styles.editorialSplit}`}>
            <div className={styles.sectionIndex}>01</div>
            <div>
              <span className={styles.eyebrow}>Qué es Greenatics</span>
              <h2>No tratamos una etapa. Diseñamos el ciclo completo.</h2>
            </div>
            <div className={styles.editorialCopy}>
              <p>
                Greenatics une dos puntas que suelen operar separadas: gestionar biomasa residual de manera técnicamente controlada y convertir parte de ese proceso en recursos que puedan retornar a sistemas productivos. Planeación, recolección, plantas, bioprocesos, operación, producto y datos se conectan en una misma lógica.
              </p>
              <Link className={styles.inlineLink} href="/soluciones">Ver la arquitectura de soluciones →</Link>
            </div>
          </div>
        </section>

        <section className={refresh.identity} aria-labelledby="home-identity-title">
          <div className={styles.container}>
            <div className={refresh.identityHead}>
              <div>
                <span className={styles.eyebrow}>Tres pilares Greenatics</span>
                <h2 id="home-identity-title">Tecnología, circularidad y operación deben funcionar juntas.</h2>
              </div>
              <p>
                El material comercial y la experiencia operativa convergen en una misma idea: una solución vale cuando puede entenderse, implementarse, operarse y seguirse en el tiempo.
              </p>
            </div>
            <div className={refresh.identityGrid}>
              {identityPillars.map(([number, title, copy]) => (
                <article className={refresh.identityCard} key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.paths} id="soluciones">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Seis puertas de entrada</span>
              <h2>Empieza por el problema que necesitas resolver.</h2>
              <p>La ruta cambia según el residuo, el cultivo, las plantas en casa, el territorio, la infraestructura o la información que necesitas.</p>
            </div>
            <div className={styles.pathGrid}>
              {entryPoints.map((item) => (
                <article className={`${styles.pathItem} ${refresh.pathItem}`} key={item.title}>
                  <div className={styles.pathTop}>
                    <span>{item.number}</span>
                    <small>{item.kicker}</small>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <Link href={item.href}>{item.cta} →</Link>
                </article>
              ))}
            </div>
            <div className={styles.router}>
              <div>
                <strong>¿Tienes un residuo, un cultivo, una planta o un proyecto por resolver?</strong>
                <span>Primero entendemos el caso; luego definimos producto, servicio, conocimiento o infraestructura.</span>
              </div>
              <Link className={`${styles.button} ${styles.buttonDark}`} href="/contacto">Hablar con Greenatics</Link>
            </div>
          </div>
        </section>

        <section className={styles.wondergreen} id="wondergreen">
          <div className={styles.container}>
            <div className={styles.wgHeader}>
              <div>
                <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Wondergreen · Producto agrícola</span>
                <Image className={styles.wgLogo} src="/brand/wondergreen-nutrients.webp" alt="Wondergreen Nutrients" width={420} height={221} sizes="(max-width: 720px) 78vw, 420px" />
                <h2>Más que NPK.</h2>
              </div>
              <div className={styles.wgLead}>
                <p>
                  Wondergreen integra suelo, nutrición, biología, conocimiento y acompañamiento. El portafolio se entiende como un sistema alrededor del cultivo y de su etapa, no como una colección de fórmulas aisladas.
                </p>
                <div className={styles.buttonRow}>
                  <Link className={`${styles.button} ${styles.buttonLight}`} href="/wondergreen/productos">Ver productos</Link>
                  <Link className={`${styles.button} ${styles.buttonOutlineLight}`} href="/wondergreen/cultivos">Buscar por cultivo</Link>
                  <Link className={`${styles.button} ${styles.buttonOutlineLight}`} href="/casa-jardin">Casa & Jardín</Link>
                </div>
              </div>
            </div>

            <div className={styles.wgSystem}>
              {wgSystem.map(([kicker, title, copy], index) => (
                <article key={title}>
                  <span className={styles.wgNumber}>0{index + 1}</span>
                  <small>{kicker}</small>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>

            <div className={styles.wgStats} aria-label="Arquitectura vigente del portafolio Wondergreen">
              <div><strong>5</strong><span>referencias líquidas</span></div>
              <div><strong>4</strong><span>referencias sólidas</span></div>
              <div><strong>+ compost</strong><span>y familia de bioinsumos</span></div>
              <p>Disponibilidad, composición, dosis y condición comercial se publican únicamente desde Product Truth vigente.</p>
            </div>
          </div>
        </section>

        <HomeCropPrograms />

        <HomeProjectEvidence />

        <section className={styles.chain}>
          <div className={styles.container}>
            <div className={styles.chainHeading}>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Cómo cerramos el ciclo</span>
              <h2>Del generador al dato. Del dato a la mejora.</h2>
              <p>La propuesta se vuelve concreta cuando cada eslabón tiene una función y una salida verificable.</p>
            </div>
            <div className={styles.chainGrid}>
              {chain.map(([number, title, copy]) => (
                <article className={styles.chainItem} key={number}>
                  <span>{number}</span>
                  <div><strong>{title}</strong><p>{copy}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.technology} id="tecnologia">
          <div className={`${styles.container} ${styles.techGrid}`}>
            <div className={styles.techCopy}>
              <span className={styles.eyebrow}>Wondergreen · Tecnología de sólidos</span>
              <h2>La formulación importa tanto como el número de la etiqueta.</h2>
              <p>
                En las referencias sólidas que correspondan, Wondergreen se explica desde la matriz organomineral, la oclusión y el peletizado. La web diferencia siempre una característica documentada del producto de cualquier efecto agronómico que todavía requiera evidencia específica.
              </p>
              <Link className={styles.inlineLink} href="/wondergreen/productos">Ir al Product Master público →</Link>
            </div>
            <div className={styles.techFlow}>
              {techSteps.map(([number, title, copy]) => (
                <div className={styles.techStep} key={number}>
                  <span>{number}</span>
                  <div><strong>{title}</strong><small>{copy}</small></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.knowledge} id="conocimiento">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Conocimiento que se usa</span>
              <h2>De documentos aislados a rutas técnicas navegables.</h2>
              <p>La biblioteca conecta cultivos, síntomas, criterios de diagnóstico y familias de producto sin convertir una lectura visual en una prescripción automática.</p>
            </div>
            <div className={styles.knowledgeGrid}>
              {knowledge.map(([title, copy, href], index) => (
                <article className={styles.knowledgeItem} key={title}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <Link href={href}>Abrir recurso →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.impact} id="impacto">
          <div className={`${styles.container} ${styles.impactGrid}`}>
            <div>
              <span className={styles.eyebrow}>Impacto conectado a la operación</span>
              <h2>Un dato verificable vale más que una cifra espectacular.</h2>
              <p>
                GREENATICS OPS conecta recepción, proceso, producción, inventario, comercial y otros dominios internos. La capa pública solo muestra indicadores conciliados, aprobados, fechados y con metodología cuando corresponda.
              </p>
              <div className={styles.buttonRow}>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/impacto">Ver impacto público</Link>
                <a className={`${styles.button} ${styles.buttonGhost}`} href="/app">Entrar a GREENATICS OPS</a>
              </div>
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
            <div>
              <span className={styles.eyebrow}>Greenatics</span>
              <h2>¿Qué quieres devolver al ciclo?</h2>
              <p>Un residuo, un cultivo, una planta o un territorio pueden ser el punto de entrada.</p>
            </div>
            <div className={styles.buttonRow}>
              <Link className={`${styles.button} ${styles.buttonDark}`} href="/contacto">Contactar a Greenatics</Link>
              <a className={`${styles.button} ${styles.buttonGhost}`} href="/app">Acceder a la app interna</a>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
