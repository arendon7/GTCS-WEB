"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { runtimeLinks } from "@/lib/runtime-links";
import "../plataforma-v4.css";

type UserStatus = "Activo" | "Invitación pendiente" | "Suspendido";
const platformOptions = ["OPS", "Huella", "Red", "AGROWAY", "SANA"] as const;
type Platform = (typeof platformOptions)[number];
const assignablePlatforms: readonly Platform[] = ["OPS", "Huella", "Red"];
type User = { initials: string; name: string; email: string; organization: string; role: string; access: string; platforms: Platform[]; status: UserStatus; lastAccess: string };

const initialUsers: User[] = [
  { initials: "AD", name: "Admin de ejemplo", email: "admin@example.com", organization: "Equipo de muestra", role: "Administrador general", access: "OPS · Huella · Red", platforms: ["OPS", "Huella", "Red"], status: "Activo", lastAccess: "Dato de ejemplo" },
  { initials: "CO", name: "Coordinación de ejemplo", email: "coordinacion@example.com", organization: "Proyecto territorial de muestra", role: "Coordinación de operación", access: "OPS · Red", platforms: ["OPS", "Red"], status: "Activo", lastAccess: "Dato de ejemplo" },
  { initials: "AE", name: "Analista de ejemplo", email: "analista@example.com", organization: "Organización aliada de muestra", role: "Analista de datos", access: "Red · Huella", platforms: ["Red", "Huella"], status: "Invitación pendiente", lastAccess: "Sin actividad real" },
  { initials: "RF", name: "Responsable de finca de muestra", email: "finca@example.com", organization: "Finca de muestra", role: "Responsable de lote", access: "Sin plataformas", platforms: [], status: "Activo", lastAccess: "Dato de ejemplo" },
];

const statusClass: Record<UserStatus, string> = { Activo: "user-status--active", "Invitación pendiente": "user-status--pending", Suspendido: "user-status--suspended" };
const platformDescription: Record<Platform, string> = {
  OPS: "Operación, bitácora y control de plantas.",
  Huella: "Inventario y estimación pública de flujos orgánicos; el método GEI se define por separado.",
  Red: "Trazabilidad de materiales y actores.",
  AGROWAY: "Demo navegable de trazabilidad agrícola; no conecta fincas reales ni habilita una operación productiva.",
  SANA: "Estructuración de proyectos agrícolas; esta muestra no asigna permisos ni gestiona cuentas.",
};
const organizations = ["Equipo de muestra", "Proyecto territorial de muestra", "Organización aliada de muestra", "Finca de muestra"] as const;
const demoUsersStorageKey = "greenatics-demo-users-v2";
const isExternal = (url: string) => /^https?:\/\//.test(url);
const opsAdminHref = runtimeLinks.opsUserAdmin || "/acceso/";
const opsAdminLabel = runtimeLinks.opsUserAdmin ? "Administrar usuarios en OPS ↗" : "Consultar acceso a OPS →";

function isStoredUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<User>;
  return typeof user.name === "string" && typeof user.email === "string" && typeof user.organization === "string" && typeof user.role === "string" && typeof user.access === "string" && Array.isArray(user.platforms) && user.platforms.every((platform) => platformOptions.includes(platform as Platform)) && typeof user.status === "string" && ["Activo", "Invitación pendiente", "Suspendido"].includes(user.status) && typeof user.lastAccess === "string" && typeof user.initials === "string";
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [notice, setNotice] = useState("Directorio de muestra listo para explorar roles y alcances.");
  const [filter, setFilter] = useState("Todos");
  const [selectedEmail, setSelectedEmail] = useState(initialUsers[0].email);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteOrganization, setInviteOrganization] = useState("Equipo de muestra");
  const [inviteRole, setInviteRole] = useState("Analista o responsable de lote");
  const [organization, setOrganization] = useState<(typeof organizations)[number]>("Equipo de muestra");
  const [isHydrated, setIsHydrated] = useState(false);
  const scopedUsers = users.filter((user) => user.organization === organization);
  const visibleUsers = (filter === "Todos" ? scopedUsers : scopedUsers.filter((user) => user.status === filter));
  const selectedUser = scopedUsers.find((user) => user.email === selectedEmail) ?? scopedUsers[0] ?? users[0];

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(demoUsersStorageKey);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(isStoredUser)) {
          const sanitized = parsed.map((user) => {
            const platforms = user.platforms.filter((platform) => assignablePlatforms.includes(platform));
            return { ...user, platforms, access: platforms.length ? platforms.join(" · ") : "Sin plataformas" };
          });
          const removedUnsupportedAccess = sanitized.some((user, index) => user.platforms.length !== parsed[index].platforms.length);
          setUsers(sanitized);
          if (removedUnsupportedAccess) setNotice("Se actualizaron los alcances de esta muestra: AGROWAY y SANA no se asignan mientras sus estados no habiliten acceso.");
        }
      }
    } catch {
      setNotice("No fue posible leer el directorio local. Se mantiene la configuración inicial de esta vista.");
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
    setNotice(`Registro de invitación de ejemplo creado para ${name}. Puedes incluir herramientas en la muestra; no se envió una invitación real.`);
  }

  function suspend(email: string) {
    setUsers((current) => current.map((user) => user.email === email ? { ...user, status: "Suspendido" } : user));
    setNotice("Estado de ejemplo cambiado a suspendido. No se modificó ningún acceso real.");
  }

  function togglePlatform(platform: Platform) {
    if (!assignablePlatforms.includes(platform)) {
      setNotice(`${platform} no está disponible para asignación en esta muestra.`);
      return;
    }
    const hasAccess = selectedUser.platforms.includes(platform);
    setUsers((current) => current.map((user) => {
      if (user.email !== selectedUser.email) return user;
      const platforms = hasAccess
        ? user.platforms.filter((item) => item !== platform)
        : [...user.platforms, platform].sort((a, b) => platformOptions.indexOf(a) - platformOptions.indexOf(b));
      return { ...user, platforms, access: platforms.length ? platforms.join(" · ") : "Sin plataformas" };
    }));
    setNotice(`${hasAccess ? "Retirada del" : "Incluida en el"} ejemplo: ${platform} para ${selectedUser.name}. No se modificó ningún acceso real.`);
  }

  function resetDemoDirectory() {
    setUsers(initialUsers);
    setSelectedEmail(initialUsers[0].email);
    setNotice("Directorio de muestra restablecido. No se modificaron cuentas autenticadas.");
  }

  function changeOrganization(nextOrganization: (typeof organizations)[number]) {
    setOrganization(nextOrganization);
    const firstUser = users.find((user) => user.organization === nextOrganization);
    setSelectedEmail(firstUser?.email ?? "");
    setFilter("Todos");
    setNotice(`Muestra cambiada a ${nextOrganization}. El directorio de ejemplo se limita a esa organización ficticia.`);
  }

  return (
    <div className="platform-admin">
      <section className="platform-admin__hero">
        <div className="container platform-admin__hero-grid">
          <div>
            <Link className="back-link back-link--light" href="/plataforma/">← Centro Greenatics</Link>
            <span className="eyebrow eyebrow--light">Demostración local · datos ficticios</span>
            <h1>Una identidad para cada equipo. Un alcance claro para cada decisión.</h1>
            <p className="lead">Explora un modelo de referencia para organizar personas, organizaciones y alcances. Los datos son ficticios; los cambios quedan en este navegador y no administran cuentas reales ni habilitan acceso a las plataformas.</p>
            <div className="button-row">
              <button className="button button--light" type="button" onClick={() => setShowInviteForm((current) => !current)}>{showInviteForm ? "Cerrar ejemplo" : "+ Ver flujo de invitación"}</button>
              <a className="button button--outline-light" href={opsAdminHref} target={isExternal(opsAdminHref) ? "_blank" : undefined} rel={isExternal(opsAdminHref) ? "noopener noreferrer" : undefined}>{opsAdminLabel}</a>
              {runtimeLinks.opsUserAdmin ? <Link className="button button--outline-light" href="/acceso/">Ver accesos</Link> : null}
            </div>
          </div>
          <aside className="platform-admin__hero-card"><span>Modelo de acceso</span><strong>Personas, organizaciones y alcance</strong><p>Explora ejemplos de roles y permisos locales. No son cuentas reales ni habilitan acceso a OPS, Huella, Red, AGROWAY o SANA.</p><div><i /><span>Acceso según la función</span></div><div><i /><span>Alcance definido por organización</span></div><div><i /><span>La muestra no administra cuentas</span></div></aside>
        </div>
      </section>

      <section className="platform-admin__body">
        <div className="container">
          <div className="platform-admin__toolbar"><div><span className="eyebrow">{organization}</span><h2>Personas y alcances de ejemplo</h2><p>Elige una organización ficticia para explorar cómo podría ordenarse su alcance.</p></div><label htmlFor="platform-organization">Organización de muestra<select id="platform-organization" value={organization} onChange={(event) => changeOrganization(event.target.value as (typeof organizations)[number])}>{organizations.map((item) => <option key={item}>{item}</option>)}</select></label></div>
          {showInviteForm && <form className="platform-admin__invite-form" onSubmit={createInvitation}><div className="platform-admin__invite-head"><div><span className="eyebrow">Nueva persona de ejemplo</span><h3>Probar el flujo de invitación.</h3><p>Usa datos inventados, no nombres ni correos de personas reales. El registro vive únicamente en esta demostración local.</p></div><button type="button" onClick={() => setShowInviteForm(false)}>Cerrar</button></div><div className="platform-admin__invite-fields"><label htmlFor="invite-name">Nombre de ejemplo<input id="invite-name" name="name" autoComplete="off" required value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Ej. Persona de ejemplo" /></label><label htmlFor="invite-email">Correo ficticio<input id="invite-email" name="email" autoComplete="off" required type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="persona@example.com" /></label><label htmlFor="invite-organization">Organización de muestra<select id="invite-organization" name="organization" value={inviteOrganization} onChange={(event) => setInviteOrganization(event.target.value as (typeof organizations)[number])}>{organizations.map((item) => <option key={item}>{item}</option>)}</select></label><label htmlFor="invite-role">Rol de referencia<select id="invite-role" name="role" value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}><option>Analista o responsable de lote</option><option>Dirección de operación</option><option>Administrador general</option></select></label></div><div className="button-row"><button className="button button--dark" type="submit">Añadir a la muestra</button><button className="button button--ghost" type="button" onClick={() => setShowInviteForm(false)}>Cancelar</button></div><small className="platform-admin__invite-note">La entrada se guarda solo en este navegador. No envía invitaciones, crea cuentas autenticadas ni asigna permisos en sistemas reales.</small></form>}
          <div className="platform-admin__stats"><article><span>Personas activas en la muestra</span><strong>{scopedUsers.filter((user) => user.status === "Activo").length}</strong><small>Estado de ejemplo</small></article><article><span>Invitaciones de ejemplo</span><strong>{scopedUsers.filter((user) => user.status === "Invitación pendiente").length}</strong><small>No se envían correos</small></article><article><span>Organizaciones de muestra</span><strong>{organizations.length}</strong><small>Límites de ejemplo</small></article><article><span>Auditoría productiva</span><strong>—</strong><small>No conectada a esta vista</small></article></div>

          <div className="platform-admin__workspace">
            <div className="platform-admin__table-head"><div><span className="eyebrow">Directorio ficticio</span><h3>Personas incluidas en la muestra</h3></div><div className="platform-admin__table-actions"><div className="platform-admin__filters">{["Todos", "Activo", "Invitación pendiente", "Suspendido"].map((item) => <button className={filter === item ? "is-active" : undefined} key={item} type="button" onClick={() => setFilter(item)}>{item === "Todos" ? item : `${item} · ejemplo`}</button>)}</div><button className="platform-admin__invite-trigger" type="button" onClick={() => setShowInviteForm((current) => !current)}>{showInviteForm ? "Cerrar ejemplo" : "+ Ver invitación de ejemplo"}</button></div></div>
            <p id="platform-directory-scroll-hint" className="platform-admin__table-hint">Desliza horizontalmente para ver organización, rol, alcance y acciones.</p>
            <div className="platform-admin__table-wrap" role="region" aria-label="Tabla de personas y alcances de ejemplo" aria-describedby="platform-directory-scroll-hint" tabIndex={0}><table><thead><tr><th>Persona de ejemplo</th><th>Organización</th><th>Rol</th><th>Alcance de ejemplo</th><th>Estado de ejemplo</th><th>Actividad (ejemplo)</th><th><span className="sr-only">Acciones de muestra</span></th></tr></thead><tbody>{visibleUsers.map((user) => <tr className={user.email === selectedEmail ? "is-selected" : undefined} key={user.email}><td><div className="platform-admin__person"><span>{user.initials}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div></td><td>{user.organization}</td><td>{user.role}</td><td>{user.access}</td><td><span className={`user-status ${statusClass[user.status]}`}>{user.status} · ejemplo</span></td><td>{user.lastAccess}</td><td><div className="platform-admin__row-actions"><button className="platform-admin__row-action platform-admin__row-action--primary" type="button" onClick={() => { setSelectedEmail(user.email); setNotice(`Seleccionaste el registro de muestra de ${user.name}.`); }}>Ver alcance</button><button className="platform-admin__row-action" type="button" onClick={() => user.status === "Activo" ? suspend(user.email) : setNotice(`${user.name}: estado de ejemplo revisado para ${user.organization}.`)}>{user.status === "Activo" ? "Cambiar estado" : "Revisar ejemplo"}</button></div></td></tr>)}</tbody></table></div>
          </div>

          <section className="platform-admin__access-panel" aria-labelledby="platform-access-title">
            <div className="platform-admin__access-copy"><span className="eyebrow eyebrow--light">Modelo de alcance</span><h2 id="platform-access-title">¿Qué herramientas se incluirían para {selectedUser.name}?</h2><p>Marca o retira herramientas en este ejemplo. La selección solo cambia la muestra: no concede acceso ni representa disponibilidad operativa.</p><div className="platform-admin__selected-user"><span>{selectedUser.initials}</span><div><strong>{selectedUser.name}</strong><small>{selectedUser.organization} · {selectedUser.role} · ejemplo</small></div></div></div>
            <div className="platform-admin__platform-options" role="group" aria-label={`Herramientas del ejemplo para ${selectedUser.name}`}>{platformOptions.map((platform) => { const active = selectedUser.platforms.includes(platform); const assignable = assignablePlatforms.includes(platform); const label = platform === "Huella" ? "Back 2 Green" : platform === "Red" ? "GREENATICS Red" : platform; return <button className={`${active ? "is-active " : ""}${assignable ? "" : "is-unavailable"}`} aria-label={assignable ? `${active ? "Quitar" : "Incluir"} ${label} ${active ? "del" : "en el"} ejemplo` : `${label}: no disponible para asignación en esta muestra`} aria-pressed={active} disabled={!assignable} key={platform} type="button" onClick={() => togglePlatform(platform)}><span aria-hidden="true">{active ? "✓" : assignable ? "+" : "—"}</span><strong>{label}</strong><small>{platformDescription[platform]}</small>{!assignable && <small className="platform-admin__platform-status">No disponible para asignación</small>}</button>; })}</div>
          </section>

          <div className="platform-admin__lower-grid"><article><span className="eyebrow">Roles de referencia</span><h3>Un alcance claro empieza por la función.</h3><div className="platform-admin__role"><strong>Administrador general</strong><span>En un entorno habilitado, podría organizar usuarios, políticas y auditoría.</span></div><div className="platform-admin__role"><strong>Dirección de operación</strong><span>Ejemplo de alcance para decisiones y reportes de un proyecto asignado.</span></div><div className="platform-admin__role"><strong>Analista o responsable de lote</strong><span>Ejemplo de consulta, captura y evidencia según el alcance definido.</span></div></article><article className="platform-admin__audit"><span className="eyebrow eyebrow--light">Criterio de auditoría</span><h3>Los cambios deben dejar contexto.</h3><p>En una implementación, cada evento debería indicar quién actuó, sobre qué organización y objeto, cuándo y por qué. Esta demostración no guarda eventos reales.</p><button type="button" onClick={() => setNotice("La demostración no registra eventos reales. En un entorno productivo, cada cambio debería conservar actor, organización, fecha, motivo y objeto afectado.")}>Consultar criterio de registro →</button></article></div>
          <p className="platform-admin__notice" role="status">{notice} {isHydrated ? "Los cambios de la muestra se conservan en este navegador." : "Cargando datos ficticios..."} {runtimeLinks.opsUserAdmin ? <>Esta vista no administra cuentas autenticadas. El enlace de OPS abre el entorno configurado para consultar su acceso: <a href={opsAdminHref} target="_blank" rel="noopener noreferrer">abrir OPS ↗</a>. </> : <>La administración de cuentas autenticadas requiere un entorno OPS habilitado; esta demostración no concede acceso. </>}<button type="button" onClick={resetDemoDirectory}>Restablecer muestra</button></p>
        </div>
      </section>
    </div>
  );
}
