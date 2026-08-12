import type { Metadata } from "next";
import Link from "next/link";
import styles from "./wondergreen.module.css";

export const metadata: Metadata = {
  title: "Wondergreen | Suelo, nutrición y biología",
  description:
    "Wondergreen integra fertilizantes sólidos y líquidos, compost, bioinsumos, guías por cultivo y acompañamiento técnico.",
};

const entryPaths = [
  ["Tengo un cultivo", "Empieza por especie, etapa y objetivo antes de elegir producto.", "#cultivos"],
  ["Tengo una necesidad", "Nutrición, suelo, floración, producción, raíz, plagas o enfermedades.", "#finder"],
  ["Sé qué producto busco", "Entra al mapa del portafolio por familia y formato.", "#portafolio"],
];

const system = [
  ["01", "Suelo", "Compost y materia orgánica como parte de la base del sistema."],
  ["02", "Nutrición", "Fertilizantes sólidos y líquidos organizados por etapa y objetivo."],
  ["03", "Biología", "Microorganismos y extractos botánicos según necesidad y estado aprobado."],
  ["04", "Conocimiento", "Guías de cultivo, deficiencias, protocolos y criterios de uso."],
  ["05", "Acompañamiento", "La recomendación final considera lote, análisis, agua y manejo."],
];

const solids = ["2Grow 15-3-3", "2Balance 7-7-7", "2Bloom 3-8-3", "2Fruit 3-3-8"];
const bioinputs = ["Trichoderma", "Metarhizium", "Beauveria", "Bacillus subtilis", "Micorrizas", "Extracto de Neem", "Extracto Ajo–Ají"];

const tech = [
  ["01", "Matriz orgánica", "Base orgánica estabilizada."],
  ["02", "Formulación", "Integración de los componentes según la referencia."],
  ["03", "Oclusión", "Incorporación de nutrientes dentro de la matriz organomineral cuando corresponde."],
  ["04", "Peletizado", "Formato físico homogéneo para manejo y aplicación al suelo."],
  ["05", "Interacción con el suelo", "Humedad, raíz y biología forman parte del contexto de disponibilidad."],
];

const crops = [
  ["Café", "Etapas, señales nutricionales y programas orientativos."],
  ["Cacao", "Establecimiento, formación, floración y producción."],
  ["Aguacate", "Lectura por etapa y condición del cultivo."],
  ["Limón Tahití", "Nutrición, síntomas y manejo por ciclo."],
  ["Pastos", "Establecimiento, recuperación y manejo productivo."],
];

const audiences = [
  ["Productor", "Encuentra una ruta técnica para tu cultivo.", "Encontrar solución"],
  ["Agrotienda / distribuidor", "Conoce familias, formatos y oportunidad comercial.", "Quiero vender Wondergreen"],
  ["Agrónomo / técnico", "Accede a portafolio, guías y soporte técnico.", "Conocer portafolio técnico"],
];

