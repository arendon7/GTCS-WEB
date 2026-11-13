import { BiomassOpportunityPage } from "@/components/biomass-opportunity-page";

export default function BeneficioCafePage() {
  return (
    <BiomassOpportunityPage
      name="Valorización del beneficio de café"
      path="/wondergreen/beneficio-cafe/"
      eyebrow="Bioeconomía agroindustrial · Café"
      title="Definir una ruta para valorizar los subproductos del café."
      introduction="Pulpa, mucílago y otras corrientes del beneficio tienen condiciones distintas. Greenatics acompaña su caracterización, compara alternativas de aprovechamiento y estructura un piloto cuando la evidencia y la operación lo justifican."
      method="Los volúmenes, productos, ahorros e impactos se dimensionan con información de la operación y pruebas; no se deducen de una carga estándar de café."
      steps={[
        {
          title: "Caracterizar la corriente",
          detail: "Precisar qué se genera, cuánto, cuándo y cómo se maneja; revisar la composición y las condiciones de recolección que requiera el estudio.",
        },
        {
          title: "Comparar alternativas",
          detail: "Contrastar compostaje, digestión anaerobia, biogás y productos de uso agronómico frente a la biomasa, la operación y sus posibles destinos.",
        },
        {
          title: "Diseñar un piloto",
          detail: "Acordar la prueba, el control de calidad y la evidencia necesaria para decidir si avanzar, ajustar o detener la ruta.",
        },
      ]}
      inputs={[
        { title: "Finca, asociación o planta", detail: "Municipio, tipo de operación y persona que coordina el beneficio." },
        { title: "Corrientes y temporada", detail: "Pulpa, mucílago u otras corrientes presentes, con su frecuencia y calendario de generación." },
        { title: "Volúmenes registrados", detail: "Cantidad, unidad, periodo y método de registro; indica qué está medido y qué es una estimación." },
        { title: "Manejo e infraestructura", detail: "Almacenamiento, tratamiento o uso actual, espacio y condiciones de operación disponibles." },
        { title: "Evidencia existente", detail: "Análisis, registros, fotografías del sitio y objetivo que se quiere evaluar." },
      ]}
      diagnostic="Valorización de subproductos del café"
      selectedNeed="Pulpa, mucílago u otras corrientes del beneficio"
      contactProfile="agro"
    />
  );
}
