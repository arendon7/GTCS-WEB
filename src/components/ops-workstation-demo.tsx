"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type ReactNode } from "react";

type PlantId = "yarumal" | "tamesis";
type ModuleId = "today" | "logbook" | "receptions" | "process" | "balances" | "maintenance" | "inventory" | "reports";

const modules: readonly { id: ModuleId; code: string; label: string; detail: string }[] = [
  { id: "today", code: "01", label: "Hoy", detail: "Resumen y excepciones" },
  { id: "logbook", code: "02", label: "Bitácora", detail: "Actividades y turnos" },
  { id: "receptions", code: "03", label: "Recepciones", detail: "Pesaje y calidad" },
  { id: "process", code: "04", label: "Procesos", detail: "Lotes y parámetros" },
  { id: "balances", code: "05", label: "Volúmenes", detail: "Balance de masa" },
  { id: "maintenance", code: "06", label: "Activos", detail: "Equipos y mantenimiento" },
  { id: "inventory", code: "07", label: "Inventario", detail: "Producto y kardex" },
  { id: "reports", code: "08", label: "Reportes", detail: "Cierres y evidencia" },
] as const;

const scenarios = {
  yarumal: {
    name: "Compostaje de muestra",
    code: "COMP",
    line: "Compostaje termófilo",
    received: 4.82,
    accepted: 4.56,
    rejected: 0.26,
    processed: 3.94,
    product: 1.18,
    activityCount: 7,
    alertCount: 3,
    quality: 94.6,
    energyLabel: "Pilas activas",
    energyValue: "6",
    processAsset: "Pila de compostaje de ejemplo",
    processMetric: "58,4 °C",
  },
  tamesis: {
    name: "Digestión anaerobia de muestra",
    code: "DA",
    line: "Digestión anaerobia UASB",
    received: 2.3,
    accepted: 2.08,
    rejected: 0.22,
    processed: 1.86,
    product: 0.54,
    activityCount: 6,
    alertCount: 2,
    quality: 90.4,
    energyLabel: "Biogás capturado",
    energyValue: "38 Nm³",
    processAsset: "Reactor UASB de referencia",
    processMetric: "6,9 pH",
  },
} as const;

const receptions = {
  yarumal: [
    ["DEMO-COMP-082", "Ruta selectiva 02", "1.840 kg", "96,2 %", "Aceptado"],
    ["DEMO-COMP-081", "Plaza de mercado", "1.320 kg", "91,8 %", "Condicionado"],
    ["DEMO-COMP-080", "Generadores aliados", "1.660 kg", "95,4 %", "Aceptado"],
  ],
  tamesis: [
    ["DEMO-DA-047", "Ruta selectiva urbana", "1.260 kg", "92,1 %", "Aceptado"],
    ["DEMO-DA-046", "Comercio y restaurantes", "640 kg", "86,3 %", "Condicionado"],
    ["DEMO-DA-045", "Plaza y poda limpia", "400 kg", "94,8 %", "Aceptado"],
  ],
} as const;

const logEntries = {
  yarumal: [
    ["07:10", "Recepción", "Cierre de pesaje DEMO-COMP-082", "Equipo de muestra"],
    ["08:25", "Compostaje", "Volteo y lectura de temperatura CT-024", "Equipo de compostaje"],
    ["10:40", "Calidad", "Muestra de humedad enviada a revisión", "Responsable de calidad"],
    ["13:15", "Mantenimiento", "Limpieza preventiva de criba", "Equipo de turno"],
  ],
  tamesis: [
    ["07:05", "Recepción", "Apertura de ruta y control de impropios", "Equipo de muestra"],
    ["08:40", "Hidrólisis", "Alimentación de reactor RH-02", "Equipo de proceso"],
    ["11:20", "UASB", "Lectura de pH, caudal y presión de gas", "Responsable de proceso"],
    ["14:05", "Bioenergía", "Verificación de filtros y almacenamiento", "Equipo de turno"],
  ],
} as const;

