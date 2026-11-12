import type { Metadata } from "next";
import Link from "next/link";
import "./plataforma-v4.css";

export const metadata: Metadata = {
  title: "Centro Greenatics | herramientas y accesos",
  description: "Compara las herramientas Greenatics, consulta qué recorridos están disponibles o explora un modelo ilustrativo de roles y alcances.",
  alternates: { canonical: "/plataforma/" },
  openGraph: {
    title: "Centro Greenatics | herramientas y accesos",
    description: "Tres rutas para comparar herramientas, consultar condiciones de acceso y explorar un modelo ilustrativo de roles.",
    url: "/plataforma/",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

const nextSteps = [
  {
    number: "01",
    label: "Catálogo",
    title: "Conocer las herramientas",
    copy: "Compara qué resuelve cada aplicación, para quién está pensada y qué recorrido permite explorar.",
    scope: "OPS · Red · Huella · AGROWAY · SANA",
    href: "/herramientas/",
    action: "Comparar herramientas",
    accent: "ops",
  },
  {
    number: "02",
    label: "Accesos",
    title: "Revisar los entornos disponibles",
    copy: "Distingue las demostraciones, los enlaces externos configurados y las condiciones de acceso que deben consultarse para cada herramienta.",
    scope: "Muestras públicas · acceso según herramienta",
    href: "/acceso/#entornos-disponibles",
    action: "Ver muestras y consultar acceso",
    accent: "red",
  },
  {
    number: "03",
    label: "Demostración",
    title: "Conocer el modelo de usuarios",
    copy: "Explora un directorio ficticio y un modelo de roles y alcances. No concede accesos; la administración real requiere un entorno organizacional habilitado.",
    scope: "Ejemplo local · roles · alcances",
    href: "/plataforma/usuarios/",
    action: "Ver demostración del modelo",
    accent: "carbon",
  },
] as const;

export default function PlatformPage() {
  return (
    <>
      <section className="platform-v4-hero">
        <div className="container platform-v4-hero__content">
          <span className="eyebrow eyebrow--light">Centro Greenatics</span>
          <h1>Cada herramienta tiene un trabajo. Elige cómo continuar.</h1>
          <p className="lead">
            Greenatics reúne herramientas para operación, territorio, inventarios ambientales,
            trabajo de campo y proyectos productivos. Desde aquí puedes comparar su alcance,
            consultar cómo explorar cada una o conocer un modelo ilustrativo de roles.
          </p>
        </div>
      </section>

      <section className="platform-v4-apps" aria-labelledby="platform-next-steps-title">
        <div className="container">
          <div className="platform-v4-heading">
            <div>
              <span className="eyebrow">Tu siguiente paso</span>
              <h2 id="platform-next-steps-title">Tres rutas, según lo que necesitas hacer.</h2>
            </div>
            <p>El catálogo compara propósitos; el portal distingue muestras y condiciones de acceso; la tercera ruta ilustra cómo ordenar roles y alcances, sin administrar cuentas.</p>
          </div>
          <div className="platform-v4-apps__grid platform-v4-apps__grid--routes">
            {nextSteps.map((step) => (
              <article className={`platform-v4-card platform-v4-card--${step.accent}`} key={step.number}>
                <div className="platform-v4-card__top"><span>{step.number}</span><small>{step.label}</small></div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
                <div className="platform-v4-card__scope">{step.scope}</div>
                <Link className="text-link" href={step.href}>{step.action} <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
