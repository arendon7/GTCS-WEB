import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { yarumalClaims } from "@/data/claims";

export const metadata: Metadata = {
  title: "Soluciones para sistemas de residuos orgánicos",
  description:
    "Greenatics integra diagnóstico, logística, infraestructura, operación, datos y valorización en soluciones que se adaptan al territorio, la empresa y su capacidad real.",
  alternates: { canonical: "/soluciones/" },
};

const capabilities = [
  ["01", "Entender", "Diagnóstico, caracterización y línea base para saber qué problema existe y qué oportunidad es real.", "/servicios/diagnostico-residuos/"],
  ["02", "Organizar", "PGIRS, PMIRS, actores, responsabilidades, alternativas y hoja de ruta para pasar de intención a proyecto.", "/servicios/pgirs-pmirs/"],
  ["03", "Mover", "Separación, generadores, microrrutas, frecuencia, vehículos y control de calidad desde la fuente.", "/servicios/microrrutas-motocarguero/"],
  ["04", "Transformar", "Ingeniería, implantación, rehabilitación y sistemas de tratamiento ajustados al material y la escala.", "/servicios/plantas-modulares/"],
  ["05", "Hacer funcionar", "Puesta en marcha, procedimientos, dirección técnica, mantenimiento y mejora de la operación.", "/servicios/operacion-delegada/"],
  ["06", "Medir y devolver valor", "Trazabilidad, indicadores, productos y destinos que conectan el resultado con nuevas decisiones.", "/servicios/greenatics-ops/"],
];

const pathways = [
  {
    eyebrow: "Municipio o ESP",
    title: "Necesito convertir una meta pública en un sistema operable.",
    copy: "Partimos del PGIRS, la generación y la capacidad institucional para definir una ruta gradual de suministro, infraestructura, operación y datos.",
    href: "/municipios/",
    cta: "Explorar ruta para municipios",
  },
  {
    eyebrow: "Empresa o gran generador",
    title: "Necesito ordenar una corriente y demostrar su gestión.",
    copy: "Conectamos el punto de generación, el PMIRS, la logística, el tratamiento y los registros que la organización necesita conservar.",
    href: "/empresas/",
    cta: "Explorar ruta para empresas",
  },
  {
    eyebrow: "Infraestructura existente",
    title: "Tengo una planta, pero no produce el resultado esperado.",
    copy: "Separamos problemas de suministro, proceso, equipos, personal, mantenimiento y gestión antes de recomendar una rehabilitación.",
    href: "/servicios/operacion-delegada/",
    cta: "Revisar operación y rehabilitación",
  },
  {
    eyebrow: "Salida de valor",
    title: "Necesito conectar la transformación con suelo y mercado.",
    copy: "Wondergreen articula desarrollo técnico, portafolio y uso agronómico para que el producto responda a una necesidad real.",
    href: "/wondergreen/",
    cta: "Conocer Wondergreen",
  },
  {
    eyebrow: "Proyecto productivo e inversión",
    title: "Necesito estructurar una oportunidad agrícola con trazabilidad.",
    copy: "SANA conecta datos de AGROWAY, ciencia Greenatics y soluciones Wondergreen para acompañar decisiones de inversión, ejecución y aprendizaje en campo.",
    href: "/sana/",
    cta: "Conocer SANA",
  },
];

const systemSteps = [
  ["Residuo", "Entender origen y calidad"],
  ["Operación", "Mover y transformar"],
  ["Producto", "Estabilizar una salida"],
  ["Suelo", "Aplicar con propósito"],
  ["Datos", "Aprender y mejorar"],
];

