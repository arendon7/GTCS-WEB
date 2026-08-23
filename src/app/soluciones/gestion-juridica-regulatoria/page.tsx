import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { publicSocialMetadata } from "@/lib/public-social-metadata";
import styles from "../solutions.module.css";
import refresh from "../solutions-refresh.module.css";

const title = "Gestión jurídica y regulatoria | Greenatics";
const description = "Asesoría jurídica y regulatoria para estructurar responsabilidades, instrumentos, contratos, trámites y decisiones asociadas a residuos, aseo y proyectos de aprovechamiento.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/soluciones/gestion-juridica-regulatoria" },
  ...publicSocialMetadata({ title, description, path: "/soluciones/gestion-juridica-regulatoria" }),
};

const deliverables = [
  "matriz de obligaciones, competencias y responsables según el alcance",
  "conceptos, memorandos o documentos jurídicos para la decisión requerida",
  "ruta de actuaciones, soportes y trámites aplicables",
  "documentos contractuales o instrumentos de coordinación cuando formen parte del encargo",
  "checklist regulatorio para seguimiento y cierre de pendientes",
];

const activities = [
  "lectura del marco jurídico aplicable al actor, territorio, corriente y servicio involucrado",
  "revisión de PGIRS, PMIRS y otros instrumentos desde su dimensión jurídica cuando corresponda",
  "análisis de responsabilidades entre municipio, ESP, generador, operador, gestor, contratista y terceros",
  "apoyo en estructuración contractual y distribución de riesgos y obligaciones",
  "acompañamiento documental frente a registros, reportes, permisos o actuaciones administrativas incluidos en el alcance",
  "soporte en asuntos tarifarios y regulatorios de aseo cuando el encargo lo requiera",
];

export default function RegulatoryLegalSolutionPage() {
  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Soluciones", path: "/soluciones" },
        { name: "Gestión jurídica y regulatoria", path: "/soluciones/gestion-juridica-regulatoria" },
      ]} />
      <main>
        <section className={styles.detailHero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={styles.container}>
            <div className={styles.breadcrumb}><Link href="/soluciones">Soluciones</Link><span>→</span><span>Jurídica y regulación</span></div>
            <div className={styles.detailGrid}>
              <div>
                <span className={styles.eyebrow}>ESP · Municipios · Empresas · Operadores</span>
                <h1>Gestión jurídica y regulatoria para residuos, aseo y proyectos.</h1>
                <p className={styles.detailLead}>Estructuramos actividades, responsabilidades y documentos frente al marco aplicable al alcance, para que la decisión técnica tenga una ruta jurídica clara y ejecutable.</p>
                <div className={styles.actions}>
                  <a className={`${styles.button} ${styles.primary}`} href="#entregables">Ver entregables</a>
                  <Link className={styles.button} href="/contacto">Plantear el caso</Link>
                </div>
              </div>
              <aside className={styles.detailAside}>
                <span>Problema de partida</span>
                <strong>Una solución técnica puede fracasar si no están claras las competencias, obligaciones y relaciones contractuales.</strong>
                <p>La asesoría jurídica se integra al proyecto cuando hay decisiones regulatorias, instrumentos territoriales o internos, trámites, tarifas, contratos o responsabilidades que deben ordenarse antes o durante la ejecución.</p>
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
              <span>Límite de responsabilidad</span>
              <strong>Greenatics estructura y acompaña; no sustituye a la autoridad competente ni garantiza decisiones administrativas.</strong>
              <p>Permisos, registros, conceptos, certificaciones, adopciones, aprobaciones o resultados frente a autoridades dependen del procedimiento aplicable, de la documentación y de la decisión de cada entidad competente. Su gestión se incluye únicamente cuando el contrato lo establezca.</p>
            </aside>

            <div className={styles.detailCta}>
              <div><span className={styles.eyebrow}>Siguiente paso</span><h3>Definir el problema jurídico y el resultado que necesita el proyecto.</h3><p>Si el asunto ya está identificado, podemos estructurar directamente el alcance. Si todavía existen vacíos de información, la revisión documental inicial se incorpora como actividad de trabajo y no como sustituto del servicio.</p></div>
              <Link className={`${styles.button} ${styles.primary}`} href="/contacto">Hablar con Greenatics</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
