import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid footer-grid--v10">
        <div className="footer-brand-column">
          <div className="greenatics-footer-logo-wrap"><img className="official-logo greenatics-footer-logo" src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" /></div>
          <p>Transformamos residuos en vida.</p>
          <Link href="/nosotros/">Conoce Greenatics →</Link>
        </div>
        <div>
          <strong>Soluciones</strong>
          <Link href="/servicios/">Todos los servicios</Link>
          <Link href="/municipios/">Municipios y ESP</Link>
          <Link href="/empresas/">Empresas y generadores</Link>
          <Link href="/tecnologia/">Plantas y tecnología</Link>
          <Link href="/parque-ambiental/">Parque Ambiental</Link>
        </div>
        <div>
          <strong>Wondergreen</strong>
          <Link href="/wondergreen/">Portafolio</Link>
          <Link href="/wondergreen/cultivos/">Guías por cultivo</Link>
          <Link href="/wondergreen/cotizador/">Cotizador</Link>
          <Link href="/wondergreen/hogar/">Casa y Jardín · Próximamente</Link>
        </div>
        <div>
          <strong>Recursos</strong>
          <Link href="/proyectos/">Proyectos</Link>
          <Link href="/impacto/">Impacto y datos</Link>
          <Link href="/biblioteca/">Biblioteca técnica</Link>
          <Link href="/diagnostico/">Diagnóstico</Link>
        </div>
        <div>
          <strong>Greenatics</strong>
          <Link href="/nosotros/">Nosotros</Link>
          <Link href="/contacto/">Contacto</Link>
          <Link href="/acceso/">Acceso Greenatics</Link>
          <span>Medellín · Colombia</span>
        </div>
      </div>
    </footer>
  );
}
