import type { Metadata } from "next";
import Link from "next/link";
import styles from "./library-hub.module.css";

export const metadata: Metadata = {
  title: "Biblioteca | Greenatics",
  description: "Guías, programas por cultivo y herramientas técnicas de Greenatics y Wondergreen convertidas en conocimiento navegable.",
  alternates: { canonical: "/biblioteca" },
};

const resources = [
  { status: "Disponible", title: "Programas Wondergreen por cultivo", copy: "Café, cacao, aguacate, limón Tahití y pastos con lectura por etapa, cautelas, alertas y seguimiento.", href: "/wondergreen/cultivos", cta: "Explorar cultivos" },
  { status: "Disponible", title: "Guía práctica de deficiencias nutricionales", copy: "Una herramienta de lectura visual inicial que obliga a revisar tejido, patrón del lote y contexto antes de recomendar.", href: "/biblioteca/guia-deficiencias", cta: "Abrir guía" },
  { status: "Integrado en Wondergreen", title: "Más que NPK", copy: "Matriz orgánica, formulación, oclusión y peletizado explicados con un claim gate que separa característica técnica de promesa agronómica.", href: "/wondergreen#tecnologia", cta: "Ver tecnología" },
  { status: "En consolidación", title: "Manual de uso Wondergreen", copy: "Criterios comunes de aplicación, agua, compatibilidad, registro de eventos y seguimiento. Se publicará por versiones, no como receta universal.", href: "/wondergreen/cultivos", cta: "Ver criterios en cultivo" },
  { status: "En consolidación", title: "Catálogo técnico gobernado", copy: "Productos, formatos, presentaciones, estados comerciales y documentación vinculados al Product Master público.", href: "/wondergreen#portafolio", cta: "Ver Product Master" },
  { status: "Próxima capa", title: "Diagnóstico orientativo", copy: "Cultivo + etapa + necesidad + problema + contexto. El resultado será una ruta potencial, no una prescripción automática.", href: "/wondergreen#finder", cta: "Conocer el Finder" },
];

const principles = [
  ["01", "Fuente", "Cada recurso debe poder rastrearse a una fuente, versión o responsable."],
  ["02", "Contexto", "Síntoma, etapa, cultivo y manejo cambian la interpretación."],
  ["03", "Cautela", "La ausencia de información suficiente debe conducir a diagnóstico, no a una receta automática."],
  ["04", "Conexión", "El conocimiento debe enlazar con Product Master, cultivos, servicios o acompañamiento."],
];

export default function LibraryPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div><span className={styles.eyebrow}>Greenatics · conocimiento aplicado</span><h1>La biblioteca no es un archivo. Es parte de la decisión.</h1><p className={styles.lead}>Convertimos guías, manuales y conocimiento técnico ya construido en rutas web conectadas con cultivos, productos, síntomas, evidencia y acompañamiento.</p></div>
            <aside className={styles.warning}><span>Regla de conocimiento</span><strong>Conocimiento antes que recomendación.</strong><p>Una página técnica debe ayudar a formular mejores preguntas. Cuando la información no alcanza, la salida correcta es pedir análisis o escalar a un asesor.</p></aside>
          </div>
        </section>

        <section className={styles.principles}>
          <div className={`${styles.container} ${styles.principleGrid}`}>{principles.map(([number,title,copy])=><article key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></article>)}</div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}><span className={styles.eyebrow}>Recursos</span><h2>De PDF aislado a sistema de conocimiento.</h2><p>Cada recurso tiene un estado y una relación explícita con el Product Master, una ruta técnica o una necesidad de diagnóstico.</p></div>
            <div className={styles.libraryList}>{resources.map((resource,index)=><article className={styles.libraryItem} key={resource.title}><span className={styles.resourceIndex}>{String(index+1).padStart(2,"0")}</span><div><span className={styles.status}>{resource.status}</span><h3>{resource.title}</h3><p>{resource.copy}</p></div><Link href={resource.href}>{resource.cta} →</Link></article>)}</div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}><div><span className={styles.eyebrow}>Biblioteca Greenatics</span><h2>¿Buscas una guía para un cultivo específico?</h2><p>Empieza por cultivo y etapa; luego conecta necesidad, síntomas, producto y seguimiento.</p></div><Link className={styles.button} href="/wondergreen/cultivos">Ver cultivos</Link></div>
        </section>
      </main>
    </div>
  );
}
