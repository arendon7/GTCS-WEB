import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { digitalTools, getRuntimeEntryHref, hasSeparateLanding, isExternalRuntime, isLocalRuntime } from "@/data/digital-tools";
import { LocalToolRuntimeLink } from "@/components/local-tool-runtime-link";

export const metadata: Metadata = {
  title: "Herramientas digitales | Operación, territorio, impacto y campo",
  description: "Conoce cinco herramientas Greenatics, el trabajo que aborda cada una, sus recorridos de muestra y el siguiente paso adecuado.",
  alternates: { canonical: "/herramientas/" },
  openGraph: {
    title: "Herramientas digitales Greenatics | Operación, territorio y campo",
    description: "Compara GREENATICS OPS, GREENATICS Red, Back 2 Green, AGROWAY y SANA y elige la ruta adecuada para cada proyecto.",
    url: "/herramientas/",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

export default function ToolsPage() {
  return (
    <>
      <section className="digital-v4-hero"><div className="container digital-v4-hero__grid"><div><h1>Cinco experiencias para operar, medir y decidir.</h1><p className="lead">Cada herramienta parte de una necesidad concreta: seguir una operación, organizar el trabajo territorial, medir emisiones, dar trazabilidad al campo o estructurar un proyecto. Explora qué aporta cada experiencia y cuál es su forma de acceso.</p><div className="button-row"><Link className="button button--light" href="#plataformas">Explorar herramientas</Link><Link className="button button--outline-light" href="/contacto/?interes=herramientas">Ayudarme a elegir una herramienta</Link></div></div><figure className="digital-v4-hero__figure--photo"><Image src="/tools/digital-tools-field-v1.jpg" alt="Profesionales ambientales revisan información de operación en una planta de aprovechamiento de orgánicos." fill priority sizes="(max-width: 900px) 100vw, 47vw" /><figcaption><strong>La tecnología cobra sentido en el contexto del trabajo.</strong><span>Desde la operación y el territorio hasta los inventarios climáticos y los proyectos productivos.</span></figcaption></figure></div></section>

      <section className="digital-v4-platforms" id="plataformas" aria-labelledby="digital-platforms-title">
        <div className="container">
          <div className="digital-v4-heading">
            <div><span className="eyebrow">Cinco entradas, cinco trabajos</span><h2 id="digital-platforms-title">Elige la herramienta por la decisión que necesitas sostener.</h2></div>
            <p>Consulta qué puedes explorar públicamente, qué necesita un entorno autorizado y cómo plantear tu proyecto.</p>
          </div>
          <div className="digital-v4-platforms__grid">
            {digitalTools.map((platform) => {
              const runtimeHref = platform.runtimeHref;
              const runtimeEntryHref = getRuntimeEntryHref(platform);
              const hasRuntime = Boolean(runtimeHref) && (
                !isLocalRuntime(runtimeHref) || process.env.NODE_ENV === "development"
              );
              const localDevelopmentRuntime = hasRuntime && isLocalRuntime(runtimeHref);
              const platformStatus = platform.code === "CO₂"
                ? hasRuntime
                  ? localDevelopmentRuntime ? "Acceso local de desarrollo · servidor requerido" : "Acceso con cuenta"
                  : "Acceso remoto no disponible"
                : platform.status;
              const showLandingLink = hasSeparateLanding(platform.publicHref, platform.landingHref);

              return (
                <article key={platform.code}>
                  <figure className={[
                    platform.image?.endsWith(".svg") && "digital-v4-platforms__figure--diagram",
                    !platform.image && "digital-v4-platforms__figure--text",
                  ].filter(Boolean).join(" ")}>
                    {platform.image ? <Image src={platform.image} alt={platform.imageAlt ?? ""} fill sizes="(max-width: 1050px) 100vw, 26vw" /> : <strong aria-label="SANA">SANA</strong>}
                    <span>{platform.code}</span>
                  </figure>
                  <div>
                    <div className="digital-v4-platforms__meta"><span>{platformStatus}</span></div>
                    <h3>{platform.title}</h3>
                    <strong>{platform.audience}</strong>
                    <p>{platform.copy}</p>
                    <details className="digital-v4-platforms__details">
                      <summary>Ver alcance y resultado</summary>
                      <span className="digital-v4-platforms__scope">{platform.scope}</span>
                      <ul className="digital-v4-platforms__list">{platform.includes.map((item) => <li key={item}>{item}</li>)}</ul>
                      <div className="digital-v4-platforms__result"><small>Qué aporta</small><span>{platform.result}</span></div>
                    </details>
                    <div className="digital-v4-platforms__actions">
                      {platform.code === "CO₂" ? (
                        <>
                          <div className="digital-v4-platforms__action digital-v4-platforms__action--runtime">
                            {hasRuntime && !localDevelopmentRuntime && runtimeEntryHref ? (
                              <a href={runtimeEntryHref} target={isExternalRuntime(runtimeEntryHref) ? "_blank" : undefined} rel={isExternalRuntime(runtimeEntryHref) ? "noopener noreferrer" : undefined}>Entrar a Back 2 Green <span aria-hidden="true">↗</span></a>
                            ) : (
                              <Link href={platform.publicHref}>Ver plataforma y planes <span aria-hidden="true">→</span></Link>
                            )}
                          </div>
                          {localDevelopmentRuntime ? <div className="digital-v4-platforms__availability"><small>Acceso de pruebas: el servidor local de Huella debe estar iniciado.</small><LocalToolRuntimeLink code="CO₂" className="" ariaLabel="Abrir el login local de Back 2 Green">Abrir login local</LocalToolRuntimeLink></div> : null}
                          {hasRuntime && !localDevelopmentRuntime ? <div className="digital-v4-platforms__availability"><Link href={platform.publicHref}>Ver plataforma y planes →</Link></div> : null}
                          {platform.requestHref ? <div className="digital-v4-platforms__availability"><Link href={platform.requestHref}>{platform.requestLabel} →</Link></div> : null}
                        </>
                      ) : (
                        <>
                          <div className="digital-v4-platforms__action digital-v4-platforms__action--runtime"><Link href={platform.publicHref}>{platform.publicLabel} <span aria-hidden="true">↗</span></Link></div>
                          {showLandingLink ? <div className="digital-v4-platforms__availability"><Link href={platform.landingHref}>{platform.landingLabel} →</Link></div> : null}
                          {hasRuntime && runtimeEntryHref ? <div className="digital-v4-platforms__availability"><a href={runtimeEntryHref} target={isExternalRuntime(runtimeEntryHref) ? "_blank" : undefined} rel={isExternalRuntime(runtimeEntryHref) ? "noopener noreferrer" : undefined}>Entrar al espacio autorizado ↗</a></div> : null}
                          <div className="digital-v4-platforms__availability"><Link href={platform.requestHref ?? `/contacto/?interes=${platform.implementationInterest}`}>{platform.requestLabel} →</Link></div>
                        </>
                      )}
                    </div>
                    {process.env.NODE_ENV === "development" && !hasRuntime && platform.code === "OPS" ? <div className="digital-v4-platforms__availability"><small>Vista local de desarrollo; requiere que OPS esté iniciado en este equipo.</small><LocalToolRuntimeLink code="OPS" className="" ariaLabel="Abrir la demo local de GREENATICS OPS">Abrir demo OPS local</LocalToolRuntimeLink></div> : null}
                    {!hasRuntime && platform.code === "CO₂" ? <div className="digital-v4-platforms__availability"><small>Enlace local · requiere que Huella esté iniciada</small><LocalToolRuntimeLink code="CO₂" className="" ariaLabel="Abrir el login local de Back 2 Green">Entrar a Huella local</LocalToolRuntimeLink></div> : null}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="digital-v4-platforms__separate">
            <p><strong>¿Necesitas dimensionar residuos orgánicos?</strong> El estimador público proyecta masa y desvío; no calcula emisiones ni forma parte del inventario de Back 2 Green.</p>
            <Link href="/herramientas/estimador-organicos/">Abrir estimador de flujo orgánico <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

    </>
  );
}
