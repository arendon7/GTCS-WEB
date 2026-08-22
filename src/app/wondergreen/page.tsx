import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { bioinputReferences, compostReferences, liquidFertilizers, solidFertilizers } from "@/data/wondergreen-public";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import styles from "./wondergreen-v2.module.css";

export const metadata: Metadata = {
  title: "Wondergreen | Suelo, nutrición y biología",
  description:
    "Wondergreen integra nutrición organomineral, fertilizantes líquidos, compost, bioinsumos, guías por cultivo y acompañamiento técnico dentro de una misma lógica de suelo y seguimiento.",
  alternates: { canonical: "/wondergreen" },
};

const entryPaths = [
  {
    number: "01",
    title: "Tengo un cultivo",
    copy: "Empieza por especie, etapa y objetivo antes de elegir una referencia.",
    href: "/wondergreen/cultivos",
  },
  {
    number: "02",
    title: "Tengo una necesidad",
    copy: "Cruza contexto, síntomas, análisis y objetivo antes de cerrar una ruta técnica.",
    href: "#finder",
  },
  {
    number: "03",
    title: "Sé qué producto busco",
    copy: "Entra al Product Master público y revisa familia, formato y condición vigente.",
    href: "/wondergreen/productos",
  },
  {
    number: "04",
    title: "Tengo plantas en casa",
    copy: "Entra a Casa & Jardín para observar etapa, diagnóstico orientativo, productos y guías.",
    href: "/casa-jardin",
  },
] as const;

const scienceImplications = [
  ["01", "El suelo es parte del sistema", "La lectura técnica no termina en la fórmula: materia orgánica, humedad, raíz y biología forman parte del contexto de uso."],
  ["02", "La etapa cambia la decisión", "La misma referencia no se interpreta igual en establecimiento, crecimiento, floración, llenado o recuperación."],
  ["03", "La disponibilidad necesita contexto", "La forma física y la matriz del producto se leen junto con condiciones de suelo, agua y manejo; no como una promesa aislada."],
  ["04", "La evidencia manda", "Una característica documentada del producto no se convierte automáticamente en un resultado agronómico universal."],
] as const;

const finderSteps = [
  ["01", "Cultivo y contexto", "Especie, etapa, objetivo, historial, suelo, agua y condición actual del lote."],
  ["02", "Diagnóstico y análisis", "Síntomas, antecedentes y análisis disponibles antes de seleccionar una referencia."],
  ["03", "Programa técnico", "Se organiza una ruta potencial por etapa, necesidad y condición del cultivo."],
  ["04", "Implementación", "Producto, formato, vía y momento deben seguir la ficha y recomendación vigentes."],
  ["05", "Seguimiento y ajuste", "La respuesta observada y los nuevos datos permiten revisar la ruta técnica."],
] as const;

const bioFamilies = [
  ["01", "Microbiología y raíz", "Trichoderma · Micorrizas · Bacillus subtilis", "estado visible por referencia"],
  ["02", "Manejo biológico", "Beauveria · Metarhizium", "uso sujeto a evidencia y registro"],
  ["03", "Extractos botánicos", "Extracto de Neem · Extracto Ajo–Ají", "ficha y aplicación gobernadas"],
] as const;

const knowledgeRoutes = [
  ["01", "Programas por cultivo", "Etapa, objetivo, cautelas y referencias gobernadas para cada cultivo publicado.", "/wondergreen/cultivos", "Explorar cultivos"],
  ["02", "Deficiencias nutricionales", "Síntomas, confundidores y comprobaciones antes de asumir que todo se resuelve aplicando fertilizante.", "/biblioteca/guia-deficiencias", "Abrir guía"],
  ["03", "Criterios nutricionales", "Principios para leer contexto, análisis y decisiones sin convertir una guía en prescripción automática.", "/biblioteca/criterios-nutricionales", "Revisar criterios"],
  ["04", "Manual de uso", "Etapa, objetivo, formato, aplicación, seguimiento y ajuste dentro de una ruta técnica.", "/biblioteca/manual-uso-wondergreen", "Abrir manual"],
] as const;

