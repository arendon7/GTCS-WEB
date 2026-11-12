"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isGreenaticsRedReadyResponse, redReadinessEndpoint } from "@/lib/red-readiness.mjs";

type ToolAccessRailProps = {
  id: string;
  name: string;
  status: string;
  heading?: string;
  copy: string;
  runtimeHref?: string;
  runtimeReadinessRequired?: boolean;
  runtimeLabel?: string;
  demoHref?: string;
  demoLabel?: string;
  accessHref: string;
  accessLabel: string;
};

const isExternal = (href: string) => /^https?:\/\//.test(href);

export function ToolAccessRail({
  id,
  name,
  status,
  heading,
  copy,
  runtimeHref,
  runtimeReadinessRequired = false,
  runtimeLabel = `Entrar a ${name}`,
  demoHref,
  demoLabel,
  accessHref,
  accessLabel,
}: ToolAccessRailProps) {
  const legacyPresentation = heading === undefined;
  const resolvedDemoLabel = demoLabel ?? (legacyPresentation ? `Entrar al demo de ${name}` : `Explorar la muestra pública de ${name}`);
  const [runtimeReady, setRuntimeReady] = useState(false);

  useEffect(() => {
    if (!runtimeHref || !runtimeReadinessRequired) {
      setRuntimeReady(Boolean(runtimeHref));
      return;
    }

    let disposed = false;
    let activeController: AbortController | undefined;
    const checkReadiness = () => {
      activeController?.abort();
      activeController = new AbortController();
      void (async () => {
        try {
          const endpoint = redReadinessEndpoint(runtimeHref);
          if (!endpoint) {
            if (!disposed) setRuntimeReady(false);
            return;
          }
          const response = await fetch(endpoint, {
            method: "GET",
            mode: "cors",
            credentials: "omit",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: activeController?.signal,
          });
          const payload: unknown = await response.json();
          const ready = isGreenaticsRedReadyResponse(response.ok, payload);
          if (!disposed) setRuntimeReady(ready);
        } catch {
          if (!disposed) setRuntimeReady(false);
        }
      })();
    };

    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") checkReadiness();
    };

    checkReadiness();
    const interval = window.setInterval(checkReadiness, 60_000);
    document.addEventListener("visibilitychange", checkWhenVisible);
    return () => {
      disposed = true;
      activeController?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, [runtimeHref, runtimeReadinessRequired]);

  const visibleRuntimeHref = runtimeReadinessRequired
    ? runtimeReady ? runtimeHref : undefined
    : runtimeHref;
  const visibleStatus = runtimeReadinessRequired && runtimeHref
    ? runtimeReady ? "Entorno GREENATICS Red disponible" : "Estación pública de muestra"
    : status;
  const accessNote = runtimeHref && demoHref
    ? "Demo pública con datos ilustrativos · espacio operativo separado por organización."
    : demoHref
      ? "Demo navegable sin contraseña · datos ilustrativos y módulos abiertos."
      : runtimeHref
        ? "Espacio operativo disponible · acceso según identidad y permisos."
        : "El espacio propio se configura por organización, usuarios y permisos.";

  return (
    <section className="tool-access-rail" aria-labelledby={`${id}-access-title`}>
      <div className="container tool-access-rail__grid">
        <div>
          <span className="eyebrow">{legacyPresentation ? "Elige tu recorrido" : `${name} · ${visibleStatus}`}</span>
          <h2 id={`${id}-access-title`}>{heading ?? `Conoce ${name}, pruébalo y entra a tu espacio.`}</h2>
          <p>{copy}</p>
          {legacyPresentation && (
            <div className="tool-access-rail__status" aria-label={`Estado de ${name}`}>
              <span>{status}</span>
              <small>{accessNote}</small>
            </div>
          )}
          <div className="button-row">
            {legacyPresentation ? (
              runtimeHref ? (
                <>
                  <a className="button button--primary" href={runtimeHref} target={isExternal(runtimeHref) ? "_blank" : undefined} rel={isExternal(runtimeHref) ? "noopener noreferrer" : undefined}>
                    {runtimeLabel} <span aria-hidden="true">↗</span>
                  </a>
                  {demoHref && <Link className="button button--ghost" href={demoHref}>{resolvedDemoLabel} <span aria-hidden="true">→</span></Link>}
                  <Link className="button button--ghost" href={accessHref}>{accessLabel} <span aria-hidden="true">→</span></Link>
                </>
              ) : demoHref ? (
                <>
                  <Link className="button button--primary" href={demoHref}>{resolvedDemoLabel} <span aria-hidden="true">→</span></Link>
                  <Link className="button button--ghost" href={accessHref}>{accessLabel} <span aria-hidden="true">→</span></Link>
                </>
              ) : (
                <Link className="button button--primary" href={accessHref}>{accessLabel} <span aria-hidden="true">→</span></Link>
              )
            ) : visibleRuntimeHref ? (
              <>
                <a
                  className="button button--primary"
                  href={visibleRuntimeHref}
                  target={isExternal(visibleRuntimeHref) ? "_blank" : undefined}
                  rel={isExternal(visibleRuntimeHref) ? "noopener noreferrer" : undefined}
                >
                  {runtimeLabel} <span aria-hidden="true">↗</span>
                </a>
                {demoHref && (
                  <Link className="button button--ghost" href={demoHref}>
                    {resolvedDemoLabel} <span aria-hidden="true">→</span>
                  </Link>
                )}
                <Link className="button button--ghost" href={accessHref}>
                  {accessLabel} <span aria-hidden="true">→</span>
                </Link>
              </>
            ) : demoHref ? (
              <>
                <Link className="button button--primary" href={demoHref}>
                  {resolvedDemoLabel} <span aria-hidden="true">→</span>
                </Link>
                <Link className="button button--ghost" href={accessHref}>
                  {accessLabel} <span aria-hidden="true">→</span>
                </Link>
              </>
            ) : (
              <Link className="button button--primary" href={accessHref}>
                {accessLabel} <span aria-hidden="true">→</span>
              </Link>
            )}
            {legacyPresentation && <Link className="button button--ghost" href="/herramientas/">Ver el ecosistema digital</Link>}
          </div>
          {legacyPresentation && (
            <p className="tool-access-rail__next">
              <span>Para equipos y organizaciones</span>
              <Link href="/plataforma/usuarios/">Gestionar usuarios, roles y aplicaciones desde el Centro Greenatics <span aria-hidden="true">→</span></Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
