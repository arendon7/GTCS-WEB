import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos personales",
  description: "Tratamiento de datos personales, Habeas Data (Ley 1581 de 2012) y confidencialidad en Greenatics.",
  alternates: { canonical: "/legal/privacidad/" },
};

export default function PrivacidadPage() {
  return (
    <div style={{ padding: "80px 0", background: "#f7faf5" }}>
      <div className="container" style={{ maxWidth: "860px", margin: "0 auto", background: "#ffffff", padding: "48px", borderRadius: "24px", border: "1px solid var(--line)" }}>
        <span className="eyebrow">Cumplimiento Legal & Habeas Data</span>
        <h1 style={{ fontSize: "2.2rem", color: "var(--green-950)", margin: "8px 0 20px" }}>
          Política de Tratamiento de Datos Personales
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
          En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> y el Decreto Reglamentario 1377 de 2013 de la República de Colombia, <strong>GREENATICS S.A.S.</strong> informa a clientes, agricultores, entidades públicas y usuarios de la plataforma digital que los datos personales recolectados a través de formularios, cotizaciones o registros operativos son tratados con absoluta confidencialidad y bajo estrictos protocolos de seguridad.
        </p>

        <h3 style={{ color: "var(--green-950)", marginTop: "28px" }}>1. Finalidad del Tratamiento</h3>
        <ul style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.7, paddingLeft: "20px" }}>
          <li>Gestión y respuesta a cotizaciones comerciales de productos Wondergreen y servicios de ingeniería.</li>
          <li>Emisión de balances de masa, reportes de pesaje y certificados de aprovechamiento en GREENATICS OPS.</li>
          <li>Agendamiento de reuniones técnicas y visitas de campo con el equipo agronómico y ambiental.</li>
          <li>Envío de literatura técnica, guías de cultivo y actualizaciones normativas relevantes.</li>
        </ul>

        <h3 style={{ color: "var(--green-950)", marginTop: "28px" }}>2. Derechos del Titular</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.7 }}>
          Usted tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de sus datos personales en cualquier momento escribiendo a <strong>contacto@greenatics.com</strong> o radicando solicitud en nuestra sede corporativa en Medellín (Cra 43b # 14–51, Oficina 204).
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
