"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OpsAccessRole } from "@/lib/ops-data-contract";
import type { GreenaticsAppCode } from "@/lib/admin-users";

type ManagedPlant = { plantId: string; code: string; name: string; managerRole: "admin" | "director" };
type UserMembership = { plantId: string; plantName: string; role: OpsAccessRole; active: boolean };
type UserSummary = { id: string; email: string; displayName: string; appAccess: GreenaticsAppCode[]; memberships: UserMembership[] };
type ApiPayload = { ok: true; managedPlants: ManagedPlant[]; users: UserSummary[] } | { ok: false; error: string };
type DraftAssignment = { selected: boolean; had: boolean; role: OpsAccessRole };

const roles: OpsAccessRole[] = ["operator", "supervisor", "technical", "maintenance", "admin", "director"];
const roleLabel: Record<OpsAccessRole, string> = {
  operator: "Operario",
  supervisor: "Supervisor",
  technical: "Técnico / calidad",
  maintenance: "Mantenimiento",
  admin: "Administrador",
  director: "Dirección",
};
const appCatalog: Array<{ code: GreenaticsAppCode; label: string; detail: string }> = [
  { code: "ops", label: "GREENATICS OPS", detail: "Plantas, bitácora y control operativo" },
  { code: "huella", label: "Calcula tu Huella", detail: "Inventarios y gestión climática" },
  { code: "red", label: "GREENATICS Red", detail: "Territorio, rutas y PMIRS" },
  { code: "agroway", label: "AGROWAY", detail: "Trazabilidad agrícola" },
  { code: "sana", label: "SANA", detail: "Proyectos e inversión productiva" },
];

function AppAccessPicker({ value, onChange, disabled = false }: { value: GreenaticsAppCode[]; onChange: (next: GreenaticsAppCode[]) => void; disabled?: boolean }) {
  return <fieldset className="mt-4 grid gap-2">
    <legend className="text-xs font-bold text-[var(--muted)]">Herramientas habilitadas</legend>
    <p className="text-xs text-[var(--muted)]">Define a qué productos puede entrar esta cuenta. Los datos y roles internos se siguen controlando por organización y planta.</p>
    <div className="grid gap-2 sm:grid-cols-2">
      {appCatalog.map((app) => {
        const selected = value.includes(app.code);
        return <label className="flex min-h-14 items-start gap-3 rounded-lg border border-[var(--line)] bg-white p-3 text-sm" key={app.code}>
          <input className="mt-1" type="checkbox" checked={selected} onChange={(event) => onChange(event.target.checked ? [...value, app.code] : value.filter((code) => code !== app.code))} disabled={disabled} />
          <span><strong className="block">{app.label}</strong><span className="block text-[11px] text-[var(--muted)]">{app.detail}</span></span>
        </label>;
      })}
    </div>
  </fieldset>;
}

function UserCard({ user, plants, onSaved }: { user: UserSummary; plants: ManagedPlant[]; onSaved: () => Promise<void> }) {
  const initial = useMemo<Record<string, DraftAssignment>>(() => Object.fromEntries(plants.map((plant) => {
    const membership = user.memberships.find((item) => item.plantId === plant.plantId);
    return [plant.plantId, { selected: membership?.active ?? false, had: Boolean(membership), role: membership?.role ?? "operator" }];
  })), [plants, user.memberships]);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [draft, setDraft] = useState<Record<string, DraftAssignment>>(initial);
  const [appAccess, setAppAccess] = useState<GreenaticsAppCode[]>(user.appAccess.length ? user.appAccess : ["ops"]);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    const assignments = plants.flatMap((plant) => {
      const item = draft[plant.plantId];
      if (!item?.selected && !item?.had) return [];
      return [{ plantId: plant.plantId, role: item.role, active: item.selected }];
    });
    if (!appAccess.length) return setFeedback("Selecciona al menos una herramienta.");
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, displayName, assignments, appAccess }) });
      const data = await response.json() as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) return setFeedback(data.error || "No fue posible guardar.");
      setFeedback("Accesos actualizados.");
      await onSaved();
    } catch {
      setFeedback("No fue posible conectar con el servidor.");
    } finally {
      setBusy(false);
    }
  }

  return <article className="rounded-xl border border-[var(--line)] p-4">
    <div className="grid gap-3 md:grid-cols-[1fr_auto]"><div><strong>{user.displayName}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{user.email || "Correo no disponible"}</span></div><span className="quiet">{user.memberships.filter((item) => item.active).length} acceso(s) activo(s)</span></div>
    <label className="mt-4 grid gap-1 text-xs font-bold text-[var(--muted)]">Nombre visible<input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={displayName} onChange={(event) => setDisplayName(event.target.value)} disabled={busy} /></label>
    <AppAccessPicker value={appAccess} onChange={setAppAccess} disabled={busy} />
    <div className="mt-4 grid gap-2">{plants.map((plant) => {
      const item = draft[plant.plantId] ?? { selected: false, had: false, role: "operator" as OpsAccessRole };
      return <div className="grid gap-2 rounded-lg bg-[var(--surface-soft)] p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={plant.plantId}>
        <label className="flex min-h-10 items-center gap-3 text-sm"><input type="checkbox" checked={item.selected} onChange={(event) => setDraft((current) => ({ ...current, [plant.plantId]: { ...item, selected: event.target.checked } }))} disabled={busy} /><span><strong>{plant.name}</strong><span className="block text-[11px] text-[var(--muted)]">{plant.code}</span></span></label>
        <select aria-label={`Rol ${plant.name}`} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={item.role} onChange={(event) => setDraft((current) => ({ ...current, [plant.plantId]: { ...item, role: event.target.value as OpsAccessRole } }))} disabled={busy || !item.selected}>{roles.filter((role) => role !== "director" || plant.managerRole === "director").map((role) => <option value={role} key={role}>{roleLabel[role]}</option>)}</select>
        <span className={`status-pill ${item.selected ? "status-normal" : "status-planned"}`}>{item.selected ? "Activo" : "Sin acceso"}</span>
      </div>;
    })}</div>
    {feedback && <p role="status" className="mt-3 text-xs font-semibold text-[var(--muted)]">{feedback}</p>}
    <div className="mt-4 flex justify-end"><button className="button secondary" type="button" onClick={() => void save()} disabled={busy}>{busy ? "Guardando…" : "Guardar accesos"}</button></div>
  </article>;
}

