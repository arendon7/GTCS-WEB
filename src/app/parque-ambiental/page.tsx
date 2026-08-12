import type { Metadata } from "next";
import Link from "next/link";
import { environmentalParkModules } from "@/data/services";

export const metadata: Metadata = {
  title: "Parque Ambiental y Tecnológico",
  description: "Concepto Greenatics de Parque Ambiental: separación, rutas selectivas, aprovechamiento biológico, biofábrica, biogás, formación y datos en una arquitectura modular.",
  alternates: { canonical: "/parque-ambiental/" },
};

const questions = [
  ["Material", "¿Qué corrientes existen, cuánto se genera, qué tan separadas llegan y cómo cambia la oferta durante el año?"],
  ["Territorio", "¿Dónde están los generadores, cuál es la distancia de recolección y qué infraestructura/servicios tiene el predio?"],
  ["Proceso", "¿Qué combinación de compostaje, digestión u otras rutas responde mejor a la caracterización y a la escala?"],
  ["Productos", "¿Quién puede usar o comprar compost, biol, fertilizantes, energía u otras salidas técnicamente viables?"],
  ["Operación", "¿Quién recibe, opera, mantiene, controla, comercializa y reporta el sistema todos los días?"],
  ["Economía", "¿Qué inversión, costos de operación, ingresos/ahorros, fuentes de financiación y fases de crecimiento son realistas?"],
  ["Gobernanza", "¿Qué roles tienen municipio, ESP, generadores, operadores, comunidad, academia y aliados?"],
  ["Datos", "¿Qué se medirá desde el primer día para demostrar funcionamiento, corregir fallas y justificar el escalamiento?"],
] as const;

const phases = [
  ["Empezar", "Resolver la línea base y estabilizar una primera cadena funcional.", ["diagnóstico y prefactibilidad", "generadores priorizados", "ruta selectiva/piloto", "módulo de tratamiento inicial", "protocolos y datos mínimos"]],
  ["Consolidar", "Aumentar confiabilidad, cobertura y control operacional.", ["más generadores", "equipos/áreas complementarias", "mantenimiento estructurado", "producto e inventario", "GREENATICS OPS e indicadores"]],
  ["Escalar", "Agregar módulos o nuevos territorios cuando los datos justifican la inversión.", ["nuevas corrientes", "digestión/biogás cuando aplica", "biofábrica ampliada", "formación/demostración", "replicabilidad regional"]],
] as const;

const configurations = [
  ["Municipal", "Puede articular PGIRS, rutas selectivas, ESP, infraestructura de aprovechamiento, formación ciudadana y metas territoriales."],
  ["Regional", "Puede recibir corrientes de varios municipios cuando logística, gobernanza, capacidad y modelo económico justifican la concentración."],
  ["Agroindustrial", "Puede integrar residuos de procesamiento, estiércoles u otras biomasas con producción de insumos, energía y manejo de nutrientes."],
  ["Demostrativo / educativo", "Puede incorporar espacios de formación, huertas, viveros, parcelas, laboratorio demostrativo o transferencia tecnológica según alcance."],
] as const;

export default function EnvironmentalParkPage() {
  return (
    <>
      <section className="park-page-hero"><div className="container park-page-hero-grid"><div><span className="eyebrow eyebrow--light">Concepto Greenatics</span><h1>Parque Ambiental: convertir una planta aislada en una plataforma territorial de aprovechamiento.</h1><p className="lead">El Parque Ambiental —también concebido como Parque Tecnológico Ambiental— es una arquitectura modular para conectar separación, logística, tratamiento biológico, productos, energía, educación y datos. No es un paquete estándar: cada parque se define mediante diagnóstico, prefactibilidad y maduración técnica.</p><div className="button-row"><Link className="button button--light" href="/servicios/prefactibilidad/">Evaluar prefactibilidad</Link><Link className="button button--outline-light" href="/municipios/">Soluciones municipales</Link></div></div><aside className="park-page-definition"><span>No es</span><strong>una lista de máquinas.</strong><p>El valor del parque está en conectar entradas, procesos, personas, salidas y datos dentro de un modelo que el territorio pueda operar.</p></aside></div></section>

      <section className="park-page-modules"><div className="container"><div className="section-heading"><span className="eyebrow">Arquitectura modular</span><h2>Ocho capas que pueden combinarse según el proyecto.</h2><p>No todos los parques necesitan todos los módulos desde el primer día.</p></div><div className="park-page-module-grid">{environmentalParkModules.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="park-page-questions"><div className="container"><div className="section-heading"><span className="eyebrow eyebrow--light">Factibilidad</span><h2>Antes del layout vienen las preguntas que definen el sistema.</h2></div><div className="park-question-grid">{questions.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><strong>{title}</strong><p>{copy}</p></article>)}</div></div></section>

      <section className="park-page-phases"><div className="container"><div className="section-heading"><span className="eyebrow">Implementación gradual</span><h2>Empezar pequeño no significa pensar pequeño.</h2><p>La modularidad permite que el sistema madure con datos en lugar de sobredimensionarse desde el inicio.</p></div><div className="park-phase-grid">{phases.map(([title,copy,items],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p><ul>{items.map((item)=><li key={item}>{item}</li>)}</ul></article>)}</div></div></section>

      <section className="park-page-configurations"><div className="container park-config-grid"><div><span className="eyebrow">No existe un solo parque</span><h2>La arquitectura cambia según el territorio y la corriente.</h2></div><div className="park-config-list">{configurations.map(([title,copy])=><article key={title}><strong>{title}</strong><p>{copy}</p></article>)}</div></div></section>

      <section className="park-page-biorefinery"><div className="container park-biorefinery-grid"><div><span className="eyebrow eyebrow--light">Biorefinería territorial</span><h2>Una misma corriente puede generar varias rutas de valor.</h2><p>Según caracterización y escala, el parque puede integrar procesos aeróbicos y anaeróbicos. El objetivo es recuperar materia orgánica y nutrientes, y cuando técnica/económicamente tiene sentido, recuperar energía en forma de biogás.</p><Link className="button button--light" href="/tecnologia/">Ver tecnología Greenatics</Link></div><div className="park-value-flow"><span>Residuos separados</span><b>→</b><span>Compostaje / digestión</span><b>→</b><span>Compost · biol · fertilizantes · biogás</span><b>→</b><span>Suelo · agricultura · energía · aprendizaje</span></div></div></section>

      <section className="park-page-data"><div className="container park-data-grid"><div><span className="eyebrow">Capa digital</span><h2>El parque también es un sistema de información.</h2><p>GREENATICS OPS puede conectar generadores, microrrutas, recepción, impropios, lotes, procesos, producto, inventarios, mantenimiento y destino. Los indicadores públicos se separan de la información interna y solo se publican después de conciliación y aprobación.</p></div><div className="park-data-stack">{["Generador","Ruta","Recepción","Proceso","Producto","Destino / impacto"].map((item,index)=><div key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong></div>)}</div></div></section>

      <section className="park-page-boundary"><div className="container"><strong>Importante</strong><p>“Parque Ambiental” describe un concepto de arquitectura Greenatics. La web no afirma que exista un parque completo construido bajo esta configuración en una ciudad específica salvo que exista un caso documentado y aprobado. Capacidades, equipos, inversiones, producción, biogás y huella se calculan para cada proyecto.</p></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Madurar el concepto</span><h2>El primer entregable de un Parque Ambiental no debería ser un render. Debería ser una buena prefactibilidad.</h2></div><Link className="button button--dark" href="/servicios/prefactibilidad/">Empezar prefactibilidad</Link></div></section>
    </>
  );
}
