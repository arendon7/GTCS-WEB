import Image from "next/image";
import Link from "next/link";
import { OrganizationJsonLd } from "@/components/organization-json-ld";
import { PublicHeader } from "@/components/public-header";
import { publicFooterNav, publicSite } from "@/data/public-site";
import styles from "./public-shell.module.css";

type PublicShellProps = {
  children: React.ReactNode;
  ownsMain?: boolean;
};

export function PublicShell({ children, ownsMain = true }: PublicShellProps) {
  const content = ownsMain ? (
    <main id="public-main" className={styles.main} tabIndex={-1}>{children}</main>
  ) : (
    <div id="public-main" className={styles.main} tabIndex={-1}>{children}</div>
  );

  return (
    <div className={styles.site}>
      <OrganizationJsonLd />
      <a className={styles.skipLink} href="#public-main">Saltar al contenido</a>

      <PublicHeader />

      {content}

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Link href="/" aria-label="Greenatics, inicio">
              <Image src="/brand/greenatics-horizontal.webp" alt="Greenatics" width={360} height={66} sizes="180px" />
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
                link.href === "/app" ? (
                  <a href={link.href} key={link.href}>{link.label}</a>
                ) : (
                  <Link href={link.href} key={link.href}>{link.label}</Link>
                )
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
