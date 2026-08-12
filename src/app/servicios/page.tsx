import type { Metadata } from "next";
import Link from "next/link";
import { services, type ServiceCategory } from "@/data/services";

export const metadata: Metadata = {
  title: "Servicios y soluciones",
  description: "Portafolio Greenatics de diagnóstico, PGIRS y PMIRS, rutas selectivas, plantas, rehabilitación, operación, tratamiento y trazabilidad digital.",
  alternates: { canonical: "/servicios/" },
};

const categories: ServiceCategory[] = ["Planeación", "Recolección", "Infraestructura", "Operación", "Datos"];

const categoryIntro: Record<ServiceCategory, string> = {
  Planeación: "Entender el problema, organizar la línea base y madurar el proyecto antes de invertir.",
  Recolección: "Asegurar que el material separado llegue con frecuencia, calidad y datos suficientes al sistema de aprovechamiento.",
  Infraestructura: "Diseñar, construir o recuperar sistemas alrededor del residuo y de la operación que realmente podrá sostenerse.",
  Operación: "Convertir infraestructura en rutina, control, mantenimiento, producto y mejora continua.",
  Datos: "Hacer que cada actividad deje evidencia y alimente decisiones, indicadores e impacto publicable.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="service-hub-hero">
        <div className="container service-hub-grid">
          <div>
            <span className="eyebrow eyebrow--light">Portafolio Greenatics</span>
            <h1>El proyecto no empieza en la planta ni termina cuando se entrega un equipo.</h1>
            <p className="lead">Greenatics trabaja sobre toda la cadena: diagnosticar, planear, recolectar, transformar, operar, medir y devolver valor. Cada servicio puede contratarse como una fase independiente o integrarse en un sistema territorial o empresarial.</p>
            <div className="button-row"><Link className="button button--light" href="/diagnostico/">Encontrar mi ruta</Link><Link className="button button--outline-light" href="/contacto/">Hablar con el equipo</Link></div>
          </div>
          <aside className="service-hub-proof">
            <span>Cómo pensamos</span>
            <strong>Residuo → operación → producto → dato.</strong>
            <p>No partimos de una máquina predeterminada. Partimos del origen, volumen, composición, logística, infraestructura, actores, destino de productos y capacidad de gestión.</p>
          </aside>
        </div>
      </section>

      <section className="service-path-strip"><div className="container service-path-grid">{["Planear", "Recolectar", "Transformar", "Operar", "Medir", "Devolver valor"].map((item,index)=><div key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong></div>)}</div></section>

      {categories.map((category) => {
        const items = services.filter((service) => service.category === category);
        return (
          <section className="service-category" key={category} id={category.toLocaleLowerCase("es")}>
            <div className="container">
              <div className="service-category-head"><div><span className="eyebrow">{category}</span><h2>{categoryIntro[category]}</h2></div><strong>{items.length} solución{items.length === 1 ? "" : "es"}</strong></div>
              <div className="service-depth-grid">
                {items.map((service) => (
                  <article className="service-depth-card" key={service.slug}>
                    <div className="service-depth-meta"><span>{service.audience}</span><em>{service.category}</em></div>
                    <h3>{service.name}</h3>
                    <p className="service-summary">{service.summary}</p>
                    <div className="service-problem"><strong>Qué resuelve</strong><p>{service.solves}</p></div>
                    <details><summary>Qué puede incluir</summary><ul>{service.includes.map((item)=><li key={item}>{item}</li>)}</ul></details>
                    <details><summary>Entregables típicos</summary><ul>{service.deliverables.map((item)=><li key={item}>{item}</li>)}</ul></details>
                    <Link href={`/servicios/${service.slug}/`}>Ver servicio en profundidad →</Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="service-guardrail"><div className="container service-guardrail-grid"><div><span className="eyebrow eyebrow--light">Alcance responsable</span><h2>El portafolio es modular; el alcance contractual manda.</h2></div><p>Las listas anteriores describen capacidades y entregables posibles. Cada proyecto define expresamente estudios, ingeniería, construcción, permisos, operación, personal, certificaciones, informes y responsabilidades incluidas. La web no convierte una capacidad general en una obligación contractual automática.</p></div></section>
    </>
  );
}
