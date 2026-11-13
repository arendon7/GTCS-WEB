import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { environmentalParkModules } from "@/data/services";

export const metadata: Metadata = {
  title: "Parque Ambiental y Tecnológico",
  description:
    "Una propuesta modular de Greenatics para conectar separación, tratamiento biológico, productos, energía, formación y datos según las condiciones de cada territorio.",
  alternates: { canonical: "/parque-ambiental/" },
};

const moduleGroups = [
  {
    title: "Recibir con información suficiente",
    intro:
      "El sistema comienza antes del tratamiento: identifica de dónde viene el material, cuánto llega, en qué condiciones y qué novedades pueden afectar el proceso.",
    modules: [environmentalParkModules[0]],
  },
  {
    title: "Elegir el proceso que responde a la corriente",
    intro:
      "La caracterización y la escala ayudan a definir si conviene una ruta aeróbica, anaeróbica o una combinación. No todas las corrientes ni todos los territorios requieren las mismas tecnologías.",
    modules: [environmentalParkModules[2], environmentalParkModules[1]],
  },
  {
    title: "Preparar salidas con un destino posible",
    intro:
      "Acondicionar el material, asegurar su calidad y entender quién podría utilizarlo son parte del diseño; no son una etapa posterior desconectada del proceso.",
    modules: [environmentalParkModules[3], environmentalParkModules[4]],
  },
] as const;

