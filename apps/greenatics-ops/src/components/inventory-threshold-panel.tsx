"use client";

import { useMemo, useState } from "react";
import { useInventoryStore } from "@/components/inventory-store";
import { useOpsStore } from "@/components/ops-store";

const POLICY_ROLES=new Set(["technical","admin","director"]);

export function InventoryThresholdPanel(){
  const {products,thresholds,setStockThreshold}=useInventoryStore();
  const {backend,access}=useOpsStore();
  const [plantId,setPlantId]=useState("tamesis");
  const [productId,setProductId]=useState("");
  const [minimum,setMinimum]=useState("");
  const [note,setNote]=useState("");
  const [feedback,setFeedback]=useState("");
  const [busy,setBusy]=useState(false);
  const activeProducts=products.filter((product)=>product.active);
  const plantOptions=useMemo(()=>backend.mode==="supabase"
    ? access.filter((plant)=>POLICY_ROLES.has(plant.role)).map((plant)=>({id:plant.plantId,name:plant.name}))
    : [{id:"tamesis",name:"Támesis"},{id:"yarumal",name:"Yarumal"}],[access,backend.mode]);
  const effectivePlantId=plantOptions.some((plant)=>plant.id===plantId)?plantId:plantOptions[0]?.id??"";
  const effectiveProductId=activeProducts.some((product)=>product.id===productId)?productId:activeProducts[0]?.id??"";
  const product=activeProducts.find((item)=>item.id===effectiveProductId);
  const current=thresholds.find((item)=>item.plantId===effectivePlantId&&item.productId===effectiveProductId);

  async function save(){
    if(busy||!effectivePlantId||!effectiveProductId)return;
    const clean=minimum.trim();
    const minimumQuantity=clean===""?undefined:Number(clean);
    setBusy(true);setFeedback("");
    try{
      const result=await setStockThreshold({plantId:effectivePlantId,productId:effectiveProductId,minimumQuantity,note});
      if(!result.ok){setFeedback(result.error);return;}
      setMinimum("");setNote("");
      setFeedback(minimumQuantity===undefined?"Umbral desactivado mediante una nueva revisión.":"Umbral guardado como nueva revisión de política.");
    }finally{setBusy(false);}
  }

  return <section className="panel mt-4">
    <div className="section-head"><div><p className="eyebrow">Política de stock</p><h2>Umbrales de inventario</h2><p className="quiet mt-1">Definen criticidad por planta y producto. No modifican el kardex ni el stock físico.</p></div><span className="quiet">{thresholds.filter((item)=>item.configured).length} configurados</span></div>
    {thresholds.length?<div className="grid gap-2 md:grid-cols-2">{thresholds.map((item)=><article className="rounded-xl border border-[var(--line)] p-3" key={`${item.plantId}-${item.productId}`}><strong className="block text-xs">{item.productName} · {item.plant}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{item.configured&&item.minimumQuantity!==undefined?`Mínimo ${item.minimumQuantity.toLocaleString("es-CO")} ${item.unit}`:"Sin umbral vigente"}</span><span className="mt-1 block text-[10px] text-[var(--muted)]">{item.note}</span></article>)}</div>:<div className="rounded-xl border border-dashed border-[var(--line)] p-5 text-sm text-[var(--muted)]">Aún no existen revisiones de umbral. El Dashboard mostrará estos inventarios como <strong>sin umbral</strong>, no como normales.</div>}
    {plantOptions.length&&activeProducts.length?<div className="mt-5 grid gap-3 border-t border-[var(--line)] pt-4 md:grid-cols-2">
      <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Planta<select aria-label="Planta umbral" className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={effectivePlantId} onChange={(event)=>{setPlantId(event.target.value);setMinimum("");setNote("");}}>{plantOptions.map((plant)=><option key={plant.id} value={plant.id}>{plant.name}</option>)}</select></label>
      <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Producto<select aria-label="Producto umbral" className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={effectiveProductId} onChange={(event)=>{setProductId(event.target.value);setMinimum("");setNote("");}}>{activeProducts.map((item)=><option key={item.id} value={item.id}>{item.name} · {item.unit}</option>)}</select></label>
      <div className="rounded-lg bg-[var(--surface-soft)] p-3 text-xs md:col-span-2"><span className="quiet">Política vigente</span><strong className="mt-1 block">{current?.configured&&current.minimumQuantity!==undefined?`${current.minimumQuantity.toLocaleString("es-CO")} ${current.unit}`:"Sin umbral configurado"}</strong>{current&&<span className="mt-1 block text-[10px] text-[var(--muted)]">Última revisión: {current.note}</span>}</div>
      <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Nuevo mínimo {product?`(${product.unit})`:""}<input aria-label="Mínimo de inventario" className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={minimum} onChange={(event)=>setMinimum(event.target.value)} placeholder="Vacío = desactivar umbral" /></label>
      <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Motivo / criterio<input aria-label="Motivo del umbral" className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={note} onChange={(event)=>setNote(event.target.value)} placeholder="Ej. stock mínimo operativo validado" /></label>
      <div className="flex items-center justify-between gap-3 md:col-span-2"><span className="text-[10px] text-[var(--muted)]">Guardar siempre crea una nueva revisión; nunca reescribe la política anterior.</span><button className="button secondary" type="button" disabled={busy} onClick={save}>{busy?"Guardando…":"Guardar revisión"}</button></div>
      {feedback&&<p role="status" className="text-xs text-[var(--muted)] md:col-span-2">{feedback}</p>}
    </div>:<p className="mt-4 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">Tu rol puede consultar los umbrales, pero no definir política de inventario.</p>}
  </section>;
}
