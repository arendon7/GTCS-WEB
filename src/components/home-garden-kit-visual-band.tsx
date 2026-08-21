"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { visibleHomeGardenKits, type HomeGardenStage } from "@/data/home-garden";
import styles from "./home-garden-kit-visual-band.module.css";

const stageVisuals: Partial<Record<HomeGardenStage, { src: string; alt: string; label: string }>> = {
  crece: { src: "/api/public-media/wondergreen-2grow", alt: "Miniatura CRECE 2Grow", label: "CRECE" },
  equilibra: { src: "/api/public-media/wondergreen-2balance", alt: "Miniatura EQUILIBRA 2Balance", label: "EQUILIBRA" },
  florece: { src: "/api/public-media/wondergreen-2bloom", alt: "Miniatura FLORECE 2Bloom", label: "FLORECE" },
  fructifica: { src: "/api/public-media/wondergreen-2fruit", alt: "Miniatura FRUCTIFICA 2Fruit", label: "FRUCTIFICA" },
};

function StageVisual({ stage }: { stage: HomeGardenStage }) {
  if (stage === "prepara") {
    return (
      <div className={`${styles.stageVisual} ${styles.compostVisual}`} aria-label="COMPOST · base del sistema">
        <span>01</span>
        <strong>COMPOST</strong>
        <small>Suelo</small>
      </div>
    );
  }

  const visual = stageVisuals[stage];
  if (!visual) return null;
  return (
    <div className={styles.stageVisual}>
      <Image src={visual.src} alt={`${visual.alt} dentro del kit`} width={760} height={1074} sizes="120px" unoptimized />
      <span>{visual.label}</span>
    </div>
  );
}

export function HomeGardenKitVisualBand() {
  const pathname = usePathname();
  if (pathname !== "/casa-jardin") return null;

  return (
    <section className={styles.section} aria-labelledby="home-garden-kit-visual-title">
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Kits Wondergreen · composición visual</span>
            <h2 id="home-garden-kit-visual-title">Cada kit reúne etapas. No mezcla necesidades.</h2>
          </div>
          <p>
            Estas composiciones usan los artes reales del sistema Wondergreen para mostrar qué etapas contiene cada propuesta.
            No son fotografías finales de empaque ni habilitan compra, precio o dosis.
          </p>
        </div>

        <div className={styles.grid}>
          {visibleHomeGardenKits.map((kit) => (
            <article className={styles.card} key={kit.id}>
              <div className={styles.visualStrip} aria-label={`Composición visual ${kit.name}`}>
                {kit.pathway.map((stage, index) => <StageVisual stage={stage} key={`${kit.id}-${stage}-${index}`} />)}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.audience}>{kit.audience}</span>
                <strong className={styles.kitName}>{kit.name}</strong>
                <p className={styles.promise}>{kit.promise}</p>
                <p className={styles.pathway}>{kit.pathway.map((stage) => stage.toUpperCase()).join(" → ")}</p>
                <Link href={`/casa-jardin/kits/${kit.id}`}>Ver composición exacta y guardrails →</Link>
              </div>
              <div className={styles.status}>Pre-lanzamiento · compra deshabilitada</div>
            </article>
          ))}
        </div>

        <div className={styles.guardrail}>
          <div>
            <span>Kit educativo bloqueado</span>
            <strong>Trasplanta & Arranca continúa fuera del catálogo de kits disponibles.</strong>
          </div>
          <p>
            La guía de trasplante sí está publicada. El kit no se muestra como disponible hasta reconciliar el componente radicular/bioinsumo.
          </p>
          <a href="/api/public-resources/home-garden-guide-trasplante" target="_blank" rel="noreferrer">Descargar guía de trasplante PDF ↓</a>
        </div>
      </div>
    </section>
  );
}
