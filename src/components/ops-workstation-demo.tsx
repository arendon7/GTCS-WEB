"use client";

import Link from "next/link";
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
    name: "Yarumal",
    code: "YAR",
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
    processAsset: "Pila CT-024",
    processMetric: "58,4 °C",
  },
  tamesis: {
    name: "Támesis",
    code: "TAM",
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
    processAsset: "Reactor UASB 30 m³",
    processMetric: "6,9 pH",
  },
} as const;

const receptions = {
  yarumal: [
    ["REC-YAR-082", "Ruta selectiva 02", "1.840 kg", "96,2 %", "Aceptado"],
    ["REC-YAR-081", "Plaza de mercado", "1.320 kg", "91,8 %", "Condicionado"],
    ["REC-YAR-080", "Generadores aliados", "1.660 kg", "95,4 %", "Aceptado"],
  ],
  tamesis: [
    ["REC-TAM-047", "Ruta selectiva urbana", "1.260 kg", "92,1 %", "Aceptado"],
    ["REC-TAM-046", "Comercio y restaurantes", "640 kg", "86,3 %", "Condicionado"],
    ["REC-TAM-045", "Plaza y poda limpia", "400 kg", "94,8 %", "Aceptado"],
  ],
} as const;

const logEntries = {
  yarumal: [
    ["07:10", "Recepción", "Cierre de pesaje REC-YAR-082", "María G."],
    ["08:25", "Compostaje", "Volteo y lectura de temperatura CT-024", "José M."],
    ["10:40", "Calidad", "Muestra de humedad enviada a revisión", "Claudia C."],
    ["13:15", "Mantenimiento", "Limpieza preventiva de criba", "Equipo turno A"],
  ],
  tamesis: [
    ["07:05", "Recepción", "Apertura de ruta y control de impropios", "Andrés G."],
    ["08:40", "Hidrólisis", "Alimentación de reactor RH-02", "Juan O."],
    ["11:20", "UASB", "Lectura de pH, caudal y presión de gas", "Cristian C."],
    ["14:05", "Bioenergía", "Verificación de filtros y almacenamiento", "Equipo turno A"],
  ],
} as const;

const equipment = {
  yarumal: [
    ["EQ-YAR-01", "Criba rotatoria", "Operativo", "Inspección en 12 días"],
    ["EQ-YAR-03", "Bomba de lixiviados", "Atención", "Orden preventiva abierta"],
    ["EQ-YAR-07", "Sensor CT-024", "Operativo", "Calibración vigente"],
  ],
  tamesis: [
    ["EQ-TAM-01", "Reactor UASB", "Operativo", "Rutina diaria completada"],
    ["EQ-TAM-04", "Filtro de H₂S", "Atención", "Cambio de medio programado"],
    ["EQ-TAM-06", "Red de biogás", "Operativo", "Inspección de fugas vigente"],
  ],
} as const;

