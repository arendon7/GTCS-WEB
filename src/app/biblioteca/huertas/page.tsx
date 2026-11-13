import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";
import "./urban-guide.css";

export const metadata: Metadata = {
  title: "Guía para huertas urbanas, escolares y comunitarias",
  description: "Prepara una huerta según espacio, agua, sustrato y capacidad de cuidado. Orientación para hogares y proyectos colectivos.",
  alternates: { canonical: "/biblioteca/huertas/" },
};

export default function GardensGuidePage() {
  const url = `${site.url}/biblioteca/huertas/`;
  return <div className="urban-guide">
    <ArticleJsonLd headline="Guía para huertas urbanas, escolares y comunitarias" description="Orientación para planear, establecer y acompañar una huerta según su contexto." url={url} about={["Huerta urbana", "Huerta escolar", "Huerta comunitaria", "Compost", "Agricultura urbana"]} />
    <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Biblioteca", url: `${site.url}/biblioteca/` }, { name: "Guía de huertas", url }]} />
    <section className="urban-guide__opening"><div className="container urban-guide__hero">
      <div><Link className="back-link" href="/biblioteca/">Volver a Biblioteca</Link><span className="eyebrow">Huertas · orientación práctica</span>
        <h1>Una buena huerta empieza por el sistema, no por el fertilizante.</h1>
        <p className="lead">Elige qué cultivar a partir del espacio, la luz, el agua y el cuidado que puedes sostener. Después revisa suelo o sustrato, drenaje y estado de la planta antes de decidir su nutrición.</p>
        <a className="button button--dark" href="#preparar-huerta">Preparar mi huerta</a>
      </div>
      <figure><Image src="/guides/casa-hierbas-editorial.jpg" alt="Albahaca, cilantro, perejil, tomillo y romero en recipientes de una huerta doméstica" fill sizes="(max-width: 760px) 100vw, 42vw" /></figure>
    </div></section>
    <section className="urban-guide__section" id="preparar-huerta"><div className="container urban-guide__preparation">
      <div><span className="eyebrow">Antes de sembrar</span><h2>Diseña una rutina que el espacio pueda sostener.</h2></div>
      <div><h3>Define el cultivo y sus condiciones</h3><p>Relaciona qué quieres cultivar, para quién y en cuánto espacio con la disponibilidad real de luz, agua y cuidado. En una matera, revisa volumen y drenaje; en una cama, la condición del suelo y el manejo que tendrá.</p>
        <h3>Prepara y establece sin apresurar la nutrición</h3><p>Revisa el contenedor o cama, sustrato y materia orgánica antes de sembrar. Al trasplantar, observa cómo se adapta la planta: su estado orienta el siguiente paso, no una receta automática de fertilizante.</p>
        <Link className="text-link" href="/casa-jardin/guias/">Consultar guías de observación y trasplante</Link>
      </div>
    </div></section>
    <section className="urban-guide__section urban-guide__section--soft"><div className="container">
      <div className="urban-guide__heading"><h2>Una huerta de hojas no sigue necesariamente la ruta del fruto.</h2><p>Albahaca, cilantro, perejil, tomillo y romero pueden cultivarse por sus hojas. FRUCTIFICA se consulta para especies que formen fruto y estén en esa etapa; no todas las plantas necesitan recorrer cada momento.</p></div>
      <div className="urban-guide__care"><h3>Observar para ajustar el cuidado</h3><p>Relaciona crecimiento, humedad, raíces, sanidad y etapa. La referencia Wondergreen se elige por objetivo y condición; dosis y frecuencia se confirman en la etiqueta vigente. El compost puede considerarse en la base del sistema cuando su uso sea técnicamente apropiado.</p><p>Primero identifica la causa de un problema; luego evalúa el manejo complementario. Al cosechar, registra qué funcionó, aprovecha la biomasa que corresponda y ajusta el siguiente cultivo.</p>
        <Link className="text-link" href="/casa-jardin/#diagnostico">Orientar el cuidado de mis plantas</Link>
      </div>
    </div></section>
    <section className="urban-guide__section"><div className="container urban-guide__contexts">
      <div><span className="eyebrow">El contexto cambia la organización</span><h2>En casa, una rutina. En comunidad, responsabilidades compartidas.</h2><p>Una huerta doméstica o en materas necesita un cuidado que el hogar pueda mantener. En una huerta comunitaria, acuerda roles, calendario y registro de siembra, riego, observaciones y cosecha.</p><Link className="text-link" href="/casa-jardin/kits/mi-huerta/">Explorar la ruta del kit Mi Huerta</Link></div>
      <div><h3>Huertas escolares y proyectos territoriales</h3><p>En un colegio, el aprendizaje agronómico y ambiental requiere gestión institucional y responsables adultos. En un proyecto territorial, la huerta puede conectarse con educación ambiental, compostaje, viveros y aprovechamiento de orgánicos.</p><p>Greenatics puede acompañar la lectura del contexto y la preparación del proyecto. Una compra para hogar y una intervención institucional tienen alcances distintos: conversemos sobre el tuyo.</p><Link className="text-link" href="/municipios/">Conocer el acompañamiento territorial</Link></div>
    </div></section>
    <section className="urban-guide__closing"><div className="container urban-guide__closing-inner"><div><h2>Construyamos una ruta para tu huerta.</h2><p>Comparte espacio, cultivos, exposición, agua y responsables de cuidado. No hay una dosis universal: especie, volumen de sustrato, etapa y estado de la planta cambian la necesidad.</p></div><Link className="button button--light" href="/contacto/?interes=programas-wondergreen&perfil=agro&diagnostico=Huerta%20urbana%2C%20escolar%20o%20comunitaria">Consultar mi proyecto de huerta</Link></div></section>
  </div>;
}
