import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { yarumalClaims } from "@/data/claims";
import { environmentalParkModules, municipalServices } from "@/data/services";
import { RouteDecisionBridge } from "@/components/route-decision-bridge";

export const metadata: Metadata = {
  title: "Municipios y empresas de servicios públicos",
  description:
    "Greenatics convierte metas del PGIRS en sistemas operables: diagnóstico, rutas selectivas, plantas, rehabilitación, operación, productos y trazabilidad para municipios y ESP.",
  alternates: { canonical: "/municipios/" },
};

const decisionAxes = [
  {
    number: "01",
    title: "Suministro",
    copy: "Cuánto material puede separarse de verdad, quién lo entrega y con qué calidad y frecuencia.",
    question: "¿Hay biomasa suficiente y estable para alimentar el sistema?",
  },
  {
    number: "02",
    title: "Logística",
    copy: "Generadores, almacenamiento, microrrutas, tiempos, vehículos, costos y control de impropios.",
    question: "¿La ruta puede sostener la calidad sin disparar el costo?",
  },
  {
    number: "03",
    title: "Infraestructura",
    copy: "Capacidad, proceso, implantación, equipos, servicios, áreas y posibilidad de crecer por etapas.",
    question: "¿Qué necesita el residuo y qué puede operar el territorio?",
  },
  {
    number: "04",
    title: "Gobierno operativo",
    copy: "Responsables, personal, presupuesto, procedimientos, mantenimiento, datos y destino de productos.",
    question: "¿Quién hará funcionar el sistema todos los días?",
  },
];

const moments = [
  ["Tengo el problema, no el proyecto", "Diagnóstico + prefactibilidad", "Construimos una línea base y comparamos alternativas antes de convertir una idea en inversión."],
  ["Ya existe un proyecto", "Revisión + ingeniería", "Validamos supuestos, balance de masa, implantación, cantidades, costos y lógica de operación."],
  ["Tengo infraestructura que no funciona", "Diagnóstico + rehabilitación", "Separamos fallas físicas, biológicas, logísticas y administrativas antes de intervenir."],
  ["La planta existe, pero falta material", "Ruta selectiva + piloto", "Probamos generadores, frecuencias, recorridos, tiempos y calidad para estabilizar el suministro."],
  ["La operación creció y perdió control", "Dirección técnica + OPS", "Estandarizamos programación, registros, lotes, mantenimiento, producto, alertas e indicadores."],
];

const pilotSteps = [
  ["01", "Caracterizar", "Generadores, material, puntos y restricciones."],
  ["02", "Diseñar", "Recorrido, frecuencia, capacidad y protocolo."],
  ["03", "Operar", "Recolectar, pesar y registrar novedades."],
  ["04", "Aprender", "Ajustar tiempos, cobertura, calidad y costos."],
  ["05", "Escalar", "Ampliar solo con evidencia de la ruta piloto."],
];

