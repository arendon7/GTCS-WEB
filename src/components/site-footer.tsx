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
          <strong>Soluciones</strong>
          <Link href="/servicios/">Todos los servicios</Link>
          <Link href="/municipios/">Municipios y ESP</Link>
          <Link href="/empresas/">Empresas y generadores</Link>
          <Link href="/tecnologia/">Tecnología y plantas</Link>
          <Link href="/proyectos/">Proyectos</Link>
          <Link href="/impacto/">Impacto y datos</Link>
        </div>
        <div>
          <strong>Producto y conocimiento</strong>
          <Link href="/wondergreen/">Wondergreen</Link>
          <Link href="/wondergreen/cultivos/">Guías por cultivo</Link>
          <Link href="/wondergreen/cotizador/">Cotizador</Link>
          <Link href="/biblioteca/">Biblioteca técnica</Link>
          <Link href="/diagnostico/">Diagnóstico Greenatics</Link>
          <Link href="/contacto/">Contacto</Link>
          <Link href="/acceso/">Acceso Greenatics</Link>
          <span>Medellín · Colombia</span>
        </div>
      </div>
    </footer>
  );
}
