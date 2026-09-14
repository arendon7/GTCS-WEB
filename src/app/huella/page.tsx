"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { runtimeLink, runtimeLinks } from "@/lib/runtime-links";

const LANDFILL_FACTOR = 0.94;
const TRUCK_FACTOR_KG_KM = 1.2;
const TRUCK_CAPACITY_TONS = 10;

const format = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const huellaAccessHref = runtimeLink(runtimeLinks.huella, "/acceso/?interes=calcula-tu-huella");
const huellaAccessLabel = runtimeLinks.huella ? "Abrir la plataforma" : "Solicitar acceso";

const inventoryWorkflow = [
  ["01", "Abrir el inventario", "Define organización, periodo, alcance, sede, responsable y fuentes que harán parte de la lectura."],
  ["02", "Cargar las fuentes", "Importa CSV o XLSX, selecciona hoja y encabezados, y relaciona cada columna con el dato que representa."],
  ["03", "Validar el lote", "La plataforma señala campos faltantes, unidades inconsistentes, duplicados y filas que necesitan una decisión."],
  ["04", "Corregir con evidencia", "Ajusta fuente, fecha, valor, unidad, origen, soporte y condición estimada sin volver a cargar todo el archivo."],
  ["05", "Aplicar y conservar historial", "Cuando el lote está listo, se incorpora al inventario activo y conserva trazabilidad para cálculos, revisión e informes."],
] as const;

