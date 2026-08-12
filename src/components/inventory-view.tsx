"use client";

import Link from "next/link";
import { useState } from "react";
import { useInventoryStore } from "@/components/inventory-store";
import { useOpsStore } from "@/components/ops-store";
import type { InventoryUnit } from "@/lib/inventory-domain";

const dateFmt=new Intl.DateTimeFormat("es-CO",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Bogota"});
const kindLabel={production:"Producción",dispatch:"Salida",adjustment_in:"Ajuste entrada",adjustment_out:"Ajuste salida"} as const;

export function InventoryView(){
  const {products,stocks,lots,movements,createProduct,ready,error,refreshInventory,resetInventoryDemo}=useInventoryStore();
  const {backend,access}=useOpsStore();
  const [newName,setNewName]=useState("");
  const [newUnit,setNewUnit]=useState<InventoryUnit>("kg");
  const [feedback,setFeedback]=useState("");
  const [busy,setBusy]=useState(false);
  const remoteMode=backend.mode==="supabase";
  const canManageProducts=!remoteMode||access.some((plant)=>plant.role==="admin"||plant.role==="director");
  const sourceLabel=!ready?"Cargando…":remoteMode?"Supabase · producción e inventario":"Persistencia local activa";

  async function addProduct(){
    if(busy)return;
    setBusy(true);setFeedback("");
    try{
      const result=await createProduct(newName,newUnit);
      if(!result.ok){setFeedback(result.error);return;}
      setNewName("");setFeedback("Producto agregado al maestro.");
    }finally{setBusy(false);}
  }

  async function refreshOrReset(){
    if(busy)return;
    setBusy(true);setFeedback("");
    try{
      if(remoteMode) await refreshInventory();
      else resetInventoryDemo();
    }catch(caught){setFeedback(caught instanceof Error?caught.message:"No fue posible actualizar inventario.");}
    finally{setBusy(false);}
  }

  return <>
    <header className="page-header"><div><p className="eyebrow">Kardex</p><h1>Inventario</h1><p className="lede">El saldo se calcula desde movimientos por planta, producto y lote. No existe un campo de stock que se sobrescriba manualmente.</p></div><div className="header-actions"><Link className="button secondary" href="/production">Ver producción</Link><Link className="button secondary" href="/inventory/dispatch">Registrar salida</Link><Link className="button primary" href="/production/new">Registrar producción</Link></div></header>

    {error&&<p className="mb-4 rounded-xl bg-[var(--red-soft)] p-4 text-sm font-semibold text-[var(--red)]" role="alert">{error}</p>}
    <section className="panel mb-4"><div className="section-head"><div><p className="eyebrow">Stock actual</p><h2>Productos disponibles</h2></div><div className="flex items-center gap-2"><span className="quiet">{sourceLabel}</span><button className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" type="button" disabled={busy} onClick={refreshOrReset}>{busy?"Actualizando…":remoteMode?"Actualizar":"Restablecer demo"}</button></div></div>
      {stocks.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{stocks.map((stock)=><article className="rounded-xl border border-[var(--line)] p-4" key={`${stock.plantId}-${stock.productId}`}><span className="quiet">{stock.plant}</span><strong className="mt-1 block text-sm">{stock.productName}</strong><strong className="mt-3 block text-2xl">{stock.quantity.toLocaleString("es-CO")} {stock.unit}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{stock.lots} lote{stock.lots===1?"":"s"} con saldo</span></article>)}</div> : <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center"><strong className="block text-sm">Sin stock registrado</strong><p className="quiet mt-2">El inventario empezará cuando registres producción terminada.</p></div>}
    </section>

    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <section className="panel"><div className="section-head"><div><p className="eyebrow">Lotes</p><h2>Saldo por lote</h2></div><span className="quiet">trazabilidad física</span></div>{lots.length?<div className="worker-list">{lots.map((lot)=><div className="worker-row" key={`${lot.plantId}-${lot.productId}-${lot.lotCode}`}><div className="grow"><strong>{lot.lotCode}</strong><span>{lot.productName} · {lot.plant}</span></div><div className="right"><strong>{lot.quantity.toLocaleString("es-CO")} {lot.unit}</strong><small>disponible</small></div></div>)}</div>:<p className="quiet">No hay lotes con saldo.</p>}</section>
      <section className="panel"><div className="section-head"><div><p className="eyebrow">Maestro</p><h2>Productos</h2></div><span className="quiet">{products.filter((item)=>item.active).length} activos</span></div><div className="grid gap-2">{products.filter((item)=>item.active).map((product)=><div className="flex items-center justify-between rounded-lg bg-[var(--surface-soft)] p-3 text-xs" key={product.id}><strong>{product.name}</strong><span className="quiet">{product.unit}</span></div>)}</div>{canManageProducts?<div className="mt-4 grid gap-3 border-t border-[var(--line)] pt-4"><label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Nuevo producto<input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={newName} onChange={(event)=>setNewName(event.target.value)} placeholder="Nombre operativo" /></label><label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Unidad<select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={newUnit} onChange={(event)=>setNewUnit(event.target.value as InventoryUnit)}><option value="kg">kg</option><option value="L">L</option><option value="unidades">unidades</option></select></label><button className="button secondary" type="button" disabled={busy} onClick={addProduct}>{busy?"Guardando…":"Agregar producto"}</button>{feedback&&<p role="status" className="quiet">{feedback}</p>}</div>:<p className="mt-4 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">El maestro de productos solo puede ser modificado por administración o dirección.</p>}</section>
    </div>

    <section className="panel mt-4"><div className="section-head"><div><p className="eyebrow">Movimientos</p><h2>Kardex reciente</h2></div><span className="quiet">{movements.length} movimientos · append-only</span></div>{movements.length?<div className="grid gap-1">{movements.map((movement)=><div className="grid gap-2 border-t border-[var(--line)] py-3 first:border-t-0 sm:grid-cols-[110px_1fr_140px] sm:items-center" key={movement.id}><div><span className={`status-pill ${movement.kind==="production"||movement.kind==="adjustment_in"?"status-normal":"status-planned"}`}>{kindLabel[movement.kind]}</span></div><div><strong className="block text-xs">{movement.productName} · {movement.lotCode}</strong><span className="text-[10px] text-[var(--muted)]">{movement.plant}{movement.destination?` · ${movement.destination}`:""} · {dateFmt.format(new Date(movement.occurredAt))}</span></div><strong className={`text-right text-sm ${movement.kind==="dispatch"||movement.kind==="adjustment_out"?"text-[var(--red)]":"text-[var(--green)]"}`}>{movement.kind==="dispatch"||movement.kind==="adjustment_out"?"−":"+"} {movement.quantity.toLocaleString("es-CO")} {movement.unit}</strong></div>)}</div>:<p className="quiet">Aún no hay movimientos.</p>}</section>
  </>;
}
