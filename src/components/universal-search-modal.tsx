"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SearchItem {
  title: string;
  category: string;
  url: string;
  desc: string;
}

const searchIndex: SearchItem[] = [
  // Crops
  { title: "Café · Guía y Programa Nutricional", category: "Cultivos Agro", url: "/wondergreen/cultivos/cafe/", desc: "Levante, floración, llenado de grano y poszoca en Andisoles." },
  { title: "Aguacate Hass · Guía de Campo", category: "Cultivos Agro", url: "/wondergreen/cultivos/aguacate/", desc: "Sanidad radicular, cuajado y calibres 14-22 de exportación." },
  { title: "Cacao · Guía y Manejo de Sombra", category: "Cultivos Agro", url: "/wondergreen/cultivos/cacao/", desc: "Floración, amarre y llenado de mazorca sin monilia." },
  { title: "Limón Tahití · Floración Continua", category: "Cultivos Agro", url: "/wondergreen/cultivos/limon-tahiti/", desc: "Flujos continuos de brotación, floración y grados Brix." },
  { title: "Pastos y Praderas · Forraje y Rebrote", category: "Cultivos Agro", url: "/wondergreen/cultivos/pastos-gramineas/", desc: "Aforo, oferta forrajera y recuperación pospastoreo." },
  { title: "Plátano y Banano · Peso de Racimo", category: "Cultivos Agro", url: "/wondergreen/cultivos/platano-banano/", desc: "Emisión foliar semanal, belloteo y calibración de dedos." },
  { title: "Tomate Chonto · Equilibrio y Cuajado", category: "Cultivos Agro", url: "/wondergreen/cultivos/tomate-chonto/", desc: "Prevención de culillo negro y firmeza de fruta." },
  { title: "Lechuga y Hortalizas · Ciclo Rápido", category: "Cultivos Agro", url: "/wondergreen/cultivos/lechuga/", desc: "Crocancia, peso fresco y tolerancia a tipburn." },
  { title: "Gulupa · Pasifloras y Espaldera", category: "Cultivos Agro", url: "/wondergreen/cultivos/gulupa/", desc: "Amarre floral, grosor de cáscara y grados Brix >15°." },
  { title: "Granadilla · Emparrillado y Pulpa", category: "Cultivos Agro", url: "/wondergreen/cultivos/granadilla/", desc: "Consistencia de cáscara y llenado de pulpa." },
  { title: "Uchuva · Calibre y Cáliz", category: "Cultivos Agro", url: "/wondergreen/cultivos/uchuva/", desc: "Calibre de cáliz, sólidos solubles y prevención de rajado." },
  { title: "Lulo · Raíz Superficial", category: "Cultivos Agro", url: "/wondergreen/cultivos/lulo/", desc: "Nutrición fraccionada y cuaje continuo." },

  // Products
  { title: "Wondergreen 2GROW (15-3-3)", category: "Productos", url: "/wondergreen/", desc: "Arranque y brotación con oclusión orgánica (40 kg)." },
  { title: "Wondergreen 2BALANCE (7-7-7)", category: "Productos", url: "/wondergreen/", desc: "Mantenimiento continuo y acondicionamiento del suelo (40 kg)." },
  { title: "Wondergreen 2BLOOM (3-8-3)", category: "Productos", url: "/wondergreen/", desc: "Fósforo ocluido para floración y cuajado (40 kg)." },
  { title: "Wondergreen 2FRUIT (3-3-8)", category: "Productos", url: "/wondergreen/", desc: "Potasio de lenta entrega para peso de fruto y grados Brix (40 kg)." },
  { title: "Wondergreen Bioinsumos & Bioles", category: "Productos", url: "/wondergreen/", desc: "Microorganismos nativos y extractos botánicos líquidos." },

  // Specialized Agronomic Tools
  { title: "🌾 Calculadora Agronómica por Hectárea", category: "Herramientas Agro", url: "/wondergreen/calculadora/", desc: "Calcula bultos, bioinsumos y presupuesto en COP." },
  { title: "Organizador de Análisis de Suelo", category: "Herramientas Agro", url: "/wondergreen/analisis-suelo/", desc: "Ordena pH, materia orgánica y otras variables para preparar una revisión técnica." },
  { title: "💧 Intérprete de Calidad de Agua & RAS", category: "Herramientas Agro", url: "/wondergreen/analisis-agua/", desc: "Salinidad, riesgo de sodio y fertirriego sin obturación." },
  { title: "🧪 Calculadora de Encalamiento & Desbloqueo", category: "Herramientas Agro", url: "/wondergreen/encalamiento/", desc: "Neutralización de acidez con enmienda y ácidos húmicos." },
  { title: "⚖️ Balance Catiónico (Ca / Mg / K)", category: "Herramientas Agro", url: "/wondergreen/balance-bases/", desc: "Saturación de bases y prevención de antagonismos." },
  { title: "🍂 Formulador C/N para Biopilas", category: "Herramientas Agro", url: "/wondergreen/balance-cn/", desc: "Relación Carbono/Nitrógeno y humedad para compostaje." },
  { title: "Calibración de aspersión", category: "Herramientas Agro", url: "/wondergreen/calibracion-aspersores/", desc: "Convierte una prueba de campo con agua en cargas y volumen operativo." },
  { title: "🐷 Valorización Pecuaria (Porquinaza & Gallinaza)", category: "Herramientas Agro", url: "/wondergreen/valorizacion-pecuaria/", desc: "Transformación de estiércol en abono organomineral." },
  { title: "🧪 Matriz de Compatibilidad de Mezclas", category: "Herramientas Agro", url: "/wondergreen/compatibilidad/", desc: "Verifica compatibilidad física y biológica en tanque." },
  { title: "Criterios de Manejo Integrado", category: "Herramientas Agro", url: "/wondergreen/fitosanidad/", desc: "Organiza diagnóstico, monitoreo, selección y verificación antes de considerar un bioinsumo." },
  { title: "📅 Calendario Agrícola Fenológico", category: "Herramientas Agro", url: "/wondergreen/calendario-agricola/", desc: "Cronograma de floración, llenado y cosecha por mes." },
  { title: "🎓 Quiz de Deficiencias Nutricionales", category: "Herramientas Agro", url: "/wondergreen/quiz-deficiencias/", desc: "Diagnóstico visual interactivo de hojas y frutos." },
  { title: "☕ Valorización de Pulpa y Mucílago de Café", category: "Herramientas Agro", url: "/wondergreen/beneficio-cafe/", desc: "Producción de abono y bioles en biofábricas cafeteras." },
  { title: "💰 Comparador de Costo por Nutriente Asimilado", category: "Herramientas Agro", url: "/wondergreen/costo-unidad-nutriente/", desc: "Ahorro real anti-lixiviación frente a sales químicas." },
  { title: "🚛 Calculadora Logística de Carga & Fletes", category: "Herramientas Agro", url: "/wondergreen/logistica-flete/", desc: "Cálculo de peso, estibas (pallets) y camión óptimo." },
  { title: "💬 Cotizador B2B WhatsApp", category: "Herramientas Agro", url: "/wondergreen/cotizador/", desc: "Generador de proformas comerciales para el campo." },

  // Municipal & Corporate Solutions
  { title: "Prefactibilidad municipal", category: "Soluciones", url: "/soluciones/viabilidad-municipal/", desc: "Organiza generación, logística, infraestructura, costos, actores y ruta de implementación." },
  { title: "Orientación sobre beneficio tributario ambiental", category: "Soluciones", url: "/soluciones/beneficio-tributario/", desc: "Ruta de evaluación técnica y documental; la aplicabilidad depende del proyecto y del concepto tributario correspondiente." },
  { title: "📑 Autodiagnóstico SUI & CRA 720", category: "Soluciones", url: "/soluciones/auditoria-sui/", desc: "Auditoría de requisitos obligatorios para empresas de aseo." },
  { title: "Biogás y bioenergía", category: "Soluciones", url: "/soluciones/biogas-energia/", desc: "Prefactibilidad, diagnóstico de reactores, captura, seguridad y uso energético." },
  { title: "Microrrutas y flota", category: "Soluciones", url: "/soluciones/flota-recoleccion/", desc: "Diseño de zonas, frecuencias, pruebas de ruta y selección de vehículos." },
  { title: "Riesgo de lixiviados", category: "Soluciones", url: "/soluciones/riesgo-lixiviados/", desc: "Balance hídrico, fuentes, cargas, prevención, tratamiento y seguimiento." },
  { title: "Aprovechamiento de podas", category: "Soluciones", url: "/soluciones/podas-municipales/", desc: "Caracterización, clasificación, trituración, logística y destinos verificables." },
  { title: "Circularidad empresarial", category: "Soluciones", url: "/soluciones/vertimiento-cero/", desc: "Línea base, prevención, aprovechamiento, destinos e indicadores trazables." },
  { title: "🌱 Calcula tu Huella & Metano (ESG)", category: "Sostenibilidad", url: "/huella/", desc: "Mitigación en 4 etapas: Cimiento, Desarrollo, Maduración y Neutralidad." },
  { title: "🧭 Orientador Diagnóstico", category: "Soluciones", url: "/diagnostico/", desc: "Encuentra en 3 clics la solución para tu caso." },
  { title: "GREENATICS OPS · Control operativo", category: "Soluciones", url: "/app/", desc: "Bitácoras, recepciones, procesos, volúmenes, activos, inventario y reportes configurables." },
  { title: "🔐 Portal de Plataformas Internas & Acceso", category: "Institucional", url: "/acceso/", desc: "Autenticación para operadores, directores ESP y agrónomos." },

  // Knowledge & Library
  { title: "Biblioteca técnica Greenatics", category: "Recursos", url: "/biblioteca/", desc: "Guías web, manuales, casos, metodologías y herramientas organizadas por tema." },
  { title: "📖 Glosario de Economía Circular & Agronomía", category: "Recursos", url: "/biblioteca/glosario/", desc: "Definiciones de Oclusión, C.I.C., Andisoles, CRA 720." },
  { title: "🗺️ Proyectos & Evidencia en Territorio", category: "Recursos", url: "/proyectos/", desc: "Casos Yarumal y Támesis: rutas, plantas, bioprocesos, energía y evidencia." },
  { title: "🌿 Caso Yarumal · Capacidad Territorial", category: "Casos", url: "/proyectos/yarumal/", desc: "Microrrutas, aprovechamiento local, compostaje y resultados validados." },
  { title: "⚡ Caso Támesis · UASB y Bioenergía", category: "Casos", url: "/proyectos/tamesis/", desc: "Hidrólisis, reactor UASB, captura de biogás, bioenergía y control operativo." },
  { title: "Impacto y gobierno de indicadores", category: "Recursos", url: "/impacto/", desc: "Resultados validados, método de cálculo y estados de aprobación de los datos." },
  { title: "❓ Preguntas Frecuentes FAQ", category: "Recursos", url: "/faq/", desc: "Respuestas técnicas sobre oclusión, plantas y hogar." },
  { title: "🏡 Casa & Jardín · Cuidado Botánico de Hogar", category: "Hogar", url: "/casa-jardin/", desc: "Kits por espacio, 5 etapas y Doctor Plantas." },
  { title: "🏛️ Nosotros & Manifiesto de Ingeniería", category: "Institucional", url: "/nosotros/", desc: "Alianza GIEM-UdeA, principios y equipo." },
  { title: "📞 Contacto & Agendamiento Técnico", category: "Institucional", url: "/contacto/", desc: "Sede en Medellín, WhatsApp y Microsoft Bookings." }
];

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

  const filtered = query.trim() === ""
    ? searchIndex.slice(0, 8)
    : searchIndex.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
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

        <div style={{ maxHeight: "440px", overflowY: "auto", padding: "12px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--muted)" }}>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>No se encontraron resultados para &ldquo;{query}&rdquo;</p>
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
