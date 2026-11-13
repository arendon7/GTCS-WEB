import type { Metadata } from "next";
import Link from "next/link";
import { ToolAccessRail } from "@/components/tool-access-rail";
import { runtimeLinks } from "@/lib/runtime-links";
import "./red-v4.css";

export const metadata: Metadata = {
  title: "GREENATICS Red | Gestión territorial, campo y planes de residuos",
  description: "Conecta contexto territorial, generadores, recorridos, captura y revisión de datos con la formulación y el seguimiento de planes PGIRS y PMIRS.",
  alternates: { canonical: "/red/" },
  openGraph: {
    title: "GREENATICS Red | Del diagnóstico a la acción",
    description: "Explora los módulos y pantallas de muestra de GREENATICS Red para gestionar información territorial y organizacional de residuos.",
    url: "/red/",
  },
};

const screenLinks = [
  ["overview", "Resumen", "Pendientes y decisiones"],
  ["territory", "Territorio", "Contexto, actores y fuentes"],
  ["generators", "Generadores", "Corrientes y acuerdos"],
  ["routes", "Rutas", "Cobertura y jornadas"],
  ["field", "FIELD", "Visitas y mediciones"],
  ["qa", "QA/QC", "Revisión y correcciones"],
  ["findings", "Hallazgos", "Causas y prioridades"],
  ["pmirs", "PMIRS Studio", "Programas y acciones"],
  ["pmirs-live", "PMIRS Vivo", "Avances y bloqueos"],
  ["indicators", "Indicadores", "Fórmula y periodo"],
  ["evidence", "Evidencias", "Soportes relacionados"],
  ["coord", "Coordinación", "Tareas y decisiones"],
] as const;

const workStages = [
  {
    title: "Entender el contexto",
    modules: "Resumen · Territorio · Generadores · Rutas",
    copy: "Ubica el proyecto, los actores, los flujos y las condiciones que afectan la gestión. Así una visita o un registro no queda suelto de su lugar y su propósito.",
  },
  {
    title: "Registrar y revisar",
    modules: "FIELD · QA/QC",
    copy: "Relaciona visitas, formularios, mediciones y soportes. La revisión permite señalar unidades faltantes, solicitar correcciones y dejar la decisión documentada.",
  },
  {
    title: "Priorizar y planear",
    modules: "Hallazgos · PMIRS Studio",
    copy: "Ordena hallazgos y conecta la lectura del diagnóstico con programas, acciones, metas, responsables y recursos que deben definirse para cada caso.",
  },
  {
    title: "Seguir y aprender",
    modules: "PMIRS Vivo · Indicadores · Evidencias · Coordinación",
    copy: "Registra avance, fechas, bloqueos, soportes y decisiones. Las fórmulas, fuentes, unidades y periodos quedan a la vista para revisar qué expresa cada indicador.",
  },
] as const;

const moduleGroups = [
  {
    title: "Comprender el territorio o la organización",
    intro: "Primero se define dónde ocurre el trabajo, quién participa y qué información hace falta.",
    modules: [
      ["overview", "Resumen del proyecto", "Hitos, asuntos por resolver y la siguiente decisión de trabajo."],
      ["territory", "Territorio", "Actores, infraestructura, fuentes, cobertura y restricciones."],
      ["generators", "Generadores", "Organizaciones, puntos, corrientes, volúmenes y acuerdos de entrega."],
      ["routes", "Rutas", "Recorridos, jornadas, ciclos, novedades y destinos relacionados."],
    ],
  },
  {
    title: "Llevar la información desde el campo hasta la revisión",
    intro: "El registro conserva relación con su fuente, responsable, fecha y soporte.",
    modules: [
      ["field", "Trabajo de campo · FIELD", "Visitas, formularios, mediciones, fotografías, ubicación y firma."],
      ["qa", "Revisión de datos · QA/QC", "Completitud, unidades, fuentes, alertas, correcciones y decisión de revisión."],
    ],
  },
  {
    title: "Conectar el diagnóstico con la ejecución",
    intro: "Una prioridad puede enlazarse con la acción propuesta y seguirse en el tiempo.",
    modules: [
      ["findings", "Hallazgos", "Causas, prioridad y origen de la lectura técnica."],
      ["pmirs", "Programas · PMIRS Studio", "Programas, acciones, metas, responsables y recursos."],
      ["pmirs-live", "Seguimiento · PMIRS Vivo", "Avances, fechas, bloqueos, evidencias y decisiones de cierre."],
      ["indicators", "Indicadores", "Fórmula, fuente, unidad, periodo y universo de cálculo."],
    ],
  },
  {
    title: "Conservar soporte y coordinación",
    intro: "El equipo puede seguir de qué registro viene cada evidencia y quién tiene la próxima tarea.",
    modules: [
      ["evidence", "Evidencias", "Soportes relacionados con registros, hallazgos, acciones o decisiones."],
      ["coord", "Coordinación", "Solicitudes, tareas, incidencias, responsables y vencimientos."],
    ],
  },
] as const;

