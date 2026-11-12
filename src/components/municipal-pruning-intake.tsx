"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildSolutionAssessmentContactHref,
  storeSolutionAssessmentDraft,
  type SolutionAssessmentProfile,
} from "@/data/solution-assessment-handoff";
import styles from "@/app/soluciones/podas-municipales/podas-municipales.module.css";

const fields = [
  { id: "territory", label: "Municipio o prestador", help: "Entidad, operador o contratista responsable.", placeholder: "Nombre y municipio" },
  { id: "sources", label: "De dónde provienen", help: "Parques, vías, mantenimiento arbóreo u otros generadores.", placeholder: "Fuentes y responsables" },
  { id: "records", label: "Registros disponibles", help: "Viajes, pesos, cubicaciones, temporadas o composición.", placeholder: "Qué dato existe y cómo se obtuvo" },
  { id: "handling", label: "Manejo actual", help: "Acopio, transporte, trituración, entrega o disposición.", placeholder: "Equipos, patios y recorrido actual" },
] as const;

const destinations = [
  "Aporte a compostaje",
  "Cobertura o mulch",
  "Mezcla para sustratos",
  "Evaluar aprovechamiento energético",
  "Destino por definir",
];

const profileIds = ["municipio", "empresa", "territorio", "agroindustria"] as const;
type PruningProfile = (typeof profileIds)[number];

function resolveProfile(value: string | null): SolutionAssessmentProfile {
  return profileIds.includes(value as PruningProfile) ? (value as PruningProfile) : "municipio";
}

export default function MunicipalPruningIntake() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<Record<string, string>>({
    territory: "",
    sources: "",
    records: "",
    handling: "",
    destination: "",
  });

  const completed = Object.values(values).filter((value) => value.trim()).length;
  const profile = resolveProfile(searchParams.get("perfil"));
  const nextStep = "Caracterizar una temporada y validar un destino antes de dimensionar equipos o contratar transporte.";
  const contactHref = buildSolutionAssessmentContactHref(
    "Ruta de valorización de podas municipales",
    nextStep,
    profile,
  );
  const details = fields
    .map((field) => `${field.label}: ${values[field.id].trim()}`)
    .filter((line) => !line.endsWith(": "));
  if (values.destination) details.push(`Destino que quieres evaluar: ${values.destination}`);

  function updateField(id: string, value: string) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  function continueToContact() {
    storeSolutionAssessmentDraft(details.join("\n"));
    router.push(contactHref);
  }

  return (
    <div className={styles.intake}>
      <form className={styles.fields} onSubmit={(event) => event.preventDefault()}>
        {fields.map((field) => (
          <label className={styles.field} key={field.id}>
            <span>{field.label}</span>
            <small>{field.help}</small>
            <input
              id={`pruning-${field.id}`}
              name={field.id}
              value={values[field.id]}
              onChange={(event) => updateField(field.id, event.target.value)}
              placeholder={field.placeholder}
              autoComplete="off"
            />
          </label>
        ))}
        <label className={`${styles.field} ${styles.destinationField}`}>
          <span>Destino que quieres evaluar</span>
          <small>Si todavía no está definido, puedes indicarlo así.</small>
          <select
            id="pruning-destination"
            name="destination"
            value={values.destination}
            onChange={(event) => updateField("destination", event.target.value)}
          >
            <option value="">Selecciona una opción</option>
            {destinations.map((destination) => <option key={destination}>{destination}</option>)}
          </select>
        </label>
      </form>

      <aside className={styles.intakeAside}>
        <p className={styles.asideLabel}>Siguiente paso</p>
        <h3>Ordenar el caso con el equipo adecuado.</h3>
        <p>
          {completed === 0
            ? "Puedes continuar sin completar campos; la conversación ayudará a identificar qué hace falta medir."
            : `Ya compartiste información en ${completed} de 5 temas. El borrador se llevará a Contacto para que lo revises.`}
        </p>
        <button className="button button--primary" type="button" onClick={continueToContact}>
          Conversar sobre esta corriente <span aria-hidden="true">→</span>
        </button>
        <p className={styles.privacyNote}>
          Tus respuestas se conservan temporalmente en esta pestaña y no se incluyen en la dirección web.
        </p>
        <span className={styles.liveStatus} aria-live="polite" aria-atomic="true">
          {completed === 0 ? "Aún no has agregado información." : `${completed} de 5 temas con información.`}
        </span>
      </aside>
    </div>
  );
}
