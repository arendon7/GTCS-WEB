"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./diagnostic-initial.module.css";

type AudienceId = "esp" | "municipio" | "empresa" | "ph" | "planta" | "otro";
type Option = { id: string; label: string; copy?: string };
type Recommendation = { title: string; copy: string; href: string; cta: string };

type AudienceDefinition = {
  label: string;
  copy: string;
  needs: Option[];
  states: Option[];
};

const audiences: Record<AudienceId, AudienceDefinition> = {
  esp: {
    label: "ESP / Prestador",
    copy: "Prestación, rutas, infraestructura, operación, regulación y datos.",
    needs: [
      { id: "preparacion", label: "Preparar o fortalecer la operación" },
      { id: "rutas", label: "Mejorar rutas o microrrutas" },
      { id: "organicos", label: "Organizar aprovechamiento de orgánicos" },
      { id: "infraestructura", label: "Evaluar infraestructura o una planta" },
      { id: "operacion", label: "Mejorar la operación" },
      { id: "datos", label: "Organizar datos, evidencia e indicadores" },
      { id: "regulacion", label: "Resolver una decisión jurídica o regulatoria" },
      { id: "no-se", label: "No estoy seguro todavía" },
    ],
    states: [
      { id: "sin-linea-base", label: "Tenemos información incompleta o dispersa" },
      { id: "preparacion", label: "Estamos preparando una decisión o cambio" },
      { id: "operando-con-brechas", label: "Ya operamos, pero hay brechas claras" },
      { id: "operando-sin-datos", label: "Operamos, pero medimos poco" },
      { id: "estable-mejorar", label: "El sistema funciona y queremos mejorarlo" },
    ],
  },
  municipio: {
    label: "Municipio",
    copy: "Planeación territorial, PGIRS, proyectos, activos e implementación.",
    needs: [
      { id: "pgirs", label: "Formular, actualizar o fortalecer PGIRS" },
      { id: "aprovechamiento", label: "Estructurar aprovechamiento" },
      { id: "infraestructura", label: "Evaluar infraestructura o activos" },
      { id: "planta-existente", label: "Revisar una planta existente" },
      { id: "proyecto-nuevo", label: "Madurar un proyecto nuevo" },
      { id: "prestador", label: "Fortalecer capacidades del prestador" },
      { id: "datos", label: "Mejorar seguimiento e indicadores" },
      { id: "no-se", label: "No estoy seguro todavía" },
    ],
    states: [
      { id: "idea", label: "Tenemos una necesidad o idea todavía abierta" },
      { id: "planeacion", label: "Existe planeación, pero falta convertirla en proyecto" },
      { id: "prefactibilidad", label: "Hay un proyecto que necesita maduración" },
      { id: "activo", label: "Existe infraestructura que debemos revisar" },
      { id: "implementacion", label: "Ya estamos implementando y necesitamos seguimiento" },
    ],
  },
  empresa: {
    label: "Empresa / Gran generador",
    copy: "Línea base, PMIRS, gestores, logística, tratamiento y trazabilidad.",
    needs: [
      { id: "diagnostico", label: "Conocer mejor nuestros residuos" },
      { id: "pmirs", label: "Ordenar o actualizar la gestión interna" },
      { id: "sedes", label: "Estandarizar varias sedes" },
      { id: "organicos", label: "Mejorar la gestión de orgánicos" },
      { id: "rutas", label: "Revisar gestores, rutas o logística" },
      { id: "datos", label: "Consolidar indicadores y evidencia" },
      { id: "tratamiento", label: "Evaluar tratamiento propio o una solución técnica" },
      { id: "no-se", label: "No estoy seguro todavía" },
    ],
    states: [
      { id: "sin-linea-base", label: "No tenemos una línea base confiable" },
      { id: "disperso", label: "Tenemos información, pero está dispersa" },
      { id: "plan-poca-implementacion", label: "Existe un plan, pero poca implementación" },
      { id: "gestion-pocos-datos", label: "Gestionamos, pero medimos poco" },
      { id: "estable-mejorar", label: "Tenemos un sistema y queremos optimizarlo" },
    ],
  },
  ph: {
    label: "Propiedad horizontal / Institución",
    copy: "Diagnóstico por unidad, PMIRS, estandarización y lectura de red.",
    needs: [
      { id: "diagnostico", label: "Diagnosticar una unidad o sede" },
      { id: "pmirs", label: "Construir o actualizar PMIRS" },
      { id: "red", label: "Estandarizar varias unidades" },
      { id: "separacion", label: "Mejorar separación y almacenamiento" },
      { id: "rutas", label: "Revisar rutas, recolección o gestores" },
      { id: "datos", label: "Comparar indicadores entre unidades" },
      { id: "no-se", label: "No estoy seguro todavía" },
    ],
    states: [
      { id: "una-unidad", label: "Vamos a empezar con una unidad o sede" },
      { id: "varias-sin-estandar", label: "Tenemos varias unidades con prácticas diferentes" },
      { id: "planes-sin-seguimiento", label: "Existen planes, pero falta seguimiento" },
      { id: "red-activa", label: "Ya existe una red y queremos mejorarla" },
    ],
  },
  planta: {
    label: "Planta / Operador",
    copy: "Estado técnico, rehabilitación, optimización, dirección y datos.",
    needs: [
      { id: "estado", label: "Entender el estado técnico actual" },
      { id: "reactivar", label: "Reactivar una planta que no opera" },
      { id: "optimizar", label: "Corregir problemas de una planta operativa" },
      { id: "proyecto-nuevo", label: "Diseñar o madurar una planta nueva" },
      { id: "operacion", label: "Fortalecer dirección y operación" },
      { id: "datos", label: "Organizar control, trazabilidad e indicadores" },
      { id: "valorizacion", label: "Mejorar calidad, destino o desarrollo de productos" },
      { id: "no-se", label: "No estoy seguro todavía" },
    ],
    states: [
      { id: "no-existe", label: "La infraestructura todavía no existe" },
      { id: "inactiva", label: "Existe, pero no está operando" },
      { id: "problemas", label: "Opera, pero tiene problemas" },
      { id: "estable-mejorar", label: "Opera de forma estable y queremos mejorar" },
      { id: "desconocido", label: "No conocemos bien su estado técnico" },
    ],
  },
  otro: {
    label: "Otro contexto",
    copy: "Usa esta ruta cuando tu organización no encaja claramente en las anteriores.",
    needs: [
      { id: "diagnostico", label: "Entender la situación actual" },
      { id: "planeacion", label: "Organizar un plan o proyecto" },
      { id: "rutas", label: "Revisar logística" },
      { id: "infraestructura", label: "Evaluar infraestructura" },
      { id: "operacion", label: "Mejorar operación" },
      { id: "datos", label: "Organizar datos" },
      { id: "valorizacion", label: "Evaluar una ruta de valorización" },
      { id: "no-se", label: "No estoy seguro todavía" },
    ],
    states: [
      { id: "inicio", label: "Estamos empezando a entender el problema" },
      { id: "informacion-dispersa", label: "Tenemos información dispersa" },
      { id: "implementacion", label: "Ya hacemos algo y queremos ordenarlo" },
      { id: "mejora", label: "El sistema funciona y queremos mejorarlo" },
    ],
  },
};

