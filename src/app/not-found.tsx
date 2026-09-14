import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px", background: "#f7faf5" }}>
      <div style={{ maxWidth: "640px", textAlign: "center", background: "#ffffff", padding: "48px 36px", borderRadius: "24px", border: "1.5px solid var(--line)", boxShadow: "0 16px 44px rgba(0, 107, 69, 0.06)" }}>
        <span style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--green-800)", fontWeight: 800 }}>
          Error 404 · Ruta no encontrada
        </span>
        <h1 style={{ fontSize: "2.4rem", color: "var(--green-950)", margin: "8px 0 14px" }}>
          Esta página cambió de lugar o no existe
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.98rem", lineHeight: 1.6, marginBottom: "28px" }}>
          No te preocupes. Toda nuestra oferta técnica, portafolio de bioinsumos y recursos está organizada en tres universos claros:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
          <Link
            href="/soluciones"
            style={{ padding: "14px 10px", background: "#fafcf9", border: "1px solid var(--line)", borderRadius: "12px", textDecoration: "none", color: "var(--green-950)", fontSize: "0.84rem", fontWeight: 700 }}
          >
            🏢 Soluciones
          </Link>
          <Link
            href="/wondergreen"
            style={{ padding: "14px 10px", background: "#fafcf9", border: "1px solid var(--line)", borderRadius: "12px", textDecoration: "none", color: "var(--green-950)", fontSize: "0.84rem", fontWeight: 700 }}
          >
            🌾 Wondergreen
          </Link>
          <Link
            href="/casa-jardin"
            style={{ padding: "14px 10px", background: "#fafcf9", border: "1px solid var(--line)", borderRadius: "12px", textDecoration: "none", color: "var(--green-950)", fontSize: "0.84rem", fontWeight: 700 }}
          >
            🏡 Casa & Jardín
          </Link>
        </div>

        <Link className="button button--primary" href="/" style={{ display: "inline-block" }}>
          Volver al Inicio Principal →
        </Link>
      </div>
    </div>
  );
}
