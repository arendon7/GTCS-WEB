import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ServiceAudienceLink } from "@/components/service-audience-link";
import { yarumalClaims } from "@/data/claims";

export const metadata: Metadata = {
  title: "Caso Yarumal | Residuos orgánicos, microrrutas y aprovechamiento",
  description:
    "Caso validado de Greenatics en Yarumal: más de 120 toneladas mensuales desviadas, 96,4 % de pureza, logística local, bioproceso y trazabilidad.",
  alternates: { canonical: "/proyectos/yarumal/" },
};

const systemSteps = [
  ["01", "Separar", "Generadores vinculados, criterios de aceptación y acompañamiento para entregar una corriente limpia."],
  ["02", "Recolectar", "Microrrutas selectivas, frecuencias y vehículos ajustados a la topografía y a la densidad urbana."],
  ["03", "Transformar", "Recepción, control de impropios, formulación de mezcla, proceso termófilo, maduración y afinado."],
  ["04", "Registrar", "Pesajes, lotes, parámetros, novedades, inventarios y evidencia fotográfica de la operación."],
  ["05", "Mejorar", "Indicadores de masa, calidad, recorrido y costo convertidos en decisiones operativas."],
] as const;

const responsibilities = [
  {
    label: "Territorio y operador local",
    title: "Opera y conserva el control del sistema.",
    items: ["Equipo y rutinas diarias", "Relación con generadores", "Infraestructura y recursos locales"],
  },
  {
    label: "Greenatics",
    title: "Conecta experiencia operativa, ciencia y mejora continua.",
    items: ["Diseño técnico y operativo", "Grupo de investigación indexado y colaboración académica", "Protocolos, indicadores y transferencia de conocimiento"],
  },
  {
    label: "GIEM · Universidad de Antioquia",
    title: "Fortalece la base científica del bioproceso.",
    items: ["Inoculación microbiana termófila", "Seguimiento de parámetros críticos", "Conocimiento aplicado a transformación"],
  },
] as const;

