import type { Metadata } from "next";
import Link from "next/link";
import { digitalTools, getRuntimeEntryHref, isExternalRuntime, isLocalRuntime } from "@/data/digital-tools";
import { LocalToolRuntimeLink } from "@/components/local-tool-runtime-link";

export const metadata: Metadata = {
  title: "Acceso a herramientas",
  description: "Consulta las muestras públicas, el estado de cada herramienta y el siguiente paso para solicitar un entorno de trabajo.",
  alternates: { canonical: "/acceso/" },
  openGraph: {
    title: "Acceso a herramientas | Greenatics",
    description: "Una entrada clara a las muestras públicas y los entornos de trabajo Greenatics.",
    url: "/acceso/",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

export default function AccessPage() {
  return (
    <>
      <section className="access-v4-hero">
        <div className="container access-v4-hero__inner">
          <h1>Muestras públicas y accesos de trabajo.</h1>
          <p className="lead">
            Explora las experiencias abiertas o consulta cómo habilitar un espacio para tu equipo.
            Cada herramienta muestra su estado y el siguiente paso disponible.
          </p>
          <div className="button-row">
            <Link className="button button--light" href="#entornos-disponibles">Ver estados y accesos</Link>
            <Link className="button button--outline-light" href="/herramientas/">Comparar herramientas</Link>
          </div>
        </div>
      </section>

      <section
        className="access-v4-environments"
        id="entornos-disponibles"
        aria-labelledby="access-environments-title"
      >
        <div className="container">
          <div className="digital-v4-heading">
            <div><h2 id="access-environments-title">Estado y siguiente paso por herramienta.</h2></div>
            <p>Las muestras usan datos ilustrativos. Para trabajar con información de una organización, consulta el acceso y las condiciones del proyecto.</p>
          </div>

          <div className="access-v4-directory">
            {digitalTools.map((tool) => {
              const runtimeHref = tool.runtimeHref;
              const hasRuntime = Boolean(runtimeHref) && (
                !isLocalRuntime(runtimeHref) || process.env.NODE_ENV === "development"
              );
              const localDevelopmentRuntime = tool.code === "CO₂" && hasRuntime && isLocalRuntime(runtimeHref);
              const runtimeEntryHref = getRuntimeEntryHref(tool);
              const runtimeStatus = tool.code === "CO₂"
                ? hasRuntime
                  ? isLocalRuntime(runtimeHref) ? "URL local configurada · requiere servidor activo" : "Demo remota · el primer acceso puede tardar"
                  : "Acceso remoto no disponible"
                : hasRuntime ? "Enlace externo configurado" : tool.status;
              const isExternal = hasRuntime && isExternalRuntime(runtimeEntryHref);

              return (
                <article
                  className="access-v4-environment"
                  id={tool.code === "CO₂" ? "calcula-tu-huella" : undefined}
                  key={tool.code}
                >
                  <div className="access-v4-environment__identity">
                    <span className="access-v4-environment__code">{tool.code}</span>
                    <div>
                      <h3>{tool.name}</h3>
                      <p className="access-v4-environment__scope">{tool.scope}</p>
                    </div>
                  </div>

                  <div className="access-v4-environment__status">
                    <span>Estado</span>
                    <strong>{runtimeStatus}</strong>
                  </div>

                  <div className="access-v4-environment__actions">
                    <div className="access-v4-environment__actions-primary">
                      {hasRuntime && runtimeHref && !localDevelopmentRuntime ? (
                        <a
                          className="access-v4-environment__entry"
                          href={runtimeEntryHref}
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                          aria-label={tool.code === "CO₂" ? "Entrar a Back 2 Green" : `Abrir entorno configurado de ${tool.name}`}
                        >
                          {tool.code === "CO₂" ? "Entrar a Back 2 Green" : "Abrir entorno"} <span aria-hidden="true">↗</span>
                        </a>
                      ) : tool.code === "CO₂" ? (
                        <Link
                          className="access-v4-environment__entry"
                          href={tool.publicHref}
                          aria-label={`Ver el recorrido y los planes de ${tool.name}`}
                        >
                          Ver recorrido y planes <span aria-hidden="true">↗</span>
                        </Link>
                      ) : (
                        <Link
                          className="access-v4-environment__entry"
                          href={tool.publicHref}
                          aria-label={`${tool.publicLabel}: ${tool.name}`}
                        >
                          {tool.publicLabel} <span aria-hidden="true">↗</span>
                        </Link>
                      )}
                    </div>
                    <div className="access-v4-environment__actions-supporting">
                      {tool.code === "CO₂" && hasRuntime && !localDevelopmentRuntime ? (
                        <Link className="access-v4-environment__sample" href={tool.publicHref}>
                          Ver planes y recorrido <span aria-hidden="true">↗</span>
                        </Link>
                      ) : null}
                      {localDevelopmentRuntime ? (
                        <>
                          <small>Acceso de pruebas; requiere que el servidor local esté iniciado.</small>
                          <LocalToolRuntimeLink code="CO₂" className="access-v4-environment__sample" ariaLabel="Abrir el login local de prueba de Back 2 Green">Abrir acceso local de pruebas</LocalToolRuntimeLink>
                        </>
                      ) : null}
                      <Link
                        className="access-v4-environment__request"
                        href={tool.requestHref ?? `/contacto/?interes=${tool.implementationInterest}`}
                      >
                        {tool.requestLabel} <span aria-hidden="true">→</span>
                      </Link>
                      {!hasRuntime && tool.code === "OPS" ? <LocalToolRuntimeLink code="OPS" className="access-v4-environment__sample" ariaLabel="Abrir la demo local de GREENATICS OPS">Abrir demo OPS local en este equipo</LocalToolRuntimeLink> : null}
                      {!hasRuntime && tool.code === "CO₂" ? <LocalToolRuntimeLink code="CO₂" className="access-v4-environment__sample" ariaLabel="Abrir el login local de prueba de Back 2 Green">Abrir acceso local de pruebas</LocalToolRuntimeLink> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="access-v4-note">
            Una muestra no crea una cuenta ni habilita permisos. El uso con datos propios, las integraciones y las responsabilidades se acuerdan para cada proyecto.
          </p>
        </div>
      </section>
    </>
  );
}
