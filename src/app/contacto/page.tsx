import type { Metadata } from "next";
import Link from "next/link";
import { InteractiveContactForm } from "@/components/interactive-contact-form";

export const metadata: Metadata = {
  title: "Contacto y agendamiento técnico",
  description: "Cuéntanos qué quieres resolver. Agenda directamente una sesión técnica o envía tu caso al equipo de ingenieros de Greenatics en Colombia.",
  alternates: { canonical: "/contacto/" },
};

const faqs = [
  {
    q: "¿Cómo se contrata una planta modular con una alcaldía o ESP?",
    a: "Estructuramos proyectos bajo la modalidad de convenios interadministrativos, licitaciones públicas de aseo o alianzas público-privadas con viabilidad MGA y cumplimiento de la Res. 0754 (PGIRS) y la CRA 720."
  },
  {
    q: "¿Cómo se aplica la deducción tributaria del 25% (Art. 255 E.T.)?",
    a: "Elaboramos el Documento Técnico Ambiental (DTA) y radicamos el trámite ante la ANLA (Ventanilla VITAL) para obtener la certificación que descuenta directamente el 25% de la inversión en la declaración de renta y excluye el 19% de IVA."
  },
  {
    q: "¿Cuáles son los tiempos de entrega de fertilizantes Wondergreen?",
    a: "Despachamos desde bultos individuales de 40 kg hasta viajes completos de 10 y 30 toneladas a nivel nacional en menos de 72 a 96 horas hábiles según el departamento."
  },
  {
    q: "¿Podemos agendar una visita técnica a la Planta de Yarumal?",
    a: "Sí, coordinamos visitas técnicas guiadas para alcaldes, directores de servicios públicos, concejales, gremios agrícolas y comités de sostenibilidad ambiental."
  }
];

