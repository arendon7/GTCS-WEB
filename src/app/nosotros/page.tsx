import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./nosotros.module.css";
import { yarumalClaims } from "@/data/claims";

export const metadata: Metadata = {
  title: "Ingeniería, operación y bioeconomía circular",
  description: "Conoce el enfoque de Greenatics para convertir residuos orgánicos en sistemas operables, medibles y conectados con valor territorial.",
  alternates: { canonical: "/nosotros/" },
};

const fieldScenes = [
  {
    src: "/technology/organic-treatment-routes-concept.jpg",
    alt: "Compostaje abierto y digestión anaerobia como rutas distintas para tratar residuos orgánicos.",
    title: "Cada corriente necesita una ruta propia",
    copy: "La composición, la escala, el sitio y la operación posible orientan qué alternativa conviene estudiar antes de definir infraestructura o aprovechamiento.",
  },
  {
    src: "/products/wondergreen-soil-roots-editorial.webp",
    alt: "Raíces de una planta joven en suelo agrícola",
    title: "Del proceso al cultivo",
    copy: "Wondergreen conecta compost, nutrición y bioinsumos con el suelo y las necesidades del cultivo, sin reemplazar el diagnóstico de cada lote.",
  },
];

const capabilities = [
  {
    title: "Ingeniería ambiental y bioprocesos",
    copy: "Caracterizamos corrientes, construimos balances de masa y entendemos compostaje y digestión anaerobia. Esa lectura ayuda a definir escalas, etapas, controles y salidas que vale la pena evaluar.",
  },
  {
    title: "Operación, logística y datos",
    copy: "Conectamos separación, microrrutas, recepción, mantenimiento, seguridad y continuidad con registros de pesajes, lotes, inventarios e indicadores. Así, el diseño responde a las condiciones del servicio y no solo a un plano.",
  },
  {
    title: "Agronomía, suelo y producto",
    copy: "Relacionamos la calidad de los materiales con el suelo, el cultivo, su etapa y las referencias Wondergreen pertinentes. La aplicación se define con criterio agronómico y de acuerdo con las condiciones del lote.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <section className={`gt-route-hero gt-route-hero--company ${styles.hero}`}>
        <div className="container gt-route-hero__grid">
          <div className="gt-route-hero__copy">
            <h1>Consultoría e ingeniería para llevar la economía circular a la operación.</h1>
            <p className="gt-route-hero__statement">Ciencia aplicada, conocimiento del sector de aseo y experiencia territorial.</p>
            <p className="lead">Acompañamos a municipios, empresas, grandes generadores y proyectos productivos desde el diagnóstico hasta la operación y el seguimiento.</p>
            <div className="button-row"><Link className="button button--light" href="/servicios/">Conocer nuestros servicios</Link><Link className="button button--outline-light" href="/proyectos/">Ver experiencia en territorio</Link></div>
          </div>
          <figure className="gt-route-hero__figure">
            <Image src="/services/nosotros-consulting-field-v1.jpg" alt="Dos profesionales revisan material orgánico y notas de campo en un área de compostaje." fill priority sizes="(max-width: 900px) 100vw, 48vw" />
            <figcaption><strong>Entender el material y la operación orienta cada recomendación.</strong></figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.proof} aria-label="Indicadores y escenario de Yarumal">
        <div className={`container ${styles.proofGrid}`}>
          <div className={styles.proofIntro}>
            <span>Experiencia en operación</span>
            <h2>Yarumal: indicadores y escenario</h2>
            <p className={styles.proofScope}>Operación y recorrido: datos del caso. Ahorro en fletes: escenario anualizado.</p>
          </div>
          {yarumalClaims.map((claim) => <div className={styles.proofItem} key={claim.id}><strong>{claim.value}</strong><span>{claim.compactLabel}</span></div>)}
        </div>
      </section>

      <section className={styles.approach}>
        <div className={`container ${styles.approachGrid}`}>
          <h2>No llegamos con una tecnología prefabricada. Primero entendemos la operación.</h2>
          <div>
            <p>Una solución ambiental debe sostenerse después de la inauguración. Por eso revisamos generación, calidad de los materiales, logística, capacidades, costos recurrentes, proceso y destino antes de definir qué conviene hacer.</p>
            <p>Greenatics combina consultoría especializada, conocimiento científico y experiencia en el sector de aseo para convertir esas condiciones en decisiones: caracterizar, comparar alternativas, diseñar, probar, implementar o acompañar la operación.</p>
            <Link href="/diagnostico/">Ordenar el punto de partida <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className={styles.fieldStory}>
        <div className="container">
          <div className={styles.fieldHeading}>
            <h2>El valor se construye a lo largo de toda la cadena.</h2>
            <p>Territorio, infraestructura, biología, operación y destino de las salidas deben leerse juntos. El proceso y las condiciones del proyecto ayudan a definir qué vale la pena evaluar.</p>
          </div>
          <div className={styles.fieldGrid}>
            {fieldScenes.map((scene, index) => <figure className={index === 0 ? styles.fieldLead : styles.fieldSecondary} key={scene.title}>
              <div className={styles.fieldImage}><Image src={scene.src} alt={scene.alt} fill sizes={index === 0 ? "(max-width: 800px) 100vw, 58vw" : "(max-width: 800px) 100vw, 34vw"} /></div>
              <figcaption><strong>{scene.title}</strong><p>{scene.copy}</p></figcaption>
            </figure>)}
          </div>
          <Link className={styles.caseLink} href="/proyectos/tamesis/">Conocer la experiencia de Támesis <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className={styles.capabilitySection}>
        <div className="container">
          <div className={styles.capabilityHeading}>
            <h2>Un mismo reto necesita varias miradas expertas.</h2>
            <p>Las disciplinas se integran alrededor de una necesidad concreta; no trabajan como áreas aisladas ni como un paquete idéntico para cada cliente.</p>
          </div>
          <div className={styles.capabilityGrid}>
            {capabilities.map((capability) => <article key={capability.title}><h3>{capability.title}</h3><p>{capability.copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className={styles.science}>
        <div className={`container ${styles.scienceGrid}`}>
          <div>
            <h2>Ciencia aplicada, con colaboración y responsabilidades claras.</h2>
            <p>En proyectos documentados, Greenatics ha trabajado junto con el Grupo Interdisciplinario de Estudios Moleculares (GIEM) de la Universidad de Antioquia, conectando conocimiento científico con experiencia de campo y necesidades de operación.</p>
            <Link className="button button--outline-light" href="/tecnologia/">Conocer la base tecnológica</Link>
          </div>
          <p className={styles.scienceBoundary}>Los diseños, equipos y desarrollos que correspondan a la Universidad conservan su titularidad y se rigen por los acuerdos específicos de cada proyecto. La participación, transferencia y uso de propiedad intelectual se definen para cada caso.</p>
        </div>
      </section>

      <section className="gt-route-closing">
        <div className="container gt-route-closing__inner">
          <div><span className="eyebrow">Construyamos el punto de partida</span><h2>Cuéntanos qué existe hoy y qué decisión necesitas tomar.</h2></div>
          <Link className="button button--dark" href="/diagnostico/">Encontrar la ruta adecuada</Link>
        </div>
      </section>
    </>
  );
}
