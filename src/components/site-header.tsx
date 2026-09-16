"use client";

import React, { useState, useEffect } from "react";
import { UniversalSearchModal } from "@/components/universal-search-modal";
import Image from "next/image";
import Link from "next/link";
import { primaryNav } from "@/data/site";
import { runtimeLinks } from "@/lib/runtime-links";

const featuredTools = [
  { href: "/herramientas/", label: "Centro de herramientas", description: "Todas las plataformas y aplicaciones del sistema Greenatics" },
  { href: "/red/app/", label: "Red Aseo", description: "Territorio, generadores, rutas, PMIRS y evidencias" },
  { href: "/huella/", label: "Calcula tu Huella", description: "Inventario, indicadores y lectura de impacto" },
  { href: "/agroway/", label: "AGROWAY", description: "Aplicación de trazabilidad agrícola y datos de campo" },
  { href: "/sana/", label: "SANA", description: "Ecosistema de inversión en proyectos productivos" },
] as const;

export function SiteHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const opsUrl = runtimeLinks.opsApp || process.env.NEXT_PUBLIC_OPS_URL || "/acceso/";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


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
                  <Link href={item.href} className="nav-dropdown-trigger" aria-haspopup="menu" aria-expanded={isOpen} aria-controls={menuId}>
                    {item.label}
                    <span className="dropdown-arrow" aria-hidden="true">⌄</span>
                  </Link>
                  {isOpen && (
                    <div id={menuId} className="nav-dropdown-menu" role="menu">
                      {item.subitems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="nav-dropdown-item"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <strong>{sub.label}</strong>
                          {sub.description && <small>{sub.description}</small>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href} className="nav-link">
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
          <a className="button button--dark header-ops-btn" href={opsUrl}>
            <span className="ops-dot" aria-hidden="true" />
            Ingresar a OPS
          </a>
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" role="presentation" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="eyebrow">Menú de Navegación</span>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>
            <section className="mobile-drawer-tools" aria-labelledby="mobile-tools-title">
              <span className="eyebrow" id="mobile-tools-title">Herramientas y apps</span>
              <div className="mobile-drawer-tools__list">
                {featuredTools.map((tool) => (
                  <Link key={tool.href} href={tool.href} onClick={() => setMobileMenuOpen(false)}>
                    <strong>{tool.label}</strong>
                    <small>{tool.description}</small>
                  </Link>
                ))}
                <a href={opsUrl} onClick={() => setMobileMenuOpen(false)}>
                  <strong>GREENATICS OPS</strong>
                  <small>Operación, bitácora, volúmenes y control de actividades</small>
                </a>
              </div>
            </section>
            <div className="mobile-drawer-links">
              {primaryNav.map((item) => (
                <div key={item.href} className="mobile-nav-group">
                  <Link
                    href={item.href}
                    className="mobile-group-title"
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
              <a className="button button--dark" href={opsUrl}>
                Ingresar a GREENATICS OPS
              </a>
            </div>
          </div>
        </div>
      )}
      <UniversalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
