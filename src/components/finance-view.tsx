"use client";

import Link from "next/link";
import { useMemo,useState } from "react";
import { useCommercialStore } from "@/components/commercial-store";
import { useExpenseStore } from "@/components/expense-store";
import { buildCommercialAnalytics,commercialAnalyticsCsvSection,type CommercialRanked } from "@/lib/commercial-analytics";
import { buildExpenseAnalytics,expenseAnalyticsCsvSection,type ExpenseRanked } from "@/lib/expense-analytics";
import { resolveDashboardPeriod,type DashboardPreset,type PlantFilter } from "@/lib/analytics";
import { bogotaDateKey,bogotaTime } from "@/lib/time";

const cop=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0});
const presetLabel:Record<DashboardPreset,string>={day:"Día",week:"Semana",month:"Mes",history:"Histórico"};

function MoneyRows({items,empty}:{items:Array<{id:string;label:string;amountCop:number;recordsCount:number}>;empty:string}){
  if(!items.length)return <p className="quiet rounded-lg bg-[var(--surface-soft)] p-3">{empty}</p>;
  return <div className="grid gap-1">{items.slice(0,7).map((item)=><div className="flex items-center justify-between gap-3 border-t border-[var(--line)] py-3 first:border-t-0" key={item.id}><span><strong className="block text-xs">{item.label}</strong><small className="text-[var(--muted)]">{item.recordsCount} registro{item.recordsCount===1?"":"s"}</small></span><strong className="text-sm">{cop.format(item.amountCop)}</strong></div>)}</div>;
}

function CommercialMoneyRows({items,empty}:{items:CommercialRanked[];empty:string}){
  const rows=items.map((item)=>({id:item.id,label:item.label,amountCop:item.grossCop,recordsCount:item.salesCount}));
  return <MoneyRows items={rows} empty={empty}/>;
}

function ExpenseMoneyRows({items,empty}:{items:ExpenseRanked[];empty:string}){return <MoneyRows items={items} empty={empty}/>;}

