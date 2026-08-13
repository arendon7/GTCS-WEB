import type { Metadata } from "next";
import Link from "next/link";
import { publicSite } from "@/data/public-site";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contacto | Greenatics",
  description: "Agenda una conversación con Greenatics sobre Wondergreen, residuos orgánicos, proyectos territoriales, plantas y soluciones empresariales.",
  alternates: { canonical: "/contacto" },
};

const preparation = [
  { audience: "Agro / Wondergreen", title: "Cultivo y nutrición", items: ["Cultivo y etapa", "Área o número de plantas", "Objetivo o problema observado", "Análisis disponibles y manejo reciente"] },
  { audience: "Empresas", title: "Residuos orgánicos", items: ["Tipo y origen del residuo", "Volumen aproximado y frecuencia", "Ubicación", "Separación actual y principal dificultad"] },
  { audience: "Municipios / ESP", title: "Proyecto territorial", items: ["Municipio o área de servicio", "Generadores y rutas actuales", "Infraestructura existente", "Objetivo, etapa y restricciones conocidas"] },
];

const routes = [
  ["01", "Tengo residuos", "Empezar por caracterización, generación, logística y alternativas.", "/soluciones/diagnostico-caracterizacion"],
  ["02", "Tengo un cultivo", "Entrar por cultivo, etapa, necesidad y conocimiento Wondergreen.", "/wondergreen/cultivos"],
  ["03", "Tengo un proyecto", "Madurar la idea antes de comprometer ingeniería o inversión.", "/soluciones/prefactibilidad"],
];

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div><span className={styles.eyebrow}>Contacto Greenatics</span><h1>Cuéntanos qué quieres transformar.</h1><p className={styles.lead}>Podemos hablar de Wondergreen, gestión de residuos, proyectos municipales, plantas, rehabilitación, operación o soluciones para grandes generadores.</p></div>
            <aside className={styles.contactPanel}><span>Reunión técnica</span><strong>Agenda directamente con el equipo.</strong><p>La conversación funciona mejor cuando llegamos con contexto mínimo. Usa la guía inferior y trae lo que ya tengas; no necesitas tener toda la información resuelta.</p><a className={styles.booking} href={publicSite.bookingUrl} target="_blank" rel="noreferrer">Agendar reunión</a></aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>Antes de la reunión</span><h2>Cuatro datos pueden ahorrar mucho tiempo.</h2><p>No es un formulario obligatorio. Es una lista corta para que la primera conversación llegue más rápido al problema real.</p></div>
            <div className={styles.prepList}>{preparation.map((group,index)=><article key={group.audience}><span className={styles.index}>{String(index+1).padStart(2,"0")}</span><div><span className={styles.audience}>{group.audience}</span><h3>{group.title}</h3></div><ul>{group.items.map((item)=><li key={item}>{item}</li>)}</ul></article>)}</div>
          </div>
        </section>

        <section className={styles.office}>
          <div className={`${styles.container} ${styles.officeGrid}`}>
            <div><span className={styles.eyebrow}>Dónde estamos</span><h2>Medellín, Colombia.</h2><p>La sede pública se conserva como punto de referencia corporativo; los proyectos y operaciones pueden desarrollarse en otros territorios según su alcance.</p></div>
            <aside className={styles.officeCard}><span>Punto de referencia corporativo</span><strong>{publicSite.office.line1}</strong><small>{publicSite.office.line2}</small><small>{publicSite.office.city}</small></aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}><span className={styles.eyebrow}>No sabes por dónde empezar</span><h2>Elige el problema antes que la solución.</h2></div>
            <div className={styles.routeList}>{routes.map(([number,title,copy,href])=><Link href={href} key={title}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div><em>Continuar →</em></Link>)}</div>
            <div className={styles.privacy}><strong>Privacidad práctica.</strong><p>Evita incluir datos sensibles, secretos industriales o información personal innecesaria en la primera descripción. Podemos definir después el canal adecuado para documentación técnica.</p></div>
          </div>
        </section>
      </main>
    </div>
  );
}
