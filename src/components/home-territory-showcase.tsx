"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { yarumalClaims } from "@/data/claims";

const galleries = {
  plant: {
    label: "Planta y bioproceso",
    images: [
      {
        src: "/projects/plant/plant-evidence-01.webp",
        title: "Naves de bioproceso y pilas aireadas",
        caption: "Área de estabilización biológica y control operativo del material orgánico.",
      },
      {
        src: "/projects/plant/plant-evidence-02.webp",
        title: "Recepción y control de pureza",
        caption: "Descarga y aforo con 96,4 % de pureza orgánica en la operación validada.",
      },
      {
        src: "/projects/plant/plant-evidence-06.webp",
        title: "Material estabilizado",
        caption: "Seguimiento de transformación, madurez y calidad antes de la valorización.",
      },
      {
        src: "/projects/plant/plant-evidence-10.webp",
        title: "Biomasa lista para transformar",
        caption: "El punto de partida de una cadena que conecta separación, proceso, datos y uso final.",
      },
    ],
  },
  routes: {
    label: "Microrrutas",
    images: [
      {
        src: "/projects/routes/route-evidence-01.webp",
        title: "Recolección selectiva en territorio",
        caption: "Equipo operativo y vehículos adaptados a recorridos locales y topografía de ladera.",
      },
      {
        src: "/projects/routes/route-evidence-02.webp",
        title: "Pesaje y registro en origen",
        caption: "Datos de cada entrega para consolidar trazabilidad y balance de materia.",
      },
      {
        src: "/projects/routes/route-evidence-04.webp",
        title: "Cultura ciudadana",
        caption: "Acompañamiento a usuarios para mejorar separación y calidad del material recibido.",
      },
      {
        src: "/projects/routes/route-evidence-07.webp",
        title: "Operación coordinada",
        caption: "La logística, el equipo humano y la planta funcionan como partes de un mismo sistema.",
      },
    ],
  },
} as const;

type GalleryKey = keyof typeof galleries;

export function HomeTerritoryShowcase() {
  const [activeGallery, setActiveGallery] = useState<GalleryKey>("plant");
  const [activeImage, setActiveImage] = useState(0);
  const gallery = galleries[activeGallery];
  const image = gallery.images[activeImage] ?? gallery.images[0];

  const changeGallery = (key: GalleryKey) => {
    setActiveGallery(key);
    setActiveImage(0);
  };

  return (
    <section className="home-territory" aria-labelledby="home-territory-title">
      <div className="container">
        <div className="home-territory__heading">
          <div>
            <span className="eyebrow">Evidencia en territorio</span>
            <h2 id="home-territory-title">Yarumal y Támesis muestran dos sistemas en funcionamiento.</h2>
          </div>
          <p className="lead">
            Dos operaciones reales donde rutas selectivas, plantas, dirección técnica y datos
            se conectan para recuperar materia, nutrientes y, en Támesis, energía.
          </p>
        </div>

        <div className="home-territory__case">
          <div className="home-territory__story">
            <span className="home-territory__case-label">Caso validado · Antioquia</span>
            <h3>De transportar residuos a desarrollar capacidad territorial.</h3>
            <p>
              La operación sustituye parte del traslado al relleno regional por microrrutas
              y aprovechamiento local. Greenatics articula el modelo técnico, la planta,
              el seguimiento y la mejora continua junto con el equipo del territorio.
            </p>

            <div className="home-territory__metrics" aria-label="Resultados validados del caso Yarumal">
              {yarumalClaims.map((claim) => (
                <article key={claim.id}>
                  <strong>{claim.value}</strong>
                  <span>{claim.compactLabel}</span>
                </article>
              ))}
            </div>

            <div className="home-territory__validation">
              <span>Validación y acompañamiento técnico</span>
              <strong>GIEM · Universidad de Antioquia</strong>
              <p>
                El acompañamiento científico fortalece el bioproceso mediante inoculación termófila,
                control de temperatura superior a 55 °C y seguimiento de lote. Los resultados de
                logística, masa y ahorro provienen de la evidencia operativa y económica del caso.
                La distancia evitada es una mejora operativa verificable; para traducirla a CO₂
                equivalente todavía se deben completar carga, combustible, frecuencia, factor,
                periodo y frontera del inventario.
              </p>
              <Link className="home-territory__validation-link" href="/huella/#calculadora">
                Traducir evidencia a un escenario de CO₂ <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="home-territory__actions">
              <Link className="button button--primary" href="/proyectos/yarumal/">
                Ver caso Yarumal
              </Link>
              <Link className="home-territory__text-link" href="/impacto/">
                Revisar impacto y metodología <span aria-hidden="true">→</span>
              </Link>
              <Link className="home-territory__text-link" href="/proyectos/tamesis/">
                Conocer Támesis y su UASB <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="home-territory__gallery">
            <div className="home-territory__tabs" role="tablist" aria-label="Galería del caso Yarumal">
              {(Object.keys(galleries) as GalleryKey[]).map((key) => (
                <button
                  type="button"
                  aria-controls="territory-gallery-panel"
                  aria-selected={activeGallery === key}
                  className={activeGallery === key ? "is-active" : undefined}
                  id={`territory-tab-${key}`}
                  key={key}
                  onClick={() => changeGallery(key)}
                  role="tab"
                >
                  {galleries[key].label}
                </button>
              ))}
            </div>

            <figure
              aria-labelledby={`territory-tab-${activeGallery}`}
              className="home-territory__figure"
              id="territory-gallery-panel"
              role="tabpanel"
            >
              <Image
                alt={image.title}
                fill
                key={image.src}
                sizes="(max-width: 900px) 100vw, 52vw"
                src={image.src}
              />
              <figcaption>
                <strong>{image.title}</strong>
                <span>{image.caption}</span>
              </figcaption>
            </figure>

            <div className="home-territory__thumbnails" aria-label={`Imágenes: ${gallery.label}`}>
              {gallery.images.map((item, index) => (
                <button
                  type="button"
                  aria-label={`Mostrar ${item.title}`}
                  aria-pressed={activeImage === index}
                  className={activeImage === index ? "is-active" : undefined}
                  key={item.src}
                  onClick={() => setActiveImage(index)}
                >
                  <Image alt="" fill sizes="120px" src={item.src} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <Link className="home-territory__tamesis-bridge" href="/proyectos/tamesis/" id="caso-tamesis-home">
          <div className="home-territory__tamesis-media">
            <Image alt="Reactor UASB de la planta Greenatics en Támesis" fill sizes="(max-width: 760px) 100vw, 38vw" src="/projects/tamesis/reactor-uasb.jpeg" />
          </div>
          <div>
            <span>Segundo caso · Suroeste de Antioquia</span>
            <h3>Támesis añade biogás y bioenergía a la conversación.</h3>
            <p>Ruta selectiva, hidrólisis, reactor UASB, captura y acondicionamiento de biogás, aprovechamiento energético y control operacional.</p>
            <strong>Explorar la cadena anaerobia <b aria-hidden="true">→</b></strong>
          </div>
        </Link>
      </div>
    </section>
  );
}