const needRoute: Record<string, Recommendation> = {
  diagnostico: { title: "Diagnóstico y caracterización", copy: "Construir una línea base antes de decidir rutas, infraestructura o tratamiento.", href: "/soluciones/diagnostico-caracterizacion", cta: "Ver diagnóstico" },
  "no-se": { title: "Diagnóstico y caracterización", copy: "Cuando el problema todavía no está suficientemente delimitado, una línea base ayuda a ordenar la siguiente decisión.", href: "/soluciones/diagnostico-caracterizacion", cta: "Ver diagnóstico" },
  preparacion: { title: "Ruta para ESP / prestadores", copy: "Revisar capacidades, preparación, brechas operativas y decisiones que necesitan mayor estructura.", href: "/soluciones/esp", cta: "Ver ruta para ESP" },
  rutas: { title: "Rutas selectivas y logística", copy: "Revisar generadores, frecuencias, secuencias, tiempos, puntos y datos de operación.", href: "/soluciones/rutas-selectivas", cta: "Ver rutas y logística" },
  organicos: { title: "Gestión de residuos orgánicos", copy: "Conectar generación, separación, logística, tratamiento y destino con un alcance verificable.", href: "/soluciones/residuos-organicos", cta: "Ver ruta de orgánicos" },
  aprovechamiento: { title: "Aprovechamiento y proyecto", copy: "Ordenar corrientes, alternativas y madurez del proyecto antes de comprometer infraestructura.", href: "/soluciones/prefactibilidad", cta: "Ver prefactibilidad" },
  infraestructura: { title: "Plantas e infraestructura", copy: "Separar diagnóstico, rehabilitación, prefactibilidad e ingeniería según el estado real del activo o proyecto.", href: "/soluciones/infraestructura-plantas", cta: "Ver plantas e infraestructura" },
  "planta-existente": { title: "Rehabilitación de infraestructura existente", copy: "Distinguir brechas de infraestructura, proceso, suministro, personal y gestión antes de invertir.", href: "/soluciones/rehabilitacion", cta: "Ver rehabilitación" },
  estado: { title: "Diagnóstico de infraestructura existente", copy: "Empezar por estado técnico, proceso, activos, suministro, mantenimiento y operación.", href: "/soluciones/rehabilitacion", cta: "Revisar infraestructura" },
  reactivar: { title: "Rehabilitación y puesta en marcha", copy: "Separar qué debe repararse, reconfigurarse, documentarse o estabilizarse antes de volver a operar.", href: "/soluciones/rehabilitacion", cta: "Ver rehabilitación" },
  optimizar: { title: "Dirección técnica y optimización", copy: "Revisar proceso, mantenimiento, roles, calidad, inventarios y disciplina operativa.", href: "/soluciones/direccion-operacion", cta: "Ver dirección técnica" },
  "proyecto-nuevo": { title: "Prefactibilidad", copy: "Validar suministro, alternativas, localización, salidas y modelo operativo antes de avanzar a ingeniería.", href: "/soluciones/prefactibilidad", cta: "Ver prefactibilidad" },
  operacion: { title: "Dirección técnica y operación asistida", copy: "Fortalecer protocolos, programación, mantenimiento, control y seguimiento con responsabilidades claras.", href: "/soluciones/direccion-operacion", cta: "Ver dirección técnica" },
  datos: { title: "Datos, trazabilidad y OPS", copy: "Convertir registros de campo y operación en evidencia, indicadores y seguimiento útil para decidir.", href: "/soluciones/trazabilidad-datos", cta: "Ver datos y trazabilidad" },
  regulacion: { title: "Gestión jurídica y regulatoria", copy: "Delimitar la obligación, el actor competente y la decisión concreta antes de definir el alcance jurídico.", href: "/contacto?need=regulacion&service=juridica-regulacion", cta: "Preparar consulta regulatoria" },
  pgirs: { title: "PGIRS", copy: "Conectar planeación territorial, programas, proyectos, metas e implementación con responsabilidades claras.", href: "/soluciones/pgirs", cta: "Ver PGIRS" },
  prestador: { title: "Ruta para ESP / prestadores", copy: "Separar preparación, operación, regulación, infraestructura y datos según la capacidad que deba fortalecerse.", href: "/soluciones/esp", cta: "Ver ruta para ESP" },
  pmirs: { title: "PMIRS y gestión interna", copy: "Ordenar corrientes, responsables, separación, almacenamiento, rutas, gestores, indicadores y evidencia.", href: "/soluciones/pmirs", cta: "Ver PMIRS" },
  sedes: { title: "Gestión multiunidad", copy: "Estandarizar método y datos sin presumir que todas las sedes tienen las mismas condiciones.", href: "/soluciones/propiedad-horizontal", cta: "Ver lógica multiunidad" },
  red: { title: "PMIRS RED", copy: "Trabajar cada unidad con un método comparable y agregar una capa de seguimiento de red.", href: "/soluciones/propiedad-horizontal", cta: "Ver PMIRS RED" },
  separacion: { title: "Diagnóstico y PMIRS", copy: "Revisar corrientes, puntos, almacenamiento y responsabilidades antes de cambiar recipientes o rutas.", href: "/soluciones/pmirs", cta: "Ver gestión interna" },
  tratamiento: { title: "Prefactibilidad de tratamiento", copy: "Comparar alternativas y validar generación, localización, logística y modelo operativo antes de invertir.", href: "/soluciones/prefactibilidad", cta: "Ver prefactibilidad" },
  valorizacion: { title: "Valorización y desarrollo de productos", copy: "Revisar calidad, especificaciones, documentación, destino y viabilidad comercial según la salida del proceso.", href: "/contacto?need=valorizacion&service=valorizacion-productos", cta: "Preparar conversación" },
  planeacion: { title: "Planeación y programas", copy: "Ordenar objetivos, responsables, actividades, indicadores y una hoja de ruta antes de ejecutar.", href: "/soluciones", cta: "Ver soluciones de planeación" },
};

