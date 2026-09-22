import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ToolAccessRail } from "@/components/tool-access-rail";

export const metadata: Metadata = {
  title: "AGROWAY | Trazabilidad agrícola para el ecosistema SANA",
  description:
    "AGROWAY registra y relaciona la realidad agrícola para alimentar el ecosistema SANA con datos de campo, ciencia Greenatics y trazabilidad Wondergreen.",
  alternates: { canonical: "/agroway/" },
  openGraph: {
    title: "AGROWAY | Trazabilidad agrícola para el ecosistema SANA",
    description: "Productor, finca, lote, diagnóstico, plan, aplicación, evidencia, seguimiento y cosecha en una historia de campo.",
    url: "/agroway/",
    images: ["/guides/guia-cafe-cover.webp"],
  },
};

const goldenPath = [
  ["01", "Productor", "Identidad, organización y responsable del ciclo productivo."],
  ["02", "Finca", "Territorio, contexto y unidad productiva identificada."],
  ["03", "Lote", "Geometría, cultivo y condiciones del lugar donde ocurre el trabajo."],
  ["04", "Diagnóstico", "Observaciones y necesidades agronómicas registradas con contexto."],
  ["05", "Plan", "Recomendaciones, protocolo y tareas antes de aplicar."],
  ["06", "Campo", "Abastecimiento, aplicación, evidencia y seguimiento en el ciclo."],
  ["07", "Cosecha", "Resultado productivo documentado para alimentar nuevas decisiones."],
] as const;

const experiences = [
  {
    code: "CONTROL",
    name: "Greenatics Control",
    title: "La vista para gobernar el portafolio.",
    copy: "Reúne proyectos, presupuesto, riesgo, abastecimiento, ejecución, seguimiento, cosecha, impacto y alertas en una lectura operacional para equipos técnicos y de dirección.",
    items: ["Control Tower y Digital Twin", "Data Room, riesgo y readiness", "Catálogo gobernado y demanda"],
  },
  {
    code: "FIELD",
    name: "AGROWAY Field",
    title: "La herramienta para trabajar donde ocurre el cultivo.",
    copy: "Permite recibir tareas, registrar aplicaciones, adjuntar evidencia y sincronizar cuando vuelve la conectividad. El trabajo offline captura hechos; las aprobaciones siguen siendo humanas y online.",
    items: ["Operación local-first", "Evidencia con checksum y revisión", "Dosis, inventario y costos relacionados"],
  },
  {
    code: "SANA DATA",
    name: "Datos para SANA",
    title: "La realidad de campo que alimenta el ecosistema.",
    copy: "AGROWAY entrega datos relacionados y oportunos sobre el ciclo productivo para que SANA pueda estructurar oportunidades, acompañar proyectos y tomar decisiones de inversión con mejor contexto.",
    items: ["Datos de ciclo y trazabilidad", "Evidencia y seguimiento", "Lecturas agregadas para SANA"],
  },
] as const;

const capabilities = [
  ["01", "Productor, finca y lote", "Identidad, territorio, geometría, cultivo y condiciones del lugar donde ocurre el ciclo productivo."],
  ["02", "Diagnóstico y plan", "Necesidades agronómicas, recomendaciones, protocolos y tareas relacionadas antes de aplicar."],
  ["03", "Abastecimiento e inventario", "Producto, lote físico, despacho, recepción e inventario de insumos vinculados al proyecto."],
  ["04", "Aplicación y evidencia", "Tareas, dosis estructuradas, fotografías, verificaciones y costos relacionados con cada actividad."],
  ["05", "Seguimiento y cosecha", "Mediciones, observaciones, incidencias, decisiones técnicas y resultado productivo del ciclo."],
  ["06", "Datos para SANA", "Información organizada para estructurar oportunidades, acompañar proyectos y evaluar decisiones de inversión."],
] as const;

const proofPoints = [
  ["La recomendación tiene contexto", "AGROWAY distingue necesidad agronómica, recomendación técnica y producto compatible. No asume que toda necesidad se resuelve con una marca."],
  ["El dato conserva su historia", "Una corrección agrega versión, autor, fecha y motivo. El registro original no desaparece para hacer más cómodo el reporte."],
  ["SANA recibe datos relacionados", "La información de campo se entrega con origen, ciclo, evidencia y nivel de confianza para alimentar decisiones del ecosistema."],
  ["El resultado no se inventa", "Una observación, una aplicación y una cosecha son hechos distintos. La plataforma conserva esa diferencia para que SANA evalúe con seriedad."],
] as const;

