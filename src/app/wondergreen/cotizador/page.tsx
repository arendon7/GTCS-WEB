import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { QuoteBuilder } from "@/components/quote-builder";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Wondergreen | Orientación de compra",
  description: "Encuentra la referencia Wondergreen adecuada para tu cultivo y lleva el contexto del lote al equipo técnico.",
  alternates: { canonical: "/wondergreen/" },
  robots: { index: false, follow: true },
};

export default function WondergreenGuidancePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Wondergreen", url: `${site.url}/wondergreen/` }]} />
      <section className="quote-hero">
        <div className="container quote-hero-grid">
          <div>
            <Link className="back-link" href="/wondergreen/">← Volver a Wondergreen</Link>
            <span className="eyebrow">Orientación Wondergreen</span>
            <h1>La decisión empieza por la referencia y el contexto del lote.</h1>
            <p className="lead">Revisa el portafolio, lee la ficha de cada referencia y comparte con el equipo el cultivo, la etapa, el área y la necesidad real para orientar la selección.</p>
          </div>
          <div className="quote-rule-card"><strong>Cómo elegir</strong><p>La disponibilidad, la presentación, la logística y la orientación de uso se coordinan con la referencia y el contexto correctos.</p></div>
        </div>
      </section>
      <section className="quote-section" aria-labelledby="quote-builder-title">
        <div className="container">
          <div className="wg-v4-heading"><div><span className="eyebrow">Solicitud de cotización</span><h2 id="quote-builder-title">Arma una lista de referencias para revisar con el equipo.</h2></div><p>Elige productos y cantidades. Antes de emitir una oferta, Greenatics confirmará precio, disponibilidad, logística y alcance técnico.</p></div>
          <QuoteBuilder />
          <p className="quote-delivery-note">La selección se conserva en la sesión de esta pestaña para que puedas volver al borrador; puedes vaciarla desde el resumen. La solicitud se comparte por WhatsApp o mediante el formulario de contacto, cuando tú decidas continuar. No se reciben pagos, comprobantes ni pedidos confirmados desde esta página.</p>
          <div className="button-row"><Link className="button button--ghost" href="/wondergreen/#productos">Volver al portafolio Wondergreen</Link></div>
        </div>
      </section>
    </>
  );
}
