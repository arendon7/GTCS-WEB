import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ToolAccessRail } from "@/components/tool-access-rail";
import "./sana-v1.css";

export const metadata: Metadata = {
  title: "SANA | Ecosistema de inversión en proyectos productivos",
  description:
    "SANA articula inversión, trazabilidad Agroway, ciencia Greenatics y soluciones Wondergreen para acompañar proyectos agrícolas y productivos.",
  alternates: { canonical: "/sana/" },
  openGraph: {
    title: "SANA | Ecosistema de inversión en proyectos productivos",
    description: "Articula datos de AGROWAY, ciencia Greenatics y soluciones Wondergreen para estructurar y acompañar proyectos agrícolas.",
    url: "/sana/",
    images: ["/projects/tamesis/paisaje-tamesis.jpg"],
  },
};

const layers = [
  ["01", "AGROWAY", "La aplicación de trazabilidad agrícola. Registra lo que ocurre en el productor, la finca, el lote y el ciclo, y sincroniza la información según la conectividad del campo."],
  ["02", "Greenatics + Wondergreen", "Ciencia, diagnóstico, protocolos, fertilizantes, bioinsumos y acompañamiento técnico para orientar cada decisión."],
  ["03", "SANA", "El ecosistema que organiza oportunidades, conecta actores, estructura inversión y lee el avance de los proyectos."],
  ["04", "Proyecto productivo", "La realidad que se acompaña: cultivos, personas, territorio, cosecha, aprendizaje y nuevos ciclos."],
] as const;

const journey = [
  ["01", "Conocer", "Se entiende el territorio, el productor, el cultivo, la oportunidad y las condiciones que hacen viable el proyecto."],
  ["02", "Estructurar", "Se conectan diagnóstico, plan agronómico, necesidades, presupuesto, acompañamiento y reglas de seguimiento."],
  ["03", "Ejecutar", "Agroway captura la actividad del campo, los insumos, la evidencia, las observaciones y los cambios del ciclo."],
  ["04", "Aprender", "SANA recibe una historia trazable para evaluar el avance, mejorar decisiones y preparar nuevos ciclos."],
] as const;

const investorView = [
  ["Contexto", "Qué proyecto es, dónde ocurre a la escala autorizada, quién lo acompaña y en qué etapa se encuentra."],
  ["Ejecución", "Qué actividades se han realizado, qué evidencia existe y qué pendientes o alertas requieren atención."],
  ["Resultado", "Qué se ha cosechado, comercializado o reconciliado, siempre distinguiendo proyección, dato registrado y resultado confirmado."],
  ["Trazabilidad", "Cómo se relacionan plan, aplicación, lote, evidencia y ciclo sin exponer información operativa sensible."],
] as const;

