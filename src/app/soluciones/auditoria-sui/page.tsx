"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { buildToolContactHref, storeToolContactDraft } from "@/data/tool-contact-handoff";

interface CheckItem {
  id: string;
  title: string;
  support: string;
  desc: string;
}

const checkItems: CheckItem[] = [
  { id: "c1", title: "Pesajes por viaje", support: "Equipo y soportes metrológicos", desc: "Pesos bruto, tara y neto, con identificación del equipo y constancias disponibles de verificación o calibración." },
  { id: "c2", title: "Seguimiento del proceso", support: "Registros de tiempo y temperatura", desc: "Bitácoras que ayuden a revisar la operación y el control de calidad según el proceso aplicado." },
  { id: "c3", title: "Balance de materiales", support: "Entradas, salidas y periodo", desc: "Conciliación de entradas, inventarios, rechazos, pérdidas de proceso y productos obtenidos." },
  { id: "c4", title: "Aguas y lixiviados", support: "Infraestructura y operación", desc: "Diseño, manejo, contingencias y registros contrastados con las condiciones reales de la planta." },
  { id: "c5", title: "Muestreo y caracterización", support: "Parámetros y destino previsto", desc: "Plan, frecuencia, laboratorio y criterios definidos de acuerdo con el material y su uso previsto." },
  { id: "c6", title: "Información para el reporte", support: "Fuentes, responsables y soportes", desc: "Cortes, responsables, trazabilidad y controles de calidad antes de cualquier presentación oficial." },
];

export default function AuditoriaSuiPage() {
  const router = useRouter();
  const [checked, setChecked] = useState<string[]>(["c1", "c2"]);

  const toggleCheck = (id: string) => {
    if (checked.includes(id)) {
      setChecked(checked.filter(i => i !== id));
    } else {
      setChecked([...checked, id]);
    }
  };

  const waAuditMsg = encodeURIComponent(
    `Hola Greenatics. Estoy organizando los soportes para revisar información reportable de un prestador. He marcado ${checked.length} de ${checkItems.length} elementos como disponibles y quiero validar el alcance, el periodo y los criterios que aplican a mi caso.`
  );
  const selectedCapabilities = checkItems
    .filter((item) => checked.includes(item.id))
    .map((item) => item.title)
    .join(" · ");
  const assessmentDetails = `Elementos que indicaste como disponibles: ${checked.length} de ${checkItems.length}\nSelección: ${selectedCapabilities || "Ninguno"}\nEsta lista organiza una conversación inicial; no mide preparación, no equivale a auditoría ni valida un reporte. La presentación oficial corresponde al prestador y a su responsable designado.`;
  const contactHref = buildToolContactHref("preparacion-sui", "esp", "Auditoría SUI y preparación de soportes");

  const continueToContact = () => {
    storeToolContactDraft(assessmentDetails);
    router.push(contactHref);
  };

  return (
    <section className="sui-checkup">
      <div className="container sui-checkup__shell">
        <header className="sui-checkup__intro">
          <div>
            <h1>Ordena los soportes antes de preparar el reporte SUI</h1>
            <p>
              Reúne fuentes, responsables y registros que pueden ayudar a revisar la información del prestador. Esta guía organiza una conversación inicial; no es una auditoría ni valida cumplimiento o reportes.
            </p>
          </div>
          <aside className="sui-checkup__boundary" aria-label="Alcance de esta guía">
            <strong>La presentación oficial sigue a cargo del prestador.</strong>
            <span>Los soportes y criterios aplicables se confirman según servicio, actividad, periodo y caso.</span>
          </aside>
        </header>

        <div className="sui-checkup__workspace">
          <fieldset className="sui-checkup__list">
            <legend>¿Qué soportes tienes disponibles?</legend>
            <p className="sui-checkup__hint">Marca solo los elementos que puedes consultar hoy. Puedes dejar otros sin marcar.</p>
            <div className="sui-checkup__items">
              {checkItems.map((item) => {
                const isDone = checked.includes(item.id);
                return (
                  <label className={`sui-checkup__item${isDone ? " is-selected" : ""}`} key={item.id}>
                    <input
                      type="checkbox"
                      name="sui-supports"
                      value={item.id}
                      checked={isDone}
                      onChange={() => toggleCheck(item.id)}
                      aria-describedby={`${item.id}-description`}
                    />
                    <span className="sui-checkup__item-copy">
                      <strong>{item.title}</strong>
                      <span className="sui-checkup__support">{item.support}</span>
                      <span id={`${item.id}-description`} className="sui-checkup__description">{item.desc}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <aside className="sui-checkup__next">
            <p className="sui-checkup__next-label">Tu punto de partida</p>
            <p className="sui-checkup__selection" role="status" aria-live="polite" aria-atomic="true">
              <strong>{checked.length} de {checkItems.length}</strong>
              <span>{checked.length === 1 ? "elemento marcado" : "elementos marcados"}</span>
            </p>
            <p className="sui-checkup__next-copy">
              Esta selección no es un puntaje de preparación. En una revisión profesional se contrastan los soportes, la calidad del dato y los criterios aplicables al prestador.
            </p>
            <div className="sui-checkup__ops-note">
              <strong>Información operativa mejor organizada</strong>
              <p>GREENATICS OPS puede apoyar la captura y trazabilidad de datos por lote para su revisión antes de preparar información reportable.</p>
            </div>
            <button
              type="button"
              className="sui-checkup__contact"
              onClick={continueToContact}
            >
              Conversar sobre estos soportes <span aria-hidden="true">→</span>
            </button>
            <a
              className="sui-checkup__whatsapp"
              href={`https://wa.me/573003078822?text=${waAuditMsg}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar por WhatsApp <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
