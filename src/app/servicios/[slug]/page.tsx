import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { JsonLd } from "@/components/json-ld";
import { services } from "@/data/services";
import { site } from "@/data/site";

const categoryProcess = {
  Planeación: [
    ["01", "Levantar línea base", "Reunimos información disponible y definimos los vacíos que realmente cambian la decisión."],
    ["02", "Validar en campo", "Contrastamos documentos con generación, infraestructura, actores, logística y restricciones operativas."],
    ["03", "Construir alternativas", "Comparamos rutas posibles, necesidades, dependencias, riesgos y nivel de madurez del proyecto."],
    ["04", "Priorizar", "Traducimos el análisis en decisiones, proyectos y una secuencia realista de implementación."],
    ["05", "Entregar hoja de ruta", "Dejamos claro qué puede ejecutarse ahora, qué requiere estudio adicional y qué debe evitarse."],
  ],
  Recolección: [
    ["01", "Caracterizar generadores", "Identificamos puntos, cantidades, frecuencias, horarios, impropios y condiciones de entrega."],
    ["02", "Diseñar la logística", "Construimos recorridos, secuencias, recipientes, frecuencias, roles y criterios de aceptación."],
    ["03", "Probar", "Cuando aplica, una microrruta o piloto permite validar tiempos, volúmenes y comportamiento real."],
    ["04", "Medir", "Registramos atención, material, novedades, calidad de separación y variables útiles para ajuste."],
    ["05", "Escalar", "La expansión se hace sobre evidencia operacional y no únicamente sobre una ruta dibujada en escritorio."],
  ],
  Infraestructura: [
    ["01", "Definir el residuo y la escala", "La ingeniería parte de suministro, composición, continuidad, localización y salida de productos."],
    ["02", "Diseñar el proceso", "Balances, operaciones unitarias, equipos, flujos, servicios auxiliares y necesidades de control."],
    ["03", "Diseñar para operar", "Layout, seguridad, mantenimiento, personal, almacenamiento y manejo de entradas/salidas."],
    ["04", "Implementar", "Construcción, adecuación o integración de módulos según el alcance técnico y contractual."],
    ["05", "Poner en marcha", "Arranque, estabilización, formación, control de variables y cierre de desviaciones."],
  ],
  Operación: [
    ["01", "Estabilizar responsabilidades", "Definimos roles, programación, turnos, criterios de control y escalamiento de novedades."],
    ["02", "Estandarizar", "Procedimientos, registros, puntos de control, mantenimiento, calidad y seguridad operacional."],
    ["03", "Operar", "Recepción, proceso, producto, inventarios, mantenimiento y coordinación diaria según alcance."],
    ["04", "Revisar", "Indicadores, novedades, balances y cumplimiento del programa se revisan periódicamente."],
    ["05", "Mejorar", "Los datos de operación se convierten en acciones correctivas, preventivas y de optimización."],
  ],
  Datos: [
    ["01", "Modelar el flujo", "Definimos qué eventos operativos producen datos y qué relación existe entre generador, ruta, lote, proceso y producto."],
    ["02", "Capturar en origen", "El registro ocurre donde sucede la actividad para disminuir reconstrucciones posteriores."],
    ["03", "Validar", "Unidades, evidencias, estados y reglas permiten detectar inconsistencias antes de consolidar."],
    ["04", "Visualizar", "Tableros diarios, mensuales e históricos convierten los registros en información operativa."],
    ["05", "Publicar con gobierno", "Solo los indicadores conciliados y aprobados pasan a reportes externos o impacto público."],
  ],
} as const;

