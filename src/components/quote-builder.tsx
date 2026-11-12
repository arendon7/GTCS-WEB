"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { catalogOffers, catalogQuoteGroups, technicalCatalogInquiries, type CatalogOffer } from "@/data/catalog";
import { casaJardinKits as casaJardinV4Kits } from "@/data/casa-jardin-v4-review";
import { site } from "@/data/site";
import { buildToolContactHref, storeToolContactDraft } from "@/data/tool-contact-handoff";

const quoteDraftStorageKey = "greenatics:wondergreen-quote-draft:v1";

function readStoredQuantities(value: unknown, allowedIds: Set<string>): Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([id, quantity]) =>
      allowedIds.has(id) && typeof quantity === "number" && Number.isSafeInteger(quantity) && quantity > 0,
    ),
  );
}

function readQuoteDraft() {
  try {
    const stored = window.sessionStorage.getItem(quoteDraftStorageKey);
    if (!stored) return { quantities: {}, kitQuantities: {}, technicalSelections: [] as string[] };
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { quantities: {}, kitQuantities: {}, technicalSelections: [] as string[] };
    }
    const draft = parsed as { quantities?: unknown; kitQuantities?: unknown; technicalSelections?: unknown };
    return {
      quantities: readStoredQuantities(draft.quantities, new Set(catalogOffers.map(({ id }) => id))),
      kitQuantities: readStoredQuantities(draft.kitQuantities, new Set(casaJardinV4Kits.map(({ slug }) => slug))),
      technicalSelections: Array.isArray(draft.technicalSelections)
        ? [...new Set(draft.technicalSelections.filter((id): id is string => typeof id === "string" && technicalCatalogInquiries.some((item) => item.id === id)))]
        : [],
    };
  } catch {
    return { quantities: {}, kitQuantities: {}, technicalSelections: [] as string[] };
  }
}

function storeQuoteDraft(quantities: Record<string, number>, kitQuantities: Record<string, number>, technicalSelections: string[]) {
  try {
    if (Object.keys(quantities).length === 0 && Object.keys(kitQuantities).length === 0 && technicalSelections.length === 0) {
      window.sessionStorage.removeItem(quoteDraftStorageKey);
    } else {
      window.sessionStorage.setItem(quoteDraftStorageKey, JSON.stringify({ quantities, kitQuantities, technicalSelections }));
    }
  } catch {
    // The quote remains usable in memory when browser storage is unavailable.
  }
}

