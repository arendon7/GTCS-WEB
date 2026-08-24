"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  publicPrimaryNav,
  publicResourceNav,
  publicSolutionAudiences,
  publicSolutionNeeds,
  type PublicMenuItem,
} from "@/data/public-navigation";
import styles from "./public-shell.module.css";

type DesktopMenu = "solutions" | "resources" | null;
type MobilePanel = "solutions" | "resources" | null;

function isCurrentPath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isPrimaryActive(pathname: string, label: string, href: string) {
  if (label === "Soluciones") return pathname.startsWith("/soluciones");
  if (label === "Recursos") {
    return ["/biblioteca", "/proyectos", "/impacto", "/recursos"].some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  }
  return isCurrentPath(pathname, href);
}

function MenuLink({ item, onNavigate }: { item: PublicMenuItem; onNavigate: () => void }) {
  return (
    <Link className={styles.menuLink} href={item.href} onClick={onNavigate}>
      <strong>{item.label}</strong>
      <span>{item.description}</span>
    </Link>
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const [desktopMenu, setDesktopMenu] = useState<DesktopMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (mobileOpen) {
        setMobileOpen(false);
        setMobilePanel(null);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      setDesktopMenu(null);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      mobileMenuRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function closeMobile() {
    setMobileOpen(false);
    setMobilePanel(null);
  }

  function trapMobileFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function renderMobileMenu() {
    if (mobilePanel === "solutions") {
      return (
        <>
          <button className={styles.mobileBack} type="button" onClick={() => setMobilePanel(null)}>
            <span aria-hidden="true">←</span> Volver
          </button>
          <div className={styles.mobilePanelHead}>
            <span>Soluciones Greenatics</span>
            <strong>Elige el servicio que necesitas o entra por tu tipo de organización.</strong>
          </div>
          <Link className={styles.mobileFeaturedLink} href="/soluciones" onClick={closeMobile}>
            Ver todas las soluciones <span aria-hidden="true">→</span>
          </Link>
          <div className={styles.mobileSectionLabel}>Por organización</div>
          <div className={styles.mobileLinkList}>
            {publicSolutionAudiences.map((item) => <MenuLink key={item.label} item={item} onNavigate={closeMobile} />)}
          </div>
          <div className={styles.mobileSectionLabel}>Por necesidad</div>
          <div className={styles.mobileLinkList}>
            {publicSolutionNeeds.map((item) => <MenuLink key={item.label} item={item} onNavigate={closeMobile} />)}
          </div>
          <Link className={styles.mobileDiagnostic} href="/soluciones/diagnostico-inicial" onClick={closeMobile}>
            <span>¿Todavía no sabes qué servicio revisar?</span>
            <strong>Usar orientador inicial</strong>
            <span aria-hidden="true">→</span>
          </Link>
        </>
      );
    }

    if (mobilePanel === "resources") {
      return (
        <>
          <button className={styles.mobileBack} type="button" onClick={() => setMobilePanel(null)}>
            <span aria-hidden="true">←</span> Volver
          </button>
          <div className={styles.mobilePanelHead}>
            <span>Recursos Greenatics</span>
            <strong>Aprender, ver experiencia y consultar impacto.</strong>
          </div>
          <div className={styles.mobileLinkList}>
            {publicResourceNav.map((item) => <MenuLink key={item.label} item={item} onNavigate={closeMobile} />)}
          </div>
        </>
      );
    }

    return (
      <>
        <div className={styles.mobilePanelHead}>
          <span>Navegación</span>
          <strong>Encuentra el universo Greenatics que necesitas.</strong>
        </div>
        <div className={styles.mobilePrimaryNav}>
          {publicPrimaryNav.map((item) => {
            const active = isPrimaryActive(pathname, item.label, item.href);
            if (item.menu) {
              return (
                <button
                  className={active ? styles.mobilePrimaryActive : undefined}
                  key={item.label}
                  type="button"
                  onClick={() => setMobilePanel(item.menu ?? null)}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true">→</span>
                </button>
              );
            }
            return (
              <Link className={active ? styles.mobilePrimaryActive : undefined} href={item.href} key={item.label} onClick={closeMobile}>
                <span>{item.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
        <div className={styles.mobileActions}>
          <Link className={styles.mobileTalk} href="/contacto" onClick={closeMobile}>Hablar con nosotros</Link>
          <a className={styles.mobileEnter} href="/app" onClick={closeMobile}>Ingresar</a>
        </div>
      </>
    );
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="Greenatics, inicio">
          <Image src="/brand/greenatics-horizontal.webp" alt="Greenatics" width={360} height={66} priority sizes="(max-width: 720px) 180px, 205px" />
        </Link>

        <nav className={styles.desktopNav} aria-label="Navegación pública">
          {publicPrimaryNav.map((item) => {
            const active = isPrimaryActive(pathname, item.label, item.href);
            const exact = isCurrentPath(pathname, item.href);
            if (!item.menu) {
              return (
                <Link className={active ? styles.navActive : undefined} href={item.href} key={item.label} aria-current={exact ? "page" : undefined}>
                  {item.label}
                </Link>
              );
            }

            const open = desktopMenu === item.menu;
            return (
              <div
                className={styles.navMenuGroup}
                key={item.label}
                onMouseEnter={() => setDesktopMenu(item.menu ?? null)}
                onMouseLeave={() => setDesktopMenu(null)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDesktopMenu(null);
                }}
              >
                <div className={styles.navMenuTrigger}>
                  <Link className={active ? styles.navActive : undefined} href={item.href} aria-current={exact ? "page" : undefined}>
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Abrir menú ${item.label}`}
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() => setDesktopMenu(open ? null : item.menu ?? null)}
                  >
                    <span aria-hidden="true">⌄</span>
                  </button>
                </div>

                {open && item.menu === "solutions" ? (
                  <div className={`${styles.megaMenu} ${styles.solutionsMenu}`} role="group" aria-label="Menú Soluciones">
                    <div className={styles.megaIntro}>
                      <span>Soluciones Greenatics</span>
                      <strong>Elige el servicio que necesitas o entra por tu tipo de organización.</strong>
                      <Link href="/soluciones" onClick={() => setDesktopMenu(null)}>Ver todas las soluciones →</Link>
                    </div>
                    <div className={styles.megaColumn}>
                      <span className={styles.megaLabel}>¿Quién eres?</span>
                      {publicSolutionAudiences.map((item) => <MenuLink key={item.label} item={item} onNavigate={() => setDesktopMenu(null)} />)}
                    </div>
                    <div className={styles.megaColumn}>
                      <span className={styles.megaLabel}>¿Qué necesitas resolver?</span>
                      {publicSolutionNeeds.map((item) => <MenuLink key={item.label} item={item} onNavigate={() => setDesktopMenu(null)} />)}
                    </div>
                    <Link className={styles.megaDiagnostic} href="/soluciones/diagnostico-inicial" onClick={() => setDesktopMenu(null)}>
                      <span>¿Todavía no sabes qué servicio revisar?</span>
                      <strong>Usar orientador inicial</strong>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                ) : null}

                {open && item.menu === "resources" ? (
                  <div className={`${styles.megaMenu} ${styles.resourcesMenu}`} role="group" aria-label="Menú Recursos">
                    <div className={styles.megaIntro}>
                      <span>Recursos Greenatics</span>
                      <strong>Conocimiento, experiencia e impacto en un mismo lugar.</strong>
                    </div>
                    <div className={styles.megaColumn}>
                      {publicResourceNav.map((item) => <MenuLink key={item.label} item={item} onNavigate={() => setDesktopMenu(null)} />)}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <Link className={styles.contact} href="/contacto">Hablar con nosotros</Link>
          <a className={styles.ops} href="/app">Ingresar</a>
          <button
            ref={menuButtonRef}
            className={styles.menuToggle}
            type="button"
            aria-label="Abrir navegación"
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
            onClick={() => {
              setMobileOpen((current) => !current);
              setMobilePanel(null);
            }}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <>
          <div className={styles.mobileBackdrop} aria-hidden="true" onClick={closeMobile} />
          <div
            ref={mobileMenuRef}
            className={styles.mobileMenu}
            id="public-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación Greenatics"
            onKeyDown={trapMobileFocus}
          >
            <div className={styles.mobileMenuTop}>
              <Image src="/brand/greenatics-horizontal.webp" alt="Greenatics" width={360} height={66} sizes="180px" />
              <button type="button" onClick={closeMobile} aria-label="Cerrar navegación">×</button>
            </div>
            <div className={styles.mobileMenuBody}>{renderMobileMenu()}</div>
          </div>
        </>
      ) : null}
    </header>
  );
}
