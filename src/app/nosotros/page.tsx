import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "../company-public.module.css";

export const metadata: Metadata = {
  title: "Nosotros | Greenatics",
  description: "Greenatics conecta gestión de residuos orgánicos, ingeniería, operación, Wondergreen y datos para construir sistemas de economía circular aplicados.",
};

const capabilities = [
  ["Gestión", "Diagnóstico, planeación, separación, rutas selectivas y trazabilidad desde el generador."],
  ["Ingeniería", "Prefactibilidad, plantas, rehabilitación, compostaje, digestión anaerobia y puesta en marcha."],
  ["Operación", "Personas, protocolos, mantenimiento, calidad, inventarios, coordinación y mejora continua."],
  ["Agro", "Wondergreen conecta suelo, fertilizantes organominerales, líquidos, compost, bioinsumos y conocimiento por cultivo."],
  ["Datos", "GREENATICS OPS convierte actividades, lotes, activos, inventarios e indicadores en evidencia utilizable."],
];

const cycle = [
  ["01", "Residuo", "Quién lo genera, cuánto, cómo se separa y qué problema produce."],
  ["02", "Sistema", "Logística, infraestructura, biología, personas y recursos trabajan juntos."],
  ["03", "Recurso", "El tratamiento busca recuperar valor material y, cuando aplica, energético."],
  ["04", "Retorno", "Productos y soluciones agrícolas permiten devolver parte del valor al ciclo productivo."],
  ["05", "Evidencia", "La capa digital documenta qué entró, qué ocurrió y cuál fue su destino."],
];

const principles = [
  ["Entender antes de dimensionar", "La línea base gobierna la ingeniería; una tecnología correcta para la corriente equivocada sigue siendo una mala solución."],
  ["Diseñar pensando en operar", "Una planta necesita suministro, personas, procedimientos, mantenimiento, control y salida de producto; no solo equipos."],
  ["Cerrar el ciclo", "El aprovechamiento cobra sentido cuando materia orgánica, nutrientes y otros recursos recuperados encuentran un destino controlado."],
  ["Empezar, consolidar y escalar", "Preferimos madurar proyectos por etapas y usar evidencia real para justificar la siguiente decisión."],
  ["Medir para mejorar", "Recepciones, impropios, lotes, proceso, mantenimiento, productos e inventarios deben convertirse en información útil."],
];

const ecosystem = [
  ["Soluciones", "/soluciones", "Planeación, recolección, infraestructura, operación y datos."],
  ["Proyectos", "/proyectos", "Casos documentados, aprendizajes y contexto de publicación."],
  ["Wondergreen", "/wondergreen", "Suelo, nutrición, biología y acompañamiento técnico."],
  ["Impacto", "/impacto", "Indicadores gobernados antes de volverse cifras públicas."],
  ["Biblioteca", "/biblioteca", "Guías por cultivo, deficiencias y conocimiento aplicado."],
  ["GREENATICS OPS", "/app", "La superficie interna donde la operación genera evidencia."],
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}><div className={`${styles.container} ${styles.heroGrid}`}><div><span className={styles.eyebrow}>Greenatics</span><h1>No somos solo una planta, una consultora ni una marca de fertilizantes.</h1><p className={styles.lead}>Greenatics construye sistemas de economía circular para residuos orgánicos. Conectamos gestión en la fuente, logística, tratamiento biológico, ingeniería, operación, productos agrícolas y datos para que el ciclo pueda funcionar de extremo a extremo.</p><div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href="/soluciones">Ver lo que hacemos</Link><Link className={`${styles.button} ${styles.ghost}`} href="/proyectos">Ver experiencia</Link></div></div><div className={styles.mark}><Image src="/brand/greenatics-symbol.svg" alt="Símbolo Greenatics" width={180} height={180} /></div></div></section>

        <section className={`${styles.section} ${styles.white}`}><div className={styles.container}><div className={styles.sectionHead}><span className={styles.eyebrow}>Cinco capacidades conectadas</span><h2>La ventaja está en trabajar la cadena completa.</h2><p>Podemos intervenir una fase puntual o articular varias cuando el proyecto requiere un sistema integral.</p></div><div className={styles.grid5}>{capabilities.map(([title,copy],index)=><article className={styles.card} key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

        <section className={`${styles.section} ${styles.dark}`}><div className={styles.container}><div className={styles.sectionHead}><span className={styles.eyebrow}>Cómo vemos el ciclo</span><h2>Del residuo a una cadena verificable de valor.</h2></div><div className={styles.cycle}>{cycle.map(([number,title,copy])=><article key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></article>)}</div></div></section>

        <section className={styles.statement}><div className={styles.container}><span className={styles.eyebrow}>Propósito</span><h2>Transformar residuos en vida.</h2><p>Para Greenatics, economía circular no es solamente desviar material de disposición final. Es construir una cadena capaz de recibirlo, transformarlo, recuperar recursos útiles, devolver valor al territorio o al agro y demostrar qué ocurrió mediante información confiable.</p></div></section>

        <section className={styles.section}><div className={styles.container}><div className={styles.sectionHead}><span className={styles.eyebrow}>Cómo tomamos decisiones</span><h2>Principios que orientan los proyectos.</h2></div><div className={styles.principles}>{principles.map(([title,copy],index)=><article className={styles.principle} key={title}><span>{String(index+1).padStart(2,"0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

        <section className={`${styles.section} ${styles.soft}`}><div className={styles.container}><div className={styles.sectionHead}><span className={styles.eyebrow}>Ecosistema Greenatics</span><h2>Una empresa, varias capas que se alimentan entre sí.</h2><p>La operación genera conocimiento; el conocimiento mejora la ingeniería; los proyectos producen nuevos aprendizajes; y Wondergreen conecta parte de ese valor con el agro.</p></div><div className={styles.ecosystem}>{ecosystem.map(([title,href,copy])=><Link href={href} key={title}><strong>{title}</strong><span>{copy}</span></Link>)}</div></div></section>
      </main>
    </div>
  );
}
