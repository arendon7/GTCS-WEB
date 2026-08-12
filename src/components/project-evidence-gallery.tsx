import Image from "next/image";
import styles from "./project-evidence-gallery.module.css";

const yarumalEvidence = [
  {
    src: "/projects/yarumal/aerial-01.webp",
    alt: "Vista aérea documentada del caso Greenatics en Yarumal",
  },
  {
    src: "/projects/yarumal/aerial-02.webp",
    alt: "Segunda vista aérea documentada del caso Greenatics en Yarumal",
  },
] as const;

export function ProjectEvidenceGallery({ slug }: { slug: string }) {
  if (slug !== "yarumal") return null;

  return (
    <section className={styles.section} aria-labelledby="yarumal-evidence-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Evidencia visual recuperada</span>
            <h2 id="yarumal-evidence-title">Un registro real del caso Yarumal.</h2>
          </div>
          <p>Estas imágenes pertenecían a la web pública anterior y se recuperan como activos documentales del proyecto. Se conservan sin reinterpretación ni generación artificial.</p>
        </div>

        <div className={styles.grid}>
          {yarumalEvidence.map((asset, index) => (
            <figure className={styles.figure} key={asset.src}>
              <div className={styles.visual}>
                <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 760px) 100vw, 50vw" />
              </div>
              <figcaption>Registro visual histórico · Yarumal · vista {index + 1}</figcaption>
            </figure>
          ))}
        </div>

        <p className={styles.truth}><strong>Truth lock:</strong> el registro visual documenta experiencia histórica; por sí solo no certifica el estado, capacidad, producción o condiciones actuales de la operación.</p>
      </div>
    </section>
  );
}
