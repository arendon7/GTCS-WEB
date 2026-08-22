import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicResourceMasterAudit } from "@/data/public-resource-master-audits";
import { publicResources, type PublicResource } from "@/data/public-resources";
import styles from "./resources-v2.module.css";

export const metadata: Metadata = {
  title: "Recursos | Greenatics",
  description: "Biblioteca técnica, proyectos documentados, impacto, guías, programas por cultivo y herramientas de Greenatics y Wondergreen reunidas para tomar mejores decisiones.",
  alternates: { canonical: "/biblioteca" },
};

const resourceUniverses = [
  {
    number: "01",
    title: "Biblioteca técnica",
    copy: "Guías, Product Master, programas por cultivo, Casa & Jardín, criterios nutricionales y manuales para consultar o llevar al campo.",
    href: "#biblioteca",
    cta: "Explorar biblioteca",
  },
  {
    number: "02",
    title: "Proyectos / casos",
    copy: "Experiencia documentada con contexto, periodo y alcance. Los casos muestran aprendizajes transferibles sin convertir evidencia histórica en resultados vigentes.",
    href: "/proyectos",
    cta: "Ver casos",
  },
  {
    number: "03",
    title: "Impacto",
    copy: "Indicadores y resultados solo cuando cuentan con fuente, periodo, metodología y aprobación para publicación.",
    href: "/impacto",
    cta: "Ver impacto",
  },
] as const;

const intentRoutes = [
  { number: "01", kicker: "Tengo un cultivo", title: "Quiero orientar el programa según la etapa.", copy: "Entra por café, cacao, aguacate, limón Tahití o pastos y revisa momentos, objetivos, cautelas, alertas y seguimiento.", href: "/wondergreen/cultivos", cta: "Elegir cultivo" },
  { number: "02", kicker: "Tengo plantas en casa", title: "Quiero entender qué etapa necesita mi planta.", copy: "Casa, Jardín y Vivero organiza suelo, crecimiento, equilibrio, floración y fructificación con diagnóstico orientativo y guías prácticas.", href: "/casa-jardin", cta: "Abrir Casa & Jardín" },
  { number: "03", kicker: "Veo síntomas", title: "Quiero entender una posible deficiencia.", copy: "Empieza por tejido afectado, patrón del lote y posibles confundidores antes de asumir que el problema se resuelve con fertilización.", href: "/biblioteca/guia-deficiencias", cta: "Revisar síntomas" },
  { number: "04", kicker: "Estoy revisando una recomendación", title: "Quiero comprobar si tengo suficiente contexto.", copy: "Revisa suelo, etapa, densidad, historial de fertilización y objetivo productivo antes de cerrar una decisión nutricional.", href: "/biblioteca/criterios-nutricionales", cta: "Comprobar criterios" },
  { number: "05", kicker: "Voy a aplicar Wondergreen", title: "Necesito preparar y registrar bien la aplicación.", copy: "Confirma referencia, condiciones, equipo, vía de aplicación, registro y seguimiento desde el manual de uso.", href: "/biblioteca/manual-uso-wondergreen", cta: "Abrir manual de uso" },
  { number: "06", kicker: "Quiero comparar referencias", title: "Necesito ver el Product Master público.", copy: "Consulta familias, fórmulas, formatos, estado público y relación con el sistema Wondergreen desde la fuente gobernada.", href: "/wondergreen/productos", cta: "Ver Product Master" },
  { number: "07", kicker: "Quiero el material completo", title: "Necesito catálogo y guías descargables.", copy: "Descarga el catálogo Wondergreen y las guías completas por cultivo directamente desde la biblioteca.", href: "#biblioteca", cta: "Ir a descargas" },
] as const;

const method = [
  ["01", "Diagnosticar", "Revisa síntomas, lote, planta, suelo o sustrato y posibles confundidores."],
  ["02", "Entender", "Ubica etapa, condición, contexto y objetivo antes de elegir una ruta."],
  ["03", "Aplicar", "Usa la guía completa y la información vigente de la referencia para ejecutar."],
  ["04", "Medir y ajustar", "Observa respuesta y usa evidencia para decidir el siguiente evento."],
] as const;

function getDeliveryLabel(resource: PublicResource) {
  if (resource.delivery === "public-download") return "Lectura web + PDF disponible";
  if (resource.delivery === "web-native") return "Lectura web disponible";
  const audit = getPublicResourceMasterAudit(resource.id);
  if (audit?.status === "pending") return "Lectura web disponible · PDF maestro pendiente";
  return "Lectura web disponible";
}

function getMasterNotice(resource: PublicResource) {
  const audit = getPublicResourceMasterAudit(resource.id);
  if (audit?.status === "pending") return "El recurso web está disponible; el binario descargable todavía no está publicado.";
  return null;
}

