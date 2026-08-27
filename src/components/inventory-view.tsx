"use client";

import Link from "next/link";
import { useState } from "react";
import { useInventoryStore } from "@/components/inventory-store";
import { useOpsStore } from "@/components/ops-store";
import type { InventoryUnit } from "@/lib/inventory-domain";
import { hasOperationalWriteAccess } from "@/lib/ops-write-access";

const dateFmt=new Intl.DateTimeFormat("es-CO",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Bogota"});
const kindLabel={production:"Producción",dispatch:"Salida",adjustment_in:"Ajuste entrada",adjustment_out:"Ajuste salida"} as const;
const reconciliationRoles=new Set(["supervisor","technical","admin","director"]);

export function InventoryView(){
  const {products,stocks,lots,movements,reconciliations,createProduct,setProductReference,ready,error,refreshInventory,resetInventoryDemo}=useInventoryStore();
  const {backend,access}=useOpsStore();
  const [newName,setNewName]=useState("");
  const [newUnit,setNewUnit]=useState<InventoryUnit>("kg");
  const [newReference,setNewReference]=useState("");
  const [referenceProductId,setReferenceProductId]=useState("");
  const [referenceValue,setReferenceValue]=useState("");
  const [feedback,setFeedback]=useState("");
  const [busy,setBusy]=useState(false);
  const remoteMode=backend.mode==="supabase";
  const canWriteInventory=hasOperationalWriteAccess(remoteMode,access);
  const canManageProducts=!remoteMode||access.some((plant)=>plant.role==="admin"||plant.role==="director");
  const canReconcile=!remoteMode||access.some((plant)=>reconciliationRoles.has(plant.role));
  const activeProducts=products.filter((item)=>item.active);
  const effectiveReferenceProductId=activeProducts.some((item)=>item.id===referenceProductId)?referenceProductId:activeProducts[0]?.id??"";
  const sourceLabel=!ready?"Cargando…":remoteMode?"Supabase · producción e inventario":"Persistencia local activa";

  async function addProduct(){
    if(busy)return;
    setBusy(true);setFeedback("");
    try{
      const result=await createProduct(newName,newUnit,newReference);
      if(!result.ok){setFeedback(result.error);return;}
      setNewName("");setNewReference("");setFeedback("Producto agregado al maestro.");
    }finally{setBusy(false);}
  }

  async function saveReference(){
    if(busy||!effectiveReferenceProductId)return;
    setBusy(true);setFeedback("");
    try{
      const result=await setProductReference(effectiveReferenceProductId,referenceValue);
      if(!result.ok){setFeedback(result.error);return;}
      setReferenceValue("");setFeedback("Referencia actualizada. Las producciones históricas conservan su snapshot anterior.");
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
    <header className="page-header"><div><p className="eyebrow">Kardex</p><h1>Inventario</h1><p className="lede">El saldo se calcula desde movimientos por planta, producto y lote. Los conteos físicos se concilian sin sobrescribir el historial.</p></div><div className="header-actions"><Link className="button secondary" href="/production">Ver producción</Link>{canReconcile&&<Link className="button secondary" href="/inventory/reconcile">Conciliar inventario</Link>}{canWriteInventory&&<Link className="button secondary" href="/inventory/dispatch">Registrar salida</Link>}{canWriteInventory&&<Link className="button primary" href="/production/new">Registrar producción</Link>}</div></header>

    {!canWriteInventory&&remoteMode&&<p className="mb-4 rounded-xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted)]">Modo solo lectura: puedes consultar el kardex, pero esta sesión no tiene una planta autorizada para registrar producción o salidas.</p>}
    {error&&<p className="mb-4 rounded-xl bg-[var(--red-soft)] p-4 text-sm font-semibold text-[var(--red)]" role="alert">{error}</p>}
    <section className="panel mb-4"><div className="section-head"><div><p className="eyebrow">Stock actual</p><h2>Productos disponibles</h2></div><div className="flex items-center gap-2"><span className="quiet">{sourceLabel}</span><button className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" type="button" disabled={busy} onClick={refreshOrReset}>{busy?"Actualizando…":remoteMode?"Actualizar":"Restablecer demo"}</button></div></div>
      {stocks.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{stocks.map((stock)=><article className="rounded-xl border border-[var(--line)] p-4" key={`${stock.plantId}-${stock.productId}`}><span className="quiet">{stock.plant}</span><strong className="mt-1 block text-sm">{stock.productName}</strong><strong className="mt-3 block text-2xl">{stock.quantity.toLocaleString("es-CO")} {stock.unit}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{stock.lots} lote{stock.lots===1?"":"s"} con saldo</span></article>)}</div> : <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center"><strong className="block text-sm">Sin stock registrado</strong><p className="quiet mt-2">El inventario empezará cuando registres producción terminada.</p></div>}
    </section>

    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <section className="panel"><div className="section-head"><div><p className="eyebrow">Lotes</p><h2>Saldo por lote</h2></div><span className="quiet">trazabilidad física</span></div>{lots.length?<div className="worker-list">{lots.map((lot)=><div className="worker-row" key={`${lot.plantId}-${lot.productId}-${lot.lotCode}`}><div className="grow"><strong>{lot.lotCode}</strong><span>{lot.productName} · {lot.plant}</span></div><div className="right"><strong>{lot.quantity.toLocaleString("es-CO")} {lot.unit}</strong><small>disponible</small></div></div>)}</div>:<p className="quiet">No hay lotes con saldo.</p>}</section>
      <section className="panel"><div className="section-head"><div><p className="eyebrow">Maestro</p><h2>Productos</h2></div><span className="quiet">{activeProducts.length} activos</span></div><div className="grid gap-2">{activeProducts.map((product)=><div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-soft)] p-3 text-xs" key={product.id}><div><strong className="block">{product.name}</strong><span className="quiet">Ref. {product.referenceCode??"sin definir"}</span></div><span className="quiet">{product.unit}</span></div>)}</div>{canManageProducts?<div className="mt-4 grid gap-3 border-t border-[var(--line)] pt-4"><strong className="text-xs">Crear producto</strong><label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Nuevo producto<input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={newName} onChange={(event)=>setNewName(event.target.value)} placeholder="Nombre operativo" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Unidad<select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={newUnit} onChange={(event)=>setNewUnit(event.target.value as InventoryUnit)}><option value="kg">kg</option><option value="L">L</option><option value="unidades">unidades</option></select></label><label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Referencia <span className="font-normal">(opcional)</span><input aria-label="Referencia nuevo producto" className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={newReference} onChange={(event)=>setNewReference(event.target.value)} placeholder="Código real; no se autogenera" /></label></div><button className="button secondary" type="button" disabled={busy} onClick={addProduct}>{busy?"Guardando…":"Agregar producto"}</button><div className="mt-2 grid gap-3 border-t border-[var(--line)] pt-4"><strong className="text-xs">Administrar referencia</strong><label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Producto<select aria-label="Producto para referencia" className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={effectiveReferenceProductId} onChange={(event)=>{setReferenceProductId(event.target.value);setReferenceValue("");}}>{activeProducts.map((product)=><option key={product.id} value={product.id}>{product.name} · {product.referenceCode??"sin referencia"}</option>)}</select></label><label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Nueva referencia <span className="font-normal">(vacío = limpiar)</span><input aria-label="Nueva referencia" className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={referenceValue} onChange={(event)=>setReferenceValue(event.target.value)} placeholder="Referencia canónica" /></label><button className="button secondary" type="button" disabled={busy||!effectiveReferenceProductId} onClick={saveReference}>Guardar referencia</button></div>{feedback&&<p role="status" className="quiet">{feedback}</p>}</div>:<p className="mt-4 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">El maestro de productos solo puede ser modificado por administración o dirección.</p>}</section>
    </div>

    <section className="panel mt-4"><div className="section-head"><div><p className="eyebrow">Control físico</p><h2>Conciliaciones recientes</h2></div><span className="quiet">{reconciliations.length} conteos · inmutables</span></div>{reconciliations.length?<div className="grid gap-2">{reconciliations.slice(0,10).map((item)=><article className="grid gap-3 rounded-xl border border-[var(--line)] p-4 md:grid-cols-[1fr_auto] md:items-center" key={item.id}><div><strong className="block text-sm">{item.productName} · {item.lotCode}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{item.plant} · {dateFmt.format(new Date(item.occurredAt))} · {item.note}</span><span className="mt-1 block text-xs text-[var(--muted)]">Esperado {item.expectedQuantity.toLocaleString("es-CO")} {item.unit} · físico {item.countedQuantity.toLocaleString("es-CO")} {item.unit}{item.evidenceUrls.length?` · ${item.evidenceUrls.length} evidencia${item.evidenceUrls.length===1?"":"s"}`:""}</span></div><div className="text-left md:text-right"><strong className={item.differenceQuantity===0?"text-[var(--ink)]":item.differenceQuantity>0?"text-[var(--green)]":"text-[var(--red)]"}>{item.differenceQuantity>0?"+":""}{item.differenceQuantity.toLocaleString("es-CO")} {item.unit}</strong><small className="block text-[var(--muted)]">{item.differenceQuantity===0?"sin ajuste":"ajuste trazable"}</small></div></article>)}</div>:<div className="rounded-xl border border-dashed border-[var(--line)] p-6 text-center"><strong className="block text-sm">Sin conciliaciones físicas</strong><p className="quiet mt-2">Los conteos futuros congelarán esperado, físico y diferencia sin modificar registros anteriores.</p>{canReconcile&&<Link className="mt-3 inline-block text-xs font-semibold text-[var(--green)] underline underline-offset-4" href="/inventory/reconcile">Registrar primer conteo</Link>}</div>}</section>

    <section className="panel mt-4"><div className="section-head"><div><p className="eyebrow">Movimientos</p><h2>Kardex reciente</h2></div><span className="quiet">{movements.length} movimientos · append-only</span></div>{movements.length?<div className="grid gap-1">{movements.map((movement)=><div className="grid gap-2 border-t border-[var(--line)] py-3 first:border-t-0 sm:grid-cols-[110px_1fr_140px] sm:items-center" key={movement.id}><div><span className={`status-pill ${movement.kind==="production"||movement.kind==="adjustment_in"?"status-normal":"status-planned"}`}>{kindLabel[movement.kind]}</span></div><div><strong className="block text-xs">{movement.productName} · {movement.lotCode}</strong><span className="text-[10px] text-[var(--muted)]">{movement.plant}{movement.destination?` · ${movement.destination}`:""} · {dateFmt.format(new Date(movement.occurredAt))}</span></div><strong className={`text-right text-sm ${movement.kind==="dispatch"||movement.kind==="adjustment_out"?"text-[var(--red)]":"text-[var(--green)]"}`}>{movement.kind==="dispatch"||movement.kind==="adjustment_out"?"−":"+"} {movement.quantity.toLocaleString("es-CO")} {movement.unit}</strong></div>)}</div>:<p className="quiet">Aún no hay movimientos.</p>}</section>
  </>;
}
