"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { homeGardenDiagnostic, homeGardenProducts, visibleHomeGardenKits } from "@/data/home-garden";
import styles from "../casa-jardin.module.css";

type StageKey = keyof typeof homeGardenDiagnostic.stages | "unknown" | "";
type ConditionKey = "healthy" | "stressed" | "very-wilted" | "waterlogged" | "extremely-dry" | "pest-damage" | "root-problem" | "unknown" | "";
type PlantType = "green" | "flower" | "garden" | "fruit" | "mixed" | "new-transplant" | "unsure" | "";
type PotSize = (typeof homeGardenDiagnostic.potSizes)[number];

type InitialDiagnosticContext = {
  plantType?: string;
  stage?: string;
  condition?: string;
  plantCount?: string;
  potSizes?: string;
};

const plantTypeOptions: readonly [Exclude<PlantType, "">, string][] = [
  ["green", "Planta verde / follaje"],
  ["flower", "Planta con flor"],
  ["garden", "Huerta / aromáticas"],
  ["fruit", "Planta productiva / fruto"],
  ["mixed", "Colección mixta"],
  ["new-transplant", "Recién trasplantada"],
  ["unsure", "No estoy seguro"],
];

const conditionOptions: readonly [Exclude<ConditionKey, "">, string][] = [
  ["healthy", "Activa / aparentemente sana"],
  ["stressed", "Estresada, pero sin daño severo evidente"],
  ["very-wilted", "Muy marchita"],
  ["waterlogged", "Encharcada o con exceso de agua"],
  ["extremely-dry", "Sustrato extremadamente seco"],
  ["pest-damage", "Con manchas, plaga o daño sanitario"],
  ["root-problem", "Con señales de problema radicular"],
  ["unknown", "No estoy seguro"],
];

const stageOptions: readonly [Exclude<StageKey, "">, string][] = [
  ["growing", "Sacando hojas o brotes nuevos"],
  ["stable", "Estable / mantenimiento"],
  ["flowering", "Formando botones o flores"],
  ["fruiting", "Con fruto o en etapa productiva"],
  ["mixed", "Tengo varias plantas en etapas distintas"],
  ["unknown", "No sé identificar la etapa"],
];

const plantCounts = ["1-5", "6-10", "11-20", "21-40", "40+"] as const;

function validOption<T extends string>(value: string | undefined, options: readonly (readonly [T, string])[]): T | "" {
  if (!value) return "";
  return options.some(([id]) => id === value) ? value as T : "";
}

function validPlantCount(value: string | undefined) {
  return value && (plantCounts as readonly string[]).includes(value) ? value : "";
}

function validPotSizes(value: string | undefined): PotSize[] {
  if (!value) return [];
  const allowed = homeGardenDiagnostic.potSizes as readonly string[];
  return value.split(",").filter((size): size is PotSize => allowed.includes(size));
}

function optionLabel<T extends string>(options: readonly (readonly [T, string])[], value: string) {
  return options.find(([id]) => id === value)?.[1];
}

