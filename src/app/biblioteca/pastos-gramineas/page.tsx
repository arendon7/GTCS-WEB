import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";
import "./pasture-guide.css";

export const metadata: Metadata = {
  title: "Nutrición y manejo de pastos y praderas",
  description: "Relaciona suelo, rebrote, corte o pastoreo y referencias Wondergreen para preparar un programa agronómico por lote.",
  alternates: { canonical: "/biblioteca/pastos-gramineas/" },
};

export default function PasturesKnowledgePage() {
  const url = `${site.url}/biblioteca/pastos-gramineas/`;
  return (
    <div className="pasture-guide">
      <ArticleJsonLd headline="Nutrición y manejo de pastos y praderas" description="Orientación para preparar una revisión de suelo, manejo y nutrición del sistema forrajero." url={url} about={["Pastos", "Gramíneas", "Ganadería", "Nutrición vegetal", "2GROW"]} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Biblioteca", url: `${site.url}/biblioteca/` }, { name: "Pastos y gramíneas", url }]} />
      <section className="pasture-guide__opening">
        <div className="container pasture-guide__hero">
          <div>
            <Link className="back-link" href="/biblioteca/">Volver a Biblioteca</Link>
            <span className="eyebrow">Wondergreen · sistemas forrajeros</span>
            <h1>El programa del potrero empieza por entender su respuesta.</h1>
            <p className="lead">Antes de elegir un fertilizante, relaciona suelo, especie forrajera, humedad y manejo del corte o pastoreo. Esa lectura permite preparar un programa para establecer, recuperar o mantener la pradera, según las condiciones de cada lote.</p>
            <Link className="button button--dark" href="/wondergreen/cultivos/pastos-gramineas/">Explorar la ruta para pastos y praderas</Link>
          </div>
          <figure className="pasture-guide__cover">
            <Image src="/guides/guia-pastos-cover.webp" alt="Portada de la Guía Wondergreen para pastos y praderas" width={662} height={936} sizes="(max-width: 760px) 240px, 290px" />
            <figcaption>Nutrición, rebrote y manejo del potrero: una lectura conjunta para preparar la revisión técnica.</figcaption>
          </figure>
        </div>
      </section>
      <section className="pasture-guide__section">
        <div className="container pasture-guide__reading">
          <div><span className="eyebrow">Leer el lote</span><h2>¿Falta nutrición o hay otra limitación?</h2></div>
          <div>
            <p>Un bajo rebrote, poca biomasa o pérdida de cobertura no explican por sí solos qué necesita el potrero. Revisa qué ocurrió después del último corte o pastoreo y si hay sequía, exceso de humedad, compactación o limitaciones de raíces.</p>
            <p>Relaciona esas observaciones con la fertilización reciente y su respuesta. Define también si buscas una recuperación puntual o sostener el sistema: el objetivo cambia la información que debemos revisar antes de intervenir.</p>
            <Link className="text-link" href="/biblioteca/guia-deficiencias/#pastos">Revisar señales de campo en pastos</Link>
          </div>
        </div>
      </section>
      <section className="pasture-guide__section pasture-guide__section--soft">
        <div className="container pasture-guide__program">
          <div>
            <span className="eyebrow">Productos dentro del programa</span>
            <h2>La referencia se elige después de la lectura agronómica.</h2>
            <p>2GROW es la línea que se consulta para nutrición vegetativa en esta ruta. Floración y llenado no son el eje del sistema forrajero, por lo que 2BLOOM y 2FRUIT no se incorporan como base automática.</p>
            <Link className="text-link" href="/wondergreen/productos/2grow/">Conocer la referencia 2GROW</Link>
          </div>
          <div>
            <h3>Suelo, nutrición y seguimiento conectados</h3>
            <p>El compost se considera dentro del acondicionamiento y manejo de materia orgánica. Los bioinsumos y productos líquidos se revisan como complementos cuando el objetivo, el producto y sus condiciones de uso están validados, no como sustitutos universales de la nutrición.</p>
            <p>El acompañamiento técnico relaciona análisis de suelo, condición del lote, respuesta al corte o pastoreo y seguimiento. Especie, ambiente y nivel productivo impiden extrapolar una dosis entre potreros.</p>
            <Link className="text-link" href="/servicios/programas-wondergreen/">Ver el acompañamiento agronómico Wondergreen</Link>
          </div>
        </div>
      </section>
      <section className="pasture-guide__closing">
        <div className="container pasture-guide__closing-inner">
          <div><h2>Conversemos sobre tu pradera, no sobre una receta genérica.</h2><p>Comparte el análisis disponible, especie, manejo reciente, humedad y patrón de respuesta del potrero. Con ese contexto podemos preparar la revisión del programa.</p></div>
          <Link className="button button--light" href="/contacto/?interes=programas-wondergreen&perfil=agro&diagnostico=Pastos%20y%20praderas">Solicitar acompañamiento para mi pradera</Link>
        </div>
      </section>
    </div>
  );
}
