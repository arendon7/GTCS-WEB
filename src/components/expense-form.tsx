"use client";

import Link from "next/link";
import { useMemo,useState } from "react";
import { useRouter } from "next/navigation";
import { useExpenseStore } from "@/components/expense-store";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { expenseCategories,expenseCategoryLabel,type ExpenseCategory,type ExpenseRecordType } from "@/lib/expense-domain";
import { bogotaDateKey } from "@/lib/time";

const cop=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0});

export function ExpenseForm(){
  const router=useRouter();
  const {recordExpense}=useExpenseStore();
  const {equipment}=useMaintenanceStore();
  const [plantId,setPlantId]=useState("tamesis");
  const [recordType,setRecordType]=useState<ExpenseRecordType>("purchase");
  const [supplierName,setSupplierName]=useState("");
  const [category,setCategory]=useState<ExpenseCategory>("maintenance");
  const [concept,setConcept]=useState("");
  const [amountCop,setAmountCop]=useState("");
  const [documentDate,setDocumentDate]=useState(()=>bogotaDateKey(new Date()));
  const [documentRef,setDocumentRef]=useState("");
  const [equipmentId,setEquipmentId]=useState("");
  const [processRef,setProcessRef]=useState("");
  const [evidenceRef,setEvidenceRef]=useState("");
  const [note,setNote]=useState("");
  const [feedback,setFeedback]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const availableEquipment=useMemo(()=>equipment.filter((item)=>item.plantId===plantId),[equipment,plantId]);
  const selectedEquipment=availableEquipment.find((item)=>item.id===equipmentId);
  const amount=Number(amountCop);

  async function save(){
    if(submitting)return;
    setSubmitting(true);setFeedback("");
    const result=await recordExpense({plantId,recordType,supplierName,category,concept,amountCop:amount,documentDate,documentRef,equipmentId:equipmentId||undefined,equipmentName:selectedEquipment?.name,processRef,evidenceRef,note});
    if(!result.ok){setFeedback(result.error);setSubmitting(false);return;}
    router.push("/expenses");
  }

  return <section className="panel mx-auto max-w-4xl">
    <div className="section-head"><div><p className="eyebrow">Administración · registro operacional</p><h1 className="text-3xl">Registrar compra o gasto</h1><p className="lede">Documenta el hecho económico sin inferir pago, caja ni costo de producción.</p></div><Link className="button secondary" href="/expenses">Cancelar</Link></div>
    <div className="grid gap-5 md:grid-cols-2">
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Tipo<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={recordType} onChange={(event)=>setRecordType(event.target.value as ExpenseRecordType)} disabled={submitting}><option value="purchase">Compra</option><option value="expense">Gasto</option></select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={plantId} onChange={(event)=>{setPlantId(event.target.value);setEquipmentId("");}} disabled={submitting}><option value="tamesis">Támesis</option><option value="yarumal">Yarumal</option></select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Proveedor<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={supplierName} onChange={(event)=>setSupplierName(event.target.value)} placeholder="Nombre o razón social" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Categoría<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={category} onChange={(event)=>setCategory(event.target.value as ExpenseCategory)} disabled={submitting}>{expenseCategories.map((item)=><option key={item} value={item}>{expenseCategoryLabel[item]}</option>)}</select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Fecha del documento<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" type="date" value={documentDate} onChange={(event)=>setDocumentDate(event.target.value)} disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Concepto<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={concept} onChange={(event)=>setConcept(event.target.value)} placeholder="Ej. Rodamiento para molino" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Monto COP<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="numeric" value={amountCop} onChange={(event)=>setAmountCop(event.target.value)} placeholder="Ej. 185000" disabled={submitting}/></label>
      <div className="rounded-xl bg-[var(--green-soft)] p-4"><span className="quiet">Monto registrado</span><strong className="mt-1 block text-2xl text-[var(--green-dark)]">{Number.isFinite(amount)&&amount>0?cop.format(amount):"—"}</strong><span className="mt-1 block text-xs text-[var(--muted)]">No implica pago efectuado</span></div>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Referencia documento <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={documentRef} onChange={(event)=>setDocumentRef(event.target.value)} placeholder="Factura, cuenta o soporte" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Equipo relacionado <span className="font-normal">(opcional)</span><select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={equipmentId} onChange={(event)=>setEquipmentId(event.target.value)} disabled={submitting}><option value="">Sin equipo</option>{availableEquipment.map((item)=><option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Proceso relacionado <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={processRef} onChange={(event)=>setProcessRef(event.target.value)} placeholder="Ej. Compostaje, digestión" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Evidencia / referencia <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={evidenceRef} onChange={(event)=>setEvidenceRef(event.target.value)} placeholder="URL o referencia documental" disabled={submitting}/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Observación <span className="font-normal">(opcional)</span><textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={note} onChange={(event)=>setNote(event.target.value)} placeholder="Detalle operacional relevante" disabled={submitting}/></label>
    </div>
    <div className="mt-5 rounded-xl border border-dashed border-[var(--line)] p-4 text-xs text-[var(--muted)]"><strong className="text-[var(--ink)]">Semántica:</strong> este registro documenta una compra o gasto. No marca una obligación como pagada, no mueve inventario y no asigna costo a un lote o producto.</div>
    {feedback&&<p role="alert" className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback}</p>}
    <div className="mt-6 flex justify-end"><button className="button primary" type="button" onClick={()=>void save()} disabled={submitting}>{submitting?"Guardando registro…":"Guardar compra o gasto"}</button></div>
  </section>;
}
