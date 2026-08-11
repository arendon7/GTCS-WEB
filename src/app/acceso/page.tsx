import type { Metadata } from "next";

export const metadata: Metadata = { title: "Acceso Greenatics" };

export default function AccessPage() {
  return (
    <section className="access-page"><div className="container access-card"><span className="eyebrow">GREENATICS OPS</span><h1>La operación interna vive aquí.</h1><p>Este acceso conectará la web pública con la aplicación autenticada para planificación, actividades, recepciones, compostaje, mantenimiento, alertas e indicadores.</p><div className="status-chip">Integración en desarrollo</div></div></section>
  );
}
