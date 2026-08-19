"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { homeGardenDiagnostic, homeGardenProducts, visibleHomeGardenKits } from "@/data/home-garden";
import styles from "../casa-jardin.module.css";

type StageKey = keyof typeof homeGardenDiagnostic.stages | "";
type ConditionKey = "healthy" | "stressed" | "very-wilted" | "waterlogged" | "extremely-dry" | "pest-damage" | "root-problem" | "unknown" | "";
type PlantType = "green" | "flower" | "garden" | "fruit" | "mixed" | "new-transplant" | "unsure" | "";
type PotSize = (typeof homeGardenDiagnostic.potSizes)[number];

const conditionOptions: readonly [ConditionKey, string][] = [
  ["healthy", "Activa / aparentemente sana"],
  ["stressed", "Estresada, pero sin daño severo evidente"],
  ["very-wilted", "Muy marchita"],
  ["waterlogged", "Encharcada o con exceso de agua"],
  ["extremely-dry", "Sustrato extremadamente seco"],
  ["pest-damage", "Con manchas, plaga o daño sanitario"],
  ["root-problem", "Con señales de problema radicular"],
  ["unknown", "No estoy seguro"],
];

const stageOptions: readonly [StageKey, string][] = [
  ["growing", "Sacando hojas o brotes nuevos"],
  ["stable", "Estable / mantenimiento"],
  ["flowering", "Formando botones o flores"],
  ["fruiting", "Con fruto o en etapa productiva"],
  ["mixed", "Tengo varias plantas en etapas distintas"],
  ["", "No sé identificar la etapa"],
];

export function HomeGardenDiagnostic() {
  const [plantType, setPlantType] = useState<PlantType>("");
  const [stage, setStage] = useState<StageKey>("");
  const [condition, setCondition] = useState<ConditionKey>("");
  const [plantCount, setPlantCount] = useState("");
  const [potSizes, setPotSizes] = useState<PotSize[]>([]);

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

    const destination = homeGardenDiagnostic.stages[stage as keyof typeof homeGardenDiagnostic.stages];
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
            <option value="green">Planta verde / follaje</option>
            <option value="flower">Planta con flor</option>
            <option value="garden">Huerta / aromáticas</option>
            <option value="fruit">Planta productiva / fruto</option>
            <option value="mixed">Colección mixta</option>
            <option value="new-transplant">Recién trasplantada</option>
            <option value="unsure">No estoy seguro</option>
          </select>
        </label>

        <label className={styles.decisionCard}>
          <span className={styles.eyebrow}>02 · Etapa</span>
          <h3>¿Qué está haciendo?</h3>
          <select value={stage} onChange={(event) => setStage(event.target.value as StageKey)} aria-label="Etapa de la planta">
            <option value="">Selecciona una opción</option>
            {stageOptions.filter(([value]) => value).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
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
