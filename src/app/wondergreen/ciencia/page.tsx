import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ciencia aplicada | Wondergreen",
  description: "Una lectura clara sobre materia orgánica, microbiología del suelo, organominerales y bioles para tomar mejores decisiones agronómicas.",
  alternates: { canonical: "/wondergreen/ciencia/" },
};

const connections = [
  ["01", "Materia orgánica funcional", "Aporta una base que puede mejorar el entorno físico, químico y biológico del suelo y favorecer el ciclado de nutrientes."],
  ["02", "Orgánico + mineral", "La combinación puede apoyar carbono del suelo, biomasa microbiana y productividad, siempre según suelo, cultivo, clima y manejo."],
  ["03", "Bioles y digestatos", "Pueden aportar nutrientes disponibles y una fracción orgánica o biológica asociada al proceso; su efecto depende de la calidad del producto y del carbono residual."],
] as const;

const evidence = [
  ["219 estudios", "Meta-análisis sobre enmiendas orgánicas y diversidad microbiana del suelo."],
  ["+6,81 a +17,47%", "Intervalo de mejora de rendimiento reportado para esquemas orgánico + mineral en la literatura revisada."],
  ["0,78 ± 0,13", "Valor relativo promedio de reemplazo de nitrógeno reportado para digestatos, con alta variabilidad entre productos y suelos."],
] as const;

export default function WondergreenSciencePage() {
  return (
    <div className="wg-bio-science-page">
      <section className="wg-bio-science-hero">
        <div className="container wg-bio-science-hero__grid">
          <div>
            <Link className="back-link back-link--light" href="/wondergreen/">← Volver a Wondergreen</Link>
            <span className="eyebrow eyebrow--light">Ciencia aplicada · lectura editorial</span>
            <h1>El suelo no recibe solo una fórmula. Recibe un sistema.</h1>
            <p className="lead">La materia orgánica, los nutrientes minerales, el agua y la microbiología se encuentran en el lote. Entender esa relación ayuda a elegir mejor, aplicar con más criterio y observar qué cambia después.</p>
          </div>
          <div className="wg-bio-science-hero__stamp"><span>Wondergreen</span><strong>Del nutriente al suelo vivo.</strong><small>Una explicación para decidir sin convertir la evidencia en una promesa universal.</small></div>
        </div>
      </section>

      <section className="wg-bio-science-section">
        <div className="container">
          <div className="wg-bio-science-heading"><div><span className="eyebrow">Tres conexiones que importan</span><h2>La utilidad agronómica aparece cuando las piezas se leen juntas.</h2></div><p>La literatura revisada apoya un discurso de entorno del suelo, eficiencia y productividad condicionada. No autoriza a convertir cualquier formulación en un inoculante ni en una receta única.</p></div>
          <div className="wg-bio-science-connections">{connections.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="wg-bio-science-evidence">
        <div className="container">
          <div className="wg-bio-science-heading wg-bio-science-heading--light"><div><span className="eyebrow eyebrow--light">Evidencia de contexto</span><h2>Cifras para dimensionar, no para prometer un resultado automático.</h2></div><p>Son datos de la literatura científica reunida en los soportes consultados. No representan ensayos propios de Wondergreen ni sustituyen una medición del lote.</p></div>
          <div className="wg-bio-science-stats">{evidence.map(([stat, copy]) => <article key={stat}><strong>{stat}</strong><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="wg-bio-science-model">
        <div className="container">
          <div className="wg-bio-science-heading"><div><span className="eyebrow">Cómo leer el mecanismo</span><h2>La ruta no termina al aplicar.</h2></div><p>La recomendación gana valor cuando conecta lo que entra al suelo con lo que puede observarse, registrarse y ajustar.</p></div>
          <div className="wg-bio-science-flow" aria-label="Relación conceptual entre materia orgánica, microbiología, nutrientes y cultivo"><div><span>01</span><strong>Materia orgánica</strong><small>Base y sustrato</small></div><b>→</b><div><span>02</span><strong>Entorno del suelo</strong><small>Retención, intercambio y actividad</small></div><b>→</b><div><span>03</span><strong>Ciclado del nutriente</strong><small>Disponibilidad y aprovechamiento</small></div><b>→</b><div><span>04</span><strong>Respuesta observable</strong><small>Seguimiento del cultivo</small></div></div>
          <p className="wg-bio-science-caption"><strong>La magnitud cambia.</strong> pH, textura, humedad, clima, carbono, sustrato, formulación, calidad del agua y manejo modifican la respuesta. Por eso esta ruta explica el criterio, pero no reemplaza el diagnóstico.</p>
        </div>
      </section>

      <section className="wg-bio-science-program">
        <div className="container"><div className="wg-bio-science-heading"><div><span className="eyebrow">Traducción al portafolio</span><h2>Wondergreen trabaja por función, etapa y seguimiento.</h2></div><p>La ciencia se vuelve útil cuando organiza decisiones concretas, desde la base edáfica hasta la aplicación biológica dirigida.</p></div><div className="wg-bio-science-program__grid"><article><span>Base</span><h3>Sólidos organominerales</h3><p>Construyen una conversación sobre nutrición edáfica, materia orgánica funcional y etapa productiva.</p><Link href="/wondergreen/productos/2grow/">Ver una referencia sólida →</Link></article><article><span>Disponibilidad</span><h3>Formulaciones líquidas</h3><p>Amplían las vías de aplicación y permiten trabajar la nutrición soluble dentro de un programa.</p><Link href="/wondergreen/#liquidos">Explorar línea líquida →</Link></article><article><span>Integración</span><h3>Bioinsumos</h3><p>Entran al manejo integrado cuando existe objetivo, oportunidad, compatibilidad, documentación y seguimiento.</p><Link href="/wondergreen/#bioinsumos">Ver referencias biológicas →</Link></article></div></div>
      </section>

      <section className="wg-bio-science-boundary"><div className="container wg-bio-science-boundary__grid"><div><span className="eyebrow eyebrow--light">Límites que protegen la credibilidad</span><h2>Decir más no significa decir cualquier cosa.</h2></div><ul><li>La materia orgánica puede favorecer el entorno del suelo; no asegura por sí sola un rendimiento.</li><li>Un biol puede aportar nutrientes y una fracción asociada al proceso; no se presenta como inoculante sin caracterización.</li><li>Una dosis, mezcla o eficacia se comunica solo con ficha, etiqueta, registro y recomendación vigentes.</li></ul></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Pasar de la lectura a la decisión</span><h2>Conecta la ciencia con tu cultivo, tu lote y tu momento.</h2></div><div className="button-row"><Link className="button button--dark" href="/wondergreen/fitosanidad/">Abrir manejo integrado</Link><Link className="button button--ghost" href="/wondergreen/">Volver al portafolio</Link></div></div></section>
    </div>
  );
}
