import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { ProductCatalogBrowser } from "./product-catalog-browser";
import styles from "./catalog.module.css";

export const metadata: Metadata = {
  title: "Productos Wondergreen | Portafolio técnico y comercial",
  description: "Explora fertilizantes sólidos y líquidos Wondergreen por línea, formulación, presentación, estado comercial y documentación pública vinculada.",
  alternates: { canonical: "/wondergreen/productos" },
};

export default function WondergreenProductsPage() {
  const contactContext = "Quiero revisar una referencia, presentación o condición comercial de Wondergreen.";

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Wondergreen", path: "/wondergreen" },
        { name: "Productos", path: "/wondergreen/productos" },
      ]} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · Productos</span>
              <h1>Productos concretos, formulación por formulación.</h1>
              <p className={styles.lead}>Empieza por las referencias con estado comercial confirmado y abre cada producto para revisar formulación, presentaciones, condición comercial, cultivos relacionados y documentos oficiales. Las referencias técnicas o en desarrollo permanecen separadas y explícitamente identificadas.</p>
            </div>
            <aside className={styles.router}>
              <strong>¿Quieres entender primero la familia?</strong>
              <p>2Grow, 2Balance, 2Bloom y 2Fruit tienen una identidad visual propia. Puedes entrar por la línea y después bajar a la formulación exacta. Si todavía no sabes cuál revisar, usa el Finder.</p>
              <Link href="/wondergreen/lineas">Explorar líneas de producto →</Link>
              <Link href="/wondergreen/finder">Encontrar mi programa →</Link>
            </aside>
          </div>
        </section>

        <ProductCatalogBrowser />

        <section className={styles.knowledge}>
          <div className={`${styles.container} ${styles.knowledgeGrid}`}>
            <div><span className={styles.eyebrow}>Producto + documentación</span><h2>Profundiza hasta el documento oficial.</h2><p>La web explica y conecta. Los PDF aprobados conservan su diseño, contenido y condición de documento público de referencia.</p></div>
            <div className={styles.knowledgeLinks}>
              <Link href="/wondergreen/lineas"><strong>Líneas Wondergreen</strong><span>→</span></Link>
              <Link href="/biblioteca"><strong>Biblioteca técnica</strong><span>→</span></Link>
              <Link href="/biblioteca/manual-uso-wondergreen"><strong>Manual de uso Wondergreen</strong><span>→</span></Link>
              <Link href="/biblioteca/criterios-nutricionales"><strong>Criterios nutricionales</strong><span>→</span></Link>
              <Link href="/wondergreen/cultivos"><strong>Programas y guías por cultivo</strong><span>→</span></Link>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}><div><span className={styles.eyebrow}>Wondergreen</span><h2>¿Quieres confirmar una referencia, presentación o condición comercial?</h2></div><Link className={styles.button} href={`/contacto?audience=wondergreen&source=wondergreen-productos&contexto=${encodeURIComponent(contactContext)}`}>Hablar con Greenatics</Link></div>
        </section>
      </main>
    </div>
  );
}