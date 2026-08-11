"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const profiles = [
  { id: "municipio", label: "Municipio / entidad pública" },
  { id: "esp", label: "ESP / operador de aseo" },
  { id: "empresa", label: "Empresa / gran generador" },
  { id: "agro", label: "Productor agrícola" },
];

const needs: Record<string, { id: string; label: string }[]> = {
  municipio: [
    { id: "diagnostico", label: "Entender qué solución necesita el territorio" },
    { id: "planta", label: "Diseñar / mejorar una planta de aprovechamiento" },
    { id: "operacion", label: "Fortalecer la operación y trazabilidad" },
    { id: "pgirs", label: "Estructurar aprovechamiento dentro del sistema municipal" },
  ],
  esp: [
    { id: "ruta", label: "Diseñar o mejorar ruta selectiva" },
    { id: "planta", label: "Implementar / operar tratamiento de orgánicos" },
    { id: "datos", label: "Digitalizar registros, indicadores y trazabilidad" },
    { id: "valorizacion", label: "Encontrar salidas de valorización para la corriente" },
  ],
  empresa: [
    { id: "residuos", label: "Tengo residuos orgánicos y necesito una solución" },
    { id: "diagnostico", label: "Quiero caracterizar y dimensionar mi corriente" },
    { id: "planta", label: "Evalúo una solución de tratamiento propia" },
    { id: "trazabilidad", label: "Necesito evidencias, indicadores o reportabilidad" },
  ],
  agro: [
    { id: "producto", label: "Quiero comprar Wondergreen" },
    { id: "cultivo", label: "No sé qué línea corresponde a mi cultivo" },
    { id: "volumen", label: "Necesito una cotización por volumen" },
    { id: "distribucion", label: "Quiero evaluar distribución / comercialización" },
  ],
};

