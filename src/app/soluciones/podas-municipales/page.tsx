import Image from "next/image";
import { Suspense } from "react";
import MunicipalPruningIntake from "@/components/municipal-pruning-intake";
import styles from "./podas-municipales.module.css";

export default function PodasMunicipalesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`${styles.heroGrid} container`}>
          <div className={styles.heroCopy}>
            <h1>Cada poda necesita una ruta pensada para su material y su destino.</h1>
            <p className={styles.lead}>
              Ayudamos a municipios y prestadores a organizar el manejo de podas y residuos vegetales.
              La alternativa se define al entender cómo se generan, qué condiciones tiene el material
              y quién podría recibirlo.
            </p>
            <div className={styles.heroActions}>
              <a className="button button--primary" href="#organizar-caso">Revisar mi corriente</a>
              <a className={styles.textLink} href="#elegir-destino">Entender las alternativas</a>
            </div>
          </div>

          <figure className={styles.heroMedia}>
            <div className={styles.imageFrame}>
              <Image
                src="/services/municipal-pruning-material-concept.jpg"
                alt="Ramas, trozas y astillas de madera agrupadas por tipo junto a una zona verde."
                fill
                preload
                sizes="(max-width: 800px) 100vw, 48vw"
                className={styles.heroImage}
              />
            </div>
            <figcaption>
              Separar las fracciones ayuda a decidir qué usos vale la pena estudiar.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.destination} id="elegir-destino">
        <div className={`${styles.destinationIntro} container`}>
          <div>
            <h2>Primero se valida el destino; después, el equipo.</h2>
          </div>
          <p className={styles.destinationLead}>
            Compostaje, cobertura y mezclas para sustratos requieren condiciones distintas. La
            granulometría, la humedad, la limpieza, el almacenamiento y la demanda del receptor
            determinan qué alternativa tiene sentido evaluar. El aprovechamiento energético se
            estudia por separado cuando la corriente y la escala lo justifican.
          </p>
        </div>
        <div className={`${styles.destinationOptions} container`}>
          <article>
            <h3>Compostaje</h3>
            <p>Revisar si la fracción puede aportar estructura y qué acondicionamiento exige el proceso receptor.</p>
          </article>
          <article>
            <h3>Cobertura o mulch</h3>
            <p>Contrastar tamaño de partícula, limpieza y condiciones de uso con quien recibirá el material.</p>
          </article>
          <article>
            <h3>Mezclas para sustratos</h3>
            <p>Definir primero las características requeridas y verificar si la poda puede cumplirlas.</p>
          </article>
        </div>
      </section>

      <section className={styles.intakeSection} id="organizar-caso">
        <div className={`${styles.intakeHeading} container`}>
          <div>
            <h2>¿Qué sabes hoy sobre tus podas?</h2>
          </div>
          <p>
            No necesitas tener todos los datos listos. Comparte lo que ya conoces y podremos
            identificar qué información conviene levantar antes de dimensionar una solución.
          </p>
        </div>
        <div className="container">
          <Suspense fallback={<p className={styles.formFallback}>Preparando el formulario…</p>}>
            <MunicipalPruningIntake />
          </Suspense>
        </div>
      </section>

      <section className={styles.workSection}>
        <div className={`${styles.workGrid} container`}>
          <div>
            <h2>La logística y la calidad del material también hacen parte del diseño.</h2>
          </div>
          <div className={styles.workCopy}>
            <p>
              Revisamos registros de viajes, pesos o cubicaciones por fuente y temporada; las
              condiciones de equipos, patios y almacenamiento; y muestras representativas con sus
              impropios. Esa información se contrasta con la logística y con las especificaciones
              de un posible usuario.
            </p>
            <p>
              Según el alcance acordado, el trabajo puede dejar un balance estacional, un protocolo
              de recepción y clasificación, alternativas de trituración, transporte y uso, o un
              piloto con criterios de calidad y seguimiento. La selección depende del diagnóstico;
              no parte de prometer un ahorro o un destino garantizado.
            </p>
            <a className={styles.textLink} href="#organizar-caso">Conversar sobre mi caso <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
    </div>
  );
}
