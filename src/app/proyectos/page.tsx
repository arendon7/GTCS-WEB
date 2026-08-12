import type { Metadata } from "next";
import Link from "next/link";
import { publicProjects } from "@/data/projects-public";
import styles from "./projects.module.css";

export const metadata: Metadata = {
  title: "Proyectos | Greenatics",
  description: "Casos documentados y aprendizajes Greenatics en operación, rehabilitación, tratamiento biológico, rutas selectivas y trazabilidad.",
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
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" aria-label="Greenatics, inicio"><img className={styles.logo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" /></Link>
          <nav className={styles.nav} aria-label="Navegación pública"><Link href="/soluciones">Soluciones</Link><Link href="/proyectos">Proyectos</Link><Link href="/wondergreen">Wondergreen</Link><Link href="/biblioteca">Conocimiento</Link></nav>
          <Link className={`${styles.button} ${styles.primary}`} href="/app">Acceder a Greenatics</Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div><span className={styles.eyebrow}>Proyectos Greenatics</span><h1>La experiencia no es una foto de una planta. Es saber qué hacer antes, durante y después de ponerla a operar.</h1><p className={styles.lead}>Nuestros casos documentan problemas de territorio, calidad del material, infraestructura, procesos biológicos, operación, productos y datos. Los usamos como evidencia de aprendizaje transferible, no como una vitrina de cifras sin contexto.</p></div>
            <aside className={styles.truth}><strong>Caso real + periodo + alcance.</strong><p>Una propuesta, una capacidad nominal, una fotografía histórica o una cifra antigua no se convierten automáticamente en un resultado vigente. Cada caso explica qué está documentado y qué requiere una nueva validación.</p></aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>Casos documentados</span><h2>Dos plantas, aprendizajes diferentes.</h2><p>Yarumal permite mostrar aprendizajes de operación y trazabilidad. Támesis aporta un caso especialmente útil sobre diagnóstico, rehabilitación y puesta en marcha progresiva.</p></div>
            <div className={styles.projectGrid}>
              {publicProjects.map((project) => <article className={styles.projectCard} key={project.slug}><span className={styles.status}>{project.statusLabel}</span><h2>{project.name}</h2><span className={styles.region}>{project.region}</span><p>{project.summary}</p><Link href={`/proyectos/${project.slug}`}>Ver caso {project.name} →</Link></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>Experiencia transferible</span><h2>Lo valioso de un proyecto es lo que enseña para el siguiente.</h2></div>
            <div className={styles.capGrid}>{transferable.map(([title,copy],index)=><article className={styles.capCard} key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
          </div>
        </section>

        <section className={styles.dark}>
          <div className={`${styles.container} ${styles.darkGrid}`}><div><span className={styles.eyebrow}>Proyectos en maduración</span><h2>Prefactibilidad y factibilidad también son proyectos.</h2></div><div><p>Mientras un proyecto está en diagnóstico, conversación comercial o prefactibilidad, no lo presentamos como planta adjudicada, construida u operativa. La madurez del proyecto se comunica sin exagerar avance.</p><Link className={styles.button} style={{marginTop:20,background:"#fff",color:"#14352c"}} href="/soluciones/prefactibilidad">Ver cómo estructuramos una prefactibilidad</Link></div></div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}><div className={styles.sectionHead}><span className={styles.eyebrow}>Cómo se vuelve público un resultado</span><h2>Del registro interno a una afirmación que se puede defender.</h2></div><div className={styles.capGrid}>{publicationFlow.map(([number,title,copy])=><article className={styles.capCard} key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
        </section>

        <section className={styles.closing}><div className={`${styles.container} ${styles.closingInner}`}><div><span className={styles.eyebrow}>Construir el siguiente caso</span><h2>Cada territorio parte de condiciones distintas. El aprendizaje sí puede transferirse.</h2></div><Link className={`${styles.button} ${styles.primary}`} href="/soluciones/diagnostico-caracterizacion">Empezar por diagnóstico</Link></div></section>
      </main>

      <footer className={styles.footer}><div className={`${styles.container} ${styles.footerInner}`}><span>Greenatics · proyectos con contexto</span><div><Link href="/soluciones">Soluciones</Link> · <Link href="/wondergreen">Wondergreen</Link> · <Link href="/app">GREENATICS OPS</Link></div></div></footer>
    </div>
  );
}
