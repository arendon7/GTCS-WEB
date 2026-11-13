import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getYarumalClaim } from "@/data/claims";

export const metadata: Metadata = {
  title: "Proyectos y evidencia en territorio",
  description:
    "Casos Greenatics documentados en Yarumal y Támesis: rutas selectivas, plantas de bioprocesos, UASB, biogás, bioenergía, compostaje y control operativo.",
  alternates: { canonical: "/proyectos/" },
};

const projectIndexYarumalClaims = [
  getYarumalClaim("monthly-diversion"),
  getYarumalClaim("freight-savings"),
];

export default function ProyectosPage() {
  return (
    <>
      <section className="gt-projects-hero">
        <div className="container gt-projects-hero__grid">
          <div className="gt-projects-hero__copy">
            <span className="eyebrow eyebrow--light">Casos en territorio</span>
            <h1>La evidencia empieza donde el sistema realmente opera.</h1>
            <p className="lead">
              Yarumal articula recolección selectiva y compostaje con logística local. Támesis combina
              digestión anaerobia, captura de biogás y aprovechamiento energético. En ambos casos,
              la experiencia permite entender cómo se conectan la corriente, la infraestructura y
              la operación en el territorio.
            </p>
            <div className="button-row">
              <a className="button button--light" href="#casos">Explorar los casos</a>
              <Link className="button button--outline-light" href="/impacto/">Ver metodología de impacto</Link>
            </div>
          </div>

        </div>
      </section>

      <section className="gt-projects-cases" id="casos">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Casos principales</span><h2>Un mismo propósito, dos arquitecturas de operación.</h2></div>
            <p>Cada territorio requiere una combinación distinta de logística, infraestructura, biología, equipo humano y control. Los casos muestran esa diferencia sin convertirla en una receta universal.</p>
          </div>

          <article className="gt-project-case gt-project-case--yarumal">
            <figure className="gt-project-case__media gt-project-case__media--diagram">
              <Image
                alt="Esquema de desvío de más de 120 toneladas mensuales de orgánicos en Yarumal durante el periodo validado."
                fill
                sizes="(max-width: 900px) 100vw, 52vw"
                src="/projects/yarumal/yarumal-diversion-summary-v01.png"
              />
              <figcaption>
                <strong>+120 t/mes de residuos orgánicos desviados</strong>
                <span>Yarumal · registros de masa recibida y gestionada en el periodo validado</span>
              </figcaption>
            </figure>
            <div className="gt-project-case__copy">
              <span className="eyebrow">Caso Yarumal</span>
              <h2>Reducir transporte regional creando capacidad local.</h2>
              <p>Yarumal conecta microrrutas, recepción controlada, compostaje, seguimiento técnico y valorización. El desempeño no depende únicamente de la planta: empieza en la calidad de la corriente y continúa en la disciplina operativa.</p>
              <div className="gt-project-case__facts" aria-label="Indicadores del caso Yarumal y escenario económico anualizado">
                {projectIndexYarumalClaims.map((claim) => <div key={claim.id}><strong>{claim.value}</strong><span>{claim.compactLabel}</span><small>{claim.context.replace("Caso Yarumal · ", "")}</small></div>)}
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
                <div><strong>30 m³</strong><span>Reactor UASB instalado</span></div><div><strong>2 etapas</strong><span>Reactores de hidrólisis</span></div><div><strong>Biogás</strong><span>Captura y acondicionamiento</span></div><div><strong>Bioenergía</strong><span>Ruta de aprovechamiento energético</span></div>
              </div>
              <ul><li>Balance integrado de masa, gas y energía.</li><li>Control de filtros, red, almacenamiento y activos.</li><li>Ruta de consolidación operativa e institucional.</li></ul>
              <Link className="button button--dark" href="/proyectos/tamesis/">Leer el caso Támesis</Link>
            </div>
            <div className="gt-project-case__media">
              <Image alt="Entorno e infraestructura de aprovechamiento en Támesis" fill sizes="(max-width: 900px) 100vw, 52vw" src="/projects/tamesis/paisaje-tamesis.jpg" />
              <span>Támesis · Digestión anaerobia y biogás</span>
            </div>
          </article>
        </div>
      </section>

      <section className="gt-projects-evidence">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Adaptar, no copiar</span><h2>El siguiente proyecto empieza por entender sus condiciones.</h2></div>
            <div className="gt-projects-evidence__copy">
              <p>Los casos ayudan a ver cómo se relacionan la separación, la ruta, la capacidad de recepción, la infraestructura, el equipo responsable y el destino del material. Para aplicar esa experiencia en otro lugar, evaluamos las variables según la corriente, el territorio y las condiciones de operación.</p>
              <p>Pesajes, lotes, consumos y salidas permiten seguir qué ocurrió en cada periodo y orientar las preguntas técnicas que todavía requieren validación.</p>
            </div>
          </div>
          <p className="gt-projects-evidence__tool">GREENATICS OPS ayuda a enlazar pesajes, lotes, variables, responsables y soportes para que el registro acompañe la operación. <Link href="/app/">Conocer OPS →</Link></p>
        </div>
      </section>

      <section className="gt-projects-closing">
        <div className="container gt-projects-closing__grid">
          <div>
            <span className="eyebrow">Tu territorio será diferente</span>
            <h2>El siguiente caso empieza con una lectura rigurosa del punto de partida.</h2>
          </div>
          <div>
            <p>Antes de proponer equipos, conectamos generación, logística, capacidades existentes, salidas posibles, operación y datos. Si alguno de estos casos se parece a tu reto, podemos empezar con esa referencia y volver a validar la escala.</p>
            <div className="button-row">
              <Link className="button button--dark" href="/diagnostico/">Orientar mi proyecto</Link>
              <Link className="button button--ghost" href="/contacto/?interes=solucion&perfil=municipio&diagnostico=Adaptar%20la%20experiencia%20de%20Yarumal&prioridad=Ruta%20selectiva%2C%20recepci%C3%B3n%20y%20tratamiento%20por%20lote">Conversar sobre Yarumal · Municipio / ESP</Link>
              <Link className="button button--ghost" href="/contacto/?interes=solucion&perfil=agroindustria&diagnostico=Evaluar%20una%20ruta%20como%20la%20de%20T%C3%A1mesis&prioridad=Biomasa%2C%20infraestructura%20existente%20y%20alternativas%20de%20aprovechamiento">Conversar sobre Támesis · Agroindustria</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
