import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { libraryResources } from "@/data/library";

export const metadata: Metadata = {
  title: "Recursos para decidir y operar",
  description: "Casos territoriales, biblioteca técnica, herramientas agronómicas, metodología de impacto y demostrador operativo de Greenatics.",
  alternates: { canonical: "/recursos/" },
};

const entryRoutes = [
  ["01", "Estructurar un sistema", "¿Qué necesita mi territorio antes de invertir?", "Revisa criterios de diagnóstico, microrrutas, infraestructura, operación y escalamiento por etapas.", "/municipios/", "Abrir ruta municipal"],
  ["02", "Ordenar una operación", "¿Cómo convierto actividades diarias en control?", "Explora bitácoras, recepciones, lotes, volúmenes, activos, inventarios e indicadores en GREENATICS OPS.", "/app/", "Probar el demostrador OPS"],
  ["03", "Evaluar resultados", "¿Qué dato está listo para convertirse en un claim?", "Conoce la diferencia entre medición, conciliación, aprobación y publicación de indicadores de impacto.", "/impacto/", "Revisar metodología de impacto"],
  ["04", "Tomar una decisión agronómica", "¿Qué necesita el cultivo, el suelo y la etapa?", "Consulta programas por cultivo, alertas de campo, familias Wondergreen y herramientas de estimación.", "/biblioteca/", "Explorar biblioteca agronómica"],
];

const evidenceLevels = [
  ["Caso", "Describe un contexto real, sus componentes y los resultados que cuentan con respaldo disponible."],
  ["Metodología", "Explica cómo se estructura, opera o mide una capacidad; no equivale por sí sola a un resultado garantizado."],
  ["Demostrador", "Permite recorrer una experiencia funcional con datos ilustrativos, separados de las cifras validadas."],
  ["Guía de campo", "Orienta observación y aplicación; la recomendación final depende del cultivo, el lote y el acompañamiento técnico."],
];

