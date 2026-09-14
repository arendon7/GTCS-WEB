"use client";

import React from "react";
import Link from "next/link";

const cropList = [
  { slug: "cafe", name: "Café", cover: "/guides/guia-cafe-cover.webp", pdf: "/downloads/guia-wondergreen-cafe.pdf", headline: "Levante, floración, llenado de grano y poszoca." },
  { slug: "cacao", name: "Cacao", cover: "/guides/guia-cacao-cover.webp", pdf: "/downloads/guia-wondergreen-cacao.pdf", headline: "Manejo de sombra, floración y llenado de mazorca." },
  { slug: "aguacate", name: "Aguacate Hass", cover: "/guides/guia-aguacate-cover.webp", pdf: "/downloads/guia-wondergreen-aguacate.pdf", headline: "Sanidad radicular, cuajado y calibre de exportación." },
  { slug: "limon-tahiti", name: "Limón Tahití", cover: "/guides/guia-citricos-cover.webp", pdf: "/downloads/guia-wondergreen-citricos.pdf", headline: "Flujos continuos de brotación, floración y cuajado." },
  { slug: "pastos-gramineas", name: "Pastos y Praderas", cover: "/guides/guia-pastos-cover.webp", pdf: "/downloads/guia-wondergreen-pastos-y-praderas.pdf", headline: "Aforo, oferta forrajera, biomasa y rebrote pospastoreo." },
  { slug: "platano-banano", name: "Plátano y Banano", cover: "/guides/guia-platano-banano-cover.webp", pdf: "/downloads/MANUAL_TECNICO_WONDERGREEN_BANANO_PLATANO_PROFUNDO_20P.pdf", headline: "Emisión foliar semanal, belloteo y peso de racimo." },
  { slug: "tomate-chonto", name: "Tomate Chonto", cover: "/guides/guia-tomate-chonto-cover.webp", pdf: "/downloads/01_GUIA_WONDERGREEN_TOMATE_CHONTO_V1.pdf", headline: "Equilibrio vegetativo-reproductivo y cuajado continuo." },
  { slug: "lechuga", name: "Lechuga y Hortalizas", cover: "/guides/guia-lechuga-cover.webp", pdf: "/downloads/01_GUIA_WONDERGREEN_LECHUGA_V1.pdf", headline: "Ciclo rápido, uniformidad, crocancia y peso fresco." },
  { slug: "gulupa", name: "Gulupa y Pasifloras", cover: "/guides/guia-gulupa-cover.webp", pdf: "/downloads/01_GUIA_WONDERGREEN_GULUPA_V1.pdf", headline: "Manejo de espaldera, amarre floral y grados Brix." },
  { slug: "granadilla", name: "Granadilla", cover: "/guides/guia-granadilla-cover.webp", pdf: "/downloads/01_GUIA_WONDERGREEN_GRANADILLA_V1.pdf", headline: "Emparrillado, consistencia de cáscara y peso de pulpa." },
  { slug: "uchuva", name: "Uchuva", cover: "/guides/guia-uchuva-cover.webp", pdf: "/downloads/01_GUIA_WONDERGREEN_UCHUVA_V1.pdf", headline: "Calibre de cáliz, grados Brix y tolerancia al rajado." },
  { slug: "lulo", name: "Lulo", cover: "/guides/guia-lulo-cover.webp", pdf: "/downloads/01_GUIA_WONDERGREEN_LULO_V1.pdf", headline: "Raíz superficial, nutrición fraccionada y cuajado continuo." },
];

export function CropLibraryGrid() {
  return (
    <div className="crop-library-grid">
      {cropList.map((crop, index) => (
        <article className="crop-library-card" key={crop.slug}>
          <div className="crop-library-card__cover">
            <img src={crop.cover} alt={`Portada de la guía técnica de ${crop.name}`} loading="lazy" />
            <span>Guía técnica</span>
            <small>{String(index + 1).padStart(2, "0")}</small>
          </div>

          <div className="crop-library-card__body">
            <div>
              <p>Ruta por cultivo</p>
              <h3>{crop.name}</h3>
            </div>
            <p className="crop-library-card__summary">{crop.headline}</p>

            <div className="crop-library-card__actions">
              <Link href={`/wondergreen/cultivos/${crop.slug}/`}>
                Explorar guía
                <span aria-hidden="true">→</span>
              </Link>
              <a href={crop.pdf} download title={`Descargar guía técnica de ${crop.name} en PDF`} aria-label={`Descargar guía técnica de ${crop.name} en PDF`}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
