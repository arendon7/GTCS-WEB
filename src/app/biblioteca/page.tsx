"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";

interface DocumentItem {
  id: string;
  title: string;
  category: "cultivos" | "productos" | "hogar" | "ingenieria" | "poe" | "giem";
  categoryLabel: string;
  desc: string;
  pages: string;
  format: string;
  coverImage: string;
  downloadUrl?: string;
  referenceHref?: string;
  referenceLabel?: string;
  badge: string;
}

const documents: DocumentItem[] = [
  // 1. CULTIVOS AGRO
  { id: "cafe", title: "Manual Técnico Wondergreen: Café (20 Páginas)", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Levante, floración, llenado de grano y poszoca en suelos Andisoles volcánicos.", pages: "20 Páginas", format: "PDF (3.2 MB)", coverImage: "/guides/guia-cafe-cover.webp", downloadUrl: "/downloads/MANUAL_TECNICO_WONDERGREEN_CAFE_PROFUNDO_20P.pdf", badge: "Manual 20P" },
  { id: "aguacate", title: "Manual Técnico Wondergreen: Aguacate Hass", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Sanidad radicular, cuajado y calibres 14-22 de exportación con materia seca >23%.", pages: "20 Páginas", format: "PDF (2.8 MB)", coverImage: "/guides/guia-aguacate-cover.webp", downloadUrl: "/downloads/MANUAL_TECNICO_WONDERGREEN_AGUACATE_PROFUNDO_20P.pdf", badge: "Manual 20P" },
  { id: "cacao", title: "Manual Técnico Wondergreen: Cacao Fino de Aroma", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Cojines florales, amarre de cherelles y llenado de mazorca sin monilia.", pages: "20 Páginas", format: "PDF (2.4 MB)", coverImage: "/guides/guia-cacao-cover.webp", downloadUrl: "/downloads/MANUAL_TECNICO_WONDERGREEN_CACAO_PROFUNDO_20P.pdf", badge: "Manual 20P" },
  { id: "citricos", title: "Manual Técnico Wondergreen: Cítricos & Limón Tahití", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Flujos continuos de floración, porcentaje de jugo >42% y sólidos solubles.", pages: "20 Páginas", format: "PDF (2.9 MB)", coverImage: "/guides/guia-citricos-cover.webp", downloadUrl: "/downloads/MANUAL_TECNICO_WONDERGREEN_LIMON_TAHITI_PROFUNDO_20P.pdf", badge: "Manual 20P" },
  { id: "pastos", title: "Manual Técnico Wondergreen: Pastos y Praderas", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Aforo forrajero, proteína cruda, descompactación y rebrote pospastoreo.", pages: "20 Páginas", format: "PDF (2.2 MB)", coverImage: "/guides/guia-pastos-cover.webp", downloadUrl: "/downloads/MANUAL_TECNICO_WONDERGREEN_PASTOS_PRADERAS_PROFUNDO_20P.pdf", badge: "Manual 20P" },
  { id: "platano", title: "Manual Técnico Wondergreen: Plátano y Banano", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Emisión foliar semanal, belloteo y calibración de dedos comerciales.", pages: "20 Páginas", format: "PDF (3.4 MB)", coverImage: "/guides/guia-platano-banano-cover.webp", downloadUrl: "/downloads/MANUAL_TECNICO_WONDERGREEN_BANANO_PLATANO_PROFUNDO_20P.pdf", badge: "Manual 20P" },
  { id: "tomate", title: "Guía Oficial Wondergreen: Tomate Chonto & Pimentón", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Prevención de pudrición apical (culillo negro), firmeza y cuajado continuo.", pages: "14 Páginas", format: "PDF (1.9 MB)", coverImage: "/guides/guia-tomate-chonto-cover.webp", downloadUrl: "/downloads/01_GUIA_WONDERGREEN_TOMATE_CHONTO_V1.pdf", badge: "Guía Oficial" },
  { id: "lechuga", title: "Guía Oficial Wondergreen: Lechuga & Hortalizas", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Ciclo rápido (45 días), peso fresco, crocancia y tolerancia a tipburn.", pages: "12 Páginas", format: "PDF (1.6 MB)", coverImage: "/guides/home-garden-mi-huerta-cover.webp", downloadUrl: "/downloads/01_GUIA_WONDERGREEN_LECHUGA_V1.pdf", badge: "Guía Oficial" },
  { id: "gulupa", title: "Guía Oficial Wondergreen: Gulupa & Pasifloras", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Espaldera, amarre floral, grosor de cáscara y brix >15°.", pages: "14 Páginas", format: "PDF (1.8 MB)", coverImage: "/guides/guia-gulupa-cover.webp", downloadUrl: "/downloads/01_GUIA_WONDERGREEN_GULUPA_V1.pdf", badge: "Guía Oficial" },
  { id: "granadilla", title: "Guía Oficial Wondergreen: Granadilla", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Emparrillado tradicional, consistencia de cáscara y peso de pulpa.", pages: "14 Páginas", format: "PDF (1.8 MB)", coverImage: "/guides/guia-granadilla-cover.webp", downloadUrl: "/downloads/01_GUIA_WONDERGREEN_GRANADILLA_V1.pdf", badge: "Guía Oficial" },
  { id: "uchuva", title: "Guía Oficial Wondergreen: Uchuva de Exportación", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Calibre de cáliz (capacho), sólidos solubles y prevención de rajado.", pages: "14 Páginas", format: "PDF (1.7 MB)", coverImage: "/guides/guia-uchuva-cover.webp", downloadUrl: "/downloads/01_GUIA_WONDERGREEN_UCHUVA_V1.pdf", badge: "Guía Oficial" },
  { id: "lulo", title: "Guía Oficial Wondergreen: Lulo (Naranjilla)", category: "cultivos", categoryLabel: "Cultivos Agro", desc: "Raíz superficial, nutrición fraccionada y cuaje continuo.", pages: "14 Páginas", format: "PDF (1.7 MB)", coverImage: "/guides/guia-lulo-cover.webp", downloadUrl: "/downloads/01_GUIA_WONDERGREEN_LULO_V1.pdf", badge: "Guía Oficial" },

  // 2. PRODUCTOS WONDERGREEN
  { id: "cat-wondergreen", title: "Catálogo Maestro Wondergreen Nutrients", category: "productos", categoryLabel: "Catálogos Wondergreen", desc: "Fichas técnicas completas de las 4 fórmulas sólidas (40 kg) y bioinsumos líquidos con oclusión húmica.", pages: "10 Páginas", format: "PDF (versión pública)", coverImage: "/guides/catalogo-cover.webp", downloadUrl: "/downloads/catalogo-wondergreen.pdf", badge: "Catálogo Maestro" },
  { id: "manual-uso", title: "Guía de Dosificación y Aplicación en Campo", category: "productos", categoryLabel: "Catálogos Wondergreen", desc: "Criterios para preparar, ejecutar y revisar una aplicación; la ficha vigente define la dosis y compatibilidad específica.", pages: "Guía web", format: "Referencia online", coverImage: "/guides/guia-cafe-cover.webp", referenceHref: "/biblioteca/manual-uso-wondergreen/", referenceLabel: "Abrir guía web", badge: "Guía web" },
  { id: "ficha-2grow", title: "Referencia técnica: Wondergreen 2GROW (15-3-3)", category: "productos", categoryLabel: "Catálogos Wondergreen", desc: "Rol de la fórmula, presentaciones y contexto de uso dentro del sistema Wondergreen.", pages: "Catálogo", format: "PDF (versión pública)", coverImage: "/products/wondergreen-2grow.webp", downloadUrl: "/downloads/catalogo-wondergreen.pdf", badge: "Catálogo técnico" },
  { id: "ficha-biol", title: "Ficha técnica: Biol Wondergreen", category: "productos", categoryLabel: "Catálogos Wondergreen", desc: "Documento fuente con presentaciones, usos documentados, composición analítica y condiciones de almacenamiento del fertilizante líquido con actividad biológica.", pages: "2 Páginas", format: "PDF (15 MB)", coverImage: "/guides/ficha-biol-cover.png", downloadUrl: "/downloads/ficha-tecnica-biol-wondergreen.pdf", badge: "Documento fuente" },

  // 3. INGENIERÍA & REGULACIÓN MUNICIPAL
  { id: "dossier-esp", title: "Ruta técnica: Soluciones para Municipios & ESP", category: "ingenieria", categoryLabel: "Ingeniería & Normatividad", desc: "Plantas modulares de bioprocesos, microrrutas en motocargueros y modelo de acompañamiento territorial.", pages: "Referencia web", format: "Página Greenatics", coverImage: "/campaign/01_solucion_integral.jpg", referenceHref: "/municipios/", referenceLabel: "Abrir ruta municipal", badge: "Referencia web" },
  { id: "guia-sui", title: "Ruta de reportabilidad SUI & liquidación", category: "ingenieria", categoryLabel: "Ingeniería & Normatividad", desc: "Contexto para organizar datos, soportes y responsabilidades de reportabilidad en servicios de aprovechamiento.", pages: "Referencia web", format: "Página Greenatics", coverImage: "/campaign/01_solucion_integral.jpg", referenceHref: "/soluciones/auditoria-sui/", referenceLabel: "Abrir solución SUI", badge: "Referencia web" },
  { id: "guia-tributaria", title: "Beneficio tributario ambiental", category: "ingenieria", categoryLabel: "Ingeniería & Normatividad", desc: "Ruta para revisar soporte técnico, alcance y requisitos antes de estructurar una solicitud de beneficio ambiental.", pages: "Referencia web", format: "Página Greenatics", coverImage: "/campaign/01_solucion_integral.jpg", referenceHref: "/soluciones/beneficio-tributario/", referenceLabel: "Abrir solución tributaria", badge: "Referencia web" },

  // 4. POEs & OPERACIÓN DE PLANTA
  { id: "poe-bascula", title: "POE-01: Protocolo de Pesaje y Control en Báscula", category: "poe", categoryLabel: "POEs & Operación", desc: "Estructura de referencia para registrar tara, origen, calidad, peso neto, recepción y novedades.", pages: "Referencia web", format: "GREENATICS OPS", coverImage: "/campaign/01_solucion_integral.jpg", referenceHref: "/app/", referenceLabel: "Explorar OPS", badge: "Referencia web" },
  { id: "poe-termofilia", title: "POE-02: Control Térmico y Pasteurización en Biopilas", category: "poe", categoryLabel: "POEs & Operación", desc: "Criterios para seguir temperatura, volteo y condiciones de proceso en biopilas.", pages: "Referencia web", format: "Página Greenatics", coverImage: "/campaign/01_solucion_integral.jpg", referenceHref: "/tecnologia/", referenceLabel: "Abrir tecnología", badge: "Referencia web" },

  // 5. CASA & JARDÍN BOTÁNICO
  { id: "guia-huerta", title: "Guía Práctica: Mi Huerta Urbana en Casa", category: "hogar", categoryLabel: "Casa & Jardín", desc: "Semilleros, sustratos vivos y cuidados para cosechar aromáticas y tomates en balcón o terraza.", pages: "16 Páginas", format: "PDF (2.5 MB)", coverImage: "/guides/home-garden-mi-huerta-cover.webp", downloadUrl: "/downloads/guia-mi-huerta.pdf", badge: "Guía Doméstica" },
  { id: "guia-plantas-interior", title: "Manual de Cuidado de Plantas de Interior", category: "hogar", categoryLabel: "Casa & Jardín", desc: "Criterios de luz, riego, sustrato, drenaje, observación y nutrición para plantas de interior.", pages: "14 Páginas", format: "PDF (2.1 MB)", coverImage: "/guides/home-garden-casa-jardin-cover.webp", downloadUrl: "/downloads/guia-casa-jardin.pdf", badge: "Guía doméstica" },

  { id: "paper-giem", title: "Base técnica de bioprocesos y valorización", category: "giem", categoryLabel: "Ciencia aplicada", desc: "Conceptos de compostaje, digestión anaerobia, control de proceso y salidas de valorización.", pages: "Referencia web", format: "Página Greenatics", coverImage: "/guides/catalogo-cover.webp", referenceHref: "/tecnologia/", referenceLabel: "Explorar tecnología", badge: "Referencia web" }
];

export default function BibliotecaPage() {
  const [filter, setFilter] = useState<string>("todos");
  const [search, setSearch] = useState<string>("");

  const filtered = documents.filter((doc) => {
    const matchesFilter = filter === "todos" || doc.category === filter;
    const matchesSearch = search.trim() === "" ||
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.desc.toLowerCase().includes(search.toLowerCase()) ||
      doc.categoryLabel.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const libraryUrl = `${site.url}/biblioteca/`;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Biblioteca técnica", url: libraryUrl }]} />
      <div style={{ background: "#f8faf6", color: "var(--green-950)", padding: "70px 0 90px", overflowX: "hidden" }}>
      <div className="container">
        <nav className="library-context-nav" aria-label="Ruta de navegación de la Biblioteca">
          <Link href="/">← Volver a Greenatics</Link>
          <span aria-hidden="true">Centro de conocimiento</span>
          <Link href="/wondergreen/">Explorar Wondergreen →</Link>
        </nav>

        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 40px" }}>
          <div className="eyebrow-badge" style={{ marginBottom: "16px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green-800)", display: "inline-block" }} />
            <span>Centro de Conocimiento & Ingeniería Editorial · {documents.length} recursos curados</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.4rem, 4.2vw, 3.5rem)", color: "var(--green-950)", margin: "8px 0 14px" }}>
            Biblioteca Técnica & Repositorio de Documentos (PDF)
          </h1>
          <p className="lead" style={{ color: "var(--muted)", margin: "0 auto" }}>
            Consulta guías por cultivo, criterios de uso Wondergreen, herramientas de operación y referencias para preparar decisiones técnicas. Cada recurso indica su función y no reemplaza el documento contractual, regulatorio o la ficha vigente.
          </p>
        </div>

        {/* Live Metrics Bar (1440px Wide) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", background: "rgba(10, 41, 32, 0.8)", border: "1.5px solid rgba(255, 255, 255, 0.15)", borderRadius: "var(--radius-lg)", padding: "20px 28px", backdropFilter: "blur(20px)", color: "#ffffff", marginBottom: "40px" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "var(--lime-400)", fontWeight: 800, textTransform: "uppercase" }}>Repositorio</span>
            <strong style={{ fontSize: "1.35rem", color: "#ffffff", display: "block" }}>Rutas curadas</strong>
          </div>
          <div>
            <span style={{ fontSize: "0.72rem", color: "#a8c7b8", fontWeight: 800, textTransform: "uppercase" }}>Acceso</span>
            <strong style={{ fontSize: "1.35rem", color: "var(--lime-400)", display: "block" }}>Web y PDF</strong>
          </div>
          <div>
            <span style={{ fontSize: "0.72rem", color: "#a8c7b8", fontWeight: 800, textTransform: "uppercase" }}>Respaldo</span>
            <strong style={{ fontSize: "1.35rem", color: "#ffffff", display: "block" }}>Fuentes identificadas</strong>
          </div>
          <div>
            <span style={{ fontSize: "0.72rem", color: "#a8c7b8", fontWeight: 800, textTransform: "uppercase" }}>Calidad</span>
            <strong style={{ fontSize: "1.35rem", color: "var(--lime-400)", display: "block" }}>Versión controlada</strong>
          </div>
        </div>

        {/* Search & Filter Bar (1440px Wide) */}
        <div style={{ background: "#ffffff", padding: "20px 24px", borderRadius: "20px", border: "1.5px solid var(--line)", boxShadow: "var(--shadow-sm)", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          
          {/* Category Filter Pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              { id: "todos", label: "Todos los Documentos" },
              { id: "cultivos", label: "🌾 Cultivos Agro (12)" },
              { id: "productos", label: "📦 Catálogos Wondergreen" },
              { id: "ingenieria", label: "🏛️ Regulación & ESP" },
              { id: "poe", label: "⚙️ POEs de Planta" },
              { id: "hogar", label: "🏡 Casa & Jardín" },
              { id: "giem", label: "Ciencia aplicada" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px",
                  border: filter === tab.id ? "1.5px solid var(--green-800)" : "1px solid var(--line)",
                  background: filter === tab.id ? "var(--green-800)" : "#ffffff",
                  color: filter === tab.id ? "#ffffff" : "var(--muted)",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "var(--transition-fast)"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Instant Search Box */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <input
              className="library-page-search"
              aria-label="Buscar en la Biblioteca técnica"
              type="text"
              placeholder="Buscar por cultivo, norma o palabra clave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px 10px 38px",
                borderRadius: "12px",
                border: "1.5px solid var(--line)",
                background: "#fafcf9",
                fontSize: "0.86rem",
                color: "var(--green-950)"
              }}
            />
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
              🔍
            </span>
          </div>

        </div>

        <div className="library-result-summary" aria-live="polite" aria-atomic="true">
          <strong>{filtered.length}</strong> {filtered.length === 1 ? "recurso encontrado" : "recursos encontrados"}
          {search.trim() ? ` para “${search.trim()}”` : ""}
        </div>

        {/* 3-Column Bento Grid of Documents (1440px Wide) */}
        {filtered.length > 0 ? (
          <div id="library-results" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(20px, 2.5vw, 32px)", marginBottom: "64px" }}>
            {filtered.map((doc) => (
            <article
              key={doc.id}
              style={{
                background: "#ffffff",
                border: "1.5px solid var(--line)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "var(--transition-smooth)"
              }}
            >
              <div>
                {/* Document Cover Thumbnail */}
                <div style={{ position: "relative", width: "100%", height: "200px", background: "#07261d", overflow: "hidden" }}>
                  <Image
                    src={doc.coverImage}
                    alt={doc.title}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(7, 38, 29, 0.85)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--lime-400)", fontWeight: 800 }}>
                      {doc.badge}
                    </span>
                  </div>
                  <div style={{ position: "absolute", bottom: "10px", left: "14px", background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(6px)", padding: "2px 8px", borderRadius: "6px" }}>
                    <span style={{ fontSize: "0.74rem", color: "#ffffff", fontWeight: 700 }}>
                      {doc.pages} · {doc.format}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "24px" }}>
                  <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--green-700)", fontWeight: 800, display: "block", marginBottom: "6px" }}>
                    {doc.categoryLabel}
                  </span>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--green-950)", margin: "0 0 10px", lineHeight: 1.28 }}>
                    {doc.title}
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
                    {doc.desc}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ padding: "0 24px 24px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "8px" }}>
                {doc.downloadUrl ? (
                  <a
                    href={doc.downloadUrl}
                    download
                    className="button button--primary"
                    style={{ padding: "10px 14px", fontSize: "0.84rem", textAlign: "center" }}
                  >
                    Descargar PDF ↓
                  </a>
                ) : (
                  <Link
                    href={doc.referenceHref || "/biblioteca/"}
                    className="button button--primary"
                    style={{ padding: "10px 14px", fontSize: "0.84rem", textAlign: "center" }}
                  >
                    {doc.referenceLabel || "Abrir referencia"} →
                  </Link>
                )}
                <div style={{ display: "grid", gap: "8px" }}>
                  <Link href={`/contacto/?interes=biblioteca&perfil=agro&diagnostico=${encodeURIComponent(`Consulta sobre ${doc.title}`)}`} className="button button--ghost" style={{ padding: "10px 8px", fontSize: "0.8rem", textAlign: "center" }}>
                    Llevar a Contacto
                  </Link>
                  <a href={`https://wa.me/573003078822?text=Hola%20Greenatics%2C%20tengo%20una%20consulta%20t%C3%A9cnica%20sobre%20el%20documento%3A%20${encodeURIComponent(doc.title)}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--green-800)", fontSize: "0.76rem", textAlign: "center" }}>
                    WhatsApp directo
                  </a>
                </div>
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className="library-empty-state" role="status">
            <span className="eyebrow">Sin coincidencias</span>
            <h2>No encontramos un recurso con esos criterios.</h2>
            <p>Prueba con el nombre de un cultivo, una familia Wondergreen o una palabra como “suelo”, “operación” o “huerta”.</p>
            <button type="button" className="button button--ghost" onClick={() => { setSearch(""); setFilter("todos"); }}>Limpiar búsqueda</button>
          </div>
        )}

        {/* Custom Technical Dossier Request Banner */}
        <div style={{ background: "linear-gradient(145deg, #07261d 0%, #03150f 100%)", color: "#ffffff", padding: "40px 44px", borderRadius: "28px", border: "1.5px solid rgba(255, 255, 255, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div style={{ maxWidth: "680px" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--lime-400)", fontWeight: 800 }}>
              Ingeniería Editorial a Medida
            </span>
            <h3 style={{ fontSize: "1.6rem", color: "#ffffff", margin: "6px 0 10px" }}>
              ¿Requieres un estudio técnico o plan nutricional específico?
            </h3>
            <p style={{ margin: 0, fontSize: "0.92rem", color: "#cbdcd3" }}>
              Nuestros ingenieros químicos y agrónomos elaboran diagnósticos de suelos, balances de masa de bioprocesos y estudios de viabilidad PGIRS personalizados.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/contacto/" className="button button--primary" style={{ padding: "14px 28px", fontSize: "0.98rem" }}>
              Solicitar Dossier Especializado →
            </Link>
            <a
              href="https://wa.me/573003078822?text=Hola%20Greenatics%2C%20quiero%20solicitar%20un%20dossier%20t%C3%A9cnico%20personalizado"
              target="_blank"
              rel="noopener noreferrer"
              className="button button--neon"
              style={{ padding: "14px 24px", fontSize: "0.98rem" }}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
