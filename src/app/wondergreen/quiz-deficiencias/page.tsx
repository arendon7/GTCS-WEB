"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";

interface QuestionItem {
  id: number;
  symptom: string;
  context: string;
  options: { label: string; nutrient: string; isCorrect: boolean; explanation: string }[];
  solution: string;
}

const quizQuestions: QuestionItem[] = [
  {
    id: 1,
    symptom: "Amarillamiento generalizado que inicia en las hojas más viejas (bajeras) mientras las hojas nuevas permanecen verdes.",
    context: "Cultivo de Café en etapa de levante con bajo vigor vegetativo.",
    options: [
      { label: "Deficiencia de Nitrógeno (N)", nutrient: "N", isCorrect: true, explanation: "¡Correcto! El Nitrógeno es un elemento móvil en la planta, por lo que se traslada de las hojas viejas hacia los brotes nuevos, causando clorosis bajera." },
      { label: "Deficiencia de Hierro (Fe)", nutrient: "Fe", isCorrect: false, explanation: "Incorrecto. El Hierro es inmóvil y su clorosis se manifiesta primero en las hojas apicales más jóvenes." },
      { label: "Exceso de Fósforo (P)", nutrient: "P", isCorrect: false, explanation: "Incorrecto. El exceso de fósforo suele inducir deficiencia de Zinc o Hierro, no clorosis uniforme bajera." }
    ],
    solution: "Evaluar Wondergreen 2GROW (15-3-3) como referencia de crecimiento solo después de confirmar diagnóstico, análisis y etiqueta vigente."
  },
  {
    id: 2,
    symptom: "Bordes y puntas de las hojas quemados (necrosis marginal en V invertida) y frutos pequeños que no alcanzan calibre.",
    context: "Cultivo de Aguacate Hass en fase de llenado de pulpa.",
    options: [
      { label: "Deficiencia de Potasio (K)", nutrient: "K", isCorrect: true, explanation: "¡Correcto! El Potasio regula la presión osmótica y la acumulación de almidones/azúcares; su falta quema los bordes foliares." },
      { label: "Deficiencia de Calcio (Ca)", nutrient: "Ca", isCorrect: false, explanation: "Incorrecto. El Calcio afecta los puntos de crecimiento y genera deformación de brotes o pudrición apical de fruto." },
      { label: "Toxicidad por Manganeso", nutrient: "Mn", isCorrect: false, explanation: "Incorrecto. El manganeso tóxico produce manchas necróticas punteadas oscuras, no clorosis marginal continua." }
    ],
    solution: "Considerar Wondergreen 2FRUIT (3-3-8) dentro de un programa validado; no garantiza por sí solo calibre, materia seca ni rendimiento."
  },
  {
    id: 3,
    symptom: "Hojas con tonalidad púrpura / bronceada y sistema radicular atrofiado con pocas raíces absorbentes secundarias.",
    context: "Suelo Andisol volcánico frío con pH 4.7.",
    options: [
      { label: "Deficiencia de Fósforo (P) por fijación", nutrient: "P", isCorrect: true, explanation: "¡Correcto! En Andisoles ácidos, la alofana inmoviliza el fósforo, acumulando antocianinas (color morado/bronce) y frenando el desarrollo radicular." },
      { label: "Deficiencia de Magnesio (Mg)", nutrient: "Mg", isCorrect: false, explanation: "Incorrecto. El Magnesio produce clorosis intervenal en hojas viejas (nervaduras verdes con limbo amarillo)." },
      { label: "Falta de Riego", nutrient: "H2O", isCorrect: false, explanation: "Incorrecto. El síntoma clásico de antocianinas púrpuras en suelo volcánico es el bloqueo de fósforo." }
    ],
    solution: "Revisar primero acidez, aluminio y fósforo disponible; 2BLOOM o 2BALANCE solo se evalúan después de validar suelo, objetivo y etiqueta."
  }
];

