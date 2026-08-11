import Link from "next/link";
import { BrandName } from "@/components/brand-name";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <BrandName inverse />
          <p>Transformamos residuos en vida.</p>
        </div>
        <div>
          <strong>Explora</strong>
          <Link href="/wondergreen/">Wondergreen</Link>
          <Link href="/municipios/">Municipios y ESP</Link>
          <Link href="/contacto/">Contacto</Link>
        </div>
        <div>
          <strong>Plataforma</strong>
          <Link href="/acceso/">Acceso Greenatics</Link>
          <span>Medellín · Colombia</span>
        </div>
      </div>
    </footer>
  );
}
