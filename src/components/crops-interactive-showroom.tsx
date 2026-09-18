"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { crops } from "@/data/crops";

const categories = [
  { id: "all", label: "Todos", description: "Las 12 rutas disponibles", slugs: crops.map((crop) => crop.slug) },
  { id: "permanentes", label: "Permanentes", description: "Café, cacao y aguacate", slugs: ["cafe", "cacao", "aguacate"] },
  { id: "citricos-musaceas", label: "Cítricos y musáceas", description: "Limón, plátano y banano", slugs: ["limon-tahiti", "platano-banano"] },
  { id: "pasifloras", label: "Pasifloras", description: "Gulupa y granadilla", slugs: ["gulupa", "granadilla"] },
  { id: "frutales-andinos", label: "Frutales andinos", description: "Uchuva y lulo", slugs: ["uchuva", "lulo"] },
  { id: "hortalizas", label: "Hortalizas", description: "Tomate y lechuga", slugs: ["tomate-chonto", "lechuga"] },
  { id: "pastos", label: "Pastos", description: "Praderas y forrajes", slugs: ["pastos-gramineas"] },
] as const;

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function CropsInteractiveShowroom() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const category = categories.find((item) => item.id === activeCategory) ?? categories[0];
  const query = normalize(deferredSearch.trim());

  const filteredCrops = crops.filter((crop) => {
    if (!(category.slugs as readonly string[]).includes(crop.slug)) return false;
    if (!query) return true;
    return normalize(`${crop.name} ${crop.scientificName} ${crop.headline} ${crop.context}`).includes(query);
  });

  return (
    <div className="crop-explorer">
      <div className="crop-explorer__toolbar">
        <div className="crop-explorer__categories" aria-label="Filtrar por familia productiva" role="group">
          {categories.map((item) => (
            <button
              type="button"
              aria-pressed={activeCategory === item.id}
              className={activeCategory === item.id ? "is-active" : undefined}
              key={item.id}
              onClick={() => setActiveCategory(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.slugs.length}</small>
            </button>
          ))}
        </div>

        <label className="crop-explorer__search">
          <span className="sr-only">Buscar cultivo o especie</span>
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>
          <input
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar cultivo, especie o etapa"
            type="search"
            value={searchTerm}
          />
        </label>
      </div>

      <div className="crop-explorer__status" aria-live="polite">
        <div>
          <span>{category.label}</span>
          <p>{category.description}</p>
        </div>
        <strong>{filteredCrops.length} {filteredCrops.length === 1 ? "ruta encontrada" : "rutas encontradas"}</strong>
      </div>

      {filteredCrops.length > 0 ? (
        <div className="crop-explorer__grid">
          {filteredCrops.map((crop, index) => (
            <article className="crop-explorer-card" key={crop.slug}>
              <figure className="crop-explorer-card__cover">
                <Image
                  alt={`Portada de la guía Wondergreen para ${crop.name}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 700px) 42vw, (max-width: 1050px) 24vw, 15vw"
                  src={crop.coverImage}
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </figure>

              <div className="crop-explorer-card__content">
                <div className="crop-explorer-card__identity">
                  <p>{crop.scientificName}</p>
                  <span>{crop.stages.length} momentos</span>
                </div>
                <h3>{crop.name}</h3>
                <p className="crop-explorer-card__intro">{crop.intro}</p>

                <div className="crop-explorer-card__observation">
                  <span>Observar primero</span>
                  <p>{crop.alerts[0]}</p>
                </div>

                <div className="crop-explorer-card__stages" aria-label={`Momentos de lectura para ${crop.name}`}>
                  {crop.stages.slice(0, 2).map((stage) => <span key={stage.moment}>{stage.moment}</span>)}
                  {crop.stages.length > 2 ? <small>+{crop.stages.length - 2}</small> : null}
                </div>

                <div className="crop-explorer-card__actions">
                  <Link href={`/wondergreen/cultivos/${crop.slug}/`}>
                    Abrir ruta técnica <span aria-hidden="true">→</span>
                  </Link>
                  <a download href={crop.pdfFile} aria-label={`Descargar guía de ${crop.name} en PDF`} title={`Descargar guía de ${crop.name} en PDF`}>
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="crop-explorer__empty">
          <span>Sin coincidencias</span>
          <h3>No encontramos ese cultivo en la biblioteca actual.</h3>
          <p>Prueba con el nombre común, el nombre científico o una etapa como floración, establecimiento o llenado.</p>
          <button onClick={() => { setSearchTerm(""); setActiveCategory("all"); }} type="button">Ver todas las rutas</button>
        </div>
      )}
    </div>
  );
}
