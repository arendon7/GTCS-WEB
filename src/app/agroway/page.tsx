import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./agroway-editorial.module.css";

export const metadata: Metadata = {
  title: "AGROWAY | Plan de cultivo, inventario y seguimiento agrícola",
  description:
    "Conoce los módulos de AgroWay para organizar proyectos, lotes, planes de cultivo, trabajo de campo, evidencias y cosechas.",
  alternates: { canonical: "/agroway/" },
  openGraph: {
    title: "AGROWAY | Plan de cultivo y seguimiento agrícola",
    description:
      "Una vista por ciclo para relacionar lotes, plan de cultivo, labores, evidencias y cosecha.",
    url: "/agroway/",
    images: ["/brand/agroway/agroway-logo.png"],
  },
};

const modules = [
  {
    number: "01",
    state: "En la demo",
    title: "Proyectos, fincas y ciclos",
    copy: "Relaciona productores, fincas y ciclos de trabajo para saber a qué proyecto pertenece cada lote y cada actividad.",
    examples: "Productores · fincas · ciclos",
  },
  {
    number: "02",
    state: "En la demo",
    title: "Cultivos y lotes",
    copy: "Reúne cultivo, variedad, área, etapa, diagnóstico y plan en el contexto de un lote. La ficha permite identificar lo registrado y lo pendiente de revisión.",
    examples: "Cultivo · variedad · área · diagnóstico",
  },
  {
    number: "03",
    state: "En desarrollo",
    title: "Plan de cultivo · MIPFRE",
    copy: "Organiza un plan integrado de manejo por zona para fertirriego y manejo fitosanitario, enlazado con diagnóstico, fuente técnica, fecha y responsable.",
    examples: "Borrador · revisión profesional · versión",
  },
  {
    number: "04",
    state: "En la demo",
    title: "Seguimiento y trabajo de campo",
    copy: "Registra labores, monitoreos, aplicaciones y novedades con fecha, ejecutor, estado y próxima acción. Una observación conserva su contexto para revisarla.",
    examples: "Actividad · seguimiento · próxima acción",
  },
  {
    number: "05",
    state: "En la demo",
    title: "Evidencias y revisión",
    copy: "Vincula soportes y observaciones con el lote o la actividad correspondiente. Los estados ayudan a distinguir lo registrado de lo revisado.",
    examples: "Fotografías · análisis · actas · revisión",
  },
  {
    number: "06",
    state: "En la demo",
    title: "Cosecha y trazabilidad",
    copy: "Conecta los cortes y sus resultados con el lote y el ciclo que los originan, para consultar la historia antes de cerrar o iniciar otro ciclo.",
    examples: "Corte · cantidad registrada · conciliación",
  },
  {
    number: "07",
    state: "Alcance por desarrollar",
    title: "Inventario vegetal e insumos",
    copy: "El alcance de producto contempla identificar material vegetal y relacionar insumos con los planes y las actividades. La demo actual muestra un catálogo técnico; no controla existencias productivas.",
    examples: "Plantas · insumos · uso por ciclo",
  },
  {
    number: "08",
    state: "Integración por definir",
    title: "Sensores y variables de campo",
    copy: "En una etapa futura podrían incorporarse mediciones de agua, suelo y ambiente. No hay sensores conectados ni lecturas en tiempo real en la demo; cada integración requeriría fuente, unidad, fecha, calibración y revisión.",
    examples: "Agua · suelo · ambiente · IoT",
  },
];

const cycleStages = [
  ["01", "Entender la zona", "Cultivo, variedad, etapa, condiciones y antecedentes con fuente y fecha."],
  ["02", "Preparar el plan", "Acciones de manejo relacionadas con el diagnóstico y los datos que aún faltan."],
  ["03", "Acompañar el trabajo", "Actividades, monitoreos, responsables, novedades y evidencias del ciclo."],
  ["04", "Revisar el resultado", "Cosecha, conciliación e historial para dar contexto al siguiente ciclo."],
];

