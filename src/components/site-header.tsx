import Link from "next/link";
import { primaryNav, type NavItem } from "@/data/site";

function DesktopNavItem({ item }: { item: NavItem }) {
  if (item.type === "direct") {
    return (
      <Link className="nav-direct" href={item.href}>
        <span>{item.label}</span>
        {item.badge ? <small className="nav-badge">{item.badge}</small> : null}
      </Link>
    );
  }

  return (
    <details className="nav-group">
      <summary>{item.label}</summary>
      <div className="nav-group-panel">
        {item.children.map((child) => (
          <Link key={child.href} href={child.href}>
            <strong>{child.label}</strong>
            {child.note ? <small>{child.note}</small> : null}
          </Link>
        ))}
      </div>
    </details>
  );
}

function MobileNavItem({ item }: { item: NavItem }) {
  if (item.type === "direct") {
    return (
      <Link className="mobile-nav-direct" href={item.href}>
        <span>{item.label}</span>
        {item.badge ? <small className="nav-badge">{item.badge}</small> : null}
      </Link>
    );
  }

  return (
    <details className="mobile-nav-group">
      <summary>{item.label}</summary>
      <div className="mobile-nav-children">
        {item.children.map((child) => <Link key={child.href} href={child.href}>{child.label}</Link>)}
      </div>
    </details>
  );
}

export function SiteHeader() {
  const opsUrl = process.env.NEXT_PUBLIC_OPS_URL || "/acceso/";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand-link" href="/" aria-label="Greenatics inicio">
          <img className="official-logo greenatics-header-logo" src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          {primaryNav.map((item) => <DesktopNavItem key={item.label} item={item} />)}
        </nav>

        <div className="header-actions">
          <Link className="button button--primary header-diagnostic" href="/diagnostico/">Diagnóstico</Link>
          <a className="button button--dark" href={opsUrl}>Acceso Greenatics</a>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Abrir menú">Menú</summary>
          <div className="mobile-menu-panel">
            <Link className="mobile-diagnostic" href="/diagnostico/">Diagnóstico</Link>
            {primaryNav.map((item) => <MobileNavItem key={item.label} item={item} />)}
            <a className="mobile-access" href={opsUrl}>Acceso Greenatics</a>
          </div>
        </details>
      </div>
    </header>
  );
}
