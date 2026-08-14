import type { Metadata } from "next";
import Link from "next/link";
import { publicResources } from "@/data/public-resources";
import styles from "./library.module.css";

export const metadata: Metadata = {
  title: "Biblioteca | Greenatics",
  description: "Guías, programas por cultivo, manuales y herramientas técnicas de Greenatics y Wondergreen convertidas en conocimiento navegable.",
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
    kicker: "Veo síntomas",
    title: "Quiero entender una posible deficiencia.",
    copy: "Empieza por tejido afectado, patrón del lote y posibles confundidores antes de asumir que el problema se resuelve con fertilización.",
    href: "/biblioteca/guia-deficiencias",
    cta: "Revisar síntomas",
  },
  {
    number: "03",
    kicker: "Estoy revisando una recomendación",
    title: "Quiero comprobar si tengo suficiente contexto.",
    copy: "Revisa suelo, etapa, densidad, historial de fertilización y objetivo productivo antes de cerrar una decisión nutricional.",
    href: "/biblioteca/criterios-nutricionales",
    cta: "Comprobar criterios",
  },
  {
    number: "04",
    kicker: "Voy a aplicar Wondergreen",
    title: "Necesito preparar y registrar bien la aplicación.",
    copy: "Confirma referencia, condiciones, equipo, vía de aplicación, registro y seguimiento sin convertir el manual en una receta universal.",
    href: "/biblioteca/manual-uso-wondergreen",
    cta: "Abrir manual de uso",
  },
  {
    number: "05",
    kicker: "Quiero comparar referencias",
    title: "Necesito ver el Product Master público.",
    copy: "Consulta familias, fórmulas, formatos, estado público y relación con el sistema Wondergreen desde la fuente gobernada.",
    href: "/wondergreen/productos",
    cta: "Ver Product Master",
  },
  {
    number: "06",
    kicker: "La información no alcanza",
    title: "Necesito escalar a una conversación técnica.",
    copy: "Cuando faltan análisis, contexto del lote o una referencia clara, la salida correcta es pedir soporte antes de improvisar una recomendación.",
    href: "/contacto#wondergreen",
    cta: "Pedir acompañamiento",
  },
] as const;

export default function LibraryPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Greenatics · conocimiento aplicado</span>
              <h1>La biblioteca no es un archivo. Es parte de la decisión.</h1>
              <p className={styles.lead}>Guías, manuales y conocimiento técnico se convierten en rutas web conectadas con cultivos, productos, síntomas, evidencia y acompañamiento.</p>
            </div>
            <aside className={styles.warning}>
              <strong>Conocimiento antes que recomendación.</strong>
              <p>Una página técnica debe ayudar a formular mejores preguntas. Cuando la información no alcanza, la salida correcta es pedir análisis o escalar a un asesor.</p>
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
              <h2>De documentos aislados a un sistema de conocimiento.</h2>
              <p>Cada recurso se conecta con el Product Master, una ruta agronómica o una decisión concreta. El estado visible evita presentar como definitivo lo que todavía requiere validación.</p>
            </div>
            <div className={styles.libraryGrid}>
              {publicResources.map((resource) => (
                <article className={styles.libraryCard} key={resource.id}>
                  <div className={styles.resourceMeta}>
                    <span className={styles.status}>{resource.statusLabel}</span>
                    <small className={styles.delivery}>{resource.delivery === "web-native" ? "Lectura web disponible" : "Lectura web disponible · descarga pública en preparación"}</small>
                  </div>
                  <h3>{resource.title}</h3>
                  <p>{resource.copy}</p>
                  <Link href={resource.href}>{resource.cta} →</Link>
                </article>
              ))}
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
              <article className={styles.ruleCard}><span>01</span><h3>Diagnosticar</h3><p>Revisa síntomas, lote, suelo y posibles confundidores.</p></article>
              <article className={styles.ruleCard}><span>02</span><h3>Entender etapa</h3><p>Ubica el momento fisiológico y el objetivo productivo.</p></article>
              <article className={styles.ruleCard}><span>03</span><h3>Aplicar con criterio</h3><p>Confirma referencia, vía, equipo, condiciones y registro.</p></article>
              <article className={styles.ruleCard}><span>04</span><h3>Medir y ajustar</h3><p>Observa respuesta y usa evidencia para decidir el siguiente evento.</p></article>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Biblioteca Greenatics</span><h2>¿Buscas una guía para un cultivo específico?</h2></div>
            <div className={styles.closingActions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/cultivos">Ver cultivos</Link>
              <Link className={`${styles.button} ${styles.secondary}`} href="/contacto#wondergreen">Hablar con un asesor</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
