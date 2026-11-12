import Image from "next/image";
import Link from "next/link";
import { HomePhotoGallery, type HomePhoto } from "@/components/home-photo-gallery";
import { tamesisImpactScenario } from "@/data/tamesis-impact";

const yarumalProcess = {
  src: "/projects/plant/plant-evidence-10.webp",
  title: "Recepción de orgánicos separados en la planta de Yarumal",
  caption: "La ruta selectiva entrega el material que luego se caracteriza y trata.",
};

const tamesisPhotos: readonly HomePhoto[] = [
  {
    src: "/projects/tamesis/planta-aerea.jpg",
    alt: "Vista aérea de instalaciones para aprovechamiento de biomasa en Támesis.",
    title: "Infraestructura del proyecto",
    caption: "Infraestructura para tratamiento de biomasa en Támesis.",
  },
  {
    src: "/projects/tamesis/reactor-uasb.jpeg",
    alt: "Reactor UASB instalado en el proyecto de valorización de Támesis.",
    title: "Digestión anaerobia",
    caption: "El reactor UASB integra la ruta de digestión anaerobia.",
  },
  {
    src: "/projects/tamesis/ruta-selectiva.jpeg",
    alt: "Recolección selectiva de orgánicos en Támesis.",
    title: "Recolección diferenciada",
    caption: "Una de las etapas que conecta el territorio con el tratamiento.",
  },
  {
    src: "/projects/tamesis/paisaje-tamesis.jpg",
    alt: "Paisaje del territorio donde se desarrolla el proyecto de Támesis.",
    title: "El contexto territorial",
    caption: "La solución se entiende junto con las condiciones del lugar.",
  },
];

export function HomeTerritoryShowcase() {
  return (
    <section className="home-territory" aria-labelledby="home-territory-title">
      <div className="container">
        <div className="home-territory__heading">
          <div>
            <h2 id="home-territory-title">Experiencia que conecta planeación, operación y <span className="home-editorial-accent">ciencia aplicada.</span></h2>
          </div>
          <p className="lead">
            Más de cinco años en Yarumal y tres en Támesis. En estos territorios acompañamos a los
            equipos locales en rutas selectivas, tratamiento de orgánicos y valorización de biomasa.
          </p>
        </div>

        <div className="home-territory__case">
          <div className="home-territory__story">
            <span className="home-territory__case-label">Caso validado · Yarumal, Antioquia</span>
            <h3>Una ruta selectiva que conecta recolección y tratamiento.</h3>
            <p>
              Junto con el municipio y la ESP Aguas del Norte consolidamos la ruta selectiva y
              acompañamos la operación de la planta. El proceso integra separación, recolección,
              recepción, caracterización y tratamiento por lote; sus controles buscan prevenir
              vectores, lixiviados y olores. La experiencia también se articula con GIEM, grupo A1
              de la Universidad de Antioquia, en el desarrollo de conocimiento aplicado a la
              valorización de biomasa.
            </p>

            <div className="home-territory__actions">
              <Link className="button button--primary" href="/proyectos/yarumal/">
                Ver caso Yarumal
              </Link>
              <Link className="home-territory__text-link" href="/impacto/">
                Ver indicadores y metodología <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="home-territory__gallery">
            <figure className="home-territory__figure">
              <Image
                alt={yarumalProcess.title}
                fill
                sizes="(max-width: 900px) 100vw, 52vw"
                src={yarumalProcess.src}
              />
              <figcaption>
                <strong>{yarumalProcess.title}</strong>
                <span>{yarumalProcess.caption}</span>
              </figcaption>
            </figure>
          </div>
        </div>

        <article className="home-territory__tamesis-bridge" id="caso-tamesis-home">
          <div className="home-territory__tamesis-media">
            <HomePhotoGallery
              photos={tamesisPhotos}
              label="Fotografías del proyecto de Támesis"
              sizes="(max-width: 760px) 100vw, 38vw"
            />
          </div>
          <div>
            <span>Támesis · experiencia territorial</span>
            <h3>La digestión anaerobia amplía la ruta de aprovechamiento.</h3>
            <p>
              En Támesis, los orgánicos separados se acondicionan y pasan por un proceso biológico
              en dos etapas, con un reactor UASB de {tamesisImpactScenario.metrics[0].value}. El
              proceso conecta la captación de biogás con el aprovechamiento del compost y el digestato.
            </p>
            <p className="home-territory__scenario">
              <strong>Escenario preliminar de CO₂e: {tamesisImpactScenario.metrics[3].value}.</strong>{" "}
              Es una comparación inicial frente a la disposición final, no una reducción medida ni
              verificada. La ficha del caso explica supuestos y metodología.
            </p>
            <Link className="home-territory__tamesis-link" href="/proyectos/tamesis/#impacto">
              Ver proceso, escenarios y metodología <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
