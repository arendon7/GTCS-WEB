import Link from "next/link";
import styles from "../company-public.module.css";

export default function CasaJardinPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Greenatics · próxima línea</span>
              <h1>Casa y Jardín.</h1>
              <p className={styles.lead}>
                Estamos preparando un espacio para soluciones Greenatics y Wondergreen pensadas para plantas, huertas, jardín y autocultivo en casa.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen">Conocer Wondergreen</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/biblioteca">Explorar conocimiento</Link>
              </div>
            </div>
            <aside className={styles.officeCard}>
              <span>Próximamente</span>
              <strong>Este espacio ya hace parte de la arquitectura pública.</strong>
              <span>Los kits, presentaciones, coberturas, precios y contenidos se publicarán únicamente cuando queden definidos y validados.</span>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <span className={styles.eyebrow}>Espacio reservado</span>
              <h2>Primero consolidamos la oferta. Luego abrimos la tienda.</h2>
              <p>
                Por ahora esta sección funciona como puerta de entrada futura. No publicamos productos, promesas, dosis ni precios provisionales.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
