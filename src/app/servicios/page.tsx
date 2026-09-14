import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { yarumalClaims } from "@/data/claims";
import { services, type ServiceCategory } from "@/data/services";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Servicios Greenatics de diagnóstico, planeación, rutas selectivas, infraestructura, operación y datos para sistemas de residuos orgánicos.",
  alternates: { canonical: "/servicios/" },
};

const categories: ServiceCategory[] = ["Planeación", "Recolección", "Infraestructura", "Operación", "Datos", "Valorización"];

const categoryContent: Record<ServiceCategory, { number: string; title: string; intro: string; decision: string }> = {
  Planeación: {
    number: "01",
    title: "Reducir incertidumbre antes de invertir.",
    intro: "Entender generación, composición, actores, restricciones y alternativas para construir una línea base útil.",
    decision: "Elige esta familia si todavía necesitas saber qué proyecto tiene sentido.",
  },
  Recolección: {
    number: "02",
    title: "Asegurar suministro, calidad y frecuencia.",
    intro: "Conectar generadores y planta mediante separación, microrrutas, capacidad, protocolos y datos de campo.",
    decision: "Elige esta familia si la planta no recibe suficiente material o la logística es costosa.",
  },
  Infraestructura: {
    number: "03",
    title: "Diseñar o recuperar lo que el sistema puede operar.",
    intro: "Traducir el balance de masa y la operación esperada en procesos, espacios, equipos, cantidades y etapas.",
    decision: "Elige esta familia si debes construir, ampliar o rehabilitar infraestructura.",
  },
  Operación: {
    number: "04",
    title: "Convertir infraestructura en resultados repetibles.",
    intro: "Puesta en marcha, procedimientos, dirección técnica, mantenimiento, control de proceso y mejora continua.",
    decision: "Elige esta familia si la infraestructura existe, pero el desempeño no es estable.",
  },
  Datos: {
    number: "05",
    title: "Hacer visible lo que ocurre y por qué.",
    intro: "Trazabilidad de generadores, rutas, recepción, lotes, producto, inventarios, novedades e indicadores.",
    decision: "Elige esta familia si necesitas controlar, demostrar o mejorar la operación.",
  },
  Valorización: {
    number: "06",
    title: "Convertir el resultado ambiental en valor que vuelve al territorio.",
    intro: "Conectar biomasa, tecnología, energía, productos, suelo, cultivos y mercado para cerrar el ciclo con utilidad real.",
    decision: "Elige esta familia si buscas productos, bioenergía, nutrición vegetal o una salida productiva para la biomasa.",
  },
};

const portfolioUniverses = [
  {
    number: "01",
    title: "Soluciones territoriales y empresariales",
    copy: "Diagnóstico, recolección, plantas, bioprocesos, operación, trazabilidad y valorización para municipios, ESP, empresas y agroindustrias.",
    links: [["Ver soluciones", "#planeación"], ["Municipios y ESP", "/municipios/"], ["Empresas", "/empresas/"], ["Agroindustria", "/agroindustria/"]],
  },
  {
    number: "02",
    title: "Wondergreen Agro",
    copy: "Fertilizantes organominerales, bioinsumos y programas de acompañamiento por suelo, cultivo, etapa fisiológica y objetivo productivo.",
    links: [["Explorar Wondergreen", "/wondergreen/"], ["Programas agronómicos", "/servicios/programas-wondergreen/"], ["Ver cultivos", "/wondergreen/cultivos/"]],
  },
  {
    number: "03",
    title: "Wondergreen Casa & Jardín",
    copy: "Soluciones simples y especializadas para plantas de interior, jardines, viveros, huertas urbanas y proyectos educativos.",
    links: [["Ir a Casa & Jardín", "/casa-jardin/"], ["Diagnóstico de plantas", "/diagnostico/"], ["Guías prácticas", "/biblioteca/huertas/"]],
  },
] as const;

const operationModels = [
  ["Operación integral", "Greenatics asume la operación técnica y los componentes definidos en el contrato: equipo, programación, proceso, control, mantenimiento, datos e informes."],
  ["Operación compartida", "Greenatics y la entidad distribuyen responsabilidades operativas mediante una matriz clara, protocolos comunes y seguimiento periódico."],
  ["Dirección y continuidad técnica", "El equipo local opera y Greenatics dirige, registra, capacita, analiza indicadores y conduce la mejora continua."],
] as const;

