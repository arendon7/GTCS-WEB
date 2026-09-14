"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { catalogOffers, type CatalogOffer } from "@/data/catalog";
import { site } from "@/data/site";

function cop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseWeightKg(presentation: string): number {
  const clean = presentation.toLowerCase().replace(",", ".");
  if (clean.includes("kg")) {
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }
  if (clean.includes("l")) {
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num * 1.15; // densidad promedio líquida fertilizante ~1.15 kg/L
  }
  return 0;
}

interface PresetPackage {
  id: string;
  name: string;
  badge: string;
  description: string;
  items: Record<string, number>;
}

const PRESETS: PresetPackage[] = [
  {
    id: "siembra",
    name: "Kit Siembra & Suelo",
    badge: "Inicio & Trasplante",
    description: "5 bultos Compost + 2 bultos 2GROW Sólido para acondicionar y arrancar con vigor.",
    items: {
      "compost-40kg": 5,
      "2grow-s-40kg": 2,
    },
  },
  {
    id: "crecimiento",
    name: "Kit Crecimiento Vigoroso",
    badge: "Etapa Vegetativa",
    description: "4 bultos 2GROW Sólido + 1 garrafa 20L 2GROW Líquido para fertirriego o foliar.",
    items: {
      "2grow-s-40kg": 4,
      "2grow-l-20l": 1,
    },
  },
  {
    id: "floracion_llenado",
    name: "Kit Floración & Fruto",
    badge: "Producción",
    description: "3 bultos 2BLOOM Sólido + 3 bultos 2FRUIT Sólido + 1 garrafa 20L 2FRUIT Líquido.",
    items: {
      "2bloom-s-40kg": 3,
      "2fruit-s-40kg": 3,
      "2fruit-l-20l": 1,
    },
  },
  {
    id: "tonelada_compost",
    name: "Lote 1 Tonelada Compost",
    badge: "Acondicionamiento",
    description: "25 bultos de Compost de 40 kg (1.000 kg netos) para preparación masiva de lotes.",
    items: {
      "compost-40kg": 25,
    },
  },
];

