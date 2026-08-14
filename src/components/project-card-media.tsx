import Image from "next/image";
import { getPrimaryProjectMedia } from "@/data/public-media";
import styles from "./project-card-media.module.css";

export function ProjectCardMedia({ slug, name }: { slug: string; name: string }) {
  const media = getPrimaryProjectMedia(slug);

  if (media) {
    return (
      <figure className={styles.figure}>
        <Image src={media.src} alt={media.alt} fill sizes="(max-width: 760px) 100vw, 50vw" />
        <figcaption><span>Evidencia conciliada</span><strong>{name}</strong></figcaption>
      </figure>
    );
  }

  return (
    <div className={styles.pending} role="img" aria-label={`${name}: evidencia visual pública pendiente de conciliación`}>
      <div className={styles.grid} aria-hidden="true"><span /><span /><span /><span /></div>
      <div className={styles.pendingCopy}>
        <span>Activo visual pendiente</span>
        <strong>{name}</strong>
        <small>No usamos una fotografía genérica para representar un proyecto real.</small>
      </div>
    </div>
  );
}
