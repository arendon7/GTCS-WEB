"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  buildSolutionAssessmentContactHref,
  storeSolutionAssessmentDraft,
  type SolutionAssessmentProfile,
} from "@/data/solution-assessment-handoff";
import styles from "./solution-assessment.module.css";

export interface AssessmentField {
  id: string;
  label: string;
  help: string;
  options?: string[];
  placeholder?: string;
}

interface SolutionAssessmentProps {
  title: string;
  lead: string;
  principle: string;
  visual: {
    src: string;
    alt: string;
    caption: string;
  };
  fields: AssessmentField[];
  questions: string[];
  evidence: string[];
  deliverables: string[];
  nextStep: string;
  whatsappIntro: string;
  contactProfile: SolutionAssessmentProfile;
}

interface SolutionAssessmentContactActionProps {
  title: string;
  nextStep: string;
  contactProfile: SolutionAssessmentProfile;
  details: string;
}

function SolutionAssessmentContactAction({ title, nextStep, contactProfile, details }: SolutionAssessmentContactActionProps) {
  const searchParams = useSearchParams();
  const requestedProfile = searchParams.get("perfil");
  const profile: SolutionAssessmentProfile = requestedProfile === "municipio"
    || requestedProfile === "empresa"
    || requestedProfile === "territorio"
    || requestedProfile === "agroindustria"
    ? requestedProfile
    : contactProfile;
  const contactHref = buildSolutionAssessmentContactHref(title, nextStep, profile);

  return (
    <Link
      className={`button button--primary ${styles.contactButton}`}
      href={contactHref}
      onClick={() => storeSolutionAssessmentDraft(details)}
    >
      Solicitar revisión de alcance
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function SolutionAssessment({
  title,
  lead,
  principle,
  visual,
  fields,
  questions,
  evidence,
  deliverables,
  nextStep,
  whatsappIntro,
  contactProfile,
}: SolutionAssessmentProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((field) => [field.id, ""])),
  );

  const completed = fields.filter((field) => values[field.id]?.trim()).length;
  const details = fields
    .filter((field) => values[field.id]?.trim())
    .map((field) => `${field.label}: ${values[field.id]}`)
    .join("\n");
  const message = encodeURIComponent(
    `${whatsappIntro}\n\nContexto registrado:\n${details || "Aún no tengo datos consolidados."}\n\nQuiero definir qué evidencia falta y cuál debería ser el alcance de la evaluación.`,
  );
  const defaultContactHref = buildSolutionAssessmentContactHref(title, nextStep, contactProfile);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroLayout}`}>
          <div className={styles.heroCopy}>
            <h1>{title}</h1>
            <p className={styles.lead}>{lead}</p>
            <p className={styles.principle}>{principle}</p>
          </div>
          <figure className={styles.heroFigure}>
            <div className={styles.imageFrame}>
              <Image
                src={visual.src}
                alt={visual.alt}
                fill
                priority
                sizes="(max-width: 800px) 100vw, 46vw"
                className={styles.heroImage}
              />
            </div>
            <figcaption>{visual.caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.assessment} aria-labelledby="assessment-title">
        <div className={`container ${styles.assessmentContainer}`}>
          <header className={styles.sectionIntro}>
            <h2 id="assessment-title">Empieza con la información que ya tienes.</h2>
            <p>
              Esta guía organiza el contexto para definir una evaluación. Puedes dejar en blanco lo que aún no conoces; no calcula resultados ni reemplaza el análisis profesional.
            </p>
          </header>

          <div className={styles.assessmentLayout}>
            <section className={styles.formSection} aria-labelledby="available-info-title">
              <div className={styles.formHeading}>
                <h3 id="available-info-title">Datos de partida</h3>
                <p>Registra solo lo que puedas respaldar o identificar hoy.</p>
              </div>
              <div className={styles.fields}>
                {fields.map((field) => {
                  const helpId = `${field.id}-help`;
                  return (
                    <label className={styles.field} key={field.id} htmlFor={field.id}>
                      <span className={styles.fieldLabel}>{field.label}</span>
                      <span className={styles.fieldHelp} id={helpId}>{field.help}</span>
                      {field.options ? (
                        <select
                          id={field.id}
                          aria-describedby={helpId}
                          value={values[field.id]}
                          onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))}
                        >
                          <option value="" disabled>Selecciona una opción</option>
                          {field.options.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      ) : (
                        <input
                          id={field.id}
                          aria-describedby={helpId}
                          value={values[field.id]}
                          onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))}
                          placeholder={field.placeholder}
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            </section>

            <aside className={styles.decisionSection} aria-labelledby="decision-title">
              <div className={styles.progressLabel}>
                <span>Información reunida</span>
                <span aria-live="polite">{completed} de {fields.length}</span>
              </div>
              <progress
                className={styles.progress}
                max={fields.length}
                value={completed}
                aria-label={`${completed} de ${fields.length} campos con respuesta`}
              />
              <h3 id="decision-title">Lo que conviene aclarar</h3>
              <p className={styles.nextStep}>{nextStep}</p>
              <ul className={styles.questions}>
                {questions.map((question) => <li key={question}>{question}</li>)}
              </ul>
              <div className={styles.actions}>
                <Suspense fallback={
                  <Link
                    className={`button button--primary ${styles.contactButton}`}
                    href={defaultContactHref}
                    onClick={() => storeSolutionAssessmentDraft(details)}
                  >
                    Solicitar revisión de alcance
                    <span aria-hidden="true">→</span>
                  </Link>
                }>
                  <SolutionAssessmentContactAction title={title} nextStep={nextStep} contactProfile={contactProfile} details={details} />
                </Suspense>
                <a
                  className={`button button--ghost ${styles.whatsappButton}`}
                  href={`https://wa.me/573003078822?text=${message}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Continuar por WhatsApp
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
              <p className={styles.shareNote}>WhatsApp abrirá un mensaje preparado para que lo revises antes de enviarlo.</p>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.scope} aria-labelledby="scope-title">
        <div className={`container ${styles.scopeContainer}`}>
          <header className={styles.scopeIntro}>
            <h2 id="scope-title">Una evaluación sólida conecta datos con decisiones.</h2>
            <p>El alcance se concreta según la información disponible, el propósito del análisis y las condiciones de cada proyecto.</p>
          </header>
          <div className={styles.scopeColumns}>
            <section aria-labelledby="evidence-title">
              <h3 id="evidence-title">Información que ayuda a revisar</h3>
              <ul>{evidence.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section aria-labelledby="deliverables-title">
              <h3 id="deliverables-title">Resultados que pueden acordarse</h3>
              <ul>{deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          </div>
          <p className={styles.boundary}>
            Esta preevaluación organiza la conversación y ayuda a definir el alcance. No calcula resultados ni sustituye un estudio de viabilidad, diseño de ingeniería, concepto jurídico, certificación o cotización. Los resultados dependen de los datos, las condiciones y el alcance que se acuerden.
          </p>
        </div>
      </section>
    </div>
  );
}