const equipment = {
  yarumal: [
    ["EQ-COMP-01", "Criba rotatoria", "Operativo", "Inspección en 12 días"],
    ["EQ-COMP-03", "Bomba de lixiviados", "Atención", "Orden preventiva abierta"],
    ["EQ-COMP-07", "Sensor CT-024", "Operativo", "Calibración vigente"],
  ],
  tamesis: [
    ["EQ-DA-01", "Reactor UASB", "Operativo", "Rutina diaria completada"],
    ["EQ-DA-04", "Filtro de H₂S", "Atención", "Cambio de medio programado"],
    ["EQ-DA-06", "Red de biogás", "Operativo", "Inspección de fugas vigente"],
  ],
} as const;

const inventory = {
  yarumal: [
    ["WG-COMP-2026-31", "Compost tamizado", "2.640 kg", "Disponible"],
    ["WG-BIOL-2026-18", "Líquido estabilizado", "1.120 L", "En control"],
    ["WG-BASE-2026-09", "Matriz de formulación", "780 kg", "Reservado"],
  ],
  tamesis: [
    ["DEMO-DA-COMP-14", "Compost maduro", "1.460 kg", "Disponible"],
    ["DEMO-DA-BIOL-08", "Efluente estabilizado", "2.200 L", "En control"],
    ["DEMO-DA-EMP-03", "Producto empacado", "60 costales", "Comprometido"],
  ],
} as const;

function Status({ children, tone = "ok" }: { children: ReactNode; tone?: "ok" | "attention" | "neutral" }) {
  return <span className={`ops-station__status ops-station__status--${tone}`}>{children}</span>;
}

