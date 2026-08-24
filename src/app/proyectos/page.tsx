import type { Metadata } from "next";
import Link from "next/link";
import { ProjectEvidenceCard } from "@/components/project-evidence-card";
import { publicProjects } from "@/data/projects-public";
import styles from "./projects.module.css";
import refresh from "./projects-refresh.module.css";

export const metadata: Metadata = {
  title: "Proyectos | Greenatics",
  description: "Casos documentados y aprendizajes Greenatics en operación, rehabilitación, tratamiento biológico, rutas selectivas y trazabilidad.",
  alternates: { canonical: "/proyectos" },
};

const transferable = [
  ["Diagnóstico antes de invertir", "Generación, infraestructura, logística, operación y destino deben entenderse antes de escoger una solución."],
  ["Puesta en marcha real", "Una infraestructura necesita proceso, personas, mantenimiento, protocolos y seguimiento para convertirse en operación."],
  ["Tratamiento como sistema", "Compostaje y digestión anaerobia dependen de la materia prima, el control operativo y la gestión de salidas."],
  ["Ruta y suministro", "Separación, generadores, frecuencia, impropios y trazabilidad condicionan el desempeño de la planta."],
  ["Producto y destino", "El aprovechamiento debe conectar la salida del proceso con calidad, inventario, uso y mercado."],
  ["Datos para mejorar", "Recepción, lotes, mantenimiento, proceso, producto y despacho deben dejar evidencia gobernada."],
];

const publicationFlow = [
  ["01", "Registrar", "El dato nace en una actividad operativa o entregable técnico identificado."],
  ["02", "Conciliar", "Se revisan periodo, unidad, alcance, fuente y duplicados."],
  ["03", "Aprobar", "Un responsable valida que el dato o estado sí puede publicarse."],
  ["04", "Explicar", "La cifra o afirmación se acompaña de contexto suficiente."],
  ["05", "Actualizar", "Todo resultado conserva fecha de corte y no se presenta como permanente."],
];

export default function ProjectsPage() {
  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Proyectos Greenatics · Evidencia con contexto</span>
              <h1>La experiencia no es una foto de una planta. Es saber qué hacer antes, durante y después de ponerla a operar.</h1>
              <p className={styles.lead}>Nuestros casos documentan problemas de territorio, calidad del material, infraestructura, procesos biológicos, operación, productos y datos. Los usamos como evidencia de aprendizaje transferible, no como una vitrina de cifras sin contexto.</p>
            </div>
            <aside className={styles.truth}>
              <span>Truth lock de proyectos</span>
              <strong>Caso real + periodo + alcance.</strong>
              <p>Una propuesta, una capacidad nominal, una fotografía histórica o una cifra antigua no se convierten automáticamente en un resultado vigente. Cada caso explica qué está documentado y qué requiere una nueva validación.</p>
            </aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Casos documentados</span>
              <h2>Dos plantas, aprendizajes diferentes.</h2>
              <p>Yarumal ya cuenta con evidencia visual pública conciliada. Támesis conserva su caso técnico sin sustituir la falta de fotografía validada por una imagen genérica.</p>
            </div>
            <div className={styles.projectGrid}>
              {publicProjects.map((project, index) => <ProjectEvidenceCard project={project} index={index} key={project.slug} />)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>Experiencia transferible</span><h2>Lo valioso de un proyecto es lo que enseña para el siguiente.</h2></div>
            <div className={styles.capGrid}>{transferable.map(([title, copy], index) => <article className={styles.capCard} key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
          </div>
        </section>

        <section className={styles.dark}>
          <div className={`${styles.container} ${styles.darkGrid}`}>
            <div><span className={styles.eyebrow}>Proyectos en maduración</span><h2>Prefactibilidad y factibilidad también son proyectos.</h2></div>
            <div><p>Mientras un proyecto está en diagnóstico, conversación comercial o prefactibilidad, no lo presentamos como planta adjudicada, construida u operativa. La madurez del proyecto se comunica sin exagerar avance.</p><Link className={`${styles.button} ${styles.light}`} href="/soluciones/prefactibilidad">Ver cómo estructuramos una prefactibilidad</Link></div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>Cómo se vuelve público un resultado</span><h2>Del registro interno a una afirmación que se puede defender.</h2></div>
            <div className={styles.flowList}>{publicationFlow.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Del caso al siguiente proyecto</span><h2>La evidencia ayuda a elegir una capacidad. El alcance se define para el contexto real.</h2><p>Si ya identificaste el tipo de intervención que necesitas, explora directamente las soluciones. Si todavía no sabes por dónde empezar, usa el orientador inicial como ruta secundaria.</p></div>
            <div>
              <Link className={`${styles.button} ${styles.darkButton}`} href="/soluciones">Ver soluciones</Link>
              <Link className={styles.button} href="/soluciones/diagnostico-inicial">No sé por dónde empezar</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
