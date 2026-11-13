import Link from "next/link";

const liquidLines = [
  {
    family: "2GROW",
    summary: "Una línea con dos concentraciones: 100-20-20 para crecimiento vegetativo y 200-0-0 como su formulación de mayor concentración de nitrógeno.",
    href: "/wondergreen/productos/2grow-liquido/",
    formulations: [
      {
        formula: "100-20-20",
        stage: "Crecimiento vegetativo",
      },
      {
        formula: "200-0-0",
        stage: "Mayor concentración de nitrógeno de la línea",
      },
    ],
  },
  {
    family: "2BALANCE",
    summary: "Formato líquido de base biológica para integrar al programa de nutrición y mantenimiento del cultivo.",
    href: "/wondergreen/productos/2balance-liquido/",
    formulations: [
      {
        formula: "70-70-70",
        stage: "Equilibrio y transición",
      },
    ],
  },
  {
    family: "2BLOOM",
    summary: "Referencia líquida para integrar al programa de floración y transición reproductiva del cultivo.",
    href: "/wondergreen/productos/2bloom-liquido/",
    formulations: [
      {
        formula: "30-80-30",
        stage: "Floración y cuajado",
      },
    ],
  },
  {
    family: "2FRUIT",
    summary: "Formato líquido de base biológica para acompañar el desarrollo del fruto dentro de un manejo técnico.",
    href: "/wondergreen/productos/2fruit-liquido/",
    formulations: [
      {
        formula: "30-30-80",
        stage: "Llenado y fase productiva",
      },
    ],
  },
] as const;

export function WondergreenLiquidLines() {
  return (
    <div className="wg-liquid-lines" id="liquidos">
      <div className="wg-liquid-lines__intro">
        <div>
          <span className="eyebrow">Línea líquida</span>
          <h3>Cuatro líneas, cinco formulaciones.</h3>
          <p className="editorial-justify">Las líneas líquidas se elaboran a partir de bioles de digestión anaerobia multietapa. Cada formulación se orienta a una etapa distinta; confirma concentración, uso y condiciones en la ficha vigente. Las dos concentraciones de 2GROW pertenecen a una misma línea.</p>
          <div className="wg-liquid-lines__dose-note"><div><span>Biol Wondergreen · dilución documentada</span><strong>1 L en 100 L de agua</strong></div><p>Referencia para fertirriego o aplicación edáfica. La cantidad total, frecuencia y vía se ajustan al cultivo, etapa, suelo, clima, concentración y etiqueta vigente.</p><Link href="/wondergreen/productos/biol/">Leer ficha de Biol Wondergreen →</Link></div>
        </div>
        <figure className="wg-liquid-lines__visual">
          <div className="wg-liquid-lines__visual-media">
            <img src="/products/wondergreen-line-liquidos.jpg" alt="Vaso con líquido oscuro junto a una planta joven en suelo agrícola." width={1254} height={1254} loading="lazy" decoding="async" />
          </div>
          <figcaption>Bioles de digestión anaerobia y formulación para la línea líquida.</figcaption>
        </figure>
      </div>

      <p className="wg-liquid-lines__presentation-note">Las fórmulas se muestran como referencias técnicas; etiqueta, presentación y disponibilidad se confirman con el equipo.</p>
      <div className="wg-liquid-lines__grid" aria-label="Cuatro líneas y cinco formulaciones líquidas Wondergreen">
        {liquidLines.map((line) => (
          <article key={line.family} className={`wg-liquid-lines__card wg-liquid-lines__card--${line.family.toLowerCase()}`}>
            <h4>{line.family}</h4>
            <div className="wg-liquid-lines__formulations" aria-label={`${line.formulations.length} ${line.formulations.length === 1 ? "formulación" : "formulaciones"}`}>
              {line.formulations.map((formulation) => (
                <div className="wg-liquid-lines__formulation" key={formulation.formula}>
                  <strong>{formulation.formula}</strong>
                  <span>{formulation.stage}</span>
                </div>
              ))}
            </div>
            <p>{line.summary}</p>
            <Link href={line.href}>Ver ficha de {line.family} →</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
