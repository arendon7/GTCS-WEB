import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { OpsWorkstationDemo } from "@/components/ops-workstation-demo";

export const metadata: Metadata = {
  title: "GREENATICS OPS | Sistema operacional para plantas",
  description:
    "Conoce cómo GREENATICS OPS organiza calendario, actividades, recepciones, procesos, equipos, inventario y gestión operativa. Explora una muestra pública con datos ficticios.",
  alternates: { canonical: "/app/" },
  openGraph: {
    title: "GREENATICS OPS | Sistema operacional para plantas",
    description: "Calendario, actividades, recepciones, procesos, equipos e inventario en un modelo operativo configurable por proyecto. Explora la muestra pública con datos ficticios.",
    url: "/app/",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

const roles = [
  ["Operación", "Registrar la jornada", "Consulta el trabajo del día, inicia y cierra actividades, y registra tiempos, cantidades, lecturas técnicas y novedades vinculadas al proceso."],
  ["Coordinación", "Comparar plan y ejecución", "Encuentra actividades pendientes, desviaciones, recepciones por revisar y cierres que necesitan seguimiento."],
  ["Mantenimiento y calidad", "Atender lo que requiere control", "Revisa equipos, fallas abiertas, órdenes de mantenimiento, tiempo fuera de servicio y recepciones que necesitan una decisión de calidad."],
  ["Dirección y administración", "Leer la operación por periodo", "Consulta indicadores operativos y trabaja en módulos separados de inventario, insumos, compras, gastos, ventas, caja, finanzas y documentos."],
] as const;

const moduleAreas = [
	["Seguimiento", "Calendario, tablero y alertas ayudan a leer el trabajo pendiente, en curso y realizado por día, semana, mes o histórico. El tablero operativo muestra recepciones, rechazo, horas-hombre, cumplimiento del plan, paradas, excepciones y estado del compostaje cuando esos registros están disponibles."],
	["Operación", "Recepciones registran origen, material, transporte, pesaje e inspección. Actividades relacionan proceso, responsables, horario, duración, equipo o herramientas, cantidades, lecturas y novedades. Compostaje, producción, inventario e insumos cubren etapas distintas del flujo material."],
	["Gestión", "Equipos y mantenimiento dan seguimiento a fallas, órdenes y tiempo fuera de servicio. Solicitudes de compra, gastos, ventas, caja y finanzas organizan hechos administrativos relacionados, sin convertir una autorización en gasto, una venta en recaudo ni una compra en inventario físico."],
	["Datos y documentos", "Las importaciones ayudan a revisar archivos, correspondencias y alertas de calidad antes de incorporar registros históricos. El centro documental consulta referencias de la fuente SharePoint configurada; los archivos originales permanecen en ese repositorio."],
] as const;

const workflowStages = [
	["Planear la jornada", "El calendario permite revisar el día, la semana o el mes y organizar actividades por proceso. En cada programación se pueden relacionar horario previsto, responsables, equipos y notas; después se consulta si quedó programada, en curso, realizada o requiere revisión."],
	["Recibir e inspeccionar", "La recepción puede identificar origen, tipo de material, ruta, transporte, fecha y hora, masa recibida, masa rechazada e impropios. El equipo registra la decisión de inspección y deja trazabilidad del lote físico cuando la recepción se acepta para el proceso."],
	["Registrar el trabajo y el proceso", "Al cerrar una actividad se documentan el tiempo real, las cantidades y unidades, las lecturas técnicas, las herramientas utilizadas y las novedades. Compostaje vincula actividades y observaciones con sus pilas; los parámetros de otros procesos se definen según la operación."],
	["Cerrar y revisar lo ocurrido", "La producción terminada se registra como una medición propia; el inventario se actualiza mediante movimientos físicos trazables. Coordinación revisa desviaciones, incidencias y mantenimientos, mientras el tablero resume los indicadores que sí tienen un registro operativo de respaldo."],
] as const;

const operatingContexts = [
  ["Compostaje", "Relaciona entradas y criterios de calidad con lotes, actividades de turno, lecturas de proceso, producción e inventario."],
  ["Digestión anaerobia", "Puede seguir alimentación y variables como pH, junto con biogás, filtros, activos, paradas y mantenimiento."],
] as const;

export default function AppPage() {
  return (
    <>
      <section className="gt-ops-hero">
        <div className="container gt-ops-hero__grid">
          <div className="gt-ops-hero__copy">
            <h1>Planea, registra y entiende lo que pasa en tu planta.</h1>
            <p className="lead">
              GREENATICS OPS reúne la programación, las actividades del turno, la recepción de materiales,
              el seguimiento de procesos, los equipos y el inventario. Así, operación, coordinación y dirección
              pueden revisar lo planeado, lo ejecutado y lo que requiere atención con el contexto de cada registro.
              Explora la muestra con datos ficticios; el alcance y la configuración para cada organización se acuerdan por proyecto.
            </p>
            <div className="button-row">
              <a className="button button--light" href="#estacion">Explorar la muestra pública</a>
              <Link className="button button--outline-light" href="/acceso/">Ver opciones de acceso</Link>
            </div>
            <div className="gt-ops-hero__principle"><span>Antes de explorar</span><strong>La muestra usa datos ficticios, no guarda cambios y no conecta con una operación real.</strong></div>
          </div>
          <figure className="gt-ops-hero__visual">
            <Image
              src="/tools/ops-plant-editorial.jpg"
              alt="Una operaria revisa información del proceso junto a material orgánico en una planta."
              width={1400}
              height={934}
              preload
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <figcaption>
              <strong>El registro acompaña el trabajo en planta.</strong>
              <span>La configuración define qué información necesita cada proceso y quién la revisa.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-ops-ribbon" aria-label="Relaciones que puedes explorar en la muestra de Greenatics OPS">
        <div className="container">
          <div><strong>Plan y jornada</strong><small>Calendario, actividad, responsable y cierre</small></div>
          <div><strong>Materiales</strong><small>Pesaje, calidad, lote y proceso</small></div>
          <div><strong>Continuidad</strong><small>Equipo, falla, orden y mantenimiento</small></div>
          <div><strong>Gestión</strong><small>Producción, existencias, compras y reportes</small></div>
        </div>
      </section>

      <section className="gt-ops-demo-section" id="estacion">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><h2>Explora los módulos a través de una jornada de muestra.</h2></div>
            <p>Selecciona compostaje o digestión anaerobia, cambia entre Hoy, bitácora, recepciones, procesos, balances, mantenimiento, inventario y reportes, y observa qué información reúne cada vista. Los datos son ficticios y no están conectados a una planta.</p>
          </div>
          <OpsWorkstationDemo />
        </div>
      </section>

      <section className="gt-ops-module-guide">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><h2>Qué encuentras dentro de la aplicación.</h2></div>
            <p>OPS combina espacios para registrar el trabajo, revisar su avance y llevar la gestión relacionada. Cada módulo conserva su propósito; el tablero utiliza únicamente métricas sustentadas por registros operativos.</p>
          </div>
          <div className="gt-ops-module-guide__body">
            <p className="gt-ops-module-guide__intro">La aplicación conecta tareas que suelen quedar repartidas entre calendarios, formularios y archivos: asignar el trabajo, registrar lo que pasó, revisar las excepciones y regresar al detalle que explica cada cifra. Las áreas comparten contexto operativo sin confundir los hechos físicos con los administrativos.</p>
            <div className="gt-ops-module-guide__areas">
              {moduleAreas.map(([area, copy]) => <article key={area}><h3>{area}</h3><p>{copy}</p></article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><h2>Así acompaña OPS una jornada de trabajo.</h2></div>
            <p>El recorrido une planeación, operación y revisión. Cada organización define los registros técnicos, responsables y controles que necesita para su proceso.</p>
          </div>
          <div className="gt-ops-workflow" aria-label="Recorrido operativo de GREENATICS OPS">
            {workflowStages.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="gt-ops-field-proof">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split"><div><h2>El proceso cambia; la trazabilidad conserva el hilo.</h2></div><p>Una planta de compostaje y una planta anaerobia no registran exactamente lo mismo. El modelo permite definir cómo relacionar responsables, actividades, activos, entradas, transformaciones, salidas, incidencias y decisiones.</p></div>
          <div className="gt-ops-field-proof__grid">{operatingContexts.map(([title,copy])=><article key={title}><strong>{title}</strong><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading"><h2>La información sigue las tareas de cada equipo.</h2><p>Operación, supervisión y dirección necesitan lecturas distintas. Los responsables y accesos para una organización se definen durante la configuración; esta muestra no habilita cuentas.</p></div>
          <div className="gt-ops-roles">
            {roles.map(([role, title, copy]) => <article key={role}><span>{role}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="gt-ops-truth">
        <div className="container gt-ops-truth__grid">
          <div><h2>Una muestra permite explorar; no equivale a una operación conectada.</h2></div>
          <div>
            <p>Puedes cambiar de planta y módulo y probar controles; esos cambios son temporales y se pierden al salir. Los datos son ficticios: no corresponden a Yarumal, Támesis ni a una operación conectada.</p>
            <p>Un proyecto define qué registros, responsabilidades, reportes y controles necesita. La disponibilidad de un entorno, sus permisos, conexiones y funciones se confirma antes de acordar la implementación.</p>
          </div>
        </div>
      </section>

      <section className="gt-ops-closing">
        <div className="container gt-ops-closing__grid">
          <div><h2>Empieza por el ciclo que más necesita seguimiento.</h2></div>
          <div><p>La conversación de configuración prioriza el ciclo operativo, los registros que requiere y las responsabilidades de cada equipo. El alcance, el acceso y las conexiones se confirman antes de acordar una implementación.</p><div className="button-row"><Link className="button button--dark" href="/contacto/?interes=greenatics-ops&modalidad=configuracion">Consultar alcance y configuración</Link><Link className="button button--ghost" href="/proyectos/tamesis/">Conocer el proceso anaerobio en Támesis</Link></div></div>
        </div>
      </section>
    </>
  );
}
