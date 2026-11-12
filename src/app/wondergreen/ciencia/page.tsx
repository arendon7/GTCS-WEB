import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Ciencia aplicada | Wondergreen",
  description: "Una lectura clara sobre materia orgánica, microbiología del suelo, organominerales y bioles para tomar mejores decisiones agronómicas.",
  alternates: { canonical: "/wondergreen/ciencia/" },
  openGraph: {
    title: "Ciencia aplicada | Wondergreen",
    description: "Una lectura clara sobre materia orgánica, microbiología del suelo, organominerales y bioles para tomar mejores decisiones agronómicas.",
    url: "/wondergreen/ciencia/",
    images: ["/products/wondergreen-soil-roots-editorial-og.jpg"],
  },
};

const connections = [
  ["Materia orgánica funcional", "Aporta una base orgánica al suelo. Su función se interpreta junto con el análisis del lote, el cultivo y el manejo."],
  ["Fertilizantes organominerales", "Integran nutrientes minerales y materia orgánica en una formulación cuya función y liberación dependen de sus características."],
  ["Bioles de digestión anaerobia", "Son la base del proceso de elaboración de los fertilizantes líquidos Wondergreen. La concentración y el uso de cada referencia se consultan en su ficha vigente, según el cultivo y sus condiciones."],
] as const;