const readiness = [
  ["Ciclo trazable", "Desde identidad y lote hasta proyecto, campo, cosecha, venta, liquidación y cierre, cada etapa conserva su contexto."],
  ["Capacidades conectadas", "Control de portafolio, campo, impacto, circularidad, pasaportes y catálogo pueden crecer alrededor del ciclo productivo."],
  ["Espacio protegido", "Identidad, roles, observabilidad, respaldos, integraciones y datos separados por organización para trabajar con confianza."],
  ["Acompañamiento continuo", "Configuramos el proyecto, formamos al equipo y ajustamos reglas, indicadores y permisos a medida que la operación aprende."],
] as const;

export default function AgrowayPage() {
  return (
    <>
      <section className="agroway-v1-hero">
        <div className="container agroway-v1-hero__grid">
          <div className="agroway-v1-hero__copy">
            <div className="agroway-v1-brandline">
              <Image src="/brand/agroway/agroway-logo.png" alt="AGROWAY" width={230} height={141} priority />
              <span>Una plataforma Greenatics</span>
            </div>
            <span className="eyebrow eyebrow--light">Infraestructura para proyectos productivos</span>
            <h1>La trazabilidad agrícola que mantiene vivo el proyecto productivo.</h1>
            <p className="lead">AGROWAY registra lo que ocurre en el campo y relaciona productor, finca, lote, cultivo, plan, aplicación, evidencia, seguimiento y cosecha. Es la aplicación de trazabilidad que alimenta a SANA con información real del ciclo.</p>
            <div className="button-row">
              <Link className="button button--neon" href="/agroway/app/">Entrar como usuario demo</Link>
              <Link className="button button--outline-light" href="#recorrido">Ver el recorrido</Link>
            </div>
            <p className="agroway-v1-hero__note"><strong>Listo para explorar:</strong> entra a la demo y recorre el ciclo completo con datos ilustrativos. AGROWAY registra y organiza la información agrícola; cuando el proyecto trabaja con datos propios, el espacio se configura por organización, proyecto y rol. SANA utiliza esa base junto con la ciencia y las soluciones de Greenatics y Wondergreen.</p>
          </div>
          <aside className="agroway-v1-hero__visual" aria-label="Cadena de valor AGROWAY">
            <div className="agroway-v1-hero__visual-top"><span>AGROWAY V1</span><small>CAMPO → DATOS → SANA</small></div>
            <div className="agroway-v1-hero__orbit"><i className="orbit-line orbit-line--one" /><i className="orbit-line orbit-line--two" /><div className="orbit-center"><strong>Trazabilidad<br />agrícola</strong><span>datos vivos del ciclo</span></div><b className="orbit-node orbit-node--capital">Productor</b><b className="orbit-node orbit-node--plan">Plan</b><b className="orbit-node orbit-node--field">Campo</b><b className="orbit-node orbit-node--result">SANA</b></div>
            <div className="agroway-v1-hero__visual-foot"><span><i /> Captura en campo</span><span><i /> Evidencia relacionada</span><span><i /> Datos para decidir</span></div>
          </aside>
        </div>
      </section>

      <ToolAccessRail
        id="agroway"
        name="AGROWAY"
        status="Demo navegable disponible"
        copy="AGROWAY es la aplicación de trazabilidad agrícola: registra productor, finca, lote, diagnóstico, plan, abastecimiento, aplicación, evidencia, seguimiento y cosecha. Puedes recorrer un entorno demo con módulos y datos ilustrativos; la operación real se habilita por proyecto, organización y rol."
        demoHref="/agroway/app/"
        demoLabel="Entrar como usuario demo"
        accessHref="/contacto/?interes=agroway"
        accessLabel="Configurar un entorno propio"
      />

      <section className="agroway-v1-intro">
        <div className="container agroway-v1-intro__grid">
          <div><span className="eyebrow">La idea central</span><h2>La verdad financiera y la verdad de campo no pueden vivir separadas.</h2></div>
          <div><p>Agroway es la aplicación que toma la realidad agrícola y la vuelve trazable: quién produce, dónde, qué cultivo tiene, qué se observó, qué se recomendó, qué se aplicó, con qué evidencia y qué ocurrió después.</p><p>SANA es el ecosistema que recibe esa información para estructurar y acompañar inversión en proyectos productivos. Greenatics y Wondergreen aportan conocimiento agronómico, ciencia, fertilizantes, bioinsumos y criterio técnico para que las decisiones se conecten con el suelo, el cultivo y el territorio.</p></div>
        </div>
      </section>

      <section className="agroway-v1-path" id="recorrido" aria-labelledby="agroway-path-title">
        <div className="container"><header className="agroway-v1-heading agroway-v1-heading--light"><div><span className="eyebrow eyebrow--light">El recorrido trazable</span><h2 id="agroway-path-title">Cada ciclo deja una historia que SANA puede entender.</h2></div><p>Agroway no reemplaza el criterio agronómico ni decide la inversión: captura, relaciona y ordena la información que permite trabajar con mejor contexto.</p></header><div className="agroway-v1-path__grid">{goldenPath.map(([number, title, copy]) => <article key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></article>)}</div><div className="agroway-v1-path__caption"><strong>La secuencia completa:</strong><span>Productor → Finca → Lote → Ciclo → Diagnóstico → Plan → Abastecimiento → Aplicación → Evidencia → Seguimiento → Cosecha → Datos para SANA</span></div></div>
      </section>

      <section className="agroway-v1-experiences" aria-labelledby="agroway-experiences-title">
        <div className="container"><header className="agroway-v1-heading"><div><span className="eyebrow">Una aplicación, distintos usos</span><h2 id="agroway-experiences-title">La misma trazabilidad sirve para operar, acompañar y decidir.</h2></div><p>Agroway concentra la captura y la relación de datos. Sus vistas cambian según el rol: equipo técnico, personal de campo o ecosistema SANA.</p></header><div className="agroway-v1-experiences__grid">{experiences.map((experience, index) => <article className={`agroway-v1-experience agroway-v1-experience--${index + 1}`} key={experience.code}><div className="agroway-v1-experience__visual"><span>{experience.code}</span><div className="agroway-v1-screen"><div className="screen-top"><i /><i /><i /></div><div className="screen-body"><b /><b /><b /><div className="screen-chart"><i /><i /><i /><i /><i /></div><div className="screen-rows"><span /><span /><span /></div></div></div></div><div className="agroway-v1-experience__body"><span className="eyebrow">{experience.code}</span><h3>{experience.name}</h3><strong>{experience.title}</strong><p>{experience.copy}</p><ul>{experience.items.map((item) => <li key={item}>{item}</li>)}</ul></div></article>)}</div></div>
      </section>

      <section className="agroway-v1-capabilities" aria-labelledby="agroway-capabilities-title">
        <div className="container"><header className="agroway-v1-heading"><div><span className="eyebrow">Lo que ya está modelado</span><h2 id="agroway-capabilities-title">Más que una bitácora: una infraestructura de trabajo.</h2></div><p>El repositorio actual ya contempla los dominios que hacen que la trazabilidad sea útil para operar, financiar, revisar y aprender.</p></header><div className="agroway-v1-capabilities__grid">{capabilities.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
      </section>

      <section className="agroway-v1-proof"><div className="container"><header className="agroway-v1-heading agroway-v1-heading--light"><div><span className="eyebrow eyebrow--light">Gobierno de la información</span><h2>La confianza no se diseña con una cifra grande. Se construye con distinciones pequeñas.</h2></div><p>Estas reglas hacen que un resultado pueda explicarse, revisarse y sostenerse sin convertir una hipótesis en una certeza.</p></header><div className="agroway-v1-proof__grid">{proofPoints.map(([title, copy]) => <article key={title}><span>✓</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

      <section className="agroway-v1-greenatics"><div className="container agroway-v1-greenatics__grid"><div><span className="eyebrow">La relación con SANA</span><h2>Agroway registra. Greenatics aporta ciencia. SANA conecta el ecosistema.</h2></div><div><p><strong>AGROWAY</strong> es la aplicación de trazabilidad agrícola: captura datos del productor, la finca, el lote, el cultivo, las labores, los insumos, la evidencia y la cosecha a medida que el proyecto avanza.</p><p><strong>Greenatics y Wondergreen</strong> aportan conocimiento agronómico, fertilizantes, bioinsumos, protocolos y acompañamiento. <strong>SANA</strong> usa esa información para estructurar y acompañar inversión en proyectos productivos con una lectura más completa del campo.</p><div className="button-row"><Link className="button button--dark" href="/sana/">Conocer SANA</Link><Link className="button button--ghost" href="/wondergreen/">Conocer Wondergreen</Link></div></div></div></section>

      <section className="agroway-v1-readiness"><div className="container agroway-v1-readiness__grid"><div><span className="eyebrow">Puesta en marcha</span><h2>De la demo a una operación acompañada.</h2><p>El ciclo productivo ya tiene una estructura clara. El siguiente paso es configurarla para tu organización, con los datos, roles, indicadores y reglas que el proyecto necesita para trabajar de forma consistente.</p><Link className="button button--primary" href="/contacto/?interes=agroway">Configurar un entorno propio</Link></div><div className="agroway-v1-readiness__list">{readiness.map(([label, copy], index) => <article key={`${label}-${index}`}><span>✓</span><div><strong>{label}</strong><p>{copy}</p></div></article>)}</div></div></section>

      <section className="agroway-v1-cta"><div className="container"><span className="eyebrow eyebrow--light">Del campo a SANA</span><h2>Si el proyecto importa, su historia también.</h2><p>Hablemos del cultivo, el nivel de trazabilidad y la información que debe estar disponible para acompañar el próximo ciclo productivo.</p><Link className="button button--neon" href="/contacto/?interes=agroway">Hablar sobre AGROWAY <span aria-hidden="true">→</span></Link></div></section>
    </>
  );
}
