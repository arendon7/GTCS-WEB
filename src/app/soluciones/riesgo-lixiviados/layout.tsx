import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prevención y manejo de lixiviados",
  description: "Identifica fuentes, caudales, cargas y rutas hidráulicas para reducir riesgos de lixiviados con prevención, control y monitoreo.",
  alternates: { canonical: "/soluciones/riesgo-lixiviados/" },
};

export default function RiesgoLixiviadosLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
