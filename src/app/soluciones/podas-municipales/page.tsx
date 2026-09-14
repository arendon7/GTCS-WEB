import { SolutionAssessment } from "@/components/solution-assessment";

export default function PodasMunicipalesPage() {
  return <SolutionAssessment
    eyebrow="Podas, césped y material leñoso"
    title="Convertir una corriente estacional en un recurso operativo."
    lead="Las podas pueden convertirse en estructurante, cobertura, insumo para compostaje u otras rutas de valorización, pero primero deben separarse por origen, tamaño, contaminación, humedad y destino."
    principle="No toda poda sirve para el mismo uso. La clasificación y la demanda real del producto deben preceder la compra de trituración o transporte."
    fields={[
      { id: "territory", label: "Territorio o entidad", help: "Municipio, empresa de servicios o contratista.", placeholder: "Nombre y ubicación" },
      { id: "sources", label: "Fuentes principales", help: "Parques, vías, mantenimiento arbóreo, cementerios o privados.", placeholder: "Orígenes y responsables" },
      { id: "volume", label: "Registros disponibles", help: "Viajes, peso, volumen, estacionalidad y composición.", placeholder: "Dato medido o método de estimación" },
      { id: "handling", label: "Manejo actual", help: "Acopio, transporte, trituración, entrega o disposición.", placeholder: "Equipos, predios y costos" },
      { id: "destination", label: "Destino prioritario", help: "La salida define especificaciones del proceso.", options: ["Estructurante para compostaje", "Cobertura o mulch", "Mezcla de sustratos", "Valorización energética por evaluar", "Aún no definido"] },
    ]}
    questions={[
      "¿Qué fracciones deben separarse y cuáles no son aptas para el destino?",
      "¿Cómo cambia la generación por temporada, zona y tipo de mantenimiento?",
      "¿Dónde conviene triturar, almacenar y controlar riesgos de incendio?",
      "¿Qué granulometría, humedad y limpieza exige el usuario final?",
      "¿Qué logística evita mover aire, agua o material contaminado?",
    ]}
    evidence={["Registros de viajes, pesos o cubicaciones por fuente.", "Inventario de equipos, patios y restricciones de almacenamiento.", "Muestras representativas y clasificación de impropios.", "Demanda interna o externa con especificaciones de calidad."]}
    deliverables={["Balance estacional de generación y necesidades.", "Protocolo de recepción, clasificación y trazabilidad.", "Alternativas de trituración, transporte, acopio y uso.", "Plan piloto con criterios de calidad y seguimiento."]}
    nextStep="Caracterizar una temporada representativa y validar un destino antes de dimensionar equipos o prometer ahorros."
    whatsappIntro="Hola Greenatics. Quiero estructurar una ruta de aprovechamiento para podas y material vegetal."
  />;
}
