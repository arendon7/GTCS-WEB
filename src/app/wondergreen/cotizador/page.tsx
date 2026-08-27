import type { Metadata } from "next";
import Link from "next/link";
import { QuoteBuilder } from "@/components/quote-builder";

export const metadata: Metadata = {
  title: "Cotizador Wondergreen",
  description: "Calcula un valor estimado con los precios reconciliados incorporados a esta versión del catálogo Wondergreen.",
};

export default function QuotePage() {
  return (
    <>
      <section className="quote-hero">
        <div className="container quote-hero-grid">
          <div>
            <Link className="back-link" href="/wondergreen/">← Volver a Wondergreen</Link>
            <span className="eyebrow">Cotizador de catálogo</span>
            <h1>Arma una estimación antes de hablar con nosotros.</h1>
            <p className="lead">Selecciona referencias y cantidades. El cálculo usa los precios reconciliados incorporados a este corte de la web.</p>
          </div>
          <div className="quote-rule-card"><strong>Importante</strong><p>Esta herramienta no confirma disponibilidad ni reemplaza la recomendación técnica. Para compras por volumen, logística o condiciones especiales, cerramos la propuesta con el equipo Greenatics.</p></div>
        </div>
      </section>
      <section className="quote-section"><div className="container"><QuoteBuilder /></div></section>
    </>
  );
}
