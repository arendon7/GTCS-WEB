import Link from "next/link";
import type { ReactNode } from "react";

const nav = [["Hoy", "/"], ["Calendario", "/calendar"], ["Registrar", "/activities/new"], ["Alertas", "/#alertas"], ["Dashboard", "/#dashboard"]] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="app-shell"><aside className="sidebar" aria-label="Navegación principal"><div className="brand-block"><div className="brand-mark" aria-hidden="true">G</div><div><strong>GREENATICS</strong><span>OPS</span></div></div><nav className="side-nav">{nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav><div className="sidebar-foot"><span className="status-dot status-ok" /> MVP local · sync pendiente</div></aside><main className="main-area">{children}</main></div>;
}
