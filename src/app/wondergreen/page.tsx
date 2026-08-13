import type { Metadata } from "next";
import Link from "next/link";
import { bioinputReferences, compostReferences, liquidFertilizers, solidFertilizers } from "@/data/wondergreen-public";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import styles from "./wondergreen.module.css";

export const metadata: Metadata = {
  title: "Wondergreen | Suelo, nutrición y biología",
  description:
    "Wondergreen integra fertilizantes sólidos y líquidos, compost, bioinsumos, guías por cultivo y acompañamiento técnico.",
  alternates: { canonical: "/wondergreen" },
};

const entryPaths = [
  ["01", "Tengo un cultivo", "Empieza por especie, etapa y objetivo antes de elegir producto.", "/wondergreen/cultivos"],
  ["02", "Tengo una necesidad", "Nutrición, suelo, floración, producción, raíz, plagas o enfermedades.", "#finder"],
  ["03", "Sé qué producto busco", "Entra al mapa del portafolio por familia y formato.", "#portafolio"],
];

const system = [
  ["01", "Suelo", "Compost y materia orgánica como parte de la base del sistema."],
  ["02", "Nutrición", "Fertilizantes sólidos y líquidos organizados por etapa y objetivo."],
  ["03", "Biología", "Microorganismos y extractos botánicos según necesidad y estado aprobado."],
  ["04", "Conocimiento", "Guías de cultivo, deficiencias, protocolos y criterios de uso."],
  ["05", "Acompañamiento", "La recomendación final considera lote, análisis, agua y manejo."],
];

const tech = [
  ["01", "Matriz orgánica", "Base orgánica estabilizada."],
  ["02", "Formulación", "Integración de los componentes según la referencia."],
  ["03", "Oclusión", "Incorporación de nutrientes dentro de la matriz organomineral cuando corresponde."],
  ["04", "Peletizado", "Formato físico homogéneo para manejo y aplicación al suelo."],
  ["05", "Interacción con el suelo", "Humedad, raíz y biología forman parte del contexto de disponibilidad."],
];

const finderSteps = [
  ["01", "Selecciona cultivo", "Café, cacao, aguacate, cítricos, pastos y más."],
  ["02", "Ubica la etapa", "Establecimiento, crecimiento, floración, producción o recuperación."],
  ["03", "Define la necesidad", "Nutrición, suelo, raíz, plaga, enfermedad o estrés."],
  ["04", "Completa el contexto", "Análisis de suelo/foliar, manejo previo y condición del lote."],
  ["05", "Recibe una ruta", "Fertilizante, bioinsumo, protocolo o asesoría potencialmente relevante."],
];

const bioFamilies = [
  ["01", "Microbiología y raíz", "Trichoderma · Micorrizas · Bacillus subtilis", "estado visible por referencia"],
  ["02", "Manejo biológico", "Beauveria · Metarhizium", "uso sujeto a evidencia y registro"],
  ["03", "Extractos botánicos", "Extracto de Neem · Extracto Ajo–Ají", "ficha y aplicación gobernadas"],
];

const audiences = [
  ["01", "Productor", "Encuentra una ruta técnica para tu cultivo.", "Encontrar solución"],
  ["02", "Agrotienda / distribuidor", "Conoce familias, formatos y oportunidad comercial.", "Quiero vender Wondergreen"],
  ["03", "Agrónomo / técnico", "Accede a portafolio, guías y soporte técnico.", "Conocer portafolio técnico"],
];

