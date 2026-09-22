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
          <span className="eyebrow">Elige tu recorrido</span>
          <h2 id={`${id}-access-title`}>Conoce {name}, pruébalo y entra a tu espacio.</h2>
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
              Ver el ecosistema digital
            </Link>
          </div>
          <p className="tool-access-rail__next">
            <span>Para equipos y organizaciones</span>
            <Link href="/plataforma/usuarios/">Gestionar usuarios, roles y aplicaciones desde el Centro Greenatics <span aria-hidden="true">→</span></Link>
          </p>
        </div>
      </div>
    </section>
  );
}