export default function ContactoPage() {
  return (
    <div style={{ background: "#f8faf6", color: "var(--green-950)", overflowX: "hidden" }}>
      
      {/* 1. HERO SECTION EXPANSIVO (1440px+) */}
      <section className="aurora-hero" style={{ padding: "90px 0 70px" }}>
        <div className="container">
          <div style={{ maxWidth: "880px", margin: "0 auto 40px", textAlign: "center" }}>
            <div className="eyebrow-badge" style={{ marginBottom: "20px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#98cf4f", display: "inline-block", boxShadow: "0 0 10px #98cf4f" }} />
              <span>Canal Directo de Ingeniería · Greenatics Colombia</span>
            </div>

            <h1 style={{ color: "#ffffff", marginBottom: "20px" }}>
              Estructuremos tu proyecto de <em style={{ fontStyle: "normal", color: "var(--lime-400)" }}>aprovechamiento o nutrición vegetal</em>
            </h1>

            <p className="lead" style={{ color: "#cbdcd3", marginBottom: "36px" }}>
              Comparte el contexto, la evidencia disponible y la decisión que necesitas tomar. El equipo revisará si el siguiente paso es una orientación, un diagnóstico, una visita o una propuesta de alcance.
            </p>
          </div>

          {/* Floating Metrics Bar (1440px Wide) */}
          <div className="contact-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", background: "rgba(10, 41, 32, 0.8)", border: "1.5px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-lg)", padding: "24px 32px", backdropFilter: "blur(20px)", color: "#ffffff" }}>
            <div>
              <strong style={{ fontSize: "1.65rem", color: "var(--lime-400)", display: "block" }}>&lt; 24 Horas</strong>
              <span style={{ fontSize: "0.78rem", color: "#a8c7b8" }}>Tiempo de Respuesta Técnico</span>
            </div>
            <div>
              <strong style={{ fontSize: "1.65rem", color: "#ffffff", display: "block" }}>Proforma Oficial</strong>
              <span style={{ fontSize: "0.78rem", color: "#a8c7b8" }}>Validez Fiscal & Presupuestal</span>
            </div>
            <div>
              <strong style={{ fontSize: "1.65rem", color: "var(--lime-400)", display: "block" }}>Visitas a Planta</strong>
              <span style={{ fontSize: "0.78rem", color: "#a8c7b8" }}>Agendamiento en Yarumal</span>
            </div>
            <div>
              <strong style={{ fontSize: "1.65rem", color: "#ffffff", display: "block" }}>Canal Directo</strong>
              <span style={{ fontSize: "0.78rem", color: "#a8c7b8" }}>WhatsApp con Ingenieros</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FORM & DIRECTORY GRID (1440px+ WIDE) */}
      <section style={{ padding: "100px 0", background: "#ffffff", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="contact-layout" style={{ display: "grid", gridTemplateColumns: "1.25fr 0.85fr", gap: "clamp(36px, 4vw, 64px)", alignItems: "flex-start" }}>
            
            {/* Left: Interactive Smart Contact Form */}
            <InteractiveContactForm />

            {/* Right: Direct Headquarters & Technical Lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Corporate Card */}
              <div style={{ background: "linear-gradient(145deg, #07261d 0%, #03150f 100%)", color: "#ffffff", padding: "36px", borderRadius: "var(--radius-lg)", border: "1.5px solid rgba(255, 255, 255, 0.15)", boxShadow: "var(--shadow-card-dark)" }}>
                <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--lime-400)", fontWeight: 800 }}>
                  Sedes de Operación en Colombia
                </span>
                <h3 style={{ fontSize: "1.45rem", color: "#ffffff", margin: "6px 0 16px" }}>
                  Ingeniería en Territorio
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                  <div>
                    <strong style={{ color: "var(--lime-400)", fontSize: "0.9rem", display: "block" }}>🏢 Sede Administrativa & I+D:</strong>
                    <p style={{ margin: 0, fontSize: "0.86rem", color: "#cbdcd3", lineHeight: 1.5 }}>
                      Medellín, Antioquia · Alianza Científica con la Universidad de Antioquia (GIEM).
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: "var(--lime-400)", fontSize: "0.9rem", display: "block" }}>🏭 Planta Piloto de Bioprocesos:</strong>
                    <p style={{ margin: 0, fontSize: "0.86rem", color: "#cbdcd3", lineHeight: 1.5 }}>
                      Municipio de Yarumal, Antioquia · Recepción de biomasa y biofábrica Wondergreen.
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "18px" }}>
                  <small style={{ color: "#a8c7b8", fontSize: "0.74rem", display: "block", marginBottom: "4px" }}>Línea Directa / WhatsApp:</small>
                  <strong style={{ fontSize: "1.25rem", color: "#ffffff", display: "block" }}>+57 300 307 8822</strong>
                  <small style={{ color: "#a8c7b8", fontSize: "0.74rem", display: "block", marginTop: "8px" }}>Correo Oficial:</small>
                  <strong style={{ fontSize: "0.92rem", color: "#cbdcd3" }}>contacto@greenatics.co</strong>
                </div>
              </div>

              {/* Quick Tools Box */}
              <div style={{ background: "#fafcf9", padding: "28px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--line)" }}>
                <span className="eyebrow">Autoservicio Digital</span>
                <h4 style={{ margin: "4px 0 16px", color: "var(--green-950)", fontSize: "1.1rem" }}>¿Prefieres simular antes de hablar?</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Link href="/wondergreen/calculadora/" style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#ffffff", borderRadius: "12px", border: "1px solid var(--line)", textDecoration: "none", fontSize: "0.86rem", color: "var(--green-950)", fontWeight: 700 }}>
                    <span>Orientación agronómica Wondergreen</span>
                    <span>→</span>
                  </Link>
                  <Link href="/soluciones/beneficio-tributario/" style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#ffffff", borderRadius: "12px", border: "1px solid var(--line)", textDecoration: "none", fontSize: "0.86rem", color: "var(--green-950)", fontWeight: 700 }}>
                    <span>Simulador de descuento en renta del 25%</span>
                    <span>→</span>
                  </Link>
                  <Link href="/huella/" style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#ffffff", borderRadius: "12px", border: "1px solid var(--line)", textDecoration: "none", fontSize: "0.86rem", color: "var(--green-950)", fontWeight: 700 }}>
                    <span>Calculadora de huella y metano ESG</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section style={{ padding: "100px 0", background: "#f8faf6", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "840px", margin: "0 auto 50px" }}>
            <span className="eyebrow">Resolución de Dudas</span>
            <h2 style={{ fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)", color: "var(--green-950)", margin: "8px 0 16px" }}>
              Preguntas Frecuentes de Contratación & Suministro
            </h2>
            <p className="lead" style={{ color: "var(--muted)" }}>
              Transparencia contractual y respuestas claras para comités de compras y juntas directivas.
            </p>
          </div>

          <div className="contact-faq-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "1.5px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontSize: "1.1rem", color: "var(--green-950)", margin: "0 0 10px", lineHeight: 1.3 }}>
                  {faq.q}
                </h3>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
