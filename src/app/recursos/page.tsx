import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recursos para decidir y operar",
  description: "Casos territoriales, biblioteca técnica, herramientas agronómicas, metodología de impacto y entornos públicos de Greenatics.",
  alternates: { canonical: "/recursos/" },
};

const entryRoutes = [
  { label: "Territorio e inversión", question: "¿Qué necesita mi territorio antes de invertir?", copy: "Conoce opciones para diagnosticar, planear rutas, definir infraestructura y organizar la operación por etapas.", href: "/municipios/", cta: "Explorar soluciones para municipios", image: "/services/pgirs-pmirs-planning-editorial-v1.jpg", imageAlt: "Equipo técnico revisa un mapa para planear la gestión de residuos de un territorio." },
  { label: "Organizaciones y grandes generadores", question: "¿Cómo organizo los residuos de varias sedes?", copy: "Conoce cómo estructurar o fortalecer un PMIRS y articular separación, recolección, tratamiento y seguimiento según el contexto de tu organización.", href: "/empresas/", cta: "Explorar soluciones para organizaciones", image: "/services/large-generators-editorial-01.jpg", imageAlt: "Persona revisa contenedores en el área de servicio de un edificio urbano." },
  { label: "Resultados y metodología", question: "¿Qué muestran los datos de impacto?", copy: "Consulta resultados del trabajo en Yarumal y entiende los escenarios de Támesis según su periodo y evidencia.", href: "/impacto/", cta: "Ver datos y metodología", image: "/tools/digital-tools-field-v1.jpg", imageAlt: "Equipo revisa información de un proceso en una tableta, junto a material orgánico en tratamiento." },
  { label: "Decisiones agronómicas", question: "¿Qué necesita el cultivo según su suelo y etapa?", copy: "Encuentra programas por cultivo, guías técnicas, herramientas de estimación y productos Wondergreen.", href: "/biblioteca/", cta: "Explorar recursos agronómicos", image: "/products/wondergreen-program-coffee-editorial-v1.webp", imageAlt: "Ramas de café con frutos maduros en una ladera de cultivo." },
  { label: "Casa, jardín y huerta", question: "¿Qué conviene observar antes de actuar?", copy: "Aprende a reconocer etapas, preparar el sustrato, trasplantar y comenzar una huerta en casa.", href: "/casa-jardin/guias/", cta: "Elegir una guía para casa", image: "/guides/casa-transplante-planting-detail.jpg", imageAlt: "Planta retirada de su recipiente y lista para trasplantarse a una matera." },
];

const evidenceLevels = [
  ["Caso", "Describe un contexto real, sus componentes y los resultados que cuentan con respaldo disponible."],
  ["Metodología", "Explica cómo se estructura, opera o mide una capacidad; no equivale por sí sola a un resultado garantizado."],
  ["Herramienta", "Permite explorar una experiencia digital; la página indica su alcance y cuándo utiliza datos de ejemplo."],
  ["Guía de campo", "Orienta observación y aplicación; la recomendación final depende del cultivo, el lote y el acompañamiento técnico."],
];