export default function MunicipiosPage() {
  return (
    <>
      <section className="gt-route-hero gt-route-hero--municipal">
        <div className="container gt-route-hero__grid">
          <div className="gt-route-hero__copy">
            <span className="eyebrow eyebrow--light">Municipios y empresas de servicios públicos</span>
            <h1>Un sistema de aprovechamiento no comienza con una planta.</h1>
            <p className="gt-route-hero__statement">Comienza con un territorio que sabe qué debe operar.</p>
            <p className="lead">
              Greenatics convierte metas del PGIRS en decisiones técnicas, rutas, infraestructura,
              rutinas de operación y datos. El objetivo no es entregar piezas aisladas, sino construir
              una cadena que pueda arrancar, estabilizarse y mejorar.
            </p>
            <div className="button-row">
              <Link className="button button--light" href="/servicios/diagnostico-residuos/">Evaluar mi punto de partida</Link>
              <Link className="button button--outline-light" href="/proyectos/yarumal/">Ver el caso Yarumal</Link>
            </div>
          </div>

          <figure className="gt-route-hero__figure">
            <Image
              src="/projects/routes/route-evidence-01.webp"
              alt="Recolección diferenciada de residuos orgánicos operada en Yarumal"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <figcaption>
              <strong>Operación real en Yarumal</strong>
              <span>La calidad de la transformación comienza en la separación y la recolección.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-proof-ribbon" aria-label="Resultados validados del caso Yarumal">
        <div className="container gt-proof-ribbon__grid">
          <div className="gt-proof-ribbon__intro"><span>Caso validado</span><strong>Resultados del sistema en Yarumal</strong></div>
          {yarumalClaims.map((claim) => <div key={claim.id}><strong>{claim.value}</strong><span>{claim.compactLabel}</span></div>)}
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Antes de comprar equipos</span><h2>La factibilidad está en la cadena completa.</h2></div>
            <p>Una planta puede estar bien diseñada y aun así fracasar si recibe poco material, si la ruta mezcla impropios o si nadie tiene recursos y responsabilidades para operarla.</p>
          </div>
          <div className="gt-decision-grid">
            {decisionAxes.map((axis) => (
              <article key={axis.title}>
                <span>{axis.number}</span>
                <h3>{axis.title}</h3>
                <p>{axis.copy}</p>
                <strong>{axis.question}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading"><span className="eyebrow">Elegir el punto de entrada</span><h2>No todos los municipios necesitan empezar por el mismo servicio.</h2><p>El primer contrato debe resolver la incertidumbre más costosa del proyecto, no sumar otra capa de documentos.</p></div>
          <div className="gt-moment-stack">
            {moments.map(([situation, route, copy], index) => (
              <article key={situation}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><small>Situación actual</small><h3>{situation}</h3></div>
                <div><small>Punto de entrada recomendado</small><strong>{route}</strong><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <RouteDecisionBridge
        eyebrow="Tres decisiones frecuentes"
        title="Entrar por la incertidumbre que hoy bloquea el proyecto."
        intro="Estas herramientas no reemplazan un estudio ni una contratación. Ayudan a que la entidad llegue a la conversación con una pregunta mejor formulada y con los soportes que ya existen."
        cards={[
          {
            label: "Sistema territorial",
            title: "¿Es viable una solución local o regional?",
            copy: "Organiza suministro, operación actual, infraestructura, costos, actores y alternativas antes de comprometer inversión.",
            inputs: ["PGIRS y caracterización disponible", "Rutas, costos y contratos actuales", "Activos, predios y capacidad institucional"],
            href: "/soluciones/viabilidad-municipal/",
            cta: "Preparar prefactibilidad",
          },
          {
            label: "Recolección diferenciada",
            title: "¿Qué microrruta y flota puede funcionar?",
            copy: "Parte de generadores, accesibilidad, carga, frecuencia, descarga y prueba de ruta; no de un vehículo escogido de antemano.",
            inputs: ["Mapa de generadores y vías", "Aforos y ventanas de atención", "Flota, personal y puntos de descarga"],
            href: "/soluciones/flota-recoleccion/",
            cta: "Preparar prueba de ruta",
          },
          {
            label: "Control y reportabilidad",
            title: "¿Qué soportes están listos y cuáles faltan?",
            copy: "Revisa pesajes, bitácoras, balances, responsables y calidad de la información antes de una evaluación o reporte formal.",
            inputs: ["Registros operativos y metrológicos", "Balances de entradas y salidas", "Responsables, cortes y soportes"],
            href: "/soluciones/auditoria-sui/",
            cta: "Revisar preparación documental",
          },
        ]}
      />

      <section className="gt-microroute">
        <div className="container">
          <div className="gt-microroute__intro">
            <div><span className="eyebrow eyebrow--light">Implementar para aprender</span><h2>El motocarguero es una herramienta. La solución es la microrruta.</h2></div>
            <p>Greenatics no plantea el vehículo como una compra aislada. Primero define generadores, recorrido, frecuencia, capacidad, criterios de aceptación y captura de datos. Después, un piloto convierte supuestos de escritorio en evidencia para decidir cómo escalar.</p>
          </div>

          <div className="gt-microroute__visuals">
            <figure className="gt-microroute__photo">
              <Image
                src="/projects/routes/route-evidence-12.webp"
                alt="Entrega de residuos orgánicos separados en la fuente durante una ruta selectiva en Yarumal"
                fill
                sizes="(max-width: 900px) 100vw, 56vw"
              />
              <figcaption><strong>Evidencia de operación</strong><span>Entrega separada en la fuente durante la ruta de Yarumal.</span></figcaption>
            </figure>
            <figure className="gt-microroute__vehicle">
              <span>Vehículo real de referencia</span>
              <Image
                src="/projects/routes/motocarguero-verde-operacion-real.webp"
                alt="Motocarguero verde para recolección diferenciada en un territorio urbano de ladera"
                width={720}
                height={575}
                sizes="(max-width: 900px) 90vw, 36vw"
              />
              <figcaption>La caja cerrada protege el material y el vehículo facilita el acceso; su capacidad, configuración y frecuencia se definen según carga, topografía, seguridad y recorrido.</figcaption>
            </figure>
          </div>

          <ol className="gt-pilot-steps">
            {pilotSteps.map(([number, title, copy]) => <li key={title}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>)}
          </ol>
          <div className="gt-inline-action"><p><strong>Resultado del piloto:</strong> una decisión de cobertura, frecuencia y flota respaldada por datos reales.</p><Link href="/servicios/microrrutas-motocarguero/">Conocer el servicio de microrrutas →</Link></div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container gt-park-story">
          <figure>
            <Image
              src="/projects/plant/plant-evidence-10.webp"
              alt="Material orgánico recibido para proceso de compostaje en la planta de Yarumal"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <figcaption>Recepción y transformación de material orgánico en Yarumal.</figcaption>
          </figure>
          <div className="gt-park-story__copy">
            <span className="eyebrow">Infraestructura conectada al territorio</span>
            <h2>Un parque ambiental no es una lista de equipos.</h2>
            <p>Es una arquitectura que puede integrar recepción, pesaje, tratamiento, productos, formación y datos. Su configuración depende del material disponible, la capacidad operativa, las salidas de valor y la posibilidad real de crecer por etapas.</p>
            <div className="gt-module-list">
              {environmentalParkModules.slice(0, 4).map(([title, copy], index) => <div key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{copy}</p></div></div>)}
            </div>
            <div className="button-row"><Link className="button button--dark" href="/parque-ambiental/">Explorar el concepto</Link><Link className="button button--ghost" href="/servicios/plantas-modulares/">Evaluar prefactibilidad</Link></div>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split"><div><span className="eyebrow">Capacidades Greenatics</span><h2>Del instrumento de planeación al control diario.</h2></div><p>Cada servicio puede contratarse por separado o integrarse en una ruta de maduración. El alcance final define estudios, entregables, responsabilidades y resultados esperados.</p></div>
          <div className="gt-service-preview-grid gt-service-preview-grid--municipal">
            {municipalServices.map((service) => (
              <article key={service.slug}>
                <span>{service.category}</span>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <details><summary>Qué puede incluir</summary><ul>{service.includes.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></details>
                <Link href={`/servicios/${service.slug}/`}>Ver alcance y entregables →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--forest">
        <div className="container gt-operating-model">
          <div><span className="eyebrow eyebrow--light">Madurar sin saltarse etapas</span><h2>Diagnosticar, implementar, estabilizar y escalar.</h2><p>La documentación acompaña la operación, pero no la reemplaza. Los procedimientos, registros y reportes tienen valor cuando reflejan lo que ocurre en la ruta y en la planta.</p></div>
          <ol>
            <li><span>01</span><div><strong>Diagnosticar</strong><p>Generación, actores, PGIRS, infraestructura y brechas.</p></div></li>
            <li><span>02</span><div><strong>Diseñar</strong><p>Rutas, alternativas, capacidad, implantación y operación.</p></div></li>
            <li><span>03</span><div><strong>Implementar</strong><p>Infraestructura, procedimientos, personal y formación.</p></div></li>
            <li><span>04</span><div><strong>Estabilizar</strong><p>Calidad, parámetros, mantenimiento, producto y costos.</p></div></li>
            <li><span>05</span><div><strong>Medir y escalar</strong><p>Nuevos generadores, módulos o territorios con datos reales.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="gt-route-closing">
        <div className="container gt-route-closing__inner">
          <div><span className="eyebrow">Primer paso</span><h2>Antes de definir la solución, entendamos qué puede sostener tu territorio.</h2></div>
          <Link className="button button--dark" href="/servicios/diagnostico-residuos/">Solicitar diagnóstico territorial</Link>
        </div>
      </section>
    </>
  );
}