export function HomeGardenDiagnostic({ initial = {} }: { initial?: InitialDiagnosticContext }) {
  const [plantType, setPlantType] = useState<PlantType>(() => validOption(initial.plantType, plantTypeOptions));
  const [stage, setStage] = useState<StageKey>(() => validOption(initial.stage, stageOptions));
  const [condition, setCondition] = useState<ConditionKey>(() => validOption(initial.condition, conditionOptions));
  const [plantCount, setPlantCount] = useState(() => validPlantCount(initial.plantCount));
  const [potSizes, setPotSizes] = useState<PotSize[]>(() => validPotSizes(initial.potSizes));

  const result = useMemo(() => {
    if (!condition || !stage) return null;
    if ((homeGardenDiagnostic.safetyTriggers as readonly string[]).includes(condition)) {
      return { type: "safety" as const, title: "Primero corrige la condición de la planta.", copy: homeGardenDiagnostic.safetyMessage };
    }
    if (plantType === "new-transplant") {
      return { type: "safety" as const, title: "Trasplante reciente: estabiliza antes de decidir nutrición.", copy: "Revisa drenaje, raíces, humedad y establecimiento. Cuando la planta retome actividad, vuelve a identificar su etapa." };
    }
    if (condition === "extremely-dry") {
      return { type: "review" as const, title: "Primero recupera una humedad adecuada.", copy: "El sustrato extremadamente seco queda en semáforo amarillo: corrige la condición y vuelve a observar antes de decidir una aplicación." };
    }

    const destination = stage === "unknown" ? undefined : homeGardenDiagnostic.stages[stage as keyof typeof homeGardenDiagnostic.stages];
    if (!destination) return { type: "review" as const, title: "Todavía falta contexto.", copy: "No identificamos una etapa con suficiente claridad. Usa el semáforo, revisa agua, drenaje, raíces y sanidad, o solicita orientación antes de aplicar." };

    if (destination === "casa-completa") {
      const kit = visibleHomeGardenKits.find((item) => item.id === "casa-completa");
      return { type: "kit" as const, title: kit?.name ?? "Casa Completa", copy: "Tienes varias plantas en etapas distintas. La lógica es identificar cada planta y usar una sola etapa por necesidad, no aplicar todo simultáneamente.", href: "/casa-jardin/kits/casa-completa" };
    }

    const product = homeGardenProducts.find((item) => item.id === destination);
    if (!product) return null;
    return {
      type: "stage" as const,
      title: `${product.consumerName} · ${product.formula ?? "Compost"}`,
      copy: `${product.role} ${product.householdFormatStatus}`,
      href: `/casa-jardin/productos/${product.id}`,
    };
  }, [condition, plantType, stage]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (plantType) params.set("plant", plantType);
    if (stage) params.set("stage", stage);
    if (condition) params.set("condition", condition);
    if (plantCount) params.set("count", plantCount);
    if (potSizes.length) params.set("pots", potSizes.join(","));
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }, [condition, plantCount, plantType, potSizes, stage]);

  const contactHref = useMemo(() => {
    if (!result) return null;
    const context = [
      "Casa & Jardín",
      plantType ? `Tipo: ${optionLabel(plantTypeOptions, plantType)}` : "Tipo: por definir",
      stage ? `Etapa: ${optionLabel(stageOptions, stage)}` : "Etapa: por definir",
      condition ? `Condición: ${optionLabel(conditionOptions, condition)}` : "Condición: por definir",
      plantCount ? `Escala: ${plantCount} plantas` : "",
      potSizes.length ? `Materas: ${potSizes.join(", ")}` : "",
      `Orientación del flujo: ${result.title}`,
    ].filter(Boolean).join(" · ");
    const params = new URLSearchParams({
      audience: "wondergreen",
      need: "nutricion",
      source: "casa-jardin-diagnostico",
      contexto: context,
    });
    return `/contacto?${params.toString()}#preparar`;
  }, [condition, plantCount, plantType, potSizes, result, stage]);

  function togglePotSize(size: PotSize) {
    setPotSizes((current) => current.includes(size) ? current.filter((item) => item !== size) : [...current, size]);
  }

  return (
    <div>
      <div className={styles.decisionGrid}>
        <label className={styles.decisionCard}>
          <span className={styles.eyebrow}>01 · Tipo de planta</span>
          <h3>¿Qué estás cuidando?</h3>
          <select value={plantType} onChange={(event) => setPlantType(event.target.value as PlantType)} aria-label="Tipo de planta">
            <option value="">Selecciona una opción</option>
            {plantTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label className={styles.decisionCard}>
          <span className={styles.eyebrow}>02 · Etapa</span>
          <h3>¿Qué está haciendo?</h3>
          <select value={stage} onChange={(event) => setStage(event.target.value as StageKey)} aria-label="Etapa de la planta">
            <option value="">Selecciona una opción</option>
            {stageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label className={styles.decisionCard}>
          <span className={styles.eyebrow}>03 · Condición</span>
          <h3>¿Cómo se ve hoy?</h3>
          <select value={condition} onChange={(event) => setCondition(event.target.value as ConditionKey)} aria-label="Condición de la planta">
            <option value="">Selecciona una opción</option>
            {conditionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label className={styles.decisionCard}>
          <span className={styles.eyebrow}>04 · Escala</span>
          <h3>¿Cuántas plantas tienes?</h3>
          <select value={plantCount} onChange={(event) => setPlantCount(event.target.value)} aria-label="Cantidad de plantas">
            <option value="">Selecciona una opción</option>
            <option value="1-5">1–5</option>
            <option value="6-10">6–10</option>
            <option value="11-20">11–20</option>
            <option value="21-40">21–40</option>
            <option value="40+">Más de 40</option>
          </select>
          <p>Este dato prepara una futura recomendación de tamaño. <strong>No calcula dosis ni cobertura todavía.</strong></p>
        </label>

        <fieldset className={styles.decisionCard}>
          <span className={styles.eyebrow}>05 · Materas</span>
          <h3>¿Qué tamaños tienes?</h3>
          <div>
            {homeGardenDiagnostic.potSizes.map((size) => (
              <label key={size} style={{ display: "inline-flex", gap: ".45rem", marginRight: "1rem", alignItems: "center" }}>
                <input type="checkbox" checked={potSizes.includes(size)} onChange={() => togglePotSize(size)} aria-label={`Matera ${size}`} />
                {size}
              </label>
            ))}
          </div>
          <p>S/M/L/XL proviene del flujo del handoff. <strong>Aún no tiene equivalencia pública a volumen ni gramos.</strong></p>
        </fieldset>
      </div>

      <div className={styles.guardrail} aria-live="polite">
        {!result ? (
          <><strong>Completa etapa y condición.</strong><p>El diagnóstico no entregará una recomendación hasta tener esas dos señales mínimas.</p></>
        ) : (
          <>
            <span className={styles.eyebrow}>{result.type === "safety" ? "Detener y revisar" : "Punto de partida orientativo"}</span>
            <strong>{result.title}</strong>
            <p>{result.copy}</p>
            {"href" in result && result.href ? <Link href={result.href}>Abrir siguiente paso →</Link> : null}
            {contactHref ? <Link href={contactHref}>Llevar este contexto a soporte técnico →</Link> : null}
          </>
        )}
      </div>

      <div className={styles.guardrail}>
        <strong>Calculadora de dosis: deshabilitada.</strong>
        <p>El handoff exige validar dosis domésticas por formulación, tamaño/volumen de sustrato y calibrar el dosificador antes de convertir este diagnóstico en gramos, medidas, frecuencia o cobertura.</p>
      </div>
    </div>
  );
}
