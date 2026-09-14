"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useInventoryStore } from "@/components/inventory-store";
import { useOpsStore } from "@/components/ops-store";
import { stockForLot } from "@/lib/inventory-domain";

const RECONCILIATION_ROLES = new Set(["supervisor","technical","admin","director"]);

export function InventoryReconciliationForm(){
  const router=useRouter();
  const {products,movements,reconcile}=useInventoryStore();
  const {access,backend}=useOpsStore();
  const [plantId,setPlantId]=useState("tamesis");
  const [lotKey,setLotKey]=useState("");
  const [counted,setCounted]=useState("");
  const [note,setNote]=useState("");
  const [evidence,setEvidence]=useState("");
  const [feedback,setFeedback]=useState("");
  const [busy,setBusy]=useState(false);

  const plantOptions=useMemo(()=>backend.mode==="supabase"
    ? access.filter((plant)=>RECONCILIATION_ROLES.has(plant.role)).map((plant)=>({id:plant.plantId,name:plant.name}))
    : [{id:"tamesis",name:"Támesis"},{id:"yarumal",name:"Yarumal"}],[access,backend.mode]);
  const effectivePlantId=plantOptions.some((plant)=>plant.id===plantId)?plantId:plantOptions[0]?.id??"";
  const productMap=useMemo(()=>new Map(products.map((product)=>[product.id,product])),[products]);
  const lotOptions=useMemo(()=>{
    const seen=new Set<string>();
    return movements
      .filter((movement)=>movement.plantId===effectivePlantId)
      .flatMap((movement)=>{
        const key=`${movement.productId}|${movement.lotCode}`;
        if(seen.has(key))return [];
        seen.add(key);
        const product=productMap.get(movement.productId);
        if(!product)return [];
        return [{key,productId:movement.productId,productName:product.name,unit:product.unit,lotCode:movement.lotCode,expected:stockForLot(movements,effectivePlantId,movement.productId,movement.lotCode)}];
      })
      .sort((a,b)=>a.productName.localeCompare(b.productName,"es")||a.lotCode.localeCompare(b.lotCode,"es"));
  },[effectivePlantId,movements,productMap]);
  const selected=lotOptions.find((lot)=>lot.key===lotKey)??lotOptions[0];
  const countedNumber=Number(counted);
  const hasValidCount=counted.trim()!==""&&Number.isFinite(countedNumber)&&countedNumber>=0;
  const difference=selected&&hasValidCount?countedNumber-selected.expected:undefined;

  async function save(){
    if(busy)return;
    if(!effectivePlantId){setFeedback("No tienes un rol autorizado para conciliar inventario.");return;}
    if(!selected){setFeedback("No existe un lote físico para conciliar en esta planta.");return;}
    if(!hasValidCount){setFeedback("Ingresa un conteo físico válido, igual o mayor que cero.");return;}
    if(!note.trim()){setFeedback("Registra la observación del conteo físico.");return;}
    setBusy(true);setFeedback("");
    try{
      const result=await reconcile({
        plantId:effectivePlantId,
        productId:selected.productId,
        lotCode:selected.lotCode,
        countedQuantity:countedNumber,
        note,
        evidenceUrls:evidence.split(/\r?\n/).map((value)=>value.trim()).filter(Boolean),
      });
      if(!result.ok){setFeedback(result.error);return;}
      router.push("/inventory");
    }finally{setBusy(false);}
  }

  return <section className="panel mx-auto max-w-3xl">
    <div className="section-head"><div><p className="eyebrow">Inventario · control físico</p><h1 className="text-3xl">Conciliar inventario</h1><p className="lede">Compara el saldo esperado del kardex con el conteo físico. La diferencia queda congelada y genera un único ajuste trazable cuando corresponde.</p></div><Link className="button secondary" href="/inventory">Cancelar</Link></div>
    {!plantOptions.length?<div className="rounded-xl border border-dashed border-[var(--line)] p-5 text-sm text-[var(--muted)]">Tu rol actual puede consultar inventario, pero no ejecutar conciliaciones físicas.</div>:<>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={effectivePlantId} onChange={(event)=>{setPlantId(event.target.value);setLotKey("");setCounted("");}}>{plantOptions.map((plant)=><option value={plant.id} key={plant.id}>{plant.name}</option>)}</select></label>
        <label className="grid min-w-0 gap-2 text-xs font-bold text-[var(--muted)]">Lote físico<select aria-label="Lote físico" className="min-h-11 w-full min-w-0 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={selected?.key??""} onChange={(event)=>{setLotKey(event.target.value);setCounted("");}} disabled={!lotOptions.length}>{lotOptions.map((lot)=><option value={lot.key} key={lot.key}>{lot.lotCode} · {lot.productName} · esperado {lot.expected.toLocaleString("es-CO")} {lot.unit}</option>)}</select></label>
        <div className="rounded-xl bg-[var(--surface-soft)] p-4"><span className="quiet">Saldo esperado por kardex</span><strong className="mt-1 block text-2xl">{selected?`${selected.expected.toLocaleString("es-CO")} ${selected.unit}`:"—"}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{selected?.lotCode??"Sin lote seleccionado"}</span></div>
        <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Conteo físico {selected?`(${selected.unit})`:""}<input aria-label="Conteo físico" className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={counted} onChange={(event)=>setCounted(event.target.value)} placeholder="Ej. 185" /></label>
        <div className="rounded-xl border border-[var(--line)] p-4 md:col-span-2"><span className="quiet">Diferencia preliminar</span><strong className="mt-1 block text-xl">{difference===undefined?"—":`${difference>0?"+":""}${difference.toLocaleString("es-CO")} ${selected?.unit??""}`}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{difference===0?"Sin ajuste: el conteo coincide con el kardex.":difference===undefined?"Ingresa el conteo físico.":"Al guardar, esta diferencia se convertirá en un ajuste append-only referenciado a la conciliación."}</span></div>
        <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Observación del conteo<textarea aria-label="Observación del conteo" className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={note} onChange={(event)=>setNote(event.target.value)} placeholder="Método de conteo, causa probable de diferencia o contexto operativo" /></label>
        <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Evidencias <span className="font-normal">(opcional, una referencia o URL por línea)</span><textarea aria-label="Evidencias" className="min-h-20 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={evidence} onChange={(event)=>setEvidence(event.target.value)} placeholder="https://…\nevidencia://acta-conteo" /></label>
      </div>
      {!lotOptions.length&&<div className="mt-5 rounded-xl border border-dashed border-[var(--line)] p-4 text-xs text-[var(--muted)]">No hay lotes registrados para esta planta. Primero debe existir una entrada real en el kardex.</div>}
      {feedback&&<p role="alert" className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback}</p>}
      <div className="mt-6 flex justify-end"><button className="button primary" type="button" onClick={save} disabled={busy||!lotOptions.length}>{busy?"Conciliando…":"Guardar conciliación"}</button></div>
    </>}
  </section>;
}
