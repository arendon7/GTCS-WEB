"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

interface ProfileItem {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const profiles: ProfileItem[] = [
  {
    id: "municipio",
    label: "Municipio / Entidad Pública",
    icon: "🏛️",
    description: "Alcaldías, gobernaciones, secretarías de ambiente y planeación territorial.",
  },
  {
    id: "esp",
    label: "ESP / Operador de Aseo",
    icon: "🚛",
    description: "Empresas prestadoras de servicios públicos y operadores de recolección y aseo.",
  },
  {
    id: "empresa",
    label: "Empresa / Gran Generador",
    icon: "🏭",
    description: "Plantas de alimentos, centros comerciales, casinos corporativos y agroindustria.",
  },
  {
    id: "agro",
    label: "Productor Agrícola / Finca",
    icon: "🌾",
    description: "Agricultores, mayordomos, administradores de fincas y cadenas de cultivo.",
  },
];

const needs: Record<string, { id: string; label: string; sub: string }[]> = {
  municipio: [
    { id: "diagnostico", label: "Entender qué solución necesita el territorio", sub: "Estudio de generación, brechas y prefactibilidad" },
    { id: "planta", label: "Diseñar / mejorar una planta de aprovechamiento", sub: "Compostaje, digestión anaerobia o Parque Ambiental" },
    { id: "operacion", label: "Fortalecer la operación y trazabilidad", sub: "Control diario, protocolos y reducción de rechazo" },
    { id: "pgirs", label: "Estructurar aprovechamiento dentro del PGIRS", sub: "Articulación técnica y metas territoriales reales" },
  ],
  esp: [
    { id: "ruta", label: "Diseñar o mejorar la ruta selectiva", sub: "Microrrutas con motocarguero y pureza en la fuente" },
    { id: "planta", label: "Implementar / operar tratamiento de orgánicos", sub: "Tratamiento modular sin colapsar la logística" },
    { id: "datos", label: "Digitalizar registros y trazabilidad", sub: "Plataforma GREENATICS OPS y balance de masa" },
    { id: "valorizacion", label: "Encontrar salidas de valorización para la corriente", sub: "Transformación en fertilizante o biogás" },
  ],
  empresa: [
    { id: "residuos", label: "Tengo residuos orgánicos y necesito una solución", sub: "Gestión integral de biomasa y comedores" },
    { id: "diagnostico", label: "Quiero caracterizar y dimensionar mi corriente", sub: "Línea base, humedad, volumen y frecuencias" },
    { id: "planta", label: "Evalúo una solución de tratamiento propia", sub: "Planta modular in-situ o tratamiento externo" },
    { id: "trazabilidad", label: "Necesito evidencias e indicadores ESG", sub: "Certificados de aprovechamiento y mitigación de CO2" },
  ],
  agro: [
    { id: "producto", label: "Quiero comprar Wondergreen", sub: "Acondicionadores, fórmulas 2GROW, 2BALANCE, etc." },
    { id: "cultivo", label: "No sé qué línea corresponde a mi cultivo", sub: "Café, aguacate, pastos, hortalizas o frutales" },
    { id: "volumen", label: "Necesito una cotización por volumen", sub: "Precios de bultos de 40 kg o garrafas por lote" },
    { id: "distribucion", label: "Quiero evaluar distribución / comercialización", sub: "Alianzas comerciales y representación de zona" },
  ],
};

interface RouteResult {
  title: string;
  badge: string;
  copy: string;
  steps: string[];
  href: string;
  cta: string;
  secondary?: { href: string; cta: string };
}

const routes: Record<string, RouteResult> = {
  "municipio:diagnostico": {
    badge: "Ruta Territorial 01",
    title: "Diagnóstico y Prefactibilidad Territorial",
    copy: "Antes de comprar equipos o licitar obras, cuantificamos generación real de FORSU, cobertura de rutas, logística, sitio disponible y costos para estructurar un modelo viable.",
    steps: ["Caracterización de generación y microrrutas", "Evaluación de sitio y tecnología adecuada", "Modelo financiero y estructuración de PGIRS"],
    href: "/municipios/",
    cta: "Ver enfoque municipal",
    secondary: { href: "/contacto/", cta: "Agendar diagnóstico técnico" },
  },
  "municipio:planta": {
    badge: "Infraestructura & Biología",
    title: "Dimensionamiento de Planta o Parque Ambiental",
    copy: "La ingeniería se adapta a la corriente: compostaje aireado para biomasa leñosa/estructurante o digestión anaerobia multietapa para residuos con alta humedad.",
    steps: ["Definición de capacidad modular", "Diseño de bioprocesos con respaldo GIEM-UdeA", "Plan de contingencia y control de olores"],
    href: "/tecnologia/",
    cta: "Ver tecnología y plantas",
    secondary: { href: "/contacto/", cta: "Evaluar proyecto de planta" },
  },
  "municipio:operacion": {
    badge: "Operación & Trazabilidad",
    title: "Operación Estandarizada y GREENATICS OPS",
    copy: "Greenatics estructura la operación continua: manuales POE, mantenimiento preventivo, control de parámetros biológicos e inventarios gobernados.",
    steps: ["Protocolos de operación y seguridad", "Capacitación de operarios en planta", "Monitoreo digital mediante GREENATICS OPS"],
    href: "/proyectos/yarumal/",
    cta: "Ver experiencia documentada (Yarumal)",
    secondary: { href: "/contacto/", cta: "Hablar con el equipo" },
  },
  "municipio:pgirs": {
    badge: "Planeación & Ejecución",
    title: "Articulación Integral de Aprovechamiento PGIRS",
    copy: "Conectamos la meta del papel con la realidad de la calle: cultura ciudadana, recolección selectiva, planta de tratamiento y destino del fertilizante para agricultores locales.",
    steps: ["Alineación con metas del PGIRS municipal", "Rutas selectivas con motocarguero", "Retorno del abono a campesinos del municipio"],
    href: "/municipios/",
    cta: "Ver solución integral",
    secondary: { href: "/contacto/", cta: "Solicitar reunión técnica" },
  },
  "esp:ruta": {
    badge: "Logística Selectiva",
    title: "Diseño de Microrrutas y Calidad de Origen",
    copy: "Una ruta selectiva eficiente opera con menor costo unitario usando vehículos ágiles (motocargueros) y minimizando el rechazo en planta con pedagogía en origen.",
    steps: ["Trazado de microrrutas de alta densidad", "Protocolo de pureza > 90%", "Pesaje y registro georreferenciado"],
    href: "/municipios/",
    cta: "Ver soluciones para ESP",
    secondary: { href: "/contacto/", cta: "Evaluar ruta" },
  },
  "esp:planta": {
    badge: "Tratamiento de Orgánicos",
    title: "Operación y Tratamiento sin Cuellos de Botella",
    copy: "Diseñamos la planta con zonas claras de descarga, bioproceso y maduración para absorber picos de generación sin generar pasivos por malos olores o lixiviados.",
    steps: ["Balance de masa y tiempos de retención", "Manejo integral de lixiviados", "Aseguramiento de calidad del producto final"],
    href: "/tecnologia/",
    cta: "Explorar arquitectura",
    secondary: { href: "/contacto/", cta: "Solicitar prefactibilidad" },
  },
  "esp:datos": {
    badge: "Infraestructura Digital",
    title: "Digitalización con GREENATICS OPS",
    copy: "Transforma las planillas de papel en una plataforma digital que registra pesajes, tiempos, lotes e indicadores para reportar a entidades de control y certificar clientes.",
    steps: ["Registro digital en punto de pesaje", "Control de lotes y bitácoras de proceso", "Dashboard con exportación de reportes auditables"],
    href: "/impacto/",
    cta: "Ver gobernanza de datos",
    secondary: { href: "/contacto/", cta: "Hablar de digitalización" },
  },
  "esp:valorizacion": {
    badge: "Cierre de Ciclo",
    title: "Comercialización y Valorización de Coproductos",
    copy: "Estructuramos la salida comercial del compost y bioinsumos hacia viveros, reforestación, parques y productores locales para generar ingresos complementarios.",
    steps: ["Ensayos agronómicos de calidad", "Empaque y formulación Wondergreen", "Canales de distribución local"],
    href: "/wondergreen/",
    cta: "Ver portafolio Wondergreen",
    secondary: { href: "/contacto/", cta: "Evaluar corriente" },
  },
  "empresa:residuos": {
    badge: "Solución Empresarial",
    title: "Gestión Circular de Corrientes Orgánicas",
    copy: "Diseñamos un plan de recolección y aprovechamiento para tu biomasa (residuos de comedor, mermas de producción, lodos orgánicos) con trazabilidad total.",
    steps: ["Diagnóstico rápido de generación", "Recolección selectiva programada", "Certificados de aprovechamiento y mitigación de CO2"],
    href: "/empresas/",
    cta: "Ver solución empresarial",
    secondary: { href: "/contacto/", cta: "Solicitar diagnóstico" },
  },
  "empresa:diagnostico": {
    badge: "Caracterización",
    title: "Caracterización y Línea Base Empresarial",
    copy: "Analizamos volumen, humedad, impurezas y estacionalidad para determinar si conviene tratamiento in-situ o recolección especializada externa.",
    steps: ["Muestreo y balance de materia", "Comparativa de costos vs. disposición en relleno", "Propuesta de valorización y retorno de inversión"],
    href: "/empresas/",
    cta: "Ver metodología",
    secondary: { href: "/contacto/", cta: "Agendar diagnóstico" },
  },
  "empresa:planta": {
    badge: "Planta In-Situ",
    title: "Solución de Tratamiento Propia y Modular",
    copy: "Implementamos sistemas cerrados de digestión anaerobia o compostaje electromecánico diseñados para operar dentro de predios industriales sin impacto vecinal.",
    steps: ["Estudio de implantación en predio", "Ingeniería de detalle y tratamiento de gases", "Puesta en marcha y transferencia operativa"],
    href: "/tecnologia/",
    cta: "Ver tecnología y plantas",
    secondary: { href: "/contacto/", cta: "Evaluar proyecto" },
  },
  "empresa:trazabilidad": {
    badge: "Reportabilidad ESG",
    title: "Evidencia y Trazabilidad para Informes de Sostenibilidad",
    copy: "Conectamos los datos de tus residuos con indicadores auditables de desvío de vertedero, emisiones de metano evitadas y aporte a metas de sostenibilidad corporativa.",
    steps: ["Conexión a GREENATICS OPS", "Certificados mensuales con firma técnica", "Métricas listas para reportes GRI y ESG"],
    href: "/impacto/",
    cta: "Ver gobernanza de impacto",
    secondary: { href: "/contacto/", cta: "Hablar con Greenatics" },
  },
  "agro:producto": {
    badge: "Nutrición Agrícola",
    title: "Línea Wondergreen Nutrients para tu Campo",
    copy: "Accede al portafolio de acondicionadores orgánicos (Compost 40kg) y fertilizantes organominerales formulados por etapa (2GROW, 2BALANCE, 2BLOOM, 2FRUIT).",
    steps: ["Selección de la referencia según análisis de suelo", "Cotización directa por bulto o lote", "Acompañamiento agronómico en aplicación"],
    href: "/wondergreen/",
    cta: "Explorar Wondergreen",
    secondary: { href: "/wondergreen/cotizador/", cta: "Abrir cotizador" },
  },
  "agro:cultivo": {
    badge: "Recomendación por Cultivo",
    title: "Guías Nutricionales por Tipo de Cultivo",
    copy: "Consulta los planes de manejo específicos para Café, Aguacate Hass, Pastos/Ganadería, Plátano, Cítricos y Hortalizas según su momento fenológico.",
    steps: ["Identificación del cultivo y estado", "Revisión de la guía técnica", "Plan de fertilización recomendado"],
    href: "/wondergreen/cultivos/",
    cta: "Buscar por cultivo",
    secondary: { href: "/contacto/", cta: "Pedir asesoría" },
  },
  "agro:volumen": {
    badge: "Cotizador en Vivo",
    title: "Cotización de Pedido y Logística",
    copy: "Utiliza el cotizador interactivo para armar paquetes por bultos o toneladas, estimar pesos y solicitar despacho a tu municipio o finca.",
    steps: ["Selección de referencias y presentaciones", "Estimación de peso y valor de catálogo", "Confirmación de flete y entrega"],
    href: "/wondergreen/cotizador/",
    cta: "Ir al cotizador interactivo",
    secondary: { href: "/contacto/", cta: "Hablar con ventas" },
  },
  "agro:distribucion": {
    badge: "Canal Comercial",
    title: "Alianzas de Distribución y Almacenes Agrícolas",
    copy: "Si tienes un almacén agroveterinario, cooperativa o empresa de asistencia técnica, revisemos condiciones comerciales y suministro preferencial.",
    steps: ["Revisión de zona de influencia", "Margen comercial y apoyo técnico", "Capacitación en producto para tus clientes"],
    href: "/contacto/",
    cta: "Hablar con Greenatics",
  },
};

export function DiagnosticRouter() {
  const [profile, setProfile] = useState<string>("");
  const [need, setNeed] = useState<string>("");

  const currentProfile = profiles.find((p) => p.id === profile);
  const result = useMemo(() => (profile && need ? routes[`${profile}:${need}`] : undefined), [profile, need]);
  const contactHref = result
    ? `/contacto/?interes=diagnostico&perfil=${encodeURIComponent(profile)}&diagnostico=${encodeURIComponent(result.title)}&prioridad=${encodeURIComponent(result.copy)}`
    : "/contacto/";

  const resetDiagnostic = () => {
    setProfile("");
    setNeed("");
  };

  return (
    <div className="diagnostic-wizard">
      {/* Wizard Progress Header */}
      <div className="wizard-progress-bar">
        <div className={`wizard-step-node ${profile ? "is-complete" : "is-active"}`}>
          <span className="step-circle">1</span>
          <span className="step-text">¿Quién eres?</span>
        </div>
        <div className="wizard-connector" />
        <div className={`wizard-step-node ${need ? "is-complete" : profile ? "is-active" : ""}`}>
          <span className="step-circle">2</span>
          <span className="step-text">¿Qué necesitas?</span>
        </div>
        <div className="wizard-connector" />
        <div className={`wizard-step-node ${result ? "is-active" : ""}`}>
          <span className="step-circle">3</span>
          <span className="step-text">Hoja de Ruta</span>
        </div>
      </div>

      {/* Step 1: Profile Selection */}
      <div className="wizard-step-card">
        <div className="wizard-step-header">
          <span className="diagnostic-number">01</span>
          <div>
            <h3>Selecciona tu perfil o sector</h3>
            <p>El punto de partida define la arquitectura técnica y operativa de la solución.</p>
          </div>
        </div>

        <div className="profile-cards-grid">
          {profiles.map((item) => {
            const isSelected = profile === item.id;
            return (
              <button
                type="button"
                className={`profile-select-card ${isSelected ? "is-selected" : ""}`}
                key={item.id}
                onClick={() => {
                  setProfile(item.id);
                  setNeed("");
                }}
              >
                <div className="profile-icon">{item.icon}</div>
                <div className="profile-content">
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
                {isSelected && <span className="profile-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Need Selection */}
      {profile && (
        <div className="wizard-step-card wizard-step-card--active">
          <div className="wizard-step-header">
            <span className="diagnostic-number">02</span>
            <div>
              <h3>¿Cuál es tu prioridad inmediata como {currentProfile?.label}?</h3>
              <p>Indica el reto que necesitas resolver para obtener una ruta concreta.</p>
            </div>
          </div>

          <div className="needs-cards-grid">
            {needs[profile].map((item) => {
              const isSelected = need === item.id;
              return (
                <button
                  type="button"
                  className={`need-select-card ${isSelected ? "is-selected" : ""}`}
                  key={item.id}
                  onClick={() => setNeed(item.id)}
                >
                  <strong>{item.label}</strong>
                  <small>{item.sub}</small>
                  {isSelected && <span className="need-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Actionable Result */}
      {result && (
        <div className="diagnostic-result-card">
          <div className="result-card-top">
            <span className="eyebrow eyebrow--light">{result.badge}</span>
            <button type="button" className="wizard-reset-btn" onClick={resetDiagnostic}>
              🔄 Reiniciar diagnóstico
            </button>
          </div>

          <h2>{result.title}</h2>
          <p className="result-lead">{result.copy}</p>

          <div className="result-plan-box">
            <strong>Plan de acción sugerido por Greenatics:</strong>
            <ol className="result-steps-list">
              {result.steps.map((step, idx) => (
                <li key={step}>
                  <span className="step-idx">{idx + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="result-actions-row">
            <Link className="button button--light" href={result.href}>
              {result.cta} →
            </Link>
            {result.secondary && (
              <Link className="button button--outline-light" href={result.secondary.href === "/contacto/" ? contactHref : result.secondary.href}>
                {result.secondary.cta}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
