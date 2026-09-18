import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { QuoteBuilder } from "@/components/quote-builder";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Cotizador Wondergreen",
  description: "Calcula un valor estimado con los precios vigentes del catálogo Wondergreen.",
  alternates: { canonical: "/wondergreen/cotizador/" },
  openGraph: {
    title: "Cotizador Wondergreen",
    description: "Calcula un valor estimado con los precios vigentes del catálogo Wondergreen.",
    url: "/wondergreen/cotizador/",
  },
};

export default function QuotePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Wondergreen", url: `${site.url}/wondergreen/` }, { name: "Cotizador", url: `${site.url}/wondergreen/cotizador/` }]} />
      <section className="quote-hero">
        <div className="container quote-hero-grid">
          <div>
            <Link className="back-link" href="/wondergreen/">← Volver a Wondergreen</Link>
            <span className="eyebrow">Cotizador de catálogo</span>
            <h1>Arma una estimación antes de hablar con nosotros.</h1>
            <p className="lead">Selecciona referencias y cantidades. El cálculo usa los precios de catálogo vigentes incorporados a esta versión.</p>
          </div>
          <div className="quote-rule-card"><strong>Importante</strong><p>Esta herramienta no confirma disponibilidad ni reemplaza la recomendación técnica. Para compras por volumen, logística o condiciones especiales, cerramos la propuesta con el equipo Greenatics.</p></div>
        </div>
      </section>
      <section className="quote-section"><div className="container"><QuoteBuilder /></div></section>
    </>
  );
}
