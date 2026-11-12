import type { Metadata } from "next";
import Link from "next/link";
import { InteractiveContactForm } from "@/components/interactive-contact-form";

export const metadata: Metadata = {
  title: "Contacto Greenatics",
  description: "Cuéntanos qué necesitas sobre productos, servicios o herramientas Greenatics. Revisa el resumen y elige si lo envías por WhatsApp o correo.",
  alternates: { canonical: "/contacto/" },
};

const faqs = [
  {
    q: "¿Qué información conviene traer a la primera conversación?",
    a: "Una descripción del flujo o cultivo, ubicación, escala aproximada, etapa del proyecto, restricciones conocidas y la decisión que debe tomarse. Si ya existen pesajes, análisis, rutas, planos o registros, podemos usarlos para ordenar el siguiente paso."
  },
  {
    q: "¿Cómo se define una propuesta o un suministro?",
    a: "Primero se aclaran alcance, producto o servicio, escala, evidencia disponible y condiciones de operación. La presentación, disponibilidad, precio, dosis, etiqueta vigente y entrega se confirman en la conversación técnica y comercial correspondiente."
  },
  {
    q: "¿Podemos coordinar una visita técnica?",
    a: "Podemos revisar la pertinencia de una visita a Yarumal u otro punto de operación. La fecha, el alcance, las personas participantes y las condiciones de acceso se acuerdan antes de confirmarla."
  }
];

export default function ContactoPage() {
  return (
    <div className="contact-page">
      <section className="aurora-hero contact-hero">
        <div className="container">
          <div className="contact-hero__copy">
            <div className="eyebrow-badge contact-hero__eyebrow">
              <span aria-hidden="true" />
              <span>Productos, servicios y herramientas Greenatics</span>
            </div>

            <h1>
              Cuéntanos qué <em>quieres resolver</em>
            </h1>

            <p className="lead">
              Atendemos consultas sobre gestión y valorización de residuos, productos agrícolas, casa y jardín y soluciones digitales. Comparte el contexto y la decisión pendiente para orientar contigo el siguiente paso.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-workbench">
        <div className="container contact-workbench__grid">
            <InteractiveContactForm />

            <aside className="contact-side-rail" aria-label="Canales de atención y recursos">
              <section className="contact-channels">
                <span className="contact-eyebrow">Canales de atención</span>
                <h2>Hablemos con el equipo adecuado.</h2>
                <div className="contact-channels__locations">
                  <div>
                    <strong>Medellín · Coordinación</strong>
                    <p>
                      Punto de coordinación institucional, técnica y comercial.
                    </p>
                  </div>
                  <div>
                    <strong>Yarumal · Operación de referencia</strong>
                    <p>
                      Experiencia territorial para conversar sobre plantas, biomasa, productos y operación.
                    </p>
                  </div>
                </div>

                <div className="contact-channels__direct">
                  <div><span>WhatsApp</span><a href="https://wa.me/573003078822" target="_blank" rel="noopener noreferrer">+57 300 307 8822 <span aria-hidden="true">↗</span></a></div>
                  <div><span>Dirección técnica</span><a href="mailto:direcciontecnica@greenatics.com.co">direcciontecnica@greenatics.com.co</a></div>
                  <div><span>Canal general</span><a href="mailto:contacto@greenatics.com.co">contacto@greenatics.com.co</a></div>
                </div>
              </section>

              <section className="contact-resources" aria-labelledby="contact-resources-title">
                <span className="contact-eyebrow">Si quieres explorar por tu cuenta</span>
                <h2 id="contact-resources-title">Entra directamente a una herramienta.</h2>
                <nav aria-label="Herramientas digitales">
                  <Link href="/wondergreen/calculadora/">
                    <span><strong>Orientación agronómica</strong><small>Prepara una recomendación para tu lote.</small></span><span aria-hidden="true">→</span>
                  </Link>
                  <Link href="/herramientas/">
                    <span><strong>Otras herramientas Greenatics</strong><small>Conoce las muestras y sus accesos.</small></span><span aria-hidden="true">→</span>
                  </Link>
                  <Link href="/huella/">
                    <span><strong>Back 2 Green</strong><small>Conoce el servicio, los planes y la demo pública.</small></span><span aria-hidden="true">→</span>
                  </Link>
                </nav>
              </section>
            </aside>
        </div>
      </section>

      <section className="contact-faq-section">
        <div className="container">
          <div className="contact-faq-section__heading">
            <span className="contact-eyebrow">Información para preparar el alcance</span>
            <h2>Algunas respuestas antes de conversar.</h2>
          </div>
          <div className="contact-faq-list">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}<span aria-hidden="true">+</span></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