const audiences = [
  ["01", "Productor", "Encuentra una ruta técnica para tu cultivo.", "Empezar por cultivo", "/wondergreen/cultivos"],
  ["02", "Hogar / jardín", "Observa la etapa de tus plantas y entra al sistema doméstico sin dosificar a ciegas.", "Explorar Casa & Jardín", "/casa-jardin"],
  ["03", "Agrotienda / distribuidor", "Conoce familias, formatos y oportunidad comercial.", "Quiero vender Wondergreen", "/contacto"],
  ["04", "Agrónomo / técnico", "Accede a portafolio, guías y criterios técnicos navegables.", "Abrir biblioteca técnica", "/biblioteca"],
] as const;

export default function WondergreenPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.subnav} aria-label="Navegación Wondergreen">
        <div className={styles.container}>
          <span>Wondergreen</span>
          <div>
            <a href="#que-es">Qué es</a>
            <a href="#tecnologia">Tecnología</a>
            <Link href="/wondergreen/productos">Productos</Link>
            <Link href="/wondergreen/cultivos">Cultivos</Link>
            <a href="#bioinsumos">Bioinsumos</a>
            <Link href="/biblioteca">Guías</Link>
            <Link href="/casa-jardin">Casa & Jardín</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className={styles.hero} aria-labelledby="wondergreen-title">
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Wondergreen · Una marca Greenatics</span>
              <Image
                className={styles.wgLogo}
                src="/brand/wondergreen-nutrients.webp"
                alt="Wondergreen Nutrients"
                width={420}
                height={221}
                sizes="(max-width: 720px) 78vw, 420px"
                priority
              />
              <h1 id="wondergreen-title">Nutrición que vuelve a la tierra.</h1>
              <p className={styles.lead}>
                Wondergreen integra suelo, nutrición, biología y conocimiento. En sus sólidos aplicables, la historia técnica parte de una matriz organomineral y de procesos como la oclusión; la lectura agronómica siempre vuelve al cultivo, al suelo y a la evidencia disponible.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/wondergreen/productos">Ver productos</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/wondergreen/cultivos">Empezar por cultivo</Link>
                <Link className={styles.textLink} href="/contacto">Hablar con equipo técnico →</Link>
              </div>
              <div className={styles.heroTruth}>
                <span>Product Master público</span>
                <strong>Composición, condición comercial, dosis y uso salen de la versión técnica vigente.</strong>
              </div>
            </div>

            <div className={styles.sciencePlate} aria-label="Lectura conceptual de la tecnología organomineral Wondergreen">
              <div className={styles.plateTop}>
                <span>Lectura del material</span>
                <small>No es una curva de eficacia</small>
              </div>
              <div className={styles.materialStage}>
                <div className={styles.materialSource}>
                  <span>01</span>
                  <strong>Matriz orgánica</strong>
                  <small>base estabilizada</small>
                </div>
                <div className={styles.materialPlus} aria-hidden="true">+</div>
                <div className={styles.materialSource}>
                  <span>02</span>
                  <strong>Componentes minerales</strong>
                  <small>según referencia</small>
                </div>
              </div>
              <div className={styles.plateArrow} aria-hidden="true">↓</div>
              <div className={styles.matrixCore}>
                <span>03 · integración</span>
                <strong>Matriz organomineral</strong>
                <div className={styles.matrixDots} aria-hidden="true">
                  {Array.from({ length: 18 }).map((_, index) => <i key={index} />)}
                </div>
              </div>
              <div className={styles.plateArrow} aria-hidden="true">↓</div>
              <div className={styles.soilStage}>
                <div><span>04</span><strong>Suelo</strong></div>
                <div><span>05</span><strong>Humedad</strong></div>
                <div><span>06</span><strong>Raíz + biología</strong></div>
              </div>
              <p>La formulación se explica primero como característica del producto. Su comportamiento y respuesta en campo requieren el contexto y la evidencia correspondientes.</p>
            </div>
          </div>
        </section>

        <section className={styles.router} aria-labelledby="router-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Empieza por tu contexto</span>
                <h2 id="router-title">No empieces por el producto. Empieza por la decisión.</h2>
              </div>
              <p>La selección cambia con cultivo, etapa, suelo o sustrato, problema, análisis disponibles y objetivo. Wondergreen organiza distintas puertas para llegar a la misma base técnica.</p>
            </div>
            <div className={styles.routerGrid}>
              {entryPaths.map((item) => (
                <article className={styles.routerCard} key={item.number}>
                  <span className={styles.index}>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  {item.href.startsWith("/") ? <Link href={item.href}>Continuar →</Link> : <a href={item.href}>Continuar →</a>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.definition} id="que-es" aria-labelledby="definition-title">
          <div className={`${styles.container} ${styles.definitionGrid}`}>
            <span className={styles.sectionIndex}>01</span>
            <div>
              <span className={styles.eyebrow}>Qué es Wondergreen</span>
              <h2 id="definition-title">Un sistema de nutrición y manejo alrededor del suelo y del cultivo.</h2>
            </div>
            <div className={styles.editorialCopy}>
              <p>Wondergreen reúne fertilizantes organominerales sólidos, referencias líquidas, compost, bioinsumos, conocimiento y acompañamiento técnico bajo una misma arquitectura de decisión.</p>
              <p>La marca no presupone que una necesidad se resuelva con un solo producto. Primero se lee el contexto; después se seleccionan las herramientas que correspondan.</p>
            </div>
          </div>
        </section>

        <section className={styles.science} id="tecnologia" aria-labelledby="science-title">
          <div className={styles.container}>
            <div className={styles.scienceIntro}>
              <span className={styles.eyebrow}>Tecnología de sólidos · tres conceptos</span>
              <h2 id="science-title">Organomineral. Oclusión. Lenta liberación.</h2>
              <p>La secuencia separa lo que describe al producto de lo que todavía exige validación agronómica. No usamos una palabra tecnológica como sustituto de evidencia.</p>
            </div>

            <article className={styles.scienceChapter} id="organomineral">
              <div className={styles.chapterNumber}>01</div>
              <div className={styles.chapterCopy}>
                <span className={styles.eyebrow}>Organomineral</span>
                <h3>La nutrición mineral se integra dentro de una matriz que también contiene una fracción orgánica.</h3>
                <p>En las referencias sólidas aplicables, Wondergreen parte de una base orgánica estabilizada e incorpora componentes minerales de acuerdo con la formulación documentada de cada producto.</p>
                <div className={styles.chapterLock}><strong>Qué sí dice.</strong><span> Describe la naturaleza y formulación del material cuando está documentada para esa referencia.</span></div>
              </div>
              <div className={styles.organomineralVisual} aria-hidden="true">
                <div><span>orgánico</span></div>
                <b>+</b>
                <div><span>mineral</span></div>
                <b>→</b>
                <div className={styles.result}><span>matriz organomineral</span></div>
              </div>
            </article>

            <article className={styles.scienceChapter} id="oclusion">
              <div className={styles.chapterNumber}>02</div>
              <div className={styles.chapterCopy}>
                <span className={styles.eyebrow}>Oclusión</span>
                <h3>No se comunica como una capa decorativa: se explica como integración dentro de la matriz.</h3>
                <p>Cuando corresponde a la versión técnica, la oclusión describe la incorporación de componentes minerales dentro de la matriz organomineral durante la formulación del sólido.</p>
                <div className={styles.chapterLock}><strong>Qué no dice por sí sola.</strong><span> No demuestra una duración específica, una eficiencia porcentual ni una respuesta de rendimiento universal.</span></div>
              </div>
              <div className={styles.occlusionVisual} aria-label="Esquema conceptual de oclusión, sin escala ni porcentaje">
                <div className={styles.occlusionOuter}>
                  <span>Matriz</span>
                  {Array.from({ length: 12 }).map((_, index) => <i key={index} />)}
                  <div className={styles.occlusionCore}><strong>componentes</strong><small>integrados</small></div>
                </div>
                <small>Esquema conceptual · sin escala ni porcentaje</small>
              </div>
            </article>

            <article className={styles.scienceChapter} id="lenta-liberacion">
              <div className={styles.chapterNumber}>03</div>
              <div className={styles.chapterCopy}>
                <span className={styles.eyebrow}>Lenta liberación</span>
                <h3>Una característica que debe estar vinculada a la referencia y versión que realmente la soporta.</h3>
                <p>Wondergreen puede comunicar <strong>lenta liberación</strong> en las referencias y versiones donde esa característica esté documentada. La expresión no se extiende automáticamente a todo el portafolio sólido.</p>
                <div className={styles.chapterLock}><strong>Truth lock.</strong><span> Lenta liberación describe una característica documentada del producto; no implica por sí sola una respuesta agronómica universal ni reemplaza la validación de uso en campo.</span></div>
              </div>
              <div className={styles.releaseVisual} aria-label="Representación conceptual de disponibilidad progresiva, no una curva experimental">
                <div className={styles.releaseTrack}>
                  <span>material</span>
                  <i /><i /><i /><i /><i />
                  <span>suelo</span>
                </div>
                <div className={styles.releaseLegend}>
                  <span>Representación conceptual</span>
                  <small>No es una curva experimental ni expresa un tiempo específico.</small>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.implications} aria-labelledby="implications-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Qué cambia en la lectura agronómica</span>
                <h2 id="implications-title">La tecnología sirve para formular mejores preguntas, no para saltarse el diagnóstico.</h2>
              </div>
              <p>La matriz, la forma física y la característica de liberación se interpretan dentro de un sistema vivo. La recomendación final sigue dependiendo del cultivo y de la información disponible.</p>
            </div>
            <div className={styles.implicationGrid}>
              {scienceImplications.map(([number, title, copy]) => (
                <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finder} id="finder" aria-labelledby="finder-title">
          <div className={`${styles.container} ${styles.finderGrid}`}>
            <div className={styles.finderIntro}>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Objetivo + etapa</span>
              <h2 id="finder-title">Del contexto al seguimiento.</h2>
              <p>La ruta es una orientación técnica, no una prescripción automática. Cuando falte información, el sistema debe pedir análisis o derivar a un asesor antes de cerrar una recomendación.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonLight}`} href="/wondergreen/cultivos">Empezar por cultivo</Link>
                <Link className={`${styles.button} ${styles.buttonOutlineLight}`} href="/biblioteca">Consultar guías</Link>
              </div>
            </div>
            <div className={styles.finderSteps}>
              {finderSteps.map(([number, title, copy]) => (
                <div className={styles.finderStep} key={number}><span>{number}</span><div><strong>{title}</strong><small>{copy}</small></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.portfolio} id="portafolio" aria-labelledby="portfolio-title">
          <div className={styles.container}>
            <div className={styles.portfolioHead}>
              <div>
                <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Portafolio · Product Master público</span>
                <h2 id="portfolio-title">Dos grandes líneas dentro de una misma marca.</h2>
              </div>
              <p>Fertilizantes y bioinsumos pueden integrarse en programas de manejo, pero no cumplen la misma función ni siguen necesariamente la misma secuencia fenológica.</p>
            </div>

            <div className={styles.portfolioColumns}>
              <div className={styles.familyIntro}>
                <span>01 · Fertilizantes</span>
                <h3>Nutrición y suelo</h3>
                <p>{liquidFertilizers.length} referencias líquidas + {solidFertilizers.length} referencias sólidas + compost. El estado de cada referencia se muestra explícitamente.</p>
                <div className={styles.familyCounts}>
                  <div><strong>{liquidFertilizers.length}</strong><small>líquidas</small></div>
                  <div><strong>{solidFertilizers.length}</strong><small>sólidas</small></div>
                  <div><strong>{compostReferences.length}</strong><small>compost</small></div>
                </div>
              </div>
              <div className={styles.productTable}>
                {compostReferences.map((item) => <Link className={styles.productRow} href={`/wondergreen/productos/${item.slug}`} key={item.slug}><strong>{item.name}</strong><small>{item.publicStatus} · Ver ficha →</small></Link>)}
                {solidFertilizers.map((item) => <Link className={styles.productRow} href={`/wondergreen/productos/${item.slug}`} key={item.slug}><strong>{item.name} · {item.formula}</strong><small>{item.publicStatus} · Ver ficha →</small></Link>)}
                {liquidFertilizers.map((item) => <Link className={styles.productRow} href={`/wondergreen/productos/${item.slug}`} key={item.slug}><strong>{item.name} · {item.formula}</strong><small>{item.publicStatus} · Ver ficha →</small></Link>)}
              </div>
            </div>

            <div className={styles.portfolioColumns} id="bioinsumos">
              <div className={styles.familyIntro}>
                <span>02 · Bioinsumos</span>
                <h3>Biología y manejo</h3>
                <p>Microorganismos, inoculantes y extractos botánicos se seleccionan según cultivo, problema, contexto técnico y estado regulatorio/comercial.</p>
                <div className={styles.bioLegend}>
                  {bioFamilies.map(([number, title, refs, status]) => <div key={number}><span>{number}</span><strong>{title}</strong><small>{refs} · {status}</small></div>)}
                </div>
              </div>
              <div className={styles.productTable}>
                {bioinputReferences.map((item) => <Link className={styles.productRow} href={`/wondergreen/productos/${item.slug}`} key={item.slug}><strong>{item.name}</strong><small>{item.publicStatus} · Ver ficha →</small></Link>)}
              </div>
            </div>

            <div className={styles.actions}>
              <Link className={`${styles.button} ${styles.buttonLight}`} href="/wondergreen/productos">Abrir catálogo completo</Link>
              <Link className={`${styles.button} ${styles.buttonOutlineLight}`} href="/biblioteca">Abrir Biblioteca Wondergreen</Link>
              <Link className={`${styles.button} ${styles.buttonOutlineLight}`} href="/casa-jardin">Casa & Jardín</Link>
            </div>
            <p className={styles.portfolioTruth}>Composición, condición comercial, dosis y uso se muestran únicamente desde la versión técnica vigente de cada referencia.</p>
          </div>
        </section>

        <section className={styles.crops} id="cultivos" aria-labelledby="crops-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Programas por cultivo</span><h2 id="crops-title">La decisión técnica cambia con la etapa.</h2></div>
              <p>Las guías conectan momento fisiológico, objetivo, cautelas, alertas y referencias gobernadas sin convertir todos los cultivos en una misma receta.</p>
            </div>
            <div className={styles.cropGrid}>
              {wondergreenCrops.map((crop, index) => (
                <Link href={`/wondergreen/cultivos/${crop.slug}`} key={crop.slug}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>Programa técnico</small>
                  <h3>{crop.name}</h3>
                  <p>{crop.headline}</p>
                  <strong>Abrir programa →</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.knowledge} aria-labelledby="knowledge-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Evidencia y conocimiento</span><h2 id="knowledge-title">La recomendación debe poder explicar de dónde sale.</h2></div>
              <p>Guías, criterios y Product Master mantienen separadas la orientación general, la ficha del producto y la recomendación específica para un caso.</p>
            </div>
            <div className={styles.knowledgeGrid}>
              {knowledgeRoutes.map(([number, title, copy, href, cta]) => (
                <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p><Link href={href}>{cta} →</Link></article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.commercial} id="acompanamiento" aria-labelledby="commercial-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Distribución y asesoría</span><h2 id="commercial-title">El mismo sistema, distintas preguntas.</h2></div>
              <p>La entrada puede ser un cultivo, una planta en casa, una oportunidad de distribución o una necesidad técnica. Cada ruta termina en un destino público gobernado.</p>
            </div>
            <div className={styles.commercialList}>
              {audiences.map(([number, title, copy, cta, href]) => (
                <article key={title}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div><Link href={href}>{cta} →</Link></article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closing} id="contacto" aria-labelledby="closing-title">
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen</span>
              <h2 id="closing-title">¿Tienes un cultivo, una necesidad o un problema por resolver?</h2>
            </div>
            <div>
              <p>Empieza por el contexto. El siguiente paso puede ser una guía, un producto, un análisis, Casa & Jardín o acompañamiento técnico.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonDark}`} href="/contacto">Hablar con equipo técnico</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/">Volver a Greenatics</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
