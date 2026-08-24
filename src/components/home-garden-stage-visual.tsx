import Image from "next/image";
import { getHomeGardenProduct, type HomeGardenStage } from "@/data/home-garden";
import styles from "./home-garden-stage-visual.module.css";

const stageVisuals: Partial<Record<HomeGardenStage, { src: string; alt: string }>> = {
  crece: {
    src: "/api/public-media/wondergreen-2grow",
    alt: "Arte aprobado de la línea Wondergreen 2Grow para la etapa CRECE",
  },
  equilibra: {
    src: "/api/public-media/wondergreen-2balance",
    alt: "Arte aprobado de la línea Wondergreen 2Balance para la etapa EQUILIBRA",
  },
  florece: {
    src: "/api/public-media/wondergreen-2bloom",
    alt: "Arte aprobado de la línea Wondergreen 2Bloom para la etapa FLORECE",
  },
  fructifica: {
    src: "/api/public-media/wondergreen-2fruit",
    alt: "Arte aprobado de la línea Wondergreen 2Fruit para la etapa FRUCTIFICA",
  },
};

type HomeGardenStageVisualProps = {
  stage: HomeGardenStage;
  size?: "mini" | "card" | "hero";
  showTruthLabel?: boolean;
};

export function HomeGardenStageVisual({
  stage,
  size = "card",
  showTruthLabel = true,
}: HomeGardenStageVisualProps) {
  const product = getHomeGardenProduct(stage);
  if (!product) return null;

  const visual = stageVisuals[stage];
  const className = `${styles.figure} ${styles[size]}`;

  if (!visual) {
    return (
      <figure className={`${className} ${styles.compost}`} aria-label={`Visual ${product.consumerName}`} data-home-garden-stage={stage}>
        <div className={styles.compostBody}>
          <span>Suelo primero</span>
          <strong>{product.consumerName}</strong>
          <small>{product.technicalName}</small>
        </div>
        {showTruthLabel ? <figcaption>Base del sistema · representación editorial</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className={className} aria-label={`Visual ${product.consumerName}`} data-home-garden-stage={stage}>
      <div className={styles.imageFrame}>
        <Image
          src={visual.src}
          alt={visual.alt}
          width={760}
          height={1074}
          sizes={size === "mini" ? "120px" : size === "hero" ? "420px" : "320px"}
          unoptimized
        />
      </div>
      <div className={styles.identity}>
        <strong>{product.consumerName}</strong>
        <small>{product.formula ?? "Compost"}</small>
      </div>
      {showTruthLabel ? <figcaption>Arte de línea aprobado · no packshot específico</figcaption> : null}
    </figure>
  );
}
