import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactPage() {
  return (
    <section className="contact-page"><div className="container contact-grid"><div><span className="eyebrow">Contacto Greenatics</span><h1>Cuéntanos qué quieres transformar.</h1><p className="lead">Podemos hablar de Wondergreen, gestión de residuos, proyectos municipales, plantas o soluciones empresariales.</p></div><div className="contact-panel"><span>Reunión técnica</span><h2>Agenda directamente con el equipo.</h2><p>Selecciona un espacio disponible y lleva a la reunión la información básica del cultivo, residuo o proyecto.</p><a className="button button--primary" href={site.bookingUrl} target="_blank" rel="noreferrer">Agendar reunión</a></div></div></section>
  );
}
