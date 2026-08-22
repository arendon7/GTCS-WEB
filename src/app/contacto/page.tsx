import type { Metadata } from "next";
import Link from "next/link";
import { publicSite } from "@/data/public-site";
import { getWondergreenReference } from "@/data/wondergreen-public";
import { ContactContextBuilder } from "./contact-context-builder";
import styles from "./contact-v2.module.css";

export const metadata: Metadata = {
  title: "Contacto | Greenatics",
  description: "Prepara el contexto de tu caso o agenda una conversación con Greenatics sobre residuos, plantas, operación, datos, Wondergreen y proyectos territoriales.",
  alternates: { canonical: "/contacto" },
};

const audienceContent: Record<string, { title: string; lead: string; builder: string }> = {
  esp: {
    title: "Cuéntanos en qué etapa está tu operación.",
    lead: "Podemos empezar por preparación regulatoria, rutas, aprovechamiento, infraestructura, operación, datos o una decisión que todavía no esté suficientemente estructurada.",
    builder: "esp",
  },
  municipio: {
    title: "Cuéntanos qué decisión territorial necesitas estructurar.",
    lead: "PGIRS, proyectos de aprovechamiento, infraestructura existente, prefactibilidad y fortalecimiento del prestador requieren rutas distintas. Empecemos por ubicar el punto real de decisión.",
    builder: "municipio",
  },
  empresa: {
    title: "Cuéntanos cómo gestionas hoy tus residuos.",
    lead: "Podemos revisar línea base, PMIRS, múltiples sedes, orgánicos, gestores, logística, indicadores, tratamiento o trazabilidad sin obligarte a llegar con una solución predeterminada.",
    builder: "empresa",
  },
  ph: {
    title: "Cuéntanos cuántas unidades o sedes quieres organizar.",
    lead: "La conversación puede partir de diagnóstico, PMIRS por unidad, estandarización, información comparable y una lógica de red para seguimiento y decisiones.",
    builder: "ph",
  },
  planta: {
    title: "Cuéntanos sobre la planta que quieres recuperar o mejorar.",
    lead: "Si la infraestructura existe, el primer paso es entender su estado técnico, suministro, proceso, personas, mantenimiento, datos y destino antes de decidir inversión o intervención.",
    builder: "planta",
  },
  wondergreen: {
    title: "Cuéntanos sobre tu cultivo o tu interés en Wondergreen.",
    lead: "Cultivo, etapa, problema, análisis, referencia y canal comercial cambian la conversación. Podemos empezar por contexto técnico o por distribución.",
    builder: "wondergreen",
  },
};

const preparation = [
  ["Organizaciones", "Residuos y gestión", ["Ubicación y tipo de organización", "Qué ocurre hoy", "Datos o diagnósticos disponibles", "Principal decisión pendiente"]],
  ["Plantas / proyectos", "Infraestructura y operación", ["Estado actual de la planta", "Corriente y suministro", "Restricción principal", "Documentos, planos o datos existentes"]],
  ["Agro / Wondergreen", "Cultivo y nutrición", ["Cultivo y etapa", "Área o número de plantas", "Objetivo o problema observado", "Análisis disponibles y manejo reciente"]],
] as const;

const routes = [
  ["01", "ESP / Prestador", "Preparación, rutas, aprovechamiento, infraestructura, operación y datos.", "/contacto?audience=esp", "Preparar conversación"],
  ["02", "Municipio", "PGIRS, proyectos, activos, prefactibilidad y decisiones territoriales.", "/contacto?audience=municipio", "Preparar conversación"],
  ["03", "Empresa", "Diagnóstico, PMIRS, logística, tratamiento y trazabilidad.", "/contacto?audience=empresa", "Preparar conversación"],
  ["04", "Propiedad horizontal / Institución", "Diagnóstico por unidad, PMIRS y lógica de red.", "/contacto?audience=ph", "Preparar conversación"],
  ["05", "Planta / Operador", "Estado técnico, rehabilitación, optimización y dirección.", "/contacto?audience=planta", "Preparar conversación"],
  ["06", "Wondergreen", "Cultivo, producto, soporte técnico o distribución.", "/contacto?audience=wondergreen", "Preparar conversación"],
] as const;