export default function SolutionsPage() {
  return (
    <>
      <section className="gt-solution-hero">
        <div className="container gt-solution-hero__grid">
          <div className="gt-solution-hero__copy">
            <span className="eyebrow eyebrow--light">Rutas de decisión</span>
            <h1>Una solución no es una máquina.</h1>
            <p className="gt-route-hero__statement">Es una combinación de capacidades que el contexto puede sostener.</p>
            <p className="lead">Esta página ayuda a entender el problema, ordenar las decisiones y combinar capacidades antes de definir un alcance. Greenatics integra conocimiento, logística, infraestructura, operación, productos y datos; la combinación cambia según el material, el territorio, los actores, la infraestructura disponible y la madurez del proyecto.</p>
            <div className="button-row">
              <Link className="button button--light" href="/diagnostico/">Encontrar mi punto de entrada</Link>
              <Link className="button button--outline-light" href="/servicios/">Ver servicios contratables</Link>
              <Link className="button button--outline-light" href="/portafolio/">Ver portafolio Greenatics 2.0</Link>
            </div>
          </div>
          <div className="gt-solution-hero__mosaic" aria-label="Evidencia del sistema Greenatics">
            <figure className="gt-solution-hero__mosaic-main">
              <Image src="/projects/routes/route-evidence-03.webp" alt="Equipo realizando recolección diferenciada de residuos orgánicos" fill priority sizes="(max-width: 900px) 100vw, 44vw" />
              <figcaption>Logística y operación real</figcaption>
            </figure>
            <figure>
              <Image src="/projects/plant/plant-evidence-10.webp" alt="Material orgánico en proceso de aprovechamiento" fill sizes="(max-width: 900px) 50vw, 22vw" />
              <figcaption>Transformación</figcaption>
            </figure>
            <figure>
              <Image src="/products/wondergreen-bioinsumos.webp" alt="Productos de nutrición vegetal Wondergreen" fill sizes="(max-width: 900px) 50vw, 22vw" />
              <figcaption>Salida de valor</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="gt-system-line" aria-label="Secuencia del sistema Greenatics">
        <div className="container">
          {systemSteps.map(([title, copy], index) => (
            <div key={title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><small>{copy}</small></div>
          ))}
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">De la decisión al alcance</span><h2>Combinar solo lo que el proyecto necesita.</h2></div>
            <p>Una solución integral no significa contratar todo al mismo tiempo. Significa que cada decisión considera lo que ocurre antes y después. Cuando la combinación está clara, puedes revisar en Servicios el alcance y la modalidad que corresponde.</p>
          </div>
          <div className="gt-capability-grid">
            {capabilities.map(([number, title, copy, href]) => (
              <article key={title}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <Link href={href}>Ver servicio relacionado →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-solution-principle">
        <div className="container gt-solution-principle__grid">
          <div>
            <span className="eyebrow eyebrow--light">Greenatics 2.0</span>
            <h2>Hacer que el sistema funcione sin crear dependencia permanente.</h2>
            <p>La evolución de Greenatics separa con claridad la responsabilidad local de operación y el conocimiento especializado que la fortalece. Podemos diagnosticar, diseñar, poner en marcha, dirigir técnicamente, medir y mejorar; el modelo se define para que las capacidades queden instaladas y el territorio conserve control sobre su sistema.</p>
          </div>
          <blockquote>
            <span>Principio operativo</span>
            <strong>La organización local opera.</strong>
            <strong>Greenatics dirige, mide y mejora según el alcance.</strong>
            <p>Menos estructura impuesta. Más conocimiento transferible, estándares y evidencia.</p>
          </blockquote>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading"><span className="eyebrow">Entrar por el problema correcto</span><h2>Cinco contextos, cinco recorridos.</h2><p>El lenguaje, los instrumentos y la decisión inicial cambian según quién debe actuar, qué parte de la cadena ya existe y cómo se quiere acompañar el proyecto.</p></div>
          <div className="gt-pathway-grid">
            {pathways.map((path) => (
              <article key={path.eyebrow}>
                <span>{path.eyebrow}</span>
                <h3>{path.title}</h3>
                <p>{path.copy}</p>
                <Link href={path.href}>{path.cta} →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-case-band">
        <div className="container gt-case-band__grid">
          <div className="gt-case-band__copy">
            <span className="eyebrow eyebrow--light">La cadena completa en práctica</span>
            <h2>Yarumal demuestra que la logística también es tecnología.</h2>
            <p>El resultado no proviene de una sola pieza. Separación, frecuencia, operación, recepción, tratamiento y seguimiento trabajan como un sistema y permiten corregir con información real.</p>
            <Link className="button button--light" href="/proyectos/yarumal/">Leer el caso completo</Link>
          </div>
          <div className="gt-case-band__metrics">
            {yarumalClaims.map((claim) => <div key={claim.id}><strong>{claim.value}</strong><span>{claim.compactLabel}</span></div>)}
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container gt-tools-panel">
          <div><span className="eyebrow">Herramientas orientativas</span><h2>Explorar antes de estructurar.</h2><p>Los autodiagnósticos ayudan a ordenar preguntas y preparar una conversación técnica. No reemplazan estudios, conceptos profesionales, validaciones regulatorias ni decisiones contractuales.</p></div>
          <div className="gt-tools-panel__links">
            <Link href="/diagnostico/"><span>01</span><div><strong>Orientador de soluciones</strong><p>Identifica el punto de entrada más probable.</p></div></Link>
            <Link href="/soluciones/viabilidad-municipal/"><span>02</span><div><strong>Escenario municipal</strong><p>Organiza variables iniciales de viabilidad.</p></div></Link>
            <Link href="/soluciones/auditoria-sui/"><span>03</span><div><strong>Lista de preparación de información</strong><p>Revisa brechas antes de una evaluación formal.</p></div></Link>
          </div>
        </div>
      </section>

      <section className="gt-route-closing">
        <div className="container gt-route-closing__inner">
          <div><span className="eyebrow">Construir la combinación correcta</span><h2>Podemos empezar por el punto donde hoy está tu sistema.</h2></div>
          <Link className="button button--dark" href="/contacto/">Hablar con el equipo técnico</Link>
        </div>
      </section>
    </>
  );
}
