"use client";

import Link from "next/link";
import { useState } from "react";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import styles from "./finder.module.css";

const finderCropOrder = ["cafe", "cacao", "aguacate", "limon-tahiti", "pastos-gramineas"] as const;
const finderCrops = finderCropOrder.flatMap((slug) => {
  const crop = wondergreenCrops.find((item) => item.slug === slug);
  return crop ? [crop] : [];
});

const analysisOptions = [
  ["", "Prefiero no definirlo todavía"],
  ["available", "Tengo análisis de suelo o foliar disponible"],
  ["partial", "Tengo algunos datos, pero están incompletos"],
  ["none", "No tengo análisis disponible"],
  ["unknown", "No estoy seguro"],
] as const;

type AnalysisId = (typeof analysisOptions)[number][0];

type WondergreenFinderProps = {
  initialCrop?: string;
  initialMoment?: string;
  initialAnalysis?: string;
};

function validAnalysis(value: string | null | undefined): AnalysisId {
  return analysisOptions.some(([id]) => id === value) ? (value as AnalysisId) : "";
}

function analysisLabel(value: AnalysisId) {
  return analysisOptions.find(([id]) => id === value)?.[1] ?? "Por definir";
}

function validInitialCrop(value: string | undefined) {
  return finderCrops.some((crop) => crop.slug === value) ? value ?? "" : "";
}

function validInitialMoment(cropSlug: string, value: string | undefined) {
  const crop = finderCrops.find((item) => item.slug === cropSlug);
  if (!crop || !value) return "";
  if (value === "unknown") return value;
  return crop.stages.some((stage) => stage.moment === value) ? value : "";
}

