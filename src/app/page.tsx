import type { Metadata } from "next";
import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { HomeToolsBridge } from "@/components/home-tools-bridge";
import { HomeUniversesBento } from "@/components/home-universes-bento";
import { HomeTerritoryShowcase } from "@/components/home-territory-showcase";
import { HomeWondergreenBridge } from "@/components/home-wondergreen-bridge";

export const metadata: Metadata = {
  title: "Ciencia, consultoría y operación para retos ambientales",
  description: "Greenatics acompaña a municipios, empresas y agroindustrias con consultoría, ciencia aplicada, diseño, operación y soluciones agrícolas Wondergreen.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div style={{ background: "#f8faf6", color: "var(--green-950)", overflowX: "hidden" }}>
      <HomeHero />
      <HomeUniversesBento />
      <HomeWondergreenBridge />
      <HomeTerritoryShowcase />
      <HomeToolsBridge />

      <section className="home-conversion-block" aria-labelledby="home-conversion-title">
        <div className="container">
          <div className="home-conversion-block__heading">
            <h2 id="home-conversion-title">
              ¿Qué reto ambiental necesitas resolver?
            </h2>
            <p className="home-conversion-block__sub">
              Cuéntanos dónde ocurre y qué necesitas lograr. Si todavía defines el alcance, empieza
              por ordenar la necesidad; si ya tienes un proyecto u operación, conversemos sobre la
              solución.
            </p>
          </div>

          <div className="home-conversion-block__actions" aria-label="Rutas principales">
            <Link href="/diagnostico/" className="home-conversion-block__action home-conversion-block__action--primary">
              <span>Para comparar opciones o precisar lo que necesitas.</span>
              <strong>Definir el alcance <span aria-hidden="true">→</span></strong>
            </Link>
            <Link href="/contacto/?interes=soluciones" className="home-conversion-block__action">
              <span>Para conversar sobre una corriente, una planta o un proyecto.</span>
              <strong>Hablar sobre mi proyecto <span aria-hidden="true">→</span></strong>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
