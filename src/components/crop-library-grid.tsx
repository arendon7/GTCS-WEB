"use client";

import React from "react";
import Link from "next/link";
import { crops } from "@/data/crops";

export function CropLibraryGrid({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const featuredSlugs = new Set(["cafe", "aguacate", "tomate-chonto"]);
  const visibleCrops = featuredOnly ? crops.filter((crop) => featuredSlugs.has(crop.slug)) : crops;

  return (
    <div className={`crop-library-grid${featuredOnly ? " crop-library-grid--featured" : ""}`}>
      {visibleCrops.map((crop) => (
        <article className="crop-library-card" key={crop.slug}>
          <div className="crop-library-card__cover">
            <img src={crop.coverImage} alt={`Portada de la guía técnica de ${crop.name}`} width={1173} height={1657} loading="lazy" decoding="async" />
            <span>{crop.technicalManualFile ? "Guía + manual ampliado" : crop.pdfFile ? "Guía técnica" : "Programa web"}</span>
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
              {crop.pdfFile ? <a href={crop.pdfFile} download title={`Descargar guía breve de ${crop.name} en PDF`} aria-label={`Descargar guía breve de ${crop.name} en PDF`}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0-4-4m4 4V4"/></svg>
              </a> : null}
            </div>
            {crop.technicalManualFile ? <a className="crop-library-card__manual" download href={crop.technicalManualFile}>Manual técnico · 20 páginas <span aria-hidden="true">↗</span></a> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
