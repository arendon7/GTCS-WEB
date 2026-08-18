"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useOpsStore } from "@/components/ops-store";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { useCompostStore } from "@/components/compost-store";
import { useInventoryStore } from "@/components/inventory-store";
import { useCommercialStore } from "@/components/commercial-store";
import { useExpenseStore } from "@/components/expense-store";
import { buildOperationalAnalytics, analyticsCsv, type DashboardPreset } from "@/lib/analytics";
import { buildInventoryAnalytics, buildInventoryCriticality, inventoryAnalyticsCsvSection } from "@/lib/inventory-analytics";
import { buildCommercialAnalytics, commercialAnalyticsCsvSection } from "@/lib/commercial-analytics";
import { buildExpenseAnalytics, expenseAnalyticsCsvSection } from "@/lib/expense-analytics";
import { bogotaDateKey } from "@/lib/time";

const KPI_GRID_CLASS = "grid gap-3 md:grid-cols-3 2xl:grid-cols-6";

function formatMass(kg:number){return kg>=1000?`${(kg/1000).toFixed(2)} t`:`${kg.toLocaleString("es-CO",{maximumFractionDigits:0})} kg`;}
function formatHours(hours:number){return `${hours.toLocaleString("es-CO",{maximumFractionDigits:1})} h`;}
function formatMinutes(minutes:number){return minutes>=60?`${(minutes/60).toLocaleString("es-CO",{maximumFractionDigits:1})} h`:`${minutes.toLocaleString("es-CO",{maximumFractionDigits:0})} min`;}
function formatMoney(value:number){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(value);}
function downloadText(filename:string,content:string){const blob=new Blob([content],{type:"text/csv;charset=utf-8"});const href=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=href;anchor.download=filename;anchor.click();URL.revokeObjectURL(href);}

function KpiCard({label,value,meta,intent="neutral"}:{label:string;value:string;meta:string;intent?:"neutral"|"warning"|"danger"}){
  return <article className={`rounded-xl border p-4 ${intent==="danger"?"border-red-200 bg-red-50":intent==="warning"?"border-amber-200 bg-amber-50":"border-[var(--line)] bg-white"}`}><span className="quiet">{label}</span><strong className="mt-2 block text-2xl">{value}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{meta}</span></article>;
}