export function FinanceView({initialDateKey}:{initialDateKey:string}){
  const {sales}=useCommercialStore();
  const {expenses}=useExpenseStore();
  const [preset,setPreset]=useState<DashboardPreset>("month");
  const [anchorKey,setAnchorKey]=useState(initialDateKey);
  const [plantId,setPlantId]=useState<PlantFilter>("all");
  const historyKeys=useMemo(()=>[
    ...sales.map((item)=>bogotaDateKey(item.soldAt)),
    ...expenses.map((item)=>item.documentDate),
  ].sort(),[sales,expenses]);
  const period=useMemo(()=>resolveDashboardPeriod(preset,anchorKey,historyKeys),[preset,anchorKey,historyKeys]);
  const commercial=useMemo(()=>buildCommercialAnalytics({sales,period,plantId}),[sales,period,plantId]);
  const expense=useMemo(()=>buildExpenseAnalytics({records:expenses,period,plantId}),[expenses,period,plantId]);
  const combinedEvents=useMemo(()=>[...commercial.events,...expense.events].sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime()),[commercial.events,expense.events]);
  const csv=useMemo(()=>`${commercialAnalyticsCsvSection(commercial)}\n\n${expenseAnalyticsCsvSection(expense)}`,[commercial,expense]);

  function exportCsv(){const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download=`greenatics-economia-${period.startKey}-${period.endKey}.csv`;document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);}

  return <>
    <header className="page-header"><div><p className="eyebrow">Gerencia · lectura económica</p><h1>Finanzas</h1><p className="lede">Facturación bruta y compras/gastos registrados desde transacciones canónicas, sin convertir su diferencia en utilidad, caja o margen.</p></div><div className="header-actions"><Link className="button secondary" href="/sales">Ventas</Link><Link className="button secondary" href="/expenses">Compras/Gastos</Link><button className="button primary" type="button" onClick={exportCsv}>Exportar CSV</button></div></header>

    <section className="panel mb-4"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="eyebrow">Periodo económico</p><strong className="mt-1 block text-lg capitalize">{period.label}</strong></div><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="segmented" aria-label="Horizonte financiero">{(["day","week","month","history"] as DashboardPreset[]).map((item)=><button type="button" key={item} className={preset===item?"active":""} onClick={()=>setPreset(item)}>{presetLabel[item]}</button>)}</div>{preset!=="history"&&<label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Fecha<input className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm normal-case text-[var(--ink)]" type="date" value={anchorKey} onChange={(event)=>setAnchorKey(event.target.value)}/></label>}<label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Planta<select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm normal-case text-[var(--ink)]" value={plantId} onChange={(event)=>setPlantId(event.target.value)}><option value="all">Todas</option><option value="tamesis">Támesis</option><option value="yarumal">Yarumal</option></select></label></div></div></section>

    <div className="grid gap-4 xl:grid-cols-2">
      <section className="panel" aria-label="Flujo comercial"><div className="section-head"><div><p className="eyebrow">Comercial</p><h2>Facturación bruta registrada</h2></div><Link className="text-xs font-semibold text-[var(--green)]" href="/sales">Abrir ventas</Link></div><strong className="block text-3xl tracking-tight">{cop.format(commercial.grossBillingCop)}</strong><p className="quiet mt-1">{commercial.salesCount} venta{commercial.salesCount===1?"":"s"} · ticket promedio {commercial.salesCount?cop.format(commercial.averageTicketCop):"—"}</p><div className="mt-5"><span className="quiet">Cantidad física vendida</span>{commercial.soldByUnit.length?<div className="mt-2 grid gap-2 sm:grid-cols-3">{commercial.soldByUnit.map((item)=><div className="rounded-lg bg-[var(--surface-soft)] p-3" key={item.unit}><strong className="block text-lg">{item.quantity.toLocaleString("es-CO",{maximumFractionDigits:2})}</strong><span className="quiet">{item.unit}</span></div>)}</div>:<p className="quiet mt-2">Sin ventas en el periodo.</p>}</div></section>
      <section className="panel" aria-label="Flujo de gastos"><div className="section-head"><div><p className="eyebrow">Operación / administración</p><h2>Compras y gastos registrados</h2></div><Link className="text-xs font-semibold text-[var(--green)]" href="/expenses">Abrir registros</Link></div><strong className="block text-3xl tracking-tight">{cop.format(expense.totalRegisteredCop)}</strong><p className="quiet mt-1">{expense.recordsCount} registro{expense.recordsCount===1?"":"s"} · promedio {expense.recordsCount?cop.format(expense.averageRecordCop):"—"}</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{expense.byRecordType.length?expense.byRecordType.map((item)=><div className="rounded-lg bg-[var(--surface-soft)] p-3" key={item.recordType}><span className="quiet">{item.label}</span><strong className="mt-1 block text-lg">{cop.format(item.amountCop)}</strong><small className="text-[var(--muted)]">{item.recordsCount} registro{item.recordsCount===1?"":"s"}</small></div>):<p className="quiet">Sin compras/gastos en el periodo.</p>}</div></section>
    </div>

    <div className="mt-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-4 text-xs text-[var(--muted)]" role="note"><strong className="text-[var(--ink)]">Lectura correcta:</strong> estos dos valores no se restan para producir un resultado financiero. Facturación no significa recaudo; gasto registrado no significa pago ni costo asignado.</div>

    <div className="mt-4 grid gap-4 xl:grid-cols-2"><section className="panel"><div className="section-head"><div><p className="eyebrow">Ventas</p><h2>Clientes por facturación</h2></div></div><CommercialMoneyRows items={commercial.customers} empty="Sin clientes con ventas en el periodo."/></section><section className="panel"><div className="section-head"><div><p className="eyebrow">Ventas</p><h2>Productos por facturación</h2></div></div><CommercialMoneyRows items={commercial.products} empty="Sin productos vendidos en el periodo."/></section></div>

    <div className="mt-4 grid gap-4 xl:grid-cols-2"><section className="panel"><div className="section-head"><div><p className="eyebrow">Gasto registrado</p><h2>Categorías</h2></div></div><ExpenseMoneyRows items={expense.categories} empty="Sin categorías con gasto en el periodo."/></section><section className="panel"><div className="section-head"><div><p className="eyebrow">Gasto registrado</p><h2>Proveedores</h2></div></div><ExpenseMoneyRows items={expense.suppliers} empty="Sin proveedores con gasto en el periodo."/></section></div>

    <section className="panel mt-4"><div className="section-head"><div><p className="eyebrow">Trazabilidad económica</p><h2>Eventos del periodo</h2></div><span className="quiet">{combinedEvents.length} eventos</span></div>{combinedEvents.length?<div className="grid gap-1">{combinedEvents.map((event)=><div className="grid grid-cols-[62px_1fr] gap-3 border-t border-[var(--line)] py-3 first:border-t-0" key={event.id}><time className="text-[11px] font-semibold text-[var(--muted)]">{bogotaTime.format(new Date(event.at))}</time><div><div className="flex flex-wrap items-center gap-2"><strong className="text-xs">{event.title}</strong><span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--muted)]">{event.plant}</span></div><span className="mt-1 block text-[11px] text-[var(--muted)]">{event.detail}</span></div></div>)}</div>:<p className="quiet">Sin eventos económicos para el periodo.</p>}</section>
  </>;
}