const inventory = {
  yarumal: [
    ["WG-COMP-2026-31", "Compost tamizado", "2.640 kg", "Disponible"],
    ["WG-BIOL-2026-18", "Líquido estabilizado", "1.120 L", "En control"],
    ["WG-BASE-2026-09", "Matriz de formulación", "780 kg", "Reservado"],
  ],
  tamesis: [
    ["TAM-COMP-2026-14", "Compost maduro", "1.460 kg", "Disponible"],
    ["TAM-BIOL-2026-08", "Efluente estabilizado", "2.200 L", "En control"],
    ["TAM-EMP-2026-03", "Producto empacado", "60 costales", "Comprometido"],
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
  const [period, setPeriod] = useState("Hoy");
  const [completedChecks, setCompletedChecks] = useState(["epp", "scale"]);
  const [notice, setNotice] = useState("Selecciona un módulo para explorar el flujo operativo.");
  const plant = scenarios[plantId];
  const balanceDifference = Math.max(0, plant.accepted - plant.processed);

  const toggleCheck = (id: string) => {
    setCompletedChecks((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const changeModule = (id: ModuleId) => {
    setModuleId(id);
    setNotice(`${modules.find((module) => module.id === id)?.label}: vista cargada con datos ilustrativos de ${plant.name}.`);
  };

  return (
    <div className="ops-station">
      <div className="ops-station__topbar">
        <div className="ops-station__brand"><span aria-hidden="true">G</span><div><strong>GREENATICS</strong><small>OPS · Estación operativa</small></div></div>
        <div className="ops-station__demo-lock"><span>Demostración funcional</span><strong>Datos ilustrativos, no operación en vivo</strong></div>
        <div className="ops-station__topbar-actions" aria-label="Navegación de la estación">
          <Link href="/plataforma/usuarios/">Usuarios y permisos</Link>
          <Link href="/" aria-label="Volver al sitio Greenatics">Volver a Greenatics</Link>
        </div>
      </div>

      <div className="ops-station__body">
        <aside className="ops-station__rail" aria-label="Módulos de la demostración">
          <div className="ops-station__rail-context"><span>Planta activa</span><strong>{plant.code}</strong><small>{plant.name}</small></div>
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
          <div className="ops-station__rail-foot"><span /> Fuente preparada para persistencia, permisos e historial.</div>
        </aside>

        <div className="ops-station__workspace" role="region" aria-label="Área de trabajo de Greenatics OPS">
          <header className="ops-station__workspace-head">
            <div><span className="ops-station__breadcrumb">Operaciones / {modules.find((module) => module.id === moduleId)?.label}</span><h3>{moduleId === "today" ? "Control del día" : modules.find((module) => module.id === moduleId)?.detail}</h3></div>
            <div className="ops-station__filters">
              <label>Planta<select value={plantId} onChange={(event) => { setPlantId(event.target.value as PlantId); setNotice(`Contexto cambiado a ${scenarios[event.target.value as PlantId].name}.`); }}><option value="tamesis">Támesis</option><option value="yarumal">Yarumal</option></select></label>
              <label>Periodo<select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Hoy</option><option>Semana</option><option>Mes</option></select></label>
              <button type="button" className="ops-station__primary-action" onClick={() => setNotice("En la versión productiva se abriría una actividad vinculada a planta, turno, responsable y evidencia.")}>+ Nueva actividad</button>
            </div>
          </header>

          <p className="ops-station__notice" aria-live="polite">{notice}</p>

          {moduleId === "today" && (
            <div className="ops-station__screen">
              <section className="ops-station__metrics" aria-label={`Indicadores ilustrativos de ${period.toLowerCase()}`}>
                <article><span>Recibido</span><strong>{plant.received.toFixed(2)} t</strong><small>Entradas registradas</small></article>
                <article><span>Aceptado</span><strong>{plant.accepted.toFixed(2)} t</strong><small>{plant.quality.toFixed(1)} % de calidad</small></article>
                <article><span>Procesado</span><strong>{plant.processed.toFixed(2)} t</strong><small>{plant.line}</small></article>
                <article><span>{plant.energyLabel}</span><strong>{plant.energyValue}</strong><small>Variable específica de planta</small></article>
              </section>
              <div className="ops-station__dashboard-grid">
                <section className="ops-station__panel ops-station__panel--flow">
                  <div className="ops-station__panel-head"><div><span>Balance del día</span><h4>Entrada, proceso y salida</h4></div><Status>Cuadrado</Status></div>
                  <div className="ops-station__flow-row"><span>Recepción</span><div><i style={{ width: "100%" }} /></div><strong>{plant.received.toFixed(2)} t</strong></div>
                  <div className="ops-station__flow-row"><span>Aceptado</span><div><i style={{ width: `${(plant.accepted / plant.received) * 100}%` }} /></div><strong>{plant.accepted.toFixed(2)} t</strong></div>
                  <div className="ops-station__flow-row"><span>En proceso</span><div><i style={{ width: `${(plant.processed / plant.received) * 100}%` }} /></div><strong>{plant.processed.toFixed(2)} t</strong></div>
                  <div className="ops-station__flow-row"><span>Producto</span><div><i style={{ width: `${(plant.product / plant.received) * 100}%` }} /></div><strong>{plant.product.toFixed(2)} t</strong></div>
                  <div className="ops-station__source-note">Cada indicador abre los registros que lo componen. En producción, el cierre no se acepta si faltan origen, periodo o responsable.</div>
                </section>
                <section className="ops-station__panel">
                  <div className="ops-station__panel-head"><div><span>Atención</span><h4>Excepciones abiertas</h4></div><strong className="ops-station__alert-count">{plant.alertCount}</strong></div>
                  <div className="ops-station__alerts">
                    <button type="button" onClick={() => setNotice("Incidencia abierta con responsable, evidencia y fecha objetivo.")}><Status tone="attention">Mantenimiento</Status><strong>{plantId === "tamesis" ? "Revisar medio filtrante H₂S" : "Inspeccionar bomba de lixiviados"}</strong><span>Prioridad media · vence hoy</span></button>
                    <button type="button" onClick={() => setNotice("Registro de recepción abierto con trazabilidad del material condicionado.")}><Status tone="attention">Calidad</Status><strong>Recepción condicionada pendiente de cierre</strong><span>Requiere causa y destino del rechazo</span></button>
                    <button type="button" onClick={() => setNotice("La decisión queda asociada al objeto fuente y no se pierde en un chat externo.")}><Status tone="neutral">Decisión</Status><strong>Validar programación del siguiente turno</strong><span>Responsable: supervisión de planta</span></button>
                  </div>
                </section>
              </div>
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Actividad reciente</span><h4>Qué está haciendo el equipo</h4></div><small>{plant.activityCount} actividades en el periodo</small></div>
                <div className="ops-station__timeline">{logEntries[plantId].map((entry) => <button type="button" key={entry[0]} onClick={() => setNotice(`Detalle de bitácora: ${entry[2]}.`)}><time>{entry[0]}</time><i /><div><strong>{entry[2]}</strong><span>{entry[1]} · {entry[3]}</span></div><b>Ver</b></button>)}</div>
              </section>
            </div>
          )}

          {moduleId === "logbook" && (
            <div className="ops-station__screen ops-station__two-columns">
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Bitácora de turno</span><h4>Secuencia de actividades</h4></div><Status>Turno A</Status></div>
                <div className="ops-station__timeline ops-station__timeline--large">{logEntries[plantId].map((entry) => <button type="button" key={entry[0]} onClick={() => setNotice(`Registro ${entry[0]} preparado para evidencia, comentarios e historial de cambios.`)}><time>{entry[0]}</time><i /><div><strong>{entry[2]}</strong><span>{entry[1]} · Responsable: {entry[3]}</span></div><b>Detalle</b></button>)}</div>
              </section>
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Cierre controlado</span><h4>Checklist del turno</h4></div><strong>{completedChecks.length}/4</strong></div>
                <div className="ops-station__checklist">
                  {[
                    ["epp", "EPP y condiciones de seguridad"],
                    ["scale", "Báscula y equipos verificados"],
                    ["volume", "Volúmenes y lotes conciliados"],
                    ["evidence", "Evidencias y novedades adjuntas"],
                  ].map(([id, label]) => <label key={id}><input type="checkbox" checked={completedChecks.includes(id)} onChange={() => toggleCheck(id)} /><span>{label}</span></label>)}
                </div>
                <div className="ops-station__source-note">La bitácora conserva hora, autor, planta, objeto relacionado y evidencia. Una corrección agrega historial; no borra el registro original.</div>
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
                <div className="ops-station__panel-head"><div><span>Historial de ingreso</span><h4>Recepciones y calidad</h4></div><button type="button" onClick={() => setNotice("El formulario de recepción valida bruto, tara, neto, corriente, procedencia, aceptación y evidencia.")}>Ver campos de captura</button></div>
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
                <Table label="Lotes de proceso ilustrativos" headers={["Lote", "Proceso", "Inicio", "Último control", "Estado"]} rows={plantId === "tamesis" ? [["TAM-UASB-026", "Digestión anaerobia", "06:50", "14:05", "Operativo"], ["TAM-HID-031", "Hidrólisis", "08:40", "13:20", "Operativo"], ["TAM-COMP-014", "Maduración", "Día 18", "11:45", "Atención"]] : [["YAR-CT-024", "Fase termófila", "Día 6", "13:40", "Operativo"], ["YAR-MAD-019", "Maduración", "Día 22", "10:15", "Operativo"], ["YAR-AFI-012", "Afinado", "Día 31", "12:50", "Atención"]]} />
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
                <div className="ops-station__panel-head"><div><span>Registro de activos</span><h4>Estado y siguiente intervención</h4></div><button type="button" onClick={() => setNotice("La orden de mantenimiento se vincula al equipo, causa, repuestos, tiempo detenido y evidencia de cierre.")}>Nueva orden</button></div>
                <div className="ops-station__equipment">{equipment[plantId].map((item) => <button type="button" key={item[0]} onClick={() => setNotice(`${item[0]}: ficha con historial, manuales, fallas y órdenes de trabajo.`)}><span>{item[0]}</span><strong>{item[1]}</strong><Status tone={item[2] === "Atención" ? "attention" : "ok"}>{item[2]}</Status><small>{item[3]}</small></button>)}</div>
              </section>
            </div>
          )}

          {moduleId === "inventory" && (
            <div className="ops-station__screen">
              <section className="ops-station__panel">
                <div className="ops-station__panel-head"><div><span>Stock por lote</span><h4>Producto terminado e intermedios</h4></div><button type="button" onClick={() => setNotice("El kardex registra producción, salida, conciliación y ajuste sin sobrescribir movimientos anteriores.")}>Registrar movimiento</button></div>
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
              ].map((report, index) => <article key={report[0]}><span>{String(index + 1).padStart(2, "0")}</span><h4>{report[0]}</h4><p>{report[1]}</p><div><Status tone={/Requiere|Borrador|Preparación/.test(report[2]) ? "attention" : "ok"}>{report[2]}</Status><button type="button" onClick={() => setNotice(`${report[0]}: vista previa preparada con versión, periodo y fuentes.`)}>Vista previa</button></div></article>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