export default function AgrowayPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={"container " + styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.brandline}>
              <span className={styles.logoPlate}>
                <Image src="/brand/agroway/agroway-logo.png" alt="AGROWAY" width={230} height={141} priority />
              </span>
              <span className={styles.status}>Demo navegable · desarrollo en curso</span>
            </div>
            <h1>El cultivo, el plan y el trabajo de campo en una misma historia.</h1>
            <p className={styles.lead}>
              AgroWay relaciona proyectos, fincas, lotes, planes de cultivo, actividades y cosechas
              para que el equipo pueda entender qué se programó, qué ocurrió y qué falta revisar.
            </p>
            <p className={styles.heroNote}>
              AGROWAY fue estructurado por Grupo Pineal como un servicio de software para trazabilidad agrícola.
            </p>
            <p className={styles.heroNote}>
              La demo usa datos ficticios. No está conectada a fincas, sensores ni servicios de
              persistencia compartida, y no emite recomendaciones agronómicas.
            </p>
            <div className={styles.actions}>
              <Link className="button button--primary" href="#vista-aplicacion">Ver la aplicación por dentro</Link>
              <Link className={styles.textLink} href="/agroway/app/">
                Abrir la demo navegable <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <figure className={styles.heroFigure}>
            <Image
              src="/tools/agroway-field-editorial.jpg"
              alt="Una persona observa un cultivo y registra información durante el recorrido por el lote."
              width={1400}
              height={933}
              priority
              sizes="(max-width: 760px) 100vw, 52vw"
            />
            <figcaption>El seguimiento empieza en el lote y continúa durante todo el ciclo productivo.</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.preview} id="vista-aplicacion" aria-labelledby="agroway-preview-title">
        <div className="container">
          <header className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Vista de la aplicación</span>
              <h2 id="agroway-preview-title">Recorre la demo y mira cómo se conectan sus módulos.</h2>
            </div>
            <p>
              Esta es la interfaz real de la demo pública. Usa su menú lateral para cambiar entre
              resumen, proyectos, lotes, trabajo de campo, evidencias, cosechas y catálogo técnico.
            </p>
          </header>
          <div className={styles.appWindow}>
            <div className={styles.appWindowBar}>
              <span><i /> Demo navegable</span>
              <span>Datos ilustrativos · vista interactiva</span>
            </div>
            <iframe
              className={styles.appFrame}
              src="/agroway/app/"
              title="Demo interactiva de la aplicación AgroWay"
              loading="lazy"
            />
          </div>
          <p className={styles.previewNote}>
            La demo permite recorrer y seleccionar registros de ejemplo; sus acciones y estados son
            demostrativos y no guardan información de fincas reales.
          </p>
          <Link className={styles.inlineLink} href="/agroway/app/">
            Abrir la demo en pantalla completa <span aria-hidden="true">→</span>
          </Link>
          <span className={styles.previewLinkDivider} aria-hidden="true">·</span>
          <Link className={styles.inlineLink} href="#modulos">
            Ver la descripción de los módulos <span aria-hidden="true">↓</span>
          </Link>
        </div>
      </section>

      <section className={styles.modules} id="modulos" aria-labelledby="agroway-modules-title">
        <div className="container">
          <header className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Qué hace AgroWay</span>
              <h2 id="agroway-modules-title">Módulos para acompañar el ciclo, del lote a la cosecha.</h2>
            </div>
            <p>
              La demo pública deja recorrer una parte del modelo. El inventario vegetal, la operación
              productiva y las integraciones se muestran como alcance de evolución, no como
              funciones ya conectadas.
            </p>
          </header>
          <div className={styles.moduleGrid}>
            {modules.map((module) => (
              <article className={styles.moduleCard} key={module.number}>
                <div className={styles.moduleMeta}>
                  <span>{module.number}</span>
                  <small>{module.state}</small>
                </div>
                <h3>{module.title}</h3>
                <p>{module.copy}</p>
                <span className={styles.moduleExamples}>{module.examples}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.productVision} aria-labelledby="agroway-vision-title">
        <div className="container">
          <header className={styles.productVisionHeading}>
            <div>
              <span className={styles.eyebrow}>Una historia conectada</span>
              <h2 id="agroway-vision-title">La verdad financiera y la verdad de campo no pueden vivir separadas.</h2>
            </div>
            <p>AgroWay organiza el ciclo productivo desde el productor, la finca y el lote hasta el diagnóstico, el plan, la actividad, la evidencia y la cosecha. La visión de Greenatics es que esa historia de campo también dé contexto al seguimiento técnico y a las decisiones del proyecto.</p>
          </header>
          <ol className={styles.productVisionFlow} aria-label="Visión de conexión entre campo y proyecto">
            <li>
              <span>AGROWAY FIELD</span>
              <h3>Registrar lo que ocurre en el lote.</h3>
              <p>Tareas, aplicaciones, seguimiento y evidencia vinculados con la zona y el ciclo productivo.</p>
              <small>La demo actual usa datos ficticios. La captura sin conexión y su sincronización posterior son parte de la evolución prevista.</small>
            </li>
            <li>
              <span>GREENATICS CONTROL</span>
              <h3>Leer la operación del proyecto.</h3>
              <p>Una visión de portafolio que contempla presupuesto, riesgo, abastecimiento, ejecución, cosecha, impacto y alertas.</p>
              <small>Control Tower, Digital Twin, Data Room, demanda y catálogo: componentes de producto en definición.</small>
            </li>
            <li>
              <span>SANA DATA</span>
              <h3>Llevar contexto de campo a la decisión.</h3>
              <p>Origen, ciclo, evidencia y seguimiento pueden apoyar la estructuración y el acompañamiento de proyectos productivos.</p>
              <small>La conexión entre AgroWay y SANA no está activa en esta demo y requiere diseño y validación.</small>
            </li>
          </ol>
          <p className={styles.productVisionNote}>Greenatics y Wondergreen suman conocimiento agronómico, ciencia aplicada, fertilizantes y bioinsumos para relacionar las decisiones con el suelo, el cultivo y el territorio.</p>
        </div>
      </section>

      <section className={styles.cycle} aria-labelledby="agroway-cycle-title">
        <div className="container">
          <header className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>El recorrido de un ciclo</span>
              <h2 id="agroway-cycle-title">Cada registro conserva el contexto de la decisión.</h2>
            </div>
            <p>
              El lote da continuidad entre el diagnóstico, el plan, el seguimiento y el resultado.
              Así una actividad no queda aislada de la zona donde ocurrió.
            </p>
          </header>
          <ol className={styles.cyclePath}>
            {cycleStages.map(([number, title, copy]) => (
              <li key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
          <div className={styles.relationship} aria-label="Relación entre módulos">
            <span>Proyecto</span><b aria-hidden="true">→</b><span>Finca y zona</span><b aria-hidden="true">→</b>
            <span>Ciclo y plan</span><b aria-hidden="true">→</b><span>Actividad y evidencia</span><b aria-hidden="true">→</b><span>Cosecha</span>
          </div>
        </div>
      </section>

      <section className={styles.mipfre} aria-labelledby="agroway-mipfre-title">
        <div className={"container " + styles.mipfreGrid}>
          <div>
            <span className={styles.eyebrowLight}>Plan de cultivo</span>
            <h2 id="agroway-mipfre-title">MIPFRE: manejo integrado por zona, con revisión profesional.</h2>
          </div>
          <div className={styles.mipfreCopy}>
            <p>
              En AgroWay, MIPFRE nombra el plan integrado de manejo por zona para fertirriego y
              manejo fitosanitario. El plan debe relacionar diagnóstico, cultivo, fuente técnica,
              responsable, fecha y evidencia esperada.
            </p>
            <p>
              No genera por sí solo dosis, umbrales ni compatibilidades. La formulación depende de
              protocolos vigentes y de revisión agronómica para el cultivo y la zona.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.statusSection} aria-labelledby="agroway-status-title">
        <div className={"container " + styles.statusGrid}>
          <div>
            <span className={styles.eyebrow}>Alcance y estado</span>
            <h2 id="agroway-status-title">Una demo para entender el producto; no para operar una finca.</h2>
          </div>
          <div className={styles.statusCopy}>
            <p>
              Los proyectos, lotes, tareas, evidencias, cosechas y estados que aparecen en pantalla
              son ilustrativos. La persistencia compartida, los permisos por organización, el
              inventario productivo y las integraciones de sensores todavía requieren desarrollo y
              validación.
            </p>
            <p>
              AgroWay no está conectado a sensores IoT ni a datos de campo en tiempo real. Antes de
              conectar una fuente se deben validar unidades, fecha de lectura, calibración,
              procedencia y responsable de revisar el dato.
            </p>
            <Link className={styles.inlineLink} href="/agroway/app/">
              Recorrer módulos de ejemplo <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.nextStep}>
        <div className={"container " + styles.nextStepGrid}>
          <div>
            <span className={styles.eyebrow}>Diseño del producto</span>
            <h2>¿Qué información necesita tu equipo para seguir un ciclo completo?</h2>
            <p>
              Cuéntanos cómo organizas zonas, planes, labores e inventarios para definir un alcance
              que se pueda revisar junto con las personas responsables del cultivo.
            </p>
          </div>
          <Link className="button button--primary" href="/contacto/?interes=agroway">
            Conversar sobre AgroWay <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
