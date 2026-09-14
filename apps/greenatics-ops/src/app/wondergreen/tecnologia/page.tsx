import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { solidFertilizers } from "@/data/wondergreen-public";
import {
  wondergreenEvidenceLevels,
  wondergreenTechnologyConcepts,
  wondergreenTechnologyImplications,
} from "@/data/wondergreen-technology";
import styles from "./technology.module.css";

const commercialSolids = solidFertilizers.filter((reference) => reference.truthStatus === "commercial-reconciled");

export default function WondergreenTechnologyPage() {
  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd
        items={[
          { name: "Greenatics", path: "/" },
          { name: "Wondergreen", path: "/wondergreen" },
          { name: "Tecnología", path: "/wondergreen/tecnologia" },
        ]}
      />
      <main>
        <section className={styles.hero} aria-labelledby="technology-title">
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <div className={styles.breadcrumb}>
                <Link href="/wondergreen">Wondergreen</Link>
                <span>→</span>
                <span>Tecnología</span>
              </div>
              <span className={styles.eyebrow}>Tecnología Wondergreen · Product Truth primero</span>
              <h1 id="technology-title">Organomineral. Oclusión. Lenta liberación.</h1>
              <p className={styles.lead}>
                Esta página explica qué significan esos conceptos dentro de Wondergreen, cuándo pueden asociarse a una referencia y dónde termina la característica del producto y empieza la necesidad de evidencia agronómica. La tecnología profundiza el producto; no sustituye su ficha ni convierte una característica en una promesa de resultado.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/productos">Ver productos</Link>
                <Link className={styles.button} href="/biblioteca/criterios-nutricionales">Revisar criterios nutricionales</Link>
              </div>
            </div>
            <aside className={styles.heroLock} aria-label="Límite de interpretación de la tecnología Wondergreen">
              <span>Regla de publicación</span>
              <strong>Característica ≠ resultado.</strong>
              <p>
                Una formulación, una matriz o una característica de liberación pueden estar documentadas para una referencia concreta. Beneficios, dosis, frecuencia, compatibilidad y respuestas de campo exigen el soporte y el contexto correspondientes.
              </p>
            </aside>
          </div>
        </section>

        <section className={styles.principles} aria-labelledby="concepts-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Tres conceptos · límites explícitos</span>
                <h2 id="concepts-title">Entender qué describe cada palabra antes de usarla como argumento agronómico.</h2>
              </div>
              <p>
                Los tres conceptos no forman una promesa acumulativa ni aplican automáticamente a todo el portafolio. Cada afirmación debe volver a la referencia, versión y documentación técnica que la soportan.
              </p>
            </div>

            <div className={styles.conceptList}>
              {wondergreenTechnologyConcepts.map((concept) => (
                <article className={styles.concept} id={concept.id} key={concept.id}>
                  <span className={styles.conceptNumber}>{concept.number}</span>
                  <div>
                    <span className={styles.eyebrow}>{concept.name}</span>
                    <h3>{concept.headline}</h3>
                  </div>
                  <div className={styles.conceptBody}>
                    <p>{concept.definition}</p>
                    <div className={styles.ruleGrid}>
                      <div className={styles.rule}>
                        <small>Cuándo aplica</small>
                        <strong>{concept.appliesWhen}</strong>
                      </div>
                      <div className={styles.rule}>
                        <small>Qué no demuestra</small>
                        <strong>{concept.guardrail}</strong>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.evidence} aria-labelledby="evidence-title">
          <div className={styles.container}>
            <div className={styles.evidenceHead}>
              <span className={styles.eyebrow}>De Product Truth a evidencia</span>
              <h2 id="evidence-title">Cuatro niveles que no deben confundirse.</h2>
              <p>
                La profundidad técnica aumenta desde describir una referencia hasta afirmar un resultado. A medida que la afirmación avanza, también aumenta el nivel de soporte necesario para publicarla de forma responsable.
              </p>
            </div>
            <div className={styles.evidenceGrid}>
              {wondergreenEvidenceLevels.map((level) => (
                <article className={styles.evidenceCard} key={level.number}>
                  <span>{level.number}</span>
                  <h3>{level.name}</h3>
                  <p>{level.meaning}</p>
                  <small>{level.publicationRule}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.products} aria-labelledby="products-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Tecnología conectada a producto</span>
                <h2 id="products-title">Abre la referencia concreta antes de interpretar la tecnología.</h2>
              </div>
              <p>
                Estas referencias sólidas están comercialmente reconciliadas en el Product Master público. Su presencia aquí no significa que todas compartan automáticamente todas las características tecnológicas descritas arriba.
              </p>
            </div>
            <div className={styles.productGrid}>
              {commercialSolids.map((product) => (
                <article className={styles.productCard} key={product.slug}>
                  <span>{product.publicStatus}</span>
                  <h3>{product.name}{product.formula ? ` · ${product.formula}` : ""}</h3>
                  <p>{product.role}</p>
                  <p>{product.stage}</p>
                  <Link href={`/wondergreen/productos/${product.slug}`}>Abrir producto y documentación →</Link>
                </article>
              ))}
            </div>
            <p className={styles.productNote}>
              Product Truth gobierna formulación, formato, presentación y condición comercial. La documentación vigente gobierna características como oclusión o lenta liberación cuando correspondan. La página de tecnología no amplía esos atributos por asociación.
            </p>
          </div>
        </section>

        <section className={styles.context} aria-labelledby="context-title">
          <div className={`${styles.container} ${styles.contextGrid}`}>
            <div>
              <span className={styles.eyebrow}>Lectura agronómica</span>
              <h2 id="context-title">La tecnología ayuda a entender el producto; el contexto define la recomendación.</h2>
              <p className={styles.lead}>
                Conocer la matriz o la forma física es un nivel de información. Convertirlo en una decisión de uso requiere revisar cultivo, etapa, condición del suelo, agua, manejo, análisis disponibles y documentación aplicable.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/cultivos">Explorar cultivos y guías</Link>
                <Link className={styles.button} href="/biblioteca">Abrir biblioteca técnica</Link>
              </div>
            </div>
            <div className={styles.implications}>
              {wondergreenTechnologyImplications.map((item) => (
                <article className={styles.implication} key={item.number}>
                  <span>{item.number}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.next} aria-labelledby="next-title">
          <div className={`${styles.container} ${styles.nextGrid}`}>
            <div>
              <span className={styles.eyebrow}>Siguiente nivel</span>
              <h2 id="next-title">Del concepto a la referencia y del producto a su documentación.</h2>
            </div>
            <div>
              <p>
                Si ya sabes qué referencia quieres revisar, entra al catálogo. Si quieres entender cómo se relaciona con un cultivo, abre el programa y su PDF oficial. Si aún no conoces la etapa o la referencia, usa Finder como orientación secundaria.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/productos">Ver catálogo Wondergreen</Link>
                <Link className={styles.button} href="/wondergreen/finder">Usar Finder</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
