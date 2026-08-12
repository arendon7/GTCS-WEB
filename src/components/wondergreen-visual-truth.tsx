import { productAssetPolicies } from "@/data/public-assets";
import styles from "./wondergreen-visual-truth.module.css";

export function WondergreenVisualTruth() {
  return (
    <section className={styles.section} aria-labelledby="wondergreen-visual-truth-title">
      <div className={styles.inner}>
        <div>
          <span className={styles.eyebrow}>Veracidad visual</span>
          <h2 className={styles.title} id="wondergreen-visual-truth-title">Un empaque real debe corresponder al producto real.</h2>
          <p className={styles.count}>{productAssetPolicies.length} referencias bajo registro visual</p>
        </div>
        <div>
          <p className={styles.copy}>Wondergreen no utiliza imágenes generadas o empaques de otra presentación para completar un catálogo. Si todavía no contamos con el activo exacto reconciliado, preferimos una representación neutral hasta validar referencia, formulación, presentación y versión de etiqueta.</p>
          <div className={styles.rules}>
            <div className={styles.rule}><strong>Misma referencia</strong><span>La imagen debe pertenecer a la familia y producto mostrados.</span></div>
            <div className={styles.rule}><strong>Misma presentación</strong><span>Un envase de 20 L no representa automáticamente un SKU de 1 L.</span></div>
            <div className={styles.rule}><strong>Versión aprobada</strong><span>Artes históricos o de desarrollo permanecen fuera de slots comerciales actuales.</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
