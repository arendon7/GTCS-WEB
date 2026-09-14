import type { Metadata } from "next";
import Link from "next/link";
import { runtimeLinks } from "@/lib/runtime-links";
import "./plataforma-v4.css";

export const metadata: Metadata = {
  title: "Centro de plataformas y aplicaciones",
  description:
    "Centro único de acceso a las plataformas Greenatics: OPS, Calcula tu Huella, GREENATICS Red, AGROWAY y SANA.",
  alternates: { canonical: "/plataforma/" },
};

const applications = [
  {
    code: "SANA",
    state: "Ecosistema en estructuración",
    name: "SANA",
    copy: "El ecosistema que articula inversión y proyectos productivos con datos de trazabilidad de AGROWAY, ciencia Greenatics, soluciones Wondergreen y acompañamiento de campo.",
    route: "/sana/",
    cta: "Conocer SANA",
    accent: "sana",
    scope: "Inversión · proyectos productivos · resultados",
  },
  {
    code: "OPS",
    state: "Demo pública disponible",
    name: "GREENATICS OPS",
    copy: "La estación para registrar la jornada, controlar recepciones, procesos, activos, inventario y reportes de planta.",
    route: "/app/",
    cta: "Abrir estación OPS",
    accent: "ops",
    scope: "Planta · supervisión · dirección",
  },
  {
    code: "CO₂",
    state: "Estimador público disponible",
    name: "Calcula tu Huella",
    copy: "La puerta de entrada a inventarios de emisiones, fuentes, método, escenarios, revisión y evidencia trazable.",
    route: "/huella/",
    cta: "Abrir Calcula tu Huella",
    accent: "carbon",
    scope: "Organizaciones · sostenibilidad · verificación",
  },
  {
    code: "RED",
    state: "Estación navegable v5 · datos demo",
    name: "GREENATICS Red",
    copy: "La estación territorial para convertir contexto, generadores, rutas, FIELD, QA/QC y PMIRS en trabajo coordinado, indicadores y seguimiento con evidencia.",
    route: "/red/app/",
    cta: "Explorar Red",
    accent: "red",
    scope: "Municipios · ESP · equipos territoriales",
  },
  {
    code: "AG",
    state: "Entorno privado en evolución",
    name: "AGROWAY",
    copy: "La aplicación de trazabilidad agrícola: productor, finca, lote, diagnóstico, plan, abastecimiento, ejecución, evidencia, seguimiento y cosecha.",
    route: "/agroway/",
    cta: "Conocer AGROWAY",
    accent: "agro",
    scope: "Trazabilidad · campo · datos",
  },
] as const;

const foundation = [
  ["01", "Una identidad", "Una cuenta y una organización de trabajo, con acceso por rol y contexto."],
  ["02", "Datos relacionados", "Territorio, planta, inventario, proyecto, lote, evidencia e impacto conservan sus vínculos."],
  ["03", "Historial auditable", "Las correcciones agregan versión, autor, fecha y motivo; no borran la fuente original."],
  ["04", "Resultados con estado", "Registrado, validado, interpretado y derivado antes de publicar o decidir."],
] as const;

const configuredRuntimes = [
  ["Calcula tu Huella", runtimeLinks.huella],
  ["GREENATICS OPS", runtimeLinks.ops],
  ["GREENATICS Red", runtimeLinks.red],
] as const;

const isLocalRuntime = (url: string) => /localhost|127\.0\.0\.1/.test(url);

