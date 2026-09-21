"use client";

import Link from "next/link";

type ToolAccessRailProps = {
  id: string;
  name: string;
  status: string;
  copy: string;
  runtimeHref?: string;
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
  copy,
  runtimeHref,
  runtimeLabel = `Entrar a ${name}`,
  demoHref,
  demoLabel = `Entrar al demo de ${name}`,
  accessHref,
  accessLabel,
}: ToolAccessRailProps) {
  const accessNote = runtimeHref && demoHref
    ? "Demo pública con datos ilustrativos · entorno real separado."
    : demoHref
      ? "Demo navegable sin contraseña · datos ilustrativos."
      : runtimeHref
        ? "Entorno disponible · acceso según identidad y permisos."
        : "La experiencia se configura por organización, usuarios y permisos.";

  return (
    <section className="tool-access-rail" aria-labelledby={`${id}-access-title`}>
      <div className="container tool-access-rail__grid">
        <div>
          <span className="eyebrow">Entrada a la plataforma</span>
          <h2 id={`${id}-access-title`}>Conoce la herramienta. Entra al entorno correcto.</h2>
          <p>{copy}</p>
          <div className="tool-access-rail__status" aria-label={`Estado de ${name}`}>
            <span>{status}</span>
            <small>{accessNote}</small>
          </div>
          <div className="button-row">
            {runtimeHref ? (
              <>
                <a
                  className="button button--primary"
                  href={runtimeHref}
                  target={isExternal(runtimeHref) ? "_blank" : undefined}
                  rel={isExternal(runtimeHref) ? "noopener noreferrer" : undefined}
                >
                  {runtimeLabel} <span aria-hidden="true">↗</span>
                </a>
                {demoHref && (
                  <Link className="button button--ghost" href={demoHref}>
                    {demoLabel} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </>
            ) : demoHref ? (
              <>
                <Link className="button button--primary" href={demoHref}>
                  {demoLabel} <span aria-hidden="true">→</span>
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
            <Link className="button button--ghost" href="/herramientas/">
              Ver todas las herramientas
            </Link>
          </div>
        </div>
        <aside className="tool-access-rail__route" aria-label={`Ruta de acceso a ${name}`}>
          <span>Ruta recomendada</span>
          <ol>
            <li><b>01</b><div><strong>Entender</strong><p>Qué resuelve {name} y quién la usa.</p></div></li>
            <li><b>02</b><div><strong>Explorar</strong><p>Sus módulos, datos y flujo de trabajo.</p></div></li>
            <li><b>03</b><div><strong>Entrar</strong><p>{runtimeHref && demoHref ? "Elegir la demo pública o el entorno configurado." : runtimeHref ? "Abrir el entorno disponible." : demoHref ? "Abrir la demo o preparar el entorno de la organización." : "Preparar un entorno configurado con el equipo."}</p></div></li>
          </ol>
        </aside>
      </div>
    </section>
  );
}
