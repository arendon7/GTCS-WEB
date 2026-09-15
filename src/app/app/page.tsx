import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { OpsWorkstationDemo } from "@/components/ops-workstation-demo";
import { ToolAccessRail } from "@/components/tool-access-rail";
import { runtimeLinks } from "@/lib/runtime-links";

export const metadata: Metadata = {
  title: "GREENATICS OPS | Sistema operacional para plantas",
  description:
    "Greenatics OPS conecta bitácoras, recepciones, lotes, procesos, mantenimiento, inventarios, reportes y decisiones para operar plantas con trazabilidad.",
  alternates: { canonical: "/app/" },
};

const architecture = [
  {
    code: "A",
    label: "Operar el día",
    title: "Plan, actividad y bitácora",
    copy: "Calendario, turnos, responsables, actividades ejecutadas, novedades, evidencias y cierre diario en una misma secuencia.",
    modules: ["Hoy", "Calendario", "Actividades", "Bitácora", "Incidentes"],
  },
  {
    code: "B",
    label: "Controlar la transformación",
    title: "Recepción, lotes y procesos",
    copy: "Pesaje neto, calidad, rechazo, trazabilidad física, compostaje, digestión anaerobia, variables y balance de volúmenes.",
    modules: ["Recepciones", "Lotes", "Compostaje", "UASB", "Balances"],
  },
  {
    code: "C",
    label: "Cuidar los activos",
    title: "Equipos y mantenimiento",
    copy: "Estado, disponibilidad, fallas, tiempo detenido, órdenes preventivas y correctivas, repuestos y evidencia de cierre.",
    modules: ["Equipos", "Fallas", "Órdenes", "Preventivos", "Repuestos"],
  },
  {
    code: "D",
    label: "Cerrar el ciclo",
    title: "Producción, inventario y salidas",
    copy: "Producto terminado, lotes, kardex, conciliación física, insumos, despachos y destino sin perder el historial.",
    modules: ["Producción", "Inventario", "Insumos", "Despachos", "Conciliación"],
  },
  {
    code: "E",
    label: "Dirigir con evidencia",
    title: "Costos, documentos y reportes",
    copy: "Compras, gastos, caja, finanzas, documentos, indicadores y cierres listos para revisión técnica, gerencial o contractual.",
    modules: ["Solicitudes", "Gastos", "Caja", "Finanzas", "Reportes"],
  },
] as const;

const roles = [
  ["Operación", "Registrar sin fricción", "Ve su turno, ejecuta actividades, captura pesajes y parámetros, adjunta evidencia y reporta novedades."],
  ["Supervisión", "Controlar excepciones", "Revisa calidad, balancea volúmenes, atiende alertas, asigna responsables y cierra el día con soporte."],
  ["Dirección", "Decidir con contexto", "Compara plantas, periodos, disponibilidad, producción, costos y compromisos sin entrar al detalle de captura."],
  ["Auditoría y aliados", "Consultar lo autorizado", "Accede a versiones, fuentes y evidencia pertinente según rol, sin exponer información operativa innecesaria."],
] as const;

const dataChain = [
  ["01", "Capturar", "El dato nace donde ocurre el hecho: báscula, ruta, lote, equipo o despacho."],
  ["02", "Validar", "Reglas de negocio evitan pesos imposibles, cierres incompletos y salidas sin soporte."],
  ["03", "Relacionar", "Cada registro conserva planta, periodo, responsable, lote, activo y objeto de origen."],
  ["04", "Interpretar", "Los indicadores explican su cálculo y permiten regresar al registro fuente."],
  ["05", "Decidir", "La alerta se convierte en actividad, orden, compromiso o decisión con fecha de cierre."],
  ["06", "Reportar", "Los entregables reutilizan datos validados y conservan versión, periodo y evidencia."],
] as const;

const operatingContexts = [
  ["/projects/plant/plant-evidence-05.webp", "Pilas de transformación de residuos orgánicos en Yarumal", "Yarumal · operación aeróbica", "Recepciones, lotes, actividades, variables de proceso, producto e inventario necesitan conservar una misma historia operacional."],
  ["/projects/tamesis/reactor-uasb.jpeg", "Reactor anaerobio UASB de la planta de Támesis", "Támesis · operación anaerobia", "Al balance de materia se suman alimentación, biogás, energía, filtros, activos, consumos, paradas y mantenimiento."],
] as const;

