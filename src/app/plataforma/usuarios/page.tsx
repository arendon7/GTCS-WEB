"use client";

import Link from "next/link";
import { useState } from "react";
import { runtimeLinks } from "@/lib/runtime-links";
import "../plataforma-v4.css";

type UserStatus = "Activo" | "Invitación pendiente" | "Suspendido";
type User = { initials: string; name: string; email: string; organization: string; role: string; access: string; status: UserStatus; lastAccess: string };

const initialUsers: User[] = [
  { initials: "AR", name: "Agustín Rendón", email: "agustin@greenatics.co", organization: "Greenatics S.A.S.", role: "Administrador general", access: "Todas las plataformas", status: "Activo", lastAccess: "Hoy, 09:42" },
  { initials: "CM", name: "Claudia Martínez", email: "claudia@greenatics.co", organization: "Proyecto Yarumal", role: "Coordinación de operación", access: "OPS · Red", status: "Activo", lastAccess: "Hoy, 08:16" },
  { initials: "JP", name: "Julián Pérez", email: "julian@aliado.co", organization: "Aliado territorial", role: "Analista de datos", access: "Red · Huella", status: "Invitación pendiente", lastAccess: "Sin acceso" },
  { initials: "LM", name: "Laura Mejía", email: "laura@productor.co", organization: "Finca demostrativa", role: "Responsable de lote", access: "AGROWAY · SANA", status: "Activo", lastAccess: "Ayer, 16:21" },
];

const statusClass: Record<UserStatus, string> = { Activo: "user-status--active", "Invitación pendiente": "user-status--pending", Suspendido: "user-status--suspended" };

export default function PlatformUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [notice, setNotice] = useState("Consola local preparada para conectar con identidad central.");
  const [filter, setFilter] = useState("Todos");
  const visibleUsers = filter === "Todos" ? users : users.filter((user) => user.status === filter);

  function invite() {
    setNotice("Invitación preparada. En producción se enviaría con organización, rol, alcance y fecha de expiración.");
  }

  function suspend(email: string) {
    setUsers((current) => current.map((user) => user.email === email ? { ...user, status: "Suspendido" } : user));
    setNotice("Acceso suspendido en esta vista local. La acción productiva debe registrar actor, fecha y motivo.");
  }

  return (
    <main className="platform-admin">
      <section className="platform-admin__hero">
        <div className="container platform-admin__hero-grid">
          <div>
            <Link className="back-link back-link--light" href="/plataforma/">← Centro Greenatics</Link>
            <span className="eyebrow eyebrow--light">Administración de acceso</span>
            <h1>Una identidad para cada equipo. Un alcance claro para cada decisión.</h1>
            <p className="lead">Administra organizaciones, usuarios, roles y accesos de OPS, Huella, Red, AGROWAY y SANA desde un solo lugar. La consola conserva el principio de mínimo privilegio: cada persona ve y modifica únicamente lo que su responsabilidad requiere.</p>
            <div className="button-row"><button className="button button--light" type="button" onClick={invite}>+ Invitar usuario</button>{runtimeLinks.ops ? <a className="button button--outline-light" href={`${runtimeLinks.ops}/admin/users`}>Abrir administración OPS</a> : null}<Link className="button button--outline-light" href="/acceso/">Ver accesos</Link></div>
          </div>
          <aside className="platform-admin__hero-card"><span>Estado del centro</span><strong>Arquitectura lista para identidad central</strong><p>La interfaz está preparada para conectar autenticación, organizaciones, roles, sesiones y auditoría sin compartir datos entre espacios por accidente.</p><div><i /><span>Políticas base · activas</span></div><div><i /><span>Separación por organización · activa</span></div><div><i /><span>Persistencia productiva · por conectar</span></div></aside>
        </div>
      </section>

      <section className="platform-admin__body">
        <div className="container">
          <div className="platform-admin__toolbar"><div><span className="eyebrow">Greenatics S.A.S.</span><h2>Personas y permisos</h2><p>Elige una organización para revisar usuarios, alcance, estado y última actividad.</p></div><label>Organización<select defaultValue="Greenatics S.A.S."><option>Greenatics S.A.S.</option><option>Proyecto Yarumal</option><option>Proyecto Támesis</option><option>Finca demostrativa</option></select></label></div>
          <div className="platform-admin__stats"><article><span>Usuarios activos</span><strong>{users.filter((user) => user.status === "Activo").length}</strong><small>Con acceso vigente</small></article><article><span>Invitaciones</span><strong>{users.filter((user) => user.status === "Invitación pendiente").length}</strong><small>Esperando aceptación</small></article><article><span>Organizaciones</span><strong>4</strong><small>Con límites independientes</small></article><article><span>Eventos de seguridad</span><strong>0</strong><small>Sin alertas críticas</small></article></div>

          <div className="platform-admin__workspace">
            <div className="platform-admin__table-head"><div><span className="eyebrow">Directorio</span><h3>Usuarios con acceso al ecosistema</h3></div><div className="platform-admin__filters">{["Todos", "Activo", "Invitación pendiente", "Suspendido"].map((item) => <button className={filter === item ? "is-active" : undefined} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div></div>
            <div className="platform-admin__table-wrap"><table><thead><tr><th>Persona</th><th>Organización</th><th>Rol</th><th>Alcance</th><th>Estado</th><th>Último acceso</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.email}><td><div className="platform-admin__person"><span>{user.initials}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div></td><td>{user.organization}</td><td>{user.role}</td><td>{user.access}</td><td><span className={`user-status ${statusClass[user.status]}`}>{user.status}</span></td><td>{user.lastAccess}</td><td><button className="platform-admin__row-action" type="button" onClick={() => user.status === "Activo" ? suspend(user.email) : setNotice(`${user.name}: revisión de acceso preparada para ${user.organization}.`)}>{user.status === "Activo" ? "Suspender" : "Revisar"}</button></td></tr>)}</tbody></table></div>
          </div>

          <div className="platform-admin__lower-grid"><article><span className="eyebrow">Roles base</span><h3>Permisos comprensibles antes de asignar.</h3><div className="platform-admin__role"><strong>Administrador general</strong><span>Organizaciones, usuarios, políticas y auditoría.</span></div><div className="platform-admin__role"><strong>Dirección de operación</strong><span>OPS, Red, reportes y decisiones del proyecto asignado.</span></div><div className="platform-admin__role"><strong>Analista o responsable de lote</strong><span>Captura, consulta y evidencia dentro de su alcance.</span></div></article><article className="platform-admin__audit"><span className="eyebrow eyebrow--light">Auditoría de acceso</span><h3>Lo importante también queda registrado.</h3><p>Invitaciones, cambios de rol, suspensiones, accesos y exportaciones deben conservar actor, organización, fecha, motivo y objeto afectado.</p><button type="button" onClick={() => setNotice("Registro de auditoría preparado para consultar eventos por organización, persona, plataforma y periodo.")}>Abrir registro de eventos →</button></article></div>
          <p className="platform-admin__notice" role="status">{notice}</p>
        </div>
      </section>
    </main>
  );
}
