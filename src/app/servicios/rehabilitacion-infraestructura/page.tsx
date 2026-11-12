import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./rehabilitacion-infraestructura.module.css";

export const metadata: Metadata = {
  title: "Planta en Marcha · Rehabilitación de infraestructura existente",
  description:
    "Evaluamos el estado de una planta de tratamiento para priorizar su recuperación, definir intervenciones y preparar las condiciones de puesta en marcha.",
  alternates: { canonical: "/servicios/rehabilitacion-infraestructura/" },
};

export default function PlantRehabilitationPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <Link className={styles.backLink} href="/servicios/#infraestructura">Todos los servicios</Link>
            <p className={styles.eyebrow}>Planta en Marcha</p>
            <h1>Recuperar una planta empieza por saber qué puede volver a operar.</h1>
            <p className={styles.lead}>
              Evaluamos la infraestructura, los equipos, el proceso y la información disponible para
              identificar brechas, priorizar intervenciones y definir qué condiciones necesita un
              arranque. La capacidad recuperable se establece después de la revisión técnica, no antes.
            </p>
            <div className={styles.actions}>
              <Link className="button button--dark" href="#que-revisamos">Qué revisamos</Link>
              <Link className={styles.secondaryAction} href="#conversemos">Evaluar una planta existente</Link>
            </div>
          </div>
          <figure className={styles.heroFigure}>
            <Image
              src="/services/plant-rehabilitation-assessment-v1.jpg"
              alt="Profesionales inspeccionan equipos de bombeo y tuberías en una instalación de tratamiento de orgánicos."
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 800px) 100vw, 52vw"
            />
            <figcaption>Estado de equipos, proceso y servicios auxiliares: aspectos que pueden entrar en una evaluación técnica.</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.review} id="que-revisamos" aria-labelledby="review-title">
        <div className={`container ${styles.reviewGrid}`}>
          <div className={styles.reviewIntro}>
            <h2 id="review-title">Una planta detenida o subutilizada puede tener causas distintas.</h2>
            <p>
              La revisión conecta el estado físico con la forma en que opera el sistema. Así podemos
              diferenciar una reparación puntual de una brecha de proceso, servicios, control o
              mantenimiento, y evitar definir obras sin entender sus dependencias.
            </p>
          </div>
          <div className={styles.reviewBody}>
            <p>
              Revisamos el estado, la disponibilidad, el deterioro visible, los repuestos y la relación
              entre los equipos existentes. Contrastamos el proceso previsto con el agua, la energía,
              el bombeo, el manejo de materiales y los controles disponibles. Luego cruzamos esos
              hallazgos con los registros de operación, mantenimiento y calidad, además de las
              restricciones del sitio.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.plan} aria-labelledby="plan-title">
        <div className={`container ${styles.planInner}`}>
          <div className={styles.planHeading}>
            <h2 id="plan-title">La recuperación se define por etapas y con prioridades explícitas.</h2>
          </div>
          <div className={styles.planBody}>
            <p>
              El diagnóstico organiza hallazgos, riesgos y datos faltantes. Con esa base se comparan
              alternativas de reparación, reemplazo o ajuste, sus dependencias y la secuencia que tendría
              sentido para el sistema.
            </p>
            <p>
              El alcance puede dejar una condición técnica de referencia y un plan inicial: qué conservar,
              qué priorizar por condición, riesgo, dependencia y objetivo operativo, y qué pruebas acordar
              antes de estabilizar el proceso. Ingeniería, suministro, obras, montaje y puesta en marcha
              se delimitan como fases específicas; solo se ejecutan cuando hacen parte del acuerdo.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.boundaries} aria-labelledby="boundaries-title">
        <div className={`container ${styles.boundariesInner}`}>
          <div>
            <h2 id="boundaries-title">Recuperar lo existente es distinto de diseñar una planta nueva o asumir su operación diaria.</h2>
          </div>
          <div className={styles.boundaryLinks}>
            <p>Si todavía estás comparando alternativas o necesitas diseñar infraestructura nueva, revisa las fases de ingeniería.</p>
            <Link href="/servicios/plantas-modulares/">Diseño e ingeniería de plantas <span aria-hidden="true">→</span></Link>
            <p>Si la planta ya opera y necesita ajustar variables del compostaje, el acompañamiento técnico tiene otro foco.</p>
            <Link href="/servicios/optimizacion-composteras/">Optimización de composteras en marcha <span aria-hidden="true">→</span></Link>
            <p>Si el reto es sostener la planta en marcha, puedes comparar dirección técnica, operación compartida e integral; responsabilidades y recursos se acuerdan para cada contrato.</p>
            <Link href="/servicios/operacion-delegada/#modalidades">Comparar dirección técnica y modalidades de operación <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className={styles.closing} id="conversemos" aria-labelledby="closing-title">
        <div className={`container ${styles.closingInner}`}>
          <div>
            <h2 id="closing-title">Hablemos con la información que ya tienes.</h2>
            <p>
              Ayuda conocer el proceso, la capacidad de diseño, el estado de equipos, los registros
              recientes y las restricciones del sitio. Si algo falta, lo identificamos en la conversación.
              Las intervenciones, la capacidad posible y la ejecución se precisan tras la revisión técnica.
            </p>
          </div>
          <div className={styles.closingActions}>
            <Link className="button button--light" href="/contacto/?servicio=rehabilitacion-infraestructura&perfil=municipio">Municipio o ESP <span aria-hidden="true">→</span></Link>
            <Link className="button button--outline-light" href="/contacto/?servicio=rehabilitacion-infraestructura&perfil=empresa">Empresa o gran generador <span aria-hidden="true">→</span></Link>
            <Link className="button button--outline-light" href="/contacto/?servicio=rehabilitacion-infraestructura&perfil=agroindustria">Agroindustria o proyecto productivo <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
