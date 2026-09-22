"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { runtimeLinks } from "@/lib/runtime-links";
import "../plataforma-v4.css";

type UserStatus = "Activo" | "Invitación pendiente" | "Suspendido";
const platformOptions = ["OPS", "Huella", "Red", "AGROWAY", "SANA"] as const;
type Platform = (typeof platformOptions)[number];
type User = { initials: string; name: string; email: string; organization: string; role: string; access: string; platforms: Platform[]; status: UserStatus; lastAccess: string };

const initialUsers: User[] = [
  { initials: "AR", name: "Agustín Rendón", email: "agustin@greenatics.co", organization: "Greenatics S.A.S.", role: "Administrador general", access: "Todas las plataformas", platforms: ["OPS", "Huella", "Red", "AGROWAY", "SANA"], status: "Activo", lastAccess: "Hoy, 09:42" },
  { initials: "CM", name: "Claudia Martínez", email: "claudia@greenatics.co", organization: "Proyecto Yarumal", role: "Coordinación de operación", access: "OPS · Red", platforms: ["OPS", "Red"], status: "Activo", lastAccess: "Hoy, 08:16" },
  { initials: "JP", name: "Julián Pérez", email: "julian@aliado.co", organization: "Aliado territorial", role: "Analista de datos", access: "Red · Huella", platforms: ["Red", "Huella"], status: "Invitación pendiente", lastAccess: "Sin acceso" },
  { initials: "LM", name: "Laura Mejía", email: "laura@productor.co", organization: "Finca demostrativa", role: "Responsable de lote", access: "AGROWAY · SANA", platforms: ["AGROWAY", "SANA"], status: "Activo", lastAccess: "Ayer, 16:21" },
];

const statusClass: Record<UserStatus, string> = { Activo: "user-status--active", "Invitación pendiente": "user-status--pending", Suspendido: "user-status--suspended" };
const platformDescription: Record<Platform, string> = {
  OPS: "Operación, bitácora y control de plantas.",
  Huella: "Cálculo y seguimiento de huella ambiental.",
  Red: "Trazabilidad de materiales y actores.",
  AGROWAY: "Trazabilidad agrícola y trabajo de campo.",
  SANA: "Proyectos productivos y oportunidades de inversión.",
};
const organizations = ["Greenatics S.A.S.", "Proyecto Yarumal", "Proyecto Támesis", "Finca demostrativa"] as const;
const demoUsersStorageKey = "greenatics-demo-users-v1";
const isExternal = (url: string) => /^https?:\/\//.test(url);

function isStoredUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<User>;
  return typeof user.name === "string" && typeof user.email === "string" && typeof user.organization === "string" && typeof user.role === "string" && typeof user.access === "string" && Array.isArray(user.platforms) && user.platforms.every((platform) => platformOptions.includes(platform as Platform)) && typeof user.status === "string" && ["Activo", "Invitación pendiente", "Suspendido"].includes(user.status) && typeof user.lastAccess === "string" && typeof user.initials === "string";
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [notice, setNotice] = useState("Vista de demostración preparada para revisar identidad y alcance.");
  const [filter, setFilter] = useState("Todos");
  const [selectedEmail, setSelectedEmail] = useState(initialUsers[0].email);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteOrganization, setInviteOrganization] = useState("Greenatics S.A.S.");
  const [inviteRole, setInviteRole] = useState("Analista o responsable de lote");
  const [organization, setOrganization] = useState<(typeof organizations)[number]>("Greenatics S.A.S.");
  const [isHydrated, setIsHydrated] = useState(false);
  const scopedUsers = users.filter((user) => user.organization === organization);
  const visibleUsers = (filter === "Todos" ? scopedUsers : scopedUsers.filter((user) => user.status === filter));
  const selectedUser = scopedUsers.find((user) => user.email === selectedEmail) ?? scopedUsers[0] ?? users[0];

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(demoUsersStorageKey);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(isStoredUser)) setUsers(parsed);
      }
    } catch {
      setNotice("No fue posible leer el directorio de demostración. Se mantiene la configuración inicial de esta vista.");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) window.localStorage.setItem(demoUsersStorageKey, JSON.stringify(users));
  }, [isHydrated, users]);

  function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (users.some((user) => user.email === email)) {
      setNotice("Ese correo ya existe en el directorio. Revisa el usuario antes de crear otra invitación.");
      return;
    }
    const name = inviteName.trim();
    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "US";
    const newUser: User = { initials, name, email, organization: inviteOrganization, role: inviteRole, access: "Sin plataformas", platforms: [], status: "Invitación pendiente", lastAccess: "Sin acceso" };
    setUsers((current) => [newUser, ...current]);
    setSelectedEmail(email);
    setShowInviteForm(false);
    setInviteName("");
    setInviteEmail("");
    setNotice(`Invitación local creada para ${name}. Ahora puedes asignar sus plataformas desde el panel de alcance.`);
  }

  function suspend(email: string) {
    setUsers((current) => current.map((user) => user.email === email ? { ...user, status: "Suspendido" } : user));
    setNotice("Acceso suspendido en esta vista local. La acción productiva debe registrar actor, fecha y motivo.");
  }

  function togglePlatform(platform: Platform) {
    const hasAccess = selectedUser.platforms.includes(platform);
    setUsers((current) => current.map((user) => {
      if (user.email !== selectedUser.email) return user;
      const platforms = hasAccess
        ? user.platforms.filter((item) => item !== platform)
        : [...user.platforms, platform].sort((a, b) => platformOptions.indexOf(a) - platformOptions.indexOf(b));
      return { ...user, platforms, access: platforms.length ? platforms.join(" · ") : "Sin plataformas" };
    }));
    setNotice(`${hasAccess ? "Retirado" : "Asignado"}: ${platform} para ${selectedUser.name}. En producción se guardaría con rol, organización, actor y fecha.`);
  }

  function resetDemoDirectory() {
    setUsers(initialUsers);
    setSelectedEmail(initialUsers[0].email);
    setNotice("Directorio demo restablecido. Los usuarios productivos no se modifican desde esta vista.");
  }

  function changeOrganization(nextOrganization: (typeof organizations)[number]) {
    setOrganization(nextOrganization);
    const firstUser = users.find((user) => user.organization === nextOrganization);
    setSelectedEmail(firstUser?.email ?? "");
    setFilter("Todos");
    setNotice(`Contexto cambiado a ${nextOrganization}. El directorio y el alcance muestran solo esta organización.`);
  }

  return (
    <div className="platform-admin">
      <section className="platform-admin__hero">
        <div className="container platform-admin__hero-grid">
          <div>
            <Link className="back-link back-link--light" href="/plataforma/">← Centro Greenatics</Link>
            <span className="eyebrow eyebrow--light">Administración de acceso</span>
            <h1>Una identidad para cada equipo. Un alcance claro para cada decisión.</h1>
            <p className="lead">Administra organizaciones, usuarios, roles y accesos de OPS, Huella, Red, AGROWAY y SANA desde un solo lugar. La consola conserva el principio de mínimo privilegio: cada persona ve y modifica únicamente lo que su responsabilidad requiere.</p>
            <div className="button-row"><button className="button button--light" type="button" onClick={() => setShowInviteForm((current) => !current)}>{showInviteForm ? "Cerrar invitación" : "+ Ver flujo de invitación"}</button><a className="button button--outline-light" href={runtimeLinks.opsUserAdmin} target={isExternal(runtimeLinks.opsUserAdmin) ? "_blank" : undefined} rel={isExternal(runtimeLinks.opsUserAdmin) ? "noopener noreferrer" : undefined}>Administrar usuarios en OPS ↗</a><Link className="button button--outline-light" href="/acceso/">Ver accesos</Link></div>
          </div>
          <aside className="platform-admin__hero-card"><span>Estado del centro</span><strong>Identidad y permisos en un solo workspace</strong><p>Esta vista permite revisar el modelo de administración y preparar cambios de demostración. La gestión productiva de cuentas se realiza en la consola autenticada de OPS, con invitaciones, plantas, roles y herramientas habilitadas.</p><div><i /><span>Políticas base · activas</span></div><div><i /><span>Separación por organización · activa</span></div><div><i /><span>Administración productiva · OPS</span></div></aside>
        </div>
      </section>

      <section className="platform-admin__body">
        <div className="container">
          <div className="platform-admin__toolbar"><div><span className="eyebrow">{organization}</span><h2>Personas y permisos</h2><p>Elige una organización para revisar usuarios, alcance, estado y última actividad.</p></div><label htmlFor="platform-organization">Organización<select id="platform-organization" value={organization} onChange={(event) => changeOrganization(event.target.value as (typeof organizations)[number])}>{organizations.map((item) => <option key={item}>{item}</option>)}</select></label></div>
          {showInviteForm && <form className="platform-admin__invite-form" onSubmit={createInvitation}><div className="platform-admin__invite-head"><div><span className="eyebrow">Nueva persona</span><h3>Crear una invitación pendiente.</h3><p>Registra el contexto primero; el alcance se asigna en el panel siguiente.</p></div><button type="button" onClick={() => setShowInviteForm(false)}>Cerrar</button></div><div className="platform-admin__invite-fields"><label htmlFor="invite-name">Nombre completo<input id="invite-name" name="name" autoComplete="name" required value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Ej. Valentina Gómez" /></label><label htmlFor="invite-email">Correo de trabajo<input id="invite-email" name="email" autoComplete="email" required type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="persona@organizacion.co" /></label><label htmlFor="invite-organization">Organización<select id="invite-organization" name="organization" value={inviteOrganization} onChange={(event) => setInviteOrganization(event.target.value)}><option>Greenatics S.A.S.</option><option>Proyecto Yarumal</option><option>Proyecto Támesis</option><option>Finca demostrativa</option></select></label><label htmlFor="invite-role">Rol base<select id="invite-role" name="role" value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}><option>Analista o responsable de lote</option><option>Dirección de operación</option><option>Administrador general</option></select></label></div><div className="button-row"><button className="button button--dark" type="submit">Crear usuario pendiente</button><button className="button button--ghost" type="button" onClick={() => setShowInviteForm(false)}>Cancelar</button></div><small className="platform-admin__invite-note">Modo demostración: no se envía ningún correo; los cambios se conservan en este navegador. En un entorno productivo, OPS generaría la invitación con expiración y registro de auditoría.</small></form>}
          <div className="platform-admin__stats"><article><span>Usuarios activos</span><strong>{scopedUsers.filter((user) => user.status === "Activo").length}</strong><small>En {organization}</small></article><article><span>Invitaciones</span><strong>{scopedUsers.filter((user) => user.status === "Invitación pendiente").length}</strong><small>Esperando aceptación</small></article><article><span>Organizaciones</span><strong>{organizations.length}</strong><small>Con límites independientes</small></article><article><span>Eventos de seguridad</span><strong>0</strong><small>Sin alertas críticas</small></article></div>

          <div className="platform-admin__workspace">
            <div className="platform-admin__table-head"><div><span className="eyebrow">Directorio</span><h3>Usuarios con acceso al ecosistema</h3></div><div className="platform-admin__table-actions"><div className="platform-admin__filters">{["Todos", "Activo", "Invitación pendiente", "Suspendido"].map((item) => <button className={filter === item ? "is-active" : undefined} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div><button className="platform-admin__invite-trigger" type="button" onClick={() => setShowInviteForm((current) => !current)}>{showInviteForm ? "Cerrar invitación" : "+ Invitar persona"}</button></div></div>
            <div className="platform-admin__table-wrap"><table><thead><tr><th>Persona</th><th>Organización</th><th>Rol</th><th>Alcance</th><th>Estado</th><th>Último acceso</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{visibleUsers.map((user) => <tr className={user.email === selectedEmail ? "is-selected" : undefined} key={user.email}><td><div className="platform-admin__person"><span>{user.initials}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div></td><td>{user.organization}</td><td>{user.role}</td><td>{user.access}</td><td><span className={`user-status ${statusClass[user.status]}`}>{user.status}</span></td><td>{user.lastAccess}</td><td><div className="platform-admin__row-actions"><button className="platform-admin__row-action platform-admin__row-action--primary" type="button" onClick={() => { setSelectedEmail(user.email); setNotice(`Gestionando permisos de ${user.name}.`); }}>Gestionar</button><button className="platform-admin__row-action" type="button" onClick={() => user.status === "Activo" ? suspend(user.email) : setNotice(`${user.name}: revisión de acceso preparada para ${user.organization}.`)}>{user.status === "Activo" ? "Suspender" : "Revisar"}</button></div></td></tr>)}</tbody></table></div>
          </div>

          <section className="platform-admin__access-panel" aria-labelledby="platform-access-title">
            <div className="platform-admin__access-copy"><span className="eyebrow eyebrow--light">Alcance por plataforma</span><h2 id="platform-access-title">¿Qué puede abrir {selectedUser.name}?</h2><p>Selecciona una persona y define qué herramientas estarán disponibles para su organización. El rol sigue limitando lo que puede hacer dentro de cada entorno.</p><div className="platform-admin__selected-user"><span>{selectedUser.initials}</span><div><strong>{selectedUser.name}</strong><small>{selectedUser.organization} · {selectedUser.role}</small></div></div></div>
            <div className="platform-admin__platform-options" role="group" aria-label={`Herramientas asignadas a ${selectedUser.name}`}>{platformOptions.map((platform) => { const active = selectedUser.platforms.includes(platform); const label = platform === "Huella" ? "Calcula tu Huella" : platform === "Red" ? "GREENATICS Red" : platform; return <button className={active ? "is-active" : undefined} aria-pressed={active} key={platform} type="button" onClick={() => togglePlatform(platform)}><span aria-hidden="true">{active ? "✓" : "+"}</span><strong>{label}</strong><small>{platformDescription[platform]}</small></button>; })}</div>
          </section>

          <div className="platform-admin__lower-grid"><article><span className="eyebrow">Roles base</span><h3>Permisos comprensibles antes de asignar.</h3><div className="platform-admin__role"><strong>Administrador general</strong><span>Organizaciones, usuarios, políticas y auditoría.</span></div><div className="platform-admin__role"><strong>Dirección de operación</strong><span>OPS, Red, reportes y decisiones del proyecto asignado.</span></div><div className="platform-admin__role"><strong>Analista o responsable de lote</strong><span>Captura, consulta y evidencia dentro de su alcance.</span></div></article><article className="platform-admin__audit"><span className="eyebrow eyebrow--light">Auditoría de acceso</span><h3>Lo importante también queda registrado.</h3><p>Invitaciones, cambios de rol, suspensiones, accesos y exportaciones deben conservar actor, organización, fecha, motivo y objeto afectado.</p><button type="button" onClick={() => setNotice("Registro de auditoría preparado para consultar eventos por organización, persona, plataforma y periodo.")}>Abrir registro de eventos →</button></article></div>
          <p className="platform-admin__notice" role="status">{notice} {isHydrated ? "Los cambios de esta demo se conservan en este navegador." : "Cargando directorio de demostración..."} Para crear o modificar usuarios reales, abre <a href={runtimeLinks.opsUserAdmin} target={isExternal(runtimeLinks.opsUserAdmin) ? "_blank" : undefined} rel={isExternal(runtimeLinks.opsUserAdmin) ? "noopener noreferrer" : undefined}>la consola de usuarios OPS ↗</a>. <button type="button" onClick={resetDemoDirectory}>Restablecer demo</button></p>
        </div>
      </section>
    </div>
  );
}
