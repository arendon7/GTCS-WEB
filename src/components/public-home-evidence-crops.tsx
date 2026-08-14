import Image from "next/image";
import Link from "next/link";
import { getProjectMedia } from "@/data/public-media";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import styles from "./public-home-evidence-crops.module.css";

export function HomeCropPrograms() {
  return (
    <section className={styles.crops} id="cultivos" aria-labelledby="home-crops-title">
      <div className={styles.container}>
        <div className={styles.cropHeading}>
          <div>
            <span className={styles.eyebrow}>Wondergreen · Programas por cultivo</span>
            <h2 id="home-crops-title">Cinco cultivos. Decisiones distintas según la etapa.</h2>
          </div>
          <div className={styles.cropIntro}>
            <p>Las guías ya están navegables y conectan momento fisiológico, objetivo, familia de producto, cautelas, alertas y seguimiento. Son una ruta de decisión técnica; no una dosis universal.</p>
            <Link href="/wondergreen/cultivos">Explorar biblioteca de cultivos →</Link>
          </div>
        </div>

        <div className={styles.cropGrid}>
          {wondergreenCrops.map((crop, index) => (
            <Link className={styles.cropCard} href={`/wondergreen/cultivos/${crop.slug}`} key={crop.slug}>
              <div className={styles.cropTopline}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{crop.stages.length} momentos técnicos</small>
              </div>
              <h3>{crop.name}</h3>
              <p>{crop.headline}</p>
              <strong>Abrir programa →</strong>
            </Link>
          ))}
        </div>

        <div className={styles.cropRouter}>
          <div>
            <strong>¿Todavía no sabes qué referencia mirar?</strong>
            <span>Empieza por cultivo y etapa; luego cruza el contexto con el Product Master y los criterios de uso.</span>
          </div>
          <div className={styles.cropActions}>
            <Link href="/biblioteca/criterios-nutricionales">Revisar criterios</Link>
            <Link href="/wondergreen/productos">Ver Product Master</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeProjectEvidence() {
  const evidence = getProjectMedia("yarumal");
  if (evidence.length === 0) return null;

  const primary = evidence[0];
  const secondary = evidence[1];

  return (
    <section className={styles.evidence} aria-labelledby="home-evidence-title">
      <div className={`${styles.container} ${styles.evidenceGrid}`}>
        <div className={styles.visualStack} aria-label="Evidencia visual conciliada del caso Yarumal">
          <figure className={`${styles.figure} ${styles.primaryFigure}`}>
            <Image src={primary.src} alt={primary.alt} width={1200} height={900} sizes="(max-width: 900px) 100vw, 54vw" />
            <figcaption>{primary.caption}</figcaption>
          </figure>
          {secondary ? (
            <figure className={`${styles.figure} ${styles.secondaryFigure}`}>
              <Image src={secondary.src} alt={secondary.alt} width={1200} height={900} sizes="(max-width: 900px) 88vw, 26vw" />
              <figcaption>{secondary.caption}</figcaption>
            </figure>
          ) : null}
          <div className={styles.mediaSeal} aria-hidden="true">
            <span>02</span>
            <strong>registros</strong>
            <small>conciliados</small>
          </div>
        </div>

        <div className={styles.evidenceCopy}>
          <span className={styles.eyebrow}>Experiencia que deja evidencia</span>
          <h2 id="home-evidence-title">Proyecto, operación y aprendizaje en territorio.</h2>
          <p>La web incorpora material real de los proyectos para explicar lo que Greenatics ha construido y aprendido. Las fotografías históricas documentan experiencia; no se usan para afirmar capacidad, producción o estado actual sin una fuente vigente y aprobada.</p>
          <dl className={styles.evidenceFacts}>
            <div><dt>Caso</dt><dd>Yarumal</dd></div>
            <div><dt>Medios publicados</dt><dd>{evidence.length} activos conciliados</dd></div>
            <div><dt>Alcance</dt><dd>Evidencia histórica del proyecto</dd></div>
          </dl>
          <div className={styles.evidenceActions}>
            <Link href="/proyectos/yarumal">Ver caso Yarumal →</Link>
            <Link href="/proyectos">Explorar proyectos →</Link>
          </div>
          <p className={styles.truthNote}><strong>Media truth:</strong> si una planta o cultivo todavía no tiene fotografía validada, la web conserva el espacio editorial sin sustituirla por una imagen genérica.</p>
        </div>
      </div>
    </section>
  );
}
