"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { useOpsStore } from "@/components/ops-store";
import { useSupplyStore } from "@/components/supply-store";
import { EquipmentStatusPill, MaintenanceStatusPill } from "@/components/equipment-status-pill";
import { canManageEquipmentRepair } from "@/lib/maintenance-access";
import { getDowntimeMinutes, maintenanceFailureTypeLabels, type MaintenanceSpareUse } from "@/lib/maintenance-domain";
import { bogotaTime } from "@/lib/time";

function parseEvidenceRefs(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function EvidenceList({ refs }: { refs: string[] }) {
  if (refs.length === 0) return <span className="text-[var(--muted)]">Sin referencias</span>;
  return <ul className="mt-1 grid gap-1">{refs.map((ref)=><li className="break-all" key={ref}>{ref}</li>)}</ul>;
}

export function EquipmentDetail({ equipmentId, initialNowIso }: { equipmentId: string; initialNowIso: string }) {
  const { equipment, tickets, startRepair, closeTicket } = useMaintenanceStore();
  const { workers, activities, backend, access, refresh: refreshOps } = useOpsStore();
  const { lots, movements, refreshSupplies } = useSupplyStore();
  const asset = equipment.find((item) => item.id === equipmentId);
  const assetTickets = useMemo(() => tickets.filter((ticket) => ticket.equipmentId === equipmentId).sort((a,b)=>new Date(b.openedAt).getTime()-new Date(a.openedAt).getTime()), [tickets, equipmentId]);
  const active = assetTickets.find((ticket) => ticket.status !== "closed");
  const [nowIso, setNowIso] = useState(initialNowIso);
  const [cause, setCause] = useState("");
  const [resolution, setResolution] = useState("");
  const [repairEvidence, setRepairEvidence] = useState("");
  const [repairWorkerIds, setRepairWorkerIds] = useState<string[]>([]);
  const [selectedSpareKey, setSelectedSpareKey] = useState("");
  const [spareQuantity, setSpareQuantity] = useState("");
  const [spares, setSpares] = useState<MaintenanceSpareUse[]>([]);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNowIso(new Date().toISOString()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!asset) return <section className="panel mx-auto max-w-3xl"><h1 className="text-2xl">Equipo no encontrado</h1><Link className="button secondary mt-5" href="/equipment">Volver</Link></section>;

  const remoteMode=backend.mode === "supabase";
  const canManageRepair=!remoteMode||canManageEquipmentRepair(access,asset.plantId);
  const plantWorkers = workers.filter((worker) => worker.plantId === asset.plantId && !worker.historical);
  const workerNames = new Map(workers.map((worker) => [worker.id, worker.name]));
  const spareLots = lots.filter((lot) => lot.plantId === asset.plantId && lot.category === "spare_part" && lot.quantity > 0);
  const spareLotByKey = new Map(spareLots.map((lot) => [`${lot.supplyId}|${lot.lotCode}`, lot]));

  const beginRepair = async () => {
    if (!active || busy || !canManageRepair) return;
    setBusy(true);
    setFeedback("");
    try {
      const result = await startRepair(active.id);
      setFeedback(result.ok ? "Reparación iniciada." : result.error);
    } finally {
      setBusy(false);
    }
  };

  const toggleWorker = (id: string, checked: boolean) => setRepairWorkerIds((current) => checked ? [...current, id] : current.filter((value) => value !== id));

  const addSpare = () => {
    const lot = spareLotByKey.get(selectedSpareKey);
    const quantity = Number(spareQuantity);
    if (!lot) return setFeedback("Selecciona un repuesto y lote disponible.");
    if (!Number.isFinite(quantity) || quantity <= 0) return setFeedback("La cantidad de repuesto debe ser mayor que cero.");
    if (quantity > lot.quantity + 1e-9) return setFeedback(`Stock insuficiente en ${lot.lotCode}. Disponible: ${lot.quantity.toLocaleString("es-CO")} ${lot.unit}.`);
    if (spares.some((item) => item.supplyId === lot.supplyId && item.lotCode === lot.lotCode)) return setFeedback("Ese repuesto y lote ya fue agregado.");
    setSpares((current) => [...current, { supplyId: lot.supplyId, lotCode: lot.lotCode, quantity }]);
    setSelectedSpareKey("");
    setSpareQuantity("");
    setFeedback("");
  };

  const close = async () => {
    if (!active || busy || !canManageRepair) return;
    setBusy(true);
    setFeedback("");
    try {
      const result = await closeTicket(active.id, {
        cause,
        resolution,
        evidenceRefs: parseEvidenceRefs(repairEvidence),
        workerIds: repairWorkerIds,
        spares,
      });
      if (!result.ok) return setFeedback(result.error);
      await Promise.all([refreshOps(), refreshSupplies()]);
      setCause("");
      setResolution("");
      setRepairEvidence("");
      setRepairWorkerIds([]);
      setSpares([]);
      setSelectedSpareKey("");
      setSpareQuantity("");
      setFeedback(remoteMode
        ? "Reparación cerrada, equipo disponible y actividad registrada en Bitácora."
        : "Reparación cerrada y equipo disponible.");
    } finally {
      setBusy(false);
    }
  };

  return <>
    <header className="page-header"><div><p className="eyebrow">{asset.plant} · {asset.area}</p><h1>{asset.code} · {asset.name}</h1><p className="lede">Ficha operacional, cronología real, repuestos físicos y Bitácora canónica de mantenimiento.</p></div><div className="header-actions"><Link className="button secondary" href="/equipment">Volver</Link>{!active && <Link className="button primary" href={`/equipment/${asset.id}/report`}>Reportar falla</Link>}</div></header>
    <section className="panel mx-auto max-w-5xl"><div className="section-head"><div><p className="eyebrow">Estado</p><h2>Situación actual</h2></div><EquipmentStatusPill status={asset.status}/></div>{active ? <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><strong className="block text-sm">{active.title}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{active.description}</span></div><MaintenanceStatusPill status={active.status}/></div><div className="mt-4 grid gap-3 border-t border-[var(--line)] pt-3 sm:grid-cols-2 lg:grid-cols-4"><div><span className="quiet">Ocurrió</span><strong className="mt-1 block text-xs">{bogotaTime.format(new Date(active.failedAt || active.openedAt))}</strong></div><div><span className="quiet">Reportada</span><strong className="mt-1 block text-xs">{bogotaTime.format(new Date(active.openedAt))}</strong></div><div><span className="quiet">Fuera de servicio</span><strong className="mt-1 block text-xs">{Math.round(getDowntimeMinutes(active, nowIso))} min</strong></div><div><span className="quiet">Tipo · severidad</span><strong className="mt-1 block text-xs">{maintenanceFailureTypeLabels[active.failureType ?? "other"]} · <span className="capitalize">{active.severity}</span></strong></div></div><div className="mt-3 border-t border-[var(--line)] pt-3 text-xs"><span className="quiet">Evidencia de falla</span><EvidenceList refs={active.failureEvidenceRefs ?? []}/></div>{active.status === "open" && canManageRepair && <div className="mt-4 flex justify-end"><button className="button primary" type="button" disabled={busy} onClick={beginRepair}>{busy ? "Iniciando…" : "Iniciar reparación"}</button></div>}{active.status === "open" && !canManageRepair && <p className="mt-4 rounded-lg bg-white p-3 text-xs text-[var(--muted)]">Solo mantenimiento, supervisión, técnico, administración o dirección autorizada de esta planta puede iniciar la reparación.</p>}{active.status === "repairing" && canManageRepair && <div className="mt-5 grid gap-5">
        <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Causa encontrada<textarea className="min-h-20 rounded-lg border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)]" value={cause} onChange={(e)=>setCause(e.target.value)} placeholder="Qué originó la falla"/></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Acción realizada<textarea className="min-h-20 rounded-lg border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)]" value={resolution} onChange={(e)=>setResolution(e.target.value)} placeholder="Qué se reparó o ajustó"/></label></div>
        <fieldset className="grid gap-2"><legend className="mb-1 text-xs font-bold text-[var(--muted)]">Trabajadores de reparación</legend><div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">{plantWorkers.map((worker) => <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 text-xs" key={worker.id}><input type="checkbox" checked={repairWorkerIds.includes(worker.id)} onChange={(event) => toggleWorker(worker.id,event.target.checked)}/>{worker.name}</label>)}</div>{plantWorkers.length===0&&<span className="text-xs text-[var(--red)]">No hay trabajadores operacionales activos para esta planta.</span>}</fieldset>
        <div className="rounded-xl border border-[var(--line)] bg-white p-4"><div className="section-head"><div><p className="eyebrow">Repuestos</p><h3>Consumo físico por lote</h3></div><span className="quiet">Opcional</span></div>{spareLots.length>0?<><div className="grid gap-3 md:grid-cols-[1fr_160px_auto]"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Repuesto y lote<select aria-label="Repuesto por lote" className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={selectedSpareKey} onChange={(event)=>setSelectedSpareKey(event.target.value)}><option value="">Seleccionar…</option>{spareLots.map((lot)=><option value={`${lot.supplyId}|${lot.lotCode}`} key={`${lot.supplyId}|${lot.lotCode}`}>{lot.supplyName} · {lot.lotCode} · {lot.quantity.toLocaleString("es-CO")} {lot.unit}</option>)}</select></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Cantidad<input aria-label="Cantidad de repuesto" className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={spareQuantity} onChange={(event)=>setSpareQuantity(event.target.value)}/></label><button className="button secondary self-end" type="button" onClick={addSpare}>Agregar repuesto</button></div>{spares.length>0&&<div className="mt-3 grid gap-2">{spares.map((spare)=>{const lot=spareLotByKey.get(`${spare.supplyId}|${spare.lotCode}`);return <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-soft)] px-3 py-2 text-xs" key={`${spare.supplyId}|${spare.lotCode}`}><span><strong>{lot?.supplyName ?? spare.supplyId}</strong> · {spare.lotCode} · {spare.quantity.toLocaleString("es-CO")} {lot?.unit ?? ""}</span><button className="font-bold text-[var(--red)]" type="button" onClick={()=>setSpares((current)=>current.filter((item)=>!(item.supplyId===spare.supplyId&&item.lotCode===spare.lotCode)))}>Quitar</button></div>})}</div>}</>:<p className="text-xs text-[var(--muted)]">No hay lotes de repuestos con stock disponible. El cierre puede continuar sin repuestos.</p>}</div>
        <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Evidencia de reparación <span className="font-normal">(opcional, una referencia por línea)</span><textarea className="min-h-20 rounded-lg border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)]" value={repairEvidence} onChange={(e)=>setRepairEvidence(e.target.value)} placeholder="URL, código documental o referencia verificable"/></label>
        <p className="rounded-lg bg-[var(--green-soft)] p-3 text-xs text-[var(--green-dark)]">Al cerrar, causa, acción, trabajadores, horario y equipo se registran una sola vez como actividad canónica de Mantenimiento. Los repuestos seleccionados se descuentan por lote en la misma transacción.</p>
        <div className="flex justify-end"><button className="button primary" type="button" disabled={busy} onClick={close}>{busy ? "Cerrando…" : "Cerrar reparación"}</button></div>
      </div>}{active.status === "repairing" && !canManageRepair && <p className="mt-4 rounded-lg bg-white p-3 text-xs text-[var(--muted)]">Reparación en curso. Tu rol puede consultar el estado, pero no cerrar la reparación en esta planta.</p>}</div> : <div className="rounded-xl bg-[var(--green-soft)] p-4 text-sm text-[var(--green-dark)]">No hay fallas o reparaciones abiertas para este equipo.</div>}{feedback && <p className="mt-4 rounded-lg bg-[var(--blue-soft)] p-3 text-sm font-semibold text-[var(--blue)]" role="status">{feedback}</p>}</section>
    <section className="panel mx-auto mt-4 max-w-5xl"><div className="section-head"><div><p className="eyebrow">Historial</p><h2>Tickets registrados</h2></div><span className="quiet">{assetTickets.length} eventos</span></div><div className="grid gap-3">{assetTickets.map((ticket)=>{const repairActivity=ticket.repairActivityId?activities.find((activity)=>activity.id===ticket.repairActivityId):undefined;const repairWorkers=repairActivity?.workerIds.map((id)=>workerNames.get(id)??id)??[];const spareMovements=movements.filter((movement)=>movement.referenceId===ticket.id&&movement.kind==="consumption");return <article className="rounded-xl border border-[var(--line)] p-4" key={ticket.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><strong className="text-sm">{ticket.title}</strong><span className="mt-1 block text-xs text-[var(--muted)]">Falla: {bogotaTime.format(new Date(ticket.failedAt || ticket.openedAt))} · Reporte: {bogotaTime.format(new Date(ticket.openedAt))} · {maintenanceFailureTypeLabels[ticket.failureType ?? "other"]}</span><span className="mt-1 block text-xs text-[var(--muted)]">{ticket.description}</span></div><MaintenanceStatusPill status={ticket.status}/></div>{ticket.status === "closed" && <div className="mt-3 grid gap-3 border-t border-[var(--line)] pt-3 text-xs sm:grid-cols-2 lg:grid-cols-3"><div><span className="quiet">Parada total</span><strong className="mt-1 block">{Math.round(getDowntimeMinutes(ticket))} min</strong></div><div><span className="quiet">Causa</span><strong className="mt-1 block">{ticket.cause}</strong></div><div><span className="quiet">Acción</span><strong className="mt-1 block">{ticket.resolution}</strong></div><div><span className="quiet">Bitácora</span><strong className="mt-1 block">{ticket.repairActivityId?"Bitácora enlazada":"Cierre previo sin vínculo canónico"}</strong>{repairWorkers.length>0&&<span className="mt-1 block text-[var(--muted)]">{repairWorkers.join(", ")}</span>}</div><div><span className="quiet">Repuestos consumidos</span>{spareMovements.length>0?<ul className="mt-1 grid gap-1">{spareMovements.map((movement)=><li key={movement.id}><strong>{movement.supplyName}</strong> · {movement.lotCode} · {movement.quantity.toLocaleString("es-CO")} {movement.unit}</li>)}</ul>:<span className="mt-1 block text-[var(--muted)]">Sin consumo registrado</span>}</div><div><span className="quiet">Evidencia reparación</span><EvidenceList refs={ticket.repairEvidenceRefs ?? []}/></div></div>}</article>})}</div></section>
  </>;
}
