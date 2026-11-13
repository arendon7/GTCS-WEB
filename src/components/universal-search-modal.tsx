"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { libraryResources } from "@/data/library";
import { products } from "@/data/products";
import { digitalTools } from "@/data/digital-tools";

interface SearchItem {
  title: string;
  category: string;
  url: string;
  desc: string;
}

const coreSearchItems: SearchItem[] = [
  // Specialized Agronomic Tools
  { title: "Preparar recomendación por cultivo", category: "Herramientas Agro", url: "/wondergreen/calculadora/", desc: "Organiza cultivo, área y etapa para una consulta técnica; no calcula dosis ni costos." },
  { title: "Organizador de Análisis de Suelo", category: "Herramientas Agro", url: "/wondergreen/analisis-suelo/", desc: "Ordena pH, materia orgánica y otras variables para preparar una revisión técnica." },
  { title: "Intérprete de calidad de agua y RAS", category: "Herramientas Agro", url: "/wondergreen/analisis-agua/", desc: "Organiza variables de calidad de agua para orientar su revisión agronómica." },
  { title: "Calculadora de encalamiento", category: "Herramientas Agro", url: "/wondergreen/encalamiento/", desc: "Explora necesidades de corrección de acidez con los datos disponibles del suelo." },
  { title: "Balance catiónico (Ca / Mg / K)", category: "Herramientas Agro", url: "/wondergreen/balance-bases/", desc: "Revisa relaciones entre bases como apoyo a la interpretación del suelo." },
  { title: "Formulador C/N para biopilas", category: "Herramientas Agro", url: "/wondergreen/balance-cn/", desc: "Explora la relación carbono-nitrógeno y la humedad de una mezcla." },
  { title: "Calibración de aspersión", category: "Herramientas Agro", url: "/wondergreen/calibracion-aspersores/", desc: "Convierte una prueba de campo con agua en cargas y volumen operativo." },
  { title: "Valorización pecuaria", category: "Bioeconomía", url: "/wondergreen/valorizacion-pecuaria/", desc: "Prepara los datos de generación y manejo para evaluar una ruta de aprovechamiento." },
  { title: "Consulta de compatibilidad de mezclas", category: "Herramientas Agro", url: "/wondergreen/compatibilidad/", desc: "Reúne productos y condiciones para una revisión técnica con Greenatics." },
  { title: "Criterios de Manejo Integrado", category: "Herramientas Agro", url: "/wondergreen/fitosanidad/", desc: "Organiza diagnóstico, monitoreo, selección y verificación antes de considerar un bioinsumo." },
  { title: "Planificador agrícola por etapa", category: "Herramientas Agro", url: "/wondergreen/calendario-agricola/", desc: "Marca la etapa observada en cada mes de tu lote de café o aguacate; consulta qué revisar antes de elegir una línea." },
  { title: "Quiz de deficiencias nutricionales", category: "Herramientas Agro", url: "/wondergreen/quiz-deficiencias/", desc: "Recurso interactivo para aprender a observar señales en plantas." },
  { title: "Valorización del beneficio de café", category: "Bioeconomía", url: "/wondergreen/beneficio-cafe/", desc: "Organiza las corrientes del beneficio para estudiar alternativas y estructurar un piloto." },
  { title: "Comparador de costo por unidad de nutriente", category: "Herramientas Agro", url: "/wondergreen/costo-unidad-nutriente/", desc: "Compara costos declarados por unidad de nutriente; no estima respuesta del cultivo." },
  { title: "Calculadora logística de carga y fletes", category: "Herramientas Agro", url: "/wondergreen/logistica-flete/", desc: "Organiza variables de peso, volumen y transporte para comparar escenarios." },

  // Municipal & Corporate Solutions
  { title: "Prefactibilidad municipal", category: "Soluciones", url: "/soluciones/viabilidad-municipal/", desc: "Organiza generación, logística, infraestructura, costos, actores y ruta de implementación." },
  { title: "Orientación sobre beneficio tributario ambiental", category: "Soluciones", url: "/soluciones/beneficio-tributario/", desc: "Ruta de evaluación técnica y documental; la aplicabilidad depende del proyecto y del concepto tributario correspondiente." },
  { title: "Autodiagnóstico SUI y CRA 720", category: "Soluciones", url: "/soluciones/auditoria-sui/", desc: "Organiza requisitos y evidencias para una revisión de cumplimiento." },
  { title: "Biogás y bioenergía", category: "Soluciones", url: "/soluciones/biogas-energia/", desc: "Prefactibilidad, diagnóstico de reactores, captura, seguridad y uso energético." },
  { title: "Microrrutas y flota", category: "Soluciones", url: "/soluciones/flota-recoleccion/", desc: "Diseño de zonas, frecuencias, pruebas de ruta y selección de vehículos." },
  { title: "Recolección, trazabilidad y tratamiento recurrentes", category: "Servicios", url: "/servicios/recoleccion-tratamiento/", desc: "Conecta generadores, retiro periódico, recepción y tratamiento de orgánicos separados." },
  { title: "Planta en Marcha · rehabilitación de infraestructura existente", category: "Servicios", url: "/servicios/rehabilitacion-infraestructura/", desc: "Evaluación técnica, priorización de intervenciones y condiciones de puesta en marcha." },
  { title: "Riesgo de lixiviados", category: "Soluciones", url: "/soluciones/riesgo-lixiviados/", desc: "Balance hídrico, fuentes, cargas, prevención, tratamiento y seguimiento." },
  { title: "Aprovechamiento de podas", category: "Soluciones", url: "/soluciones/podas-municipales/", desc: "Caracterización, clasificación, trituración, logística y destinos verificables." },
  { title: "Circularidad empresarial", category: "Soluciones", url: "/soluciones/circularidad-empresarial/", desc: "Línea base, prevención, aprovechamiento, destinos e indicadores trazables." },
  { title: "Orientador de soluciones", category: "Soluciones", url: "/diagnostico/", desc: "Encuentra una ruta inicial según el reto que quieres resolver." },
  { title: "Acceso a herramientas", category: "Herramientas", url: "/acceso/", desc: "Consulta muestras públicas, entornos de trabajo y opciones para solicitar acceso." },

  // Knowledge & Library
  { title: "Proyectos y evidencia en territorio", category: "Recursos", url: "/proyectos/", desc: "Explora los casos documentados de Yarumal y Támesis." },
  { title: "Preguntas frecuentes", category: "Recursos", url: "/faq/", desc: "Respuestas sobre productos, operación y servicios Greenatics." },
  { title: "Casa & Jardín", category: "Hogar", url: "/casa-jardin/", desc: "Productos, kits y orientaciones para plantas y huertas del hogar." },
  { title: "Nosotros", category: "Institucional", url: "/nosotros/", desc: "Conoce Greenatics, su experiencia, equipo y forma de trabajo." },
  { title: "Contacto", category: "Institucional", url: "/contacto/", desc: "Cuéntanos sobre el proyecto, el cultivo o la operación que quieres desarrollar." }
];

