"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompostStore } from "@/components/compost-store";
import { useInventoryStore } from "@/components/inventory-store";
import { useOpsStore } from "@/components/ops-store";
import { operationalWritePlantOptions } from "@/lib/ops-write-access";

export function ProductionForm(){
  const router=useRouter();
  const {piles}=useCompostStore();
  const {products,recordProduction}=useInventoryStore();
  const {access,backend}=useOpsStore();
  const [plantId,setPlantId]=useState("tamesis");
  const availableProducts=products.filter((item)=>item.active);
  const [productId,setProductId]=useState("");
  const [quantity,setQuantity]=useState("");
  const [sourceProcess,setSourceProcess]=useState("");
  const [sourcePileId,setSourcePileId]=useState("");
  const [note,setNote]=useState("");
  const [feedback,setFeedback]=useState("");
  const [busy,setBusy]=useState(false);
  const remoteMode=backend.mode==="supabase";
  const plantOptions=useMemo(()=>operationalWritePlantOptions(remoteMode,access),[access,remoteMode]);
  const effectivePlantId=plantOptions.some((plant)=>plant.id===plantId)?plantId:plantOptions[0]?.id??"";
  const effectiveProductId=availableProducts.some((item)=>item.id===productId)?productId:availableProducts[0]?.id??"";
  const product=products.find((item)=>item.id===effectiveProductId);
  const closedPiles=useMemo(()=>piles.filter((pile)=>pile.plantId===effectivePlantId&&pile.status==="closed"),[piles,effectivePlantId]);

  async function save(){
    if(busy||!effectivePlantId)return;
    setBusy(true);setFeedback("");
    try{
      const result=await recordProduction({plantId:effectivePlantId,productId:effectiveProductId,quantity:Number(quantity),sourceProcess,sourcePileId:sourcePileId||undefined,note});
      if(!result.ok){setFeedback(result.error);return;}
      router.push("/production");
    }finally{setBusy(false);}
  }

  if(remoteMode&&!plantOptions.length)return <section className="panel mx-auto max-w-3xl"><div className="section-head"><div><p className="eyebrow">Producto terminado</p><h1 className="text-3xl">Registrar producción</h1><p className="lede">Tu sesión puede consultar producción, pero no tiene permiso para registrar producto terminado en las plantas visibles.</p></div><Link className="button secondary" href="/production">Volver a producción</Link></div><p className="rounded-xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted)]">Modo solo lectura. Solicita un rol operacional autorizado en la planta correspondiente si necesitas registrar producción.</p></section>;

  return <section className="panel mx-auto max-w-3xl"><div className="section-head"><div><p className="eyebrow">Producto terminado</p><h1 className="text-3xl">Registrar producción</h1><p className="lede">La cantidad se registra como medición independiente. La referencia vigente y el origen quedan congelados en el registro; una pila relacionada nunca copia su peso.</p></div><Link className="button secondary" href="/production">Cancelar</Link></div>
    <div className="grid gap-5 md:grid-cols-2">
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={effectivePlantId} disabled={!plantOptions.length} onChange={(event)=>{setPlantId(event.target.value);setSourcePileId("");}}>{plantOptions.map((plant)=><option value={plant.id} key={plant.id}>{plant.name}</option>)}</select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Producto<select aria-label="Producto terminado" className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={effectiveProductId} disabled={!availableProducts.length} onChange={(event)=>setProductId(event.target.value)}>{availableProducts.map((item)=><option value={item.id} key={item.id}>{item.referenceCode?`${item.referenceCode} · `:""}{item.name} · {item.unit}</option>)}</select>{product&&!product.referenceCode&&<span className="font-normal text-[10px]">Este producto aún no tiene referencia canónica; la producción puede registrarse sin inventarla.</span>}</label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Cantidad producida ({product?.unit ?? "unidad"})<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={quantity} onChange={(event)=>setQuantity(event.target.value)} placeholder="Ej. 250" /></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Proceso fuente<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={sourceProcess} onChange={(event)=>setSourceProcess(event.target.value)} placeholder="Ej. Formulación / peletizado" /></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Pila cerrada relacionada <span className="font-normal">(opcional)</span><select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={sourcePileId} onChange={(event)=>setSourcePileId(event.target.value)}><option value="">Origen por proceso · sin pila relacionada</option>{closedPiles.map((pile)=><option value={pile.id} key={pile.id}>{pile.code} · {pile.finalWeightKg?.toLocaleString("es-CO")} kg finales</option>)}</select><span className="font-normal text-[10px]">Solo se muestran pilas cerradas de la planta seleccionada. Relacionar una pila crea trazabilidad, no transferencia automática de masa.</span></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Observación <span className="font-normal">(opcional)</span><textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={note} onChange={(event)=>setNote(event.target.value)} placeholder="Detalle de formulación, empaque o novedad relevante" /></label>
    </div>
    <div className="mt-5 rounded-xl border border-dashed border-[var(--line)] p-4 text-xs text-[var(--muted)]"><strong className="text-[var(--ink)]">Al guardar:</strong> se genera un lote de producto y una entrada al kardex por exactamente la cantidad registrada.</div>
    {feedback && <p role="alert" className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback}</p>}
    <div className="mt-6 flex justify-end"><button className="button primary" type="button" onClick={save} disabled={busy||!plantOptions.length||!availableProducts.length}>{busy?"Guardando producción…":"Guardar producción y entrar a inventario"}</button></div>
  </section>;
}