export default function WondergreenPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" aria-label="Volver a Greenatics">
            <img className={styles.headerLogo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
          </Link>
          <nav className={styles.nav} aria-label="Navegación Wondergreen">
            <a href="#portafolio">Portafolio</a>
            <a href="#tecnologia">Tecnología</a>
            <a href="#bioinsumos">Bioinsumos</a>
            <a href="#cultivos">Cultivos</a>
          </nav>
          <Link className={`${styles.button} ${styles.dark}`} href="/app">Acceder a Greenatics</Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Una marca Greenatics</span>
              <img className={styles.wgLogo} src="/brand/wondergreen-nutrients.webp" alt="Wondergreen Nutrients" width="420" height="221" />
              <h1>Nutrición que vuelve a la tierra.</h1>
              <p className={styles.lead}>
                Wondergreen reúne soluciones de nutrición, regeneración del suelo y manejo biológico para acompañar cada cultivo según su etapa, condición y objetivo.
              </p>
              <div className={styles.buttonRow}>
                <a className={`${styles.button} ${styles.primary}`} href="#finder">Encontrar mi solución</a>
                <a className={`${styles.button} ${styles.ghost}`} href="#portafolio">Ver productos</a>
              </div>
            </div>
            <div className={styles.heroVisual} aria-label="Sistema Wondergreen: suelo, nutrición, biología, conocimiento y acompañamiento">
              <div className={styles.orbit} />
              <div className={styles.heroCore}>WONDERGREEN<br />COMO SISTEMA</div>
              <div className={`${styles.orbitCard} ${styles.o1}`}><span>Suelo</span><strong>Compost</strong></div>
              <div className={`${styles.orbitCard} ${styles.o2}`}><span>Nutrición</span><strong>Sólidos</strong></div>
              <div className={`${styles.orbitCard} ${styles.o3}`}><span>Ajuste</span><strong>Líquidos</strong></div>
              <div className={`${styles.orbitCard} ${styles.o4}`}><span>Biología</span><strong>Bioinsumos</strong></div>
              <div className={`${styles.orbitCard} ${styles.o5}`}><span>Decisión</span><strong>Guías + asesoría</strong></div>
            </div>
          </div>
        </section>

        <section className={styles.entry}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Empieza por tu cultivo</span>
              <h2>No empieces por el producto. Empieza por lo que tu cultivo necesita.</h2>
              <p>La selección cambia con cultivo, suelo, etapa, problema y objetivo. Wondergreen organiza el portafolio para hacer esa ruta más clara.</p>
            </div>
            <div className={styles.entryGrid}>
              {entryPaths.map(([title, copy, href]) => (
                <article className={styles.entryCard} key={title}>
                  <h3>{title}</h3><p>{copy}</p><a href={href}>Continuar →</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.system}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>El sistema Wondergreen</span>
              <h2>Una solución no siempre es un solo producto.</h2>
            </div>
            <div className={styles.systemGrid}>
              {system.map(([number, title, copy]) => (
                <article className={styles.systemCard} key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.portfolio} id="portafolio">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={`${styles.eyebrow} ${styles.lightEyebrow}`}>Portafolio Wondergreen</span>
              <h2>Dos grandes líneas dentro de una misma marca.</h2>
              <p>Fertilizantes y bioinsumos se integran en programas de manejo, pero no cumplen la misma función ni siguen necesariamente la misma secuencia fenológica.</p>
            </div>
            <div className={styles.portfolioSplit}>
              <article className={styles.familyPanel}>
                <span className={styles.badge}>Línea 01 · Fertilizantes</span>
                <h2>Nutrición y suelo</h2>
                <p>5 referencias líquidas + 4 referencias sólidas + compost.</p>
                <div className={styles.counts}>
                  <div className={styles.count}><strong>5</strong><span>líquidas</span></div>
                  <div className={styles.count}><strong>4</strong><span>sólidas</span></div>
                  <div className={styles.count}><strong>1</strong><span>compost</span></div>
                </div>
                <div className={styles.productList}>
                  <div className={styles.productRow}><strong>Compost</strong><small>Suelo y materia orgánica</small></div>
                  {solids.map((item) => <div className={styles.productRow} key={item}><strong>{item}</strong><small>Organomineral sólido</small></div>)}
                  <div className={styles.productRow}><strong>5 referencias líquidas</strong><small>Portafolio por etapa y objetivo</small></div>
                </div>
              </article>

              <article className={styles.familyPanel} id="bioinsumos">
                <span className={styles.badge}>Línea 02 · Bioinsumos</span>
                <h2>Biología y manejo</h2>
                <p>Microorganismos, inoculantes y extractos botánicos que se seleccionan según cultivo, problema, contexto técnico y estado regulatorio/comercial.</p>
                <div className={styles.productList}>
                  {bioinputs.map((item) => <div className={styles.productRow} key={item}><strong>{item}</strong><small>Ficha / estado por reconciliar antes de claims específicos</small></div>)}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.technology} id="tecnologia">
          <div className={`${styles.container} ${styles.techGrid}`}>
            <div>
              <span className={styles.eyebrow}>Más que NPK</span>
              <h2>Tecnología organomineral pensada para trabajar con el suelo.</h2>
              <p>En las referencias sólidas aplicables, Wondergreen combina una matriz orgánica estabilizada con componentes minerales mediante formulación, oclusión y peletizado.</p>
              <p>La web puede explicar disponibilidad más gradual o modulada cuando la afirmación esté respaldada; no convertiremos automáticamente cada sólido en un “fertilizante de liberación controlada” sin evidencia específica de esa versión.</p>
              <div className={styles.claimLock}><strong>Regla de publicación:</strong> característica de producto, formulación, uso y eficacia deben estar vinculados a su versión técnica y evidencia.</div>
            </div>
            <div className={styles.flow}>
              {tech.map(([number, title, copy]) => (
                <div className={styles.flowStep} key={number}><span>{number}</span><div><strong>{title}</strong><small>{copy}</small></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.bio}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Bioinsumos Wondergreen</span>
              <h2>No son un apéndice del fertilizante: son otra capa del manejo.</h2>
              <p>Los organizamos por función para que el productor empiece por su necesidad y no tenga que conocer de antemano el nombre del microorganismo o extracto.</p>
            </div>
            <div className={styles.bioGrid}>
              <article className={styles.bioCard}><h3>Microbiología y raíz</h3><ul><li>Trichoderma</li><li>Micorrizas</li><li>Bacillus subtilis</li></ul><span className={styles.status}>estado visible por referencia</span></article>
              <article className={styles.bioCard}><h3>Manejo biológico</h3><ul><li>Beauveria</li><li>Metarhizium</li></ul><span className={styles.status}>uso sujeto a evidencia y registro</span></article>
              <article className={styles.bioCard}><h3>Extractos botánicos</h3><ul><li>Extracto de Neem</li><li>Extracto Ajo–Ají</li></ul><span className={styles.status}>ficha y aplicación gobernadas</span></article>
            </div>
          </div>
        </section>

        <section className={styles.finder} id="finder">
          <div className={`${styles.container} ${styles.finderGrid}`}>
            <div>
              <span className={`${styles.eyebrow} ${styles.lightEyebrow}`}>Wondergreen Finder</span>
              <h2>Cultivo + etapa + necesidad + problema.</h2>
              <p>El resultado será una orientación técnica, no una prescripción automática. Cuando falte información, el sistema debe pedir análisis o derivar a un asesor.</p>
            </div>
            <div className={styles.finderSteps}>
              <div className={styles.finderStep}><span>01</span><strong>Selecciona cultivo</strong><small>Café, cacao, aguacate, cítricos, pastos y más.</small></div>
              <div className={styles.finderStep}><span>02</span><strong>Ubica la etapa</strong><small>Establecimiento, crecimiento, floración, producción o recuperación.</small></div>
              <div className={styles.finderStep}><span>03</span><strong>Define la necesidad</strong><small>Nutrición, suelo, raíz, plaga, enfermedad o estrés.</small></div>
              <div className={styles.finderStep}><span>04</span><strong>Completa el contexto</strong><small>Análisis de suelo/foliar, manejo previo y condición del lote.</small></div>
              <div className={styles.finderStep}><span>05</span><strong>Recibe una ruta</strong><small>Fertilizante, bioinsumo, protocolo o asesoría potencialmente relevante.</small></div>
            </div>
          </div>
        </section>

        <section className={styles.crops} id="cultivos">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Biblioteca por cultivo</span>
              <h2>El conocimiento técnico ya existe; ahora lo volvemos navegable.</h2>
              <p>Las guías construidas en Marketing Studio serán la base de páginas específicas, sin reducir todos los cultivos a una misma receta.</p>
            </div>
            <div className={styles.cropGrid}>
              {crops.map(([title, copy]) => <article className={styles.cropCard} key={title}><span>Guía de cultivo</span><h3>{title}</h3><p>{copy}</p><a href="#acompanamiento">Próximamente en web →</a></article>)}
            </div>
          </div>
        </section>

        <section className={styles.commercial} id="acompanamiento">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Tres rutas comerciales</span>
              <h2>El mismo portafolio, distintas preguntas.</h2>
            </div>
            <div className={styles.commercialGrid}>
              {audiences.map(([title, copy, cta]) => <article className={styles.commercialCard} key={title}><h3>{title}</h3><p>{copy}</p><a href="#contacto">{cta} →</a></article>)}
            </div>
          </div>
        </section>

        <section className={styles.closing} id="contacto">
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Wondergreen</span><h2>¿Tienes un cultivo, una necesidad o un problema por resolver?</h2></div>
            <div className={styles.buttonRow}><a className={`${styles.button} ${styles.dark}`} href="#contacto">Hablar con equipo técnico</a><Link className={`${styles.button} ${styles.ghost}`} href="/">Volver a Greenatics</Link></div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div><img className={styles.footerLogo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" /><p>Wondergreen es la línea agrícola de Greenatics.</p></div>
          <div className={styles.footerLinks}><strong>Wondergreen</strong><a href="#portafolio">Portafolio</a><a href="#tecnologia">Tecnología</a><a href="#bioinsumos">Bioinsumos</a><a href="#cultivos">Cultivos</a></div>
          <div className={styles.footerLinks}><strong>Plataforma</strong><Link href="/">Greenatics</Link><Link href="/app">GREENATICS OPS</Link></div>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>© Greenatics S.A.S. · Wondergreen</div>
      </footer>
    </div>
  );
}
