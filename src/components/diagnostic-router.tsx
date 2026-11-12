"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { buildDiagnosticDestinationHref, buildDiagnosticSecondaryHref, diagnosticNeeds, diagnosticProfiles, diagnosticRoutes } from "@/data/diagnostic-routes";

export function DiagnosticRouter() {
  const [profile, setProfile] = useState<string>("");
  const [need, setNeed] = useState<string>("");
  const profileTitleRef = useRef<HTMLHeadingElement>(null);
  const needTitleRef = useRef<HTMLHeadingElement>(null);

  const currentProfile = diagnosticProfiles.find((item) => item.id === profile);
  const result = profile && need ? diagnosticRoutes[`${profile}:${need}`] : undefined;
  const selectedNeed = diagnosticNeeds[profile]?.find((item) => item.id === need);
  const resultHref = result && selectedNeed
    ? buildDiagnosticDestinationHref(profile, result, selectedNeed.label)
    : "/contacto/";
  const secondaryHref = result && selectedNeed
    ? buildDiagnosticSecondaryHref(profile, result, selectedNeed.label)
    : undefined;
  const currentStep = result ? 3 : profile ? 2 : 1;

  const focusStep = (step: "profile" | "need") => {
    requestAnimationFrame(() => {
      const heading = step === "profile" ? profileTitleRef.current : needTitleRef.current;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      heading?.focus();
      heading?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  };

  const resetDiagnostic = () => {
    setProfile("");
    setNeed("");
    focusStep("profile");
  };

  const changeNeed = () => {
    setNeed("");
    focusStep("need");
  };

  const changeProfile = () => {
    setProfile("");
    setNeed("");
    focusStep("profile");
  };

  return (
    <div className="diagnostic-wizard">
      <div className="wizard-progress-bar" role="group" aria-label={`Paso ${currentStep} de 3: ${currentStep === 1 ? "elige tu contexto" : currentStep === 2 ? "elige tu necesidad" : "revisa tu ruta sugerida"}`}>
        <div className={`wizard-step-node ${profile ? "is-complete" : "is-active"}`} aria-current={currentStep === 1 ? "step" : undefined}>
          <span className="step-circle">1</span>
          <span className="step-text">¿Quién eres?</span>
        </div>
        <div className="wizard-connector" />
        <div className={`wizard-step-node ${need ? "is-complete" : profile ? "is-active" : ""}`} aria-current={currentStep === 2 ? "step" : undefined}>
          <span className="step-circle">2</span>
          <span className="step-text">¿Qué necesitas?</span>
        </div>
        <div className="wizard-connector" />
        <div className={`wizard-step-node ${result ? "is-active" : ""}`} aria-current={currentStep === 3 ? "step" : undefined}>
          <span className="step-circle">3</span>
          <span className="step-text">Ruta sugerida</span>
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {currentStep === 1 ? "Paso 1 de 3. Elige tu contexto." : currentStep === 2 ? `Paso 2 de 3. Elige una necesidad para ${currentProfile?.label}.` : `Paso 3 de 3. Ruta sugerida para ${currentProfile?.label}: ${selectedNeed?.label}.`}
      </p>

      <section className="wizard-step-card" aria-labelledby="diagnostic-profile-title">
        <div className="wizard-step-header">
          <div>
            <h3 id="diagnostic-profile-title" ref={profileTitleRef} tabIndex={-1}>¿Desde qué contexto nos consultas?</h3>
            <p>Elige el perfil que más se acerque a tu proyecto.</p>
          </div>
        </div>

        <div className="profile-cards-grid">
          {diagnosticProfiles.map((item) => {
            const isSelected = profile === item.id;
            return (
              <button
                type="button"
                className={`profile-select-card ${isSelected ? "is-selected" : ""}`}
                key={item.id}
                aria-pressed={isSelected}
                onClick={() => {
                  setProfile(item.id);
                  setNeed("");
                }}
              >
                <div className="profile-icon" aria-hidden="true">{item.icon}</div>
                <div className="profile-content">
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
                {isSelected && <span className="profile-check" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {profile && (
        <section className="wizard-step-card wizard-step-card--active" aria-labelledby="diagnostic-need-title">
          <div className="wizard-step-header">
            <div>
            <h3 id="diagnostic-need-title" ref={needTitleRef} tabIndex={-1}>¿Qué necesitas resolver como {currentProfile?.label}?</h3>
            <p>Selecciona el reto que mejor describe tu punto de partida.</p>
          </div>
          {!result && (
            <button type="button" className="wizard-edit-btn" onClick={changeProfile}>
              Cambiar contexto
            </button>
          )}
          </div>

          <div className="needs-cards-grid">
            {(diagnosticNeeds[profile] ?? []).map((item) => {
              const isSelected = need === item.id;
              return (
                <button
                  type="button"
                  className={`need-select-card ${isSelected ? "is-selected" : ""}`}
                  key={item.id}
                  aria-pressed={isSelected}
                  onClick={() => setNeed(item.id)}
                >
                  <strong>{item.label}</strong>
                  <small>{item.sub}</small>
                  {isSelected && <span className="need-check" aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {result && (
        <section className="diagnostic-result-card" aria-labelledby="diagnostic-result-title">
          <div className="result-card-top">
            <span className="eyebrow eyebrow--light">{result.badge}</span>
            <div className="wizard-result-controls">
              <button type="button" className="wizard-reset-btn" onClick={changeNeed}>
                Cambiar necesidad
              </button>
              <button type="button" className="wizard-reset-btn" onClick={changeProfile}>
                Cambiar contexto
              </button>
              <button type="button" className="wizard-reset-btn" onClick={resetDiagnostic}>
                Reiniciar
              </button>
            </div>
          </div>

          <h2 id="diagnostic-result-title" aria-live="polite">{result.title}</h2>
          <p className="diagnostic-result-context">{currentProfile?.label} <span aria-hidden="true">·</span> {selectedNeed?.label}</p>
          <p className="result-lead">{result.copy}</p>

          <div className="result-plan-box">
            <strong>Un punto de partida posible</strong>
            <ol className="result-steps-list">
              {result.steps.map((step, idx) => (
                <li key={step}>
                  <span className="step-idx">{idx + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="result-actions-row">
            <Link className="button button--light" href={resultHref}>
              {result.cta} <span aria-hidden="true">→</span>
            </Link>
            {result.secondary && secondaryHref && (
              <Link className="button button--outline-light" href={secondaryHref}>
                {result.secondary.cta}
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
