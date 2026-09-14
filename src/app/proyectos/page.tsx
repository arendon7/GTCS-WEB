import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { yarumalClaims } from "@/data/claims";

export const metadata: Metadata = {
  title: "Proyectos y evidencia en territorio",
  description:
    "Casos Greenatics documentados en Yarumal y Támesis: rutas selectivas, plantas de bioprocesos, UASB, biogás, bioenergía, compostaje y control operativo.",
  alternates: { canonical: "/proyectos/" },
};

const evidencePrinciples = [
  ["01", "Observar", "Infraestructura, prácticas, condiciones de entrada y novedades se registran donde ocurre la operación."],
  ["02", "Conciliar", "Pesajes, bitácoras, lotes, consumos y salidas se comparan antes de convertirlos en indicadores."],
  ["03", "Validar", "Cada cifra publicable conserva periodo, fuente, método y responsable de revisión."],
  ["04", "Explicar", "El caso muestra tanto el resultado como el sistema, las decisiones y los límites que lo hicieron posible."],
] as const;

const gallery = [
  ["/projects/plant/plant-evidence-05.webp", "Yarumal", "Planta y operación territorial", "Las áreas de proceso muestran que aprovechar requiere espacio, secuencia de trabajo y control de permanencia."],
  ["/projects/routes/route-evidence-01.webp", "Yarumal", "Microrrutas y recolección selectiva", "La proximidad entre generadores y planta permite intervenir frecuencia, calidad y costo logístico."],
  ["/projects/plant/plant-evidence-06.webp", "Yarumal", "Seguimiento del material", "El estado de las pilas permite leer aireación, humedad, homogeneidad y necesidad de intervención."],
  ["/projects/tamesis/reactor-uasb.jpeg", "Támesis", "Reactor anaerobio UASB", "El reactor transforma la fracción líquida y concentra la producción de biogás dentro de una cadena más amplia."],
  ["/projects/tamesis/ruta-selectiva.jpeg", "Támesis", "Ruta selectiva municipal", "La digestión anaerobia también depende de una corriente separada, frecuente y compatible con el proceso."],
  ["/projects/tamesis/recepcion-organicos.jpg", "Támesis", "Recepción e inspección", "La revisión de entrada protege equipos, proceso biológico y calidad de las salidas posteriores."],
] as const;

