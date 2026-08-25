"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  bioinputReferences,
  compostReferences,
  liquidFertilizers,
  solidFertilizers,
  wondergreenReferences,
  type WondergreenReference,
  type WondergreenTruthStatus,
} from "@/data/wondergreen-public";
import { getWondergreenProductArtwork } from "@/data/wondergreen-product-assets";
import { getWondergreenVisualTone } from "@/data/wondergreen-visual";
import styles from "./catalog.module.css";
import depth from "./catalog-depth.module.css";

type StatusFilter = "all" | WondergreenTruthStatus;
type FormatFilter = "all" | "solid" | "liquid" | "compost" | "bioinput";

const groups = [
  { id: "solidos", number: "01", title: "Sólidos organominerales", copy: "Referencias para suelo, crecimiento, balance, floración y producción según versión técnica vigente.", items: solidFertilizers },
  { id: "liquidos", number: "02", title: "Fertilizantes líquidos", copy: "Formatos líquidos organizados por familia y objetivo, con condición comercial explícita.", items: liquidFertilizers },
  { id: "compost", number: "03", title: "Compost y suelo", copy: "Materia orgánica y acondicionamiento dentro de programas que empiezan por la condición del suelo.", items: compostReferences },
  { id: "bioinsumos", number: "04", title: "Bioinsumos", copy: "Microorganismos, inoculantes y extractos botánicos con estado técnico/regulatorio visible por referencia.", items: bioinputReferences },
] as const;

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "commercial-reconciled", label: "Estado comercial confirmado" },
  { value: "all", label: "Todo el portafolio" },
  { value: "technical-portfolio", label: "Portafolio técnico" },
  { value: "development", label: "Desarrollo" },
];

const formatOptions: { value: FormatFilter; label: string }[] = [
  { value: "all", label: "Todos los formatos" },
  { value: "solid", label: "Sólidos" },
  { value: "liquid", label: "Líquidos" },
  { value: "compost", label: "Compost" },
  { value: "bioinput", label: "Bioinsumos" },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function matchesFormat(reference: WondergreenReference, filter: FormatFilter) {
  if (filter === "all") return true;
  if (filter === "bioinput") return reference.line === "bioinput";
  return reference.format === filter;
}

function searchableText(reference: WondergreenReference) {
  return normalize([
    reference.name,
    reference.family,
    reference.formula ?? "",
    reference.role,
    reference.stage,
    reference.publicStatus,
  ].join(" "));
}

export function ProductCatalogBrowser() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("commercial-reconciled");
  const [format, setFormat] = useState<FormatFilter>("all");

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return wondergreenReferences.filter((reference) => {
      const matchesQuery = !needle || searchableText(reference).includes(needle);
      const matchesStatus = status === "all" || reference.truthStatus === status;
      return matchesQuery && matchesStatus && matchesFormat(reference, format);
    });
  }, [query, status, format]);

  const filteredSlugs = new Set(filtered.map((reference) => reference.slug));
  const visibleGroups = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => filteredSlugs.has(item.slug)) }))
    .filter((group) => group.items.length > 0);

  const clearFilters = () => {
    setQuery("");
    setStatus("commercial-reconciled");
    setFormat("all");
  };

  return (
    <>
      <section className={styles.browser} aria-label="Explorador del portafolio Wondergreen">
        <div className={styles.container}>
          <div className={styles.browserHeading}>
            <div>
              <span className={styles.eyebrow}>Portafolio Wondergreen</span>
              <h2>Empieza por las referencias con estado comercial confirmado.</h2>
              <span className={depth.commercialNote}>Después puedes abrir el portafolio técnico y las referencias en desarrollo sin mezclarlas con disponibilidad comercial.</span>
            </div>
            <p>Busca por nombre, familia, formulación, etapa o función. Cada referencia abre una página propia con presentaciones, documentación pública vinculada y condición comercial.</p>
          </div>

          <div className={styles.browserControls}>
            <label className={styles.searchField}>
              <span>Buscar en el portafolio</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ej. 2Grow, floración, líquido, Neem"
              />
            </label>

            <fieldset className={styles.filterGroup}>
              <legend>Estado</legend>
              <div className={styles.filterChips}>
                {statusOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    aria-pressed={status === option.value}
                    onClick={() => setStatus(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.filterGroup}>
              <legend>Formato</legend>
              <div className={styles.filterChips}>
                {formatOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    aria-pressed={format === option.value}
                    onClick={() => setFormat(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className={styles.resultBar} aria-live="polite">
            <strong>{filtered.length} {filtered.length === 1 ? "referencia" : "referencias"}</strong>
            <span>de {wondergreenReferences.length} referencias documentadas</span>
            {(query || status !== "commercial-reconciled" || format !== "all") ? <button type="button" onClick={clearFilters}>Volver a referencias confirmadas</button> : null}
          </div>
        </div>
      </section>

      {visibleGroups.map((group) => (
        <section className={styles.group} id={group.id} key={group.id}>
          <div className={styles.container}>
            <div className={styles.groupHeading}>
              <span>{group.number}</span>
              <div><h2>{group.title}</h2><p>{group.copy}</p></div>
            </div>
            <div className={styles.productGrid}>
              {group.items.map((item) => {
                const tone = getWondergreenVisualTone(item);
                const artwork = getWondergreenProductArtwork(item);
                return (
                  <Link className={styles.productCard} data-tone={tone} href={`/wondergreen/productos/${item.slug}`} key={item.slug}>
                    <div className={styles.cardTop}><span>{item.publicStatus}</span><small>{item.format}</small></div>
                    {artwork ? (
                      <>
                        <Image className={depth.cardArtwork} src={artwork.href} alt={artwork.alt} width={720} height={450} sizes="(max-width: 640px) 92vw, (max-width: 900px) 45vw, 30vw" unoptimized />
                        <span className={depth.cardAssetLabel}>{artwork.label}</span>
                      </>
                    ) : null}
                    <div className={`${styles.identity} ${artwork ? depth.cardIdentityWithArtwork : ""}`}><strong>{item.family}</strong>{item.formula ? <em>{item.formula}</em> : null}</div>
                    <h3>{item.name}</h3>
                    <p>{item.role}</p>
                    <div className={styles.cardBottom}><span>{item.stage}</span><strong>Ver producto →</strong></div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {filtered.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.container}>
            <span className={styles.eyebrow}>Sin coincidencias</span>
            <h2>No encontramos una referencia con esos filtros.</h2>
            <p>Esto no significa que debas escoger otro producto automáticamente. Vuelve a las referencias con estado comercial confirmado o entra por cultivo para revisar el contexto agronómico.</p>
            <div className={styles.emptyActions}>
              <button type="button" onClick={clearFilters}>Ver referencias confirmadas</button>
              <Link href="/wondergreen/cultivos">Buscar por cultivo →</Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}