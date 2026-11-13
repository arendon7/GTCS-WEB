"use client";

import { useState } from "react";
import Link from "next/link";
import { buildToolContactHref, storeToolContactDraft } from "@/data/tool-contact-handoff";

type PlantType = "follaje" | "ornamental" | "huerta" | "coleccion";
type PlantStage = "brotes" | "estable" | "flores" | "fruto" | "trasplante";
type PlantCondition = "activa" | "estresada" | "encharcada" | "plaga";

const choices = {
  plant: [
    ["follaje", "Follaje e interior"],
    ["ornamental", "Ornamental con flor"],
    ["huerta", "Huerta y aromáticas"],
    ["coleccion", "Varias plantas"],
  ] as const,
  stage: [
    ["brotes", "Hojas nuevas o brotes"],
    ["estable", "Planta estable"],
    ["flores", "Botones o flores"],
    ["fruto", "Frutos en desarrollo"],
    ["trasplante", "Trasplante reciente"],
  ] as const,
  condition: [
    ["activa", "Activa y sin señales de estrés"],
    ["estresada", "Puntas secas o crecimiento lento"],
    ["encharcada", "Sustrato encharcado"],
    ["plaga", "Manchas, daño o presencia de plaga"],
  ] as const,
};

const lines: Record<PlantStage, { name: string; family: string; description: string; slug: string }> = {
  brotes: { name: "CRECE", family: "2GROW · 15-3-3", description: "Línea asociada al establecimiento, la brotación y el crecimiento vegetativo.", slug: "crece" },
  estable: { name: "EQUILIBRA", family: "2BALANCE · 7-7-7", description: "Línea asociada al mantenimiento y la nutrición balanceada de una planta estable.", slug: "equilibra" },
  flores: { name: "FLORECE", family: "2BLOOM · 3-8-3", description: "Línea para acompañar la transición reproductiva y la floración.", slug: "florece" },
  fruto: { name: "FRUCTIFICA", family: "2FRUIT · 3-3-8", description: "Línea para acompañar el desarrollo productivo y el fruto.", slug: "fructifica" },
  trasplante: { name: "COMPOST", family: "Acondicionador orgánico", description: "Una referencia para revisar la preparación del suelo y el sustrato.", slug: "compost" },
};

const kits: Record<PlantType, { title: string; slug: string }> = {
  follaje: { title: "Plantas Verdes", slug: "plantas-verdes" },
  ornamental: { title: "Plantas con Flor", slug: "plantas-con-flor" },
  huerta: { title: "Mi Huerta", slug: "mi-huerta" },
  coleccion: { title: "Casa Completa", slug: "casa-completa" },
};

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="casa-orienter__group">
      <legend>{label}</legend>
      <div className="casa-orienter__choices">
        {options.map(([id, name]) => (
          <button className="casa-orienter__choice" type="button" key={id} aria-pressed={value === id} onClick={() => onChange(id)}>
            {name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function CasaJardinInteractive() {
  const [plantType, setPlantType] = useState<PlantType>("follaje");
  const [plantStage, setPlantStage] = useState<PlantStage>("brotes");
  const [plantCondition, setPlantCondition] = useState<PlantCondition>("activa");
  const needsReview = plantCondition !== "activa";
  const line = lines[plantStage];
  const kit = kits[plantType];
  const assessmentDetails = `Tipo de plantas elegido: ${plantType}\nEtapa elegida: ${plantStage}\nCondición descrita: ${plantCondition}\n${needsReview ? "La herramienta orienta a observar la causa antes de nutrir; no es un diagnóstico fitosanitario." : `Línea orientativa por etapa: ${line.name}. Kit relacionado: ${kit.title}.`}\nValidar especie, sustrato, luz, riego y etiqueta vigente antes de recomendar una aplicación.`;
  const contactHref = buildToolContactHref("casa-jardin", "hogar", needsReview ? "Revisión de condición de planta" : `Orientación sobre ${line.name}`);

  return (
    <section className="casa-orienter" aria-label="Orientador de cuidado Wondergreen">
      <div className="casa-orienter__questions">
        <ChoiceGroup label="1. ¿Qué estás cuidando?" value={plantType} options={choices.plant} onChange={setPlantType} />
        <ChoiceGroup label="2. ¿En qué etapa está?" value={plantStage} options={choices.stage} onChange={setPlantStage} />
        <ChoiceGroup label="3. ¿Cómo se encuentra?" value={plantCondition} options={choices.condition} onChange={setPlantCondition} />
      </div>

      {needsReview ? (
        <div className="casa-orienter__result casa-orienter__result--pause" role="status" aria-live="polite">
          <div><span className="casa-orienter__eyebrow">Antes de nutrir</span><h3>Primero revisa qué está afectando la planta.</h3><p>Encharcamiento, raíces comprometidas, estrés y plagas requieren revisar su causa. Esta herramienta no diagnostica el problema y no recomienda aplicar fertilizante en este estado.</p></div>
          <ul><li>Comprueba humedad y drenaje de la matera.</li><li>Observa raíces, hojas y señales de plaga.</li><li>Si el deterioro continúa, busca orientación antes de tratar.</li></ul>
          <Link className="button button--dark" href={contactHref} onClick={() => storeToolContactDraft(assessmentDetails)}>Pedir orientación</Link>
        </div>
      ) : (
        <div className="casa-orienter__result" role="status" aria-live="polite">
          <div><span className="casa-orienter__eyebrow">Línea compatible con la etapa seleccionada</span><h3>{line.name}</h3><p className="casa-orienter__family">{line.family}</p><p>{line.description} Confirma siempre la especie, el estado del sustrato y las instrucciones de la etiqueta vigente.</p></div>
          <div className="casa-orienter__result-links"><Link href={`/casa-jardin/productos/${line.slug}/`}>Ver ficha <span aria-hidden="true">→</span></Link><Link href={`/casa-jardin/kits/${kit.slug}/`}>Explorar kit {kit.title} <span aria-hidden="true">→</span></Link><Link href={contactHref} onClick={() => storeToolContactDraft(assessmentDetails)}>Consultar mi caso <span aria-hidden="true">→</span></Link></div>
        </div>
      )}
      <p className="casa-orienter__disclaimer">Orientación inicial: no calcula dosis ni frecuencia y no sustituye la etiqueta del producto ni una valoración técnica.</p>
    </section>
  );
}
