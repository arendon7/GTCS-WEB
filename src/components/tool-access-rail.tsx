"use client";

import Link from "next/link";

type ToolAccessRailProps = {
  id: string;
  name: string;
  status: string;
  copy: string;
  runtimeHref?: string;
  runtimeLabel?: string;
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
  accessHref,
  accessLabel,
}: ToolAccessRailProps) {
  return (
    <section className="tool-access-rail" aria-labelledby={`${id}-access-title`}>
      <div className="container tool-access-rail__grid">
        <div>
          <span className="eyebrow">Entrada a la plataforma</span>
          <h2 id={`${id}-access-title`}>Conoce la herramienta. Entra al entorno correcto.</h2>
          <p>{copy}</p>
          <div className="tool-access-rail__status" aria-label={`Estado de ${name}`}>
            <span>{status}</span>
            <small>Esta página explica el producto y sus módulos.</small>
          </div>
          <div className="button-row">
            {runtimeHref ? (
              <a
                className="button button--primary"
                href={runtimeHref}
                target={isExternal(runtimeHref) ? "_blank" : undefined}
                rel={isExternal(runtimeHref) ? "noopener noreferrer" : undefined}
              >
                {runtimeLabel} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <Link className="button button--primary" href={accessHref}>
                {accessLabel} <span aria-hidden="true">→</span>
              </Link>
            )}
            <Link className="button button--ghost" href="/acceso/">
              Ver todas las herramientas
            </Link>
          </div>
        </div>
        <aside className="tool-access-rail__route" aria-label={`Ruta de acceso a ${name}`}>
          <span>Ruta recomendada</span>
          <ol>
            <li><b>01</b><div><strong>Entender</strong><p>Qué resuelve {name} y quién la usa.</p></div></li>
            <li><b>02</b><div><strong>Explorar</strong><p>Sus módulos, datos y flujo de trabajo.</p></div></li>
            <li><b>03</b><div><strong>Entrar</strong><p>{runtimeHref ? "Abrir el entorno disponible." : "Solicitar un entorno configurado."}</p></div></li>
          </ol>
        </aside>
      </div>
    </section>
  );
}
