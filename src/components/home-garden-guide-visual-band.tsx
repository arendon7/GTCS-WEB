"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { homeGardenGuides } from "@/data/home-garden";
import styles from "./home-garden-guide-visual-band.module.css";

const guideAssets = {
  "casa-jardin": {
    cover: "/api/public-media/home-garden-casa-jardin-cover",
    download: "/api/public-resources/home-garden-guide-casa-jardin",
    meta: "12 páginas · guía integral",
  },
  "mi-huerta": {
    cover: "/api/public-media/home-garden-mi-huerta-cover",
    download: "/api/public-resources/home-garden-guide-mi-huerta",
    meta: "8 páginas · huerta por etapas",
  },
  etapas: {
    cover: "/api/public-media/home-garden-etapas-cover",
    download: "/api/public-resources/home-garden-guide-etapas",
    meta: "5 páginas · referencia rápida",
  },
  trasplante: {
    cover: "/api/public-media/home-garden-trasplante-cover",
    download: "/api/public-resources/home-garden-guide-trasplante",
    meta: "8 páginas · trasplante y estabilidad",
  },
} as const;

type GuideAssetId = keyof typeof guideAssets;

function getGuideAsset(id: string) {
  if (!Object.prototype.hasOwnProperty.call(guideAssets, id)) return null;
  return guideAssets[id as GuideAssetId];
}

export function HomeGardenGuideVisualBand() {
  const pathname = usePathname();
  if (pathname !== "/casa-jardin") return null;

  return (
    <section className={styles.section} aria-labelledby="home-garden-guide-visual-title">
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Biblioteca Casa & Jardín</span>
            <h2 id="home-garden-guide-visual-title">Cuatro guías. Dos formas de usarlas.</h2>
          </div>
          <p>
            Léelas en la web cuando quieras navegar por tema y descarga el PDF cuando necesites llevar el material completo al jardín, la huerta o el vivero.
          </p>
        </div>

        <div className={styles.grid}>
          {homeGardenGuides.map((guide) => {
            const asset = getGuideAsset(guide.id);
            if (!asset) return null;
            return (
              <article className={styles.card} key={guide.id}>
                <a className={styles.coverLink} href={asset.download} target="_blank" rel="noreferrer" aria-label={`Abrir PDF ${guide.title}`}>
                  <Image
                    src={asset.cover}
                    alt={`Portada publicada de ${guide.title}`}
                    width={720}
                    height={1018}
                    sizes="(max-width: 640px) 88vw, (max-width: 1000px) 42vw, 24vw"
                    unoptimized
                  />
                </a>
                <div className={styles.body}>
                  <span className={styles.meta}>{asset.meta}</span>
                  <strong className={styles.title}>{guide.title}</strong>
                  <p>{guide.summary}</p>
                  <div className={styles.actions}>
                    <Link href={`/casa-jardin/guias#${guide.id}`}>Leer en la web →</Link>
                    <a href={asset.download} target="_blank" rel="noreferrer">Descargar PDF ↓</a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.note}>
          <strong>Masters públicos reconstruidos y gobernados.</strong>
          <p>Estas portadas provienen directamente de los PDFs publicados. No sustituyen Product Truth, no activan PVP y no convierten las guías en una receta universal.</p>
          <Link href="/biblioteca#recursos">Ver toda la Biblioteca Greenatics →</Link>
        </div>
      </div>
    </section>
  );
}