export default function EnvironmentalParkPage() {
  return (
    <div className="park-concept">
      <section className="park-concept-hero">
        <div className="container park-concept-hero__grid">
          <div className="park-concept-hero__copy">
                <h1>Un parque ambiental que el territorio pueda operar.</h1>
            <p className="park-concept-hero__lead">
              Greenatics conecta ciencia aplicada, conocimiento del sector aseo e
              ingeniería para convertir una oportunidad de aprovechamiento en un
              sistema que las personas y organizaciones locales puedan sostener.
            </p>
            <p>
              La propuesta puede articular separación, logística, tratamiento
              biológico, productos, energía, formación y datos. Su configuración
              se define a partir de las corrientes, el predio, la operación y una
              evaluación técnica y económica; no es un paquete estándar.
            </p>
            <div className="park-concept-actions">
              <Link
                className="button button--dark"
                href="#preguntas-factibilidad"
              >
                Ver qué revisa la prefactibilidad
              </Link>
              <Link className="park-concept-text-link" href="/municipios/">
                Explorar soluciones para municipios y ESP
              </Link>
            </div>
          </div>
          <figure className="park-concept-hero__visual">
            <Image
              src="/projects/concepts/environmental-park-modular-concept.jpg"
              alt="Área de compostaje cubierta y unidades de tratamiento en un paisaje de montaña"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 52vw"
            />
            <figcaption>
              Una arquitectura posible conecta tratamiento, recuperación de
              nutrientes y uso territorial.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="park-concept-principle">
        <div className="container park-concept-principle__grid">
          <h2>La infraestructura se diseña alrededor de una operación, no al revés.</h2>
          <div>
            <p>
              Definir equipos antes de entender los materiales, la logística y
              quién estará a cargo puede dejar una planta difícil de sostener.
              Por eso, Greenatics acompaña la lectura del territorio y de la
              operación para comparar alternativas y precisar qué información
              hace falta antes de invertir.
            </p>
            <p>
              La experiencia de compostaje en Yarumal aporta referencias de
              trabajo en territorio. Cada nuevo proyecto requiere revisar sus
              propias corrientes, capacidades y responsabilidades: la experiencia
              previa no reemplaza ese análisis.
            </p>
            <Link href="/proyectos/yarumal/" className="park-concept-text-link">
              Conocer el caso de Yarumal
            </Link>
          </div>
        </div>
      </section>

      <section className="park-concept-modules" aria-labelledby="park-modules-title">
        <div className="container">
          <div className="park-concept-heading">
            <h2 id="park-modules-title">Cinco módulos conectan el material con un uso posible.</h2>
            <p>
              Se pueden incorporar en momentos distintos. La corriente, la
              capacidad local y la prefactibilidad determinan cuáles hacen falta
              y cómo deben relacionarse.
            </p>
          </div>
          <div className="park-concept-module-groups">
            {moduleGroups.map((group) => (
              <article key={group.title}>
                <h3>{group.title}</h3>
                <p>{group.intro}</p>
                <ul>
                  {group.modules.map(([title, copy]) => (
                    <li key={title}>
                      <strong>{title}.</strong> {copy}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="park-concept-feasibility" id="preguntas-factibilidad">
        <div className="container park-concept-feasibility__grid">
          <div>
            <h2>La prefactibilidad pone a prueba el sistema completo.</h2>
            <p>
              Antes de definir capacidad, áreas y equipos, se comparan la
              disponibilidad del material, las restricciones del sitio, las
              alternativas de proceso y las condiciones para operar. El estudio
              organiza decisiones y supuestos; no equivale a un presupuesto
              definitivo ni garantiza la viabilidad.
            </p>
          </div>
          <div className="park-concept-dimensions">
            <article>
              <h3>Qué llega y desde dónde</h3>
              <p>
                Volumen, composición, separación, variación durante el año,
                ubicación de generadores, distancias y servicios disponibles.
              </p>
            </article>
            <article>
              <h3>Qué proceso y qué salidas tienen sentido</h3>
              <p>
                Rutas de tratamiento compatibles con el material, calidad
                requerida, posibles usuarios de productos y condiciones de
                recuperación de energía.
              </p>
            </article>
            <article>
              <h3>Quién lo sostiene y con qué recursos</h3>
              <p>
                Responsables, gobernanza, inversión, costos de operación,
                mantenimiento, financiación por explorar y datos para hacer
                seguimiento y decidir si escalar.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="park-concept-growth">
        <div className="container park-concept-growth__grid">
          <div>
            <h2>El proyecto puede crecer cuando la operación y los datos lo justifican.</h2>
            <p>
              Una primera etapa puede ordenar la línea base, priorizar generadores,
              probar una ruta selectiva y estabilizar un módulo de tratamiento con
              protocolos y registros esenciales.
            </p>
          </div>
          <div className="park-concept-growth__copy">
            <p>
              <strong>Consolidar</strong> significa mejorar confiabilidad, cobertura,
              mantenimiento, trazabilidad e inventario de productos, con indicadores
              que ayuden a corregir la operación.
            </p>
            <p>
              <strong>Escalar</strong> puede implicar nuevas corrientes, digestión y
              biogás cuando resulten pertinentes, una biofábrica ampliada o la
              articulación regional. Cada ampliación depende de evidencia y de un
              alcance acordado.
            </p>
          </div>
        </div>
      </section>

      <section className="park-concept-contexts">
        <div className="container park-concept-contexts__grid">
          <h2>La misma idea toma formas distintas según quienes participan.</h2>
          <div>
            <p>
              <strong>Municipal.</strong> Puede conectar PGIRS, rutas selectivas,
              ESP, infraestructura de aprovechamiento, formación y prioridades
              territoriales.
            </p>
            <p>
              <strong>Regional.</strong> Puede reunir corrientes de varios municipios
              si la logística, la capacidad, la gobernanza y el modelo económico
              respaldan esa escala.
            </p>
            <p>
              <strong>Agroindustrial.</strong> Puede integrar residuos de
              procesamiento, estiércoles u otras biomasas con rutas para recuperar
              nutrientes o energía, de acuerdo con sus características.
            </p>
            <p>
              <strong>Demostrativa y educativa.</strong> Puede vincular formación,
              huertas, viveros, parcelas o transferencia tecnológica cuando hagan
              parte del propósito y del alcance.
            </p>
          </div>
          <p className="park-concept-boundary">
            El Parque Ambiental es una propuesta de arquitectura Greenatics, no la
            descripción de una instalación completa ya construida. Capacidad,
            equipos, inversión, productos, biogás y huella se evalúan para cada
            proyecto.
          </p>
        </div>
      </section>

      <section className="park-concept-value">
        <div className="container park-concept-value__grid">
          <h2>Una corriente puede abrir varias rutas de valor.</h2>
          <div>
            <p>
              Según su composición y escala, un proyecto puede combinar procesos
              aeróbicos y anaeróbicos para recuperar materia orgánica y nutrientes.
              Compost, bioles, fertilizantes o biogás son salidas que se estudian
              según la tecnología, la calidad requerida y sus posibles destinos;
              no se producen automáticamente por instalar un módulo.
            </p>
            <Link className="park-concept-light-link" href="/tecnologia/">
              Conocer las rutas de tratamiento y tecnología
            </Link>
          </div>
        </div>
      </section>

      <section className="park-concept-data">
        <div className="container park-concept-data__grid">
          <h2>La trazabilidad acompaña el proceso de principio a fin.</h2>
          <div>
            <p>
              La información puede conectar generadores, recorridos, recepción,
              lotes, procesos, productos, mantenimiento y destino. GREENATICS OPS
              puede apoyar ese seguimiento; los indicadores externos se revisan y
              concilian antes de comunicarse.
            </p>
            <Link className="park-concept-text-link" href="/acceso/">
              Explorar las herramientas de Greenatics
            </Link>
          </div>
        </div>
      </section>

      <section className="park-concept-cta">
        <div className="container park-concept-cta__inner">
          <div>
            <h2>Conversemos sobre lo que el territorio necesita resolver.</h2>
            <p>
              Revisemos las corrientes disponibles, la operación existente y la
              decisión que debe orientar una prefactibilidad.
            </p>
          </div>
          <Link
            className="button button--light"
            href="/contacto/?servicio=prefactibilidad&perfil=municipio"
          >
            Consultar una prefactibilidad
          </Link>
        </div>
      </section>
    </div>
  );
}
