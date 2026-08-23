import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicResourceMasterAudit } from "@/data/public-resource-master-audits";
import { publicResources, type PublicResource } from "@/data/public-resources";
import styles from "./resources-v2.module.css";

export const metadata: Metadata = {
  title: "Biblioteca técnica | Greenatics",
  description: "Guías, manuales, criterios, programas por cultivo, Product Master y materiales descargables de Greenatics y Wondergreen con contexto técnico gobernado.",
  alternates: { canonical: "/biblioteca" },
};

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
  ["01", "Entender", "Ubica planta o cultivo, etapa, condición, objetivo y señales observadas antes de buscar una respuesta."],
  ["02", "Comprobar", "Revisa contexto, posibles confundidores, criterios técnicos y la autoridad del recurso que estás consultando."],
  ["03", "Aplicar", "Usa la guía completa y la información vigente de la referencia para preparar y ejecutar el siguiente paso."],
  ["04", "Medir y ajustar", "Registra la respuesta observada y vuelve a la evidencia antes de decidir el siguiente evento."],
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
        <section className={styles.hero} aria-labelledby="library-page-title">
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Biblioteca técnica Greenatics</span>
              <h1 id="library-page-title">Conocimiento técnico para llevar mejores decisiones a la práctica.</h1>
              <p className={styles.lead}>Consulta guías, manuales, criterios, programas por cultivo, Product Master y materiales descargables con una regla común: distinguir orientación, información de producto y evidencia antes de convertir un recurso en una decisión.</p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.primary}`} href="#rutas">Encontrar un recurso</a>
                <Link className={`${styles.button} ${styles.ghost}`} href="/recursos">Ver todos los recursos Greenatics</Link>
              </div>
            </div>
            <aside className={styles.heroLedger}>
              <span>Lectura web + documentos gobernados</span>
              <strong>Un recurso sirve cuando conserva contexto, fuente y siguiente paso.</strong>
              <p>La biblioteca no reemplaza diagnóstico, ficha técnica ni criterio profesional. Organiza conocimiento publicado para que sea más fácil saber qué revisar antes, durante y después de una decisión.</p>
              <div className={styles.ledgerRows}>
                <div className={styles.ledgerRow}><span>01</span><div><strong>Orientación</strong><small>guías · programas · síntomas</small></div></div>
                <div className={styles.ledgerRow}><span>02</span><div><strong>Aplicación</strong><small>manuales · criterios · seguimiento</small></div></div>
                <div className={styles.ledgerRow}><span>03</span><div><strong>Consulta</strong><small>Product Master · catálogo · descargas</small></div></div>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.router} id="rutas" aria-labelledby="library-router-title">
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
              <div><span className={styles.eyebrow}>Cómo usar la biblioteca</span><h2 id="resource-method-title">Entender → comprobar → aplicar → medir.</h2></div>
              <p>La navegación ayuda a encontrar el recurso correcto y cada material mantiene su propio alcance. Una guía orienta; la ficha o Product Master gobierna la referencia; la observación posterior ayuda a decidir qué hacer después.</p>
            </div>
            <div className={styles.methodFlow}>{method.map(([number,title,copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div><span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Más allá de la biblioteca</span><h2>¿Buscas experiencia documentada o resultados publicados?</h2></div>
            <div><p>Los proyectos y los indicadores de impacto viven fuera de la biblioteca para conservar su contexto y sus reglas de evidencia. El hub Recursos reúne esas capas sin mezclarlas con las guías técnicas.</p><div className={styles.actions}><Link className={`${styles.button} ${styles.light}`} href="/recursos">Volver a Recursos</Link><Link className={`${styles.button} ${styles.ghost}`} href="/contacto">Hablar con nosotros</Link></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
