"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type LeadStatus = "new" | "contacted" | "closed" | "discarded";

type PublicLead = {
  id: string;
  status: LeadStatus;
  name: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  role_title: string | null;
  audience: string;
  need: string;
  location: string | null;
  service: string | null;
  product: string | null;
  crop: string | null;
  context: string | null;
  details: string | null;
  consent_at: string;
  created_at: string;
  updated_at: string;
  retention_expires_at: string;
};

type LeadsPayload = { leads: PublicLead[] } | { error: string };

const statuses: Array<[LeadStatus, string]> = [
  ["new", "Nuevas"],
  ["contacted", "Contactadas"],
  ["closed", "Cerradas"],
  ["discarded", "Descartadas"],
];

const audiences: Array<[string, string]> = [
  ["esp", "ESP / Prestador"],
  ["municipio", "Municipio"],
  ["empresa", "Empresa / Gran generador"],
  ["ph", "Propiedad horizontal / Institución"],
  ["planta", "Planta / Operador"],
  ["wondergreen", "Agro / Wondergreen"],
  ["otro", "Otro contexto"],
];

const needs: Array<[string, string]> = [
  ["diagnostico", "Entender la situación actual"],
  ["planeacion", "Organizar la gestión o un plan"],
  ["regulacion", "Tema jurídico o regulatorio"],
  ["rutas", "Rutas o logística"],
  ["planta", "Planta o infraestructura"],
  ["operacion", "Operación"],
  ["datos", "Datos o trazabilidad"],
  ["valorizacion", "Valorización o producto"],
  ["nutricion", "Nutrición de cultivo"],
  ["distribucion", "Distribución Wondergreen"],
  ["otro", "Otra necesidad"],
];

