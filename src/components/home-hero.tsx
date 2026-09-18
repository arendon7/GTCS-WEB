"use client";

import Image from "next/image";
import Link from "next/link";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { yarumalClaims } from "@/data/claims";

const profiles = [
  {
    id: "municipios",
    label: "Municipios y ESP",
    title: "Convertir una meta del PGIRS en capacidad territorial",
    description:
      "Conectamos generación, rutas selectivas, infraestructura, operación, trazabilidad y salidas de valor para que el sistema pueda arrancar, estabilizarse y mejorar.",
    href: "/municipios/",
    cta: "Soluciones para municipios",
  },
  {
    id: "empresas",
    label: "Empresas",
    title: "Del punto de generación a un destino verificable",
    description:
      "Ordenamos separación, almacenamiento, recolección, tratamiento y datos para reducir pérdidas de control y construir evidencia útil para gestión y reporte.",
    href: "/empresas/",
    cta: "Soluciones empresariales",
  },
  {
    id: "agroindustria",
    label: "Agroindustria",
    title: "Subproductos que pueden convertirse en energía, productos y valor",
    description:
      "Caracterizamos composición y variabilidad, comparamos alternativas y conectamos tratamiento, biogás, bioenergía, coproductos y control operativo.",
    href: "/agroindustria/",
    cta: "Soluciones para agroindustria",
  },
  {
    id: "agro",
    label: "Agro y distribución",
    title: "Nutrición por etapa con criterio agronómico",
    description:
      "Wondergreen organiza compost, fertilizantes organominerales y bioinsumos por objetivo y etapa, con herramientas para orientar el diagnóstico y el seguimiento.",
    href: "/wondergreen/",
    cta: "Conocer Wondergreen",
  },
  {
    id: "hogar",
    label: "Casa y jardín",
    title: "Cuidado botánico para espacios que también merecen suelo vivo",
    description:
      "Soluciones Wondergreen para plantas de interior, jardines, viveros y huertas urbanas, con orientación sencilla según espacio y objetivo.",
    href: "/casa-jardin/",
    cta: "Explorar Casa y Jardín",
  },
] as const;

const proofImages = [
  {
    src: "/projects/routes/route-evidence-01.webp",
    alt: "Equipo de recolección orgánica con microrruta territorial",
    title: "Ruta operativa",
    caption: "Operación real en territorio, con control de calidad y logística de ladera.",
    fit: "cover",
  },
  {
    src: "/projects/routes/motocarguero-verde-operacion-real.webp",
    alt: "Motocarguero verde de recolección diferenciada operando en un barrio colombiano",
    title: "Logística de proximidad",
    caption: "Un vehículo ágil conectado con generadores, frecuencia, calidad y datos de ruta.",
    fit: "contain",
  },
] as const;

export function HomeHero() {
  const [activeProfile, setActiveProfile] = useState<(typeof profiles)[number]["id"]>(
    "municipios",
  );
  const profile = profiles.find((item) => item.id === activeProfile) ?? profiles[0];
  const activeProfileIndex = profiles.findIndex((item) => item.id === activeProfile);

  function handleProfileKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? profiles.length - 1
        : (activeProfileIndex + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + profiles.length) % profiles.length;
    const nextProfile = profiles[nextIndex];
    setActiveProfile(nextProfile.id);
    document.getElementById(`profile-tab-${nextProfile.id}`)?.focus();
  }

  return (
    <section className="home-system-hero" aria-labelledby="home-hero-title">
      <div className="home-system-hero__inner container">
        <div className="home-system-hero__grid">
          <div className="home-system-hero__copy">
            <p className="eyebrow">
              Greenatics · sistemas circulares que se pueden operar
            </p>

            <h1 id="home-hero-title">
              Convertimos residuos orgánicos en sistemas que el territorio puede
              <em> operar, medir y valorizar.</em>
            </h1>

            <p className="home-system-hero__lead">
              Integramos diagnóstico, recolección selectiva, plantas de tratamiento,
              dirección técnica, trazabilidad digital y valorización para convertir una
              meta ambiental en capacidad cotidiana, evidencia operativa y valor para el territorio.
            </p>

            <div className="home-system-hero__actions" aria-label="Acciones principales">
              <Link className="button button--primary" href="/diagnostico/">
                Encontrar mi solución
              </Link>
              <Link className="button home-hero-secondary" href="/proyectos/">
                Ver casos reales
              </Link>
              <Link className="home-hero-text-link" href="/herramientas/">
                Explorar herramientas <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="home-audience-router home-audience-router--left">
              <p className="home-audience-router__label">¿Qué necesitas transformar?</p>
              <div className="home-audience-router__tabs" role="tablist" aria-label="Rutas según necesidad">
                {profiles.map((item) => (
                  <button
                    type="button"
                    aria-controls={`profile-panel-${item.id}`}
                    aria-selected={activeProfile === item.id}
                    className={activeProfile === item.id ? "is-active" : undefined}
                    id={`profile-tab-${item.id}`}
                    key={item.id}
                    onClick={() => setActiveProfile(item.id)}
                    onKeyDown={handleProfileKeyDown}
                    role="tab"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div aria-labelledby={`profile-tab-${profile.id}`} className="home-audience-router__panel" id={`profile-panel-${profile.id}`} role="tabpanel">
                <h2>{profile.title}</h2>
                <p>{profile.description}</p>
                <Link href={profile.href}>
                  {profile.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <ul className="home-proof-list" aria-label="Razones para confiar">
              <li>
                <strong>Capacidad instalada</strong>
                <span>Diseñamos para que el sistema funcione en el día a día.</span>
              </li>
              <li>
                <strong>Decisiones con datos</strong>
                <span>Traducimos variables de proceso en protocolos y prioridades.</span>
              </li>
              <li>
                <strong>Valor que permanece</strong>
                <span>Conectamos tratamiento, productos, energía y retorno al suelo.</span>
              </li>
            </ul>
          </div>

          <div className="home-system-hero__evidence">
            <figure className="home-hero-figure">
              <Image
                src="/projects/plant/plant-evidence-10.webp"
                alt="Biomasa orgánica fresca preparada para su transformación en una planta Greenatics"
                fill
                preload
                sizes="(max-width: 980px) 100vw, 46vw"
              />
              <figcaption>
                <span>Del residuo al recurso</span>
                Operación territorial y valorización biológica
              </figcaption>
            </figure>

            <div className="home-hero-proof-grid" aria-label="Piezas visuales de respaldo">
              {proofImages.map((item) => (
                <figure className="home-hero-proof-card" key={item.src}>
                  <div className={`home-hero-proof-card__media home-hero-proof-card__media--${item.fit}`}>
                    <Image src={item.src} alt={item.alt} fill sizes="(max-width: 980px) 50vw, 20vw" />
                  </div>
                  <figcaption>
                    <strong>{item.title}</strong>
                    <span>{item.caption}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

          </div>
        </div>

        <div className="home-claims-rail" aria-label="Resultados validados">
          <div className="home-claims-rail__intro">
            <span>Impacto comprobado</span>
            <strong>Resultados validados del sistema operado en Yarumal.</strong>
          </div>
          {yarumalClaims.map((claim) => (
            <article key={claim.id}>
              <strong>{claim.value}</strong>
              <span>{claim.label}</span>
              <small>{claim.context}</small>
            </article>
          ))}
          <Link href="/impacto/">
            Ver evidencia <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