export default function LibraryPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero} aria-labelledby="resources-title">
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Recursos Greenatics · conocimiento + evidencia</span>
              <h1 id="resources-title">Conocimiento, casos y evidencia para decidir mejor.</h1>
              <p className={styles.lead}>Recursos reúne la biblioteca técnica de Greenatics y Wondergreen con proyectos documentados e impacto gobernado. La idea no es acumular PDFs: es ayudarte a encontrar el contexto, la evidencia o la guía que necesitas para la siguiente decisión.</p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.primary}`} href="#biblioteca">Explorar biblioteca</a>
                <Link className={`${styles.button} ${styles.ghost}`} href="/proyectos">Ver proyectos</Link>
              </div>
            </div>
            <aside className={styles.heroLedger}>
              <span>Una sola entrada · tres capas</span>
              <strong>Aprender, comprobar y transferir experiencia.</strong>
              <p>La biblioteca explica. Los proyectos documentan experiencia. Impacto publica únicamente lo que puede sostenerse con una fuente y un periodo.</p>
              <div className={styles.ledgerRows}>
                <div className={styles.ledgerRow}><span>01</span><div><strong>Biblioteca</strong><small>guías · manuales · Product Master</small></div></div>
                <div className={styles.ledgerRow}><span>02</span><div><strong>Casos</strong><small>contexto · evidencia · aprendizajes</small></div></div>
                <div className={styles.ledgerRow}><span>03</span><div><strong>Impacto</strong><small>fuente · periodo · metodología</small></div></div>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.universes} aria-labelledby="resource-universes-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Tres capas de recursos</span><h2 id="resource-universes-title">No todo recurso cumple la misma función.</h2></div>
              <p>Una guía orienta una decisión. Un caso prueba experiencia documentada. Un indicador resume un resultado bajo reglas de publicación. Separarlos hace que la evidencia sea más útil y menos ambigua.</p>
            </div>
            <div className={styles.universeGrid}>
              {resourceUniverses.map((item) => (
                <article className={styles.universeCard} key={item.number}>
                  <span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p>
                  {item.href.startsWith("#") ? <a href={item.href}>{item.cta} →</a> : <Link href={item.href}>{item.cta} →</Link>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.router} aria-labelledby="library-router-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Empieza por tu decisión</span><h2 id="library-router-title">No necesitas conocer el nombre del recurso.</h2></div>
              <p>Elige qué estás tratando de resolver y entra por cultivo, hogar, síntomas, recomendación, producto o descarga.</p>
            </div>
            <div className={styles.intentList}>
              {intentRoutes.map((route) => {
                const content = <><span className={styles.intentNumber}>{route.number}</span><small className={styles.intentKicker}>{route.kicker}</small><div><h3>{route.title}</h3><p>{route.copy}</p></div><strong>{route.cta} →</strong></>;
                return route.href.startsWith("#") ? <a className={styles.intentRow} href={route.href} key={route.number}>{content}</a> : <Link className={styles.intentRow} href={route.href} key={route.number}>{content}</Link>;
              })}
            </div>
          </div>
        </section>

        <section className={styles.library} id="biblioteca" aria-labelledby="library-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Biblioteca técnica</span><h2 id="library-title">Guías que puedes leer, usar y descargar.</h2></div>
              <p>La lectura web y los PDFs se complementan. Las piezas con material editorial publicado muestran su portada y acceso directo; los maestros aún pendientes se señalan sin fabricar descargas.</p>
            </div>
            <div className={styles.libraryGrid}>
              {publicResources.map((resource) => {
                const masterNotice = getMasterNotice(resource);
                return (
                  <article className={styles.resourceCard} key={resource.id}>
                    {resource.coverImage ? <div className={styles.resourceVisual}><Image src={resource.coverImage} alt={`Portada de ${resource.title}`} width={640} height={905} sizes="(max-width: 640px) 88vw, (max-width: 900px) 42vw, 28vw" unoptimized /></div> : null}
                    <div className={styles.resourceMeta}><span className={styles.status}>{resource.statusLabel}</span><small className={styles.delivery}>{getDeliveryLabel(resource)}</small></div>
                    <h3>{resource.title}</h3>
                    <p>{resource.copy}</p>
                    {resource.masterLabel ? <small className={styles.masterNotice}>Maestro: {resource.masterLabel}</small> : null}
                    {masterNotice ? <small className={styles.masterNotice}>{masterNotice}</small> : null}
                    <div className={styles.resourceActions}>
                      <Link href={resource.href}>{resource.cta} →</Link>
                      {resource.downloadHref ? <a className={styles.downloadAction} href={resource.downloadHref} target="_blank" rel="noreferrer">{resource.downloadLabel ?? "Descargar PDF"} ↓</a> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.method} aria-labelledby="resource-method-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Cómo usar la biblioteca</span><h2 id="resource-method-title">Diagnosticar → entender → aplicar → medir.</h2></div>
              <p>La navegación ayuda a encontrar la decisión correcta y el documento permite llevar el material completo al campo, al equipo o al cliente.</p>
            </div>
            <div className={styles.methodFlow}>{method.map(([number,title,copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div><span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Recursos Greenatics</span><h2>¿Necesitas una guía, un caso o una conversación técnica?</h2></div>
            <div><p>Puedes entrar por la biblioteca, revisar proyectos documentados o llevar un problema concreto al equipo Greenatics.</p><div className={styles.actions}><Link className={`${styles.button} ${styles.light}`} href="/contacto">Hablar con nosotros</Link><Link className={`${styles.button} ${styles.ghost}`} href="/proyectos">Ver casos</Link></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
