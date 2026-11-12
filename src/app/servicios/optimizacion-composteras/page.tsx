import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./optimizacion-composteras.module.css";

export const metadata: Metadata = {
  title: "Optimización técnica del compostaje en marcha",
  description:
    "Acompañamiento técnico para revisar materiales, mezcla, humedad, aireación, volteo y maduración en procesos de compostaje activos.",
  alternates: { canonical: "/servicios/optimizacion-composteras/" },
};

export default function CompostOptimizationPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <Link className={styles.backLink} href="/servicios/#operacion">Todos los servicios</Link>
            <h1>Ajustar el compostaje a los materiales y a las condiciones reales del proceso.</h1>
            <p className={styles.lead}>
              Acompañamos a equipos que ya compostan y necesitan revisar cómo la mezcla, la humedad,
              la aireación, el volteo y la maduración responden al material que reciben.
            </p>
            <div className={styles.actions}>
              <Link className="button button--dark" href="#lectura-tecnica">Cómo se orienta el ajuste</Link>
              <Link className={styles.secondaryAction} href="#alternativas-de-apoyo">Comparar rutas de apoyo</Link>
            </div>
          </div>
          <figure className={styles.heroFigure}>
            <Image
              src="/services/compost-optimization-concept-v1.jpg"
              alt="Compost en proceso dentro de un área de trabajo cubierta."
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 760px) 100vw, 54vw"
            />
            <figcaption>El material, su mezcla y la rutina de manejo orientan la lectura del proceso.</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.reading} id="lectura-tecnica" aria-labelledby="reading-title">
        <div className={`container ${styles.readingGrid}`}>
          <h2 id="reading-title">El compostaje no se ajusta con una receta única.</h2>
          <div>
            <p>
              La revisión conecta los materiales recibidos y su preparación con las condiciones del
              proceso: mezcla, humedad, aireación, volteo, maduración y controles. Esa lectura permite
              orientar cambios acordes con la operación, en lugar de aplicar una instrucción aislada.
            </p>
            <p>
              El alcance se define con la información disponible, el espacio, los equipos y el equipo
              responsable. Las recomendaciones se precisan para el proceso observado; no presuponen
              una mejora cuantificada antes de revisar sus condiciones.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.boundaries} id="alternativas-de-apoyo" aria-labelledby="boundaries-title">
        <div className={`container ${styles.boundariesInner}`}>
          <div className={styles.boundariesLead}>
            <h2 id="boundaries-title">Ajustar el proceso es distinto de reconstruir la planta o asumir su operación diaria.</h2>
            <p>
              Este acompañamiento se enfoca en compostaje activo. No incluye automáticamente obras,
              rehabilitación de infraestructura ni personal para cubrir turnos de operación.
            </p>
          </div>
          <div className={styles.alternatives}>
            <article>
              <h3>Si hay equipos o infraestructura por recuperar</h3>
              <p>Evalúa su estado y las intervenciones que podrían requerirse antes de definir un arranque.</p>
              <Link href="/servicios/rehabilitacion-infraestructura/">Revisar Planta en Marcha <span aria-hidden="true">→</span></Link>
            </article>
            <article>
              <h3>Si necesitas continuidad técnica u operación</h3>
              <p>Compara las modalidades y responsabilidades posibles para sostener el trabajo de la planta.</p>
              <Link href="/servicios/operacion-delegada/">Conocer las modalidades de operación <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.closing} id="conversemos" aria-labelledby="closing-title">
        <div className={`container ${styles.closingInner}`}>
          <div>
            <h2 id="closing-title">Conversemos sobre el proceso que ya está en marcha.</h2>
            <p>
              Para empezar, ayuda conocer los materiales recibidos, la mezcla, la rutina de volteo,
              los tiempos, los controles, el espacio y el equipo responsable. Si todavía no tienes
              toda esa información, podemos identificar juntos qué hace falta revisar.
            </p>
          </div>
          <Link className="button button--light" href="/contacto/?servicio=optimizacion-composteras">
            Evaluar el proceso de compostaje <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
