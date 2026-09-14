import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RouteDecisionBridge } from "@/components/route-decision-bridge";

export const metadata: Metadata = {
  title: "Agroindustria | Subproductos, biogás, bioenergía y valorización",
  description: "Soluciones Greenatics para caracterizar, tratar y valorizar corrientes agroindustriales mediante procesos biológicos, biogás, bioenergía, productos y trazabilidad.",
  alternates: { canonical: "/agroindustria/" },
};

const currents = [
  ["Efluentes con carga orgánica", "Aguas de proceso, lavado y corrientes que requieren estabilización, control y una alternativa de tratamiento."],
  ["Biomasa y subproductos", "Pulpa, cáscaras, fibras, descartes, estiércoles y materiales con potencial biológico o agronómico."],
  ["Lodos y fracciones semisólidas", "Corrientes que necesitan caracterización, acondicionamiento, reducción de humedad o integración con otros sustratos."],
  ["Pérdidas y excedentes", "Materiales fuera de especificación o sin salida que pueden convertirse en producto, energía o insumo de otro proceso."],
] as const;

const routes = [
  ["01", "Caracterizar", "Composición, caudal o volumen, variabilidad, estacionalidad, contaminantes, energía y restricciones."],
  ["02", "Comparar alternativas", "Prevención, separación, recirculación, compostaje, digestión anaerobia, tratamiento o combinación de procesos."],
  ["03", "Diseñar e implementar", "Balances, proceso, equipos, servicios auxiliares, infraestructura, seguridad y puesta en marcha."],
  ["04", "Operar y controlar", "Operación integral, compartida o asistida con POE, mantenimiento, bitácoras e indicadores."],
  ["05", "Valorizar", "Biogás, bioenergía, compost, bioles, acondicionadores, agua recuperada u otras salidas viables."],
  ["06", "Demostrar", "Trazabilidad de entradas, proceso, salidas, desempeño ambiental y resultados para decisiones y reportes."],
] as const;

const outcomes = [
  ["Menos disposición", "Desviar corrientes aprovechables y reducir la presión sobre rellenos, transporte y gestores externos."],
  ["Energía renovable", "Capturar biogás y evaluar su uso térmico o energético cuando la escala y la calidad lo permiten."],
  ["Productos circulares", "Convertir materiales estabilizados en productos o insumos con especificaciones y destinos definidos."],
  ["Control operacional", "Saber cuánto entra, qué ocurre en el proceso, qué sale y dónde están las pérdidas o riesgos."],
] as const;

