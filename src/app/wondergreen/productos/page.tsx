import type { Metadata } from "next";
import Link from "next/link";
import { bioinputReferences, compostReferences, liquidFertilizers, solidFertilizers } from "@/data/wondergreen-public";
import styles from "./catalog.module.css";

export const metadata: Metadata = {
  title: "Productos Wondergreen | Portafolio técnico",
  description: "Explora fertilizantes sólidos y líquidos, compost y bioinsumos Wondergreen con estado técnico y comercial visible.",
  alternates: { canonical: "/wondergreen/productos" },
};

const groups = [
  { id: "solidos", number: "01", title: "Sólidos organominerales", copy: "Referencias para suelo, crecimiento, balance, floración y producción según versión técnica vigente.", items: solidFertilizers },
  { id: "liquidos", number: "02", title: "Fertilizantes líquidos", copy: "Formatos líquidos organizados por familia y objetivo, con condición comercial explícita.", items: liquidFertilizers },
  { id: "compost", number: "03", title: "Compost y suelo", copy: "Materia orgánica y acondicionamiento dentro de programas que empiezan por la condición del suelo.", items: compostReferences },
  { id: "bioinsumos", number: "04", title: "Bioinsumos", copy: "Microorganismos, inoculantes y extractos botánicos con estado técnico/regulatorio visible por referencia.", items: bioinputReferences },
] as const;

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

        <nav className={styles.jumpNav} aria-label="Familias del portafolio">
          <div className={styles.container}>{groups.map((group) => <a key={group.id} href={`#${group.id}`}>{group.number} · {group.title}</a>)}</div>
        </nav>

        {groups.map((group) => (
          <section className={styles.group} id={group.id} key={group.id}>
            <div className={styles.container}>
              <div className={styles.groupHeading}>
                <span>{group.number}</span>
                <div><h2>{group.title}</h2><p>{group.copy}</p></div>
              </div>
              <div className={styles.productGrid}>
                {group.items.map((item) => (
                  <Link className={styles.productCard} href={`/wondergreen/productos/${item.slug}`} key={item.slug}>
                    <div className={styles.cardTop}><span>{item.publicStatus}</span><small>{item.format}</small></div>
                    <div className={styles.identity}><strong>{item.family}</strong>{item.formula ? <em>{item.formula}</em> : null}</div>
                    <h3>{item.name}</h3>
                    <p>{item.role}</p>
                    <div className={styles.cardBottom}><span>{item.stage}</span><strong>Ver ficha →</strong></div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}

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
