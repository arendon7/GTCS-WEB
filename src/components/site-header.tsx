import Link from "next/link";
import { primaryNav } from "@/data/site";

export function SiteHeader() {
  const opsUrl = process.env.NEXT_PUBLIC_OPS_URL || "/acceso/";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand-link" href="/" aria-label="Greenatics inicio">
          <img className="official-logo greenatics-header-logo" src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          {primaryNav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>

        <div className="header-actions">
          <Link className="button button--ghost header-shop" href="/wondergreen/cotizador/">Cotizar</Link>
          <a className="button button--dark" href={opsUrl}>Acceso Greenatics</a>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Abrir menú">Menú</summary>
          <div className="mobile-menu-panel">
            <Link href="/diagnostico/">Diagnóstico Greenatics</Link>
            {primaryNav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
            <Link href="/wondergreen/cotizador/">Cotizar Wondergreen</Link>
            <a href={opsUrl}>Acceso Greenatics</a>
          </div>
        </details>
      </div>
    </header>
  );
}