export default function RecursosPage() {
  return (
    <>
      <section className="gt-resources-hero" aria-labelledby="resources-hero-title">
        <div className="container gt-resources-hero__grid">
          <div className="gt-resources-hero__copy">
            <h1 id="resources-hero-title">Conocimiento para decidir, operar y demostrar.</h1>
            <p className="lead">
              Encuentra casos de trabajo en territorio, herramientas, métodos y guías para
              entender una situación y elegir el siguiente paso con mejor información.
            </p>
            <div className="button-row">
              <Link className="button button--light" href="#rutas">Explorar por necesidad</Link>
              <Link className="button button--outline-light" href="/proyectos/">Ver proyectos</Link>
            </div>
          </div>

          <figure className="gt-resources-hero__primary gt-resources-hero__primary--photo">
            <Image src="/services/organic-valorization-concept-v1.jpg" alt="Compost en primer plano, con cultivos y una instalación de aprovechamiento al fondo." fill priority sizes="(max-width: 820px) 100vw, 48vw" />
            <figcaption><strong>Del aprovechamiento de la biomasa al cuidado del suelo.</strong></figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-resource-routes" id="rutas" aria-labelledby="resource-routes-title">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><h2 id="resource-routes-title">¿Qué necesitas resolver hoy?</h2></div>
            <p>Elige la pregunta más cercana a tu situación y encuentra una ruta concreta para avanzar.</p>
          </div>
          <div className="gt-resource-route-grid">
            {entryRoutes.map((route, index) => (
              <article
                key={route.href}
                className={index >= entryRoutes.length - 2
                  ? `gt-resource-route--wide${index === entryRoutes.length - 1 ? " gt-resource-route--home" : ""}`
                  : undefined}
              >
                <figure className="gt-resource-route__image">
                  <Image
                    src={route.image}
                    alt={route.imageAlt}
                    fill
                    sizes={index >= entryRoutes.length - 2
                      ? "(max-width: 600px) 100vw, (max-width: 1050px) 50vw, 22vw"
                      : "(max-width: 600px) 100vw, (max-width: 1050px) 50vw, 33vw"}
                  />
                </figure>
                <div className="gt-resource-route__copy">
                  <small>{route.label}</small>
                  <h3>{route.question}</h3>
                  <p>{route.copy}</p>
                  <Link href={route.href}>{route.cta} <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-resource-featured" aria-labelledby="resource-featured-title">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--light">
            <span className="eyebrow eyebrow--light">Recursos destacados</span>
            <h2 id="resource-featured-title">Casos, herramientas y guías cumplen funciones distintas.</h2>
            <p>Cada entrada responde una pregunta distinta y deja claro si estás viendo evidencia real, una herramienta de trabajo o una guía de aplicación.</p>
          </div>

          <div className="gt-resource-featured__grid">
            <article className="gt-resource-story">
              <figure>
                <Image src="/projects/plant/plant-evidence-04.webp" alt="Pilas de compostaje bajo cubierta en Yarumal" fill sizes="(max-width: 900px) 100vw, 50vw" />
                <span>Yarumal · Compostaje bajo cubierta</span>
              </figure>
              <div>
                <small>Yarumal</small>
                <h3>Resultados validados y una cadena que puede recorrerse.</h3>
                <p>Consulta la separación, la recepción y la transformación del material, junto con las cifras aprobadas de desvío, pureza, transporte evitado y ahorro en fletes.</p>
                <Link href="/proyectos/yarumal/">Explorar el caso Yarumal →</Link>
              </div>
            </article>

            <article className="gt-resource-story">
              <figure>
                <Image src="/projects/tamesis/planta-aerea.jpg" alt="Vista aérea de instalaciones para aprovechamiento de biomasa en Támesis" fill sizes="(max-width: 900px) 100vw, 50vw" />
                <span>Támesis · Digestión anaerobia y biogás</span>
              </figure>
              <div>
                <small>Támesis</small>
                <h3>Digestión anaerobia, biogás y una ruta hacia la biofábrica.</h3>
                <p>Recorre el sistema UASB, la producción de biogás y bioenergía, y la conexión entre residuos orgánicos, digestatos y futuras salidas para el suelo.</p>
                <Link href="/proyectos/tamesis/">Explorar el caso Támesis →</Link>
              </div>
            </article>

            <article className="gt-resource-tool">
              <span>Muestra pública interactiva</span>
              <h3>GREENATICS OPS</h3>
              <p>Recorre el flujo desde la programación y recepción de material hasta los procesos, activos, inventario y reportes. La estación usa registros ficticios: permite conocer cómo se organiza la información, pero no está conectada a una planta real.</p>
              <Link className="button button--dark" href="/app/">Explorar muestra de OPS</Link>
            </article>

            <article className="gt-resource-tool gt-resource-tool--paper">
              <span>Biblioteca técnica</span>
              <h3>Del síntoma observado a una decisión mejor informada.</h3>
              <p>Programas por cultivo, guías de deficiencias, manuales de uso, catálogo Wondergreen y contenidos para huertas y jardín.</p>
              <div className="gt-resource-tool__links">
                <Link href="/biblioteca/guia-deficiencias/">Guía de deficiencias <span aria-hidden="true">→</span></Link>
                <Link href="/wondergreen/cultivos/cafe/">Programa para café <span aria-hidden="true">→</span></Link>
                <Link href="/wondergreen/calculadora/">Preparar consulta agronómica <span aria-hidden="true">→</span></Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="gt-resource-standards" aria-labelledby="resource-standards-title">
        <div className="container gt-resource-standards__grid">
          <div>
            <span className="eyebrow">Cómo leer este centro</span>
            <h2 id="resource-standards-title">No todo contenido demuestra lo mismo.</h2>
            <p>Un caso cuenta una experiencia concreta; una metodología explica cómo se estructura el trabajo; una guía orienta una aplicación. Consulta cada material con ese alcance en mente.</p>
            <Link href="/impacto/">Conocer el gobierno de indicadores →</Link>
          </div>
          <dl>
            {evidenceLevels.map(([term, description]) => (
              <div key={term}><dt>{term}</dt><dd>{description}</dd></div>
            ))}
          </dl>
        </div>
      </section>

    </>
  );
}
