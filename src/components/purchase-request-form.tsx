"use client";

import Link from "next/link";
import { useMemo,useState } from "react";
import { useRouter } from "next/navigation";
import { usePurchaseRequestStore } from "@/components/purchase-request-store";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { expenseCategories,expenseCategoryLabel,type ExpenseCategory } from "@/lib/expense-domain";

const cop=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0});

export function PurchaseRequestForm(){
  const router=useRouter();const {submitRequest}=usePurchaseRequestStore();const {equipment}=useMaintenanceStore();
  const [plantId,setPlantId]=useState("tamesis");const [requestedBy,setRequestedBy]=useState("");const [category,setCategory]=useState<ExpenseCategory>("maintenance");const [concept,setConcept]=useState("");const [justification,setJustification]=useState("");const [estimatedAmount,setEstimatedAmount]=useState("");const [neededBy,setNeededBy]=useState("");const [suggestedSupplier,setSuggestedSupplier]=useState("");const [equipmentId,setEquipmentId]=useState("");const [processRef,setProcessRef]=useState("");const [evidenceRef,setEvidenceRef]=useState("");const [feedback,setFeedback]=useState("");const [submitting,setSubmitting]=useState(false);
  const availableEquipment=useMemo(()=>equipment.filter((item)=>item.plantId===plantId),[equipment,plantId]);const selectedEquipment=availableEquipment.find((item)=>item.id===equipmentId);const estimate=Number(estimatedAmount);

  async function save(){if(submitting)return;setSubmitting(true);setFeedback("");const result=await submitRequest({plantId,requestedBy,category,concept,justification,estimatedAmountCop:estimate,neededBy,suggestedSupplier,equipmentId:equipmentId||undefined,equipmentName:selectedEquipment?.name,processRef,evidenceRef});if(!result.ok){setFeedback(result.error);setSubmitting(false);return;}router.push("/purchases");}

  return <section className="panel mx-auto max-w-4xl">
    <div className="section-head"><div><p className="eyebrow">Necesidad operacional</p><h1 className="text-3xl">Nueva solicitud de compra</h1><p className="lede">Solicita aprobación antes de registrar la compra real. El valor aquí es una estimación, no un gasto ejecutado.</p></div><Link className="button secondary" href="/purchases">Cancelar</Link></div>
    <div className="grid gap-5 md:grid-cols-2">
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={plantId} onChange={(event)=>{setPlantId(event.target.value);setEquipmentId("");}} disabled={submitting}><option value="tamesis">Támesis</option><option value="yarumal">Yarumal</option></select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Solicita<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={requestedBy} onChange={(event)=>setRequestedBy(event.target.value)} placeholder="Nombre responsable" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Categoría<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={category} onChange={(event)=>setCategory(event.target.value as ExpenseCategory)} disabled={submitting}>{expenseCategories.map((item)=><option value={item} key={item}>{expenseCategoryLabel[item]}</option>)}</select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Se necesita para <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" type="date" value={neededBy} onChange={(event)=>setNeededBy(event.target.value)} disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Qué se necesita<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={concept} onChange={(event)=>setConcept(event.target.value)} placeholder="Ej. Rodamiento para molino" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Justificación<textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={justification} onChange={(event)=>setJustification(event.target.value)} placeholder="Por qué se necesita y qué impacto evita o resuelve" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Monto estimado COP<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="numeric" value={estimatedAmount} onChange={(event)=>setEstimatedAmount(event.target.value)} placeholder="Ej. 200000" disabled={submitting}/></label>
      <div className="rounded-xl bg-[var(--surface-soft)] p-4"><span className="quiet">Estimación para aprobar</span><strong className="mt-1 block text-2xl">{Number.isFinite(estimate)&&estimate>0?cop.format(estimate):"—"}</strong><span className="mt-1 block text-xs text-[var(--muted)]">No entra a gastos ni Finanzas</span></div>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Proveedor sugerido <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={suggestedSupplier} onChange={(event)=>setSuggestedSupplier(event.target.value)} placeholder="Puede cambiar al comprar" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Equipo relacionado <span className="font-normal">(opcional)</span><select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={equipmentId} onChange={(event)=>setEquipmentId(event.target.value)} disabled={submitting}><option value="">Sin equipo</option>{availableEquipment.map((item)=><option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Proceso <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={processRef} onChange={(event)=>setProcessRef(event.target.value)} placeholder="Ej. Compostaje" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Evidencia / referencia <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={evidenceRef} onChange={(event)=>setEvidenceRef(event.target.value)} placeholder="Foto, cotización o referencia" disabled={submitting}/></label>
    </div>
    <div className="mt-5 rounded-xl border border-dashed border-[var(--line)] p-4 text-xs text-[var(--muted)]"><strong className="text-[var(--ink)]">Al enviar:</strong> nace una solicitud pendiente. No se crea compra, gasto, pago ni movimiento de inventario.</div>
    {feedback&&<p role="alert" className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback}</p>}
    <div className="mt-6 flex justify-end"><button className="button primary" type="button" onClick={()=>void save()} disabled={submitting}>{submitting?"Enviando solicitud…":"Enviar solicitud"}</button></div>
  </section>;
}
