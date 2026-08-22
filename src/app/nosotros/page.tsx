import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPrimaryProjectMedia } from "@/data/public-media";
import styles from "./about-v2.module.css";

export const metadata: Metadata = {
  title: "Nosotros | Greenatics",
  description: "Greenatics conecta gestión de residuos, ingeniería, procesos biológicos, operación, productos agrícolas y datos para construir sistemas que funcionen en condiciones reales.",
  alternates: { canonical: "/nosotros" },
};

const capabilities = [
  ["Gestión y planeación", "Diagnóstico, caracterización, PMIRS, PGIRS, separación, rutas y decisiones antes de comprometer infraestructura."],
  ["Ingeniería y plantas", "Prefactibilidad, rehabilitación, optimización, compostaje, digestión anaerobia y puesta en marcha según el contexto."],
  ["Dirección y operación", "Protocolos, personas, mantenimiento, calidad, inventarios, coordinación y mejora continua sin asumir que Greenatics debe operar todo directamente."],
  ["Valorización y agro", "Wondergreen conecta suelo, nutrición organomineral, líquidos, compost, bioinsumos, conocimiento y desarrollo de destinos para materiales aprovechados."],
  ["Tecnología y datos", "GREENATICS OPS y futuras herramientas digitales convierten actividades, lotes, activos, evidencias e indicadores en información utilizable."],
] as const;

const method = [
  ["01", "Diagnosticar", "Entender generación, operación, restricciones, infraestructura, datos y decisión pendiente."],
  ["02", "Definir ruta", "Separar lo urgente, lo necesario y lo que todavía requiere validación antes de invertir."],
  ["03", "Implementar", "Traducir el diagnóstico en actividades, protocolos, ingeniería, logística o herramientas concretas."],
  ["04", "Acompañar", "Dirigir, medir y corregir sin confundir seguimiento técnico con una obligación de operar todos los activos."],
  ["05", "Mejorar y valorizar", "Usar la evidencia para optimizar el sistema y encontrar mejores destinos para los recursos recuperados."],
] as const;

const principles = [
  ["Entender antes de dimensionar", "Una tecnología correcta para la corriente equivocada sigue siendo una mala solución. La línea base gobierna la siguiente decisión."],
  ["Diseñar pensando en operar", "Una planta necesita suministro, personas, procedimientos, mantenimiento, control y salida de producto; no solo equipos."],
  ["Separar evidencia de promesa", "Una foto, una capacidad nominal o una característica técnica no se convierten automáticamente en un resultado vigente o universal."],
  ["Medir para mejorar", "Recepciones, impropios, lotes, proceso, mantenimiento, producto e inventario deben producir información útil para decidir."],
] as const;

const ecosystem = [
  ["Soluciones", "/soluciones", "Diagnóstico, planeación, regulación, rutas, plantas, operación, datos y valorización."],
  ["Wondergreen", "/wondergreen", "Suelo, nutrición, biología, productos, cultivos y acompañamiento técnico."],
  ["Casa & Jardín", "/casa-jardin", "Una entrada doméstica por observación, seguridad y etapa, todavía sin ecommerce activo."],
  ["Recursos", "/biblioteca", "Biblioteca técnica, proyectos documentados e impacto publicado con gobierno."],
  ["GREENATICS OPS", "/app", "La capa digital donde una operación activa puede registrar y convertir actividad en evidencia."],
] as const;

