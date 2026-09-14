import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { companyServices } from "@/data/services";
import { RouteDecisionBridge } from "@/components/route-decision-bridge";

export const metadata: Metadata = {
  title: "Empresas y grandes generadores",
  description:
    "Greenatics conecta separación, PMIRS, recolección, tratamiento y datos para que empresas y grandes generadores gestionen sus residuos orgánicos con evidencia.",
  alternates: { canonical: "/empresas/" },
};

const segments = [
  ["Alimentos y agroindustria", "Descartes de proceso, subproductos y corrientes cuya composición y estacionalidad determinan la alternativa.", "Composición, continuidad y posibilidad de reincorporar valor."],
  ["Plazas, retail y distribución", "Muchos puntos de generación, alto volumen y necesidad de coordinar separación, almacenamiento y frecuencia.", "Densidad de puntos, ventana de atención y control de impropios."],
  ["Hoteles, restaurantes y centros comerciales", "Corrientes recurrentes que exigen rutinas simples para el equipo y recolección programada.", "Facilidad de ejecución durante turnos de cocina, aseo y cierre."],
  ["Pecuario", "Estiércoles y otras biomasas cuyo tratamiento depende de composición, humedad, escala y condiciones del predio.", "Balance entre carga orgánica, agua, área disponible y uso agronómico."],
  ["Instituciones y campus", "Sedes con múltiples usuarios, necesidades de formación, rutas internas, gestores y seguimiento.", "Gobernanza entre áreas, formación continua y trazabilidad del gestor."],
  ["Operadores y grandes complejos", "Aeropuertos, zonas francas y complejos con varios puntos, contratistas y requerimientos logísticos.", "Integración de responsables, contratistas, accesos y niveles de servicio."],
];

const evidence = [
  ["Origen", "Punto, área, responsable y tipo de corriente."],
  ["Cantidad", "Volumen o peso, frecuencia y estacionalidad."],
  ["Calidad", "Separación, impropios, humedad y novedades."],
  ["Movimiento", "Almacenamiento, atención, ruta y recepción."],
  ["Tratamiento", "Proceso aplicado, lote y control operativo."],
  ["Resultado", "Material gestionado, producto, destino e indicadores."],
];

const valueSteps = [
  ["01", "Entender", "Qué se genera y qué condiciona su manejo."],
  ["02", "Ordenar", "Personas, puntos, recipientes y rutinas internas."],
  ["03", "Conectar", "Frecuencia, recolección y criterios de aceptación."],
  ["04", "Transformar", "Tratamiento compatible con la corriente."],
  ["05", "Demostrar", "Registros útiles para gestión y mejora."],
];

