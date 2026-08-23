import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import styles from "../solutions.module.css";
import refresh from "../solutions-refresh.module.css";

export const metadata: Metadata = {
  title: "Valorización y desarrollo de productos | Greenatics",
  description: "Ruta técnica, documental y comercial para convertir salidas del tratamiento en productos con especificaciones, control, documentación y condiciones de comercialización definidas.",
  alternates: { canonical: "/soluciones/valorizacion-productos" },
};

const deliverables = [
  "especificación técnica preliminar o definitiva según la madurez del producto",
  "matriz de parámetros de calidad y controles requeridos",
  "dossier documental del producto y sus soportes disponibles",
  "ruta regulatoria, de registro o certificación cuando resulte aplicable",
  "criterios de presentación, etiquetado y empaque dentro del alcance contratado",
  "plan de validación, producción piloto o escalamiento cuando corresponda",
  "matriz de preparación comercial para llevar el producto a una condición vendible",
];

const activities = [
  "caracterizar la corriente o salida del proceso y definir su condición técnica actual",
  "identificar usos potenciales y restricciones sin convertir hipótesis en claims comerciales",
  "definir especificaciones, formulación o acondicionamiento cuando aplique",
  "estructurar controles de calidad, trazabilidad de lote y documentación de producción",
  "organizar ensayos, análisis de laboratorio o validaciones requeridas dentro del proyecto",
  "estructurar la ruta de registros, permisos o certificaciones aplicables sin atribuir a Greenatics facultades de autoridad o certificador",
  "conectar producto, presentación, documentación técnica y estrategia comercial de lanzamiento",
];

export default function ValorizationProductSolutionPage() {
  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Soluciones", path: "/soluciones" },
        { name: "Valorización y desarrollo de productos", path: "/soluciones/valorizacion-productos" },
      ]} />
      <main>
        <section className={styles.detailHero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={styles.container}>
            <div className={styles.breadcrumb}><Link href="/soluciones">Soluciones</Link><span>→</span><span>Valorización</span></div>
            <div className={styles.detailGrid}>
              <div>
                <span className={styles.eyebrow}>Plantas · Operadores · Empresas · Proyectos</span>
                <h1>Convertir una salida del proceso en un producto técnicamente preparado para vender.</h1>
                <p className={styles.detailLead}>Acompañamos la ruta desde la caracterización y especificación hasta la documentación, controles, presentación y preparación regulatoria o comercial que correspondan al producto.</p>
                <div className={styles.actions}>
                  <a className={`${styles.button} ${styles.primary}`} href="#entregables">Ver entregables</a>
                  <Link className={styles.button} href="/contacto">Evaluar un producto</Link>
                </div>
              </div>
              <aside className={styles.detailAside}>
                <span>Problema de partida</span>
                <strong>Producir un material no significa que exista todavía un producto vendible.</strong>
                <p>La valorización exige separar la existencia física del material de su especificación, calidad, trazabilidad, soporte técnico, condición regulatoria, presentación y posibilidad real de comercialización.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.detailBody}>
          <div className={styles.container}>
            <div className={styles.detailColumns}>
              <article className={styles.listBox} id="entregables">
                <span className={styles.detailIndex}>01</span>
                <div><span className={styles.eyebrow}>Resultado contratado</span><h2>Qué recibe</h2><ul>{deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </article>
              <article className={styles.listBox}>
                <span className={styles.detailIndex}>02</span>
                <div><span className={styles.eyebrow}>Actividades y alcance</span><h2>Qué hacemos</h2><ul>{activities.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </article>
            </div>

            <aside className={styles.detailAside}>
              <span>Truth Lock</span>
              <strong>Greenatics no presenta como aprobado, certificado o eficaz aquello que todavía está en validación.</strong>
              <p>Registros, certificaciones, autorizaciones y resultados de laboratorio dependen de las autoridades, organismos o laboratorios competentes. Los beneficios agronómicos, ambientales o de desempeño solo se publican al nivel que permita la evidencia disponible.</p>
            </aside>

            <div className={styles.detailCta}>
              <div><span className={styles.eyebrow}>Siguiente paso</span><h3>Definir qué material existe hoy y qué condición comercial se quiere alcanzar.</h3><p>La ruta puede iniciar en una caracterización, una formulación ya desarrollada, un producto en trámite o una referencia comercial existente. El alcance se diseña desde ese punto real, no desde una etapa obligatoria de diagnóstico.</p></div>
              <Link className={`${styles.button} ${styles.primary}`} href="/contacto">Hablar con Greenatics</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
