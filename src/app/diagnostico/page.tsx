import type { Metadata } from "next";
import { DiagnosticRouter } from "@/components/diagnostic-router";

export const metadata: Metadata = {
  title: "Diagnóstico Greenatics",
  description: "Encuentra la ruta Greenatics adecuada según tu tipo de organización y la necesidad que quieres resolver.",
};

export default function DiagnosticPage() {
  return (
    <>
      <section className="diagnostic-hero">
        <div className="container diagnostic-hero-grid">
          <div><span className="eyebrow">Diagnóstico Greenatics</span><h1>Empieza por el problema, no por el producto.</h1><p className="lead">Dos preguntas bastan para orientarte hacia Wondergreen, gestión de residuos, prefactibilidad, tecnología, trazabilidad o una conversación técnica.</p></div>
          <aside><strong>Sin registro.</strong><p>Esta primera orientación funciona en tu navegador y no solicita datos personales. La recomendación es de ruta comercial/técnica, no una ingeniería ni prescripción agronómica.</p></aside>
        </div>
      </section>
      <section className="diagnostic-section"><div className="container"><DiagnosticRouter /></div></section>
    </>
  );
}
