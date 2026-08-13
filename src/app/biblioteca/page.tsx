import type { Metadata } from "next";
import Link from "next/link";
import styles from "./library.module.css";

export const metadata: Metadata = {
  title: "Biblioteca | Greenatics",
  description: "Guías, programas por cultivo y herramientas técnicas de Greenatics y Wondergreen convertidas en conocimiento navegable.",
};

const resources = [
  {
    status: "Disponible",
    title: "Programas Wondergreen por cultivo",
    copy: "Café, cacao, aguacate, limón Tahití y pastos con lectura por etapa, cautelas, alertas y seguimiento.",
    href: "/wondergreen/cultivos",
    cta: "Explorar cultivos",
  },
  {
    status: "Disponible",
    title: "Guía práctica de deficiencias nutricionales",
    copy: "Una herramienta de lectura visual inicial que obliga a revisar tejido, patrón del lote y contexto antes de recomendar.",
    href: "/biblioteca/guia-deficiencias",
    cta: "Abrir guía",
  },
  {
    status: "Integrado en Wondergreen",
    title: "Más que NPK",
    copy: "Matriz orgánica, formulación, oclusión y peletizado explicados con un claim gate que separa característica técnica de promesa agronómica.",
    href: "/wondergreen#tecnologia",
    cta: "Ver tecnología",
  },
  {
    status: "En consolidación",
    title: "Manual de uso Wondergreen",
    copy: "Criterios comunes de aplicación, agua, compatibilidad, registro de eventos y seguimiento. Se publicará por versiones, no como receta universal.",
    href: "/wondergreen/cultivos",
    cta: "Ver criterios en cultivo",
  },
  {
    status: "En consolidación",
    title: "Catálogo técnico gobernado",
    copy: "Productos, formatos, presentaciones, estados comerciales y documentación vinculados al Product Master público.",
    href: "/wondergreen#portafolio",
    cta: "Ver Product Master",
  },
  {
    status: "Próxima capa",
    title: "Diagnóstico orientativo",
    copy: "Cultivo + etapa + necesidad + problema + contexto. El resultado será una ruta potencial, no una prescripción automática.",
    href: "/wondergreen#finder",
    cta: "Conocer el Finder",
  },
];

export default function LibraryPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Greenatics · conocimiento aplicado</span>
              <h1>La biblioteca no es un archivo. Es parte de la decisión.</h1>
              <p className={styles.lead}>Convertimos guías, manuales y conocimiento técnico ya construido en rutas web conectadas con cultivos, productos, síntomas, evidencia y acompañamiento.</p>
            </div>
            <aside className={styles.warning}>
              <strong>Conocimiento antes que recomendación.</strong>
              <p>Una página técnica debe ayudar a formular mejores preguntas. Cuando la información no alcanza, la salida correcta es pedir análisis o escalar a un asesor.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Recursos</span>
              <h2>De PDF aislado a sistema de conocimiento.</h2>
              <p>Cada recurso tendrá estado, fuente y relación explícita con el Product Master o con una ruta técnica.</p>
            </div>
            <div className={styles.libraryGrid}>
              {resources.map((resource) => (
                <article className={styles.libraryCard} key={resource.title}>
                  <span className={styles.status}>{resource.status}</span>
                  <h3>{resource.title}</h3>
                  <p>{resource.copy}</p>
                  <Link href={resource.href}>{resource.cta} →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Biblioteca Greenatics</span><h2>¿Buscas una guía para un cultivo específico?</h2></div>
            <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/cultivos">Ver cultivos</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
