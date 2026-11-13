import type { Metadata } from "next";
import { DiagnosticRouter } from "@/components/diagnostic-router";

export const metadata: Metadata = {
  title: "Orientador de soluciones",
  description:
    "Encuentra un punto de partida entre los servicios, productos y herramientas Greenatics según tu organización, territorio o proyecto agrícola.",
  alternates: { canonical: "/diagnostico/" },
};

export default function DiagnosticoPage() {
  return (
    <>
      <section className="diagnostic-hero">
        <div className="container diagnostic-hero-grid">
          <div>
            <span className="eyebrow">Orientador de soluciones Greenatics</span>
            <h1>Encuentra el siguiente paso para tu proyecto.</h1>
            <p className="lead">
              Elige tu contexto y la necesidad que quieres resolver. Te mostraremos una ruta concreta hacia el servicio, producto o herramienta que mejor corresponde a ese punto de partida.
            </p>
          </div>
          <aside>
            <strong>Cinco contextos. Veinte rutas de entrada.</strong>
            <p>
              Es una orientación inicial, no una propuesta técnica ni una confirmación de disponibilidad. El alcance y las condiciones se precisan para cada organización y proyecto.
            </p>
          </aside>
        </div>
      </section>

      <section className="diagnostic-section" aria-label="Orientador por perfil y necesidad">
        <div className="container">
          <DiagnosticRouter />
        </div>
      </section>
    </>
  );
}
