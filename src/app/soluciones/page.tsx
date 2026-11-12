import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Soluciones para sistemas de residuos orgánicos",
  description:
    "Greenatics integra diagnóstico, logística, infraestructura, operación, datos y valorización en soluciones que se adaptan al territorio, la empresa y su capacidad real.",
  alternates: { canonical: "/soluciones/" },
};

const pathways = [
  {
    eyebrow: "Municipio o ESP",
    title: "Del PGIRS a una ruta que el territorio pueda sostener.",
    copy: "Articulamos planeación, separación, microrrutas, infraestructura, operación y seguimiento según los residuos que se generan y la capacidad local.",
    href: "/municipios/",
    cta: "Explorar ruta para municipios",
    image: "/projects/routes/motocarguero-verde-operacion-real.webp",
    alt: "Configuración de motocarguero verde desarrollada para recolección diferenciada",
    caption: "Diseño para recolección diferenciada · Greenatics y Auteco Mobility",
  },
  {
    eyebrow: "Organización o gran generador",
    title: "Una gestión clara para cada sede y cada equipo.",
    copy: "Aterrizamos el PMIRS en rutinas de separación, almacenamiento, recolección y entrega; definimos responsables y registros para seguir el destino de las corrientes.",
    href: "/empresas/",
    cta: "Explorar ruta para organizaciones",
    image: "/services/large-generators-editorial-01.jpg",
    alt: "Persona revisa contenedores en el área de servicio de un edificio urbano.",
    caption: "Acordar rutinas por sede facilita sostener la separación y el seguimiento.",
  },
  {
    eyebrow: "Agroindustria y proyectos productivos",
    title: "Saber qué hacer con tus subproductos antes de invertir.",
    copy: "Caracterizamos la corriente y comparamos tratamiento, biogás, bioenergía y aprovechamiento agrícola con la escala, el proceso y el destino posible en mente.",
    href: "/agroindustria/",
    cta: "Explorar ruta agroindustrial",
    image: "/services/agroindustry-characterization-editorial.jpg",
    alt: "Ingeniera y operario caracterizan subproductos orgánicos en una planta agroindustrial.",
    caption: "Caracterizar biomasa orienta la comparación de tratamiento, energía y aprovechamiento.",
  },
];

export default function SolutionsPage() {
  return (
    <>
      <section className="gt-solution-hero">
        <div className="container gt-solution-hero__grid">
          <div className="gt-solution-hero__copy">
            <span className="eyebrow eyebrow--light">Rutas de decisión</span>
            <h1>Conectamos residuos orgánicos con tratamiento, operación y valor.</h1>
            <p className="gt-route-hero__statement">De la separación y la logística a la transformación y su destino.</p>
            <p className="lead">Greenatics diseña, implementa y acompaña sistemas para gestionar y aprovechar residuos orgánicos. Integramos caracterización, microrrutas, plantas, procesos biológicos, productos, operación y datos; el alcance se define según el material, el territorio y el resultado que se busca.</p>
            <div className="button-row">
              <Link className="button button--light" href="/diagnostico/">Encontrar mi punto de entrada</Link>
              <Link className="button button--outline-light" href="/servicios/">Ver servicios contratables</Link>
              <Link className="button button--outline-light" href="/portafolio/">Ver portafolio Greenatics 2.0</Link>
            </div>
          </div>
          <div className="gt-solution-hero__mosaic">
            <figure className="gt-solution-hero__mosaic-main">
              <Image src="/services/service-consulting-editorial.webp" alt="Tres profesionales revisan material orgánico durante una caracterización en un área de compostaje." fill priority sizes="(max-width: 900px) 100vw, 44vw" />
              <figcaption>Analizar el material y el proceso ayuda a definir una ruta de tratamiento adecuada.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading"><span className="eyebrow">Servicios por audiencia</span><h2>Tres contextos. Una solución construida desde la operación real.</h2><p>Elige el recorrido que más se parece a tu necesidad. Verás servicios, ejemplos y siguientes pasos explicados para tu tipo de proyecto.</p></div>
          <div className="gt-pathway-grid">
            {pathways.map((path) => (
              <article key={path.eyebrow}>
                <figure className="gt-pathway-grid__visual">
                  <Image src={path.image} alt={path.alt} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 42vw, 34vw" />
                  <figcaption>{path.caption}</figcaption>
                </figure>
                <div className="gt-pathway-grid__content">
                  <span>{path.eyebrow}</span>
                  <h3>{path.title}</h3>
                  <p>{path.copy}</p>
                  <Link href={path.href}>{path.cta} <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </div>
          <div className="gt-solution-secondary-paths">
            <div>
              <span className="eyebrow">Otras formas de colaborar</span>
              <h3>¿Tu iniciativa requiere sumar actores o capacidades?</h3>
              <p>También podemos conversar sobre alianzas y proyectos institucionales, con alcance y responsabilidades definidos para cada oportunidad.</p>
            </div>
            <Link href="/contacto/?interes=instituciones-alianzas">Conversar sobre una alianza o proyecto <span aria-hidden="true">→</span></Link>
          </div>
          <div className="gt-solution-product-path">
            <div>
              <span className="eyebrow">Una oferta distinta, conectada con el cultivo</span>
              <h3>Wondergreen reúne productos y guías; el programa agronómico aporta el acompañamiento.</h3>
              <p>Si tu interés está en la nutrición de cultivos, explora el portafolio de productos o conoce el servicio profesional para diseñar y evaluar un programa por cultivo y etapa.</p>
            </div>
            <div>
              <Link href="/wondergreen/">Explorar productos Wondergreen <span aria-hidden="true">→</span></Link>
              <Link href="/servicios/programas-wondergreen/">Conocer los programas agronómicos <span aria-hidden="true">→</span></Link>
              <Link href="/casa-jardin/">Visitar Casa &amp; Jardín <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="gt-case-band">
        <div className="container gt-case-band__grid">
          <div className="gt-case-band__copy">
            <span className="eyebrow eyebrow--light">Experiencia en territorio</span>
            <h2>Experiencia aplicada en dos territorios, con retos y procesos distintos.</h2>
            <p>En Yarumal, Greenatics ha conectado separación en la fuente, microrrutas, recepción y compostaje. En Támesis, la experiencia integra tratamiento anaerobio, reactor UASB, manejo de biogás y una ruta de aprovechamiento energético. Los casos detallan el alcance, los registros y los resultados propios de cada operación.</p>
          </div>
          <div className="gt-case-links">
            <Link href="/proyectos/yarumal/"><strong>Yarumal</strong><span>Separación, microrrutas y compostaje →</span></Link>
            <Link href="/proyectos/tamesis/"><strong>Támesis</strong><span>Digestión anaerobia y manejo de biogás →</span></Link>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container gt-tools-panel">
          <div><span className="eyebrow">Herramientas Greenatics</span><h2>La operación también puede apoyarse en datos.</h2><p>Conoce qué resuelve cada plataforma, cómo se conecta con el trabajo y cuál es su alcance de acceso.</p></div>
          <div className="gt-tools-panel__links">
            <Link className="button button--dark" href="/herramientas/">Explorar plataformas y herramientas <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="gt-route-closing">
        <div className="container gt-route-closing__inner">
          <div><span className="eyebrow">Construir la combinación correcta</span><h2>Podemos empezar por el punto donde hoy está tu sistema.</h2></div>
          <Link className="button button--dark" href="/contacto/?interes=soluciones">Describir mi necesidad</Link>
        </div>
      </section>
    </>
  );
}