export function QuoteBuilder() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [kitQuantities, setKitQuantities] = useState<Record<string, number>>({});
  const [technicalSelections, setTechnicalSelections] = useState<string[]>([]);
  const [kitsOpen, setKitsOpen] = useState(false);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [requestedProductGroup, setRequestedProductGroup] = useState<string | null>(null);

  useEffect(() => {
    const savedDraft = readQuoteDraft();
    const params = new URLSearchParams(window.location.search);
    const requestedKit = params.get("kit");
    const requestedGroup = params.get("grupo");
    const requestedInquiry = params.get("consulta");
    let restoredKitQuantities = savedDraft.kitQuantities;
    if (requestedKit && casaJardinV4Kits.some((kit) => kit.slug === requestedKit)) {
      // Query preselection is one choice even when development Strict Mode replays effects.
      restoredKitQuantities = { ...restoredKitQuantities, [requestedKit]: Math.max(restoredKitQuantities[requestedKit] ?? 0, 1) };
    }
    const restoredTechnicalSelections = requestedInquiry && technicalCatalogInquiries.some((item) => item.id === requestedInquiry)
      ? [...new Set([...savedDraft.technicalSelections, requestedInquiry])]
      : savedDraft.technicalSelections;
    setQuantities(savedDraft.quantities);
    setKitQuantities(restoredKitQuantities);
    setTechnicalSelections(restoredTechnicalSelections);
    setKitsOpen(Object.keys(restoredKitQuantities).length > 0);
    setTechnicalOpen(restoredTechnicalSelections.length > 0);
    storeQuoteDraft(savedDraft.quantities, restoredKitQuantities, restoredTechnicalSelections);
    if (requestedGroup && catalogQuoteGroups[requestedGroup]) setRequestedProductGroup(requestedGroup);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const current = quantities[id] || 0;
    const next = { ...quantities, [id]: Math.max(0, current + delta) };
    setQuantities(next);
    storeQuoteDraft(next, kitQuantities, technicalSelections);
  };

  const setExplicitQuantity = (id: string, value: number) => {
    const next = {
      ...quantities,
      [id]: Math.max(0, value),
    };
    setQuantities(next);
    storeQuoteDraft(next, kitQuantities, technicalSelections);
  };

  const updateKitQuantity = (slug: string, delta: number) => {
    const next = { ...kitQuantities, [slug]: Math.max(0, (kitQuantities[slug] ?? 0) + delta) };
    setKitQuantities(next);
    storeQuoteDraft(quantities, next, technicalSelections);
  };

  const toggleTechnicalInquiry = (id: string) => {
    const next = technicalSelections.includes(id)
      ? technicalSelections.filter((selectedId) => selectedId !== id)
      : [...technicalSelections, id];
    setTechnicalSelections(next);
    storeQuoteDraft(quantities, kitQuantities, next);
  };

  const clearAll = () => {
    setQuantities({});
    setKitQuantities({});
    setTechnicalSelections([]);
    storeQuoteDraft({}, {}, []);
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has("kit") || currentUrl.searchParams.has("consulta")) {
      currentUrl.searchParams.delete("kit");
      currentUrl.searchParams.delete("consulta");
      window.history.replaceState(null, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
    }
  };

  const filteredOffers = useMemo(() => {
    const requestedGroup = requestedProductGroup ? catalogQuoteGroups[requestedProductGroup] : undefined;
    if (requestedGroup) return catalogOffers.filter((offer) => requestedGroup.offerIds.includes(offer.id));
    if (activeFilter === "all") return catalogOffers;
    if (activeFilter === "solido") return catalogOffers.filter((o) => o.presentation.includes("kg"));
    if (activeFilter === "liquido") return catalogOffers.filter((o) => o.presentation.includes("L"));
    return catalogOffers.filter((o) => o.family.toLowerCase() === activeFilter.toLowerCase());
  }, [activeFilter, requestedProductGroup]);

  const selectFilter = (filter: string) => {
    setRequestedProductGroup(null);
    setActiveFilter(filter);
  };
  const isFilterActive = (filter: string) => requestedProductGroup === null && activeFilter === filter;

  const lines = useMemo(
    () =>
      catalogOffers
        .map((offer) => ({ offer, quantity: quantities[offer.id] || 0 }))
        .filter((line) => line.quantity > 0),
    [quantities],
  );

  const selectedKits = useMemo(
    () => casaJardinV4Kits
      .map((kit) => ({ kit, quantity: kitQuantities[kit.slug] ?? 0 }))
      .filter(({ quantity }) => quantity > 0),
    [kitQuantities],
  );
  const selectedTechnicalInquiries = useMemo(
    () => technicalCatalogInquiries.filter((inquiry) => technicalSelections.includes(inquiry.id)),
    [technicalSelections],
  );

  const totalUnits = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const hasSelection = lines.length > 0 || selectedKits.length > 0 || selectedTechnicalInquiries.length > 0;
  const selectedCount = lines.length + selectedKits.length + selectedTechnicalInquiries.length;
  const requestTitle = selectedTechnicalInquiries.length > 0 && lines.length === 0 && selectedKits.length === 0
    ? "Consulta sobre referencias técnicas Wondergreen"
    : selectedTechnicalInquiries.length > 0
      ? "Solicitud de revisión Wondergreen"
      : selectedKits.length > 0 && lines.length === 0
    ? "Solicitud de revisión y cotización Wondergreen Casa & Jardín"
    : "Solicitud de cotización Wondergreen";
  const contactContext = selectedTechnicalInquiries.length > 0 && lines.length === 0 && selectedKits.length === 0
    ? { interest: "wondergreen", profile: "agro" }
    : selectedKits.length > 0 && lines.length === 0 && selectedTechnicalInquiries.length === 0
    ? { interest: "wondergreen-hogar", profile: "hogar" }
    : lines.length > 0 && (selectedKits.length > 0 || selectedTechnicalInquiries.length > 0)
      ? { interest: "soluciones", profile: "proyecto" }
      : { interest: "wondergreen", profile: "agro" };

  // The cart drafts a quotation request; it does not calculate a price or confirm an order.
  const whatsappUrl = useMemo(() => {
    if (!hasSelection) return "";
    let msg = `*${requestTitle}*\n\n`;
    lines.forEach(({ offer, quantity }) => {
      msg += `• *${quantity} ×* ${offer.product}${offer.formula ? ` ${offer.formula}` : ""} · ${offer.presentation}\n`;
    });
    selectedKits.forEach(({ kit, quantity }) => {
      msg += `• *${quantity} ×* Propuesta de kit ${kit.name}\n`;
      msg += "  Revisar contenido, referencias, presentaciones y empaque para preparar una cotización.\n";
      msg += "  Configuración y disponibilidad por confirmar.\n";
    });
    selectedTechnicalInquiries.forEach((inquiry) => {
      msg += `• Consulta técnica: ${inquiry.label}\n  ${inquiry.note}\n`;
    });
    msg += `\n*Referencias comerciales:* ${lines.length} · *Unidades de producto:* ${totalUnits} · *Composiciones de kit:* ${selectedKits.reduce((sum, item) => sum + item.quantity, 0)} · *Consultas técnicas:* ${selectedTechnicalInquiries.length}`;
    msg += "\n\n_Esta solicitud es un borrador. Greenatics confirmará precio, disponibilidad, cantidades finales y condiciones antes de emitir una oferta._";
    msg += `\n\n_Generado desde greenatics.com.co/wondergreen/cotizador/_`;
    return `https://wa.me/573003078822?text=${encodeURIComponent(msg)}`;
  }, [hasSelection, lines, requestTitle, selectedKits, selectedTechnicalInquiries, totalUnits]);

  const contactDetails = useMemo(() => {
    if (!hasSelection) return "";
    const selectedProducts = lines.map(({ offer, quantity }) => `${quantity} × ${offer.product}${offer.formula ? ` ${offer.formula}` : ""} (${offer.presentation})`);
    const selectedKitDetails = selectedKits.map(({ kit, quantity }) => `${quantity} × Propuesta de kit ${kit.name}: revisar contenido, referencias, presentaciones y empaque; configuración y disponibilidad por confirmar`);
    const selectedTechnicalDetails = selectedTechnicalInquiries.map((inquiry) => `Consulta técnica: ${inquiry.label} — ${inquiry.note}`);
    return `${requestTitle}:\n${[...selectedProducts, ...selectedKitDetails, ...selectedTechnicalDetails].join("\n")}\nReferencias comerciales: ${lines.length}\nUnidades de producto: ${totalUnits}\nPropuestas de kit a revisar: ${selectedKits.reduce((sum, item) => sum + item.quantity, 0)}\nConsultas técnicas: ${selectedTechnicalInquiries.length}\n\nLas consultas técnicas no son ofertas comerciales. Este borrador no confirma disponibilidad, registro, precio, cantidades finales ni pedido. Greenatics revisará y confirmará las condiciones.`;
  }, [hasSelection, lines, requestTitle, selectedKits, selectedTechnicalInquiries, totalUnits]);
  const contactHref = hasSelection
    ? buildToolContactHref(contactContext.interest, contactContext.profile, requestTitle)
    : "/contacto/?interes=wondergreen&perfil=agro";

  return (
    <div className={`quote-container-pro${hasSelection ? " quote-container-pro--has-selection" : ""}`}>
      {hasSelection && (
        <a className="quote-summary-dock" href="#quote-summary">
          <span>Revisar borrador</span>
          <span className="quote-summary-dock__count">{selectedCount} elemento{selectedCount === 1 ? "" : "s"} · sin confirmar</span>
        </a>
      )}
      <details
        className="quote-presets-section"
        id="kits"
        open={kitsOpen}
        onToggle={(event) => setKitsOpen(event.currentTarget.open)}
      >
        <summary className="presets-header">
          <div className="presets-header__copy">
            <span className="eyebrow">Kits Casa &amp; Jardín</span>
            <h4>Elige una propuesta para revisar y cotizar.</h4>
            <p>Estas imágenes corresponden a la serie actual de Casa &amp; Jardín. La matriz, el contenido, las presentaciones y el empaque se confirman con el equipo antes de emitir una oferta.</p>
          </div>
          <span className="presets-header__toggle" aria-hidden="true">
            {kitsOpen ? "Ocultar propuestas" : `Ver ${casaJardinV4Kits.length} propuestas de kit`}
            <span className="presets-header__chevron" />
          </span>
        </summary>
        <div className="presets-grid">
          {casaJardinV4Kits.map((kit) => (
            <article key={kit.slug} className={`preset-card ${kitQuantities[kit.slug] ? "is-selected" : ""}`}>
              <Link className="preset-card__visual" href={`/casa-jardin/kits/v4/${kit.slug}/`} aria-label={`Revisar arte y contenido de la propuesta ${kit.name}`}>
                <Image src={kit.image} alt={kit.imageAlt} width={1122} height={1402} sizes="(max-width: 520px) calc(100vw - 80px), (max-width: 1020px) 42vw, 28vw" />
              </Link>
              <div className="preset-card__body">
                <span className="preset-badge">{kit.audience}</span>
                <h5>{kit.name}</h5>
                <p>{kit.secondaryPromise ?? kit.promise}</p>
                <small className="preset-card__status">Propuesta de kit · contenido y armado por confirmar</small>
                <div className="preset-card__actions">
                  <Link href={`/casa-jardin/kits/v4/${kit.slug}/`}>Ver propuesta</Link>
                  <button
                    type="button"
                    aria-label={`${kitQuantities[kit.slug] ? "Añadir otra consulta sobre" : "Añadir consulta sobre"} ${kit.name} al borrador de cotización`}
                    onClick={() => updateKitQuantity(kit.slug, 1)}
                  >
                    + {kitQuantities[kit.slug] ? "Añadir otra" : "Añadir a la solicitud"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </details>

      {requestedProductGroup && catalogQuoteGroups[requestedProductGroup] ? (
        <div className="quote-context-banner" role="status">
          <div>
            <strong>Presentaciones para cotizar: {catalogQuoteGroups[requestedProductGroup].label}</strong>
            {catalogQuoteGroups[requestedProductGroup].note ? <p>{catalogQuoteGroups[requestedProductGroup].note}</p> : null}
          </div>
          <button type="button" onClick={() => selectFilter("all")}>Ver todo el catálogo</button>
        </div>
      ) : null}

      {/* Filters are toggle buttons, not tabs: each one filters the list in place. */}
      <div className="quote-filter-bar" role="group" aria-label="Filtrar catálogo">
        <button
          type="button"
          aria-pressed={isFilterActive("all")}
          className={`filter-btn ${isFilterActive("all") ? "is-active" : ""}`}
          onClick={() => selectFilter("all")}
        >
          Todo el catálogo ({catalogOffers.length})
        </button>
        <button
          type="button"
          aria-pressed={isFilterActive("solido")}
          className={`filter-btn ${isFilterActive("solido") ? "is-active" : ""}`}
          onClick={() => selectFilter("solido")}
        >
          Sólidos (40 kg)
        </button>
        <button
          type="button"
          aria-pressed={isFilterActive("liquido")}
          className={`filter-btn ${isFilterActive("liquido") ? "is-active" : ""}`}
          onClick={() => selectFilter("liquido")}
        >
          Líquidos (1 L a 1000 L)
        </button>
        <button
          type="button"
          aria-pressed={isFilterActive("compost")}
          className={`filter-btn ${isFilterActive("compost") ? "is-active" : ""}`}
          onClick={() => selectFilter("compost")}
        >
          Compost
        </button>
        <button
          type="button"
          aria-pressed={isFilterActive("2grow")}
          className={`filter-btn ${isFilterActive("2grow") ? "is-active" : ""}`}
          onClick={() => selectFilter("2grow")}
        >
          2GROW
        </button>
        <button
          type="button"
          aria-pressed={isFilterActive("2fruit")}
          className={`filter-btn ${isFilterActive("2fruit") ? "is-active" : ""}`}
          onClick={() => selectFilter("2fruit")}
        >
          2FRUIT
        </button>
      </div>

      <details
        className="quote-technical-section"
        id="consultas-tecnicas"
        open={technicalOpen}
        onToggle={(event) => setTechnicalOpen(event.currentTarget.open)}
      >
        <summary>
          <span><small>Fuera de la oferta cotizable</small><strong>Referencias del portafolio técnico</strong></span>
          <span>{technicalOpen ? "Ocultar" : `Consultar ${technicalCatalogInquiries.length} referencias`}</span>
        </summary>
        <div className="quote-technical-intro">
          <p>Estas referencias se documentan para consulta técnica; no forman parte de las presentaciones comerciales seleccionables. Puedes pedir al equipo que confirme ficha, etiqueta, registro aplicable, formato y suministro.</p>
        </div>
        <div className="quote-technical-grid">
          {technicalCatalogInquiries.map((inquiry) => {
            const selected = technicalSelections.includes(inquiry.id);
            return (
              <article className={`quote-technical-card${selected ? " is-selected" : ""}`} key={inquiry.id}>
                <div><strong>{inquiry.label}</strong><p>{inquiry.note}</p></div>
                <button type="button" aria-pressed={selected} onClick={() => toggleTechnicalInquiry(inquiry.id)}>
                  {selected ? "Retirar consulta" : "Añadir consulta técnica"}
                </button>
              </article>
            );
          })}
        </div>
      </details>

      {/* Main Quote Layout */}
      <div className="quote-layout">
        <div className="quote-products">
          {filteredOffers.map((offer) => {
            const qty = quantities[offer.id] || 0;
            return (
              <article
                className={`quote-row ${qty > 0 ? "quote-row--selected" : ""}`}
                key={offer.id}
              >
                <div className="quote-row-info">
                  <span className="quote-row-family">
                    {offer.family}
                    {offer.formula ? ` · Fórmula ${offer.formula}` : ""}
                  </span>
                  <strong>{offer.product}</strong>
                  <small>
                    Presentación: <em>{offer.presentation}</em>
                  </small>
                </div>

                <div className="quote-row-stepper">
                  <button
                    type="button"
                    className="stepper-btn stepper-btn--minus"
                    onClick={() => updateQuantity(offer.id, -1)}
                    disabled={qty === 0}
                    aria-label={`Reducir cantidad de ${offer.product}`}
                  >
                    −
                  </button>
                  <input
                    aria-label={`Cantidad ${offer.product} ${offer.presentation}`}
                    min="0"
                    inputMode="numeric"
                    type="number"
                    value={qty || ""}
                    placeholder="0"
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value || "0", 10) || 0);
                      setExplicitQuantity(offer.id, val);
                    }}
                    className="stepper-input"
                  />
                  <button
                    type="button"
                    className="stepper-btn stepper-btn--plus"
                    onClick={() => updateQuantity(offer.id, 1)}
                    aria-label={`Aumentar cantidad de ${offer.product}`}
                  >
                    +
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Quote request summary; commercial conditions are confirmed by the team. */}
        <aside className="quote-summary" id="quote-summary" tabIndex={-1}>
          <div className="summary-top">
            <span className="eyebrow eyebrow--light">Borrador de solicitud</span>
            {hasSelection && (
              <button type="button" className="clear-btn" onClick={clearAll}>
                Vaciar
              </button>
            )}
          </div>

          <h2>
            {hasSelection
              ? `${selectedCount} elemento${selectedCount === 1 ? "" : "s"} seleccionado${selectedCount === 1 ? "" : "s"}`
              : "Aún no agregas productos ni kits"}
          </h2>

          <div className="quote-lines">
            {lines.length ? (
              lines.map(({ offer, quantity }) => (
                <div className="quote-line-item" key={offer.id}>
                  <div>
                    <strong>
                      {quantity}× {offer.product}
                    </strong>
                    <small>{offer.presentation}</small>
                  </div>
                  <span>{quantity} {quantity === 1 ? "unidad" : "unidades"}</span>
                </div>
              ))
            ) : (
              null
            )}
            {selectedKits.map(({ kit, quantity }) => (
              <div className="quote-line-item" key={kit.slug}>
                <div>
                  <strong>{quantity}× Propuesta {kit.name}</strong>
                  <small>Contenido, presentación y disponibilidad por confirmar</small>
                </div>
                <div className="quote-line-item__controls" aria-label={`Cantidad del kit ${kit.name}`}>
                  <button type="button" onClick={() => updateKitQuantity(kit.slug, -1)} aria-label={`Reducir cantidad del kit ${kit.name}`}>−</button>
                  <span>{quantity} {quantity === 1 ? "kit" : "kits"}</span>
                  <button type="button" onClick={() => updateKitQuantity(kit.slug, 1)} aria-label={`Aumentar cantidad del kit ${kit.name}`}>+</button>
                </div>
              </div>
            ))}
            {selectedTechnicalInquiries.map((inquiry) => (
              <div className="quote-line-item quote-line-item--technical" key={inquiry.id}>
                <div><strong>{inquiry.label}</strong><small>Consulta técnica · no es oferta cotizable</small></div>
                <button type="button" className="quote-technical-remove" onClick={() => toggleTechnicalInquiry(inquiry.id)}>Retirar</button>
              </div>
            ))}
            {!hasSelection ? (
              <div className="quote-empty-state">
                <p>Elige productos comerciales, una propuesta de kit o referencias técnicas para consultar. El equipo confirmará las condiciones de cada caso.</p>
              </div>
            ) : null}
          </div>

          {hasSelection ? (
            <div className="quote-logistics-box">
              <div className="logistics-row"><span>Referencias seleccionadas:</span><strong>{lines.length}</strong></div>
              <div className="logistics-row"><span>Unidades de producto:</span><strong>{totalUnits}</strong></div>
              <div className="logistics-row"><span>Propuestas a revisar:</span><strong>{selectedKits.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
              <div className="logistics-row"><span>Consultas técnicas:</span><strong>{selectedTechnicalInquiries.length}</strong></div>
            </div>
          ) : null}

          <p className="quote-disclaimer">
            Este borrador no es un pedido confirmado. Greenatics validará precio, disponibilidad, cantidades y condiciones comerciales antes de emitir una cotización.
          </p>

          <div className="quote-actions-stack">
            {whatsappUrl && (
              <a
                className="button button--primary whatsapp-quote-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir borrador en WhatsApp
              </a>
            )}
            <Link className="button button--primary quote-button" href={contactHref} onClick={() => storeToolContactDraft(contactDetails)}>
              Enviar solicitud al equipo
            </Link>
            <a
              className="button button--light quote-button"
              href={site.bookingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Agendar conversación técnica
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
