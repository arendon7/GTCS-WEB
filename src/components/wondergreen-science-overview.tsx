import Image from "next/image";
import Link from "next/link";

const layers = [
  {
    number: "01",
    title: "Nutrientes",
    copy: "La fórmula N-P-K se define por el objetivo y el momento fisiológico del cultivo.",
    className: "wg-science-layer--nutrients",
  },
  {
    number: "02",
    title: "Matriz orgánica",
    copy: "La fracción orgánica acompaña los nutrientes y cambia el contexto de contacto con el suelo.",
    className: "wg-science-layer--matrix",
  },
  {
    number: "03",
    title: "Suelo y raíz",
    copy: "La respuesta depende de humedad, pH, temperatura, biología, raíces y manejo del lote.",
    className: "wg-science-layer--soil",
  },
] as const;

const verificationItems = [
  ["Ficha vigente", "Composición, concentración, lote y presentación."],
  ["Condición de uso", "Dosis, vía, momento, mezcla y almacenamiento."],
  ["Lectura del lote", "Análisis, etapa, agua, síntomas y objetivo productivo."],
  ["Seguimiento", "Qué observar, qué registrar y cuándo ajustar."],
] as const;

export function WondergreenScienceOverview() {
  return (
    <section className="wg-science" id="ciencia">
      <div className="container">
        <div className="wg-science__heading">
          <div>
            <span className="eyebrow">Ciencia Wondergreen</span>
            <h2>La nutrición funciona mejor cuando se entiende la relación entre fórmula, matriz y suelo.</h2>
          </div>
          <p>
            Wondergreen reúne nutrición organomineral, compost, formulaciones líquidas y bioinsumos en un sistema por etapas. No se trata de aplicar una referencia aislada: se trata de poner cada herramienta en el lugar correcto y comprobar qué ocurre en el cultivo.
          </p>
        </div>

        <div className="wg-science__main">
          <article className="wg-science__diagram">
            <div className="wg-science__diagram-top">
              <span className="wg-science__index">CÓMO LEERLO</span>
              <strong>Oclusión: una relación, no una promesa automática.</strong>
            </div>
            <div className="wg-science-layers" role="img" aria-label="Diagrama conceptual de nutrientes asociados a una matriz orgánica y su interacción con el suelo y la raíz">
              {layers.map((layer) => (
                <div className={`wg-science-layer ${layer.className}`} key={layer.number}>
                  <span>{layer.number}</span>
                  <div>
                    <strong>{layer.title}</strong>
                    <p>{layer.copy}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="wg-science__caption">
              En este contexto, <strong>ocluir</strong> significa asociar parte de los nutrientes a una matriz orgánica dentro del fertilizante. Esa arquitectura puede favorecer un contacto y una entrega más gradual, pero la disponibilidad real siempre se verifica en función de la formulación, el suelo, el clima y el manejo.
            </p>
          </article>

          <aside className="wg-science__source">
            <Image src="/guides/catalogo-cover-hd.png" alt="Portada del catálogo técnico Wondergreen con sólidos, líquidos y bioinsumos" fill sizes="(max-width: 900px) 100vw, 30vw" />
            <div className="wg-science__source-overlay">
              <span>Fuente de consulta</span>
              <strong>Catálogo técnico y comercial</strong>
              <Link href="/biblioteca/catalogo-wondergreen/">Leer el sistema completo →</Link>
            </div>
          </aside>
        </div>

        <div className="wg-science__paths">
          <article className="wg-science-path wg-science-path--solid">
            <div className="wg-science-path__media">
              <Image src="/products/wondergreen-2grow.webp" alt="Fertilizante organomineral sólido Wondergreen 2GROW" fill sizes="(max-width: 760px) 100vw, 22vw" />
            </div>
            <div>
              <span className="wg-science-path__kicker">Ruta sólida · nutrición organomineral</span>
              <h3>Una matriz formulada para acompañar una etapa.</h3>
              <p>2GROW, 2BALANCE, 2BLOOM y 2FRUIT permiten ordenar el aporte nutricional según establecimiento, mantenimiento, transición reproductiva o fase productiva. El nombre de la etapa orienta; la dosis y la frecuencia se definen con ficha, diagnóstico y recomendación.</p>
              <Link className="text-link" href="/wondergreen/productos/2grow/">Ver una referencia sólida →</Link>
            </div>
          </article>

          <article className="wg-science-path wg-science-path--liquid">
            <div className="wg-science-path__media wg-science-path__media--liquid" aria-hidden="true">
              <span className="wg-science-bubble wg-science-bubble--one">BIO</span>
              <span className="wg-science-bubble wg-science-bubble--two">MICRO</span>
              <span className="wg-science-bubble wg-science-bubble--three">SUELO</span>
            </div>
            <div>
              <span className="wg-science-path__kicker">Ruta líquida · bioinsumo y nutrición soluble</span>
              <h3>Biología para integrar al programa, no para reemplazar el diagnóstico.</h3>
              <p>La línea líquida reúne nutrición soluble y referencias biológicas. Cuando la ficha del producto documenta actividad biológica o microorganismos, esa base puede integrarse al programa junto con los componentes solubles. La composición, concentración, objetivo, compatibilidad y condición regulatoria se revisan por producto antes de definir dosis o mezclas.</p>
              <Link className="text-link" href="/wondergreen/compatibilidad/">Revisar compatibilidad y manejo →</Link>
            </div>
          </article>
        </div>

        <div className="wg-science__verification">
          <div>
            <span className="eyebrow">Antes de aplicar</span>
            <h3>La ciencia se convierte en resultado cuando se aplica con criterio.</h3>
            <p>Una recomendación sólida conecta la información técnica de la referencia con la lectura del lote y un seguimiento que permita ajustar a tiempo.</p>
          </div>
          <ul>
            {verificationItems.map(([title, copy], index) => (
              <li key={title}><span>0{index + 1}</span><div><strong>{title}</strong><p>{copy}</p></div></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