export default function WondergreenSciencePage() {
  return (
    <>
      <ArticleJsonLd headline="Ciencia aplicada | Wondergreen" description="Una lectura clara sobre materia orgánica, microbiología del suelo, organominerales y bioles para tomar mejores decisiones agronómicas." url={`${site.url}/wondergreen/ciencia/`} about={["Materia orgánica funcional", "Fertilizantes organominerales", "Bioinsumos"]} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Wondergreen", url: `${site.url}/wondergreen/` }, { name: "Ciencia aplicada", url: `${site.url}/wondergreen/ciencia/` }]} />
      <div className="wg-bio-science-page">
      <section className="wg-bio-science-hero">
        <div className="container wg-bio-science-hero__grid">
          <div>
            <Link className="back-link back-link--light" href="/wondergreen/">← Volver a Wondergreen</Link>
            <h1>El suelo no recibe solo una fórmula. Recibe un sistema.</h1>
            <p className="lead">La materia orgánica, los nutrientes minerales, el agua y la actividad biológica interactúan en cada lote. Leer esas condiciones ayuda a definir qué formular, cómo aplicar y qué observar en el cultivo.</p>
          </div>
          <div className="wg-bio-science-hero__stamp">
            <Image
              className="wg-bio-science-hero__brand"
              src="/brand/wondergreen-nutrients.webp"
              alt="Wondergreen Nutrients"
              width={420}
              height={221}
              sizes="(max-width: 760px) 44vw, 180px"
            />
            <strong>Del nutriente al suelo vivo.</strong>
            <small>Cada lote combina condiciones de suelo, agua, cultivo y etapa productiva.</small>
          </div>
        </div>
      </section>

      <section className="wg-bio-science-section">
        <div className="container">
          <div className="wg-bio-science-heading"><div><h2>La nutrición del cultivo empieza por leer el suelo.</h2></div><p>La materia orgánica, los nutrientes minerales, el agua y la actividad biológica cumplen funciones distintas. Un programa agronómico las considera junto con el cultivo y su etapa; cada producto conserva su concentración y protocolo.</p></div>
          <div className="wg-bio-science-connections">
            <figure className="wg-bio-science-connections__art">
              <Image src="/products/wondergreen/science/wondergreen-soil-system-v01.jpg" alt="Materia orgánica en el suelo, raíces y una planta que conectan suelo, agua, nutrientes y cultivo." width={1536} height={1024} sizes="(max-width: 760px) 100vw, 52vw" />
              <span aria-hidden="true"><Image src="/brand/wondergreen-nutrients-transparent.png" alt="" width={120} height={63} /></span>
              <figcaption>El suelo integra materia orgánica, agua, nutrientes y actividad biológica.</figcaption>
            </figure>
            <div className="wg-bio-science-connections__stages">
              {connections.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="wg-matrix-story" aria-labelledby="wg-matrix-story-title">
        <div className="container">
          <div className="wg-bio-science-heading">
            <div><span className="eyebrow">Tecnología de formulación · 2GROW sólido</span><h2 id="wg-matrix-story-title">Peletizado da la forma. Oclusión integra la matriz.</h2></div>
            <p>2GROW sólido 15-3-3 combina materia orgánica y nutrientes minerales en pellets, en presentación de 40 kg. Su formulación está orientada a la liberación gradual durante establecimiento y crecimiento vegetativo; la disponibilidad y la respuesta dependen de las condiciones del lote.</p>
          </div>
          <div className="wg-matrix-story__layout">
            <figure className="wg-matrix-story__photo">
              <Image src="/products/wondergreen/science/wg-organomineral-pellet-v04.jpg" alt="Corte longitudinal de un pellet compacto marrón, con fibras y partículas minerales visibles en una matriz sobre suelo." width={1400} height={788} sizes="(max-width: 900px) 100vw, 58vw" />
              <figcaption>La matriz orgánica integra fracciones minerales a lo largo del pellet; composición y granulometría corresponden a cada referencia.</figcaption>
            </figure>
            <div className="wg-matrix-story__narrative">
              <span className="eyebrow">Qué significa para el manejo</span>
              <h3>La estructura orienta. El seguimiento permite evaluar.</h3>
              <p>La fracción mineral queda integrada en una matriz que incorpora materia orgánica. Su disponibilidad varía con la formulación, el suelo, la humedad, la temperatura y el manejo del cultivo.</p>
              <p>La liberación gradual es un atributo de diseño; por sí sola no demuestra una reducción de pérdidas de nitrógeno ni una mayor eficiencia. Esos resultados se valoran con mediciones específicas y seguimiento agronómico.</p>
            </div>
          </div>
          <div className="wg-matrix-story__actions"><Link href="/wondergreen/productos/2grow/">Consultar ficha de 2GROW sólido</Link><span>Eficiencia y pérdidas de NH₃ requieren mediciones para cada producto y condición.</span></div>
        </div>
      </section>

      <section className="wg-bio-science-research" id="evidencia-cientifica" aria-labelledby="wg-research-title">
        <div className="container">
          <div className="wg-bio-science-heading">
            <div><span className="eyebrow">Lectura de literatura científica</span><h2 id="wg-research-title">La eficiencia se demuestra midiendo pérdidas y respuesta.</h2></div>
            <p>Una matriz organomineral no garantiza por sí sola menos volatilización ni más rendimiento. La formulación, pH, temperatura, humedad, incorporación, suelo, cultivo y duración del ensayo pueden cambiar el resultado. Estos datos describen materiales estudiados, no referencias Wondergreen.</p>
          </div>
          <div className="wg-bio-science-research__grid">
            <article>
              <span>Fertilizantes organominerales · tomate</span>
              <h3>Una formulación específica mejoró el crecimiento en condiciones experimentales.</h3>
              <p>El estudio comparó un organomineral granulado de cama de pollo con formulaciones minerales. Reportó 15–28 % más biomasa aérea para esa formulación en tomate; el resultado no se puede trasladar a otra fórmula ni a una recomendación universal.</p>
              <a href="https://pubmed.ncbi.nlm.nih.gov/34838906/" target="_blank" rel="noreferrer">Ngo et al. (2022), Science of the Total Environment <span aria-hidden="true">↗</span></a>
            </article>
            <article>
              <span>Digestatos · disponibilidad de nitrógeno</span>
              <h3>El valor fertilizante varía ampliamente entre materiales y estudios.</h3>
              <p>Un metaanálisis de 40 estudios encontró alta variabilidad en el valor de reemplazo de nitrógeno. El digestato no es una categoría de desempeño uniforme: origen, tratamiento y suelo cambian el resultado.</p>
              <a href="https://doi.org/10.1016/j.eja.2025.127845" target="_blank" rel="noreferrer">Smit et al. (2026), European Journal of Agronomy <span aria-hidden="true">↗</span></a>
            </article>
            <article>
              <span>Digestato líquido · horticultura protegida</span>
              <h3>El balance de nutrientes puede requerir complementación.</h3>
              <p>En un ensayo con pak choi y digestato de una planta municipal, el digestato sin complementar mostró deficiencias de azufre y boro y una limitación inicial de fósforo. Con suplementación mineral seleccionada, el rendimiento comercial fue similar al fertilizante mineral estándar y la materia seca fue 17 % mayor; este resultado corresponde al material y al sistema ensayados.</p>
              <a href="https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2022.770179/full" target="_blank" rel="noopener noreferrer">Weimers et al. (2022), Frontiers in Plant Science <span aria-hidden="true">↗</span></a>
            </article>
          </div>
          <p className="wg-bio-science-research__limit"><strong>Límite de evidencia:</strong> no identificamos en estas fuentes ensayos de eficacia de las fórmulas Wondergreen. Para recomendar un producto se requiere su ficha vigente, análisis del lote y seguimiento agronómico.</p>
        </div>
      </section>

      <section className="wg-volatilization" aria-labelledby="wg-volatilization-title">
        <div className="container">
          <div className="wg-bio-science-heading">
            <div><span className="eyebrow">Nitrógeno · volatilización de NH₃</span><h2 id="wg-volatilization-title">Tres cifras. Tres preguntas experimentales distintas.</h2></div>
            <p>Los porcentajes no son comparables entre estudios sin normalizar material, suelo, cultivo, método y tiempo. La volatilización es una vía de pérdida; no equivale por sí sola a eficiencia agronómica ni a respuesta del cultivo.</p>
          </div>
          <div className="wg-volatilization__grid">
            <article className="wg-volatilization__study wg-volatilization__study--range">
              <span className="wg-volatilization__kicker">Incubación · 10 días</span>
              <strong className="wg-volatilization__number">3–4×</strong>
              <h3>Emisión de NH₃ frente al control mineral</h3>
              <p>En cuatro matrices de residuo usadas para OMF, las emisiones de amoníaco del ensayo fueron mayores que en el control mineral. Los autores reportan además alta dispersión entre matrices.</p>
              <div className="wg-volatilization__scale" role="img" aria-label="Escala relativa de cero a cuatro veces: el control mineral se marca en una vez y las matrices OMF ocupan el intervalo de tres a cuatro veces el control"><div className="wg-volatilization__scale-row"><span>Control mineral · 1×</span><div className="wg-volatilization__track"><i className="wg-volatilization__bar wg-volatilization__bar--control" /></div></div><div className="wg-volatilization__scale-row"><span>Matrices OMF · 3–4×</span><div className="wg-volatilization__track"><i className="wg-volatilization__bar wg-volatilization__bar--omf" /></div></div><div className="wg-volatilization__axis" aria-hidden="true"><span>0×</span><span>1×</span><span>2×</span><span>3×</span><span>4×</span></div></div>
              <small>Sitzmann et al. (2024) · incubación específica; no extrapolable a todo organomineral.</small>
              <a href="https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2024.1330843/full" target="_blank" rel="noopener noreferrer">Leer estudio primario ↗</a>
            </article>
            <article className="wg-volatilization__study">
              <span className="wg-volatilization__kicker">Invernadero · trigo · 36 días</span>
              <strong className="wg-volatilization__number">27–32<span>%</span></strong>
              <h3>Del N aplicado perdido como NH₃</h3>
              <p>Para Azoslow 29, un OMF evaluado en dos suelos, las pérdidas acumuladas fueron aproximadamente 27 % y 32 % del N aplicado. En LVd, la urea registró 26,26 %; no hubo diferencia estadística entre ambos en ese suelo.</p>
              <div className="wg-volatilization__paired" role="img" aria-label="Escala de cero a cuarenta por ciento: Azoslow 29, 27 por ciento en LVd y aproximadamente 32 por ciento en LVAd; urea, 26,26 por ciento en LVd"><div className="wg-volatilization__paired-row"><div><span>Azoslow 29 · LVd</span><b>27 %</b></div><i /></div><div className="wg-volatilization__paired-row"><div><span>Urea · LVd</span><b>26,26 %</b></div><i /></div><div className="wg-volatilization__paired-row"><div><span>Azoslow 29 · LVAd</span><b>≈32 %</b></div><i /></div><div className="wg-volatilization__paired-axis" aria-hidden="true"><span>0</span><span>20</span><span>40 %</span></div></div>
              <small>Amorim et al. (2025) · dos suelos, ambiente controlado; no prueba desempeño Wondergreen.</small>
              <a href="https://www.mdpi.com/3042-6111/1/1/4" target="_blank" rel="noopener noreferrer">Leer estudio primario ↗</a>
            </article>
            <article className="wg-volatilization__study wg-volatilization__study--method">
              <span className="wg-volatilization__kicker">Incubación · 90 días</span>
              <strong className="wg-volatilization__number">N mineral</strong>
              <h3>Disponibilidad medida; NH₃ no medida</h3>
              <p>Antille et al. siguieron la liberación de nitrógeno mineral en un OMF derivado de biosólidos. Es útil para estudiar disponibilidad temporal, pero ese ensayo no midió volatilización de amoníaco.</p>
              <div className="wg-volatilization__method-mark"><span>Disponibilidad</span><b>✓</b><span>NH₃</span><b>—</b></div>
              <small>Antille et al. (2014) · OMF15 15:4:4; incubación de laboratorio.</small>
              <a href="https://www.tandfonline.com/doi/full/10.1080/00103624.2014.907915" target="_blank" rel="noopener noreferrer">Leer estudio primario ↗</a>
            </article>
          </div>
          <p className="wg-volatilization__interpretation"><strong>Lectura técnica:</strong> “liberación gradual”, “menor volatilización de NH₃” y “mayor eficiencia de uso del N” son atributos/claims distintos. Para afirmar los dos últimos en un SKU Wondergreen hay que medirlos en un ensayo propio, comparado con un control adecuado.</p>
        </div>
      </section>

      <section className="wg-claim-proposal" aria-labelledby="wg-claim-proposal-title">
        <div className="container wg-claim-proposal__layout">
          <div><span className="eyebrow">Línea de desarrollo · revisión técnica pendiente</span><h2 id="wg-claim-proposal-title">Un claim ambicioso merece un ensayo capaz de sostenerlo.</h2><p>La matriz ocluida está diseñada para integrar nutrientes y materia orgánica y favorecer una disponibilidad progresiva. La oportunidad que queremos evaluar es si esa arquitectura reduce pérdidas de nitrógeno y mejora el aprovechamiento por el cultivo.</p></div>
          <div className="wg-claim-proposal__panel">
            <p className="wg-claim-proposal__claim">“Matriz organomineral de liberación gradual: diseñada para reducir pérdidas de N por volatilización y mejorar su aprovechamiento por el cultivo.”</p>
            <span className="wg-claim-proposal__status">Claim candidato · sujeto a ensayo Wondergreen por SKU</span>
            <h3>Protocolo preliminar para revisión agronómica</h3>
            <ol><li>Comparar control sin N, fuente mineral de referencia y SKU organomineral con igual aporte nominal de N.</li><li>Explorar 50 %, 75 % y 100 % de la dosis de N definida por análisis y recomendación del cultivo; son tratamientos experimentales, no dosis de uso.</li><li>Medir NH₃ acumulado (% del N aplicado), N mineral en el tiempo, absorción de N y rendimiento/calidad al cierre.</li></ol>
            <p className="wg-claim-proposal__metric"><strong>Indicador primario:</strong> pérdida acumulada de NH₃ como % del N aplicado. <strong>Indicador agronómico:</strong> eficiencia aparente = (N absorbido con fertilización − N absorbido en control) ÷ N aplicado. Definir método, replicación y análisis estadístico antes de iniciar.</p>
          </div>
        </div>
      </section>

      <section className="wg-bio-science-evidence">
        <div className="container">
          <div className="wg-bio-science-heading wg-bio-science-heading--light"><div><h2>La recomendación se define con información del lote.</h2></div><p>Antes de elegir una formulación, conviene revisar el análisis del suelo, el estado del cultivo, el agua y el sistema de aplicación. El seguimiento permite comparar lo observado con el objetivo del programa y ajustar la decisión.</p></div>
          <Link className="wg-bio-science-evidence__link" href="/servicios/programas-wondergreen/">Conocer los programas agronómicos Wondergreen →</Link>
        </div>
      </section>

      <section className="wg-bio-science-model">
        <div className="container">
          <div className="wg-bio-science-heading"><div><h2>El seguimiento también hace parte del programa.</h2></div><p>La aplicación es un punto de partida. La lectura posterior del cultivo permite revisar si el manejo responde al objetivo y a las condiciones observadas.</p></div>
          <div className="wg-bio-science-flow" aria-label="Relación entre materia orgánica, suelo, disponibilidad de nutrientes y respuesta del cultivo"><div><strong>Materia orgánica</strong><small>Base orgánica</small></div><b>→</b><div><strong>Entorno del suelo</strong><small>Retención y actividad</small></div><b>→</b><div><strong>Ciclado de nutrientes</strong><small>Disponibilidad</small></div><b>→</b><div><strong>Respuesta del cultivo</strong><small>Señales y registros</small></div></div>
          <p className="wg-bio-science-caption"><strong>El contexto importa.</strong> pH, textura, humedad, clima, carbono, formulación, calidad del agua y manejo influyen en la respuesta. Por eso el programa se ajusta con información del lote, no con una dosis universal.</p>
        </div>
      </section>

      <section className="wg-bio-science-program">
        <div className="container"><div className="wg-bio-science-heading"><div><h2>Productos con funciones distintas dentro del manejo.</h2></div><p>La selección considera el objetivo agronómico, el cultivo, su etapa y las condiciones del lote. La ficha vigente de cada referencia orienta su concentración, uso y protocolo.</p></div><div className="wg-bio-science-program__grid"><article><h3>Sólidos organominerales</h3><p>Integran nutrientes y materia orgánica en una matriz orientada a la liberación gradual, según la formulación y las condiciones del lote.</p><Link href="/wondergreen/productos/2grow/">Consultar 2GROW sólido →</Link></article><article><h3>Fertilizantes líquidos</h3><p>Se elaboran a partir de bioles de digestión anaerobia multietapa. La concentración, la etapa y las condiciones de uso se consultan en la ficha vigente de cada referencia.</p><Link href="/wondergreen/#liquidos">Explorar la línea líquida →</Link></article><article><h3>Bioinsumos</h3><p>Incluyen extractos botánicos y microorganismos para integrar al manejo, de acuerdo con su documentación y las condiciones de uso.</p><Link href="/wondergreen/#bioinsumos">Consultar bioinsumos →</Link></article></div></div>
      </section>

      <section className="wg-bio-science-boundary"><div className="container wg-bio-science-boundary__grid"><div><h2>Cada recomendación se ajusta al producto y al lote.</h2></div><ul><li>Los sólidos organominerales ocluidos integran nutrientes y materia orgánica y están orientados a una liberación gradual. Su disponibilidad depende de las condiciones del lote y requiere seguimiento.</li><li>Los fertilizantes líquidos de base biológica se elaboran con bioles de digestión anaerobia multietapa.</li><li>La dosis, mezcla y frecuencia se consultan en la ficha vigente y se ajustan al cultivo, el agua, el suelo y el protocolo de aplicación.</li></ul></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><h2>Conecta el programa con tu cultivo y su etapa.</h2></div><div className="button-row"><Link className="button button--dark" href="/servicios/programas-wondergreen/">Explorar programas agronómicos</Link><Link className="button button--ghost" href="/wondergreen/">Volver a Wondergreen</Link></div></div></section>
      </div>
    </>
  );
}
