import Image from "next/image";
import { getProjectMedia } from "@/data/public-media";
import styles from "./project-evidence-gallery.module.css";

export function ProjectEvidenceGallery({ slug }: { slug: string }) {
  const evidence = getProjectMedia(slug);
  if (evidence.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby={`${slug}-evidence-title`}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Evidencia visual conciliada</span>
            <h2 id={`${slug}-evidence-title`}>Registro documental del proyecto.</h2>
          </div>
          <p>Solo aparecen activos incorporados al registro público de medios. Una fotografía documenta experiencia y contexto; no se usa para afirmar por sí sola capacidad, producción o estado operativo actual.</p>
        </div>

        <div className={styles.grid}>
          {evidence.map((asset) => (
            <figure className={styles.figure} key={asset.id}>
              <div className={styles.visual}>
                <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 760px) 100vw, 50vw" />
              </div>
              <figcaption>{asset.caption}</figcaption>
            </figure>
          ))}
        </div>

        <p className={styles.truth}><strong>Truth lock:</strong> los medios públicos conservan fuente y alcance. Si un proyecto no tiene activo conciliado, la web no fabrica una imagen para completar la composición.</p>
      </div>
    </section>
  );
}