export function UserAdminView() {
  const [plants, setPlants] = useState<ManagedPlant[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteAppAccess, setInviteAppAccess] = useState<GreenaticsAppCode[]>(["ops"]);
  const [inviteDraft, setInviteDraft] = useState<Record<string, { selected: boolean; role: OpsAccessRole }>>({});
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await response.json() as ApiPayload;
      if (!response.ok || !data.ok) return setFeedback("error" in data ? data.error : "No fue posible cargar usuarios.");
      setPlants(data.managedPlants);
      setUsers(data.users);
      setInviteDraft((current) => Object.keys(current).length ? current : Object.fromEntries(data.managedPlants.map((plant, index) => [plant.plantId, { selected: index === 0, role: "operator" as OpsAccessRole }])));
    } catch {
      setFeedback("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function invite() {
    if (busy) return;
    if (!inviteAppAccess.length) return setFeedback("Selecciona al menos una herramienta.");
    setBusy(true);
    setFeedback("");
    const assignments = plants.flatMap((plant) => inviteDraft[plant.plantId]?.selected ? [{ plantId: plant.plantId, role: inviteDraft[plant.plantId].role, active: true }] : []);
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, displayName, assignments, appAccess: inviteAppAccess }) });
      const data = await response.json() as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) return setFeedback(data.error || "No fue posible invitar al usuario.");
      setEmail("");
      setDisplayName("");
      setInviteAppAccess(["ops"]);
      setFeedback("Invitación enviada y accesos creados.");
      await load();
    } catch {
      setFeedback("No fue posible conectar con el servidor.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <header className="page-header"><div><p className="eyebrow">Administración · acceso interno</p><h1>Usuarios y accesos</h1><p className="lede">Invita al equipo, habilita una o varias herramientas y define qué planta puede ver y qué rol operacional tendrá. Las autorizaciones también se verifican en PostgreSQL.</p></div></header>
    <section className="panel mb-4">
      <div className="section-head"><div><p className="eyebrow">Nuevo usuario</p><h2>Enviar invitación</h2></div></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Nombre visible<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Nombre y apellido" disabled={busy} /></label>
        <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Correo<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="usuario@greenatics.com.co" disabled={busy} /></label>
      </div>
      <AppAccessPicker value={inviteAppAccess} onChange={setInviteAppAccess} disabled={busy} />
      <div className="mt-4 grid gap-2">{plants.map((plant) => {
        const item = inviteDraft[plant.plantId] ?? { selected: false, role: "operator" as OpsAccessRole };
        return <div className="grid gap-2 rounded-lg bg-[var(--surface-soft)] p-3 sm:grid-cols-[1fr_auto] sm:items-center" key={plant.plantId}>
          <label className="flex min-h-10 items-center gap-3 text-sm"><input type="checkbox" checked={item.selected} onChange={(event) => setInviteDraft((current) => ({ ...current, [plant.plantId]: { ...item, selected: event.target.checked } }))} disabled={busy} /><strong>{plant.name}</strong></label>
          <select aria-label={`Nuevo rol ${plant.name}`} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={item.role} onChange={(event) => setInviteDraft((current) => ({ ...current, [plant.plantId]: { ...item, role: event.target.value as OpsAccessRole } }))} disabled={busy || !item.selected}>{roles.filter((role) => role !== "director" || plant.managerRole === "director").map((role) => <option value={role} key={role}>{roleLabel[role]}</option>)}</select>
        </div>;
      })}</div>
      {feedback && <p role="status" className="mt-4 rounded-lg bg-[var(--surface-soft)] p-3 text-sm font-semibold text-[var(--muted)]">{feedback}</p>}
      <div className="mt-5 flex justify-end"><button className="button primary" type="button" onClick={() => void invite()} disabled={busy || loading}>{busy ? "Enviando…" : "Enviar invitación"}</button></div>
    </section>
    <section className="panel">
      <div className="section-head"><div><p className="eyebrow">Equipo</p><h2>Accesos por herramienta y planta</h2></div><span className="quiet">{users.length} usuario(s)</span></div>
      {loading ? <p className="quiet">Cargando usuarios…</p> : users.length ? <div className="grid gap-3">{users.map((user) => <UserCard key={user.id} user={user} plants={plants} onSaved={load} />)}</div> : <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center"><strong className="block text-sm">Aún no hay usuarios administrables</strong><p className="quiet mt-2">Invita el primer integrante del equipo para esta planta.</p></div>}
    </section>
  </>;
}