type ContactSearchParams = {
  audience?: string | string[];
  need?: string | string[];
  service?: string | string[];
  source?: string | string[];
  producto?: string | string[];
  cultivo?: string | string[];
  contexto?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeAudience(value: string | undefined) {
  if (!value) return "";
  const normalized = value.toLowerCase();
  if (["esp", "prestador"].includes(normalized)) return "esp";
  if (["municipio", "municipios"].includes(normalized)) return "municipio";
  if (["empresa", "empresas", "company"].includes(normalized)) return "empresa";
  if (["ph", "propiedad-horizontal", "institucion"].includes(normalized)) return "ph";
  if (["planta", "plantas", "operador"].includes(normalized)) return "planta";
  if (["wondergreen", "agro", "productor", "distribuidor", "tecnico"].includes(normalized)) return "wondergreen";
  return "";
}

function normalizeInheritedContext(value: string | undefined) {
  return value?.trim().slice(0, 480) || undefined;
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<ContactSearchParams> }) {
  const query = await searchParams;
  const audience = normalizeAudience(firstParam(query.audience));
  const need = firstParam(query.need) ?? "";
  const service = firstParam(query.service);
  const source = firstParam(query.source);
  const crop = firstParam(query.cultivo);
  const inheritedContext = normalizeInheritedContext(firstParam(query.contexto));
  const productSlug = firstParam(query.producto);
  const product = productSlug ? getWondergreenReference(productSlug) : undefined;
  const contextual = audienceContent[audience];
  const title = contextual?.title ?? (product ? `Cuéntanos el contexto de ${product.name}.` : "Cuéntanos qué quieres resolver.");
  const lead = contextual?.lead ?? "No necesitas conocer el nombre de nuestro servicio. Empieza por la situación actual, la decisión que necesitas tomar y la información que ya existe.";

  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Contacto Greenatics · conversación con contexto</span>
              <h1>{title}</h1>
              <p className={styles.lead}>{lead}</p>
              {(source || service || product || crop || inheritedContext) ? (
                <div className={styles.contextLine} aria-label="Contexto heredado de navegación">
                  {source ? <span><strong>Origen:</strong> {source}</span> : null}
                  {service ? <span><strong>Servicio:</strong> {service}</span> : null}
                  {product ? <span><strong>Producto:</strong> {product.name}{product.formula ? ` ${product.formula}` : ""}</span> : null}
                  {crop ? <span><strong>Cultivo:</strong> {crop}</span> : null}
                  {inheritedContext ? <span><strong>Contexto:</strong> {inheritedContext}</span> : null}
                </div>
              ) : null}
            </div>
            <aside className={styles.bookingPanel}>
              <span>Si ya tienes claro el caso</span>
              <h2>Agenda directamente con el equipo.</h2>
              <p>La reunión sigue disponible como ruta rápida. Si todavía necesitas ordenar el contexto, puedes preparar primero un resumen breve en esta misma página.</p>
              <div className={styles.actions}><a className={`${styles.button} ${styles.light}`} href={publicSite.bookingUrl} target="_blank" rel="noreferrer">Agendar reunión</a></div>
            </aside>
          </div>
        </section>

        {product ? (
          <section className={`${styles.section} ${styles.soft}`} aria-label="Contexto de la consulta Wondergreen">
            <div className={`${styles.container} ${styles.productContext}`}>
              <div><span className={styles.eyebrow}>Referencia identificada</span><h2>{product.name}{product.formula ? ` · ${product.formula}` : ""}</h2><p>Conservamos la referencia para no reiniciar la conversación desde cero. Disponibilidad, versión, dosis y recomendación final siguen dependiendo del contexto real del cultivo o del canal comercial.</p></div>
              <div className={styles.productMeta}><strong>{product.publicStatus}</strong><span>{product.stage}</span><Link href={`/wondergreen/productos/${product.slug}`}>Volver a la ficha →</Link></div>
            </div>
          </section>
        ) : null}

        <section className={`${styles.section} ${styles.white}`} id="preparar" aria-labelledby="builder-title">
          <div className={`${styles.container} ${styles.builderGrid}`}>
            <div className={styles.builderIntro}>
              <span className={styles.eyebrow}>Prepara tu caso</span>
              <h2 id="builder-title">Cuatro datos pueden llevar la conversación mucho más rápido al problema real.</h2>
              <p>Este paso sirve para ordenar el contexto antes de hablar con el equipo. No sustituye un diagnóstico y no intenta recomendar automáticamente un servicio.</p>
              <div className={styles.builderNote}><strong>Privacidad práctica.</strong> Evita incluir secretos industriales, datos personales sensibles o documentación confidencial en este primer resumen. Podemos definir después el canal adecuado para compartir información técnica.</div>
            </div>
            <ContactContextBuilder
              bookingUrl={publicSite.bookingUrl}
              initialAudience={contextual?.builder ?? audience}
              initialNeed={need}
              initialProduct={product ? `${product.name}${product.formula ? ` ${product.formula}` : ""}` : undefined}
              initialCrop={crop}
              initialContext={inheritedContext}
            />
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`} aria-labelledby="routes-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Entradas rápidas</span><h2 id="routes-title">La primera pregunta cambia según quién está tomando la decisión.</h2></div>
              <p>Usamos un mismo punto de contacto, pero no obligamos a un municipio, una empresa, una planta o un productor a explicar su problema con el mismo vocabulario.</p>
            </div>
            <div className={styles.routes}>
              {routes.map(([number, routeTitle, copy, href, cta]) => <article className={styles.route} key={number}><span>{number}</span><h3>{routeTitle}</h3><p>{copy}</p><Link href={href}>{cta} →</Link></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`} aria-labelledby="prep-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Antes de la reunión</span><h2 id="prep-title">No necesitas traer todo. Sí ayuda traer lo que ya existe.</h2></div>
              <p>Los datos exactos cambian según el caso, pero estas tres listas cubren el contexto mínimo que normalmente evita empezar desde cero.</p>
            </div>
            <div className={styles.prepGrid}>
              {preparation.map(([audienceLabel, prepTitle, items], index) => <article className={styles.prep} key={audienceLabel}><span>{String(index + 1).padStart(2, "0")} · {audienceLabel}</span><h3>{prepTitle}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={`${styles.container} ${styles.officeGrid}`}>
            <div><span className={styles.eyebrow}>Dónde estamos</span><h2>Medellín, Colombia.</h2><p className={styles.lead}>La sede pública es un punto de referencia corporativo. Los proyectos, diagnósticos y operaciones pueden desarrollarse en otros territorios según su alcance.</p></div>
            <aside className={styles.officeCard}><strong>{publicSite.office.line1}</strong><span>{publicSite.office.line2}</span><span>{publicSite.office.city}</span></aside>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div><span className={styles.eyebrow}>Si todavía no sabes qué pedir</span><h2>Elige el problema antes que la solución.</h2></div>
            <div><p>La ruta más segura es empezar por el contexto y dejar que el diagnóstico defina qué servicio, herramienta o intervención tiene sentido después.</p><div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href="/soluciones/diagnostico-caracterizacion">Empezar por diagnóstico</Link><Link className={`${styles.button} ${styles.ghost}`} href="/soluciones">Explorar soluciones</Link></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
