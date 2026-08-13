import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { ProjectEvidenceGallery } from "@/components/project-evidence-gallery";
import { getPublicProject, publicProjects } from "@/data/projects-public";
import styles from "../projects.module.css";

type Props = { params: Promise<{ slug: string }> };

const tamesisPhases = [
  ["01", "Puesta en marcha", "Recuperar condiciones mínimas de infraestructura, equipos, proceso, personal y control para reactivar el sistema de manera ordenada."],
  ["02", "Estabilización", "Estandarizar procedimientos, fortalecer mantenimiento y reducir variabilidad operacional antes de hablar de mayor escala."],
  ["03", "Escalabilidad", "Usar una operación estabilizada y sus datos para evaluar nuevas capacidades, corrientes, productos o cobertura."],
] as const;

const yarumalPhases = [
  ["01", "Registrar", "La recepción, el proceso y las novedades dejan evidencia en la operación."],
  ["02", "Conectar", "Lotes, actividades, mantenimiento, producto e inventarios forman una secuencia trazable."],
  ["03", "Aprender", "Los datos permiten revisar desviaciones, mejorar rutinas y decidir qué puede publicarse."],
] as const;

export function generateStaticParams() {
  return publicProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getPublicProject(slug);
  if (!project) return {};
  return {
    title: `${project.name} | Proyectos Greenatics`,
    description: project.summary,
    alternates: { canonical: `/proyectos/${project.slug}` },
  };
}

export default async function ProjectCasePage({ params }: Props) {
  const { slug } = await params;
  const project = getPublicProject(slug);
  if (!project) notFound();
  const phases = project.slug === "tamesis" ? tamesisPhases : yarumalPhases;
  const solutionHref = project.slug === "tamesis" ? "/soluciones/rehabilitacion" : "/soluciones/trazabilidad-datos";
  const solutionLabel = project.slug === "tamesis" ? "Ver solución de rehabilitación" : "Conocer trazabilidad y GREENATICS OPS";

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", path: "/" }, { name: "Proyectos", path: "/proyectos" }, { name: project.name, path: `/proyectos/${project.slug}` as `/${string}` }]} />
      <main>
        <section className={styles.detailHero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={styles.container}>
            <Link className={styles.back} href="/proyectos">← Proyectos</Link>
            <div className={styles.detailGrid}>
              <div><span className={styles.status}>{project.statusLabel}</span><span className={styles.eyebrow}>{project.region}</span><h1>{project.name}</h1><p className={styles.lead}>{project.summary}</p></div>
              <aside className={styles.detailFact}><span>Publicación gobernada</span><strong>Contexto de publicación</strong><p>{project.publicationContext}</p></aside>
            </div>
          </div>
        </section>

        <ProjectEvidenceGallery slug={project.slug} />

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>Qué demuestra este caso</span><h2>Capacidades y problemas observados dentro de un sistema completo.</h2></div>
            <div className={styles.capGrid}>{project.capabilities.map(([title, copy], index) => <article className={styles.capCard} key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>{project.slug === "tamesis" ? "Modelo de intervención" : "De operación a conocimiento"}</span><h2>{project.slug === "tamesis" ? "Puesta en marcha → Estabilización → Escalabilidad." : "Registrar → Conectar → Aprender."}</h2></div>
            <div className={styles.phaseGrid}>{phases.map(([number, title, copy]) => <article className={styles.phase} key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>Aprendizajes transferibles</span><h2>Lo que este caso puede enseñar al siguiente proyecto.</h2></div>
            <div className={styles.capGrid}>{project.learnings.map(([title, copy], index) => <article className={styles.capCard} key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
          </div>
        </section>

        <section className={styles.dark}>
          <div className={`${styles.container} ${styles.darkGrid}`}>
            <div><span className={styles.eyebrow}>Truth lock</span><h2>Experiencia documentada no significa estado actual certificado.</h2></div>
            <div><p>Cuando necesitemos publicar producción, toneladas tratadas, rendimiento, capacidad, inversión o impacto, cada valor deberá tener fuente, periodo, unidad, responsable y fecha de corte. Esta página preserva el aprendizaje sin convertir información histórica en una afirmación vigente.</p><Link className={`${styles.button} ${styles.light}`} href={solutionHref}>{solutionLabel}</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
