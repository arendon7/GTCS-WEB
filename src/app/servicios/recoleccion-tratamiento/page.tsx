import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./recoleccion-tratamiento.module.css";

export const metadata: Metadata = {
  title: "Recolección, trazabilidad y tratamiento recurrentes",
  description:
    "Conectamos generadores, retiro periódico, recepción y tratamiento de orgánicos separados con una operación definida para cada territorio u organización.",
  alternates: { canonical: "/servicios/recoleccion-tratamiento/" },
};

export default function RecurringCollectionPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <Link className={styles.backLink} href="/servicios/#recoleccion">Todos los servicios</Link>
            <h1>Recolección de orgánicos con trazabilidad hasta su tratamiento.</h1>
            <p className={styles.lead}>
              Coordinamos el retiro periódico de orgánicos separados y su entrega al tratamiento acordado.
              La frecuencia, la logística, los registros y las responsabilidades se definen con quienes
              generan, recogen y reciben el material.
            </p>
            <div className={styles.actions}>
              <Link className="button button--dark" href="#como-funciona">Entender el servicio</Link>
              <Link className={styles.secondaryAction} href="#conversemos">Evaluar mi operación</Link>
            </div>
          </div>
          <figure className={styles.heroFigure}>
            <div className={styles.heroImageFrame}>
              <Image
                src="/projects/routes/motocarguero-verde-operacion-real.webp"
                alt="Representación visual del motocarguero con el contenedor verde diseñado por Greenatics y Auteco Mobility."
                fill
                priority
                sizes="(max-width: 800px) 100vw, 52vw"
              />
            </div>
            <figcaption>La representación del diseño Greenatics–Auteco acompaña el análisis de ruta, capacidad y recepción para cada operación.</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.story} id="como-funciona" aria-labelledby="story-title">
        <div className={`container ${styles.storyGrid}`}>
          <div className={styles.storyIntro}>
            <h2 id="story-title">La calidad del servicio empieza antes del primer retiro.</h2>
            <p>
              La separación, el almacenamiento, el volumen por punto y la capacidad de recepción deben
              encajar. Cuando uno de esos componentes cambia, también pueden cambiar la frecuencia, el
              tipo de vehículo, los tiempos de recorrido y el manejo requerido en destino.
            </p>
          </div>
          <div className={styles.storyFlow}>
            <p>Caracterizamos los puntos de generación, las corrientes separadas, la cantidad esperada por periodo, los recipientes y las condiciones de acceso. Con el sitio receptor se revisan horarios, capacidad y criterios de aceptación.</p>
            <p>Luego se acuerdan cobertura, frecuencia, ventanas de servicio, responsables y contingencias. El programa se dimensiona frente a generación, almacenamiento, tráfico, distancias y capacidad de recepción; no se copia una frecuencia estándar para todos los sitios.</p>
            <p>El protocolo de cada retiro puede registrar origen, fecha y hora, tipo y cantidad del material, método de medición, condición de entrega, destino, recibido o rechazado, y novedades. Así cada movimiento deja información útil para conciliar el servicio y corregir desvíos.</p>
          </div>
        </div>
      </section>

      <section className={styles.territory} aria-labelledby="territory-title">
        <div className={`container ${styles.territoryGrid}`}>
          <figure className={styles.territoryFigure}>
            <div className={styles.territoryImageFrame}>
              <Image
                src="/projects/tamesis/ruta-selectiva.jpeg"
                alt="Personal realiza recolección junto a un vehículo convencional en una calle de Támesis."
                fill
                sizes="(max-width: 760px) 100vw, 48vw"
              />
            </div>
            <figcaption>Registro fotográfico de una jornada de recolección convencional en Támesis.</figcaption>
          </figure>
          <div className={styles.territoryCopy}>
            <p className={styles.eyebrow}>LOGÍSTICA DEFINIDA EN CAMPO</p>
            <h2 id="territory-title">El vehículo y el recorrido responden al territorio.</h2>
            <p>La capacidad, el tipo de vía, los puntos de carga, el almacenamiento temporal, las distancias y el sitio receptor condicionan el diseño. El vehículo que aparece en Támesis corresponde a la jornada fotografiada; cada servicio requiere confirmar su propia configuración y alcance.</p>
            <Link href="/servicios/microrrutas-motocarguero/">Si hay que diseñar una ruta desde cero, conoce el servicio de microrrutas <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className={styles.regulation} aria-labelledby="regulation-title">
        <div className={`container ${styles.regulationInner}`}>
          <div className={styles.regulationHeading}>
            <p className={styles.eyebrow}>MARCO SECTORIAL</p>
            <h2 id="regulation-title">La programación también debe responder a las reglas del servicio.</h2>
          </div>
          <div className={styles.regulationCopy}>
            <p>Cuando la recolección forma parte del servicio público de aseo, el Decreto 1077 de 2015 relaciona la separación selectiva con los programas del PGIRS y encarga al prestador organizar rutas y frecuencias según generación, características del sector, condiciones de acceso y operación. El calendario aplicable debe corresponder al programa de prestación del prestador.</p>
            <p>La Resolución 2184 de 2019 define el código de colores; el recipiente o bolsa verde se destina a residuos orgánicos aprovechables dentro del esquema de separación aplicable. Si además se incorpora la actividad de aprovechamiento del servicio público de aseo, se revisa el marco que corresponda a ese prestador y actividad, incluida la Resolución 0412 de 2026. Para una operación privada, se determina primero el rol, el contrato y las obligaciones que sí le aplican.</p>
            <p className={styles.sources}>
              <a href="https://minvivienda.gov.co/sites/default/files/normativa/decreto-unico-vivienda-actualizado-ultima-actualizacion-27042026_0.pdf" target="_blank" rel="noreferrer">Decreto 1077 de 2015, arts. 2.3.2.2.2.3.26 y 30–32; versión integrada al 27 de abril de 2026 <span aria-hidden="true">↗</span></a>
              <a href="https://www.minambiente.gov.co/wp-content/uploads/2021/08/resolucion-2184-de-2019.pdf" target="_blank" rel="noreferrer">Resolución 2184 de 2019, art. 4 <span aria-hidden="true">↗</span></a>
              <a href="https://minvivienda.gov.co/normativa/resolucion-0412-2026-0" target="_blank" rel="noreferrer">Resolución 0412 de 2026 <span aria-hidden="true">↗</span></a>
            </p>
            <p className={styles.regulationLimit}>El alcance regulatorio se confirma para cada actor, actividad, territorio y contrato. La asesoría no reemplaza el PGIRS, el programa del prestador, los permisos ni las decisiones de la autoridad competente.</p>
          </div>
        </div>
      </section>

      <section className={styles.distinction} aria-labelledby="distinction-title">
        <div className={`container ${styles.distinctionInner}`}>
          <div>
            <h2 id="distinction-title">Retirar de forma periódica no es lo mismo que diseñar una microrruta nueva.</h2>
          </div>
          <div className={styles.distinctionCopy}>
            <p>
              Este servicio organiza el retiro recurrente entre generadores y un destino acordado. Si aún
              hay que definir zonas, secuencia de paradas, vehículo, frecuencias o probar una configuración,
              se evalúa primero el diseño de microrruta y el piloto correspondiente.
            </p>
            <Link href="/servicios/microrrutas-motocarguero/">Conocer el diseño de microrrutas <span aria-hidden="true">→</span></Link>
            <p className={styles.opsCopy}>
              El registro puede hacerse con el protocolo acordado. GREENATICS OPS se incorpora como componente digital independiente cuando se requiere configurar registros, roles o consultas; su acceso y configuración se definen por separado.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.start} aria-labelledby="start-title">
        <div className={`container ${styles.startGrid}`}>
          <div>
            <h2 id="start-title">¿Qué información ayuda a evaluar el servicio?</h2>
          </div>
          <p>
            Zona y puntos de generación; material y método de separación; cantidades por periodo y método
            de estimación; almacenamiento y accesos; horario, destino y criterios de recepción; actores,
            obligaciones y acuerdos existentes. Con eso podemos identificar brechas y definir qué conviene
            medir o confirmar antes de proponer una frecuencia y un alcance operativo.
          </p>
        </div>
      </section>

      <section className={styles.closing} id="conversemos" aria-labelledby="closing-title">
        <div className={`container ${styles.closingInner}`}>
          <div>
            <h2 id="closing-title">Revisemos si la operación puede funcionar en tu contexto.</h2>
            <p>
              Cuéntanos quién genera el material, dónde se recoge y qué destino tienes previsto. El alcance,
              la capacidad y las condiciones del servicio se confirman para cada operación.
            </p>
          </div>
          <div className={styles.closingActions}>
            <Link className="button button--light" href="/contacto/?servicio=recoleccion-tratamiento&perfil=municipio">Soy municipio o ESP <span aria-hidden="true">→</span></Link>
            <Link className="button button--outline-light" href="/contacto/?servicio=recoleccion-tratamiento&perfil=empresa">Soy empresa o gran generador <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
