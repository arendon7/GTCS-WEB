import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  {
    title: "Rutas",
    links: [
      { href: "/municipios/", label: "Municipios y ESP" },
      { href: "/empresas/", label: "Empresas y generadores" },
      { href: "/wondergreen/", label: "Agro y distribución" },
      { href: "/casa-jardin/", label: "Casa y jardín" },
    ],
  },
  {
    title: "Sistema",
    links: [
      { href: "/plataforma/", label: "Centro Greenatics" },
      { href: "/soluciones/", label: "Sistema Greenatics" },
      { href: "/servicios/", label: "Servicios" },
      { href: "/tecnologia/", label: "Plantas y tecnología" },
      { href: "/app/", label: "GREENATICS OPS" },
      { href: "/agroway/", label: "AGROWAY" },
      { href: "/sana/", label: "SANA" },
    ],
  },
  {
    title: "Evidencia y apoyo",
    links: [
      { href: "/proyectos/", label: "Casos en territorio" },
      { href: "/impacto/", label: "Impacto y metodología" },
      { href: "/biblioteca/", label: "Biblioteca técnica" },
      { href: "/nosotros/", label: "Nosotros" },
      { href: "/contacto/", label: "Contacto" },
    ],
  },
] as const;

export function SiteFooter() {
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
          <Link className="site-footer__diagnostic" href="/diagnostico/">
            Encontrar mi ruta <span aria-hidden="true">→</span>
          </Link>
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
