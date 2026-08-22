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
    "Nutrición por etapas para plantas, jardín, huerta y vivero: observa, identifica, elige, aplica y revisa con el sistema Wondergreen Casa & Jardín.",
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
    copy: "Interior, balcón o terraza: identifica etapa y condición antes de decidir si la planta necesita nutrición, equilibrio o simplemente corregir manejo.",
    href: "/casa-jardin/diagnostico",
    cta: "Empezar diagnóstico",
  },
  {
    number: "02",
    title: "Mi huerta",
    copy: "Suelo, crecimiento, transición reproductiva y fruto se leen como etapas distintas. La secuencia orienta; no significa aplicar todos los productos juntos.",
    href: "/casa-jardin/guias#mi-huerta",
    cta: "Abrir Mi Huerta",
  },
  {
    number: "03",
    title: "Jardín o vivero",
    copy: "Cuando conviven muchas plantas, la lógica común ayuda a ordenar decisiones sin asumir que todas están en la misma etapa o condición.",
    href: "#etapas",
    cta: "Ver etapas",
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
            <a href="#contextos">Para quién</a>
            <a href="#seguridad">Antes de aplicar</a>
            <a href="#etapas">Etapas</a>
            <a href="#diagnostico">Diagnóstico</a>
            <a href="#kits">Kits</a>
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
                Tu planta cambia. Su nutrición también. Casa & Jardín traduce la lógica Wondergreen a una ruta doméstica sencilla: primero observa la planta y el suelo; después identifica la etapa; solo entonces eliges el siguiente paso.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/diagnostico">Encontrar un punto de partida</Link>
                <a className={`${styles.button} ${styles.ghost}`} href="#etapas">Ver las etapas</a>
                <a className={styles.textLink} href="/api/public-resources/wondergreen-product-master" target="_blank" rel="noreferrer">Descargar catálogo Wondergreen ↓</a>
              </div>
              <div className={styles.heroTruth}>
                <span>Pre-lanzamiento</span>
                <strong>La arquitectura de producto, diagnóstico y guías puede recorrerse. PVP, checkout y dosis domésticas universales permanecen bloqueados hasta cerrar sus dependencias.</strong>
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
              <p>Casa & Jardín no parte de una receta universal. Cambian la especie, el ambiente, el tamaño, la etapa y el problema; por eso la web te lleva primero al contexto que más se parece al tuyo.</p>
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

        <section className={styles.safety} id="seguridad">
          <div className={`${styles.container} ${styles.safetyGrid}`}>
            <div className={styles.safetyIntro}>
              <span className={styles.eyebrow}>Antes del producto</span>
              <h2>A veces, la mejor dosis es no fertilizar todavía.</h2>
              <p>Una hoja amarilla, una planta marchita o un sustrato muy húmedo no son diagnósticos nutricionales por sí solos. El sistema primero revisa agua, drenaje, raíces, estrés y sanidad.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/diagnostico">Iniciar diagnóstico</Link>
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

        <section className={styles.stages} id="etapas" aria-labelledby="stages-title">
          <div className={styles.container}>
            <div className={styles.stagesIntro}>
              <span className={styles.eyebrow}>4 etapas + suelo</span>
              <h2 id="stages-title">No necesita más. Necesita lo correcto.</h2>
              <p>COMPOST prepara la base. CRECE, EQUILIBRA, FLORECE y FRUCTIFICA traducen cuatro referencias sólidas Wondergreen ya existentes a una lectura doméstica por etapa. Los formatos pequeños siguen siendo propuestos hasta cerrar su habilitación comercial y regulatoria.</p>
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

        <section className={styles.diagnostic} id="diagnostico">
          <div className={`${styles.container} ${styles.diagnosticGrid}`}>
            <div>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Diagnóstico orientativo</span>
              <h2>Deja de fertilizar a ciegas.</h2>
              <p>El diagnóstico no intenta adivinar una dosis. Ordena la observación, detecta señales de seguridad y te lleva a una etapa o a una revisión previa cuando todavía no corresponde fertilizar.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.light}`} href="/casa-jardin/diagnostico">Abrir diagnóstico</Link>
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

        <section className={styles.kits} id="kits">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Kits Casa & Jardín · pre-lanzamiento</span><h2>Compra la lógica del sistema, no una mezcla de productos.</h2></div>
              <p>Los kits visibles conservan la composición V1 ya gobernada. No tienen checkout ni PVP público: dosificador, empaque, etiquetado, stock, logística y condición regulatoria de las presentaciones domésticas todavía deben cerrarse.</p>
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
              <p>Productos, formatos propuestos, kits, diagnóstico y guías ya tienen arquitectura navegable. Compra, precios y cobertura se habilitan únicamente cuando sus dependencias estén reconciliadas.</p>
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
