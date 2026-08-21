import type { Metadata } from "next";
import Link from "next/link";
import { getPublicResourceMasterAudit } from "@/data/public-resource-master-audits";
import { publicResources, type PublicResource } from "@/data/public-resources";
import styles from "./library.module.css";
import refresh from "./library-refresh.module.css";

export const metadata: Metadata = {
  title: "Biblioteca | Greenatics",
  description: "Guías, programas por cultivo, Casa & Jardín, manuales y herramientas técnicas de Greenatics y Wondergreen convertidas en conocimiento navegable.",
};

const intentRoutes = [
  {
    number: "01",
    kicker: "Tengo un cultivo",
    title: "Quiero orientar el programa según la etapa.",
    copy: "Entra por café, cacao, aguacate, limón Tahití o pastos y revisa momentos, objetivos, cautelas, alertas y seguimiento.",
    href: "/wondergreen/cultivos",
    cta: "Elegir cultivo",
  },
  {
    number: "02",
    kicker: "Tengo plantas en casa",
    title: "Quiero entender qué etapa necesita mi planta.",
    copy: "Casa, Jardín y Vivero organiza suelo, crecimiento, equilibrio, floración y fructificación con diagnóstico orientativo y guías prácticas.",
    href: "/casa-jardin",
    cta: "Abrir Casa & Jardín",
  },
  {
    number: "03",
    kicker: "Veo síntomas",
    title: "Quiero entender una posible deficiencia.",
    copy: "Empieza por tejido afectado, patrón del lote y posibles confundidores antes de asumir que el problema se resuelve con fertilización.",
    href: "/biblioteca/guia-deficiencias",
    cta: "Revisar síntomas",
  },
  {
    number: "04",
    kicker: "Estoy revisando una recomendación",
    title: "Quiero comprobar si tengo suficiente contexto.",
    copy: "Revisa suelo, etapa, densidad, historial de fertilización y objetivo productivo antes de cerrar una decisión nutricional.",
    href: "/biblioteca/criterios-nutricionales",
    cta: "Comprobar criterios",
  },
  {
    number: "05",
    kicker: "Voy a aplicar Wondergreen",
    title: "Necesito preparar y registrar bien la aplicación.",
    copy: "Confirma referencia, condiciones, equipo, vía de aplicación, registro y seguimiento sin convertir el manual en una receta universal.",
    href: "/biblioteca/manual-uso-wondergreen",
    cta: "Abrir manual de uso",
  },
  {
    number: "06",
    kicker: "Quiero comparar referencias",
    title: "Necesito ver el Product Master público.",
    copy: "Consulta familias, fórmulas, formatos, estado público y relación con el sistema Wondergreen desde la fuente gobernada.",
    href: "/wondergreen/productos",
    cta: "Ver Product Master",
  },
  {
    number: "07",
    kicker: "La información no alcanza",
    title: "Necesito escalar a una conversación técnica.",
    copy: "Cuando faltan análisis, contexto del lote o una referencia clara, la salida correcta es pedir soporte antes de improvisar una recomendación.",
    href: "/contacto#wondergreen",
    cta: "Pedir acompañamiento",
  },
] as const;

function getDeliveryLabel(resource: PublicResource) {
  if (resource.delivery === "web-native-public-download") return "Lectura web + PDF disponible";
  if (resource.delivery === "web-native") return "Lectura web disponible";
  if (resource.delivery === "web-native-master-pending") return "Lectura web disponible · PDF pendiente de binario público";
  return "Lectura web disponible · descarga pública pendiente";
}

function getMasterNotice(resource: PublicResource) {
  if (!resource.masterLabel || resource.downloadHref) return null;
  const audit = getPublicResourceMasterAudit(resource.id);
  if (audit?.status === "pending") {
    return "El contenido web está disponible; el PDF se añadirá cuando su binario público quede localizado.";
  }
  return null;
}

