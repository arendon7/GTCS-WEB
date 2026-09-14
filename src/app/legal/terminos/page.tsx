import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de servicio y Product Truth",
  description: "Términos de uso, límites de responsabilidad y principio de transparencia técnica en Greenatics.",
  alternates: { canonical: "/legal/terminos/" },
};

export default function TerminosPage() {
  return (
    <div style={{ padding: "80px 0", background: "#f7faf5" }}>
      <div className="container" style={{ maxWidth: "860px", margin: "0 auto", background: "#ffffff", padding: "48px", borderRadius: "24px", border: "1px solid var(--line)" }}>
        <span className="eyebrow">Transparencia & Product Truth</span>
        <h1 style={{ fontSize: "2.2rem", color: "var(--green-950)", margin: "8px 0 20px" }}>
          Términos de Servicio y Criterios Técnicos
        </h1>
        
        <h3 style={{ color: "var(--green-950)", marginTop: "24px" }}>1. Principio de Verdad de Producto (Product Truth)</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.7 }}>
          Greenatics comunica información técnica a partir de fuentes identificadas, registros y evidencia disponible. Las guías públicas organizan criterios de decisión, pero no publican una prescripción universal; toda recomendación específica debe validar documentación vigente, diagnóstico y condiciones del caso.
        </p>

        <h3 style={{ color: "var(--green-950)", marginTop: "24px" }}>2. Servicios para Organizaciones y Entidades Públicas</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.7 }}>
          Los alcances contractuales, modelaciones tarifarias y dimensionamientos de plantas modulares se rigen estrictamente por los términos de referencia acordados con cada cliente (ESP, Municipio o Empresa). Las simulaciones de ahorro o impacto ambiental son estimaciones basadas en factores de emisión oficiales y tarifas vigentes.
        </p>

        <div style={{ marginTop: "36px", paddingTop: "20px", borderTop: "1px solid var(--line)" }}>
          <Link href="/" style={{ color: "var(--green-800)", fontWeight: 700, textDecoration: "none" }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
