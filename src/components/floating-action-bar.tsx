"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function FloatingActionBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isPortfolioVisible, setIsPortfolioVisible] = useState(false);
  const [isToolsVisible, setIsToolsVisible] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsScrolled(window.scrollY > 520);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    const hero = document.querySelector(".home-system-hero");
    const tools = document.querySelector(".home-tools-bridge");
    const portfolio = document.querySelector(".home-portfolio-bridge");
    const footer = document.querySelector(".site-footer");
    setIsHomePage(Boolean(hero));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) setIsHeroVisible(entry.isIntersecting);
        if (entry.target === tools) setIsToolsVisible(entry.isIntersecting);
        if (entry.target === portfolio) setIsPortfolioVisible(entry.isIntersecting);
        if (entry.target === footer) setIsFooterVisible(entry.isIntersecting);
      });
    });
    if (hero) observer.observe(hero);
    if (tools) observer.observe(tools);
    if (portfolio) observer.observe(portfolio);
    if (footer) observer.observe(footer);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      observer.disconnect();
    };
  }, []);

  const isVisible = !isHomePage && isScrolled && !isHeroVisible && !isToolsVisible && !isPortfolioVisible && !isFooterVisible;

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
