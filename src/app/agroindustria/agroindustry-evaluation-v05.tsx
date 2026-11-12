import Image from "next/image";
import styles from "./agroindustry-evaluation-v05.module.css";

export function AgroindustryEvaluationV05() {
  return (
    <section className={styles.section} aria-labelledby="agroindustry-evaluation-v05-title">
      <div className={styles.inner}>
        <header className={styles.intro}>
          <div>
            <span className={styles.eyebrow}>Evaluación de corrientes · Agroindustria</span>
            <h3 className={styles.title} id="agroindustry-evaluation-v05-title">
              Antes de elegir una ruta, entendamos qué corriente tienes.
            </h3>
          </div>
          <p className={styles.introCopy}>
            Relacionamos el material con el proceso que lo genera y con el uso esperado para sus salidas. Así puedes decidir qué conviene conocer antes de comprometer recursos.
          </p>
        </header>

        <figure className={styles.artwork}>
          <Image
            src="/diagrams/agroindustria-decision-v05/agroindustry-material-evaluation-v05.jpg"
            alt="Corrientes agroindustriales distintas y una muestra tomada para caracterización, junto a alternativas de energía, acondicionamiento orgánico y productos por evaluar."
            width={1774}
            height={887}
            sizes="(max-width: 760px) 100vw, (max-width: 1100px) 92vw, 80vw"
          />
          <figcaption className={styles.artworkCaption}>
            <div>
              <span className={styles.captionLabel}>Del material a la comparación</span>
              <p className={styles.captionText}>
                Corrientes distintas requieren preguntas, muestras y criterios propios antes de comparar alternativas.
              </p>
            </div>
          </figcaption>
        </figure>

        <section className={styles.inputStrip} aria-labelledby="agroindustry-inputs-v05-title">
          <h4 id="agroindustry-inputs-v05-title">Corrientes que pueden evaluarse</h4>
          <ul className={styles.inputList}>
            <li>Subproductos vegetales</li>
            <li>Efluentes y aguas de proceso</li>
            <li>Lodos y mezclas húmedas</li>
            <li>Pérdidas y excedentes de producción</li>
          </ul>
        </section>

        <div className={styles.mapIntro}>
          <h4 id="agroindustry-journey-v05-title">Una secuencia para decidir con contexto.</h4>
          <p>El recorrido conecta el origen del material con la siguiente decisión.</p>
        </div>
        <ol className={styles.journey} aria-labelledby="agroindustry-journey-v05-title">
          <li><span className={styles.node}>01</span><strong>Delimitar</strong><span>Material, sitio, temporada y manejo actual.</span></li>
          <li><span className={styles.node}>02</span><strong>Caracterizar</strong><span>Muestreo y datos que responden a la decisión.</span></li>
          <li><span className={styles.node}>03</span><strong>Comparar</strong><span>Rutas, logística y destino de las salidas.</span></li>
          <li><span className={styles.node}>04</span><strong>Decidir</strong><span>Avanzar, ajustar el estudio o detenerse.</span></li>
        </ol>

        <div className={styles.analysisBand}>
          <section className={styles.analysisBlock} aria-labelledby="agroindustry-dimensions-v05-title">
            <span className={styles.blockKicker}>Lectura de la corriente</span>
            <h4 className={styles.blockTitle} id="agroindustry-dimensions-v05-title">Seis dimensiones para entender el contexto.</h4>
            <ul className={styles.dimensions}>
              <li>Cantidad</li><li>Calidad</li><li>Variación</li><li>Logística</li><li>Manejo</li><li>Salida posible</li>
            </ul>
          </section>
          <section className={styles.analysisBlock} aria-labelledby="agroindustry-routes-v05-title">
            <span className={styles.blockKicker}>Posibilidades por estudiar</span>
            <h4 className={styles.blockTitle} id="agroindustry-routes-v05-title">Rutas que se comparan según cada caso.</h4>
            <div className={styles.routes}>
              <div className={styles.route}><strong>Biogás y bioenergía</strong><small>Proceso, demanda y manejo de salidas</small></div>
              <div className={styles.route}><strong>Compost y acondicionadores</strong><small>Mezcla, calidad y uso previsto</small></div>
              <div className={styles.route}><strong>Productos derivados</strong><small>Materia prima, proceso y aplicación</small></div>
            </div>
          </section>
        </div>

        <section className={styles.decision} aria-labelledby="agroindustry-decision-v05-title">
          <div>
            <h4 id="agroindustry-decision-v05-title">El siguiente paso depende de lo que la evaluación encuentre.</h4>
            <p>La evaluación inicial orienta el estudio; no confirma por sí sola viabilidad o desempeño a escala.</p>
          </div>
          <div className={styles.decisionOptions} aria-label="Decisiones posibles bajo criterios definidos">
            <div className={styles.decisionOption}><b>Avanzar</b><span>La evidencia respalda el siguiente nivel de estudio.</span></div>
            <div className={styles.decisionOption}><b>Ajustar</b><span>Se necesita completar o mejorar la información.</span></div>
            <div className={styles.decisionOption}><b>Detener</b><span>Las condiciones no justifican continuar esa ruta.</span></div>
          </div>
        </section>
      </div>
    </section>
  );
}
