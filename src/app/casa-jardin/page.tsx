import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  homeGardenApplication,
  homeGardenFaq,
  homeGardenGuides,
  homeGardenMethod,
  homeGardenProducts,
  homeGardenTrafficLight,
  visibleHomeGardenKits,
} from "@/data/home-garden";
import {
  blockedHomeGardenLaunchItems,
  pendingHomeGardenLaunchItems,
  readyHomeGardenLaunchItems,
} from "@/data/home-garden-readiness";
import styles from "./casa-jardin-v2.module.css";

export const metadata: Metadata = {
  title: "Casa, Jardín y Vivero | Wondergreen · Greenatics",
  description:
    "Productos Wondergreen por etapa y kits Casa & Jardín para plantas, huerta y vivero, con orientación segura cuando no está clara la etapa o condición de la planta.",
  alternates: { canonical: "/casa-jardin" },
  robots: { index: false, follow: true },
};

const stageVisuals: Record<string, { src: string; alt: string }> = {
  crece: { src: "/api/public-media/wondergreen-2grow", alt: "Línea Wondergreen 2Grow para crecimiento y recuperación" },
  equilibra: { src: "/api/public-media/wondergreen-2balance", alt: "Línea Wondergreen 2Balance para equilibrio y mantenimiento" },
  florece: { src: "/api/public-media/wondergreen-2bloom", alt: "Línea Wondergreen 2Bloom para prefloración y floración" },
  fructifica: { src: "/api/public-media/wondergreen-2fruit", alt: "Línea Wondergreen 2Fruit para llenado y maduración" },
};

const contexts = [
  {
    number: "01",
    title: "Plantas en casa",
    copy: "Interior, balcón o terraza: explora kits organizados por uso y conserva la revisión de etapa y condición antes de aplicar.",
    href: "#kits",
    cta: "Ver kits para casa",
  },
  {
    number: "02",
    title: "Mi huerta",
    copy: "Suelo, crecimiento, transición reproductiva y fruto se leen como etapas distintas. La secuencia orienta; no significa aplicar todos los productos juntos.",
    href: "/casa-jardin/kits/mi-huerta",
    cta: "Ver Kit Mi Huerta",
  },
  {
    number: "03",
    title: "Jardín o vivero",
    copy: "Cuando conviven muchas plantas, la lógica común ayuda a ordenar decisiones sin asumir que todas están en la misma etapa o condición.",
    href: "#etapas",
    cta: "Ver productos por etapa",
  },
] as const;

const diagnosticQuestions = [
  ["01", "¿Qué planta es?", "Tipo de planta y contexto de uso."],
  ["02", "¿Qué está haciendo?", "Creciendo, estable, floreciendo, fructificando o en una condición mixta."],
  ["03", "¿Cómo está?", "Humedad, drenaje, raíces, estrés y señales sanitarias antes de fertilizar."],
  ["04", "¿Cuántas y de qué tamaño?", "Cantidad y tamaño de matera se capturan sin convertirlos todavía en una dosis automática."],
] as const;

