"use client";

import { useState } from "react";
import Link from "next/link";
import { WondergreenToolTrail } from "@/components/wondergreen-tool-trail";
import { buildToolContactHref, storeToolContactDraft } from "@/data/tool-contact-handoff";
import "./mixture-review.css";

const families = [
  "Fertilizantes sólidos Wondergreen",
  "Fertilizantes líquidos y Biol",
  "Bioinsumos",
  "Otros productos",
];
const documents = [
  "Etiquetas vigentes de los productos",
  "Informe de calidad del agua",
  "Recomendación técnica para esta aplicación",
];

export default function CompatibilidadPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<string[]>([]);
  const [products, setProducts] = useState("");
  const [application, setApplication] = useState("");
  const [context, setContext] = useState("");
  const assessmentDetails = [
    `Productos seleccionados para revisar: ${products.trim() || "Nombres y formulaciones pendientes"}`,
    `Familias consultadas: ${selected.join(" · ") || "Pendientes"}`,
    `Vía de aplicación: ${application || "Por definir"}`,
    `Cultivo y condiciones: ${context.trim() || "Pendientes"}`,
    `Soportes disponibles según el usuario: ${availableDocuments.join(" · ") || "Por reunir"}`,
    "Estado: solicitud de revisión; compatibilidad no evaluada.",
    "Confirmar etiqueta, formulación, vía autorizada, concentraciones y condiciones específicas antes de preparar una mezcla.",
  ].join("\n");
  const contactHref = buildToolContactHref("wondergreen", "agro", "Compatibilidad de mezcla en tanque");
  function toggle(value: string, current: string[], set: (values: string[]) => void) {
    set(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  return (
    <div className="wg-mixture">
      <WondergreenToolTrail name="Compatibilidad de mezclas" path="/wondergreen/compatibilidad/" />
      <div className="container">
        <header className="wg-mixture__intro">
          <span className="eyebrow">Wondergreen · revisión de mezclas</span>
          <h1>Antes de mezclar, revisemos los productos y su aplicación.</h1>
          <p>Reúne las referencias que quieres usar y el contexto del cultivo. Con esa información, Greenatics puede preparar una revisión técnica, sin tratar una familia de productos como si todas sus formulaciones fueran iguales.</p>
        </header>
        <div className="wg-mixture__layout">
          <section className="wg-mixture__report" aria-labelledby="mixture-report-title">
            <h2 id="mixture-report-title">¿Qué quieres revisar?</h2>
            <fieldset className="wg-mixture__families">
              <legend>Familias de tu consulta</legend>
              {families.map((family) => <label key={family}>
                <input type="checkbox" checked={selected.includes(family)} onChange={() => toggle(family, selected, setSelected)} />
                <span>{family}</span>
              </label>)}
            </fieldset>
            <label className="wg-mixture__field" htmlFor="mixture-products">
              <span>Nombres comerciales y formulaciones</span>
              <textarea id="mixture-products" rows={3} maxLength={2000} value={products} onChange={(event) => setProducts(event.target.value)} aria-describedby="mixture-products-help" />
            </label>
            <p className="wg-mixture__help" id="mixture-products-help">Copia la referencia exacta de cada etiqueta. Si no la tienes, deja el campo pendiente para consultarla con nuestro equipo.</p>
            <label className="wg-mixture__field" htmlFor="mixture-application">
              <span>Vía de aplicación que quieres consultar</span>
              <select id="mixture-application" value={application} onChange={(event) => setApplication(event.target.value)}>
                <option value="">Por definir</option>
                <option>Aplicación al suelo</option>
                <option>Fertirriego</option>
                <option>Aplicación foliar</option>
                <option>Otra vía por revisar</option>
              </select>
            </label>
            <label className="wg-mixture__field" htmlFor="mixture-context">
              <span>Cultivo y condiciones de la consulta</span>
              <textarea id="mixture-context" rows={3} maxLength={2000} value={context} onChange={(event) => setContext(event.target.value)} aria-describedby="mixture-context-help" />
            </label>
            <p className="wg-mixture__help" id="mixture-context-help">Describe cultivo, etapa, equipo y concentraciones propuestas si ya están definidas. Indicar una vía aquí no confirma que cada producto esté autorizado para ella.</p>
          </section>
          <aside className="wg-mixture__review" aria-labelledby="mixture-review-title">
            <h2 id="mixture-review-title">Una consulta concreta, no un permiso para mezclar</h2>
            <p>La selección no confirma compatibilidad física, biológica ni uso autorizado. Esa decisión requiere las etiquetas y condiciones específicas de los productos; no se asigna un pH, una secuencia o un intervalo de aplicación por defecto.</p>
            <fieldset className="wg-mixture__documents">
              <legend>¿Qué soportes tienes para la revisión?</legend>
              {documents.map((document) => <label key={document}>
                <input type="checkbox" checked={availableDocuments.includes(document)} onChange={() => toggle(document, availableDocuments, setAvailableDocuments)} />
                <span>{document}</span>
              </label>)}
            </fieldset>
            <p className="wg-mixture__status" role="status">{selected.length === 1 ? "1 familia incluida en la consulta. Compatibilidad no evaluada." : selected.length > 1 ? `${selected.length} familias incluidas en la consulta. Compatibilidad no evaluada.` : "Selecciona una familia o describe los productos para preparar tu consulta."}</p>
            <p>Si se solicita una prueba de jarra, su resultado no sustituye la revisión de uso autorizado, respuesta del cultivo o viabilidad de microorganismos. Nuestro equipo te ayudará a definir qué comprobar en tu caso.</p>
            <a className="wg-mixture__support" href="https://ask.ifas.ufl.edu/publication/PI301" target="_blank" rel="noopener noreferrer">Conocer los límites de la prueba de jarra<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
            <Link className="button button--light" href={contactHref} onClick={() => storeToolContactDraft(assessmentDetails)}>Preparar consulta con Greenatics</Link>
            <Link className="wg-mixture__support" href="/wondergreen/analisis-agua/">Organizar el informe de agua</Link>
            <Link className="wg-mixture__support" href="/biblioteca/catalogo-wondergreen/">Consultar las referencias Wondergreen</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
