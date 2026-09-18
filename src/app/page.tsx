import type { Metadata } from "next";
import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { HomeToolsBridge } from "@/components/home-tools-bridge";
import { HomeUniversesBento } from "@/components/home-universes-bento";
import { HomeTerritoryShowcase } from "@/components/home-territory-showcase";
import { HomeWondergreenBridge } from "@/components/home-wondergreen-bridge";
import { portfolioGroups } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Sistemas territoriales de economía circular",
  description: "Diseñamos y operamos sistemas de aprovechamiento orgánico con plantas, dirección técnica, trazabilidad digital y bioinsumos para municipios, empresas y el agro.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div style={{ background: "#f8faf6", color: "var(--green-950)", overflowX: "hidden" }}>
      <HomeHero />
      <HomeToolsBridge />
      <HomeUniversesBento />
      <section className="home-portfolio-bridge" aria-labelledby="home-portfolio-title">
        <div className="container">
          <div className="home-portfolio-bridge__heading">
            <div><span className="eyebrow">Greenatics 2.0</span><h2 id="home-portfolio-title">Cinco líneas para entrar al sistema por el problema correcto.</h2></div>
            <p>Territorio, valorización, Wondergreen, clima y datos, y operación digital comparten un mismo método: entender, estructurar, implementar, medir y mejorar.</p>
          </div>
          <div className="home-portfolio-bridge__grid">
            {portfolioGroups.map((group, index) => <Link className={`home-portfolio-bridge__card home-portfolio-bridge__card--${group.color}`} href={`/portafolio/${group.slug}/`} key={group.slug}><span>0{index + 1}</span><strong>{group.shortName}</strong><small>{group.eyebrow}</small><em>Explorar <b aria-hidden="true">→</b></em></Link>)}
          </div>
        </div>
      </section>
      <HomeTerritoryShowcase />
      <HomeWondergreenBridge />

      <section className="home-conversion-block" aria-labelledby="home-conversion-title">
        <div className="container">
          <div className="home-conversion-block__heading">
            <span className="eyebrow home-conversion-block__eyebrow">Siguiente paso</span>
            <h2 id="home-conversion-title">
              Elige el punto de partida y construyamos la ruta.
            </h2>
            <p className="home-conversion-block__sub">
              Ya viste el sistema, las capacidades y los casos. Ahora podemos ordenar tu necesidad,
              definir el primer diagnóstico y conectar la solución con una operación que se pueda medir.
            </p>
          </div>

          <div className="home-conversion-block__actions" aria-label="Rutas principales">
            <Link href="/diagnostico/" className="home-conversion-block__action home-conversion-block__action--primary">
              <span>01 · Si aún estás definiendo el problema</span>
              <strong>Orientar mi proyecto <span aria-hidden="true">→</span></strong>
            </Link>
            <Link href="/municipios/" className="home-conversion-block__action">
              <span>02 · Si ya tienes territorio, planta o meta pública</span>
              <strong>Explorar soluciones territoriales <span aria-hidden="true">→</span></strong>
            </Link>
            <Link href="/contacto/" className="home-conversion-block__action">
              <span>03 · Si necesitas conversar sobre alcance</span>
              <strong>Hablar con Greenatics <span aria-hidden="true">→</span></strong>
            </Link>
          </div>

          <div className="home-conversion-block__footer">
            <p>También puedes conocer Wondergreen para agro, Casa y Jardín y huertas urbanas.</p>
            <Link href="/wondergreen/" className="conv-footer-link">
              Explorar Wondergreen <span aria-hidden="true">→</span>
            </Link>
            <Link href="/casa-jardin/" className="conv-footer-link">
              Ver Casa y Jardín <span aria-hidden="true">→</span>
            </Link>
            <Link href="/sana/" className="conv-footer-link">
              Conocer SANA <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
