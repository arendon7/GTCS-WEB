"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCommercialStore } from "@/components/commercial-store";
import { useInventoryStore } from "@/components/inventory-store";
import { saleTotalCop } from "@/lib/commercial-domain";

const cop=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0});

export function SaleForm(){
  const router=useRouter();
  const {recordSale}=useCommercialStore();
  const {lots}=useInventoryStore();
  const [plantId,setPlantId]=useState("tamesis");
  const availableLots=useMemo(()=>lots.filter((lot)=>lot.plantId===plantId&&lot.quantity>0),[lots,plantId]);
  const [lotKey,setLotKey]=useState("");
  const [customerName,setCustomerName]=useState("");
  const [quantity,setQuantity]=useState("");
  const [unitPriceCop,setUnitPriceCop]=useState("");
  const [note,setNote]=useState("");
  const [feedback,setFeedback]=useState("");
  const selected=availableLots.find((lot)=>`${lot.productId}|${lot.lotCode}`===lotKey)??availableLots[0];
  const total=saleTotalCop(Number(quantity),Number(unitPriceCop));

  function save(){
    if(!selected){setFeedback("No hay un lote con stock disponible en esta planta.");return;}
    const result=recordSale({plantId,customerName,productId:selected.productId,lotCode:selected.lotCode,quantity:Number(quantity),unitPriceCop:Number(unitPriceCop),note});
    if(!result.ok){setFeedback(result.error);return;}
    router.push("/sales");
  }

  return <section className="panel mx-auto max-w-3xl"><div className="section-head"><div><p className="eyebrow">Comercial · salida por lote</p><h1 className="text-3xl">Registrar venta</h1><p className="lede">La venta y la salida de inventario están ligadas. El total se deriva de cantidad × precio unitario.</p></div><Link className="button secondary" href="/sales">Cancelar</Link></div>
    <div className="grid gap-5 md:grid-cols-2">
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={plantId} onChange={(event)=>{setPlantId(event.target.value);setLotKey("");}}><option value="tamesis">Támesis</option><option value="yarumal">Yarumal</option></select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Lote con stock<select aria-label="Lote con stock" className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={selected?`${selected.productId}|${selected.lotCode}`:""} onChange={(event)=>setLotKey(event.target.value)} disabled={!availableLots.length}><option value="">Seleccionar lote</option>{availableLots.map((lot)=><option value={`${lot.productId}|${lot.lotCode}`} key={`${lot.productId}-${lot.lotCode}`}>{lot.lotCode} · {lot.productName} · {lot.quantity.toLocaleString("es-CO")} {lot.unit}</option>)}</select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Cliente<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={customerName} onChange={(event)=>setCustomerName(event.target.value)} placeholder="Nombre o razón social" /></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Cantidad vendida {selected?`(${selected.unit})`:""}<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={quantity} onChange={(event)=>setQuantity(event.target.value)} placeholder="Ej. 60" /></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Precio unitario COP {selected?`/ ${selected.unit}`:""}<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="numeric" value={unitPriceCop} onChange={(event)=>setUnitPriceCop(event.target.value)} placeholder="Ej. 2000" /></label>
      <div className="rounded-xl bg-[var(--surface-soft)] p-4"><span className="quiet">Disponible en lote</span><strong className="mt-1 block text-2xl">{selected?`${selected.quantity.toLocaleString("es-CO")} ${selected.unit}`:"—"}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{selected?.productName??"Sin stock disponible"}</span></div>
      <div className="rounded-xl bg-[var(--green-soft)] p-4"><span className="quiet">Total venta</span><strong className="mt-1 block text-2xl text-[var(--green-dark)]">{total>0?cop.format(total):"—"}</strong><span className="mt-1 block text-xs text-[var(--muted)]">Derivado; no editable</span></div>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Observación <span className="font-normal">(opcional)</span><textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={note} onChange={(event)=>setNote(event.target.value)} placeholder="Condición comercial o detalle operativo relevante" /></label>
    </div>
    {!availableLots.length&&<div className="mt-5 rounded-xl border border-dashed border-[var(--line)] p-4 text-xs text-[var(--muted)]">No hay stock disponible en esta planta. <Link className="font-semibold text-[var(--green)]" href="/production/new">Registrar producción</Link>.</div>}
    <div className="mt-5 rounded-xl border border-dashed border-[var(--line)] p-4 text-xs text-[var(--muted)]"><strong className="text-[var(--ink)]">Al guardar:</strong> la venta descuenta exactamente este lote. Pago, cartera, impuestos y margen todavía no están modelados.</div>
    {feedback&&<p role="alert" className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback}</p>}
    <div className="mt-6 flex justify-end"><button className="button primary" type="button" onClick={save} disabled={!availableLots.length}>Guardar venta y descontar inventario</button></div>
  </section>;
}
