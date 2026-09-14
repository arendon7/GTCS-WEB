import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

const timeline = [
  {
    stage: "Entender el sistema",
    title: "Línea base territorial",
    copy: "La decisión parte de cuánto material existe, quién lo genera, cómo se entrega y qué capacidad puede sostener el equipo local.",
    outcome: "Generadores, restricciones y balance inicial",
  },
  {
    stage: "Probar en campo",
    title: "Ruta selectiva piloto",
    copy: "Los recorridos, tiempos, frecuencias y protocolos se ajustan con operación real antes de ampliar cobertura o flota.",
    outcome: "Logística validada y control de calidad",
  },
  {
    stage: "Conectar la cadena",
    title: "Recepción y bioproceso",
    copy: "La calidad lograda en la fuente se conserva con criterios de ingreso, trazabilidad de lotes y control de proceso en planta.",
    outcome: "Material transformable y proceso estable",
  },
  {
    stage: "Tomar control",
    title: "Datos para decidir",
    copy: "Los registros dejan de ser archivos aislados y se convierten en balances, alertas e indicadores para dirección técnica.",
    outcome: "Seguimiento operativo y evidencia auditable",
  },
] as const;

const gallery = [
  {
    src: "/projects/routes/route-evidence-12.webp",
    alt: "Entrega separada de residuos orgánicos durante una microrruta en Yarumal",
    title: "Separación que llega a la ruta",
    caption: "La pureza se construye con generadores, protocolos de entrega y acompañamiento constante.",
  },
  {
    src: "/projects/routes/route-evidence-02.webp",
    alt: "Pesaje y registro de residuos orgánicos recolectados en Yarumal",
    title: "Pesaje y trazabilidad en campo",
    caption: "Cada entrega aporta información para entender masa, frecuencia, calidad y cobertura.",
  },
  {
    src: "/projects/plant/plant-evidence-02.webp",
    alt: "Recepción y revisión de material orgánico en la planta de Yarumal",
    title: "Recepción con criterio técnico",
    caption: "El material se inspecciona y clasifica antes de incorporarse al proceso biológico.",
  },
  {
    src: "/projects/plant/plant-evidence-06.webp",
    alt: "Material orgánico estabilizado durante el proceso de aprovechamiento en Yarumal",
    title: "Bioproceso bajo seguimiento",
    caption: "Temperatura, humedad, tiempos y condición del material orientan las decisiones de operación.",
  },
] as const;

