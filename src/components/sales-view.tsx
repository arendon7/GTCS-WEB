"use client";

import Link from "next/link";
import { useCommercialStore } from "@/components/commercial-store";
import { grossBillingCop, soldQuantityByUnit } from "@/lib/commercial-domain";

const cop=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0});
const dateFmt=new Intl.DateTimeFormat("es-CO",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Bogota"});

export function SalesView(){
  const {sales,customers}=useCommercialStore();
  const billed=grossBillingCop(sales);
  const quantities=soldQuantityByUnit(sales);

  return <>
    <header className="page-header"><div><p className="eyebrow">Comercial · facturación bruta</p><h1>Ventas</h1><p className="lede">Cada venta está ligada a un lote físico y descuenta inventario. Facturación bruta no equivale a recaudo ni utilidad.</p></div><div className="header-actions"><Link className="button secondary" href="/inventory">Ver inventario</Link><Link className="button primary" href="/sales/new">Registrar venta</Link></div></header>

    <section className="metrics-grid" aria-label="Indicadores de ventas"><div className="metric-block"><span>Facturación bruta</span><strong>{cop.format(billed)}</strong><small>{sales.length} venta{sales.length===1?"":"s"} registrada{sales.length===1?"":"s"}</small></div><div className="metric-block"><span>Clientes</span><strong>{customers.length}</strong><small>maestro normalizado</small></div>{quantities.map((item)=><div className="metric-block" key={item.unit}><span>Vendido · {item.unit}</span><strong>{item.quantity.toLocaleString("es-CO",{maximumFractionDigits:2})}</strong><small>cantidad física separada</small></div>)}</section>

    <section className="panel"><div className="section-head"><div><p className="eyebrow">Historial comercial</p><h2>Ventas registradas</h2></div><span className="quiet">Más recientes primero · historial enlazado al kardex</span></div>
      {sales.length?<div className="grid gap-3">{sales.map((sale)=><article className="rounded-xl border border-[var(--line)] p-4" key={sale.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><strong className="text-sm">{sale.customerName}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{sale.productName} · {sale.lotCode} · {sale.plant}</span></div><div className="text-right"><strong className="block text-lg">{cop.format(sale.totalCop)}</strong><span className="text-[11px] text-[var(--muted)]">{dateFmt.format(new Date(sale.soldAt))}</span></div></div><div className="mt-4 grid gap-3 border-t border-[var(--line)] pt-3 text-xs sm:grid-cols-4"><div><span className="quiet">Cantidad</span><strong className="mt-1 block">{sale.quantity.toLocaleString("es-CO")} {sale.unit}</strong></div><div><span className="quiet">Precio unitario</span><strong className="mt-1 block">{cop.format(sale.unitPriceCop)} / {sale.unit}</strong></div><div><span className="quiet">Movimiento inventario</span><strong className="mt-1 block">{sale.inventoryMovementId.slice(0,8)}…</strong></div><div><span className="quiet">Estado financiero</span><strong className="mt-1 block">Venta registrada · pago no modelado</strong></div></div>{sale.note&&<p className="mt-3 rounded-lg bg-[var(--surface-soft)] p-3 text-xs text-[var(--muted)]">{sale.note}</p>}</article>)}</div>:<div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center"><strong className="block text-sm">Aún no hay ventas registradas</strong><p className="quiet mt-2">Primero debe existir stock por lote. La venta descontará ese lote en la misma acción.</p><Link className="button primary mt-4 inline-flex" href="/sales/new">Registrar la primera venta</Link></div>}
    </section>
  </>;
}