export function QuoteBuilder() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const setExplicitQuantity = (id: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, value),
    }));
  };

  const applyPreset = (preset: PresetPackage) => {
    setQuantities((prev) => ({
      ...prev,
      ...preset.items,
    }));
  };

  const clearAll = () => {
    setQuantities({});
  };

  const filteredOffers = useMemo(() => {
    if (activeFilter === "all") return catalogOffers;
    if (activeFilter === "solido") return catalogOffers.filter((o) => o.presentation.includes("kg"));
    if (activeFilter === "liquido") return catalogOffers.filter((o) => o.presentation.includes("L"));
    return catalogOffers.filter((o) => o.family.toLowerCase() === activeFilter.toLowerCase());
  }, [activeFilter]);

  const lines = useMemo(
    () =>
      catalogOffers
        .map((offer) => ({ offer, quantity: quantities[offer.id] || 0 }))
        .filter((line) => line.quantity > 0),
    [quantities],
  );

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.offer.priceCop * line.quantity, 0),
    [lines],
  );

  const totalWeightKg = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + parseWeightKg(line.offer.presentation) * line.quantity,
        0,
      ),
    [lines],
  );

  const totalUnits = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  // WhatsApp formatted quote message
  const whatsappUrl = useMemo(() => {
    if (!lines.length) return "";
    let msg = "*Estimación comercial Greenatics / Wondergreen*\n\n";
    lines.forEach(({ offer, quantity }) => {
      msg += `• *${quantity}x* ${offer.product} (${offer.presentation}): ${cop(offer.priceCop * quantity)}\n`;
    });
    msg += `\n*Total referencias:* ${lines.length} (${totalUnits} unidades)`;
    msg += `\n*Peso estimado:* ${totalWeightKg.toFixed(0)} kg`;
    msg += `\n*Total estimado:* ${cop(total)}`;
    msg += `\n\n_Generado desde greenatics.com.co/wondergreen/cotizador/_`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  }, [lines, total, totalUnits, totalWeightKg]);

  const contactHref = useMemo(() => {
    if (!lines.length) return "/contacto/?interes=wondergreen&perfil=agro";
    const selected = lines.map(({ offer, quantity }) => `${quantity}x ${offer.product} ${offer.presentation}`).join(" · ");
    return `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent("Estimación comercial Wondergreen")}&prioridad=${encodeURIComponent(`${selected} · ${totalUnits} unidades · ${totalWeightKg.toFixed(0)} kg · ${cop(total)}`)}`;
  }, [lines, total, totalUnits, totalWeightKg]);

  return (
    <div className="quote-container-pro">
      {/* Presets Bar */}
      <div className="quote-presets-section">
        <div className="presets-header">
        <span className="eyebrow">Puntos de partida por objetivo</span>
        <h4>Configura una estimación y luego validamos el programa técnico:</h4>
        </div>
        <div className="presets-grid">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="preset-card"
              onClick={() => applyPreset(preset)}
            >
              <span className="preset-badge">{preset.badge}</span>
              <strong>{preset.name}</strong>
              <p>{preset.description}</p>
              <span className="preset-cta">+ Cargar al pedido</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="quote-filter-bar" role="tablist" aria-label="Filtrar catálogo">
        <button
          type="button"
          className={`filter-btn ${activeFilter === "all" ? "is-active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          Todo el catálogo ({catalogOffers.length})
        </button>
        <button
          type="button"
          className={`filter-btn ${activeFilter === "solido" ? "is-active" : ""}`}
          onClick={() => setActiveFilter("solido")}
        >
          Sólidos (40 kg)
        </button>
        <button
          type="button"
          className={`filter-btn ${activeFilter === "liquido" ? "is-active" : ""}`}
          onClick={() => setActiveFilter("liquido")}
        >
          Líquidos (1 L a 1000 L)
        </button>
        <button
          type="button"
          className={`filter-btn ${activeFilter === "compost" ? "is-active" : ""}`}
          onClick={() => setActiveFilter("compost")}
        >
          Compost
        </button>
        <button
          type="button"
          className={`filter-btn ${activeFilter === "2grow" ? "is-active" : ""}`}
          onClick={() => setActiveFilter("2grow")}
        >
          2GROW
        </button>
        <button
          type="button"
          className={`filter-btn ${activeFilter === "2fruit" ? "is-active" : ""}`}
          onClick={() => setActiveFilter("2fruit")}
        >
          2FRUIT
        </button>
      </div>

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
                    Presentación: <em>{offer.presentation}</em> · {cop(offer.priceCop)} c/u
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

        {/* Sidebar Summary */}
        <aside className="quote-summary">
          <div className="summary-top">
            <span className="eyebrow eyebrow--light">Resumen de estimación</span>
            {lines.length > 0 && (
              <button type="button" className="clear-btn" onClick={clearAll}>
                Vaciar
              </button>
            )}
          </div>

          <h2>
            {lines.length
              ? `${lines.length} referencia${lines.length === 1 ? "" : "s"} (${totalUnits} uds)`
              : "Tu cotización está vacía"}
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
                  <span>{cop(offer.priceCop * quantity)}</span>
                </div>
              ))
            ) : (
              <div className="quote-empty-state">
                <p>Selecciona cantidades o usa un punto de partida para explorar el valor del catálogo.</p>
              </div>
            )}
          </div>

          {lines.length > 0 && (
            <div className="quote-logistics-box">
              <div className="logistics-row">
                <span>Total unidades:</span>
                <strong>{totalUnits}</strong>
              </div>
              <div className="logistics-row">
                <span>Peso estimado:</span>
                <strong>{totalWeightKg.toFixed(0)} kg</strong>
              </div>
            </div>
          )}

          <div className="quote-total">
            <span>Total estimado:</span>
            <strong>{cop(total)}</strong>
          </div>

          <p className="quote-disclaimer">
            Estimación con valores de lista incorporados a esta versión. No incluye flete, impuestos específicos ni descuentos por volumen; la disponibilidad y el programa agronómico se confirman con el equipo Greenatics.
          </p>

          <div className="quote-actions-stack">
            {whatsappUrl && (
              <a
                className="button button--primary whatsapp-quote-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                Compartir estimación por WhatsApp
              </a>
            )}
            <Link className="button button--primary quote-button" href={contactHref}>
              Revisar pedido con Greenatics
            </Link>
            <a
              className="button button--light quote-button"
              href={site.bookingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Agendar pedido o reunión técnica
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