const responsibilities = [
  {
    label: "Territorio y operador local",
    title: "Opera y conserva el control del sistema.",
    items: ["Equipo y rutinas diarias", "Relación con generadores", "Infraestructura y recursos locales"],
  },
  {
    label: "Greenatics",
    title: "Estructura, dirige, mide y mejora según el alcance.",
    items: ["Diseño técnico y operativo", "Protocolos, indicadores y acompañamiento", "Transferencia de conocimiento"],
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
      <section className="gt-case-hero">
        <div className="container gt-case-hero__grid">
          <div className="gt-case-hero__copy">
            <Link className="gt-case-back" href="/proyectos/">Proyectos / Caso Yarumal</Link>
            <span className="eyebrow eyebrow--light">Caso validado · Norte de Antioquia</span>
            <h1>Yarumal convirtió un trayecto de disposición en capacidad territorial.</h1>
            <p className="lead">
              Separación en la fuente, microrrutas, recepción, bioproceso, dirección técnica y datos
              funcionan como una sola cadena para aprovechar orgánicos cerca de donde se generan.
            </p>
            <div className="button-row">
              <a className="button button--light" href="#resultados">Ver resultados</a>
              <a className="button button--outline-light" href="#metodologia">Cómo se calcularon</a>
            </div>
          </div>

          <div className="gt-case-hero__visual">
            <figure className="gt-case-hero__main-image">
              <Image
                src="/projects/routes/route-evidence-01.webp"
                alt="Equipo y vehículos de recolección selectiva de residuos orgánicos en Yarumal"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <figcaption>
                <strong>La logística también es tecnología</strong>
                <span>Operación real de recolección selectiva en el territorio.</span>
              </figcaption>
            </figure>
            <figure className="gt-case-hero__inset">
              <Image
                src="/projects/plant/plant-evidence-10.webp"
                alt="Biomasa orgánica recibida para transformación en Yarumal"
                fill
                sizes="(max-width: 900px) 42vw, 17vw"
              />
              <figcaption>Recepción y transformación local</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="gt-proof-ribbon" id="resultados" aria-label="Resultados validados del caso Yarumal">
        <div className="container gt-proof-ribbon__grid">
          <div className="gt-proof-ribbon__intro">
            <span>Impacto comprobado</span>
            <strong>Resultados del periodo validado</strong>
          </div>
          {yarumalClaims.map((claim) => (
            <div key={claim.id}>
              <strong>{claim.value}</strong>
              <span>{claim.compactLabel}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container gt-case-context">
          <div className="gt-case-context__heading">
            <span className="eyebrow">El reto territorial</span>
            <h2>El residuo no necesitaba otra promesa. Necesitaba una cadena que pudiera operar.</h2>
          </div>
          <div className="gt-case-context__body">
            <p className="lead">
              Transportar orgánicos hacia una alternativa regional extendía recorridos y costos,
              mientras el municipio conservaba el reto de separar, recolectar y controlar una
              corriente altamente biodegradable.
            </p>
            <blockquote>
              <span>Decisión de diseño</span>
              <strong>Acercar el aprovechamiento al lugar donde el material se genera.</strong>
              <p>La infraestructura solo crea valor cuando suministro, operación y salida de producto están conectados.</p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="gt-case-system">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-route-heading--light">
            <div><span className="eyebrow eyebrow--light">El modelo implementado</span><h2>Cinco movimientos, un solo sistema operativo.</h2></div>
            <p>Cada etapa protege el resultado de la siguiente. La ruta cuida la calidad, la planta transforma y los datos permiten corregir.</p>
          </div>
          <ol className="gt-case-system__steps">
            {systemSteps.map(([number, title, copy]) => (
              <li key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Cómo se construyó</span><h2>Escalar después de aprender.</h2></div>
            <p>La experiencia no se resume en instalar una planta. La secuencia reduce incertidumbre y convierte cada etapa en evidencia para la siguiente decisión.</p>
          </div>
          <ol className="gt-case-timeline">
            {timeline.map((item, index) => (
              <li key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><small>{item.stage}</small><h3>{item.title}</h3></div>
                <p>{item.copy}</p>
                <strong>{item.outcome}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="gt-case-gallery">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-route-heading--light">
            <div><span className="eyebrow eyebrow--light">Archivo operativo</span><h2>La evidencia está en el trabajo cotidiano.</h2></div>
            <p>Imágenes documentales de las etapas que sostienen el resultado: entrega, registro, recepción y transformación.</p>
          </div>
          <div className="gt-case-gallery__grid">
            {gallery.map((item, index) => (
              <figure className={index === 0 ? "gt-case-gallery__feature" : undefined} key={item.src}>
                <div><Image src={item.src} alt={item.alt} fill sizes={index === 0 ? "(max-width: 900px) 100vw, 52vw" : "(max-width: 900px) 100vw, 25vw"} /></div>
                <figcaption><strong>{item.title}</strong><span>{item.caption}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper" id="metodologia">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Metodología de los claims</span><h2>Una cifra fuerte necesita contexto visible.</h2></div>
            <p>Estos resultados pertenecen al caso Yarumal y a su periodo o escenario validado. No se presentan como rendimientos automáticos de cualquier proyecto.</p>
          </div>
          <div className="gt-case-method-grid">
            {yarumalClaims.map((claim) => (
              <article key={claim.id}>
                <span>{claim.evidence}</span>
                <strong>{claim.value}</strong>
                <h3>{claim.compactLabel}</h3>
                <p>{claim.method}</p>
                <small>{claim.context}</small>
              </article>
            ))}
          </div>
          <div className="gt-case-evidence-note">
            <div><span>Evidencia operativa y económica</span><p>Masa, pureza, recorrido y ahorro se sustentan en registros, caracterización y comparaciones del caso.</p></div>
            <div><span>Respaldo científico del proceso</span><p>GIEM-UdeA aporta conocimiento aplicado al bioproceso; su participación no se usa para atribuirle la validación de todos los indicadores comerciales.</p></div>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading"><span className="eyebrow">Responsabilidades claras</span><h2>Capacidad local con conocimiento especializado.</h2><p>La continuidad depende de saber quién opera, quién acompaña y qué conocimiento fortalece cada decisión.</p></div>
          <div className="gt-case-roles">
            {responsibilities.map((role, index) => (
              <article key={role.label}>
                <span>{String(index + 1).padStart(2, "0")} · {role.label}</span>
                <h3>{role.title}</h3>
                <ul>{role.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-case-learning">
        <div className="container gt-case-learning__grid">
          <div><span className="eyebrow eyebrow--light">Aprendizaje transferible</span><h2>El modelo no se copia. Se adapta con evidencia.</h2></div>
          <div>
            <p>Yarumal demuestra que el aprovechamiento local puede crear eficiencia y capacidad territorial cuando la solución integra suministro, logística, infraestructura, operación y datos.</p>
            <p>En otro territorio, el tamaño de la ruta, la tecnología, la inversión y los resultados deben volver a validarse.</p>
            <div className="button-row"><Link className="button button--light" href="/municipios/">Aplicar el aprendizaje</Link><Link className="button button--outline-light" href="/contacto/?interes=solucion&perfil=municipio&diagnostico=Adaptar%20el%20modelo%20Yarumal&prioridad=Log%C3%ADstica%20selectiva%20%C2%B7%20capacidad%20local%20%C2%B7%20operaci%C3%B3n%20y%20evidencia">Conversar sobre un proyecto</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
