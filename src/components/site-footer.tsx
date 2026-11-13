"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const footerGroups = [
  {
    title: "Por segmento",
    links: [
      { href: "/municipios/", label: "Municipios y ESP · PGIRS" },
      { href: "/empresas/", label: "Organizaciones y grandes generadores · PMIRS" },
      { href: "/agroindustria/", label: "Agroindustria" },
      { href: "/wondergreen/", label: "Wondergreen y productores" },
      { href: "/casa-jardin/", label: "Casa y Jardín" },
    ],
  },
  {
    title: "Explora Greenatics",
    links: [
      { href: "/servicios/", label: "Servicios" },
      { href: "/portafolio/", label: "Portafolio" },
      { href: "/proyectos/", label: "Proyectos" },
      { href: "/impacto/", label: "Impacto y metodología" },
      { href: "/herramientas/", label: "Herramientas digitales" },
      { href: "/recursos/", label: "Recursos y biblioteca" },
      { href: "/nosotros/", label: "Nosotros" },
      { href: "/contacto/", label: "Contacto" },
    ],
  },
] as const;

export function SiteFooter() {
  const pathname = usePathname() || "/";
  if (pathname.replace(/\/+$/, "") === "/huella") {
    return (
      <footer className="huella-site-footer">
        <div className="container huella-site-footer__main">
          <div className="huella-site-footer__brand">
            <Link href="/huella/" aria-label="Back 2 Green, inicio">
              <Image src="/brand/calcula-tu-huella/brand-primary.svg?v=back2green-20261014" alt="Back 2 Green" width={563} height={219} />
            </Link>
            <p>Inventario corporativo de emisiones para empresas de distintos sectores, con autogestión y acompañamiento profesional.</p>
          </div>
          <nav aria-label="Enlaces de Back 2 Green">
            <Link href="#recorrido">Cómo funciona</Link>
            <Link href="#planes">Planes y precios</Link>
            <Link href="#rutas-de-reporte">Normativa en Colombia</Link>
            <Link href="/contacto/?interes=calcula-tu-huella">Hablar con un especialista</Link>
          </nav>
          <nav aria-label="Más de Greenatics e información legal">
            <Link href="/herramientas/">Explorar todas las herramientas</Link>
            <Link href="/legal/privacidad/">Privacidad</Link>
            <Link href="/legal/terminos/">Términos</Link>
            <Link href="/">Greenatics</Link>
          </nav>
        </div>
        <div className="container huella-site-footer__bottom">
          <span>Back 2 Green · Colombia</span>
          <span>Una herramienta de GREENATICS S.A.S.</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link className="site-footer__logo" href="/" aria-label="Greenatics inicio">
            <Image
              alt="Greenatics"
              className="official-logo"
              height={66}
              src="/brand/greenatics-horizontal.webp"
              width={360}
            />
          </Link>
          <p>
            Sistemas territoriales para convertir residuos orgánicos en capacidad operativa,
            información verificable y valor para el suelo.
          </p>
        </div>

        {footerGroups.map((group) => (
          <nav aria-label={group.title} className="site-footer__group" key={group.title}>
            <strong>{group.title}</strong>
            {group.links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="container site-footer__details">
        <div>
          <strong>Medellín, Colombia</strong>
          <span>Cra 43b # 14–51 · Oficina 204 · Centro Empresarial Alcalá</span>
        </div>
        <div>
          <span>Marco aplicable según servicio, territorio y alcance contratado.</span>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <small>© {new Date().getFullYear()} Greenatics S.A.S.</small>
        <div>
          <Link href="/legal/privacidad/">Privacidad</Link>
          <Link href="/legal/terminos/">Términos</Link>
        </div>
      </div>
    </footer>
  );
}
