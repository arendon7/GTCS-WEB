import { BiomassOpportunityPage } from "@/components/biomass-opportunity-page";

export default function ValorizacionPecuariaPage() {
  return (
    <BiomassOpportunityPage
      name="Valorización de subproductos pecuarios"
      path="/wondergreen/valorizacion-pecuaria/"
      eyebrow="Bioeconomía agroindustrial · Producción pecuaria"
      title="Evaluar una ruta para los residuos orgánicos pecuarios."
      introduction="Estiércol, porquinaza y gallinaza requieren una lectura propia de la producción, la recolección y el manejo del material. Greenatics puede caracterizar la corriente, comparar opciones de aprovechamiento y plantear un piloto acorde con la operación."
      method="La estimación parte de registros, aforos, caracterización y pruebas de la operación; no convierte automáticamente el número de animales en una cantidad de fertilizante o en un ahorro."
      steps={[
        {
          title: "Caracterizar la corriente",
          detail: "Reconocer el material, su volumen y variación, y cómo influyen la recolección, el almacenamiento y las mezclas presentes.",
        },
        {
          title: "Comparar alternativas",
          detail: "Revisar rutas como compostaje, digestión anaerobia o uso agronómico según la biomasa, la operación, la calidad y el destino posible.",
        },
        {
          title: "Diseñar un piloto",
          detail: "Definir alcance, controles de proceso y calidad, e indicadores para avanzar, ajustar o detener con evidencia del caso.",
        },
      ]}
      inputs={[
        { title: "Sistema de producción", detail: "Especie, etapa productiva, escala de operación y ubicación de la granja." },
        { title: "Recolección y manejo actual", detail: "Frecuencia, almacenamiento y presencia de cama, agua de lavado u otras mezclas." },
        { title: "Volúmenes y periodo", detail: "Registros o aforos disponibles, unidad, método y periodo al que corresponden." },
        { title: "Infraestructura y destino", detail: "Espacio, equipos, servicios disponibles y uso o salida que se quiere estudiar." },
        { title: "Análisis y restricciones", detail: "Caracterizaciones existentes, condiciones del predio y requisitos conocidos para operar." },
      ]}
      diagnostic="Valorización de corrientes pecuarias"
      selectedNeed="Estiércol, porquinaza, gallinaza u otras corrientes pecuarias"
      contactProfile="empresa"
    />
  );
}
