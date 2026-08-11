import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found-page">
      <div className="container not-found-card">
        <img src="/brand/greenatics-symbol.svg" alt="" aria-hidden="true" />
        <span className="eyebrow">404 · Greenatics</span>
        <h1>Esta ruta no existe o cambió.</h1>
        <p className="lead">Puedes volver al inicio, explorar Wondergreen o usar el diagnóstico para encontrar la solución adecuada.</p>
        <div className="button-row">
          <Link className="button button--primary" href="/">Volver al inicio</Link>
          <Link className="button button--ghost" href="/diagnostico/">Hacer diagnóstico</Link>
        </div>
      </div>
    </section>
  );
}
