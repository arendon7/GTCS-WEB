import Link from "next/link";
import styles from "./portfolio-wondergreen-science.module.css";
import { WondergreenScienceVisual } from "@/components/wondergreen-science-visual";

export function PortfolioWondergreenScience() {
  return (
    <section className={styles.section} aria-labelledby="portfolio-wondergreen-science-title">
      <div className={["container", styles.inner].join(" ")}>
        <header className={styles.heading}>
          <h2 id="portfolio-wondergreen-science-title">La formulación también trabaja con el suelo.</h2>
          <p>
            Wondergreen combina nutrición mineral, materia orgánica y procesos biológicos para
            acompañar distintas etapas del cultivo. Dos bases de formulación conectan producto,
            suelo y manejo.
          </p>
        </header>

        <div className={styles.stories}>
          <article className={styles.story}>
            <WondergreenScienceVisual family="solid" alt="Ilustración conceptual de un pellet alargado con inclusiones minerales dentro de una matriz orgánica; no es micrografía ni muestra medida." caption="Matriz orgánica · fracción mineral integrada" className={styles.solidVisual} artDirection="panel" />
            <div className={styles.copy}>
              <span className={styles.family}>Fertilizantes sólidos · cuatro referencias</span>
              <h3>Nutrientes integrados en una matriz organomineral ocluida.</h3>
              <p>
                El gránulo reúne componentes orgánicos y minerales en una formulación diseñada
                para liberar nutrientes de manera gradual. La investigación en otras formulaciones
                organominerales muestra que ajustar el momento de disponibilidad puede acompañar
                la demanda del cultivo y mejorar su crecimiento.
              </p>
              <Link href="/wondergreen/#solidos">Explorar 2GROW, 2BALANCE, 2BLOOM y 2FRUIT <span aria-hidden="true">→</span></Link>
            </div>
          </article>

          <article className={[styles.story, styles.storyLiquid].join(" ")}>
            <WondergreenScienceVisual family="liquid" alt="Composición conceptual de recipientes que representa etapas de bioles, formulación y fertilizante líquido; el color es ilustrativo." caption="Origen biológico · proceso multietapa" className={styles.liquidVisual} artDirection="panel" />
            <div className={styles.copy}>
              <span className={styles.family}>Fertilizantes líquidos · cinco formulaciones</span>
              <h3>Bioles transformados en nutrición líquida formulada y estabilizada.</h3>
              <p>
                La fermentación anaerobia conserva una matriz de nutrientes y compuestos orgánicos.
                Después, la formulación y la estabilización preparan referencias con concentraciones
                distintas para crecimiento, equilibrio, floración y desarrollo del fruto.
              </p>
              <Link href="/wondergreen/#liquidos">Conocer el proceso y las referencias líquidas <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        </div>

        <div className={styles.evidence}>
          <div>
            <strong>15–28 %</strong>
            <span>más biomasa aérea en tomate frente a los comparadores de un ensayo con una formulación organomineral específica.</span>
            <a href="https://doi.org/10.1016/j.scitotenv.2021.151977" target="_blank" rel="noopener noreferrer">Ngo et al. · Science of the Total Environment, 2022 <span aria-hidden="true">↗</span></a>
          </div>
          <div>
            <strong>17 %</strong>
            <span>más materia seca en pak choi con digestato nitrificado y complementado, frente al tratamiento mineral de referencia.</span>
            <a href="https://doi.org/10.3389/fpls.2022.770179" target="_blank" rel="noopener noreferrer">Weimers et al. · Frontiers in Plant Science, 2022 <span aria-hidden="true">↗</span></a>
          </div>
          <p>
            Son resultados publicados para materiales, cultivos y condiciones experimentales
            concretas; no corresponden a ensayos de productos Wondergreen.{" "}
            <Link href="/wondergreen/ciencia/#evidencia-cientifica">Leer la investigación y su alcance <span aria-hidden="true">→</span></Link>
          </p>
        </div>
      </div>
    </section>
  );
}
