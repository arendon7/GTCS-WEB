"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { UniversalSearchModal } from "@/components/universal-search-modal";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/data/site";
import { isLocalRuntime } from "@/data/digital-tools";
import { runtimeLinks } from "@/lib/runtime-links";

const normalizePath = (value: string) => {
  const path = value.split("?")[0].split("#")[0];
  return path === "/" ? "/" : path.replace(/\/+$/, "");
};

const pathMatches = (currentPath: string, targetPath: string) => {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);
  return current === target || (target !== "/" && current.startsWith(`${target}/`));
};

const navItemMatches = (currentPath: string, item: (typeof primaryNav)[number]) =>
  pathMatches(currentPath, item.href) || Boolean(item.subitems?.some((subitem) => pathMatches(currentPath, subitem.href)));

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const huellaMenuRef = useRef<HTMLDetailsElement>(null);
  const configuredOpsUrl = runtimeLinks.opsApp || process.env.NEXT_PUBLIC_OPS_URL;
  const isAccessHub = normalizePath(pathname) === "/acceso";
  const isHuellaPage = normalizePath(pathname) === "/huella";
  const hasPublicHuellaRuntime = Boolean(runtimeLinks.huella && !isLocalRuntime(runtimeLinks.huella));
  const hasLocalHuellaRuntime = Boolean(runtimeLinks.huella && isLocalRuntime(runtimeLinks.huella));
  const opsUrl = configuredOpsUrl || (isAccessHub ? "/app/#estacion" : "/acceso/");
  const opsLabel = configuredOpsUrl
    ? "Ingresar a OPS"
    : isAccessHub
      ? "Explorar muestra de OPS"
      : "Herramientas y acceso";
  const headerAppUrl = isHuellaPage
    ? hasPublicHuellaRuntime ? `${runtimeLinks.huella}/login` : hasLocalHuellaRuntime ? "/huella/#planes-heading-start" : "/huella/#plataforma"
    : opsUrl;
  const headerAppLabel = isHuellaPage
    ? hasPublicHuellaRuntime ? "Entrar a Huella" : hasLocalHuellaRuntime ? "Ver planes y precios" : "Ver módulos de Huella"
      : opsLabel;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        const focusedDropdown = document.activeElement?.closest<HTMLElement>(".nav-dropdown-wrapper");
        if (focusedDropdown) {
          focusedDropdown.querySelector<HTMLElement>(".nav-dropdown-trigger")?.focus();
        }
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      mobileToggleRef.current?.focus();
    };
  }, [mobileMenuOpen]);

  if (isHuellaPage) {
    const productAccessHref = hasPublicHuellaRuntime || hasLocalHuellaRuntime
      ? `${runtimeLinks.huella}/login`
      : "/acceso/#calcula-tu-huella";
    const externalAccess = productAccessHref.startsWith("http");
    const closeHuellaMenu = () => {
      if (huellaMenuRef.current) huellaMenuRef.current.open = false;
    };

    return (
      <header className="site-header huella-site-header">
        <div className="container huella-site-header__inner">
          <Link className="huella-site-header__brand" href="/huella/" aria-label="Back 2 Green, inicio">
            <Image src="/brand/calcula-tu-huella/brand-primary.svg?v=back2green-20261014" alt="Back 2 Green" width={563} height={219} preload />
          </Link>
          <Link className="huella-site-header__site-link" href="/">Sitio Greenatics</Link>
          <nav className="huella-site-header__nav" aria-label="Navegación de Back 2 Green">
            <a href="#recorrido">Cómo funciona</a>
            <a href="#planes">Planes</a>
            <a href="#rutas-de-reporte">Normativa</a>
          </nav>
          <div className="huella-site-header__actions">
            <a className="huella-site-header__plans" href="#planes">Ver planes</a>
            <a className="huella-site-header__access" href={productAccessHref} target={externalAccess ? "_blank" : undefined} rel={externalAccess ? "noopener noreferrer" : undefined}>
              Entrar <span aria-hidden="true">↗</span>
            </a>
          </div>
          <details className="huella-site-header__mobile-menu" ref={huellaMenuRef}>
            <summary aria-label="Abrir navegación de Back 2 Green">Menú</summary>
            <nav aria-label="Navegación de Back 2 Green y Greenatics">
              <a href="#recorrido" onClick={closeHuellaMenu}>Cómo funciona</a>
              <a href="#planes" onClick={closeHuellaMenu}>Planes y precios</a>
              <a href="#rutas-de-reporte" onClick={closeHuellaMenu}>Normativa</a>
              <a href={productAccessHref} target={externalAccess ? "_blank" : undefined} rel={externalAccess ? "noopener noreferrer" : undefined} onClick={closeHuellaMenu}>Entrar a la plataforma</a>
              <div className="huella-site-header__global-links" role="group" aria-label="Secciones del sitio Greenatics">
                <span>Explorar Greenatics</span>
                <Link href="/" onClick={closeHuellaMenu}>Inicio Greenatics</Link>
                {primaryNav.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeHuellaMenu}>{item.label}</Link>
                ))}
              </div>
            </nav>
          </details>
        </div>
      </header>
    );
  }


  return (
    <header className="site-header site-header--v2">
      <div className="container header-inner">
        <Link className="brand-link" href="/" aria-label="Greenatics inicio">
          <Image
            className="official-logo greenatics-header-logo"
            src="/brand/greenatics-horizontal.webp"
            alt="Greenatics"
            width="360"
            height="66"
            preload
          />
        </Link>

        {/* Desktop Navigation with Dropdowns */}
        <nav className="desktop-nav" aria-label="Navegación principal">
          {primaryNav.map((item) => {
            if (item.subitems && item.subitems.length > 0) {
              const isOpen = activeDropdown === item.label;
              const isCurrent = navItemMatches(pathname, item);
              const menuId = `nav-menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <div
                  key={item.href}
                  className="nav-dropdown-wrapper"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                  onFocusCapture={() => setActiveDropdown(item.label)}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      setActiveDropdown(null);
                    }
                  }}
                >
                  <Link href={item.href} className="nav-dropdown-trigger" aria-expanded={isOpen} aria-controls={menuId} aria-current={isCurrent ? "page" : undefined}>
                    {item.label}
                    <span className="dropdown-arrow" aria-hidden="true">⌄</span>
                  </Link>
                  <div
                    id={menuId}
                    className="nav-dropdown-menu"
                    role="group"
                    aria-label={`Enlaces de ${item.label}`}
                    hidden={!isOpen}
                  >
                    {item.subitems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="nav-dropdown-item"
                        aria-current={pathMatches(pathname, sub.href) ? "page" : undefined}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <strong>{sub.label}</strong>
                        {sub.description && <small>{sub.description}</small>}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href} className="nav-link" aria-current={pathMatches(pathname, item.href) ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="header-search-btn"
            aria-label="Abrir búsqueda"
          >
            <span aria-hidden="true">⌕</span>
            <span>Buscar</span>
            <kbd>⌘K</kbd>
          </button>
          <Link className="button button--ghost header-contact-btn" href="/contacto/">
            Hablar con nosotros
          </Link>
          <a className="button button--dark header-ops-btn" href={headerAppUrl}>
            <span className="ops-dot" aria-hidden="true" />
            {headerAppLabel}
          </a>
          <button
            type="button"
            className="mobile-toggle-btn"
            ref={mobileToggleRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && createPortal(
        <div className="mobile-drawer-overlay" role="presentation" onClick={() => setMobileMenuOpen(false)}>
          <div
            id="mobile-navigation-drawer"
            className="mobile-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
              );
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (!first || !last) return;
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
          >
            <div className="mobile-drawer-header">
              <span className="eyebrow" id="mobile-navigation-title">Menú de navegación</span>
              <button
                type="button"
                className="mobile-drawer-close"
                ref={mobileCloseRef}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>
            <div className="mobile-drawer-links">
              {primaryNav.map((item) => (
                <div key={item.href} className="mobile-nav-group">
                  <Link
                    href={item.href}
                    className="mobile-group-title"
                    aria-current={navItemMatches(pathname, item) ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.subitems && (
                    <div className="mobile-group-subitems">
                      {item.subitems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          aria-current={pathMatches(pathname, sub.href) ? "page" : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mobile-drawer-actions">
              <Link
                className="button button--primary"
                href="/contacto/"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hablar con nosotros
              </Link>
              <a className="button button--dark" href={headerAppUrl}>
                {headerAppLabel}
              </a>
            </div>
          </div>
        </div>,
        document.body,
      )}
      <UniversalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