const frictions = [
  {
    problem: "La información llega desde muchas manos y formatos.",
    response: "RED relaciona registro, fuente, persona responsable, fecha, territorio, generador y ruta para que el equipo pueda volver al contexto.",
  },
  {
    problem: "No todo lo que se capturó está listo para usarse.",
    response: "QA/QC distingue lo recibido de lo revisado y deja visibles alertas, correcciones y decisiones. Registrar un dato no lo convierte en una medición validada.",
  },
  {
    problem: "El diagnóstico se queda en un archivo que no orienta el seguimiento.",
    response: "Hallazgos, programas, acciones, metas, responsables, indicadores y evidencias pueden conectarse como partes de una misma ruta de trabajo.",
  },
] as const;

export default function RedPage() {
  return (
    <div className="red-v4-page">
      <section className="red-v4-hero" aria-labelledby="red-title">
        <div className="container red-v4-hero__grid">
          <div className="red-v4-hero__copy">
            <p className="red-v4-hero__kicker">GREENATICS Red · gestión de residuos</p>
            <h1 id="red-title">Del trabajo de campo a una gestión que puede seguirse.</h1>
            <p className="lead">RED organiza la información territorial y organizacional de residuos para conectar diagnóstico, revisión, planes de gestión y seguimiento en un mismo espacio de trabajo.</p>
            <p className="red-v4-hero__context">Para municipios y prestadores que trabajan en PGIRS, y para organizaciones y grandes generadores que estructuran un PMIRS.</p>
            <div className="button-row">
              <Link className="button button--light" href="#explorar">Explorar pantallas de RED</Link>
              <Link className="button button--outline-light" href="/contacto/?interes=greenatics-red">Conversar sobre un proyecto</Link>
            </div>
            <p className="red-v4-hero__boundary">Lo que ves es una muestra navegable con datos ficticios. No es un expediente ni un entorno habilitado para operación real.</p>
          </div>

          <figure className="red-v4-preview">
            <div className="red-v4-preview__head">
              <div><strong>GREENATICS Red</strong><span>Resumen · Proyecto de muestra</span></div>
              <span className="red-v4-preview__badge">Escenario ficticio</span>
            </div>
            <iframe
              className="red-v4-preview__frame"
              name="red-sample-preview"
              src="/red/app/#overview"
              title="Pantalla de resumen de GREENATICS Red con datos ficticios"
              loading="eager"
            />
            <figcaption>Esta vista usa la propia interfaz de RED. Elige una pantalla en la navegación y observa cómo se presenta cada parte del trabajo.</figcaption>
          </figure>
        </div>
      </section>

      <section className="red-v4-product-path" aria-label="Qué conecta GREENATICS Red">
        <div className="container red-v4-product-path__inner">
          <p>Una ruta conectada</p>
          <ol>
            <li>Contexto territorial</li>
            <li>Trabajo de campo</li>
            <li>Revisión de datos</li>
            <li>Programas y acciones</li>
            <li>Seguimiento con evidencia</li>
          </ol>
        </div>
      </section>

      <section className="red-v4-explorer" id="explorar">
        <div className="container">
          <header className="red-v4-explorer__intro">
            <div><h2>Entra a la aplicación, no solo a una descripción.</h2></div>
            <p>La estación muestra el resumen, el territorio, las visitas, la revisión de calidad y el seguimiento del PMIRS. Selecciona una pantalla: se abrirá aquí dentro y conservará el contexto de muestra.</p>
          </header>
          <nav className="red-v4-screen-nav" aria-label="Pantallas de muestra de GREENATICS Red">
            {screenLinks.map(([id, label, detail]) => (
              <Link key={id} href={`/red/app/#${id}`} target="red-sample-preview">
                <strong>{label}</strong><span>{detail}</span>
              </Link>
            ))}
          </nav>
          <p className="red-v4-explorer__note">Las acciones de demostración, como aprobar una revisión o actualizar un avance, solo cambian la sesión actual y se pierden al recargar.</p>
        </div>
      </section>

      <section className="red-v4-frictions" aria-labelledby="red-problems-title">
        <div className="container red-v4-frictions__grid">
          <div className="red-v4-frictions__lead">
            <h2 id="red-problems-title">Cuando el registro, el análisis y el plan viven separados, el equipo pierde el hilo.</h2>
            <p>RED busca mantener a la vista la relación entre lo observado, cómo se revisó, qué decisión produjo y cómo se acompaña después.</p>
          </div>
          <div className="red-v4-friction-list">
            {frictions.map(({ problem, response }) => (
              <article key={problem}><h3>{problem}</h3><p>{response}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="red-v4-workflow" id="recorrido">
        <div className="container">
          <header className="red-v4-section-intro">
            <h2>Así se recorre un proyecto dentro de RED.</h2>
            <p>Los equipos pueden pasar de la descripción del territorio al registro, la revisión, la planeación y el seguimiento sin confundir esos momentos entre sí.</p>
          </header>
          <div className="red-v4-workflow__stages">
            {workStages.map(({ title, modules, copy }) => (
              <article key={title}>
                <p>{modules}</p>
                <h3>{title}</h3>
                <span>{copy}</span>
              </article>
            ))}
          </div>
          <p className="red-v4-workflow__footnote">La secuencia describe el modelo de trabajo de RED. El orden, el método y el alcance se definen para cada proyecto y bajo las responsabilidades de sus actores.</p>
        </div>
      </section>

      <section className="red-v4-modules" id="modulos">
        <div className="container">
          <header className="red-v4-section-intro red-v4-section-intro--wide">
            <h2>Doce módulos para entender, registrar, revisar y hacer seguimiento.</h2>
            <p>Las pantallas se relacionan alrededor de un mismo proyecto. Abre cualquier módulo en la muestra interactiva de arriba para ver cómo se presenta.</p>
          </header>
          <div className="red-v4-module-groups">
            {moduleGroups.map((group) => (
              <section className="red-v4-module-group" key={group.title}>
                <div className="red-v4-module-group__intro"><h3>{group.title}</h3><p>{group.intro}</p></div>
                <ul>{group.modules.map(([id, name, detail]) => (
                  <li key={id}><Link href={`/red/app/#${id}`} target="red-sample-preview"><strong>{name}</strong><span>{detail}</span></Link></li>
                ))}</ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="red-v4-records">
        <div className="container red-v4-records__grid">
          <div>
            <h2>El dato conserva su estado y su procedencia.</h2>
            <p>Un registro recibido no es automáticamente válido. La ruta separa el dato original, su revisión, la interpretación construida y los cálculos derivados cuando corresponden.</p>
            <p>Para cada cambio, el modelo exige conservar fuente, actor, fecha, motivo, alcance y versión. Así el equipo puede saber qué se revisó y qué sigue pendiente.</p>
          </div>
          <ol className="red-v4-state-flow" aria-label="Estados de trazabilidad del dato">
            <li><strong>RAW</strong><span>Registro recibido</span></li>
            <li><strong>VALIDATED</strong><span>Revisión documentada</span></li>
            <li><strong>INTERPRETED</strong><span>Lectura con contexto</span></li>
            <li><strong>DERIVED</strong><span>Cálculo cuando aplica</span></li>
          </ol>
        </div>
      </section>

      <section className="red-v4-scales">
        <div className="container">
          <header className="red-v4-section-intro red-v4-section-intro--wide">
            <h2>Una plataforma, dos contextos de gestión.</h2>
            <p>El tipo de plan y las responsabilidades son distintos. RED ayuda a ordenar la información de cada ruta, sin mezclar los instrumentos.</p>
          </header>
          <div className="red-v4-scale-pair">
            <article><h3>PGIRS · gestión municipal y territorial</h3><p>Para municipios, prestadores y equipos territoriales que organizan información sobre actores, cobertura, generadores, recorridos, diagnóstico y seguimiento municipal.</p><Link href="/municipios/">Conocer la ruta para municipios</Link></article>
            <article><h3>PMIRS · gestión interna de una organización</h3><p>Para conjuntos residenciales, centros comerciales, instituciones y empresas que ordenan fuentes internas, rutinas, responsables, programas y evidencias.</p><Link href="/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional">Ver el servicio PMIRS organizacional</Link></article>
          </div>
          <p className="red-v4-scales__boundary">RED organiza información y seguimiento; no sustituye la responsabilidad de la entidad ni el criterio técnico. La operación de una planta corresponde a GREENATICS OPS. Una conexión entre herramientas requiere definir fuentes, permisos y alcance.</p>
        </div>
      </section>

      <ToolAccessRail
        id="red"
        name="GREENATICS Red"
        status={runtimeLinks.red ? "Enlace externo configurado" : "Muestra navegable · datos ficticios"}
        heading="Explora la muestra y conversa sobre el entorno de tu proyecto."
        copy="Esta estación no conserva expedientes al recargar ni está habilitada para datos reales. Un entorno operativo requiere alistamiento de identidad y permisos por proyecto, persistencia, almacenamiento privado, auditoría, respaldos y aceptación de usuarios."
        runtimeHref={runtimeLinks.red || undefined}
        runtimeReadinessRequired
        runtimeLabel="Abrir entorno GREENATICS Red"
        demoHref="/red/app/"
        demoLabel="Abrir la estación con datos ficticios"
        accessHref="/contacto/?interes=greenatics-red"
        accessLabel="Conversar sobre la configuración de RED"
      />
    </div>
  );
}