const routes: Record<string, { title: string; copy: string; href: string; cta: string; secondary?: { href: string; cta: string } }> = {
  "municipio:diagnostico": { title: "Empieza por prefactibilidad", copy: "Antes de comprar infraestructura conviene cuantificar generación, cobertura, logística, infraestructura disponible, costos y brechas operativas.", href: "/municipios/", cta: "Ver enfoque municipal", secondary: { href: "/contacto/", cta: "Agendar diagnóstico" } },
  "municipio:planta": { title: "Primero dimensionemos el sistema", copy: "La tecnología se define después de conocer residuos, demanda futura, sitio, servicios, operación y destino de productos.", href: "/tecnologia/", cta: "Ver tecnología y plantas", secondary: { href: "/contacto/", cta: "Evaluar proyecto" } },
  "municipio:operacion": { title: "Operación + datos", copy: "Greenatics estructura recepción, proceso, mantenimiento, inventarios, bitácoras y trazabilidad como un único sistema operativo.", href: "/proyectos/yarumal/", cta: "Ver experiencia documentada", secondary: { href: "/contacto/", cta: "Hablar con el equipo" } },
  "municipio:pgirs": { title: "Construyamos la ruta territorial", copy: "El aprovechamiento necesita conectar separación, rutas, planta, operación, producto y medición; no solamente infraestructura.", href: "/municipios/", cta: "Ver solución integral", secondary: { href: "/contacto/", cta: "Solicitar reunión técnica" } },
  "esp:ruta": { title: "Diseño de sistema, no solo recolección", copy: "La ruta selectiva debe estar conectada con generadores, calidad del material, capacidad de tratamiento, rechazo y destino final del producto.", href: "/municipios/", cta: "Ver soluciones para ESP", secondary: { href: "/contacto/", cta: "Evaluar ruta" } },
  "esp:planta": { title: "Tratamiento con lógica operativa", copy: "Evaluamos compostaje, digestión u otras combinaciones en función de la corriente y las condiciones reales del operador.", href: "/tecnologia/", cta: "Explorar arquitectura", secondary: { href: "/contacto/", cta: "Solicitar prefactibilidad" } },
  "esp:datos": { title: "La trazabilidad puede convertirse en infraestructura digital", copy: "Registros, evidencias, históricos, inventarios y KPIs deben nacer de la operación y conservar auditabilidad.", href: "/impacto/", cta: "Ver modelo de datos públicos", secondary: { href: "/contacto/", cta: "Hablar de digitalización" } },
  "esp:valorizacion": { title: "La salida del material se diseña desde el principio", copy: "El tipo de tratamiento y acondicionamiento debe considerar desde el inicio cómo y dónde se valorizarán los coproductos.", href: "/tecnologia/", cta: "Ver rutas de valorización", secondary: { href: "/contacto/", cta: "Evaluar corriente" } },
  "empresa:residuos": { title: "Caractericemos tu corriente", copy: "Origen, volumen, frecuencia, humedad, impropios, logística y restricciones determinan qué solución tiene sentido.", href: "/empresas/", cta: "Ver solución empresarial", secondary: { href: "/contacto/", cta: "Solicitar diagnóstico" } },
  "empresa:diagnostico": { title: "Un diagnóstico evita sobredimensionar", copy: "La primera entrega debería cerrar línea base, alternativas, costos, requerimientos de operación y próximos pasos.", href: "/empresas/", cta: "Ver metodología", secondary: { href: "/contacto/", cta: "Agendar diagnóstico" } },
  "empresa:planta": { title: "No empieces por el equipo", copy: "Primero definimos corriente, escala, sitio, servicios, tratamiento, personal, producto y control; después la ingeniería.", href: "/tecnologia/", cta: "Ver tecnología y plantas", secondary: { href: "/contacto/", cta: "Evaluar proyecto" } },
  "empresa:trazabilidad": { title: "Convierte la operación en evidencia", copy: "Una arquitectura de datos bien diseñada conecta recepción, tratamiento, producto e indicadores sin depender de consolidaciones manuales tardías.", href: "/impacto/", cta: "Ver gobernanza de impacto", secondary: { href: "/contacto/", cta: "Hablar con Greenatics" } },
  "agro:producto": { title: "Ve directo a Wondergreen", copy: "Puedes explorar el portafolio por etapa, formato y producto y luego confirmar disponibilidad y recomendación técnica.", href: "/wondergreen/", cta: "Explorar Wondergreen", secondary: { href: "/wondergreen/cotizador/", cta: "Cotizar" } },
  "agro:cultivo": { title: "Empieza por tu cultivo y su momento", copy: "Las guías orientativas organizan la decisión por etapa fisiológica antes de elegir línea o presentación.", href: "/wondergreen/cultivos/", cta: "Buscar por cultivo", secondary: { href: "/contacto/", cta: "Pedir asesoría" } },
  "agro:volumen": { title: "Calcula una referencia de catálogo", copy: "El cotizador permite combinar presentaciones y cantidades; disponibilidad, logística y condiciones comerciales se confirman con el equipo.", href: "/wondergreen/cotizador/", cta: "Abrir cotizador", secondary: { href: "/contacto/", cta: "Cotización comercial" } },
  "agro:distribucion": { title: "Hablemos de canal y territorio", copy: "La distribución requiere revisar zona, cultivos, capacidad comercial, demanda y condiciones de abastecimiento.", href: "/contacto/", cta: "Hablar con Greenatics" },
};

export function DiagnosticRouter() {
  const [profile, setProfile] = useState("");
  const [need, setNeed] = useState("");

  const result = useMemo(() => (profile && need ? routes[`${profile}:${need}`] : undefined), [profile, need]);

  return (
    <div className="diagnostic-router">
      <div className="diagnostic-step">
        <span className="diagnostic-number">01</span>
        <div><strong>¿Quién eres?</strong><p>Esto cambia por completo la ruta recomendada.</p></div>
        <div className="diagnostic-options">{profiles.map((item) => <button type="button" className={profile === item.id ? "is-active" : ""} key={item.id} onClick={() => { setProfile(item.id); setNeed(""); }}>{item.label}</button>)}</div>
      </div>

      {profile ? <div className="diagnostic-step">
        <span className="diagnostic-number">02</span>
        <div><strong>¿Qué necesitas resolver primero?</strong><p>No buscamos capturar datos personales; solo orientar el siguiente paso.</p></div>
        <div className="diagnostic-options">{needs[profile].map((item) => <button type="button" className={need === item.id ? "is-active" : ""} key={item.id} onClick={() => setNeed(item.id)}>{item.label}</button>)}</div>
      </div> : null}

      {result ? <div className="diagnostic-result">
        <span className="eyebrow eyebrow--light">Ruta sugerida</span>
        <h2>{result.title}</h2>
        <p>{result.copy}</p>
        <div className="button-row"><Link className="button button--light" href={result.href}>{result.cta}</Link>{result.secondary ? <Link className="button button--outline-light" href={result.secondary.href}>{result.secondary.cta}</Link> : null}</div>
      </div> : null}
    </div>
  );
}
