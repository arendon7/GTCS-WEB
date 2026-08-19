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
import styles from "./casa-jardin.module.css";

export const metadata: Metadata = {
  title: "Casa, Jardín y Vivero | Wondergreen · Greenatics",
  description: "Nutrición por etapas para plantas, jardín, huerta y vivero: observa, identifica, elige, aplica y revisa con el sistema Wondergreen Casa & Jardín.",
  alternates: { canonical: "/casa-jardin" },
  robots: { index: false, follow: true },
};

const plantQuestions = [
  ["Está creciendo o sacando brotes", "CRECE", "2Grow Sólido 15-3-3"],
  ["Está estable y quieres mantenerla", "EQUILIBRA", "2Balance Sólido 7-7-7"],
  ["Está formando botones o flores", "FLORECE", "2Bloom Sólido 3-8-3"],
  ["Está en fruto o etapa productiva", "FRUCTIFICA", "2Fruit Sólido 3-3-8"],
  ["Vas a preparar o recuperar sustrato", "COMPOST", "Materia orgánica + acondicionamiento"],
] as const;

export default function CasaJardinPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · Casa, jardín y vivero</span>
              <h1>Nutrición por etapas para tus plantas.</h1>
              <p className={styles.lead}>Tu planta cambia. Su nutrición también. Observa qué está haciendo, identifica su condición y elige solo la etapa que necesita. La propuesta Casa & Jardín lleva la lógica Wondergreen a hogares, huertas, jardines y viveros sin convertir la fertilización en una receta automática.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/diagnostico">Encontrar un punto de partida</Link>
                <a className={`${styles.button} ${styles.ghost}`} href="#kits">Explorar kits</a>
              </div>
            </div>
            <aside className={styles.heroVisual}>
              <p className={styles.heroNote}>No apliques todo. Aplica lo que necesita. La identidad técnica sigue en Wondergreen; Greenatics aporta el sistema circular, el conocimiento y el soporte.</p>
              <Image src="/brand/wondergreen-nutrients.webp" width={720} height={310} alt="Logotipo oficial de Wondergreen Nutrients" priority />
            </aside>
          </div>
        </section>

        <section className={styles.path} aria-label="Método Wondergreen Casa y Jardín">
          <div className={`${styles.container} ${styles.pathGrid}`}>
            {homeGardenMethod.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>)}
          </div>
        </section>

        <section className={styles.section} id="etapas">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>4 etapas + suelo</span><h2>No necesita más. Necesita lo correcto.</h2></div>
              <p>CRECE, EQUILIBRA, FLORECE y FRUCTIFICA son nombres de uso doméstico para referencias sólidas Wondergreen ya existentes. COMPOST prepara y acondiciona el sistema de suelo. Los formatos B2C del handoff se muestran como propuestas, no como inventario comprable.</p>
            </div>
            <div className={styles.productGrid}>
              {homeGardenProducts.map((product) => (
                <article className={`${styles.card} ${styles[product.accent]}`} key={product.id}>
                  <div className={styles.stageBar} aria-hidden="true" />
                  <small>{product.id === "prepara" ? "Base del sistema" : "Etapa nutricional"}</small>
                  <h3>{product.consumerName}</h3>
                  <span className={styles.formula}>{product.formula ?? "Compost"}</span>
                  <p>{product.role}</p>
                  <p><strong>{product.prompt}</strong></p>
                  <Link href={`/casa-jardin/productos/${product.id}`}>Ver etapa y formatos propuestos →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Antes del producto</span><h2>¿Qué está haciendo tu planta?</h2></div>
              <p>La entrada correcta no es “qué fertilizante compro”, sino “qué etapa y condición estoy observando”. Si hay estrés severo, exceso de agua, raíces comprometidas o daño sanitario, la respuesta puede ser no fertilizar todavía.</p>
            </div>
            <div className={styles.decisionGrid}>
              {plantQuestions.map(([situation, result, technical]) => (
                <article className={styles.decisionCard} key={situation}>
                  <span className={styles.eyebrow}>Si observas</span>
                  <h3>{situation}</h3>
                  <p><strong>{result}</strong> · {technical}</p>
                </article>
              ))}
              <article className={styles.decisionCard}>
                <span className={styles.eyebrow}>Si “se ve mal”</span>
                <h3>No empieces fertilizando.</h3>
                <p>Primero revisa agua, drenaje, raíces, luz y sanidad. Una hoja amarilla o una planta marchita no son diagnósticos nutricionales por sí solos.</p>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section} id="kits">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Kits Casa & Jardín · pre-lanzamiento</span><h2>Compra la lógica del sistema, no una mezcla de productos.</h2></div>
              <p>Los cinco kits visibles conservan la composición V1 del handoff. Aún no tienen checkout ni PVP público: faltan cerrar dosificador, empaque, etiquetas, stock, logística y condición regulatoria de las presentaciones domésticas.</p>
            </div>
            <div className={styles.kitGrid}>
              {visibleHomeGardenKits.map((kit) => (
                <article className={styles.kitCard} key={kit.id}>
                  <span className={styles.eyebrow}>{kit.audience}</span>
                  <h3>{kit.name}</h3>
                  <p><strong>{kit.promise}</strong></p>
                  <ul>{kit.contents.map((content) => <li key={content}>{content}</li>)}</ul>
                  <p>{kit.guardrail}</p>
                  <Link href={`/casa-jardin/kits/${kit.id}`}>Ver composición y ruta →</Link>
                  <div className={styles.status}>Pre-lanzamiento · compra deshabilitada</div>
                </article>
              ))}
            </div>
            <div className={styles.guardrail}>
              <strong>Trasplanta & Arranca no aparece como kit disponible.</strong>
              <p>El handoff lo bloquea expresamente hasta validar el componente radicular/bioinsumo. Sí mantenemos la guía educativa de trasplante, porque su lógica es primero drenaje, raíces, estabilidad y observación.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Cómo aplicar</span><h2>Ni de más. Ni a ojo.</h2></div>
              <p>La frecuencia y equivalencia doméstica del dosificador todavía no están reconciliadas. Publicarlas hoy como universales sería convertir una herramienta orientativa en una receta sin validar.</p>
            </div>
            <div className={styles.flow}>
              {homeGardenApplication.map((item, index) => <article key={item.step}><strong>{String(index + 1).padStart(2, "0")} · {item.step}</strong><p>{item.copy}</p></article>)}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Semáforo antes de aplicar</span><h2>A veces, la mejor dosis es no fertilizar todavía.</h2></div>
              <p>El sistema debe ayudar a detener una mala decisión, no solo recomendar un producto. Este semáforo es la regla de seguridad central del diagnóstico Casa & Jardín.</p>
            </div>
            <div className={styles.trafficGrid}>
              {homeGardenTrafficLight.map((item) => <article className={styles.trafficCard} key={item.level}><span className={styles.level}>{item.level}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`} id="guias">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Conocimiento práctico</span><h2>Guías para mirar mejor antes de decidir.</h2></div>
              <p>El handoff incluye guías maestras de Casa & Jardín, Mi Huerta, etapas y trasplante. Las llevamos a una biblioteca navegable para que el PDF sea soporte, no el único lugar donde vive el conocimiento.</p>
            </div>
            <div className={styles.guideGrid}>
              {homeGardenGuides.map((guide) => (
                <article className={styles.guideCard} key={guide.id}>
                  <span>Guía del handoff</span>
                  <h3>{guide.title}</h3>
                  <p>{guide.summary}</p>
                  <Link href={`/casa-jardin/guias#${guide.id}`}>Abrir guía →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Diagnóstico orientativo</span><h2>Deja de fertilizar a ciegas.</h2></div>
              <p>El diagnóstico pregunta tipo de planta, etapa, condición, cantidad y tamaños de matera. Si detecta una señal de seguridad, detiene la recomendación. El tamaño se captura para una futura recomendación de formato, pero todavía no se convierte en dosis.</p>
            </div>
            <div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/diagnostico">Iniciar diagnóstico</Link></div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Preguntas frecuentes</span><h2>Lo que el sistema sí puede —y no puede— decirte.</h2></div>
              <p>Las respuestas conservan los límites del handoff: nutrición por etapa, sin promesas de floración, rendimiento o diagnósticos automáticos a partir de un solo síntoma.</p>
            </div>
            <div className={styles.faq}>{homeGardenFaq.map((item) => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.release}`}>
          <div className={`${styles.container} ${styles.releaseGrid}`}>
            <div>
              <span className={styles.eyebrow}>Estado de lanzamiento</span>
              <h2>El catálogo puede recorrerse. La tienda todavía no.</h2>
              <p className={styles.lead}>Productos, formatos propuestos, kits, diagnóstico y guías ya tienen arquitectura navegable. La compra y los precios se habilitan únicamente cuando sus dependencias estén reconciliadas.</p>
            </div>
            <div>
              <strong>Ya está gobernado</strong>
              <ul>{readyHomeGardenLaunchItems.map((item) => <li key={item.id}><strong>{item.publicLabel}.</strong> {item.publicCopy}</li>)}</ul>

              <strong>Falta cerrar antes de activar ecommerce</strong>
              <ul>{pendingHomeGardenLaunchItems.map((item) => <li key={item.id}><strong>{item.publicLabel}.</strong> {item.publicCopy}</li>)}</ul>

              {blockedHomeGardenLaunchItems.map((item) => (
                <div className={styles.guardrail} key={item.id}>
                  <strong>{item.publicLabel} · bloqueado</strong>
                  <p>{item.publicCopy}</p>
                </div>
              ))}

              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen">Ver Wondergreen técnico</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/contacto">Hablar con Greenatics</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
