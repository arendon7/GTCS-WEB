import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="greenatics-footer-logo-wrap"><img className="official-logo greenatics-footer-logo" src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" /></div>
          <p>Transformamos residuos en vida.</p>
          <Link href="/nosotros/">Conoce Greenatics →</Link>
        </div>
        <div>
          <strong>Explora</strong>
          <Link href="/wondergreen/">Wondergreen</Link>
          <Link href="/municipios/">Municipios y ESP</Link>
          <Link href="/empresas/">Empresas</Link>
          <Link href="/tecnologia/">Tecnología</Link>
          <Link href="/proyectos/">Proyectos</Link>
          <Link href="/impacto/">Impacto</Link>
          <Link href="/biblioteca/">Biblioteca técnica</Link>
        </div>
        <div>
          <strong>Plataforma</strong>
          <Link href="/diagnostico/">Diagnóstico Greenatics</Link>
          <Link href="/contacto/">Contacto</Link>
          <Link href="/acceso/">Acceso Greenatics</Link>
          <span>Medellín · Colombia</span>
        </div>
      </div>
    </footer>
  );
}
