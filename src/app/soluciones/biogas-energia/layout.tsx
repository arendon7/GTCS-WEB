import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biogás y bioenergía",
  description: "Evalúa sustrato, carga orgánica, captura, calidad del biogás y demanda energética para diseñar una ruta de digestión anaerobia operable.",
  alternates: { canonical: "/soluciones/biogas-energia/" },
};

export default function BiogasEnergiaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