export default function AgroindustryPage() {
  return (
    <>
      <section className="agroindustry-v4-hero"><div className="container agroindustry-v4-hero__grid"><div><span className="eyebrow eyebrow--light">Soluciones para agroindustria</span><h1>Convertimos corrientes orgánicas en tratamiento, energía, productos y decisiones medibles.</h1><p className="lead">Greenatics integra caracterización, ingeniería, procesos biológicos, operación y trazabilidad para que una corriente agroindustrial deje de ser únicamente un costo y encuentre una ruta técnica de reducción, tratamiento o valorización.</p><div className="button-row"><Link className="button button--light" href="/servicios/diagnostico-residuos/">Caracterizar mi corriente</Link><Link className="button button--outline-light" href="/contacto/?interes=agroindustria">Revisar una oportunidad</Link></div></div><figure><Image src="/projects/tamesis/reactor-uasb.jpeg" alt="Reactor anaerobio UASB en la planta de Támesis" fill priority sizes="(max-width: 900px) 100vw, 47vw" /><figcaption><strong>Digestión anaerobia en territorio.</strong><span>Infraestructura real para producir y capturar biogás.</span></figcaption></figure></div></section>

      <section className="agroindustry-v4-currents"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">El punto de partida</span><h2>No elegimos tecnología antes de entender la corriente.</h2></div><p>La composición, continuidad, humedad, carga orgánica, escala, localización y salida esperada determinan qué proceso puede funcionar y sostenerse.</p></div><div className="agroindustry-v4-currents__grid">{currents.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <RouteDecisionBridge
        eyebrow="Elegir la pregunta técnica"
        title="Una corriente puede requerir control, valorización o energía."
        intro="La misma biomasa puede conducir a alternativas distintas según su composición, continuidad, ubicación, restricciones y demanda. Estas rutas ayudan a preparar la evaluación correcta."
        cards={[
          {
            label: "Agua y carga orgánica",
            title: "Entender fuentes, caudales, cargas y tratamiento.",
            copy: "Construye un balance antes de ampliar infraestructura o atribuir el problema a una sola corriente.",
            inputs: ["Caudales y variación temporal", "Caracterización por punto", "Proceso actual y capacidad instalada"],
            href: "/soluciones/riesgo-lixiviados/",
            cta: "Preparar balance de aguas",
          },
          {
            label: "Biomasa y subproductos",
            title: "Comparar rutas de aprovechamiento productivo.",
            copy: "Conecta materia prima, tecnología, estabilidad, especificaciones, demanda y logística para evitar productos sin destino.",
            inputs: ["Masa, humedad y estacionalidad", "Caracterización y contaminantes", "Usuarios, mercado o demanda interna"],
            href: "/servicios/aprovechamiento-productivo/",
            cta: "Comparar alternativas",
          },
          {
            label: "Digestión anaerobia",
            title: "Medir potencial, captura y uso del biogás.",
            copy: "Relaciona sustrato, biodegradabilidad, estabilidad, calidad del gas, seguridad y demanda energética.",
            inputs: ["Caudal, sólidos o carga orgánica", "Datos de reactor o pruebas disponibles", "Perfil de demanda energética"],
            href: "/soluciones/biogas-energia/",
            cta: "Preparar prefactibilidad energética",
          },
        ]}
      />

      <section className="agroindustry-v4-route"><div className="container"><header><span className="eyebrow eyebrow--light">Ruta Greenatics</span><h2>De una corriente incierta a una solución que puede operar y demostrar resultados.</h2></header><ol>{routes.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol></div></section>

      <section className="agroindustry-v4-biogas"><div className="container agroindustry-v4-biogas__grid"><figure><Image src="/projects/tamesis/planta-aerea.jpg" alt="Vista aérea de la planta y el reactor UASB de Támesis" fill sizes="(max-width: 850px) 100vw, 48vw" /></figure><div><span className="eyebrow">Biogás y bioenergía</span><h2>La digestión anaerobia conecta tratamiento y aprovechamiento energético.</h2><p>Un sistema anaerobio puede reducir carga orgánica y producir biogás. Greenatics evalúa sustrato, alimentación, estabilidad, captura, acondicionamiento, seguridad y uso de la energía para construir una solución coherente con la escala.</p><ul><li>Diagnóstico o recuperación de reactores existentes.</li><li>Co-digestión y evaluación de sustratos.</li><li>Captura, conducción y seguridad del biogás.</li><li>Uso térmico, generación o aprovechamiento definido por factibilidad.</li><li>Operación, bitácora, control de variables y mantenimiento.</li></ul><div className="button-row"><Link className="button button--dark" href="/soluciones/biogas-energia/">Explorar biogás y energía</Link><Link className="button button--ghost" href="/proyectos/tamesis/">Ver el caso Támesis</Link></div></div></div></section>

      <section className="agroindustry-v4-outcomes"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Valor ambiental y productivo</span><h2>La sostenibilidad se vuelve más útil cuando cambia la operación.</h2></div><p>Los resultados específicos se definen con línea base y alcance, pero la solución se diseña desde el inicio para reducir impactos y crear valor verificable.</p></div><div className="agroindustry-v4-outcomes__grid">{outcomes.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="agroindustry-v4-models"><div className="container"><div><span className="eyebrow eyebrow--light">Modalidades de trabajo</span><h2>Podemos diseñar, implementar, operar o acompañar.</h2></div><div><article><span>Proyecto</span><strong>Diagnóstico, ingeniería e implementación.</strong><p>Un alcance con entregables, hitos y cierre definido.</p></article><article><span>Operación</span><strong>Operación integral o compartida.</strong><p>Responsabilidades, personal, proceso y resultados según contrato.</p></article><article><span>Continuidad</span><strong>Dirección técnica, datos y mejora.</strong><p>Acompañamiento recurrente para sostener el desempeño.</p></article></div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Primera conversación</span><h2>Trae una muestra del problema: corriente, volumen, frecuencia, proceso actual y objetivo.</h2></div><Link className="button button--dark" href="/contacto/?interes=agroindustria">Evaluar mi corriente</Link></div></section>
    </>
  );
}