const clientInputs = {
  "Municipios y ESP": ["PGIRS y documentos disponibles", "información de generación y cobertura", "contratos/operadores y actores", "infraestructura existente", "restricciones presupuestales y de predio"],
  Empresas: ["proceso que genera la corriente", "volúmenes/frecuencias", "puntos de generación y almacenamiento", "gestores/contratos actuales", "objetivos ambientales u operativos"],
  Ambos: ["información de la corriente", "ubicación y logística", "infraestructura disponible", "objetivo del proyecto", "datos o estudios existentes"],
} as const;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  const canonical = `/servicios/${service.slug}/`;
  return {
    title: service.name,
    description: service.summary,
    alternates: { canonical },
    openGraph: { title: service.name, description: service.summary, url: canonical },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const url = `${site.url}/servicios/${service.slug}/`;
  const process = categoryProcess[service.category];
  const inputs = clientInputs[service.audience];
  const related = services.filter((item) => item.slug !== service.slug && (item.category === service.category || item.audience === service.audience)).slice(0, 3);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.name,
    description: service.summary,
    url,
    serviceType: service.category,
    provider: { "@id": `${site.url}/#organization` },
    areaServed: { "@type": "Country", name: "Colombia" },
    audience: { "@type": "Audience", audienceType: service.audience },
  };

  return (
    <>
      <JsonLd data={serviceSchema} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` },{ name: "Servicios", url: `${site.url}/servicios/` },{ name: service.name, url }]} />

      <section className="service-detail-hero">
        <div className="container service-detail-hero-grid">
          <div>
            <Link className="back-link back-link--light" href="/servicios/">← Todos los servicios</Link>
            <span className="eyebrow eyebrow--light">{service.category} · {service.audience}</span>
            <h1>{service.name}</h1>
            <p className="lead">{service.summary}</p>
            <div className="button-row"><Link className="button button--light" href={`/contacto/?servicio=${service.slug}`}>{service.cta}</Link><Link className="button button--outline-light" href="/diagnostico/">¿Es esta mi ruta?</Link></div>
          </div>
          <aside className="service-detail-problem"><span>Problema que abordamos</span><strong>{service.solves}</strong></aside>
        </div>
      </section>

      <section className="service-detail-scope"><div className="container service-detail-scope-grid"><div><span className="eyebrow">Alcance modular</span><h2>Qué puede incluir.</h2><p>La combinación final depende del diagnóstico, del nivel de madurez del proyecto y del alcance contratado.</p></div><ul>{service.includes.map((item)=><li key={item}>{item}</li>)}</ul></div></section>

      <section className="service-detail-process"><div className="container"><div className="section-heading"><span className="eyebrow eyebrow--light">Cómo trabajamos</span><h2>Un proceso diseñado para reducir incertidumbre antes de escalar.</h2></div><div className="service-process-grid">{process.map(([number,title,copy])=><article key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></article>)}</div></div></section>

      <section className="service-detail-deliverables"><div className="container service-detail-deliverables-grid"><div><span className="eyebrow">Entregables típicos</span><h2>El resultado debe quedar utilizable después de la consultoría o intervención.</h2></div><div className="deliverable-list">{service.deliverables.map((item,index)=><div key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong></div>)}</div></div></section>

      <section className="service-detail-inputs"><div className="container service-detail-inputs-grid"><div><span className="eyebrow eyebrow--light">Para empezar</span><h2>Qué información ayuda a acelerar el diagnóstico.</h2></div><ul>{inputs.map((item)=><li key={item}>{item}</li>)}</ul></div></section>

      <section className="service-detail-boundary"><div className="container"><strong>Alcance y responsabilidad</strong><p>Esta página describe una capacidad Greenatics, no una oferta contractual cerrada. Permisos, licencias, estudios, diseños, construcción, suministros, operación, personal, trámites, registros, certificaciones, informes y obligaciones se incluyen únicamente cuando el contrato específico los define.</p></div></section>

      <section className="service-related"><div className="container"><div className="section-heading"><span className="eyebrow">También puede interesarte</span><h2>Los servicios forman una cadena.</h2></div><div className="service-related-grid">{related.map((item)=><Link href={`/servicios/${item.slug}/`} key={item.slug}><span>{item.category}</span><strong>{item.name}</strong><p>{item.summary}</p><em>Ver servicio →</em></Link>)}</div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Siguiente paso</span><h2>No necesitamos definir todo antes de conversar. Sí necesitamos entender bien el punto de partida.</h2></div><Link className="button button--dark" href={`/contacto/?servicio=${service.slug}`}>{service.cta}</Link></div></section>
    </>
  );
}
