import Image from "next/image";
import Link from "next/link";
import { yarumalClaims } from "@/data/claims";
import { tamesisImpactScenario } from "@/data/tamesis-impact";

const tamesisHomeMetrics = [
  tamesisImpactScenario.metrics[0],
  {
    value: "2 etapas",
    label: "de hidrólisis en la preparación",
    basis: "La biomasa se acondiciona y separa en dos corrientes",
  },
  {
    value: "2 rutas",
    label: "digestión anaerobia y compostaje",
    basis: "Percolado al UASB; fracción sólida a estabilización",
  },
  tamesisImpactScenario.metrics[3],
] as const;

export function HomeHero() {
  return (
    <section className="home-system-hero" aria-labelledby="home-hero-title">
      <div className="home-system-hero__inner container">
        <div className="home-system-hero__grid">
          <div className="home-system-hero__copy">
            <h1 id="home-hero-title">
              Consultoría, ciencia y operación para retos ambientales reales.
              <em> Del territorio al cultivo.</em>
            </h1>

            <p className="home-system-hero__lead">
              Conocemos el sector de aseo, la ciencia detrás de los procesos y las condiciones de
              cada territorio. Acompañamos a municipios y ESP, organizaciones y grandes generadores,
              y agroindustrias desde el diagnóstico y el diseño hasta la implementación y la operación.
            </p>

            <p className="home-system-hero__lead home-system-hero__lead--second">
              Con Wondergreen llevamos esa experiencia a la nutrición del suelo y el cultivo.
            </p>

            <div className="home-system-hero__actions" aria-label="Acciones principales">
              <Link className="button button--primary" href="/servicios/">
                Conocer servicios y soluciones
              </Link>
              <Link className="button home-hero-secondary" href="/proyectos/">
                Ver casos y experiencia
              </Link>
            </div>
          </div>

          <div className="home-system-hero__evidence">
            <figure className="home-hero-figure">
              <Image
                src="/projects/plant/plant-evidence-05.webp"
                alt="Pilas de compost en una planta bajo cubierta, registradas en Yarumal."
                fill
                preload
                sizes="(max-width: 980px) 100vw, 46vw"
              />
              <figcaption>
                <span>Compostaje bajo cubierta · Yarumal</span>
                <Link className="home-hero-figure__case-link" href="/proyectos/yarumal/">
                  Conocer el caso y sus resultados
                </Link>
              </figcaption>
            </figure>
          </div>
        </div>

        <section className="home-claims-rail" aria-label="Resultados de Yarumal e infraestructura y escenario de Támesis">
          <div className="home-claims-rail__case" aria-labelledby="home-yarumal-title">
            <header className="home-claims-rail__intro">
              <div>
                <h2 id="home-yarumal-title">Yarumal</h2>
                <p>Dos resultados del periodo validado, una comparación por viaje y un escenario anualizado de ahorro en fletes.</p>
              </div>
              <Link className="home-claims-rail__action" href="/impacto/">
                Conocer resultados y método <span aria-hidden="true">→</span>
              </Link>
            </header>
            <div className="home-claims-rail__metrics" aria-label="Indicadores del caso y escenario económico">
              {yarumalClaims.map((claim) => (
                <article key={claim.id}>
                  <strong>{claim.value}</strong>
                  <span>{claim.label}</span>
                  <small>{claim.context} · {claim.evidence}</small>
                </article>
              ))}
            </div>
          </div>

          <div className="home-claims-rail__case home-claims-rail__case--tamesis" aria-labelledby="home-tamesis-title">
            <header className="home-claims-rail__intro">
              <div>
                <h2 id="home-tamesis-title">Támesis</h2>
                <p>El reactor UASB está instalado. El potencial de CO₂e es un escenario inicial, no una reducción medida ni verificada.</p>
              </div>
              <Link className="home-claims-rail__action" href="/proyectos/tamesis/#impacto">
                Ver proceso y metodología <span aria-hidden="true">→</span>
              </Link>
            </header>
            <div className="home-claims-rail__metrics home-claims-rail__metrics--tamesis" aria-label="Infraestructura instalada y escenario preliminar de Támesis">
              {tamesisHomeMetrics.map((metric) => (
                <article key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                  <small>{metric.basis}</small>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