export default function CasaJardinPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.subnav} aria-label="Navegación Casa y Jardín">
        <div className={styles.container}>
          <span>Casa & Jardín</span>
          <div>
            <a href="#etapas">Productos</a>
            <a href="#kits">Kits</a>
            <a href="#contextos">Para quién</a>
            <a href="#seguridad">Antes de aplicar</a>
            <a href="#diagnostico">Orientador</a>
            <a href="#guias">Guías</a>
            <a href="#lanzamiento">Estado</a>
          </div>
        </div>
      </nav>

      <main>
        <section className={styles.hero} aria-labelledby="home-garden-title">
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Wondergreen · Casa, jardín y vivero</span>
              <h1 id="home-garden-title">Nutrición por etapas para tus plantas.</h1>
              <p className={styles.lead}>
                Casa & Jardín organiza Wondergreen en productos por etapa y kits por uso para que puedas entender la oferta antes de decidir. Si la etapa o la condición de la planta no están claras, el orientador ayuda a revisar el siguiente paso sin convertir un síntoma en una receta.
              </p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.primary}`} href="#etapas">Ver productos por etapa</a>
                <a className={`${styles.button} ${styles.ghost}`} href="#kits">Ver kits</a>
                <Link className={styles.textLink} href="/casa-jardin/diagnostico">No sé qué etapa corresponde →</Link>
                <a className={styles.textLink} href="/api/public-resources/wondergreen-product-master" target="_blank" rel="noreferrer">Descargar catálogo Wondergreen ↓</a>
              </div>
              <div className={styles.heroTruth}>
                <span>Pre-lanzamiento</span>
                <strong>Las referencias Wondergreen que soportan las etapas tienen Product Truth técnico. Los formatos domésticos y kits siguen en pre-lanzamiento; PVP, checkout y dosis universales permanecen bloqueados hasta cerrar sus dependencias.</strong>
              </div>
            </div>

            <aside className={styles.heroVisual} aria-label="Sistema Wondergreen Casa y Jardín">
              <Image
                src="/api/public-media/wondergreen-system-stages"
                width={760}
                height={1074}
                alt="Sistema Wondergreen por etapas: compost, 2Grow, 2Balance, 2Bloom, 2Fruit y bioinsumos"
                priority
                unoptimized
              />
              <div className={styles.heroCaption}>
                <strong>Una sola lógica. Distintas etapas.</strong>
                <small>COMPOST · CRECE · EQUILIBRA · FLORECE · FRUCTIFICA</small>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.stages} id="etapas" aria-labelledby="stages-title">
          <div className={styles.container}>
            <div className={styles.stagesIntro}>
              <span className={styles.eyebrow}>Productos · 4 etapas + suelo</span>
              <h2 id="stages-title">No necesita más. Necesita lo correcto.</h2>
              <p>COMPOST prepara la base. CRECE, EQUILIBRA, FLORECE y FRUCTIFICA traducen cuatro referencias sólidas Wondergreen ya existentes a una lectura doméstica por etapa. Explorar una etapa no equivale a recomendar fertilización: si hay exceso de agua, daño radicular, estrés severo o una señal sanitaria, primero se corrige o revisa esa condición.</p>
            </div>

            {homeGardenProducts.map((product, index) => {
              const visual = stageVisuals[product.id];
              return (
                <article className={styles.stageRow} key={product.id}>
                  <span className={styles.stageNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <div className={styles.stageIdentity}>
                    <small>{product.id === "prepara" ? "Base del sistema" : "Etapa nutricional"}</small>
                    <h3>{product.consumerName}</h3>
                    <span className={styles.formula}>{product.formula ?? "Compost"}</span>
                  </div>
                  <div className={styles.stageVisual}>
                    {visual ? (
                      <Image src={visual.src} width={760} height={1074} alt={visual.alt} sizes="(max-width: 820px) 80vw, 28vw" unoptimized />
                    ) : (
                      <div className={styles.compostVisual} aria-label="Compost como base del sistema"><span>Suelo primero</span><strong>COMPOST</strong><small>Materia orgánica · acondicionamiento</small></div>
                    )}
                  </div>
                  <div className={styles.stageCopy}>
                    <p>{product.role}</p>
                    <p><strong>{product.prompt}</strong></p>
                    <Link href={`/casa-jardin/productos/${product.id}`}>Ver etapa y formatos propuestos →</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.kits} id="kits">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Kits Casa & Jardín · pre-lanzamiento</span><h2>Kits por uso. Etapas separadas, no una receta universal.</h2></div>
              <p>Los kits visibles conservan la composición V1 ya gobernada y reúnen etapas para contextos concretos. Tener varios productos en un kit no significa aplicarlos juntos. No tienen checkout ni PVP público: dosificador, empaque, etiquetado, stock, logística y condición regulatoria de las presentaciones domésticas todavía deben cerrarse.</p>
            </div>
            <div className={styles.kitList}>
              {visibleHomeGardenKits.map((kit, index) => (
                <article className={styles.kitRow} key={kit.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div className={styles.kitIdentity}><small>{kit.audience}</small><h3>{kit.name}</h3><div className={styles.status}>Pre-lanzamiento · compra deshabilitada</div></div>
                  <p className={styles.kitPromise}>{kit.promise}</p>
                  <div className={styles.kitContents}>
                    <ul>{kit.contents.map((content) => <li key={content}>{content}</li>)}</ul>
                    <p>{kit.guardrail}</p>
                    <Link href={`/casa-jardin/kits/${kit.id}`}>Ver composición y ruta →</Link>
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.guardrail}>
              <strong>Trasplanta & Arranca no aparece como kit disponible.</strong>
              <p>Permanece bloqueado hasta validar el componente radicular/bioinsumo. La guía educativa de trasplante sí puede consultarse porque prioriza drenaje, raíces, estabilidad y observación antes de decidir nutrición.</p>
            </div>
          </div>
        </section>

        <section className={styles.safety} id="seguridad">
          <div className={`${styles.container} ${styles.safetyGrid}`}>
            <div className={styles.safetyIntro}>
              <span className={styles.eyebrow}>Antes de aplicar</span>
              <h2>A veces, la mejor dosis es no fertilizar todavía.</h2>
              <p>Una hoja amarilla, una planta marchita o un sustrato muy húmedo no son diagnósticos nutricionales por sí solos. El sistema primero revisa agua, drenaje, raíces, estrés y sanidad antes de convertir una etapa del catálogo en una acción.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/diagnostico">Revisar condición y etapa</Link>
              </div>
            </div>
            <div className={styles.trafficList}>
              {homeGardenTrafficLight.map((item) => (
                <article className={styles.trafficItem} key={item.level}>
                  <span className={styles.trafficLevel}>{item.level}</span>
                  <div><h3>{item.title}</h3><p>{item.copy}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.diagnostic} id="diagnostico">
          <div className={`${styles.container} ${styles.diagnosticGrid}`}>
            <div>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Orientación secundaria</span>
              <h2>¿No sabes qué etapa corresponde?</h2>
              <p>El orientador entra cuando hay incertidumbre sobre la etapa o la condición de la planta. No calcula dosis, no diagnostica por un solo síntoma y puede detener la ruta de fertilización si primero corresponde revisar agua, drenaje, raíces, estrés o sanidad.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.light}`} href="/casa-jardin/diagnostico">Usar orientador</Link>
                <a className={`${styles.button} ${styles.outlineLight}`} href="#guias">Consultar guías</a>
              </div>
            </div>
            <div className={styles.decisionList}>
              {diagnosticQuestions.map(([number, title, copy]) => (
                <div className={styles.decisionItem} key={number}><span>{number}</span><div><strong>{title}</strong><small>{copy}</small></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.method} aria-label="Método Wondergreen Casa y Jardín">
          <div className={`${styles.container} ${styles.methodGrid}`}>
            {homeGardenMethod.map((step, index) => (
              <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionSoft}`} id="contextos">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Tres contextos</span><h2>La misma lógica, plantas muy distintas.</h2></div>
              <p>Puedes entrar por el kit o la etapa que mejor describe tu contexto. La especie, el ambiente, el tamaño, la etapa y la condición siguen determinando si ese producto corresponde o si primero hay que corregir manejo.</p>
            </div>
            <div className={styles.contextGrid}>
              {contexts.map((item) => (
                <article className={styles.contextItem} key={item.number}>
                  <span className={styles.index}>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  {item.href.startsWith("/") ? <Link href={item.href}>{item.cta} →</Link> : <a href={item.href}>{item.cta} →</a>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.application}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Cómo aplicar</span><h2>Ni de más. Ni a ojo.</h2></div>
              <p>La frecuencia y equivalencia doméstica del dosificador todavía no están reconciliadas. Publicarlas como universales hoy sería convertir una herramienta orientativa en una receta sin validar.</p>
            </div>
            <div className={styles.applicationFlow}>
              {homeGardenApplication.map((item, index) => (
                <article key={item.step}><strong>{String(index + 1).padStart(2, "0")} · {item.step}</strong><p>{item.copy}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.guides} id="guias">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Conocimiento práctico</span><h2>Guías para mirar mejor antes de decidir.</h2></div>
              <p>Casa & Jardín, Mi Huerta, etapas y trasplante ya están disponibles como lectura web. El catálogo general Wondergreen también puede descargarse desde esta página.</p>
            </div>
            <div className={styles.guideGrid}>
              {homeGardenGuides.map((guide) => (
                <article className={styles.guideCard} key={guide.id}>
                  <span>Lectura web</span>
                  <h3>{guide.title}</h3>
                  <p>{guide.summary}</p>
                  <Link href={`/casa-jardin/guias#${guide.id}`}>Abrir guía →</Link>
                </article>
              ))}
              <article className={`${styles.guideCard} ${styles.catalogGuide}`}>
                <span>PDF descargable</span>
                <h3>Catálogo Wondergreen</h3>
                <p>Sistema completo, organominerales, líquidos, bioinsumos, presentaciones y narrativa de las líneas Wondergreen.</p>
                <a href="/api/public-resources/wondergreen-product-master" target="_blank" rel="noreferrer">Descargar catálogo PDF ↓</a>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Preguntas frecuentes</span><h2>Lo que el sistema sí puede —y no puede— decirte.</h2></div>
              <p>Las respuestas conservan los límites técnicos: nutrición por etapa, sin promesas de floración, rendimiento o diagnósticos automáticos a partir de un solo síntoma.</p>
            </div>
            <div className={styles.faq}>{homeGardenFaq.map((item) => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
          </div>
        </section>

        <section className={styles.release} id="lanzamiento">
          <div className={`${styles.container} ${styles.releaseGrid}`}>
            <div className={styles.releaseCopy}>
              <span className={styles.eyebrow}>Estado de lanzamiento</span>
              <h2>El catálogo puede recorrerse. La tienda todavía no.</h2>
              <p>Productos, formatos propuestos, kits, orientador y guías ya tienen arquitectura navegable. Compra, precios, dosis y cobertura se habilitan únicamente cuando sus dependencias estén reconciliadas.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen">Ver Wondergreen técnico</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/contacto">Hablar con Greenatics</Link>
              </div>
            </div>
            <div className={styles.releaseStatus}>
              <div className={styles.releaseGroup}>
                <strong>Ya está gobernado</strong>
                <ul>{readyHomeGardenLaunchItems.map((item) => <li key={item.id}><strong>{item.publicLabel}.</strong> {item.publicCopy}</li>)}</ul>
              </div>
              <div className={styles.releaseGroup}>
                <strong>Falta cerrar antes de activar ecommerce</strong>
                <ul>{pendingHomeGardenLaunchItems.map((item) => <li key={item.id}><strong>{item.publicLabel}.</strong> {item.publicCopy}</li>)}</ul>
              </div>
              {blockedHomeGardenLaunchItems.map((item) => (
                <div className={styles.guardrail} key={item.id}>
                  <strong>{item.publicLabel} · bloqueado</strong>
                  <p>{item.publicCopy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