function Table({
  label,
  headers,
  rows,
}: {
  label: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="ops-station__table-wrap">
      <p className="ops-station__table-hint">Desliza horizontalmente para consultar todas las columnas.</p>
      <table className="ops-station__table">
        <caption>{label}</caption>
        <thead><tr>{headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{index === row.length - 1 ? <Status tone={/Atención|Condicionado|En control/.test(cell) ? "attention" : "ok"}>{cell}</Status> : cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function OpsWorkstationDemo() {
  const [plantId, setPlantId] = useState<PlantId>("tamesis");
  const [moduleId, setModuleId] = useState<ModuleId>("today");
  const [checksByPlant, setChecksByPlant] = useState<Record<PlantId, string[]>>({
    yarumal: ["epp", "scale"],
    tamesis: ["epp", "scale"],
  });
  const [notice, setNotice] = useState("Selecciona un módulo para explorar el flujo operativo.");
  const plant = scenarios[plantId];
  const completedChecks = checksByPlant[plantId];
  const balanceDifference = Math.max(0, plant.accepted - plant.processed);

  const toggleCheck = (id: string) => {
    const next = completedChecks.includes(id)
      ? completedChecks.filter((item) => item !== id)
      : [...completedChecks, id];
    setChecksByPlant((current) => ({ ...current, [plantId]: next }));
    setNotice(`Checklist de muestra: ${next.length} de 4 puntos marcados. El cambio es temporal; no guarda ni cierra un turno real.`);
  };

  const changeModule = (id: ModuleId) => {
    setModuleId(id);
    setNotice(`${modules.find((module) => module.id === id)?.label}: vista cargada con datos ilustrativos de ${plant.name}.`);
  };

  return (
    <div className="ops-station">
      <div className="ops-station__topbar">
        <Link className="ops-station__brand" href="/app/#estacion"><Image src="/brand/greenatics-horizontal.webp" alt="Greenatics" width={154} height={48} priority /><span>OPS · Estación de muestra</span></Link>
        <div className="ops-station__demo-lock"><span>Datos ficticios de demostración</span><strong>No representan la operación de Yarumal ni Támesis</strong></div>
        <div className="ops-station__topbar-actions" aria-label="Navegación de la estación">
          <Link href="/plataforma/usuarios/">Usuarios y permisos</Link>
          <Link href="/" aria-label="Volver al sitio Greenatics">Volver a Greenatics</Link>
        </div>
      </div>

      <div className="ops-station__body">
        <aside className="ops-station__rail" aria-label="Módulos del entorno público">
          <div className="ops-station__rail-context"><span>Proceso de muestra</span><strong>{plant.code}</strong><small>{plant.name}</small></div>
          <nav>
            {modules.map((module) => (
              <button
                type="button"
                key={module.id}
                className={moduleId === module.id ? "is-active" : undefined}
                aria-pressed={moduleId === module.id}
                onClick={() => changeModule(module.id)}
              >
                <span>{module.code}</span><div><strong>{module.label}</strong><small>{module.detail}</small></div>
              </button>
            ))}
          </nav>
          <div className="ops-station__rail-foot"><span /> La vista relaciona actividades con planta, responsable y evidencia.</div>
        </aside>

        <div className="ops-station__workspace" role="region" aria-label="Área de trabajo de Greenatics OPS">
          <header className="ops-station__workspace-head">
            <div><span className="ops-station__breadcrumb">Operaciones / {modules.find((module) => module.id === moduleId)?.label}</span><h3>{moduleId === "today" ? "Control del día" : modules.find((module) => module.id === moduleId)?.detail}</h3></div>
            <div className="ops-station__filters">
              <label>Proceso de ejemplo<select value={plantId} onChange={(event) => { setPlantId(event.target.value as PlantId); setNotice(`Escenario de ${scenarios[event.target.value as PlantId].line.toLowerCase()} cargado.`); }}><option value="tamesis">Digestión anaerobia</option><option value="yarumal">Compostaje</option></select></label>
              <span className="ops-station__period-label">Periodo · jornada de muestra</span>
              <button type="button" className="ops-station__primary-action" onClick={() => setNotice("Una actividad relaciona proceso, turno, responsable, observación y evidencia asociada.")}>Qué reúne una actividad</button>
            </div>
          </header>

          <p className="ops-station__notice" aria-live="polite">{notice}</p>

          {moduleId === "today" && (
            <div className="ops-station__screen">
              <section className="ops-station__metrics" aria-label="Indicadores de la jornada de demostración">
                <article><span>Recibido</span><strong>{plant.received.toFixed(2)} t</strong><small>Entradas registradas</small></article>
                <article><span>Aceptado</span><strong>{plant.accepted.toFixed(2)} t</strong><small>{plant.quality.toFixed(1)} % de calidad</small></article>
                <article><span>Procesado</span><strong>{plant.processed.toFixed(2)} t</strong><small>{plant.line}</small></article>
                <article><span>{plant.energyLabel}</span><strong>{plant.energyValue}</strong><small>Variable específica de planta</small></article>
              </section>
              <div className="ops-station__dashboard-grid">
                <section className="ops-station__panel ops-station__panel--flow">
                  <div className="ops-station__panel-head"><div><span>Balance del día</span><h4>Entrada, proceso y salida</h4></div><Status tone="attention">Por conciliar</Status></div>
                  <div className="ops-station__flow-row"><span>Recepción</span><div><i style={{ width: "100%" }} /></div><strong>{plant.received.toFixed(2)} t</strong></div>
                  <div className="ops-station__flow-row"><span>Aceptado</span><div><i style={{ width: `${(plant.accepted / plant.received) * 100}%` }} /></div><strong>{plant.accepted.toFixed(2)} t</strong></div>
                  <div className="ops-station__flow-row"><span>En proceso</span><div><i style={{ width: `${(plant.processed / plant.received) * 100}%` }} /></div><strong>{plant.processed.toFixed(2)} t</strong></div>
                  <div className="ops-station__flow-row"><span>Producto</span><div><i style={{ width: `${(plant.product / plant.received) * 100}%` }} /></div><strong>{plant.product.toFixed(2)} t</strong></div>
                  <div className="ops-station__source-note">Para leer cada indicador, consulta los registros de origen y verifica el periodo y el responsable.</div>
                </section>
                <section className="ops-station__panel">
                  <div className="ops-station__panel-head"><div><span>Atención</span><h4>Excepciones abiertas</h4></div><strong className="ops-station__alert-count">{plant.alertCount}</strong></div>
                  <div className="ops-station__alerts">
                    <button type="button" onClick={() => setNotice("Ejemplo de mantenimiento: en una implementación, la incidencia vincularía equipo, responsable, evidencia y fecha objetivo.")}><Status tone="attention">Mantenimiento</Status><strong>{plantId === "tamesis" ? "Revisar medio filtrante H₂S" : "Inspeccionar bomba de lixiviados"}</strong><span>Prioridad media · dato de muestra</span></button>
                    <button type="button" onClick={() => setNotice("Ejemplo de recepción: la ficha relacionaría material, condición de aceptación, causa y destino.")}><Status tone="attention">Calidad</Status><strong>Recepción condicionada pendiente de cierre</strong><span>Requiere causa y destino del rechazo</span></button>
                    <button type="button" onClick={() => setNotice("Ejemplo de decisión: en un alcance acordado se definiría cómo relacionar la acción con su fuente, responsable e historial.")}><Status tone="neutral">Decisión</Status><strong>Validar programación del siguiente turno</strong><span>Responsable: equipo de muestra</span></button>
                  </div>
                </section>
              </div>
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Actividad reciente</span><h4>Qué está haciendo el equipo</h4></div><small>{plant.activityCount} actividades en el periodo</small></div>
                <div className="ops-station__timeline">{logEntries[plantId].map((entry) => <button type="button" key={entry[0]} onClick={() => setNotice(`Resumen del evento ficticio: ${entry[2]}. En un entorno propio, la ficha mostraría su evidencia e historial.`)}><time>{entry[0]}</time><i /><div><strong>{entry[2]}</strong><span>{entry[1]} · {entry[3]}</span></div><b>Leer resumen</b></button>)}</div>
              </section>
            </div>
          )}

          {moduleId === "logbook" && (
            <div className="ops-station__screen ops-station__two-columns">
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Bitácora de turno</span><h4>Secuencia de actividades</h4></div><Status>Turno A</Status></div>
                <div className="ops-station__timeline ops-station__timeline--large">{logEntries[plantId].map((entry) => <button type="button" key={entry[0]} onClick={() => setNotice(`Resumen del registro ficticio ${entry[0]}: ${entry[2]}. Esta vista no guarda evidencia ni historial.`)}><time>{entry[0]}</time><i /><div><strong>{entry[2]}</strong><span>{entry[1]} · Responsable: {entry[3]}</span></div><b>Leer resumen</b></button>)}</div>
              </section>
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Cierre controlado</span><h4>Checklist del turno</h4></div><strong aria-live="polite">{completedChecks.length}/4</strong></div>
                <div className="ops-station__checklist">
                  {[
                    ["epp", "EPP y condiciones de seguridad"],
                    ["scale", "Báscula y equipos verificados"],
                    ["volume", "Volúmenes y lotes conciliados"],
                    ["evidence", "Evidencias y novedades adjuntas"],
                  ].map(([id, label]) => <label key={id}><input type="checkbox" checked={completedChecks.includes(id)} onChange={() => toggleCheck(id)} /><span>{label}</span></label>)}
                </div>
                <p className="ops-station__source-note">Las marcas de esta muestra son temporales: no registran ni cierran un turno real. En una implementación, la bitácora conservaría hora, autor, planta, objeto y evidencia; una corrección agregaría historial sin borrar el registro original.</p>
              </section>
            </div>
          )}

          {moduleId === "receptions" && (
            <div className="ops-station__screen">
              <section className="ops-station__metrics ops-station__metrics--compact">
                <article><span>Peso bruto</span><strong>{(plant.received + 2.7).toFixed(2)} t</strong><small>Vehículo + carga</small></article>
                <article><span>Tara</span><strong>2,70 t</strong><small>Snapshot del equipo</small></article>
                <article><span>Peso neto</span><strong>{plant.received.toFixed(2)} t</strong><small>Cálculo no editable</small></article>
                <article><span>Rechazo</span><strong>{plant.rejected.toFixed(2)} t</strong><small>Causa y destino requeridos</small></article>
              </section>
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Historial de ingreso</span><h4>Recepciones y calidad</h4></div><button type="button" onClick={() => setNotice("Una recepción valida peso bruto, tara y neto, corriente, procedencia, aceptación y evidencia.")}>Qué valida una recepción</button></div>
                <Table label={`Recepciones ilustrativas de ${plant.name}`} headers={["Registro", "Origen", "Peso neto", "Pureza", "Estado"]} rows={receptions[plantId]} />
              </section>
            </div>
          )}

          {moduleId === "process" && (
            <div className="ops-station__screen">
              <section className="ops-station__process-head">
                <div><span>Línea activa</span><h4>{plant.line}</h4><p>Cada etapa conserva lote de origen, responsable, hora, variables y novedades.</p></div>
                <div><span>Activo principal</span><strong>{plant.processAsset}</strong><small>{plant.processMetric} · lectura ilustrativa</small></div>
              </section>
              <section className="ops-station__process-map">
                {(plantId === "tamesis" ? [
                  ["01", "Hidrólisis", "Carga preparada", "Operativo"],
                  ["02", "Tanque pulmón", "Caudal registrado", "Operativo"],
                  ["03", "UASB", "Digestión anaerobia", "Operativo"],
                  ["04", "Biogás", "Filtrado y medición", "Atención"],
                  ["05", "Bioenergía", "Uso y balance", "Operativo"],
                ] : [
                  ["01", "Mezcla", "Lote preparado", "Operativo"],
                  ["02", "Fase activa", "Control termófilo", "Operativo"],
                  ["03", "Volteo", "Rutina ejecutada", "Operativo"],
                  ["04", "Maduración", "Humedad en control", "Atención"],
                  ["05", "Afinado", "Salida a inventario", "Operativo"],
                ]).map((step) => <button type="button" key={step[0]} onClick={() => setNotice(`${step[1]}: abriría parámetros, actividades, evidencias e historial del lote.`)}><span>{step[0]}</span><i /><strong>{step[1]}</strong><small>{step[2]}</small><Status tone={step[3] === "Atención" ? "attention" : "ok"}>{step[3]}</Status></button>)}
              </section>
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Lotes en proceso</span><h4>Trazabilidad de transformación</h4></div><small>Fuente → proceso → salida</small></div>
                <Table label="Lotes de proceso ficticios" headers={["Lote", "Proceso", "Inicio", "Último control", "Estado"]} rows={plantId === "tamesis" ? [["DEMO-DA-026", "Digestión anaerobia", "06:50", "14:05", "Operativo"], ["DEMO-HID-031", "Hidrólisis", "08:40", "13:20", "Operativo"], ["DEMO-COMP-014", "Maduración", "Día 18", "11:45", "Atención"]] : [["DEMO-CT-024", "Fase termófila", "Día 6", "13:40", "Operativo"], ["DEMO-MAD-019", "Maduración", "Día 22", "10:15", "Operativo"], ["DEMO-AFI-012", "Afinado", "Día 31", "12:50", "Atención"]]} />
              </section>
            </div>
          )}

          {moduleId === "balances" && (
            <div className="ops-station__screen ops-station__two-columns ops-station__two-columns--balance">
              <section className="ops-station__panel ops-station__mass-balance">
                <div className="ops-station__panel-head"><div><span>Balance físico</span><h4>De la recepción a las salidas</h4></div><Status>Con soporte</Status></div>
                <div className="ops-station__balance-total"><span>Entrada neta</span><strong>{plant.received.toFixed(2)} t</strong></div>
                <div className="ops-station__balance-split">
                  <article><span>Aceptado</span><strong>{plant.accepted.toFixed(2)} t</strong><i style={{ height: `${(plant.accepted / plant.received) * 150}px` }} /></article>
                  <article><span>Rechazo</span><strong>{plant.rejected.toFixed(2)} t</strong><i style={{ height: `${Math.max(24, (plant.rejected / plant.received) * 150)}px` }} /></article>
                  <article><span>En proceso</span><strong>{plant.processed.toFixed(2)} t</strong><i style={{ height: `${(plant.processed / plant.received) * 150}px` }} /></article>
                  <article><span>Producto</span><strong>{plant.product.toFixed(2)} t</strong><i style={{ height: `${(plant.product / plant.received) * 150}px` }} /></article>
                </div>
              </section>
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Conciliación</span><h4>Diferencias explicables</h4></div><strong>{balanceDifference.toFixed(2)} t</strong></div>
                <div className="ops-station__definitions">
                  <div><span>Material en proceso</span><strong>{balanceDifference.toFixed(2)} t</strong><p>Aceptado que aún no tiene cierre de transformación.</p></div>
                  <div><span>Base del indicador</span><strong>Registros físicos</strong><p>Recepciones, lotes, movimientos e inventarios del periodo.</p></div>
                  <div><span>Regla de calidad</span><strong>Sin doble conteo</strong><p>Las salidas se reconocen desde movimientos confirmados, no desde estimaciones.</p></div>
                </div>
              </section>
            </div>
          )}

          {moduleId === "maintenance" && (
            <div className="ops-station__screen">
              <section className="ops-station__metrics ops-station__metrics--compact">
                <article><span>Disponibles</span><strong>8/9</strong><small>Equipos habilitados</small></article>
                <article><span>Preventivos</span><strong>3</strong><small>Próximos 30 días</small></article>
                <article><span>Correctivos</span><strong>1</strong><small>Orden abierta</small></article>
                <article><span>Tiempo detenido</span><strong>2,4 h</strong><small>Acumulado del periodo</small></article>
              </section>
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Registro de activos</span><h4>Estado y siguiente intervención</h4></div><button type="button" onClick={() => setNotice("Una orden relaciona el equipo con causa, repuestos, tiempo detenido y evidencia de cierre.")}>Qué incluye una orden</button></div>
                <div className="ops-station__equipment">{equipment[plantId].map((item) => <button type="button" key={item[0]} onClick={() => setNotice(`${item[0]}: ficha con historial, manuales, fallas y órdenes de trabajo.`)}><span>{item[0]}</span><strong>{item[1]}</strong><Status tone={item[2] === "Atención" ? "attention" : "ok"}>{item[2]}</Status><small>{item[3]}</small></button>)}</div>
              </section>
            </div>
          )}

          {moduleId === "inventory" && (
            <div className="ops-station__screen">
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Stock por lote</span><h4>Producto terminado e intermedios</h4></div><button type="button" onClick={() => setNotice("El kardex relaciona producción, salida, conciliación y ajustes con su soporte.")}>Qué registra el kardex</button></div>
                <Table label={`Inventario ilustrativo de ${plant.name}`} headers={["Lote", "Producto", "Cantidad", "Estado"]} rows={inventory[plantId]} />
              </section>
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Kardex</span><h4>Movimientos recientes</h4></div><small>Historial append-only</small></div>
                <div className="ops-station__movements">
                  <div><Status>Producción</Status><p><strong>+ {plant.product.toFixed(2)} t</strong><span>Cierre de lote · salida confirmada</span></p><time>14:20</time></div>
                  <div><Status tone="neutral">Despacho</Status><p><strong>- 0,36 t</strong><span>Entrega con destino y soporte</span></p><time>12:35</time></div>
                  <div><Status tone="attention">Conciliación</Status><p><strong>- 0,02 t</strong><span>Ajuste por conteo físico documentado</span></p><time>09:10</time></div>
                </div>
              </section>
            </div>
          )}

          {moduleId === "reports" && (
            <div className="ops-station__screen ops-station__reports-grid">
              {[
                ["Cierre diario", "Operación, actividades, recepciones, proceso, novedades y responsables.", "Listo para revisión"],
                ["Balance de volúmenes", "Entradas, rechazo, inventario en proceso, producto y salidas por periodo.", "Requiere firma"],
                ["Confiabilidad de activos", "Disponibilidad, paradas, causas, tiempos, órdenes y mantenimiento preventivo.", "Borrador"],
                ["Expediente NUIT / SUI", "Consolida información y soportes requeridos según alcance; no sustituye validación regulatoria.", "Preparación"],
                ["Reporte de impacto", "Indicadores con método, periodo, fuente, responsable y nivel de validación.", "Con evidencia"],
                ["Acta de seguimiento", "Decisiones, compromisos, responsables, fecha límite y soportes vinculados.", "Nueva versión"],
              ].map((report, index) => <article key={report[0]}><span>{String(index + 1).padStart(2, "0")}</span><h4>{report[0]}</h4><p>{report[1]}</p><div><Status tone={/Requiere|Borrador|Preparación/.test(report[2]) ? "attention" : "ok"}>{report[2]}</Status><button type="button" onClick={() => setNotice(`${report[0]}: el reporte reúne periodo, fuentes, responsables y soportes pertinentes.`)}>Qué reúne</button></div></article>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
