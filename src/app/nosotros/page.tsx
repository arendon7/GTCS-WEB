import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { yarumalClaims } from "@/data/claims";

export const metadata: Metadata = {
  title: "Ingeniería, operación y bioeconomía circular",
  description: "Conoce el enfoque de Greenatics para convertir residuos orgánicos en sistemas operables, medibles y conectados con valor territorial.",
  alternates: { canonical: "/nosotros/" },
};

const principles = [
  ["01", "Diseñar desde la operación", "La infraestructura se dimensiona después de entender suministro, logística, personas, costos recurrentes, proceso y destino de los productos."],
  ["02", "Hacer visible la evidencia", "Un indicador conserva su origen, periodo, unidad y estado de validación. Medir sirve para controlar y mejorar, no solo para comunicar."],
  ["03", "Cerrar el ciclo con utilidad", "El tratamiento cobra sentido cuando la biomasa puede convertirse en compost, biol, fertilizantes, biogás, bioenergía u otra salida responsable."],
  ["04", "Construir capacidad local", "Greenatics puede operar, compartir responsabilidades o dirigir técnicamente. En todos los casos deja procedimientos, registros y criterio de decisión."],
] as const;

const disciplines = [
  ["Ingeniería ambiental y sanitaria", "Caracteriza corrientes, construye balances de masa y traduce restricciones ambientales y sanitarias en criterios de diseño.", "Permite decidir capacidad, etapas, áreas, equipos y controles antes de comprometer una inversión."],
  ["Bioprocesos", "Lee el comportamiento del compostaje y la digestión anaerobia, sus variables críticas y sus salidas sólidas, líquidas y gaseosas.", "Permite estabilizar el proceso, prevenir fallas y definir si el objetivo será compost, biol, biogás, bioenergía o una combinación."],
  ["Operación y logística", "Conecta separación, microrrutas, recepción, procedimientos, mantenimiento, seguridad, personal y continuidad del servicio.", "Permite convertir infraestructura disponible en una rutina operable, con responsables y frecuencias claras."],
  ["Agronomía y producto", "Relaciona calidad del material, suelo, cultivo, etapa fisiológica, formulación Wondergreen y seguimiento en campo.", "Permite que la valorización no termine en una bodega, sino en una aplicación responsable y útil."],
  ["Software y datos", "Estructura bitácoras, pesajes, lotes, inventarios, alertas, costos, indicadores y documentos alrededor del trabajo real.", "Permite reconstruir qué ocurrió, comparar desempeño y preparar evidencia sin depender de archivos dispersos."],
] as const;

const fieldScenes = [
  ["/projects/routes/route-evidence-04.webp", "Residuos orgánicos separados antes de ingresar al proceso", "El material", "La calidad del proceso empieza en la separación, la recolección y la recepción, no cuando el residuo ya está dentro de la planta."],
  ["/projects/plant/plant-evidence-05.webp", "Pilas de material orgánico en una planta de aprovechamiento", "La transformación", "Volúmenes, tiempos, humedad, temperatura, maniobras y mantenimiento convierten la infraestructura en desempeño repetible."],
  ["/projects/tamesis/reactor-uasb.jpeg", "Reactor anaerobio UASB del proyecto Támesis", "La valorización", "En Támesis, la digestión anaerobia permite incorporar producción y captura de biogás y abre una ruta hacia bioenergía."],
] as const;

const collaborationBoundaries = [
  ["Conocimiento aplicado", "Greenatics articula ingeniería, experiencia operativa, territorio y conocimiento científico para configurar cada solución."],
  ["Trabajo con GIEM/UdeA", "La documentación de proyectos registra acompañamiento y trabajo conjunto con el Grupo Interdisciplinario de Estudios Moleculares de la Universidad de Antioquia."],
  ["Propiedad intelectual", "Los diseños, equipos o desarrollos que correspondan a la Universidad conservan su titularidad y los acuerdos específicos de cada proyecto."],
] as const;

