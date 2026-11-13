import Image from "next/image";
import Link from "next/link";
import { digitalTools, isLocalRuntime } from "@/data/digital-tools";
import { runtimeLink, runtimeLinks } from "@/lib/runtime-links";

const huellaAccessHref = runtimeLink(
  runtimeLinks.huella ? `${runtimeLinks.huella}/login` : "",
  "/acceso/#calcula-tu-huella",
);
const huellaAccessIsLocal = isLocalRuntime(huellaAccessHref);

const tools = digitalTools.filter((tool) => tool.code !== "CO₂");

export function HomeToolsBridge() {
  return (
    <section className="home-tools-bridge" aria-labelledby="home-tools-title">
      <div className="container">
        <div className="home-tools-bridge__heading">
          <div>
            <h2 id="home-tools-title">Herramientas para convertir información en <span className="home-editorial-accent">decisiones.</span></h2>
          </div>
          <p>
            Cada una responde a un trabajo concreto: organizar una planta, llevar un plan al
            territorio, seguir lo que ocurre en un cultivo o preparar un proyecto productivo.
            Explora la muestra que más se acerca a tu necesidad y conoce su alcance.
          </p>
        </div>

        <article className="home-huella-feature" aria-labelledby="home-huella-title">
          <div className="home-huella-feature__copy">
            <span className="home-huella-feature__category">Back 2 Green · inventario corporativo GEI</span>
            <h3 id="home-huella-title">Back 2 Green: inventario corporativo, a tu ritmo y con acompañamiento.</h3>
            <p>
              Tu equipo registra fuentes, actividades y soportes con base en GHG Protocol. Avanza por
              etapas y recibe orientación profesional para revisar datos y decisiones metodológicas.
              Cuando aplique el ROE, la organización conserva la responsabilidad de verificar y
              presentar su reporte.
            </p>
            <ul className="home-huella-feature__signals" aria-label="Qué encontrarás en Back 2 Green">
              <li>Alcances 1, 2 y 3</li>
              <li>Registro de fuentes y evidencias</li>
              <li>Recorrido por etapas con apoyo profesional</li>
            </ul>
            <div className="home-huella-feature__offer">
              <strong>Huella Esencial · $450.000 COP al año</strong>
              <span>Incluye 4 horas de acompañamiento profesional.</span>
              <small>Promoción anual para Negocios Verdes de Corantioquia. Consulta vigencia y condiciones.</small>
            </div>
            <div className="home-huella-feature__actions">
              <Link className="button button--primary" href="/huella/">
                Ver método, planes y precios
              </Link>
              <a
                className="home-huella-feature__direct-link"
                href={huellaAccessHref}
                target={huellaAccessHref.startsWith("http") ? "_blank" : undefined}
                rel={huellaAccessHref.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {huellaAccessIsLocal ? "Entrar a la plataforma local" : "Entrar a la plataforma"} <span aria-hidden="true">↗</span>
              </a>
              {huellaAccessIsLocal ? (
                <small className="home-huella-feature__runtime-note">
                  Requiere que Back 2 Green esté iniciado en este equipo.
                </small>
              ) : null}
            </div>
          </div>
          <figure className="home-huella-feature__screen">
            <Image
              src="/tools/huella/dashboard.png"
              alt="Vista de muestra del panel de Back 2 Green con datos sintéticos de inventario y seguimiento."
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <figcaption>
              <strong>Un proceso que tu equipo puede recorrer.</strong>
              <span>Captura de demostración; presenta datos ficticios.</span>
            </figcaption>
          </figure>
        </article>

        <div className="home-tools-bridge__other-heading">
          <div>
            <h3>También puedes explorar estas experiencias</h3>
          </div>
          <Link href="/herramientas/">Ver todas las herramientas <span aria-hidden="true">→</span></Link>
        </div>
        <p className="home-tools-bridge__image-note">Explora herramientas complementarias para operación, territorio y productividad agrícola.</p>
        <nav className="home-tools-bridge__list" aria-label="Otras herramientas Greenatics">
          {tools.map((tool) => (
            <Link className={`home-tool-link home-tool-link--${tool.code.toLowerCase()}`} href={tool.publicHref} key={tool.code}>
              <figure className="home-tool-link__media">
                {tool.image ? <Image src={tool.image} alt={tool.imageAlt ?? ""} fill sizes="(max-width: 760px) 100vw, 25vw" /> : null}
              </figure>
              <span className="home-tool-link__content">
                <span className="home-tool-link__kind">{tool.homeKind}</span>
                <strong>{tool.name}</strong>
                <span className="home-tool-link__title">{tool.homeTitle}</span>
                <small>{tool.homeSummary}</small>
                <span className="home-tool-link__action">
                  {tool.homeAction} <span aria-hidden="true">↗</span>
                </span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