export default function SanaPage() {
  return (
    <>
      <section className="sana-v1-hero">
        <div className="container sana-v1-hero__grid">
          <div>
            <span className="eyebrow eyebrow--light">Ecosistema de inversión productiva</span>
            <h1>Invertir en proyectos agrícolas con más contexto, trazabilidad y acompañamiento.</h1>
            <p className="lead">SANA conecta oportunidades productivas con capital, ciencia agronómica y seguimiento. Usa los datos que AGROWAY registra en el campo para acompañar decisiones de inversión con una lectura más cercana a la realidad.</p>
            <div className="button-row"><Link className="button button--neon" href="/sana/app/">Entrar como usuario demo</Link><Link className="button button--outline-light" href="#como-funciona">Cómo funciona</Link></div>
            <p className="sana-v1-hero__note"><strong>Listo para explorar:</strong> entra como usuario demo y recorre el espacio de trabajo. AGROWAY es la aplicación de trazabilidad; SANA es el ecosistema que usa esa información para estructurar, acompañar y evaluar proyectos productivos.</p>
          </div>
          <figure className="sana-v1-hero__image"><Image src="/projects/tamesis/paisaje-tamesis.jpg" alt="Paisaje productivo del proyecto Támesis" fill priority sizes="(max-width: 760px) 100vw, 46vw" /><figcaption><span>Campo · ciencia · inversión</span><strong>Los proyectos se entienden mejor cuando su historia se puede seguir.</strong></figcaption></figure>
        </div>
      </section>

      <ToolAccessRail
        id="sana"
        name="SANA"
        status="Demo navegable disponible"
        copy="SANA no es la aplicación de captura: es el ecosistema que usa los datos relacionados de AGROWAY, la ciencia de Greenatics y las soluciones Wondergreen para estructurar, acompañar y evaluar proyectos productivos. Puedes recorrer un entorno demo con datos ilustrativos antes de conectar portafolios y usuarios reales."
        demoHref="/sana/app/"
        demoLabel="Entrar como usuario demo"
        accessHref="/contacto/?interes=sana"
        accessLabel="Configurar un entorno propio"
      />

      <section className="sana-v1-definition"><div className="container sana-v1-definition__grid"><div><span className="eyebrow">La propuesta SANA</span><h2>La inversión productiva necesita una capa que conecte el propósito con lo que realmente ocurre.</h2></div><div><p>SANA no es una pantalla de rentabilidad aislada ni una aplicación de captura. Es un ecosistema para organizar proyectos productivos, reunir capacidades y seguir la relación entre capital, decisiones agronómicas, trabajo de campo y resultados.</p><p>La información se alimenta de AGROWAY con datos oportunos y sincronizados según la conectividad del campo, y se complementa con la ciencia, los fertilizantes, los bioinsumos y el acompañamiento de Greenatics y Wondergreen. Así, cada proyecto puede ser leído con más contexto y menos suposiciones.</p></div></div></section>

      <section className="sana-v1-layers" aria-labelledby="sana-layers-title"><div className="container"><header className="sana-v1-heading sana-v1-heading--light"><div><span className="eyebrow eyebrow--light">Un sistema de responsabilidades claras</span><h2 id="sana-layers-title">Cada capa hace su trabajo y alimenta a la siguiente.</h2></div><p>Separar los roles evita prometer que una sola aplicación resuelve toda la inversión agrícola.</p></header><div className="sana-v1-layers__grid">{layers.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="sana-v1-journey" id="como-funciona" aria-labelledby="sana-journey-title"><div className="container"><header className="sana-v1-heading"><div><span className="eyebrow">Del proyecto a la decisión</span><h2 id="sana-journey-title">Una ruta para estructurar, ejecutar y aprender.</h2></div><p>SANA permite que la conversación de inversión se apoye en una historia viva del proyecto, no únicamente en una proyección inicial.</p></header><div className="sana-v1-journey__grid">{journey.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

      <section className="sana-v1-data"><div className="container sana-v1-data__grid"><div><span className="eyebrow eyebrow--light">La información que habilita SANA</span><h2>Datos de campo que se convierten en capacidad de acompañamiento.</h2><p>AGROWAY registra hechos y relaciones del ciclo. SANA puede convertirlos en contexto para el portafolio, siempre respetando permisos, privacidad y estado de revisión.</p><Link className="button button--neon" href="/agroway/">Conocer AGROWAY</Link></div><div className="sana-v1-data__cards">{investorView.map(([title, copy]) => <article key={title}><strong>{title}</strong><p>{copy}</p></article>)}</div></div></section>

      <section className="sana-v1-boundary"><div className="container sana-v1-boundary__grid"><div><span className="eyebrow">Cómo comunicamos el resultado</span><h2>Más transparencia no significa prometer certezas.</h2></div><div><p>SANA puede comunicar avances, datos, evidencias y resultados confirmados. No convierte automáticamente una asociación temporal en eficacia, ni una proyección en rendimiento garantizado. Cada lectura debe conservar su fuente, periodo, método y nivel de revisión.</p><p>La confianza se construye mostrando qué se sabe, qué se está verificando y qué todavía requiere una decisión humana.</p></div></div></section>

      <section className="sana-v1-cta"><div className="container"><span className="eyebrow eyebrow--light">Proyectos que merecen seguimiento</span><h2>Conectemos la oportunidad con la realidad del campo.</h2><p>Cuéntanos qué proyecto productivo quieres estructurar, acompañar o preparar para inversión.</p><Link className="button button--neon" href="/contacto/?interes=sana">Hablar sobre SANA <span aria-hidden="true">→</span></Link></div></section>
    </>
  );
}
