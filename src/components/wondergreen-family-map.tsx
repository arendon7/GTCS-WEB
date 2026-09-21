import Link from "next/link";

const families = [
  {
    number: "01",
    label: "Base orgánica",
    title: "Compost",
    copy: "Prepara el sistema con materia orgánica y acondicionamiento antes de pedirle más al cultivo.",
    read: "Madurez, calidad, humedad, drenaje y objetivo del sustrato.",
    href: "/wondergreen/ciencia/",
    cta: "Entender la base",
  },
  {
    number: "02",
    label: "Nutrición por etapa",
    title: "Sólidos organominerales",
    copy: "2GROW, 2BALANCE, 2BLOOM y 2FRUIT ordenan la conversación nutricional según el momento del cultivo.",
    read: "Suelo, extracción, etapa fisiológica, carga y seguimiento.",
    href: "#solidos",
    cta: "Ver sólidos",
  },
  {
    number: "03",
    label: "Vía y operación",
    title: "Líquidos y bioles",
    copy: "Formulaciones solubles y bioinsumos líquidos amplían las opciones de aplicación cuando la ficha lo respalda.",
    read: "Agua, concentración, compatibilidad, equipo y frecuencia.",
    href: "#liquidos",
    cta: "Ver líquidos",
  },
  {
    number: "04",
    label: "Manejo integrado",
    title: "Bioinsumos",
    copy: "Referencias botánicas y microbiológicas para programas que comienzan en identificación, monitoreo y oportunidad.",
    read: "Problema, blanco, monitoreo, etiqueta y calidad de aplicación.",
    href: "#bioinsumos",
    cta: "Ver bioinsumos",
  },
] as const;

export function WondergreenFamilyMap() {
  return (
    <section className="wg-family-map" id="familias" aria-labelledby="wg-family-map-title">
      <div className="wg-family-map__heading">
        <div>
          <span className="eyebrow">Cómo leer el portafolio</span>
          <h2 id="wg-family-map-title">No todas las decisiones empiezan en la misma familia.</h2>
        </div>
        <p>
          La formulación orienta, pero el contexto decide. Esta vista ayuda a elegir por función
          y a llegar a la ficha con las preguntas correctas, sin convertir una referencia en una
          receta universal.
        </p>
      </div>
      <div className="wg-family-map__grid">
        {families.map((family) => (
          <article key={family.number}>
            <div className="wg-family-map__top"><span>{family.number}</span><small>{family.label}</small></div>
            <h3>{family.title}</h3>
            <p>{family.copy}</p>
            <div className="wg-family-map__read"><strong>Primero revisa</strong><span>{family.read}</span></div>
            <Link href={family.href}>{family.cta} <b aria-hidden="true">→</b></Link>
          </article>
        ))}
      </div>
    </section>
  );
}
