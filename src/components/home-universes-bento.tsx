import Image from "next/image";
import Link from "next/link";
import styles from "./home-service-shortlist.module.css";
import { serviceVisuals, type ServiceVisual } from "@/data/service-visuals";

const audiences = [
  {
    label: "Municipios y empresas de servicios públicos",
    title: "Del PGIRS a un servicio que pueda ponerse en marcha.",
    description:
      "Con el municipio y la ESP conectamos planeación, rutas selectivas, infraestructura y acompañamiento operativo. Junto con Auteco Mobility desarrollamos una configuración sobre base Ceronte, con contenedor diseñado por Greenatics para apoyar la recolección selectiva de orgánicos.",
    image: "/projects/routes/motocarguero-verde-operacion-real.webp",
    alt: "Representación de una configuración sobre base Ceronte desarrollada con Auteco Mobility, con contenedor verde diseñado por Greenatics para el sector aseo.",
    imageNote: "Base Ceronte · contenedor verde Greenatics",
    href: "/municipios/",
    cta: "Ver soluciones municipales",
  },
  {
    label: "Organizaciones y grandes generadores",
    title: "Ordenar residuos y responsabilidades en cada sede.",
    description:
      "Diseñamos el PMIRS y lo traducimos en separación, almacenamiento, logística interna y aprovechamiento para unidades residenciales, centros comerciales, instituciones, empresas y otros grandes generadores.",
    image: "/services/pmirs-generators-editorial.jpg",
    alt: "Equipo revisa la separación de residuos en un espacio de una organización.",
    imageNote: "Gestión por sede",
    href: "/empresas/",
    cta: "Ver soluciones para organizaciones",
  },
  {
    label: "Agroindustria y valorización",
    title: "Encontrar una ruta viable para cada corriente.",
    description:
      "Caracterizamos biomasa, subproductos y efluentes. Contrastamos composición, volumen, logística y escala para orientar qué alternativas de tratamiento o valorización vale la pena estudiar.",
    image: "/services/agroindustry-biomass-editorial.jpg",
    alt: "Profesionales revisan subproductos orgánicos en un entorno agroindustrial.",
    imageNote: "Análisis de biomasa",
    href: "/agroindustria/",
    cta: "Explorar soluciones agroindustriales",
  },
] as const;

const services = [
  {
    slug: "diagnostico-residuos",
    title: "Diagnóstico de residuos",
    description: "Aforos, muestreo y balance de masa ayudan a estimar generación, composición y contaminantes. Así puedes priorizar rutas y alternativas con supuestos documentados.",
    href: "/servicios/diagnostico-residuos/",
  },
  {
    slug: "microrrutas-motocarguero",
    title: "Microrrutas selectivas",
    description: "Georreferenciamos fuentes y contrastamos vías, accesos, carga útil y ventanas de recepción para definir trazado, frecuencias y variables de un posible piloto.",
    href: "/servicios/microrrutas-motocarguero/",
  },
  {
    slug: "plantas-modulares",
    title: "Plantas y sistemas",
    description: "Comparamos corriente, predio, servicios disponibles y capacidad local antes de avanzar de prefactibilidad a factibilidad e ingeniería. Cada fase define su nivel de detalle.",
    href: "/servicios/plantas-modulares/",
  },
  {
    slug: "operacion-delegada",
    title: "Operación de plantas",
    description: "Acordamos quién ejecuta, supervisa y responde. El alcance precisa turnos, rutinas, mantenimiento, seguridad e informes de seguimiento.",
    href: "/servicios/operacion-delegada/",
  },
] as const;

const homeServiceVisualOverrides: Partial<Record<keyof typeof serviceVisuals, ServiceVisual>> = {
  "microrrutas-motocarguero": {
    src: "/services/microroutes-collection-editorial-v01.jpg",
    alt: "Dos operarios transfieren residuos orgánicos separados a un contenedor móvil en una calle residencial de ladera.",
    caption: "Generadores, accesos y recepción definen el recorrido.",
  },
};

export function HomeUniversesBento() {
  return (
    <section className="home-system-map" aria-labelledby="system-map-title">
      <div className="container">
        <div className="home-system-map__heading">
          <div>
            <h2 id="system-map-title">Entendemos <span className="home-editorial-accent">la operación</span> antes de diseñar la solución.</h2>
          </div>
          <div className="home-system-map__promise">
            <p>
              Trabajamos con municipios y ESP, organizaciones y grandes generadores, y proyectos
              agroindustriales. Primero entendemos sus corrientes, logística y capacidades; después
              definimos qué planear, implementar u operar.
            </p>
            <Link href="/servicios/">
              Ver servicios y entregables <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="home-audience-paths" aria-label="Servicios según el tipo de operación">
          {audiences.map((audience) => (
            <article className="home-audience-path home-audience-path--compact" key={audience.label}>
              <figure className="home-audience-path__media">
                <Image
                  src={audience.image}
                  alt={audience.alt}
                  fill
                  sizes="(max-width: 680px) 100vw, (max-width: 980px) 50vw, 42vw"
                />
                <figcaption>{audience.imageNote}</figcaption>
              </figure>
              <div className="home-audience-path__body">
                <span className="home-audience-path__label">{audience.label}</span>
                <h3>{audience.title}</h3>
                <p>{audience.description}</p>
                <div className="home-audience-path__actions">
                  <Link href={audience.href}>
                    {audience.cta} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div id="home-service-shortlist" className={styles.root} aria-labelledby="home-service-shortlist-title">
          <div className={styles.heading}>
            <h3 id="home-service-shortlist-title">Servicios para llevar el plan a la <span className={styles.headingAccent}>operación</span></h3>
            <p>Desde caracterizar corrientes y comparar rutas hasta evaluar infraestructura y coordinar la operación, cada servicio ayuda a resolver una decisión concreta del proyecto.</p>
          </div>
          <div className={styles.grid}>
            {services.map((service) => {
              const visual =
                homeServiceVisualOverrides[service.slug as keyof typeof serviceVisuals] ??
                serviceVisuals[service.slug as keyof typeof serviceVisuals];
              return (
                <article className={styles.card} key={service.title}>
                  <Link className={styles.media} href={service.href} aria-label={`Explorar ${service.title}`}>
                    <Image
                      src={visual.src}
                      alt={visual.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1020px) 50vw, 25vw"
                    />
                    <span className={styles.mediaCaption}>{visual.caption}</span>
                  </Link>
                  <div className={styles.body}>
                    <h4>{service.title}</h4>
                    <p>{service.description}</p>
                    <Link className={styles.cardLink} href={service.href}>
                      Conocer el servicio <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <div className={styles.footer}>
            <p>Estas capacidades se ajustan al tipo de corriente, el territorio y la etapa del proyecto.</p>
            <Link href="/servicios/">
              Explorar más servicios <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
