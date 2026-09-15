import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ToolAccessRail } from "@/components/tool-access-rail";
import { runtimeLinks } from "@/lib/runtime-links";
import "./red-v4.css";

export const metadata: Metadata = {
  title: "GREENATICS Red | Diagnóstico, campo y PMIRS",
  description: "GREENATICS Red conecta diagnóstico territorial, trabajo de campo, QA/QC, PMIRS, implementación y seguimiento con evidencia reutilizable.",
  alternates: { canonical: "/red/" },
};

const redSequence = [
  ["01", "Proyecto 360", "Reúne el contexto del municipio, la organización, los actores, la infraestructura y la decisión que debe tomarse."],
  ["02", "FIELD", "Lleva al campo la captura de generadores, rutas, cantidades, calidad, incidencias, fotografías y responsables."],
  ["03", "QA/QC", "Revisa completitud, unidades, consistencia, fuentes y evidencia antes de utilizar los registros para comparar."],
  ["04", "Hallazgos", "Separa hechos, fuentes, causas y prioridades para que la interpretación pueda discutirse sin perder el registro original."],
  ["05", "Línea base validada", "Convierte los registros revisados en una lectura común del problema, sus magnitudes y sus restricciones."],
  ["06", "PMIRS STUDIO", "Traduce hallazgos en programas, acciones, responsables, indicadores, fechas y entregables."],
  ["07", "PMIRS VIVO", "Sigue la implementación, conserva evidencias y permite volver a medir para ajustar el plan."],
] as const;

const workspaceViews = [
  ["Captura", "Registrar hechos de campo sin perder fecha, ubicación, fuente, responsable ni evidencia."],
  ["Validación", "Separar lo registrado de lo validado y hacer visibles los datos que aún requieren revisión."],
  ["Decisión", "Conectar hallazgos con programas, acciones, indicadores y responsables de implementación."],
  ["Seguimiento", "Comparar avances, registrar novedades y conservar el historial del PMIRS."],
] as const;

export default function RedPage() {
  return (
    <>
      <section className="red-v4-hero">
        <div className="container red-v4-hero__grid">
          <div>
            <span className="eyebrow eyebrow--light">GREENATICS Red · estación territorial</span>
            <h1>Del dato territorial al PMIRS vivo.</h1>
            <p className="lead">Red organiza el trabajo que ocurre antes, durante y después de una ruta: diagnóstico, campo, medición, control de calidad, planeación, implementación y seguimiento.</p>
            <div className="button-row"><Link className="button button--light" href="/red/app/">Abrir estación Red</Link><Link className="button button--outline-light" href="/contacto/?interes=red">Diseñar la solución</Link></div>
          </div>
          <figure><Image src="/projects/routes/route-evidence-03.webp" alt="Equipo realizando recolección diferenciada de residuos orgánicos en territorio" fill priority sizes="(max-width: 900px) 100vw, 48vw" /><figcaption><strong>La ruta es una fuente de información.</strong><span>La operación territorial deja registros que pueden alimentar decisiones, no sólo reportes de cumplimiento.</span></figcaption></figure>
        </div>
      </section>

      <ToolAccessRail
        id="red"
        name="GREENATICS Red"
        status={runtimeLinks.red ? "Runtime conectado" : "Estación demo disponible"}
        copy="Esta landing explica la solución completa: Proyecto 360, FIELD, QA/QC, hallazgos, línea base, PMIRS STUDIO y PMIRS VIVO. La estación navegable permite explorar la experiencia; la operación productiva se configura con datos, roles y permisos del proyecto."
        runtimeHref={runtimeLinks.red || undefined}
        runtimeLabel="Entrar a la estación Red"
        demoHref="/red/app/"
        demoLabel="Entrar a la estación demo"
        accessHref="/contacto/?interes=red"
        accessLabel="Diseñar la implementación"
      />

      <section className="red-v4-sequence"><div className="container"><div className="digital-v4-heading"><div><span className="eyebrow">Una cadena de trabajo</span><h2>Red no termina cuando termina la recolección.</h2></div><p>La microrruta es una capacidad dentro de un sistema más amplio. La información capturada en el territorio se revisa, se interpreta y se convierte en un plan que puede seguirse en el tiempo.</p></div><ol>{redSequence.map(([number, title, copy]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></li>)}</ol></div></section>

      <section className="red-v4-workspace"><div className="container red-v4-workspace__grid"><div><span className="eyebrow eyebrow--light">Experiencia de trabajo</span><h2>Una fuente se captura una vez y puede servir para varias decisiones.</h2><p>El enfoque evita volver a levantar la misma información para cada informe. Cada registro conserva su contexto y sólo avanza de nivel cuando recibe la revisión correspondiente.</p><div className="red-v4-state"><span>RAW</span><span>→</span><span>VALIDATED</span><span>→</span><span>INTERPRETED</span><span>→</span><span>IMPLEMENTED</span></div></div><div className="red-v4-views">{workspaceViews.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{copy}</p></div></article>)}</div></div></section>

      <section className="red-v4-deliverables"><div className="container"><div className="digital-v4-heading"><div><span className="eyebrow">Qué puede quedar instalado</span><h2>Una implementación que el equipo puede continuar.</h2></div><p>El alcance se configura según el proyecto y el nivel de madurez. Red puede articularse con servicios de diagnóstico, PMIRS, microrrutas, operación de plantas y GREENATICS OPS.</p></div><div className="red-v4-deliverables__grid"><article><span>01</span><h3>Lectura territorial</h3><p>Mapa de generadores, cobertura, frecuencias, calidades, novedades y restricciones logísticas.</p></article><article><span>02</span><h3>Expediente de decisión</h3><p>Hallazgos, fuentes, línea base, alternativas, programas, responsables e indicadores.</p></article><article><span>03</span><h3>Seguimiento con evidencia</h3><p>Acciones ejecutadas, soportes, avances, alertas y decisiones de ajuste en el PMIRS.</p></article></div></div></section>

      <section className="red-v4-boundary"><div className="container red-v4-boundary__grid"><div><span className="eyebrow eyebrow--light">Relación con el ecosistema</span><h2>Red organiza el territorio. OPS sostiene la planta.</h2></div><div><p>Cuando el proyecto incluye tratamiento, producción, mantenimiento, inventario o control de volúmenes, la información pasa a la operación correspondiente. No son aplicaciones paralelas: son capas de una misma cadena de trabajo.</p><div className="button-row"><Link className="button button--light" href="/app/">Conocer GREENATICS OPS</Link><Link className="button button--outline-light" href="/municipios/">Explorar ruta municipal</Link></div></div></div></section>
    </>
  );
}
