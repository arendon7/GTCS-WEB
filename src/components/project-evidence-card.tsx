import Link from "next/link";
import type { PublicProject } from "@/data/projects-public";
import { ProjectCardMedia } from "@/components/project-card-media";
import styles from "./project-evidence-card.module.css";

export function ProjectEvidenceCard({ project, index }: { project: PublicProject; index: number }) {
  return (
    <article className={styles.card}>
      <div className={styles.media}><ProjectCardMedia slug={project.slug} name={project.name} /></div>
      <div className={styles.body}>
        <div className={styles.topline}>
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.status}>{project.statusLabel}</span>
        </div>
        <div>
          <h3>{project.name}</h3>
          <span className={styles.region}>{project.region}</span>
          <p>{project.summary}</p>
        </div>
        <Link href={`/proyectos/${project.slug}`}>Ver caso {project.name} →</Link>
      </div>
    </article>
  );
}