const startingPoints = [
  ["No sé qué necesito", "Diagnóstico", "Organizamos el problema, la línea base y las alternativas antes de definir alcance o inversión.", "/diagnostico/"],
  ["Sé qué quiero implementar", "Proyecto", "Convertimos la decisión en ingeniería, plan de trabajo, entregables, presupuesto y responsabilidades.", "/contacto/"],
  ["Ya tengo un sistema", "Desempeño", "Revisamos suministro, proceso, equipos, personas y datos para estabilizar o mejorar.", "/servicios/operacion-delegada/"],
];

const serviceChain = [
  ["/projects/routes/route-evidence-04.webp", "Material orgánico separado para recolección", "Antes de la planta", "Caracterizar generadores, calidad, frecuencia y ruta protege el suministro y evita trasladar contaminación al proceso."],
  ["/projects/plant/plant-evidence-05.webp", "Pilas de transformación de residuos orgánicos", "Dentro del proceso", "Procedimientos, control de variables, mantenimiento y registros permiten sostener capacidad, calidad y continuidad."],
  ["/projects/tamesis/reactor-uasb.jpeg", "Reactor UASB para digestión anaerobia en Támesis", "En la salida de valor", "Compost, biol, biogás y bioenergía requieren tecnología compatible con la corriente y una operación que pueda demostrar resultados."],
] as const;