export default function AboutPage() {
  const yarumal = getPrimaryProjectMedia("yarumal");

  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Greenatics · economía circular aplicada</span>
              <h1>Diseñamos sistemas que tienen que funcionar en la vida real.</h1>
              <p className={styles.lead}>Greenatics conecta gestión de residuos, ingeniería, procesos biológicos, operación, productos agrícolas y datos para desarrollar soluciones que puedan implementarse, medirse y mejorar.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/soluciones">Ver soluciones</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/biblioteca">Ver recursos y experiencia</Link>
              </div>
            </div>
            {yarumal ? (
              <figure className={styles.heroVisual}>
                <Image src={yarumal.src} alt={yarumal.alt} fill sizes="(max-width: 1020px) 100vw, 48vw" priority />
                <figcaption className={styles.heroCaption}><span>Trabajo documentado</span><strong>Yarumal · evidencia real de proyecto</strong></figcaption>
              </figure>
            ) : null}
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`} aria-labelledby="capabilities-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Qué problemas sabemos trabajar</span><h2 id="capabilities-title">La capacidad está en conectar disciplinas que normalmente se manejan por separado.</h2></div>
              <p>Podemos intervenir una fase puntual o articular varias cuando la decisión depende de cómo se relacionan generación, logística, infraestructura, operación, producto y datos.</p>
            </div>
            <div className={styles.capabilities}>
              {capabilities.map(([title, copy], index) => (
                <article className={styles.capability} key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`} id="como-trabajamos" aria-labelledby="method-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Cómo trabajamos</span><h2 id="method-title">Diagnóstico primero. Después una ruta que pueda ejecutarse.</h2></div>
              <p>No vendemos una tecnología como respuesta universal. La secuencia permite separar lo que sabemos, lo que falta comprobar y lo que realmente conviene hacer después.</p>
            </div>
            <div className={styles.method}>
              {method.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`} aria-labelledby="principles-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Criterio de trabajo</span><h2 id="principles-title">La ingeniería, la operación y la comunicación necesitan el mismo estándar de verdad.</h2></div>
              <p>Estos principios gobiernan tanto un diagnóstico como una propuesta, una planta, un producto o una cifra pública.</p>
            </div>
            <div className={styles.principles}>
              {principles.map(([title, copy], index) => <article className={styles.principle} key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`} aria-labelledby="evidence-title">
          <div className={`${styles.container} ${styles.evidenceGrid}`}>
            {yarumal ? <div className={styles.evidenceMedia}><Image src={yarumal.src} alt={yarumal.alt} fill sizes="(max-width: 1020px) 100vw, 45vw" /></div> : null}
            <div className={styles.evidenceCopy}>
              <span className={styles.eyebrow}>Experiencia que se puede explicar</span>
              <h2 id="evidence-title">Un caso sirve cuando deja aprendizaje transferible, no cuando solo deja una foto.</h2>
              <p>Los proyectos publicados separan periodo, alcance, evidencia visual y aprendizaje. Una fotografía histórica no se presenta como prueba automática del estado operativo actual.</p>
              <div className={styles.truth}><strong>Truth lock.</strong> La experiencia pública se documenta con contexto suficiente para distinguir antecedente, capacidad, resultado y estado vigente.</div>
              <div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href="/proyectos">Ver proyectos y casos</Link><Link className={`${styles.button} ${styles.ghost}`} href="/impacto">Ver impacto gobernado</Link></div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`} aria-labelledby="ecosystem-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Ecosistema Greenatics</span><h2 id="ecosystem-title">Una empresa. Varias capas que se alimentan entre sí.</h2></div>
              <p>La operación genera información; la información mejora el criterio; los proyectos producen aprendizaje; y ese aprendizaje vuelve a soluciones, productos y nuevas decisiones.</p>
            </div>
            <div className={styles.ecosystem}>
              {ecosystem.map(([title, href, copy]) => <Link href={href} key={title}><strong>{title}</strong><span>{copy}</span><b>Explorar →</b></Link>)}
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div><span className={styles.eyebrow}>Siguiente paso</span><h2>Si el problema es complejo, empecemos por ordenarlo.</h2></div>
            <div><p>Cuéntanos qué decisión necesitas tomar y qué información ya existe. Podemos empezar por diagnóstico, una ruta técnica o una conversación exploratoria.</p><div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href="/contacto?source=nosotros">Hablar con nosotros</Link><Link className={`${styles.button} ${styles.ghost}`} href="/soluciones/diagnostico-caracterizacion">Empezar por diagnóstico</Link></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
