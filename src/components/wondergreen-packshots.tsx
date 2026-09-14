"use client";

import React, { useState } from "react";
import Link from "next/link";

const products = [
  {
    id: "2grow",
    name: "Wondergreen 2GROW",
    formula: "15-3-3 Organomineral",
    tag: "Arranque & Brotación",
    image: "/products/wondergreen-2grow.webp",
    price: "COP $147.400",
    unit: "Bulto 40 kg",
    status: "Precio de referencia reconciliado",
    desc: "Referencia organomineral orientada a acompañar establecimiento, brotación y crecimiento vegetativo dentro de un programa ajustado al cultivo.",
    pdf: "/downloads/catalogo-wondergreen.pdf"
  },
  {
    id: "2balance",
    name: "Wondergreen 2BALANCE",
    formula: "7-7-7 Organomineral",
    tag: "Equilibrio Continuo",
    image: "/products/wondergreen-2balance.webp",
    price: "COP $147.400",
    unit: "Bulto 40 kg",
    status: "Precio de referencia reconciliado",
    desc: "Referencia organomineral orientada a programas de nutrición balanceada y mantenimiento.",
    pdf: "/downloads/catalogo-wondergreen.pdf"
  },
  {
    id: "2bloom",
    name: "Wondergreen 2BLOOM",
    formula: "3-8-3 Organomineral",
    tag: "Floración & Cuajado",
    image: "/products/wondergreen-2bloom.webp",
    price: "COP $115.500",
    unit: "Bulto 40 kg",
    status: "Precio de referencia reconciliado",
    desc: "Referencia organomineral orientada a acompañar la transición reproductiva y la etapa de floración.",
    pdf: "/downloads/catalogo-wondergreen.pdf"
  },
  {
    id: "2fruit",
    name: "Wondergreen 2FRUIT",
    formula: "3-3-8 Organomineral",
    tag: "Llenado & Cosecha",
    image: "/products/wondergreen-2fruit.webp",
    price: "COP $121.900",
    unit: "Bulto 40 kg",
    status: "Precio de referencia reconciliado",
    desc: "Referencia organomineral orientada a acompañar el desarrollo y llenado durante la fase productiva.",
    pdf: "/downloads/catalogo-wondergreen.pdf"
  },
];

export function WondergreenPackshots() {
  const [selectedId, setSelectedId] = useState<string>("2grow");
  const current = products.find(p => p.id === selectedId) || products[0];

  return (
    <div className="wg-solid-showcase">
      <div className="wg-solid-showcase__header">
        <div>
          <span className="eyebrow">Portafolio sólido Wondergreen</span>
          <h3>Sólidos organominerales para leer el cultivo por etapa</h3>
          <p>Selecciona una línea para revisar su papel dentro del sistema. La ruta líquida y sus cuatro fichas están disponibles en el bloque siguiente.</p>
        </div>
        <div className="wg-solid-showcase__tabs" role="tablist" aria-label="Referencias sólidas Wondergreen">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`solid-tab-${p.id}`}
              aria-selected={selectedId === p.id}
              aria-controls={`solid-panel-${p.id}`}
              onClick={() => setSelectedId(p.id)}
            >
              {p.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="wg-solid-showcase__panel" id={`solid-panel-${current.id}`} role="tabpanel" aria-labelledby={`solid-tab-${current.id}`}>
        <div className="wg-solid-showcase__media">
          <img
            src={current.image}
            alt={current.name}
          />
          <span>{current.tag}</span>
        </div>

        <div className="wg-solid-showcase__body">
          <span className="wg-solid-showcase__formula">{current.formula}</span>
          <h4>{current.name}</h4>
          <p className="wg-solid-showcase__desc">{current.desc}</p>

          <div className="wg-solid-showcase__price-row">
            <div><span className="wg-solid-showcase__price">{current.price}</span><small>/ {current.unit}</small></div>
            <span className="wg-solid-showcase__status">{current.status}</span>
          </div>
          <p className="wg-solid-showcase__availability">El suministro se coordina con inventario, logística y condición de entrega definidos en la cotización.</p>

          <div className="wg-solid-showcase__actions">
            <Link className="button button--primary" href="/wondergreen/cotizador/">
              Cotizar con WhatsApp →
            </Link>
            <Link className="button button--ghost" href={`/wondergreen/productos/${current.id}/`}>
              Ver ficha completa →
            </Link>
            <a className="button button--outline" href={current.pdf} download>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Descargar Catálogo PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