export default function CompaniesPage() {
  return (
    <>
      <section className="gt-route-hero gt-route-hero--company">
        <div className="container gt-route-hero__grid">
          <div className="gt-route-hero__copy">
            <span className="eyebrow eyebrow--light">Empresas y grandes generadores</span>
            <h1>Gestionar orgánicos no es sacar una bolsa del edificio.</h1>
            <p className="gt-route-hero__statement">Es conectar la operación interna con un destino verificable.</p>
            <p className="lead">
              Greenatics organiza lo que ocurre desde el punto de generación hasta la recepción,
              el tratamiento y la evidencia. Podemos resolver una brecha puntual o estructurar
              la cadena completa para que el sistema sea ejecutable y medible.
            </p>
            <div className="button-row">
              <Link className="button button--light" href="/servicios/diagnostico-residuos/">Caracterizar mi corriente</Link>
              <Link className="button button--outline-light" href="/contacto/">Conversar sobre el alcance</Link>
            </div>
          </div>
          <figure className="gt-route-hero__figure">
            <Image
              src="/projects/routes/route-evidence-10.webp"
              alt="Operario verificando residuos orgánicos separados en un punto de generación"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <figcaption>
              <strong>El sistema comienza en el punto de generación</strong>
              <span>Una rutina clara protege la calidad del material antes de la recolección.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-context-strip">
        <div className="container gt-context-strip__inner">
          <strong>Volumen no basta.</strong>
          <p>Composición, humedad, impropios, estacionalidad, almacenamiento, frecuencia, distancia y destino cambian la solución técnica y económica.</p>
          <Link href="/diagnostico/">Usar el orientador inicial →</Link>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Contextos de generación</span><h2>El residuo y la operación definen el sistema.</h2></div>
            <p>Dos organizaciones con el mismo volumen pueden necesitar soluciones distintas. El proceso productivo, los espacios, las personas y la continuidad de la corriente importan tanto como las toneladas.</p>
          </div>
          <div className="gt-segment-grid">
            {segments.map(([title, copy, criterion], index) => (
              <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p><div><small>Variable decisiva</small><strong>{criterion}</strong></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container gt-pmirs-story">
          <div className="gt-pmirs-story__copy">
            <span className="eyebrow">Gestión dentro de la organización</span>
            <h2>Un PMIRS útil se reconoce porque la gente puede ejecutarlo.</h2>
            <p>No debería ser un documento que aparece durante una auditoría. Debe traducir el diagnóstico en responsables, puntos, recipientes, rutas internas, frecuencias, gestores, contingencias, evidencias e indicadores comprensibles.</p>
            <blockquote>La meta no es producir instrucciones. Es reducir errores cotidianos y sostener una forma de trabajo.</blockquote>
            <Link className="button button--dark" href="/servicios/pgirs-pmirs/">Conocer el servicio PMIRS</Link>
          </div>
          <div className="gt-pmirs-story__visual">
            <figure>
              <Image
                src="/projects/routes/route-evidence-11.webp"
                alt="Acompañamiento a una generadora durante la entrega de residuos orgánicos separados"
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <figcaption>La formación funciona cuando acompaña una rutina concreta de separación y entrega.</figcaption>
            </figure>
            <ol>
              {["Línea base y mapa de corrientes", "Puntos, recipientes y almacenamiento", "Responsables y rutas internas", "Gestores, frecuencia y contingencias", "Formación, registros e indicadores"].map((item, index) => (
                <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <RouteDecisionBridge
        eyebrow="De la necesidad al alcance"
        title="Tres niveles de ambición que no deben confundirse."
        intro="Ordenar la operación interna, construir una estrategia de circularidad y preparar un expediente de inversión son trabajos relacionados, pero requieren datos, responsables y validaciones diferentes."
        cards={[
          {
            label: "Ejecución interna",
            title: "Quiero que la separación y la entrega funcionen.",
            copy: "Convierte la línea base en puntos, recipientes, responsables, rutas internas, almacenamiento, gestores y contingencias.",
            inputs: ["Mapa de sedes, procesos y corrientes", "Rutinas, espacios y responsables", "Gestores, frecuencias y novedades"],
            href: "/servicios/pgirs-pmirs/",
            cta: "Estructurar PMIRS",
          },
          {
            label: "Circularidad y evidencia",
            title: "Quiero reducir disposición y demostrar la gestión.",
            copy: "Reconcilia masa, inventarios, destinos y soportes antes de fijar una meta o publicar un indicador de desvío.",
            inputs: ["Pesajes, compras e inventarios", "Contratos y soportes de destinos", "Frontera, periodo y uso del indicador"],
            href: "/soluciones/vertimiento-cero/",
            cta: "Preparar línea base circular",
          },
          {
            label: "Inversión ambiental",
            title: "Quiero evaluar elegibilidad antes de invertir.",
            copy: "Separa activos, obras y servicios; documenta la línea base y coordina el soporte técnico con revisión jurídica y tributaria.",
            inputs: ["Matriz de inversión y fechas", "Objetivo y línea base ambiental", "Diseños, cotizaciones y soportes"],
            href: "/soluciones/beneficio-tributario/",
            cta: "Revisar elegibilidad",
          },
        ]}
      />

      <section className="gt-company-chain">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--light">
            <span className="eyebrow eyebrow--light">De la fuente al resultado</span>
            <h2>La trazabilidad debe continuar después de la recolección.</h2>
            <p>Retirar el material resuelve una necesidad logística. Una gestión completa conecta la entrega con la recepción, el tratamiento, las novedades y el resultado consolidado.</p>
          </div>
          <div className="gt-company-chain__photos">
            <figure><Image src="/projects/routes/route-evidence-03.webp" alt="Carga de residuos orgánicos separados durante una operación de recolección" fill sizes="(max-width: 800px) 100vw, 50vw" /><figcaption><strong>Recolección</strong><span>Atención, calidad y novedades del material entregado.</span></figcaption></figure>
            <figure><Image src="/projects/plant/plant-evidence-10.webp" alt="Residuos orgánicos recibidos para su proceso de aprovechamiento" fill sizes="(max-width: 800px) 100vw, 50vw" /><figcaption><strong>Transformación</strong><span>Recepción, proceso, control y salida.</span></figcaption></figure>
          </div>
          <ol className="gt-value-steps">
            {valueSteps.map(([number, title, copy]) => <li key={title}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Cadena de evidencia</span><h2>Registrar lo necesario para demostrar y mejorar.</h2></div>
            <p>La trazabilidad no consiste en acumular formatos. Consiste en conservar los datos que explican qué ocurrió, dónde se perdió calidad y qué decisión debería cambiar.</p>
          </div>
          <div className="gt-evidence-grid">
            {evidence.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{copy}</p></article>)}
          </div>
          <div className="gt-inline-action gt-inline-action--paper"><p>Los indicadores se definen según la operación y el alcance de reporte de cada organización.</p><Link href="/impacto/">Conocer el modelo de datos e impacto →</Link></div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split"><div><span className="eyebrow">Servicios para empresas</span><h2>Empezar por la brecha que hoy impide avanzar.</h2></div><p>Diagnóstico, PMIRS, infraestructura y datos pueden contratarse como fases independientes. Si la cadena requiere varias capacidades, Greenatics las integra bajo un solo alcance.</p></div>
          <div className="gt-service-preview-grid gt-service-preview-grid--company">
            {companyServices.map((service) => (
              <article key={service.slug}>
                <span>{service.category}</span>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <div className="gt-card-answer"><strong>Qué ayuda a resolver</strong><p>{service.solves}</p></div>
                <Link href={`/servicios/${service.slug}/`}>Ver alcance y entregables →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-route-closing gt-route-closing--company">
        <div className="container gt-route-closing__inner">
          <div><span className="eyebrow">Primer paso</span><h2>Muéstranos dónde nace el residuo y construiremos la ruta desde ahí.</h2></div>
          <Link className="button button--dark" href="/servicios/diagnostico-residuos/">Solicitar caracterización</Link>
        </div>
      </section>
    </>
  );
}