const stateRoute: Record<string, Recommendation> = {
  inactiva: { title: "Rehabilitación antes de reemplazo", copy: "Si la infraestructura existe pero no opera, conviene entender por qué antes de decidir una sustitución o ampliación.", href: "/soluciones/rehabilitacion", cta: "Ver rehabilitación" },
  problemas: { title: "Auditoría y fortalecimiento operativo", copy: "Una planta con problemas necesita separar fallas de proceso, equipo, suministro, personas, mantenimiento y gestión.", href: "/soluciones/rehabilitacion", cta: "Revisar estado de planta" },
  desconocido: { title: "Primero, estado técnico", copy: "Cuando el estado del activo no es claro, la primera decisión es construir evidencia antes de especificar una intervención.", href: "/soluciones/rehabilitacion", cta: "Ver diagnóstico de infraestructura" },
  "sin-linea-base": { title: "Primero, línea base", copy: "Sin generación, corrientes, frecuencias y condiciones suficientemente claras, la siguiente inversión queda apoyada en supuestos débiles.", href: "/soluciones/diagnostico-caracterizacion", cta: "Ver diagnóstico" },
  disperso: { title: "Consolidar información antes de ampliar el sistema", copy: "Una línea base común permite detectar brechas y priorizar qué debe cambiar primero.", href: "/soluciones/diagnostico-caracterizacion", cta: "Ver diagnóstico" },
  "informacion-dispersa": { title: "Consolidar información", copy: "Organizar la evidencia existente puede ser suficiente para definir qué mediciones adicionales hacen falta.", href: "/soluciones/diagnostico-caracterizacion", cta: "Ver diagnóstico" },
  "operando-sin-datos": { title: "Agregar trazabilidad al sistema existente", copy: "Si la operación existe pero la evidencia es débil, puede ser más útil fortalecer captura e indicadores que rediseñar todo el proceso.", href: "/soluciones/trazabilidad-datos", cta: "Ver datos y trazabilidad" },
  "gestion-pocos-datos": { title: "Agregar trazabilidad al sistema existente", copy: "Medir mejor puede revelar qué parte de la gestión realmente necesita intervención.", href: "/soluciones/trazabilidad-datos", cta: "Ver datos y trazabilidad" },
  "planes-sin-seguimiento": { title: "Pasar del plan al seguimiento", copy: "El reto puede estar menos en redactar otro documento y más en responsables, evidencias, actividades e indicadores.", href: "/soluciones/pmirs", cta: "Ver implementación de PMIRS" },
  "varias-sin-estandar": { title: "Estandarizar antes de comparar", copy: "Una red necesita método común por unidad antes de construir indicadores agregados.", href: "/soluciones/propiedad-horizontal", cta: "Ver lógica de red" },
  "no-existe": { title: "Madurar el proyecto antes de construir", copy: "Cuando la infraestructura no existe, prefactibilidad y comparación de alternativas deben preceder la ingeniería de detalle.", href: "/soluciones/prefactibilidad", cta: "Ver prefactibilidad" },
  idea: { title: "Convertir la necesidad en una decisión", copy: "Una idea territorial necesita línea base, actores, alternativas y madurez suficiente antes de llamarse proyecto ejecutable.", href: "/soluciones/diagnostico-caracterizacion", cta: "Ver diagnóstico" },
  prefactibilidad: { title: "Madurar el proyecto", copy: "Si ya existe una idea estructurada, la prefactibilidad permite comparar alternativas y decidir si avanzar.", href: "/soluciones/prefactibilidad", cta: "Ver prefactibilidad" },
  activo: { title: "Revisar el activo existente", copy: "Antes de construir algo nuevo, conviene entender capacidad, estado, brechas y posibilidad de rehabilitación del activo existente.", href: "/soluciones/rehabilitacion", cta: "Ver rehabilitación" },
};