export default function QuizDeficienciasPage() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const q = quizQuestions[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (q.options[idx].isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div style={{ background: "#f7faf5", color: "var(--green-950)", padding: "60px 0 80px" }}>
      <WondergreenToolTrail name="Quiz de deficiencias" path="/wondergreen/quiz-deficiencias/" />
      <div className="container" style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 36px" }}>
          <span className="eyebrow">Diagnóstico Visual & Autoentrenamiento</span>
          <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 12px" }}>
            Quiz Interactivo de Deficiencias Nutricionales
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            Pon a prueba tu capacidad para identificar síntomas de deficiencia mineral en hojas y frutos de cultivos tropicales.
          </p>
        </div>

        {!isFinished ? (
          <div style={{ background: "#ffffff", padding: "36px", borderRadius: "24px", border: "1.5px solid var(--line)", boxShadow: "0 12px 36px rgba(0, 107, 69, 0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "var(--green-800)" }}>
                Caso {q.id} de {quizQuestions.length}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 700 }}>
                Aciertos: {score}
              </span>
            </div>

            <div style={{ background: "#fafcf9", padding: "16px 20px", borderRadius: "14px", border: "1px solid var(--line)", marginBottom: "20px" }}>
              <small style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--green-800)", fontWeight: 800, display: "block", marginBottom: "4px" }}>
                Contexto de Campo:
              </small>
              <p style={{ margin: "0 0 6px", fontSize: "0.88rem", color: "var(--green-950)", fontWeight: 600 }}>
                {q.context}
              </p>
              <p style={{ margin: 0, fontSize: "1rem", color: "var(--green-950)", fontWeight: 700, lineHeight: 1.45 }}>
                ⚠️ {q.symptom}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {q.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                let bg = "#fafcf9";
                let border = "1px solid var(--line)";
                if (selectedOpt !== null) {
                  if (opt.isCorrect) {
                    bg = "#eef7eb";
                    border = "2px solid var(--green-800)";
                  } else if (isSelected) {
                    bg = "#fff3e8";
                    border = "2px solid #c45100";
                  }
                }
                return (
                  <button
                    type="button"
                    key={opt.label}
                    onClick={() => handleSelect(idx)}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      borderRadius: "14px",
                      background: bg,
                      border: border,
                      textAlign: "left",
                      cursor: selectedOpt === null ? "pointer" : "default",
                      fontSize: "0.94rem",
                      fontWeight: 600,
                      color: "var(--green-950)",
                      transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease"
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {selectedOpt !== null && (
              <div style={{ background: q.options[selectedOpt].isCorrect ? "#f0f8ec" : "#fff8f2", padding: "20px", borderRadius: "16px", marginBottom: "24px", border: "1px solid var(--line)" }}>
                <p style={{ margin: "0 0 8px", fontSize: "0.88rem", color: "var(--green-950)", lineHeight: 1.5 }}>
                  {q.options[selectedOpt].explanation}
                </p>
                <div style={{ fontSize: "0.82rem", color: "var(--green-800)", fontWeight: 700 }}>
                  💡 Solución Wondergreen: {q.solution}
                </div>
              </div>
            )}

            {selectedOpt !== null && (
              <button
                type="button"
                onClick={handleNext}
                className="button button--primary"
                style={{ width: "100%", padding: "14px", fontSize: "0.95rem" }}
              >
                {currentIdx + 1 < quizQuestions.length ? "Siguiente Caso →" : "Ver Resultados Finales →"}
              </button>
            )}
          </div>
        ) : (
          <div style={{ background: "#0a2920", color: "#ffffff", padding: "40px", borderRadius: "24px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <span style={{ fontSize: "2.4rem", display: "block", marginBottom: "12px" }}>🏆</span>
            <h2 style={{ fontSize: "2rem", color: "#ffffff", margin: "0 0 10px" }}>
              ¡Evaluación Completada!
            </h2>
            <p style={{ fontSize: "1.1rem", color: "#cbdcd3", margin: "0 0 24px" }}>
              Obtuviste <strong>{score} de {quizQuestions.length} aciertos</strong> ({Math.round((score / quizQuestions.length) * 100)}%).
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  setCurrentIdx(0);
                  setSelectedOpt(null);
                  setScore(0);
                  setIsFinished(false);
                }}
                className="button button--primary"
                style={{ padding: "12px 24px", fontSize: "0.92rem" }}
              >
                Repetir Quiz
              </button>
              <Link href="/biblioteca/" className="button button--outline" style={{ padding: "12px 24px", fontSize: "0.92rem", color: "#ffffff", borderColor: "rgba(255,255,255,0.3)" }}>
                Descargar Guías en PDF
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