export default function WondergreenPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.subnav} aria-label="Navegación Wondergreen">
        <div className={styles.container}>
          <span>Wondergreen</span>
          <div>
            <a href="#portafolio">Portafolio</a>
            <a href="#tecnologia">Tecnología</a>
            <a href="#bioinsumos">Bioinsumos</a>
            <Link href="/wondergreen/cultivos">Cultivos</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Una marca Greenatics · Producto agrícola</span>
              <img className={styles.wgLogo} src="/brand/wondergreen-nutrients.webp" alt="Wondergreen Nutrients" width="420" height="221" />
              <h1>Nutrición que vuelve a la tierra.</h1>
              <p className={styles.lead}>
                Wondergreen reúne suelo, nutrición, biología y conocimiento para acompañar cada cultivo según su etapa, condición y objetivo. La ruta empieza por entender el caso, no por empujar una referencia.
              </p>
              <div className={styles.buttonRow}>
                <a className={`${styles.button} ${styles.primary}`} href="#finder">Encontrar mi solución</a>
                <a className={`${styles.button} ${styles.ghost}`} href="#portafolio">Ver portafolio</a>
              </div>
            </div>

            <aside className={styles.portfolioLedger} aria-label="Arquitectura pública vigente del portafolio Wondergreen">
              <div className={styles.ledgerTop}>
                <span>Product Master público</span>
                <strong>Un sistema alrededor del cultivo.</strong>
              </div>
              <div className={styles.ledgerMetric}><strong>{liquidFertilizers.length}</strong><div><span>Líquidas</span><small>nutrición y ajuste por objetivo</small></div></div>
              <div className={styles.ledgerMetric}><strong>{solidFertilizers.length}</strong><div><span>Sólidas</span><small>familia organomineral</small></div></div>
              <div className={styles.ledgerMetric}><strong>{compostReferences.length}</strong><div><span>Compost</span><small>suelo y materia orgánica</small></div></div>
              <div className={styles.ledgerMetric}><strong>{bioinputReferences.length}</strong><div><span>Bioinsumos</span><small>biología y manejo</small></div></div>
              <p>Composición, condición comercial, dosis y uso se muestran únicamente desde la versión técnica vigente de cada referencia.</p>
            </aside>
          </div>
        </section>

        <section className={styles.entry}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Empieza por tu contexto</span>
              <h2>No empieces por el producto. Empieza por lo que tu cultivo necesita.</h2>
              <p>La selección cambia con cultivo, suelo, etapa, problema y objetivo. Wondergreen organiza el portafolio para hacer esa ruta más clara.</p>
            </div>
            <div className={styles.entryList}>
              {entryPaths.map(([number, title, copy, href]) => (
                <article className={styles.entryItem} key={title}>
                  <span>{number}</span>
                  <div><h3>{title}</h3><p>{copy}</p></div>
                  {href.startsWith("/") ? <Link href={href}>Continuar →</Link> : <a href={href}>Continuar →</a>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.systemSection}>
          <div className={styles.container}>
            <div className={styles.systemIntro}>
              <div><span className={styles.eyebrow}>El sistema Wondergreen</span><h2>Una solución no siempre es un solo producto.</h2></div>
              <p>El portafolio cobra sentido cuando se conecta con suelo, etapa, biología, diagnóstico y seguimiento. Esa es la diferencia entre mostrar fórmulas y construir una ruta agronómica.</p>
            </div>
            <div className={styles.systemStrip}>
              {system.map(([number, title, copy]) => (
                <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.portfolio} id="portafolio">
          <div className={styles.container}>
            <div className={styles.portfolioHeading}>
              <div>
                <span className={`${styles.eyebrow} ${styles.lightEyebrow}`}>Portafolio Wondergreen</span>
                <h2>Dos grandes líneas dentro de una misma marca.</h2>
              </div>
              <p>Fertilizantes y bioinsumos pueden integrarse en programas de manejo, pero no cumplen la misma función ni siguen necesariamente la misma secuencia fenológica.</p>
            </div>

            <div className={styles.familySection}>
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
                {compostReferences.map((item) => <div className={styles.productRow} key={item.slug}><strong>{item.name}</strong><small>{item.publicStatus}</small></div>)}
                {solidFertilizers.map((item) => <div className={styles.productRow} key={item.slug}><strong>{item.name} · {item.formula}</strong><small>{item.publicStatus}</small></div>)}
                {liquidFertilizers.map((item) => <div className={styles.productRow} key={item.slug}><strong>{item.name} · {item.formula}</strong><small>{item.publicStatus}</small></div>)}
              </div>
            </div>

            <div className={styles.familySection} id="bioinsumos">
              <div className={styles.familyIntro}>
                <span>02 · Bioinsumos</span>
                <h3>Biología y manejo</h3>
                <p>Microorganismos, inoculantes y extractos botánicos se seleccionan según cultivo, problema, contexto técnico y estado regulatorio/comercial.</p>
              </div>
              <div className={styles.productTable}>
                {bioinputReferences.map((item) => <div className={styles.productRow} key={item.slug}><strong>{item.name}</strong><small>{item.publicStatus}</small></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.technology} id="tecnologia">
          <div className={`${styles.container} ${styles.techGrid}`}>
            <div className={styles.techCopy}>
              <span className={styles.eyebrow}>Más que NPK</span>
              <h2>Tecnología organomineral pensada para trabajar con el suelo.</h2>
              <p>En las referencias sólidas aplicables, Wondergreen combina una matriz orgánica estabilizada con componentes minerales mediante formulación, oclusión y peletizado.</p>
              <p>La web puede explicar disponibilidad más gradual o modulada cuando la afirmación esté respaldada; no convertiremos automáticamente cada sólido en un “fertilizante de liberación controlada” sin evidencia específica de esa versión.</p>
              <div className={styles.claimLock}><strong>Regla de publicación.</strong><span> Característica, formulación, uso y eficacia deben estar vinculados a su versión técnica y evidencia.</span></div>
            </div>
            <div className={styles.techFlow}>
              {tech.map(([number, title, copy]) => (
                <div className={styles.techStep} key={number}><span>{number}</span><div><strong>{title}</strong><small>{copy}</small></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.bioSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Bioinsumos Wondergreen</span>
              <h2>No son un apéndice del fertilizante: son otra capa del manejo.</h2>
              <p>Los organizamos por función para que el productor pueda empezar por su necesidad y no tenga que conocer de antemano el nombre del microorganismo o extracto.</p>
            </div>
            <div className={styles.bioList}>
              {bioFamilies.map(([number, title, refs, status]) => (
                <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{refs}</p></div><small>{status}</small></article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finder} id="finder">
          <div className={`${styles.container} ${styles.finderGrid}`}>
            <div className={styles.finderIntro}>
              <span className={`${styles.eyebrow} ${styles.lightEyebrow}`}>Wondergreen Finder</span>
              <h2>Cultivo + etapa + necesidad + problema.</h2>
              <p>El resultado será una orientación técnica, no una prescripción automática. Cuando falte información, el sistema debe pedir análisis o derivar a un asesor.</p>
              <Link className={`${styles.button} ${styles.light}`} href="/wondergreen/cultivos">Empezar por cultivo</Link>
            </div>
            <div className={styles.finderSteps}>
              {finderSteps.map(([number, title, copy]) => (
                <div className={styles.finderStep} key={number}><span>{number}</span><div><strong>{title}</strong><small>{copy}</small></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.crops} id="cultivos">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Biblioteca por cultivo</span>
              <h2>El conocimiento técnico ya existe; ahora es navegable.</h2>
              <p>Las guías se convierten en páginas específicas sin reducir todos los cultivos a una misma receta.</p>
            </div>
            <div className={styles.cropList}>
              {wondergreenCrops.map((crop, index) => (
                <article key={crop.slug}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><small>Guía de cultivo</small><h3>{crop.name}</h3><p>{crop.headline}</p></div>
                  <Link href={`/wondergreen/cultivos/${crop.slug}`}>Abrir programa →</Link>
                </article>
              ))}
            </div>
            <div className={styles.buttonRow}><Link className={`${styles.button} ${styles.ghost}`} href="/wondergreen/cultivos">Ver biblioteca por cultivo</Link></div>
          </div>
        </section>

        <section className={styles.commercial} id="acompanamiento">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Tres rutas comerciales</span>
              <h2>El mismo portafolio, distintas preguntas.</h2>
            </div>
            <div className={styles.commercialList}>
              {audiences.map(([number, title, copy, cta]) => (
                <article key={title}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div><Link href="/contacto">{cta} →</Link></article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closing} id="contacto">
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Wondergreen</span><h2>¿Tienes un cultivo, una necesidad o un problema por resolver?</h2><p>Cuéntanos el contexto. El siguiente paso puede ser una guía, un producto, un análisis o acompañamiento técnico.</p></div>
            <div className={styles.buttonRow}><Link className={`${styles.button} ${styles.dark}`} href="/contacto">Hablar con equipo técnico</Link><Link className={`${styles.button} ${styles.ghost}`} href="/">Volver a Greenatics</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