export default function YarumalPage() {
  return (
    <>
      <section className="gt-case-hero gt-yarumal-hero">
        <div className="container gt-case-hero__grid">
          <div className="gt-case-hero__copy">
            <Link className="gt-case-back" href="/proyectos/">Proyectos / Caso Yarumal</Link>
            <span className="eyebrow eyebrow--light">Más de cinco años de experiencia · Norte de Antioquia</span>
            <h1>Yarumal: más de cinco años articulando separación, microrrutas y compostaje.</h1>
            <p className="lead">
              Hogares y organizaciones separan sus residuos orgánicos; las microrrutas los llevan a
              recepción y compostaje. El equipo local transforma y registra el proceso, con
              acompañamiento técnico y científico.
            </p>
            <div className="button-row">
              <a className="button button--light" href="#resultados">Ver indicadores y escenario</a>
              <a className="button button--outline-light" href="#metodologia">Cómo se calcularon</a>
            </div>
          </div>

          <div className="gt-case-hero__visual">
            <figure className="gt-case-hero__main-image" id="evidencia">
              <Image
                src="/projects/plant/plant-evidence-06.webp"
                alt="Material orgánico en proceso de compostaje en Yarumal"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <figcaption>
                <strong>Compostaje bajo cubierta en Yarumal</strong>
                <span>Una etapa del tratamiento de residuos orgánicos que articula la ruta selectiva con el proceso en planta.</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="gt-proof-ribbon" id="resultados" aria-label="Indicadores del caso Yarumal y escenario económico anualizado">
        <div className="container gt-proof-ribbon__grid">
          <div className="gt-proof-ribbon__intro">
            <span>Resultados y escenario</span>
            <strong>Indicadores con su alcance visible</strong>
          </div>
          {yarumalClaims.map((claim) => (
            <div key={claim.id}>
              <strong>{claim.value}</strong>
              <span>{claim.compactLabel}</span>
              <small>{claim.context}</small>
            </div>
          ))}
        </div>
      </section>

      <nav className="gt-case-local-nav" aria-label="Recorrido del caso Yarumal">
        <div className="container">
          <span>Recorrido del caso</span>
          <a href="#resultados">Resultados</a>
          <a href="#sistema">Cadena operativa</a>
          <a href="#evidencia">Archivo del proyecto</a>
          <a href="#metodologia">Metodología</a>
          <a href="#responsabilidades">Responsabilidades</a>
          <a href="#aprendizaje">Aprendizaje</a>
        </div>
      </nav>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container gt-case-context">
          <div className="gt-case-context__heading">
            <span className="eyebrow">El reto territorial</span>
            <h2>El residuo no necesitaba otra promesa. Necesitaba una cadena que pudiera operar.</h2>
          </div>
          <div className="gt-case-context__body">
            <p className="lead">
              Transportar los orgánicos separados hacia una alternativa regional extendía los
              recorridos y sus costos. Junto con el municipio y la ESP Aguas del Norte, Greenatics
              consolidó la ruta selectiva y acompañó la operación para conectar generadores,
              microrrutas, recepción, caracterización y compostaje por lote. El reto no era solo
              instalar infraestructura, sino coordinar la cadena y sostenerla con capacidades
              locales.
            </p>
            <blockquote>
              <span>Decisión de diseño</span>
              <strong>Acercar el aprovechamiento al lugar donde el material se genera.</strong>
              <p>La infraestructura solo crea valor cuando suministro, operación y salida de producto están conectados.</p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="gt-case-system" id="sistema">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-route-heading--light">
            <div><span className="eyebrow eyebrow--light">La cadena en operación</span><h2>De separar los orgánicos a mejorar el proceso.</h2></div>
            <p>La recolección lleva material de calidad a la planta. El tratamiento lo transforma; los registros ayudan al equipo a corregir la operación.</p>
          </div>
          <ol className="gt-case-system__steps">
            {systemSteps.map(([number, title, copy]) => (
              <li key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>
            ))}
          </ol>
          <div className="gt-yarumal-evidence">
            <div className="gt-yarumal-evidence__intro">
              <span className="eyebrow eyebrow--light">Recepción y tratamiento</span>
              <h3>La cadena también se entiende desde lo que ocurre en planta.</h3>
              <p>El archivo del proyecto muestra orgánicos separados en recepción y compostaje bajo cubierta. Las fotografías dan contexto visual; los indicadores del caso se respaldan con registros, caracterización y comparación logística.</p>
            </div>
            <figure>
              <div className="gt-yarumal-evidence__image">
                <Image
                  src="/projects/plant/plant-evidence-10.webp"
                  alt="Residuos orgánicos separados en la zona de recepción de Yarumal."
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 43vw"
                />
              </div>
              <figcaption><strong>Recepción de orgánicos separados</strong><span>Yarumal · imagen del archivo del proyecto</span></figcaption>
            </figure>
            <figure>
              <div className="gt-yarumal-evidence__image">
                <Image
                  src="/projects/plant/plant-evidence-02.webp"
                  alt="Pilas de compostaje bajo cubierta en Yarumal."
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 35vw"
                />
              </div>
              <figcaption><strong>Compostaje bajo cubierta</strong><span>Yarumal · imagen del archivo del proyecto</span></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper" id="metodologia">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Cómo leer los resultados</span><h2>Una cifra necesita contexto para entenderse.</h2></div>
            <p>Los datos corresponden a un periodo validado, una ruta comparada o un escenario económico anualizado. Cada indicador conserva su unidad y alcance; no se extrapola automáticamente a otros municipios.</p>
          </div>
          <div className="gt-case-method-grid gt-case-method-grid--method-only">
            {yarumalClaims.map((claim) => (
              <article key={claim.id}>
                <span>{claim.evidence}</span>
                <h3>{claim.compactLabel}</h3>
                <p>{claim.method}</p>
                <small>{claim.context}</small>
              </article>
            ))}
          </div>
          <div className="gt-case-evidence-note">
            <div><span>Evidencia operativa y económica</span><p>Masa, pureza, recorrido y ahorro se sustentan en registros, caracterización y comparaciones del caso.</p></div>
                <div><span>Ciencia y conocimiento aplicado</span><p>Greenatics integra experiencia de operación con un grupo de investigación indexado y trabajo académico aplicado al bioproceso junto al GIEM de la Universidad de Antioquia. Cada resultado conserva su propia evidencia y metodología.</p></div>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white" id="responsabilidades">
        <div className="container">
          <div className="gt-route-heading"><span className="eyebrow">Responsabilidades claras</span><h2>Capacidad local con conocimiento especializado.</h2><p>La continuidad depende de saber quién opera, quién acompaña y qué conocimiento fortalece cada decisión.</p></div>
          <div className="gt-case-roles">
            {responsibilities.map((role) => (
              <article key={role.label}>
                <span>{role.label}</span>
                <h3>{role.title}</h3>
                <ul>{role.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-case-learning" id="aprendizaje">
        <div className="container gt-case-learning__grid">
          <div><span className="eyebrow eyebrow--light">Aprendizaje transferible</span><h2>El modelo no se copia. Se adapta con evidencia.</h2></div>
          <div>
            <p>La experiencia aporta una forma concreta de estructurar proyectos municipales: caracterizar generadores, diseñar microrrutas, dimensionar la recepción y asegurar quién opera y cómo se sigue el proceso.</p>
            <p>Ese método orienta el diseño; cobertura, tecnología, inversión y resultados se definen de nuevo con las condiciones y los datos de cada territorio.</p>
            <div className="button-row"><Link className="button button--light" href="/municipios/">Aplicar el aprendizaje</Link><ServiceAudienceLink className="button button--outline-light" href="/contacto/?interes=solucion&perfil=municipio&diagnostico=Adaptar%20el%20modelo%20Yarumal&prioridad=Log%C3%ADstica%20selectiva%20%C2%B7%20capacidad%20local%20%C2%B7%20operaci%C3%B3n%20y%20evidencia" preferIncomingProfile>Conversar sobre un proyecto</ServiceAudienceLink></div>
          </div>
        </div>
      </section>
    </>
  );
}