const productSearchItems: SearchItem[] = products.map((product) => ({
  title: product.name,
  category: "Productos",
  url: `/wondergreen/productos/${product.slug}/`,
  desc: `${product.headline}. Consulta la ficha y las condiciones de uso.`,
}));

const resourceSearchItems: SearchItem[] = libraryResources
  .filter((resource) => resource.status === "publicado")
  .map((resource) => ({ title: resource.title, category: "Biblioteca", url: resource.href, desc: resource.summary }));

const digitalToolSearchItems: SearchItem[] = digitalTools.map(({ name, landingHref, title }) => ({
  title: name,
  category: "Herramientas",
  url: landingHref,
  desc: title,
}));

const searchIndex: SearchItem[] = [...coreSearchItems, ...digitalToolSearchItems, ...productSearchItems, ...resourceSearchItems];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function UniversalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const normalizedQuery = normalize(query.trim());
  const filtered = normalizedQuery === ""
    ? searchIndex.slice(0, 8)
    : searchIndex.filter(item =>
        normalize(item.title).includes(normalizedQuery) ||
        normalize(item.category).includes(normalizedQuery) ||
        normalize(item.desc).includes(normalizedQuery)
      );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(10, 41, 32, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px 20px 20px 20px"
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="universal-search-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "#ffffff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
          border: "1px solid var(--line)"
        }}
      >
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: "12px", background: "#fafcf9" }}>
          <span style={{ fontSize: "1.2rem" }} aria-hidden="true">🔍</span>
          <span id="universal-search-title" className="sr-only">Buscar en Greenatics</span>
          <input
            className="universal-search-input"
            type="text"
            aria-label="Buscar en Greenatics"
            placeholder="Buscar cultivos, herramientas, servicios o manuales en PDF..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: "none",
              fontSize: "1rem",
              background: "transparent",
              color: "var(--green-950)",
              fontWeight: 600
            }}
          />
          <span style={{ fontSize: "0.74rem", color: "var(--muted)", background: "#eaf5e6", padding: "4px 8px", borderRadius: "6px", fontWeight: 700 }}>ESC</span>
        </div>

        <div aria-live="polite" aria-relevant="additions text" style={{ maxHeight: "440px", overflowY: "auto", padding: "12px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--muted)" }}>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>No encontramos resultados para &ldquo;{query}&rdquo;.</p>
              <p style={{ margin: "8px 0 0", fontSize: "0.82rem" }}>Prueba con un producto, cultivo, servicio o herramienta.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <Link
                key={item.url + item.title}
                href={item.url}
                onClick={onClose}
                style={{
                  display: "block",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  transition: "background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
                  marginBottom: "4px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f8ec"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                  <strong style={{ fontSize: "0.95rem", color: "var(--green-950)" }}>{item.title}</strong>
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--green-800)", background: "#eaf5e6", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                    {item.category}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.4 }}>
                  {item.desc}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
