import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { bioinputReferences, compostReferences, liquidFertilizers, solidFertilizers } from "@/data/wondergreen-public";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import { WondergreenCommercialShowcase } from "./wondergreen-commercial-showcase";
import styles from "./wondergreen-v2.module.css";

export const metadata: Metadata = {
  title: "Wondergreen | Suelo, nutrición y biología",
  description:
    "Wondergreen integra productos organominerales, fertilizantes líquidos, compost, bioinsumos, tecnología, guías por cultivo y acompañamiento técnico dentro de una misma lógica de suelo y seguimiento.",
  alternates: { canonical: "/wondergreen" },
};

const entryPaths = [
  {
    number: "01",
    title: "Quiero ver productos",
    copy: "Entra al catálogo y abre cada referencia para revisar formulación, presentaciones, condición comercial y documentación vinculada.",
    href: "/wondergreen/productos",
  },
  {
    number: "02",
    title: "Tengo un cultivo",
    copy: "Explora los programas publicados y sus guías PDF antes de convertir una referencia en recomendación.",
    href: "/wondergreen/cultivos",
  },
  {
    number: "03",
    title: "Tengo plantas en casa",
    copy: "Entra a Casa & Jardín para conocer productos, kits, etapas, guías y orientación segura.",
    href: "/casa-jardin",
  },
  {
    number: "04",
    title: "No sé qué producto revisar",
    copy: "Usa el Finder como orientación cuando todavía necesitas ordenar cultivo, etapa y contexto antes de escoger una referencia.",
    href: "/wondergreen/finder",
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
  ["03", "Extractos botánicos", "Extracto de Neem · Extracto Ajo–Ají", "ficha y aplicación sujetas a validación vigente"],
] as const;

const knowledgeRoutes = [
  ["01", "Programas por cultivo", "Etapa, objetivo, cautelas y referencias documentadas para cada cultivo publicado.", "/wondergreen/cultivos", "Explorar cultivos"],
  ["02", "Deficiencias nutricionales", "Síntomas, confundidores y comprobaciones antes de asumir que todo se resuelve aplicando fertilizante.", "/biblioteca/guia-deficiencias", "Abrir guía"],
  ["03", "Criterios nutricionales", "Principios para leer contexto, análisis y decisiones sin convertir una guía en prescripción automática.", "/biblioteca/criterios-nutricionales", "Revisar criterios"],
  ["04", "Manual de uso", "Etapa, objetivo, formato, aplicación, seguimiento y ajuste dentro de una ruta técnica.", "/biblioteca/manual-uso-wondergreen", "Abrir manual"],
] as const;

const audiences = [
  ["01", "Productor", "Conoce primero el portafolio y luego cruza la referencia con la etapa de tu cultivo.", "Ver productos", "/wondergreen/productos"],
  ["02", "Hogar / jardín", "Explora productos, kits y guías domésticas sin convertir la navegación en dosificación automática.", "Explorar Casa & Jardín", "/casa-jardin"],
  ["03", "Agrotienda / distribuidor", "Conoce familias, formatos y condición comercial antes de conversar sobre distribución.", "Quiero vender Wondergreen", "/contacto"],
  ["04", "Agrónomo / técnico", "Accede a portafolio, guías y criterios técnicos navegables.", "Abrir biblioteca técnica", "/biblioteca"],
] as const;

export default function WondergreenPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.subnav} aria-label="Navegación Wondergreen">
        <div className={styles.container}>
          <span>Wondergreen</span>
          <div>
            <Link href="/wondergreen/productos">Productos</Link>
            <a href="#tecnologia">Tecnología</a>
            <Link href="/wondergreen/cultivos">Cultivos</Link>
            <Link href="/biblioteca">Guías</Link>
            <Link href="/wondergreen/finder">Finder</Link>
            <a href="#bioinsumos">Bioinsumos</a>
            <Link href="/casa-jardin">Casa & Jardín</Link>
            <a href="#que-es">Qué es</a>
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
              <h1 id="wondergreen-title">Nutrición que trabaja con el suelo.</h1>
              <p className={styles.lead}>
                Wondergreen reúne productos para nutrición y manejo del cultivo: referencias organominerales sólidas, soluciones líquidas, compost y bioinsumos. Puedes empezar por el producto y profundizar hasta formulación, presentación, tecnología y documentación; cuando la elección todavía no está clara, las guías y el Finder ayudan a ordenar el contexto.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/wondergreen/productos">Ver productos</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/wondergreen/cultivos">Explorar cultivos y guías</Link>
                <Link className={styles.textLink} href="/wondergreen/finder">No sé qué producto revisar →</Link>
              </div>
              <div className={styles.heroTruth}>
                <span>Información técnica vigente</span>
                <strong>Composición, condición comercial, dosis y uso se consultan desde la documentación técnica vigente de cada referencia.</strong>
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

        <WondergreenCommercialShowcase />

        <section className={styles.router} aria-labelledby="router-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Elige tu nivel de profundidad</span>
                <h2 id="router-title">Si ya sabes qué buscas, entra directo. Si no, te orientamos.</h2>
              </div>
              <p>Si conoces el producto, puedes abrir su ficha y documentación. Si todavía tienes dudas, entra por cultivo, Casa & Jardín o Finder sin convertir la orientación en prescripción automática.</p>
            </div>
            <div className={styles.routerGrid}>
              {entryPaths.map((item) => (
                <article className={styles.routerCard} key={item.number}>
                  <span className={styles.index}>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <Link href={item.href}>Continuar →</Link>
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
              <p>Wondergreen reúne fertilizantes organominerales sólidos, referencias líquidas, compost, bioinsumos, conocimiento y acompañamiento técnico dentro de una misma propuesta de nutrición, manejo y seguimiento.</p>
              <p>El portafolio es una entrada comercial real. El contexto agronómico determina después cómo y cuándo una referencia puede convertirse en una recomendación específica.</p>
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
                <div className={styles.chapterLock}><strong>Alcance de esta característica.</strong><span> Lenta liberación describe una característica documentada del producto; no implica por sí sola una respuesta agronómica universal ni reemplaza la validación de uso en campo.</span></div>
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
                <h2 id="implications-title">La tecnología ayuda a entender el producto; el contexto define la recomendación.</h2>
              </div>
              <p>La matriz, la forma física y la característica de liberación se interpretan dentro de un sistema vivo. Conocer el producto es el primer nivel; decidir dosis, momento o combinación exige la información aplicable al cultivo.</p>
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
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Orientación cuando hace falta</span>
              <h2 id="finder-title">Del contexto al seguimiento.</h2>
              <p>El Finder Wondergreen organiza cultivo, etapa y evidencia disponible dentro de los cinco programas publicados. Es una orientación técnica para quien todavía no sabe qué referencia revisar, no una prescripción automática, y se detiene cuando la etapa no está clara.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonLight}`} href="/wondergreen/finder">Abrir Finder Wondergreen</Link>
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
                <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Portafolio completo · estado por referencia</span>
                <h2 id="portfolio-title">Fertilizantes y bioinsumos, con su estado visible.</h2>
              </div>
              <p>Después de las referencias comerciales destacadas, el portafolio permite revisar también referencias técnicas o en desarrollo sin confundirlas con disponibilidad comercial.</p>
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
              <div><span className={styles.eyebrow}>Programas y guías por cultivo</span><h2 id="crops-title">La decisión técnica cambia con la etapa.</h2></div>
              <p>Las rutas de cultivo conectan momento fisiológico, objetivo, cautelas y productos relacionados; cuando existe una guía PDF aprobada, la página la mantiene disponible como documento editorial completo.</p>
            </div>
            <div className={styles.cropGrid}>
              {wondergreenCrops.map((crop, index) => (
                <Link href={`/wondergreen/cultivos/${crop.slug}`} key={crop.slug}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>Programa + guía</small>
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
              <div><span className={styles.eyebrow}>Documentación y conocimiento</span><h2 id="knowledge-title">Profundiza desde el producto hasta el documento oficial.</h2></div>
              <p>Las guías y PDF aprobados conservan su diseño y contenido como piezas documentales, y cada referencia mantiene su información técnica vigente.</p>
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
              <div><span className={styles.eyebrow}>Compra informada, distribución y asesoría</span><h2 id="commercial-title">El mismo portafolio, distintas necesidades.</h2></div>
              <p>El productor puede revisar productos, el hogar entra por Casa & Jardín, un distribuidor conversa sobre líneas y formatos y el técnico profundiza en documentación. La orientación aparece cuando agrega valor, no como sustituto de la oferta.</p>
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
              <h2 id="closing-title">¿Quieres revisar un producto, una presentación o una ruta para tu cultivo?</h2>
            </div>
            <div>
              <p>Puedes entrar directamente al producto, consultar las guías o hablar con Greenatics cuando necesites confirmar disponibilidad, contexto técnico o distribución.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.buttonDark}`} href="/wondergreen/productos">Ver productos</Link>
                <Link className={`${styles.button} ${styles.buttonGhost}`} href="/contacto">Hablar con equipo técnico</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}