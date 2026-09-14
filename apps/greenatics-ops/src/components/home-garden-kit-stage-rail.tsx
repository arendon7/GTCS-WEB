import type { HomeGardenStage } from "@/data/home-garden";
import { HomeGardenStageVisual } from "./home-garden-stage-visual";
import styles from "./home-garden-kit-stage-rail.module.css";

type HomeGardenKitStageRailProps = {
  stages: readonly HomeGardenStage[];
  label: string;
  tone?: "light" | "dark";
};

export function HomeGardenKitStageRail({ stages, label, tone = "light" }: HomeGardenKitStageRailProps) {
  return (
    <div className={`${styles.rail} ${styles[tone]}`} aria-label={label}>
      {stages.map((stage, index) => (
        <div className={styles.item} key={`${stage}-${index}`}>
          <span className={styles.order}>{String(index + 1).padStart(2, "0")}</span>
          <HomeGardenStageVisual stage={stage} size="mini" showTruthLabel={false} />
        </div>
      ))}
    </div>
  );
}