export default function ProyectosPage() {
  return (
    <>
      <section className="gt-projects-hero">
        <div className="container gt-projects-hero__grid">
          <div className="gt-projects-hero__copy">
            <span className="eyebrow eyebrow--light">Casos en territorio</span>
            <h1>La evidencia empieza donde el sistema realmente opera.</h1>
            <p className="lead">
              Yarumal y Támesis permiten leer dos configuraciones complementarias: aprovechamiento
              aeróbico con logística local y digestión anaerobia con captura de biogás y bioenergía.
              No presentamos proyectos como fotografías aisladas, sino como cadenas de operación.
            </p>
            <div className="button-row">
              <a className="button button--light" href="#casos">Explorar los casos</a>
              <Link className="button button--outline-light" href="/impacto/">Ver metodología de impacto</Link>
            </div>
          </div>

          <div className="gt-projects-hero__visual">
            <figure className="gt-projects-hero__primary">
              <Image alt="Reactor UASB y planta de aprovechamiento orgánico en Támesis" fill loading="eager" priority sizes="(max-width: 900px) 100vw, 52vw" src="/projects/tamesis/reactor-uasb.jpeg" />
              <figcaption><span>Támesis</span><strong>Digestión anaerobia, biogás y bioenergía</strong></figcaption>
            </figure>
            <figure className="gt-projects-hero__secondary">
              <Image alt="Área de maduración y transformación de material orgánico en Yarumal" fill sizes="(max-width: 900px) 45vw, 260px" src="/projects/plant/plant-evidence-06.webp" />
              <figcaption><span>Yarumal</span><strong>Bioproceso y control de permanencia</strong></figcaption>
            </figure>
            <div className="gt-projects-hero__seal"><strong>2</strong><span>casos documentados</span><small>Antioquia</small></div>
          </div>
        </div>
      </section>

      <section className="gt-projects-ribbon" aria-label="Lecturas transversales de los casos">
        <div className="container">
          <div><span>01</span><strong>Del origen a la planta</strong><small>Separación, ruta y recepción</small></div>
          <div><span>02</span><strong>Dos rutas biológicas</strong><small>Compostaje y digestión anaerobia</small></div>
          <div><span>03</span><strong>Salidas con valor</strong><small>Productos, energía y aprendizaje</small></div>
          <div><span>04</span><strong>Memoria operacional</strong><small>Bitácora, balance y evidencia</small></div>
        </div>
      </section>

      <section className="gt-projects-cases" id="casos">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Casos principales</span><h2>Un mismo propósito, dos arquitecturas de operación.</h2></div>
            <p>Cada territorio requiere una combinación distinta de logística, infraestructura, biología, equipo humano y control. Los casos muestran esa diferencia sin convertirla en una receta universal.</p>
          </div>

          <article className="gt-project-case gt-project-case--yarumal">
            <div className="gt-project-case__media">
              <Image alt="Pilas de transformación orgánica en la planta de bioprocesos de Yarumal" fill sizes="(max-width: 900px) 100vw, 52vw" src="/projects/plant/plant-evidence-05.webp" />
              <span>01 · Norte de Antioquia</span>
            </div>
            <div className="gt-project-case__copy">
              <span className="eyebrow">Caso Yarumal</span>
              <h2>Reducir transporte regional creando capacidad local.</h2>
              <p>Yarumal conecta microrrutas, recepción controlada, compostaje, seguimiento técnico y valorización. El desempeño no depende únicamente de la planta: empieza en la calidad de la corriente y continúa en la disciplina operativa.</p>
              <div className="gt-project-case__facts" aria-label="Resultados validados del caso Yarumal">
                {yarumalClaims.map((claim) => <div key={claim.id}><strong>{claim.value}</strong><span>{claim.compactLabel}</span></div>)}
              </div>
              <ul><li>Logística selectiva adaptada al territorio.</li><li>Bioproceso con acompañamiento técnico GIEM-UdeA.</li><li>Registros operativos y económicos conciliados.</li></ul>
              <Link className="button button--dark" href="/proyectos/yarumal/">Leer el caso Yarumal</Link>
            </div>
          </article>

          <article className="gt-project-case gt-project-case--tamesis">
            <div className="gt-project-case__copy">
              <span className="eyebrow">Caso Támesis</span>
              <h2>Convertir la corriente orgánica en materia, gas y energía.</h2>
              <p>Támesis integra ruta selectiva, preparación de biomasa, dos etapas de hidrólisis, un reactor UASB, acondicionamiento y almacenamiento de biogás, aprovechamiento energético y compostaje.</p>
              <div className="gt-project-case__facts gt-project-case__facts--tamesis" aria-label="Infraestructura existente en Támesis">
                <div><strong>30 m³</strong><span>Reactor UASB</span></div><div><strong>2 etapas</strong><span>Reactores de hidrólisis</span></div><div><strong>Biogás</strong><span>Captura y acondicionamiento</span></div><div><strong>Bioenergía</strong><span>Aprovechamiento en operación</span></div>
              </div>
              <ul><li>Balance integrado de masa, gas y energía.</li><li>Control de filtros, red, almacenamiento y activos.</li><li>Ruta de consolidación operativa e institucional.</li></ul>
              <Link className="button button--dark" href="/proyectos/tamesis/">Leer el caso Támesis</Link>
            </div>
            <div className="gt-project-case__media">
              <Image alt="Vista aérea del reactor UASB en Támesis" fill sizes="(max-width: 900px) 100vw, 52vw" src="/projects/tamesis/planta-aerea.jpg" />
              <span>02 · Suroeste de Antioquia</span>
            </div>
          </article>
        </div>
      </section>

      <section className="gt-projects-compare">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-route-heading--light">
            <div><span className="eyebrow eyebrow--light">Lectura comparada</span><h2>La tecnología cambia. La disciplina operacional permanece.</h2></div>
            <p>Yarumal enfatiza logística local y estabilización aeróbica. Támesis incorpora digestión anaerobia y energía. Ambos requieren control de entradas, procesos, activos, salidas y evidencia.</p>
          </div>
          <div className="gt-projects-compare__grid">
            <article><span>Yarumal</span><h3>Capacidad territorial</h3><p>La cercanía entre generación, ruta y planta reduce transporte y permite intervenir calidad desde el origen.</p><strong>Ruta → recepción → compostaje → producto</strong></article>
            <article><span>Támesis</span><h3>Biorefinería energética</h3><p>La separación de fases conecta fracciones sólidas y líquidas con compostaje, biogás y bioenergía.</p><strong>Ruta → hidrólisis → UASB → gas + productos</strong></article>
            <article><span>Transversal</span><h3>Greenatics OPS</h3><p>La bitácora enlaza pesajes, lotes, parámetros, mantenimiento, inventarios, decisiones y reportes.</p><strong>Capturar → validar → conciliar → decidir</strong></article>
          </div>
        </div>
      </section>

      <section className="gt-projects-gallery">
        <div className="container">
          <div className="gt-route-heading"><span className="eyebrow">Evidencia visual</span><h2>La operación deja rastros que se pueden leer.</h2><p>Infraestructura, rutas, materia prima y material en proceso permiten entender el sistema más allá de sus indicadores finales.</p></div>
          <div className="gt-projects-gallery__grid">
            {gallery.map(([src, place, caption, interpretation], index) => <figure className={index === 0 || index === 3 ? "is-featured" : undefined} key={src}><Image alt={`${caption} en ${place}`} fill sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw" src={src} /><figcaption><span>{place}</span><strong>{caption}</strong><p>{interpretation}</p></figcaption></figure>)}
          </div>
        </div>
      </section>

      <section className="gt-projects-evidence">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split"><div><span className="eyebrow">Gobernanza de evidencia</span><h2>Un caso no se valida con una cifra suelta.</h2></div><p>La web diferencia infraestructura observada, datos operativos validados, escenarios de diseño y demostraciones ilustrativas. Esa separación protege la credibilidad del proyecto y mejora la toma de decisiones.</p></div>
          <ol>{evidencePrinciples.map(([number, title, copy]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>)}</ol>
        </div>
      </section>

      <section className="gt-projects-closing"><div className="container gt-projects-closing__grid"><div><span className="eyebrow">Tu territorio será diferente</span><h2>El siguiente caso empieza con una lectura rigurosa del punto de partida.</h2></div><div><p>Antes de proponer equipos, conectamos generación, logística, capacidades existentes, salidas posibles, operación y datos. Si alguno de estos casos se parece a tu reto, podemos empezar con esa referencia y volver a validar la escala.</p><div className="button-row"><Link className="button button--dark" href="/diagnostico/">Orientar mi proyecto</Link><Link className="button button--ghost" href="/contacto/?interes=solucion&perfil=municipio&diagnostico=Conversar%20sobre%20un%20caso%20territorial&prioridad=Yarumal%20%C2%B7%20T%C3%A1mesis%20%C2%B7%20adaptaci%C3%B3n%20de%20sistema">Conversar sobre un caso similar</Link><Link className="button button--ghost" href="/tecnologia/">Entender la tecnología</Link></div></div></div></section>
    </>
  );
}