const contactNeed: Record<string, string> = {
  rutas: "rutas", regulacion: "regulacion", operacion: "operacion", datos: "datos", valorizacion: "valorizacion",
  infraestructura: "planta", "planta-existente": "planta", estado: "planta", reactivar: "planta", optimizar: "planta", "proyecto-nuevo": "planta", tratamiento: "planta",
  pgirs: "planeacion", pmirs: "planeacion", red: "planeacion", sedes: "planeacion", separacion: "planeacion", prestador: "planeacion", preparacion: "planeacion", planeacion: "planeacion",
  diagnostico: "diagnostico", "no-se": "diagnostico", organicos: "diagnostico", aprovechamiento: "diagnostico",
};

function findOption(options: Option[], id: string) {
  return options.find((option) => option.id === id);
}

export function DiagnosticRouter() {
  const [audience, setAudience] = useState<AudienceId | "">("");
  const [need, setNeed] = useState("");
  const [state, setState] = useState("");

  const definition = audience ? audiences[audience] : undefined;
  const completed = Boolean(audience && need && state);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialAudience = params.get("audience") as AudienceId | null;
    if (initialAudience && audiences[initialAudience]) {
      setAudience(initialAudience);
      const initialNeed = params.get("need") ?? "";
      const initialState = params.get("state") ?? "";
      if (audiences[initialAudience].needs.some((option) => option.id === initialNeed)) setNeed(initialNeed);
      if (audiences[initialAudience].states.some((option) => option.id === initialState)) setState(initialState);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (audience) params.set("audience", audience);
    if (need) params.set("need", need);
    if (state) params.set("state", state);
    const next = params.toString();
    window.history.replaceState(null, "", next ? `${window.location.pathname}?${next}` : window.location.pathname);
  }, [audience, need, state]);

  const recommendations = useMemo(() => {
    if (!completed) return [] as Recommendation[];
    const items = [needRoute[need], stateRoute[state]].filter(Boolean) as Recommendation[];
    const unique = items.filter((item, index) => items.findIndex((candidate) => candidate.href === item.href) === index);
    return unique.slice(0, 2);
  }, [completed, need, state]);

  const contactHref = useMemo(() => {
    if (!completed || !audience || !definition) return "/contacto";
    const params = new URLSearchParams({
      audience,
      need: contactNeed[need] ?? "diagnostico",
      service: findOption(definition.needs, need)?.label ?? need,
      source: "diagnostico-inicial",
    });
    return `/contacto?${params.toString()}`;
  }, [audience, completed, definition, need]);

  function chooseAudience(value: AudienceId) {
    setAudience(value);
    setNeed("");
    setState("");
  }

  return (
    <div className={styles.routerShell}>
      <div className={styles.progress} aria-label="Progreso del diagnóstico inicial">
        <span className={audience ? styles.progressDone : styles.progressCurrent}>01 · Contexto</span>
        <span className={need ? styles.progressDone : audience ? styles.progressCurrent : undefined}>02 · Necesidad</span>
        <span className={state ? styles.progressDone : need ? styles.progressCurrent : undefined}>03 · Estado actual</span>
        <span className={completed ? styles.progressCurrent : undefined}>04 · Ruta</span>
      </div>

      <section className={styles.step} aria-labelledby="diagnostic-audience-title">
        <div className={styles.stepIntro}><span>01</span><div><h2 id="diagnostic-audience-title">¿Desde qué contexto estás tomando la decisión?</h2><p>El mismo problema cambia según competencia, responsabilidad, escala y relación con la operación.</p></div></div>
        <div className={styles.optionGrid}>
          {(Object.entries(audiences) as [AudienceId, AudienceDefinition][]).map(([id, item]) => (
            <button className={`${styles.option} ${audience === id ? styles.optionSelected : ""}`} type="button" onClick={() => chooseAudience(id)} key={id} aria-pressed={audience === id}>
              <strong>{item.label}</strong><span>{item.copy}</span>
            </button>
          ))}
        </div>
      </section>

      {definition ? (
        <section className={styles.step} aria-labelledby="diagnostic-need-title">
          <div className={styles.stepIntro}><span>02</span><div><h2 id="diagnostic-need-title">¿Qué necesitas resolver primero?</h2><p>No necesitas conocer el nombre del servicio. Elige la decisión que más se parece a tu situación actual.</p></div></div>
          <div className={styles.choiceList}>
            {definition.needs.map((option) => (
              <button className={need === option.id ? styles.choiceSelected : undefined} type="button" onClick={() => { setNeed(option.id); setState(""); }} key={option.id} aria-pressed={need === option.id}>
                <span>{option.label}</span><b aria-hidden="true">→</b>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {definition && need ? (
        <section className={styles.step} aria-labelledby="diagnostic-state-title">
          <div className={styles.stepIntro}><span>03</span><div><h2 id="diagnostic-state-title">¿Cuál describe mejor el estado actual?</h2><p>Esta respuesta ayuda a distinguir entre construir línea base, recuperar capacidad, ordenar implementación o mejorar un sistema que ya funciona.</p></div></div>
          <div className={styles.choiceList}>
            {definition.states.map((option) => (
              <button className={state === option.id ? styles.choiceSelected : undefined} type="button" onClick={() => setState(option.id)} key={option.id} aria-pressed={state === option.id}>
                <span>{option.label}</span><b aria-hidden="true">→</b>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {completed && definition ? (
        <section className={styles.result} aria-labelledby="diagnostic-result-title" aria-live="polite">
          <div className={styles.resultIntro}>
            <span className={styles.resultEyebrow}>04 · Orientación inicial</span>
            <h2 id="diagnostic-result-title">Por lo que nos cuentas, vale la pena revisar estas rutas.</h2>
            <p>Esto no es una prescripción comercial ni un diagnóstico técnico cerrado. Es una forma de reducir el espacio de decisión y llegar con mejor contexto al siguiente paso.</p>
            <div className={styles.resultContext}><strong>{definition.label}</strong><span>{findOption(definition.needs, need)?.label}</span><span>{findOption(definition.states, state)?.label}</span></div>
          </div>
          <div className={styles.recommendations}>
            {recommendations.map((item, index) => (
              <article key={`${item.href}-${index}`}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.copy}</p><Link href={item.href}>{item.cta} →</Link></article>
            ))}
          </div>
          <div className={styles.resultActions}>
            <Link className={`${styles.button} ${styles.primary}`} href={contactHref}>Continuar con Greenatics</Link>
            <button className={`${styles.button} ${styles.ghost}`} type="button" onClick={() => { setAudience(""); setNeed(""); setState(""); }}>Empezar de nuevo</button>
          </div>
          <p className={styles.resultNote}>El contacto conserva el contexto seleccionado para que no tengas que volver a explicar desde cero quién eres y qué decisión estás tratando de tomar.</p>
        </section>
      ) : null}
    </div>
  );
}
