import type { Metadata } from "next";
import Link from "next/link";
import { publicSite } from "@/data/public-site";
import styles from "../company-public.module.css";

export const metadata: Metadata = {
  title: "Contacto | Greenatics",
  description: "Agenda una conversación con Greenatics sobre Wondergreen, residuos orgánicos, proyectos territoriales, plantas y soluciones empresariales.",
};

const preparation = [
  {
    audience: "Agro / Wondergreen",
    title: "Cultivo y nutrición",
    items: ["Cultivo y etapa", "Área o número de plantas", "Objetivo o problema observado", "Análisis disponibles y manejo reciente"],
  },
  {
    audience: "Empresas",
    title: "Residuos orgánicos",
    items: ["Tipo y origen del residuo", "Volumen aproximado y frecuencia", "Ubicación", "Separación actual y principal dificultad"],
  },
  {
    audience: "Municipios / ESP",
    title: "Proyecto territorial",
    items: ["Municipio o área de servicio", "Generadores y rutas actuales", "Infraestructura existente", "Objetivo, etapa y restricciones conocidas"],
  },
];

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}><div className={`${styles.container} ${styles.headerInner}`}><Link href="/" aria-label="Greenatics, inicio"><img className={styles.logo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" /></Link><nav className={styles.nav} aria-label="Navegación pública"><Link href="/soluciones">Soluciones</Link><Link href="/proyectos">Proyectos</Link><Link href="/impacto">Impacto</Link><Link href="/wondergreen">Wondergreen</Link><Link href="/nosotros">Nosotros</Link></nav><Link className={`${styles.button} ${styles.primary}`} href="/app">Acceder a Greenatics</Link></div></header>

      <main>
        <section className={styles.contactHero}><div className={`${styles.container} ${styles.contactGrid}`}><div><span className={styles.eyebrow} style={{color:"#c8f5ad"}}>Contacto Greenatics</span><h1>Cuéntanos qué quieres transformar.</h1><p className={styles.lead}>Podemos hablar de Wondergreen, gestión de residuos, proyectos municipales, plantas, rehabilitación, operación o soluciones para grandes generadores.</p></div><aside className={styles.contactPanel}><span>Reunión técnica</span><h2>Agenda directamente con el equipo.</h2><p>La conversación funciona mejor cuando llegamos con contexto mínimo. Usa la guía inferior y trae lo que ya tengas; no necesitas tener toda la información resuelta.</p><a className={`${styles.button} ${styles.primary}`} href={publicSite.bookingUrl} target="_blank" rel="noreferrer">Agendar reunión</a></aside></div></section>

        <section className={`${styles.section} ${styles.white}`}><div className={styles.container}><div className={styles.sectionHead}><span className={styles.eyebrow}>Antes de la reunión</span><h2>Cuatro datos pueden ahorrar mucho tiempo.</h2><p>No es un formulario obligatorio. Es una lista corta para que la primera conversación llegue más rápido al problema real.</p></div><div className={styles.prepGrid}>{preparation.map((group,index)=><article className={styles.prep} key={group.audience}><span>{String(index+1).padStart(2,"0")} · {group.audience}</span><h3>{group.title}</h3><ul>{group.items.map((item)=><li key={item}>{item}</li>)}</ul></article>)}</div></div></section>

        <section className={`${styles.section} ${styles.soft}`}><div className={`${styles.container} ${styles.officeGrid}`}><div><span className={styles.eyebrow}>Dónde estamos</span><h2>Medellín, Colombia.</h2><p className={styles.lead}>La sede pública se conserva como punto de referencia corporativo; los proyectos y operaciones pueden desarrollarse en otros territorios según su alcance.</p></div><aside className={styles.officeCard}><strong>{publicSite.office.line1}</strong><span>{publicSite.office.line2}</span><span>{publicSite.office.city}</span></aside></div></section>

        <section className={styles.section}><div className={styles.container}><div className={styles.sectionHead}><span className={styles.eyebrow}>No sabes por dónde empezar</span><h2>Elige el problema antes que la solución.</h2></div><div className={styles.ecosystem}><Link href="/soluciones/diagnostico-caracterizacion"><strong>Tengo residuos</strong><span>Empezar por caracterización, generación, logística y alternativas.</span></Link><Link href="/wondergreen/cultivos"><strong>Tengo un cultivo</strong><span>Entrar por cultivo, etapa, necesidad y conocimiento Wondergreen.</span></Link><Link href="/soluciones/prefactibilidad"><strong>Tengo un proyecto</strong><span>Madurar la idea antes de comprometer ingeniería o inversión.</span></Link></div><div className={styles.note} style={{marginTop:24}}><strong>Privacidad práctica:</strong> evita incluir datos sensibles, secretos industriales o información personal innecesaria en la primera descripción. Podemos definir después el canal adecuado para documentación técnica.</div></div></section>
      </main>

      <footer className={styles.footer}><div className={`${styles.container} ${styles.footerInner}`}><span>Greenatics · Medellín, Colombia</span><div><Link href="/nosotros">Nosotros</Link> · <Link href="/soluciones">Soluciones</Link> · <Link href="/app">GREENATICS OPS</Link></div></div></footer>
    </div>
  );
}
