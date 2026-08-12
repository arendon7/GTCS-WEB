import Link from "next/link";
import { publicFooterNav, publicNav, publicSite } from "@/data/public-site";
import styles from "./public-shell.module.css";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.site}>
      <a className={styles.skipLink} href="#public-main">Saltar al contenido</a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/" aria-label="Greenatics, inicio">
            <img src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
          </Link>

          <nav className={styles.nav} aria-label="Navegación pública">
            {publicNav.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
            <Link className={styles.mobileContact} href="/contacto">Contacto</Link>
          </nav>

          <div className={styles.actions}>
            <Link className={styles.contact} href="/contacto">Contacto</Link>
            <Link className={styles.ops} href="/app">Acceder a Greenatics</Link>
          </div>
        </div>
      </header>

      <div id="public-main" className={styles.main}>{children}</div>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Link href="/" aria-label="Greenatics, inicio">
              <img src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
            </Link>
            <p>{publicSite.description}</p>
            <address>
              {publicSite.office.line1}<br />
              {publicSite.office.line2}<br />
              {publicSite.office.city}
            </address>
          </div>

          {publicFooterNav.map((group) => (
            <div className={styles.footerLinks} key={group.title}>
              <strong>{group.title}</strong>
              {group.links.map((link) => (
                <Link href={link.href} key={link.href}>{link.label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.footerBottom}>
          <span>© Greenatics S.A.S.</span>
          <span>Transformamos residuos en vida.</span>
        </div>
      </footer>
    </div>
  );
}