export default function NosotrosPage() {
  return (
    <>
      <section className="gt-route-hero gt-route-hero--company">
        <div className="container gt-route-hero__grid">
          <div className="gt-route-hero__copy">
            <span className="eyebrow eyebrow--light">Greenatics</span>
            <h1>La economía circular se vuelve real cuando alguien puede operarla todos los días.</h1>
            <p className="gt-route-hero__statement">Por eso conectamos ingeniería, operación, biología, productos y datos.</p>
            <p className="lead">Greenatics estructura e implementa sistemas para aprovechar residuos orgánicos. Trabajamos desde el punto de generación hasta la ruta, la planta, el control del proceso y la salida de valor, con responsabilidades y evidencia claras.</p>
            <div className="button-row"><Link className="button button--light" href="/servicios/">Conocer nuestras capacidades</Link><Link className="button button--outline-light" href="/proyectos/">Ver proyectos</Link></div>
          </div>
          <figure className="gt-route-hero__figure">
            <Image src="/projects/plant/plant-evidence-04.webp" alt="Operación de una planta de aprovechamiento de residuos orgánicos" fill priority sizes="(max-width: 900px) 100vw, 48vw" />
            <figcaption><strong>Ingeniería que llega al turno operativo</strong><span>La calidad del sistema se construye con personas, procedimientos, proceso y seguimiento.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="gt-proof-ribbon" aria-label="Resultados validados en Yarumal">
        <div className="container gt-proof-ribbon__grid">
          <div className="gt-proof-ribbon__intro"><span>Evidencia operativa</span><strong>Resultados validados en Yarumal</strong></div>
          {yarumalClaims.map((claim) => <div key={claim.id}><strong>{claim.value}</strong><span>{claim.compactLabel}</span></div>)}
        </div>
      </section>

      <section className="gt-route-section gt-route-section--paper"><div className="container">
        <div className="gt-route-heading gt-route-heading--split"><div><span className="eyebrow">Nuestro criterio</span><h2>Una solución ambiental debe poder sostenerse después de la inauguración.</h2></div><p>Evaluamos la cadena completa para evitar que una inversión dependa de supuestos no probados sobre generación, costos, equipos, personal o mercado.</p></div>
        <div className="gt-decision-grid">{principles.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </div></section>

      <section className="gt-about-field-story">
        <div className="container">
          <div className="gt-route-heading gt-route-heading--split"><div><span className="eyebrow">Una mirada de sistema</span><h2>El valor no aparece en un solo equipo. Se construye a lo largo de toda la cadena.</h2></div><p>Greenatics trabaja en la frontera entre servicio público, ingeniería y bioeconomía. Por eso observa simultáneamente la calidad del material, el comportamiento del proceso, la disciplina operativa y el destino útil de cada salida.</p></div>
          <div className="gt-about-field-story__grid">
            {fieldScenes.map(([src, alt, title, copy], index) => <figure className={index === 0 ? "gt-about-field-story__lead" : undefined} key={title}><div><Image src={src} alt={alt} fill sizes={index === 0 ? "(max-width: 800px) 100vw, 58vw" : "(max-width: 800px) 100vw, 34vw"} /></div><figcaption><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{copy}</p></figcaption></figure>)}
          </div>
        </div>
      </section>

      <section className="gt-route-section gt-route-section--white"><div className="container">
        <div className="gt-route-heading"><span className="eyebrow">Capacidad interdisciplinaria</span><h2>El residuo cambia de estado; el equipo también debe cambiar de perspectiva.</h2><p>Una decisión robusta integra variables territoriales, físicas, biológicas, agronómicas, económicas y digitales.</p></div>
        <div className="gt-discipline-ledger">{disciplines.map(([title, copy, decision], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p><div><strong>Decisión que habilita</strong><p>{decision}</p></div></article>)}</div>
      </div></section>

      <section className="science-section"><div className="container science-grid">
        <div><span className="eyebrow eyebrow--light">Ciencia aplicada con límites claros</span><h2>Colaborar con conocimiento académico fortalece el proyecto, no borra la autoría.</h2><p>Comunicamos la relación con GIEM y la Universidad de Antioquia únicamente dentro de los proyectos y alcances documentados.</p><div className="button-row"><Link className="button button--outline-light" href="/tecnologia/">Conocer la base tecnológica</Link></div></div>
        <div className="science-facts">{collaborationBoundaries.map(([title, copy]) => <article key={title}><strong>{title}</strong><p>{copy}</p></article>)}</div>
      </div></section>

      <section className="gt-route-section gt-route-section--forest"><div className="container gt-operating-model">
        <div><span className="eyebrow eyebrow--light">Cómo trabajamos</span><h2>Partimos de la incertidumbre más costosa y avanzamos con evidencia.</h2><p>No todos los clientes necesitan una planta nueva. Algunos necesitan caracterizar, probar una ruta, rehabilitar infraestructura, estabilizar la operación o recuperar el control de sus datos.</p></div>
        <ol>
          <li><span>01</span><div><strong>Entender</strong><p>Problema, actores, flujos, restricciones y decisión pendiente.</p></div></li>
          <li><span>02</span><div><strong>Comparar</strong><p>Alternativas, riesgos, recursos y responsabilidades.</p></div></li>
          <li><span>03</span><div><strong>Implementar</strong><p>Ruta, infraestructura, procedimientos, equipo y formación.</p></div></li>
          <li><span>04</span><div><strong>Estabilizar</strong><p>Proceso, mantenimiento, calidad, producto y costos.</p></div></li>
          <li><span>05</span><div><strong>Medir y mejorar</strong><p>Indicadores, aprendizajes y decisiones de escalamiento.</p></div></li>
        </ol>
      </div></section>

      <section className="gt-route-closing"><div className="container gt-route-closing__inner"><div><span className="eyebrow">Construyamos el punto de partida</span><h2>Cuéntanos qué existe hoy y qué decisión necesitas tomar.</h2></div><Link className="button button--dark" href="/diagnostico/">Encontrar la ruta adecuada</Link></div></section>
    </>
  );
}