export function WondergreenFinder({ initialCrop, initialMoment, initialAnalysis }: WondergreenFinderProps) {
  const startingCrop = validInitialCrop(initialCrop);
  const [cropSlug, setCropSlug] = useState(startingCrop);
  const [moment, setMoment] = useState(() => validInitialMoment(startingCrop, initialMoment));
  const [analysis, setAnalysis] = useState<AnalysisId>(() => validAnalysis(initialAnalysis));

  const selectedCrop = finderCrops.find((crop) => crop.slug === cropSlug);
  const selectedStage = selectedCrop?.stages.find((stage) => stage.moment === moment);
  const unknownStage = Boolean(selectedCrop && moment === "unknown");

  function syncUrl(nextCrop: string, nextMoment: string, nextAnalysis: AnalysisId) {
    const params = new URLSearchParams();
    if (nextCrop) params.set("crop", nextCrop);
    if (nextMoment) params.set("moment", nextMoment);
    if (nextAnalysis) params.set("analysis", nextAnalysis);
    const next = params.toString();
    window.history.replaceState(null, "", next ? `${window.location.pathname}?${next}` : window.location.pathname);
  }

  function chooseCrop(value: string) {
    const nextCrop = finderCrops.some((crop) => crop.slug === value) ? value : "";
    setCropSlug(nextCrop);
    setMoment("");
    syncUrl(nextCrop, "", analysis);
  }

  function chooseMoment(value: string) {
    const nextMoment = selectedCrop && (value === "unknown" || selectedCrop.stages.some((stage) => stage.moment === value)) ? value : "";
    setMoment(nextMoment);
    syncUrl(cropSlug, nextMoment, analysis);
  }

  function chooseAnalysis(value: string) {
    const nextAnalysis = validAnalysis(value);
    setAnalysis(nextAnalysis);
    syncUrl(cropSlug, moment, nextAnalysis);
  }

  const completed = Boolean(selectedCrop && (selectedStage || unknownStage));

  const contactHref = (() => {
    if (!selectedCrop || !completed) return "/contacto?audience=wondergreen&need=nutricion&source=wondergreen-finder";
    const context = selectedStage
      ? [
          "Wondergreen Finder",
          `Cultivo: ${selectedCrop.name}`,
          `Etapa: ${selectedStage.moment}`,
          `Análisis: ${analysisLabel(analysis)}`,
          `Familias del programa publicado: ${selectedStage.lines.join(", ")}`,
          `Objetivo publicado: ${selectedStage.goal}`,
        ].join(" | ")
      : [
          "Wondergreen Finder",
          `Cultivo: ${selectedCrop.name}`,
          "Etapa: no identificada",
          `Análisis: ${analysisLabel(analysis)}`,
          "No se cerró una familia desde el Finder.",
        ].join(" | ");
    const params = new URLSearchParams({
      audience: "wondergreen",
      need: "nutricion",
      cultivo: selectedCrop.name,
      source: "wondergreen-finder",
      contexto: context,
    });
    return `/contacto?${params.toString()}`;
  })();

  return (
    <div className={styles.finderShell}>
      <div className={styles.progress} aria-label="Progreso del Finder Wondergreen">
        <span data-active={Boolean(selectedCrop)}>01 · Cultivo</span>
        <span data-active={Boolean(selectedStage || unknownStage)}>02 · Etapa</span>
        <span data-active={Boolean(analysis)}>03 · Evidencia</span>
        <span data-active={completed}>04 · Ruta</span>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>01 · Cultivo</span>
          <strong>¿Qué cultivo estás revisando?</strong>
          <select aria-label="Cultivo Wondergreen" value={cropSlug} onChange={(event) => chooseCrop(event.target.value)}>
            <option value="">Selecciona uno de los programas publicados</option>
            {finderCrops.map((crop) => <option key={crop.slug} value={crop.slug}>{crop.name}</option>)}
          </select>
          <small>El Finder V1 se limita a los cinco programas técnicos aprobados para esta herramienta.</small>
        </label>

        <label className={styles.field}>
          <span>02 · Etapa</span>
          <strong>¿En qué momento está el cultivo?</strong>
          <select aria-label="Etapa del cultivo Wondergreen" value={moment} onChange={(event) => chooseMoment(event.target.value)} disabled={!selectedCrop}>
            <option value="">{selectedCrop ? "Selecciona una etapa del programa" : "Primero selecciona el cultivo"}</option>
            {selectedCrop?.stages.map((stage) => <option key={stage.moment} value={stage.moment}>{stage.moment}</option>)}
            {selectedCrop ? <option value="unknown">No sé identificar la etapa</option> : null}
          </select>
          <small>Las etapas salen del programa publicado de cada cultivo; no se homologan artificialmente.</small>
        </label>

        <label className={styles.field}>
          <span>03 · Evidencia disponible</span>
          <strong>¿Tienes análisis para la conversación técnica?</strong>
          <select aria-label="Análisis disponible Wondergreen" value={analysis} onChange={(event) => chooseAnalysis(event.target.value)}>
            {analysisOptions.map(([id, label]) => <option key={id || "empty"} value={id}>{label}</option>)}
          </select>
          <small>Este dato solo organiza el contexto. No cambia automáticamente una referencia ni genera una dosis.</small>
        </label>
      </div>

      <section className={styles.result} aria-live="polite" aria-label="Resultado orientativo del Finder Wondergreen">
        {!selectedCrop ? (
          <div>
            <span>Ruta todavía abierta</span>
            <h2>Empieza por un cultivo publicado.</h2>
            <p>El Finder no intenta adivinar una especie ni extender un programa a cultivos que todavía no tienen una ruta pública gobernada.</p>
          </div>
        ) : !completed ? (
          <div>
            <span>{selectedCrop.name}</span>
            <h2>Ahora identifica la etapa.</h2>
            <p>Una misma familia no se interpreta igual durante establecimiento, crecimiento, floración, llenado o recuperación.</p>
          </div>
        ) : unknownStage ? (
          <div>
            <span>{selectedCrop.name} · etapa por confirmar</span>
            <h2>Todavía no cierres una referencia.</h2>
            <p>Si la etapa no está clara, el Finder se detiene aquí. Revisa el programa completo o lleva este contexto al equipo técnico antes de convertir una observación en una recomendación.</p>
            <div className={styles.actions}>
              <Link href={`/wondergreen/cultivos/${selectedCrop.slug}`}>Abrir programa de {selectedCrop.name}</Link>
              <Link href={contactHref}>Llevar contexto al equipo técnico</Link>
            </div>
          </div>
        ) : selectedStage ? (
          <div>
            <span>{selectedCrop.name} · {selectedStage.moment}</span>
            <h2>Esta es la ruta que ya aparece en el programa publicado.</h2>
            <p>{selectedStage.goal}</p>
            <div className={styles.programFamilies} aria-label="Familias presentes en el programa publicado">
              <small>Familias presentes en esta etapa del programa</small>
              <div>{selectedStage.lines.map((line) => <strong key={line}>{line}</strong>)}</div>
            </div>
            <p className={styles.lock}><strong>Truth lock.</strong> Esto organiza una ruta publicada por cultivo y etapa. No calcula dosis, frecuencia, mezcla, compatibilidad, eficacia, cobertura ni disponibilidad comercial, y no sustituye una recomendación agronómica específica.</p>
            <div className={styles.actions}>
              <Link href={`/wondergreen/cultivos/${selectedCrop.slug}`}>Revisar programa completo</Link>
              <Link href={contactHref}>Llevar este contexto a soporte técnico</Link>
            </div>
          </div>
        ) : null}
      </section>

      <div className={styles.footerNote}>
        <strong>¿Tu cultivo no está entre los cinco programas?</strong>
        <p>No extrapolamos automáticamente otra guía. Puedes llevar el caso a soporte técnico y preparar el cultivo, etapa, ubicación, manejo y análisis disponibles.</p>
        <Link href="/contacto?audience=wondergreen&need=nutricion&source=wondergreen-finder-otro-cultivo">Consultar otro cultivo →</Link>
      </div>
    </div>
  );
}