function labelFor(options: Array<[string, string]>, value: string) {
  return options.find(([key]) => key === value)?.[1] ?? value;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function PublicLeadsAdminView() {
  const [leads, setLeads] = useState<PublicLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("");
  const [needFilter, setNeedFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/public-leads", { cache: "no-store" });
      const data = await response.json() as LeadsPayload;
      if (!response.ok || !("leads" in data) || !Array.isArray(data.leads)) {
        setLeads([]);
        setError("error" in data ? data.error : "No fue posible cargar las consultas comerciales.");
        return;
      }
      setLeads(data.leads);
    } catch {
      setLeads([]);
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const counts = useMemo(() => Object.fromEntries(statuses.map(([status]) => [status, leads.filter((lead) => lead.status === status).length])) as Record<LeadStatus, number>, [leads]);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    if (statusFilter && lead.status !== statusFilter) return false;
    if (audienceFilter && lead.audience !== audienceFilter) return false;
    if (needFilter && lead.need !== needFilter) return false;
    return true;
  }), [leads, statusFilter, audienceFilter, needFilter]);

  async function updateStatus(lead: PublicLead, status: LeadStatus) {
    if (busyId) return;
    setBusyId(lead.id);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/public-leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, status }),
      });
      const data = await response.json() as { lead?: { id: string; status: LeadStatus; updated_at: string }; error?: string };
      if (!response.ok || !data.lead) {
        setFeedback(data.error || "No fue posible actualizar el estado.");
        return;
      }
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: data.lead!.status, updated_at: data.lead!.updated_at } : item));
      setFeedback("Estado actualizado.");
    } catch {
      setFeedback("No fue posible conectar con el servidor.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteLead(lead: PublicLead) {
    if (busyId) return;
    setBusyId(lead.id);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/public-leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id }),
      });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setFeedback(data.error || "No fue posible eliminar la consulta.");
        return;
      }
      setLeads((current) => current.filter((item) => item.id !== lead.id));
      setConfirmingDeleteId(null);
      setFeedback("Consulta eliminada.");
    } catch {
      setFeedback("No fue posible conectar con el servidor.");
    } finally {
      setBusyId(null);
    }
  }

  return <>
    <header className="page-header">
      <div>
        <p className="eyebrow">Administración · acceso interno</p>
        <h1>Consultas comerciales</h1>
        <p className="lede">Bandeja gobernada para las consultas recibidas desde la web. Se mantiene separada del maestro de clientes, ventas e inventario hasta que exista una decisión comercial explícita.</p>
      </div>
    </header>

    <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de consultas comerciales">
      {statuses.map(([status, label]) => <article className="panel" key={status}><p className="eyebrow">{label}</p><strong className="text-3xl">{counts[status]}</strong></article>)}
    </section>

    <section className="panel mb-4">
      <div className="section-head"><div><p className="eyebrow">Seguimiento</p><h2>Filtrar consultas</h2></div><span className="quiet">{filteredLeads.length} visible(s)</span></div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Estado<select aria-label="Filtrar por estado" className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos</option>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Audiencia<select aria-label="Filtrar por audiencia" className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={audienceFilter} onChange={(event) => setAudienceFilter(event.target.value)}><option value="">Todas</option>{audiences.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Necesidad<select aria-label="Filtrar por necesidad" className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={needFilter} onChange={(event) => setNeedFilter(event.target.value)}><option value="">Todas</option>{needs.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </div>
      {feedback ? <p role="status" className="mt-4 rounded-lg bg-[var(--surface-soft)] p-3 text-sm font-semibold text-[var(--muted)]">{feedback}</p> : null}
    </section>

    <section className="panel">
      <div className="section-head"><div><p className="eyebrow">Bandeja</p><h2>Contexto recibido</h2></div><button className="button secondary" type="button" onClick={() => void load()} disabled={loading || Boolean(busyId)}>Actualizar</button></div>
      {loading ? <p className="quiet">Cargando consultas…</p> : error ? <div role="alert" className="rounded-xl bg-[var(--red-soft)] p-4 text-sm font-semibold text-[var(--red)]">{error}</div> : filteredLeads.length ? <div className="grid gap-4">{filteredLeads.map((lead) => {
        const busy = busyId === lead.id;
        const confirming = confirmingDeleteId === lead.id;
        return <article className="rounded-xl border border-[var(--line)] p-4" key={lead.id}>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div><p className="eyebrow">{labelFor(audiences, lead.audience)} · {labelFor(needs, lead.need)}</p><h3 className="text-xl font-bold">{lead.name}</h3>{lead.organization ? <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{lead.organization}</p> : null}{lead.role_title ? <p className="quiet mt-1">{lead.role_title}</p> : null}</div>
            <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Estado<select aria-label={`Estado de ${lead.name}`} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={lead.status} disabled={busy} onChange={(event) => void updateStatus(lead, event.target.value as LeadStatus)}>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-[var(--surface-soft)] p-3"><span className="quiet block">Contacto</span>{lead.email ? <strong className="mt-1 block break-all text-sm">{lead.email}</strong> : null}{lead.phone ? <span className="mt-1 block text-sm">{lead.phone}</span> : null}</div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3"><span className="quiet block">Ubicación</span><strong className="mt-1 block text-sm">{lead.location || "No indicada"}</strong></div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3"><span className="quiet block">Recibida</span><strong className="mt-1 block text-sm">{formatDate(lead.created_at)}</strong></div>
          </div>

          {(lead.service || lead.product || lead.crop) ? <div className="mt-4 grid gap-3 md:grid-cols-3">
            {lead.service ? <div><span className="quiet block">Servicio</span><strong className="mt-1 block text-sm">{lead.service}</strong></div> : null}
            {lead.product ? <div><span className="quiet block">Producto</span><strong className="mt-1 block text-sm">{lead.product}</strong></div> : null}
            {lead.crop ? <div><span className="quiet block">Cultivo</span><strong className="mt-1 block text-sm">{lead.crop}</strong></div> : null}
          </div> : null}

          {lead.context ? <div className="mt-4"><span className="quiet block">Contexto heredado</span><p className="mt-1 text-sm">{lead.context}</p></div> : null}
          {lead.details ? <div className="mt-4"><span className="quiet block">Situación reportada</span><p className="mt-1 whitespace-pre-wrap text-sm">{lead.details}</p></div> : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
            <p className="quiet">Retención inicial hasta {formatDate(lead.retention_expires_at)}</p>
            <div className="flex flex-wrap gap-2">
              {confirming ? <><button className="button secondary" type="button" disabled={busy} onClick={() => setConfirmingDeleteId(null)}>Cancelar</button><button className="button secondary" type="button" aria-label={`Confirmar eliminación de ${lead.name}`} disabled={busy} onClick={() => void deleteLead(lead)}>{busy ? "Eliminando…" : "Confirmar eliminación"}</button></> : <button className="button secondary" type="button" aria-label={`Eliminar consulta de ${lead.name}`} disabled={Boolean(busyId)} onClick={() => setConfirmingDeleteId(lead.id)}>Eliminar</button>}
            </div>
          </div>
        </article>;
      })}</div> : <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center"><strong className="block text-sm">No hay consultas para estos filtros</strong><p className="quiet mt-2">La bandeja solo muestra información recibida por el canal público gobernado.</p></div>}
    </section>
  </>;
}