function UnitChips({items}:{items:Array<{unit:string;quantity:number}>}){
  if(!items.length)return <span className="quiet">Sin datos</span>;
  return <div className="flex flex-wrap gap-2">{items.map((item)=><span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold" key={item.unit}>{item.quantity.toLocaleString("es-CO",{maximumFractionDigits:2})} {item.unit}</span>)}</div>;
}

export function IntegratedDashboardView({initialNowIso}:{initialNowIso:string}){
  const {activities,receptions,incidents,workers,access}=useOpsStore();
  const {tickets,equipment}=useMaintenanceStore();
  const {piles,measurements}=useCompostStore();
  const {products,productions,movements,thresholds}=useInventoryStore();
  const {sales}=useCommercialStore();
  const {expenses}=useExpenseStore();
  const [nowIso,setNowIso]=useState(initialNowIso);
  const [preset,setPreset]=useState<DashboardPreset>("day");
  const [anchorKey,setAnchorKey]=useState(()=>bogotaDateKey(initialNowIso));
  const [plantId,setPlantId]=useState("all");

  useEffect(()=>{
    const timer=window.setInterval(()=>setNowIso(new Date().toISOString()),60_000);
    return()=>window.clearInterval(timer);
  },[]);

  const plantOptions=useMemo(()=>[{id:"all",name:"Todas"},...access.map((plant)=>({id:plant.plantId,name:plant.name}))],[access]);
  const analytics=useMemo(()=>buildOperationalAnalytics({activities,receptions,incidents,tickets,equipment,piles,measurements,workers,preset,anchorKey,plantId,nowIso}),[activities,receptions,incidents,tickets,equipment,piles,measurements,workers,preset,anchorKey,plantId,nowIso]);
  const inventoryAnalytics=useMemo(()=>buildInventoryAnalytics({productions,movements,period:analytics.period,plantId}),[analytics.period,movements,plantId,productions]);
  const inventoryCriticality=useMemo(()=>buildInventoryCriticality({products,movements,thresholds,plantId}),[movements,plantId,products,thresholds]);
  const criticalInventory=inventoryCriticality.filter((item)=>item.status==="critical");
  const unconfiguredInventory=inventoryCriticality.filter((item)=>item.status==="unconfigured");
  const commercialAnalytics=useMemo(()=>buildCommercialAnalytics({sales,period:analytics.period,plantId}),[analytics.period,plantId,sales]);
  const expenseAnalytics=useMemo(()=>buildExpenseAnalytics({records:expenses,period:analytics.period,plantId}),[analytics.period,expenses,plantId]);
  const combinedEvents=useMemo(()=>[
    ...analytics.events,
    ...inventoryAnalytics.events.map((event)=>({id:event.id,at:event.at,plant:event.plant,kind:"inventory" as const,title:event.title,detail:event.detail})),
    ...commercialAnalytics.events.map((event)=>({id:event.id,at:event.at,plant:event.plant,kind:"sale" as const,title:event.title,detail:event.detail})),
    ...expenseAnalytics.events.map((event)=>({id:event.id,at:event.at,plant:event.plant,kind:"expense" as const,title:event.title,detail:event.detail})),
  ].sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime()).slice(0,36),[analytics.events,commercialAnalytics.events,expenseAnalytics.events,inventoryAnalytics.events]);
  const kpis=[
    {label:"Recibido",value:formatMass(analytics.receivedKg),meta:`${analytics.dataCounts.receptions} recepciones`,intent:"neutral" as const},
    {label:"Procesado",value:formatMass(analytics.processedKg),meta:"peso inicial medido de pilas",intent:"neutral" as const},
    {label:"Rechazo",value:`${analytics.rejectionPct.toFixed(1)}%`,meta:`${formatMass(analytics.rejectionKg)} · cobertura ${analytics.rejectionCoveragePct.toFixed(0)}%`,intent:analytics.rejectionPct>10?"warning" as const:"neutral" as const},
    {label:"Horas-hombre",value:formatHours(analytics.laborHours),meta:`${analytics.dataCounts.activities} actividades`,intent:"neutral" as const},
    {label:"Cumplimiento plan",value:`${analytics.compliancePct.toFixed(0)}%`,meta:`${analytics.executedScheduledCount}/${analytics.scheduledCount} programadas`,intent:analytics.compliancePct<80&&analytics.scheduledCount>0?"warning" as const:"neutral" as const},
    {label:"Mantenimiento abierto",value:String(analytics.openMaintenanceAtPeriodEnd),meta:"al cierre del periodo",intent:analytics.openMaintenanceAtPeriodEnd>0?"warning" as const:"neutral" as const},
    {label:"Parada mantenimiento",value:formatMinutes(analytics.downtimeMinutes),meta:`${analytics.maintenanceTickets} tickets con impacto`,intent:analytics.downtimeMinutes>0?"warning" as const:"neutral" as const},
    {label:"Inventario crítico",value:String(criticalInventory.length),meta:`${unconfiguredInventory.length} sin umbral`,intent:criticalInventory.length>0?"danger" as const:"neutral" as const},
    {label:"Calidad de datos",value:String(analytics.dataQualityAlerts.length),meta:"alertas de cobertura/incertidumbre",intent:analytics.dataQualityAlerts.some((item)=>item.severity==="warning")?"warning" as const:"neutral" as const},
    {label:"Excepciones",value:String(analytics.exceptionsCount),meta:`${analytics.delayedCount} desviaciones · ${analytics.nonConformingReceipts} recepciones`,intent:analytics.exceptionsCount>0?"danger" as const:"neutral" as const},
  ];

  function exportCsv(){
    const operational=analyticsCsv(analytics);
    const extra=[inventoryAnalyticsCsvSection(inventoryAnalytics),commercialAnalyticsCsvSection(commercialAnalytics),expenseAnalyticsCsvSection(expenseAnalytics)].join("\n\n");
    downloadText(`greenatics-dashboard-${analytics.period.startKey}-${analytics.period.endKey}.csv`,`${operational}\n\n${extra}`);
  }

  return <>
    <header className="page-header"><div><p className="eyebrow">Dirección · una sola verdad</p><h1>Dashboard integrado</h1><p className="lede">Operación, producción, inventario, comercial y economía comparten el mismo corte temporal y de planta sin mezclar hechos distintos.</p></div><div className="header-actions"><button className="button secondary" type="button" onClick={exportCsv}>Exportar CSV</button><Link className="button primary" href="/activity/new">Nueva actividad</Link></div></header>

    <section className="panel mb-4"><div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end"><div><span className="mb-1 block text-xs font-bold text-[var(--muted)]">Periodo</span><div className="segmented" aria-label="Horizonte del dashboard">{(["day","week","month","history"] as DashboardPreset[]).map((item)=><button className={preset===item?"active":""} type="button" key={item} onClick={()=>setPreset(item)}>{item==="day"?"Día":item==="week"?"Semana":item==="month"?"Mes":"Histórico"}</button>)}</div></div><label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Fecha<input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" type="date" value={anchorKey} onChange={(event)=>setAnchorKey(event.target.value)} /></label><label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={plantId} onChange={(event)=>setPlantId(event.target.value)}>{plantOptions.map((plant)=><option key={plant.id} value={plant.id}>{plant.name}</option>)}</select></label></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]"><span className="status-pill status-normal">{analytics.period.label}</span><span>{analytics.dataCounts.activities} actividades · {analytics.dataCounts.receptions} recepciones · {inventoryAnalytics.periodProductionCount} producciones · {commercialAnalytics.salesCount} ventas · {expenseAnalytics.recordsCount} compras/gastos</span></div></section>

    <section className={KPI_GRID_CLASS} aria-label="Indicadores operativos">{kpis.map((kpi)=><KpiCard key={kpi.label} {...kpi}/>)}</section>

    <section className="grid gap-4 xl:grid-cols-2">
      <div className="panel">
        <div className="section-head"><div><p className="eyebrow">Inventario crítico</p><h2>Stock frente a política vigente</h2></div><Link className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" href="/inventory/thresholds">Configurar umbrales</Link></div>
        {inventoryCriticality.length?<div className="grid gap-2">{inventoryCriticality.slice(0,8).map((item)=><div className="grid gap-2 rounded-lg border border-[var(--line)] p-3 sm:grid-cols-[1fr_auto] sm:items-center" key={`${item.plantId}-${item.productId}`}><div><strong className="block text-xs">{item.productName} · {item.plant}</strong><span className="text-[10px] text-[var(--muted)]">Stock {item.stockQuantity.toLocaleString("es-CO")} {item.unit}{item.minimumQuantity!==undefined?` · mínimo ${item.minimumQuantity.toLocaleString("es-CO")} ${item.unit}`:" · sin umbral vigente"}</span></div><span className={`status-pill ${item.status==="critical"?"status-overdue":item.status==="ok"?"status-normal":"status-planned"}`}>{item.status==="critical"?"Crítico":item.status==="ok"?"Normal":"Sin umbral"}</span></div>)}</div>:<p className="quiet">No hay productos con movimientos ni políticas de stock para esta selección.</p>}
      </div>
      <div className="panel">
        <div className="section-head"><div><p className="eyebrow">Calidad de datos</p><h2>Cobertura e incertidumbre</h2></div><span className="quiet">{analytics.dataQualityAlerts.length} alertas</span></div>
        {analytics.dataQualityAlerts.length?<div className="grid gap-2">{analytics.dataQualityAlerts.map((alert)=><div className="rounded-lg border border-[var(--line)] p-3" key={alert.id}><div className="flex items-start justify-between gap-3"><strong className="text-xs">{alert.title}</strong><span className={`status-pill ${alert.severity==="warning"?"status-overdue":"status-planned"}`}>{alert.count}</span></div><p className="mt-1 text-[10px] text-[var(--muted)]">{alert.detail}</p></div>)}</div>:<p className="quiet">Sin alertas de calidad para el periodo y planta seleccionados.</p>}
      </div>
    </section>

    <section className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <div className="panel overflow-hidden"><div className="section-head"><div><p className="eyebrow">Tendencia operacional</p><h2>Recibido, horas-hombre y parada</h2></div><span className="quiet">mismo corte temporal</span></div><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead><tr className="border-b border-[var(--line)] text-[var(--muted)]"><th className="py-2 pr-3">Periodo</th><th className="py-2 pr-3 text-right">Recibido</th><th className="py-2 pr-3 text-right">HH</th><th className="py-2 text-right">Parada</th></tr></thead><tbody>{analytics.trend.map((point)=><tr className="border-b border-[var(--line)] last:border-b-0" key={point.key}><td className="py-2 pr-3 font-semibold">{point.label}</td><td className="py-2 pr-3 text-right">{formatMass(point.receivedKg)}</td><td className="py-2 pr-3 text-right">{formatHours(point.laborHours)}</td><td className="py-2 text-right">{formatMinutes(point.downtimeMinutes)}</td></tr>)}</tbody></table></div></div>
      <div className="panel"><div className="section-head"><div><p className="eyebrow">Compostaje</p><h2>Estado de proceso</h2></div><span className="quiet">{analytics.activePiles+analytics.maturingPiles} activas</span></div><div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1"><div className="rounded-lg bg-[var(--surface-soft)] p-3"><span className="quiet">Activas</span><strong className="mt-1 block text-xl">{analytics.activePiles}</strong></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><span className="quiet">Maduración</span><strong className="mt-1 block text-xl">{analytics.maturingPiles}</strong></div><div className="rounded-lg bg-[var(--surface-soft)] p-3"><span className="quiet">Cerradas periodo</span><strong className="mt-1 block text-xl">{analytics.closedPilesInPeriod}</strong>{analytics.closedPilesInPeriod>0&&<small className="block text-[var(--muted)]">Rendimiento medio {analytics.averageClosedYieldPct.toFixed(1)}%</small>}</div></div></div>
    </section>

    <section className="grid gap-4 xl:grid-cols-2">
      <div className="panel" aria-label="Producción del periodo"><div className="section-head"><div><p className="eyebrow">Producción terminada</p><h2>Flujo del periodo</h2></div><Link className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" href="/production">Abrir producción</Link></div><div className="grid gap-3"><div><span className="quiet">Producción por unidad</span><div className="mt-2"><UnitChips items={inventoryAnalytics.productionByUnit}/></div></div><div><span className="quiet">Entradas al kardex</span><div className="mt-2"><UnitChips items={inventoryAnalytics.inflowByUnit}/></div></div><div><span className="quiet">Salidas del kardex</span><div className="mt-2"><UnitChips items={inventoryAnalytics.outflowByUnit}/></div></div></div></div>
      <div className="panel" aria-label="Stock actual"><div className="section-head"><div><p className="eyebrow">Stock actual</p><h2>Inventario disponible</h2></div><Link className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" href="/inventory">Abrir inventario</Link></div><UnitChips items={inventoryAnalytics.currentStockByUnit}/><div className="mt-4 grid gap-2">{inventoryAnalytics.currentStockByProduct.slice(0,6).map((item)=><div className="flex items-center justify-between rounded-lg bg-[var(--surface-soft)] p-3 text-xs" key={item.productId}><span>{item.productName}</span><strong>{item.quantity.toLocaleString("es-CO",{maximumFractionDigits:2})} {item.unit}</strong></div>)}{!inventoryAnalytics.currentStockByProduct.length&&<p className="quiet">Sin stock registrado.</p>}</div></div>
    </section>

    <section className="grid gap-4 xl:grid-cols-2">
      <div className="panel" aria-label="Ventas del periodo"><div className="section-head"><div><p className="eyebrow">Comercial</p><h2>Facturación bruta registrada</h2></div><Link className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" href="/sales">Abrir comercial</Link></div><strong className="text-3xl">{formatMoney(commercialAnalytics.grossBillingCop)}</strong><p className="quiet mt-1">{commercialAnalytics.salesCount} venta{commercialAnalytics.salesCount===1?"":"s"} · no equivale a recaudo ni margen</p><div className="mt-4"><span className="quiet">Cantidad vendida por unidad</span><div className="mt-2"><UnitChips items={commercialAnalytics.soldByUnit}/></div></div></div>
      <div className="panel"><div className="section-head"><div><p className="eyebrow">Compras y gastos</p><h2>Gasto registrado</h2></div><Link className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" href="/expenses">Abrir gastos</Link></div><strong className="text-3xl">{formatMoney(expenseAnalytics.totalRegisteredCop)}</strong><p className="quiet mt-1">{expenseAnalytics.recordsCount} registros · no implica pago ni costo asignado a producto</p><div className="mt-4 grid gap-2">{expenseAnalytics.categories.slice(0,5).map((item)=><div className="flex items-center justify-between rounded-lg bg-[var(--surface-soft)] p-3 text-xs" key={item.id}><span>{item.label}</span><strong>{formatMoney(item.amountCop)}</strong></div>)}</div></div>
    </section>

    <section className="grid gap-4 xl:grid-cols-3">
      <div className="panel"><div className="section-head"><div><p className="eyebrow">Carga de trabajo</p><h2>Horas-hombre por proceso</h2></div><span className="quiet">horas-hombre</span></div>{analytics.processHours.length?<div className="grid gap-2">{analytics.processHours.slice(0,8).map((item)=><div className="flex items-center justify-between border-b border-[var(--line)] pb-2 text-xs last:border-b-0" key={item.id}><span>{item.label}</span><strong>{formatHours(item.value)}</strong></div>)}</div>:<p className="quiet">Sin ejecución registrada en el periodo.</p>}</div>
      <div className="panel"><div className="section-head"><div><p className="eyebrow">Personas</p><h2>Horas por trabajador</h2></div><span className="quiet">duración real</span></div>{analytics.workerHours.length?<div className="grid gap-2">{analytics.workerHours.slice(0,8).map((item)=><div className="flex items-center justify-between border-b border-[var(--line)] pb-2 text-xs last:border-b-0" key={item.id}><span>{item.label}</span><strong>{formatHours(item.value)}</strong></div>)}</div>:<p className="quiet">Sin horas registradas en el periodo.</p>}</div>
      <div className="panel"><div className="section-head"><div><p className="eyebrow">Mantenimiento</p><h2>Tiempo fuera de servicio</h2></div><Link className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" href="/equipment">Ver equipos</Link></div>{analytics.equipmentDowntime.length?<div className="grid gap-2">{analytics.equipmentDowntime.slice(0,8).map((item)=><div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-2 text-xs last:border-b-0" key={item.id}><span><strong className="block">{item.label}</strong>{item.detail&&<small className="text-[var(--muted)]">{item.detail}</small>}</span><strong>{formatMinutes(item.value)}</strong></div>)}</div>:<p className="quiet">Sin paradas registradas en el periodo.</p>}</div>
    </section>

    <section className="panel"><div className="section-head"><div><p className="eyebrow">Plantas</p><h2>Comparación operacional</h2></div><span className="quiet">mismos KPI · misma ventana</span></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b border-[var(--line)] text-[var(--muted)]"><th className="py-2">Planta</th><th className="py-2 text-right">Recibido</th><th className="py-2 text-right">Rechazo</th><th className="py-2 text-right">HH</th><th className="py-2 text-right">Cumplimiento</th><th className="py-2 text-right">Parada</th><th className="py-2 text-right">Atención</th></tr></thead><tbody>{analytics.plantComparison.map((row)=><tr className="border-b border-[var(--line)] last:border-b-0" key={row.plantId}><td className="py-3 font-semibold">{row.plant}</td><td className="py-3 text-right">{formatMass(row.receivedKg)}</td><td className="py-3 text-right">{row.rejectionPct.toFixed(1)}%</td><td className="py-3 text-right">{formatHours(row.laborHours)}</td><td className="py-3 text-right">{row.compliancePct.toFixed(0)}%</td><td className="py-3 text-right">{formatMinutes(row.downtimeMinutes)}</td><td className="py-3 text-right"><span className={`status-pill ${row.attention>0?"status-overdue":"status-normal"}`}>{row.attention}</span></td></tr>)}</tbody></table></div></section>

    <section className="panel"><div className="section-head"><div><p className="eyebrow">Eventos</p><h2>Eventos operativos recientes</h2></div><span className="quiet">operación + inventario + comercial + gasto</span></div>{combinedEvents.length?<div className="grid gap-2">{combinedEvents.map((event)=><div className="grid gap-2 rounded-lg border border-[var(--line)] p-3 sm:grid-cols-[120px_1fr]" key={event.id}><div><span className="status-pill status-planned">{event.kind}</span><span className="mt-1 block text-[10px] text-[var(--muted)]">{event.plant}</span></div><div><strong className="block text-xs">{event.title}</strong><span className="text-[10px] text-[var(--muted)]">{event.detail} · {new Intl.DateTimeFormat("es-CO",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Bogota"}).format(new Date(event.at))}</span></div></div>)}</div>:<p className="quiet">Sin eventos para el periodo seleccionado.</p>}</section>
  </>;
}