export default function LibraryPage() {
  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Greenatics · conocimiento aplicado</span>
              <h1>La biblioteca no es un archivo. Es parte de la decisión.</h1>
              <p className={styles.lead}>Guías, manuales y conocimiento técnico se convierten en rutas web conectadas con cultivos, productos, Casa & Jardín, síntomas, evidencia y acompañamiento. Los principales maestros Wondergreen también están disponibles como PDF.</p>
            </div>
            <aside className={styles.warning}>
              <strong>Consulta web o documento completo.</strong>
              <p>Usa la ruta web para navegar por cultivo y producto, o descarga el PDF editorial cuando quieras conservar el material completo.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`} aria-labelledby="library-router-title">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Empieza por tu decisión</span>
              <h2 id="library-router-title">No necesitas conocer el nombre del recurso.</h2>
              <p>Elige qué estás tratando de resolver. La biblioteca te lleva a la ruta técnica más útil y conserva una salida explícita hacia acompañamiento cuando el contexto es insuficiente.</p>
            </div>
            <div className={styles.intentGrid}>
              {intentRoutes.map((route) => (
                <Link className={styles.intentCard} href={route.href} key={route.number}>
                  <span className={styles.intentNumber}>{route.number}</span>
                  <small className={styles.intentKicker}>{route.kicker}</small>
                  <h3>{route.title}</h3>
                  <p>{route.copy}</p>
                  <strong>{route.cta} →</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Recursos disponibles</span>
              <h2>Web navegable y documentos para descargar.</h2>
              <p>Catálogo Wondergreen y cinco guías agrícolas pueden consultarse directamente como PDF, además de sus rutas web. Los recursos de Casa & Jardín mantienen su lectura web mientras localizamos los binarios correspondientes.</p>
            </div>
            <div className={styles.libraryGrid}>
              {publicResources.map((resource) => {
                const masterNotice = getMasterNotice(resource);
                return (
                  <article className={styles.libraryCard} key={resource.id}>
                    <div className={styles.resourceMeta}>
                      <span className={styles.status}>{resource.statusLabel}</span>
                      <small className={styles.delivery}>{getDeliveryLabel(resource)}</small>
                    </div>
                    <h3>{resource.title}</h3>
                    <p>{resource.copy}</p>
                    {resource.masterLabel ? <small className={styles.delivery}>Maestro: {resource.masterLabel}</small> : null}
                    {masterNotice ? <small className={styles.delivery}>{masterNotice}</small> : null}
                    <div className={styles.resourceActions}>
                      <Link href={resource.href}>{resource.cta} →</Link>
                      {resource.downloadHref ? (
                        <a href={resource.downloadHref} download>{resource.downloadCta ?? "Descargar PDF"} ↓</a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Cómo usar la biblioteca</span>
              <h2>Diagnosticar → entender → elegir → aplicar → medir.</h2>
              <p>La navegación debe acompañar la decisión, no obligar al usuario a conocer de antemano el nombre del producto.</p>
            </div>
            <div className={styles.ruleGrid}>
              <article className={styles.ruleCard}><span>01</span><h3>Diagnosticar</h3><p>Revisa síntomas, lote, planta, suelo o sustrato y posibles confundidores.</p></article>
              <article className={styles.ruleCard}><span>02</span><h3>Entender etapa</h3><p>Ubica el momento fisiológico, la condición y el objetivo antes de elegir una ruta.</p></article>
              <article className={styles.ruleCard}><span>03</span><h3>Aplicar con criterio</h3><p>Confirma referencia, vía, equipo, condiciones y registro; en hogar, evita dosificar a ojo.</p></article>
              <article className={styles.ruleCard}><span>04</span><h3>Medir y ajustar</h3><p>Observa respuesta y usa evidencia para decidir el siguiente evento.</p></article>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Biblioteca Greenatics</span><h2>¿Buscas una guía para cultivo o para tus plantas en casa?</h2></div>
            <div className={styles.closingActions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/cultivos">Ver cultivos</Link>
              <Link className={`${styles.button} ${styles.secondary}`} href="/casa-jardin">Casa & Jardín</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