export default function AppPage() {
  return (
    <>
      <section className="gt-ops-hero">
        <div className="container gt-ops-hero__grid">
          <div className="gt-ops-hero__copy">
            <span className="eyebrow eyebrow--light">Sistema operacional para plantas</span>
            <h1>No es un dashboard. Es la memoria operativa de Greenatics.</h1>
            <p className="lead">
              GREENATICS OPS conecta lo que se planeó, lo que realmente ocurrió y lo que requiere
              decisión. Actividades, bitácoras, báscula, lotes, procesos, equipos, inventarios, costos y
              documentos dejan de vivir en archivos separados.
            </p>
            <div className="button-row">
              <a className="button button--light" href="#estacion">Explorar la estación</a>
              <Link className="button button--outline-light" href="/acceso/">Ver modelo de acceso</Link>
            </div>
            <div className="gt-ops-hero__principle"><span>Principio de diseño</span><strong>La aplicación captura la operación y genera el tablero, no al revés.</strong></div>
          </div>

          <aside className="gt-ops-hero__ledger">
            <div className="gt-ops-hero__ledger-head"><span>Arquitectura recuperada del aplicativo</span><strong>Una sola estación, cinco sistemas conectados</strong></div>
            <ol>
              {architecture.map((item) => <li key={item.code}><span>{item.code}</span><div><strong>{item.label}</strong><small>{item.title}</small></div><b>{item.modules.length}</b></li>)}
            </ol>
            <div className="gt-ops-hero__ledger-foot"><span /> Datos, permisos e historial atraviesan todos los módulos.</div>
          </aside>
        </div>
      </section>

      <ToolAccessRail
        id="ops"
        name="GREENATICS OPS"
        status={runtimeLinks.ops ? "Runtime operativo disponible" : "Demostración pública disponible"}
        copy="Esta landing presenta la arquitectura completa de OPS. Desde aquí puedes recorrer la demostración y, si el entorno está disponible, entrar a la estación operativa separada. Los datos de demo no representan una planta conectada."
        runtimeHref={runtimeLinks.ops || undefined}
        runtimeLabel="Entrar a la estación OPS"
        accessHref="/contacto/?interes=greenatics-ops"
        accessLabel="Solicitar implementación"
      />

      <section className="gt-ops-ribbon" aria-label="Capacidades transversales de Greenatics OPS">
        <div className="container">
          <div><span>01</span><strong>Bitácora trazable</strong><small>Autor, hora, planta, objeto y evidencia</small></div>
          <div><span>02</span><strong>Plan contra real</strong><small>Desviación visible, no promedios engañosos</small></div>
          <div><span>03</span><strong>Balance físico</strong><small>Entrada, proceso, producto y destino</small></div>
          <div><span>04</span><strong>Control por rol</strong><small>Captura, supervisión, dirección y consulta</small></div>
        </div>
      </section>

      <section className="gt-ops-demo-section" id="estacion">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Demostración funcional</span><h2>Recorre la lógica del aplicativo, no una pantalla decorativa.</h2></div>
            <p>Cambia de planta y módulo para explorar control del día, bitácora, recepciones, proceso, volúmenes, mantenimiento, inventario y reportes. Los valores son ilustrativos y están identificados como tales.</p>
          </div>
          <OpsWorkstationDemo />
        </div>
      </section>

      <section className="gt-ops-proof" aria-labelledby="ops-proof-title">
        <div className="container">
          <div className="gt-ops-proof__intro">
            <div><span className="eyebrow">Referencia visual</span><h2 id="ops-proof-title">Una vista directiva para leer el sistema completo.</h2></div>
            <p>La operación se registra en el campo, pero la dirección necesita una lectura común: entradas, aprovechamiento, producción, inventario, mantenimiento y alertas en el mismo contexto.</p>
          </div>
          <figure className="gt-ops-proof__figure">
            <div className="gt-ops-proof__image"><Image src="/campaign/06_dashboard_indicadores.jpg" alt="Composición ilustrativa de un tablero Greenatics con indicadores de rutas, material recibido, aprovechamiento, producción, inventario y mantenimiento" fill sizes="(max-width: 900px) 100vw, 66vw" /></div>
            <figcaption>
              <span>Qué comunica esta pieza</span>
              <h3>El dashboard resume; la trazabilidad explica.</h3>
              <p>La vista directiva permite detectar cambios y priorizar conversaciones. Cada cifra debe abrir el registro que la origina: una recepción, una actividad, un lote, un movimiento de inventario o una orden de mantenimiento.</p>
              <small>Composición de campaña con datos y etiquetas ilustrativas. No representa una conexión en vivo ni sustituye la validación de los indicadores.</small>
              <Link className="text-link" href="#estacion">Volver a explorar la estación <span aria-hidden="true">↗</span></Link>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split">
            <div><span className="eyebrow">Arquitectura funcional</span><h2>La profundidad está en las relaciones entre módulos.</h2></div>
            <p>Una recepción puede originar rechazo, lote, incidencia y balance. Una falla puede detener una actividad, abrir mantenimiento y afectar producción. OPS conserva esas relaciones.</p>
          </div>
          <div className="gt-ops-architecture">
            {architecture.map((item) => (
              <article key={item.code}>
                <span>{item.code}</span>
                <div><small>{item.label}</small><h3>{item.title}</h3></div>
                <p>{item.copy}</p>
                <ul>{item.modules.map((module) => <li key={module}>{module}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-ops-data-chain">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split gt-route-heading--light">
            <div><span className="eyebrow eyebrow--light">Gobernanza del dato</span><h2>Capturar una vez. Validar. Relacionar. Reutilizar.</h2></div>
            <p>El objetivo no es llenar formularios. Es construir una cadena de evidencia que sirva para operar mejor, explicar resultados y emitir reportes sin reconstruir el mes desde cero.</p>
          </div>
          <ol className="gt-ops-data-chain__steps">
            {dataChain.map(([number, title, copy]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="gt-ops-field-proof">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split"><div><span className="eyebrow">Del trabajo físico al registro</span><h2>OPS cambia con el proceso, pero conserva una sola lógica de trazabilidad.</h2></div><p>Una planta de compostaje y una planta anaerobia no capturan exactamente lo mismo. Comparten, sin embargo, responsables, actividades, activos, entradas, transformaciones, salidas, incidencias y decisiones que deben poder reconstruirse.</p></div>
          <div className="gt-ops-field-proof__grid">{operatingContexts.map(([src,alt,title,copy])=><figure key={title}><div><Image src={src} alt={alt} fill sizes="(max-width: 760px) 100vw, 50vw"/></div><figcaption><strong>{title}</strong><p>{copy}</p></figcaption></figure>)}</div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white">
        <div className="container">
          <div className="gt-route-heading"><span className="eyebrow">Una experiencia por rol</span><h2>Cada persona ve el nivel de detalle que necesita.</h2><p>La misma información cambia de forma según la responsabilidad. El operario ejecuta, la supervisión controla, la dirección decide y los aliados consultan lo autorizado.</p></div>
          <div className="gt-ops-roles">
            {roles.map(([role, title, copy], index) => <article key={role}><span>{String(index + 1).padStart(2, "0")} · {role}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="gt-ops-truth">
        <div className="container gt-ops-truth__grid">
          <div><span className="eyebrow eyebrow--light">Qué estás viendo</span><h2>La demostración pública explica el producto. La aplicación productiva ejecuta la operación.</h2></div>
          <div>
            <p>Esta ruta permite entender la arquitectura y probar interacciones con datos ilustrativos. No está conectada a básculas, sensores, Supabase, SUI, NUIT ni a una planta en tiempo real.</p>
            <p>La base histórica del aplicativo sí contempla autenticación, permisos por planta, persistencia, importación, historial y módulos operativos especializados. La implementación final se parametriza según el alcance y la madurez de cada operación.</p>
          </div>
        </div>
      </section>

      <section className="gt-ops-closing">
        <div className="container gt-ops-closing__grid">
          <div><span className="eyebrow">Implementación por etapas</span><h2>Empieza por el ciclo que más control necesita.</h2></div>
          <div><p>Podemos iniciar con bitácora, recepciones y mantenimiento; después conectar procesos, inventarios, costos, reportes y control multi-planta sin crear una arquitectura paralela.</p><div className="button-row"><Link className="button button--dark" href="/contacto/">Solicitar recorrido guiado</Link><Link className="button button--ghost" href="/proyectos/tamesis/">Ver OPS aplicado a Támesis</Link></div></div>
        </div>
      </section>
    </>
  );
}
