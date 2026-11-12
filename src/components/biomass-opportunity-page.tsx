import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";
import styles from "./biomass-opportunity-page.module.css";

type BiomassOpportunityPageProps = {
  name: string;
  path: string;
  eyebrow: string;
  title: string;
  introduction: string;
  method: string;
  inputs: { title: string; detail: string }[];
  steps: { title: string; detail: string }[];
  diagnostic: string;
  selectedNeed: string;
  contactProfile?: "agro" | "empresa";
};

export function BiomassOpportunityPage({
  name,
  path,
  eyebrow,
  title,
  introduction,
  method,
  inputs,
  steps,
  diagnostic,
  selectedNeed,
  contactProfile,
}: BiomassOpportunityPageProps) {
  const contactParams = new URLSearchParams({
    servicio: "idi-agroindustrial",
    diagnostico: diagnostic,
    prioridad: selectedNeed,
  });
  if (contactProfile) contactParams.set("perfil", contactProfile);

  return (
    <div className={styles.page}>
      <WondergreenToolTrail name={name} path={path} />

      <header className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.lead}>{introduction}</p>
          <p className={styles.method}>{method}</p>
        </div>
      </header>

      <section className={styles.evaluation} aria-labelledby="evaluation-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>DE LA CORRIENTE A LA DECISIÓN</p>
              <h2 id="evaluation-title">Primero entendemos el material y su operación.</h2>
            </div>
            <p>
              Una ruta de aprovechamiento debe responder a lo que realmente se genera, al proceso
              disponible y al uso posible de sus salidas.
            </p>
          </div>

          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li className={styles.step} key={step.title}>
                <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.inputs} aria-labelledby="inputs-title">
        <div className={`${styles.container} ${styles.inputsGrid}`}>
          <div>
            <p className={styles.eyebrow}>INFORMACIÓN DE PARTIDA</p>
            <h2 id="inputs-title">Qué conviene reunir</h2>
            <p className={styles.inputsIntro}>
              No necesitas tener un estudio completo para iniciar la conversación. Comparte lo que
              ya conoces y señala qué datos todavía habría que levantar.
            </p>
          </div>
          <ul className={styles.inputList}>
            {inputs.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.nextStep} aria-labelledby="next-step-title">
        <div className={`${styles.container} ${styles.nextStepGrid}`}>
          <div>
            <p className={styles.eyebrow}>I+D+i AGROINDUSTRIAL Y BIOECONOMÍA</p>
            <h2 id="next-step-title">Diseñar un piloto que permita decidir el siguiente paso.</h2>
          </div>
          <div className={styles.nextStepCopy}>
            <p>
              Greenatics estructura pruebas controladas para evaluar biomasa, proceso y producto,
              con criterios de calidad y evidencia acordados para avanzar, ajustar o detener.
            </p>
            <Link className={styles.cta} href={`/contacto/?${contactParams.toString()}`}>
              Conversar sobre un piloto <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