export default function CarbonPage() {
  const [monthlyTons, setMonthlyTons] = useState(120);
  const [diversionPercent, setDiversionPercent] = useState(90);
  const [distanceKm, setDistanceKm] = useState(70);

  const annualTons = monthlyTons * 12;
  const divertedTons = annualTons * (diversionPercent / 100);
  const landfillAvoided = divertedTons * LANDFILL_FACTOR;
  const annualTrips = Math.ceil(divertedTons / TRUCK_CAPACITY_TONS);
  const transportAvoided = (annualTrips * distanceKm * 2 * TRUCK_FACTOR_KG_KM) / 1000;
  const totalScenario = landfillAvoided + transportAvoided;

  const message = encodeURIComponent(`Hola Greenatics, construí un escenario en Calcula tu Huella con ${monthlyTons} t/mes, una meta de desvío de ${diversionPercent}% y ${distanceKm} km de distancia. Quiero validar la línea base, los factores y el alcance de medición.`);
  const contactHref = `/contacto/?interes=calcula-tu-huella&perfil=empresa&diagnostico=${encodeURIComponent("Escenario público de huella")}&prioridad=${encodeURIComponent(`${monthlyTons} t/mes · meta de desvío ${diversionPercent}% · ${distanceKm} km · resultado estimado`)}`;

  return (
    <>
      <section className="carbon-v4-hero"><div className="container"><div className="carbon-v4-brandbar"><Image className="carbon-v4-brandbar__logo" src="/brand/calcula-tu-huella/brand-reversed.svg" alt="Calcula tu Huella" width={280} height={64} priority /><span>Una plataforma Greenatics para convertir datos climáticos en decisiones.</span></div><div className="carbon-v4-hero__copy"><span className="eyebrow eyebrow--light">Plataforma profesional de huella de carbono</span><h1><span>Mide.</span> <strong>Comprende.</strong> <em>Reduce.</em></h1><p className="lead">Convierte información dispersa en un inventario trazable, indicadores comprensibles y una ruta concreta de reducción para tu organización.</p><div className="button-row carbon-v4-hero__actions"><Link className="button button--light" href="#calculadora">Explorar el estimador</Link><Link className="button button--outline-light" href={huellaAccessHref}>{huellaAccessLabel}</Link><Link className="button button--ghost-light" href="/contacto/?interes=calcula-tu-huella">Hablar con Greenatics</Link></div><p className="carbon-v4-hero__access"><strong>¿Ya tienes un inventario?</strong> Ingresa a la plataforma completa para cargar fuentes, validar datos, conservar evidencias y preparar tus reportes.</p><div className="carbon-v4-legend"><span><i className="is-estimated" />Estimado por herramienta</span><span><i className="is-measured" />Medido en operación</span><span><i className="is-verified" />Revisado o verificado</span></div></div></div></section>

      <section className="carbon-v4-calculator" id="calculadora"><div className="container carbon-v4-calculator__grid"><div className="carbon-v4-controls"><div><span className="eyebrow">Exploración pública</span><h2>Empieza con una hipótesis.</h2><p>Usa datos aproximados para explorar. Una evaluación técnica reemplaza estos valores por aforos, rutas, pesajes y factores acordados.</p></div><label><span>Generación orgánica mensual <strong>{monthlyTons} t/mes</strong></span><input type="range" min="10" max="500" step="10" value={monthlyTons} onChange={(event) => setMonthlyTons(Number(event.target.value))} /></label><label><span>Meta de desvío <strong>{diversionPercent} %</strong></span><input type="range" min="20" max="100" step="5" value={diversionPercent} onChange={(event) => setDiversionPercent(Number(event.target.value))} /></label><label><span>Distancia al destino evitado <strong>{distanceKm} km</strong></span><input type="range" min="0" max="250" step="5" value={distanceKm} onChange={(event) => setDistanceKm(Number(event.target.value))} /></label><div className="carbon-v4-assumptions"><strong>Supuestos del escenario</strong><ul><li>{LANDFILL_FACTOR} tCO₂e por tonelada orgánica desviada.</li><li>{TRUCK_FACTOR_KG_KM} kg CO₂ por kilómetro de vehículo pesado.</li><li>{TRUCK_CAPACITY_TONS} toneladas por viaje y recorrido de ida y regreso.</li></ul></div></div><div className="carbon-v4-results"><div className="carbon-v4-results__head"><span>Resultado estimado</span><strong>{format.format(totalScenario)} <small>tCO₂e/año</small></strong><p>Potencial combinado de disposición final y transporte evitado bajo los supuestos visibles.</p></div><div className="carbon-v4-results__grid"><article><span>Flujo anual</span><strong>{format.format(annualTons)} t</strong><small>Generación proyectada</small></article><article><span>Desvío</span><strong>{format.format(divertedTons)} t</strong><small>Según la meta seleccionada</small></article><article><span>Disposición</span><strong>{format.format(landfillAvoided)} tCO₂e</strong><small>Estimación por factor</small></article><article><span>Transporte</span><strong>{format.format(transportAvoided)} tCO₂e</strong><small>Estimación logística</small></article></div><div className="carbon-v4-result-note"><span>Este resultado todavía no es un certificado.</span><p>Para comunicarlo como impacto del proyecto se debe acordar línea base, frontera, periodo, fuentes, factores, tratamiento de incertidumbre y nivel de revisión.</p></div><div className="button-row"><Link className="button button--light" href={contactHref}>Llevar este escenario a Greenatics</Link><a className="button button--outline-light" href={`https://wa.me/573003078822?text=${message}`} target="_blank" rel="noopener noreferrer">Validar por WhatsApp</a></div></div></div></section>

      <section className="carbon-v4-platform"><div className="container"><div className="digital-v4-heading"><div><span className="eyebrow">La plataforma completa</span><h2>El resultado empieza mucho antes del cálculo.</h2></div><p>La calculadora pública ayuda a explorar una hipótesis. El producto completo organiza el inventario, recibe fuentes, valida cada fila, conserva evidencias y deja un historial separado por periodo y organización.</p></div><ol>{inventoryWorkflow.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol><div className="carbon-v4-platform__note"><strong>Qué cambia para el equipo:</strong><span>menos reconstrucción manual del mes, más claridad sobre el origen de cada cifra y una ruta explícita para cerrar los datos que todavía requieren revisión.</span><Link href="/herramientas/">Ver el ecosistema digital →</Link></div></div></section>

      <section className="carbon-v4-method"><div className="container"><div className="digital-v4-heading"><div><span className="eyebrow">De estimación a evidencia</span><h2>Cuatro pasos para convertir una hipótesis ambiental en un resultado defendible.</h2></div><p>Los claims ambientales pueden ser fuertes cuando la cadena de datos también lo es. Greenatics conserva la diferencia entre cálculo preliminar, dato operacional y resultado revisado.</p></div><ol><li><span>01</span><strong>Definir la línea base</strong><p>Qué ocurriría sin el proyecto, durante qué periodo y dentro de qué frontera.</p></li><li><span>02</span><strong>Medir la actividad</strong><p>Pesajes, composición, rechazo, distancias, proceso, producción y destino.</p></li><li><span>03</span><strong>Aplicar factores</strong><p>Fuentes, versión, unidades, supuestos y cálculos reproducibles.</p></li><li><span>04</span><strong>Revisar y publicar</strong><p>Conciliación, responsable, evidencia, incertidumbre y nivel de verificación.</p></li></ol></div></section>

      <section className="carbon-v4-proof"><div className="container carbon-v4-proof__grid"><div><span className="eyebrow eyebrow--light">Impacto Greenatics validado</span><h2>La web también comunica resultados reales de operación.</h2></div><div><p>Consulta las cifras validadas del caso Yarumal, su contexto, evidencia y método. Esas cifras son resultados históricos del caso, no salidas automáticas de esta calculadora.</p><div className="button-row"><Link className="button button--light" href="/impacto/">Ver impacto y evidencia</Link><Link className="button button--outline-light" href="/proyectos/yarumal/">Explorar Yarumal</Link></div></div></div></section>
    </>
  );
}