export default function RecursosPage() {
  const publishedResources = libraryResources.filter((resource) => resource.status === "publicado").length;

  return (
    <>
      <section className="gt-resources-hero">
        <div className="container gt-resources-hero__grid">
          <div className="gt-resources-hero__copy">
            <span className="eyebrow eyebrow--light">Centro de conocimiento Greenatics</span>
            <h1>Conocimiento para decidir, operar y demostrar.</h1>
            <p className="lead">
              Este no es un repositorio de archivos sueltos. Es una puerta de entrada a casos,
              herramientas y criterios técnicos organizados según la decisión que necesitas tomar.
            </p>
            <div className="gt-resources-hero__facts" aria-label="Contenido disponible">
              <div><strong>{publishedResources}</strong><span>recursos web publicados</span></div>
              <div><strong>2</strong><span>casos territoriales documentados</span></div>
              <div><strong>1</strong><span>estación operativa demostrable</span></div>
            </div>
            <div className="button-row">
              <Link className="button button--light" href="/biblioteca/">Buscar en la biblioteca</Link>
              <Link className="button button--outline-light" href="/proyectos/">Ver proyectos</Link>
            </div>
          </div>

          <div className="gt-resources-hero__mosaic" aria-label="Evidencias y herramientas Greenatics">
            <figure className="gt-resources-hero__primary">
              <Image src="/campaign/06_dashboard_indicadores.jpg" alt="Vista conceptual de tableros e indicadores operativos Greenatics" fill priority sizes="(max-width: 900px) 100vw, 47vw" />
              <figcaption><span>Control operativo</span><strong>De la bitácora diaria al indicador que explica una decisión.</strong></figcaption>
            </figure>
            <figure className="gt-resources-hero__secondary">
              <Image src="/guides/guia-cafe-cover.webp" alt="Portada de la guía Wondergreen para café" fill sizes="(max-width: 900px) 42vw, 14vw" />
              <figcaption>Guías por cultivo</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="gt-resource-routes">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Empieza por tu pregunta</span><h2>Cuatro decisiones, cuatro rutas de lectura.</h2></div>
            <p>No necesitas conocer la estructura del sitio. Elige el problema que tienes hoy y llega al recurso que ayuda a reducir esa incertidumbre.</p>
          </div>
          <div className="gt-resource-route-grid">
            {entryRoutes.map(([index, label, question, copy, href, cta]) => (
              <article key={index}>
                <div><span>{index}</span><small>{label}</small></div>
                <h3>{question}</h3>
                <p>{copy}</p>
                <Link href={href}>{cta} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-resource-featured">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--light">
            <span className="eyebrow eyebrow--light">Recursos destacados</span>
            <h2>Ver el sistema desde el territorio, la operación y el campo.</h2>
            <p>Cada entrada responde una pregunta distinta y deja claro si estás viendo evidencia real, una herramienta de trabajo o una guía de aplicación.</p>
          </div>

          <div className="gt-resource-featured__grid">
            <article className="gt-resource-story">
              <figure>
                <Image src="/projects/plant/plant-evidence-04.webp" alt="Área de maduración de material orgánico en una planta Greenatics" fill sizes="(max-width: 900px) 100vw, 50vw" />
                <span>Caso territorial</span>
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
                <Image src="/projects/tamesis/reactor-uasb.jpeg" alt="Reactor anaerobio UASB de la planta de Támesis" fill sizes="(max-width: 900px) 100vw, 50vw" />
                <span>Infraestructura documentada</span>
              </figure>
              <div>
                <small>Támesis</small>
                <h3>Digestión anaerobia, captura de biogás y bioenergía.</h3>
                <p>Recorre el sistema UASB, las etapas de hidrólisis y los controles que permiten convertir una instalación física en una operación medible.</p>
                <Link href="/proyectos/tamesis/">Explorar el caso Támesis →</Link>
              </div>
            </article>

            <article className="gt-resource-tool">
              <span>Demostrador funcional</span>
              <h3>GREENATICS OPS</h3>
              <p>Una estación de trabajo para entender cómo conviven programación, bitácora, recepciones, procesos, volúmenes, activos, inventario y reportes.</p>
              <ul>
                <li>Datos ilustrativos identificados como demostración</li>
                <li>Vista operativa por planta</li>
                <li>Registro y lectura de novedades</li>
              </ul>
              <Link className="button button--dark" href="/app/">Abrir estación OPS</Link>
            </article>

            <article className="gt-resource-tool gt-resource-tool--paper">
              <span>Biblioteca técnica</span>
              <h3>Del síntoma observado a una decisión mejor informada.</h3>
              <p>Programas por cultivo, guías de deficiencias, manuales de uso, catálogo Wondergreen y contenidos para huertas y jardín.</p>
              <div className="gt-resource-tool__links">
                <Link href="/biblioteca/guia-deficiencias/">Guía de deficiencias →</Link>
                <Link href="/wondergreen/cultivos/cafe/">Programa para café →</Link>
                <Link href="/wondergreen/calculadora/">Calculadora agronómica →</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="gt-resource-standards">
        <div className="container gt-resource-standards__grid">
          <div>
            <span className="eyebrow">Cómo leer este centro</span>
            <h2>No todo contenido demuestra lo mismo.</h2>
            <p>Etiquetamos el tipo de recurso para evitar que una imagen conceptual parezca una operación medida, o que una metodología se interprete como una promesa de desempeño.</p>
            <Link href="/impacto/">Conocer el gobierno de indicadores →</Link>
          </div>
          <dl>
            {evidenceLevels.map(([term, description]) => (
              <div key={term}><dt>{term}</dt><dd>{description}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="gt-route-closing">
        <div className="container gt-route-closing__inner">
          <div><span className="eyebrow">Exploración completa</span><h2>Busca por tema, audiencia o tipo de recurso.</h2></div>
          <Link className="button button--dark" href="/biblioteca/">Abrir biblioteca Greenatics</Link>
        </div>
      </section>
    </>
  );
}
