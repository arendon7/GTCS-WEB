"use client";

import { useMemo, useState } from "react";
import { catalogOffers } from "@/data/catalog";
import { site } from "@/data/site";

function cop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function QuoteBuilder() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const lines = useMemo(
    () => catalogOffers
      .map((offer) => ({ offer, quantity: quantities[offer.id] || 0 }))
      .filter((line) => line.quantity > 0),
    [quantities],
  );

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.offer.priceCop * line.quantity, 0),
    [lines],
  );

  return (
    <div className="quote-layout">
      <div className="quote-products">
        {catalogOffers.map((offer) => (
          <article className="quote-row" key={offer.id}>
            <div>
              <span>{offer.family}{offer.formula ? ` · ${offer.formula}` : ""}</span>
              <strong>{offer.product}</strong>
              <small>{offer.presentation} · {cop(offer.priceCop)} c/u</small>
            </div>
            <label>
              <span className="sr-only">Cantidad de {offer.product} {offer.presentation}</span>
              <input
                aria-label={`Cantidad ${offer.product} ${offer.presentation}`}
                min="0"
                inputMode="numeric"
                type="number"
                value={quantities[offer.id] || ""}
                placeholder="0"
                onChange={(event) => {
                  const value = Math.max(0, Number.parseInt(event.target.value || "0", 10) || 0);
                  setQuantities((current) => ({ ...current, [offer.id]: value }));
                }}
              />
            </label>
          </article>
        ))}
      </div>

      <aside className="quote-summary">
        <span className="eyebrow">Estimación</span>
        <h2>{lines.length ? `${lines.length} referencia${lines.length === 1 ? "" : "s"}` : "Arma tu pedido"}</h2>
        <div className="quote-lines">
          {lines.length ? lines.map(({ offer, quantity }) => (
            <div key={offer.id}><span>{quantity} × {offer.family} · {offer.presentation}</span><strong>{cop(offer.priceCop * quantity)}</strong></div>
          )) : <p>Selecciona cantidades para obtener un valor de catálogo estimado.</p>}
        </div>
        <div className="quote-total"><span>Total estimado</span><strong>{cop(total)}</strong></div>
        <p className="quote-disclaimer">No constituye factura ni confirma inventario, transporte, descuentos, impuestos o condiciones comerciales. La venta se valida con Greenatics.</p>
        <a className="button button--primary quote-button" href={site.bookingUrl} target="_blank" rel="noreferrer">Confirmar con el equipo</a>
      </aside>
    </div>
  );
}