export default function ServicesPage() {
  return (
    <>
      <section className="gt-service-hero">
        <div className="container gt-service-hero__grid">
          <div className="gt-service-hero__copy">
            <span className="eyebrow eyebrow--light">Capacidades contratables</span>
            <h1>Ingeniería, operación, tecnología y productos para cerrar el ciclo orgánico.</h1>
            <p className="lead">Aquí encuentras capacidades que pueden contratarse por separado o integrarse en una ruta: diagnóstico, logística, infraestructura, operación, datos y valorización. Greenatics puede estructurar una decisión, implementar una planta, asumir su operación, fortalecer al equipo local y convertir la biomasa en productos o energía.</p>
            <div className="button-row"><Link className="button button--light" href="/diagnostico/">Encontrar mi ruta</Link><Link className="button button--outline-light" href="/contacto/">Revisar un alcance</Link></div>
          </div>
          <figure className="gt-service-hero__figure">
            <Image src="/projects/plant/plant-evidence-04.webp" alt="Área de compostaje con pilas de material orgánico en proceso" fill priority sizes="(max-width: 900px) 100vw, 48vw" />
            <figcaption><strong>Una cadena, no piezas aisladas</strong><span>Planear → recolectar → transformar → operar → medir.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-portfolio-universes">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split"><div><span className="eyebrow">Cómo está organizado el portafolio</span><h2>Tres universos conectados por una misma capacidad científica y operativa.</h2></div><p>Esta página responde qué podemos hacer y qué puede incluir un alcance. La gestión territorial produce datos y materiales; la valorización los convierte en soluciones; Wondergreen conecta ese conocimiento con suelo, cultivo, casa y jardín.</p></div>
          <div className="gt-portfolio-universes__grid">
            {portfolioUniverses.map((universe) => <article key={universe.number}><span>{universe.number}</span><h3>{universe.title}</h3><p>{universe.copy}</p><div>{universe.links.map(([label, href]) => <Link href={href} key={label}>{label} →</Link>)}</div></article>)}
          </div>
        </div>
      </section>

      <section className="gt-service-impact" aria-labelledby="service-impact-title">
        <div className="container">
          <header><span>Impacto validado en operación</span><h2 id="service-impact-title">Sostenibilidad que se puede medir en toneladas, calidad y eficiencia.</h2><Link href="/impacto/">Ver evidencia y metodología →</Link></header>
          <div className="gt-service-impact__grid">
            {yarumalClaims.map((claim) => <article key={claim.id}><strong>{claim.value}</strong><span>{claim.label}</span><small>{claim.context}</small></article>)}
          </div>
        </div>
      </section>

    <section className="gt-service-chain" aria-label="Continuidad entre capacidades contratables">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split"><div><span className="eyebrow">De principio a fin</span><h2>Cada servicio resuelve una brecha, pero protege el funcionamiento del sistema completo.</h2></div><p>No diseñamos la ruta sin conocer la recepción, ni la planta sin anticipar quién la operará, ni un producto sin revisar su uso. Esta continuidad reduce decisiones aisladas y hace más probable que el resultado ambiental se sostenga.</p></div>
          <div className="gt-service-chain__grid">{serviceChain.map(([src, alt, title, copy], index) => <figure key={title}><div><Image src={src} alt={alt} fill sizes="(max-width: 760px) 100vw, 33vw" /></div><figcaption><span>0{index + 1}</span><strong>{title}</strong><p>{copy}</p></figcaption></figure>)}</div>
        </div>
      </section>

      <nav className="gt-service-nav" aria-label="Familias de servicios">
        <div className="container">
          {categories.map((category) => <a key={category} href={`#${category.toLocaleLowerCase("es")}`}><span>{categoryContent[category].number}</span>{category}</a>)}
        </div>
      </nav>

      <section className="gt-route-section gt-route-section--paper">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split"><div><span className="eyebrow">Tres formas de empezar</span><h2>Ubica primero el tipo de decisión.</h2></div><p>Si el punto de entrada es claro, la conversación comercial puede concentrarse en la evidencia disponible, la brecha y el resultado esperado.</p></div>
          <div className="gt-starting-grid">
            {startingPoints.map(([title, label, copy, href], index) => (
              <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><small>{label}</small><h3>{title}</h3><p>{copy}</p><Link href={href}>Empezar aquí →</Link></article>
            ))}
          </div>
        </div>
      </section>

      <section className="gt-engagement-model">
        <div className="container gt-engagement-model__grid">
          <div><span className="eyebrow eyebrow--light">Una oferta flexible</span><h2>Greenatics sí opera plantas. También puede compartir o fortalecer la operación local.</h2><p>La modalidad se define por capacidad instalada, personal disponible, responsabilidad contractual y objetivo del cliente.</p></div>
          {operationModels.map(([title, copy], index) => <article key={title}><span>Modalidad 0{index + 1}</span><strong>{title}</strong><p>{copy}</p></article>)}
        </div>
      </section>

      {categories.map((category) => {
        const items = services.filter((service) => service.category === category);
        const content = categoryContent[category];
        return (
          <section className="gt-service-category" key={category} id={category.toLocaleLowerCase("es")}>
            <div className="container">
              <header className="gt-service-category__head">
                <span>{content.number}</span>
                <div><small>{category}</small><h2>{content.title}</h2><p>{content.intro}</p></div>
                <aside><strong>¿Cuándo empezar aquí?</strong><p>{content.decision}</p></aside>
              </header>
              <div className="gt-service-cards">
                {items.map((service) => (
                  <article key={service.slug}>
                    <div className="gt-service-card__meta"><span>{service.audience}</span><em>{service.category}</em></div>
                    <h3>{service.name}</h3>
                    <p className="gt-service-card__summary">{service.summary}</p>
                    <div className="gt-card-answer"><strong>Problema que aborda</strong><p>{service.solves}</p></div>
                    <div className="gt-service-card__details">
                      <details><summary>Actividades posibles</summary><ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul></details>
                      <details><summary>Entregables típicos</summary><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></details>
                    </div>
                    <Link href={`/servicios/${service.slug}/`}>Ver alcance completo →</Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="gt-service-scope">
        <div className="container gt-service-scope__grid">
          <div><span className="eyebrow eyebrow--light">Alcance responsable</span><h2>La capacidad general no reemplaza una propuesta específica.</h2></div>
          <div><p>Cada proyecto define expresamente estudios, ingeniería, construcción, permisos, personal, operación, certificaciones, informes, plazos y responsabilidades. Las actividades y entregables descritos en el portafolio son posibilidades que se confirman o excluyen en el alcance contractual.</p><Link href="/contacto/">Construir un alcance con el equipo →</Link></div>
        </div>
      </section>
    </>
  );
}
