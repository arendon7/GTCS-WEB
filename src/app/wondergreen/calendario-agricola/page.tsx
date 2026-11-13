"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";
import { crops } from "@/data/crops";
import "./calendar.css";

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const cropOptions = crops.filter((crop) => crop.slug === "cafe" || crop.slug === "aguacate");
const storageKey = "wondergreen-field-plan-v1";
type FieldPlan = Record<string, Record<string, string>>;

export default function CalendarioAgricolaPage() {
  const [selectedCrop, setSelectedCrop] = useState("cafe");
  const [plan, setPlan] = useState<FieldPlan>({});
  const [loaded, setLoaded] = useState(false);
  const current = cropOptions.find((crop) => crop.slug === selectedCrop) ?? cropOptions[0];
  const currentPlan = plan[selectedCrop] ?? {};
  const plannedCount = Object.values(currentPlan).filter(Boolean).length;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) setPlan(parsed as FieldPlan);
      }
    } catch {
      // Browser storage is optional; the planner remains usable without it.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(plan));
    } catch {
      // Continue planning if storage is blocked or full.
    }
  }, [loaded, plan]);

  function updateMonth(month: number, value: string) {
    setPlan((previous) => ({ ...previous, [selectedCrop]: { ...previous[selectedCrop], [String(month)]: value } }));
  }

  return (
    <div className="wg-calendar">
      <WondergreenToolTrail name="Planificador agrícola" path="/wondergreen/calendario-agricola/" />
      <div className="container wg-calendar__container">
        <header className="wg-calendar__hero">
          <div>
            <span className="eyebrow">Wondergreen · Planificación de campo</span>
            <h1>El mes organiza el trabajo. La etapa decide la nutrición.</h1>
            <p>Arma un mapa anual para tu lote de café o aguacate Hass. Marca la etapa que observas en cada mes y revisa qué condiciones conviene comprobar antes de elegir una línea Wondergreen.</p>
            <a className="wg-calendar__hero-link" href="#planificar">Planificar mi lote <span aria-hidden="true">↓</span></a>
          </div>
          <div className="wg-calendar__hero-visual">
            <Image src={current.coverImage} alt={`Ilustración de la guía Wondergreen para ${current.name}`} width={680} height={700} sizes="(max-width: 760px) 100vw, 38vw" />
            <span>Guía por cultivo · {current.name}</span>
          </div>
        </header>

        <section id="planificar" className="wg-calendar__workspace" aria-labelledby="planificar-titulo">
          <div className="wg-calendar__intro">
            <div>
              <span className="eyebrow">Tu lote, no una fecha universal</span>
              <h2 id="planificar-titulo">Planifica según lo que ocurre en campo</h2>
              <p>Elige un cultivo y asigna una etapa a cada mes que quieras planear. Puedes dejar meses sin definir y volver a ajustarlos cuando cambie el lote.</p>
            </div>
            <div className="wg-calendar__summary" aria-live="polite"><strong>{plannedCount} de 12</strong><span>meses con una etapa registrada</span></div>
          </div>
          <div className="wg-calendar__switcher" aria-label="Cultivo del planificador">
            {cropOptions.map((crop) => <button key={crop.slug} type="button" className="wg-calendar__switch" aria-pressed={selectedCrop === crop.slug} onClick={() => setSelectedCrop(crop.slug)}>{crop.name}</button>)}
          </div>
          <div className="wg-calendar__context">
            <p><strong>Antes de asignar una etapa:</strong> {current.context}</p>
            <Link href={`/wondergreen/cultivos/${current.slug}/`}>Ver la ruta técnica de {current.name} <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="wg-calendar__months">
            {months.map((month, index) => {
              const stage = current.stages.find((item) => item.moment === currentPlan[String(index)]);
              return <article className="wg-calendar__month" key={month}>
                <div className="wg-calendar__month-top"><span>{String(index + 1).padStart(2, "0")}</span><h3>{month}</h3></div>
                <label htmlFor={`stage-${selectedCrop}-${index}`}>Etapa observada</label>
                <select id={`stage-${selectedCrop}-${index}`} value={stage?.moment ?? ""} onChange={(event) => updateMonth(index, event.target.value)}>
                  <option value="">Por definir en el lote</option>
                  {current.stages.map((item) => <option key={item.moment} value={item.moment}>{item.moment}</option>)}
                </select>
                {stage ? <div className="wg-calendar__stage-detail"><p>{stage.goal}</p><small>Línea para evaluar con el diagnóstico y la etiqueta vigente</small><strong>{stage.lines.join(" · ")}</strong></div> : null}
              </article>;
            })}
          </div>
          <div className="wg-calendar__plan-footer"><p>Tu selección se guarda únicamente en este navegador. No calcula dosis, fechas de floración ni necesidades del cultivo.</p><button type="button" onClick={() => setPlan((previous) => ({ ...previous, [selectedCrop]: {} }))} disabled={plannedCount === 0}>Borrar este plan</button></div>
        </section>
        <section className="wg-calendar__next" aria-labelledby="wg-calendar-next-title">
          <div><span className="eyebrow">De la planificación a la decisión</span><h2 id="wg-calendar-next-title">Contrasta el plan con tu lote</h2><p>La guía muestra cómo leer etapa, suelo y aplicación. Si necesitas definir cantidades o ajustar el programa, prepara los datos del cultivo y habla con el equipo técnico.</p></div>
          <div className="wg-calendar__next-links">{current.pdfFile ? <a href={current.pdfFile} target="_blank" rel="noopener noreferrer">Abrir guía de {current.name} <span aria-hidden="true">↗</span></a> : <Link href={`/wondergreen/cultivos/${current.slug}/`}>Abrir ruta técnica de {current.name} <span aria-hidden="true">→</span></Link>}<Link href="/wondergreen/calculadora/">Preparar el contexto del lote <span aria-hidden="true">↗</span></Link></div>
        </section>
      </div>
    </div>
  );
}
