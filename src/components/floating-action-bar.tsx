"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function FloatingActionBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsScrolled(window.scrollY > 520);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    const hero = document.querySelector(".home-system-hero");
    const footer = document.querySelector(".site-footer");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) setIsHeroVisible(entry.isIntersecting);
        if (entry.target === footer) setIsFooterVisible(entry.isIntersecting);
      });
    });
    if (hero) observer.observe(hero);
    if (footer) observer.observe(footer);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      observer.disconnect();
    };
  }, []);

  const isVisible = isScrolled && !isHeroVisible && !isFooterVisible;

  return (
    <aside
      aria-hidden={!isVisible}
      aria-label="Acciones rápidas Greenatics"
      className={`floating-action-bar${isVisible ? " is-visible" : ""}`}
    >
      <Link className="floating-action-bar__primary" href="/diagnostico/" tabIndex={isVisible ? 0 : -1}>
        Orientar mi proyecto
      </Link>
      <Link className="floating-action-bar__secondary" href="/wondergreen/cotizador/" tabIndex={isVisible ? 0 : -1}>
        Cotizar Wondergreen
      </Link>
    </aside>
  );
}
