import Image from "next/image";
import Link from "next/link";
import styles from "./home-wondergreen-science.module.css";
import { HomeProductFamilyExplorer } from "@/components/home-product-family-explorer";
import { WondergreenScienceVisual } from "@/components/wondergreen-science-visual";

export function HomeWondergreenBridge() {
  return (
    <section className="home-wondergreen-bridge" aria-labelledby="wondergreen-bridge-title">
      <div className="container">
        <div className="home-wondergreen-bridge__heading">
          <div className="home-wondergreen-bridge__copy">
            <div className={styles.brandLockup}>
              <Image
                className={styles.brand}
                src="/brand/wondergreen-nutrients-transparent.png"
                alt="Wondergreen Nutrients"
                width={420}
                height={221}
              />
              <span>Línea agrícola<br />de Greenatics</span>
            </div>
            <h2 id="wondergreen-bridge-title">Wondergreen: nutrición para suelo y cultivo, con una línea para <span className="home-editorial-accent">cada etapa.</span></h2>
          </div>
          <div className="home-wondergreen-bridge__intro">
            <p>
              Wondergreen reúne compost, fertilizantes organominerales sólidos ocluidos, fertilizantes
              líquidos elaborados a partir de bioles de digestión anaerobia multietapa y bioinsumos.
            </p>
            <p>
              Explora las referencias y sus fichas. La elección se completa con el cultivo, la etapa
              y las condiciones de cada lote.
            </p>
            <div className="home-wondergreen-bridge__actions">
              <Link className="button button--primary" href="/biblioteca/catalogo-wondergreen/">
                Abrir catálogo Wondergreen
              </Link>
            </div>
          </div>
        </div>

        <section className={styles.science} aria-labelledby="home-wondergreen-science-title">
          <div className={styles.scienceHeading}>
            <div>
              <span>Formulación y suelo</span>
              <h3 id="home-wondergreen-science-title">Qué distingue las dos bases de nutrición.</h3>
            </div>
            <p>La estructura y el origen describen cómo se formula cada familia; la respuesta se interpreta con la ficha vigente y las condiciones del cultivo.</p>
          </div>

          <div className={styles.scienceGrid}>
            <article className={styles.scienceCard}>
              <WondergreenScienceVisual
                family="solid"
                alt="Pellet alargado de materia orgánica con partículas minerales visibles en su interior."
                caption="Matriz orgánica · fracción mineral integrada"
                className={styles.scienceVisual}
              />
              <div className={styles.scienceCopy}>
                <span>Fertilizantes sólidos</span>
                <h4>Matriz organomineral ocluida.</h4>
                <p>La formulación integra nutrientes minerales y materia orgánica. Su diseño está orientado a una liberación gradual; el comportamiento depende de la fórmula, el suelo y el manejo.</p>
              </div>
            </article>

            <article className={`${styles.scienceCard} ${styles.scienceCardLiquid}`}>
              <WondergreenScienceVisual
                family="liquid"
                alt="Recipientes de vidrio con líquido ámbar y elementos botánicos alrededor."
                caption="Origen biológico · proceso multietapa"
                className={`${styles.scienceVisual} ${styles.liquidVisual}`}
              />
              <div className={styles.scienceCopy}>
                <span>Fertilizantes líquidos</span>
                <h4>Una base biológica, formulada para cada referencia.</h4>
                <p>Los bioles aportan nutrientes, compuestos orgánicos y microorganismos que acompañan el bioma suelo-planta. La concentración y el uso dependen de la ficha de cada producto.</p>
                <ol className={styles.processSteps} aria-label="Etapas generales del proceso">
                  <li><span>01</span> Bioles de digestión anaerobia multietapa</li>
                  <li><span>02</span> Formulación y estabilización</li>
                  <li><span>03</span> Base líquida según cada referencia</li>
                </ol>
              </div>
            </article>
          </div>

          <p className={styles.scienceBoundary}>Los estudios sobre otras formulaciones ayudan a entender principios y variables; no prueban por sí solos el desempeño de una referencia Wondergreen.</p>
          <Link className={styles.scienceLink} href="/wondergreen/ciencia/#evidencia-cientifica">
            Leer la evidencia y sus límites <span aria-hidden="true">→</span>
          </Link>
        </section>

        <HomeProductFamilyExplorer />
      </div>
    </section>
  );
}