export default function PlatformPage() {
  return (
    <>
      <section className="platform-v4-hero">
        <div className="container platform-v4-hero__grid">
          <div>
            <span className="eyebrow eyebrow--light">Centro Greenatics</span>
            <h1>Un solo lugar para entrar, operar y demostrar.</h1>
            <p className="lead">
              Greenatics reúne sus herramientas bajo una misma lógica: la operación deja evidencia,
              la evidencia mejora la decisión y cada plataforma conserva el contexto que necesita.
              OPS ordena la planta; Red, el territorio; Huella, el inventario ambiental; AGROWAY,
              la trazabilidad agrícola; y SANA, la articulación de proyectos e inversión.
            </p>
            <div className="button-row">
              <Link className="button button--light" href="#aplicaciones">Ver aplicaciones</Link>
              <Link className="button button--outline-light" href="/contacto/?interes=plataformas">Diseñar una implementación</Link>
              <Link className="button button--outline-light" href="/plataforma/usuarios/">Administrar usuarios</Link>
            </div>
            {configuredRuntimes.some(([, url]) => url) && (
              <div className="platform-v4-hero__availability" role="status">
                <span>{configuredRuntimes.every(([, url]) => url && isLocalRuntime(url)) ? "Entorno local" : "Entornos conectados"}</span>
                <strong>{configuredRuntimes.filter(([, url]) => url).map(([name]) => name).join(" · ")}</strong>
                <small>Los accesos abren cada runtime sin mezclar sus permisos ni sus datos.</small>
              </div>
            )}
          </div>
          <aside className="platform-v4-hero__signal" aria-label="Estado de la consolidación">
            <span>Arquitectura Greenatics</span>
            <strong>Un ecosistema, varias experiencias.</strong>
            <div className="platform-v4-hero__signal-line"><i /><span>Identidad</span><i /><span>Datos</span><i /><span>Decisión</span></div>
            <p>La consolidación será progresiva. Lo que ya funciona se preserva; lo que falta integrar se construye con límites claros.</p>
          </aside>
        </div>
      </section>

      <section className="platform-v4-apps" id="aplicaciones">
        <div className="container">
          <div className="platform-v4-heading">
            <div><span className="eyebrow">Aplicaciones y productos</span><h2>Cada herramienta tiene una tarea distinta.</h2></div>
            <p>El centro organiza las entradas y hace visible el papel de cada capa. No convierte una demo en producción ni mezcla permisos entre organizaciones: cada aplicación conserva su alcance y evoluciona hacia una plataforma común. AGROWAY registra y relaciona datos de campo; SANA los usa junto con Greenatics y Wondergreen para estructurar y acompañar proyectos productivos.</p>
          </div>
          <div className="platform-v4-apps__grid">
            {applications.map((application) => {
              const configuredUrl = application.code === "OPS"
                ? runtimeLinks.ops
                : application.code === "CO₂"
                  ? runtimeLinks.huella
                  : application.code === "RED"
                    ? runtimeLinks.red
                    : "";
              const href = configuredUrl || application.route;
              const cta = configuredUrl
                ? `Abrir ${application.code === "CO₂" ? "Calcula tu Huella" : application.code === "RED" ? "Red" : "OPS"}`
                : application.cta;
              const state = configuredUrl
                ? isLocalRuntime(configuredUrl) ? "Runtime local disponible" : "Runtime conectado"
                : application.state;

              return (
                <article className={`platform-v4-card platform-v4-card--${application.accent}`} key={application.code}>
                  <div className="platform-v4-card__top"><span>{application.code}</span><small>{state}</small></div>
                  <h3>{application.name}</h3>
                  <p>{application.copy}</p>
                  <div className="platform-v4-card__scope">{application.scope}</div>
                  <Link className="text-link" href={href}>{cta} <span aria-hidden="true">↗</span></Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="platform-v4-foundation">
        <div className="container">
          <div className="platform-v4-heading platform-v4-heading--light">
            <div><span className="eyebrow eyebrow--light">Lo que se comparte</span><h2>La plataforma común no significa una base sin límites.</h2></div>
            <p>Compartir seguridad, hosting y contexto exige separar correctamente organizaciones, roles, datos sensibles y dominios de negocio.</p>
          </div>
          <div className="platform-v4-foundation__grid">
            {foundation.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="platform-v4-roadmap">
        <div className="container platform-v4-roadmap__grid">
          <div><span className="eyebrow">Ruta de consolidación</span><h2>Primero el acceso. Después la integración profunda.</h2></div>
          <ol>
            <li><span>01</span><div><strong>Portal único</strong><p>Entradas consistentes, estados honestos y navegación entre productos.</p></div></li>
            <li><span>02</span><div><strong>Identidad y permisos</strong><p>Organizaciones, roles, sesiones seguras, auditoría y recuperación controlada.</p></div></li>
            <li><span>03</span><div><strong>Servicios y datos</strong><p>OPS, Huella y AGROWAY se conectan mediante contratos explícitos; SANA recibe el contexto autorizado para estructurar y acompañar proyectos, sin copiar datos ni romper sus migraciones.</p></div></li>
            <li><span>04</span><div><strong>Red productiva</strong><p>El prototipo navegable pasa a Proyecto 360, FIELD, QA/QC, PMIRS y coordinación con backend persistente.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="platform-v4-note"><div className="container"><strong>Estado actual:</strong> este centro y sus recorridos públicos ya viven en la web Greenatics. La unificación de autenticación, base de datos y despliegue productivo es el siguiente trabajo de ingeniería, no una conexión simulada.</div></section>
    </>
  );
}
