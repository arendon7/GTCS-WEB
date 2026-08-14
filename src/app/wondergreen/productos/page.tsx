import type { Metadata } from "next";
import Link from "next/link";
import { ProductCatalogBrowser } from "./product-catalog-browser";
import styles from "./catalog.module.css";

export const metadata: Metadata = {
  title: "Productos Wondergreen | Portafolio técnico",
  description: "Explora fertilizantes sólidos y líquidos, compost y bioinsumos Wondergreen con estado técnico y comercial visible.",
  alternates: { canonical: "/wondergreen/productos" },
};

export default function WondergreenProductsPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · Product Master público</span>
              <h1>Un portafolio que muestra también lo que todavía debe confirmarse.</h1>
              <p className={styles.lead}>Cada referencia tiene una ficha propia con función, formato, etapa, presentaciones, condición comercial y cautelas. El catálogo separa producto documentado de disponibilidad real.</p>
            </div>
            <aside className={styles.router}>
              <strong>¿No sabes por cuál empezar?</strong>
              <p>Entra por cultivo y etapa. La selección final se ajusta al lote, análisis, agua, manejo y documentación vigente.</p>
              <Link href="/wondergreen/cultivos">Buscar por cultivo →</Link>
            </aside>
          </div>
        </section>

        <ProductCatalogBrowser />

        <section className={styles.knowledge}>
          <div className={`${styles.container} ${styles.knowledgeGrid}`}>
            <div><span className={styles.eyebrow}>Producto + conocimiento</span><h2>La ficha no termina en la fórmula.</h2><p>Wondergreen conecta producto con diagnóstico, cultivo, aplicación y seguimiento.</p></div>
            <div className={styles.knowledgeLinks}>
              <Link href="/biblioteca/manual-uso-wondergreen">Manual de uso <span>→</span></Link>
              <Link href="/biblioteca/criterios-nutricionales">Criterios nutricionales <span>→</span></Link>
              <Link href="/biblioteca/guia-deficiencias">Deficiencias nutricionales <span>→</span></Link>
              <Link href="/wondergreen/cultivos">Programas por cultivo <span>→</span></Link>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}><div><span className={styles.eyebrow}>Wondergreen</span><h2>¿Necesitas confirmar una referencia, presentación o disponibilidad?</h2></div><Link className={styles.button} href="/contacto">Consultar con Greenatics</Link></div>
        </section>
      </main>
    </div>
  );
}
